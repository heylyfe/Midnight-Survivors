'use strict';
// ===== gfx.js : detailed vector characters, enemies, bosses =====
// All drawn procedurally with canvas paths; scale ~1px units, player ~64px tall.

const GFX = {};
GFX.char = function (ch, ctx, o) {
  o = o || {};
  const f = o.face || 1;
  const t = o.walkPh || 0;
  const pose = o.atkPose || 0;
  const bob = Math.sin(t * 2) * 2;
  ctx.save();
  ctx.translate(o.x || 0, o.y || 0);
  ctx.scale(f, 1);
  switch (ch) {
    case 'ichigo': GFX.drawIchigo(ctx, o, bob, pose); break;
    case 'rukia': GFX.drawRukia(ctx, o, bob, pose); break;
    case 'frieren': GFX.drawFrieren(ctx, o, bob, pose); break;
    case 'kaido': GFX.drawKaido(ctx, o, bob, pose); break;
    case 'gojo': GFX.drawGojo(ctx, o, bob, pose); break;
  }
  ctx.restore();
};

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

// ---------- ICHIGO ----------
GFX.drawIchigo = function (c, o, bob, pose) {
  const wp = (o.walkPh || 0);
  const lg = Math.sin(wp * 2) * 3.5;
  feetShadow(c, 15);

  // ---- legs: black hakama, slightly flared, w/ fold shading + sandals
  for (const side of [-1, 1]) {
    const off = side === 1 ? 4 : -5;
    const sw = side === 1 ? lg * 0.35 : -lg * 0.35;
    c.fillStyle = lg2(c, off + sw - 3, 0, off + sw + 4, 56, [[0, '#20202e'], [0.7, '#15151f'], [1, '#0e0e16']]);
    c.beginPath();
    c.moveTo(off + sw - 4, 38 + bob);
    c.lineTo(off + sw + 5, 38 + bob);
    c.lineTo(off + sw + 6.5, 52);
    c.lineTo(off + sw - 5.5, 52);
    c.closePath(); c.fill();
    // foot: tabi + sandal
    c.fillStyle = '#e8ddc8';
    c.fillRect(off + sw - 4.5, 51.5, 9, 3.4);
    c.fillStyle = '#6b5a3e';
    c.fillRect(off + sw - 5.5, 54.4, 11, 2);
    c.strokeStyle = '#3a3245'; c.lineWidth = 1;
    c.beginPath(); c.moveTo(off + sw - 1, 51.5); c.lineTo(off + sw - 1, 54.9); c.stroke();
  }

  // ---- torso group (bobs)
  c.save();
  c.translate(0, bob);
  // back sleeve (far arm)
  c.fillStyle = '#101018';
  c.beginPath();
  c.moveTo(-8, 16);
  c.quadraticCurveTo(-17, 18, -19, 30);
  c.quadraticCurveTo(-20, 37, -16, 38);
  c.lineTo(-11, 30);
  c.closePath(); c.fill();
  // shihakusho top
  c.fillStyle = lg2(c, -14, 0, 14, 46, [[0, '#262633'], [0.45, '#191925'], [1, '#101016']]);
  c.beginPath();
  c.moveTo(-15, 18);
  c.quadraticCurveTo(0, 11.5, 15, 18);
  c.lineTo(12, 38);
  c.quadraticCurveTo(0, 42, -12, 38);
  c.closePath(); c.fill();
  // white under-robe V + hem
  c.fillStyle = '#eef0f6';
  c.beginPath();
  c.moveTo(-6.5, 15.5); c.lineTo(0, 27); c.lineTo(6.5, 15.5);
  c.lineTo(4.5, 15); c.lineTo(0, 22.5); c.lineTo(-4.5, 15);
  c.closePath(); c.fill();
  // under-robe hem peeking below
  c.fillStyle = '#dfe2ec';
  c.beginPath();
  c.moveTo(-12.5, 36); c.quadraticCurveTo(0, 40, 12.5, 36);
  c.lineTo(12, 40); c.quadraticCurveTo(0, 44, -12, 40);
  c.closePath(); c.fill();
  // obi (white sash) + knot
  c.fillStyle = '#f2f3f8';
  c.save();
  c.translate(0, 32); c.rotate(-0.05);
  c.fillRect(-12.2, -2.6, 24.4, 5.2);
  c.restore();
  c.fillStyle = '#d6d8e4';
  c.beginPath();
  c.moveTo(9, 29.5); c.lineTo(13.5, 31); c.lineTo(11, 33); c.lineTo(12.5, 35); c.lineTo(8, 34);
  c.closePath(); c.fill();
  // folds on robe
  folds(c, -9, 21, 9, 3, '#0b0b12', 0.5);
  folds(c, 2, 20, 8, 2, '#0b0b12', 0.32);
  // front sleeve + hand
  const armAng = pose > 0 ? -0.95 * pose : 0.12 + Math.sin(wp * 2) * 0.05;
  c.save();
  c.translate(9, 17);
  c.rotate(armAng);
  c.fillStyle = lg2(c, 0, 0, 0, 20, [[0, '#23232f'], [1, '#14141d']]);
  c.beginPath();
  c.moveTo(-1.5, 0);
  c.quadraticCurveTo(6, 2, 8, 9);
  c.lineTo(8.5, 17);
  c.lineTo(3.5, 18);
  c.quadraticCurveTo(1, 10, -3.5, 4);
  c.closePath(); c.fill();
  // white cuff
  c.fillStyle = '#eef0f6';
  c.fillRect(3.2, 15.6, 5.6, 3.4);
  // hand
  c.fillStyle = '#ecc9a2';
  c.beginPath(); c.ellipse(6.6, 20.4, 2.6, 2.9, 0.3, 0, TAU); c.fill();
  // fingers
  c.fillStyle = '#dcb389';
  c.fillRect(4.6, 19.6, 4.6, 1.1);
  c.restore();
  // headdress-free neck
  c.fillStyle = '#d8ab84';
  c.fillRect(-2.4, 10, 4.8, 5);
  c.restore();

  // ---- head (group) : sits above, slight independent bob
  const hy = 4 + bob * 0.6;
  // Ichigo head
  c.fillStyle = '#f2c69e';
  c.beginPath(); c.ellipse(0, hy, 9.2, 10.2, 0, 0, TAU); c.fill();
  // ear
  c.fillStyle = '#e2b18a';
  c.beginPath(); c.ellipse(-8.4, hy + 0.6, 1.6, 2.6, 0.2, 0, TAU); c.fill();
  chinShade(c, hy, '#d9a87c');
  // face
  c.fillStyle = '#b9865c';
  c.fillRect(4.8, hy + 2.2, 2, 1); // nose hint
  eyeA(c, 1.4, hy + 0.4, 1.35, '#4c3a2a', { browTilt: 0.9 });
  eyeA(c, 5.8, hy + 0.4, 1.35, '#4c3a2a', { browTilt: 0.9 });
  // scowl mouth
  c.strokeStyle = '#8a5b42'; c.lineWidth = 0.8;
  c.beginPath(); c.moveTo(2.4, hy + 6.2); c.quadraticCurveTo(4.2, hy + 5.6, 5.8, hy + 6.1); c.stroke();
  // ---- hair: three layers
  hairSpiky(c, hy, ['#c9551b', '#f4832e', '#ffa14f'], wp);
  // Zangetsu in hand: resting on shoulder (idle) / mid-swing (attack)
  GFX.drawZangetsu(c, bob, pose, o);
};

// Zangetsu: massive cleaver, wrapped hilt, notched edge, held in the front hand
GFX.drawZangetsu = function (c, bob, pose) {
  c.save();
  c.translate(15.2, 36.5 + bob);
  const rot = pose > 0 ? (-1.5 - pose * 0.55) : 0.52;
  c.rotate(rot);
  // edge glow while attacking
  if (pose > 0) {
    c.fillStyle = 'rgba(255,140,60,0.18)';
    c.beginPath(); c.ellipse(4, -26, 10, 26, 0, 0, TAU); c.fill();
  }
  // wrapped hilt (diamond wrap)
  c.fillStyle = '#2c2833';
  c.fillRect(-2.1, -13.5, 4.2, 14);
  c.strokeStyle = '#171420'; c.lineWidth = 0.9;
  for (let i = 0; i < 5; i++) {
    const y = -12.4 + i * 2.8;
    c.beginPath();
    c.moveTo(-2.1, y); c.lineTo(2.1, y + 2.5);
    c.moveTo(2.1, y); c.lineTo(-2.1, y + 2.5);
    c.stroke();
  }
  // tsuba (guard)
  c.fillStyle = '#4a4552';
  c.beginPath(); c.ellipse(0, -13.8, 5.2, 1.7, 0, 0, TAU); c.fill();
  c.fillStyle = '#6a6474';
  c.beginPath(); c.ellipse(0, -14.4, 4.4, 1.1, 0, 0, TAU); c.fill();
  // blade: giant cleaver, spine dark, bright cutting edge
  const g = lg2(c, -4, 0, 10, 0, [[0, '#7c8396'], [0.55, '#aab1c4'], [1, '#e6ebf5']]);
  c.fillStyle = g;
  c.beginPath();
  c.moveTo(-3.2, -14.6);
  c.lineTo(6.8, -16);
  c.lineTo(9.5, -22);
  c.lineTo(10.5, -50);      // back spine (tall)
  c.lineTo(9.2, -55);
  c.lineTo(2.5, -55.5);     // notch ledge
  c.lineTo(0.2, -49.5);     // classic angled notch
  c.lineTo(0.6, -21);
  c.closePath(); c.fill();
  // cutting edge highlight
  strokeCurve(c, [[0.6, -21], [0.2, -49.5], [2.5, -55.5]], '#ffffff', 1.1, 0.85);
  // spine shadow
  strokeCurve(c, [[10.5, -50], [10.4, -24]], '#555c70', 1.4, 0.8);
  // center groove
  strokeCurve(c, [[5.2, -20], [5.6, -48]], '#8b93a8', 1, 0.6);
  c.restore();
};

// spiky layered hair (ichigo / gojo share geometry, different palette + density)
function hairSpiky(c, hy, cols, wp) {
  const sway = Math.sin(wp * 1.6) * 0.8;
  // back volume
  c.fillStyle = cols[0];
  c.beginPath();
  c.ellipse(-0.5, hy - 3.4, 11.6, 9.6, 0, Math.PI * 0.98, Math.PI * 2.06);
  c.closePath(); c.fill();
  // mid spikes
  c.fillStyle = cols[1];
  c.beginPath();
  c.moveTo(-11.4, hy + 1.2);
  for (let i = 0; i < 9; i++) {
    const x = -11.4 + i * 2.85;
    const up = 5 + ((i * 7) % 5);
    c.quadraticCurveTo(x + 0.6, hy + 1.2 - up * 1.25, x + 1.7, hy + 0.6 + (up % 2) * 2.4);
  }
  c.quadraticCurveTo(6 + sway, hy + 6, -11.4, hy + 1.2);
  c.closePath(); c.fill();
  // front strands, lighter
  c.fillStyle = cols[2];
  c.beginPath();
  c.moveTo(-9.8, hy + 2.4); c.lineTo(-6.4, hy - 8.2); c.lineTo(-3.6, hy + 3);
  c.lineTo(-6.2, hy + 1.4); c.closePath(); c.fill();
  c.beginPath();
  c.moveTo(4.2, hy + 3.2); c.lineTo(8.2, hy - 6.6 + sway); c.lineTo(10.4, hy + 1.6);
  c.lineTo(7.2, hy + 2.2); c.closePath(); c.fill();
  // shine sweep
  strokeCurve(c, [[-6.5, hy - 5.4], [-2, hy - 8.2], [3, hy - 7.6]], '#ffd0a0', 1.3, 0.5);
}

function chinShade(c, hy, col) {
  c.fillStyle = col;
  c.beginPath(); c.ellipse(0, hy + 9.2, 4.6, 1.5, 0, 0, Math.PI); c.fill();
}

// ---------- RUKIA ----------
GFX.drawRukia = function (c, o, bob, pose) {
  const wp = (o.walkPh || 0);
  const lg = Math.sin(wp * 2) * 3;
  feetShadow(c, 13);

  // ---- legs: white hakama + black boots
  for (const side of [-1, 1]) {
    const off = side === 1 ? 3.6 : -4.6;
    const sw = side === 1 ? lg * 0.3 : -lg * 0.3;
    c.fillStyle = lg2(c, off - 3, 0, off + 4, 54, [[0, '#f7f7fb'], [1, '#d9dae4']]);
    c.beginPath();
    c.moveTo(off + sw - 3.6, 38 + bob);
    c.lineTo(off + sw + 4.6, 38 + bob);
    c.lineTo(off + sw + 5.4, 53);
    c.lineTo(off + sw - 4.4, 53);
    c.closePath(); c.fill();
    c.fillStyle = '#191922';
    c.fillRect(off + sw - 4.2, 52.6, 8.8, 3.6);
    c.fillStyle = '#0e0e14';
    c.fillRect(off + sw - 4.2, 55.4, 8.8, 1.2);
  }

  // ---- torso group
  c.save();
  c.translate(0, bob);
  // far sleeve
  c.fillStyle = '#d9dae4';
  c.beginPath();
  c.moveTo(-7, 16.5);
  c.quadraticCurveTo(-15, 19, -17.4, 29);
  c.quadraticCurveTo(-18.2, 35, -14.6, 36);
  c.lineTo(-10, 29);
  c.closePath(); c.fill();
  // white shihakusho
  c.fillStyle = lg2(c, -12, 0, 12, 44, [[0, '#ffffff'], [0.55, '#eeeef4'], [1, '#dddde8']]);
  c.beginPath();
  c.moveTo(-13, 18);
  c.quadraticCurveTo(0, 12, 13, 18);
  c.lineTo(10.6, 38);
  c.quadraticCurveTo(0, 41.6, -10.6, 38);
  c.closePath(); c.fill();
  // sode (shoulder guards)
  for (const s of [-1, 1]) {
    c.fillStyle = '#f4f4f9';
    c.beginPath();
    c.moveTo(s * 8, 15.4);
    c.quadraticCurveTo(s * 15.4, 16.4, s * 16.6, 22);
    c.quadraticCurveTo(s * 12, 19.8, s * 7, 20.4);
    c.closePath(); c.fill();
    c.strokeStyle = '#b9bcd0'; c.lineWidth = 0.8;
    c.beginPath();
    c.moveTo(s * 9, 16.2); c.quadraticCurveTo(s * 13.6, 17.4, s * 15.4, 21.2);
    c.stroke();
  }
  // black trim lines
  c.strokeStyle = '#23232e'; c.lineWidth = 1.3;
  c.beginPath(); c.moveTo(-8.8, 18.6); c.lineTo(-6.6, 37.2); c.stroke();
  c.beginPath(); c.moveTo(8.8, 18.6); c.lineTo(6.6, 37.2); c.stroke();
  c.beginPath(); c.moveTo(-3.4, 14.2); c.lineTo(-1.2, 22); c.stroke();
  c.beginPath(); c.moveTo(3.4, 14.2); c.lineTo(1.2, 22); c.stroke();
  // obi
  c.fillStyle = '#e3e3ec';
  c.save(); c.translate(0, 31); c.rotate(-0.05);
  c.fillRect(-10.6, -2.4, 21.2, 4.8);
  c.restore();
  // scarf ribbon (animated)
  const swy = Math.sin(wp * 1.4) * 2.4;
  fillCurve(c, [
    [-2, 12.5], [-7, 13.4], [-11, 17 + swy * 0.6], [-12.4, 24 + swy],
    [-10.4, 25.4 + swy], [-8.6, 19.4 + swy * 0.5], [-4.4, 15.8],
  ], 'rgba(190,225,238,0.85)');
  fillCurve(c, [
    [-2, 12.5], [-5, 14.6], [-7, 19 + swy * 0.4], [-6.4, 23.4 + swy * 0.6],
  ], 'rgba(210,238,248,0.55)');
  // snowflake clasp
  c.fillStyle = '#bfe8ff';
  star4(c, -1.4, 12.4, 2, 0.9);
  // forward arm + Sode no Shirayuki
  const armAng = pose > 0 ? -1.0 * pose : 0.1 + Math.sin(wp * 2) * 0.05;
  c.save();
  c.translate(8, 16.6);
  c.rotate(armAng);
  c.fillStyle = lg2(c, 0, 0, 0, 18, [[0, '#ffffff'], [1, '#e2e2ec']]);
  c.beginPath();
  c.moveTo(-1.4, 0);
  c.quadraticCurveTo(5.4, 1.6, 7.4, 8);
  c.lineTo(7.8, 15.4);
  c.lineTo(3, 16.2);
  c.quadraticCurveTo(0.8, 9, -3.2, 3.6);
  c.closePath(); c.fill();
  // hand
  c.fillStyle = '#f5dfc4';
  c.beginPath(); c.ellipse(6, 18.4, 2, 2.3, 0.3, 0, TAU); c.fill();
  // ---- Sode no Shirayuki (white blade w/ ribbon)
  c.save();
  c.translate(5.6, 19);
  c.rotate(pose > 0 ? -0.5 : -1.35);
  // ribbon from pommel (animated)
  const ry = Math.sin(wp * 1.8) * 2;
  strokeCurve(c, [[0, 8], [-2.4, 14 + ry * 0.4], [-1.2, 20 + ry], [1.6, 26 + ry]], 'rgba(230,245,252,0.9)', 1.3, 0.85);
  // hilt
  c.fillStyle = '#f3f4f8';
  c.fillRect(-1.5, -1.5, 3, 8);
  c.fillStyle = '#d7d9e6';
  c.fillRect(-1.5, -1.5, 3, 2.2);
  // guard
  c.fillStyle = '#cdd0e0';
  c.beginPath(); c.ellipse(0, -1.9, 4.4, 1.4, 0, 0, TAU); c.fill();
  // blade
  const bg = lg2(c, -3, 0, 6, 0, [[0, '#eef6ff'], [0.6, '#dbeafc'], [1, '#ffffff']]);
  c.fillStyle = bg;
  c.beginPath();
  c.moveTo(-2.2, -2.6);
  c.lineTo(2.6, -3.4);
  c.lineTo(3, -12);
  c.lineTo(0.2, -16.5);
  c.lineTo(-2.4, -12.5);
  c.closePath(); c.fill();
  strokeCurve(c, [[0.2, -16.5], [0.4, -6]], '#ffffff', 0.9, 0.9);
  // frost sparkles
  if (QUAL.decor) {
    c.fillStyle = 'rgba(180,230,255,0.85)';
    star4(c, 2.2, -9, 1.5, 0.5);
    star4(c, -1, -13, 1.1, 0.5);
  }
  c.restore();
  c.restore();
  // neck
  c.fillStyle = '#e9c9a4';
  c.fillRect(-2.2, 10, 4.4, 4.6);
  c.restore();

  // ---- head
  const hy = 4 + bob * 0.6;
  c.fillStyle = '#f5dfc4';
  c.beginPath(); c.ellipse(0, hy, 8.4, 9.4, 0, 0, TAU); c.fill();
  c.fillStyle = '#e3c3a2';
  c.beginPath(); c.ellipse(-7.6, hy + 0.8, 1.5, 2.4, 0.2, 0, TAU); c.fill();
  chinShade(c, hy, '#e0b892');
  c.fillStyle = '#b98a63';
  c.fillRect(4.4, hy + 2.4, 1.8, 1);
  eyeA(c, 1.6, hy + 0.6, 1.3, '#7a5cc8', { browTilt: 0.15 });
  eyeA(c, 5.2, hy + 0.6, 1.3, '#7a5cc8', { browTilt: 0.15 });
  // calm mouth
  c.strokeStyle = '#a97b5b'; c.lineWidth = 0.7;
  c.beginPath(); c.moveTo(2.2, hy + 6.4); c.quadraticCurveTo(3.6, hy + 6.8, 5, hy + 6.3); c.stroke();
  // ---- hair: sleek black bob w/ shine + front lock
  c.fillStyle = '#17171f';
  c.beginPath();
  c.ellipse(-0.2, hy - 2.8, 10.2, 9.8, 0, Math.PI * 0.98, Math.PI * 2.02);
  c.closePath(); c.fill();
  // bob sides
  fillCurve(c, [
    [-9.8, hy - 2], [-10.6, hy + 3.4], [-8.8, hy + 7.4], [-6.8, hy + 5],
    [-8.2, hy - 0.4],
  ], '#17171f');
  fillCurve(c, [
    [9.6, hy - 2], [10.2, hy + 3.8], [8.2, hy + 7.8], [6.4, hy + 5.2],
    [8, hy - 0.6],
  ], '#17171f');
  // front asymmetric lock
  fillCurve(c, [
    [-6.4, hy - 6.4], [-1.8, hy - 8.8], [0.6, hy - 4], [-3.2, hy - 3],
    [-5.8, hy - 2.4],
  ], '#1d1d27');
  // shine arc
  strokeCurve(c, [[-6, hy - 6.8], [-2, hy - 9.4], [2.6, hy - 9.2]], '#5a5a74', 1.2, 0.75);
};

// 4-point star / sparkle
function star4(c, x, y, r, ir) {
  c.beginPath();
  c.moveTo(x, y - r);
  c.quadraticCurveTo(x + ir * 0.25, y - ir * 0.25, x + r, y);
  c.quadraticCurveTo(x + ir * 0.25, y + ir * 0.25, x, y + r);
  c.quadraticCurveTo(x - ir * 0.25, y + ir * 0.25, x - r, y);
  c.quadraticCurveTo(x - ir * 0.25, y - ir * 0.25, x, y - r);
  c.closePath(); c.fill();
}

// ---------- FRIEREN ----------
GFX.drawFrieren = function (c, o, bob, pose) {
  const wp = (o.walkPh || 0);
  const tw = Math.sin(wp * 1.2) * 3;
  feetShadow(c, 13);

  // ---- legs: dark-green boots + black tights
  for (const side of [-1, 1]) {
    const off = side === 1 ? 3.4 : -4.4;
    const sw = side === 1 ? tw * 0.25 : -tw * 0.25;
    c.fillStyle = '#1a1a22';
    c.fillRect(off + sw - 3.2, 40 + bob * 0.2, 6.6, 11);
    c.fillStyle = lg2(c, off - 3, 0, off + 4, 56, [[0, '#3e5c48'], [1, '#2a3f30']]);
    c.beginPath();
    c.moveTo(off + sw - 3.8, 49); c.lineTo(off + sw + 4, 49);
    c.lineTo(off + sw + 4.8, 55.2); c.lineTo(off + sw - 4.6, 55.2);
    c.closePath(); c.fill();
  }

  // ---- torso group
  c.save();
  c.translate(0, bob);
  // skirt (split hem, striped band)
  c.fillStyle = lg2(c, -11, 0, 11, 42, [[0, '#fdfdfa'], [0.7, '#f1f0ea'], [1, '#e2e1d8']]);
  c.beginPath();
  c.moveTo(-10.4, 22);
  c.quadraticCurveTo(0, 17.6, 10.4, 22);
  c.lineTo(12.4, 40);
  c.quadraticCurveTo(0, 44, -12.4, 40);
  c.closePath(); c.fill();
  // side split + hem stripes
  c.strokeStyle = '#c9c8bc'; c.lineWidth = 1;
  c.beginPath(); c.moveTo(3.4, 26); c.lineTo(6.2, 41.4); c.stroke();
  c.fillStyle = '#3e5c48';
  c.beginPath();
  c.moveTo(-12.2, 36.4); c.quadraticCurveTo(0, 40.4, 12.2, 36.4);
  c.lineTo(12.4, 39.2); c.quadraticCurveTo(0, 43.2, -12.4, 39.2);
  c.closePath(); c.fill();
  // jacket (dark green) w/ pale trim
  c.fillStyle = lg2(c, -9, 0, 9, 26, [[0, '#3b5a46'], [1, '#28402f']]);
  c.beginPath();
  c.moveTo(-9.4, 13.6);
  c.quadraticCurveTo(0, 10.6, 9.4, 13.6);
  c.lineTo(8, 24.4);
  c.lineTo(-8.4, 24.4);
  c.closePath(); c.fill();
  // white collar + gold trim
  c.fillStyle = '#f4f4ef';
  c.beginPath();
  c.moveTo(-3.6, 11.2); c.lineTo(3.6, 11.2); c.lineTo(2.4, 14.6); c.lineTo(-2.4, 14.6);
  c.closePath(); c.fill();
  strokeCurve(c, [[-9, 15], [0, 12.6], [9, 15]], '#e8c56a', 0.9, 0.9);
  // gold buttons
  c.fillStyle = '#e8c56a';
  c.beginPath(); c.arc(2.6, 19, 1, 0, TAU); c.fill();
  c.beginPath(); c.arc(1.4, 22.6, 1, 0, TAU); c.fill();
  // red belt
  c.fillStyle = '#b8352d';
  c.fillRect(-8.6, 23.4, 17.2, 2.4);
  c.fillStyle = '#8f2a21';
  c.fillRect(-8.6, 25.1, 17.2, 0.8);
  // arm holding staff (front), arm bent behind (idle)
  const armAng = pose > 0 ? -0.85 * pose : 0.06;
  c.save();
  c.translate(6.4, 15);
  c.rotate(armAng);
  c.strokeStyle = '#f6f6f0'; c.lineWidth = 4; c.lineCap = 'round';
  c.beginPath(); c.moveTo(-1, 1); c.lineTo(6.2, 9.4); c.stroke();
  c.fillStyle = '#f5e3cc';
  c.beginPath(); c.arc(7, 10.6, 2.2, 0, TAU); c.fill();
  c.restore();
  // neck
  c.fillStyle = '#ecd4b8';
  c.fillRect(-2.2, 9.4, 4.4, 4.4);
  c.restore();

  // ---- head
  const hy = 3 + bob * 0.6;
  c.fillStyle = '#f7e8d2';
  c.beginPath(); c.ellipse(0, hy, 8.2, 9.2, 0, 0, TAU); c.fill();
  // elf ears poking out
  for (const s of [-1, 1]) {
    c.fillStyle = '#f0dcbe';
    c.beginPath();
    c.moveTo(s * 7, hy - 1);
    c.quadraticCurveTo(s * 11.6, hy - 2.2, s * 12, hy - 5);
    c.quadraticCurveTo(s * 9.6, hy - 2.6, s * 6.4, hy - 4.2);
    c.closePath(); c.fill();
  }
  // earrings
  c.fillStyle = '#e8c56a';
  c.beginPath(); c.arc(-8.6, hy + 2.4, 0.8, 0, TAU); c.fill();
  chinShade(c, hy, '#e6c8a4');
  // face: big gold eyes, gentle
  eyeA(c, 1.4, hy + 0.6, 1.5, '#e8c56a', { browTilt: -0.25, lash: '#6a5a3a', pupil: '#6b4f14' });
  eyeA(c, 5.2, hy + 0.6, 1.5, '#e8c56a', { browTilt: -0.25, lash: '#6a5a3a', pupil: '#6b4f14' });
  c.strokeStyle = '#c09468'; c.lineWidth = 0.7;
  c.beginPath(); c.moveTo(2.6, hy + 6.6); c.lineTo(4, hy + 6.6); c.stroke();
  // ---- hair: white, long twin-tails w/ shading
  const sway = Math.sin(wp * 1.1) * 1.6;
  // back tails
  fillCurve(c, [
    [-8.4, hy - 4], [-14.8, hy + 4 + sway * 0.4], [-16, hy + 14], [-13, hy + 24],
    [-10.6, hy + 23], [-12, hy + 13], [-10, hy + 1],
  ], '#f4f2ef');
  fillCurve(c, [
    [8.4, hy - 4], [14.6, hy + 4 + sway * 0.4], [15.6, hy + 14], [12.8, hy + 24],
    [10.4, hy + 23], [11.8, hy + 13], [10, hy + 1],
  ], '#f4f2ef');
  // tail shading
  strokeCurve(c, [[-14.6, hy + 8], [-14.2, hy + 16], [-12.6, hy + 21.6]], '#d8d5cf', 1.1, 0.7);
  strokeCurve(c, [[14.4, hy + 8], [14, hy + 16], [12.4, hy + 21.6]], '#d8d5cf', 1.1, 0.7);
  // crown + fringe
  c.fillStyle = '#f7f5f2';
  c.beginPath();
  c.ellipse(-0.4, hy - 3, 9.8, 8.6, 0, Math.PI * 0.96, Math.PI * 2.04);
  c.closePath(); c.fill();
  fillCurve(c, [
    [-9.4, hy - 2], [-5, hy - 7.4], [1.6, hy - 8.6], [6.6, hy - 7], [9.4, hy - 2.2],
    [5.4, hy - 3.4], [0.6, hy - 4.6], [-4.6, hy - 3.6],
  ], '#f7f5f2');
  strokeCurve(c, [[-5.4, hy - 6], [-1.4, hy - 8.2], [3.4, hy - 7.8]], '#dcd9d2', 1, 0.8);
  // ahoge strand
  strokeCurve(c, [[1, hy - 9], [2.4, hy - 12], [4.8, hy - 12.4]], '#f4f2ef', 1.1, 0.9);

  // ---- staff (ornate: wood, gold rings, crystal, sparkles)
  const stx = 13.6;
  c.save();
  c.translate(stx, 0);
  // shaft
  c.strokeStyle = lg2(c, 0, 0, 3, 0, [[0, '#8a6844'], [1, '#5e4326']]);
  c.lineWidth = 2.6; c.lineCap = 'round';
  c.beginPath(); c.moveTo(0, 43); c.lineTo(0.4, -2 + bob); c.stroke();
  // gold rings
  c.fillStyle = '#e8c56a';
  c.fillRect(-2.4, 6, 5, 1.6);
  c.fillRect(-2.4, 22, 5, 1.6);
  // head hook: gold crescent arms
  c.strokeStyle = '#c9a04a'; c.lineWidth = 1.8;
  c.beginPath(); c.arc(0.4, -6 + bob, 4.6, Math.PI * 0.65, Math.PI * 1.85); c.stroke();
  c.beginPath(); c.arc(0.4, -6 + bob, 7.2, Math.PI * 0.75, Math.PI * 1.55); c.stroke();
  // crystal orb
  const glow = pose > 0 ? 1 : 0;
  c.fillStyle = rg2(c, 0.4, -6 + bob, 0.4, 0.4, -6 + bob, 7 + glow * 3,
    [[0, '#ffffff'], [0.35, '#9fe8ff'], [0.75, 'rgba(120,205,255,0.5)'], [1, 'rgba(120,205,255,0)']]);
  c.beginPath(); c.arc(0.4, -6 + bob, 7 + glow * 3, 0, TAU); c.fill();
  c.fillStyle = '#c8f2ff';
  c.beginPath(); c.arc(0.4, -6 + bob, 2.6, 0, TAU); c.fill();
  // orbiting sparkles
  if (QUAL.decor) {
    for (let i = 0; i < 3; i++) {
      const a = (o.t2 || wp) * 1.5 + i * 2.1;
      c.fillStyle = 'rgba(190,240,255,0.9)';
      star4(c, 0.4 + Math.cos(a) * 5.4, -6 + bob + Math.sin(a) * 4.2, 1.1, 0.6);
    }
  }
  // fist gripping the shaft (over it, so hand wraps the wood)
  const gripY = pose > 0 ? 15 : 26;
  c.fillStyle = '#f5e3cc';
  c.beginPath(); c.ellipse(0.2, gripY, 2.4, 2.8, 0.1, 0, TAU); c.fill();
  c.strokeStyle = '#e0c4a0'; c.lineWidth = 0.7;
  c.beginPath(); c.moveTo(-1.6, gripY - 0.8); c.lineTo(2, gripY - 0.8); c.stroke();
  c.beginPath(); c.moveTo(-1.8, gripY + 0.9); c.lineTo(1.8, gripY + 0.9); c.stroke();
  c.restore();
};

// ---------- KAIDO ----------
GFX.drawKaido = function (c, o, bob, pose) {
  const wp = (o.walkPh || 0);
  const lg = Math.sin(wp * 2) * 2.6;
  feetShadow(c, 20);
  c.save();
  c.translate(0, bob * 0.5);

  // ---- legs (thick) + sandals
  for (const side of [-1, 1]) {
    const off = side === 1 ? 5 : -6;
    const sw = side === 1 ? lg * 0.3 : -lg * 0.3;
    c.fillStyle = lg2(c, off - 5, 0, off + 5, 56, [[0, '#241722'], [1, '#171015']]);
    c.beginPath();
    c.moveTo(off + sw - 5.4, 38);
    c.lineTo(off + sw + 5.8, 38);
    c.lineTo(off + sw + 7, 52.6);
    c.lineTo(off + sw - 6.6, 52.6);
    c.closePath(); c.fill();
    //痘痘 none — keep
    c.fillStyle = '#8a6a48';
    c.fillRect(off + sw - 7, 52.2, 14, 3.4);
    c.fillStyle = '#5e462e';
    c.fillRect(off + sw - 7.4, 55, 15, 1.6);
  }
  c.restore();

  // ---- torso group
  c.save();
  c.translate(0, bob);
  // massive coat w/ scale rows
  c.fillStyle = lg2(c, -18, 0, 18, 48, [[0, '#5c1b22'], [0.5, '#47141b'], [1, '#340e15']]);
  c.beginPath();
  c.moveTo(-19, 15);
  c.quadraticCurveTo(0, 7.4, 19, 15);
  c.lineTo(15.6, 45);
  c.quadraticCurveTo(0, 50, -15.6, 45);
  c.closePath(); c.fill();
  // inner robe
  c.fillStyle = lg2(c, 0, 12, 0, 44, [[0, '#8f1f28'], [1, '#6a1219']]);
  c.beginPath();
  c.moveTo(-5.6, 12.6); c.lineTo(-2.2, 43); c.lineTo(3.2, 43); c.lineTo(6.4, 12.6);
  c.closePath(); c.fill();
  // scale pattern on coat (two arcs per row)
  c.strokeStyle = 'rgba(232,197,106,0.28)'; c.lineWidth = 0.9;
  for (let row = 0; row < 4; row++) {
    const yy = 20 + row * 6.4;
    const half = 15.4 - row * 0.7;
    for (let i = -3; i <= 3; i++) {
      const xx = i * (2 * half / 7);
      c.beginPath(); c.arc(xx + half / 14, yy, 3.4, Math.PI * 0.15, Math.PI * 0.85); c.stroke();
    }
  }
  // coat lapel edges
  strokeCurve(c, [[-17.4, 16], [-14.4, 44]], '#2a0a0e', 1.4, 0.9);
  strokeCurve(c, [[17.4, 16], [14.4, 44]], '#2a0a0e', 1.4, 0.9);
  // gold belt w/ knot
  c.fillStyle = '#e8c56a';
  c.save(); c.translate(0, 28); c.rotate(-0.04);
  c.fillRect(-15.4, -3, 30.8, 6);
  c.restore();
  c.fillStyle = '#c9a04a';
  c.beginPath();
  c.moveTo(-3.4, 25.4); c.lineTo(4.6, 30.6); c.lineTo(0.6, 32.6); c.lineTo(3.4, 35); c.lineTo(-4.6, 31);
  c.closePath(); c.fill();
  // sake gourd on belt
  c.fillStyle = '#7a5a3a';
  c.beginPath(); c.ellipse(11.4, 33.4, 2.6, 3.6, 0.3, 0, TAU); c.fill();
  c.fillStyle = '#5e4326';
  c.fillRect(9.2, 29.2, 4.4, 1.6);
  strokeCurve(c, [[10.4, 32], [12.6, 34.6]], '#987752', 0.9, 0.5);
  // arms: massive; front arm forward on pose
  const armAng = pose > 0 ? -1.05 * pose : -0.12;
  // far arm (grips the kanabo shaft)
  c.strokeStyle = '#3a0f14'; c.lineWidth = 9; c.lineCap = 'round';
  c.beginPath(); c.moveTo(-13, 17); c.lineTo(-19, 4.6); c.stroke();
  // forearm skin
  c.strokeStyle = '#e2b184'; c.lineWidth = 7.4;
  c.beginPath(); c.moveTo(-17.4, 9.4); c.lineTo(-19.6, 2.4); c.stroke();
  // dragon tattoo swirl (far arm)
  c.strokeStyle = 'rgba(140,40,60,0.8)'; c.lineWidth = 1.1;
  c.beginPath(); c.arc(-18.4, 6.4, 2.2, 0.4, 3.2); c.stroke();
  // fist wrapped on the shaft
  c.fillStyle = '#d3a375';
  c.beginPath(); c.arc(-19.4, 3.4, 3.4, 0, TAU); c.fill();
  c.strokeStyle = '#b9855a'; c.lineWidth = 0.8;
  c.beginPath(); c.moveTo(-21.4, 2.2); c.lineTo(-18.2, 2.2); c.stroke();
  // near arm
  c.save();
  c.translate(11, 16);
  c.rotate(armAng);
  c.strokeStyle = '#47141b'; c.lineWidth = 9.4; c.lineCap = 'round';
  c.beginPath(); c.moveTo(0, 0); c.lineTo(8.4, 7.4); c.stroke();
  c.strokeStyle = '#e2b184'; c.lineWidth = 7.6;
  c.beginPath(); c.moveTo(6, 5.4); c.lineTo(12.4, 10.6); c.stroke();
  c.strokeStyle = 'rgba(140,40,60,0.85)'; c.lineWidth = 1.2;
  c.beginPath(); c.arc(9.4, 8.4, 2.4, 0.6, 3.4); c.stroke();
  c.beginPath(); c.arc(10.6, 9.8, 2, 0.9, 3.8); c.stroke();
  // fist
  c.fillStyle = '#d3a375';
  c.beginPath(); c.arc(14, 12, 3.1, 0, TAU); c.fill();
  c.restore();
  // neck (thick)
  c.fillStyle = '#d3a375';
  c.fillRect(-4.4, 7.4, 8.8, 6);
  c.restore();

  // ---- head (big, lantern jaw)
  const hy = 1 + bob * 0.7;
  c.fillStyle = '#e2b184';
  c.beginPath(); c.ellipse(0, hy, 11, 12, 0, 0, TAU); c.fill();
  // jaw widening
  c.fillStyle = '#e2b184';
  c.beginPath();
  c.moveTo(-10.6, hy - 1); c.quadraticCurveTo(-11.4, hy + 9, -4.4, hy + 11.4);
  c.lineTo(4.4, hy + 11.4); c.quadraticCurveTo(11.4, hy + 9, 10.6, hy - 1);
  c.closePath(); c.fill();
  c.fillStyle = '#c98f60';
  c.beginPath(); c.ellipse(0, hy + 11, 7.4, 2.2, 0, 0, Math.PI); c.fill();
  // wild mane
  c.fillStyle = '#131016';
  c.beginPath();
  c.moveTo(-13, hy + 3);
  c.quadraticCurveTo(-16, hy - 10 + Math.sin(wp) * 0.8, -3, hy - 12.4);
  c.quadraticCurveTo(9, hy - 13, 14, hy - 6);
  c.quadraticCurveTo(15, hy + 1, 12.4, hy + 3);
  // spikes
  for (let i = 5; i >= -5; i--) {
    const xx = i * 2.3;
    c.lineTo(xx, hy - 9 - Math.abs(i) * 0.8 - ((i * 13) % 3) - 1.6);
    c.lineTo(xx - 1.2, hy - 4.4);
  }
  c.closePath(); c.fill();
  // horns: right full, left broken stub
  c.fillStyle = '#cfc4ae';
  c.beginPath();
  c.moveTo(6.6, hy - 7.4);
  c.quadraticCurveTo(13, hy - 13.4, 10, hy - 20.4);
  c.quadraticCurveTo(7.2, hy - 13, 4.4, hy - 9);
  c.closePath(); c.fill();
  strokeCurve(c, [[8.4, hy - 9], [10.4, hy - 17]], '#efe8d8', 0.8, 0.7);
  c.fillStyle = '#b8ab92';
  c.beginPath();
  c.moveTo(-6.4, hy - 8.4); c.quadraticCurveTo(-9.4, hy - 11.4, -8.4, hy - 13);
  c.lineTo(-4.4, hy - 9.4);
  c.closePath(); c.fill();
  // mustache + goatee
  c.fillStyle = '#131016';
  c.beginPath();
  c.moveTo(1.2, hy + 6.2); c.quadraticCurveTo(3.4, hy + 5.4, 6.4, hy + 6.6);
  c.lineTo(6.2, hy + 7.8); c.quadraticCurveTo(3.2, hy + 6.9, 1.2, hy + 7.2);
  c.closePath(); c.fill();
  c.beginPath();
  c.moveTo(1.6, hy + 8.4); c.lineTo(3.4, hy + 14); c.lineTo(4.8, hy + 8.6);
  c.closePath(); c.fill();
  // scar across left eye
  c.strokeStyle = '#a84a4a'; c.lineWidth = 1.4;
  c.beginPath(); c.moveTo(1.2, hy - 4.4); c.lineTo(4.2, hy + 4.6); c.stroke();
  // fierce eyes
  eyeA(c, 2.2, hy + 0.8, 1.32, '#c9922a', { browTilt: 1.1, browCol: '#131016', lash: '#131016', pupil: '#241708' });
  eyeA(c, 6.4, hy + 0.8, 1.32, '#c9922a', { browTilt: 1.1, browCol: '#131016', lash: '#131016', pupil: '#241708' });
  c.strokeStyle = '#8a5b42'; c.lineWidth = 0.9;
  c.beginPath(); c.moveTo(3.4, hy + 9.4); c.lineTo(5.4, hy + 9.4); c.stroke();

  // ---- kanabo akimbo in far hand
  c.save();
  c.translate(-19.4, 3.2 + bob);
  c.rotate(pose > 0 ? 0.5 + pose * 1.5 : -0.38);
  GFX.kanabo(c, 0, 0, pose);
  c.restore();
  c.globalAlpha = 1;
};

// spiked club w/ metal head, studs, wrapped grip
GFX.kanabo = function (c, x, y, pose) {
  c.save();
  c.translate(x, y);
  // shaft
  c.fillStyle = lg2(c, -5, 0, 5, 0, [[0, '#4a4050'], [0.5, '#2c2634'], [1, '#211c28']]);
  c.beginPath();
  c.moveTo(-4.4, 0); c.lineTo(-3.2, -34); c.lineTo(3.2, -34); c.lineTo(4.4, 0);
  c.closePath(); c.fill();
  // wider head
  c.fillStyle = lg2(c, -6, 0, 6, 0, [[0, '#5a5164'], [0.45, '#3a3344'], [1, '#241f30']]);
  c.beginPath();
  c.moveTo(-4.4, -33);
  c.lineTo(-6.4, -62);
  c.quadraticCurveTo(0, -68.4, 6.4, -62);
  c.lineTo(4.4, -33);
  c.closePath(); c.fill();
  // band between head and shaft
  c.fillStyle = '#8a8094';
  c.fillRect(-4.8, -35.4, 9.6, 2.6);
  // spikes on head edges
  c.fillStyle = '#d8d2b0';
  for (let i = 0; i < 4; i++) {
    const yy = -38 - i * 7.4;
    const spread = 5 + i * 0.32;
    // left spikes
    c.beginPath();
    c.moveTo(-spread, yy); c.lineTo(-spread - 3.4, yy - 1.4); c.lineTo(-spread, yy - 2.8);
    c.closePath(); c.fill();
    // right spikes
    c.beginPath();
    c.moveTo(spread, yy); c.lineTo(spread + 3.4, yy - 1.4); c.lineTo(spread, yy - 2.8);
    c.closePath(); c.fill();
  }
  // studded rows
  c.fillStyle = '#cfc9a8';
  for (let row = 0; row < 4; row++) {
    const yy = -39 - row * 7;
    const spread = 4.4 + row * 0.4;
    c.beginPath(); c.arc(-spread * 0.52, yy - 1.4, 1.5, 0, TAU); c.fill();
    c.beginPath(); c.arc(spread * 0.52, yy - 1.4, 1.5, 0, TAU); c.fill();
  }
  // red grip wrap w/ diamonds
  c.fillStyle = '#8f1f28';
  c.fillRect(-3.4, -6, 6.8, 6.4);
  c.strokeStyle = '#6a1219'; c.lineWidth = 0.9;
  for (let i = 0; i < 2; i++) {
    const yy = -5.4 + i * 3;
    c.beginPath();
    c.moveTo(-3.4, yy); c.lineTo(3.4, yy + 2.6);
    c.moveTo(3.4, yy); c.lineTo(-3.4, yy + 2.6);
    c.stroke();
  }
  c.restore();
};

// ---------- GOJO ----------
GFX.drawGojo = function (c, o, bob, pose) {
  const wp = (o.walkPh || 0);
  const lg = Math.sin(wp * 2) * 3.6;
  feetShadow(c, 14);

  // ---- legs: dark slacks, taper, side highlight
  for (const side of [-1, 1]) {
    const off = side === 1 ? 4 : -5;
    const sw = side === 1 ? lg * 0.3 : -lg * 0.3;
    c.fillStyle = lg2(c, off - 3, 0, off + 4, 54, [[0, '#22222e'], [0.75, '#16161f'], [1, '#101017']]);
    c.beginPath();
    c.moveTo(off + sw - 3.8, 37 + bob);
    c.lineTo(off + sw + 4.8, 37 + bob);
    c.lineTo(off + sw + 5, 52.6);
    c.lineTo(off + sw - 4, 52.6);
    c.closePath(); c.fill();
    strokeCurve(c, [[off + sw + 2.2, 38 + bob], [off + sw + 2.6, 52]], '#3c3c4e', 0.9, 0.5);
    c.fillStyle = '#0c0c11';
    c.fillRect(off + sw - 4.6, 52.2, 10, 3.8);
  }

  // ---- torso
  c.save();
  c.translate(0, bob);
  // far sleeve
  c.fillStyle = '#12121a';
  c.beginPath();
  c.moveTo(-7.4, 16);
  c.quadraticCurveTo(-15.4, 18, -18, 28);
  c.quadraticCurveTo(-19, 35, -15, 36);
  c.lineTo(-10.4, 29);
  c.closePath(); c.fill();
  // coat body
  c.fillStyle = lg2(c, -15, 0, 15, 47, [[0, '#23232f'], [0.5, '#181822'], [1, '#0f0f16']]);
  c.beginPath();
  c.moveTo(-15, 14);
  c.quadraticCurveTo(0, 8, 15, 14);
  c.lineTo(13, 46);
  c.quadraticCurveTo(0, 50, -13, 46);
  c.closePath(); c.fill();
  // coat split (front center) + zipper line
  c.strokeStyle = '#0a0a10'; c.lineWidth = 1.2;
  c.beginPath(); c.moveTo(0, 10.4); c.lineTo(1.4, 30); c.lineTo(0.4, 47); c.stroke();
  strokeCurve(c, [[0.4, 47], [0.2, 49.6]], '#3a3a4c', 1.4, 0.8);
  // buttons
  c.fillStyle = '#4a4a5e';
  c.beginPath(); c.arc(2.6, 22, 0.9, 0, TAU); c.fill();
  c.beginPath(); c.arc(3.2, 33, 0.9, 0, TAU); c.fill();
  // white undershirt edge at collar
  c.fillStyle = '#e9eaf2';
  c.beginPath();
  c.moveTo(-2.6, 11.6); c.lineTo(2.6, 11.6); c.lineTo(1.6, 14.4); c.lineTo(-1.6, 14.4);
  c.closePath(); c.fill();
  // high collar
  c.fillStyle = '#262634';
  c.beginPath();
  c.moveTo(-8.4, 15);
  c.quadraticCurveTo(-1.4, 2.2, 8.4, 15);
  c.lineTo(6, 16.6);
  c.quadraticCurveTo(0, 7.2, -6, 16.6);
  c.closePath(); c.fill();
  // near arm: hands-in-pocket idle / palm-out attack
  c.save();
  c.translate(10, 15.4);
  c.rotate(pose > 0 ? -0.8 * pose : -0.05);
  c.fillStyle = lg2(c, 0, 0, 0, 20, [[0, '#20202c'], [1, '#12121a']]);
  if (pose > 0) {
    c.beginPath();
    c.moveTo(-1.4, 0);
    c.quadraticCurveTo(6, 1.4, 8.6, 8);
    c.lineTo(8.2, 13.4);
    c.lineTo(3, 14.6);
    c.quadraticCurveTo(0.6, 8, -3.4, 3.4);
    c.closePath(); c.fill();
    // palm out
    c.fillStyle = '#f2d3ae';
    c.beginPath(); c.ellipse(7.4, 15.6, 3.2, 3.6, 0.35, 0, TAU); c.fill();
    c.fillStyle = '#e0b98e';
    c.fillRect(4.4, 14.4, 6.4, 1);
    c.fillRect(4.8, 15.8, 6, 1);
  } else {
    c.beginPath();
    c.moveTo(-1.4, 0);
    c.quadraticCurveTo(5.4, 1.6, 7.2, 8);
    c.quadraticCurveTo(8, 12.4, 5.4, 14.4);
    c.lineTo(1, 13.6);
    c.quadraticCurveTo(1.4, 8, -3.4, 3.4);
    c.closePath(); c.fill();
  }
  c.restore();
  // neck
  c.fillStyle = '#e6c19b';
  c.fillRect(-2.4, 9.4, 4.8, 4.8);
  c.restore();

  // ---- infinity shimmer behind attack hand
  if (pose > 0 && QUAL.decor) {
    for (let i = 0; i < 3; i++) {
      const rr = 9 + i * 4 + Math.sin((o.walkPh || 0)) * 1.2;
      c.strokeStyle = 'rgba(120,180,255,' + (0.26 - i * 0.07) + ')';
      c.lineWidth = 1.2;
      c.beginPath(); c.arc(17, 20 + bob, rr, -0.9, 0.9); c.stroke();
    }
  }

  // ---- head
  const hy = 4 + bob * 0.6;
  c.fillStyle = '#f4d8b8';
  c.beginPath(); c.ellipse(0, hy, 9.2, 10.2, 0, 0, TAU); c.fill();
  c.fillStyle = '#e0bd96';
  c.beginPath(); c.ellipse(-8.4, hy + 0.8, 1.6, 2.6, 0.2, 0, TAU); c.fill();
  chinShade(c, hy, '#dcb28c');
  if (o.eyeMode === 'six') {
    // six eyes: glowing sky blue
    eyeA(c, 1.4, hy + 0.4, 1.5, '#6ac8ff', { browTilt: -0.1, lash: '#8a8aa0', pupil: '#1a4a8a', browCol: '#e8ecf4' });
    eyeA(c, 5.6, hy + 0.4, 1.5, '#6ac8ff', { browTilt: -0.1, lash: '#8a8aa0', pupil: '#1a4a8a', browCol: '#e8ecf4' });
    c.fillStyle = 'rgba(120,200,255,0.3)';
    c.beginPath(); c.ellipse(3.4, hy + 0.6, 6.4, 4.6, 0, 0, TAU); c.fill();
    // smirk
    c.strokeStyle = '#b98a63'; c.lineWidth = 0.8;
    c.beginPath(); c.moveTo(2, hy + 6.4); c.quadraticCurveTo(4, hy + 7.4, 6, hy + 6.2); c.stroke();
  } else {
    // blindfold w/ knot + fluttering tails
    c.fillStyle = '#26262f';
    c.beginPath();
    c.moveTo(-9.4, hy - 2.4); c.lineTo(10, hy - 2.4); c.lineTo(10.4, hy + 2.8); c.lineTo(-9, hy + 2.8);
    c.closePath(); c.fill();
    strokeCurve(c, [[-9, hy - 2], [-9.4, hy + 2.6]], '#11111a', 0.8, 0.8);
    // knot + tails (animated)
    const fl = Math.sin((o.walkPh || 0) * 1.6) * 2.6;
    fillCurve(c, [
      [-8.8, hy - 2], [-13.4, hy + 1 + fl * 0.4], [-16.4, hy + 8 + fl], [-14.8, hy + 9 + fl],
      [-11.4, hy + 4 + fl * 0.4], [-8, hy + 1],
    ], '#26262f');
    c.fillStyle = '#30303c';
    c.beginPath(); c.arc(-8.6, hy - 0.4, 1.7, 0, TAU); c.fill();
    // smirk hint
    c.strokeStyle = '#c29570'; c.lineWidth = 0.8;
    c.beginPath(); c.moveTo(2.4, hy + 6.6); c.quadraticCurveTo(4.2, hy + 7.4, 6, hy + 6.4); c.stroke();
  }
  // ---- hair: the white spikes
  const sway = Math.sin(wp * 1.5) * 0.9;
  c.fillStyle = '#dfe1ea';
  c.beginPath();
  c.ellipse(-0.4, hy - 3.2, 11.2, 9.2, 0, Math.PI * 0.97, Math.PI * 2.03);
  c.closePath(); c.fill();
  c.fillStyle = '#f2f3f8';
  c.beginPath();
  c.moveTo(-11.4, hy + 1.4);
  const spikeXs = [-9.6, -6.4, -3.2, 0, 3.2, 6.4, 9.2, 11.2];
  for (let i = 0; i < spikeXs.length; i++) {
    const x = spikeXs[i];
    const up = 9 + ((i * 11) % 6);
    c.quadraticCurveTo(x + 0.4 + sway, hy + 1 - up * 1.45, x + 1.6, hy + 0.2 + (up % 3) * 1.6);
  }
  c.quadraticCurveTo(6, hy + 7, -11.4, hy + 1.4);
  c.closePath(); c.fill();
  // underside shadow
  strokeCurve(c, [[-7.4, hy - 1.4], [-2, hy - 3.4], [3.4, hy - 3], [8.4, hy - 1.8]], '#c3c5d4', 1.1, 0.8);
  // glints
  if (QUAL.decor) {
    c.fillStyle = '#ffffff';
    star4(c, -3.4, hy - 8.4, 1.5, 0.7);
    star4(c, 4.4, hy - 9.4, 1.1, 0.6);
  }
};


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
  switch (e.type) {
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
      const a = (i / 6) * TAU + t * 0.2;
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
  if (e.flash > 0) {
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
