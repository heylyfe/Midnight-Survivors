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

// ---------- ICHIGO ----------
GFX.drawIchigo = function (c, o, bob, pose) {
  // long mop of orange hair, black shihakusho, big sword on back
  // legs
  c.fillStyle = '#14141f';
  const lg = Math.sin((o.walkPh || 0) * 2) * 4;
  c.fillRect(6, 40, 7, 16 + lg * 0.3);
  c.fillRect(-13 + 0, 40, 7, 16 - lg * 0.3);
  // robe body (wide sleeves)
  c.fillStyle = '#191925';
  c.beginPath();
  c.moveTo(-14, 18 + bob); c.quadraticCurveTo(0, 12 + bob, 14, 18 + bob);
  c.lineTo(11, 44); c.quadraticCurveTo(0, 48, -11, 44);
  c.closePath(); c.fill();
  // white under-robe V
  c.fillStyle = '#e8e8ef';
  c.beginPath();
  c.moveTo(-5, 16 + bob); c.lineTo(0, 26 + bob); c.lineTo(5, 16 + bob);
  c.lineTo(3, 15 + bob); c.lineTo(0, 20 + bob); c.lineTo(-3, 15 + bob);
  c.closePath(); c.fill();
  // left sleeve forward when attacking
  if (pose > 0) {
    c.save();
    c.rotate(-pose * 0.9);
    c.fillStyle = '#191925';
    c.fillRect(-20, 14 + bob, 8, 20);
    c.restore();
  } else {
    c.fillStyle = '#191925';
    c.fillRect(-18, 18 + bob, 8, 18);
    c.fillStyle = '#e8e8ef'; c.fillRect(-18, 34 + bob, 8, 5); // wrist wrap
  }
  // head
  c.fillStyle = '#f4cba5';
  c.beginPath(); c.ellipse(0, 6 + bob, 9, 10, 0, 0, TAU); c.fill();
  // hair: spiky orange mop
  c.fillStyle = '#f4832e';
  c.beginPath();
  c.moveTo(-11, 4 + bob);
  for (let i = 0; i <= 10; i++) {
    const x = -11 + i * 2.2;
    const up = (i % 2 === 0) ? rnd(-3, -1) : -4 - (i % 3);
    c.lineTo(x + 1, 4 + bob + up - 2);
    c.lineTo(x + 2.2, 2 + bob - (i % 2) * 2);
  }
  c.lineTo(11, 6 + bob);
  c.quadraticCurveTo(0, -6 + bob, -11, 4 + bob);
  c.closePath(); c.fill();
  // side bangs
  c.fillStyle = '#f4832e';
  c.beginPath(); c.moveTo(-10, 4 + bob); c.lineTo(-6, -2 + bob); c.lineTo(-4, 8 + bob); c.closePath(); c.fill();
  c.beginPath(); c.moveTo(10, 4 + bob); c.lineTo(6, -1 + bob); c.lineTo(3, 8 + bob); c.closePath(); c.fill();
  // eyes (determined scowl)
  c.fillStyle = '#151520';
  c.fillRect(1, 2 + bob, 3, 3); c.fillRect(6, 2 + bob, 3, 3);
  c.fillRect(0, -1 + bob, 10, 1.6); // brow
  // Zangetsu on back
  GFX.drawZangetsu(c, bob, pose);
};
GFX.drawZangetsu = function (c, bob, pose) {
  c.save();
  c.translate(-22, 16 + bob);
  if (pose > 0) c.rotate(-pose * 1.2);
  c.rotate(0.5);
  // handle
  c.fillStyle = '#3a3540'; c.fillRect(-2, -14, 4, 16);
  // giant blade
  const grd = c.createLinearGradient(0, 0, 0, -44);
  grd.addColorStop(0, '#c9ccd8'); grd.addColorStop(1, '#8f95a8');
  c.fillStyle = grd;
  c.beginPath();
  c.moveTo(-1, 0); c.lineTo(8, -8); c.lineTo(8, -46); c.lineTo(0, -50); c.lineTo(-3, -46); c.lineTo(-3, -4);
  c.closePath(); c.fill();
  c.restore();
};

// ---------- RUKIA ----------
GFX.drawRukia = function (c, o, bob, pose) {
  // short black hair with asymmetric lock, white shihakusho, scarf
  c.fillStyle = '#22222e';
  const lg = Math.sin((o.walkPh || 0) * 2) * 4;
  c.fillRect(5, 40, 6, 16 + lg * 0.3);
  c.fillRect(-11, 40, 6, 16 - lg * 0.3);
  // white robe
  c.fillStyle = '#efeef4';
  c.beginPath();
  c.moveTo(-12, 18 + bob); c.quadraticCurveTo(0, 12 + bob, 12, 18 + bob);
  c.lineTo(9, 44); c.quadraticCurveTo(0, 47, -9, 44);
  c.closePath(); c.fill();
  // black trim
  c.strokeStyle = '#22222e'; c.lineWidth = 2;
  c.beginPath(); c.moveTo(-9.5, 18 + bob); c.lineTo(-7.5, 43); c.stroke();
  c.beginPath(); c.moveTo(9.5, 18 + bob); c.lineTo(7.5, 43); c.stroke();
  // sleeve with Sode no Shirayuki hilt
  c.fillStyle = '#efeef4'; c.fillRect(-17, 18 + bob, 7, 16);
  c.fillStyle = '#e3e1ea';
  if (pose > 0) { c.save(); c.rotate(-pose * 1.0); c.fillStyle = '#dfe6f2'; c.fillRect(8, 12 + bob, 20, 6); c.restore(); }
  // head
  c.fillStyle = '#f7dcbb';
  c.beginPath(); c.ellipse(0, 5 + bob, 8, 9, 0, 0, TAU); c.fill();
  // bob cut
  c.fillStyle = '#1c1c28';
  c.beginPath();
  c.ellipse(0, 2 + bob, 9.5, 9, 0, Math.PI, 0);
  c.lineTo(10, 8 + bob); c.lineTo(7, 6 + bob);
  c.lineTo(-9.5, 8 + bob + 0.5);
  c.closePath(); c.fill();
  // asymmetric fringe lock
  c.beginPath(); c.moveTo(-9, 2 + bob); c.lineTo(-4, -6 + bob); c.lineTo(-1, 4 + bob); c.lineTo(-7, 5 + bob); c.closePath(); c.fill();
  // eyes (violet, calm)
  c.fillStyle = '#7a5cc8';
  c.fillRect(0.5, 2 + bob, 2.6, 3); c.fillRect(4.5, 2 + bob, 2.6, 3);
  c.fillStyle = '#151522';
  c.fillRect(0.5, 4.5 + bob, 2.6, 1.4); c.fillRect(4.5, 4.5 + bob, 2.6, 1.4);
};

// ---------- FRIEREN ----------
GFX.drawFrieren = function (c, o, bob, pose) {
  // long white hair, gold eyes, dark green boots + white skirt, staff
  const tw = Math.sin((o.walkPh || 0) * 1.2) * 3;
  c.fillStyle = '#4a4438';
  c.fillRect(5, 42, 6, 15 + tw * 0.2);
  c.fillRect(-11, 42, 6, 15 - tw * 0.2);
  // skirt
  c.fillStyle = '#f2f1ee';
  c.beginPath();
  c.moveTo(-10, 22 + bob); c.quadraticCurveTo(0, 18 + bob, 10, 22 + bob);
  c.lineTo(12, 40); c.quadraticCurveTo(0, 44, -12, 40);
  c.closePath(); c.fill();
  // torso jacket (dark green)
  c.fillStyle = '#2e4638';
  c.beginPath();
  c.moveTo(-9, 14 + bob); c.quadraticCurveTo(0, 11 + bob, 9, 14 + bob);
  c.lineTo(7, 24 + bob); c.lineTo(-8, 24 + bob);
  c.closePath(); c.fill();
  c.fillStyle = '#e8c56a';
  c.fillRect(-2, 14 + bob, 4, 3); // button
  c.fillStyle = '#b8352d';
  c.fillRect(-3, 22.5 + bob, 6, 2); // belt
  // arms: casting pose
  if (pose > 0) {
    c.strokeStyle = '#f2f1ee'; c.lineWidth = 4;
    c.beginPath(); c.moveTo(-4, 16 + bob); c.lineTo(10, 6 + bob - pose * 8); c.stroke();
  } else {
    c.strokeStyle = '#f2f1ee'; c.lineWidth = 4;
    c.beginPath(); c.moveTo(-4, 16 + bob); c.lineTo(-9, 26 + bob); c.stroke();
  }
  // head
  c.fillStyle = '#f9e9d5';
  c.beginPath(); c.ellipse(0, 4 + bob, 8, 9, 0, 0, TAU); c.fill();
  // long white twin-tails
  c.fillStyle = '#f4f2ef';
  c.beginPath(); c.ellipse(0, 1 + bob, 9.5, 8.5, 0, Math.PI, 0); c.closePath(); c.fill();
  c.beginPath(); c.moveTo(-8, 2 + bob); c.quadraticCurveTo(-16, 14 + bob, -13, 26 + bob); c.quadraticCurveTo(-11, 27 + bob, -9, 26 + bob); c.quadraticCurveTo(-11, 14 + bob, -6, 5 + bob); c.closePath(); c.fill();
  c.beginPath(); c.moveTo(8, 2 + bob); c.quadraticCurveTo(16, 14 + bob, 13, 26 + bob); c.quadraticCurveTo(11, 27 + bob, 9, 26 + bob); c.quadraticCurveTo(11, 14 + bob, 6, 5 + bob); c.closePath(); c.fill();
  // eyes (big gold)
  c.fillStyle = '#e8c56a';
  c.beginPath(); c.ellipse(2, 3 + bob, 1.8, 2.4, 0, 0, TAU); c.ellipse(5.5, 3 + bob, 1.8, 2.4, 0, 0, TAU); c.fill();
  c.fillStyle = '#8f6a20';
  c.beginPath(); c.ellipse(2, 3.6 + bob, 0.8, 1.1, 0, 0, TAU); c.ellipse(5.5, 3.6 + bob, 0.8, 1.1, 0, 0, TAU); c.fill();
  // staff
  c.strokeStyle = '#7a5a3a'; c.lineWidth = 2.5;
  c.beginPath(); c.moveTo(14, 44 + bob); c.lineTo(14, -2 + bob); c.stroke();
  c.fillStyle = '#8fe8ff';
  c.beginPath(); c.arc(14, -4 + bob, 3, 0, TAU); c.fill();
  c.fillStyle = 'rgba(140,230,255,0.35)';
  c.beginPath(); c.arc(14, -4 + bob, 5.5, 0, TAU); c.fill();
};

// ---------- KAIDO ----------
GFX.drawKaido = function (c, o, bob, pose) {
  // huge red-black coat, horns, spiky black hair, kanabo over shoulder
  const lg = Math.sin((o.walkPh || 0) * 2) * 3;
  // legs (thick)
  c.fillStyle = '#20161a';
  c.fillRect(4, 40, 9, 16 + lg * 0.2);
  c.fillRect(-13, 40, 9, 16 - lg * 0.2);
  // massive coat
  c.fillStyle = '#4a1418';
  c.beginPath();
  c.moveTo(-18, 14 + bob); c.quadraticCurveTo(0, 8 + bob, 18, 14 + bob);
  c.lineTo(15, 44); c.quadraticCurveTo(0, 49, -15, 44);
  c.closePath(); c.fill();
  // red inner
  c.fillStyle = '#8f1f28';
  c.beginPath();
  c.moveTo(-6, 12 + bob); c.lineTo(-2, 40); c.lineTo(3, 40); c.lineTo(7, 12 + bob);
  c.closePath(); c.fill();
  // belt
  c.fillStyle = '#e8c56a'; c.fillRect(-14, 26 + bob, 28, 3);
  // arm + kanabo (rests on shoulder)
  c.strokeStyle = '#4a1418'; c.lineWidth = 8; c.lineCap = 'round';
  if (pose > 0) {
    c.beginPath(); c.moveTo(-10, 18 + bob); c.lineTo(-4, 4 + bob); c.stroke();
    // kanabo swinging down
    c.save();
    c.translate(-2, 2 + bob);
    c.rotate(0.6 + pose * 1.6);
    GFX.kanabo(c, 0, 0);
    c.restore();
  } else {
    c.beginPath(); c.moveTo(-10, 18 + bob); c.lineTo(-16, 4 + bob); c.stroke();
    c.save();
    c.translate(-14, 0 + bob);
    c.rotate(-0.5);
    GFX.kanabo(c, 0, 0);
    c.restore();
  }
  // head
  c.fillStyle = '#e8b88a';
  c.beginPath(); c.ellipse(0, 2 + bob, 10, 11, 0, 0, TAU); c.fill();
  // wild black mane
  c.fillStyle = '#16121a';
  c.beginPath();
  c.moveTo(-12, 6 + bob);
  c.quadraticCurveTo(-14, -8 + bob, 0, -10 + bob);
  c.quadraticCurveTo(14, -8 + bob, 12, 4 + bob);
  // spikes
  for (let i = 4; i >= -4; i--) {
    c.lineTo(i * 2.4, -9 + bob - Math.abs(i) * -1 - rnd(0, 3));
  }
  c.closePath(); c.fill();
  // horns
  c.fillStyle = '#c8bdaa';
  c.beginPath(); c.moveTo(-8, -6 + bob); c.quadraticCurveTo(-14, -14 + bob, -10, -18 + bob); c.quadraticCurveTo(-7, -12 + bob, -5, -8 + bob); c.closePath(); c.fill();
  c.beginPath(); c.moveTo(8, -6 + bob); c.quadraticCurveTo(14, -14 + bob, 10, -18 + bob); c.quadraticCurveTo(7, -12 + bob, 5, -8 + bob); c.closePath(); c.fill();
  // face: scar + fierce eye
  c.fillStyle = '#15151c';
  c.fillRect(3, 0 + bob, 4, 3);
  c.strokeStyle = '#a84a4a'; c.lineWidth = 1.5;
  c.beginPath(); c.moveTo(6, -3 + bob); c.lineTo(9, 6 + bob); c.stroke();
};
GFX.kanabo = function (c, x, y) {
  c.save();
  c.translate(x, y);
  // spiked club
  const grd = c.createLinearGradient(0, 0, 0, -60);
  grd.addColorStop(0, '#5a5260'); grd.addColorStop(1, '#2e2a36');
  c.fillStyle = grd;
  c.beginPath();
  c.moveTo(-6, 0); c.lineTo(-5, -58); c.quadraticCurveTo(0, -66, 5, -58); c.lineTo(6, 0);
  c.closePath(); c.fill();
  // studs
  c.fillStyle = '#cfc9a8';
  c.fillStyle = '#d8d2b0';
  for (let i = 0; i < 6; i++) {
    c.beginPath(); c.arc(-5 + (i % 2) * 10, -50 + i * 9, 1.8, 0, TAU); c.fill();
  }
  // grip
  c.strokeStyle = '#8f1f28'; c.lineWidth = 4;
  c.beginPath(); c.moveTo(0, 6); c.lineTo(0, 0); c.stroke();
  c.restore();
};

// ---------- GOJO ----------
GFX.drawGojo = function (c, o, bob, pose) {
  // white spiky hair, blindfold or six eyes, dark high collar
  const lg = Math.sin((o.walkPh || 0) * 2) * 4;
  o = o || {};
  c.fillStyle = '#181820';
  c.fillRect(5, 40, 7, 16 + lg * 0.3);
  c.fillRect(-12, 40, 7, 16 - lg * 0.3);
  // long dark coat
  const g = c.createLinearGradient(-16, 0, 16, 44);
  g.addColorStop(0, '#181822'); g.addColorStop(1, '#101018');
  c.fillStyle = g;
  c.beginPath();
  c.moveTo(-15, 14 + bob); c.quadraticCurveTo(0, 8 + bob, 15, 14 + bob);
  c.lineTo(13, 46); c.quadraticCurveTo(0, 50, -13, 46);
  c.closePath(); c.fill();
  // high collar
  c.fillStyle = '#23232e';
  c.beginPath();
  c.moveTo(-8, 14 + bob); c.quadraticCurveTo(0, 2 + bob, 8, 14 + bob);
  c.lineTo(6, 16 + bob); c.quadraticCurveTo(0, 7 + bob, -6, 16 + bob);
  c.closePath(); c.fill();
  // sleeves
  c.fillStyle = '#181822';
  if (pose > 0) {
    c.save(); c.rotate(-pose * 0.8);
    c.fillRect(6, 12 + bob, 20, 7);
    c.restore();
  }
  c.fillRect(-19, 16 + bob, 7, 20);
  // head
  c.fillStyle = '#f4d8b8';
  c.beginPath(); c.ellipse(0, 4 + bob, 9, 10, 0, 0, TAU); c.fill();
  // white spiky hair
  c.fillStyle = '#f0f0f4';
  c.beginPath();
  c.moveTo(-11, 4 + bob);
  c.quadraticCurveTo(-13, -9 + bob, -2, -12 + bob);
  c.quadraticCurveTo(2, -14 + bob, 4, -12 + bob);
  c.lineTo(5, -9 + bob); c.lineTo(8, -12 + bob); c.lineTo(9, -8 + bob); c.lineTo(12, -9 + bob);
  c.quadraticCurveTo(14, -2 + bob, 11, 3 + bob);
  c.quadraticCurveTo(6, -6 + bob, -11, 4 + bob);
  c.closePath(); c.fill();
  // band area
  if (o.eyeMode === 'six') {
    // revealed Six Eyes
    c.fillStyle = '#6ac8ff';
    c.beginPath(); c.ellipse(2, 3 + bob, 2.6, 3, 0, 0, TAU); c.ellipse(6, 3 + bob, 2.4, 3, 0, 0, TAU); c.fill();
    c.fillStyle = '#fff';
    c.beginPath(); c.arc(2, 3 + bob, 0.9, 0, TAU); c.arc(6, 3 + bob, 0.9, 0, TAU); c.fill();
  } else {
    // blindfold
    c.fillStyle = '#22222c';
    c.beginPath();
    c.moveTo(-9, 1 + bob); c.lineTo(10, 1 + bob); c.lineTo(10, 6 + bob); c.lineTo(-9, 6 + bob);
    c.closePath(); c.fill();
    c.beginPath(); c.moveTo(-9.5, 1 + bob); c.lineTo(-13, 8 + bob); c.lineTo(-9.5, 5 + bob); c.closePath(); c.fill();
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
