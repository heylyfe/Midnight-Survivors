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

function drawWeapons(c) {
  const st = pstats();
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
    c.translate(b.x, b.y);
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
  if (!P.swing) return;
  const s = P.swing;
  const p = clamp(s.t / s.dur, 0, 1);
  const sweep = easeOut(p) * 2.4 - 1.2;
  const reach = 120 * pstats().area;
  c.save();
  c.translate(P.x, P.y);
  c.globalAlpha = 1 - p;
  c.save();
  c.rotate(s.a + sweep);
  // layered crescent: soft outer, saturated band, bright core
  const g = c.createLinearGradient(0, 0, reach, 0);
  g.addColorStop(0, rgba(s.col, 0.06));
  g.addColorStop(0.55, rgba(s.col, 0.3));
  g.addColorStop(1, rgba(s.col, 0.5));
  c.fillStyle = g;
  c.beginPath();
  c.arc(0, 0, reach, -0.55, 0.55);
  c.arc(0, 0, reach * 0.55, 0.55, -0.55, true);
  c.closePath(); c.fill();
  // hot band near the cutting edge
  const g2 = c.createLinearGradient(0, 0, reach, 0);
  g2.addColorStop(0.55, rgba(s.col, 0));
  g2.addColorStop(0.92, rgba(s.col, 0.5));
  g2.addColorStop(1, rgba('#fff', 0.55));
  c.fillStyle = g2;
  c.beginPath();
  c.arc(0, 0, reach, -0.5, 0.5);
  c.arc(0, 0, reach * 0.82, 0.5, -0.5, true);
  c.closePath(); c.fill();
  // bright leading edge
  c.strokeStyle = rgba('#fff', 0.6);
  c.lineWidth = 2;
  c.beginPath(); c.arc(0, 0, reach, -0.52, 0.52); c.stroke();
  c.strokeStyle = rgba(s.col, 0.5);
  c.lineWidth = 1;
  c.beginPath(); c.arc(0, 0, reach * 0.82, -0.48, 0.48); c.stroke();
  c.restore();

  // per-character flavor
  if (G.ch === 'ichigo' && QUAL.decor) {
    // getsu echo arcs
    for (let i = 1; i <= 2; i++) {
      c.strokeStyle = rgba('#ffb06a', 0.34 - i * 0.1);
      c.lineWidth = 2.2 - i * 0.6;
      c.save();
      c.rotate(-(sweep) - i * 0.5);
      c.beginPath(); c.arc(0, 0, reach - 3, -0.4, 0.4); c.stroke();
      c.restore();
    }
    if (p < 0.55) {
      c.fillStyle = 'rgba(255,230,190,0.9)';
      const ta = s.a + sweep - 0.15;
      star4(c, Math.cos(ta) * reach, Math.sin(ta) * reach, 3.4 * (1 - p), 1.4);
    }
  } else if (G.ch === 'rukia' && QUAL.decor) {
    // frost sparkles along the arc
    for (let i = 0; i < 5; i++) {
      const aa = s.a + sweep + 0.1 - i * 0.28;
      const rr = reach * (0.7 + (i % 3) * 0.1);
      c.fillStyle = rgba('#c8f0ff', 0.8 - i * 0.12);
      star4(c, Math.cos(aa) * rr, Math.sin(aa) * rr, 2.6 - i * 0.3, 1.1);
    }
  } else if (G.ch === 'frieren' && QUAL.decor) {
    // rune ticks along the arc
    for (let i = 0; i < 6; i++) {
      const aa = s.a + sweep + 0.05 - i * 0.2;
      const rr = reach * 0.9;
      c.save();
      c.translate(Math.cos(aa) * rr, Math.sin(aa) * rr);
      c.rotate(aa + Math.PI / 2);
      c.strokeStyle = rgba('#bfe8ff', 0.55 - i * 0.06);
      c.lineWidth = 1;
      c.beginPath();
      c.moveTo(-1.6, -2.4); c.lineTo(1.6, -2.4); c.lineTo(0, -2.4); c.lineTo(-1.2, 2.4);
      c.stroke();
      c.restore();
    }
  } else if (G.ch === 'kaido') {
    // full-ring shockwave (Thunder Bagua smash)
    if (p < 0.7) {
      const rr = reach * (0.55 + p * 0.9);
      c.strokeStyle = rgba('#ffe8a0', 0.55 * (1 - p));
      c.lineWidth = 2 + 3 * (1 - p);
      c.beginPath(); c.arc(0, 0, rr, 0, TAU); c.stroke();
      // impact wedges
      c.strokeStyle = rgba('#ffd76a', 0.4 * (1 - p));
      c.lineWidth = 2;
      for (let i = 0; i < 8; i++) {
        const aa = (i / 8) * TAU;
        c.beginPath();
        c.moveTo(Math.cos(aa) * rr, Math.sin(aa) * rr);
        c.lineTo(Math.cos(aa) * (rr + 8), Math.sin(aa) * (rr + 8));
        c.stroke();
      }
    }
  } else if (G.ch === 'gojo' && QUAL.decor) {
    // double crescent: blue + red karmic flip overlay
    c.save();
    c.rotate(s.a + sweep + 0.3);
    c.fillStyle = rgba('#ff5a5a', 0.3);
    c.beginPath();
    c.arc(0, 0, reach * 0.92, -0.4, 0.4);
    c.arc(0, 0, reach * 0.62, 0.4, -0.4, true);
    c.closePath(); c.fill();
    c.restore();
    c.fillStyle = rgba('#5aa0ff', 0.2);
    c.beginPath();
    c.arc(0, 0, reach * 1.08, -0.42, 0.42);
    c.arc(0, 0, reach * 0.9, 0.42, -0.42, true);
    c.closePath(); c.fill();
  }

  c.restore();
  c.globalAlpha = 1;
}
