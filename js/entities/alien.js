import { ALIEN_TYPES, CANVAS_HEIGHT } from '../config.js';

export class Alien {
  constructor(x, y, speed, typeKey) {
    const type = ALIEN_TYPES[typeKey];
    this.typeKey = typeKey;
    this.x = x;
    this.y = y;
    this.width = type.width;
    this.height = type.height;
    this.color = type.color;
    this.speed = speed * type.speedMultiplier;
    this.maxHp = type.hp;
    this.hp = type.hp;
    this.scoreValue = type.scoreValue;
    this.destroyed = false;
  }

  update(dt) {
    this.y += this.speed * dt;
  }

  hasReachedBottom() {
    return this.y + this.height >= CANVAS_HEIGHT;
  }

  // Returns true if this hit destroyed the alien.
  takeHit() {
    this.hp -= 1;
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
}
