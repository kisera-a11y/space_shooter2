import { BULLET } from '../config.js';

export class Bullet {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = BULLET.width;
    this.height = BULLET.height;
  }

  update(dt) {
    this.y -= BULLET.speed * dt;
  }

  isOffscreen() {
    return this.y + this.height < 0;
  }

  draw(ctx) {
    ctx.fillStyle = BULLET.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}
