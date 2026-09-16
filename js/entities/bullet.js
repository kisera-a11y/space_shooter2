import { BULLET, CANVAS_WIDTH } from '../config.js';

export class Bullet {
  constructor(x, y, options = {}) {
    this.x = x;
    this.y = y;
    this.width = options.width ?? BULLET.width;
    this.height = BULLET.height;
    this.damage = options.damage ?? 1;
    this.pierce = options.pierce ?? false;
    this.color = options.color ?? BULLET.color;
    this.vx = options.vx ?? 0; // horizontal drift, used by the spread weapon tier
  }

  update(dt) {
    this.x += this.vx * dt;
    this.y -= BULLET.speed * dt;
  }

  isOffscreen() {
    return this.y + this.height < 0 || this.x + this.width < 0 || this.x > CANVAS_WIDTH;
  }

  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}
