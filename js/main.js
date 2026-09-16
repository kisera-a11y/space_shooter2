import { InputHandler } from './input.js';
import { Game } from './game.js';

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

const input = new InputHandler();
const game = new Game(ctx, input);

let lastTime = performance.now();

function loop(now) {
  const dt = Math.min((now - lastTime) / 1000, 0.05); // clamp to avoid huge jumps on tab-switch
  lastTime = now;

  game.update(dt);
  game.draw();

  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
