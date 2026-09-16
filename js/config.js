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
  width: 32,
  height: 24,
  baseSpeed: 60, // pixels per second, downward
  color: '#ff5c8a',
  speedPerWave: 12, // added to baseSpeed each wave
  countBase: 5, // aliens in wave 1
  countPerWave: 2, // additional aliens each wave
  maxCount: 20,
  rowSpacing: 50,
  colSpacing: 55,
  scoreValue: 10,
};

export const STAR_COUNT = 90;

export const STATE = {
  START: 'start',
  PLAYING: 'playing',
  GAME_OVER: 'game_over',
};
