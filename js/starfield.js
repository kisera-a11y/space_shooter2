import { CANVAS_WIDTH, CANVAS_HEIGHT, STAR_COUNT } from './config.js';

// Slowly drifting, twinkling background stars. Purely decorative and
// runs independent of game state so it can animate on the start screen too.
export class Starfield {
  constructor() {
    this.stars = Array.from({ length: STAR_COUNT }, () => ({
      x: Math.random() * CANVAS_WIDTH,
      y: Math.random() * CANVAS_HEIGHT,
      radius: Math.random() * 1.5 + 0.5,
      speed: Math.random() * 20 + 10,
      twinklePhase: Math.random() * Math.PI * 2,
    }));
    this.time = 0;
  }

  update(dt) {
    this.time += dt;
    for (const star of this.stars) {
      star.y += star.speed * dt;
      if (star.y > CANVAS_HEIGHT) {
        star.y = 0;
        star.x = Math.random() * CANVAS_WIDTH;
      }
    }
  }

  draw(ctx) {
    for (const star of this.stars) {
      const twinkle = 0.5 + 0.5 * Math.sin(this.time * 2 + star.twinklePhase);
      ctx.globalAlpha = 0.4 + twinkle * 0.6;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
}
