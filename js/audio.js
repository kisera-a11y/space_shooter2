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

export function playExplosionSound() {
  const ctx = getContext();
  const now = ctx.currentTime;
  const duration = 0.5;

  // Filtered noise burst for the "crack", decaying to silence.
  const bufferSize = Math.floor(ctx.sampleRate * duration);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(1200, now);
  filter.frequency.exponentialRampToValueAtTime(80, now + duration);

  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.35, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

  noise.connect(filter);
  filter.connect(noiseGain);
  noiseGain.connect(ctx.destination);
  noise.start(now);
  noise.stop(now + duration);

  // Low sine "thump" underneath the noise for weight.
  const thump = ctx.createOscillator();
  const thumpGain = ctx.createGain();
  thump.type = 'sine';
  thump.frequency.setValueAtTime(120, now);
  thump.frequency.exponentialRampToValueAtTime(30, now + 0.3);
  thumpGain.gain.setValueAtTime(0.3, now);
  thumpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

  thump.connect(thumpGain);
  thumpGain.connect(ctx.destination);
  thump.start(now);
  thump.stop(now + 0.3);
}

// Soft, continuous ambient drone played while a run is active. Kept as a
// module-level handle so start/stop are idempotent — calling either one
// repeatedly (e.g. across restarts) never creates duplicate/leaked nodes.
let musicNodes = null;

export function startBackgroundMusic() {
  if (musicNodes) return;

  const ctx = getContext();
  const now = ctx.currentTime;

  const master = ctx.createGain();
  master.gain.setValueAtTime(0.05, now); // quiet — meant to sit under sfx
  master.connect(ctx.destination);

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(500, now);
  filter.connect(master);

  // Two low, gently detuned tones (root + fifth) for a soft spacey pad.
  const osc1 = ctx.createOscillator();
  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(110, now);
  osc1.connect(filter);

  const osc2 = ctx.createOscillator();
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(110 * 1.5, now);
  osc2.detune.setValueAtTime(6, now);
  osc2.connect(filter);

  // Slow LFO breathes the volume in and out instead of a flat drone.
  const lfo = ctx.createOscillator();
  lfo.type = 'sine';
  lfo.frequency.setValueAtTime(0.15, now);
  const lfoGain = ctx.createGain();
  lfoGain.gain.setValueAtTime(0.02, now);
  lfo.connect(lfoGain);
  lfoGain.connect(master.gain);

  osc1.start(now);
  osc2.start(now);
  lfo.start(now);

  musicNodes = { osc1, osc2, lfo, master };
}

export function stopBackgroundMusic() {
  if (!musicNodes) return;

  const { osc1, osc2, lfo, master } = musicNodes;
  const ctx = getContext();
  const now = ctx.currentTime;

  // Quick fade-out avoids an audible click from stopping oscillators cold.
  master.gain.cancelScheduledValues(now);
  master.gain.setValueAtTime(master.gain.value, now);
  master.gain.linearRampToValueAtTime(0, now + 0.3);

  osc1.stop(now + 0.35);
  osc2.stop(now + 0.35);
  lfo.stop(now + 0.35);

  musicNodes = null;
}
