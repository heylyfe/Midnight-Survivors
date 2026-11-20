'use strict';
// ===== gfx.js : detailed vector characters, enemies, bosses =====
// All drawn procedurally with canvas paths; scale ~1px units, player ~64px tall.

const GFX = {};
GFX._oc1 = null;
GFX._oc2 = null;
// Motion sheets share a 96×80 cell and a fixed foot anchor at (48, 74).
// These dimensions and the stride lengths are in world pixels.
const CHAR_CELL_W = 96, CHAR_CELL_H = 80;
const CHAR_FOOT_X = 48, CHAR_FOOT_Y = 74;
GFX.CHARSPR = {
  ichigo:        { stride: 45, grip: [3, -24] },
  ichigo_hollow: { stride: 47, grip: [7, -29] },
  rukia:         { stride: 44, grip: [11, -25] },
  rukia_bankai:  { stride: 48, grip: [9, -30] },
  gojo:          { stride: 49, grip: [4, -14] },
  frieren:       { stride: 57, grip: [9, -20] },
  kaido:         { stride: 51, grip: [13, -20] },
};
GFX.ENSPR = {
  wisp:     { baseR: 12, h: 30, anchor: 'center', fps: 5 },
  husk:     { baseR: 14, h: 36, anchor: 'feet',   fps: 5 },
  hound:    { baseR: 13, h: 30, anchor: 'feet',   fps: 9 },
  charger:  { baseR: 16, h: 40, anchor: 'feet',   fps: 6, facing: 1 },
  spitter:  { baseR: 15, h: 40, anchor: 'feet',   fps: 4 },
  bomber:   { baseR: 15, h: 34, anchor: 'feet',   fps: 7 },
  splitter: { baseR: 20, h: 46, anchor: 'feet',   fps: 5 },
  shard:    { baseR: 9,  h: 26, anchor: 'center', fps: 7 },
  tank:     { baseR: 24, h: 56, anchor: 'feet',   fps: 4 },
  matron:   { baseR: 22, h: 48, anchor: 'feet',   fps: 4 },
};
GFX.charspr = {};
GFX.enspr = {};
GFX.loadSprites = function () {
  if (typeof Image === 'undefined' || !Image) return;
  const grab = (src, onload) => {
    const im = new Image();
    if (onload) im.onload = onload;
    im.src = src;
    return im;
  };
  for (const key in GFX.CHARSPR) {
    GFX.charspr[key] = grab(`assets/sprites/chars/${key}_motion.png`, () => GFX.onPortraitLoad?.());
  }
  for (const key in GFX.ENSPR) {
    const arr = [];
    for (let f = 0; f < 4; f++) arr.push(grab('assets/sprites/enemies/en_' + key + '_f' + f + '.png'));
    GFX.enspr[key] = arr;
  }
};
GFX.sprReady = function (a) {
  if (!a || !a[0]) return false;
  for (let i = 0; i < a.length; i++) {
    const im = a[i];
    if (!im || !im.complete || !im.naturalWidth) return false;
  }
  return true;
};
function charSpriteKey(ch, form) {
  if (ch === 'ichigo' && form === 'ichigo') return 'ichigo_hollow';
  if (ch === 'rukia' && form === 'rukia') return 'rukia_bankai';
  return ch;
}
const CHAR_GRIP_OFFSETS = [
  [[0, 0], [0, -1], [0, -1], [0, 0], [-4, 3], [4, 4]],
  [[0, 0], [-2, -2], [0, -1], [2, 0], [4, -2], [2, -1]],
  [[-11, -6], [12, -6], [8, 4], [-5, -7], [12, -4], [5, 1]],
];

function selectCharacterFrame(def, o) {
  if (o.purpleCastTime != null) {
    if (o.purpleCastTime < 0) return [3, 2];
    if (o.purpleCastTime < 0.12) return [4, 2];
    if (o.purpleCastTime < 0.35) return [5, 2];
  }
  if (o.dashPose) return [5, 0];
  if (o.dashWindup) return [0, 2];
  if (o.hurt > 0.4) return [4, 0];
  if (o.attack && o.attackAge >= 0 && o.attackAge < o.attackDuration) {
    // Hits and projectile releases are immediate. The pose follows the impact into recovery.
    const phase = o.attackAge < 0.09 ? 1 : 2;
    return [(o.attack === 'blade' ? 0 : 3) + phase, 2];
  }
  if (o.moveBlend > 0.19) {
    return [Math.floor(o.strideDistance / def.stride * 6) % 6, 1];
  }
  return [Math.floor((o.animT || 0) * 4) % 4, 0];
}

GFX.drawSpriteChar = function (key, c, o) {
  const def = GFX.CHARSPR[key];
  const [column, row] = selectCharacterFrame(def, o);
  const face = o.face || 1;
  const x = o.x || 0, y = (o.y || 0) + 56;
  c.save();
  c.imageSmoothingEnabled = false;
  c.translate(x, y);
  c.scale(face, 1);
  c.drawImage(GFX.charspr[key], column * CHAR_CELL_W, row * CHAR_CELL_H,
    CHAR_CELL_W, CHAR_CELL_H, -CHAR_FOOT_X, -CHAR_FOOT_Y, CHAR_CELL_W, CHAR_CELL_H);
  c.restore();

  if (!o.ghost && o.purpleCastTime == null && typeof drawSignatureWeapon === 'function') {
    const [gripX, gripY] = CHAR_GRIP_OFFSETS[row][column];
    const handX = def.grip[0] + (key === 'gojo' ? Math.round(gripX * 0.65) : gripX);
    const handY = def.grip[1] + gripY;
    drawSignatureWeapon(c, key.replace(/_(hollow|bankai)$/, ''), {
      x, y, face, handX, handY, time: o.animT || 0, aim: o.aim, form: o.form,
      attack: row === 2 && !o.dashWindup ? o.attack : null,
      attackAge: o.attackAge, moving: row === 1, dash: !!o.dashPose, dashWindup: o.dashWindup,
    });
  }
};
GFX.char = function (ch, ctx, o) {
  o = o || {};
  const skey = charSpriteKey(ch, o.form);
  const sheet = GFX.charspr[skey];
  if (sheet && sheet.complete && sheet.naturalWidth) {
    GFX.drawSpriteChar(skey, ctx, o);
    return;
  }
  const t = o.walkPh || 0;
  const pose = o.atkPose || 0;
  const bob = Math.sin(t * 2) * 2;
  // try the outlined composited path when we have a real canvas backing
  const oc = ocReady(ctx);
  if (oc) {
    try {
      compositeChar(ch, ctx, o, oc, bob, pose);
      return;
    } catch (e) { /* fall through to direct drawing */ }
  }
  ctx.save();
  ctx.translate(o.x || 0, o.y || 0);
  ctx.scale(o.face || 1, 1);
  drawCharPart(ch, ctx, o, bob, pose);
  ctx.restore();
};

function ocReady(c) {
  if (QUAL.decor === false) return null;
  try {
    if (typeof document === 'undefined' || !document.createElement || !c.canvas) return null;
    const oc = GFX._oc1 || (GFX._oc1 = document.createElement('canvas'));
    if (oc.getContext) {
      const c1 = oc.getContext('2d');
      if (!c1 || typeof c1.clearRect !== 'function') return null;
    }
    if (oc.width < 176) { oc.width = 176; oc.height = 176; }
    return oc;
  } catch (e) { return null; }
}

function compositeChar(ch, ctx, o, oc, bob, pose) {
  const f = o.face || 1;
  oc.setTransform(1, 0, 0, 1, 0, 0);
  oc.clearRect(0, 0, 176, 176);
  oc.save();
  oc.translate(88, 88);
  oc.scale(f, 1);
  drawCharPart(ch, oc, o, bob, pose);
  oc.restore();
  let oc2c = GFX._oc2;
  if (!oc2c) {
    oc2c = GFX._oc2 = document.createElement('canvas');
    oc2c.width = 176; oc2c.height = 176;
  }
  const oc2 = oc2c.getContext('2d');
  if (!oc2 || typeof oc2.clearRect !== 'function') throw new Error('no sil ctx');
  oc2.setTransform(1, 0, 0, 1, 0, 0);
  oc2.clearRect(0, 0, 176, 176);
  // pale back-glow: lifts the sprite off dark backgrounds
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * TAU;
    oc2.drawImage(oc.canvas, Math.cos(a) * 5, Math.sin(a) * 5);
  }
  oc2.globalCompositeOperation = 'source-in';
  oc2.fillStyle = 'rgba(215,225,255,0.22)';
  oc2.fillRect(0, 0, 176, 176);
  oc2.globalCompositeOperation = 'source-over';
  ctx.save();
  ctx.translate(o.x || 0, o.y || 0);
  ctx.drawImage(oc2c, -88, -88);
  ctx.restore();
  oc2.clearRect(0, 0, 176, 176);
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * TAU;
    oc2.drawImage(oc.canvas, Math.cos(a) * 2.2, Math.sin(a) * 2.2);
  }
  oc2.globalCompositeOperation = 'source-in';
  oc2.fillStyle = 'rgba(8,8,16,0.92)';
  oc2.fillRect(0, 0, 176, 176);
  oc2.globalCompositeOperation = 'source-over';
  ctx.save();
  ctx.translate(o.x || 0, o.y || 0);
  ctx.drawImage(oc2c, -88, -88);
  ctx.drawImage(oc.canvas, -88, -88);
  ctx.restore();
}

function drawCharPart(ch, c, o, bob, pose) {
  switch (ch) {
    case 'ichigo': GFX.drawIchigo(c, o, bob, pose); break;
    case 'rukia': GFX.drawRukia(c, o, bob, pose); break;
    case 'frieren': GFX.drawFrieren(c, o, bob, pose); break;
    case 'kaido': GFX.drawKaido(c, o, bob, pose); break;
    case 'gojo': GFX.drawGojo(c, o, bob, pose); break;
  }
}

// ---------- shared drawing helpers ----------
function lg2(c, x0, y0, x1, y1, stops) {
  const g = c.createLinearGradient(x0, y0, x1, y1);
  for (const s of stops) g.addColorStop(s[0], s[1]);
  return g;
}
function rg2(c, x0, y0, r0, x1, y1, r1, stops) {
  const g = c.createRadialGradient(x0, y0, r0, x1, y1, r1);
  for (const s of stops) g.addColorStop(s[0], s[1]);
  return g;
}
// filled smooth polyline
function fillCurve(c, pts, col) {
  c.fillStyle = col;
  c.beginPath();
  c.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length - 1; i++) {
    const mx = (pts[i][0] + pts[i + 1][0]) / 2, my = (pts[i][1] + pts[i + 1][1]) / 2;
    c.quadraticCurveTo(pts[i][0], pts[i][1], mx, my);
  }
  const L = pts[pts.length - 1];
  c.lineTo(L[0], L[1]);
  c.closePath();
  c.fill();
}
// stroked smooth polyline (ribbons, folds)
function strokeCurve(c, pts, col, lw, alpha) {
  c.strokeStyle = col;
  c.lineWidth = lw;
  c.lineCap = 'round';
  c.globalAlpha = alpha === undefined ? 1 : alpha;
  c.beginPath();
  c.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length - 1; i++) {
    const mx = (pts[i][0] + pts[i + 1][0]) / 2, my = (pts[i][1] + pts[i + 1][1]) / 2;
    c.quadraticCurveTo(pts[i][0], pts[i][1], mx, my);
  }
  const L = pts[pts.length - 1];
  c.lineTo(L[0], L[1]);
  c.stroke();
  c.globalAlpha = 1;
}
// anime eye: iris + glint + upper lash + optional brow
function eyeA(c, x, y, s, iris, opts) {
  opts = opts || {};
  const s2 = opts.hMul || 1;
  c.fillStyle = opts.sclera || '#f5f7ff';
  c.beginPath(); c.ellipse(x, y, s * 1.05, s * 1.25 * s2, 0, 0, TAU); c.fill();
  c.fillStyle = iris;
  c.beginPath(); c.ellipse(x, y + s * 0.1, s * 0.78, s * 1.05 * s2, 0, 0, TAU); c.fill();
  // pupil
  c.fillStyle = opts.pupil || '#101018';
  c.beginPath(); c.ellipse(x, y + s * 0.15, s * 0.36, s * 0.62 * s2, 0, 0, TAU); c.fill();
  // glints
  c.fillStyle = '#fff';
  c.beginPath(); c.ellipse(x - s * 0.3, y - s * 0.4, s * 0.26, s * 0.2, 0.4, 0, TAU); c.fill();
  c.beginPath(); c.arc(x + s * 0.25, y + s * 0.45, s * 0.13, 0, TAU); c.fill();
  // upper lash
  c.strokeStyle = opts.lash || '#14141c';
  c.lineWidth = s * 0.42; c.lineCap = 'round';
  c.beginPath();
  c.moveTo(x - s * 1.1, y - s * 0.95);
  c.quadraticCurveTo(x, y - s * (1.55 * s2), x + s * 1.05, y - s * 0.8);
  c.stroke();
  // brow
  if (opts.brow !== false) {
    c.strokeStyle = opts.browCol || '#14141c';
    c.lineWidth = s * 0.34;
    c.beginPath();
    c.moveTo(x - s * 1.15, y - s * (1.9 - (opts.browTilt || 0) * 0.5));
    c.quadraticCurveTo(x, y - s * (2.35 - (opts.browTilt || 0) * 1.4), x + s * 1.15, y - s * (1.75 - (opts.browTilt || 0) * 1.2));
    c.stroke();
  }
}
// cloth fold: few short strokes
function folds(c, x, y, len, n, col, alpha) {
  for (let i = 0; i < n; i++) {
    const fx = x + i * 4.2;
    strokeCurve(c, [[fx, y], [fx + 1.1, y + len * 0.55], [fx - 0.4, y + len]], col, 1, alpha === undefined ? 0.35 : alpha);
  }
}
// ground contact shadow piece (local, drawn under char)
function feetShadow(c, w) {
  c.fillStyle = 'rgba(0,0,0,0.28)';
  c.beginPath(); c.ellipse(0, 56.5, w || 15, 4, 0, 0, TAU); c.fill();
}
// ---------- shared character art kit ----------
function star4(c, x, y, r, a) {
  c.save();
  c.globalAlpha = a === undefined ? 1 : a;
  c.fillStyle = '#ffffff';
  c.beginPath();
  c.moveTo(x, y - r);
  c.quadraticCurveTo(x, y, x + r, y);
  c.quadraticCurveTo(x, y, x, y + r);
  c.quadraticCurveTo(x, y, x - r, y);
  c.quadraticCurveTo(x, y, x, y - r);
  c.closePath(); c.fill();
  c.restore();
}
// soft shading under the jaw
function chinShade(c, hy, col) {
  fillCurve(c, [[-7, hy + 7.6], [0.6, hy + 9.6], [8, hy + 7.2], [3.4, hy + 11.8], [0.5, hy + 12.2], [-2.8, hy + 11.6]], col);
}
// tiny nose (a short angled stroke)
function noseSm(c, x, y, col) {
  c.strokeStyle = col; c.lineWidth = 0.8; c.lineCap = 'round';
  c.beginPath(); c.moveTo(x + 0.7, y - 0.9); c.lineTo(x, y + 0.55); c.stroke();
}
// hair / fur shards: n tapered spikes along an arc (deterministic, no flicker)
function shards(c, cx, cy, r0, r1, n, a0, a1, col, contrast) {
  c.fillStyle = col;
  const ct = contrast === undefined ? 1 : contrast;
  for (let i = 0; i < n; i++) {
    const t = (i + 0.5) / n;
    const a = a0 + (a1 - a0) * t;
    const w = ((a1 - a0) / n) * 0.62;
    const rr = r1 * (0.78 + 0.44 * (((i * 71) % 13) / 13)) * ct;
    const x0 = cx + Math.cos(a - w) * r0, y0 = cy + Math.sin(a - w) * r0;
    const x1 = cx + Math.cos(a + w) * r0, y1 = cy + Math.sin(a + w) * r0;
    const xt = cx + Math.cos(a) * rr, yt = cy + Math.sin(a) * rr;
    c.beginPath();
    c.moveTo(x0, y0);
    c.quadraticCurveTo(cx + Math.cos(a - w * 0.35) * (r0 + (rr - r0) * 0.45), cy + Math.sin(a - w * 0.35) * (r0 + (rr - r0) * 0.45), xt, yt);
    c.quadraticCurveTo(cx + Math.cos(a + w * 0.35) * (r0 + (rr - r0) * 0.45), cy + Math.sin(a + w * 0.35) * (r0 + (rr - r0) * 0.45), x1, y1);
    c.closePath(); c.fill();
  }
}
// full anime face plate: skull, jaw, ears, blush. Features drawn after by eyeB/mouthSm.
function faceBase(c, hy, o) {
  o = o || {};
  const rx = o.rx || 9.2, ry = o.ry || 10;
  const cx = 0.6;
  const skin = o.skin || ['#f6d9b6', '#e0b184'];
  const earY = hy + 2.2;
  // ears first (skull overlaps their base)
  if (o.point) {
    c.fillStyle = skin[0];
    fillCurve(c, [[cx - rx + 1.4, earY - 2.6], [cx - rx - 7, earY - 3.6 + (o.earSway || 0)], [cx - rx + 1.4, earY + 3]], skin[0]);
    fillCurve(c, [[cx - rx + 1.2, earY - 1], [cx - rx - 4.8, earY - 1.9], [cx - rx + 1.2, earY + 1.8]], skin[1]);
    c.fillStyle = skin[0];
    c.beginPath(); c.ellipse(cx + rx - 0.6, earY, 1.9, 2.9, -0.1, 0, TAU); c.fill();
  } else {
    c.fillStyle = skin[0];
    c.beginPath(); c.ellipse(cx - rx + 0.7, earY, 2.1, 3.2, 0.12, 0, TAU); c.fill();
    c.beginPath(); c.ellipse(cx + rx - 0.3, earY, 1.9, 3, -0.1, 0, TAU); c.fill();
    c.fillStyle = skin[1];
    c.beginPath(); c.ellipse(cx - rx + 1, earY + 0.2, 1.05, 1.85, 0.12, 0, TAU); c.fill();
    c.beginPath(); c.ellipse(cx + rx - 0.5, earY + 0.2, 0.95, 1.7, -0.1, 0, TAU); c.fill();
  }
  // skull + face
  c.fillStyle = lg2(c, -rx * 0.8, hy - ry, cx + 2, hy + ry, [[0, skin[0]], [0.72, skin[0]], [1, skin[1]]]);
  c.beginPath();
  c.moveTo(cx - rx, hy + 3.8);
  c.quadraticCurveTo(cx - rx - 0.6, hy - ry * 0.55, cx - rx * 0.55, hy - ry * 0.92);
  c.quadraticCurveTo(cx, hy - ry * 1.12, cx + rx * 0.64, hy - ry * 0.88);
  c.quadraticCurveTo(cx + rx * 1.02, hy - ry * 0.38, cx + rx * 0.97, hy + 2.2);
  if (o.jaw === 'strong') {
    c.quadraticCurveTo(cx + rx * 0.98, hy + 8.6, cx + rx * 0.5, hy + 11.8);
    c.quadraticCurveTo(cx, hy + 13.8, cx - rx * 0.52, hy + 12);
    c.quadraticCurveTo(cx - rx * 1, hy + 8.6, cx - rx, hy + 3.8);
  } else {
    c.quadraticCurveTo(cx + rx * 0.98, hy + 9.4, cx + rx * 0.52, hy + 11);
    c.quadraticCurveTo(cx, hy + 12.6, cx - rx * 0.58, hy + 10.8);
    c.quadraticCurveTo(cx - rx * 0.98, hy + 8, cx - rx, hy + 3.8);
  }
  c.closePath(); c.fill();
  if (o.blush) {
    c.fillStyle = 'rgba(240,140,140,0.28)';
    c.beginPath(); c.ellipse(1.6, hy + 5.4, 2.1, 1.05, -0.06, 0, TAU); c.fill();
    c.beginPath(); c.ellipse(7.8, hy + 4.9, 1.9, 1, -0.06, 0, TAU); c.fill();
  }
}
// one anime eye: sclera, gradient iris, pupil, glints, lash lid, lower line, brow
function eyeB(c, x, y, s, o) {
  o = o || {};
  const far = o.far === true;
  const k = far ? 0.9 : 1.02;
  const rx = s * k, ry = s * 1.24 * (far ? 0.94 : 1);
  const scl = o.scl || '#f8f9ff';
  const iris = o.iris || '#4a7a5a';
  const irisD = o.irisD || '#223a2a';
  // sclera
  c.fillStyle = scl;
  c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, TAU); c.fill();
  // iris + detail (clipped)
  c.save();
  c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, TAU); c.clip();
  const ig = c.createLinearGradient(x, y - s * 1.2, x, y + s * 1.2);
  ig.addColorStop(0, irisD); ig.addColorStop(0.52, iris); ig.addColorStop(1, irisD);
  c.fillStyle = ig;
  c.beginPath(); c.ellipse(x, y + 0.05 * s, s * 0.8, s * 1.12, 0, 0, TAU); c.fill();
  c.fillStyle = o.pupil || '#14141c';
  c.beginPath(); c.ellipse(x, y + 0.12 * s, s * 0.34, s * 0.58, 0, 0, TAU); c.fill();
  if (o.irisL !== false) {
    c.fillStyle = o.irisL || 'rgba(255,255,255,0.42)';
    c.beginPath(); c.ellipse(x, y + 0.66 * s, s * 0.5, s * 0.3, 0, 0, TAU); c.fill();
  }
  c.fillStyle = 'rgba(80,60,110,0.25)';
  c.beginPath(); c.ellipse(x, y - s * 1.0, s * 0.95, s * 0.5, 0, 0, TAU); c.fill();
  c.fillStyle = '#ffffff';
  c.beginPath(); c.arc(x - s * 0.34, y - s * 0.38, s * 0.3, 0, TAU); c.fill();
  c.globalAlpha = 0.9;
  c.beginPath(); c.arc(x + s * 0.3, y + s * 0.42, s * 0.14, 0, TAU); c.fill();
  c.globalAlpha = 1;
  c.restore();
  // lower lid
  const lashCol = o.lash || '#181820';
  c.strokeStyle = lashCol; c.lineCap = 'round';
  c.lineWidth = s * 0.14;
  c.globalAlpha = 0.5;
  c.beginPath();
  c.moveTo(x - s * 0.5, y + s * 1.08);
  c.quadraticCurveTo(x + s * 0.25, y + s * 1.22, x + s * 0.85, y + s * 0.95);
  c.stroke();
  c.globalAlpha = 1;
  // upper lash lid with outer flick
  c.fillStyle = lashCol;
  c.beginPath();
  c.moveTo(x - s * 1.05, y - s * 0.55);
  c.quadraticCurveTo(x - s * 0.15, y - s * 1.72, x + s * 0.85, y - s * 1.3);
  c.quadraticCurveTo(x + s * 1.4, y - s * 1.05, x + s * 1.52, y - s * 0.58);
  c.quadraticCurveTo(x + s * 1.05, y - s * 0.98, x + s * 0.45, y - s * 1.0);
  c.quadraticCurveTo(x - s * 0.2, y - s * 0.88, x - s * 1.05, y - s * 0.28);
  c.closePath(); c.fill();
  // brow
  if (o.brow !== false) {
    const tilt = o.browTilt || 0;
    c.strokeStyle = o.browCol || lashCol;
    c.lineWidth = s * 0.5; c.lineCap = 'round';
    const yb = y - s * 2.1;
    c.beginPath();
    c.moveTo(x - s * 1.2, yb + tilt * s * 0.6);
    c.quadraticCurveTo(x + s * 0.15, yb - s * 0.34 + tilt * s * 0.1, x + s * 1.3, yb - s * 0.02 - tilt * s * 0.25);
    c.stroke();
  }
}
// simple expressive mouth
function mouthSm(c, x, y, o) {
  o = o || {};
  if (o.open) {
    const ow = o.ow || 1.7, oh = o.oh || 2.2;
    c.fillStyle = '#421826';
    c.beginPath(); c.ellipse(x, y, ow, oh, 0, 0, TAU); c.fill();
    c.fillStyle = '#e07871';
    c.beginPath(); c.ellipse(x, y + oh * 0.42, ow * 0.68, oh * 0.38, 0, 0, TAU); c.fill();
    return;
  }
  const w = o.w === undefined ? 2.5 : o.w;
  const curv = o.curv === undefined ? 0.55 : o.curv;
  c.strokeStyle = o.col || '#8a4441';
  c.lineWidth = o.lw || 0.9; c.lineCap = 'round';
  c.beginPath();
  c.moveTo(x - w, y - curv);
  c.quadraticCurveTo(x, y + curv, x + w, y - curv);
  c.stroke();
  if (o.fang) {
    c.fillStyle = '#ffffff';
    c.beginPath(); c.moveTo(x - w * 0.45, y - curv * 0.1); c.lineTo(x - w * 0.1, y - curv * 0.1); c.lineTo(x - w * 0.3, y + 1.7); c.closePath(); c.fill();
  }
}

// ---------- ICHIGO ----------
// lean teen, straw-orange shaggy hair, strong jaw, black shihakusho, giant cleaver
GFX.drawIchigo = function (c, o, bob, pose) {
  const wp = (o.walkPh || 0);
  const lg = Math.sin(wp * 2) * 3.4;
  const hollow = o.form === 'ichigo';
  feetShadow(c, 15);
  if (hollow) {
    c.save();
    c.translate(0, 56);
    c.scale(1.15, 1.15);
    c.translate(0, -56);
  }
  // wild back hair
  const bk = hollow ? '#8a3708' : '#a8450f';
  shards(c, 0.4, 4 + bob * 0.6 - 4.5, 8.6, 15.5, 9, Math.PI * 1.02, Math.PI * 1.98, bk, 1.15);
  if (hollow) {
    fillCurve(c, [[-10.4, 0.5], [-14.2, 10], [-15.4, 22], [-11.6, 31], [-9, 28.4], [-9.6, 12], [-7.6, 2.5]], '#7e3207');
    fillCurve(c, [[10.6, 0.5], [14.4, 9], [15.6, 20.4], [11.8, 29.4], [9.2, 26.4], [9.8, 11], [7.8, 2.2]], '#7e3207');
  }

  // legs: black hakama, white tabi, waraji straps
  for (const side of [-1, 1]) {
    const off = side === 1 ? 4 : -5;
    const sw = side === 1 ? lg * 0.35 : -lg * 0.35;
    c.fillStyle = lg2(c, off + sw - 4, 0, off + sw + 4, 56, [[0, '#22222d'], [0.55, '#15151e'], [1, '#0c0c12']]);
    c.beginPath();
    c.moveTo(off + sw - 4.4, 36 + bob);
    c.lineTo(off + sw + 4.8, 36 + bob);
    c.lineTo(off + sw + 6.2, 51.4);
    c.lineTo(off + sw - 5.8, 51.4);
    c.closePath(); c.fill();
    c.strokeStyle = 'rgba(70,72,95,0.6)'; c.lineWidth = 0.7;
    c.beginPath(); c.moveTo(off + sw - 1.2, 38 + bob); c.lineTo(off + sw - 1.8, 51); c.stroke();
    c.fillStyle = '#efece1';
    c.fillRect(off + sw - 4.6, 50.9, 9.2, 3.1);
    c.fillStyle = '#c9b28a';
    c.fillRect(off + sw - 5.6, 53.8, 11.2, 2.2);
    c.strokeStyle = '#8a744e'; c.lineWidth = 0.9;
    c.beginPath(); c.moveTo(off + sw - 2, 51); c.lineTo(off + sw - 2.5, 55.7); c.stroke();
    c.beginPath(); c.moveTo(off + sw + 2, 51); c.lineTo(off + sw + 2.3, 55.7); c.stroke();
  }
  c.save();
  c.translate(0, bob);
  // far sleeve
  c.fillStyle = '#0e0e15';
  c.beginPath();
  c.moveTo(-8, 16);
  c.quadraticCurveTo(-17, 18, -19, 30);
  c.quadraticCurveTo(-20, 37, -16, 38);
  c.lineTo(-11, 30);
  c.closePath(); c.fill();
  // kosode
  c.fillStyle = lg2(c, -14, 0, 14, 46, [[0, '#262632'], [0.45, '#17171f'], [1, '#0e0e14']]);
  c.beginPath();
  c.moveTo(-15, 18);
  c.quadraticCurveTo(0, 11.5, 15, 18);
  c.lineTo(12, 38);
  c.quadraticCurveTo(0, 42, -12, 38);
  c.closePath(); c.fill();
  // white shitagi V + hem
  c.fillStyle = '#f0f0f6';
  c.beginPath();
  c.moveTo(-6.5, 15.5); c.lineTo(0, 26.5); c.lineTo(6.5, 15.5);
  c.lineTo(4.5, 15); c.lineTo(0, 22); c.lineTo(-4.5, 15);
  c.closePath(); c.fill();
  c.fillStyle = '#dfe0ea';
  c.beginPath();
  c.moveTo(-12.5, 35.4); c.quadraticCurveTo(0, 39.4, 12.5, 35.4);
  c.lineTo(12, 39); c.quadraticCurveTo(0, 43, -12, 39);
  c.closePath(); c.fill();
  // red rosary strap + beads
  strokeCurve(c, [[12.5, 17], [2, 26], [-9.5, 31]], '#b8352d', 2.2, 0.95);
  c.fillStyle = '#d86a5a';
  for (let i = 0; i < 4; i++) {
    const tt = 0.2 + i * 0.22;
    c.beginPath(); c.arc(lerp(12.5, -9.5, tt), lerp(17.8, 30.6, tt) - 1, 1.15, 0, TAU); c.fill();
  }
  // white obi + knot
  c.fillStyle = '#f2f3f8';
  c.save(); c.translate(0, 31.6); c.rotate(-0.05);
  c.fillRect(-12.2, -2.4, 24.4, 4.8);
  c.restore();
  c.fillStyle = '#d6d8e4';
  c.beginPath();
  c.moveTo(8.6, 29.6); c.lineTo(13.2, 31.2); c.lineTo(10.8, 33.2); c.lineTo(12.4, 35.2); c.lineTo(7.8, 34.2);
  c.closePath(); c.fill();
  folds(c, -9, 21, 9, 3, '#080810', 0.55);
  folds(c, 2, 20, 8, 2, '#080810', 0.35);
  // near arm + hand
  const armAng = pose > 0 ? -0.95 * pose : 0.12 + Math.sin(wp * 2) * 0.05;
  c.save();
  c.translate(9, 17);
  c.rotate(armAng);
  c.fillStyle = lg2(c, 0, 0, 0, 20, [[0, '#24242f'], [1, '#12121a']]);
  c.beginPath();
  c.moveTo(-1.5, 0);
  c.quadraticCurveTo(6, 2, 8, 9);
  c.lineTo(8.5, 17);
  c.lineTo(3.5, 18);
  c.quadraticCurveTo(1, 10, -3.5, 4);
  c.closePath(); c.fill();
  c.fillStyle = hollow ? '#c22e24' : '#f0f0f6';
  c.fillRect(3.2, 15.6, 5.6, 3.2);
  c.fillStyle = '#f2c69e';
  c.beginPath(); c.ellipse(6.4, 20.2, 2.5, 2.8, 0.3, 0, TAU); c.fill();
  c.fillStyle = '#e0b183';
  c.fillRect(4.4, 19.4, 4.4, 1);
  c.restore();
  // neck
  c.fillStyle = '#d8ab84';
  c.fillRect(-2.4, 10, 4.8, 5);
  c.restore();

  // head
  const hy = 4 + bob * 0.6;
  faceBase(c, hy, { rx: 9.4, ry: 10.4, blush: !hollow, jaw: 'strong', skin: ['#f2c89e', '#dda878'] });
  if (hollow) {
    // hollow mask with jagged jaw line
    c.fillStyle = '#f0f1f5';
    c.beginPath();
    c.moveTo(-10, hy - 4);
    c.quadraticCurveTo(-10.8, hy + 5, -5.6, hy + 9);
    c.lineTo(-4.2, hy + 7.2); c.lineTo(-2.8, hy + 9.6); c.lineTo(-1.2, hy + 7.8);
    c.lineTo(0.4, hy + 10.4); c.lineTo(2.2, hy + 7.6); c.lineTo(3.8, hy + 9.8); c.lineTo(5.4, hy + 7.6);
    c.quadraticCurveTo(10.6, hy + 4.4, 10, hy - 4.4);
    c.quadraticCurveTo(0, hy - 9.4, -10, hy - 4);
    c.closePath(); c.fill();
    c.fillStyle = '#141416';
    c.beginPath(); c.ellipse(1.9, hy + 0.4, 2.3, 2.8, 0.12, 0, TAU); c.fill();
    c.beginPath(); c.ellipse(6.4, hy + 0.4, 2.3, 2.8, 0.12, 0, TAU); c.fill();
    c.fillStyle = '#ff4032';
    c.beginPath(); c.arc(2, hy + 0.5, 1, 0, TAU); c.fill();
    c.beginPath(); c.arc(6.5, hy + 0.5, 1, 0, TAU); c.fill();
    c.strokeStyle = '#d44'; c.lineWidth = 1;
    c.beginPath(); c.moveTo(-7.6, hy + 0.6); c.lineTo(-5.4, hy + 3.6); c.lineTo(-7, hy + 6.6); c.stroke();
    c.beginPath(); c.moveTo(2.4, hy - 3.2); c.lineTo(2.2, hy - 0.6); c.stroke();
    c.strokeStyle = '#b9bac5'; c.lineWidth = 0.7;
    for (let i = 0; i < 5; i++) {
      const tx = -3.4 + i * 1.75;
      c.beginPath(); c.moveTo(tx, hy + 8.2); c.lineTo(tx + 0.5, hy + 10.4); c.stroke();
    }
  } else {
    eyeB(c, 2, hy + 0.6, 1.6, { iris: '#8a5426', irisD: '#5a3014', browTilt: 1, browCol: '#7a4a18', lash: '#20202c' });
    eyeB(c, 6.4, hy + 0.5, 1.52, { far: true, iris: '#8a5426', irisD: '#5a3014', browTilt: 1, browCol: '#7a4a18', lash: '#20202c' });
    noseSm(c, 3.9, hy + 4.4, '#c98f60');
    mouthSm(c, 4, hy + 6.8, { w: 2.2, curv: -0.75 });
  }
  chinShade(c, hy, 'rgba(0,0,0,0.1)');
  // front hair: crown fringe with jagged teeth
  hairIchigo(c, hy, hollow, wp);
  if (hollow) c.restore();

  // Zangetsu — giant cleaver; sweeps through the real attack angle when striking
  c.save();
  c.translate(15.2, 36.5 + bob);
  if (hollow) c.scale(1.2, 1.2);
  const zp = 1 - pose;
  const rot = (pose > 0 && o.swingA !== undefined)
    ? (o.swingA + Math.PI / 2) - 1.9 * (1 - easeOut(zp)) + 0.35 * Math.sin(zp * Math.PI)
    : (pose > 0 ? (-1.5 - pose * 0.55) : 0.52);
  c.rotate(rot);
  zangetsu(c, hollow);
  c.restore();
};

function zangetsu(c, hollow) {
  // wrapped hilt
  c.fillStyle = '#242430';
  c.fillRect(-1.9, -1, 3.8, 13.5);
  c.strokeStyle = hollow ? '#a8352a' : '#5a5a72'; c.lineWidth = 1;
  for (let i = 0; i < 5; i++) {
    const y = -0.4 + i * 2.8;
    c.beginPath(); c.moveTo(-1.9, y); c.lineTo(1.9, y + 2.4);
    c.moveTo(1.9, y); c.lineTo(-1.9, y + 2.4);
    c.stroke();
  }
  // guard
  c.fillStyle = '#3c4054';
  c.fillRect(-3, -3.2, 6, 2.6);
  c.fillStyle = '#23263a';
  c.fillRect(-3, -3.2, 6, 1);
  // blade: huge cleaver, wide belly, slanted tip
  const g = hollow
    ? lg2(c, -6, 0, 11, 0, [[0, '#101018'], [0.45, '#331016'], [0.8, '#4a1420'], [1, '#160a10']])
    : lg2(c, -6, 0, 11, 0, [[0, '#191922'], [0.45, '#3a3f52'], [0.85, '#565d76'], [1, '#14171f']]);
  c.fillStyle = g;
  c.beginPath();
  c.moveTo(-2.8, -15);
  c.lineTo(-3.6, -40);
  c.quadraticCurveTo(-3, -50, 0.5, -56);
  c.lineTo(8.4, -62);
  c.lineTo(9.8, -52);
  c.quadraticCurveTo(12.6, -36, 10.6, -18);
  c.lineTo(7.2, -14.5);
  c.closePath(); c.fill();
  // cutting-edge highlight
  strokeCurve(c, [[0.6, -55.8], [8.3, -61.6], [9.7, -51.5], [12.4, -35.6], [10.4, -18.2]], hollow ? '#e8605c' : '#dfe6f2', 1.5, 0.95);
  // spine
  strokeCurve(c, [[-3.5, -39.6], [-2.6, -15.2]], '#08080e', 1.6, 0.9);
  // hamon wave
  c.strokeStyle = hollow ? 'rgba(255,120,110,0.4)' : 'rgba(225,238,255,0.5)';
  c.lineWidth = 0.9;
  c.beginPath();
  c.moveTo(3.4, -17.5);
  c.quadraticCurveTo(6.5, -23, 4.4, -29);
  c.quadraticCurveTo(2.6, -35, 5.4, -41);
  c.quadraticCurveTo(7.4, -46, 5.6, -51);
  c.stroke();
  // cleaver notch detail
  c.strokeStyle = 'rgba(10,10,18,0.5)'; c.lineWidth = 0.8;
  c.beginPath(); c.moveTo(1, -20); c.lineTo(8.6, -21.5); c.stroke();
  c.beginPath(); c.moveTo(0.8, -24); c.lineTo(9, -25.5); c.stroke();
}

function hairIchigo(c, hy, hollow, wp) {
  const sway = Math.sin(wp * 1.6) * 0.7;
  const dk = hollow ? '#b04812' : '#c9551b';
  const mid = hollow ? '#e8721f' : '#f4832e';
  // side locks framing the jaw
  fillCurve(c, [[-8.8, hy - 2.4], [-11.4 + sway * 0.3, hy + 5], [-10.6, hy + 12.5], [-8.4, hy + 10], [-8.2, hy + 2]], dk);
  fillCurve(c, [[9.4, hy - 2.6], [12.2 - sway * 0.3, hy + 4.6], [11.6, hy + 11.6], [9.3, hy + 9.4], [9, hy + 2.4]], dk);
  // crown + jagged fringe over the brow line
  c.fillStyle = mid;
  c.beginPath();
  c.moveTo(-9.6, hy + 1.4);
  c.quadraticCurveTo(-6, hy - 12.5, 1.5, hy - 11);
  c.quadraticCurveTo(9.4, hy - 9.6, 10.8, hy - 1.5);
  c.lineTo(9.9, hy + 0.9); c.lineTo(8.3, hy - 2.4);
  c.lineTo(7.3, hy + 0.4); c.lineTo(5.9, hy - 3);
  c.lineTo(4.4, hy + 1.1); c.lineTo(3, hy - 2.6);
  c.lineTo(1.5, hy + 0.5); c.lineTo(0.1, hy - 2.8);
  c.lineTo(-1.5, hy + 1.1); c.lineTo(-2.9, hy - 2.2);
  c.lineTo(-4.4, hy + 0.7); c.lineTo(-5.9, hy - 2.6);
  c.lineTo(-7.4, hy + 1.5); c.lineTo(-8.6, hy - 1.6);
  c.closePath(); c.fill();
  // top highlight sweep
  strokeCurve(c, [[-6, hy - 7.5], [-1, hy - 9.5], [4.6, hy - 8.4], [8.6, hy - 4.5]], hollow ? '#ffb066' : '#ffbd7a', 1.4, 0.55);
}

// ---------- RUKIA ----------
// petite, dark bob with snowflake pin, violet eyes, black shihakusho; bankai = white
GFX.drawRukia = function (c, o, bob, pose) {
  const wp = (o.walkPh || 0);
  const lg = Math.sin(wp * 2) * 2.8;
  const bk = o.form === 'rukia';
  feetShadow(c, 12);
  if (bk) {
    c.save();
    c.translate(0, 56);
    c.scale(1.1, 1.1);
    c.translate(0, -56);
  }
  // back hair: smooth bob, long in bankai
  hairBackRukia(c, bk);

  // legs: normally hidden by hakama; slim black leggings + sandals
  for (const side of [-1, 1]) {
    const off = side === 1 ? 3.6 : -4.4;
    const sw = side === 1 ? lg * 0.3 : -lg * 0.3;
    c.fillStyle = lg2(c, off - 3, 0, off + 4, 54, [[0, '#1a1a24'], [1, '#101018']]);
    c.beginPath();
    c.moveTo(off + sw - 3.6, 37 + bob);
    c.lineTo(off + sw + 4.4, 37 + bob);
    c.lineTo(off + sw + 5, 52);
    c.lineTo(off + sw - 4.2, 52);
    c.closePath(); c.fill();
    c.fillStyle = '#eeecdf';
    c.fillRect(off + sw - 4, 51.6, 8.4, 2.6);
    c.fillStyle = '#b9a67e';
    c.fillRect(off + sw - 4.8, 54, 10, 2);
  }
  c.save();
  c.translate(0, bob);
  // far sleeve
  c.fillStyle = '#0d0d14';
  c.beginPath();
  c.moveTo(-7, 16.5);
  c.quadraticCurveTo(-15.4, 18.5, -17.4, 28.5);
  c.quadraticCurveTo(-18.4, 35, -14.4, 36);
  c.lineTo(-9.6, 28.5);
  c.closePath(); c.fill();
  // kimono
  c.fillStyle = bk
    ? lg2(c, -12, 0, 12, 44, [[0, '#f4f8fd'], [0.6, '#e4edf8'], [1, '#d2e2f2']])
    : lg2(c, -12, 0, 12, 44, [[0, '#1e1e2a'], [0.5, '#14141d'], [1, '#0c0c12']]);
  c.beginPath();
  c.moveTo(-13, 18);
  c.quadraticCurveTo(0, 12.2, 13, 18);
  c.lineTo(10.4, 38);
  c.quadraticCurveTo(0, 41.6, -10.4, 38);
  c.closePath(); c.fill();
  // crossed collar
  c.fillStyle = bk ? '#ffffff' : '#f0f0f6';
  c.beginPath();
  c.moveTo(-6.4, 15.2); c.lineTo(1.2, 27); c.lineTo(-9.4, 30.5); c.lineTo(-12, 20);
  c.closePath(); c.fill();
  c.beginPath();
  c.moveTo(6.6, 15.2); c.lineTo(0.4, 27.2); c.lineTo(9.8, 29.8); c.lineTo(12, 20.4);
  c.closePath(); c.fill();
  c.strokeStyle = bk ? 'rgba(140,190,235,0.85)' : 'rgba(210,214,232,0.7)'; c.lineWidth = 0.7;
  c.beginPath(); c.moveTo(-6.4, 15.2); c.lineTo(1.2, 27); c.stroke();
  c.beginPath(); c.moveTo(6.6, 15.2); c.lineTo(0.4, 27.2); c.stroke();
  // obi
  c.fillStyle = bk ? '#cfe0ef' : '#e8e8f0';
  c.save(); c.translate(0, 31.2); c.rotate(-0.05);
  c.fillRect(-10.8, -2.3, 21.6, 4.6);
  c.restore();
  if (bk) {
    // frost pattern on the white robe
    c.strokeStyle = 'rgba(150,205,240,0.85)'; c.lineWidth = 0.8;
    c.beginPath(); c.moveTo(-8.6, 18.8); c.lineTo(-7.4, 36.6); c.stroke();
    c.beginPath(); c.moveTo(8.6, 18.8); c.lineTo(7.4, 36.6); c.stroke();
    if (QUAL.decor) {
      c.fillStyle = 'rgba(205,235,255,0.9)';
      star4(c, -9.6, 24, 1.3, 0.7);
      star4(c, 8.8, 27.4, 1.1, 0.6);
      star4(c, -2.6, 36.4, 1, 0.55);
    }
  }
  // ice wisp ribbon near free hand
  const swy = Math.sin(wp * 1.4) * 2.4;
  fillCurve(c, [[-2, 12.5], [-7, 13.4], [-11, 17 + swy * 0.6], [-12.4, 24 + swy], [-10.4, 25.4 + swy], [-8.6, 19.4 + swy * 0.5], [-4.4, 15.8]], 'rgba(190,225,238,0.85)');
  fillCurve(c, [[-2, 12.5], [-5, 14.6], [-7, 19 + swy * 0.4], [-6.4, 23.4 + swy * 0.6]], 'rgba(210,238,248,0.55)');
  c.fillStyle = '#bfe8ff';
  star4(c, -1.4, 12.4, 2, 0.9);
  // near arm + sword (swings toward the real attack angle, with a whiplash return)
  const rp = 1 - pose;
  const armAng = pose > 0
    ? -1.0 * pose + (o.swingA !== undefined ? clamp(o.swingA, -1.2, 1.2) * 0.5 * easeOut(rp) : 0) + 0.3 * Math.sin(rp * Math.PI)
    : 0.1 + Math.sin(wp * 2) * 0.05;
  c.save();
  c.translate(8, 16.6);
  c.rotate(armAng);
  c.fillStyle = lg2(c, 0, 0, 0, 18, [[0, '#23232e'], [1, '#101018']]);
  c.beginPath();
  c.moveTo(-1.4, 0);
  c.quadraticCurveTo(5.4, 1.6, 7.4, 8);
  c.lineTo(7.8, 15.4);
  c.lineTo(3, 16.2);
  c.quadraticCurveTo(0.8, 9, -3.2, 3.6);
  c.closePath(); c.fill();
  c.fillStyle = bk ? '#f2fbff' : '#f0f0f6';
  c.fillRect(2.8, 14.4, 5.2, 3);
  c.fillStyle = '#f2d3ae';
  c.beginPath(); c.ellipse(5.8, 18.6, 2.05, 2.3, 0.3, 0, TAU); c.fill();
  c.fillStyle = '#dfb184';
  c.fillRect(3.9, 17.7, 4, 0.9);
  shirayuki(c, 5.6, 19, bk, pose, wp);
  c.restore();
  c.restore();

  // head
  const hy = 4 + bob * 0.6;
  faceBase(c, hy, { rx: 8.4, ry: 9.4, blush: true, jaw: 'soft', skin: ['#f5d9ba', '#dfb28a'] });
  eyeB(c, 1.9, hy + 0.6, 1.5, { iris: '#6a55c8', irisD: '#3a2a8a', browTilt: 0, browCol: '#171b26', lash: '#171b26' });
  eyeB(c, 5.6, hy + 0.55, 1.44, { far: true, iris: '#6a55c8', irisD: '#3a2a8a', browTilt: 0, browCol: '#171b26', lash: '#171b26' });
  noseSm(c, 3.7, hy + 4.3, '#cf9f74');
  mouthSm(c, 3.7, hy + 6.3, { w: 1.8, curv: 0.6 });
  chinShade(c, hy, 'rgba(0,0,0,0.07)');
  hairRukia(c, hy, bk, wp);
  if (bk) c.restore();
};

function hairBackRukia(c, bk) {
  const col = bk ? '#e8edf4' : '#141826';
  // rounded bob silhouette
  fillCurve(c, [[-9, 0.4], [-10.4, 6], [-9.8, 12], [-6.6, 13.6], [0, 12.4], [6.6, 13.6], [9.8, 12], [10.4, 6], [9, 0.4], [0, -3.4]], col);
  if (bk) {
    // bankai: long white hair to the waist
    fillCurve(c, [[-9.6, 1], [-12.8, 10], [-14.4, 24], [-13, 36], [-10, 35], [-9.4, 18], [-8.2, 4]], '#e8edf4');
    fillCurve(c, [[9.8, 1], [12.8, 9], [14.4, 22], [13.2, 34], [10.2, 33], [9.8, 17], [8.6, 4]], '#e8edf4');
    strokeCurve(c, [[-11.4, 8], [-12.2, 22]], 'rgba(255,255,255,0.6)', 1.2, 0.7);
    strokeCurve(c, [[11.6, 7], [12, 20]], 'rgba(255,255,255,0.6)', 1.2, 0.7);
  }
}
function hairRukia(c, hy, bk, wp) {
  const swy = Math.sin(wp * 1.3) * 0.8;
  const dk = bk ? '#f6f9fc' : '#1a2030';
  const md = bk ? '#ffffff' : '#232a3d';
  // crown cap over the skull
  c.fillStyle = md;
  c.beginPath();
  c.moveTo(-9, hy + 1);
  c.quadraticCurveTo(-6.4, hy - 11.4, 1.4, hy - 10.2);
  c.quadraticCurveTo(9, hy - 9.2, 10.2, hy - 1.2);
  c.lineTo(10.6, hy + 1.4); c.lineTo(8.9, hy - 1.6);
  c.lineTo(7.8, hy + 1.2); c.lineTo(6.3, hy - 2.4);
  c.lineTo(4.6, hy + 0.2); c.lineTo(3, hy - 3);
  c.lineTo(1, hy + 0.6); c.lineTo(-1, hy - 2.6);
  c.lineTo(-3.2, hy + 1); c.lineTo(-5, hy - 2.2);
  c.lineTo(-7, hy + 1.4); c.lineTo(-8.6, hy - 0.8);
  c.closePath(); c.fill();
  // side locks to the jaw
  fillCurve(c, [[-9.2, hy - 1], [-11 + swy, hy + 4.4], [-10.6, hy + 9.8], [-8.8, hy + 9.6], [-8.4, hy + 2.6]], dk);
  fillCurve(c, [[9.6, hy - 1], [11.4 - swy, hy + 4], [10.8, hy + 9.2], [9, hy + 9], [8.8, hy + 2.4]], dk);
  // fringe pieces between the brows
  fillCurve(c, [[1.6, hy - 1.4], [3.1, hy + 2.6], [4.3, hy - 1.6]], md);
  // shine band
  strokeCurve(c, [[-4.6, hy - 6.4], [0.4, hy - 8.2], [6, hy - 7.2]], bk ? 'rgba(255,255,255,0.95)' : 'rgba(120,140,190,0.55)', 1.4, 0.75);
  // snowflake hairpin on her temple
  c.save();
  c.translate(-6.6, hy - 3.1);
  c.rotate(0.3);
  c.fillStyle = bk ? '#bfe0f5' : '#e7f4fc';
  for (let i = 0; i < 3; i++) {
    c.rotate(Math.PI / 3);
    c.fillRect(-0.42, -2.5, 0.84, 5);
  }
  c.fillStyle = '#cde6fa';
  c.beginPath(); c.arc(0, 0, 0.95, 0, TAU); c.fill();
  c.fillStyle = '#8fc6ea';
  c.beginPath(); c.arc(0, 0, 0.45, 0, TAU); c.fill();
  c.restore();
}

function shirayuki(c, x, y, bk, pose, wp) {
  c.save();
  c.translate(x, y);
  c.rotate(pose > 0 ? -0.55 : -1.4);
  const ry = Math.sin(wp * 1.8) * 2;
  const bl = bk ? 27 : 22;
  const hiltCol = bk ? '#d9a53a' : '#f3f4f8';
  const hiltDk = bk ? '#a8761f' : '#c9ccdd';
  // dance ribbon (kept subtle so the blade reads clearly)
  strokeCurve(c, [[0, 10], [-2.6, 14.4 + ry * 0.5], [-1.1, 19 + ry], [1.8, 24.5 + ry * 1.2]], 'rgba(230,245,252,0.55)', 1.2, 0.6);
  strokeCurve(c, [[0.4, 10], [2.2, 13.6 + ry * 0.4], [1.4, 18 + ry * 0.8], [3.6, 22 + ry]], 'rgba(210,240,250,0.45)', 0.9, 0.5);
  // hilt wrap
  c.fillStyle = hiltCol;
  c.fillRect(-1.6, -2.5, 3.2, 12.8);
  c.strokeStyle = hiltDk; c.lineWidth = 0.9;
  for (let i = 0; i < 5; i++) {
    const yy = -1.6 + i * 2.5;
    c.beginPath(); c.moveTo(-1.6, yy); c.lineTo(1.6, yy + 2.2); c.moveTo(1.6, yy); c.lineTo(-1.6, yy + 2.2); c.stroke();
  }
  c.fillStyle = hiltDk;
  c.beginPath(); c.ellipse(0, 10.6, 2, 1.2, 0, 0, TAU); c.fill();
  // tassel ring
  c.strokeStyle = bk ? '#f0d488' : '#cdd0e0';
  c.lineWidth = 1.6;
  c.beginPath(); c.arc(0, -3.4, 3.6, 0, TAU); c.stroke();
  c.strokeStyle = 'rgba(255,255,255,0.75)'; c.lineWidth = 0.6;
  c.beginPath(); c.arc(0, -3.4, 3.6, 0, TAU); c.stroke();
  // pure white blade
  const bg = lg2(c, -3, 0, 6, 0, [[0, '#e6f1fb'], [0.55, '#fbfdff'], [1, '#d5e7f6']]);
  c.fillStyle = bg;
  c.beginPath();
  c.moveTo(-2.4, -6.6);
  c.lineTo(3, -7.2);
  c.lineTo(3.5, -6.6 - bl * 0.72);
  c.quadraticCurveTo(2.7, -6.6 - bl, 0.7, -6.6 - bl);
  c.lineTo(-2.8, -9);
  c.closePath(); c.fill();
  strokeCurve(c, [[-2.4, -7.4], [-2.4, -8.6], [0.6, -6.6 - bl]], '#ffffff', 1.1, 1);
  strokeCurve(c, [[2.6, -9.4], [2.5, -6.6 - bl * 0.7]], '#9fd0f0', 0.9, 0.95);
  if (QUAL.decor) {
    c.fillStyle = 'rgba(180,230,255,0.9)';
    star4(c, 2.4, -6.6 - bl * 0.4, 1.5, 0.5);
    star4(c, -1.2, -6.6 - bl * 0.68, 1.1, 0.5);
    star4(c, 1.8, -12, 0.9, 0.45);
  }
  c.restore();
}

// ---------- FRIEREN ----------
// tiny elf mage: very long white hair, pointed ears, red caps, striped top under gold-trim robe
GFX.drawFrieren = function (c, o, bob, pose) {
  const wp = (o.walkPh || 0);
  const tw = Math.sin(wp * 1.2) * 3;
  feetShadow(c, 12);
  hairBackFrieren(c, tw);
  // legs: dark tights + brown boots
  for (const side of [-1, 1]) {
    const off = side === 1 ? 3.2 : -4.2;
    const sw = side === 1 ? tw * 0.25 : -tw * 0.25;
    c.fillStyle = '#16161e';
    c.fillRect(off + sw - 3.1, 40 + bob * 0.2, 6.4, 9);
    c.fillStyle = lg2(c, off - 3, 0, off + 4, 56, [[0, '#8a6042'], [1, '#64462c']]);
    c.beginPath();
    c.moveTo(off + sw - 3.7, 48.6); c.lineTo(off + sw + 3.9, 48.6);
    c.lineTo(off + sw + 4.7, 55.2); c.lineTo(off + sw - 4.5, 55.2);
    c.closePath(); c.fill();
    c.fillStyle = '#4a3320';
    c.fillRect(off + sw - 4.3, 54.3, 9, 1.5);
  }
  c.save();
  c.translate(0, bob);
  // robe: white with gold trim over striped shirt
  c.fillStyle = lg2(c, -11, 0, 11, 42, [[0, '#fdfdfa'], [0.7, '#f1f0ea'], [1, '#e2e1d8']]);
  c.beginPath();
  c.moveTo(-10.4, 22);
  c.quadraticCurveTo(0, 17.6, 10.4, 22);
  c.lineTo(9, 40);
  c.quadraticCurveTo(0, 44, -9, 40);
  c.closePath(); c.fill();
  c.fillStyle = '#d8d3c8';
  c.fillRect(-6.8, 14.6, 13.6, 8);
  c.fillStyle = '#16161e';
  for (let i = 0; i < 4; i++) c.fillRect(-6.8, 15.2 + i * 2.1, 13.6, 1.05);
  c.strokeStyle = '#e2b84a'; c.lineWidth = 1.1;
  c.beginPath(); c.moveTo(-10.4, 22); c.quadraticCurveTo(0, 17.6, 10.4, 22); c.stroke();
  c.beginPath(); c.moveTo(-9, 40); c.quadraticCurveTo(0, 44, 9, 40); c.stroke();
  c.beginPath(); c.moveTo(-6.8, 14.6); c.lineTo(-6.8, 22.6); c.stroke();
  c.beginPath(); c.moveTo(6.8, 14.6); c.lineTo(6.8, 22.6); c.stroke();
  // sleeves
  for (const s of [-1, 1]) {
    c.fillStyle = '#fdfdfa';
    c.beginPath();
    c.moveTo(s * 7.4, 16);
    c.quadraticCurveTo(s * 13.2, 17.6, s * 15, 24);
    c.quadraticCurveTo(s * 15.6, 30, s * 12.4, 31);
    c.lineTo(s * 8.4, 25);
    c.quadraticCurveTo(s * 6.6, 20, s * 7.4, 16);
    c.closePath(); c.fill();
    c.strokeStyle = '#e2b84a'; c.lineWidth = 1;
    c.beginPath();
    c.moveTo(s * 7.8, 16.4); c.quadraticCurveTo(s * 13.4, 18, s * 15, 24.4);
    c.stroke();
  }
  // hand + staff
  const armAng = pose > 0 ? -1.0 * pose : 0.08 + Math.sin(wp * 2) * 0.06;
  c.save();
  c.translate(7.6, 17.4);
  c.rotate(armAng);
  c.fillStyle = '#fdfdfa';
  c.beginPath();
  c.moveTo(-1.2, 0);
  c.quadraticCurveTo(4.6, 1.4, 6.2, 6.4);
  c.lineTo(6.4, 11.4);
  c.lineTo(2.6, 12);
  c.quadraticCurveTo(0.6, 7, -2.6, 2.6);
  c.closePath(); c.fill();
  c.fillStyle = '#f2d3ae';
  c.beginPath(); c.ellipse(4.9, 13.8, 1.9, 2.2, 0.3, 0, TAU); c.fill();
  c.fillStyle = '#dfb184';
  c.fillRect(3.2, 13, 3.8, 0.85);
  staffFrieren(c, 5.2, 14.6, pose, wp, o.swingA);
  c.restore();
  c.restore();

  // head
  const hy = 4 + bob * 0.6;
  faceBase(c, hy, { rx: 8.4, ry: 9.6, blush: true, jaw: 'soft', point: true, earSway: tw * 0.3, skin: ['#f6dabb', '#e2b68c'] });
  eyeB(c, 1.9, hy + 0.7, 1.52, { iris: '#3f9b62', irisD: '#1e5c34', browTilt: -0.12, browCol: '#9aa0a8', lash: '#3a3f45', half: true });
  eyeB(c, 5.5, hy + 0.65, 1.46, { far: true, iris: '#3f9b62', irisD: '#1e5c34', browTilt: -0.12, browCol: '#9aa0a8', lash: '#3a3f45', half: true });
  noseSm(c, 3.7, hy + 4.5, '#d3a276');
  mouthSm(c, 3.7, hy + 6.4, { w: 1.6, curv: 0.5 });
  chinShade(c, hy, 'rgba(0,0,0,0.06)');
  hairFrieren(c, hy, wp);
  if (QUAL.decor) {
    c.fillStyle = 'rgba(255,90,90,0.9)';
    star4(c, -8.2, hy - 3.4, 0.9, 0.4);
    star4(c, 7.4, hy - 3, 0.8, 0.35);
  }
};

function hairBackFrieren(c, tw) {
  // huge twin-tail masses + back mop
  c.fillStyle = '#e6e4dc';
  fillCurve(c, [[-7.4, 0.6], [-11.4, 4], [-12.6, 12], [-10.6, 18], [-7.2, 12], [-6.4, 4]], '#e6e4dc');
  fillCurve(c, [[7.4, 0.6], [11.4, 4], [12.6, 12], [10.6, 18], [7.2, 12], [6.4, 4]], '#e6e4dc');
  fillCurve(c, [[-8.4, 1], [-9.4, 8], [-8.4, 13], [-4.4, 12], [-3.6, 4]], '#eae8e0');
  fillCurve(c, [[8.4, 1], [9.4, 8], [8.4, 13], [4.4, 12], [3.6, 4]], '#eae8e0');
}
function hairFrieren(c, hy, wp) {
  const tw = Math.sin(wp * 1.2) * 3;
  // crown with center parting
  c.fillStyle = '#f2f0e8';
  c.beginPath();
  c.moveTo(-8.8, hy + 1.4);
  c.quadraticCurveTo(-6.6, hy - 11.6, 1.2, hy - 10.6);
  c.quadraticCurveTo(9, hy - 9.6, 9.8, hy - 1.6);
  c.lineTo(8.4, hy + 0.6); c.lineTo(6.9, hy - 2.8);
  c.lineTo(5.4, hy + 0.2); c.lineTo(3.9, hy - 3.2);
  c.lineTo(2.1, hy - 0.2); c.lineTo(0.3, hy - 3.8);
  c.lineTo(-1.7, hy - 0.4); c.lineTo(-3.4, hy - 3.4);
  c.lineTo(-5.2, hy + 0); c.lineTo(-6.9, hy - 3);
  c.lineTo(-8.2, hy + 0.2);
  c.closePath(); c.fill();
  // long side locks with slight swing
  fillCurve(c, [[-9.4, hy - 1.6], [-13.4 + tw * 0.4, hy + 5], [-14.6, hy + 14], [-12, hy + 15.5], [-10, hy + 7], [-8.6, hy + 2]], '#f2f0e8');
  fillCurve(c, [[9.8, hy - 1.6], [13.8 - tw * 0.4, hy + 4.6], [15, hy + 13.4], [12.4, hy + 15], [10.4, hy + 6.6], [9.2, hy + 1.8]], '#f2f0e8');
  // strands
  strokeCurve(c, [[-11.6, hy + 4], [-12.4, hy + 11]], 'rgba(200,198,190,0.8)', 0.9, 0.7);
  strokeCurve(c, [[12, hy + 3.6], [12.8, hy + 10.6]], 'rgba(200,198,190,0.8)', 0.9, 0.7);
  strokeCurve(c, [[-4.6, hy - 6], [0.8, hy - 8.4], [6.4, hy - 6.6]], 'rgba(255,255,255,0.9)', 1.3, 0.7);
}

function staffFrieren(c, x, y, pose, wp, aim) {
  c.save();
  c.translate(x, y);
  const swy = Math.sin((wp || 0) * 0.9) * 0.06;
  let rot = 0.5 + swy;
  if (pose > 0) {
    const target = aim !== undefined ? clamp(aim + Math.PI / 2, -0.6, 1.3) : -0.1;
    rot = lerp(0.5 + swy, target, easeOut(clamp(pose, 0, 1)));
  }
  c.rotate(rot);
  c.fillStyle = lg2(c, -1.2, 0, 1.6, 40, [[0, '#54402a'], [1, '#2e1f12']]);
  c.fillRect(-1.3, 0, 2.6, 40);
  c.strokeStyle = '#1e1409'; c.lineWidth = 0.7;
  c.beginPath(); c.moveTo(-1.3, 1); c.lineTo(-1.3, 39); c.moveTo(1.3, 1); c.lineTo(1.3, 39); c.stroke();
  // gold crescent holder + red orb
  c.strokeStyle = '#e2b84a'; c.lineWidth = 1.7;
  c.beginPath(); c.arc(0, -3.4, 4.6, Math.PI * 0.62, Math.PI * 2.38); c.stroke();
  c.strokeStyle = '#f6d67c'; c.lineWidth = 0.6;
  c.beginPath(); c.arc(0, -3.4, 4.6, Math.PI * 0.62, Math.PI * 2.38); c.stroke();
  c.fillStyle = 'rgba(200,40,40,0.95)';
  c.beginPath(); c.arc(0, -5.6, 1.9, 0, TAU); c.fill();
  c.fillStyle = 'rgba(255,160,160,0.9)';
  c.beginPath(); c.arc(-0.55, -6.15, 0.55, 0, TAU); c.fill();
  // cast flare: the gem blazes while channeling
  if (pose > 0 && QUAL.decor) {
    const fr = 6.5 + pose * 5;
    const g = c.createRadialGradient(0, -5.6, 0.5, 0, -5.6, fr);
    g.addColorStop(0, 'rgba(255,175,165,' + (0.3 + pose * 0.45) + ')');
    g.addColorStop(1, 'rgba(255,80,80,0)');
    c.fillStyle = g;
    c.beginPath(); c.arc(0, -5.6, fr, 0, TAU); c.fill();
  }
  c.restore();
}

// ---------- KAIDO ----------
// massive brute: wall of muscle, blue-black mane, bone horns, gold eyes, studded kanabo
GFX.drawKaido = function (c, o, bob, pose) {
  const wp = (o.walkPh || 0);
  const lg = Math.sin(wp * 2) * 2.4;
  feetShadow(c, 19);
  maneBackKaido(c);
  c.save();
  c.translate(0, bob * 0.5);
  // legs: baggy trousers + black boots
  for (const side of [-1, 1]) {
    const off = side === 1 ? 5 : -6.4;
    const sw = side === 1 ? lg * 0.3 : -lg * 0.3;
    c.fillStyle = lg2(c, off - 5, 0, off + 5, 56, [[0, '#64644e'], [0.7, '#4c4c3c'], [1, '#3a3a2e']]);
    c.beginPath();
    c.moveTo(off + sw - 6.4, 36.5);
    c.lineTo(off + sw + 6.6, 36.5);
    c.lineTo(off + sw + 7.6, 50.4);
    c.lineTo(off + sw - 7.4, 50.4);
    c.closePath(); c.fill();
    c.strokeStyle = 'rgba(30,30,24,0.55)'; c.lineWidth = 0.8;
    c.beginPath(); c.moveTo(off + sw, 40); c.lineTo(off + sw - 0.6, 50); c.stroke();
    c.fillStyle = '#14141a';
    c.fillRect(off + sw - 7, 50, 14.2, 4);
    c.fillStyle = '#0a0a10';
    c.fillRect(off + sw - 7.4, 53.6, 15, 1.8);
  }
  c.restore();
  c.save();
  c.translate(0, bob);
  // far shoulder + arm
  c.fillStyle = '#9c86c2';
  c.beginPath();
  c.moveTo(-9, 14.5);
  c.quadraticCurveTo(-17.5, 16.5, -20.4, 27);
  c.quadraticCurveTo(-21.6, 34.5, -17, 38);
  c.lineTo(-11, 29);
  c.closePath(); c.fill();
  // bare chest in open coat, purple coat walls
  c.fillStyle = lg2(c, -10, 0, 12, 42, [[0, '#6d58a0'], [0.55, '#59478a'], [1, '#46366e']]);
  c.beginPath();
  c.moveTo(-17, 17.5);
  c.quadraticCurveTo(0, 8.5, 17, 17.5);
  c.lineTo(13.6, 38);
  c.quadraticCurveTo(0, 42.5, -13.6, 38);
  c.closePath(); c.fill();
  // chest + abs shading
  c.fillStyle = lg2(c, -8, 12, 8, 40, [[0, '#cd9f6b'], [1, '#b3854f']]);
  c.beginPath();
  c.moveTo(-9.6, 16.5);
  c.quadraticCurveTo(0, 11.5, 9.6, 16.5);
  c.lineTo(7.8, 34);
  c.quadraticCurveTo(0, 37.6, -7.8, 34);
  c.closePath(); c.fill();
  c.strokeStyle = 'rgba(90,60,30,0.55)'; c.lineWidth = 0.8;
  c.beginPath(); c.moveTo(0, 20); c.lineTo(0, 26.5); c.stroke();
  c.moveTo(-5, 27.5); c.lineTo(5, 27.5); c.stroke();
  c.moveTo(-5.6, 31.5); c.lineTo(5.6, 31.5); c.stroke();
  // X scar on chest
  c.strokeStyle = 'rgba(150,60,50,0.8)'; c.lineWidth = 1.2;
  c.beginPath(); c.moveTo(-5.4, 19.5); c.lineTo(4.6, 24.5); c.stroke();
  c.beginPath(); c.moveTo(4.6, 19.5); c.lineTo(-5.4, 24.5); c.stroke();
  // coat lapels
  c.strokeStyle = '#8d78bb'; c.lineWidth = 2;
  c.beginPath(); c.moveTo(-17, 17.5); c.quadraticCurveTo(-11, 21, -9.4, 26); c.stroke();
  c.beginPath(); c.moveTo(17, 17.5); c.quadraticCurveTo(11, 21, 9.4, 26); c.stroke();
  // rope belt + shide
  c.fillStyle = '#c9b28a';
  c.save(); c.translate(0, 33.4); c.rotate(-0.04);
  c.fillRect(-14, -3, 28, 6);
  c.restore();
  c.strokeStyle = '#e8e4d8'; c.lineWidth = 1.4;
  for (let i = 0; i < 2; i++) {
    const zx = i ? 6 : -6;
    c.beginPath();
    c.moveTo(zx, 30.5);
    c.quadraticCurveTo(zx + 3, 34.5 + Math.sin(wp * 3 + i) * 1.5, zx + 1.4, 40);
    c.quadraticCurveTo(zx - 1, 45, zx + 2.4, 48.5);
    c.stroke();
  }
  c.restore();
  // near arm with dragon-scale tattoo
  const armAng = pose > 0 ? -1.05 * pose : -0.12;
  c.save();
  c.translate(12.5, 15.5);
  c.rotate(armAng);
  c.fillStyle = '#c9995e';
  c.beginPath();
  c.moveTo(-1.8, 0);
  c.quadraticCurveTo(7, 2.4, 9.4, 10);
  c.lineTo(10, 18.6);
  c.lineTo(4.2, 19.4);
  c.quadraticCurveTo(1.4, 10.4, -4, 4.2);
  c.closePath(); c.fill();
  c.strokeStyle = '#c96a2e'; c.lineWidth = 1.5;
  c.beginPath(); c.moveTo(1.6, 1.4); c.quadraticCurveTo(8.2, 5.8, 12.8, 11.2); c.stroke();
  for (let i = 0; i < 4; i++) {
    const tt = 0.18 + i * 0.2;
    const sx = lerp(1.8, 12.8, tt), sy = lerp(1.6, 11.2, tt) + (i % 2) * 1.1;
    c.fillStyle = 'rgba(160,52,44,0.9)';
    c.beginPath(); c.ellipse(sx, sy, 1.6, 1.15, 0.42, 0, TAU); c.fill();
    c.strokeStyle = '#e0803a'; c.lineWidth = 0.7;
    c.beginPath(); c.ellipse(sx, sy, 1.6, 1.15, 0.42, 0, TAU); c.stroke();
  }
  c.fillStyle = '#a87c4a';
  c.beginPath(); c.ellipse(8.4, 20.6, 3, 2.6, 0.3, 0, TAU); c.fill();
  c.fillStyle = '#94683c';
  c.fillRect(5.6, 19.6, 5.6, 0.9);
  c.restore();
  // kanabo on the far shoulder: winds up, then crashes through a heavy arc
  c.save();
  c.translate(-19.4, 3.2 + bob);
  const kp = 1 - pose;
  c.rotate(pose > 0 ? -0.38 - 0.35 * (1 - easeOut(kp)) + 2.0 * easeOut(kp) * easeOut(kp) + 0.2 * Math.sin(kp * Math.PI) : -0.38);
  GFX.kanabo(c, 0, 0, pose);
  c.restore();
  // head
  const hy = 4 + bob * 0.6;
  faceBase(c, hy, { rx: 9.6, ry: 10.6, jaw: 'strong', skin: ['#d8a76e', '#bd8a52'] });
  eyeB(c, 2, hy + 0.6, 1.7, { iris: '#e8b52e', irisD: '#9a6c12', browTilt: 1.1, browCol: '#3a2410', lash: '#2a1c10' });
  eyeB(c, 6.6, hy + 0.5, 1.6, { far: true, iris: '#e8b52e', irisD: '#9a6c12', browTilt: 1.1, browCol: '#3a2410', lash: '#2a1c10' });
  noseSm(c, 4.1, hy + 4.6, '#9a7040');
  // Fu-Manchu whiskers + goatee
  c.strokeStyle = '#332514'; c.lineWidth = 0.9; c.lineCap = 'round';
  c.beginPath(); c.moveTo(2.3, hy + 6.2); c.quadraticCurveTo(4.6, hy + 7.6, 6.4, hy + 6.2); c.stroke();
  c.beginPath(); c.moveTo(2.4, hy + 6.8); c.quadraticCurveTo(4.4, hy + 8.4, 6, hy + 7); c.stroke();
  c.beginPath(); c.moveTo(-1.8, hy + 6.4); c.quadraticCurveTo(-4, hy + 7.8, -5.8, hy + 6.6); c.stroke();
  c.fillStyle = '#332514';
  c.beginPath(); c.ellipse(3.6, hy + 8.9, 1.8, 1.05, 0.1, 0, TAU); c.fill();
  c.strokeStyle = '#241806'; c.lineWidth = 0.8;
  c.beginPath(); c.moveTo(2.9, hy + 9.9); c.quadraticCurveTo(3.6, hy + 10.6, 4.3, hy + 10); c.stroke();
  chinShade(c, hy, 'rgba(0,0,0,0.13)');
  hornsKaido(c, hy);
  maneFrontKaido(c, wp);
};

GFX.kanabo = function (c, x, y, pose) {
  c.save();
  c.translate(x, y);
  // handle
  c.fillStyle = lg2(c, -1.7, 0, 1.7, 0, [[0, '#3c3c48'], [1, '#24242e']]);
  c.fillRect(-1.7, -4, 3.4, 18);
  // iron caps
  c.fillStyle = '#33333e';
  c.fillRect(-2.4, -6, 4.8, 2.4);
  // head: bulging octagon
  const bg = lg2(c, -5, -34, 6, -6, [[0, '#4c3524'], [0.5, '#5c422c'], [1, '#3a291a']]);
  c.fillStyle = bg;
  c.beginPath();
  c.moveTo(-3.2, -6.5);
  c.lineTo(-4.7, -12);
  c.lineTo(-4.9, -22);
  c.lineTo(-2.5, -29.5);
  c.lineTo(2.8, -31);
  c.lineTo(5.2, -24);
  c.lineTo(5.6, -13);
  c.lineTo(3.4, -6.5);
  c.closePath(); c.fill();
  // top cap
  c.fillStyle = '#2c2c36';
  c.beginPath();
  c.moveTo(-2.5, -29.5); c.lineTo(2.8, -31);
  c.lineTo(2.2, -34.5); c.lineTo(-2, -33.4);
  c.closePath(); c.fill();
  // gold studs, 3 rows
  c.fillStyle = '#e8c060';
  for (let row = 0; row < 3; row++) {
    const yy = -11.5 - row * 7;
    const n = 2 + row;
    for (let i = 0; i < n; i++) {
      const xx = -3.4 + i * (7.2 / Math.max(1, n - 1)) * 0.62;
      c.beginPath(); c.arc(xx + (row === 1 ? 0.2 : 0), yy, 1.15, 0, TAU); c.fill();
    }
  }
  c.fillStyle = '#fff2c0';
  for (let row = 0; row < 3; row++) {
    const yy = -11.9 - row * 7;
    const n = 2 + row;
    for (let i = 0; i < n; i++) {
      const xx = -3.55 + i * (7.2 / Math.max(1, n - 1)) * 0.62;
      c.beginPath(); c.arc(xx + (row === 1 ? 0.2 : 0), yy, 0.35, 0, TAU); c.fill();
    }
  }
  c.restore();
};

function maneBackKaido(c) {
  // huge blue-black mane arcing behind the shoulders
  c.fillStyle = '#1c1418';
  shards(c, 0.4, 9, 16, 27, 8, Math.PI * 1.08, Math.PI * 1.92, '#1c1418', 1.1);
  fillCurve(c, [[-13.4, 4], [-17.4, 12], [-16.4, 20], [-11.4, 15], [-10.4, 7]], '#241a20');
  fillCurve(c, [[14, 3.4], [17.4, 11], [16.4, 19], [11.4, 14], [10.6, 6.4]], '#241a20');
}
function maneFrontKaido(c, wp) {
  const sway = Math.sin(wp * 1.5) * 0.9;
  // long sideburns sweeping over the coat
  fillCurve(c, [[-9.6, 0.4], [-14.4, 3 + sway], [-16.4, 9], [-15, 14.4], [-12.4, 10], [-10.6, 4]], '#2a1e24');
  fillCurve(c, [[10, 0.4], [14.6, 3.2 + sway * 0.7], [16.6, 9], [15, 14.4], [12.4, 10], [10.8, 3.8]], '#2a1e24');
  if (QUAL.decor) {
    c.fillStyle = 'rgba(255,215,106,0.75)';
    star4(c, -12.4, 12 + sway, 1.2, 0.5);
    star4(c, 12.8, 11 + sway, 1, 0.45);
  }
}
function hornsKaido(c, hy) {
  // bone horns curving up and back
  const bg = lg2(c, -10, hy - 16, 10, hy - 2, [[0, '#ded9cb'], [0.6, '#c9c1a9'], [1, '#a89c84']]);
  c.fillStyle = bg;
  c.beginPath();
  c.moveTo(-8.6, hy - 1.6);
  c.quadraticCurveTo(-12.6, hy - 6.5, -11, hy - 12);
  c.quadraticCurveTo(-10, hy - 16.8, -6.6, hy - 16.2);
  c.quadraticCurveTo(-8.6, hy - 10.5, -6.4, hy - 5);
  c.closePath();
  c.fill();
  c.beginPath();
  c.moveTo(9.6, hy - 1.8);
  c.quadraticCurveTo(13.4, hy - 6.8, 12, hy - 12.2);
  c.quadraticCurveTo(11.2, hy - 17, 7.8, hy - 16.4);
  c.quadraticCurveTo(9.6, hy - 10.8, 7.2, hy - 5.2);
  c.closePath();
  c.fill();
  // ridge rings
  c.strokeStyle = 'rgba(120,108,84,0.7)'; c.lineWidth = 0.7;
  c.beginPath(); c.moveTo(-10.2, hy - 7.6); c.quadraticCurveTo(-8.8, hy - 7, -7.6, hy - 7.8); c.stroke();
  c.beginPath(); c.moveTo(7.9, hy - 7.8); c.quadraticCurveTo(9.2, hy - 7.2, 10.3, hy - 8); c.stroke();
}

// ---------- GOJO ----------
// tall and slim: white upward spikes, black blindfold, high-collar dark uniform
GFX.drawGojo = function (c, o, bob, pose) {
  const wp = (o.walkPh || 0);
  const lg = Math.sin(wp * 2) * 3.2;
  const six = o.eyeMode === 'six' || o.form === 'gojo';
  feetShadow(c, 13);
  // legs: long + slim
  for (const side of [-1, 1]) {
    const off = side === 1 ? 3.8 : -4.6;
    const sw = side === 1 ? lg * 0.34 : -lg * 0.34;
    c.fillStyle = lg2(c, off - 3, 0, off + 4, 56, [[0, '#1c1c28'], [1, '#101018']]);
    c.beginPath();
    c.moveTo(off + sw - 3.4, 38 + bob);
    c.lineTo(off + sw + 4.2, 38 + bob);
    c.lineTo(off + sw + 4.6, 52.2);
    c.lineTo(off + sw - 3.8, 52.2);
    c.closePath(); c.fill();
    c.fillStyle = '#0c0c12';
    c.fillRect(off + sw - 4.2, 52, 8.8, 3.4);
    c.fillStyle = '#26262e';
    c.fillRect(off + sw - 4.4, 55.2, 9.2, 1);
  }
  c.save();
  c.translate(0, bob);
  // long high-collar jacket with white piping
  c.fillStyle = lg2(c, -11, 0, 12, 46, [[0, '#22222e'], [0.5, '#16161f'], [1, '#0e0e15']]);
  c.beginPath();
  c.moveTo(-12.4, 18);
  c.quadraticCurveTo(0, 11.8, 12.4, 18);
  c.lineTo(10.2, 41);
  c.quadraticCurveTo(0, 44.5, -10.2, 41);
  c.closePath(); c.fill();
  // jacket split
  c.strokeStyle = 'rgba(190,195,215,0.5)'; c.lineWidth = 0.8;
  c.beginPath(); c.moveTo(0.8, 15.5); c.lineTo(-1.4, 43); c.stroke();
  c.strokeStyle = 'rgba(225,230,250,0.75)'; c.lineWidth = 1.1;
  c.beginPath(); c.moveTo(-1.6, 17.5); c.lineTo(-3.2, 42.6); c.stroke();
  c.beginPath(); c.moveTo(3.4, 17.5); c.lineTo(2.6, 42.8); c.stroke();
  // high collar
  c.fillStyle = '#1c1c26';
  c.beginPath();
  c.moveTo(-6.2, 13.4); c.quadraticCurveTo(0, 9.8, 6.4, 13.4);
  c.lineTo(4.8, 16.6); c.quadraticCurveTo(0, 13.6, -4.6, 16.6);
  c.closePath(); c.fill();
  c.strokeStyle = 'rgba(225,230,250,0.5)'; c.lineWidth = 0.7;
  c.beginPath(); c.moveTo(-6, 13.6); c.quadraticCurveTo(0, 10.2, 6.2, 13.6); c.stroke();
  // far sleeve
  c.fillStyle = '#101017';
  c.beginPath();
  c.moveTo(-7.4, 17);
  c.quadraticCurveTo(-15.4, 20, -16.6, 30);
  c.quadraticCurveTo(-17.4, 36, -13.8, 36.6);
  c.lineTo(-9.4, 28);
  c.closePath(); c.fill();
  // near arm
  const armAng = pose > 0 ? -0.9 * pose : 0.1 + Math.sin(wp * 2) * 0.05;
  c.save();
  c.translate(8.6, 16.5);
  c.rotate(armAng);
  c.fillStyle = lg2(c, 0, 0, 0, 18, [[0, '#24242f'], [1, '#101018']]);
  c.beginPath();
  c.moveTo(-1.4, 0);
  c.quadraticCurveTo(5.4, 1.4, 7, 7.6);
  c.lineTo(7.4, 15);
  c.lineTo(2.8, 15.8);
  c.quadraticCurveTo(0.8, 8.6, -3.2, 3.4);
  c.closePath(); c.fill();
  c.fillStyle = '#181820';
  c.beginPath(); c.ellipse(5.6, 17.6, 2.3, 2.6, 0.3, 0, TAU); c.fill();
  // cursed-energy ring + swirling Blue around the fist while striking
  if (QUAL.decor) {
    const en = pose > 0 ? 0.55 + pose * 0.4 : 0.12;
    c.strokeStyle = 'rgba(110,190,255,' + en + ')';
    c.lineWidth = 1.3;
    c.beginPath(); c.ellipse(5.6, 17.6, 3.6 + Math.sin(wp * 4) * 0.5, 4.1, 0.4, 0, TAU); c.stroke();
    c.strokeStyle = 'rgba(180,225,255,' + (en * 0.7) + ')';
    c.beginPath(); c.ellipse(5.6, 17.6, 4.4, 5, 0.4, 0, TAU); c.stroke();
    // palm Blue: charges up and swells as the crush goes off
    const br = (pose > 0 ? 3.2 + pose * 2.4 : 1.7) + Math.sin(wp * 4) * 0.35;
    const g = c.createRadialGradient(5.6, 17.6, 0.4, 5.6, 17.6, br + 2);
    g.addColorStop(0, 'rgba(215,238,255,0.95)');
    g.addColorStop(0.5, 'rgba(138,184,255,0.5)');
    g.addColorStop(1, 'rgba(90,160,255,0)');
    c.fillStyle = g;
    c.beginPath(); c.arc(5.6, 17.6, br + 2, 0, TAU); c.fill();
    c.fillStyle = 'rgba(190,225,255,0.9)';
    c.beginPath(); c.arc(5.6, 17.6, br * 0.45, 0, TAU); c.fill();
    for (let i = 0; i < 3; i++) {
      const oa = wp * 2.2 + i * 2.1;
      c.strokeStyle = 'rgba(160,210,255,0.7)';
      c.lineWidth = 0.9;
      c.beginPath(); c.arc(5.6, 17.6, br + 1.2, oa, oa + 1.2); c.stroke();
    }
  }
  c.restore();
  c.restore();

  // head
  const hy = 4 + bob * 0.6;
  faceBase(c, hy, { rx: 8.8, ry: 9.8, jaw: 'soft', blush: false, skin: ['#f6dcc0', '#e3b790'] });
  if (six) {
    eyeB(c, 2, hy + 0.5, 1.55, { iris: '#8fd0ff', irisD: '#3a78c8', irisL: 'rgba(200,235,255,0.7)', browTilt: 0.2, browCol: '#c9cdd8', lash: '#20202a' });
    eyeB(c, 6.1, hy + 0.45, 1.47, { far: true, iris: '#8fd0ff', irisD: '#3a78c8', irisL: 'rgba(200,235,255,0.7)', browTilt: 0.2, browCol: '#c9cdd8', lash: '#20202a' });
    if (QUAL.decor) {
      c.fillStyle = 'rgba(140,200,255,0.35)';
      c.beginPath(); c.arc(2, hy + 0.5, 2.6, 0, TAU); c.fill();
      c.beginPath(); c.arc(6.1, hy + 0.45, 2.5, 0, TAU); c.fill();
    }
    mouthSm(c, 4, hy + 6.4, { w: 2, curv: 1, fang: false });
    // blindfold pushed up onto the forehead
    c.fillStyle = '#17171f';
    c.beginPath();
    c.moveTo(-9, hy - 5.2); c.quadraticCurveTo(0.6, hy - 8.4, 10, hy - 5.6);
    c.lineTo(9.6, hy - 3.4); c.quadraticCurveTo(0.6, hy - 6.4, -8.6, hy - 3);
    c.closePath(); c.fill();
  } else {
    noseSm(c, 4, hy + 5, '#d2a578');
    mouthSm(c, 4.2, hy + 7.2, { w: 2.6, curv: 0.9 });
    // black blindfold: band wraps the head, knot trails behind
    c.fillStyle = '#14141e';
    c.beginPath();
    c.moveTo(-9.4, hy - 1.4);
    c.quadraticCurveTo(0.6, hy - 2.6, 10, hy - 1.8);
    c.lineTo(9.8, hy + 2.6);
    c.quadraticCurveTo(0.6, hy + 1.8, -9.2, hy + 3);
    c.closePath(); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.08)';
    c.beginPath();
    c.moveTo(-9.4, hy - 1.4);
    c.quadraticCurveTo(0.6, hy - 2.6, 10, hy - 1.8);
    c.lineTo(9.9, hy - 0.4);
    c.quadraticCurveTo(0.6, hy - 1.6, -9.3, hy);
    c.closePath(); c.fill();
    // trailing knot
    fillCurve(c, [[-9.2, hy + 0.2], [-13.6, hy + 1.4], [-15.6 + Math.sin(wp * 2) * 0.6, hy + 4.6], [-12.2, hy + 5.4], [-10.4, hy + 2.6]], '#101018');
  }
  chinShade(c, hy, 'rgba(0,0,0,0.08)');
  hairGojo(c, hy, wp);
};

function hairGojo(c, hy, wp) {
  const sway = Math.sin(wp * 1.7) * 0.8;
  const dk = '#d8d8e4';
  const md = '#f4f6fb';
  // spikes fanning up and back from the rim
  shards(c, 0.5, hy - 1, 8.8, 17.5, 10, Math.PI * 1.12, Math.PI * 1.92, dk, 1.25);
  // smooth crown cap
  c.fillStyle = md;
  c.beginPath();
  c.moveTo(-9.2, hy + 1.6);
  c.quadraticCurveTo(-6.2, hy - 11.2, 1.6, hy - 10.2);
  c.quadraticCurveTo(9.6, hy - 9.2, 10.6, hy - 1.4);
  c.lineTo(9.2, hy + 1.2); c.lineTo(7.8, hy - 2.2);
  c.lineTo(6.2, hy + 0.8); c.lineTo(4.6, hy - 2.6);
  c.lineTo(2.8, hy + 0.4); c.lineTo(0.8, hy - 3);
  c.lineTo(-1.4, hy + 0.8); c.lineTo(-3.3, hy - 2.6);
  c.lineTo(-5.2, hy + 0.8); c.lineTo(-7, hy - 2.2);
  c.lineTo(-8.6, hy + 1.4);
  c.closePath(); c.fill();
  // side pieces in front of ears
  fillCurve(c, [[-9.8, hy - 2], [-12.2 + sway * 0.4, hy + 3], [-11.6, hy + 6.6], [-9.4, hy + 2.4]], md);
  fillCurve(c, [[10.4, hy - 2], [12.8 - sway * 0.4, hy + 2.6], [12.2, hy + 6], [10, hy + 2.2]], md);
  // highlights
  strokeCurve(c, [[-5.4, hy - 7.4], [0.2, hy - 9.2], [6.2, hy - 7.6]], 'rgba(255,255,255,0.95)', 1.4, 0.8);
}

// ===== enemies =====
GFX.enemy = function (e, c, qual) {
  c.save();
  c.translate(e.x, e.y);
  const t = e.t || 0;
  if (e.elite) {
    // gold underglow
    c.fillStyle = 'rgba(255,180,60,0.22)';
    c.beginPath(); c.ellipse(0, e.r * 0.7, e.r * 1.3, e.r * 0.5, 0, 0, TAU); c.fill();
  }
  const frozen = e.frozen > 0;
  const chilled = e.chill > 0 && !frozen;
  const sarr = GFX.enspr[e.type];
  const hasSprite = GFX.sprReady(sarr);
  if (hasSprite) {
    GFX.drawSpriteEnemy(c, e, sarr);
  } else switch (e.type) {
    case 'wisp': GFX.eWisp(c, e, t); break;
    case 'husk': GFX.eHusk(c, e, t); break;
    case 'hound': GFX.eHound(c, e, t); break;
    case 'charger': GFX.eCharger(c, e, t); break;
    case 'spitter': GFX.eSpitter(c, e, t); break;
    case 'bomber': GFX.eBomber(c, e, t); break;
    case 'splitter': GFX.eSplitter(c, e, t); break;
    case 'shard': GFX.eShard(c, e, t); break;
    case 'tank': GFX.eTank(c, e, t); break;
    case 'matron': GFX.eMatron(c, e, t); break;
    default:
      if (e.boss) GFX.drawBoss(c, e, t);
  }
  // frozen casing
  if (frozen) {
    c.fillStyle = 'rgba(140,200,255,0.35)';
    c.strokeStyle = 'rgba(190,230,255,0.8)'; c.lineWidth = 1.5;
    const rr = e.r + 4;
    c.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * TAU + (e.animT ?? t) * 0.2;
      const px = Math.cos(a) * rr, py = Math.sin(a) * rr;
      i === 0 ? c.moveTo(px, py) : c.lineTo(px, py);
    }
    c.closePath(); c.fill(); c.stroke();
    // crystal shine
    c.strokeStyle = 'rgba(255,255,255,0.7)'; c.lineWidth = 1;
    c.beginPath(); c.moveTo(-rr * 0.4, -rr * 0.3); c.lineTo(rr * 0.2, rr * 0.4); c.stroke();
  } else if (chilled) {
    // chill speckles
    c.fillStyle = 'rgba(150,220,255,0.7)';
    for (let i = 0; i < 3; i++) {
      const a = t * 2 + i * 2.1;
      c.beginPath(); c.arc(Math.cos(a) * e.r * 0.6, Math.sin(a) * e.r * 0.6, 1.5, 0, TAU); c.fill();
    }
  }
  // flash on hit
  if (e.flash > 0 && !hasSprite) {
    c.globalAlpha = Math.min(0.85, e.flash * 10);
    c.fillStyle = '#fff';
    c.beginPath(); c.arc(0, 0, e.r + 2, 0, TAU); c.fill();
    c.globalAlpha = 1;
  }
  c.restore();
  // elite mini hp bar
  if (e.elite && !e.boss && e.hp < e.mhp) {
    const w = e.r * 2.4, hpp = clamp(e.hp / e.mhp, 0, 1);
    c.fillStyle = 'rgba(0,0,0,0.5)';
    c.fillRect(e.x - w / 2, e.y - e.r - 10, w, 4);
    c.fillStyle = '#ffd76a';
    c.fillRect(e.x - w / 2, e.y - e.r - 10, w * hpp, 4);
  }
};

GFX.drawSpriteEnemy = function (c, e, frames) {
  const def = GFX.ENSPR[e.type];
  const time = e.animT ?? e.t ?? 0;
  const blocked = e.frozen > 0 || e.stun > 0;
  const windup = !blocked && e.phase === 'wind';
  const charging = !blocked && (e.phase === 'charge' || e.phase === 'lunge');
  const fuse = !blocked && e.type === 'bomber' ? clamp(1 - (e.fuse ?? 0.85) / 0.85, 0, 1) : 0;
  const stride = Math.sin(time * def.fps * Math.PI / 2);
  const brace = windup ? 0.65 + 0.35 * Math.sin(time * 22) : 0;
  const recoil = blocked ? 0 : clamp((e.flash || 0) / 0.10, 0, 1);
  const grounded = def.anchor === 'feet';
  const img = frames[windup ? 1 : charging ? 2 : Math.floor(time * def.fps) % frames.length];
  const h = def.h * e.r / def.baseR;
  const w = h * img.naturalWidth / img.naturalHeight;
  const heading = e.phase === 'lunge' ? e.la : e.ca;
  const travelX = heading === undefined ? 0 : Math.cos(heading);
  const face = charging && Math.abs(travelX) > 0.1 ? Math.sign(travelX) : e.face >= 0 ? 1 : -1;
  const bob = grounded ? Math.abs(stride) * 1.7 : stride * 3;

  if (windup || fuse > 0) {
    c.strokeStyle = windup && e.type === 'matron' ? '#d49aff' : '#ffb46b';
    c.globalAlpha = windup ? 0.45 + brace * 0.35 : 0.25 + fuse * 0.65;
    c.lineWidth = 2;
    c.beginPath();
    c.ellipse(0, grounded ? e.r * 0.88 : 0, e.r * (1.1 + fuse * 0.4), e.r * 0.4, 0, 0, TAU);
    c.stroke();
    c.globalAlpha = 1;
  }

  c.save();
  c.imageSmoothingEnabled = false;
  c.translate(-face * recoil * 3, (grounded ? e.r * 0.92 : 0) - (windup || charging ? 0 : bob));
  c.scale(face, 1);
  c.rotate(blocked ? 0 : (charging ? 0.26 : stride * 0.05 - 0.12 * brace - 0.14 * recoil));
  c.scale((def.facing || 1) * (1 + 0.16 * brace + 0.19 * charging + 0.12 * fuse),
    1 - 0.20 * brace - 0.13 * charging + 0.18 * fuse - 0.12 * recoil);
  c.drawImage(img, -w / 2, grounded ? -h : -h * 0.55, w, h);
  c.restore();
};

GFX.eWisp = function (c, e, t) {
  // ghostly orb with trail
  c.fillStyle = 'rgba(120,80,200,0.25)';
  c.beginPath(); c.arc(-e.face * 6, 0, e.r * 0.6, 0, TAU); c.fill();
  c.fillStyle = e.col;
  c.beginPath(); c.arc(0, Math.sin(t * 3) * 2, e.r * 0.8, 0, TAU); c.fill();
  c.fillStyle = '#1a1030';
  c.beginPath(); c.arc(e.face * 2, -1, e.r * 0.18, 0, TAU); c.arc(e.face * 5, -1, e.r * 0.18, 0, TAU); c.fill();
  // wispy tail
  c.strokeStyle = e.col; c.lineWidth = 2; c.globalAlpha = 0.6;
  c.beginPath(); c.moveTo(0, e.r * 0.6); c.quadraticCurveTo(-e.face * 7, e.r + Math.sin(t * 4) * 4, -e.face * 12, e.r * 1.6); c.stroke();
  c.globalAlpha = 1;
};
GFX.eHusk = function (c, e, t) {
  // shambling zombie-like husk
  const b = Math.sin(t * 6) * 1.5;
  c.fillStyle = '#1c2028';
  c.fillRect(-e.r * 0.35, e.r * 0.4, e.r * 0.28, e.r * 0.55);
  c.fillRect(e.r * 0.1, e.r * 0.4, e.r * 0.28, e.r * 0.55);
  c.fillStyle = e.col;
  c.beginPath(); c.ellipse(0, b, e.r * 0.62, e.r * 0.72, 0, 0, TAU); c.fill();
  c.fillStyle = '#141820';
  c.beginPath(); c.arc(0, -e.r * 0.1 + b, e.r * 0.5, Math.PI, 0); c.fill(); // head hood
  c.fillStyle = '#ff5a5a';
  c.beginPath(); c.arc(-e.r * 0.16, -e.r * 0.16 + b, e.r * 0.08, 0, TAU); c.arc(e.r * 0.16, -e.r * 0.16 + b, e.r * 0.08, 0, TAU); c.fill();
  // reaching arms
  c.strokeStyle = e.col; c.lineWidth = e.r * 0.22; c.lineCap = 'round';
  const ar = Math.sin(t * 5) * 0.2;
  c.beginPath(); c.moveTo(-e.r * 0.55, b); c.lineTo(-e.r * (0.9 + ar), e.r * 0.2 + b); c.stroke();
  c.beginPath(); c.moveTo(e.r * 0.55, b); c.lineTo(e.r * (0.9 - ar), e.r * 0.2 + b); c.stroke();
};
GFX.eHound = function (c, e, t) {
  // fast quadruped
  const run = Math.sin(t * 10);
  c.fillStyle = '#14101a';
  for (let i = 0; i < 4; i++) {
    const lx = (i < 2 ? -1 : 1) * e.r * 0.5;
    const ly = e.r * 0.45 + Math.sin(t * 10 + i * 1.6) * 3;
    c.fillRect(lx, ly, e.r * 0.2, e.r * 0.55);
  }
  c.fillStyle = e.col;
  c.beginPath(); c.ellipse(0, 0, e.r * 0.85, e.r * 0.5, 0, 0, TAU); c.fill();
  // head low
  c.beginPath(); c.ellipse(e.face * e.r * 0.8, e.r * 0.15 + run, e.r * 0.45, e.r * 0.32, 0, 0, TAU); c.fill();
  // ears
  c.beginPath();
  c.moveTo(e.face * e.r * 0.7, -e.r * 0.1 + run); c.lineTo(e.face * e.r * 0.9, -e.r * 0.55 + run); c.lineTo(e.face * e.r * 1.1, -e.r * 0.05 + run);
  c.closePath(); c.fill();
  // red eyes
  c.fillStyle = '#ff4040';
  c.beginPath(); c.arc(e.face * e.r * 1.0, e.r * 0.1 + run, e.r * 0.09, 0, TAU); c.fill();
  // spine
  c.strokeStyle = '#3a2a4a'; c.lineWidth = 2;
  c.beginPath();
  for (let i = 0; i <= 4; i++) {
    const x = -e.r * 0.7 + (i / 4) * e.r * 1.2;
    const y = -e.r * 0.45 - Math.sin(t * 8 + i) * 1.5;
    i === 0 ? c.moveTo(x, y) : c.lineTo(x, y);
  }
  c.stroke();
};
GFX.eCharger = function (c, e, t) {
  // beetle-like brute, wind-up telegraph shows pulsing ring
  if (e.phase === 'wind') {
    c.strokeStyle = 'rgba(255,120,80,0.5)';
    c.lineWidth = 2;
    c.beginPath(); c.arc(0, 0, e.r + 6 + Math.sin(t * 20) * 3, 0, TAU); c.stroke();
  }
  c.fillStyle = '#1a1420';
  c.fillRect(-e.r * 0.3, e.r * 0.5, e.r * 0.25, e.r * 0.5);
  c.fillRect(e.r * 0.1, e.r * 0.5, e.r * 0.25, e.r * 0.5);
  // carapace
  c.fillStyle = e.col;
  c.beginPath(); c.ellipse(0, 0, e.r * 0.8, e.r * 0.7, 0, 0, TAU); c.fill();
  c.strokeStyle = '#2a1e2e'; c.lineWidth = 2;
  c.beginPath(); c.moveTo(-e.r * 0.7, 0); c.lineTo(e.r * 0.7, 0); c.stroke();
  // horn
  c.fillStyle = '#d8c8a0';
  c.beginPath();
  c.moveTo(e.face * e.r * 0.5, -e.r * 0.3);
  c.lineTo(e.face * e.r * 1.3, -e.r * 0.55);
  c.lineTo(e.face * e.r * 0.55, -e.r * 0.05);
  c.closePath(); c.fill();
  // eyes
  c.fillStyle = '#ffd76a';
  c.beginPath(); c.arc(e.face * e.r * 0.5, -e.r * 0.15, e.r * 0.1, 0, TAU); c.fill();
};
GFX.eSpitter = function (c, e, t) {
  // plant/monk-like caster, channeling ring when winding
  const b = Math.sin(t * 3) * 2;
  c.fillStyle = '#101a14';
  c.fillRect(-e.r * 0.3, e.r * 0.45, e.r * 0.22, e.r * 0.5);
  c.fillRect(e.r * 0.12, e.r * 0.45, e.r * 0.22, e.r * 0.5);
  // robed body
  c.fillStyle = e.col;
  c.beginPath();
  c.moveTo(0, -e.r * 0.8 + b);
  c.quadraticCurveTo(e.r * 0.9, 0 + b, e.r * 0.7, e.r * 0.9);
  c.lineTo(-e.r * 0.7, e.r * 0.9);
  c.quadraticCurveTo(-e.r * 0.9, 0 + b, 0, -e.r * 0.8 + b);
  c.closePath(); c.fill();
  // hood void face
  c.fillStyle = '#08120c';
  c.beginPath(); c.arc(0, -e.r * 0.35 + b, e.r * 0.32, 0, TAU); c.fill();
  // glowing eyes
  c.fillStyle = '#7aff8a';
  c.beginPath(); c.arc(-e.r * 0.12, -e.r * 0.38 + b, e.r * 0.07, 0, TAU); c.arc(e.r * 0.12, -e.r * 0.38 + b, e.r * 0.07, 0, TAU); c.fill();
  // channeling glow when winding
  if (e.phase === 'wind') {
    c.strokeStyle = 'rgba(120,255,140,0.6)';
    c.lineWidth = 2;
    c.beginPath(); c.arc(0, 0, e.r * 1.1 + Math.sin(t * 16) * 4, -0.9, -0.4); c.stroke();
    c.beginPath(); c.arc(0, 0, e.r * 1.1 + Math.sin(t * 16) * 4, Math.PI - 0.9, Math.PI - 0.4); c.stroke();
  }
};
GFX.eBomber = function (c, e, t) {
  // round walking bomb: fuse spark speeds up as it nears blast
  const fuse = e.fuse !== undefined ? e.fuse : 10;
  const urg = clamp(1 - fuse / 10, 0, 1);
  c.fillStyle = 'rgba(255,120,60,0.15)';
  c.beginPath(); c.arc(0, 0, e.r * (1.2 + urg * 0.5), 0, TAU); c.fill();
  c.fillStyle = '#3a3a44';
  c.fillRect(-e.r * 0.35, e.r * 0.4, e.r * 0.25, e.r * 0.4);
  c.fillRect(e.r * 0.12, e.r * 0.4, e.r * 0.25, e.r * 0.4);
  c.fillStyle = e.col;
  c.beginPath(); c.arc(0, 0, e.r * 0.75, 0, TAU); c.fill();
  // highlight blink accelerates
  const blink = Math.sin(t * (6 + urg * 26)) > 0;
  c.fillStyle = blink ? '#ffd76a' : '#ff5a3a';
  c.beginPath(); c.arc(0, -e.r * 0.15, e.r * 0.3, 0, TAU); c.fill();
  // fuse
  c.strokeStyle = '#c9a86a'; c.lineWidth = 2;
  c.beginPath(); c.moveTo(0, -e.r * 0.7); c.quadraticCurveTo(e.r * 0.3, -e.r * 1.1, e.r * 0.15, -e.r * 1.3); c.stroke();
  // spark
  c.fillStyle = '#fff2a8';
  c.beginPath(); c.arc(e.r * 0.15, -e.r * 1.3, 2 + Math.sin(t * 30) * 1.2 + urg * 2, 0, TAU); c.fill();
};
GFX.eSplitter = function (c, e, t) {
  // cracked slime blob
  const wob = Math.sin(t * 4);
  c.fillStyle = e.col;
  c.beginPath();
  c.ellipse(0, 0, e.r * (0.85 + wob * 0.06), e.r * (0.75 - wob * 0.06), 0, 0, TAU);
  c.fill();
  // cracks
  c.strokeStyle = 'rgba(20,20,30,0.7)'; c.lineWidth = 1.5;
  c.beginPath();
  c.moveTo(-e.r * 0.4, -e.r * 0.3); c.lineTo(0, 0); c.lineTo(-e.r * 0.2, e.r * 0.4);
  c.moveTo(0, 0); c.lineTo(e.r * 0.45, -e.r * 0.15);
  c.stroke();
  c.fillStyle = '#181a28';
  c.beginPath(); c.arc(-e.r * 0.2, -e.r * 0.2, e.r * 0.1, 0, TAU); c.arc(e.r * 0.25, -e.r * 0.2, e.r * 0.1, 0, TAU); c.fill();
};
GFX.eShard = function (c, e, t) {
  // small glass shard creature
  c.save();
  c.rotate(t * 3 + e.t);
  c.fillStyle = e.col;
  c.beginPath();
  c.moveTo(0, -e.r); c.lineTo(e.r * 0.6, 0); c.lineTo(0, e.r); c.lineTo(-e.r * 0.6, 0);
  c.closePath(); c.fill();
  c.fillStyle = 'rgba(255,255,255,0.5)';
  c.beginPath(); c.moveTo(0, -e.r * 0.7); c.lineTo(e.r * 0.3, 0); c.lineTo(0, e.r * 0.2); c.closePath(); c.fill();
  c.restore();
};
GFX.eTank = function (c, e, t) {
  // armored slab giant, slow heavy steps
  const step = Math.sin(t * 2.5);
  c.fillStyle = '#181820';
  c.fillRect(-e.r * 0.45, e.r * 0.5 + step, e.r * 0.3, e.r * 0.4);
  c.fillRect(e.r * 0.15, e.r * 0.5 - step, e.r * 0.3, e.r * 0.4);
  // slabs
  c.fillStyle = e.col;
  c.fillRect(-e.r * 0.75, -e.r * 0.45, e.r * 1.5, e.r * 1.0);
  c.fillStyle = 'rgba(0,0,0,0.25)';
  c.fillRect(-e.r * 0.75, -e.r * 0.45, e.r * 1.5, e.r * 0.18);
  c.fillRect(-e.r * 0.75, 0, e.r * 1.5, e.r * 0.15);
  // rivets
  c.fillStyle = '#8a8a98';
  for (let i = 0; i < 4; i++) {
    c.beginPath(); c.arc(-e.r * 0.55 + i * e.r * 0.37, -e.r * 0.28, e.r * 0.06, 0, TAU); c.fill();
  }
  // visor
  c.fillStyle = '#ff8a3a';
  c.fillRect(-e.r * 0.4, -e.r * 0.35, e.r * 0.8, e.r * 0.15);
  // shield arms
  c.fillStyle = '#3e3e4c';
  c.fillRect(-e.r * 1.05, -e.r * 0.4, e.r * 0.28, e.r * 0.9);
  c.fillRect(e.r * 0.77, -e.r * 0.4, e.r * 0.28, e.r * 0.9);
};
GFX.eMatron = function (c, e, t) {
  // summoning hag with orbiting portals
  const b = Math.sin(t * 2) * 2;
  if (e.phase === 'wind') {
    // channel ring
    const p = clamp(e.pT / 3.4, 0, 1);
    c.strokeStyle = 'rgba(200,120,255,0.65)';
    c.lineWidth = 3;
    c.beginPath(); c.arc(0, 0, e.r * 1.4, -Math.PI / 2, -Math.PI / 2 + p * TAU); c.stroke();
    // pentagram-ish sparks
    c.fillStyle = 'rgba(200,130,255,0.8)';
    for (let i = 0; i < 5; i++) {
      const a = t * 3 + (i / 5) * TAU;
      c.beginPath(); c.arc(Math.cos(a) * e.r * 1.4, Math.sin(a) * e.r * 1.4, 2.5, 0, TAU); c.fill();
    }
  }
  c.fillStyle = '#1a1424';
  c.fillRect(-e.r * 0.32, e.r * 0.45, e.r * 0.24, e.r * 0.45);
  c.fillRect(e.r * 0.1, e.r * 0.45, e.r * 0.24, e.r * 0.45);
  // tattered dress
  c.fillStyle = e.col;
  c.beginPath();
  c.moveTo(0, -e.r * 0.75 + b);
  c.quadraticCurveTo(e.r * 0.95, b, e.r * 0.8, e.r * 0.9);
  for (let i = 0; i < 5; i++) {
    c.lineTo(e.r * (0.8 - (i + 1) * 0.4), e.r * (0.9 - (i % 2) * 0.15));
  }
  c.quadraticCurveTo(-e.r * 0.95, b, 0, -e.r * 0.75 + b);
  c.closePath(); c.fill();
  // head + hood
  c.fillStyle = '#241a30';
  c.beginPath(); c.arc(0, -e.r * 0.5 + b, e.r * 0.4, 0, TAU); c.fill();
  c.fillStyle = '#c58aff';
  c.beginPath(); c.arc(-e.r * 0.14, -e.r * 0.52 + b, e.r * 0.06, 0, TAU); c.arc(e.r * 0.14, -e.r * 0.52 + b, e.r * 0.06, 0, TAU); c.fill();
};

// ===== bosses =====
GFX.drawBoss = function (c, e, t) {
  switch (e.bossId) {
    case 'gravelord': GFX.bGravelord(c, e, t); break;
    case 'nightmother': GFX.bNightmother(c, e, t); break;
    case 'ashking': GFX.bAshking(c, e, t); break;
    case 'devourer': GFX.bDevourer(c, e, t); break;
    default: GFX.bGravelord(c, e, t);
  }
};
GFX.bGravelord = function (c, e, t) {
  // hulking shrouded gravewarden; gravestones orbit it
  c.fillStyle = 'rgba(70,90,120,0.18)';
  c.beginPath(); c.ellipse(0, e.r, e.r * 1.5, e.r * 0.5, 0, 0, TAU); c.fill();
  // orbiting gravestones
  c.fillStyle = '#5a6a8a';
  for (let i = 0; i < 5; i++) {
    const a = t * 0.8 + (i / 5) * TAU;
    const gx = Math.cos(a) * e.r * 1.8, gy = Math.sin(a) * e.r * 0.8;
    c.save(); c.translate(gx, gy); c.rotate(Math.sin(a) * 0.4);
    c.fillRect(-8, -14, 16, 24);
    c.beginPath(); c.arc(0, -14, 8, Math.PI, 0); c.fill();
    c.restore();
  }
  // cloak
  c.fillStyle = e.col;
  c.beginPath();
  c.moveTo(0, -e.r * 0.9);
  c.quadraticCurveTo(e.r * 1.1, -e.r * 0.2, e.r * 0.95, e.r * 0.95);
  for (let i = 0; i < 6; i++) c.lineTo(e.r * (0.95 - (i + 1) * 0.32), e.r * (0.95 - (i % 2) * 0.2));
  c.quadraticCurveTo(-e.r * 1.1, -e.r * 0.2, 0, -e.r * 0.9);
  c.closePath(); c.fill();
  // hood
  c.fillStyle = '#1a2434';
  c.beginPath(); c.arc(0, -e.r * 0.62, e.r * 0.42, 0, TAU); c.fill();
  // lantern eyes
  const gl = 0.6 + Math.sin(t * 3) * 0.4;
  c.fillStyle = rgba('#7aff8a', gl);
  c.beginPath(); c.arc(-e.r * 0.15, -e.r * 0.62, e.r * 0.07, 0, TAU); c.arc(e.r * 0.15, -e.r * 0.62, e.r * 0.07, 0, TAU); c.fill();
  // scythe
  c.strokeStyle = '#3a3a44'; c.lineWidth = 6;
  c.beginPath(); c.moveTo(e.r * 0.7, e.r * 0.8); c.lineTo(-e.r * 0.5, -e.r * 1.25); c.stroke();
  c.fillStyle = '#c9d4e8';
  c.beginPath();
  c.moveTo(-e.r * 0.5, -e.r * 1.25);
  c.quadraticCurveTo(e.r * 0.3, -e.r * 1.6, e.r * 0.55, -e.r * 1.1);
  c.quadraticCurveTo(e.r * 0.1, -e.r * 1.4, -e.r * 0.5, -e.r * 1.25);
  c.closePath(); c.fill();
};
GFX.bNightmother = function (c, e, t) {
  // veiled floating matriarch with tendrils
  const fl = Math.sin(t * 1.5) * 6;
  c.save();
  c.translate(0, fl);
  // veil aura
  c.fillStyle = 'rgba(160,110,220,0.12)';
  c.beginPath(); c.arc(0, 0, e.r * 1.5, 0, TAU); c.fill();
  // tendrils
  c.strokeStyle = e.col; c.lineWidth = 5; c.lineCap = 'round';
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * TAU + t * 0.4;
    c.beginPath();
    c.moveTo(Math.cos(a) * e.r * 0.5, Math.sin(a) * e.r * 0.5);
    c.quadraticCurveTo(
      Math.cos(a + Math.sin(t + i)) * e.r * 1.2, Math.sin(a + Math.sin(t + i)) * e.r * 1.2,
      Math.cos(a - 0.3) * e.r * 1.7, Math.sin(a - 0.3) * e.r * 1.7 - fl
    );
    c.stroke();
  }
  // gown
  const g = c.createLinearGradient(0, -e.r, 0, e.r);
  g.addColorStop(0, '#3a2460'); g.addColorStop(1, '#1e1430');
  c.fillStyle = g;
  c.beginPath();
  c.moveTo(0, -e.r * 0.6);
  c.quadraticCurveTo(e.r * 0.9, 0, e.r * 0.7, e.r * 1.1);
  c.lineTo(-e.r * 0.7, e.r * 1.1);
  c.quadraticCurveTo(-e.r * 0.9, 0, 0, -e.r * 0.6);
  c.closePath(); c.fill();
  // head veil
  c.fillStyle = '#241a40';
  c.beginPath(); c.arc(0, -e.r * 0.62, e.r * 0.38, 0, TAU); c.fill();
  // crown
  c.fillStyle = '#c9a8ff';
  for (let i = -2; i <= 2; i++) {
    c.beginPath();
    c.moveTo(i * e.r * 0.14 - 3, -e.r * 0.92);
    c.lineTo(i * e.r * 0.14, -e.r * 1.12 - Math.abs(i) * 4);
    c.lineTo(i * e.r * 0.14 + 3, -e.r * 0.92);
    c.closePath(); c.fill();
  }
  // veil slit with moon eyes
  c.fillStyle = '#ffe8b0';
  c.beginPath();
  c.arc(-e.r * 0.13, -e.r * 0.65, e.r * 0.055, 0.3, Math.PI - 0.3);
  c.arc(e.r * 0.13, -e.r * 0.65, e.r * 0.055, 0.3, Math.PI - 0.3);
  c.fill();
  c.restore();
};
GFX.bAshking = function (c, e, t) {
  // burning ossified king; ember particles + flame crown
  // ember halo
  if (QUAL.glow) {
    c.fillStyle = `rgba(255,${120 + Math.sin(t * 6) * 40 | 0},40,0.15)`;
    c.beginPath(); c.arc(0, 0, e.r * 1.8, 0, TAU); c.fill();
  }
  // flame crown: 5 licking flames
  for (let i = -2; i <= 2; i++) {
    const fw = Math.sin(t * 7 + i) * 0.35;
    const hgt = e.r * (0.7 + Math.abs(i) * -0.08) + Math.sin(t * 9 + i * 2) * 6;
    const gg = c.createLinearGradient(0, -e.r - hgt, 0, -e.r * 0.4);
    gg.addColorStop(0, '#fff2a8'); gg.addColorStop(0.5, '#ff8a3a'); gg.addColorStop(1, '#c8321e');
    c.fillStyle = gg;
    c.beginPath();
    c.moveTo(i * e.r * 0.22 - e.r * 0.12, -e.r * 0.5);
    c.quadraticCurveTo(i * e.r * 0.22 + fw * e.r * 0.4, -e.r * 0.5 - hgt * 0.6, i * e.r * 0.22, -e.r * 0.5 - hgt);
    c.quadraticCurveTo(i * e.r * 0.22 - fw * e.r * 0.4, -e.r * 0.5 - hgt * 0.6, i * e.r * 0.22 + e.r * 0.12, -e.r * 0.5);
    c.closePath(); c.fill();
  }
  // charred ribcage torso
  c.fillStyle = e.col;
  c.beginPath();
  c.moveTo(-e.r * 0.7, -e.r * 0.45);
  c.quadraticCurveTo(0, -e.r * 0.6, e.r * 0.7, -e.r * 0.45);
  c.quadraticCurveTo(e.r * 0.55, e.r * 0.5, 0, e.r * 0.95);
  c.quadraticCurveTo(-e.r * 0.55, e.r * 0.5, -e.r * 0.7, -e.r * 0.45);
  c.closePath(); c.fill();
  // ribs
  c.strokeStyle = '#3a2018'; c.lineWidth = 3;
  for (let i = 0; i < 4; i++) {
    c.beginPath();
    c.moveTo(-e.r * 0.5, -e.r * 0.25 + i * e.r * 0.22);
    c.quadraticCurveTo(0, -e.r * 0.1 + i * e.r * 0.22, e.r * 0.5, -e.r * 0.25 + i * e.r * 0.22);
    c.stroke();
  }
  // skull head with glowing sockets
  c.fillStyle = '#e8dcb8';
  c.beginPath(); c.ellipse(0, -e.r * 0.62, e.r * 0.3, e.r * 0.34, 0, 0, TAU); c.fill();
  c.fillStyle = '#1c0d08';
  c.beginPath(); c.ellipse(-e.r * 0.12, -e.r * 0.64, e.r * 0.08, e.r * 0.1, 0, 0, TAU); c.ellipse(e.r * 0.12, -e.r * 0.64, e.r * 0.08, e.r * 0.1, 0, 0, TAU); c.fill();
  const gl2 = 0.55 + Math.sin(t * 5) * 0.35;
  c.fillStyle = rgba('#ff8a3a', gl2);
  c.beginPath(); c.arc(-e.r * 0.12, -e.r * 0.64, e.r * 0.05, 0, TAU); c.arc(e.r * 0.12, -e.r * 0.64, e.r * 0.05, 0, TAU); c.fill();
  // jaw
  c.fillStyle = '#c8b890';
  c.fillRect(-e.r * 0.14, -e.r * 0.4, e.r * 0.28, e.r * 0.08);
  // ember particles rising
  if (Math.random() < 0.3) part(e.x + rnd(-e.r, e.r), e.y - e.r * 0.4, '#ff8a3a', 1, 60, 2.5);
};
GFX.bDevourer = function (c, e, t) {
  // void maw with ring of tentacles + many eyes
  // outer void disc
  c.fillStyle = 'rgba(20,10,40,0.8)';
  c.beginPath(); c.arc(0, 0, e.r * 1.15, 0, TAU); c.fill();
  // tentacle ring
  c.strokeStyle = '#3a2050'; c.lineWidth = 7; c.lineCap = 'round';
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * TAU + t * 0.7;
    const w = Math.sin(t * 2.4 + i * 1.3);
    c.beginPath();
    c.moveTo(Math.cos(a) * e.r * 0.9, Math.sin(a) * e.r * 0.9);
    c.quadraticCurveTo(
      Math.cos(a + 0.35) * e.r * 1.5, Math.sin(a + 0.35) * e.r * 1.5 + w * 10,
      Math.cos(a + w * 0.2) * e.r * 1.9, Math.sin(a + w * 0.2) * e.r * 1.9
    );
    c.stroke();
  }
  // maw
  c.fillStyle = e.col;
  c.beginPath(); c.arc(0, 0, e.r, 0, TAU); c.fill();
  // mouth opens with phase
  const open = e.phase === 'wind' ? 0.75 : 0.35 + Math.sin(t * 1.8) * 0.12;
  c.fillStyle = '#080310';
  c.beginPath(); c.ellipse(0, 0, e.r * 0.55, e.r * open, 0, 0, TAU); c.fill();
  // teeth ring
  c.fillStyle = '#e8e2d0';
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * TAU + t * 0.15;
    const tx = Math.cos(a) * e.r * 0.5, ty = Math.sin(a) * e.r * open * 0.8;
    c.beginPath();
    c.moveTo(tx - 4, ty); c.lineTo(tx + Math.cos(a) * 8, ty + Math.sin(a) * 8); c.lineTo(tx + 4, ty);
    c.closePath(); c.fill();
  }
  // eyes scattered on body
  for (let i = 0; i < 7; i++) {
    const a = hash2(i, 7.7) * TAU, d = e.r * (0.6 + hash2(i, 3.3) * 0.3);
    const ex = Math.cos(a) * d, ey = Math.sin(a) * d;
    c.fillStyle = '#fff';
    c.beginPath(); c.ellipse(ex, ey, 5, 3.4, a, 0, TAU); c.fill();
    c.fillStyle = '#3a1050';
    const trackA = angTo(e.x + ex, e.y + ey, P.x, P.y);
    c.beginPath(); c.arc(ex + Math.cos(trackA) * 2.2, ey + Math.sin(trackA) * 2.2, 1.8, 0, TAU); c.fill();
  }
};
