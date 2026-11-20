'use strict';
// ===== weapons.js : three universal weapons, per-character styles =====

const BSTYLE = {
  // bolt visuals per character
  ichigo: { col: '#ff8a3a', shape: 'cres', r: 7 },
  rukia: { col: '#9fe8ff', shape: 'shard', r: 6, chill: 1.2 },
  frieren: { col: '#8fd8ff', shape: 'beam', r: 6, haste: 1 },
  kaido: { col: '#ffd76a', shape: 'bola', r: 9, heavy: 1 },
  gojo: { col: '#ff5a5a', shape: 'orb', r: 10 }, // single scaling Red projectile
};
const SKINCOL = {
  ichigo: { blade: '#d8dce8', bolt: '#ff8a3a', slash: '#ffb06a' },
  rukia: { blade: '#e8f6ff', bolt: '#9fe8ff', slash: '#c8f0ff' },
  frieren: { blade: '#d8e8ff', bolt: '#8fd8ff', slash: '#bfe8ff' },
  kaido: { blade: '#e8c56a', bolt: '#ffd76a', slash: '#ffe8a0' },
  gojo: { blade: '#c9e0ff', bolt: '#8ab8ff', slash: '#a0c8ff' },
};

// ---- BOLT ----
function updBolt(dt) {
  const st = pstats();
  W.boltT -= dt;
  if (W.boltT <= 0) {
    // mode gating: melee never shoots; auto holds fire when something is in sword range
    let hold = false;
    if (P.mode === 'melee') hold = true;
    else if (P.mode !== 'range') {
      const reach = G.ch === 'gojo' ? 110 : 120 * st.area + 34;
      for (const e of G.enemies) {
        if (e.dead) continue;
        if (dist(P.x, P.y, e.x, e.y) < reach) { hold = true; break; }
      }
    }
    W.boltT = hold ? 0.12 : st.cd * (BSTYLE[G.ch].rateM || 1) * st.wCd;
    let best = null, bd = 520 * st.area;
    if (!hold) for (const e of G.enemies) {
      if (e.dead) continue;
      const d = dist(P.x, P.y, e.x, e.y);
      if (d < bd) { bd = d; best = e; }
    }
    if (best) {
      const bs = BSTYLE[G.ch];
      const a = angTo(P.x, P.y, best.x, best.y);
      const dmg = WEAP.bolt.base * st.boltDmg;
      const opt = { chill: bs.chill ? bs.chill : (G.ch === 'rukia' ? 1.0 : 0) };
      poseAttack('bolt', a);
      const shoot = (ang, mul) => {
        if (G.ch === 'gojo') {
          // Cursed technique: Red — one big projectile that scales with level
          const lvl = P.level - 1;
          fireBolt(ang, dmg * mul * (1.25 + lvl * 0.18), '#ff5a5a', 'orb', 10 + Math.min(5, lvl * 0.6), opt);
        } else if (G.ch === 'frieren') {
          fireBolt(ang, dmg * mul * 0.85, '#8fd8ff', 'beam', 6, opt);
          P.haste = Math.max(P.haste, 0.35); // haste passive
        } else if (G.ch === 'kaido') {
          fireBolt(ang, dmg * mul * 1.35, '#ffd76a', 'bola', 10, { chill: 0, heavy: 1 }); // heavy bolt + kb
        } else {
          fireBolt(ang, dmg * mul, bs.col, bs.shape, bs.r, opt);
        }
      };
      shoot(a, 1);
      // level awakenings: +1 projectile at 25, +2 more at 50 (spared damage)
      const extra = st.lvl50 ? 3 : st.lvl25 ? 1 : 0;
      for (let i = 0; i < extra; i++) {
        const step = Math.ceil((i + 1) / 2) * 0.14;
        shoot(a + (i % 2 === 0 ? step : -step), 0.8);
      }
      SND.play('zap');
    }
  }
  // move bolts
  for (let i = G.bolts.length - 1; i >= 0; i--) {
    const b = G.bolts[i];
    b.t += dt;
    b.x += b.vx * dt; b.y += b.vy * dt;
    b.life -= dt;
    if (b.t > 0.05 && Math.random() < QUAL.parity) part(b.x, b.y, b.col, 1, 30, 1.8);
    if (b.life <= 0) { G.bolts.splice(i, 1); continue; }
    // hit
    for (const e of [...G.enemies]) {
      if (e.dead || b.hit.includes(e)) continue;
      const d = dist(b.x, b.y, e.x, e.y);
      if (d < e.r + b.r) {
        hitEnemy(e, b.dmg, { kb: b.heavy ? 2.4 : 0.7, kbAng: b.a, chill: b.opt && b.opt.chill, silent: false });
        burst(b.x, b.y, b.col, 5, 120, 2.2);
        b.hit.push(e);
        if (b.pierce <= 0) { G.bolts.splice(i, 1); break; }
        b.pierce--;
      }
    }
  }
}
function fireBolt(a, dmg, col, shape, r, opt) {
  const st = pstats();
  G.bolts.push({
    x: P.x + Math.cos(a) * 18, y: P.y + Math.sin(a) * 18,
    vx: Math.cos(a) * 520, vy: Math.sin(a) * 520, a,
    dmg, col, shape, r, life: 1.4, t: 0, opt: opt || {}, heavy: opt && opt.heavy,
    pierce: Math.floor(st.pierce), hit: [],
    releaseLift: SIGNATURE_GRIPS[signatureKey(G.ch, P.form)][1] - 4,
  });
}

// ---- BLADE (melee arc) ----
function updBlade(dt) {
  const st = pstats();
  W.bladeT -= dt;
  if (W.bladeT <= 0 && P.mode === 'range') W.bladeT = 0.15;
  if (W.bladeT <= 0) {
    if (G.ch === 'gojo') { blueCrush(st); return; }
    let near = null, nd = 130 * st.area;
    for (const e of G.enemies) {
      if (e.dead) continue;
      const d = dist(P.x, P.y, e.x, e.y);
      if (d < nd) { nd = d; near = e; }
    }
    if (near) {
      W.bladeT = 1.6 * clamp(st.cd, 0.7, 1.4) * (st.bladeFrenzy ? st.bladeFrenzy : 1) * (P.mode === 'melee' ? 0.75 : 1) * st.wCd;
      P.bladeCount++;
      const a = angTo(P.x, P.y, near.x, near.y);
      poseAttack('blade', a);
      P.dir = a;
      const dmg = WEAP.blade.base * st.bladeDmg;
      SND.play('crit');
      // arc hit (LV25 awakening: wide arc)
      const reach = 120 * st.area * (st.lvl25 ? 1.15 : 1);
      const arc = st.lvl25 ? 1.45 : 1.05;
      P.swing = { a, t: 0, dur: 0.32, col: SKINCOL[G.ch].slash, reach, arc, face: P.attackFace };
      let hits = 0;
      for (const e of [...G.enemies]) {
        if (e.dead) continue;
        const d = dist(P.x, P.y, e.x, e.y);
        if (d > reach + e.r) continue;
        const ea = angTo(P.x, P.y, e.x, e.y);
        let da = Math.abs(ea - a);
        if (da > Math.PI) da = TAU - da;
        if (G.ch === 'kaido' || da < arc) {
          let mult = 1;
          const opt = { kb: 1.6, kbAng: ea };
          // ichigo: every 5th swing crits hard
          if (G.ch === 'ichigo' && P.bladeCount % 5 === 0) { mult = 2.2; opt.stun = 0.25; pop(P.x, P.y - 40, 'CRIT', '#ff8a3a', true); }
          if (G.ch === 'rukia') opt.chill = 1.4;
          if (G.ch === 'kaido') {
            // 360 smash
            opt.stun = 0.5; opt.kb = 3;
            mult = 1.15;
          }
          if (G.ch === 'gojo') {
            mult = 1.45;
            opt.kb = 2.4;
            opt.kbAng = angTo(e.x, e.y, P.x, P.y); // Blue crush: yank them in
          }
          if (G.ch === 'frieren') mult = 0.85;
          hitEnemy(e, dmg * mult, opt);
          hits++;
        }
      }
      if (G.ch === 'kaido' && hits > 0) { ring(P.x, P.y, 20, reach, SKINCOL.kaido.slash, 3, 0.3); CAM.kick(3); }
      if (G.ch === 'gojo' && hits > 0) {
        ring(P.x, P.y, reach, 12, '#5aa0ff', 3, 0.32);
        ring(P.x, P.y, 12, reach * 0.65, '#8ab8ff', 2.5, 0.38);
        part(P.x, P.y, '#8ab8ff', 8, 200, 2.5);
      }
      // LV50 awakening: every 4th swing slams out a shockwave
      if (st.lvl50 && P.bladeCount % 4 === 0) {
        const swr = reach * 1.3;
        ring(P.x, P.y, 16, swr, SKINCOL[G.ch].slash, 5, 0.45);
        ring(P.x, P.y, swr * 0.5, swr * 1.15, '#fff2c8', 2.5, 0.3);
        for (const e of G.enemies) {
          if (e.dead || e.boss) continue;
          if (dist(P.x, P.y, e.x, e.y) < swr + e.r) {
            hitEnemy(e, dmg * 0.7, { kb: 2.2, stun: 0.25, kbAng: angTo(P.x, P.y, e.x, e.y) });
          }
        }
        CAM.kick(6);
        SND.play('boom');
      }
      if (hits) SND.play("hit");
    }
  }
  if (P.swing) {
    P.swing.t += dt;
    if (P.swing.t > P.swing.dur) P.swing = null;
  }
}

// GOJO Blue: long-range crush circle every ~5s — 1-taps small enemies,
// yanks elites/bosses in and chunks them
function blueCrush(st) {
  const R = 300 * st.area;
  let any = false;
  for (const e of G.enemies) {
    if (!e.dead && dist(P.x, P.y, e.x, e.y) < R + e.r) { any = true; break; }
  }
  if (!any) { W.bladeT = 0.2; return; }
  W.bladeT = (P.mode === 'melee' ? 3.75 : 5) * st.wCd;
  poseAttack('cast');
  const dmg = 70 + P.level * 7;
  for (const e of [...G.enemies]) {
    if (e.dead) continue;
    if (dist(P.x, P.y, e.x, e.y) > R + e.r) continue;
    // 1-tap the small ones; big units (splitter/tank/matron/elites/boss) take the chunk + get dragged in
    if (infSmall(e)) {
      killEnemy(e);
      burst(e.x, e.y, '#8ab8ff', 5, 190, 3);
      for (let i = 0; i < 6; i++) part(e.x, e.y - 4, '#9fdcff', 1, rnd(110, 240), 1.8, 'spark');
    } else {
      hitEnemy(e, P.mode === 'melee' ? dmg * 1.4 : dmg, { kb: 0 });
      const a = angTo(e.x, e.y, P.x, P.y);
      const pull = e.boss ? 8 : 30;
      e.x += Math.cos(a) * pull;
      e.y += Math.sin(a) * pull;
    }
  }
  ring(P.x, P.y, R * 0.12, R, '#5aa0ff', 4, 0.5);
  ring(P.x, P.y, R, 10, '#8ab8ff', 3, 0.35);
  zone(P.x, P.y, R, 'rgba(90,160,255,0.14)', 0.4, 0, 0, true);
  part(P.x, P.y, '#8ab8ff', 12, 240, 3);
  SND.play('crit');
  CAM.kick(3);
}

function poseAttack(attack, direction) {
  P.atkPose = 1;
  P.attack = attack;
  P.attackStarted = G.t;
  P.attackAim = direction;
  P.attackFace = direction === undefined || Math.abs(Math.cos(direction)) < 0.1
    ? P.face : Math.sign(Math.cos(direction));
}

// ---- SHIELD (aura) ----
function updShield(dt) {
  const st = pstats();
  W.shieldT -= dt;
  if (W.shieldT <= 0) {
    W.shieldT = 0.5 * st.wCd;
    // tick damage + slow to enemies in ring band
    const dmg = 4 * st.tickx;
    for (let i = G.enemies.length - 1; i >= 0; i--) {
      const e = G.enemies[i];
      if (e.dead) continue;
      const d = dist(P.x, P.y, e.x, e.y);
      if (d < st.outR + e.r) {
        hitEnemy(e, dmg, { silent: true, chill: (G.ch === 'rukia' || hasP('glacier')) ? 1.2 : 0, freeze: st.fullfreeze ? 0.6 : 0 });
      }
    }
  }
}

// ---- Signature weapons drawn from original pixel patterns ----
const SIGNATURE_GRIPS = {
  ichigo: [3, -24], ichigo_hollow: [7, -29], rukia: [11, -25], rukia_bankai: [9, -30],
  frieren: [9, -20], kaido: [13, -20], gojo: [4, -14],
};
const SIGNATURE_ART = {
  ichigo: { carry: 0.25, reach: 32, pixels: [
    ['#1a1525', -6, -2, 9, 4], ['#adabae', -5, -1, 8, 2], ['#5e4b63', -4, -2, 1, 4],
    ['#5e4b63', -1, -2, 1, 4], ['#15131e', 2, -4, 24, 8], ['#15131e', 26, -3, 4, 6],
    ['#15131e', 30, -2, 2, 4], ['#302b40', 4, -3, 22, 5], ['#504862', 7, -2, 18, 1],
    ['#a9b2ce', 4, 2, 22, 1], ['#d7deeb', 25, 1, 4, 1], ['#d7deeb', 28, 0, 3, 1],
  ] },
  ichigo_hollow: { carry: 0.25, reach: 31, pixels: [
    ['#160f1a', -6, -2, 9, 4], ['#97313c', -5, -1, 6, 2], ['#e06152', -3, -1, 1, 1],
    ['#221727', 1, -4, 2, 8], ['#15111c', 3, -2, 27, 4], ['#343042', 5, -1, 23, 1],
    ['#ad575f', 4, 1, 24, 1], ['#d38480', 28, 0, 3, 1],
  ] },
  rukia: { carry: -0.48, reach: 27, pixels: [
    ['#506d89', -6, -2, 9, 4], ['#e7faff', -6, -1, 9, 2], ['#9ebee2', -3, -2, 1, 4],
    ['#effcff', 1, -4, 2, 8], ['#48617c', 3, -2, 22, 4], ['#bae3f3', 4, -1, 21, 2],
    ['#ffffff', 4, -1, 19, 1], ['#d9f8ff', 23, -1, 3, 2], ['#effcff', 25, -1, 2, 1],
  ] },
  rukia_bankai: { carry: -0.53, reach: 30, pixels: [
    ['#537b9c', -6, -2, 10, 4], ['#edfaff', -6, -1, 9, 2], ['#ffffff', 2, -4, 2, 8],
    ['#6498b3', 4, -2, 23, 4], ['#a9e9ff', 4, 0, 23, 1], ['#ffffff', 4, -1, 24, 1],
    ['#effcff', 27, -1, 3, 1],
  ] },
  frieren: { carry: -1.43, reach: 25, pixels: [
    ['#45232c', -14, -2, 36, 4], ['#853844', -13, -1, 33, 2], ['#c35d57', -12, -1, 29, 1],
    ['#9e6633', -14, -2, 3, 4], ['#f3ba6b', -14, -1, 2, 2], ['#774b36', 16, -3, 4, 6],
    ['#8e5a39', 19, -6, 6, 12], ['#e2a351', 20, -5, 7, 10], ['#ffd787', 21, -6, 7, 2],
    ['#ffd787', 21, 4, 7, 2], ['#a3394d', 22, -3, 6, 6], ['#e36a66', 24, -2, 3, 4],
    ['#fff0a8', 24, -2, 2, 1],
  ] },
  kaido: { carry: -0.56, reach: 31, pixels: [
    ['#181724', -7, -2, 19, 4], ['#634d43', -6, -1, 17, 2], ['#9d7a61', -4, -1, 13, 1],
    ['#1a1925', 8, -4, 24, 8], ['#1a1925', 13, -6, 18, 12], ['#635a6a', 13, -5, 17, 9],
    ['#40394d', 12, 1, 18, 3], ['#9690a2', 15, -5, 14, 1], ['#241c2b', 10, -4, 3, 8],
    ['#ceb98f', 15, -7, 2, 4], ['#ceb98f', 21, -7, 2, 4], ['#ceb98f', 27, -7, 2, 4],
    ['#c0a573', 17, 3, 2, 4], ['#c0a573', 23, 3, 2, 4], ['#c0a573', 28, 3, 2, 4],
    ['#d7c09d', 18, -1, 2, 2], ['#d7c09d', 25, -1, 2, 2],
  ] },
};
const SIGNATURE_TILE = 76;
const SIGNATURE_TURNS = 48;
const weaponTiles = new Map();

function signatureKey(ch, form) {
  if (ch === 'ichigo' && form === 'ichigo') return 'ichigo_hollow';
  if (ch === 'rukia' && form === 'rukia') return 'rukia_bankai';
  return ch;
}

function signatureCanvas() {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = SIGNATURE_TILE;
  return canvas;
}

function signatureTile(key, angle) {
  let atlas = weaponTiles.get(key);
  if (!atlas) {
    const image = signatureCanvas();
    const c = image.getContext('2d');
    c.translate(SIGNATURE_TILE / 2, SIGNATURE_TILE / 2);
    for (const [color, x, y, w, h] of SIGNATURE_ART[key].pixels) {
      c.fillStyle = color;
      c.fillRect(x, y, w, h);
    }
    atlas = { image, frames: [] };
    weaponTiles.set(key, atlas);
  }
  const turn = Math.round(angle / TAU * SIGNATURE_TURNS);
  const i = ((turn % SIGNATURE_TURNS) + SIGNATURE_TURNS) % SIGNATURE_TURNS;
  if (!atlas.frames[i]) {
    const frame = signatureCanvas();
    const c = frame.getContext('2d');
    c.imageSmoothingEnabled = false;
    c.translate(SIGNATURE_TILE / 2, SIGNATURE_TILE / 2);
    c.rotate(i / SIGNATURE_TURNS * TAU);
    c.drawImage(atlas.image, -SIGNATURE_TILE / 2, -SIGNATURE_TILE / 2);
    atlas.frames[i] = frame;
  }
  return atlas.frames[i];
}

function weaponAngle(from, to, t) {
  return from + Math.atan2(Math.sin(to - from), Math.cos(to - from)) * t;
}

function weaponPulse(c, x, y, color, life, time) {
  if (life <= 0) return;
  c.save();
  c.translate(Math.round(x), Math.round(y));
  const size = Math.round(2 + 4 * life);
  c.globalAlpha *= life;
  c.fillStyle = color;
  c.fillRect(-size, -size + 2, 2 * size + 1, 2 * size - 3);
  c.fillRect(-size + 2, -size, 2 * size - 3, 2 * size + 1);
  c.fillStyle = '#fff3fb';
  c.fillRect(-2, -2, 4, 4);
  c.fillStyle = color;
  for (let i = 0; i < 3; i++) {
    const a = time * 15 + i * TAU / 3;
    const radius = 6 + 6 * (1 - life);
    c.fillRect(Math.round(Math.cos(a) * radius), Math.round(Math.sin(a) * radius), 2, 2);
  }
  c.restore();
}

function drawSignatureWeapon(c, ch, o) {
  const key = signatureKey(ch, o.form);
  const defaultGrip = SIGNATURE_GRIPS[key];
  const face = o.face < 0 ? -1 : 1;
  const time = o.time || 0;
  const age = o.attackAge ?? Infinity;
  const active = o.attack && age >= 0 && age < (ch === 'kaido' ? 0.34 : 0.27);
  const blade = o.attack === 'blade';
  const aim = Number.isFinite(o.aim) ? Math.atan2(Math.sin(o.aim), Math.cos(o.aim) * face) : 0;

  c.save();
  c.imageSmoothingEnabled = false;
  c.translate(Math.round(o.x + (o.handX ?? defaultGrip[0]) * face), Math.round(o.y + (o.handY ?? defaultGrip[1])));
  c.scale(face, 1);
  if (ch === 'gojo') {
    // Limitless is an unarmed technique. Red releases forward and Blue contracts.
    if (active) {
      const red = o.attack === 'bolt';
      const life = 1 - clamp(age / (red ? 0.12 : 0.26), 0, 1);
      const distance = red ? 4 + age * 48 : 4 + life * 4;
      weaponPulse(c, Math.cos(aim) * distance, Math.sin(aim) * distance,
        red ? '#ff5a71' : '#72bfff', life, time);
    }
    c.restore();
    return;
  }

  const art = SIGNATURE_ART[key];
  let angle = art.carry + (o.moving ? Math.sin(time * 12) * 0.10 : Math.sin(time * 3) * 0.04);
  if (o.dashWindup && ch === 'kaido') angle = lerp(-0.56, -1.40, o.dashWindup);
  else if (o.dash) angle = weaponAngle(angle, -2.9, 0.8);
  else if (active) {
    const follow = easeOut(clamp(age / (ch === 'kaido' ? 0.16 : 0.105), 0, 1));
    const settle = ease(clamp((age - 0.105) / (ch === 'kaido' ? 0.235 : 0.165), 0, 1));
    const releaseAngle = aim + (blade ? (ch === 'kaido' ? 1.7 : 1.08) * follow : -0.34 * follow);
    angle = weaponAngle(releaseAngle, angle, settle);
  }

  if (ch === 'rukia') {
    // Pixel ribbon follows the pommel while it catches up to the sword.
    const tx = -Math.cos(angle) * 5, ty = -Math.sin(angle) * 5;
    for (let i = 0; i < 10; i++) {
      const x = tx - i * (active || o.moving ? 1.4 : 0.7);
      const y = ty + i * (active ? 0.45 : 0.9) + Math.sin(i * 0.5 - time * 10) * (i * 0.25);
      c.fillStyle = i < 5 ? '#e7f7ff' : '#a7cbe2';
      c.fillRect(Math.round(x), Math.round(y), 2, 2);
    }
  }

  const half = SIGNATURE_TILE / 2;
  c.drawImage(signatureTile(key, angle), -half, -half);
  if (active && age < 0.12 && (!blade || ch === 'kaido')) {
    const tip = ch === 'frieren' ? 24 : art.reach - 2;
    weaponPulse(c, Math.cos(angle) * tip, Math.sin(angle) * tip, BSTYLE[ch].col,
      0.82 * (1 - age / 0.12), time);
  }
  c.restore();
}

// ---- drawing ----
// glow backdrop for any projectile
function boltGlow(c, r, col, strength) {
  const g = c.createRadialGradient(0, 0, 0, 0, 0, r);
  g.addColorStop(0, rgba(col, 0.5 * strength));
  g.addColorStop(0.55, rgba(col, 0.16 * strength));
  g.addColorStop(1, rgba(col, 0));
  c.fillStyle = g;
  c.beginPath(); c.arc(0, 0, r, 0, TAU); c.fill();
}
// fading ghost copies projected back along travel dir
function boltTrail(c, b, maxBack, n, drawFn) {
  for (let i = 1; i <= n; i++) {
    const k = (i / (n + 1));
    const sp = Math.hypot(b.vx, b.vy) || 1;
    c.save();
    c.translate(-(b.vx / sp) * maxBack * k, -(b.vy / sp) * maxBack * k);
    c.globalAlpha = (1 - k) * 0.35;
    c.scale(1 - k * 0.35, 1 - k * 0.35);
    drawFn();
    c.restore();
  }
}

// gojo Infinity: near-invisible shimmer at the veil edge, brightens when it works
function drawInfinity(c, st) {
  const R = st.infR;
  if (!R) return;
  let near = 0;
  for (const e of G.enemies) {
    if (!e.dead && dist(P.x, P.y, e.x, e.y) < R + e.r + 46) near++;
  }
  const press = clamp((G.infFx || 0) * 3, 0, 1);
  const a = 0.035 + (near ? Math.min(0.16, 0.05 + near * 0.02) : 0) + press * 0.3;
  c.save();
  c.translate(P.x, P.y);
  // faint pressure halo
  const g = c.createRadialGradient(0, 0, R * 0.45, 0, 0, R);
  g.addColorStop(0, 'rgba(120,160,255,0)');
  g.addColorStop(1, rgba('#8ab8ff', a * 0.4));
  c.fillStyle = g;
  c.beginPath(); c.arc(0, 0, R, 0, TAU); c.fill();
  // shimmer arcs that betray the surface only when touched
  c.strokeStyle = rgba('#9fdcff', a);
  c.lineWidth = 1.6;
  for (let i = 0; i < 3; i++) {
    const a0 = G.t * (0.5 + i * 0.22) + (i / 3) * TAU;
    c.beginPath();
    c.arc(0, 0, R, a0, a0 + 0.7 + press * 1.6);
    c.stroke();
  }
  c.restore();
}

function drawWeapons(c) {
  const st = pstats();
  if (st.infR) drawInfinity(c, st);
  // shield: double ring + runes + comets
  const pulse = 0.5 + Math.sin(G.t * 2.4) * 0.5;
  const scol = G.ch === 'rukia' ? '#9fe8ff' : (G.ch === 'kaido' ? '#ffd76a' : '#ffe8b0');
  c.save();
  c.translate(P.x, P.y);
  // outer ring (slow): dashed + comet heads
  c.strokeStyle = rgba(scol, 0.22 + pulse * 0.1);
  c.lineWidth = 3;
  c.setLineDash([14, 10]);
  c.lineDashOffset = -G.t * 30;
  c.beginPath(); c.arc(0, 0, st.outR, 0, TAU); c.stroke();
  c.setLineDash([]);
  if (QUAL.decor) {
    for (let i = 0; i < 3; i++) {
      const a = G.t * 0.9 + (i / 3) * TAU;
      const cx = Math.cos(a) * st.outR, cy = Math.sin(a) * st.outR;
      c.save();
      c.translate(cx, cy);
      c.rotate(a + Math.PI / 2);
      // tail
      c.strokeStyle = rgba(scol, 0.3); c.lineWidth = 2;
      c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(-8, -3, -16, -1); c.stroke();
      // head
      const g = c.createRadialGradient(0, 0, 0, 0, 0, 4.4);
      g.addColorStop(0, '#fff');
      g.addColorStop(0.45, rgba(scol, 0.8));
      g.addColorStop(1, rgba(scol, 0));
      c.fillStyle = g;
      c.beginPath(); c.arc(0, 0, 4.4, 0, TAU); c.fill();
      c.restore();
    }
  }
  // inner aura (block)
  const g = c.createRadialGradient(0, 0, st.inR * 0.2, 0, 0, st.inR);
  g.addColorStop(0, rgba(scol, 0.03));
  g.addColorStop(0.7, rgba(scol, 0.08 + pulse * 0.04));
  g.addColorStop(1, rgba(scol, 0.16));
  c.fillStyle = g;
  c.beginPath(); c.arc(0, 0, st.inR, 0, TAU); c.fill();
  // ring: soft outer + bright inner
  c.strokeStyle = rgba(scol, 0.28);
  c.lineWidth = 4.4;
  c.beginPath(); c.arc(0, 0, st.inR + 1.6, 0, TAU); c.stroke();
  c.strokeStyle = rgba(scol, 0.55 + pulse * 0.25);
  c.lineWidth = 1.4;
  c.beginPath(); c.arc(0, 0, st.inR, 0, TAU); c.stroke();
  // cardinal diamonds on the inner ring
  if (QUAL.decor) {
    c.fillStyle = rgba(scol, 0.55 + pulse * 0.25);
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * TAU + Math.PI / 4;
      c.save();
      c.translate(Math.cos(a) * st.inR, Math.sin(a) * st.inR);
      c.rotate(a);
      c.beginPath();
      c.moveTo(3.2, 0); c.lineTo(0, 2); c.lineTo(-3.2, 0); c.lineTo(0, -2);
      c.closePath(); c.fill();
      c.restore();
    }
    // orbiting runes (small glyph marks)
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * TAU + G.t * 0.6;
      const rx = Math.cos(a) * (st.inR + 9), ry = Math.sin(a) * (st.inR + 9);
      c.save(); c.translate(rx, ry); c.rotate(a + Math.PI / 2);
      c.strokeStyle = rgba(scol, 0.6); c.lineWidth = 1.1; c.lineCap = 'round';
      c.beginPath();
      c.moveTo(-2.2, -3); c.lineTo(-2.2, 3);
      c.moveTo(0, -3); c.lineTo(1.8, -1); c.lineTo(-1.2, 1); c.lineTo(1.2, 3);
      c.stroke();
      c.restore();
    }
  }
  c.restore();
}

function drawBolts(c) {
  for (const b of G.bolts) {
    c.save();
    // The effect leaves at hand height and settles onto the simulated path.
    const lift = (b.releaseLift || 0) * (1 - clamp(b.t / 0.13, 0, 1)) ** 2;
    c.translate(b.x, b.y + lift);
    c.rotate(b.a);
    const alpha = clamp(b.life * 1.6, 0, 1);
    c.globalAlpha = alpha;
    switch (b.shape) {

      case 'cres': {
        // Ichigo: getsu crescent w/ echo arcs
        c.save();
        c.globalCompositeOperation = 'lighter';
        boltGlow(c, b.r * 3.1, '#ff8a3a', 1.05);
        c.restore();
        const cres = () => {
          c.fillStyle = b.col;
          c.beginPath();
          c.arc(0, 0, b.r, -1.1, 1.1);
          c.arc(-b.r * 1.8, 0, b.r * 1.3, 1.1, -1.1, true);
          c.closePath(); c.fill();
        };
        boltTrail(c, b, 14 + b.t * 90, 3, cres);
        cres();
        c.fillStyle = '#fff';
        c.beginPath();
        c.arc(0, 0, b.r * 0.72, -0.9, 0.9);
        c.arc(-b.r * 1.55, 0, b.r * 0.95, 0.9, -0.9, true);
        c.closePath(); c.fill();
        c.strokeStyle = 'rgba(255,220,170,0.9)'; c.lineWidth = 1;
        c.beginPath(); c.arc(0, 0, b.r * 1.08, -0.95, 0.95); c.stroke();
        break;
      }

      case 'shard': {
        // Rukia: ice crystal w/ facet lines + sparkle + frost trail
        c.save();
        c.globalCompositeOperation = 'lighter';
        boltGlow(c, b.r * 2.9, '#9fe8ff', 0.9);
        c.restore();
        boltTrail(c, b, 10 + b.t * 70, 3, () => {
          c.fillStyle = 'rgba(190,235,255,0.8)';
          c.beginPath();
          c.moveTo(b.r * 1.6, 0); c.lineTo(-b.r, b.r * 0.7);
          c.lineTo(-b.r * 0.4, 0); c.lineTo(-b.r, -b.r * 0.7);
          c.closePath(); c.fill();
        });
        // crystal body
        const ig = c.createLinearGradient(-b.r, 0, b.r * 1.6, 0);
        ig.addColorStop(0, 'rgba(150,210,240,0.9)');
        ig.addColorStop(0.5, 'rgba(230,248,255,0.98)');
        ig.addColorStop(1, '#ffffff');
        c.fillStyle = ig;
        c.beginPath();
        c.moveTo(b.r * 1.6, 0); c.lineTo(-b.r * 0.2, b.r * 0.75);
        c.lineTo(-b.r * 0.7, 0); c.lineTo(-b.r * 0.2, -b.r * 0.75);
        c.closePath(); c.fill();
        // facet lines
        c.strokeStyle = 'rgba(255,255,255,0.85)'; c.lineWidth = 0.8;
        c.beginPath(); c.moveTo(b.r * 1.5, 0); c.lineTo(-b.r * 0.55, -b.r * 0.42); c.stroke();
        c.beginPath(); c.moveTo(b.r * 1.5, 0); c.lineTo(-b.r * 0.55, b.r * 0.42); c.stroke();
        // tip sparkle
        c.globalCompositeOperation = 'lighter';
        c.fillStyle = '#eaf8ff';
        star4(c, b.r * 1.75, Math.sin(b.t * 9) * 1.2, 1.5 + Math.sin(b.t * 13) * 0.5, 0.62);
        c.globalCompositeOperation = 'source-over';
        break;
      }

      case 'beam': {
        // Frieren: ranged zoltraak lance: glow shaft + rune ring at head
        const len = b.r * 1.6;
        c.save();
        c.globalCompositeOperation = 'lighter';
        // soft wide shaft
        c.strokeStyle = rgba('#8fd8ff', 0.22); c.lineWidth = 7; c.lineCap = 'round';
        c.beginPath(); c.moveTo(-16, 0); c.lineTo(len, 0); c.stroke();
        boltGlow(c, b.r * 2.6, '#8fd8ff', 0.85);
        c.restore();
        // core
        c.strokeStyle = '#cfeaff'; c.lineWidth = 2.8; c.lineCap = 'round';
        c.beginPath(); c.moveTo(-14, 0); c.lineTo(len - 1, 0); c.stroke();
        c.strokeStyle = '#ffffff'; c.lineWidth = 1.1;
        c.beginPath(); c.moveTo(-12, 0); c.lineTo(len - 3, 0); c.stroke();
        // heat shimmer rings traveling back
        for (let i = 1; i <= 2; i++) {
          const px = len - ((b.t * 60 + i * 9) % 26);
          const pr = 2.4 + Math.sin(b.t * 18 + i) * 0.6;
          c.strokeStyle = rgba('#bfe8ff', 0.5 - i * 0.12); c.lineWidth = 1;
          c.beginPath(); c.arc(px, 0, pr, -1.5, 1.5); c.stroke();
        }
        // rune ring at head
        c.save();
        c.rotate(b.t * 5);
        c.strokeStyle = rgba('#dff2ff', 0.75); c.lineWidth = 0.9;
        c.beginPath(); c.arc(len + 2.5, 0, 3.4, 0, TAU); c.stroke();
        for (let i = 0; i < 4; i++) {
          const a = (i / 4) * TAU;
          c.beginPath();
          c.moveTo(len + 2.5 + Math.cos(a) * 2, Math.sin(a) * 2);
          c.lineTo(len + 2.5 + Math.cos(a) * 4.8, Math.sin(a) * 4.8);
          c.stroke();
        }
        c.restore();
        // head star
        c.fillStyle = '#ffffff';
        star4(c, len + 2.5, 0, 1.8, 0.8);
        break;
      }

      case 'bola': {
        // Kaido: heavy iron ball, spin streaks, red impact aura
        const back = -(b.r + 3 + b.t * 76);
        c.strokeStyle = rgba('#ffd76a', 0.3); c.lineWidth = 2.4;
        c.beginPath(); c.moveTo(back, 0); c.lineTo(-b.r - 2, 0); c.stroke();
        c.save();
        c.globalCompositeOperation = 'lighter';
        boltGlow(c, b.r * 2.4, '#ffd76a', 0.75);
        c.restore();
        // iron ball
        const kg = c.createLinearGradient(-b.r, -b.r, b.r, b.r);
        kg.addColorStop(0, '#6a6172');
        kg.addColorStop(0.5, '#3e3748');
        kg.addColorStop(1, '#211c28');
        c.fillStyle = kg;
        c.beginPath(); c.arc(0, 0, b.r, 0, TAU); c.fill();
        // equator band
        c.strokeStyle = 'rgba(200,192,168,0.5)'; c.lineWidth = 1.4;
        const sa = b.t * 12;
        c.beginPath(); c.arc(0, 0, b.r * 0.98, sa, sa + 1.6); c.stroke();
        c.beginPath(); c.arc(0, 0, b.r * 0.98, sa + Math.PI, sa + Math.PI + 1.6); c.stroke();
        // studs
        c.fillStyle = '#cfc9a8';
        for (let i = 0; i < 6; i++) {
          const a = sa * 0.7 + (i / 6) * TAU;
          c.beginPath(); c.arc(Math.cos(a) * b.r * 0.55, Math.sin(a) * b.r * 0.55, b.r * 0.13, 0, TAU); c.fill();
        }
        // leading spikes
        c.fillStyle = '#c8c2a2';
        for (const aa of [-0.55, 0, 0.55]) {
          c.save(); c.rotate(aa);
          c.beginPath();
          c.moveTo(b.r - 0.5, -1.4); c.lineTo(b.r + 3.4, 0); c.lineTo(b.r - 0.5, 1.4);
          c.closePath(); c.fill();
          c.restore();
        }
        // specular
        c.fillStyle = 'rgba(255,255,255,0.35)';
        c.beginPath(); c.arc(-b.r * 0.32, -b.r * 0.34, b.r * 0.22, 0, TAU); c.fill();
        break;
      }

      case 'orb': {
        // Gojo: cursed-energy orb: corona + swirl ring + white core
        c.save();
        c.globalCompositeOperation = 'lighter';
        // corona
        const og = c.createRadialGradient(0, 0, 1, 0, 0, b.r * 2.4);
        og.addColorStop(0, 'rgba(255,255,255,0.95)');
        og.addColorStop(0.32, rgba(b.col, 0.85));
        og.addColorStop(0.68, rgba(b.col, 0.3));
        og.addColorStop(1, rgba(b.col, 0));
        c.fillStyle = og;
        c.beginPath(); c.arc(0, 0, b.r * 2.4, 0, TAU); c.fill();
        c.restore();
        // swirl ring (blocked swirl opposite rotation to travel)
        c.strokeStyle = rgba(b.col === '#ff5a5a' ? '#ff8a8a' : '#bfe0ff', 0.8);
        c.lineWidth = 1.6;
        const wa = b.t * 13;
        c.beginPath(); c.arc(0, 0, b.r * 0.92, wa, wa + 2.1); c.stroke();
        c.beginPath(); c.arc(0, 0, b.r * 0.92, wa + Math.PI, wa + Math.PI + 2.1); c.stroke();
        // expanding pulse
        const pr = b.r + (b.t * 26) % 12;
        c.strokeStyle = rgba('#ffffff', 0.28);
        c.lineWidth = 1;
        c.beginPath(); c.arc(0, 0, pr, 0, TAU); c.stroke();
        // core
        c.fillStyle = '#ffffff';
        c.beginPath(); c.arc(0, 0, b.r * 0.42, 0, TAU); c.fill();
        // speed streaks
        c.strokeStyle = rgba(b.col, 0.6); c.lineWidth = 1.2;
        c.beginPath(); c.moveTo(-b.r * 1.5, -b.r * 0.34); c.lineTo(-b.r * 2.9, -b.r * 0.34); c.stroke();
        c.beginPath(); c.moveTo(-b.r * 1.6, b.r * 0.34); c.lineTo(-b.r * 2.6, b.r * 0.34); c.stroke();
        break;
      }
    }
    c.globalAlpha = 1;
    c.restore();
  }
}

function drawSwing(c) {
  const s = P.swing;
  if (!s) return;
  const p = clamp(s.t / s.dur, 0, 1);
  const opacity = (1 - p) ** 1.5;
  const reach = s.reach;
  c.save();
  c.translate(P.x, P.y);

  if (G.ch === 'kaido') {
    // His hit covers a full circle, so the impact expands out from his feet.
    const radius = reach * (0.38 + easeOut(p) * 0.62);
    c.strokeStyle = rgba(s.col, opacity * 0.75);
    c.lineWidth = 2 + opacity * 3;
    c.beginPath(); c.arc(0, 0, radius, 0, TAU); c.stroke();
    c.strokeStyle = rgba('#ffbc58', opacity * 0.42);
    c.lineWidth = 2;
    for (let i = 0; i < 9; i++) {
      const angle = i * TAU / 9 + s.a;
      c.beginPath();
      c.moveTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
      c.lineTo(Math.cos(angle) * (radius + 8), Math.sin(angle) * (radius + 8));
      c.stroke();
    }
    c.restore();
    return;
  }

  // Show the actual hit arc. The bright edge follows the weapon after contact.
  const low = s.a - s.arc, high = s.a + s.arc;
  c.fillStyle = rgba(s.col, opacity * 0.19);
  c.beginPath();
  c.arc(0, 0, reach, low, high);
  c.arc(0, 0, reach * 0.69, high, low, true);
  c.closePath(); c.fill();
  c.strokeStyle = rgba(s.col, opacity * 0.64);
  c.lineWidth = 2;
  c.beginPath(); c.arc(0, 0, reach, low, high); c.stroke();

  const edge = s.a + s.face * s.arc * easeOut(clamp(s.t / 0.105, 0, 1));
  const tail = edge - s.face * 0.48;
  c.strokeStyle = rgba('#ffffff', opacity * 0.85);
  c.lineWidth = 1.5;
  c.beginPath(); c.arc(0, 0, reach - 1, Math.min(edge, tail), Math.max(edge, tail)); c.stroke();

  if (QUAL.decor && G.ch === 'rukia') {
    for (let i = 0; i < 4; i++) {
      const angle = edge - s.face * i * 0.23;
      const r = reach * (0.74 + i * 0.08 + p * 0.15);
      c.fillStyle = rgba('#c8f0ff', opacity * 0.8);
      star4(c, Math.cos(angle) * r, Math.sin(angle) * r, 2.4 - i * 0.3, 1);
    }
  }
  c.restore();
}
