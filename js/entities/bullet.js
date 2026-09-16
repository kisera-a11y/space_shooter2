import { BULLET } from '../config.js';

export class Bullet {
  constructor(x, y, options = {}) {
    this.x = x;
    this.y = y;
    this.width = options.width ?? BULLET.width;
    this.height = BULLET.height;
    this.damage = options.damage ?? 1;
    this.pierce = options.pierce ?? false;
    this.color = options.color ?? BULLET.color;
  }

  update(dt) {
    this.y -= BULLET.speed * dt;
  }

  isOffscreen() {
    return this.y + this.height < 0;
  }

  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}
