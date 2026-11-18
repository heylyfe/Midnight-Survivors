'use strict';
// ===== ults.js : cinematic ultimates with camera work =====
// Each ult: charge -> cinematic (zoom, rotation, slow-mo, letterbox) -> payoff
// Kill caps keep them strong but not screen-wipes.

function denseDir(e) { return angTo(P.x, P.y, e.x, e.y); }

const ULT = {
  id: null, t: 0, active: false,
  data: null,
  can() { return G.state === 'run' && P.ultq >= ULT_MAX; },
  cast() {
    if (!this.can()) { SND.play('deny'); return false; }
    this.id = G.ch;
    this.data = ULTDEF[this.id];
    if (!this.data) return false;
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
    this.o = null;
  },
  upd(dt) {
    if (!this.active) return;
    this.t += dt;
    const d = this.data;
    if (this.t >= d.dur) { this.end(); return; }
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
      // kill attempt: respect cap
      if (opt.noCap || this.kills < this._capNow * G.enemies.length * 0 + d.cap * (G.enemies.length + 8)) {
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
    if (this.data.begin) this.data.begin(this);
    this.t = 2.4;
    G.state = 'cin';
    UI.letterbox(true);
    CAM.zoom(1.6, 0.4);
    ULTDEF.gojo.revNuke = true;
  },
  o: null, // scratch state per cast
};

const ULTDEF = {
  // ================= GOJO : HOLLOW PURPLE =================
  gojo: {
    name: 'HOLLOW PURPLE', sub: 'Domain of Imagination', tint: '#a05aff', dur: 5.8, zoom0: 1.4,
    cap: 0.35, revNuke: false,
    characterNote: 'On death: revives once and auto-casts this',
    effStrings: ['Blue pulls, Red repels', 'Pierces everything in line'],
    ts(t) { return t < 2.6 ? 0.12 : t < 3.1 ? 0.22 : 0.5; },
    charOpts: { eyeMode: 'six' },
    begin(U) {
      U.o = { orA: null, orB: null, merged: null, launched: false, px: [], revive: false };
      CAM.rotTo(0.06, 1.2);
    },
    upd(U, dt) {
      const o = U.o;
      const revNuke = ULTDEF.gojo.revNuke && U.t < 3.0 && o.reviveFlag !== true;
      if (!o.orA) {
        o.orA = { x: P.x - 170, y: P.y - 60 };
        o.orB = { x: P.x + 170, y: P.y - 60 };
      }
      if (U.t < 2.7) {
        // orbs orbit inward, gathering
        const k = U.t / 2.7;
        const rr = 170 * (1 - k * 0.82);
        const aA = U.t * 3.2, aB = U.t * 3.2 + Math.PI;
        o.orA.x = P.x + Math.cos(aA) * rr + Math.cos(aA * 2) * 18;
        o.orA.y = P.y - 50 + Math.sin(aA) * rr * 0.4;
        o.orB.x = P.x + Math.cos(aB) * rr + Math.cos(aB * 2) * 18;
        o.orB.y = P.y - 50 + Math.sin(aB) * rr * 0.4;
        if (Math.random() < 0.7) {
          part(o.orA.x, o.orA.y, '#5aa0ff', 1, 120, 2);
          part(o.orB.x, o.orB.y, '#ff5a5a', 1, 120, 2);
        }
        if (U.t > 2.2) CAM.zoom(1.4 + (U.t - 2.2) * 0.5, 0.3);
      } else if (!o.merged) {
        o.merged = { x: P.x, y: P.y - 60, r: 14 };
        flash('#fff', 0.5);
        SND.play('boom');
        CAM.kick(8);
      }
      if (o.merged) {
        o.merged.r = Math.min(34, o.merged.r + dt * 26);
        const wk = Math.sin(U.t * 40) * 4;
        o.merged.x = P.x + wk * 0.3;
        if (Math.random() < 0.9) part(o.merged.x + rnd(-30, 30), o.merged.y + rnd(-30, 30), '#a05aff', 1, 160, 2.5);
      }
      if (U.t >= 3.1 && !o.launched && o.merged) {
        o.launched = true;
        o.merged.x = P.x; o.merged.y = P.y - 60;
        flash('#a05aff', 0.45);
        CAM.kick(14);
        CAM.rotTo(0, 0.8);
        CAM.zoom(1.7, 0.4);
        SND.play('boom');
        banner('HOLLOW', 'PURPLE', 1400, '#a05aff');
      }
      if (o.launched && o.merged) {
        // sweep across field, cos-wave vertical
        const tt = U.t - 3.1;
        const spd = 780 * G.dt;
        o.merged.x += spd;
        o.merged.y = P.y - 60 + Math.cos(tt * 2.6) * 150;
        o.merged.r = 34 + Math.sin(tt * 3) * 6;
        const mx = o.merged.x, my = o.merged.y, mr = 120;
        // consume enemies
        for (const e of [...G.enemies]) {
          if (e.dead) continue;
          const dx = Math.abs(e.x - mx), dy = Math.abs(e.y - my);
          if (dx < mr * 0.7 && dy < mr) {
            const cap = Math.max(4, Math.ceil(0.35 * (G.enemies.length + 8)));
            if (!e.boss && U.kills < cap) { U.kills++; killEnemy(e); burst(e.x, e.y, '#a05aff', 6, 220, 3); }
            else if (e.boss) U.damage(e, 30, { silent: false, col: '#a05aff' });
            else { e.hp = Math.max(1, e.hp); e.flash = 0.3; }
          }
        }
        part(mx, my, pick(['#a05aff', '#fff', '#5aa0ff']), 3, 260, 3.5);
        if (mx > P.x + 1400) { o.launched = false; o.done = true; CAM.zoom(1.25, 0.8); }
      }
      if (U.t > 5.4 && U.t < 5.5) { /* pre-end zoom out */ }
    },
    draw(c, U) {
      const o = U.o;
      if (!o) return;
      // orbit orbs before merge
      if (!o.merged && o.orA) {
        for (const [or, col] of [[o.orA, '#5aa0ff'], [o.orB, '#ff5a5a']]) {
          const g = c.createRadialGradient(or.x, or.y, 2, or.x, or.y, 26);
          g.addColorStop(0, '#fff');
          g.addColorStop(0.35, col);
          g.addColorStop(1, rgba(col, 0));
          c.fillStyle = g;
          c.beginPath(); c.arc(or.x, or.y, 26, 0, TAU); c.fill();
        }
      }
      if (o.merged && !o.done) {
        const m = o.merged;
        const g = c.createRadialGradient(m.x, m.y, 2, m.x, m.y, m.r * 2.2);
        g.addColorStop(0, '#fff');
        g.addColorStop(0.3, '#a05aff');
        g.addColorStop(0.6, '#5a2aff');
        g.addColorStop(1, rgba('#a05aff', 0));
        c.fillStyle = g;
        c.beginPath(); c.arc(m.x, m.y, m.r * 2.2, 0, TAU); c.fill();
        // distortion arcs
        c.strokeStyle = 'rgba(255,255,255,0.5)';
        c.lineWidth = 1.5;
        for (let i = 0; i < 3; i++) {
          const aa = G.t * 5 + i * 2.1;
          c.beginPath();
          c.arc(m.x, m.y, m.r * (1.3 + i * 0.3), aa, aa + 1.1);
          c.stroke();
        }
      }
      if (o.launched && o.merged) {
        // trail
        c.fillStyle = 'rgba(160,90,255,0.25)';
        c.beginPath();
        c.ellipse(o.merged.x - 160, o.merged.y, 160, o.merged.r * 0.8, 0, 0, TAU);
        c.fill();
      }
    },
  },
  // ================= ICHIGO : GETSUGA TENSHO =================
  ichigo: {
    name: 'GETSUGA TENSHO', sub: 'Moon Fang Heaven-Piercer', tint: '#ff8a3a', dur: 4.2, zoom0: 1.5,
    cap: 0.4,
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
        o.swing = { x: P.x, y: P.y, r: 80, t: 0, a: 0, hit: new Set() };
        flash(o.hollowFlare ? '#fff' : '#ff8a3a', 0.5);
        CAM.kick(12);
        SND.play('boom');
        CAM.rotTo(0.1, 0.4);
        CAM.zoom(1.35, 0.3);
        banner('GETSUGA', 'TENSHO', 1200, '#ff8a3a');
      }
      if (o.swing) {
        o.swing.t += dt;
        o.swing.r += 900 * dt;
        o.swing.x += 620 * dt; // travels forward
        // wedge hit
        const cap = Math.max(5, Math.ceil(0.4 * (G.enemies.length + 8)));
        for (const e of [...G.enemies]) {
          if (e.dead) continue;
          const d = dist(o.swing.x, o.swing.y, e.x, e.y);
          if (d < o.swing.r + e.r && !o.swing.hit.has(e)) {
            o.swing.hit.add(e);
            if (!e.boss && U.kills < cap && e.hp <= 55 * pstats().dmg) { U.kills++; killEnemy(e); burst(e.x, e.y, '#ff8a3a', 8, 260, 3.5); }
            else if (e.boss) U.damage(e, 26, {});
            else U.damage(e, 55, { col: '#ff8a3a' });
          }
        }
        part(o.swing.x, o.swing.y + rnd(-40, 40), '#ff8a3a', 2, 160, 3, 'ghost');
        if (o.swing.t > 1.4 || o.swing.x > P.x + 900) { o.swing.done = true; }
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
        c.rotate(0);
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
    name: 'HAKKA NO TOGAME', sub: 'White Haze Punishment', tint: '#9fe8ff', dur: 5.4, zoom0: 1.35,
    cap: 0.15,
    ts(t) { return t < 0.9 ? 0.12 : t < 4.3 ? 0.3 : 0.6; },
    charOpts: {},
    begin(U) {
      U.o = { pillars: [], shatter: false };
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
            if (!e.boss) { freezeEnemy(e, 3.8); e.chill = 0; }
            else chillEnemy(e, 3.8);
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
        const cap = Math.max(4, Math.ceil(0.15 * (G.enemies.length + 8)));
        const st = pstats();
        for (const e of [...G.enemies]) {
          if (e.dead || e.boss) continue;
          if (e.frozen > 0 && e.hp / e.mhp < 0.35 + P.level * 0.004) {
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
    name: 'ZOLTRAK BARRAGE', sub: 'The Mage Who Killed 1000 Spells', tint: '#8fd8ff', dur: 4.8, zoom0: 1.3,
    cap: 0.44,
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
        if (o.targets.length < 16) {
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
            U.damage(e, 8, { col: '#cfe8ff' });
            SND.play('zap');
            burst(e.x, e.y, '#cfe8ff', 4, 160, 2.5);
          }
        }
        banner('ZOLTRAAK', o.fired + ' spells', 1200, '#8fd8ff');
      }
      // big beam t>=2.6: sweeps the densest direction
      if (U.t >= 2.6 && !o.bigBeam) {
        o.bigBeam = { a0: null, t: 0, dir: 1 };
        // aim at densest cluster
        let best = 0, bestA = 0;
        for (let i = 0; i < 12; i++) {
          const aa = (i / 12) * TAU;
          let n = 0;
          for (const e of G.enemies) {
            if (e.dead) continue;
            const d = Math.abs(angTo(P.x, P.y, e.x, e.y) - aa);
            if (Math.min(d, TAU - d) < 0.35) n++;
          }
          if (n > best) { best = n; bestA = aa; }
        }
        o.bigBeam.a0 = bestA;
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
        const cap = Math.max(6, Math.ceil(0.44 * (G.enemies.length + 8)));
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
              if (!e.boss && U.kills < cap && e.hp <= 45 * pstats().dmg) { U.kills++; killEnemy(e); burst(e.x, e.y, '#8fd8ff', 6, 240, 3); }
              else if (e.boss) U.damage(e, 20, {});
              else U.damage(e, 36, { col: '#8fd8ff' });
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
    cap: 0.25,
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
      if (U.t >= 1.0 && o.strikes < 8) {
        if (U.t - 1.0 >= o.strikes * 0.33) {
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
          const dmg = 70 + P.level * 5;
          const hitR = 130;
          for (const e of [...G.enemies]) {
            if (e.dead) continue;
            const d = dist(tx, ty, e.x, e.y);
            if (d < hitR + e.r) {
              if (e.boss) U.damage(e, dmg * 0.5, {});
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
        const cap = Math.max(5, Math.ceil(0.25 * (G.enemies.length + 8)));
        const dmg = 90 + P.level * 6;
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
      const sinceStrike = (U.t - 1.0) % 0.33;
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

// overlay tint per ult during cin
function drawUltOverlay(c) {
  if (!ULT.active || !ULT.data) return;
  const U = ULT;
  const t = U.t;
  const d = U.data;
  // vignette + tint
  if (d.tint === '#a05aff') {
    c.fillStyle = 'rgba(90,40,160,0.10)';
    c.fillRect(0, 0, c.canvas.width, c.canvas.height);
  } else if (d.tint === '#ffd76a') {
    c.fillStyle = 'rgba(60,50,20,0.12)';
    c.fillRect(0, 0, c.canvas.width, c.canvas.height);
  }
  // name stamp
  if (t < 1.2) {
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
