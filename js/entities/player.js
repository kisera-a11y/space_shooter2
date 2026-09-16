import { PLAYER, CANVAS_WIDTH, CANVAS_HEIGHT, BULLET } from '../config.js';
import { Bullet } from './bullet.js';

export class Player {
  constructor() {
    this.width = PLAYER.width;
    this.height = PLAYER.height;
    this.x = CANVAS_WIDTH / 2 - this.width / 2;
    this.y = CANVAS_HEIGHT - this.height - 20;
    this.cooldownRemaining = 0;
  }

  update(dt, input, bullets) {
    if (input.isLeft()) {
      this.x -= PLAYER.speed * dt;
    }
    if (input.isRight()) {
      this.x += PLAYER.speed * dt;
    }
    this.x = Math.max(0, Math.min(CANVAS_WIDTH - this.width, this.x));

    if (this.cooldownRemaining > 0) {
      this.cooldownRemaining -= dt;
    }

    if (input.isFiring() && this.cooldownRemaining <= 0) {
      this._fire(bullets);
      this.cooldownRemaining = PLAYER.fireCooldown;
    }
  }

  _fire(bullets) {
    const bulletX = this.x + this.width / 2 - BULLET.width / 2;
    const bulletY = this.y - BULLET.height;
    bullets.push(new Bullet(bulletX, bulletY));
  }

  get centerX() {
    return this.x + this.width / 2;
  }

  draw(ctx) {
    const x = this.x;
    const y = this.y;
    const w = this.width;
    const h = this.height;

    ctx.fillStyle = PLAYER.color;
    ctx.beginPath();
    ctx.moveTo(x + w / 2, y);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x + w * 0.7, y + h * 0.7);
    ctx.lineTo(x + w * 0.3, y + h * 0.7);
    ctx.lineTo(x, y + h);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + w / 2 - 2, y + h * 0.35, 4, 8);
  }
}
