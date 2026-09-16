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

// A fifth stacked under each melody note turns the bare square wave into
// a small power chord — makes a weapon level-up read as more of an
// event than a single blip, without changing its length.
export function playLevelUpSound() {
  const ctx = getContext();
  const now = ctx.currentTime;
  const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 — a bright arpeggio
  const noteDuration = 0.1;

  notes.forEach((freq, i) => {
    const startTime = now + i * noteDuration;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(freq, startTime);
    gain.gain.setValueAtTime(0.16, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + noteDuration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + noteDuration);

    const harmony = ctx.createOscillator();
    const harmonyGain = ctx.createGain();
    harmony.type = 'square';
    harmony.frequency.setValueAtTime(freq * 1.5, startTime); // a fifth above
    harmonyGain.gain.setValueAtTime(0.08, startTime);
    harmonyGain.gain.exponentialRampToValueAtTime(0.001, startTime + noteDuration);
    harmony.connect(harmonyGain);
    harmonyGain.connect(ctx.destination);
    harmony.start(startTime);
    harmony.stop(startTime + noteDuration);
  });
}

// A quick, bright pickup blip for collecting a power-up — deliberately
// shorter and lighter than the level-up chord progression so the two
// never get confused for each other.
export function playPowerUpSound() {
  const ctx = getContext();
  const now = ctx.currentTime;
  const notes = [880, 1318.5]; // A5, E6 — a two-note "ping"
  const noteDuration = 0.08;

  notes.forEach((freq, i) => {
    const startTime = now + i * noteDuration * 0.8;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0.18, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + noteDuration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + noteDuration);
  });
}

// Reserved for the rare, big moments (reaching the final weapon tier,
// defeating the final boss) — a longer climb than the regular level-up
// arpeggio, resolving into a held sawtooth chord instead of just stopping.
export function playMilestoneSound() {
  const ctx = getContext();
  const now = ctx.currentTime;
  const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5, 1568]; // C5..G6
  const noteDuration = 0.1;

  notes.forEach((freq, i) => {
    const startTime = now + i * noteDuration;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0.17, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + noteDuration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + noteDuration);
  });

  const chordStart = now + notes.length * noteDuration;
  const chordDuration = 0.5;
  [1046.5, 1318.5, 1568].forEach((freq) => { // held C-E-G chord, an octave up
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, chordStart);

    gain.gain.setValueAtTime(0.12, chordStart);
    gain.gain.exponentialRampToValueAtTime(0.001, chordStart + chordDuration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(chordStart);
    osc.stop(chordStart + chordDuration);
  });
}

export function playLevelDownSound() {
  const ctx = getContext();
  const now = ctx.currentTime;
  const notes = [1046.5, 783.99, 659.25, 523.25]; // C6, G5, E5, C5 — descending
  const noteDuration = 0.11;

  notes.forEach((freq, i) => {
    const startTime = now + i * noteDuration;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0.15, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + noteDuration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + noteDuration);
  });
}

export function playEnemyFireSound() {
  const ctx = getContext();
  const now = ctx.currentTime;
  const duration = 0.18;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(300, now);
  osc.frequency.exponentialRampToValueAtTime(90, now + duration);

  gain.gain.setValueAtTime(0.14, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + duration);
}

// --- 8-bit style background music -----------------------------------
//
// A short square-wave melody + triangle-wave bass loop, in the spirit of
// NES chiptunes. Rather than a real-time scheduler, each loop's notes are
// all scheduled up front against the Web Audio clock (sample-accurate,
// no drift within a loop) and a single setTimeout re-triggers the next
// loop — simple, and any small JS-timer slack only affects the barely
// audible loop seam, not the notes themselves.

// Semitone offsets from A4 (440Hz); freq = 440 * 2^(n/12).
const NOTE = {
  C4: -9, D4: -7, E4: -5, F4: -4, G4: -2, A4: 0, B4: 2,
  C5: 3, D5: 5, E5: 7, F5: 8, G5: 10, A5: 12,
};

const STEP_DURATION = 0.15; // seconds per step
const MELODY = ['C5', 'E5', 'G5', 'E5', 'F5', 'A5', 'G5', 'E5', 'D5', 'F5', 'A5', 'F5', 'E5', 'C5', 'D5', 'B4'];
const BASS = ['C4', null, 'C4', null, 'F4', null, 'F4', null, 'G4', null, 'G4', null, 'C4', null, 'G4', null];

function noteFreq(name) {
  return 440 * Math.pow(2, NOTE[name] / 12);
}

function playChiptuneNote(destination, freq, waveType, startTime, duration, volume) {
  const ctx = getContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = waveType;
  osc.frequency.setValueAtTime(freq, startTime);

  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(volume, startTime + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  osc.connect(gain);
  gain.connect(destination);
  osc.start(startTime);
  osc.stop(startTime + duration + 0.02);
}

// Module-level handle so start/stop are idempotent — calling either one
// repeatedly (e.g. across restarts) never creates duplicate/leaked loops.
let musicState = null;

function scheduleMusicLoop(loopStartTime) {
  if (!musicState || !musicState.playing) return;

  MELODY.forEach((note, i) => {
    if (!note) return;
    playChiptuneNote(
      musicState.gain,
      noteFreq(note),
      'square',
      loopStartTime + i * STEP_DURATION,
      STEP_DURATION * 0.85,
      0.05
    );
  });

  BASS.forEach((note, i) => {
    if (!note) return;
    playChiptuneNote(
      musicState.gain,
      noteFreq(note),
      'triangle',
      loopStartTime + i * STEP_DURATION,
      STEP_DURATION * 0.9,
      0.07
    );
  });

  const loopDuration = MELODY.length * STEP_DURATION;
  musicState.timeoutId = setTimeout(() => {
    scheduleMusicLoop(loopStartTime + loopDuration);
  }, loopDuration * 1000);
}

export function startBackgroundMusic() {
  if (musicState && musicState.playing) return;

  const ctx = getContext();
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.2, ctx.currentTime);
  gain.connect(ctx.destination);

  musicState = { gain, playing: true, timeoutId: null };
  scheduleMusicLoop(ctx.currentTime + 0.05);
}

export function stopBackgroundMusic() {
  if (!musicState) return;

  musicState.playing = false;
  if (musicState.timeoutId) clearTimeout(musicState.timeoutId);

  const ctx = getContext();
  const now = ctx.currentTime;
  musicState.gain.gain.cancelScheduledValues(now);
  musicState.gain.gain.setValueAtTime(musicState.gain.gain.value, now);
  musicState.gain.gain.linearRampToValueAtTime(0, now + 0.2);

  musicState = null;
}
