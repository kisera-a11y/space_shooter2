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
};

export const BULLET = {
  width: 4,
  height: 14,
  speed: 480, // pixels per second, upward
  color: '#ffe066',
};

export const ALIEN = {
  baseSpeed: 60, // pixels per second, downward
  speedPerWave: 12, // added to baseSpeed each wave
  countBase: 5, // aliens in wave 1
  countPerWave: 2, // additional aliens each wave
  maxCount: 20,
  rowSpacing: 50,
  colSpacing: 55,
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
