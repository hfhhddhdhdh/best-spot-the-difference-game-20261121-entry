// Tiny synthesized sound effects (Web Audio, no audio files, no network).
// Sounds stay silent until the player's first gesture, so the page never
// tries to start audio on load (and never logs an autoplay warning).
let audioContext = null;
let muted = false;
let unlocked = false;

if (typeof window !== 'undefined') {
  const unlock = () => { unlocked = true; };
  window.addEventListener('pointerdown', unlock, { once: true });
  window.addEventListener('keydown', unlock, { once: true });
}

function context() {
  if (!unlocked) return null;
  if (!audioContext) {
    const AudioCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtor) return null;
    audioContext = new AudioCtor();
  }
  if (audioContext.state === 'suspended') audioContext.resume();
  return audioContext;
}

function tone(freq, startAt, dur, type, vol) {
  const ctx = context();
  if (!ctx || muted) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, ctx.currentTime + startAt);
  gain.gain.exponentialRampToValueAtTime(vol, ctx.currentTime + startAt + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + startAt + dur);
  osc.connect(gain).connect(ctx.destination);
  osc.start(ctx.currentTime + startAt);
  osc.stop(ctx.currentTime + startAt + dur + 0.05);
}

export const sfx = {
  correct() { tone(660, 0, 0.16, 'sine', 0.22); tone(880, 0.09, 0.22, 'sine', 0.22); tone(1320, 0.18, 0.2, 'triangle', 0.12); },
  wrong() { tone(180, 0, 0.22, 'sawtooth', 0.12); tone(140, 0.1, 0.25, 'sawtooth', 0.1); },
  hint() { tone(520, 0, 0.12, 'triangle', 0.16); tone(780, 0.08, 0.16, 'triangle', 0.14); },
  click() { tone(440, 0, 0.06, 'square', 0.06); },
  tick() { tone(980, 0, 0.05, 'square', 0.07); },
  levelWin() {
    [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.11, 0.28, 'triangle', 0.2));
  },
  gameWin() {
    [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => tone(f, i * 0.13, 0.3, 'triangle', 0.2));
  },
  gameOver() {
    [392, 330, 262, 196].forEach((f, i) => tone(f, i * 0.16, 0.3, 'sine', 0.18));
  },
};

export function setMuted(value) { muted = value; }
export function isMuted() { return muted; }
