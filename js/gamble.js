'use strict';
// ===== gamble.js : HEX & GOLD, the den under the manor =====
// 4 machines, persistent ledger, streaks, stakes chips, achievements.

const CAS = {
  cur: 'coin',          // current machine tab
  stake: 100,           // chips
  spinT: 0,             // slots spin animation timer
  reels: [0, 0, 0],
  ladder: null,         // { step, wager } when a climb is live
  msg: null,            // { txt, good, t }
  // ledger (persisted in SAVE.gamble)
  winLuck() { return 1 + (SAVE.shop.luck || 0) * 0.02; },
  open() {
    document.getElementById('casino').classList.add('show');
    this.cur = 'coin';
    this.render();
    SND.play('buy');
  },
  close() {
    document.getElementById('casino').classList.remove('show');
    this.ladder = null;
  },
  // --- money flow ---
  payIn(v) {
    v = Math.round(v);
    if (SAVE.gold < v) { this.flashMsg('Not enough gold.', false); SND.play('deny'); return false; }
    if (v < CAS_MIN) { this.flashMsg('Min bet is ' + CAS_MIN + 'g.', false); SND.play('deny'); return false; }
    SAVE.gold -= v;
    const g = SAVE.gamble;
    g.plays = (g.plays || 0) + 1;
    g.wagered += v;
    if (g.wagered >= 1000) checkAch('bet1k');
    this.ledger();
    return true;
  },
  payOut(v, label) {
    v = Math.round(v);
    SAVE.gold += v;
    const g = SAVE.gamble;
    g.won += v;
    if (v > g.biggest) g.biggest = v;
    g.streak++;
    if (g.streak > g.bestStreak) g.bestStreak = g.streak;
    if (g.streak >= 5) checkAch('streak');
    if (SAVE.gold >= 10000) checkAch('rich');
    SND.play(v >= this.stake * 10 ? 'jackpot' : 'cash');
    this.flashMsg('+' + v + 'g' + (label ? ' ' + label : ''), true);
    this.ledger();
    saveNow();
  },
  lose(label) {
    const g = SAVE.gamble;
    g.streak = 0;
    SND.play('bust');
    this.flashMsg('-' + Math.round(this.stake) + 'g' + (label ? ' ' + label : ''), false);
    this.ledger();
    saveNow();
  },
  flashMsg(txt, good) {
    this.msg = { txt, good, t: 2.6 };
    this.renderMsg();
  },
  renderMsg() {
    const el = document.querySelector('#casino .cmsg');
    if (!el) return;
    if (!this.msg) { el.textContent = ''; el.className = 'cmsg'; return; }
    el.textContent = this.msg.txt;
    el.className = 'cmsg show ' + (this.msg.good ? 'good' : 'bad');
  },
  tickMsg(dt) {
    if (this.msg) { this.msg.t -= (dt || 0.016); if (this.msg.t <= 0) { this.msg = null; this.renderMsg(); } }
  },
  // --- machine 1 : coin ---
  playCoin() {
    if (!this.payIn(this.stake)) return;
    SND.play('coin');
    const pWin = Math.min(0.495, 0.485 * this.winLuck());
    const win = Math.random() < pWin;
    // flip animation handled in render via .spinning
    const cEl = document.querySelector('#casino .coin');
    if (cEl) { cEl.classList.add('spinning'); setTimeout(() => cEl.classList.remove('spinning'), 700); }
    setTimeout(() => {
      if (win) this.payOut(this.stake * 2, 'the coin favours you');
      else this.lose('the coin is cold');
    }, 650);
  },
  // --- machine 2 : dice ---
  playDice(side) {
    // side: 'over' | 'under' | 'seven'
    if (!this.payIn(this.stake)) return;
    SND.play('dice');
    const d1 = 1 + Math.floor(Math.random() * 6);
    const d2 = 1 + Math.floor(Math.random() * 6);
    const sum = d1 + d2;
    const luck = this.winLuck();
    setTimeout(() => {
      this._dice = { d1, d2, sum };
      if (side === 'seven' && sum === 7) this.payOut(this.stake * DICE_PAYOUT_SEVEN, 'double sixes watch over you');
      else if (side === 'over' && sum > 7) this.payOut(this.stake * DICE_PAYOUT_OVER, 'the devil nods');
      else if (side === 'under' && sum < 7) this.payOut(this.stake * DICE_PAYOUT_OVER, 'the devil nods');
      else this.lose(sum + ' shows. Not your night.');
    }, 400);
  },
  face(n) { return String.fromCharCode(0x2680 + n - 1); },
  // --- machine 3 : slots ---
  rollSym() {
    const total = CAS_SLOTS.reduce((a, s) => a + s.w, 0);
    let r = Math.random() * total;
    for (const s of CAS_SLOTS) { r -= s.w; if (r <= 0) return s.sym; }
    return 'skull';
  },
  playSlots() {
    if (!this.payIn(this.stake)) return;
    SND.play('spin');
    this.spinT = 1.1;
    this.reels = [this.rollSym(), this.rollSym(), this.rollSym()];
    setTimeout(() => {
      const [a, b, c] = this.reels;
      const key = a + ':' + b + ':' + c;
      let mult = 0;
      if (SLOT_PAYS[key]) mult = SLOT_PAYS[key];
      else if (a === b || b === c || a === c) mult = SLOT_PAYS.pair;
      const eff = mult * (mult > 1 ? this.winLuck() : 1);
      if (mult >= 66) { SND.play("jackpot"); }
      if (eff > 1.2) this.payOut(this.stake * eff, key.split(':').join(' '));
      else if (eff > 1) this.payOut(this.stake * eff, 'a pair');
      else this.lose('the reels hex you');
      this.spinT = 0;
    }, 1100);
  },
  // --- machine 4 : ladder ---
  ladderStart() {
    if (this.ladder) { this.render(); return; }
    if (!this.payIn(this.stake)) return;
    this.ladder = { step: 0, wager: this.stake };
    SND.play('spin');
    this.render();
  },
  ladderClimb() {
    if (!this.ladder) return;
    const rung = CAS_LADDER[this.ladder.step];
    const p = Math.min(0.95, rung.p * this.winLuck() - (SAVE.shop.luck ? 0 : 0));
    SND.play('tick');
    if (Math.random() < p) {
      this.ladder.step++;
      SND.play('spin');
      if (this.ladder.step >= CAS_LADDER.length) {
        // cleared the whole ladder
        this.payOut(this.ladder.wager * CAS_LADDER[CAS_LADDER.length - 1].x, 'MOONLIGHT. You animal.');
        const g = SAVE.gamble;
        if (this.ladder.step > g.ladderBest) g.ladderBest = this.ladder.step;
        this.ladder = null;
      }
      this.render();
    } else {
      // bust
      const g = SAVE.gamble;
      g.streak = 0;
      if (this.ladder.step >= 6) checkAch('bust');
      g.plays++;
      saveNow();
      SND.play('bust');
      this.flashMsg('BUST at ' + rung.name + '. The ladder keeps your gold.', false);
      this.ladder = null;
      this.ledger();
      this.render();
    }
  },
  ladderCash() {
    if (!this.ladder || this.ladder.step === 0) { this.flashMsg('Nothing to cash yet. Climb first.', false); return; }
    const rung = CAS_LADDER[this.ladder.step - 1];
    this.payOut(this.ladder.wager * rung.x, 'cashed ' + rung.name);
    const g = SAVE.gamble;
    if (this.ladder.step > g.ladderBest) { g.ladderBest = this.ladder.step; }
    if (this.ladder.step >= 6) checkAch('ladder');
    this.ladder = null;
    this.render();
  },
  // --- rendering ---
  render() {
    const g = SAVE.gamble;
    // tabs
    document.querySelectorAll('#casino .mtab').forEach(b => {
      b.classList.toggle('active', b.dataset.m === this.cur);
    });
    const title = document.getElementById('cm-title');
    const body = document.getElementById('cm-body');
    const m = MACHINES.find(x => x.id === this.cur);
    title.textContent = m.name;
    // stats strip
    document.getElementById('cas-stake').textContent = this.stake + 'g';
    document.getElementById('cas-gold').textContent = Math.round(SAVE.gold) + 'g';
    let html = '';
    html += '<div class="cblurb">' + m.blurb + '</div>';
    // chip row
    html += '<div class="chips">' + CAS_BETS.map(b =>
      `<button class="chip ${b === this.stake ? 'cur' : ''}" data-bet="${b}">${b}g</button>`
    ).join('') + `<button class="chip ${this.stake === Math.min(SAVE.gold, CAS_MAX) ? 'cur' : ''}" data-bet="max">MAX</button></div>`;
    // machine body
    if (this.cur === 'coin') {
      html += `<div class="coin"><div class="coin-face">\u2693</div></div>`;
      html += `<button class="gbtn gold" id="cgo">FLIP FOR ${this.stake * 2}g</button>`;
    }
    if (this.cur === 'dice') {
      const last = this._dice ? (this.face(this._dice.d1) + ' + ' + this.face(this._dice.d2) + ' = ' + this._dice.sum) : '\u2680 + \u2680';
      html += `<div class="dice">${last}</div>`;
      html += `<div class="drow">
        <button class="gbtn" data-dice="under">UNDER 7 &nbsp;\u00d7${DICE_PAYOUT_OVER}</button>
        <button class="gbtn seven" data-dice="seven">EXACTLY 7 &nbsp;\u00d7${DICE_PAYOUT_SEVEN}</button>
        <button class="gbtn" data-dice="over">OVER 7 &nbsp;\u00d7${DICE_PAYOUT_OVER}</button>
      </div>`;
    }
    if (this.cur === 'slots') {
      const syms = CAS_SYM;
      const disp = this.reels.map(sym => this.slotIcon(sym)).join('');
      html += `<div class="reels ${this.spinT > 0 ? 'rolling' : ''}">${this.reels.map(sym => `<div class="reel">${this.slotIcon(sym)}</div>`).join('')}</div>`;
      html += `<div class="spay">3\u00d7 skull \u00d73 \u00b7 3\u00d7 eye \u00d74.5 \u00b7 3\u00d7 moon \u00d77 \u00b7 3\u00d7 crown \u00d718 \u00b7 3\u00d77\u2019s \u00d766 \u00b7 any pair \u00d71.4</div>`;
      html += `<button class="gbtn gold" id="cspin">SPIN FOR ${this.stake}g</button>`;
    }
    if (this.cur === 'ladder') {
      html += this.ladderHTML();
    }
    body.innerHTML = html;
    this.renderLedger();
  },
  slotIcon(sym) {
    const map = { skull: '\u2620', eye: '\u25C9', moon: '\u263D', crown: '\u265B', seventh: '7' };
    return `<span class="sicon ${sym}">${map[sym] || '?'}</span>`;
  },
  ladderHTML() {
    const L = this.ladder;
    let html = '';
    if (!L) {
      html += `<div class="ldesc">Stake ${this.stake}g once. Each climb risks the whole pot for a bigger multiplier. Cash out any time.</div>`;
      html += `<button class="gbtn gamble" id="cladder-start">BUY IN \u2014 ${this.stake}g</button>`;
    } else {
      const cur = CAS_LADDER[L.step];
      const next = CAS_LADDER[L.step]; // next rung to attempt = current index
      html += `<div class="ldesc">Pot: <b>${Math.round(L.wager * (L.step > 0 ? CAS_LADDER[L.step - 1].x : 1))}g</b> \u00b7 on ${L.step > 0 ? CAS_LADDER[L.step - 1].name : 'the floor'}</div>`;
      html += `<div class="ladder">`;
      for (let i = 0; i < CAS_LADDER.length; i++) {
        const r = CAS_LADDER[i];
        const cls = i < L.step ? 'passed' : i === L.step ? 'cur' : '';
        html += `<div class="rung ${cls}"><span class="rn">${i + 1}. ${r.name}</span><span class="rp">${Math.round(r.p * 100)}%</span><span class="rx">\u00d7${r.x}</span></div>`;
      }
      html += `</div>`;
      if (L.step < CAS_LADDER.length) {
        html += `<div class="drow">
          <button class="gbtn gamble" id="climb">CLIMB \u2014 ${Math.round(cur.p * 100)}%</button>
          ${L.step > 0 ? `<button class="gbtn gold" id="cash">CASH OUT ${Math.round(L.wager * CAS_LADDER[L.step - 1].x)}g</button>` : ''}
        </div>`;
      }
    }
    return html;
  },
  ledger() {
    // bump plays
    const g = SAVE.gamble;
    this.renderLedger();
    saveNow();
  },
  renderLedger() {
    const el = document.getElementById('cas-ledger');
    if (!el) return;
    const g = SAVE.gamble;
    el.innerHTML =
      `<span>wagered <b>${fmt(g.wagered)}g</b></span>` +
      `<span>won <b>${fmt(g.won)}g</b></span>` +
      `<span>biggest <b>${fmt(g.biggest)}g</b></span>` +
      `<span>streak <b>${g.streak}</b> (best ${g.bestStreak})</span>` +
      `<span>ladder best <b>${g.ladderBest || 0}/10</b></span>`;
  },
  // --- events (called from UI.wire) ---
  onBet(b) {
    if (b === 'max') this.stake = Math.max(CAS_MIN, Math.min(CAS_MAX, Math.round(SAVE.gold)));
    else this.stake = b;
    SND.play('tick');
    this.render();
  },
  onTab(m) { this.cur = m; this.render(); },
  onGo() {
    if (this.cur === 'coin') this.playCoin();
    else if (this.cur === 'slots') this.playSlots();
  },
};
if (typeof window !== 'undefined') window.CAS = CAS;
