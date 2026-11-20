'use strict';
// ===== audio.js : procedural sfx + heat-driven droning music =====
const SND = {
  ctx: null, master: null, musGain: null, sfxGain: null,
  heat: 0, musT: 0, musStep: 0, started: false,
  def: {
    // name: [freq, dur, type, vol, slide]
    coin: [880, 0.08, 'square', 0.2, 1320],
    tick: [1200, 0.03, 'square', 0.12, 0],
    spin: [520, 0.05, 'triangle', 0.15, 700],
    win: [660, 0.12, 'triangle', 0.25, 990],
    jackpot: [523, 0.3, 'sawtooth', 0.3, 1046],
    bust: [220, 0.25, 'sawtooth', 0.25, 80],
    dice: [330, 0.06, 'square', 0.2, 280],
    cash: [740, 0.1, 'triangle', 0.22, 1108],
    joy: [523, 0.15, 'sine', 0.3, 784],
    lvl: [392, 0.15, 'triangle', 0.3, 784],
    hit: [160, 0.04, 'square', 0.08, 120],
    kill: [90, 0.06, 'square', 0.1, 50],
    gem: [1200, 0.04, 'sine', 0.14, 1600],
    gold: [1568, 0.05, 'sine', 0.16, 2093],
    hurt: [110, 0.15, 'sawtooth', 0.3, 55],
    dash: [420, 0.07, 'sine', 0.16, 760],
    ult: [80, 0.7, 'sawtooth', 0.25, 40],
    boom: [60, 0.3, 'sine', 0.4, 30],
    zap: [900, 0.05, 'square', 0.12, 300],
    crit: [1400, 0.05, 'square', 0.16, 900],
    buy: [660, 0.08, 'triangle', 0.22, 990],
    pause: [330, 0.08, 'sine', 0.18, 262],
    deny: [140, 0.1, 'square', 0.2, 100],
    boss: [55, 0.8, 'sawtooth', 0.35, 40],
    crush: [340, 0.1, 'sawtooth', 0.16, 60],
  },
  init() {
    if (this.ctx) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.5;
      this.master.connect(this.ctx.destination);
      this.musGain = this.ctx.createGain();
      this.musGain.gain.value = 0.5;
      this.musGain.connect(this.master);
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = 1;
      this.sfxGain.connect(this.master);
      this.started = true;
    } catch (e) { this.started = false; }
  },
  tone(freq, dur, type, vol, slide, dest) {
    if (!this.ctx || !Sett.sfx && dest !== this.musGain) { if (dest !== this.musGain && (!Sett.sfx)) return; }
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, slide), t + dur);
    g.gain.setValueAtTime(vol || 0.2, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g); g.connect(dest || this.sfxGain);
    o.start(t); o.stop(t + dur + 0.02);
  },
  noise(dur, vol) {
    if (!this.ctx || !Sett.sfx) return;
    const t = this.ctx.currentTime;
    const len = Math.floor(this.ctx.sampleRate * dur);
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const g = this.ctx.createGain();
    g.gain.value = vol || 0.2;
    src.connect(g); g.connect(this.sfxGain);
    src.start(t);
  },
  play(name) {
    if (!Sett.sfx || !this.ctx) return;
    if (name === 'hollow') {
      // hollow scream: two detuned saw roars sliding down + breathy noise
      this.tone(198, 1.0, 'sawtooth', 0.3, 52);
      this.tone(99, 1.2, 'sawtooth', 0.28, 41);
      this.tone(392, 0.55, 'sawtooth', 0.14, 110);
      this.noise(1.0, 0.2);
      return;
    }
    const d = this.def[name === 'stakeMultBig' ? 'cash' : name] || this.def.hit;
    this.tone(d[0], d[1], d[2], d[3], d[4]);
    if (name === 'boom' || name === 'bust' || name === 'hurt') this.noise(d[1], d[3] * 0.6);
  },
  // heat music: minor arpeggio that thickens with danger
  updMusic(dt) {
    if (!this.ctx || !Sett.music) return;
    this.musT += dt;
    const beat = 0.46 - this.heat * 0.1;
    if (this.musT >= beat) {
      this.musT = 0;
      this.musStep = (this.musStep + 1) % 16;
      const scale = [110, 130.8, 146.8, 164.8, 196, 220, 246.9, 261.6]; // A minor-ish
      const root = scale[(this.musStep % 4 === 0) ? 0 : (this.musStep * 3) % scale.length];
      // bass pulse each beat
      this.tone(root, beat * 0.9, 'triangle', 0.06 + this.heat * 0.05, root * 0.98, this.musGain);
      // occasional arp note when heat rises
      if (this.heat > 0.25 && this.musStep % 2 === 0) {
        this.tone(root * 2 * (this.musStep % 4 === 0 ? 1.5 : 1), beat * 0.5, 'sine', 0.03 + this.heat * 0.03, 0, this.musGain);
      }
      if (this.heat > 0.55 && this.musStep % 4 === 2) {
        this.tone(root * 3, beat * 0.3, 'square', 0.02, 0, this.musGain);
      }
    }
  },
};
if (typeof window !== 'undefined') window.SND = SND;
