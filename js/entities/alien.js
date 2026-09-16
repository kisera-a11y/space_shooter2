import { ALIEN, CANVAS_HEIGHT } from '../config.js';

export class Alien {
  constructor(x, y, speed) {
    this.x = x;
    this.y = y;
    this.width = ALIEN.width;
    this.height = ALIEN.height;
    this.speed = speed;
  }

  update(dt) {
    this.y += this.speed * dt;
  }

  hasReachedBottom() {
    return this.y + this.height >= CANVAS_HEIGHT;
  }

  draw(ctx) {
    const x = this.x;
    const y = this.y;
    const w = this.width;
    const h = this.height;

    ctx.fillStyle = ALIEN.color;
    ctx.beginPath();
    ctx.moveTo(x, y + h * 0.4);
    ctx.lineTo(x + w * 0.25, y);
    ctx.lineTo(x + w * 0.75, y);
    ctx.lineTo(x + w, y + h * 0.4);
    ctx.lineTo(x + w * 0.85, y + h);
    ctx.lineTo(x + w * 0.15, y + h);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#1a0b12';
    ctx.fillRect(x + w * 0.3, y + h * 0.35, w * 0.15, h * 0.2);
    ctx.fillRect(x + w * 0.55, y + h * 0.35, w * 0.15, h * 0.2);
  }
}
