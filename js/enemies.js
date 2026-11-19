'use strict';
// ===== enemies.js : movement AI, telegraphs, projectiles, boss patterns =====

function eproj(x, y, a, spd, dmg, col, r, life) {
  if (G.eprojs.length > 400) G.eprojs.shift();
  G.eprojs.push({ x, y, vx: Math.cos(a) * spd, vy: Math.sin(a) * spd, dmg, col, r: r || 6, life: life || 4, t: 0 });
}
function updEprojs(dt) {
  const st = pstats();
  for (let i = G.eprojs.length - 1; i >= 0; i--) {
    const p = G.eprojs[i];
    p.t += dt;
    p.x += p.vx * dt; p.y += p.vy * dt;
    p.life -= dt;
    if (p.life <= 0) { G.eprojs.splice(i, 1); continue; }
    // dash i-frames pass through
    if (P.dash > 0) continue;
    if (dist(p.x, p.y, P.x, P.y) < p.r + P.r) {
      hurtPlayer(p.dmg, p);
      burst(p.x, p.y, p.col, 6, 140, 2.5);
      G.eprojs.splice(i, 1);
    }
  }
}

// gentle separation without grid: sample a few neighbors per enemy
function updEnemies(dt) {
  const st = pstats();
  const fullfreeze = st.fullfreeze;
  const n = G.enemies.length;
  // update all
  for (let i = 0; i < n; i++) {
    const e = G.enemies[i];
    if (!e || e.dead) continue;
    e.t += dt;
    e.flash = Math.max(0, (e.flash || 0) - dt);
    e.chill = Math.max(0, (e.chill || 0) - dt);
    e.frozen = Math.max(0, (e.frozen || 0) - dt);
    e.stun = Math.max(0, (e.stun || 0) - dt);
    // knockback decay
    e.x += e.kx * dt; e.y += e.ky * dt;
    const kd = Math.pow(0.0001, dt);
    e.kx *= kd; e.ky *= kd;
    if (e.boss) { updBoss(e, dt); continue; }
    if (e.frozen > 0 || e.stun > 0) continue;
    const chillM = e.chill > 0 ? 0.75 * (st.chillx !== undefined ? st.chillx : 1) : 1;
    const d = dist(P.x, P.y, e.x, e.y);
    const a = angTo(e.x, e.y, P.x, P.y);
    e.face = Math.cos(a) >= 0 ? 1 : -1;
    // shield slow by outer ring
    let shieldM = 1;
    if (d < st.outR) shieldM = lerp(0.6, 1, clamp(d / st.outR, 0, 1)); // outer slows 40%
    if (G.ch === 'rukia' && d < st.outR) chillEnemy(e, 0.4);
    // gojo Infinity: everything crawls asymptotically as it approaches the veil
    const infM = (st.infR && d < st.infR + e.r) ? INFTY.slow : 1;
    const followSpd = e.spd * chillM * shieldM * infM;
    // AI phases
    switch (e.type) {
      case 'hound': AIHound(e, dt, a, d, followSpd); break;
      case 'charger': AICharge(e, dt, a, d, followSpd); break;
      case 'spitter': AISpit(e, dt, a, d, followSpd); break;
      case 'bomber': AIBomb(e, dt, a, d, followSpd); break;
      case 'matron': AISummon(e, dt, a, d, followSpd); break;
      default: {
        // basic chaser with slight lane wobble
        const wob = Math.sin(e.t * 2 + e.x * 0.01) * 0.25;
        e.x += Math.cos(a + wob) * followSpd * dt;
        e.y += Math.sin(a + wob) * followSpd * dt;
      }
    }
    // separation (cheap: previous + next)
    if (QUAL.sep) {
      for (const off of [1, -1]) {
        const o = G.enemies[(i + off + n) % n];
        if (!o || o === e || o.dead) continue;
        const dd = dist(e.x, e.y, o.x, o.y);
        const mr = e.r + o.r;
        if (dd < mr && dd > 0.01) {
          const push = (mr - dd) / mr * 30 * dt;
          const pa = angTo(o.x, o.y, e.x, e.y);
          e.x += Math.cos(pa) * push; e.y += Math.sin(pa) * push;
        }
      }
    }
    // gojo Infinity: small enemies are crushed at the veil, never touch him
    if (st.infR && !e.dead && dist(P.x, P.y, e.x, e.y) < st.infR + e.r && infSmall(e)) {
      infCrush(e);
      continue;
    }
    // contact damage
    if (d < e.r + P.r + 2 && e.type !== 'bomber') {
      hurtPlayer(e.dmg, e);
    }
    if (e.type === 'bomber' && d < e.r + P.r) {
      hurtPlayer(e.dmg, e);
      // detonate
      e.hp = 0; killEnemy(e);
    }
  }
  // cull enemies that fled too far
  for (let i = G.enemies.length - 1; i >= 0; i--) {
    const e = G.enemies[i];
    if (!e.dead && dist(P.x, P.y, e.x, e.y) > 1600) {
      if (!e.boss) { e.dead = true; G.enemies.splice(i, 1); }
    }
  }
}

// --- AI behaviors ---
function AIHound(e, dt, a, d, spd) {
  // circles then lunges
  if (e.phase === 'run') {
    e.pT = Math.max(0, (e.pT || 0) - dt);
    // approach at angle offset (pack behavior)
    const off = (e.t % 4 < 2) ? 0.5 : -0.5;
    const aa = a + off * clamp(d / 300, 0, 1);
    e.x += Math.cos(aa) * spd * dt;
    e.y += Math.sin(aa) * spd * dt;
    if (d < 300 && e.pT <= 0) { e.phase = 'wind'; e.pT = 0.65; }
  } else if (e.phase === 'wind') {
    e.pT -= dt;
    // shiver telegraph
    e.x += rnd(-1, 1); e.y += rnd(-1, 1);
    if (e.pT <= 0) {
      e.phase = 'lunge';
      e.pT = 0.5;
      e.la = a;
      e.lspd = spd * 3.4;
      // ghost trail
      e.gt = [];
      SND.play('zap');
    }
  } else if (e.phase === 'lunge') {
    e.pT -= dt;
    e.x += Math.cos(e.la) * e.lspd * dt;
    e.y += Math.sin(e.la) * e.lspd * dt;
    e.gt = e.gt || [];
    e.gt.push({ x: e.x, y: e.y, life: 0.3 });
    if (e.gt.length > 8) e.gt.shift();
    if (e.pT <= 0) { e.phase = 'run'; e.pT = rnd(2, 3); }
  }
}
function AICharge(e, dt, a, d, spd) {
  if (e.phase === 'run') {
    e.pT = Math.max(0, (e.pT || 0) - dt);
    e.x += Math.cos(a) * spd * 0.5 * dt;
    e.y += Math.sin(a) * spd * 0.5 * dt;
    if (d < 420 && d > 80 && e.pT <= 0) { e.phase = 'wind'; e.pT = 0.65; e.ca = a; }
  } else if (e.phase === 'wind') {
    // slow drift, tracks player slightly
    e.pT -= dt;
    e.ca += clamp(angTo(e.x, e.y, P.x, P.y) - e.ca, -dt * 2, dt * 2);
    e.x += Math.cos(e.ca) * 15 * dt; e.y += Math.sin(e.ca) * 15 * dt;
    if (e.pT <= 0) { e.phase = 'charge'; e.pT = 0.8; SND.play('dash'); }
  } else if (e.phase === 'charge') {
    e.pT -= dt;
    e.x += Math.cos(e.ca) * spd * 3.2 * dt;
    e.y += Math.sin(e.ca) * spd * 3.2 * dt;
    if (e.pT <= 0) { e.phase = 'run'; e.pT = rnd(1, 2); }
  }
}
function AISpit(e, dt, a, d, spd) {
  // keeps 170-240 range band, fires eproj
  if (e.phase !== 'wind') {
    if (d > 240) {
      e.x += Math.cos(a) * spd * dt;
      e.y += Math.sin(a) * spd * dt;
    } else if (d < 170) {
      e.x -= Math.cos(a) * spd * 0.7 * dt;
      e.y -= Math.sin(a) * spd * 0.7 * dt;
    } else {
      // strafe
      e.x += Math.cos(a + Math.PI / 2) * spd * 0.5 * dt * (e.t % 6 < 3 ? 1 : -1);
      e.y += Math.sin(a + Math.PI / 2) * spd * 0.5 * dt * (e.t % 6 < 3 ? 1 : -1);
    }
    e.pT -= dt;
    if (e.pT <= 0 && d < 340) { e.phase = 'wind'; e.pT = 0.7; }
  } else {
    e.pT -= dt;
    if (e.pT <= 0) {
      e.phase = 'run';
      e.pT = rnd(1.6, 2.6);
      eproj(e.x, e.y, a, 260, e.dmg * 0.8, e.col, 5, 2.4);
      SND.play('zap');
      burst(e.x, e.y, e.col, 4, 80, 2);
    }
  }
}
function AIBomb(e, dt, a, d, spd) {
  // fuse counts down when close; explodes in a zone at 64px
  e.x += Math.cos(a) * spd * dt;
  e.y += Math.sin(a) * spd * dt;
  if (d < 64) {
    e.fuse = (e.fuse === undefined ? 0.85 : e.fuse) - dt;
    if (e.fuse <= 0) {
      zone(e.x, e.y, 90, 'rgba(255,120,60,0.35)', 0.9, e.dmg * 1.6);
      e.hp = 0;
      killEnemy(e);
    }
  } else {
    e.fuse = Math.min((e.fuse === undefined ? 0.85 : e.fuse) + dt, 0.85);
  }
}
function AISummon(e, dt, a, d, spd) {
  // channel 3.4s then spawn 2-3 wisps at portals
  if (e.phase !== 'wind') {
    if (d > 200) {
      e.x += Math.cos(a) * spd * dt;
      e.y += Math.sin(a) * spd * dt;
    }
    e.pT -= dt;
    if (e.pT <= 0) { e.phase = 'wind'; e.pT = 3.4; }
  } else {
    e.pT -= dt;
    if (e.pT <= 0) {
      e.phase = 'run';
      e.pT = rnd(4, 6);
      const cnt = 2 + irnd(0, 1);
      for (let i = 0; i < cnt; i++) {
        const sa = rnd(TAU);
        const w = spawnEnemy('wisp', e.x + Math.cos(sa) * 46, e.y + Math.sin(sa) * 46, false, true);
        if (w) {
          w.portalOf = e;
          part(w.x, w.y, '#c58aff', 8, 90, 3);
        }
      }
      SND.play('boom');
    }
  }
}

// --- boss patterns ---
function updBoss(e, dt) {
  const st = pstats();
  const a = angTo(e.x, e.y, P.x, P.y);
  const d = dist(e.x, e.y, P.x, P.y);
  e.face = Math.cos(a) >= 0 ? 1 : -1;
  // true freeze (rukia Bankai, 3s cap): boss moves at 15% and cannot act
  const frozenM = e.frozen > 0 ? 0.15 : 1;
  const spd = e.spd * (e.chill > 0 ? 0.85 : 1) * frozenM;
  switch (e.phase) {
    case 'idle': case 'run': {
      if (e.frozen > 0) break;
      // reposition
      if (d > 200) { e.x += Math.cos(a) * spd * dt; e.y += Math.sin(a) * spd * dt; }
      else if (d < 140) { e.x -= Math.cos(a) * spd * 0.5 * dt; e.y -= Math.sin(a) * spd * 0.5 * dt; }
      else {
        e.x += Math.cos(a + Math.PI / 2) * spd * 0.4 * dt * (e.t % 8 < 4 ? 1 : -1);
        e.y += Math.sin(a + Math.PI / 2) * spd * 0.4 * dt * (e.t % 8 < 4 ? 1 : -1);
      }
      e.pT -= dt;
      if (e.pT <= 0) {
        e.phase = 'wind';
        e.pT = 0.85;
        e.act = irnd(1, 3);
        // pre-move
        e.actDir = a;
      }
      break;
    }
    case 'wind': {
      if (e.frozen > 0) break;
      // telegraph: shiver + ring
      e.pT -= dt;
      if (e.pT <= 0) {
        doBossAct(e, a);
        e.phase = 'run';
        e.pT = rnd(2.2, 3.4);
      }
      break;
    }
    case 'charge': {
      e.pT -= dt;
      e.x += Math.cos(e.actDir) * spd * 3 * dt;
      e.y += Math.sin(e.actDir) * spd * 3 * dt;
      if (e.pT <= 0) { e.phase = 'run'; e.pT = rnd(1.4, 2.2); }
      break;
    }
    case 'pull': {
      e.pT -= dt;
      const pa = angTo(P.x, P.y, e.x, e.y);
      P.x += Math.cos(pa) * 180 * dt * (P.dash <= 0 ? 1 : 0);
      P.y += Math.sin(pa) * 180 * dt * (P.dash <= 0 ? 1 : 0);
      if (e.pT <= 0) { e.phase = 'run'; e.pT = rnd(2, 3); }
      break;
    }
  }
  // contact damage
  if (d < e.r + P.r) {
    if (st.infR && infSmall(e)) { infCrush(e); return; }
    hurtPlayer(e.dmg, e);
  }
}
function doBossAct(e, a) {
  const st = pstats();
  switch (e.bossId) {
    case 'gravelord': {
      // 1: slam zone at player; 2: radial projectiles; 3: charge
      if (e.act === 1) {
        zone(P.x, P.y, 110, 'rgba(120,160,220,0.4)', 1.0, e.dmg * 1.2);
        CAM.kick(6);
      } else if (e.act === 2) {
        for (let i = 0; i < 10; i++) eproj(e.x, e.y, (i / 10) * TAU, 210, e.dmg * 0.7, '#8ab8ff', 6, 3.2);
        SND.play('zap');
      } else {
        e.phase = 'charge'; e.pT = 0.9; e.actDir = a;
        CAM.kick(4);
      }
      break;
    }
    case 'nightmother': {
      if (e.act === 1) {
        // pull
        e.phase = 'pull'; e.pT = 1.1;
        ring(e.x, e.y, 20, 400, '#c58aff', 4, 0.7);
      } else if (e.act === 2) {
        // spawn 3 husks
        for (let i = 0; i < 3; i++) {
          const sa = rnd(TAU);
          spawnEnemy(pick(['husk', 'wisp', 'hound']), e.x + Math.cos(sa) * 70, e.y + Math.sin(sa) * 70, false, true);
        }
        burst(e.x, e.y, '#c58aff', 14, 160, 3);
      } else {
        // spiral burst
        for (let i = 0; i < 12; i++) eproj(e.x, e.y, a + (i - 6) * 0.22, 240, e.dmg * 0.7, '#c58aff', 6, 3);
        SND.play('zap');
      }
      break;
    }
    case 'ashking': {
      if (e.act === 1) {
        // burn strips at player
        const per = Math.PI / 6;
        for (let i = -2; i <= 2; i++) {
          const aa = a + i * per;
          zone(P.x + Math.cos(aa) * 90 * i, P.y + Math.sin(aa) * 90 * i, 70, 'rgba(255,140,60,0.4)', 1.4, e.dmg);
        }
        CAM.kick(6);
      } else if (e.act === 2) {
        // nova ring of short-range zones
        for (let i = 0; i < 8; i++) {
          const aa = (i / 8) * TAU;
          zone(e.x + Math.cos(aa) * 160, e.y + Math.sin(aa) * 160, 60, 'rgba(255,140,60,0.35)', 1.2, e.dmg * 0.9);
        }
        SND.play('boom');
      } else {
        e.phase = 'charge'; e.pT = 1.0; e.actDir = a;
        flash('#ff8a3a', 0.15);
      }
      break;
    }
    case 'devourer': {
      if (e.act === 1) {
        // devour pull + radial
        e.phase = 'pull'; e.pT = 1.3;
        ring(e.x, e.y, 30, 500, '#8f5aff', 5, 0.9);
        for (let i = 0; i < 5; i++) eproj(e.x, e.y, rnd(TAU), 180, e.dmg * 0.6, '#8f5aff', 7, 3);
      } else if (e.act === 2) {
        // dense ring
        for (let i = 0; i < 12; i++) eproj(e.x, e.y, (i / 12) * TAU, 200, e.dmg * 0.7, '#8f5aff', 7, 3.4);
        SND.play('boss');
      } else {
        // summon shards
        for (let i = 0; i < 4; i++) {
          const sa = rnd(TAU);
          spawnEnemy(pick(['shard', 'hound', 'charger']), e.x + Math.cos(sa) * 80, e.y + Math.sin(sa) * 80, false, true);
        }
        burst(e.x, e.y, '#8f5aff', 16, 200, 4);
      }
      break;
    }
  }
}
