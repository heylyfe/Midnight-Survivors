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
  });
  for (const file of ['util.js', 'data.js', 'core.js', 'enemies.js', 'weapons.js', 'ults.js']) {
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


test('Hollow Purple damages all directions and bosses once, within its radius', () => {
  const run = game();
  run(`G.ch = 'gojo'; P.ultq = ULT_MAX;
    const nearby = [[-500,0],[500,0],[0,-500],[0,500],[180,180]].map(([x,y]) => spawnEnemy('tank', x, y, false));
    nearby.forEach(e => e.hp = e.mhp = 2000);
    const boss = spawnBoss(); boss.x = 0; boss.y = 100;
    const far = spawnEnemy('tank', 730, 0, false);
    ULT.cast(); ULT.upd(0.95);`);
  assert.ok(run('nearby.every(e => e.hp === e.mhp)'));
  run('ULT.upd(0.68)');
  assert.ok(run('nearby.every(e => e.hp < e.mhp && !e.dead)'));
  assert.ok(run('boss.hp < boss.mhp && !boss.dead'));
  assert.ok(run('far.hp === far.mhp'));
  run('const damageAfterWave = nearby.map(e => e.hp); ULT.upd(0.1)');
  assert.ok(run('nearby.every((e, i) => e.hp === damageAfterWave[i])'));
});

test('Gojo unlocks Infinity at 2000 kills in the current run', () => {
  const run = game();
  run("G.ch = 'gojo'; SAVE.cnt.kills = 9000; G.kills = 1999; P.kills = 1999;");
  assert.equal(run('pstats().infR'), undefined);
  run("killEnemy(spawnEnemy('wisp', 10, 0, false))");
  assert.ok(run('pstats().infR > 0'));
  run('saveRun(); G.kills = 0; resumeRun()');
  assert.ok(run('pstats().infR > 0'));
  run("startRun('gojo', 'normal')");
  assert.equal(run('pstats().infR'), undefined);
});

test('directional ult aim waits, auto-aims on timeout, and honors a manual direction', () => {
  const run = game();
  run("P.ultq = ULT_MAX; const left = spawnEnemy('tank', -180, 0, false); left.hp = 2000; spawnEnemy('wisp', -160, 10, false); spawnEnemy('wisp', 130, 0, false); ULT.request()");
  assert.equal(run('ULT.aimLeft'), 3);
  run('tick(2.9)');
  assert.equal(run('G.state'), 'run');
  assert.equal(run('G.nightT'), 0);
  run('tick(0.11)');
  assert.equal(run('G.state'), 'cin');
  assert.ok(run('Math.cos(ULT.aim) < -0.9'));
  run('ULT.end(); P.ultq = ULT_MAX; ULT.request(); ULT.cast(Math.PI / 2); ULT.upd(1.5)');
  assert.ok(run('ULT.o.swing.y > P.y && Math.abs(ULT.o.swing.x - P.x) < 0.01'));
  assert.equal(run('left.hp'), 2000);
  run("ULT.end(); G.ch = 'gojo'; P.ultq = ULT_MAX; ULT.request()");
  assert.equal(run('ULT.aimLeft'), 0);
  assert.equal(run('G.state'), 'cin');
});
