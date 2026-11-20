'use strict';
// ===== main.js : input, camera render pipeline, loop =====

let cvs, ctx, VW = 0, VH = 0, DPR = 1;
const menuBG = { t: 0, motes: [] };
for (let i = 0; i < 40; i++) menuBG.motes.push({ x: Math.random(), y: Math.random(), s: rnd(0.02, 0.09), r: rnd(1, 3) });

const KEYMAP = { left: false, right: false, up: false, down: false };
function resize() {
  DPR = Math.min(2, (window.devicePixelRatio || 1) * (QUAL.res || 1));
  VW = window.innerWidth; VH = window.innerHeight;
  cvs.width = Math.round(VW * DPR); cvs.height = Math.round(VH * DPR);
  cvs.style.width = VW + 'px'; cvs.style.height = VH + 'px';
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
}
window.__resize = resize;

// ===== input =====
function key(e, down) {
  const k = e.key.toLowerCase();
  if (k === 'a' || k === 'arrowleft') KEYMAP.left = down;
  if (k === 'd' || k === 'arrowright') KEYMAP.right = down;
  if (k === 'w' || k === 'arrowup') KEYMAP.up = down;
  if (k === 's' || k === 'arrowdown') KEYMAP.down = down;
}
window.addEventListener('keydown', (e) => {
  SND.init();
  const k = e.key.toLowerCase();
  if (e.target.matches('input, textarea, select')) return;
  if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(k) || k === 'space') e.preventDefault();
  if (e.repeat) return;
  if (ULT.aimLeft > 0 && !G.paused) {
    const aimKeys = { ArrowRight: 0, ArrowDown: 2, ArrowLeft: 4, ArrowUp: 6 };
    if (Object.hasOwn(aimKeys, e.key)) {
      ULT.cast(aimKeys[e.key] * Math.PI / 4);
      return;
    }
  }
  key(e, true);
  if (G.state === 'run' && !G.paused) {
    if (k === ' ' || k === 'space' || k === 'shift') tryDash();
    if (k === 'e' && typeof cycleMode === 'function') cycleMode();
    if (k === 'u' || k === 'x' || k === 'q') { if (!ULT.request()) SND.play('deny'); }
  }
  if (k === 'escape' || k === 'p') {
    if (G.paused) UI.hidePause();
    else UI.showPause();
  }
});
window.addEventListener('keyup', (e) => key(e, false));
function clearInput() {
  Object.keys(KEYMAP).forEach(k => KEYMAP[k] = false);
  resetJoystick();
}
window.addEventListener('blur', clearInput);

// ===== touch =====
const joy = { on: false, x: 0, y: 0, id: null, cx: 0, cy: 0 };
function joyUpd() {
  return joy.on ? { x: joy.x, y: joy.y } : null;
}
window.addEventListener('touchstart', (e) => {
  SND.init();
  if (G.state !== 'run' || G.paused || joy.on) return;
  for (const t of e.changedTouches) {
    if (t.target.closest && t.target.closest('#mbtns,#ult-aim,#casino,#pact,#paused,#end,#menu,#tap')) continue;
    if (t.clientX < window.innerWidth / 2) {
      joy.on = true; joy.id = t.identifier; joy.cx = t.clientX; joy.cy = t.clientY;
      const jd = document.getElementById('joystick');
      if (jd) {
        jd.classList.add('on');
        jd.style.left = (t.clientX - 60) + 'px';
        jd.style.top = (t.clientY - 60) + 'px';
      }
      break;
    }
  }
}, { passive: true });
window.addEventListener('touchmove', (e) => {
  for (const t of e.changedTouches) {
    if (joy.on && t.identifier === joy.id) {
      const dx = t.clientX - joy.cx, dy = t.clientY - joy.cy;
      const m = Math.hypot(dx, dy) || 1;
      const cl = Math.min(1, m / 55);
      joy.x = (dx / m) * cl; joy.y = (dy / m) * cl;
      const dot = document.getElementById('joystick-dot');
      if (dot) { dot.style.transform = `translate(${joy.x * 40}px,${joy.y * 40}px)`; }
    }
  }
}, { passive: true });
function resetJoystick() {
  joy.on = false;
  joy.id = null;
  joy.x = joy.y = 0;
  document.getElementById('joystick')?.classList.remove('on');
  const dot = document.getElementById('joystick-dot');
  if (dot) dot.style.transform = '';
}
function endTouch(e) {
  if (joy.on && Array.from(e.changedTouches).some(t => t.identifier === joy.id)) resetJoystick();
}
window.addEventListener('touchend', endTouch, { passive: true });
window.addEventListener('touchcancel', endTouch, { passive: true });
function bindTouchButton(id, action) {
  const button = document.getElementById(id);
  if (!button) return;
  // A second finger may never produce a click while the joystick touch is held.
  button.addEventListener('touchstart', (event) => {
    event.preventDefault(); // Avoid a second activation from the synthetic click.
    action();
  }, { passive: false });
  button.addEventListener('click', action);
}
window.addEventListener('load', () => {
  bindTouchButton('db', () => {
    if (G.paused) return;
    const direction = joy.on && Math.hypot(joy.x, joy.y) > 0.1 ? Math.atan2(joy.y, joy.x) : undefined;
    tryDash(direction);
  });
  bindTouchButton('mmb', () => { if (G.state === 'run' && !G.paused) cycleMode(); });
  bindTouchButton('ubb', () => {
    if (G.state !== 'run' || G.paused) return;
    if (!ULT.request()) SND.play('deny');
  });
  bindTouchButton('pb', () => UI.showPause());
  for (const button of document.querySelectorAll('#ult-aim button')) {
    bindTouchButton(button.id, () => {
      if (ULT.aimLeft <= 0 || G.paused) return;
      ULT.cast(button.dataset.aim === 'auto' ? undefined : Number(button.dataset.aim) * Math.PI / 4);
    });
  }
});

// never let a run touch turn into a context menu or pinch-zoom
window.addEventListener('contextmenu', (e) => { if (G.state === 'run' || G.state === 'cin') e.preventDefault(); });
document.addEventListener('gesturestart', (e) => e.preventDefault());

// ===== ambient world drawing =====
function drawBG(c) {
  const b = biomeFor(G.night);
  c.save();
  // background is a screen-space overlay: ignore camera transform
  c.setTransform(DPR, 0, 0, DPR, 0, 0);
  // sky gradient by biome
  const g = c.createLinearGradient(0, 0, 0, VH);
  g.addColorStop(0, b.sky[0]);
  g.addColorStop(1, b.sky[1]);
  c.fillStyle = g;
  c.fillRect(0, 0, VW, VH);
  // parallax dot grid (slow half-speed drift)
  if (QUAL.decor) {
    c.fillStyle = b.accent + '22';
    const s = 90, ox = -((CAM.x * 0.5) % s + s) % s, oy = -((CAM.y * 0.5) % s + s) % s;
    for (let x = ox; x < VW + s; x += s) {
      for (let y = oy; y < VH + s; y += s) {
        c.fillRect(x, y, 2, 2);
      }
    }
  }
  c.restore();
}
function drawDecor(c) {
  if (!QUAL.decor) return;
  const b = biomeFor(G.night);
  // scattered decor sprites (stones / trees) in world space
  const s2 = 260;
  const wx0 = Math.floor((CAM.x - VW / 2) / s2) - 1, wx1 = Math.ceil((CAM.x + VW / 2) / s2) + 1;
  const wy0 = Math.floor((CAM.y - VH / 2) / s2) - 1, wy1 = Math.ceil((CAM.y + VH / 2) / s2) + 1;
  c.strokeStyle = b.accent + '55';
  c.lineWidth = 2;
  for (let gx = wx0; gx <= wx1; gx++) {
    for (let gy = wy0; gy <= wy1; gy++) {
      const hsh = hash2(gx, gy);
      if (hsh < 0.45) {
        const dx = gx * s2 + hash2(gx, gy * 3) * s2 * 0.7;
        const dy = gy * s2 + hash2(gx * 5, gy) * s2 * 0.7;
        const sz = 8 + hsh * 18;
        // simple stone / tree by biome
        c.beginPath();
        if (b.decor === 'grave') {
          c.moveTo(dx - sz / 2, dy); c.lineTo(dx - sz / 2, dy - sz); c.arc(dx, dy - sz, sz / 2, Math.PI, 0); c.lineTo(dx + sz / 2, dy);
        } else if (b.decor === 'ash') {
          c.moveTo(dx, dy - sz); c.lineTo(dx - sz * 0.6, dy); c.lineTo(dx + sz * 0.6, dy);
        } else if (b.decor === 'ice') {
          c.moveTo(dx, dy - sz); c.lineTo(dx - sz * 0.5, dy); c.lineTo(dx + sz * 0.5, dy);
        } else if (b.decor === 'rot') {
          c.moveTo(dx - sz * 0.6, dy); c.lineTo(dx, dy - sz * 1.1); c.lineTo(dx + sz * 0.6, dy);
        } else {
          c.moveTo(dx, dy - sz * 1.2); c.lineTo(dx, dy);
        }
        c.stroke();
      }
    }
  }
}

function charOptsNow() {
  // merges ult charOpts during cinematics
  const o = {};
  if (G.state === 'cin' && ULT.active && ULT.data) {
    Object.assign(o, ULT.data.charOpts || {});
  }
  if (G.ch === 'gojo') {
    o.eyeMode = (G.state === 'cin' && ULT.active) ? 'six' : undefined;
  }
  if (P.form) o.form = P.form;
  return o;
}

// ===== render =====
function render() {
  const c = ctx;
  c.save();
  // camera transform
  const shx = (Math.random() - 0.5) * CAM.sh, shy = (Math.random() - 0.5) * CAM.sh;
  c.translate(VW / 2 + shx, VH / 2 + shy);
  c.scale(CAM.z, CAM.z);
  c.rotate(CAM.rot);
  c.translate(-CAM.x + CAM.tox, -CAM.y + CAM.toy);

  drawBG(c);
  drawDecor(c);

  // zones
  for (const z of G.zones) {
    const a = clamp(z.dur / z.ml, 0, 1);
    c.globalAlpha = z.blew ? a * 0.4 : 0.25 + Math.sin(G.t * 8) * 0.08 + a * 0.4;
    c.fillStyle = z.col;
    c.beginPath(); c.arc(z.x, z.y, z.r0 || z.r, 0, TAU); c.fill();
    c.globalAlpha = 1;
    if (!z.blew) {
      c.strokeStyle = z.col; c.lineWidth = 2;
      c.beginPath(); c.arc(z.x, z.y, z.r0 || z.r, 0, TAU); c.stroke();
    }
  }

  // A pulsing beacon makes the temporary moon shrine visible through the horde.
  if (G.shrine) {
    const shrine = G.shrine, pulse = 1 + Math.sin(G.t * 4) * 0.1;
    c.save(); c.translate(shrine.x, shrine.y); c.globalAlpha = Math.min(1, shrine.life / 2);
    c.strokeStyle = '#b9a6ff'; c.lineWidth = 2;
    c.beginPath(); c.ellipse(0, 0, 26 * pulse, 10 * pulse, 0, 0, TAU); c.stroke();
    c.fillStyle = 'rgba(165,135,255,0.16)'; c.beginPath(); c.ellipse(0, 0, 26 * pulse, 10 * pulse, 0, 0, TAU); c.fill();
    c.translate(0, -20 + Math.sin(G.t * 3) * 3); c.rotate(G.t * 0.8);
    c.fillStyle = '#dfd4ff'; c.beginPath(); c.moveTo(0, -12); c.lineTo(9, 0); c.lineTo(0, 12); c.lineTo(-9, 0); c.closePath(); c.fill();
    c.restore();
  }

  // drops
  for (const d of G.drops) {
    const b = Math.sin(d.t * 6) * 2;
    if (d.kind === 'gem') {
      c.fillStyle = '#8fd8ff';
      c.save(); c.translate(d.x, d.y + b); c.rotate(Math.PI / 4);
      c.fillRect(-3, -3, 6, 6);
      c.restore();
    } else if (d.kind === 'gold') {
      c.fillStyle = '#ffd76a';
      c.beginPath(); c.arc(d.x, d.y + b, 4, 0, TAU); c.fill();
      c.fillStyle = '#b8922a';
      c.beginPath(); c.arc(d.x, d.y + b, 4, 0.4, 2.4); c.lineWidth = 1; c.strokeStyle = '#b8922a'; c.stroke();
    } else if (d.kind === 'heart') {
      c.fillStyle = '#ff5a7a';
      c.save(); c.translate(d.x, d.y + b); c.scale(0.7, 0.7);
      c.beginPath();
      c.moveTo(0, 3); c.bezierCurveTo(-6, -3, -3, -8, 0, -4); c.bezierCurveTo(3, -8, 6, -3, 0, 3);
      c.fill();
      c.restore();
    }
  }

  // shield aura under everything else
  if (G.state === 'run' || G.state === 'cin') drawWeapons(c);

  // enemies
  for (const e of G.enemies) {
    if (e.dead) continue;
    // portal links (matron spawns)
    if (e.portalOf && !e.portalOf.dead) {
      c.strokeStyle = 'rgba(200,130,255,0.25)';
      c.lineWidth = 1;
      c.beginPath();
      c.moveTo(e.x, e.y);
      c.lineTo(e.portalOf.x, e.portalOf.y);
      c.stroke();
    }
    GFX.enemy(e, c);
  }

  // enemy projectiles
  for (const p of G.eprojs) {
    c.fillStyle = p.col;
    c.beginPath(); c.arc(p.x, p.y, p.r, 0, TAU); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.6)';
    c.beginPath(); c.arc(p.x - p.vx * 0.004, p.y - p.vy * 0.004, p.r * 0.5, 0, TAU); c.fill();
  }

  // player + trail
  const hideKaido = ULT.active && G.state === 'cin' && G.ch === 'kaido' && ULT.t < 3.75;
  if ((G.state === 'run' || G.state === 'cin') && !hideKaido) {
    for (const tr of P.trail || []) {
      c.globalAlpha = 0.42 * (tr.life / tr.duration) ** 2;
      GFX.char(G.ch, c, { x: tr.x, y: tr.y - 56, face: tr.face, form: tr.form, animT: tr.t, dashPose: 0.8, ghost: true });
    }
    c.globalAlpha = 1;
    // shadow under feet so the sprite doesn't float
    c.fillStyle = 'rgba(0,0,0,0.3)';
    c.beginPath(); c.ellipse(P.x, P.y + 3, 15, 4.5, 0, 0, TAU); c.fill();
    if (P.ifr > 0 && P.invuln <= 0) c.globalAlpha = 0.82 + Math.sin(G.t * 24) * 0.12;
    const chargingDash = G.ch === 'kaido' && P.dash > 0 && P.dashT < 0.28;
    const dashWindup = chargingDash ? clamp(P.dashT / 0.20, 0, 1) : 0;
    const dashPose = P.dash > 0 && !chargingDash ? easeOut(clamp(P.dash * 7, 0, 1)) : 0;
    const dashX = Math.cos(P.dashDir);
    const hurt = P.hitFx / 0.25;
    const attackDuration = G.ch === 'kaido' ? 0.34 : 0.27;
    const attackAge = G.state === 'cin' ? (1 - P.atkPose) * attackDuration : G.t - P.attackStarted;
    const attacking = G.state === 'run' && !!P.attack && attackAge >= 0 && attackAge < attackDuration && hurt <= 0.4;
    let face = attacking ? P.attackFace : P.face;
    if (P.dash > 0) face = Math.abs(dashX) > 0.1 ? Math.sign(dashX) : P.face;
    GFX.char(G.ch, c, {
      x: P.x, y: P.y - 56 + (P.lev || 0),
      face, walkPh: P.walkPh, strideDistance: P.strideDistance, moveBlend: P.moveBlend,
      atkPose: P.dash > 0 ? 0 : P.atkPose, attack: G.state === 'cin' ? 'cast' : P.attack,
      attackAge, attackDuration, aim: P.attackAim, hurt, dashPose, dashWindup, animT: G.t,
      purpleCastTime: G.state === 'cin' && ULT.id === 'gojo' ? ULT.t - HOLLOW_PURPLE_RELEASE : null,
      ...charOptsNow(),
    });
    // ult overlay char opts (gojo six eyes handled inside drawGojo via o.eyeMode normally)
    c.globalAlpha = 1;
    if (P.ifr > 0 || P.invuln > 0) {
      c.strokeStyle = 'rgba(160,220,255,0.6)';
      c.lineWidth = 2;
      c.beginPath(); c.arc(P.x, P.y, 26, 0, TAU); c.stroke();
    }
  }

  // weapon bolts + swing
  drawBolts(c);
  drawSwing(c);

  // particles
  for (const p of G.parts) {
    const a = clamp(p.life / p.ml, 0, 1);
    c.globalAlpha = a;
    c.fillStyle = p.col;
    if (p.shape === 'ghost') {
      c.beginPath(); c.arc(p.x, p.y, p.r * a * 1.4, 0, TAU); c.fill();
    } else if (p.shape === 'splat') {
      c.beginPath(); c.ellipse(p.x, p.y, p.r * 1.7 * a, p.r * 0.55 * a, 0, 0, TAU); c.fill();
    } else if (p.shape === 'spark') {
      c.strokeStyle = p.col;
      c.lineWidth = 1.5;
      c.beginPath();
      c.moveTo(p.x, p.y);
      c.lineTo(p.x - p.vx * 0.035, p.y - p.vy * 0.035);
      c.stroke();
    } else {
      c.fillRect(p.x - p.r / 2, p.y - p.r / 2, p.r, p.r);
    }
  }
  c.globalAlpha = 1;

  // rings
  for (const r of G.rings) {
    const a = clamp(r.life / r.ml, 0, 1);
    c.globalAlpha = a;
    c.strokeStyle = r.col;
    c.lineWidth = r.w * a;
    c.beginPath(); c.arc(r.x, r.y, r.r, 0, TAU); c.stroke();
  }
  c.globalAlpha = 1;

  // beams
  drawBeams(c);

  // ult visuals
  if (G.state === 'cin' && ULT.active && ULT.data && ULT.data.draw) {
    try { ULT.data.draw(c, ULT); } catch (e) {}
  }

  // pops (world space text)
  c.textAlign = 'center';
  for (const p of G.pops) {
    const a = clamp(p.life / p.ml, 0, 1);
    c.globalAlpha = a;
    c.fillStyle = p.col;
    c.font = (p.big ? 'bold 15px' : '11px') + ' Georgia, serif';
    c.fillText(p.txt, p.x, p.y);
  }
  c.globalAlpha = 1;
  c.restore();

  // screen flash
  if (G.flash.a > 0.01) {
    c.globalAlpha = G.flash.a;
    c.fillStyle = G.flash.col;
    c.fillRect(0, 0, VW, VH);
    c.globalAlpha = 1;
    G.flash.a *= Math.pow(0.01, G.dt || 0.016);
  } else G.flash.a = 0;

  // ult overlays
  if (G.state === 'cin') drawUltOverlay(c);

  // menu backdrop anim
  if (G.state === 'menu') {
    menuBG.t += 0.016;
    for (const m of menuBG.motes) {
      m.y -= m.s * 0.016;
      if (m.y < -0.02) { m.y = 1.02; m.x = Math.random(); }
      c.fillStyle = 'rgba(160,140,220,' + (0.05 + m.r * 0.03) + ')';
      c.fillRect(m.x * VW, m.y * VH, m.r, m.r);
    }
  }
}

// ===== loop =====
let lastT = 0, lastPortrait = -1;
const reducePortraitMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
function loop(ts) {
  requestAnimationFrame(loop);
  const now = ts / 1000;
  let dt = clamp(now - (lastT || now), 0, 0.05);
  lastT = now;
  G.dt = dt;
  if (!G.paused) {
    tick(dt);
    SND.updMusic(dt);
  }
  CAS.tickMsg(dt);
  UI.updateUltAim();
  if (G.state === 'run' || G.state === 'cin') UI.updHUD();
  if (G.state === 'menu' && UI.menu === 'play' && !reducePortraitMotion.matches && now - lastPortrait >= 1 / 12) {
    UI.drawAvatars(now);
    lastPortrait = now;
  }
  render();
}

// ===== boot =====
window.addEventListener('load', () => {
  loadSave();
  loadSett();
  GFX.onPortraitLoad = () => {
    if (G.state === 'menu' && UI.menu === 'play' && reducePortraitMotion.matches) UI.drawAvatars();
  };
  GFX.loadSprites();
  cvs = document.getElementById('c');
  ctx = cvs.getContext('2d');
  resize();
  window.addEventListener('resize', resize);
  UI.wire();
  UI.buildMenu();
  UI.menuGold();
  if (SAVE.run) toast('Run in progress: night ' + SAVE.run.night, '#9ff0ff');
  requestAnimationFrame(loop);
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden && (G.state === 'run' || G.state === 'cin')) { clearInput(); UI.showPause(); }
});
