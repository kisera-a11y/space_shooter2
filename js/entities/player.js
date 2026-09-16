import { PLAYER, CANVAS_WIDTH, CANVAS_HEIGHT, BULLET, XP, WEAPON_LEVELS, POWERUP, ACE_SHIP } from '../config.js';
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

    this.shieldCharges = 0;
    this.invulnerableTimer = 0; // brief immunity right after a shield absorbs a hit

    this.isAce = false; // permanent reward for defeating the final boss
    this.shieldRegenTimer = 0;
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
    if (this.invulnerableTimer > 0) {
      this.invulnerableTimer = Math.max(0, this.invulnerableTimer - dt);
    }

    if (this.isAce) {
      this.shieldRegenTimer -= dt;
      if (this.shieldRegenTimer <= 0) {
        this.activateShield(1);
        this.shieldRegenTimer = ACE_SHIP.shieldRegenInterval;
      }
    }

    if (this.respawnTimer > 0) {
      this.respawnTimer = Math.max(0, this.respawnTimer - dt);
      return;
    }

    const speed = this.isAce ? PLAYER.speed * ACE_SHIP.speedMultiplier : PLAYER.speed;
    if (input.isLeft()) {
      this.x -= speed * dt;
    }
    if (input.isRight()) {
      this.x += speed * dt;
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

  // Stacks up to the shield power-up's maxCharges rather than each pickup
  // overwriting the last.
  activateShield(charges) {
    const max = POWERUP.types.shield.maxCharges;
    this.shieldCharges = Math.min(max, this.shieldCharges + charges);
  }

  hasShield() {
    return this.shieldCharges > 0;
  }

  // Consumes one charge and grants a brief window of immunity so the same
  // still-overlapping hazard can't drain every charge in consecutive
  // frames. Called by Game._absorbHitWithShield().
  consumeShieldCharge() {
    this.shieldCharges = Math.max(0, this.shieldCharges - 1);
    this.invulnerableTimer = PLAYER.shieldHitInvulnerability;
  }

  // Permanent reward for defeating the final boss (see FINAL_BOSS/ACE_SHIP
  // in config.js) — a new look, a speed boost, and slow passive shield
  // regeneration for the rest of the run.
  promoteToAce() {
    this.isAce = true;
    this.shieldRegenTimer = ACE_SHIP.shieldRegenInterval;
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

    if (this.shieldCharges > 0) {
      this._drawShield(ctx);
    }

    ctx.save();
    if (this.chargedLaserTimeRemaining > 0) {
      ctx.shadowColor = '#8be9ff';
      ctx.shadowBlur = 16;
    }

    if (this.isAce) {
      this._drawAceShip(ctx);
    } else {
      this._drawStandardShip(ctx);
    }
    ctx.restore();
  }

  _drawStandardShip(ctx) {
    const { x, y, width: w, height: h } = this;

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

  // Sleeker twin-engine hull with a gold trim stripe — the permanent
  // reward for defeating the final boss (see promoteToAce()), visually
  // distinct from the standard ship rather than just a recolor.
  _drawAceShip(ctx) {
    const { x, y, width: w, height: h } = this;

    ctx.fillStyle = PLAYER.color;
    ctx.beginPath();
    ctx.moveTo(x + w / 2, y - h * 0.1);
    ctx.lineTo(x + w * 0.85, y + h * 0.55);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x + w * 0.65, y + h * 0.75);
    ctx.lineTo(x + w * 0.35, y + h * 0.75);
    ctx.lineTo(x, y + h);
    ctx.lineTo(x + w * 0.15, y + h * 0.55);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#ffd23f';
    ctx.fillRect(x + w * 0.2, y + h * 0.62, w * 0.6, h * 0.08);

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + w / 2 - 2, y + h * 0.15, 4, 10);

    ctx.fillStyle = '#8be9ff';
    ctx.beginPath();
    ctx.arc(x + w * 0.15, y + h * 0.85, 3, 0, Math.PI * 2);
    ctx.arc(x + w * 0.85, y + h * 0.85, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  // A translucent ring around the ship with one small marker per
  // remaining charge, so how many hits are left is visible at a glance.
  _drawShield(ctx) {
    const cx = this.centerX;
    const cy = this.centerY;
    const r = Math.max(this.width, this.height) * 0.72;
    const color = POWERUP.types.shield.color;

    ctx.save();
    ctx.globalAlpha = 0.55;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = color;
    for (let i = 0; i < this.shieldCharges; i++) {
      const angle = -Math.PI / 2 + (i - (this.shieldCharges - 1) / 2) * 0.5;
      const px = cx + Math.cos(angle) * r;
      const py = cy + Math.sin(angle) * r;
      ctx.beginPath();
      ctx.arc(px, py, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
