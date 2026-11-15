// All sound is synthesised with the Web Audio API: a slow jazz quartet
// (electric piano, upright bass, brushes, vibraphone) that improvises over a
// 16-bar form, plus the budgie's wing beats and chirps.
const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
const rnd = (a, b) => a + Math.random() * (b - a);
const pick = (a) => a[(Math.random() * a.length) | 0];

// chord: [bass root (midi), rootless voicing, scale tones (pitch classes) for the soloist]
const CH = {
  Dm9: [38, [53, 57, 60, 64], [2, 5, 9, 0, 4, 7]],
  G13: [43, [53, 57, 59, 64], [7, 11, 2, 5, 9, 4]],
  Cmaj9: [36, [52, 55, 59, 62], [0, 4, 7, 11, 2, 9]],
  A7alt: [45, [49, 55, 58, 65], [9, 1, 7, 10, 5, 0]],
  Db7: [37, [53, 59, 63, 67], [1, 5, 8, 11, 3, 7]],
  Em7b5: [40, [50, 55, 58, 62], [4, 7, 10, 2, 9]],
  A7b9: [45, [49, 55, 58, 64], [9, 1, 4, 7, 10]],
  Fmaj9: [41, [57, 60, 64, 67], [5, 9, 0, 4, 7, 2]],
  Bb13: [46, [56, 60, 62, 67], [10, 2, 5, 8, 0, 7]],
  Em7: [40, [50, 54, 55, 59], [4, 7, 11, 2, 6]],
  G7b9: [43, [53, 56, 59, 64], [7, 11, 2, 5, 8]],
  C69: [36, [52, 57, 62, 67], [0, 4, 7, 9, 2]],
};
// one chord per half bar
const FORM = [
  ['Dm9', 'Dm9'], ['G13', 'G13'], ['Cmaj9', 'Cmaj9'], ['A7alt', 'A7alt'],
  ['Dm9', 'Dm9'], ['Db7', 'Db7'], ['Cmaj9', 'Cmaj9'], ['Em7b5', 'A7b9'],
  ['Fmaj9', 'Fmaj9'], ['Bb13', 'Bb13'], ['Em7', 'Em7'], ['A7b9', 'A7b9'],
  ['Dm9', 'Dm9'], ['G13', 'G7b9'], ['C69', 'C69'], ['C69', 'A7alt'],
];

export class GameAudio {
  constructor() {
    this.ctx = null;
    this.musicOn = true;
    this.bar = 0;
    this.nextBar = 0;
    this.bpm = 74;
    this.lastSolo = 74;
    this.timer = null;
  }

  start() {
    if (this.ctx) { this.ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = this.ctx = new AC();
    this.master = ctx.createGain(); this.master.gain.value = 0.9;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -16; comp.ratio.value = 3; comp.attack.value = 0.01; comp.release.value = 0.25;
    this.master.connect(comp); comp.connect(ctx.destination);
    this.music = ctx.createGain(); this.music.gain.value = this.musicOn ? 0.55 : 0; this.music.connect(this.master);
    this.sfx = ctx.createGain(); this.sfx.gain.value = 0.9; this.sfx.connect(this.master);
    // small room reverb from a decaying noise impulse
    const len = Math.floor(ctx.sampleRate * 1.9);
    const ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = ir.getChannelData(ch);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6);
    }
    this.reverb = ctx.createConvolver(); this.reverb.buffer = ir;
    const wet = ctx.createGain(); wet.gain.value = 0.28;
    this.reverb.connect(wet); wet.connect(this.music);
    const sfxWet = ctx.createGain(); sfxWet.gain.value = 0.12;
    this.sfxSend = ctx.createGain(); this.sfxSend.connect(this.reverb);
    this.reverb.connect(sfxWet); sfxWet.connect(this.sfx);
    // shared noise buffer
    const nl = ctx.sampleRate;
    this.noise = ctx.createBuffer(1, nl, ctx.sampleRate);
    const nd = this.noise.getChannelData(0);
    for (let i = 0; i < nl; i++) nd[i] = Math.random() * 2 - 1;

    this.nextBar = ctx.currentTime + 0.25;
    this.timer = setInterval(() => this.schedule(), 60);
    this.startBrushes();
  }

  setMusic(on) {
    this.musicOn = on;
    if (this.ctx) this.music.gain.setTargetAtTime(on ? 0.55 : 0, this.ctx.currentTime, 0.15);
  }
  suspend() { this.ctx?.suspend(); }
  resume() { this.ctx?.resume(); }

  // ---------------------------------------------------------------- music
  schedule() {
    const ctx = this.ctx;
    if (!ctx || ctx.state !== 'running') return;
    if (this.nextBar < ctx.currentTime - 0.5) this.nextBar = ctx.currentTime + 0.1;   // tab was asleep
    while (this.nextBar < ctx.currentTime + 0.35) {
      if (this.musicOn) this.playBar(this.bar % FORM.length, this.nextBar, Math.floor(this.bar / FORM.length));
      this.nextBar += 4 * 60 / this.bpm;
      this.bar++;
    }
  }

  playBar(i, t0, chorus) {
    const beat = 60 / this.bpm;
    const sw = beat * 0.64;                           // where the swung off-beat falls
    const [a, b] = FORM[i];
    const A = CH[a], B = CH[b];
    const next = CH[FORM[(i + 1) % FORM.length][0]];
    const walking = i >= 8;                           // second half walks, first half is a two-feel

    // bass
    if (walking) {
      const r1 = A[0], r2 = B[0];
      const line = [r1, r1 + pick([3, 4, 7]), r2 === r1 ? r1 + 7 : r2, next[0] + pick([-1, 1, -2])];
      line.forEach((m, k) => this.bass(m > 50 ? m - 12 : m, t0 + k * beat, beat * 0.92, 0.9));
      if (Math.random() < 0.3) this.bass(line[1], t0 + beat + sw, beat * 0.3, 0.45);
    } else {
      this.bass(A[0], t0, beat * 1.7, 1);
      this.bass(B[0] === A[0] ? A[0] + 7 : B[0], t0 + 2 * beat, beat * 1.5, 0.85);
      if (Math.random() < 0.45) this.bass(next[0] + pick([-1, 1]), t0 + 3 * beat + sw, beat * 0.33, 0.55);
    }

    // electric piano comping
    const pat = pick([[[0, 1.8]], [[0, 1.2], [1 + 0.64, 0.5]], [[0.64, 1.0], [2, 1.2]], [[0, 0.9], [2 + 0.64, 1.0]], [[1 + 0.64, 0.6], [3, 0.8]]]);
    for (const [pos, dur] of pat) {
      const ch = pos < 2 ? A : B;
      const voicing = Math.random() < 0.3 ? ch[1].map((m, k) => (k === 0 ? m + 12 : m)) : ch[1];
      const tt = t0 + Math.floor(pos) * beat + (pos % 1 ? sw : 0);
      voicing.forEach((m, k) => this.epiano(m, tt + k * 0.012 + rnd(0, 0.008), dur * beat, rnd(0.5, 0.8)));
    }

    // brushes: ride pattern, hi-hat on 2 and 4, a soft kick now and then
    for (let k = 0; k < 4; k++) {
      this.ride(t0 + k * beat, k % 2 ? 0.75 : 1);
      if (k % 2 === 1 || Math.random() < 0.25) this.ride(t0 + k * beat + sw, 0.5);
      if (k % 2 === 1) this.hat(t0 + k * beat);
    }
    if (i % 2 === 0 || Math.random() < 0.3) this.kick(t0, 0.5);
    if (Math.random() < 0.25) this.kick(t0 + 2 * beat + sw, 0.3);

    // vibraphone: sparse improvised phrases; rests on some bars
    if (chorus + i > 1 && Math.random() < (i % 4 === 3 ? 0.35 : 0.7)) {
      let pos = pick([0, 0.64, 1]);
      const n = 2 + ((Math.random() * 4) | 0);
      for (let k = 0; k < n && pos < 3.7; k++) {
        const ch = pos < 2 ? A : B;
        const m = this.soloNote(ch[2]);
        const long = k === n - 1 || Math.random() < 0.25;
        const tt = t0 + Math.floor(pos) * beat + (pos % 1 ? sw : 0);
        this.vibes(m, tt + rnd(-0.01, 0.02), (long ? 1.6 : 0.5) * beat, rnd(0.5, 0.9));
        pos += pos % 1 ? pick([0.36, 0.36, 1.36]) : pick([0.64, 0.64, 1, 1.64]);
      }
    }
  }

  // nearest scale tone to the previous note, with a little wandering
  soloNote(pcs) {
    let target = this.lastSolo + pick([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 7]);
    if (target > 86) target -= 7; if (target < 65) target += 7;
    let best = target, bd = 99;
    for (let m = target - 6; m <= target + 6; m++) {
      if (pcs.includes(((m % 12) + 12) % 12)) { const d = Math.abs(m - target); if (d < bd) { bd = d; best = m; } }
    }
    this.lastSolo = best;
    return best;
  }

  env(g, t, a, peak, d, sustain, dur, r) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(peak, t + a);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak * sustain), t + a + d);
    g.gain.setValueAtTime(Math.max(0.0002, peak * sustain), t + Math.max(a + d, dur));
    g.gain.exponentialRampToValueAtTime(0.0001, t + Math.max(a + d, dur) + r);
  }

  epiano(m, t, dur, vel) {
    const ctx = this.ctx, f = mtof(m);
    const g = ctx.createGain();
    this.env(g, t, 0.006, 0.075 * vel, 0.9, 0.35, dur, 0.5);
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1500 + vel * 1400;
    const o1 = ctx.createOscillator(); o1.type = 'sine'; o1.frequency.value = f;
    const o2 = ctx.createOscillator(); o2.type = 'triangle'; o2.frequency.value = f * 1.003;
    const g2 = ctx.createGain(); g2.gain.value = 0.35;
    // the "tine" bell: a quick high partial
    const o3 = ctx.createOscillator(); o3.type = 'sine'; o3.frequency.value = f * 4;
    const g3 = ctx.createGain(); g3.gain.setValueAtTime(0.22 * vel, t); g3.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    o1.connect(g); o2.connect(g2); g2.connect(g); o3.connect(g3); g3.connect(g);
    const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
    g.connect(lp);
    if (pan) { pan.pan.value = Math.sin(t * 2.1 + m) * 0.35; lp.connect(pan); pan.connect(this.music); pan.connect(this.reverb); }
    else { lp.connect(this.music); lp.connect(this.reverb); }
    const end = t + dur + 0.7;
    for (const o of [o1, o2, o3]) { o.start(t); o.stop(end); }
  }

  bass(m, t, dur, vel) {
    const ctx = this.ctx, f = mtof(m);
    const g = ctx.createGain();
    this.env(g, t, 0.012, 0.3 * vel, 0.35, 0.45, dur, 0.12);
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 1.2;
    lp.frequency.setValueAtTime(900, t); lp.frequency.exponentialRampToValueAtTime(260, t + 0.3);
    const o1 = ctx.createOscillator(); o1.type = 'triangle'; o1.frequency.value = f;
    const o2 = ctx.createOscillator(); o2.type = 'sine'; o2.frequency.value = f;
    const o3 = ctx.createOscillator(); o3.type = 'sawtooth'; o3.frequency.value = f;
    const g3 = ctx.createGain(); g3.gain.value = 0.12;
    o1.connect(lp); o2.connect(lp); o3.connect(g3); g3.connect(lp);
    lp.connect(g); g.connect(this.music);
    const end = t + dur + 0.25;
    for (const o of [o1, o2, o3]) { o.start(t); o.stop(end); }
  }

  vibes(m, t, dur, vel) {
    const ctx = this.ctx, f = mtof(m);
    const g = ctx.createGain();
    this.env(g, t, 0.004, 0.085 * vel, 1.4, 0.18, dur, 0.9);
    const trem = ctx.createGain(); trem.gain.value = 0.8;
    const lfo = ctx.createOscillator(); lfo.frequency.value = 5.2;
    const lg = ctx.createGain(); lg.gain.value = 0.18;
    lfo.connect(lg); lg.connect(trem.gain);
    const o1 = ctx.createOscillator(); o1.type = 'sine'; o1.frequency.value = f;
    const o2 = ctx.createOscillator(); o2.type = 'sine'; o2.frequency.value = f * 4;
    const g2 = ctx.createGain(); g2.gain.setValueAtTime(0.3, t); g2.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
    const o3 = ctx.createOscillator(); o3.type = 'sine'; o3.frequency.value = f * 10;
    const g3 = ctx.createGain(); g3.gain.setValueAtTime(0.08, t); g3.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
    o1.connect(g); o2.connect(g2); g2.connect(g); o3.connect(g3); g3.connect(g);
    g.connect(trem); trem.connect(this.music); trem.connect(this.reverb);
    const end = t + dur + 1.2;
    for (const o of [o1, o2, o3, lfo]) { o.start(t); o.stop(end); }
  }

  noiseHit(t, dur, type, freq, q, peak, dest) {
    const ctx = this.ctx;
    const s = ctx.createBufferSource(); s.buffer = this.noise; s.loop = true;
    const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(peak, t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(dest || this.music);
    s.start(t, Math.random() * 0.8); s.stop(t + dur + 0.02);
    return g;
  }

  ride(t, vel) { this.noiseHit(t, 0.32, 'highpass', 6500, 0.7, 0.035 * vel).connect(this.reverb); }
  hat(t) { this.noiseHit(t, 0.06, 'bandpass', 9000, 1.2, 0.05); }
  kick(t, vel) {
    const ctx = this.ctx;
    const o = ctx.createOscillator(); o.frequency.setValueAtTime(95, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.12);
    const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.22 * vel, t + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
    o.connect(g); g.connect(this.music); o.start(t); o.stop(t + 0.25);
  }

  // the constant swish of brushes on a snare
  startBrushes() {
    const ctx = this.ctx;
    const s = ctx.createBufferSource(); s.buffer = this.noise; s.loop = true;
    const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 3200; f.Q.value = 0.6;
    const g = ctx.createGain(); g.gain.value = 0.011;
    const lfo = ctx.createOscillator(); lfo.frequency.value = this.bpm / 60;       // one stir per beat
    const lg = ctx.createGain(); lg.gain.value = 0.007;
    lfo.connect(lg); lg.connect(g.gain);
    s.connect(f); f.connect(g); g.connect(this.music);
    s.start(); lfo.start();
  }

  // ------------------------------------------------------------------ bird
  flap(vol, speed) {
    const ctx = this.ctx; if (!ctx || ctx.state !== 'running') return;
    const t = ctx.currentTime;
    const g = this.noiseHit(t, 0.05, 'bandpass', 950 + speed * 500 + rnd(-80, 80), 0.9, 0.05 * vol, this.sfx);
    g.connect(this.sfxSend);
  }

  flutter() {
    const ctx = this.ctx; if (!ctx || ctx.state !== 'running') return;
    const t = ctx.currentTime;
    for (let i = 0; i < 4; i++) this.noiseHit(t + i * 0.055, 0.06, 'bandpass', 800 + i * 90, 0.8, 0.09, this.sfx);
  }

  tap(vol = 1) {
    const ctx = this.ctx; if (!ctx || ctx.state !== 'running') return;
    const t = ctx.currentTime;
    this.noiseHit(t, 0.03, 'bandpass', 2400, 2, 0.03 * vol, this.sfx);
  }

  land() {
    const ctx = this.ctx; if (!ctx || ctx.state !== 'running') return;
    const t = ctx.currentTime;
    this.noiseHit(t + 0.1, 0.05, 'bandpass', 1800, 1.5, 0.07, this.sfx);
    const o = ctx.createOscillator(); o.frequency.setValueAtTime(210, t + 0.1); o.frequency.exponentialRampToValueAtTime(110, t + 0.17);
    const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t + 0.1); g.gain.linearRampToValueAtTime(0.06, t + 0.105); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
    o.connect(g); g.connect(this.sfx); o.start(t + 0.1); o.stop(t + 0.22);
  }

  // budgie chatter: a few fast frequency-swept notes with a warble
  chirp() {
    const ctx = this.ctx; if (!ctx || ctx.state !== 'running') return;
    let t = ctx.currentTime + 0.01;
    const n = 2 + ((Math.random() * 4) | 0);
    for (let i = 0; i < n; i++) {
      const dur = rnd(0.05, 0.13);
      const f0 = rnd(2600, 4200), f1 = f0 * rnd(1.15, 1.6), f2 = f0 * rnd(0.75, 1.1);
      const o = ctx.createOscillator(); o.type = Math.random() < 0.5 ? 'sine' : 'triangle';
      o.frequency.setValueAtTime(f0, t);
      o.frequency.exponentialRampToValueAtTime(f1, t + dur * 0.45);
      o.frequency.exponentialRampToValueAtTime(f2, t + dur);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(0.085, t + 0.008);
      g.gain.setValueAtTime(0.085, t + dur * 0.7);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      // warble
      const am = ctx.createOscillator(); am.frequency.value = rnd(45, 90);
      const ag = ctx.createGain(); ag.gain.value = 0.045;
      am.connect(ag); ag.connect(g.gain);
      o.connect(g); g.connect(this.sfx); g.connect(this.sfxSend);
      o.start(t); o.stop(t + dur + 0.02); am.start(t); am.stop(t + dur + 0.02);
      t += dur + rnd(0.015, 0.09);
    }
  }
}
