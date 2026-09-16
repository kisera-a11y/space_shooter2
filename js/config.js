// Central tuning values. Keep gameplay numbers here so balance can be
// adjusted without hunting through entity/game logic.

export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;

export const PLAYER = {
  width: 40,
  height: 30,
  speed: 320, // pixels per second
  color: '#4fd1ff',
  startLives: 3,
  fireCooldown: 0.25, // seconds between shots
  respawnDelay: 0.8, // seconds hidden/inactive after losing a life
};

export const BULLET = {
  width: 4,
  height: 14,
  speed: 480, // pixels per second, upward
  color: '#ffe066',
  // Fired instead of a normal bullet while the charged-laser power-up is
  // active: wider, stronger, and pierces through aliens instead of
  // being destroyed on the first hit.
  chargedWidth: 10,
  chargedDamage: 3,
  chargedColor: '#8be9ff',
};

export const ALIEN = {
  baseSpeed: 60, // pixels per second, downward
  speedPerWave: 8, // added to baseSpeed each wave (slowed ~1/3 from the original 12)
  countBase: 5, // aliens in wave 1
  countPerWave: 2, // additional aliens each wave
  maxCount: 20,
  rowSpacing: 50,
  colSpacing: 55,
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
    life: {
      color: '#ff6b6b',
      weight: 1,
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
    speedMultiplier: 1,
    minWave: 1,
  },
  scout: {
    width: 24,
    height: 20,
    color: '#7cfc9a',
    hp: 1,
    scoreValue: 15,
    speedMultiplier: 1.5,
    minWave: 2,
  },
  brute: {
    width: 42,
    height: 34,
    color: '#b565f2',
    hp: 3,
    scoreValue: 30,
    speedMultiplier: 0.6,
    minWave: 3,
  },
};

export const STAR_COUNT = 90;

export const STATE = {
  START: 'start',
  PLAYING: 'playing',
  GAME_OVER: 'game_over',
};
