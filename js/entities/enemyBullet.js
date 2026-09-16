import { ENEMY_BULLET, CANVAS_WIDTH, CANVAS_HEIGHT } from '../config.js';

export class EnemyBullet {
  // vx/vy default to straight down at the standard speed; bosses with
  // angled attack patterns (see FinalBoss) pass their own vx/vy instead.
  constructor(x, y, vx = 0, vy = ENEMY_BULLET.speed) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.width = ENEMY_BULLET.width;
    this.height = ENEMY_BULLET.height;
    this.hit = false;
  }

  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
  }

  isOffscreen() {
    return (
      this.y > CANVAS_HEIGHT ||
      this.x + this.width < 0 ||
      this.x > CANVAS_WIDTH
    );
  }

  draw(ctx) {
    ctx.fillStyle = ENEMY_BULLET.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}
