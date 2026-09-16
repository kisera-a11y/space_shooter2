import { BOSS, BOSS_VARIANTS, XP, CANVAS_WIDTH } from '../config.js';
import { EnemyBullet } from './enemyBullet.js';
import { playEnemyFireSound } from '../audio.js';

export class Boss {
  // bossIndex: 1 for the first boss encounter, 2 for the second, etc. —
  // used to scale hp/speed/fire-rate so later bosses are tougher, and to
  // cycle through BOSS_VARIANTS so each encounter looks different.
  constructor(bossIndex) {
    this.bossIndex = bossIndex;
    this.width = CANVAS_WIDTH * BOSS.widthRatio;
    this.height = CANVAS_WIDTH * BOSS.heightRatio;
    this.x = CANVAS_WIDTH / 2 - this.width / 2;
    this.y = -this.height;

    const variant = BOSS_VARIANTS[(bossIndex - 1) % BOSS_VARIANTS.length];
    this.shape = variant.shape;
    this.color = variant.color;

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
    this.xpValue = XP.bossBaseValue + (bossIndex - 1) * XP.bossValuePerBoss;

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
    if (this.shape === 'saucer') this._drawSaucer(ctx);
    else if (this.shape === 'carrier') this._drawCarrier(ctx);
    else if (this.shape === 'spider') this._drawSpider(ctx);
    else this._drawHex(ctx);

    this._drawHealthBar(ctx);
  }

  _drawHex(ctx) {
    const { x, y, width: w, height: h } = this;

    ctx.fillStyle = this.color;
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
  }

  // Wide flattened disc with a dome and a row of rim lights.
  _drawSaucer(ctx) {
    const { x, y, width: w, height: h } = this;
    const cx = x + w / 2;
    const cy = y + h * 0.55;

    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.ellipse(cx, cy, w / 2, h * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(cx, y + h * 0.25, w * 0.22, h * 0.28, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fff8e7';
    const lightCount = 6;
    for (let i = 0; i < lightCount; i++) {
      const t = i / (lightCount - 1);
      const lx = x + w * (0.12 + t * 0.76);
      ctx.beginPath();
      ctx.arc(lx, cy + h * 0.15, w * 0.02, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Blocky central hull with two side pods and window slits.
  _drawCarrier(ctx) {
    const { x, y, width: w, height: h } = this;

    ctx.fillStyle = this.color;
    ctx.fillRect(x + w * 0.15, y, w * 0.7, h);
    ctx.fillRect(x, y + h * 0.3, w * 0.2, h * 0.4);
    ctx.fillRect(x + w * 0.8, y + h * 0.3, w * 0.2, h * 0.4);

    ctx.fillStyle = '#1a0f05';
    for (let i = 0; i < 4; i++) {
      const wx = x + w * (0.28 + i * 0.15);
      ctx.fillRect(wx, y + h * 0.35, w * 0.06, h * 0.15);
    }
  }

  // Round body with four angled legs — reads as skittering rather than a
  // conventional ship silhouette.
  _drawSpider(ctx) {
    const { x, y, width: w, height: h } = this;
    const cx = x + w / 2;
    const cy = y + h / 2;
    const bodyR = Math.min(w, h) * 0.28;

    ctx.strokeStyle = this.color;
    ctx.lineWidth = Math.max(4, w * 0.015);
    const legOffsets = [
      [-0.42, -0.35],
      [0.42, -0.35],
      [-0.42, 0.35],
      [0.42, 0.35],
    ];
    for (const [dx, dy] of legOffsets) {
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + w * dx, cy + h * dy);
      ctx.stroke();
    }

    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(cx, cy, bodyR, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#1a0510';
    ctx.beginPath();
    ctx.arc(cx, cy, bodyR * 0.4, 0, Math.PI * 2);
    ctx.fill();
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
