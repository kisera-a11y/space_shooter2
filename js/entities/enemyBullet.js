import { ENEMY_BULLET, CANVAS_HEIGHT } from '../config.js';

export class EnemyBullet {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = ENEMY_BULLET.width;
    this.height = ENEMY_BULLET.height;
    this.hit = false;
  }

  update(dt) {
    this.y += ENEMY_BULLET.speed * dt;
  }

  isOffscreen() {
    return this.y > CANVAS_HEIGHT;
  }

  draw(ctx) {
    ctx.fillStyle = ENEMY_BULLET.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}
