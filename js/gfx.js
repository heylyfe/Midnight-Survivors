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
// Black shihakusho, white obi + tabi + waraji, red rosary strap,
// Zangetsu: giant black cleaver with a silver cutting edge.
GFX.drawIchigo = function (c, o, bob, pose) {
  const wp = (o.walkPh || 0);
  const lg = Math.sin(wp * 2) * 3.5;
  const hollow = o.form === 'ichigo';
  feetShadow(c, 15);
  if (hollow) {           // Bankai/Hollow form: taller, planted on the same feet
    c.save();
    c.translate(0, 56);
    c.scale(1.16, 1.16);
    c.translate(0, -56);
  }

  // ---- legs: black hakama, white tabi, waraji sandals
  for (const side of [-1, 1]) {
    const off = side === 1 ? 4 : -5;
    const sw = side === 1 ? lg * 0.35 : -lg * 0.35;
    c.fillStyle = lg2(c, off + sw - 3, 0, off + sw + 4, 56, [[0, '#1c1c26'], [0.7, '#12121a'], [1, '#0c0c12']]);
    c.beginPath();
    c.moveTo(off + sw - 4, 36 + bob);
    c.lineTo(off + sw + 5, 36 + bob);
    c.lineTo(off + sw + 6.5, 51.5);
    c.lineTo(off + sw - 5.5, 51.5);
    c.closePath(); c.fill();
    // white tabi
    c.fillStyle = '#f0ede2';
    c.fillRect(off + sw - 4.5, 51, 9, 3.2);
    // waraji (straw sandal) + lacing
    c.fillStyle = '#c9b28a';
    c.fillRect(off + sw - 5.5, 53.9, 11, 2.2);
    c.strokeStyle = '#8a744e'; c.lineWidth = 0.9;
    c.beginPath(); c.moveTo(off + sw - 2, 51); c.lineTo(off + sw - 2.4, 55.8); c.stroke();
    c.beginPath(); c.moveTo(off + sw + 2, 51); c.lineTo(off + sw + 2.2, 55.8); c.stroke();
  }

  // ---- torso group
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
  // black kosode
  c.fillStyle = lg2(c, -14, 0, 14, 46, [[0, '#24242f'], [0.45, '#17171f'], [1, '#0e0e14']]);
  c.beginPath();
  c.moveTo(-15, 18);
  c.quadraticCurveTo(0, 11.5, 15, 18);
  c.lineTo(12, 38);
  c.quadraticCurveTo(0, 42, -12, 38);
  c.closePath(); c.fill();
  // white shitagi V-collar + visible hem
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
  // red rosary strap across chest
  strokeCurve(c, [[12.5, 17], [2, 26], [-9.5, 31]], '#b8352d', 2.2, 0.95);
  // beads on the strap
  c.fillStyle = '#d86a5a';
  for (let i = 0; i < 4; i++) {
    const tt = 0.2 + i * 0.22;
    const bx = lerp(12.5, -9.5, tt);
    const by = lerp(17.8, 30.6, tt) - 1;
    c.beginPath(); c.arc(bx, by, 1.15, 0, TAU); c.fill();
  }
  // white obi sash + knot
  c.fillStyle = '#f2f3f8';
  c.save();
  c.translate(0, 31.6); c.rotate(-0.05);
  c.fillRect(-12.2, -2.4, 24.4, 4.8);
  c.restore();
  c.fillStyle = '#d6d8e4';
  c.beginPath();
  c.moveTo(8.6, 29.6); c.lineTo(13.2, 31.2); c.lineTo(10.8, 33.2); c.lineTo(12.4, 35.2); c.lineTo(7.8, 34.2);
  c.closePath(); c.fill();
  // robe folds
  folds(c, -9, 21, 9, 3, '#080810', 0.55);
  folds(c, 2, 20, 8, 2, '#080810', 0.35);
  if (hollow) {           // tattered coat hem
    c.fillStyle = '#0c0c12';
    for (let i = 0; i < 5; i++) {
      const tx = -12.5 + i * 6;
      c.beginPath();
      c.moveTo(tx, 39.5);
      c.lineTo(tx + 2.6, 47 + (i % 2) * 3.5);
      c.lineTo(tx + 5.2, 39.5);
      c.closePath(); c.fill();
    }
    // red accent bands on the coat
    c.strokeStyle = 'rgba(170,40,34,0.8)';
    c.lineWidth = 1.1;
    c.beginPath(); c.moveTo(-13.5, 24.5); c.quadraticCurveTo(0, 20.5, 13.5, 24.5); c.stroke();
  }
  // front sleeve + hand
  const armAng = pose > 0 ? -0.95 * pose : 0.12 + Math.sin(wp * 2) * 0.05;
  c.save();
  c.translate(9, 17);
  c.rotate(armAng);
  c.fillStyle = lg2(c, 0, 0, 0, 20, [[0, '#22222e'], [1, '#12121a']]);
  c.beginPath();
  c.moveTo(-1.5, 0);
  c.quadraticCurveTo(6, 2, 8, 9);
  c.lineTo(8.5, 17);
  c.lineTo(3.5, 18);
  c.quadraticCurveTo(1, 10, -3.5, 4);
  c.closePath(); c.fill();
  c.fillStyle = hollow ? '#c22e24' : '#f0f0f6';
  c.fillRect(3.2, 15.6, 5.6, 3.2);
  // hand
  c.fillStyle = '#f2c69e';
  c.beginPath(); c.ellipse(6.4, 20.2, 2.5, 2.8, 0.3, 0, TAU); c.fill();
  c.fillStyle = '#e0b183';
  c.fillRect(4.4, 19.4, 4.4, 1);
  c.restore();
  // neck
  c.fillStyle = '#d8ab84';
  c.fillRect(-2.4, 10, 4.8, 5);
  c.restore();

  // ---- head: strong jaw, scowl
  const hy = 4 + bob * 0.6;
  c.fillStyle = '#f2c69e';
  c.beginPath(); c.ellipse(0, hy, 9.2, 10.2, 0, 0, TAU); c.fill();
  c.fillStyle = '#e2b18a';
  c.beginPath(); c.ellipse(-8.4, hy + 0.6, 1.6, 2.6, 0.2, 0, TAU); c.fill();
  chinShade(c, hy, '#d9a87c');
  c.fillStyle = '#b9865c';
  c.fillRect(4.8, hy + 2.2, 2, 1);
  eyeA(c, 1.4, hy + 0.4, 1.35, '#5a3a22', { browTilt: 0.95, browCol: '#b8621e', lash: '#1a1210' });
  eyeA(c, 5.8, hy + 0.4, 1.35, '#5a3a22', { browTilt: 0.95, browCol: '#b8621e', lash: '#1a1210' });
  c.strokeStyle = '#8a5b42'; c.lineWidth = 0.8;
  c.beginPath(); c.moveTo(2.4, hy + 6.2); c.quadraticCurveTo(4.2, hy + 5.6, 5.8, hy + 6.1); c.stroke();
  if (hollow) {
    // hollow mask: white plate, black sockets, red pupils, teeth
    c.fillStyle = '#f2f2f6';
    c.beginPath();
    c.moveTo(-9.6, hy - 2.4);
    c.quadraticCurveTo(-10.4, hy + 5.5, -5.4, hy + 8.8);
    c.quadraticCurveTo(0, hy + 11.6, 5.6, hy + 8.6);
    c.quadraticCurveTo(10.4, hy + 5.2, 9.6, hy - 2.4);
    c.quadraticCurveTo(0, hy - 6.8, -9.6, hy - 2.4);
    c.closePath(); c.fill();
    c.fillStyle = '#141416';
    c.beginPath(); c.ellipse(1.6, hy + 0.8, 2, 2.4, 0.1, 0, TAU); c.fill();
    c.beginPath(); c.ellipse(6, hy + 0.8, 2, 2.4, 0.1, 0, TAU); c.fill();
    c.fillStyle = '#ff4a3a';
    c.beginPath(); c.arc(1.6, hy + 1, 0.85, 0, TAU); c.fill();
    c.beginPath(); c.arc(6, hy + 1, 0.85, 0, TAU); c.fill();
    c.strokeStyle = 'rgba(200,40,40,0.85)'; c.lineWidth = 1;
    c.beginPath(); c.moveTo(-7, hy + 4.4); c.lineTo(-4.4, hy + 5.6); c.stroke();
    c.beginPath(); c.moveTo(10.8, hy + 4); c.lineTo(8.4, hy + 5.4); c.stroke();
    c.strokeStyle = '#c9c9d2'; c.lineWidth = 0.7;
    for (let i = 0; i < 5; i++) {
      const tx = -2.9 + i * 1.7;
      c.beginPath(); c.moveTo(tx, hy + 8.2); c.lineTo(tx + 0.4, hy + 10.4); c.stroke();
    }
  }
  // ---- hair: shaggy orange mass, jagged fringe, face-framing locks
  hairIchigo(c, hy, hollow, wp);

  // ---- Zangetsu: black cleaver, silver edge, held in the front hand
  c.save();
  c.translate(15.2, 36.5 + bob);
  if (hollow) c.scale(1.22, 1.22);
  const rot = pose > 0 ? (-1.5 - pose * 0.55) : 0.52;
  c.rotate(rot);
  if (pose > 0) {
    c.fillStyle = 'rgba(120,160,255,0.16)';
    c.beginPath(); c.ellipse(4, -26, 10, 26, 0, 0, TAU); c.fill();
  }
  // hilt: silver, wrapped in black diamonds
  c.fillStyle = '#b9bfd0';
  c.fillRect(-2.1, -13.5, 4.2, 14);
  c.strokeStyle = hollow ? '#a8352a' : '#16161e'; c.lineWidth = 1;
  for (let i = 0; i < 5; i++) {
    const y = -12.4 + i * 2.8;
    c.beginPath();
    c.moveTo(-2.1, y); c.lineTo(2.1, y + 2.5);
    c.moveTo(2.1, y); c.lineTo(-2.1, y + 2.5);
    c.stroke();
  }
  // no guard: bare blade notch at hilt top
  c.fillStyle = '#8f95a8';
  c.fillRect(-2.6, -15, 5.2, 2);
  // blade: BLACK with silver cutting edge, concave tip hook
  const bg = lg2(c, -6, 0, 10, 0, [[0, '#191922'], [0.6, '#23232e'], [1, '#101018']]);
  c.fillStyle = bg;
  c.beginPath();
  c.moveTo(-3.6, -15.4);           // edge at hilt
  c.lineTo(-6, -38);               // widening slightly
  c.quadraticCurveTo(-6.6, -52, -1.4, -58);  // concave inward curve to tip
  c.lineTo(4.2, -63);              // tip point
  c.lineTo(8.8, -54);              // top of the spine
  c.lineTo(9.6, -17.5);            // spine down to hilt
  c.closePath(); c.fill();
  // silver cutting edge along the concave path
  strokeCurve(c, [[-3.6, -15.4], [-6, -38], [-1.4, -58], [4.2, -63]], '#e8ecf4', 1.2, 0.95);
  // spine shadow
  strokeCurve(c, [[9.6, -17.5], [8.8, -54]], '#08080e', 1.6, 0.9);
  // sheen streak
  strokeCurve(c, [[3.4, -18], [1.4, -48]], '#3c3c50', 1.4, 0.7);
  c.restore();
  if (hollow) c.restore();
};

// springy shaggy hair: rounded dome, uneven fringe, face-framing locks
function hairIchigo(c, hy, hollow, wp) {
  const sway = Math.sin(wp * 1.6) * 0.8;
  const dk = hollow ? '#b04812' : '#c9551b';
  const mid = hollow ? '#e8721f' : '#f4832e';
  if (hollow) {
    fillCurve(c, [[-10, hy - 2], [-13.4, hy + 7], [-14.6, hy + 19 + sway], [-11.4, hy + 17], [-9.4, hy + 8]], dk);
    fillCurve(c, [[10, hy - 2], [13.8, hy + 6], [15, hy + 18 - sway], [11.6, hy + 16], [9.2, hy + 7]], dk);
  }
  c.fillStyle = dk;
  c.beginPath();
  c.ellipse(-0.5, hy - 3.6, 11.2, 9.4, 0, Math.PI * 0.95, Math.PI * 2.05);
  c.closePath(); c.fill();
  c.fillStyle = mid;
  c.beginPath();
  c.moveTo(-11.2, hy + 1.8);
  const fg = [[-9.5, 6.5], [-6.5, 10.5], [-4, 4.5], [-1.5, 11.5], [1.2, 5], [3.8, 10.5], [6.2, 4], [9, 9.5], [11.2, 4.5]];
  for (let i = 0; i < fg.length; i++) {
    c.lineTo(fg[i][0] + sway * 0.4, hy + 1.8 - fg[i][1]);
    c.lineTo(fg[i][0] + 1.1, hy + 1.8 - fg[i][1] * 0.22);
  }
  c.quadraticCurveTo(4 + sway, hy + 7.5, -11.2, hy + 1.8);
  c.closePath(); c.fill();
  fillCurve(c, [[-10.8, hy - 3], [-12.2, hy + 6], [-10.2, hy + 9.8], [-8.6, hy + 3]], mid);
  fillCurve(c, [[10.6, hy - 3], [12, hy + 5.5], [10, hy + 9.2], [8.6, hy + 2.6]], mid);
  strokeCurve(c, [[-6.5, hy - 6.2], [-2.4, hy - 9.6], [2.2, hy - 9.2], [7.4, hy - 5.6]], '#ffd0a0', 1.3, 0.6);
  strokeCurve(c, [[-2.6, hy - 9.4], [4, hy - 4]], hollow ? '#8a3a12' : '#d4691f', 1.1, 0.6);
}

function chinShade(c, hy, col) {
  c.fillStyle = col;
  c.beginPath(); c.ellipse(0, hy + 9.2, 4.6, 1.5, 0, 0, Math.PI); c.fill();
}

// ---------- RUKIA ----------
// white shihakusho, black bob, snowy Sode no Shirayuki w/ ribbon
GFX.drawRukia = function (c, o, bob, pose) {
  const wp = (o.walkPh || 0);
  const lg = Math.sin(wp * 2) * 3;
  const bk = o.form === 'rukia';
  feetShadow(c, 13);
  if (bk) {               // Bankai: taller silhouette, planted on the same feet
    c.save();
    c.translate(0, 56);
    c.scale(1.12, 1.12);
    c.translate(0, -56);
  }

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
  if (bk) {
    // flowing ice-white kimono skirt over the legs, geometric lattice
    fillCurve(c, [[-11.5, 31.5], [0, 33.5], [11.5, 31.5], [19, 54], [0, 57], [-19, 54]], '#eef4fb');
    c.strokeStyle = 'rgba(150,200,235,0.8)'; c.lineWidth = 0.8;
    for (let i = 0; i < 4; i++) {
      c.beginPath(); c.moveTo(-13 + i * 4.2, 40); c.lineTo(-6.5 + i * 5.2, 53); c.stroke();
      c.beginPath(); c.moveTo(13 - i * 4.2, 40); c.lineTo(6.5 - i * 5.2, 53); c.stroke();
    }
    c.strokeStyle = 'rgba(150,200,235,0.95)'; c.lineWidth = 1.1;
    c.beginPath(); c.moveTo(-18, 51.5); c.quadraticCurveTo(0, 56.5, 18, 51.5); c.stroke();
    // snow crystals drifting off the hem
    if (QUAL.decor) {
      c.fillStyle = 'rgba(220,240,255,0.9)';
      star4(c, -14, 44, 1.4, 0.5);
      star4(c, 13, 46, 1.2, 0.5);
    }
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
  if (bk) {
    c.strokeStyle = '#e2b84a'; c.lineWidth = 1.1;
    c.beginPath(); c.moveTo(-8.8, 18.6); c.lineTo(-6.6, 37.2); c.stroke();
    c.beginPath(); c.moveTo(8.8, 18.6); c.lineTo(6.6, 37.2); c.stroke();
    c.beginPath(); c.moveTo(-3.4, 14.2); c.lineTo(-1.2, 22); c.stroke();
    c.beginPath(); c.moveTo(3.4, 14.2); c.lineTo(1.2, 22); c.stroke();
  }
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
  // ---- Sode no Shirayuki: slender pure-white blade, ring tsuba, long ribbon
  c.save();
  c.translate(5.6, 19);
  c.rotate(pose > 0 ? -0.55 : -1.4);
  const ry = Math.sin(wp * 1.8) * 2;
  const bl = bk ? 26 : 21;
  const hiltCol = bk ? '#d9a53a' : '#f3f4f8';
  const hiltDk = bk ? '#a8761f' : '#d7d9e6';
  strokeCurve(c, [[0, 10], [-3.2, 15 + ry * 0.5], [-1.4, 21 + ry], [2.2, 29 + ry * 1.2]], 'rgba(230,245,252,0.9)', 1.4, 0.9);
  strokeCurve(c, [[0.4, 10], [2.8, 14 + ry * 0.4], [1.8, 20 + ry * 0.8], [4.6, 25 + ry]], 'rgba(210,240,250,0.75)', 1, 0.8);
  c.fillStyle = hiltCol;
  c.fillRect(-1.6, -2.5, 3.2, 12.8);
  c.strokeStyle = hiltDk; c.lineWidth = 0.9;
  for (let i = 0; i < 5; i++) {
    const y = -1.6 + i * 2.5;
    c.beginPath(); c.moveTo(-1.6, y); c.lineTo(1.6, y + 2.2); c.moveTo(1.6, y); c.lineTo(-1.6, y + 2.2); c.stroke();
  }
  c.fillStyle = hiltDk;
  c.beginPath(); c.ellipse(0, 10.6, 2, 1.2, 0, 0, TAU); c.fill();
  c.strokeStyle = bk ? '#f0d488' : '#cdd0e0';
  c.lineWidth = 1.6;
  c.beginPath(); c.arc(0, -3.4, 3.6, 0, TAU); c.stroke();
  c.strokeStyle = 'rgba(255,255,255,0.75)'; c.lineWidth = 0.6;
  c.beginPath(); c.arc(0, -3.4, 3.6, 0, TAU); c.stroke();
  const bg = lg2(c, -3, 0, 6, 0, [[0, '#e4f0fc'], [0.55, '#f9fbff'], [1, '#d5e6f5']]);
  c.fillStyle = bg;
  c.beginPath();
  c.moveTo(-2, -6.6);
  c.lineTo(2.4, -7);
  c.lineTo(2.9, -6.6 - bl * 0.72);
  c.quadraticCurveTo(2.4, -6.6 - bl, 0.6, -6.6 - bl);
  c.lineTo(-2.3, -8.6);
  c.closePath(); c.fill();
  strokeCurve(c, [[-2, -7.2], [-2.1, -8.4], [0.55, -6.6 - bl]], '#ffffff', 1, 0.95);
  strokeCurve(c, [[2.3, -9], [2.2, -6.6 - bl * 0.7]], '#bfe0f5', 0.8, 0.85);
  if (QUAL.decor) {
    c.fillStyle = 'rgba(180,230,255,0.9)';
    star4(c, 2.4, -6.6 - bl * 0.4, 1.5, 0.5);
    star4(c, -1.2, -6.6 - bl * 0.68, 1.1, 0.5);
    star4(c, 1.8, -12, 0.9, 0.45);
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
  eyeA(c, 1.6, hy + 0.6, 1.35, '#6a55c8', { browTilt: 0.05, browCol: '#1c1c28' });
  eyeA(c, 5.2, hy + 0.6, 1.35, '#6a55c8', { browTilt: 0.05, browCol: '#1c1c28' });
  c.strokeStyle = '#a97b5b'; c.lineWidth = 0.7;
  c.beginPath(); c.moveTo(2.2, hy + 6.4); c.quadraticCurveTo(3.6, hy + 6.8, 5, hy + 6.3); c.stroke();
  // ---- hair: short black bob w/ straight hime fringe (long white in Bankai)
  hairRukia(c, hy, bk, wp);
  if (bk) c.restore();
};

// Rukia hair: neat bob, straight bangs, face-framing locks; Bankai = long white
function hairRukia(c, hy, bk, wp) {
  const sway = Math.sin(wp * 1.5) * 1.1;
  const base = bk ? '#e8edf5' : '#17171f';
  const lit = bk ? '#f4f7fc' : '#17171f';
  if (bk) {
    fillCurve(c, [[-9.4, hy - 4], [-13, hy + 4], [-14.6, hy + 16 + sway], [-12, hy + 30], [-9.2, hy + 27], [-9.4, hy + 12], [-7.8, hy + 2]], '#eef2f8');
    fillCurve(c, [[9.4, hy - 4], [13.4, hy + 3], [15, hy + 14 - sway], [12.4, hy + 29], [9.4, hy + 26], [9.6, hy + 11], [8, hy + 2]], '#e4eaf2');
    strokeCurve(c, [[-10.8, hy + 8], [-12.2, hy + 18], [-11, hy + 27]], '#c9cfe0', 0.9, 0.75);
    strokeCurve(c, [[11, hy + 7], [12.6, hy + 17], [11, hy + 26]], '#c9cfe0', 0.9, 0.75);
  }
  c.fillStyle = base;
  c.beginPath();
  c.ellipse(-0.2, hy - 3, 10.2, 9.6, 0, Math.PI * 0.96, Math.PI * 2.04);
  c.closePath(); c.fill();
  c.fillStyle = lit;
  c.beginPath();
  c.moveTo(-9.9, hy + 0.4);
  c.lineTo(-9.9, hy - 8.6);
  c.quadraticCurveTo(0, hy - 12.2, 9.7, hy - 8.6);
  c.lineTo(9.7, hy + 0.8);
  c.lineTo(7.6, hy - 1.6); c.lineTo(5.8, hy + 2); c.lineTo(3.4, hy - 2);
  c.lineTo(1.2, hy + 2.1); c.lineTo(-1.4, hy - 1.9); c.lineTo(-3.6, hy + 1.9);
  c.lineTo(-6, hy - 1.7); c.lineTo(-8.2, hy + 1.6);
  c.closePath(); c.fill();
  fillCurve(c, [[-9.9, hy - 1], [-10.8, hy + 5.5], [-9.4, hy + 10.4], [-7.8, hy + 4.5]], base);
  fillCurve(c, [[9.7, hy - 1], [10.6, hy + 5.5], [9.2, hy + 10.6], [7.6, hy + 4.5]], base);
  strokeCurve(c, [[-5.8, hy - 8.4], [-1.6, hy - 10.6], [3, hy - 9.9]], bk ? '#ffffff' : '#5a5a74', 1.2, 0.8);
}

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
// green eyes, red earrings, white robe w/ gold borders, striped shirt,
// brown boots; staff: dark wood, gold crescent, red jewel
GFX.drawFrieren = function (c, o, bob, pose) {
  const wp = (o.walkPh || 0);
  const tw = Math.sin(wp * 1.2) * 3;
  feetShadow(c, 13);

  // ---- legs: black tights + brown boots
  for (const side of [-1, 1]) {
    const off = side === 1 ? 3.4 : -4.4;
    const sw = side === 1 ? tw * 0.25 : -tw * 0.25;
    c.fillStyle = '#16161e';
    c.fillRect(off + sw - 3.2, 40 + bob * 0.2, 6.6, 11);
    c.fillStyle = lg2(c, off - 3, 0, off + 4, 56, [[0, '#7a563a'], [1, '#5c3f28']]);
    c.beginPath();
    c.moveTo(off + sw - 3.8, 48.6); c.lineTo(off + sw + 4, 48.6);
    c.lineTo(off + sw + 4.8, 55.2); c.lineTo(off + sw - 4.6, 55.2);
    c.closePath(); c.fill();
    c.fillStyle = '#4a3320';
    c.fillRect(off + sw - 4.4, 54.4, 9.2, 1.4);
  }

  // ---- torso group
  c.save();
  c.translate(0, bob);
  // skirt
  c.fillStyle = lg2(c, -11, 0, 11, 42, [[0, '#fdfdfa'], [0.7, '#f1f0ea'], [1, '#e2e1d8']]);
  c.beginPath();
  c.moveTo(-10.4, 22);
  c.quadraticCurveTo(0, 17.6, 10.4, 22);
  c.lineTo(12.4, 40);
  c.quadraticCurveTo(0, 44, -12.4, 40);
  c.closePath(); c.fill();
  // gold hem border
  c.fillStyle = '#e8c56a';
  c.beginPath();
  c.moveTo(-12.2, 36.6); c.quadraticCurveTo(0, 40.6, 12.2, 36.6);
  c.lineTo(12.4, 39.4); c.quadraticCurveTo(0, 43.4, -12.4, 39.4);
  c.closePath(); c.fill();
  // side split
  c.strokeStyle = '#c9c8bc'; c.lineWidth = 1;
  c.beginPath(); c.moveTo(3.4, 26); c.lineTo(6.2, 41.4); c.stroke();
  // white jacket w/ gold borders
  c.fillStyle = lg2(c, -9, 0, 9, 26, [[0, '#fdfdfa'], [1, '#e8e8e0']]);
  c.beginPath();
  c.moveTo(-9.4, 13.6);
  c.quadraticCurveTo(0, 10.6, 9.4, 13.6);
  c.lineTo(8, 24.4);
  c.lineTo(-8.4, 24.4);
  c.closePath(); c.fill();
  strokeCurve(c, [[-9, 15], [0, 12.6], [9, 15]], '#e8c56a', 1.1, 0.95);
  strokeCurve(c, [[-8.4, 22.6], [-8.8, 16.4]], '#e8c56a', 1, 0.9);
  strokeCurve(c, [[8.4, 22.6], [8.8, 16.4]], '#e8c56a', 1, 0.9);
  // black-and-white striped shirt chest stripe
  for (let i = 0; i < 4; i++) {
    c.fillStyle = i % 2 ? '#ffffff' : '#1a1a20';
    c.fillRect(-3.6 + i * 1.8, 14.6, 1.8, 5.4);
  }
  strokeCurve(c, [[-3.6, 14.6], [3.6, 14.6]], '#1a1a20', 0.8, 0.6);
  c.strokeStyle = '#1a1a20'; c.lineWidth = 0.8;
  c.beginPath(); c.moveTo(-3.6, 14.6); c.lineTo(3.6, 14.6); c.stroke();
  // gold buttons
  c.fillStyle = '#e8c56a';
  c.beginPath(); c.arc(4.6, 21.4, 1, 0, TAU); c.fill();
  c.beginPath(); c.arc(4.2, 23.4, 1, 0, TAU); c.fill();
  // arm holding staff
  const armAng = pose > 0 ? -0.85 * pose : 0.06;
  c.save();
  c.translate(6.4, 15);
  c.rotate(armAng);
  c.strokeStyle = '#f6f6f0'; c.lineWidth = 4; c.lineCap = 'round';
  c.beginPath(); c.moveTo(-1, 1); c.lineTo(6.2, 9.4); c.stroke();
  c.restore();
  // neck
  c.fillStyle = '#ecd4b8';
  c.fillRect(-2.2, 9.4, 4.4, 4.4);
  c.restore();

  // ---- head
  const hy = 3 + bob * 0.6;
  c.fillStyle = '#f7e8d2';
  c.beginPath(); c.ellipse(0, hy, 8.2, 9.2, 0, 0, TAU); c.fill();
  // elf ears + red earrings
  for (const s of [-1, 1]) {
    c.fillStyle = '#f0dcbe';
    c.beginPath();
    c.moveTo(s * 7, hy - 1);
    c.quadraticCurveTo(s * 11.6, hy - 2.2, s * 12, hy - 5);
    c.quadraticCurveTo(s * 9.6, hy - 2.6, s * 6.4, hy - 4.2);
    c.closePath(); c.fill();
  }
  c.fillStyle = '#d84848';
  c.beginPath(); c.arc(-8.8, hy + 2.2, 0.9, 0, TAU); c.fill();
  c.fillStyle = '#e8c56a';
  c.beginPath(); c.arc(-8.8, hy + 3.8, 0.7, 0, TAU); c.fill();
  chinShade(c, hy, '#e6c8a4');
  // face: green eyes, thick calm brows
  eyeA(c, 1.4, hy + 0.6, 1.5, '#3fae6a', { browTilt: -0.1, lash: '#2a4a34', pupil: '#175a32' });
  eyeA(c, 5.2, hy + 0.6, 1.5, '#3fae6a', { browTilt: -0.1, lash: '#2a4a34', pupil: '#175a32' });
  c.strokeStyle = '#c09468'; c.lineWidth = 0.7;
  c.beginPath(); c.moveTo(2.6, hy + 6.6); c.lineTo(4, hy + 6.6); c.stroke();
  // ---- hair: silver twin-tails
  const sway = Math.sin(wp * 1.1) * 1.6;
  fillCurve(c, [
    [-8.4, hy - 4], [-14.8, hy + 4 + sway * 0.4], [-16, hy + 14], [-13, hy + 24],
    [-10.6, hy + 23], [-12, hy + 13], [-10, hy + 1],
  ], '#f4f2ef');
  fillCurve(c, [
    [8.4, hy - 4], [14.6, hy + 4 + sway * 0.4], [15.6, hy + 14], [12.8, hy + 24],
    [10.4, hy + 23], [11.8, hy + 13], [10, hy + 1],
  ], '#f4f2ef');
  strokeCurve(c, [[-14.6, hy + 8], [-14.2, hy + 16], [-12.6, hy + 21.6]], '#d8d5cf', 1.1, 0.7);
  strokeCurve(c, [[14.4, hy + 8], [14, hy + 16], [12.4, hy + 21.6]], '#d8d5cf', 1.1, 0.7);
  // crown + middle-parted fringe
  c.fillStyle = '#f7f5f2';
  c.beginPath();
  c.ellipse(-0.4, hy - 3, 9.8, 8.6, 0, Math.PI * 0.96, Math.PI * 2.04);
  c.closePath(); c.fill();
  fillCurve(c, [
    [-9.4, hy - 2], [-5, hy - 7.4], [1.6, hy - 8.6], [6.6, hy - 7], [9.4, hy - 2.2],
    [5.4, hy - 3.4], [0.6, hy - 4.6], [-4.6, hy - 3.6],
  ], '#f7f5f2');
  strokeCurve(c, [[-5.4, hy - 6], [-1.4, hy - 8.2], [3.4, hy - 7.8]], '#dcd9d2', 1, 0.8);
  strokeCurve(c, [[1, hy - 9], [2.4, hy - 12], [4.8, hy - 12.4]], '#f4f2ef', 1.1, 0.9);

  // ---- staff: dark wood, gold crescent, RED jewel
  const stx = 13.6;
  c.save();
  c.translate(stx, 0);
  c.strokeStyle = lg2(c, 0, 0, 3, 0, [[0, '#9a5a48'], [1, '#6a3a2c']]);
  c.lineWidth = 2.6; c.lineCap = 'round';
  c.beginPath(); c.moveTo(0, 43); c.lineTo(0.4, -2 + bob); c.stroke();
  // gold rings
  c.fillStyle = '#e8c56a';
  c.fillRect(-2.4, 6, 5, 1.6);
  c.fillRect(-2.4, 22, 5, 1.6);
  // gold crescent head
  c.strokeStyle = '#e0b04a'; c.lineWidth = 2;
  c.beginPath(); c.arc(0.4, -6 + bob, 5.2, Math.PI * 0.6, Math.PI * 1.9); c.stroke();
  c.beginPath(); c.arc(0.4, -6 + bob, 8, Math.PI * 0.72, Math.PI * 1.62); c.stroke();
  // red jewel
  const glow = pose > 0 ? 1 : 0;
  c.fillStyle = rg2(c, 0.4, -6 + bob, 0.4, 0.4, -6 + bob, 8 + glow * 3,
    [[0, 'rgba(255,220,220,0.95)'], [0.35, 'rgba(230,90,106,0.8)'], [0.75, 'rgba(230,90,106,0.35)'], [1, 'rgba(230,90,106,0)']]);
  c.beginPath(); c.arc(0.4, -6 + bob, 8 + glow * 3, 0, TAU); c.fill();
  c.fillStyle = '#e85a6a';
  c.beginPath(); c.arc(0.4, -6 + bob, 2.6, 0, TAU); c.fill();
  c.fillStyle = 'rgba(255,235,235,0.9)';
  c.beginPath(); c.arc(-0.4, -6.9 + bob, 0.9, 0, TAU); c.fill();
  // sparkles
  if (QUAL.decor) {
    for (let i = 0; i < 3; i++) {
      const a = (o.t2 || wp) * 1.5 + i * 2.1;
      c.fillStyle = 'rgba(255,215,190,0.9)';
      star4(c, 0.4 + Math.cos(a) * 6, -6 + bob + Math.sin(a) * 4.6, 1.1, 0.6);
    }
  }
  // fist gripping the shaft
  const gripY = pose > 0 ? 15 : 26;
  c.fillStyle = '#f7e8d2';
  c.beginPath(); c.ellipse(0.2, gripY, 2.4, 2.8, 0.1, 0, TAU); c.fill();
  c.strokeStyle = '#e0c4a0'; c.lineWidth = 0.7;
  c.beginPath(); c.moveTo(-1.6, gripY - 0.8); c.lineTo(2, gripY - 0.8); c.stroke();
  c.beginPath(); c.moveTo(-1.8, gripY + 0.9); c.lineTo(1.8, gripY + 0.9); c.stroke();
  c.restore();
};

// ---------- KAIDO ----------
// Two white horns, shaggy black mane, long Fu-Manchu mustache + spiked goatee,
// blue-purple feathered overcoat on shoulders, lavender open shirt,
// rope belt w/ hanging streamers, red scale tattoo on the front arm, kanabo.
GFX.drawKaido = function (c, o, bob, pose) {
  const wp = (o.walkPh || 0);
  const lg = Math.sin(wp * 2) * 2.6;
  feetShadow(c, 20);
  c.save();
  c.translate(0, bob * 0.5);

  // ---- legs: baggy gray-green trousers + black boots
  for (const side of [-1, 1]) {
    const off = side === 1 ? 5 : -6;
    const sw = side === 1 ? lg * 0.3 : -lg * 0.3;
    c.fillStyle = lg2(c, off - 5, 0, off + 5, 56, [[0, '#5c5c48'], [0.7, '#47473a'], [1, '#3a3a2e']]);
    c.beginPath();
    c.moveTo(off + sw - 6, 38);
    c.lineTo(off + sw + 6.4, 38);
    c.lineTo(off + sw + 7.4, 50.6);
    c.lineTo(off + sw - 7, 50.6);
    c.closePath(); c.fill();
    c.fillStyle = '#14141a';
    c.fillRect(off + sw - 6.6, 50.2, 13.6, 4);
    c.fillStyle = '#0a0a10';
    c.fillRect(off + sw - 7, 53.8, 14.4, 1.8);
  }
  c.restore();

  // ---- torso group
  c.save();
  c.translate(0, bob);
  // lavender open shirt (chest, deep V)
  c.fillStyle = lg2(c, 0, 12, 0, 40, [[0, '#d3c6f2'], [1, '#b8a8e0']]);
  c.beginPath();
  c.moveTo(-12.4, 14.6); c.lineTo(-3.2, 44); c.lineTo(4.2, 44); c.lineTo(12.4, 14.6);
  c.lineTo(6.4, 12.6); c.lineTo(2, 30); c.lineTo(-2, 30); c.lineTo(-6.6, 12.6);
  c.closePath(); c.fill();
  // blue-purple feathered overcoat draped on shoulders
  c.fillStyle = lg2(c, -18, 0, 18, 40, [[0, '#464a8e'], [0.55, '#373b74'], [1, '#2c2f5c']]);
  c.beginPath();
  c.moveTo(-19, 14.6);
  c.quadraticCurveTo(0, 7.2, 19, 14.6);
  c.lineTo(15, 21);
  c.quadraticCurveTo(4.6, 13.4, -4.6, 21.4);
  c.quadraticCurveTo(-13.6, 26.4, -16.4, 22.4);
  c.closePath(); c.fill();
  // feather fringe along the coat edge
  c.strokeStyle = '#5a60a8'; c.lineWidth = 1.1;
  for (let i = 0; i < 9; i++) {
    const tt = i / 8;
    const fx = lerp(-17.6, 17.8, tt);
    const fy = 15.2 - Math.sin(tt * Math.PI) * 6.2 + (i % 2);
    c.beginPath(); c.moveTo(fx, fy); c.lineTo(fx - 1.4, fy + 4 + (i % 3)); c.stroke();
  }
  strokeCurve(c, [[-16.4, 22.4], [-4.6, 21.4], [15, 21]], '#262a52', 1.4, 0.9);
  // rope belt (shimenawa) + hanging streamers
  c.strokeStyle = '#e5dcc4'; c.lineWidth = 4; c.lineCap = 'round';
  c.beginPath(); c.moveTo(-14.6, 29); c.quadraticCurveTo(0, 31.4, 14.6, 28.4); c.stroke();
  c.strokeStyle = '#c9bd9e'; c.lineWidth = 1.2;
  c.beginPath(); c.moveTo(-14.6, 28.4); c.quadraticCurveTo(0, 30.8, 14.6, 27.8); c.stroke();
  // shide (zigzag paper) + red ribbon
  for (const sx of [-9.6, 9.4]) {
    c.fillStyle = '#f0ead8';
    c.beginPath();
    c.moveTo(sx - 1.4, 30.6); c.lineTo(sx + 1.4, 30.6);
    c.lineTo(sx + 0.6, 33); c.lineTo(sx + 1.8, 35.4); c.lineTo(sx - 1.6, 34.6);
    c.lineTo(sx - 0.4, 32.6);
    c.closePath(); c.fill();
  }
  c.fillStyle = '#b8352d';
  c.beginPath();
  c.moveTo(3.8, 30.4); c.lineTo(6.4, 30.8); c.lineTo(4.6, 36.4); c.lineTo(2.6, 35.8);
  c.closePath(); c.fill();
  // chest scar (cross, right abdomen)
  c.strokeStyle = '#a87a6a'; c.lineWidth = 1.2;
  c.beginPath(); c.moveTo(-4.6, 33.4); c.lineTo(-1.4, 30.4); c.stroke();
  c.beginPath(); c.moveTo(-1.8, 33.8); c.lineTo(-4.2, 30); c.stroke();
  // far arm
  c.strokeStyle = '#2c2f5c'; c.lineWidth = 8.6; c.lineCap = 'round';
  c.beginPath(); c.moveTo(-13, 17); c.lineTo(-19, 4.6); c.stroke();
  c.strokeStyle = '#e2b184'; c.lineWidth = 7;
  c.beginPath(); c.moveTo(-17, 9.6); c.lineTo(-19.4, 2.6); c.stroke();
  // fist holding the kanabo shaft
  c.fillStyle = '#d3a375';
  c.beginPath(); c.arc(-19.4, 3.4, 3.3, 0, TAU); c.fill();
  c.strokeStyle = '#b9855a'; c.lineWidth = 0.8;
  c.beginPath(); c.moveTo(-21.4, 2.2); c.lineTo(-18.2, 2.2); c.stroke();
  // near arm w/ red scale tattoo + orange borders, ends in skull mark at wrist
  const armAng = pose > 0 ? -1.05 * pose : -0.12;
  c.save();
  c.translate(11, 16);
  c.rotate(armAng);
  c.strokeStyle = '#d3a375'; c.lineWidth = 8.4; c.lineCap = 'round';
  c.beginPath(); c.moveTo(0, 0); c.lineTo(12.4, 10.6); c.stroke();
  // tattoo: dull-red scales w/ orange borders
  c.strokeStyle = '#c96a2e'; c.lineWidth = 1.5;
  c.beginPath(); c.moveTo(1.4, 1.2); c.quadraticCurveTo(7.4, 5.4, 11.6, 10.4); c.stroke();
  c.fillStyle = 'rgba(160,52,44,0.9)';
  for (let i = 0; i < 4; i++) {
    const tt = 0.18 + i * 0.2;
    const sx = lerp(1.6, 11.8, tt), sy = lerp(1.6, 10.8, tt);
    c.beginPath(); c.ellipse(sx, sy + (i % 2) * 1.1, 1.5, 1.1, 0.42, 0, TAU); c.fill();
    c.strokeStyle = '#e0803a'; c.lineWidth = 0.7;
    c.beginPath(); c.ellipse(sx, sy + (i % 2) * 1.1, 1.5, 1.1, 0.42, 0, TAU); c.stroke();
  }
  // skull at forearm
  c.fillStyle = '#f0ead8';
  c.beginPath(); c.arc(11.4, 10.8, 1.9, 0, TAU); c.fill();
  c.fillStyle = '#2a2a34';
  c.fillRect(10.6, 10.2, 1, 1); c.fillRect(12.3, 10.2, 1, 1);
  // fist
  c.fillStyle = '#d3a375';
  c.beginPath(); c.arc(14.4, 12.2, 3, 0, TAU); c.fill();
  c.restore();
  // neck (thick)
  c.fillStyle = '#d3a375';
  c.fillRect(-4.4, 7.4, 8.8, 6);
  c.restore();

  // ---- long black mane behind + head
  const hy = 1 + bob * 0.7;
  // mane: falls to mid-back on both sides
  fillCurve(c, [
    [-12.6, hy - 6], [-17.4, hy + 6], [-16.4, hy + 18], [-13.4, hy + 17.4],
    [-14.4, hy + 6], [-11, hy - 2],
  ], '#131016');
  fillCurve(c, [
    [12.6, hy - 6], [17, hy + 8], [15.6, hy + 22], [12.8, hy + 21],
    [14, hy + 8], [11, hy - 2],
  ], '#131016');
  // head
  c.fillStyle = '#e2b184';
  c.beginPath(); c.ellipse(0, hy, 11, 12, 0, 0, TAU); c.fill();
  c.fillStyle = '#e2b184';
  c.beginPath();
  c.moveTo(-10.6, hy - 1); c.quadraticCurveTo(-11.4, hy + 9, -4.4, hy + 11.4);
  c.lineTo(4.4, hy + 11.4); c.quadraticCurveTo(11.4, hy + 9, 10.6, hy - 1);
  c.closePath(); c.fill();
  c.fillStyle = '#c98f60';
  c.beginPath(); c.ellipse(0, hy + 11, 7.4, 2.2, 0, 0, Math.PI); c.fill();
  // shaggy crown
  c.fillStyle = '#131016';
  c.beginPath();
  c.moveTo(-13, hy + 3);
  c.quadraticCurveTo(-16, hy - 10 + Math.sin(wp) * 0.8, -3, hy - 12.4);
  c.quadraticCurveTo(9, hy - 13, 14, hy - 6);
  c.quadraticCurveTo(15, hy + 1, 12.4, hy + 3);
  for (let i = 5; i >= -5; i--) {
    const xx = i * 2.3;
    c.lineTo(xx, hy - 9 - Math.abs(i) * 0.8 - ((i * 13) % 3) - 1.6);
    c.lineTo(xx - 1.2, hy - 4.4);
  }
  c.closePath(); c.fill();
  // lock strands down the cheeks
  fillCurve(c, [[-11, hy + 1], [-12.4, hy + 7], [-14, hy + 12], [-12.4, hy + 13], [-10.4, hy + 8], [-9.4, hy + 2]], '#131016');
  fillCurve(c, [[11, hy + 1], [12.2, hy + 8], [11.8, hy + 14], [10, hy + 13.4], [10.4, hy + 7], [9.4, hy + 1]], '#131016');
  // horns: gray-white, sweeping forward then up
  c.fillStyle = lg2(c, 0, -10, 8, -28, [[0, '#e8e2d4'], [1, '#c2bba8']]);
  c.beginPath();
  c.moveTo(5.4, hy - 8.4);
  c.quadraticCurveTo(14, hy - 10.4, 15.6, hy - 15.4);
  c.quadraticCurveTo(17.4, hy - 21.4, 13.4, hy - 23.4);
  c.quadraticCurveTo(12.4, hy - 17, 8.4, hy - 14.4);
  c.quadraticCurveTo(4.4, hy - 11, 4.4, hy - 9);
  c.closePath(); c.fill();
  strokeCurve(c, [[8.4, hy - 11], [14.4, hy - 21.4]], '#f4efe2', 0.9, 0.85);
  c.fillStyle = lg2(c, 0, -10, -8, -28, [[0, '#d8d2c4'], [1, '#b2ab98']]);
  c.beginPath();
  c.moveTo(-5.6, hy - 8.4);
  c.quadraticCurveTo(-14.4, hy - 10.4, -16, hy - 15.8);
  c.quadraticCurveTo(-17.6, hy - 21.4, -13.6, hy - 23.4);
  c.quadraticCurveTo(-12.6, hy - 17, -8.6, hy - 14.4);
  c.quadraticCurveTo(-4.4, hy - 11, -4.4, hy - 9);
  c.closePath(); c.fill();
  strokeCurve(c, [[-8.4, hy - 11], [-14.4, hy - 21.4]], '#eee8da', 0.9, 0.8);
  // Fu-Manchu mustache: two long drooping strands
  c.fillStyle = '#131016';
  fillCurve(c, [
    [0.4, hy + 5.6], [3.4, hy + 6.4], [7.4, hy + 8.4], [10.4, hy + 13.4], [9.2, hy + 14.4],
    [6.2, hy + 10], [2.4, hy + 8],
  ], '#131016');
  fillCurve(c, [
    [-3.6, hy + 5.6], [-6.6, hy + 6.8], [-9.4, hy + 9.4], [-11.4, hy + 14], [-10.2, hy + 15],
    [-7.4, hy + 10.6], [-3.4, hy + 8],
  ], '#131016');
  // spiked goatee
  c.beginPath();
  c.moveTo(-1.6, hy + 9.4); c.lineTo(0.4, hy + 15.4); c.lineTo(1, hy + 10.6);
  c.lineTo(2.6, hy + 15.8); c.lineTo(3.2, hy + 9.8);
  c.closePath(); c.fill();
  // fierce yellow eyes, heavy brow
  eyeA(c, 2.2, hy + 0.8, 1.3, '#d8b02a', { browTilt: 1.15, browCol: '#131016', lash: '#131016', pupil: '#241708', hMul: 0.85 });
  eyeA(c, 6.4, hy + 0.8, 1.3, '#d8b02a', { browTilt: 1.15, browCol: '#131016', lash: '#131016', pupil: '#241708', hMul: 0.85 });
  // brow ridge
  strokeCurve(c, [[0.4, hy - 2.6], [9, hy - 1.8]], '#1c1418', 1.6, 0.8);
  // frown
  c.strokeStyle = '#8a5b42'; c.lineWidth = 0.9;
  c.beginPath(); c.moveTo(3.2, hy + 8.8); c.quadraticCurveTo(4.6, hy + 8.4, 6, hy + 8.9); c.stroke();

  // ---- kanabo in far hand
  c.save();
  c.translate(-19.4, 3.2 + bob);
  c.rotate(pose > 0 ? 0.5 + pose * 1.5 : -0.38);
  GFX.kanabo(c, 0, 0, pose);
  c.restore();
  c.globalAlpha = 1;
};

// spiked club: dark iron head, gold band, studs + spikes, red grip
GFX.kanabo = function (c, x, y, pose) {
  c.save();
  c.translate(x, y);
  c.fillStyle = lg2(c, -5, 0, 5, 0, [[0, '#4a4050'], [0.5, '#2c2634'], [1, '#211c28']]);
  c.beginPath();
  c.moveTo(-4.4, 0); c.lineTo(-3.2, -34); c.lineTo(3.2, -34); c.lineTo(4.4, 0);
  c.closePath(); c.fill();
  c.fillStyle = lg2(c, -6, 0, 6, 0, [[0, '#5a5164'], [0.45, '#3a3344'], [1, '#241f30']]);
  c.beginPath();
  c.moveTo(-4.4, -33);
  c.lineTo(-6.4, -62);
  c.quadraticCurveTo(0, -68.4, 6.4, -62);
  c.lineTo(4.4, -33);
  c.closePath(); c.fill();
  c.fillStyle = '#b09a54';
  c.fillRect(-4.8, -35.4, 9.6, 2.6);
  c.fillStyle = '#d8d2b0';
  for (let i = 0; i < 4; i++) {
    const yy = -38 - i * 7.4;
    const spread = 5 + i * 0.32;
    c.beginPath();
    c.moveTo(-spread, yy); c.lineTo(-spread - 3.4, yy - 1.4); c.lineTo(-spread, yy - 2.8);
    c.closePath(); c.fill();
    c.beginPath();
    c.moveTo(spread, yy); c.lineTo(spread + 3.4, yy - 1.4); c.lineTo(spread, yy - 2.8);
    c.closePath(); c.fill();
  }
  c.fillStyle = '#cfc9a8';
  for (let row = 0; row < 4; row++) {
    const yy = -39 - row * 7;
    const spread = 4.4 + row * 0.4;
    c.beginPath(); c.arc(-spread * 0.52, yy - 1.4, 1.5, 0, TAU); c.fill();
    c.beginPath(); c.arc(spread * 0.52, yy - 1.4, 1.5, 0, TAU); c.fill();
  }
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

  // ---- legs
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
  c.fillStyle = '#12121a';
  c.beginPath();
  c.moveTo(-7.4, 16);
  c.quadraticCurveTo(-15.4, 18, -18, 28);
  c.quadraticCurveTo(-19, 35, -15, 36);
  c.lineTo(-10.4, 29);
  c.closePath(); c.fill();
  c.fillStyle = lg2(c, -15, 0, 15, 47, [[0, '#23232f'], [0.5, '#181822'], [1, '#0f0f16']]);
  c.beginPath();
  c.moveTo(-15, 14);
  c.quadraticCurveTo(0, 8, 15, 14);
  c.lineTo(13, 46);
  c.quadraticCurveTo(0, 50, -13, 46);
  c.closePath(); c.fill();
  c.strokeStyle = '#0a0a10'; c.lineWidth = 1.2;
  c.beginPath(); c.moveTo(0, 10.4); c.lineTo(1.4, 30); c.lineTo(0.4, 47); c.stroke();
  // purple piping down the uniform
  c.strokeStyle = '#6a4ac8'; c.lineWidth = 1.1;
  c.beginPath(); c.moveTo(-13.2, 17.5); c.quadraticCurveTo(-7.5, 21, -8.8, 41); c.stroke();
  c.beginPath(); c.moveTo(13.2, 17.5); c.quadraticCurveTo(7.5, 21, 8.8, 41); c.stroke();
  strokeCurve(c, [[0.4, 47], [0.2, 49.6]], '#3a3a4c', 1.4, 0.8);
  c.fillStyle = '#4a4a5e';
  c.beginPath(); c.arc(2.6, 22, 0.9, 0, TAU); c.fill();
  c.beginPath(); c.arc(3.2, 33, 0.9, 0, TAU); c.fill();
  c.fillStyle = '#e9eaf2';
  c.beginPath();
  c.moveTo(-2.6, 11.6); c.lineTo(2.6, 11.6); c.lineTo(1.6, 14.4); c.lineTo(-1.6, 14.4);
  c.closePath(); c.fill();
  c.fillStyle = '#262634';
  c.beginPath();
  c.moveTo(-8.4, 15);
  c.quadraticCurveTo(-1.4, 2.2, 8.4, 15);
  c.lineTo(6, 16.6);
  c.quadraticCurveTo(0, 7.2, -6, 16.6);
  c.closePath(); c.fill();
  c.strokeStyle = '#6a4ac8'; c.lineWidth = 1;
  c.beginPath(); c.moveTo(-7.6, 14.5); c.quadraticCurveTo(-1, 4.6, 7.6, 14.5); c.stroke();
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
    eyeA(c, 1.4, hy + 0.4, 1.5, '#6ac8ff', { browTilt: -0.1, lash: '#8a8aa0', pupil: '#1a4a8a', browCol: '#e8ecf4' });
    eyeA(c, 5.6, hy + 0.4, 1.5, '#6ac8ff', { browTilt: -0.1, lash: '#8a8aa0', pupil: '#1a4a8a', browCol: '#e8ecf4' });
    c.fillStyle = 'rgba(120,200,255,0.3)';
    c.beginPath(); c.ellipse(3.4, hy + 0.6, 6.4, 4.6, 0, 0, TAU); c.fill();
    c.strokeStyle = '#b98a63'; c.lineWidth = 0.8;
    c.beginPath(); c.moveTo(2, hy + 6.4); c.quadraticCurveTo(4, hy + 7.4, 6, hy + 6.2); c.stroke();
  } else {
    c.fillStyle = '#26262f';
    c.beginPath();
    c.moveTo(-9.4, hy - 2.4); c.lineTo(10, hy - 2.4); c.lineTo(10.4, hy + 2.8); c.lineTo(-9, hy + 2.8);
    c.closePath(); c.fill();
    strokeCurve(c, [[-9, hy - 2], [-9.4, hy + 2.6]], '#11111a', 0.8, 0.8);
    const fl = Math.sin((o.walkPh || 0) * 1.6) * 2.6;
    fillCurve(c, [
      [-8.8, hy - 2], [-13.4, hy + 1 + fl * 0.4], [-16.4, hy + 8 + fl], [-14.8, hy + 9 + fl],
      [-11.4, hy + 4 + fl * 0.4], [-8, hy + 1],
    ], '#26262f');
    c.fillStyle = '#30303c';
    c.beginPath(); c.arc(-8.6, hy - 0.4, 1.7, 0, TAU); c.fill();
    c.strokeStyle = '#c29570'; c.lineWidth = 0.8;
    c.beginPath(); c.moveTo(2.4, hy + 6.6); c.quadraticCurveTo(4.2, hy + 7.4, 6, hy + 6.4); c.stroke();
  }
  // ---- white updo: tall spikes swept up and back
  const sway = Math.sin(wp * 1.5) * 0.9;
  c.fillStyle = '#d7dae6';
  c.beginPath();
  c.ellipse(-0.4, hy - 3, 11, 9.2, 0, Math.PI * 0.97, Math.PI * 2.03);
  c.closePath(); c.fill();
  c.fillStyle = '#f2f3f8';
  c.beginPath();
  c.moveTo(-11, hy + 1.8);
  const gojoSpikes = [[-8.6, -14], [-6, -20], [-3, -25], [0.5, -27], [3.6, -22], [6.2, -17], [8.8, -11], [11, -5.5]];
  for (let i = 0; i < gojoSpikes.length; i++) {
    c.quadraticCurveTo(gojoSpikes[i][0] + sway * 0.6, hy + gojoSpikes[i][1] * 0.82, gojoSpikes[i][0] + 1.2, hy + gojoSpikes[i][1] * 0.4);
  }
  c.quadraticCurveTo(6 + sway, hy + 7.5, -11, hy + 1.8);
  c.closePath(); c.fill();
  strokeCurve(c, [[-7.2, hy - 4], [-2, hy - 13], [3, hy - 12.5], [8, hy - 2.6]], '#b8bac9', 1.1, 0.7);
  strokeCurve(c, [[-3.4, hy - 21], [0.4, hy - 23], [3.2, hy - 17]], '#ffffff', 1.3, 0.85);
  if (QUAL.decor) {
    c.fillStyle = '#ffffff';
    star4(c, -3.2, hy - 14.4, 1.5, 0.7);
    star4(c, 4.2, hy - 14.4, 1.1, 0.6);
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
