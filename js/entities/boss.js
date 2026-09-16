import { BOSS, CANVAS_WIDTH } from '../config.js';
import { EnemyBullet } from './enemyBullet.js';
import { playEnemyFireSound } from '../audio.js';

export class Boss {
  // bossIndex: 1 for the first boss encounter, 2 for the second, etc. —
  // used to scale hp/speed/fire-rate so later bosses are tougher.
  constructor(bossIndex) {
    this.bossIndex = bossIndex;
    this.width = CANVAS_WIDTH * BOSS.widthRatio;
    this.height = CANVAS_WIDTH * BOSS.heightRatio;
    this.x = CANVAS_WIDTH / 2 - this.width / 2;
    this.y = -this.height;

    this.maxHp = BOSS.baseHp + (bossIndex - 1) * BOSS.hpPerBoss;
    this.hp = this.maxHp;
    this.destroyed = false;

    this.moveSpeed = BOSS.baseMoveSpeed + (bossIndex - 1) * BOSS.moveSpeedPerBoss;
    this.direction = 1;

    this.fireInterval = Math.max(
      BOSS.minFireInterval,
      BOSS.baseFireInterval - (bossIndex - 1) * BOSS.fireIntervalStepDown
    );
    this.fireCooldown = this.fireInterval;

    this.scoreValue = BOSS.baseScoreValue + (bossIndex - 1) * BOSS.scorePerBoss;

    // Descends into place, invulnerable, before patrolling/firing begins.
    this.state = 'entering';
  }

  get centerX() {
    return this.x + this.width / 2;
  }

  get centerY() {
    return this.y + this.height / 2;
  }

  update(dt, enemyBullets) {
    if (this.state === 'entering') {
      this.y += BOSS.entrySpeed * dt;
      if (this.y >= BOSS.entryY) {
        this.y = BOSS.entryY;
        this.state = 'active';
      }
      return;
    }

    // Patrols left/right across the top of the screen — never descends
    // toward the player.
    this.x += this.moveSpeed * this.direction * dt;
    if (this.x <= 0) {
      this.x = 0;
      this.direction = 1;
    } else if (this.x + this.width >= CANVAS_WIDTH) {
      this.x = CANVAS_WIDTH - this.width;
      this.direction = -1;
    }

    this.fireCooldown -= dt;
    if (this.fireCooldown <= 0) {
      this._fire(enemyBullets);
      this.fireCooldown = this.fireInterval;
    }
  }

  _fire(enemyBullets) {
    const bulletX = this.centerX;
    const bulletY = this.y + this.height;
    enemyBullets.push(new EnemyBullet(bulletX, bulletY));
    playEnemyFireSound();
  }

  // Invulnerable while still entering. Returns true if this hit destroyed it.
  takeHit(damage = 1) {
    if (this.state !== 'active') return false;
    this.hp -= damage;
    if (this.hp <= 0) {
      this.hp = 0;
      this.destroyed = true;
      return true;
    }
    return false;
  }

  draw(ctx) {
    const { x, y, width: w, height: h } = this;

    ctx.fillStyle = BOSS.color;
    ctx.beginPath();
    ctx.moveTo(x + w * 0.1, y);
    ctx.lineTo(x + w * 0.9, y);
    ctx.lineTo(x + w, y + h * 0.4);
    ctx.lineTo(x + w * 0.85, y + h);
    ctx.lineTo(x + w * 0.15, y + h);
    ctx.lineTo(x, y + h * 0.4);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#1a0510';
    const eyeCount = 5;
    for (let i = 0; i < eyeCount; i++) {
      const ex = x + w * (0.15 + i * 0.175);
      ctx.beginPath();
      ctx.arc(ex, y + h * 0.5, w * 0.035, 0, Math.PI * 2);
      ctx.fill();
    }

    this._drawHealthBar(ctx);
  }

  _drawHealthBar(ctx) {
    const barWidth = this.width;
    const barHeight = 10;
    const barX = this.x;
    const barY = this.y - barHeight - 10;
    const hpRatio = Math.max(this.hp, 0) / this.maxHp;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.fillRect(barX, barY, barWidth, barHeight);

    ctx.fillStyle = hpRatio > 0.5 ? '#7cfc9a' : hpRatio > 0.25 ? '#ffe066' : '#ff5c8a';
    ctx.fillRect(barX, barY, barWidth * hpRatio, barHeight);

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(barX, barY, barWidth, barHeight);
  }
}
