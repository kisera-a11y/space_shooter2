import { PLAYER, CANVAS_WIDTH, CANVAS_HEIGHT, BULLET, XP, WEAPON_LEVELS } from '../config.js';
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
    this.level = 1;
    this.xp = 0;
  }

  get weapon() {
    return WEAPON_LEVELS[this.level - 1];
  }

  // Returns true if this xp gain pushed the player up one or more levels
  // (capped at WEAPON_LEVELS.length — there's no weapon beyond the last tier).
  addXp(amount) {
    this.xp += amount;
    let leveledUp = false;
    while (this.level < XP.levelThresholds.length && this.xp >= XP.levelThresholds[this.level]) {
      this.level += 1;
      leveledUp = true;
    }
    return leveledUp;
  }

  // Losing a life costs the player their most recent weapon upgrade —
  // dropped a level and reset to that level's xp floor, so they have to
  // earn it back rather than just keeping partial progress toward it.
  // Returns true if a demotion actually happened (false at level 1).
  loseLevel() {
    if (this.level <= 1) return false;
    this.level -= 1;
    this.xp = XP.levelThresholds[this.level - 1];
    return true;
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
      this.cooldownRemaining = this.weapon.cooldown;
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
    const bulletY = this.y - BULLET.height;

    // The charged-laser power-up overrides the weapon tier entirely while
    // it's active — a single wide, piercing shot regardless of level.
    if (this.chargedLaserTimeRemaining > 0) {
      const bulletX = this.x + this.width / 2 - BULLET.chargedWidth / 2;
      bullets.push(
        new Bullet(bulletX, bulletY, {
          width: BULLET.chargedWidth,
          damage: BULLET.chargedDamage,
          pierce: true,
          color: BULLET.chargedColor,
        })
      );
      playFireSound(true);
      return;
    }

    const { bulletCount, spreadAngle } = this.weapon;
    const parallelSpacing = 10; // px between barrels when firing straight up

    for (let i = 0; i < bulletCount; i++) {
      const mid = (bulletCount - 1) / 2;
      let vx = 0;
      let bulletX = this.x + this.width / 2 - BULLET.width / 2;

      if (spreadAngle > 0) {
        vx = Math.sin((i - mid) * spreadAngle) * BULLET.speed;
      } else {
        bulletX += (i - mid) * parallelSpacing;
      }

      bullets.push(new Bullet(bulletX, bulletY, { vx }));
    }
    playFireSound(false);
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
