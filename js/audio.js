// Sound effects synthesized with the Web Audio API — no audio asset
// files to manage. The AudioContext is created lazily on first use since
// browsers require a user gesture (a keypress/tap) before audio can play,
// and firing a shot always follows one.
let audioCtx = null;

function getContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playFireSound(charged = false) {
  const ctx = getContext();
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const duration = charged ? 0.2 : 0.12;

  osc.type = charged ? 'sawtooth' : 'square';
  osc.frequency.setValueAtTime(charged ? 520 : 880, now);
  osc.frequency.exponentialRampToValueAtTime(charged ? 140 : 220, now + duration - 0.02);

  gain.gain.setValueAtTime(charged ? 0.18 : 0.15, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + duration);
}
