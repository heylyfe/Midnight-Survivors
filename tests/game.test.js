// Run with: node --test tests/game.test.js
const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');

function game() {
  const storage = new Map();
  const context = vm.createContext({
    console, Math, Date,
    window: {},
    localStorage: { getItem: k => storage.get(k) || null, setItem: (k, v) => storage.set(k, v) },
    SND: { play() {}, heat: 0 },
    UI: { toast() {}, banner() {}, enterRun() {}, offerPacts() {}, hidePacts() {}, showEnd() {}, letterbox() {} },
    KEYMAP: { left: false, right: false, up: false, down: false },
    ULT: { can: () => false, active: false },
  });
  for (const file of ['util.js', 'data.js', 'core.js', 'enemies.js', 'weapons.js']) {
    vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js', file), 'utf8'), context, { filename: file });
  }
  vm.runInContext('SAVE = defSave(); Sett = SAVE.set; G.state = "run"; P.hp = pstats().mhp;', context);
  return code => vm.runInContext(code, context);
}

test('kill achievement unlocks at 5000, not on the first kill', () => {
  const run = game();
  run("killEnemy(spawnEnemy('wisp', 0, 0, false))");
  assert.equal(run('SAVE.cnt.kills'), 1);
  assert.equal(run('!!SAVE.ach.k5000'), false);
  run("SAVE.cnt.kills = 4999; killEnemy(spawnEnemy('wisp', 0, 0, false))");
  assert.equal(run('!!SAVE.ach.k5000'), true);
});

test('pacts affect cooldown, pickup, healing, and night speed', () => {
  const run = game();
  const cooldown = run('pstats().cd');
  const pickup = run('pstats().pickup');
  run('G.pacts.focus = true');
  assert.ok(run('pstats().cd') < cooldown);
  assert.ok(run('pstats().pickup') < pickup);
  run("G.pacts = {vampire:true}; P.hp = 20; killEnemy(spawnEnemy('wisp', 0, 0, false))");
  assert.ok(run('P.hp') > 20);
  run('G.pacts = {accel:true}; G.nightT = 0; G.spawnT = 100; G.waveT = 100; tick(0.04)');
  assert.equal(run('G.nightT'), 0.05);
});

test('moon shrine grants health and charge only once', () => {
  const run = game();
  run('P.hp = 20; P.ultq = 0; G.shrine = {x:0, y:0, life:5}; updShrine(0.01)');
  assert.ok(run('P.hp') > 20);
  assert.equal(run('P.ultq'), 15);
  assert.equal(run('G.shrine'), null);
  run('updShrine(0.01)');
  assert.equal(run('P.ultq'), 15);
});

test('endless bosses spawn and a checkpoint restores their health and player progress', () => {
  const run = game();
  run('G.night = 25; G.nightT = 30; G.spawnT = 100; G.waveT = 100; updSpawner(0.01)');
  assert.ok(run('!!G.boss'));
  run("G.boss.hp = 123; P.x = 44; P.y = 55; P.mode = 'range'; saveRun(); G.boss = null; resumeRun()");
  assert.equal(run('G.night'), 25);
  assert.equal(run('G.nightT'), 30);
  assert.equal(run('G.boss.hp'), 123);
  assert.equal(run('P.x'), 44);
  assert.equal(run('P.mode'), 'range');
});

test('sniper bolts pierce once and shield pacts apply their effects', () => {
  const run = game();
  run("G.pacts = {sniper:true}; P.mode = 'melee'; const a = spawnEnemy('tank', 18, 0, false); const b = spawnEnemy('tank', 18, 0, false); fireBolt(0, 1, '#fff', 'orb', 10, {}); updBolt(0)");
  assert.ok(run('a.hp < a.mhp && b.hp < b.mhp'));
  run("G.enemies.length = 0; G.pacts = {glacier:true, frost:true}; const c = spawnEnemy('tank', 20, 0, false); W.shieldT = 0; updShield(0)");
  assert.ok(run('c.frozen > 0'));
});

test('corrupted primary save falls back to a valid backup', () => {
  const run = game();
  run("SAVE.gold = 123; saveNow(); localStorage.setItem(SAVE_KEY, '{broken'); loadSave()");
  assert.equal(run('SAVE.gold'), 123);
});

test('Kaido blade hits enemies behind him', () => {
  const run = game();
  run("G.ch = 'kaido'; const front = spawnEnemy('tank', 70, 0, false); const behind = spawnEnemy('tank', -70, 0, false); W.bladeT = 0; updBlade(0)");
  assert.ok(run('front.hp < front.mhp && behind.hp < behind.mhp'));
});
