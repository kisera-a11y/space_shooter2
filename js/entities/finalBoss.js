import { BOSS, FINAL_BOSS, XP, CANVAS_WIDTH, CANVAS_HEIGHT } from '../config.js';
import { Boss } from './boss.js';
import { EnemyBullet } from './enemyBullet.js';
import { playEnemyFireSound } from '../audio.js';

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

// The one-time capstone encounter (see FINAL_BOSS.bossNumber in config.js).
// Reuses Boss for shared plumbing (hp/health bar/invulnerable entry) but
// overrides movement and firing entirely: alongside the usual left/right
// patrol, it periodically charges down toward the player and retreats,
// and it alternates between several different attack patterns.
export class FinalBoss extends Boss {
  constructor(bossIndex) {
    super(bossIndex);

    this.width = CANVAS_WIDTH * FINAL_BOSS.widthRatio;
    this.height = CANVAS_WIDTH * FINAL_BOSS.heightRatio;
    this.x = CANVAS_WIDTH / 2 - this.width / 2;
    this.y = -this.height;

    this.shape = null; // custom draw(), not one of Boss's regular variants
    this.color = FINAL_BOSS.color;

    this.maxHp = FINAL_BOSS.hp;
    this.hp = this.maxHp;
    this.moveSpeed = FINAL_BOSS.moveSpeed;
    this.fireInterval = FINAL_BOSS.fireInterval;
    this.fireCooldown = this.fireInterval;
    this.scoreValue = FINAL_BOSS.scoreValue;
    this.xpValue = XP.finalBossValue;

    this.chargeTargetY = CANVAS_HEIGHT * FINAL_BOSS.chargeDepthRatio;
    this.chargeState = 'idle'; // idle -> charging -> holding -> retreating -> idle
    this.chargeCooldown = randomBetween(FINAL_BOSS.chargeCooldownMin, FINAL_BOSS.chargeCooldownMax);
    this.chargeHoldTimer = 0;

    this.weaponPatterns = ['straight', 'spread', 'burst'];
    this.weaponIndex = 0;
  }

  update(dt, enemyBullets) {
    if (this.state === 'entering') {
      super.update(dt, enemyBullets); // reuse the base descend-into-place logic
      return;
    }

    this.x += this.moveSpeed * this.direction * dt;
    if (this.x <= 0) {
      this.x = 0;
      this.direction = 1;
    } else if (this.x + this.width >= CANVAS_WIDTH) {
      this.x = CANVAS_WIDTH - this.width;
      this.direction = -1;
    }

    this._updateCharge(dt);

    this.fireCooldown -= dt;
    if (this.fireCooldown <= 0) {
      this._fire(enemyBullets);
      this.fireCooldown = this.fireInterval;
    }
  }

  _updateCharge(dt) {
    switch (this.chargeState) {
      case 'idle':
        this.chargeCooldown -= dt;
        if (this.chargeCooldown <= 0) {
          this.chargeState = 'charging';
        }
        break;
      case 'charging':
        this.y += FINAL_BOSS.chargeForwardSpeed * dt;
        if (this.y >= this.chargeTargetY) {
          this.y = this.chargeTargetY;
          this.chargeState = 'holding';
          this.chargeHoldTimer = FINAL_BOSS.chargeHoldDuration;
        }
        break;
      case 'holding':
        this.chargeHoldTimer -= dt;
        if (this.chargeHoldTimer <= 0) {
          this.chargeState = 'retreating';
        }
        break;
      case 'retreating':
        this.y -= FINAL_BOSS.chargeRetreatSpeed * dt;
        if (this.y <= BOSS.entryY) {
          this.y = BOSS.entryY;
          this.chargeState = 'idle';
          this.chargeCooldown = randomBetween(FINAL_BOSS.chargeCooldownMin, FINAL_BOSS.chargeCooldownMax);
        }
        break;
    }
  }

  // Cycles through straight / spread / burst shots so no two volleys feel
  // the same.
  _fire(enemyBullets) {
    const bulletX = this.centerX;
    const bulletY = this.y + this.height;
    const pattern = this.weaponPatterns[this.weaponIndex];

    if (pattern === 'spread') {
      const bulletSpeed = 220;
      const angles = [-0.45, 0, 0.45];
      for (const angle of angles) {
        enemyBullets.push(
          new EnemyBullet(bulletX, bulletY, Math.sin(angle) * bulletSpeed, Math.cos(angle) * bulletSpeed)
        );
      }
    } else if (pattern === 'burst') {
      enemyBullets.push(new EnemyBullet(bulletX - 24, bulletY));
      enemyBullets.push(new EnemyBullet(bulletX + 24, bulletY));
    } else {
      enemyBullets.push(new EnemyBullet(bulletX, bulletY));
    }

    playEnemyFireSound();
    this.weaponIndex = (this.weaponIndex + 1) % this.weaponPatterns.length;
  }

  draw(ctx) {
    const { x, y, width: w, height: h } = this;

    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.moveTo(x + w * 0.05, y + h * 0.2);
    ctx.lineTo(x + w * 0.3, y);
    ctx.lineTo(x + w * 0.7, y);
    ctx.lineTo(x + w * 0.95, y + h * 0.2);
    ctx.lineTo(x + w, y + h * 0.6);
    ctx.lineTo(x + w * 0.75, y + h);
    ctx.lineTo(x + w * 0.25, y + h);
    ctx.lineTo(x, y + h * 0.6);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = FINAL_BOSS.coreColor;
    ctx.beginPath();
    ctx.arc(x + w / 2, y + h * 0.5, w * 0.09, 0, Math.PI * 2);
    ctx.fill();

    // Three weapon pods hint at the multiple attack patterns.
    ctx.fillStyle = '#1a0510';
    for (const p of [0.2, 0.5, 0.8]) {
      ctx.beginPath();
      ctx.arc(x + w * p, y + h * 0.85, w * 0.035, 0, Math.PI * 2);
      ctx.fill();
    }

    this._drawHealthBar(ctx);
  }
}
