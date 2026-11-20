'use strict';
// ===== ui.js : hud, menus, pacts, end, pause, casino wiring =====
const UI = {
  el(id) { return document.getElementById(id); },
  toast(msg, col) {
    const box = this.el('toasts');
    if (!box) return;
    const d = document.createElement('div');
    d.className = 'toast';
    d.style.borderColor = col || '#9ff0ff';
    d.textContent = msg;
    box.appendChild(d);
    setTimeout(() => d.classList.add('on'), 10);
    setTimeout(() => { d.classList.remove('on'); setTimeout(() => d.remove(), 400); }, 2600);
  },
  banner(t, s, dur, col, boss) {
    const b = this.el('banner');
    if (!b) return;
    b.innerHTML = `<div class="bt" style="color:${col || '#fff'}">${t}</div>` + (s ? `<div class="bs">${s}</div>` : '');
    b.classList.toggle('boss', !!boss);
    b.classList.add('show');
    clearTimeout(this._bT);
    this._bT = setTimeout(() => b.classList.remove('show'), dur || 2200);
  },
  letterbox(on) {
    const lb = this.el('lb');
    if (lb) lb.classList.toggle('on', !!on);
  },
  // ===== HUD =====
  updHUD() {
    const st = pstats();
    const set = (id, v) => { const e = this.el(id); if (e) e.textContent = v; };
    const fill = (id, f) => { const e = this.el(id); if (e) e.style.width = (clamp(f, 0, 1) * 100) + '%'; };
    fill('hhp', P.hp / st.mhp);
    set('hhpT', Math.ceil(Math.max(0, P.hp)) + '/' + st.mhp);
    fill('hxp', P.xp / xpNeed(P.level));
    set('hxpT', 'LV ' + P.level);
    fill('hult', P.ultq / ULT_MAX);
    const uw = document.querySelector('.hultWrap');
    if (uw) uw.classList.toggle('ready', P.ultq >= ULT_MAX);
    set('hnight', G.night);
    set('htime', G.nightHold ? 'SLAY THE BOSS' : Math.max(0, Math.ceil(NIGHT_LEN - G.nightT)) + 's');
    set('hkills', G.kills);
    set('hdash', P.dashCd > 0 ? 'DASH ' + P.dashCd.toFixed(1) + 's' : 'DASH READY');
    const dash = this.el('hdash'); if (dash) dash.classList.toggle('ready', P.dashCd <= 0);
    const shrine = this.el('hshrine');
    if (shrine) {
      shrine.style.display = G.shrine ? '' : 'none';
      if (G.shrine) {
        const a = angTo(P.x, P.y, G.shrine.x, G.shrine.y);
        const directions = ['→', '↘', '↓', '↙', '←', '↖', '↑', '↗'];
        const direction = directions[(Math.round(a / (Math.PI / 4)) + 8) % 8];
        shrine.textContent = 'SHRINE ' + direction + ' ' + Math.ceil(G.shrine.life) + 's';
      }
    }
    set('hgold', fmt(SAVE.gold));
    const ultButton = this.el('ubb');
    if (ultButton) {
      const label = ULTDEF[G.ch]?.aimRange ? 'AIM ULT' : 'ULT';
      if (ultButton.textContent !== label) ultButton.textContent = label;
      ultButton.classList.toggle('ult-ready', ULT.can());
    }
    const inf = this.el('hinf');
    if (inf) inf.style.display = st.infR ? '' : 'none';
    const modeEl = this.el('hmode');
    if (modeEl) {
      const m = P.mode || 'auto';
      modeEl.textContent = m === 'melee' ? 'MELEE' : m === 'range' ? 'RANGED' : 'AUTO';
      modeEl.className = m === 'melee' ? 'meleeOn' : m === 'range' ? 'rangeOn' : '';
    }
    const chip = this.el('hrev');
    if (chip) {
      const rev = (st.revives || 0);
      chip.style.display = rev > 0 ? '' : 'none';
      chip.textContent = '\u2666 ' + rev;
    }
    // boss bar
    const bb = this.el('bossbar');
    if (bb) {
      if (G.boss) {
        bb.classList.add('on');
        fill('bossbar-fill', G.boss.hp / G.boss.mhp);
        set('bossbar-name', G.boss.bossName || 'BOSS');
      } else bb.classList.remove('on');
    }
  },
  // ===== screens =====
  enterRun() {
    this.el('menu').classList.remove('show');
    this.el('hud').classList.add('show');
    this.updHUD();
  },
  exitToMenu() {
    G.state = 'menu';
    this.el('menu').classList.add('show');
    this.el('hud').classList.remove('show');
    this.el('pact').classList.remove('show');
    this.el('end').classList.remove('show');
    this.buildMenu();
    this.menuGold();
  },
  updateUltAim() {
    const panel = this.el('ult-aim');
    const visible = G.state === 'run' && !G.paused && ULT.aimLeft > 0;
    panel.hidden = !visible;
    if (visible) this.el('ult-aim-time').textContent = Math.ceil(ULT.aimLeft) + 's';
  },
  showPause() {
    if (G.state !== 'run' && G.state !== 'cin') return;
    G.paused = true;
    this.el('paused').classList.add('show');
  },
  hidePause() {
    G.paused = false;
    this.el('paused').classList.remove('show');
  },
  // ===== pacts =====
  offerPacts() {
    const available = PACTS.filter(p => !hasP(p.id));
    const choices = shuffle(available).slice(0, 2);
    this._pacts = choices;
    const p = this.el('pact');
    p.classList.add('show');
    document.getElementById('pacts').innerHTML = choices.map((c, i) => this.pactCol(c, i)).join('');
    const rr = this.el('p-reroll');
    rr.style.display = G.rerolls > 0 ? '' : 'none';
    rr.textContent = 'REROLL (' + G.rerolls + ')';
    const gd = this.el('p-gamble');
    gd.style.display = G.gambledThisNight ? 'none' : '';
  },
  hidePacts() { this.el('pact').classList.remove('show'); },
  pactCol(c, i) {
    return `<div class="pcard" data-pact="${i}" style="--accent:${c.id === 'gambler' ? '#ffd76a' : '#c58aff'}">
      <div class="pc-name">${c.name}</div>
      <div class="pc-boon">+ ${c.boon}</div>
      <div class="pc-curse">- ${c.curse}</div>
      <button class="gbtn gold">ACCEPT</button>
    </div>`;
  },
  // refuse -> gold; gamble: all-or-double on the refuse gold at 45%
  pactRefuse() {
    if (G.gambledThisNight) return;
    const base = 40 + G.night * 10;
    const win = Math.random() < 0.45 + (SAVE.shop.luck || 0) * 0.02;
    G.gambledThisNight = true;
    if (win) {
      addGold(base * 2, true);
      banner('BROKER BLINKS', 'Double refuse gold: +' + base * 2, 2000, '#ffd76a');
      SND.play('jackpot');
    } else {
      banner('BROKER SMIRKS', 'The double down failed. Nothing.', 2000, '#ff5a5a');
      SND.play('bust');
    }
    nextNight();
  },
  // ===== end =====
  showEnd(win, bonus, better) {
    this.hidePacts();
    const e = this.el('end');
    e.classList.add('show');
    this.el('end-title').textContent = win ? 'DAWN BREAKS' : 'YOU DIED';
    this.el('end-title').style.color = win ? '#ffd76a' : '#ff5a5a';
    this.el('end-sub').textContent = win
      ? 'You survived all ' + WIN_NIGHT + ' nights on ' + DIFFN().name + '.'
      : 'Fell on night ' + G.night + ' (' + DIFFN().name + ').';
    this.el('end-stats').innerHTML =
      `<span>kills <b>${G.kills}</b></span>` +
      `<span>night <b>${G.night}</b></span>` +
      `<span>gold kept <b>${Math.round(G.gold)}g</b></span>` +
      (better ? `<span class="good">NEW BEST</span>` : '');
    this.el('end-endless').style.display = win ? '' : 'none';
  },
  hideEnd() { this.el('end').classList.remove('show'); },
  // ===== menu =====
  menuGold() {
    const g1 = this.el('gold');
    if (g1) g1.textContent = fmt(SAVE.gold) + 'g';
    const g2 = this.el('gold2');
    if (g2) g2.textContent = fmt(SAVE.gold) + 'g';
  },
  menu: 'play', menuDiff: 'normal', menuChar: 'ichigo',
  buildMenu() {
    this.buildMenu2('play');
  },
  buildMenu2(tab) {
    this.menu = tab;
    document.querySelectorAll('#mnav button').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
    const body = this.el('menu-body');
    if (tab === 'play') this.buildPlay();
    if (tab === 'shop') body.innerHTML = this.htmlShop();
    if (tab === 'gold') body.innerHTML = this.htmlGoldTab();
    if (tab === 'set') body.innerHTML = this.htmlSettings();
    this.menuGold();
  },
  buildPlay() {
    const body = this.el('menu-body');
    let html = '';
    // difficulty tabs
    html += `<div class="dtabs">` + ['normal', 'hard', 'hardcore'].map(d =>
      `<button class="dtab ${d === this.menuDiff ? 'active' : ''}" data-diff="${d}">${DIFF[d].name}</button>`
    ).join('') + `</div>`;
    html += `<div id="resume-slot">${SAVE.run ? `<button class="gbtn launch" id="resume">RESUME \u2014 NIGHT ${SAVE.run.night} (${DIFF[SAVE.run.diff] ? DIFF[SAVE.run.diff].name : ''})</button>` : ''}</div>`;
    // character grid
    html += `<div class="cgrid">`;
    for (const id of ROSTER) {
      const c = CHARS[id];
      const owned = SAVE.owned.includes(id);
      const sel = this.menuChar === id;
      html += `<div class="ccard ${sel ? 'sel' : ''} ${owned ? '' : 'locked'}" data-char="${id}" style="--accent:${c.accent}">
        <canvas class="av" data-av="${id}" width="150" height="120"></canvas>
        <div class="cc-body">
          <div class="cc-name">${c.name} ${owned ? '' : `<span class="cc-price">${c.price}g</span>`}</div>
          <div class="cc-row pros">${c.pros.map(p => '<span>+ ' + p + '</span>').join('')}</div>
          <div class="cc-row cons">${c.cons.map(p => '<span>- ' + p + '</span>').join('')}</div>
          <div class="cc-pass"><b>${c.passiveName}:</b> ${c.passive}</div>
          <div class="cc-dash"><b>Dash:</b> ${c.dashDesc}</div>
          <div class="cc-ult">ULT \u00b7 ${c.ultName}</div>
          ${owned
            ? (sel ? `<button class="gbtn launch" id="start">PLAY ${c.name}</button>` : ``)
            : `<button class="gbtn buy" data-buy="${id}" ${SAVE.gold < c.price ? 'disabled' : ''}>UNLOCK ${c.price}g</button>`}
        </div>
      </div>`;
    }
    html += `</div>`;
    // meta buttons
    html += `<div class="mmeta">
      <button class="gbtn gamble" id="open-cas">${CASINO_NAME}</button>
      <button class="gbtn" id="tester">TESTER PANEL</button>
      <span class="disc">Fan project. Characters belong to their creators.</span>
    </div>`;
    this.el('menu-body').innerHTML = html;
    this.drawAvatars();
  },
  drawAvatars(time = 0) {
    document.querySelectorAll('canvas[data-av]').forEach((cv, i) => {
      const id = cv.dataset.av;
      const c = cv.getContext('2d');
      c.clearRect(0, 0, cv.width, cv.height);
      c.save();
      c.translate(cv.width / 2, cv.height * 0.80);
      c.scale(1.16, 1.16);
      const ch = typeof CHARS !== 'undefined' ? CHARS[id] : null;
      try {
        GFX.char(id, c, { y: -56, face: 1, animT: time ? time + i * 0.23 : 0 });
      } catch (e) {}
      c.restore();
      if (!SAVE.owned.includes(id)) {
        c.fillStyle = 'rgba(6,6,14,0.55)';
        c.fillRect(0, 0, cv.width, cv.height);
        c.fillStyle = '#ffd76a';
        c.font = 'bold 14px Georgia';
        c.textAlign = 'center';
        c.fillText('\uD83D\uDD12 ' + (ch ? ch.price : '') + 'g', cv.width / 2, cv.height / 2);
      }
    });
  },
  htmlShop() {
    let html = `<div class="shop-lead">Permanent upgrades. Death does not take them from you.</div>`;
    html += `<div class="sgrid">`;
    for (const it of SHOP) {
      const r = SAVE.shop[it.id] || 0;
      const maxed = r >= it.max;
      const cost = shopCost(it);
      html += `<div class="sitem ${maxed ? 'maxed' : ''}">
        <div class="si-name">${it.name}</div>
        <div class="si-desc">${it.desc}</div>
        <div class="si-dots">${Array.from({ length: it.max }, (_, i) => `<span class="dot ${i < r ? 'on' : ''}"></span>`).join('')}</div>
        ${maxed
          ? `<button class="gbtn" disabled>MAXED</button>`
          : `<button class="gbtn buy" data-shop="${it.id}" ${SAVE.gold < cost ? 'disabled' : ''}>BUY ${cost}g</button>`}
      </div>`;
    }
    html += `</div>`;
    return html;
  },
  htmlGoldTab() {
    const bestKeys = Object.keys(SAVE.best);
    let html = `<div class="ach-lead">Ledger of deeds.</div>`;
    html += `<div class="achgrid">`;
    for (const a of ACH) {
      const got = !!SAVE.ach[a.id];
      html += `<div class="achip ${got ? 'got' : ''}"><b>${a.name}</b><span>${a.desc}</span></div>`;
    }
    html += `</div>`;
    // bests
    html += `<div class="bests">` + bestKeys.map(k => `<span>${k}: <b>night ${SAVE.best[k]}</b></span>`).join('') + `</div>`;
    // history
    html += `<div class="hist">` + (SAVE.hist.length ? SAVE.hist.slice(0, 12).map(h =>
      `<div class="hrow ${h.win ? 'win' : ''}"><span>${h.win ? '\u2600' : '\u271D'} night ${h.n}</span><span>${DIFF[h.d] ? DIFF[h.d].name : h.d}</span><span>${CHARS[h.ch] ? CHARS[h.ch].name : h.ch}</span><span>${h.kills} kills</span></div>`
    ).join('') : '<div class="hrow">No runs yet.</div>') + `</div>`;
    // import/export
    html += `<div class="irow">
      <input id="imp-code" placeholder="paste save code">
      <button class="gbtn" id="imp-go">IMPORT</button>
      <button class="gbtn" id="exp-go">EXPORT CODE</button>
      <button class="gbtn danger" id="wipe">WIPE SAVE</button>
    </div>`;
    return html;
  },
  htmlSettings() {
    const sel = (v, cur) => v === cur ? 'selected' : '';
    return `
    <div class="set-lead">Quality scales particles, screen shake and resolution for potato laptops.</div>
    <div class="setrow">
      <label>Quality</label>
      <select id="set-quality">
        <option value="low" ${sel('low', Sett.quality)}>Low (potato)</option>
        <option value="med" ${sel('med', Sett.quality)}>Medium</option>
        <option value="high" ${sel('high', Sett.quality)}>High (sexy)</option>
      </select>
    </div>
    <div class="setrow"><label>Music</label><input type="checkbox" id="set-music" ${Sett.music ? 'checked' : ''}></div>
    <div class="setrow"><label>Sound effects</label><input type="checkbox" id="set-sfx" ${Sett.sfx ? 'checked' : ''}></div>
    <div class="setrow"><label>Auto-cast ultimate when ready</label><input type="checkbox" id="set-autoult" ${Sett.autoUlt ? 'checked' : ''}></div>
    <div class="setrow"><label>Reduce flashes</label><input type="checkbox" id="set-noflash" ${Sett.noflash ? 'checked' : ''}></div>
    <div class="setrow"><label>Controls</label><span class="cheats">WASD / arrows \u00b7 Space or Shift: dash \u00b7 E: weapon mode \u00b7 U / X / Q: ultimate \u00b7 Esc or P: pause. Touch: left half joystick, buttons bottom-right.</span></div>`;
  },
  // ===== wiring =====
  wire() {
    const $ = (sel) => document.querySelector(sel);
    const on = (el, ev, fn) => { if (el) el.addEventListener(ev, fn); };
    // menu nav
    document.querySelectorAll('#mnav button').forEach(b => on(b, 'click', () => {
      SND.init();
      CAS.ladder = null;
      this.buildMenu2(b.dataset.tab);
    }));
    // menu body delegation
    on(this.el('menu-body'), 'click', (ev) => {
      const t = ev.target;
      const diff = t.closest('[data-diff]');
      if (diff) { this.menuDiff = diff.dataset.diff; this.buildPlay(); return; }
      const card = t.closest('[data-char]');
      const buy = t.closest('[data-buy]');
      const shop = t.closest('[data-shop]');
      if (buy) {
        const id = buy.dataset.buy;
        const c = CHARS[id];
        if (SAVE.gold >= c.price && !SAVE.owned.includes(id)) {
          SAVE.gold -= c.price;
          SAVE.owned.push(id);
          if (SAVE.owned.length >= ROSTER.length) checkAch('allchars');
          saveNow();
          SND.play('buy');
          toast('Unlocked ' + c.name, c.accent);
          this.menuChar = id;
          this.buildPlay();
          this.menuGold();
        }
        return;
      }
      if (shop) {
        const it = SHOP.find(x => x.id === shop.dataset.shop);
        const cost = shopCost(it);
        if (SAVE.gold >= cost && (SAVE.shop[it.id] || 0) < it.max) {
          SAVE.gold -= cost;
          SAVE.shop[it.id] = (SAVE.shop[it.id] || 0) + 1;
          saveNow();
          SND.play('buy');
          toast(it.name + ' rank ' + SAVE.shop[it.id], '#ffd76a');
          this.el('menu-body').innerHTML = this.htmlShop();
          this.menuGold();
        }
        return;
      }
      if (t.id === 'start') { startRun(this.menuChar, this.menuDiff); return; }
      if (card) {
        const id = card.dataset.char;
        if (SAVE.owned.includes(id)) {
          this.menuChar = id;
          SND.play('tick');
          this.buildPlay();
        }
        return;
      }
      if (t.id === 'resume') { if (!resumeRun()) toast('No run to resume.', '#ff5a5a'); return; }
      if (t.id === 'open-cas') { CAS.open(); this.menuGold(); return; }
      if (t.id === 'tester') { window.location.href = 'tester.html'; return; }
      if (t.id === 'exp-go') {
        const code = exportCode();
        prompt('Your save code:', code);
        return;
      }
      if (t.id === 'imp-go') {
        const code = this.el('imp-code').value;
        if (importCode(code)) { toast('Save imported.', '#6dff8a'); this.buildMenu2('gold'); }
        else toast('Bad code.', '#ff5a5a');
        return;
      }
      if (t.id === 'wipe') {
        if (confirm('Wipe EVERYTHING? Gold, unlocks, achievements?')) {
          localStorage.removeItem(SAVE_KEY);
          localStorage.removeItem(SAVE_KEY + '.b1');
          localStorage.removeItem(SAVE_KEY + '.b2');
          loadSave();
          this.buildMenu2('gold');
          this.menuGold();
          toast('Save wiped. Fresh meat.', '#ff5a5a');
        }
        return;
      }
    });
    // settings inputs
    document.addEventListener('change', (ev) => {
      const t = ev.target;
      if (t.id === 'set-quality') { setQuality(t.value); }
      if (t.id === 'set-music') { Sett.music = t.checked; saveNow(); }
      if (t.id === 'set-sfx') { Sett.sfx = t.checked; saveNow(); }
      if (t.id === 'set-autoult') { Sett.autoUlt = t.checked; saveNow(); }
      if (t.id === 'set-noflash') { Sett.noflash = t.checked; saveNow(); }
    });
    // pact screen
    on(this.el('pacts'), 'click', (ev) => {
      const card = ev.target.closest('[data-pact]');
      if (card) { acceptPact(this._pacts[+card.dataset.pact].id); return; }
    });
    on(this.el('p-refuse'), 'click', () => { skipPact(); });
    on(this.el('p-gamble'), 'click', () => { this.pactRefuse(); });
    on(this.el('p-reroll'), 'click', () => {
      if (G.rerolls > 0) {
        G.rerolls--;
        SND.play('dice');
        this.offerPacts();
      }
    });
    // pause
    on(this.el('paused'), 'click', (ev) => {
      if (ev.target.id === 'paused' || ev.target.id === 'p-resume') this.hidePause();
      if (ev.target.id === 'p-quit') { this.hidePause(); endRun(false); }
    });
    // end screen
    on(this.el('end'), 'click', (ev) => {
      if (ev.target.id === 'again') { this.hideEnd(); startRun(G.ch, G.diff); }
      if (ev.target.id === 'tomenu') { this.hideEnd(); this.exitToMenu(); }
      if (ev.target.id === 'end-endless') { continueEndless(); }
    });
    // casino
    on(this.el('casino'), 'click', (ev) => {
      const t = ev.target;
      if (t.closest('#casino-close')) { CAS.close(); this.menuGold(); return; }
      const tab = t.closest('.mtab');
      if (tab) { CAS.onTab(tab.dataset.m); return; }
      const chip = t.closest('[data-bet]');
      if (chip) { CAS.onBet(chip.dataset.bet === 'max' ? 'max' : +chip.dataset.bet); return; }
      if (t.closest('#cgo')) { CAS.onGo(); return; }
      if (t.closest('#cspin')) { CAS.onGo(); return; }
      const d = t.closest('[data-dice]');
      if (d) { CAS.playDice(d.dataset.dice); return; }
      if (t.closest('#cladder-start')) { CAS.ladderStart(); return; }
      if (t.closest('#climb')) { CAS.ladderClimb(); return; }
      if (t.closest('#cash')) { CAS.ladderCash(); return; }
    });
  },
};
if (typeof window !== 'undefined') window.UI = UI;
