import { PLAYER, CANVAS_WIDTH, CANVAS_HEIGHT, BULLET } from '../config.js';
import { Bullet } from './bullet.js';
import { playFireSound } from '../audio.js';

export class Player {
  constructor() {
    this.width = PLAYER.width;
    this.height = PLAYER.height;
    this.x = CANVAS_WIDTH / 2 - this.width / 2;
    this.y = CANVAS_HEIGHT - this.height - 20;
    this.cooldownRemaining = 0;
    this.chargedLaserTimeRemaining = 0;
    this.respawnTimer = 0;
  }

  update(dt, input, bullets) {
    if (this.respawnTimer > 0) {
      this.respawnTimer = Math.max(0, this.respawnTimer - dt);
      return;
    }

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

    if (this.chargedLaserTimeRemaining > 0) {
      this.chargedLaserTimeRemaining = Math.max(0, this.chargedLaserTimeRemaining - dt);
    }

    if (input.isFiring() && this.cooldownRemaining <= 0) {
      this._fire(bullets);
      this.cooldownRemaining = PLAYER.fireCooldown;
    }
  }

  activateChargedLaser(duration) {
    this.chargedLaserTimeRemaining = duration;
  }

  // Recenters the ship and hides/disables it briefly, called after the
  // explosion effect plays for losing a life.
  respawn() {
    this.x = CANVAS_WIDTH / 2 - this.width / 2;
    this.respawnTimer = PLAYER.respawnDelay;
  }

  _fire(bullets) {
    const charged = this.chargedLaserTimeRemaining > 0;
    const width = charged ? BULLET.chargedWidth : BULLET.width;
    const bulletX = this.x + this.width / 2 - width / 2;
    const bulletY = this.y - BULLET.height;

    bullets.push(
      new Bullet(bulletX, bulletY, {
        width,
        damage: charged ? BULLET.chargedDamage : 1,
        pierce: charged,
        color: charged ? BULLET.chargedColor : BULLET.color,
      })
    );
    playFireSound(charged);
  }

  get centerX() {
    return this.x + this.width / 2;
  }

  get centerY() {
    return this.y + this.height / 2;
  }

  draw(ctx) {
    if (this.respawnTimer > 0) return;

    const x = this.x;
    const y = this.y;
    const w = this.width;
    const h = this.height;

    ctx.save();
    if (this.chargedLaserTimeRemaining > 0) {
      ctx.shadowColor = '#8be9ff';
      ctx.shadowBlur = 16;
    }
    ctx.fillStyle = PLAYER.color;
    ctx.beginPath();
    ctx.moveTo(x + w / 2, y);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x + w * 0.7, y + h * 0.7);
    ctx.lineTo(x + w * 0.3, y + h * 0.7);
    ctx.lineTo(x, y + h);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + w / 2 - 2, y + h * 0.35, 4, 8);
  }
}
