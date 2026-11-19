'use strict';
// ===== core.js : state, save, camera, player, stats, night flow, particles =====

const SAVE_KEY = 'msv2_save';
let SAVE = null, Sett = null;
const defSave = () => ({
  gold: 0, owned: ['ichigo'],
  shop: {}, best: {}, ach: {}, cnt: { kills: 0, ults: 0, pacts: 0, runs: 0, wins: 0, boss: 0 },
  hist: [],
  gamble: { plays: 0, wagered: 0, won: 0, biggest: 0, streak: 0, bestStreak: 0, ladderBest: 0 },
  set: { quality: 'med', music: true, sfx: true, autoUlt: false, noflash: false, showFps: false },
  run: null,
});
function saveNow() {
  SAVE.ver = 2;
  try {
    const raw = JSON.stringify(SAVE);
    localStorage.setItem(SAVE_KEY, raw);
    const b = localStorage.getItem(SAVE_KEY + '.b1');
    if (b) localStorage.setItem(SAVE_KEY + '.b2', b);
    localStorage.setItem(SAVE_KEY + '.b1', raw);
  } catch (e) {}
}
function loadSave() {
  SAVE = defSave();
  try {
    let raw = localStorage.getItem(SAVE_KEY);
    if (!raw) { raw = localStorage.getItem(SAVE_KEY + '.b1'); }
    if (!raw) { raw = localStorage.getItem(SAVE_KEY + '.b2'); }
    if (raw) {
      const d = JSON.parse(raw);
      SAVE = Object.assign(defSave(), d);
      SAVE.set = Object.assign(defSave().set, d.set || {});
      SAVE.cnt = Object.assign(defSave().cnt, d.cnt || {});
      SAVE.gamble = Object.assign(defSave().gamble, d.gamble || {});
      SAVE.ach = d.ach || {}; SAVE.shop = d.shop || {}; SAVE.hist = d.hist || [];
      if (!Array.isArray(SAVE.owned) || !SAVE.owned.length) SAVE.owned = ['ichigo'];
    }
  } catch (e) { SAVE = defSave(); }
  Sett = SAVE.set;
}
function exportCode() { return btoa(unescape(encodeURIComponent(JSON.stringify({ gold: SAVE.gold, owned: SAVE.owned, shop: SAVE.shop, ach: SAVE.ach, cnt: SAVE.cnt, gamble: SAVE.gamble, set: SAVE.set })))); }
function importCode(code) {
  try {
    const d = JSON.parse(decodeURIComponent(escape(atob(code.trim()))));
    SAVE.gold = d.gold || 0;
    SAVE.owned = Array.isArray(d.owned) && d.owned.length ? d.owned : ['ichigo'];
    SAVE.shop = d.shop || {}; SAVE.ach = d.ach || {}; SAVE.cnt = Object.assign(SAVE.cnt, d.cnt || {});
    SAVE.gamble = Object.assign(SAVE.gamble, d.gamble || {});
    SAVE.set = Object.assign(SAVE.set, d.set || {}); Sett = SAVE.set;
    saveNow();
    return true;
  } catch (e) { return false; }
}
function cnt(key, n) { SAVE.cnt[key] = (SAVE.cnt[key] || 0) + (n || 1); }
function checkAch(id) {
  if (SAVE.ach[id]) return;
  SAVE.ach[id] = Date.now();
  const a = ACH.find(x => x.id === id);
  if (a) { toast('Achievement: ' + a.name, '#ffd76a'); SND.play('joy'); }
  saveNow();
}

// ===== quality =====
let QUAL = QUAL_PRE.med;
function setQuality(q) { if (QUAL_PRE[q]) { Sett.quality = q; QUAL = QUAL_PRE[q]; saveNow(); if (window.__resize) window.__resize(); } }

// ===== game state =====
const G = {
  state: 'menu',            // menu | run | cin | pacts | end
  t: 0, rt: 0, dt: 0, dtr: 0, ts: 1,
  ch: 'ichigo', diff: 'normal',
  night: 1, nightT: 0, nightHold: false,
  spawnT: 0, bossSpawned: false, gambledThisNight: false, waveT: 0,
  kills: 0, gold: 0, quota: 0,
  enemies: [], bolts: [], slashes: [], eprojs: [], parts: [], rings: [], pops: [], zones: [], beams: [], drops: [],
  pacts: {}, rerolls: 0,
  boss: null,
  wx: 0, wy: 0,            // ambient drift for bg
  flash: { a: 0, col: '#fff' },
};
const P = {
  x: 0, y: 0, r: 14, dir: 1, face: 0, moving: false,
  hp: 100, level: 1, xp: 0,
  ultq: 0,                 // ultimate charge 0..ULT_MAX
  dash: 0, dashCd: 0, ifr: 0,
  kills: 0,
  invuln: 0, atkPose: 0, hitFx: 0, walkPh: 0, dashT: 0,
  haste: 0, bladeCount: 0, reviveUsed: 0, shopRevive: 0,
  form: null, formT: 0, bankaiNext: 10,
};
P.kills = 0;
const W = { boltT: 1, bladeT: 2, shieldT: 0 }; // weapon timers
const CAM = {
  x: 0, y: 0, z: 1, tz: 1, rot: 0, trot: 0,
  tox: 0, toy: 0, toxD: 0, toyD: 0,   // dramatic offset + decay
  sh: 0, shT: 0, focX: 0, focY: 0, follow: 1,
  zoom(v, dur) { this._zt = dur || 0; this.tz = v; },
  rotTo(v, dur) { this._rt = dur || 0; this.trot = v; },
  kick(a) { this.sh = Math.max(this.sh, a * (QUAL.shake || 1)); this.shT = 0.5; },
  shake(a) { this.kick(a); },
  upd(dt) {
    const zs = this._zt > 0 ? dt / Math.max(0.001, this._zt) : 0.1;
    this._zt = Math.max(0, (this._zt || 0) - dt);
    this.z += (this.tz - this.z) * Math.min(1, Math.max(0.1, zs));
    const rs = this._rt > 0 ? dt / Math.max(0.001, this._rt) : 0.1;
    this._rt = Math.max(0, (this._rt || 0) - dt);
    this.rot += (this.trot - this.rot) * Math.min(1, Math.max(0.1, rs));
    this.tox += (this.toxD - this.tox) * Math.min(1, dt * 4);
    this.toy += (this.toyD - this.toy) * Math.min(1, dt * 4);
    this.toxD *= Math.pow(0.2, dt); this.toyD *= Math.pow(0.2, dt);
    if (this.shT > 0) { this.shT -= dt; if (this.shT <= 0) this.sh = 0; }
    this.sh *= Math.pow(0.05, dt);
    if (G.state === 'run' && this.follow > 0) {
      this.x += (P.x - this.x) * Math.min(1, dt * this.follow);
      this.y += (P.y - this.y) * Math.min(1, dt * this.follow);
    } else if (G.state === 'cin' && this.follow > 0) {
      this.x += (P.x - this.x) * Math.min(1, dt * this.follow);
      this.y += (P.y - this.y) * Math.min(1, dt * this.follow);
    }
  },
};

// ===== difficulty + pact helpers =====
function DIFFN() { return DIFF[G.diff] || DIFF.normal; }
function hasP(id) { return !!G.pacts[id]; }
function pactW() { return (DIFFN().pactW || 1); }
// multiplicative pact stat: combine active pacts that define `key`
function pcMul(key) {
  let m = 1;
  for (const id in G.pacts) {
    const d = PACTDEF[id];
    if (d && typeof d[key] === 'number') m *= 1 + (d[key] - 1) * pactW();
  }
  return m;
}
// additive pact stat (pierce, heal bonus)
function pcAdd(key) {
  let s = 0;
  for (const id in G.pacts) {
    const d = PACTDEF[id];
    if (d && typeof d[key] === 'number') s += d[key] * pactW();
  }
  return s;
}
function pf(key) { // pact flag: true if any active pact sets flag `key`
  for (const id in G.pacts) { const d = PACTDEF[id]; if (d && d[key]) return true; }
  return false;
}

// ===== derived player stats (recomputed every frame) =====
function pstats() {
  const ch = CHARS[G.ch], L = P.level - 1, sh = SAVE.shop;
  const gr = (k) => GROWTH[k];
  const might = 1 + (sh.might || 0) * 0.06;
  const vital = 1 + (sh.vital || 0) * 0.06;
  const st = {};
  st.mhp = Math.max(20, Math.round((ch.mhp * vital * (1 + gr('mhp').per * L) + gr('hpFlat').per * L) * pcMul('mhp')));
  st.dmg = ch.dmgM * might * (1 + gr('dmg').per * L) * pcMul('dmg');
  st.taken = ch.taken * pcMul('taken');
  st.spd = ch.spd * (1 + Math.min(gr('spd').cap, (sh.swift || 0) * 0.03)) * (1 + Math.min(gr('spd').cap, gr('spd').per * L)) * pcMul('spd');
  st.area = (1 + Math.min(gr('area').cap, gr('area').per * L)) * pcMul('area');
  st.cd = Math.max(0.3, ch.boltCdM * (1 - Math.min(gr('cd').cap, gr('cd').per * L)) * (1 - (sh.focus || 0) * 0.04));
  // frieren mana flow
  if (G.ch === 'frieren') st.cd = st.cd * Math.max(0.64, 1 - 0.07 * (G.night - 1));
  st.dashCd = ch.dashCd * (1 - Math.min(1, (sh.haste || 0) * 0.05));
  if (G.ch === 'frieren') st.dashCd *= Math.max(0.80, 1 - 0.04 * (G.night - 1));
  st.dashLen = ch.dashLen * (1 + Math.min(gr('dashLen').cap, gr('dashLen').per * L));
  st.dashIfr = ch.dashIfr + Math.min(gr('dashIfr').cap, gr('dashIfr').per * L);
  st.block = clamp(WEAP.shield.block + (ch.blockAdj || 0) + (sh.aegis || 0) * 0.03 + Math.min(gr('block').cap, gr('block').per * L), 0.05, 0.55);
  st.inR = WEAP.shield.inR * st.area * pcMul('outR'); // note: outR pact shrinks shield
  st.outR = WEAP.shield.outR * st.area * pcMul('outR');
  st.pickup = 70 * (1 + (sh.reach || 0) * 0.10) * (1 + Math.min(gr('pickup').cap, gr('pickup').per * L));
  st.ultc = pcMul('ult');
  st.egold = pcMul('egold');
  st.gold = 1 + (sh.greed || 0) * 0.08;
  st.pierce = pcAdd('pierce');
  st.tickx = pcMul('tickx');
  st.healPact = pcAdd('heal');
  st.chillx = pcMul('chillx');
  st.fullfreeze = pf('fullfreeze');
  st.bladeDmg = ch.bladeM * pcMul('bladeDmg');
  st.boltDmg = ch.boltM * pcMul('bolt');
  st.hpFrac = P.hp / st.mhp;
  // transformation forms
  if (P.form === 'ichigo') { st.dmg *= 2; st.area *= 1.25; st.bladeDmg *= 1.4; }
  if (P.form === 'rukia') { st.dmg *= 1.6; st.cd *= 0.85; st.chillx *= 1.5; }
  // passives
  if (G.ch === 'gojo') st.dmg *= 1 + Math.min(0.30, (P.kills || G.kills) * 0.0002);
  if (G.ch === 'ichigo' && st.hpFrac < 0.40) { st.dmg *= 1.40; st.bladeFrenzy = 0.85; }
  if (G.ch === 'kaido' && st.hpFrac < 0.30) st.taken *= 0.5;
  st.revives = (ch.revive && !P.reviveUsed ? 1 : 0) + (P.shopRevive || 0);
  return st;
}

// ===== particles / fx =====
function part(x, y, col, n, spd, r, shape) {
  n = Math.max(1, Math.round(n * (QUAL.parts / 700)));
  for (let i = 0; i < n; i++) {
    if (G.parts.length > QUAL.parts) G.parts.shift();
    const a = rnd(TAU), s = rnd(spd * 0.3, spd);
    G.parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, r: rnd(r * 0.5, r), col, life: rnd(0.35, 0.9), ml: 0.9, shape: shape || 'dot' });
  }
}
function burst(x, y, col, n, spd, r) { part(x, y, col, n, spd, r); if (QUAL.glow) part(x, y, '#ffffff', Math.ceil(n / 3), spd * 0.6, r * 0.6); }
function ring(x, y, r0, r1, col, w, dur) { G.rings.push({ x, y, r: r0, r0, r1, col, w: w || 3, life: dur || 0.5, ml: dur || 0.5 }); }
function pop(x, y, txt, col, big) {
  if (G.pops.length > 80) G.pops.shift();
  G.pops.push({ x, y, txt: String(txt), col: col || '#fff', life: 0.9, ml: 0.9, big: !!big });
}
function zone(x, y, r, col, dur, dmg, stun, friendly) {
  G.zones.push({ x, y, r, r0: 0, col, dur, ml: dur, dmg: dmg || 0, stun: stun || 0, friendly: !!friendly, blew: false });
}
function beam(x0, y0, x1, y1, col, w, life) { G.beams.push({ x0, y0, x1, y1, col, w, life, ml: life }); }
function flash(col, a) { if (Sett.noflash) a *= 0.35; G.flash.a = Math.max(G.flash.a, a); G.flash.col = col || '#fff'; }
function toast(msg, col) { if (typeof UI !== 'undefined' && UI.toast) UI.toast(msg, col); }
function heal(n) {
  if (n <= 0) return;
  const st = pstats();
  const old = P.hp;
  P.hp = Math.min(st.mhp, P.hp + n);
  if (P.hp > old) { pop(P.x, P.y - 20, '+' + (Math.round((P.hp - old) * 10) / 10), '#6dff8a'); }
}

// ===== drops =====
function addGem(x, y, xp) { G.drops.push({ x, y, kind: 'gem', v: xp, t: 0 }); }
function addGoldD(x, y, v) { G.drops.push({ x, y, kind: 'gold', v, t: 0 }); }
function addHeart(x, y) { G.drops.push({ x, y, kind: 'heart', v: HEART_HEAL, t: 0 }); }
function addGold(v, silent) {
  const st = pstats();
  v = Math.round(v * st.gold * DIFFN().gold);
  G.gold += v; SAVE.gold += v;
  if (!silent) pop(P.x + rnd(-10, 10), P.y - 26, '+' + v + 'g', '#ffd76a', v >= 50);
  SAVE.gold = Math.round(SAVE.gold);
}

// ===== combat =====
function hitEnemy(e, dmg, opt) {
  opt = opt || {};
  const st = pstats();
  dmg *= st.dmg;
  if (!opt.silent) pop(e.x + rnd(-6, 6), e.y - e.r - 6, Math.round(dmg), '#fff');
  // rukia passive: +50% vs chilled/frozen
  if (G.ch === 'rukia' && (e.chill > 0 || e.frozen > 0)) dmg *= 1.5;
  if (e.dr) dmg *= (1 - e.dr);
  e.hp -= dmg;
  e.flash = 0.08;
  if (!opt.silent) SND.play('hit');
  // knockback
  if (!e.boss && opt.kb) {
    const a = opt.kbAng !== undefined ? opt.kbAng : angTo(P.x, P.y, e.x, e.y);
    const k = opt.kb * (e.kbM === undefined ? 1 : e.kbM);
    e.kx = (e.kx || 0) + Math.cos(a) * k * 14;
    e.ky = (e.ky || 0) + Math.sin(a) * k * 14;
  }
  if (opt.stun && !e.boss && !(G.ch === 'kaido' && false)) e.stun = Math.max(e.stun || 0, opt.stun);
  if (e.boss) addUltQ(DIFFN().ultCharge * 0.4 * st.ultc);
  if (opt.chill) chillEnemy(e, opt.chill);
  if (opt.freeze) freezeEnemy(e, opt.freeze);
  if (e.hp <= 0) killEnemy(e);
}
function chillEnemy(e, dur) {
  if (e.frozen > 0) return;
  e.chill = Math.max(e.chill || 0, dur);
}
function freezeEnemy(e, dur, allowBoss) {
  if (e.boss && !allowBoss) return;
  if (e.boss && allowBoss) dur = Math.min(dur, 3);
  e.frozen = Math.max(e.frozen || 0, dur);
  e.chill = 0;
}
function killEnemy(e) {
  const i = G.enemies.indexOf(e);
  if (i < 0 || e.dead) return;
  e.dead = true;
  G.enemies.splice(i, 1);
  G.kills++; P.kills++;
  cnt('kills'); checkAch('k5000');
  // ichigo Bankai: at doubling kill thresholds (10, 20, 40, 80...) hollow out for 30s
  if (G.ch === 'ichigo' && P.form !== 'ichigo' && G.kills >= P.bankaiNext) {
    P.form = 'ichigo';
    P.formT = 30;
    P.bankaiNext *= 2;
    banner('BANKAI', 'The Hollow Within — 30s', 2800, '#ffd76a');
    flash('#fff', 0.7);
    CAM.kick(14);
    SND.play('ult');
    ring(P.x, P.y, 10, 320, '#ffd76a', 6, 0.9);
    burst(P.x, P.y, '#ffd76a', 36, 380, 5);
  }
  const st = pstats();
  burst(e.x, e.y, e.col, e.elite ? 14 : 6, 160, e.elite ? 4 : 3);
  SND.play('kill');
  // ult charge
  addUltQ((e.elite ? 10 : e.boss ? 25 : 2) * st.ultc * DIFFN().ultCharge);
  // drops
  if (e.gold > 0 || e.elite) {
    const chance = e.elite ? 1 : Math.min(0.6, 0.16 * (e.gold || 1));
    if (Math.random() < chance) {
      const v = Math.max(1, Math.round((e.gold || 1) * (e.elite ? ELITE_GOLD : 1)));
      addGoldD(e.x + rnd(-8, 8), e.y + rnd(-8, 8), v);
    }
  }
  addGem(e.x, e.y, e.xp || 1);
  if (!e.boss && Math.random() < 0.008) addHeart(e.x, e.y);
  // pacts
  if (hasP('midnight')) heal(st.healPact);
  if (e.type === 'splitter') {
    for (let s = 0; s < 3; s++) spawnEnemy('shard', e.x + rnd(-16, 16), e.y + rnd(-16, 16), false, true);
  }
  if (e.matron) { // cleanup wisp portals
    for (const w of G.enemies) if (w.portalOf === e) w.portalOf = null;
  }
  if (e.boss) bossDown(e);
}
function addUltQ(v) { P.ultq = clamp(P.ultq + v, 0, ULT_MAX); }

function bossDown(e) {
  cnt('boss');
  CAM.kick(14); flash('#fff', 0.5);
  addGold(e.goldV || 100, false);
  ring(e.x, e.y, 40, 600, e.col, 6, 0.9);
  burst(e.x, e.y, e.col, 60, 400, 6);
  SND.play('boom');
  G.boss = null;
  G.nightHold = false;
  G.nightT = NIGHT_LEN - 3; // wrap up the night shortly
  banner(e.bossName + ' FALLS', '+' + (e.goldV || 100) + ' gold', 2600, '#ffd76a');
}
function banner(t, s, d, col) { if (typeof UI !== 'undefined' && UI.banner) UI.banner(t, s, d, col); }

function hurtPlayer(dmg, src) {
  const st = pstats();
  if (P.dash > 0 || P.ifr > 0 || P.invuln > 0 || G.state === 'cin') return;
  let final = dmg * DIFFN().edmg * st.taken;
  // shield: inner aura blocks %, outer ring blocks half that
  if (src) {
    const d = dist(P.x, P.y, src.x, src.y);
    if (d < st.inR) final *= (1 - st.block);
    else if (d < st.outR) final *= (1 - st.block * 0.5);
  }
  final = Math.max(1, Math.round(final));
  P.hp -= final;
  P.ifr = 0.5; P.hitFx = 0.25;
  CAM.kick(6); flash('#ff3a3a', 0.25);
  SND.play('hurt');
  pop(P.x, P.y - 22, '-' + Math.round(final), '#ff5a5a', true);
  if (P.hp <= 0) {
    // revives: gojo hollow purple nuke, or shop revive
    if (st.revives > 0) {
      P.hp = Math.max(1, st.mhp * (G.ch === 'gojo' && !P.reviveUsed ? 0.5 : 0.35));
      P.invuln = 2;
      if (G.ch === 'gojo' && !P.reviveUsed) {
        P.reviveUsed = 1;
        if (typeof ULT !== 'undefined' && ULT.reviveNuke) ULT.reviveNuke();
      } else {
        P.shopRevive = Math.max(0, (P.shopRevive || 0) - 1);
        banner('REVIVED', 'Second wind', 1800, '#9ff0ff');
      }
      flash('#7fb0ff', 0.6);
      return;
    }
    P.hp = 0;
    endRun(false);
  }
}

// ===== xp / level =====
function gainXP(v) {
  P.xp += v;
  let need = xpNeed(P.level);
  while (P.xp >= need) {
    P.xp -= need;
    P.level++;
    need = xpNeed(P.level);
    const st = pstats();
    const healAmt = st.mhp * GROWTH.healFrac * DIFFN().heal;
    P.hp = Math.min(st.mhp, P.hp + st.mhp * 0.012 + healAmt);
    pop(P.x, P.y - 34, 'LV ' + P.level, '#ffd76a', true);
    SND.play('lvl');
    ring(P.x, P.y, 10, 90, '#ffd76a', 3, 0.6);
  }
}

// ===== enemies / spawning =====
function spawnEnemy(type, x, y, elite, noScale) {
  const t = ET[type];
  if (!t) return;
  const sc = noScale ? 1 : hpScale(G.night);
  const el = !!elite;
  const e = {
    type, x, y, r: t.r * (el ? 1.5 : 1), col: t.col,
    mhp: t.hp * sc * (el ? 4.5 : 1), spd: t.spd * DIFFN().espd * (el ? 0.92 : 1) * rnd(0.92, 1.08),
    dmg: t.dmg * (el ? 1.4 : 1), xp: t.xp * (el ? ELITE_XP : 1), gold: t.gold,
    elite: el, dr: 0, kbM: el ? 0.5 : 1, kx: 0, ky: 0,
    hp: 0, chill: 0, frozen: 0, stun: 0, flash: 0, phase: 'run', pT: rnd(0.5), t: rnd(TAU),
    matron: !!t.summoner, portalOf: null, face: 1,
  };
  e.hp = e.mhp;
  G.enemies.push(e);
  return e;
}
function spawnR() {
  const a = rnd(TAU), d = rnd(560, 760);
  return [clamp(P.x + Math.cos(a) * d, -WORLD_R, WORLD_R), clamp(P.y + Math.sin(a) * d, -WORLD_R, WORLD_R)];
}
function bossFor(n) {
  const b = BOSSES[n] || BOSSES[20];
  const endless = n > 20;
  const scale = endless ? Math.pow(1.5, n - 20) : 1;
  return {
    id: b.id, name: (endless ? 'ENDLESS ' : '') + b.name, r: b.r, col: b.col,
    mhp: b.mhp * DIFFN().bossHp * (endless ? hpScale(n) * scale : 1),
    dmg: b.dmg * (endless ? 1.3 : 1), spd: 62 * (b.spdB || 1), xp: b.xp, gold: b.gold, goldV: b.gold,
  };
}
function spawnBoss() {
  const b = bossFor(G.night);
  const a = rnd(TAU);
  const e = {
    boss: true, bossName: b.name, bossId: b.id, type: 'boss_' + b.id,
    x: P.x + Math.cos(a) * 520, y: P.y + Math.sin(a) * 520,
    r: b.r, col: b.col, mhp: b.mhp, hp: b.mhp, spd: b.spd * DIFFN().espd, dmg: b.dmg,
    xp: b.xp, gold: 0, goldV: b.gold, elite: false, dr: 0, kbM: 0, kx: 0, ky: 0,
    chill: 0, frozen: 0, stun: 0, flash: 0, phase: 'idle', pT: 0, act: 0, t: 0, face: 1,
  };
  G.enemies.push(e);
  G.boss = e;
  G.nightHold = true;
  banner(b.name, 'SLAY IT TO ADVANCE', 3200, b.col, true);
  SND.play('boss');
  SND.heat = 1;
  CAM.kick(10);
  return e;
}

// ===== nights flow =====
function beginNight(n) {
  G.night = n;
  G.nightT = 0;
  G.nightHold = false;
  G.bossSpawned = false;
  G.gambledThisNight = false;
  G.rerolls = hasP('gambler') ? 1 : 0;
  G.spawnT = 0.5;
  G.waveT = 6;
  banner('NIGHT ' + n, 'The Broker comes at dawn', 2000, '#9ff0ff');
}
function endNight() {
  const nightGold = Math.round((40 + G.night * 8) * DIFFN().gold);
  addGold(nightGold, true);
  if (G.night === WIN_NIGHT) { winRun(); return; }
  if (G.night >= 10) checkAch('n10');
  G.state = 'pacts';
  SND.heat = Math.max(0, SND.heat - 0.4);
  UI.offerPacts();
}
function acceptPact(id) {
  G.pacts[id] = true;
  cnt('pacts');
  const p = PACTS.find(x => x.id === id);
  banner('PACT SEALED', p ? p.name : id, 2000, '#c58aff');
  SND.play('buy');
  nextNight();
}
function skipPact() {
  addGold(Math.round((40 + G.night * 10) * DIFFN().gold));
  banner('PACT REFUSED', '+' + Math.round((40 + G.night * 10) * DIFFN().gold) + ' gold', 1800, '#ffd76a');
  SND.play('cash');
  nextNight();
}
function nextNight() {
  G.state = 'run';
  UI.hidePacts();
  beginNight(G.night + 1);
  saveRun();
}

// ===== run lifecycle =====
function startRun(ch, diff) {
  loadSett();
  G.ch = ch; G.diff = diff || G.diff;
  G.state = 'run';
  G.t = 0; G.kills = 0; G.gold = 0; P.kills = 0;
  G.enemies.length = 0; G.bolts.length = 0; G.slashes.length = 0; G.eprojs.length = 0;
  G.parts.length = 0; G.rings.length = 0; G.pops.length = 0; G.zones.length = 0; G.beams.length = 0; G.drops.length = 0;
  G.pacts = {}; G.boss = null; G.ts = 1;
  P.x = 0; P.y = 0; P.level = 1; P.xp = 0; P.ultq = 0;
  P.dash = 0; P.dashT = 0; P.dashCd = 0; P.ifr = 0; P.invuln = 1.2;
  P.hitFx = 0; P.reviveUsed = 0; P.haste = 0; P.bladeCount = 0; P.walkPh = 0;
  P.form = null; P.formT = 0; P.bankaiNext = 10;
  P.shopRevive = SAVE.shop.revive || 0
  P.hp = pstats().mhp;
  W.boltT = 0.8; W.bladeT = 2; W.shieldT = 0;
  CAM.x = 0; CAM.y = 0; CAM.z = 1; CAM.tz = 1; CAM.rot = 0; CAM.trot = 0; CAM.tox = 0; CAM.toy = 0; CAM.follow = 5;
  beginNight(1);
  G.paused = false;
  cnt('runs');
  UI.enterRun();
  saveRun();
}
function saveRun() {
  SAVE.run = {
    ch: G.ch, diff: G.diff, night: G.night, t: G.t,
    hp: P.hp, level: P.level, xp: P.xp, ultq: P.ultq, gold: G.gold, kills: G.kills,
    pacts: Object.keys(G.pacts), reviveUsed: P.reviveUsed, shopRevive: P.shopRevive,
    date: Date.now(),
  };
  saveNow();
}
function resumeRun() {
  const r = SAVE.run;
  if (!r || !CHARS[r.ch]) return false;
  loadSett();
  G.ch = r.ch; G.diff = r.diff;
  G.enemies.length = 0; G.bolts.length = 0; G.slashes.length = 0; G.eprojs.length = 0;
  G.parts.length = 0; G.pops.length = 0; G.zones.length = 0; G.beams.length = 0; G.drops.length = 0;
  G.pacts = {}; (r.pacts || []).forEach(id => G.pacts[id] = true);
  G.state = 'run'; G.kills = r.kills || 0; G.gold = r.gold || 0; G.boss = null; G.ts = 1;
  P.x = 0; P.y = 0; P.level = r.level || 1; P.xp = r.xp || 0; P.ultq = r.ultq || 0;
  P.dash = 0; P.dashCd = 0; P.ifr = 0; P.invuln = 1; P.reviveUsed = r.reviveUsed || 0; P.shopRevive = r.shopRevive || 0;
  P.form = null; P.formT = 0; P.bankaiNext = 10; P.haste = 0;
  P.hp = Math.min(r.hp || 50, pstats().mhp);
  P.kills = r.kills || 0;
  beginNight(r.night || 1);
  UI.enterRun();
  return true;
}
function endRun(win) {
  if (G.state === 'end') return;
  G.state = 'end';
  SAVE.run = null;
  const bonus = win ? Math.round(500 * DIFFN().gold) : 0;
  if (win) { addGold(bonus, true); cnt('wins'); if (G.diff !== 'normal') checkAch('winh'); }
  SAVE.hist.unshift({ d: G.diff, n: G.night, ch: G.ch, kills: G.kills, win: !!win });
  SAVE.hist = SAVE.hist.slice(0, 50);
  const better = G.night > (SAVE.best[G.diff] || 0);
  if (better) SAVE.best[G.diff] = G.night;
  if (!SAVE.best.nightAll || SAVE.best.nightAll < G.night) SAVE.best.nightAll = G.night;
  saveNow();
  if (win) SND.play('jackpot'); else SND.play('bust');
  CAM.zoom(1, 0.5); CAM.rotTo(0, 0.5);
  UI.letterbox(false);
  UI.showEnd(win, bonus, better);
}
function winRun() { endRun(true); }
function continueEndless() {
  G.state = 'run';
  G.nightHold = false;
  G.nightT = 0;
  beginNight(G.night + 1);
  UI.hideEnd();
  saveRun();
}

function loadSett() { QUAL = QUAL_PRE[Sett.quality] || QUAL_PRE.med; }

// ===== world ambient =====
const BIOMES = [
  { name: 'Gravemoor', sky: ['#0a0c1a', '#16203a'], decor: 'grave', accent: '#3a4a6a', fog: 'rgba(40,55,90,0.10)' },
  { name: 'Ashfall', sky: ['#120a0a', '#2a1414'], decor: 'ash', accent: '#5a3a2a', fog: 'rgba(90,50,40,0.10)' },
  { name: 'Frozen Waste', sky: ['#0a1220', '#1a3050'], decor: 'ice', accent: '#3a5a7a', fog: 'rgba(120,170,220,0.10)' },
  { name: 'Rotwood', sky: ['#0a140a', '#14281a'], decor: 'rot', accent: '#2a5a3a', fog: 'rgba(40,110,70,0.10)' },
  { name: 'Null Rift', sky: ['#0d0a14', '#1e1430'], decor: 'null', accent: '#4a2a6a', fog: 'rgba(110,70,180,0.10)' },
];
function biomeFor(n) { return BIOMES[Math.floor((n - 1) / 4) % BIOMES.length]; }

// ===== tester panel =====
const TADMIN = {
  gold(v) { SAVE.gold += v || 1000; saveNow(); if (UI.menuGold) UI.menuGold(); toast('+' + (v || 1000) + ' gold'); },
  god() { P.hp = 99999; toast('GOD MODE HP'); },
  ult() { P.ultq = ULT_MAX; toast('ULT READY'); },
  lvl() { gainXP(xpNeed(P.level)); },
  unlock() { ROSTER.forEach(c => { if (!SAVE.owned.includes(c)) SAVE.owned.push(c); }); saveNow(); toast('ALL UNLOCKED'); },
  boss() { if (G.state === 'run') { spawnBoss(); toast('BOSS SUMMONED'); } },
  killAll() { [...G.enemies].forEach(e => { if (!e.boss) killEnemy(e); }); },
  heal() { P.hp = pstats().mhp; toast('HEALED'); },
  next() { if (G.state === 'run') { G.nightT = NIGHT_LEN - 0.1; } },
  save() { saveRun(); toast('RUN SAVED'); },
};
if (typeof window !== 'undefined') window.TADMIN = TADMIN;

// ===== PART2 : player update, dashes, spawner, world, tick =====
const WORLD_R = 3000;
function hpScale(n) { return 1 + Math.pow(n, 1.35) * 0.22; }

function updPlayer(dt) {
  const st = pstats();
  const joy = (typeof joyUpd === 'function') ? joyUpd() : null;
  let mx = 0, my = 0;
  if (G.state === 'cin') { mx = 0; my = 0; }
  else {
    if (KEYMAP.left) mx -= 1;
    if (KEYMAP.right) mx += 1;
    if (KEYMAP.up) my -= 1;
    if (KEYMAP.down) my += 1;
    if (joy) { mx += joy.x; my += joy.y; }
  }
  const m = Math.hypot(mx, my);
  if (m > 1) { mx /= m; my /= m; }
  P.moving = m > 0.1;
  if (P.moving) { P.walkPh += dt * 9; P.face = mx !== 0 ? (mx > 0 ? 1 : -1) : P.face; }

  if (P.dash > 0) {
    updDash(dt, st);
  } else {
    if (P.moving) { P.dir = Math.atan2(my, mx); }
    const sp = st.spd * (1 + P.haste) * (P.moving ? 1 : 0);
    P.x += mx * sp * dt;
    P.y += my * sp * dt;
  }
  P.x = clamp(P.x, -WORLD_R, WORLD_R);
  P.y = clamp(P.y, -WORLD_R, WORLD_R);

  // timers
  P.dashCd = Math.max(0, P.dashCd - dt);
  P.ifr = Math.max(0, P.ifr - dt);
  P.invuln = Math.max(0, P.invuln - dt);
  P.hitFx = Math.max(0, P.hitFx - dt);
  P.atkPose = Math.max(0, P.atkPose - dt * 3);
  P.haste = Math.max(0, P.haste - dt);
  if (P.formT > 0) {
    P.formT = Math.max(0, P.formT - dt);
    if (P.formT <= 0) {
      P.form = null;
      banner('FORM RELEASED', '', 1400, '#c8c8d8');
      burst(P.x, P.y, '#cfd0e0', 16, 240, 4);
    }
  }
}
function tryDash() {
  if (G.state !== 'run' || P.dashCd > 0 || P.dash > 0 || G.state === 'cin') return;
  const st = pstats();
  P.dashT = 0;
  P.dash = st.dashIfr;
  P.dashCd = st.dashCd;
  P.dashDir = P.moving ? P.dir : (P.face > 0 ? 0 : Math.PI);
  P.dashLen = st.dashLen;
  P.trail = [];
  SND.play('dash');
  CAM.kick(2.5);
  const ch = G.ch;
  // per-character dash FX + special passives
  if (ch === 'ichigo') { ring(P.x, P.y, 8, 60, '#ff9a3a', 3, 0.35); CAM.kick(4); }
  if (ch === 'rukia') {
    zone(P.x, P.y, st.inR * 0.8, 'rgba(140,220,255,0.15)', 1.2, 0, 0, true);
    part(P.x, P.y, '#bfeaff', 10, 120, 3);
  }
  if (ch === 'frieren') {
    // Blink: instant full-distance teleport with a mana streak
    const ox = P.x, oy = P.y;
    P.x = clamp(P.x + Math.cos(P.dashDir) * st.dashLen, -WORLD_R, WORLD_R);
    P.y = clamp(P.y + Math.sin(P.dashDir) * st.dashLen, -WORLD_R, WORLD_R);
    beam(ox, oy - 16, P.x, P.y - 16, '#cfe8ff', 3, 0.3);
    for (let i = 0; i < 8; i++) part(lerp(ox, P.x, i / 7), lerp(oy, P.y, i / 7), '#cfe8ff', 1, 60, 3);
    W.boltT = 0;                                  // blink reloads the staff
    W.bladeT = Math.min(W.bladeT, 0.4);
    P.haste = 1.2;
  }
  if (ch === 'kaido') { CAM.kick(9); burst(P.x, P.y, '#ffd76a', 12, 260, 4); part(P.x, P.y, '#ff5a3a', 8, 200, 5); }
  if (ch === 'gojo') {
    // Warp: instant blink + Blue crush (implosion) at the exit point
    const ox = P.x, oy = P.y;
    P.x = clamp(P.x + Math.cos(P.dashDir) * st.dashLen, -WORLD_R, WORLD_R);
    P.y = clamp(P.y + Math.sin(P.dashDir) * st.dashLen, -WORLD_R, WORLD_R);
    beam(ox, oy - 18, P.x, P.y - 18, '#8ab8ff', 2.5, 0.22);
    part(ox, oy, '#8ab8ff', 10, 160, 3);
    const cR = 170;
    for (const e of G.enemies) {
      if (e.dead) continue;
      const d = dist(P.x, P.y, e.x, e.y);
      if (d < cR) {
        if (!e.boss) {
          const a2 = angTo(e.x, e.y, P.x, P.y);
          const pull = (cR - d) * 0.62;
          e.x += Math.cos(a2) * pull;
          e.y += Math.sin(a2) * pull;
        }
        hitEnemy(e, 30, {});
      }
    }
    ring(P.x, P.y, 30, cR, '#5aa0ff', 4, 0.4);
    ring(P.x, P.y, cR, 20, '#8ab8ff', 3, 0.3);
    CAM.kick(5);
  }
}
function updDash(dt, st) {
  P.dash -= dt;
  P.dashT += dt;
  const ch = G.ch;
  const LEN = P.dashLen || 190;
  let spd;
  if (ch === 'kaido') {
    if (P.dashT < 0.28) {
      // charge up: slow wind
      if (P.dashT < 0.05) part(P.x, P.y, '#ffd76a', 5, 80, 4);
      spd = 40;
      if (P.dashT >= 0.28 && !P.dashKicked) { P.dashKicked = 1; CAM.kick(12); flash('#ffd76a', 0.22); SND.play('boom'); }
    } else {
      spd = 1150;
      if (!P.dashKicked) { P.dashKicked = 1; CAM.kick(12); flash('#ffd76a', 0.22); SND.play('boom'); }
    }
  } else {
    spd = LEN / Math.max(0.08, st.dashIfr * 0.55);
  }
  if (ch === 'gojo' || ch === 'frieren') spd = 0; // already blinked in tryDash
  if (P.dash <= 0) { P.dash = 0; P.dashKicked = 0; }
  P.trail = P.trail || [];
  P.trail.push({ x: P.x, y: P.y, life: 0.4 });
  if (P.trail.length > 20) P.trail.shift();
  P.x += Math.cos(P.dashDir) * spd * dt;
  P.y += Math.sin(P.dashDir) * spd * dt;
  P.x = clamp(P.x, -WORLD_R, WORLD_R);
  P.y = clamp(P.y, -WORLD_R, WORLD_R);
  // kaido dash crushes; ichigo shunpo cuts along his path
  if ((ch === 'kaido' && P.dashT > 0.28) || ch === 'ichigo') {
    for (const e of G.enemies) {
      if (e.dead || P.dashHit && P.dashHit.includes(e)) continue;
      if (dist(P.x, P.y, e.x, e.y) < e.r + 26) {
        (P.dashHit = P.dashHit || []).push(e);
        if (ch === 'kaido') hitEnemy(e, 18 * 2, { kb: 2.5, kbAng: P.dashDir, stun: 0.35, chill: 0 });
        else hitEnemy(e, 26, { kb: 1.8, kbAng: P.dashDir });
      }
    }
  }
  // rukia Senka: freeze the ground and everything on it behind her
  if (ch === 'rukia') {
    for (const e of G.enemies) {
      if (e.dead || P.dashHit && P.dashHit.includes(e)) continue;
      if (dist(P.x, P.y, e.x, e.y) < e.r + 30) {
        (P.dashHit = P.dashHit || []).push(e);
        freezeEnemy(e, 1.6);
      }
    }
    part(P.x, P.y + 4, '#cfeaff', 2, 40, 3, 'ghost');
  }
  if (P.dash <= 0) P.dashHit = null;
}
function blink(x, y) { // short teleport used by gojo dash? kept for fx
  part(P.x, P.y, '#8ab8ff', 8, 100, 3);
  P.x = x; P.y = y;
  part(P.x, P.y, '#8ab8ff', 8, 100, 3);
}

// ===== spawner =====
function updSpawner(dt) {
  if (G.state !== 'run') return;
  const D = DIFFN();
  const n = G.night;
  // from pool
  G.spawnT -= dt;
  if (G.spawnT <= 0) {
    const rate = D.rate * (1 + n * 0.05) * (hasP('horde') ? 1.35 : 1) * (hasP('thin') ? 0.8 : 1);
    G.spawnT = Math.max(0.35 / (QUAL.parity || 1), rnd(0.6, 1.1) / rate);
    const cap = Math.min(D.cap + n * 3, 220 * (QUAL.parity || 1));
    if (G.enemies.length < cap) {
      const pool = poolFor(n);
      const type = pick(pool.filter(t => ET[t]));
      const [x, y] = spawnR();
      const elite = Math.random() < (ELITE_CHANCE * n * (hasP('elite') ? 2.2 : 1) - 0.02);
      if (type && Math.random() < 1) spawnEnemy(type, x, y, elite);
    }
  }
  // waves
  G.waveT -= dt;
  if (G.waveT <= 0 && !G.bossSpawned) {
    G.waveT = rnd(14, 20);
    if (G.enemies.length < D.cap * 0.8) {
      const cntw = Math.min(30, 8 + Math.floor(n * 1.8));
      const poolw = poolFor(n).filter(t => ET[t] && t !== 'husk' && t !== 'wisp');
      if (poolw.length) {
        const wtype = pick(poolw);
        const ang = rnd(TAU);
        banner('WAVE', wtype.toUpperCase() + 'S INCOMING', 1600, '#c58aff');
        for (let i = 0; i < cntw; i++) {
          const a2 = ang + rnd(-0.9, 0.9), d = rnd(580, 780);
          spawnEnemy(wtype, clamp(P.x + Math.cos(a2) * d, -WORLD_R, WORLD_R), clamp(P.y + Math.sin(a2) * d, -WORLD_R, WORLD_R), false);
        }
      }
    }
  }
  // boss
  if (!G.bossSpawned && G.nightT > NIGHT_LEN * 0.28 && BOSSES[G.night]) {
    G.bossSpawned = true;
    spawnBoss();
  }
  if (hasP('horde')) {
    // extra trickle
    if (Math.random() < dt * 1.4 && G.enemies.length < D.cap) {
      const pool = poolFor(n);
      const type = pick(pool.filter(t => ET[t]));
      const [x, y] = spawnR();
      if (type) spawnEnemy(type, x, y, false);
    }
  }
}

// ===== world update (drops, parts, rings, zones) =====
function updWorld(dt) {
  const st = pstats();
  // drops magnet
  for (let i = G.drops.length - 1; i >= 0; i--) {
    const d = G.drops[i];
    d.t += dt;
    const dd = dist(P.x, P.y, d.x, d.y);
    if (dd < st.pickup) {
      const a = angTo(d.x, d.y, P.x, P.y);
      const pull = 340 * dt * (1 + (st.pickup - dd) / st.pickup);
      d.x += Math.cos(a) * pull; d.y += Math.sin(a) * pull;
    }
    if (dd < 20) {
      G.drops.splice(i, 1);
      if (d.kind === 'gem') { gainXP(d.v); SND.play('gem'); }
      if (d.kind === 'gold') { addGold(d.v, false); SND.play('gold'); }
      if (d.kind === 'heart') { heal(d.v); SND.play('joy'); ring(P.x, P.y, 8, 40, '#ff5a7a', 2, 0.4); cnt('_hearts'); }
    }
  }
  // parts
  for (let i = G.parts.length - 1; i >= 0; i--) {
    const p = G.parts[i];
    p.life -= dt;
    p.x += p.vx * dt; p.y += p.vy * dt;
    p.vx *= Math.pow(0.05, dt); p.vy *= Math.pow(0.05, dt);
    if (p.life <= 0) G.parts.splice(i, 1);
  }
  for (let i = G.rings.length - 1; i >= 0; i--) {
    const r = G.rings[i];
    r.life -= dt;
    r.r = lerp(r.r, r.r1, Math.min(1, dt * 5));
    if (r.life <= 0) G.rings.splice(i, 1);
  }
  for (let i = G.pops.length - 1; i >= 0; i--) {
    const p = G.pops[i];
    p.life -= dt;
    p.y -= 34 * dt;
    if (p.life <= 0) G.pops.splice(i, 1);
  }
  // zones: enemy danger zones blow after arm delay; friendly slow zones
  for (let i = G.zones.length - 1; i >= 0; i--) {
    const z = G.zones[i];
    z.dur -= dt;
    z.r0 = Math.min(z.r, z.r0 + z.r * dt * 3);
    if (z.dmg > 0 && !z.blew && z.dur < 0.18) {
      z.blew = true;
      ring(z.x, z.y, z.r * 0.4, z.r, z.col, 4, 0.4);
      burst(z.x, z.y, z.col, 10, 200, 3);
      SND.play('boom'); CAM.kick(4);
      if (z.friendly) continue;
      if (dist(P.x, P.y, z.x, z.y) < z.r + P.r && P.ifr <= 0 && P.dash <= 0) hurtPlayer(z.dmg, { x: z.x, y: z.y });
      // freeze zones can also hurt chilled check
    }
    if (z.dur <= 0) G.zones.splice(i, 1);
  }
  // beams fade handled at draw via life
  for (let i = G.beams.length - 1; i >= 0; i--) {
    G.beams[i].life -= dt;
    if (G.beams[i].life <= 0) G.beams.splice(i, 1);
  }
  // music heat target
  const dens = Math.min(1, G.enemies.length / 90);
  SND.heat += ((G.state === 'run' ? dens * 0.8 + (G.boss ? 0.3 : 0) : 0) - SND.heat) * Math.min(1, dt * 0.3);
}

// ===== main tick =====
function tick(dt) {
  if (G.paused) return;
  G.t += dt;
  if (G.state === 'run') {
    G.rt += dt;
    G.dt = dt; G.dtr = 1;
    updPlayer(dt);
    try { updBolt(dt); updBlade(dt); updShield(dt); } catch (e) {}
    try { updEnemies(dt); } catch (e) {}
    try { updEprojs(dt); } catch (e) {}
    updSpawner(dt);
    // night timer
    if (!G.nightHold) {
      G.nightT += dt * (hasP('dusk') ? 1.25 : 1);
      if (G.nightT >= NIGHT_LEN) {
        // dawn: clear field, wrap night
        for (const e of [...G.enemies]) if (!e.boss) killEnemy(e);
        if (G.boss) { // boss survives dawn, hold night
          G.nightHold = true;
        } else {
          endNight();
        }
      }
    }
    if (G.boss && G.boss.dead) { G.nightHold = false; }
    updWorld(dt);
    // auto ult
    if (Sett.autoUlt && P.ultq >= ULT_MAX) { try { ULT.can() && ULT.cast(); } catch (e) {} }
    // periodic autosave
    if (Math.floor(G.t) % 10 === 0 && G.t - (G._lastSave || 0) > 9) { G._lastSave = G.t; saveRun(); }
    // regen shop hp
    const st = pstats();
    if ((SAVE.shop.regen || 0) > 0) P.hp = Math.min(st.mhp, P.hp + st.mhp * 0.004 * SAVE.shop.regen * dt);
  } else if (G.state === 'cin') {
    G.dt = dt;
    const tscale = (typeof ULT !== 'undefined' && ULT.active && ULTDEF[ULT.id] && ULTDEF[ULT.id].ts) ? ULTDEF[ULT.id].ts(ULT.t) : 0.15;
    G.ts = tscale;
    ULT.upd(dt);
    updPlayer(dt * tscale);
    try { updEnemies(dt * tscale * 0.35); } catch (e) {}
    updWorld(dt);
  }
  CAM.upd(dt);
}
function isCin() { return G.state === 'cin'; }
