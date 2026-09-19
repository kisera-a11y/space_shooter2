// Central tuning values. Keep gameplay numbers here so balance can be
// adjusted without hunting through entity/game logic.

export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;

// How long the Game Over screen ignores the fire/confirm input after it
// first appears. A single immediate consumeFirePressed() call at the
// moment of death only clears whatever was *already* pending — it can't
// stop a fresh press that lands in the brief window between that call
// and the next frame (very plausible if the player is mashing fire right
// as the fatal hit lands). Actively discarding fire presses for a short
// grace window instead of just checking once closes that race outright.
export const GAME_OVER_INPUT_DELAY = 0.5;

export const PLAYER = {
  width: 40,
  height: 30,
  speed: 320, // pixels per second
  color: '#4fd1ff',
  startLives: 3,
  maxLives: 3, // an extra-life pickup above this cap is collected but does nothing
  fireCooldown: 0.25, // seconds between shots
  respawnDelay: 0.8, // seconds hidden/inactive after losing a life
  shieldHitInvulnerability: 0.6, // seconds of immunity right after a shield absorbs a hit
};

export const BULLET = {
  width: 4,
  height: 14,
  speed: 480, // pixels per second, upward
  color: '#ffe066',
  // Fired instead of a normal bullet while the charged-laser power-up is
  // active: wider, taller, stronger, and pierces through aliens instead
  // of being destroyed on the first hit. Bullet.draw() renders it as a
  // glowing layered beam (outer glow + core) rather than a flat rect, to
  // actually look like the strongest shot in the game.
  chargedWidth: 20,
  chargedHeight: 30,
  chargedDamage: 3,
  chargedColor: '#8be9ff',
};

// Aliens no longer spawn all at once in a grid — each wave has a fixed
// budget (count) that trickles in one at a time at a random x position,
// with a random gap between spawns, so arrivals feel staggered/continuous
// rather than a synchronized front line. A wave is "cleared" once its
// whole budget has been spawned and none remain on screen (killed or
// passed through — passing through is harmless, see Game._loseLife).
export const ALIEN = {
  baseSpeed: 30, // pixels per second, downward (halved from 60)
  speedPerWave: 4, // added to baseSpeed each wave (halved from 8)
  countBase: 5, // aliens in wave 1
  countPerWave: 2, // additional aliens each wave
  maxCount: 20,
  minSpawnInterval: 0.5, // seconds between individual alien spawns
  maxSpawnInterval: 1.1,
};

// Unkillable rocks that drift down alongside aliens, tumbling with a
// random rotation — pure obstacles the player has to dodge rather than
// shoot. Bullets (even piercing ones) are absorbed on contact but do
// nothing to the rock; touching the ship costs a life like an alien would.
export const METEOR = {
  minSpawnInterval: 1.5,
  maxSpawnInterval: 3,
  baseSize: 34,
  sizeVariance: 0.35, // +/- fraction applied to baseSize per instance
  speedVariance: 0.25, // +/- fraction applied to the wave's alien speed
  maxRotationSpeed: 2.5, // radians/sec, direction randomized per instance
  color: '#8a7f73',
};

export const ENEMY_BULLET = {
  width: 6,
  height: 14,
  speed: 220, // pixels per second, downward
  color: '#ff4d6d',
};

// A single large boss replaces the regular wave every BOSS.everyNWaves
// waves. It hovers near the top, patrols left/right, and shoots at the
// player instead of descending — bossIndex (1st boss, 2nd boss, ...)
// scales hp/speed/fire rate so each encounter is tougher than the last.
export const BOSS = {
  everyNWaves: 3,
  widthRatio: 1 / 3, // "about a third of the screen" wide
  heightRatio: 0.22,
  entryY: 60, // resting height once it finishes entering
  entrySpeed: 80, // px/s while descending into position
  baseMoveSpeed: 70, // horizontal patrol speed for the 1st boss
  moveSpeedPerBoss: 15,
  baseHp: 90, // roughly doubled so intermediate bosses are a real fight
  hpPerBoss: 45,
  baseFireInterval: 1.6, // seconds between shots, 1st boss
  fireIntervalStepDown: 0.2,
  minFireInterval: 0.5,
  baseScoreValue: 200,
  scorePerBoss: 100,
};

// Regular bosses cycle through these looks (by bossIndex, wrapping around)
// so each encounter is visually distinct — see Boss.draw()'s per-shape
// methods in entities/boss.js. `pattern` picks how it fires (Boss._fire()),
// so a variant can be a genuinely different fight, not just a reskin;
// omitting it (as the original four do) means the plain single shot
// straight down. The final boss (below) has its own unique look/attacks
// instead of picking from this list.
export const BOSS_VARIANTS = [
  { shape: 'hex', color: '#ff2e63', pattern: 'single' },
  { shape: 'saucer', color: '#7b2ff7', pattern: 'single' },
  { shape: 'carrier', color: '#ff8c42', pattern: 'single' },
  { shape: 'spider', color: '#2ee6a8', pattern: 'single' },
  // Three-barreled turret — fans out a 3-way spread instead of one shot.
  { shape: 'turret', color: '#ffd23f', pattern: 'spread' },
  // Heavy twin-cannon hull — fires two parallel shots at once from
  // offset barrels instead of one shot from center.
  { shape: 'juggernaut', color: '#4d96ff', pattern: 'twin' },
];

// Brief pause + on-screen label at the start of every wave (regular or
// boss), so the transition between levels reads clearly instead of the
// next wave just appearing mid-motion.
export const WAVE_TRANSITION = {
  holdDuration: 1, // seconds aliens/boss stay frozen at the wave's start
  labelDuration: 0.5, // seconds the "WAVE n" text is shown
};

// A multi-burst death sequence played when a boss is destroyed, instead
// of it just vanishing: it freezes and flickers in place while staggered
// small explosions burst across its body, capped by one big finale, with
// a screen shake for impact. See Game._startBossDeathSequence(). The
// final boss gets a longer, bigger version of the same sequence.
export const BOSS_DEATH = {
  burstCount: 5,
  finalBurstCount: 9,
  burstMinGap: 0.08, // seconds between staggered small bursts
  burstMaxGap: 0.22,
  finaleDelay: 0.25, // gap between the last small burst and the big finale
  postFinaleGrace: 0.4, // how long the finale lingers before the boss actually clears
  screenShakeDuration: 0.6,
  screenShakeMagnitude: 8,
  finalScreenShakeDuration: 1,
  finalScreenShakeMagnitude: 16,
};

// Permanent reward for defeating the final boss (see FINAL_BOSS below) —
// unlike the temporary power-ups, this lasts the rest of the run: a new
// ship look plus a speed boost and slow passive shield regeneration (up
// to the shield power-up's own maxCharges). See Player.promoteToAce().
export const ACE_SHIP = {
  speedMultiplier: 1.2,
  shieldRegenInterval: 18, // seconds between each free shield charge
};

// A one-time, tougher-than-normal encounter that replaces the regular
// boss on this specific boss encounter number (5th boss == wave 15 at
// the default everyNWaves of 3). Unlike a regular Boss it can lunge down
// toward the player (and back) and alternates between several attack
// patterns — see entities/finalBoss.js. The game doesn't end when it's
// defeated — waves keep going indefinitely afterward, with the regular
// boss rotation continuing to scale up in hp/speed/fire-rate forever.
export const FINAL_BOSS = {
  bossNumber: 5,
  widthRatio: 0.4,
  heightRatio: 0.24,
  moveSpeed: 110,
  fireInterval: 1.1,
  chargeCooldownMin: 3.5, // seconds between charge attacks
  chargeCooldownMax: 5.5,
  chargeDepthRatio: 0.62, // how far down the screen it lunges (of CANVAS_HEIGHT) — deep enough to actually reach the player
  chargeForwardSpeed: 260,
  chargeRetreatSpeed: 160,
  chargeHoldDuration: 0.4, // pause at the bottom of the lunge
  hp: 320, // toughest fight in the game, clearly above the last regular boss
  scoreValue: 1000,
  color: '#8b1e3f',
  coreColor: '#ff2e63',
};

// Power-ups drop from destroyed aliens and fall straight down; the player
// collects one by touching it with the ship. Each type is self-contained
// (color/weight/effect data) like ALIEN_TYPES, so adding another later is
// just a new entry plus a case in Game._applyPowerUp.
export const POWERUP = {
  dropChance: 0.15, // chance an alien kill drops a power-up
  fallSpeed: 90,
  width: 22,
  height: 22,
  types: {
    laser: {
      color: '#8be9ff',
      weight: 3, // relative pick weight — more common than an extra life
      duration: 8, // seconds the charged laser stays active once collected
    },
    // Rarest drop — halved again relative to the others so running low
    // on lives isn't bailed out too easily, and capped at PLAYER.maxLives
    // (see Game._applyPowerUp()) so it's not worth stockpiling either.
    life: {
      color: '#ff6b6b',
      weight: 0.5,
    },
    // Absorbs the next hit(s) instead of costing a life/weapon level (see
    // Game._absorbHitWithShield()). Charges stack up to maxCharges rather
    // than each pickup overwriting the last.
    shield: {
      color: '#5df2d6',
      weight: 2,
      charges: 1,
      maxCharges: 3,
    },
  },
};

// Each alien type is self-contained (size/color/toughness/value/speed) so
// adding a new type later is just a new entry here, no code changes.
// minWave gates when a type starts appearing, giving a simple difficulty
// ramp without any special-case logic in the spawner.
export const ALIEN_TYPES = {
  grunt: {
    width: 32,
    height: 24,
    color: '#ff5c8a',
    hp: 1,
    scoreValue: 10,
    xpValue: 10,
    speedMultiplier: 1,
    minWave: 1,
  },
  scout: {
    width: 24,
    height: 20,
    color: '#7cfc9a',
    hp: 1,
    scoreValue: 15,
    xpValue: 12,
    speedMultiplier: 1.5,
    minWave: 2,
  },
  brute: {
    width: 42,
    height: 34,
    color: '#b565f2',
    hp: 3,
    scoreValue: 30,
    xpValue: 25,
    speedMultiplier: 0.6,
    minWave: 3,
  },
  // Moth-like flier that sways side to side as it descends (movement:
  // 'sway') instead of coming straight down, so it's harder to lead a
  // shot on despite being fragile. See Alien.update()/_drawWeaver().
  weaver: {
    width: 30,
    height: 26,
    color: '#ffb347',
    hp: 1,
    scoreValue: 20,
    xpValue: 15,
    speedMultiplier: 1.2,
    minWave: 3,
    movement: 'sway',
    swayAmplitude: 60,
    swayFrequency: 2.2,
  },
  // Spider-legged drifter that bounces horizontally across the screen
  // while slowly descending (movement: 'drift') rather than beelining
  // down, forcing you to track it instead of just holding still under it.
  stalker: {
    width: 38,
    height: 30,
    color: '#4de8c9',
    hp: 2,
    scoreValue: 28,
    xpValue: 20,
    speedMultiplier: 0.7,
    minWave: 4,
    movement: 'drift',
    driftSpeed: 90,
  },
  // The first aliens that shoot back (canAttack), phased in starting at
  // wave 10 — see Alien._fire()/Alien.update() in entities/alien.js.
  // attackPattern picks how: 'straight' fires one bullet straight down,
  // 'aimed' leads toward the player's position at the moment it fires,
  // 'spread' fans out three bullets like a boss's spread pattern.
  sentinel: {
    width: 30,
    height: 30,
    color: '#c77dff',
    hp: 1,
    scoreValue: 22,
    xpValue: 16,
    speedMultiplier: 0.9,
    minWave: 10,
    canAttack: true,
    attackPattern: 'straight',
    fireInterval: 2.2,
  },
  // Aims at the player instead of just firing straight down, so standing
  // still under it is no longer automatically safe.
  marksman: {
    width: 34,
    height: 28,
    color: '#ff9f4d',
    hp: 2,
    scoreValue: 30,
    xpValue: 22,
    speedMultiplier: 0.8,
    minWave: 11,
    canAttack: true,
    attackPattern: 'aimed',
    fireInterval: 2.6,
  },
  // The toughest regular alien attacker — 3 hp and a 3-way spread shot.
  vanguard: {
    width: 44,
    height: 36,
    color: '#5c7cff',
    hp: 3,
    scoreValue: 40,
    xpValue: 30,
    speedMultiplier: 0.55,
    minWave: 13,
    canAttack: true,
    attackPattern: 'spread',
    fireInterval: 3,
  },
};

// Every kill grants xp (aliens included, via ALIEN_TYPES.xpValue above) —
// this is what makes killing regular aliens worthwhile beyond score.
// Levels are a fixed progression (one per WEAPON_LEVELS entry below);
// levelThresholds[i] is the *cumulative* xp needed to reach level i+1,
// so levelThresholds.length must equal WEAPON_LEVELS.length.
export const XP = {
  bossBaseValue: 60, // xp for the 1st boss; scales like BOSS's own hp/speed
  bossValuePerBoss: 15,
  finalBossValue: 300,
  levelThresholds: [0, 100, 250, 450, 700],
};

// The player's weapon upgrades with XP level (index 0 == level 1, the
// starting weapon). Charged-laser power-ups still work on top of
// whatever level the player has reached — this is the *permanent*
// progression, powerups are a temporary boost.
export const WEAPON_LEVELS = [
  { name: 'Single Shot', cooldown: 0.25, bulletCount: 1, spreadAngle: 0 },
  { name: 'Rapid Fire', cooldown: 0.18, bulletCount: 1, spreadAngle: 0 },
  { name: 'Twin Cannons', cooldown: 0.18, bulletCount: 2, spreadAngle: 0 },
  { name: 'Triple Cannons', cooldown: 0.16, bulletCount: 3, spreadAngle: 0 },
  { name: 'Spread Array', cooldown: 0.14, bulletCount: 3, spreadAngle: 0.18 },
];

export const STAR_COUNT = 90;

export const STATE = {
  START: 'start',
  PLAYING: 'playing',
  PAUSED: 'paused',
  GAME_OVER: 'game_over',
};
