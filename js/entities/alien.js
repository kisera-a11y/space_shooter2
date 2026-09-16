import { ALIEN_TYPES, CANVAS_WIDTH, CANVAS_HEIGHT } from '../config.js';

export class Alien {
  constructor(x, y, speed, typeKey) {
    const type = ALIEN_TYPES[typeKey];
    this.typeKey = typeKey;
    this.x = x;
    this.baseX = x; // sway oscillates around the spawn x, not the current one
    this.y = y;
    this.width = type.width;
    this.height = type.height;
    this.color = type.color;
    this.speed = speed * type.speedMultiplier;
    this.maxHp = type.hp;
    this.hp = type.hp;
    this.scoreValue = type.scoreValue;
    this.xpValue = type.xpValue;
    this.destroyed = false;

    this.age = 0; // seconds alive, drives both movement and limb/wing animation
    this.movement = type.movement || 'straight';
    this.swayAmplitude = type.swayAmplitude || 0;
    this.swayFrequency = type.swayFrequency || 0;
    // Drifters start heading either way so a wave of them doesn't all
    // bounce off the walls in lockstep.
    this.driftVx = type.driftSpeed ? type.driftSpeed * (Math.random() < 0.5 ? -1 : 1) : 0;
  }

  update(dt) {
    this.age += dt;
    this.y += this.speed * dt;

    if (this.movement === 'sway') {
      const sway = Math.sin(this.age * this.swayFrequency) * this.swayAmplitude;
      this.x = Math.max(0, Math.min(CANVAS_WIDTH - this.width, this.baseX + sway));
    } else if (this.movement === 'drift') {
      this.x += this.driftVx * dt;
      if (this.x <= 0) {
        this.x = 0;
        this.driftVx = Math.abs(this.driftVx);
      } else if (this.x >= CANVAS_WIDTH - this.width) {
        this.x = CANVAS_WIDTH - this.width;
        this.driftVx = -Math.abs(this.driftVx);
      }
    }
  }

  hasReachedBottom() {
    return this.y + this.height >= CANVAS_HEIGHT;
  }

  // Returns true if this hit destroyed the alien.
  takeHit(damage = 1) {
    this.hp -= damage;
    if (this.hp <= 0) {
      this.destroyed = true;
      return true;
    }
    return false;
  }

  draw(ctx) {
    // Fades as it takes damage so multi-hit aliens visibly weaken.
    const damageAlpha = 0.55 + 0.45 * (this.hp / this.maxHp);

    ctx.save();
    ctx.globalAlpha = damageAlpha;

    if (this.typeKey === 'scout') {
      this._drawScout(ctx);
    } else if (this.typeKey === 'brute') {
      this._drawBrute(ctx);
    } else if (this.typeKey === 'weaver') {
      this._drawWeaver(ctx);
    } else if (this.typeKey === 'stalker') {
      this._drawStalker(ctx);
    } else {
      this._drawGrunt(ctx);
    }

    ctx.restore();
  }

  _drawGrunt(ctx) {
    const { x, y, width: w, height: h } = this;

    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.moveTo(x, y + h * 0.4);
    ctx.lineTo(x + w * 0.25, y);
    ctx.lineTo(x + w * 0.75, y);
    ctx.lineTo(x + w, y + h * 0.4);
    ctx.lineTo(x + w * 0.85, y + h);
    ctx.lineTo(x + w * 0.15, y + h);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#1a0b12';
    ctx.fillRect(x + w * 0.3, y + h * 0.35, w * 0.15, h * 0.2);
    ctx.fillRect(x + w * 0.55, y + h * 0.35, w * 0.15, h * 0.2);
  }

  // Small, sleek diamond — reads as quick even standing still.
  _drawScout(ctx) {
    const { x, y, width: w, height: h } = this;

    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.moveTo(x + w / 2, y);
    ctx.lineTo(x + w, y + h / 2);
    ctx.lineTo(x + w / 2, y + h);
    ctx.lineTo(x, y + h / 2);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#0b1a12';
    ctx.fillRect(x + w * 0.42, y + h * 0.38, w * 0.16, h * 0.24);
  }

  // Wider armored hull with visible hit-point pips along the top.
  _drawBrute(ctx) {
    const { x, y, width: w, height: h } = this;

    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.moveTo(x, y + h * 0.3);
    ctx.lineTo(x + w * 0.2, y);
    ctx.lineTo(x + w * 0.8, y);
    ctx.lineTo(x + w, y + h * 0.3);
    ctx.lineTo(x + w, y + h * 0.8);
    ctx.lineTo(x + w * 0.8, y + h);
    ctx.lineTo(x + w * 0.2, y + h);
    ctx.lineTo(x, y + h * 0.8);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#1a0b2a';
    ctx.fillRect(x + w * 0.22, y + h * 0.4, w * 0.14, h * 0.2);
    ctx.fillRect(x + w * 0.64, y + h * 0.4, w * 0.14, h * 0.2);

    const pipWidth = 6;
    const pipGap = 4;
    for (let i = 0; i < this.maxHp; i++) {
      ctx.fillStyle = i < this.hp ? '#ffffff' : 'rgba(255, 255, 255, 0.25)';
      ctx.fillRect(x + i * (pipWidth + pipGap), y - 8, pipWidth, 4);
    }
  }

  // Moth-like: a slim body with two wings hinged near it that flap in
  // sync, driven by `age` rather than any fixed animation frames.
  _drawWeaver(ctx) {
    const { x, y, width: w, height: h, age } = this;
    const cx = x + w / 2;
    const cy = y + h / 2;
    const flap = Math.sin(age * 11) * 0.55;

    ctx.fillStyle = this.color;
    this._drawWeaverWing(ctx, cx, cy, -1, flap);
    this._drawWeaverWing(ctx, cx, cy, 1, flap);

    ctx.beginPath();
    ctx.ellipse(cx, cy, w * 0.16, h * 0.42, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#2a1400';
    ctx.beginPath();
    ctx.arc(cx, y + h * 0.26, w * 0.07, 0, Math.PI * 2);
    ctx.fill();
  }

  _drawWeaverWing(ctx, cx, cy, side, flap) {
    const { width: w, height: h } = this;
    const pivotX = cx + side * w * 0.1;

    ctx.save();
    ctx.translate(pivotX, cy);
    ctx.rotate(flap * side);
    ctx.beginPath();
    ctx.moveTo(0, -h * 0.05);
    ctx.lineTo(side * w * 0.55, -h * 0.38);
    ctx.lineTo(side * w * 0.6, h * 0.12);
    ctx.lineTo(0, h * 0.1);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // Spider-legged: three pairs of legs swing out of phase with each
  // other as it drifts sideways, instead of a static silhouette sliding
  // across the screen.
  _drawStalker(ctx) {
    const { x, y, width: w, height: h, age } = this;
    const cx = x + w / 2;
    const cy = y + h / 2;

    ctx.strokeStyle = this.color;
    ctx.lineWidth = 2.5;
    for (let i = 0; i < 3; i++) {
      const swing = Math.sin(age * 6 + i * ((Math.PI * 2) / 3)) * 0.4;
      this._drawStalkerLeg(ctx, cx, cy, -1, i, swing);
      this._drawStalkerLeg(ctx, cx, cy, 1, i, -swing);
    }

    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.ellipse(cx, cy, w * 0.28, h * 0.32, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx - w * 0.1, cy - h * 0.05, 2.5, 0, Math.PI * 2);
    ctx.arc(cx + w * 0.1, cy - h * 0.05, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  _drawStalkerLeg(ctx, cx, cy, side, index, swing) {
    const { width: w, height: h } = this;
    const rootX = cx + side * w * 0.22;
    const rootY = cy - h * 0.15 + index * (h * 0.18);

    ctx.save();
    ctx.translate(rootX, rootY);
    ctx.rotate(swing);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(side * w * 0.32, h * 0.18);
    ctx.stroke();
    ctx.restore();
  }
}
