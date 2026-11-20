'use strict';
// ===== ults.js : cinematic ultimates with camera work =====
// Each ult: charge -> cinematic (zoom, rotation, slow-mo, letterbox) -> payoff
// Kill caps keep them strong but not screen-wipes.

const ULT_AIM_TIME = 3;

function autoUltDirection(range) {
  const nearby = G.enemies.filter(e => !e.dead && dist(P.x, P.y, e.x, e.y) <= range)
    .map(e => ({ d: dist(P.x, P.y, e.x, e.y), a: angTo(P.x, P.y, e.x, e.y) }));
  let best = 0, angle = P.face < 0 ? Math.PI : 0;
  for (const target of nearby) {
    let score = 0;
    for (const enemy of nearby) {
      if (Math.cos(enemy.a - target.a) >= Math.cos(0.35)) score += 1 - enemy.d / (range * 2);
    }
    if (score > best) { best = score; angle = target.a; }
  }
  return angle;
}

const ULT = {
  id: null, t: 0, active: false,
  data: null, aimLeft: 0, aim: 0,
  can() { return G.state === 'run' && P.ultq >= ULT_MAX; },
  request() {
    if (!this.can() || G.paused) return false;
    if (!ULTDEF[G.ch].aimRange || this.aimLeft > 0) return this.cast();
    this.aimLeft = ULT_AIM_TIME;
    return true;
  },
  tickAim(dt) {
    this.aimLeft = Math.max(0, this.aimLeft - dt);
    if (this.aimLeft === 0) this.cast();
  },
  cast(direction) {
    if (!this.can()) { SND.play('deny'); return false; }
    this.id = G.ch;
    this.data = ULTDEF[this.id];
    if (!this.data) return false;
    this.aimLeft = 0;
    if (this.data.aimRange) {
      this.aim = Number.isFinite(direction) ? direction : autoUltDirection(this.data.aimRange);
      if (Math.abs(Math.cos(this.aim)) > 0.1) P.face = Math.sign(Math.cos(this.aim));
    }
    this.t = 0;
    this.active = true;
    this.kills = 0;
    P.ultq = 0;
    G.state = 'cin';
    cnt('ults');
    if ((SAVE.cnt.ults || 0) >= 10) checkAch('ult10');
    SND.play('ult');
    SND.heat = 1;
    UI.letterbox(true);
    UI.banner(this.data.name, this.data.sub, 2400, this.data.tint);
    CAM.zoom(this.data.zoom0 || 1.45, 0.7);
    CAM.rotTo(0, 0.1);
    CAM.follow = 6;
    if (this.data.begin) this.data.begin(this);
    return true;
  },
  end() {
    this.active = false;
    this.id = null;
    G.state = 'run';
    G.ts = 1;
    UI.letterbox(false);
    CAM.zoom(1, 0.6);
    CAM.rotTo(0, 0.5);
    CAM.follow = 5;
    // clear per-ult fx state
    P.lev = 0;
    this.o = null;
  },
  upd(dt) {
    if (!this.active) return;
    this.t += dt;
    const d = this.data;
    const dur = (typeof d.dur === 'function') ? d.dur(this) : d.dur;
    if (this.t >= dur) { this.end(); return; }
    try { d.upd(this, dt); } catch (e) {}
  },
  damage(e, dmg, opt) {
    opt = opt || {};
    const st = pstats();
    dmg *= st.dmg;
    if (e.hp - dmg > 0) {
      // soft cap: each ult can only kill X% of enemies by raw damage floor
      e.hp -= dmg;
      e.flash = 0.1;
      if (!opt.silent) pop(e.x, e.y - e.r, Math.round(dmg), opt.col || this.data.tint);
    } else {
      // kill attempt: respect cap (unless the ult ignores caps)
      const capF = this.data.noCap ? 1e9 : this.data.cap * (G.enemies.length + 8);
      if (opt.noCap || this.kills < capF) {
        this.kills++;
        killEnemy(e);
      } else {
        e.hp = 1; // survives at a sliver, style points
        e.flash = 0.2;
      }
    }
  },
  killArea(x, y, r, capFrac, dmg, opt) {
    opt = opt || {};
    const list = G.enemies.filter(e => !e.dead && dist(x, y, e.x, e.y) < r + e.r);
    const cap = Math.max(3, Math.ceil(capFrac * (G.enemies.length + 6)));
    const sorted = list.sort((a, b) => a.boss ? 1 : (b.boss ? -1 : dist(x, y, a.x, a.y) - dist(x, y, b.x, b.y)));
    let k = 0;
    for (const e of sorted) {
      if (!e.boss && k < cap && e.hp <= dmg * 3) { this.kills++; k++; killEnemy(e); }
      else if (e.boss) this.damage(e, dmg * 0.6, { silent: false });
      else this.damage(e, dmg, opt);
    }
  },
  pull(x, y, r, dirSign, str) {
    for (const e of G.enemies) {
      if (e.dead || e.boss) continue;
      const d = dist(x, y, e.x, e.y);
      if (d < r) {
        const a = angTo(x, y, e.x, e.y);
        const m = str * Math.pow(1 - d / r, 1.5) * G.dt;
        e.x -= Math.cos(a) * m * dirSign * (dirSign > 0 ? -1 : 1) * -1;
        e.y -= Math.sin(a) * m * dirSign * (dirSign > 0 ? -1 : 1) * -1;
      }
    }
  },
  reviveNuke() {
    // GOJO: "Nah, I'd win." death-defy -> hollow purple nuke
    banner("Nah, I'd Win.", 'Hollow Purple: Imagination', 2400, '#a05aff');
    SND.play('ult');
    this.id = 'gojo';
    this.data = ULTDEF.gojo;
    this.active = true;
    this.kills = 0;
    this.t = HOLLOW_PURPLE_RELEASE - 0.25;
    if (this.data.begin) this.data.begin(this);
    G.state = 'cin';
    UI.letterbox(true);
    CAM.zoom(1.6, 0.4);
  },
  o: null, // scratch state per cast
};

const HOLLOW_PURPLE_RELEASE = 1.05;
const HOLLOW_PURPLE_RADIUS = 650;
const HOLLOW_PURPLE_EXPANSION = 0.56;

function purpleOrb(c, x, y, r, color) {
  const glow = c.createRadialGradient(x, y, 0, x, y, r * 2.4);
  glow.addColorStop(0.08, '#fff');
  glow.addColorStop(0.30, color);
  glow.addColorStop(1, rgba(color, 0));
  c.fillStyle = glow;
  c.beginPath(); c.arc(x, y, r * 2.4, 0, TAU); c.fill();
}

const ULTDEF = {
  // ================= GOJO : HOLLOW PURPLE =================
  gojo: {
    name: 'HOLLOW PURPLE', sub: 'Red and Blue converge', tint: '#c288ff', zoom0: 1.27,
    dur: 2.05,
    noCap: true,
    characterNote: 'On death: revives once and auto-casts this',
    effStrings: ['Damages every enemy in a wide radius, including bosses'],
    ts(t) { return t < HOLLOW_PURPLE_RELEASE ? 0.10 : 0.45; },
    charOpts: { eyeMode: 'six' },
    begin(U) {
      U.o = { x: P.x, y: P.y, hit: new Set(), released: false };
    },
    upd(U) {
      const o = U.o;
      const elapsed = U.t - HOLLOW_PURPLE_RELEASE;
      if (elapsed < 0) return;
      if (!o.released) {
        o.released = true;
        CAM.kick(12);
        CAM.zoom(0.92, 0.35);
        SND.play('boom');
        burst(o.x, o.y, '#c288ff', 24, 390, 4);
      }
      const radius = HOLLOW_PURPLE_RADIUS * easeOut(clamp(elapsed / HOLLOW_PURPLE_EXPANSION, 0, 1));
      for (const e of [...G.enemies]) {
        if (e.dead || o.hit.has(e) || dist(o.x, o.y, e.x, e.y) > radius + e.r) continue;
        o.hit.add(e);
        U.damage(e, e.boss ? 220 + P.level * 14 : 280 + P.level * 18, { silent: true });
        burst(e.x, e.y, '#c288ff', 4, 120, 2.5);
      }
    },
    draw(c, U) {
      const { x, y } = U.o;
      const elapsed = U.t - HOLLOW_PURPLE_RELEASE;
      c.save();
      if (elapsed < 0) {
        const charge = clamp(U.t / HOLLOW_PURPLE_RELEASE, 0, 1);
        const orbit = (1 - ease(charge)) * 83;
        const angle = charge * Math.PI * 1.4;
        const colors = ['#6ea6ff', '#f57392'];
        for (let i = 0; i < colors.length; i++) {
          const a = angle + i * Math.PI;
          c.strokeStyle = rgba(colors[i], 0.55 * (1 - charge));
          c.lineWidth = 2;
          c.beginPath(); c.ellipse(x, y - 28, orbit + 0.1, orbit * 0.46 + 0.1, 0, a - 0.85, a); c.stroke();
          purpleOrb(c, x + Math.cos(a) * orbit, y - 28 + Math.sin(a) * orbit * 0.46, 8, colors[i]);
        }
        if (charge > 0.74) purpleOrb(c, x, y - 28, 10 + (charge - 0.74) * 38, '#b768ff');
      } else {
        const progress = clamp(elapsed / HOLLOW_PURPLE_EXPANSION, 0, 1);
        const radius = Math.max(1, HOLLOW_PURPLE_RADIUS * easeOut(progress));
        const fade = 1 - clamp((elapsed - HOLLOW_PURPLE_EXPANSION * 0.55) / 0.64, 0, 1);
        const glow = c.createRadialGradient(x, y, 0, x, y, radius);
        glow.addColorStop(0, rgba('#8a46dc', 0.12 * fade));
        glow.addColorStop(0.85, rgba('#7c31d8', 0.15 * fade));
        glow.addColorStop(1, rgba('#b768ff', 0.54 * fade));
        c.fillStyle = glow;
        c.strokeStyle = rgba('#e4c6ff', 0.80 * fade);
        c.lineWidth = 3 + 5 * (1 - progress);
        c.beginPath(); c.arc(x, y, radius, 0, TAU); c.fill(); c.stroke();
        c.strokeStyle = rgba('#9760ff', 0.6 * fade);
        c.lineWidth = 2;
        c.beginPath(); c.arc(x, y, radius * 0.84, 0, TAU); c.stroke();
        if (elapsed < 0.2) {
          c.globalAlpha = 1 - elapsed / 0.2;
          purpleOrb(c, x, y - 18, 18 + elapsed * 30, '#b768ff');
        }
      }
      c.restore();
    },
  },
  // ================= ICHIGO : GETSUGA TENSHO =================
  ichigo: {
    aimRange: 1200, name: 'GETSUGA TENSHO', sub: 'Moon Fang Heaven-Piercer', tint: '#ff8a3a', dur: 4.2, zoom0: 1.5,
    cap: 0.8,
    ts(t) { return t < 1.32 ? 0.14 : t < 1.9 ? 0.3 : 0.55; },
    charOpts: {},
    begin(U) {
      U.o = { cres: null, swing: false, hollowFlare: P.hp / pstats().mhp < 0.35 };
      CAM.rotTo(-0.05, 0.9);
      CAM.zoom(1.6, 0.8);
    },
    upd(U, dt) {
      const o = U.o;
      if (U.t < 1.32) {
        // energy gathers into blade
        if (Math.random() < 0.9) {
          const a = rnd(TAU), d = rnd(60, 200);
          part(P.x + Math.cos(a) * d, P.y + Math.sin(a) * d, o.hollowFlare && Math.random() < 0.4 ? '#fff' : '#ff8a3a', 1, 90, 2, 'ghost');
        }
        P.atkPose = clamp(U.t / 1.2, 0, 1);
      } else if (!o.swing) {
        o.swing = { x: P.x, y: P.y, r: 80, t: 0, a: U.aim, hit: new Set() };
        flash(o.hollowFlare ? '#fff' : '#ff8a3a', 0.5);
        CAM.kick(12);
        SND.play('boom');
        CAM.rotTo(0.1, 0.4);
        CAM.zoom(1.35, 0.3);
        banner('GETSUGA', 'TENSHO', 1200, '#ff8a3a');
      }
      if (o.swing && !o.swing.done) {
        o.swing.t += dt;
        o.swing.r += 900 * dt;
        o.swing.x += Math.cos(o.swing.a) * 620 * dt;
        o.swing.y += Math.sin(o.swing.a) * 620 * dt;
        // wedge hit
        const cap = Math.max(5, Math.ceil(0.8 * (G.enemies.length + 8)));
        for (const e of [...G.enemies]) {
          if (e.dead) continue;
          const d = dist(o.swing.x, o.swing.y, e.x, e.y);
          const forward = (e.x - P.x) * Math.cos(o.swing.a) + (e.y - P.y) * Math.sin(o.swing.a);
          const coneEdge = dist(P.x, P.y, e.x, e.y) * Math.cos(1.15);
          if (forward + e.r >= coneEdge && d < o.swing.r + e.r && !o.swing.hit.has(e)) {
            o.swing.hit.add(e);
            if (!e.boss && U.kills < cap && e.hp <= 55 * pstats().dmg) { U.kills++; killEnemy(e); burst(e.x, e.y, '#ff8a3a', 8, 260, 3.5); }
            else if (e.boss) U.damage(e, 130, {});
            else U.damage(e, 90, { col: '#ff8a3a' });
          }
        }
        part(o.swing.x, o.swing.y + rnd(-40, 40), '#ff8a3a', 2, 160, 3, 'ghost');
        if (o.swing.t > 1.4) { o.swing.done = true; }
      }
      if (U.t > 3.6) CAM.zoom(1.1, 0.8);
    },
    draw(c, U) {
      const o = U.o;
      if (!o) return;
      if (U.t < 1.32) {
        // charging blade aura
        const k = U.t / 1.32;
        c.save();
        c.translate(P.x + (P.face > 0 ? 16 : -16), P.y - 12);
        c.rotate(P.face > 0 ? -0.5 : Math.PI + 0.5);
        const gg = c.createLinearGradient(0, 0, 0, -70 * k);
        gg.addColorStop(0, rgba('#ff8a3a', 0.9));
        gg.addColorStop(1, rgba(o.hollowFlare ? '#fff' : '#ffd76a', 0.1));
        c.fillStyle = gg;
        c.beginPath();
        c.moveTo(-4, 0); c.lineTo(4, 0); c.lineTo(14, -30 * k); c.lineTo(2, -70 * k); c.lineTo(-9, -34 * k);
        c.closePath(); c.fill();
        c.restore();
      }
      if (o.swing && !o.swing.done) {
        const s = o.swing;
        const fade = clamp(1 - s.t / 1.3, 0, 1);
        c.save();
        c.translate(s.x, s.y);
        c.rotate(s.a);
        c.globalAlpha = fade;
        // giant crescent
        const g = c.createLinearGradient(-s.r * 0.6, 0, s.r, 0);
        g.addColorStop(0, rgba('#3a1a08', 0.1));
        g.addColorStop(0.5, o.hollowFlare ? '#fff' : '#ff8a3a');
        g.addColorStop(1, rgba('#ffd76a', 0));
        c.fillStyle = g;
        c.beginPath();
        c.arc(0, 0, s.r, -1.15, 1.15);
        c.arc(-s.r * 1.15, 0, s.r * 0.72, 1.0, -1.0, true);
        c.closePath();
        c.fill();
        // rim
        c.strokeStyle = rgba('#fff', 0.6 * fade);
        c.lineWidth = 2.5;
        c.beginPath(); c.arc(0, 0, s.r, -1.05, 1.05); c.stroke();
        c.restore();
        c.globalAlpha = 1;
      }
    },
  },
  // ================= RUKIA : HAKKA NO TOGAME =================
  rukia: {
    name: 'HAKKA NO TOGAME', sub: 'Bankai — White Haze Punishment', tint: '#9fe8ff', dur: 5.4, zoom0: 1.35,
    cap: 0.6,
    ts(t) { return t < 0.9 ? 0.12 : t < 4.3 ? 0.3 : 0.6; },
    charOpts: { form: 'rukia' },
    begin(U) {
      U.o = { pillars: [], shatter: false };
      P.form = 'rukia'; P.formT = 30;   // Bankai form for 30s after the cast
      CAM.zoom(1.35, 1.0);
      CAM.rotTo(0.03, 1.5);
    },
    upd(U, dt) {
      const o = U.o;
      if (U.t < 0.9) {
        // wave charge
        if (Math.random() < 0.9) part(P.x + rnd(-40, 40), P.y + rnd(-40, 40), '#cfeaff', 2, 80, 2, 'ghost');
      } else if (!o.wave) {
        o.wave = { r: 60 };
        flash('#eaffff', 0.6);
        CAM.kick(10);
        SND.play('boom');
        banner('HAKKA', 'NO TOGAME', 1400, '#9fe8ff');
      }
      if (o.wave) {
        // freezing wave 1500px
        o.wave.r += 1500 * dt / 1.2;
        for (const e of G.enemies) {
          if (e.dead) continue;
          const d = dist(P.x, P.y, e.x, e.y);
          if (d < o.wave.r && d > o.wave.r - 120) {
            freezeEnemy(e, 5, true);           // ~5s freeze; bosses get 3s
            e.chill = 0;
          }
        }
        if (o.wave.r < 300 && o.wave.r % 7 < 40) part(P.x + rnd(-o.wave.r, o.wave.r), P.y + rnd(-o.wave.r, o.wave.r), '#eaffff', 1, 60, 2, 'ghost');
      }
      // pillars form on frozen clusters
      if (U.t > 1.6 && U.t < 3.0 && o.pillars.length < 8 && Math.random() < dt * 4) {
        const fz = G.enemies.filter(e => !e.dead && e.frozen > 0 && !o.pillars.some(p => dist(p.x, p.y, e.x, e.y) < 120));
        if (fz.length) {
          const e = pick(fz);
          o.pillars.push({ x: e.x, y: e.y, h: 0, w: 46 + P.level * 3 });
          SND.play('crit');
        }
      }
      for (const p of o.pillars) p.h = Math.min(120, p.h + dt * 300);
      // shatter at 4.2: frozen enemies under 35% die
      if (U.t >= 4.2 && !o.shatter) {
        o.shatter = true;
        flash('#fff', 0.7);
        CAM.kick(14);
        SND.play('boom');
        CAM.zoom(1.5, 0.3);
        banner('SHATTER', '', 1000, '#fff');
        const cap = Math.max(4, Math.ceil(0.6 * (G.enemies.length + 8)));
        const st = pstats();
        for (const e of [...G.enemies]) {
          if (e.dead || e.boss) continue;
          if (e.frozen > 0 && e.hp / e.mhp < 0.55 + P.level * 0.005) {
            if (U.kills < cap) { U.kills++; killEnemy(e); burst(e.x, e.y, '#cfeaff', 10, 300, 3.5); }
          }
        }
        for (const p of o.pillars) part(p.x, p.y, '#eaffff', 14, 340, 4, 'ghost');
      }
      if (U.t > 4.8) CAM.zoom(1.1, 0.9);
    },
    draw(c, U) {
      const o = U.o;
      if (!o) return;
      if (o.wave) {
        const wr = o.wave.r;
        c.strokeStyle = rgba('#eaffff', clamp(1 - U.t / 2.4, 0, 0.9));
        c.lineWidth = 8;
        c.beginPath(); c.arc(P.x, P.y, wr, 0, TAU); c.stroke();
        c.strokeStyle = rgba('#9fe8ff', clamp(1 - U.t / 2.8, 0, 0.6));
        c.lineWidth = 3;
        c.beginPath(); c.arc(P.x, P.y, wr * 0.85, 0, TAU); c.stroke();
      }
      for (const p of o.pillars) {
        c.save();
        c.translate(p.x, p.y);
        const sf = clamp(p.h / 120, 0, 1);
        const g = c.createLinearGradient(0, 0, 0, -p.h);
        g.addColorStop(0, rgba('#9fe8ff', 0.65));
        g.addColorStop(1, rgba('#fff', 0.1));
        c.fillStyle = g;
        c.beginPath();
        c.moveTo(-p.w / 2, 0);
        c.lineTo(-p.w * 0.3, -p.h);
        c.lineTo(0, -p.h * (1 - 0.05));
        c.lineTo(p.w * 0.3, -p.h);
        c.lineTo(p.w / 2, 0);
        c.closePath(); c.fill();
        // facets
        c.strokeStyle = rgba('#fff', 0.5);
        c.lineWidth = 1;
        c.beginPath();
        c.moveTo(-p.w * 0.15, 0); c.lineTo(-p.w * 0.08, -p.h);
        c.moveTo(p.w * 0.15, 0); c.lineTo(p.w * 0.1, -p.h);
        c.stroke();
        c.restore();
      }
    },
  },
  // ================= FRIEREN : ZOLTRAAK =================
  frieren: {
    aimRange: 1200, name: 'ZOLTRAK BARRAGE', sub: 'The Mage Who Killed 1000 Spells', tint: '#8fd8ff', dur: 4.8, zoom0: 1.3,
    cap: 0.85,
    ts(t) { return t < 1.7 ? 0.18 : t < 2.6 ? 0.35 : 0.6; },
    charOpts: {},
    begin(U) {
      U.o = { targets: [], fired: 0, bigBeam: false };
      CAM.zoom(1.3, 0.9);
      CAM.rotTo(-0.03, 1.2);
    },
    upd(U, dt) {
      const o = U.o;
      const st = pstats();
      if (U.t < 1.7) {
        // select up to 16 targets
        if (o.targets.length < 24) {
          const cand = G.enemies.filter(e => !e.dead && !o.targets.includes(e) && dist(P.x, P.y, e.x, e.y) < 900);
          if (cand.length && Math.random() < dt * 8) {
            const e = pick(cand);
            o.targets.push(e);
            SND.play('tick');
          }
        }
        // mana snow
        if (Math.random() < 0.8) part(P.x + rnd(-30, 30), P.y + rnd(-20, 20), '#cfe8ff', 1, 60, 2, 'ghost');
        P.atkPose = clamp(U.t / 1.4, 0, 1);
      }
      // fire beams at t>=1.7, one every 0.06s
      if (U.t >= 1.7 && o.fired < o.targets.length) {
        o._ft = (o._ft || 0) + dt;
        while (o._ft > 0.06 && o.fired < o.targets.length) {
          o._ft -= 0.06;
          const e = o.targets[o.fired++];
          if (!e.dead) {
            beam(P.x, P.y - 10, e.x, e.y, '#8fd8ff', 3, 0.28);
            U.damage(e, 20, { col: '#cfe8ff' });
            SND.play('zap');
            burst(e.x, e.y, '#cfe8ff', 4, 160, 2.5);
          }
        }
        banner('ZOLTRAAK', o.fired + ' spells', 1200, '#8fd8ff');
      }
      // The finisher sweeps around the selected direction.
      if (U.t >= 2.6 && !o.bigBeam) {
        o.bigBeam = { a0: U.aim, t: 0, dir: 1 };
        flash('#fff', 0.4);
        CAM.kick(10);
        SND.play('boom');
        banner('DIAGONALE', 'des Zauberlehrlings', 1600, '#fff');
      }
      if (o.bigBeam) {
        const bb = o.bigBeam;
        bb.t += dt;
        const sweepA = bb.a0 + Math.sin(bb.t * 1.4) * 0.7;
        const len = 1200;
        const ex = P.x + Math.cos(sweepA) * len, ey = P.y + Math.sin(sweepA) * len;
        bb.ex = ex; bb.ey = ey; bb.a = sweepA;
        // damage along the line
        const cap = Math.max(6, Math.ceil(0.85 * (G.enemies.length + 8)));
        for (const e of [...G.enemies]) {
          if (e.dead) continue;
          // point-line distance
          const dx = ex - P.x, dy = ey - P.y;
          const L2 = dx * dx + dy * dy;
          let t = ((e.x - P.x) * dx + (e.y - P.y) * dy) / L2;
          t = clamp(t, 0, 1);
          const px2 = P.x + dx * t, py2 = P.y + dy * t;
          if (dist(e.x, e.y, px2, py2) < 60 + e.r) {
            bb.hit = bb.hit || new Set();
            const hkey = e.x1 || (e.x1 = Symbol());
            if (!bb.hit.has(hkey)) {
              bb.hit.add(hkey);
              if (!e.boss && U.kills < cap && e.hp <= 70 * pstats().dmg) { U.kills++; killEnemy(e); burst(e.x, e.y, '#8fd8ff', 6, 240, 3); }
              else if (e.boss) U.damage(e, 90, {});
              else U.damage(e, 65, { col: '#8fd8ff' });
            }
          }
        }
        part(P.x + Math.cos(sweepA) * rnd(100, 900), P.y + Math.sin(sweepA) * rnd(100, 900), '#cfe8ff', 2, 200, 3, 'ghost');
      }
      if (U.t > 4.2) CAM.zoom(1.1, 0.8);
    },
    draw(c, U) {
      const o = U.o;
      if (!o) return;
      // target reticles
      if (U.t < 1.7) {
        for (const e of o.targets) {
          if (e.dead) continue;
          c.strokeStyle = '#8fd8ff';
          c.lineWidth = 1.5;
          c.save();
          c.translate(e.x, e.y);
          c.rotate(U.t * 4);
          c.strokeRect(-e.r - 6, -e.r - 6, (e.r + 6) * 2, (e.r + 6) * 2);
          c.restore();
        }
      }
      if (o.bigBeam && U.t < 4.4) {
        const bb = o.bigBeam;
        const fade = clamp(1 - (U.t - 3.4) / 1.0, 0, 1);
        c.save();
        c.globalAlpha = fade;
        const g = c.createLinearGradient(P.x, P.y, bb.ex, bb.ey);
        g.addColorStop(0, '#fff');
        g.addColorStop(0.2, '#cfe8ff');
        g.addColorStop(1, rgba('#8fd8ff', 0.1));
        c.strokeStyle = g;
        c.lineWidth = 26 + Math.sin(G.t * 30) * 6;
        c.lineCap = 'round';
        c.beginPath(); c.moveTo(P.x, P.y); c.lineTo(bb.ex, bb.ey); c.stroke();
        c.strokeStyle = '#fff';
        c.lineWidth = 8 + Math.sin(G.t * 40) * 3;
        c.beginPath(); c.moveTo(P.x, P.y); c.lineTo(bb.ex, bb.ey); c.stroke();
        c.restore();
      }
    },
  },
  // ================= KAIDO : THUNDER BAGUA =================
  kaido: {
    name: 'THUNDER BAGUA', sub: 'The Strongest Creature Ascends', tint: '#ffd76a', dur: 5.2, zoom0: 1.55,
    cap: 0.7,
    ts(t) { return t < 0.9 ? 0.12 : t < 3.8 ? 0.22 : 0.5; },
    charOpts: { hide: true }, // leaps offscreen between strikes
    begin(U) {
      U.o = { strikes: 0, lastS: 0, crashX: null, crashY: null };
      CAM.zoom(1.55, 0.6);
      CAM.rotTo(0.04, 1.0);
    },
    upd(U, dt) {
      const o = U.o;
      const st = pstats();
      if (U.t < 0.9) {
        // leap charge
        P.atkPose = clamp(U.t / 0.8, 0, 1);
        CAM.zoom(1.7, 0.5);
      }
      // 8 strikes every 0.33s from t=1.0
      if (U.t >= 1.0 && o.strikes < 12) {
        if (U.t - 1.0 >= o.strikes * 0.24) {
          o.strikes++;
          // pick densest cluster of remaining
          const alive = G.enemies.filter(e => !e.dead);
          let tx = P.x, ty = P.y;
          if (alive.length) {
            const e = pick(alive);
            tx = e.x + rnd(-20, 20); ty = e.y + rnd(-20, 20);
          } else { tx = P.x + rnd(-200, 200); ty = P.y + rnd(-200, 200); }
          o.sx = tx; o.sy = ty;
          CAM.kick(9);
          flash('#ffd76a', 0.18);
          SND.play('boom');
          const dmg = 130 + P.level * 8;
          const hitR = 150;
          for (const e of [...G.enemies]) {
            if (e.dead) continue;
            const d = dist(tx, ty, e.x, e.y);
            if (d < hitR + e.r) {
              if (e.boss) U.damage(e, dmg * 1.1, {});
              else U.damage(e, dmg, { silent: true, col: '#ffd76a' });
              if (!e.dead && !e.boss) e.stun = Math.max(e.stun || 0, 1.2);
            }
          }
          burst(tx, ty, '#ffd76a', 16, 380, 5);
          ring(tx, ty, 10, hitR, '#ffd76a', 5, 0.4);
          // camera punch toward strike
          CAM.toxD = (P.x - tx) * 0.06;
          CAM.toyD = (P.y - ty) * 0.06;
        }
      }
      // crash at 3.8: slam back down, kills all non-boss under cap
      if (U.t >= 3.8 && !o.crash) {
        o.crash = true;
        o.sx = P.x; o.sy = P.y;
        CAM.kick(16);
        flash('#ffd76a', 0.5);
        SND.play('boom');
        CAM.zoom(1.15, 0.3);
        banner('RAIMEI', 'HAKKE', 1200, '#ffd76a');
        const cap = Math.max(5, Math.ceil(0.7 * (G.enemies.length + 8)));
        const dmg = 160 + P.level * 8;
        for (const e of [...G.enemies]) {
          if (e.dead || e.boss) continue;
          if (dist(P.x, P.y, e.x, e.y) < 340 && e.hp <= dmg * 2) {
            if (U.kills < cap) { U.kills++; killEnemy(e); burst(e.x, e.y, '#ffd76a', 10, 320, 4); }
            else U.damage(e, dmg, { silent: true });
          }
        }
        ring(P.x, P.y, 30, 420, '#ffd76a', 8, 0.8);
      }
      if (U.t > 4.6) CAM.zoom(1.0, 0.9);
    },
    draw(c, U) {
      const o = U.o;
      if (!o) return;
      // lightning bolts at strikes
      const sinceStrike = (U.t - 1.0) % 0.24;
      if (U.t >= 1.0 && U.t < 3.9 && sinceStrike < 0.14 && o.sx !== undefined) {
        c.save();
        c.globalAlpha = 1 - sinceStrike / 0.14;
        c.strokeStyle = '#fff2a8';
        c.lineWidth = 4;
        c.beginPath();
        let lx = o.sx + rnd(-30, 30), ly = o.sy - 500;
        c.moveTo(lx, ly);
        while (ly < o.sy) {
          lx += rnd(-28, 28);
          ly += rnd(60, 120);
          c.lineTo(lx, Math.min(ly, o.sy));
        }
        c.stroke();
        c.strokeStyle = 'rgba(255,255,255,0.8)';
        c.lineWidth = 1.5;
        c.stroke();
        c.restore();
      }
      // storm tint during whole ult handled by overlay
    },
  },
};

function drawPurpleImpact(c, U) {
  const elapsed = U.t - HOLLOW_PURPLE_RELEASE;
  if (elapsed < 0 || elapsed >= 0.24 || Sett.noflash) return;

  const x = VW / 2 + (U.o.x - CAM.x) * CAM.z;
  const y = VH / 2 + (U.o.y - CAM.y) * CAM.z - 27;
  const reach = Math.hypot(VW, VH);
  const firstFrame = elapsed < 0.052;
  const fade = 1 - easeOut(elapsed / 0.24);
  c.save();
  c.globalAlpha = firstFrame ? 1 : fade;
  const flare = c.createRadialGradient(x, y, 0, x, y, reach * 0.64);
  flare.addColorStop(0, firstFrame ? '#fff7ff' : '#f6ceff');
  flare.addColorStop(0.30, firstFrame ? '#edb8ff' : '#b144fa');
  flare.addColorStop(1, firstFrame ? '#8734e8' : '#26094b');
  c.fillStyle = flare;
  c.fillRect(0, 0, VW, VH);

  // Fixed angles keep the lines sharp between the two poses, without flicker.
  c.fillStyle = firstFrame ? '#3c1465' : '#e8b0ff';
  for (let i = 0; i < 22; i++) {
    const a = i * TAU / 22 + Math.sin(i * 9.1) * 0.065;
    const tip = (firstFrame ? 66 : 112) + (i % 5) * 17;
    const width = 0.005 + (i % 3) * 0.007;
    c.beginPath();
    c.moveTo(x + Math.cos(a) * tip, y + Math.sin(a) * tip);
    c.lineTo(x + Math.cos(a - width) * reach, y + Math.sin(a - width) * reach);
    c.lineTo(x + Math.cos(a + width) * reach, y + Math.sin(a + width) * reach);
    c.closePath();
    c.fill();
  }

  const sheet = GFX.charspr.gojo;
  if (sheet?.complete && sheet.naturalWidth) {
    c.translate(x, y + 27);
    c.scale(P.face * CAM.z, CAM.z);
    c.imageSmoothingEnabled = false;
    c.filter = firstFrame ? 'brightness(0)' : 'brightness(0) invert(1)';
    c.drawImage(sheet, (firstFrame ? 4 : 5) * CHAR_CELL_W, 2 * CHAR_CELL_H,
      CHAR_CELL_W, CHAR_CELL_H, -CHAR_FOOT_X, -CHAR_FOOT_Y, CHAR_CELL_W, CHAR_CELL_H);
  }
  c.restore();
}

// overlay tint per ult during cin
function drawUltOverlay(c) {
  if (!ULT.active || !ULT.data) return;
  const U = ULT;
  const t = U.t;
  const d = U.data;
  // vignette + tint
  if (U.id === 'gojo') {
    c.fillStyle = 'rgba(90,40,160,0.10)';
    c.fillRect(0, 0, c.canvas.width, c.canvas.height);
    drawPurpleImpact(c, U);
  } else if (d.tint === '#ffd76a') {
    c.fillStyle = 'rgba(60,50,20,0.12)';
    c.fillRect(0, 0, c.canvas.width, c.canvas.height);
  }
  // name stamp
  if (t < (U.id === 'gojo' ? HOLLOW_PURPLE_RELEASE : 1.2)) {
    const a = clamp(t / 0.3, 0, 1) * clamp((1.2 - t) / 0.3, 0, 1);
    c.save();
    c.globalAlpha = a * 0.85;
    c.font = 'bold 52px Georgia, serif';
    c.textAlign = 'center';
    c.fillStyle = d.tint;
    if (c.canvas.width < 900) c.font = 'bold 34px Georgia, serif';
    const cxx = c.canvas.width / 2, cyy = c.canvas.height * 0.3 + 40;
    c.fillText(d.name, cxx, cyy);
    c.font = 'italic 18px Georgia, serif';
    c.fillStyle = 'rgba(255,255,255,0.75)';
    c.fillText(d.sub || '', cxx, cyy + 28);
    c.restore();
  }
}
function drawBeams(c) {
  for (const b of G.beams) {
    const a = clamp(b.life / b.ml, 0, 1);
    c.save();
    c.globalAlpha = a;
    c.strokeStyle = b.col;
    c.lineWidth = b.w;
    c.lineCap = 'round';
    c.beginPath(); c.moveTo(b.x0, b.y0); c.lineTo(b.x1, b.y1); c.stroke();
    c.strokeStyle = '#fff';
    c.lineWidth = b.w * 0.4;
    c.beginPath(); c.moveTo(b.x0, b.y0); c.lineTo(b.x1, b.y1); c.stroke();
    c.restore();
  }
}
