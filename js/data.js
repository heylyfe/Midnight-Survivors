'use strict';
// ===== data.js : roster, weapons, difficulty, enemies, pacts, shop, casino =====

const NIGHT_LEN = 75;      // seconds per night
const WIN_NIGHT = 20;
const NIGHT_BREAK = 6;
const ULT_MAX = 100;
const ELITE_GOLD = 6;
const ELITE_XP = 4;
const ELITE_CHANCE = 0.012;
const HEART_HEAL = 15;

function xpNeed(lvl) { return Math.round(8 + lvl * 6 + Math.pow(lvl, 1.6)); }

// ===== characters =====
const CHARS = {
  ichigo: {
    id: 'ichigo', name: 'Ichigo', price: 0, accent: '#ff8a3a',
    mhp: 115, dmgM: 1.0, boltM: 0.8, bladeM: 1.35, boltCdM: 1.1, spd: 150, taken: 1,
    dashCd: 2.2, dashLen: 170, dashIfr: 0.28, blockAdj: 0, revive: false, spdB: 1,
    pros: ['Best blade damage', 'Berserk below 40% HP'],
    cons: ['Slower bolts', 'No defences'],
    passiveName: 'Hollow Rage',
    passive: 'Below 40% health: +40% damage, blades swing faster. Every 5th blade swing crits. Hollow out at 25 kills, then 25/63/158/395 (x2.5 each time): 3x damage, wider reach, heals 30%, 35s. A hollow scream marks the moment.',
    dashDesc: 'Flash Step: quick burst, orange after-image.',
    ultName: 'Getsuga Tensho',
  },
  rukia: {
    id: 'rukia', name: 'Rukia', price: 2000, accent: '#9fe8ff',
    mhp: 95, dmgM: 0.95, boltM: 1.1, bladeM: 1.0, boltCdM: 0.85, spd: 160, taken: 0.95,
    dashCd: 1.8, dashLen: 200, dashIfr: 0.32, blockAdj: 0.08, revive: false, spdB: 1,
    pros: ['Chills everything she touches', 'Fastest attacks'],
    cons: ['Fragile', 'Low raw damage'],
    passiveName: 'Shirayuki\u2019s Grace',
    passive: 'Bolts and blade chill enemies (+50% damage vs chilled/frozen). Shield ring is stronger. Dash freezes the ground and enemies behind her.',
    dashDesc: 'Senka: long blink that freezes the ground behind her.',
    ultName: 'Hakka no Togame',
  },
  frieren: {
    id: 'frieren', name: 'Frieren', price: 5000, accent: '#8fd8ff',
    mhp: 85, dmgM: 1.05, boltM: 1.2, bladeM: 0.8, boltCdM: 0.75, spd: 165, taken: 1.05,
    dashCd: 2.4, dashLen: 210, dashIfr: 0.30, blockAdj: 0, revive: false, spdB: 1,
    pros: ['Strongest bolts, gets faster each night', 'Long dash'],
    cons: ['Squishy and light blades', 'Slow start'],
    passiveName: 'Mana Flow',
    passive: 'Cooldowns shrink by 7% per night survived (up to 36%). Bolts grant brief haste.',
    dashDesc: 'Folk spell: gliding teleport streak.',
    ultName: 'Zoltrak Barrage',
  },
  kaido: {
    id: 'kaido', name: 'Kaido', price: 8000, accent: '#ffd76a',
    mhp: 210, dmgM: 1.1, boltM: 1.0, bladeM: 1.25, boltCdM: 1.2, spd: 128, taken: 0.85,
    dashCd: 3.2, dashLen: 300, dashIfr: 0.45, blockAdj: 0.05, revive: false, spdB: 1,
    pros: ['Massive HP, tanky', 'Dash charges then flattens enemies'],
    cons: ['Slowest, long dash cooldown', 'Clumsy attacks'],
    passiveName: 'Dragonskin',
    passive: 'Takes half damage below 30% HP. Dash damages and stuns anything it hits. Blade is a 360 smash.',
    dashDesc: 'Thunder charge: winds up, then rockets forward crushing all in the way.',
    ultName: 'Thunder Bagua',
  },
  gojo: {
    id: 'gojo', name: 'Gojo', price: 15000, accent: '#a05aff',
    mhp: 105, dmgM: 1.15, boltM: 1.15, bladeM: 1.0, boltCdM: 0.8, spd: 172, taken: 1,
    dashCd: 1.6, dashLen: 190, dashIfr: 0.26, blockAdj: 0.10, revive: true, spdB: 1,
    pros: ['Infinity: weak enemies cannot touch him', 'Strong overall, revive once per run'],
    cons: ['Fragile glass cannon', 'Expensive'],
    passiveName: 'Nah, I\u2019d Win.',
    passive: 'Infinity: an invisible veil stops everything — small enemies are crushed on contact in a splash of blue, heavy units crawl. First death per run triggers Hollow Purple instead (revive at 50% HP). Red: one projectile that grows in power every level. Blue: every 5s a wide crush circle 1-taps small enemies and yanks the rest in.',
    dashDesc: 'Cursed flick: near-instant blink + blue static.',
    ultName: 'Hollow Purple',
  },
};
const ROSTER = ['ichigo', 'rukia', 'frieren', 'kaido', 'gojo'];

// gojo's Infinity: near-invisible veil that weak enemies cannot cross.
// small units are crushed on contact (blue splatter); heavy units crawl, slowed.
const INFTY = { r: 58, slow: 0.42 };

// ===== universal weapons =====
const WEAP = {
  shield: { inR: 64, outR: 130, block: 0.22, tick: 0.5 },
  // base damage numbers; pstats().dmg (char mult, shop might, growth) is applied once in hitEnemy
  bolt:  { base: 12 },
  blade: { base: 24 },
};

// ===== auto growth per level (no votes) =====
const GROWTH = {
  mhp:    { per: 0.035 },
  hpFlat: { per: 2.2 },
  dmg:    { per: 0.055 },
  spd:    { per: 0.008, cap: 0.16 },
  area:   { per: 0.012, cap: 0.30 },
  cd:     { per: 0.006, cap: 0.28 },
  dashLen:  { per: 0.010, cap: 0.25 },
  dashIfr: { per: 0.004, cap: 0.14 },
  block: { per: 0.003, cap: 0.12 },
  pickup: { per: 0.012, cap: 0.40 },
  healFrac: 0.015,
};

// ===== difficulty =====
const DIFF = {
  normal:   { name: 'Normal',   rate: 1.0,  cap: 130, edmg: 1.0,  heal: 1.0,  gold: 1.0,  espd: 1.0,  bossHp: 1.0,  pactW: 1.0,  ultCharge: 1.0 },
  hard:     { name: 'Hard',     rate: 1.25, cap: 160, edmg: 1.3,  heal: 0.8,  gold: 1.15, espd: 1.1,  bossHp: 1.3,  pactW: 1.25, ultCharge: 0.9 },
  hardcore: { name: 'Hardcore', rate: 1.5,  cap: 200, edmg: 1.7,  heal: 0.0,  gold: 1.35, espd: 1.2,  bossHp: 1.7,  pactW: 1.6,  ultCharge: 0.8 },
};

// ===== enemies =====
// hp/dmg/xp/gold per night scale in code; here base values
const ET = {
  wisp:    { hp: 10,  r: 12, spd: 105, dmg: 6,  xp: 1, gold: 0.5, col: '#8a5cf0' },
  husk:    { hp: 22,  r: 14, spd: 72,  dmg: 9,  xp: 2, gold: 0.8, col: '#4a5a4e' },
  hound:   { hp: 16,  r: 13, spd: 150, dmg: 10, xp: 2, gold: 0.7, col: '#6a3a5a' },
  charger: { hp: 30,  r: 16, spd: 88,  dmg: 14, xp: 3, gold: 1.1, col: '#8a3a4e' },
  spitter: { hp: 24,  r: 15, spd: 78,  dmg: 8,  xp: 3, gold: 1.0, col: '#3a8a5a' },
  bomber:  { hp: 18,  r: 15, spd: 120, dmg: 16, xp: 3, gold: 1.2, col: '#c84a2a' },
  splitter:{ hp: 34,  r: 20, spd: 60,  dmg: 10, xp: 4, gold: 1.4, col: '#3aa0a0' },
  shard:   { hp: 8,   r: 9,  spd: 130, dmg: 7,  xp: 1, gold: 0.2, col: '#7ae8e8' },
  tank:    { hp: 90,  r: 24, spd: 40,  dmg: 18, xp: 8, gold: 3.2, col: '#5a5a72' },
  matron:  { hp: 70,  r: 22, spd: 55,  dmg: 12, xp: 10, gold: 4.0, col: '#7a4aa8', summoner: true },
};
function poolFor(n) {
  // night-gated pools
  const p = ['wisp', 'husk'];
  if (n >= 2) p.push('hound');
  if (n >= 3) p.push('charger', 'spitter');
  if (n >= 4) p.push('bomber');
  if (n >= 6) p.push('splitter');
  if (n >= 8) p.push('tank');
  if (n >= 10) p.push('matron');
  return p;
}

// ===== bosses: nights 5 / 10 / 15 / 20, then endless =====
const BOSSES = {
  5:  { id: 'gravelord',  name: 'THE GRAVELORD',  r: 52, mhp: 1400, dmg: 16, xp: 40, gold: 150, col: '#2a3a5a', spdB: 0.9 },
  10: { id: 'nightmother', name: 'THE NIGHTMOTHER', r: 50, mhp: 3600, dmg: 20, xp: 80, gold: 320, col: '#5a2a8a', spdB: 0.8 },
  15: { id: 'ashking',   name: 'THE ASH KING',    r: 58, mhp: 8200, dmg: 26, xp: 140, gold: 600, col: '#8a3a1a', spdB: 1.1 },
  20: { id: 'devourer',  name: 'THE DEVOURER',    r: 64, mhp: 17000, dmg: 34, xp: 250, gold: 1200, col: '#3a1a5a', spdB: 1.0 },
};

// ===== night pacts (dusk bargains) =====
// each: strong boon, real curse. skip for gold. gambler pact grants a reroll each night.
const PACTS = [
  { id: 'gambler', name: 'Gambler\u2019s Coin', boon: 'One pact reroll every night', curse: 'Casino wins feel 0% worse (pure boon, coward\u2019s pick)', rarity: 1.4 },
  { id: 'might', name: 'Blood of Titans', boon: '+45% damage', curse: 'Take +20% damage', rarity: 1.2,
    d: { dmg: 1.45, taken: 1.2 } },
  { id: 'glass', name: 'Glass Soul', boon: '+70% damage', curse: '-30% max health', rarity: 1.0,
    d: { dmg: 1.7, mhp: 0.7 } },
  { id: 'swift', name: 'Winded Heels', boon: '+30% move speed', curse: 'Enemies +15% speed', rarity: 1.1,
    d: { spd: 1.3, espd: 1.15 } },
  { id: 'focus', name: 'Buzzing Mind', boon: '-22% cooldowns', curse: '-20% pickup range', rarity: 1.1,
    d: { cd: 0.78, pickup: 0.8 } },
  { id: 'hunger', name: 'Hungering Aura', boon: 'Shield ticks +120% damage, +25% area', curse: 'Enemies collide harder (+15% contact)', rarity: 1.0,
    d: { tickx: 2.2, area: 1.25, contact: 1.15 } },
  { id: 'vampire', name: 'Midnight Thirst', boon: 'Shield kills heal you (+8 HP per kill inside aura)', curse: 'Heals 55% weaker', rarity: 1.0,
    d: { heal: 8, healWeaken: 0.45 } },
  { id: 'blitz', name: 'Blitz Edge', boon: 'Blade +50% damage', curse: 'Bolts -25% damage', rarity: 1.0,
    d: { bladeDmg: 1.5, bolt: 0.75 } },
  { id: 'sniper', name: 'Long Rhythm', boon: 'Bolt pierces +1 enemy, bolts +15%', curse: 'Blade -20%', rarity: 1.0,
    d: { bolt: 1.15, pierce: 1, bladeDmg: 0.8 } },
  { id: 'glacier', name: 'Glacier Heart', boon: 'Chill lasts +60%, shield chills all', curse: '-12% move speed', rarity: 1.05,
    d: { chillx: 1.6, spd: 0.88 } },
  { id: 'frost', name: 'Absolute Winter', boon: 'Shield ring freezes enemies solid', curse: 'Ult charges 25% slower', rarity: 0.9,
    d: { fullfreeze: true, ult: 0.75 } },
  { id: 'hoarder', name: 'Hoarder\u2019s Curse', boon: '+80% gold from all sources', curse: 'Ult charges 15% slower', rarity: 1.1,
    d: { egold: 1.8, ult: 0.85 } },
  { id: 'accel', name: 'Overdrive', boon: 'Ult charges +50% faster', curse: 'Nights pass 25% faster', rarity: 1.0,
    d: { ult: 1.5, dusk: true } },
  { id: 'horde', name: 'Feast Invitation', boon: 'Enemies drop more gold (+35% gold stat applies)', curse: 'Way more enemies', rarity: 0.9,
    d: { egold: 1.35 }, horde: true },
  { id: 'elite', name: 'Trophy Hunter', boon: 'Elites (fat gold/xp) spawn twice as often', curse: 'Elites hit like trucks', rarity: 0.85,
    d: {}, elite: true },
  { id: 'thin', name: 'Thin Veil', boon: '30% fewer enemies', curse: '-25% XP... just kidding: shield -20% size', rarity: 1.0,
    d: { outR: 0.8 }, thin: true },
];
const PACTDEF = {};
PACTS.forEach(p => { PACTDEF[p.id] = Object.assign({}, p.d || {}); });
// flags
PACTDEF.horde = PACTDEF.horde || {}; PACTDEF.horde.horde = true;
PACTDEF.elite = PACTDEF.elite || {}; PACTDEF.elite.elite = true;
PACTDEF.thin = PACTDEF.thin || {}; PACTDEF.thin.thin = true;
PACTDEF.accel = PACTDEF.accel || {}; PACTDEF.accel.dusk = true;
PACTDEF.midnight = { heal: 8 }; // used if vampire selected under name 'midnight'
PACTDEF.vampire = PACTDEF.vampire || {}; PACTDEF.vampire.midnight = true;

// ===== permanent shop =====
const SHOP = [
  { id: 'might',  name: 'Titan Blood',  desc: '+6% damage per rank',        max: 8,  base: 120,  mul: 1.7 },
  { id: 'vital',  name: 'Iron Heart',   desc: '+6% max HP per rank',        max: 8,  base: 100,  mul: 1.7 },
  { id: 'swift',  name: 'Wolf Boots',   desc: '+3% move speed per rank',    max: 6,  base: 140,  mul: 1.8 },
  { id: 'focus',  name: 'Clear Mind',   desc: '-4% cooldowns per rank',    max: 6,  base: 160,  mul: 1.8 },
  { id: 'haste',  name: 'Quickstep',    desc: '-5% dash cooldown per rank', max: 5,  base: 130,  mul: 1.8 },
  { id: 'reach',  name: 'Magnet Soul',  desc: '+10% pickup range per rank',max: 5,  base: 110,  mul: 1.7 },
  { id: 'greed',  name: 'Greed',        desc: '+8% gold per rank',          max: 8,  base: 150,  mul: 1.75 },
  { id: 'aegis',  name: 'Aegis Seal',   desc: '+3% shield block per rank',  max: 5,  base: 180,  mul: 1.85 },
  { id: 'regen',  name: 'Slow Renewal', desc: 'Regenerate 0.4%/s per rank',max: 4,  base: 220,  mul: 2 },
  { id: 'revive', name: 'Phoenix Ember',desc: 'Revive once per run at 35% HP per rank', max: 2, base: 900, mul: 1.6 },
  { id: 'luck',   name: 'Gambler\u2019s Luck', desc: 'Casino odds drift your way per rank', max: 4, base: 250, mul: 1.9 },
];
function shopCost(it) {
  const r = SAVE.shop[it.id] || 0;
  return Math.round(it.base * Math.pow(it.mul, r));
}

// ===== achievements =====
const ACH = [
  { id: 'first', name: 'First Night', desc: 'Survive night 1' },
  { id: 'k5000', name: 'Monster Hunter', desc: 'Kill 5000 enemies (lifetime)' },
  { id: 'n10', name: 'Nights Watch', desc: 'Reach night 10' },
  { id: 'n10b', name: 'Boss Slayer', desc: 'Kill any boss' },
  { id: 'winh', name: 'Against All Odds', desc: 'Win on Hard or Hardcore' },
  { id: 'ult10', name: 'Unleashed', desc: 'Cast 10 ultimates (lifetime)' },
  { id: 'bet1k', name: 'High Roller', desc: 'Wager 1000 gold in the casino' },
  { id: 'ladder', name: 'To the Moon', desc: 'Cash out at ladder rung 6+' },
  { id: 'streak', name: 'Hot Hand', desc: 'Win 5 casino games in a row' },
  { id: 'bust', name: 'Gambler\u2019s Ruin', desc: 'Bust at the top of the ladder' },
  { id: 'allchars', name: 'Full Roster', desc: 'Unlock every character' },
  { id: 'hardcore1', name: 'No Rest', desc: 'Survive to night 10 on Hardcore' },
  { id: 'pac10', name: 'Pact Maker', desc: 'Accept 10 pacts (lifetime)' },
  { id: 'rich', name: 'Gilded', desc: 'Hold 10000 gold at once' },
];
function checkAchRuntime() {
  if ((SAVE.cnt.kills || 0) >= 5000) checkAchInd('k5000');
  // called from UI after relevant events
}
function checkAchInd(id) { if (typeof checkAch === 'function') checkAch(id); }

// ===== quality presets =====
const QUAL_PRE = {
  low:  { name: 'Low',  parts: 140, parity: 0.5, glow: false, decor: false, sep: false, shake: 0.6, res: 0.66 },
  med:  { name: 'Medium', parts: 450, parity: 0.85, glow: false, decor: true, sep: true, shake: 1, res: 1 },
  high: { name: 'High', parts: 900, parity: 1, glow: true, decor: true, sep: true, shake: 1.2, res: 1.5 },
};

// ===== HEX & GOLD : the casino under the manor =====
const CASINO_NAME = 'HEX & GOLD';
const CASINO_TAG = 'the den under the manor';
// stakes chips
const CAS_BETS = [25, 100, 500, 2500];
const CAS_MIN = 25;
const CAS_MAX = 25000;

// machine 1: Coin of Fate (simple double or nothing)
// machine 2: Devil\u2019s Dice (over/under 7)
const DICE_PAYOUT_OVER = 2.2;
const DICE_PAYOUT_SEVEN = 4.5;

// machine 3: Cursed Slots
const CAS_SYM = ['skull', 'eye', 'moon', 'crown', 'seventh'];
const CAS_SLOTS = [
  { sym: 'skull',  w: 30 },
  { sym: 'eye',    w: 26 },
  { sym: 'moon',   w: 22 },
  { sym: 'crown',  w: 14 },
  { sym: 'seventh', w: 8 },
];
const SLOT_PAYS = {
  'skull:skull:skull': 3.0,
  'eye:eye:eye': 4.5,
  'moon:moon:moon': 7,
  'crown:crown:crown': 18,
  'seventh:seventh:seventh': 66,
  pair: 1.4, // any pair
};

// machine 4: Fortune\u2019s Ladder (climb or bust, cash out anytime)
// each rung: success chance and multiplier
const CAS_LADDER = [
  { p: 0.78, x: 1.6,  name: 'Creaky Step' },
  { p: 0.72, x: 2.4,  name: 'Moss Rung' },
  { p: 0.66, x: 3.8,  name: 'Candle Ledge' },
  { p: 0.60, x: 6.0,  name: 'Mirror Shelf' },
  { p: 0.54, x: 10,   name: 'Silver Cache' },
  { p: 0.46, x: 18,   name: 'Obsidianspar' },
  { p: 0.38, x: 32,   name: 'Wyrm Terrace' },
  { p: 0.30, x: 64,   name: 'Crown Loft' },
  { p: 0.22, x: 120,  name: 'The Vault Door' },
  { p: 0.15, x: 300,  name: 'MOONLIGHT' },
];
const MACHINES = [
  { id: 'coin',  name: 'Coin of Fate',  blurb: 'One flip. Double or nothing. The coin remembers nothing.' },
  { id: 'dice',  name: 'Devil\u2019s Dice', blurb: 'Over or under 7 pays \u00d72.2. Exactly 7 pays \u00d74.5. The devil pays attention.' },
  { id: 'slots', name: 'Cursed Slots',  blurb: 'Three reels, five hexes. Sevens are watching you.' },
  { id: 'ladder', name: 'Fortune\u2019s Ladder', blurb: '10 rungs. Climb or bust. Cash out whenever your nerve fails.' },
];
