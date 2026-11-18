'use strict';
// ===== weapons.js : three universal weapons, per-character styles =====

const BSTYLE = {
  // bolt visuals per character
  ichigo: { col: '#ff8a3a', shape: 'cres', r: 7 },
  rukia: { col: '#9fe8ff', shape: 'shard', r: 6, chill: 1.2 },
  frieren: { col: '#8fd8ff', shape: 'beam', r: 6, haste: 1 },
  kaido: { col: '#ffd76a', shape: 'bola', r: 9, heavy: 1 },
  gojo: { col: '#5aa0ff', shape: 'orb', r: 8, flip: 1 }, // blue/red flip
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
    W.boltT = st.cd * (BSTYLE[G.ch].rateM || 1);
    // nearest enemy in 520
    let best = null, bd = 520 * st.area;
    for (const e of G.enemies) {
      if (e.dead) continue;
      const d = dist(P.x, P.y, e.x, e.y);
      if (d < bd) { bd = d; best = e; }
    }
    if (best) {
      const bs = BSTYLE[G.ch];
      const a = angTo(P.x, P.y, best.x, best.y);
      const dmg = WEAP.bolt.base * st.boltDmg;
      const opt = { chill: bs.chill ? bs.chill : (G.ch === 'rukia' ? 1.0 : 0) };
      P.atkPose = 1;
      if (G.ch === 'gojo') {
        // alternate blue/red
        P._boltFlip = !P._boltFlip;
        const col = P._boltFlip ? '#5aa0ff' : '#ff5a5a';
        fireBolt(a, dmg, col, 'orb', 9, opt);
        // gojo fires both when flipping (red hits harder, narrower)
        if (P._boltFlip) fireBolt(a + 0.18, dmg * 0.6, '#5aa0ff', 'orb', 7, opt);
      } else if (G.ch === 'frieren') {
        fireBolt(a, dmg * 0.85, '#8fd8ff', 'beam', 6, opt);
        P.haste = Math.max(P.haste, 0.35); // haste passive
      } else if (G.ch === 'kaido') {
        fireBolt(a, dmg * 1.35, '#ffd76a', 'bola', 10, opt); // heavy bolt + kb
      } else {
        fireBolt(a, dmg, bs.col, bs.shape, bs.r, opt);
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
    for (const e of G.enemies) {
      if (e.dead) continue;
      const d = dist(b.x, b.y, e.x, e.y);
      if (d < e.r + b.r) {
        hitEnemy(e, b.dmg, { kb: b.heavy ? 2.4 : 0.7, kbAng: b.a, chill: b.opt && b.opt.chill, silent: false });
        burst(b.x, b.y, b.col, 5, 120, 2.2);
        G.bolts.splice(i, 1);
        break;
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
  });
}

// ---- BLADE (melee arc) ----
function updBlade(dt) {
  const st = pstats();
  W.bladeT -= dt;
  if (W.bladeT <= 0) {
    let near = null, nd = 130 * st.area;
    for (const e of G.enemies) {
      if (e.dead) continue;
      const d = dist(P.x, P.y, e.x, e.y);
      if (d < nd) { nd = d; near = e; }
    }
    if (near) {
      W.bladeT = 1.6 * clamp(st.cd, 0.7, 1.4) * (st.bladeFrenzy ? st.bladeFrenzy : 1);
      P.bladeCount++;
      const a = angTo(P.x, P.y, near.x, near.y);
      P.atkPose = 1;
      P.dir = a;
      const dmg = WEAP.blade.base * st.bladeDmg;
      P.swing = { a, t: 0, dur: 0.32, col: SKINCOL[G.ch].slash };
      SND.play('crit');
      // arc hit
      const reach = 120 * st.area, arc = 1.05;
      let hits = 0;
      for (const e of G.enemies) {
        if (e.dead) continue;
        const d = dist(P.x, P.y, e.x, e.y);
        if (d > reach + e.r) continue;
        const ea = angTo(P.x, P.y, e.x, e.y);
        let da = Math.abs(ea - a);
        if (da > Math.PI) da = TAU - da;
        if (da < arc) {
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
          if (G.ch === 'gojo' && da < arc * 0.9) mult = 1.2; // gojo arc+20% via tighter focus
          if (G.ch === 'frieren') mult = 0.85;
          hitEnemy(e, dmg * mult, opt);
          hits++;
        }
      }
      if (G.ch === 'kaido' && hits > 0) { ring(P.x, P.y, 20, reach, SKINCOL.kaido.slash, 3, 0.3); CAM.kick(3); }
      if (hits) SND.play("hit");
    }
  }
  if (P.swing) {
    P.swing.t += dt;
    if (P.swing.t > P.swing.dur) P.swing = null;
  }
}

// ---- SHIELD (aura) ----
function updShield(dt) {
  const st = pstats();
  W.shieldT -= dt;
  if (W.shieldT <= 0) {
    W.shieldT = 0.5;
    // tick damage + slow to enemies in ring band
    const dmg = 4 * st.tickx;
    for (let i = G.enemies.length - 1; i >= 0; i--) {
      const e = G.enemies[i];
      if (e.dead) continue;
      const d = dist(P.x, P.y, e.x, e.y);
      if (d < st.outR + e.r) {
        hitEnemy(e, dmg, { silent: true, chill: G.ch === 'rukia' ? 1.2 : 0 });
      }
    }
  }
}

// ---- drawing ----
function drawWeapons(c) {
  const st = pstats();
  // shield: double ring + runes
  const pulse = 0.5 + Math.sin(G.t * 2.4) * 0.5;
  c.save();
  c.translate(P.x, P.y);
  // outer ring (slow)
  c.strokeStyle = rgba('#ffd76a', 0.22 + pulse * 0.1);
  c.lineWidth = 3;
  c.setLineDash([14, 10]);
  c.lineDashOffset = -G.t * 30;
  c.beginPath(); c.arc(0, 0, st.outR, 0, TAU); c.stroke();
  c.setLineDash([]);
  // inner aura (block)
  const g = c.createRadialGradient(0, 0, st.inR * 0.2, 0, 0, st.inR);
  const scol = G.ch === 'rukia' ? '#9fe8ff' : '#ffe8b0';
  g.addColorStop(0, rgba(scol, 0.03));
  g.addColorStop(0.7, rgba(scol, 0.08 + pulse * 0.04));
  g.addColorStop(1, rgba(scol, 0.16));
  c.fillStyle = g;
  c.beginPath(); c.arc(0, 0, st.inR, 0, TAU); c.fill();
  c.strokeStyle = rgba(scol, 0.5 + pulse * 0.2);
  c.lineWidth = 2;
  c.beginPath(); c.arc(0, 0, st.inR, 0, TAU); c.stroke();
  // runes orbiting
  if (QUAL.decor) {
    c.fillStyle = rgba(scol, 0.55);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * TAU + G.t * 0.6;
      const rx = Math.cos(a) * (st.inR + 8), ry = Math.sin(a) * (st.inR + 8);
      c.save(); c.translate(rx, ry); c.rotate(a);
      c.fillRect(-2, -4, 1.6, 8);
      c.restore();
    }
  }
  c.restore();
}

function drawBolts(c) {
  for (const b of G.bolts) {
    c.save();
    c.translate(b.x, b.y);
    c.rotate(b.a);
    const alpha = clamp(b.life * 1.6, 0, 1);
    c.globalAlpha = alpha;
    switch (b.shape) {
      case 'cres':
        c.fillStyle = b.col;
        c.beginPath(); c.arc(0, 0, b.r, -1.1, 1.1); c.arc(-b.r * 1.8, 0, b.r * 1.3, 1.1, -1.1, true); c.closePath(); c.fill();
        break;
      case 'shard':
        c.fillStyle = b.col;
        c.beginPath(); c.moveTo(b.r * 1.6, 0); c.lineTo(-b.r, b.r * 0.7); c.lineTo(-b.r * 0.4, 0); c.lineTo(-b.r, -b.r * 0.7); c.closePath(); c.fill();
        break;
      case 'beam':
        c.strokeStyle = b.col; c.lineWidth = 3;
        c.beginPath(); c.moveTo(-18, 0); c.lineTo(b.r * 1.5, 0); c.stroke();
        c.strokeStyle = '#fff'; c.lineWidth = 1.2;
        c.beginPath(); c.moveTo(-14, 0); c.lineTo(b.r, 0); c.stroke();
        break;
      case 'bola':
        c.fillStyle = b.col;
        c.beginPath(); c.arc(0, 0, b.r, 0, TAU); c.fill();
        c.strokeStyle = b.col; c.lineWidth = 2;
        const sa = b.t * 12;
        c.beginPath(); c.arc(0, 0, b.r + 4, sa, sa + 2); c.stroke();
        c.beginPath(); c.arc(0, 0, b.r + 4, sa + Math.PI, sa + Math.PI + 2); c.stroke();
        break;
      case 'orb':
        const og = c.createRadialGradient(0, 0, 1, 0, 0, b.r * 1.6);
        og.addColorStop(0, '#fff'); og.addColorStop(0.4, b.col); og.addColorStop(1, rgba(b.col, 0));
        c.fillStyle = og;
        c.beginPath(); c.arc(0, 0, b.r * 1.6, 0, TAU); c.fill();
        break;
    }
    c.restore();
  }
}

function drawSwing(c) {
  if (!P.swing) return;
  const s = P.swing;
  const p = clamp(s.t / s.dur, 0, 1);
  const sweep = easeOut(p) * 2.4 - 1.2;
  const reach = 120 * pstats().area;
  c.save();
  c.translate(P.x, P.y);
  c.rotate(s.a + sweep);
  c.globalAlpha = 1 - p;
  // crescent slash
  const g = c.createLinearGradient(0, 0, reach, 0);
  g.addColorStop(0, rgba(s.col, 0.1));
  g.addColorStop(1, rgba(s.col, 0.45));
  c.fillStyle = g;
  c.beginPath();
  c.arc(0, 0, reach, -0.55, 0.55);
  c.arc(0, 0, reach * 0.55, 0.55, -0.55, true);
  c.closePath();
  c.fill();
  c.strokeStyle = rgba('#fff', 0.5 * (1 - p));
  c.lineWidth = 2;
  c.beginPath(); c.arc(0, 0, reach, -0.5, 0.5); c.stroke();
  c.restore();
  c.globalAlpha = 1;
}
