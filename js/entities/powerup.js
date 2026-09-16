import { POWERUP, CANVAS_HEIGHT } from '../config.js';

export class PowerUp {
  constructor(centerX, centerY, type) {
    this.type = type;
    this.width = POWERUP.width;
    this.height = POWERUP.height;
    this.x = centerX - this.width / 2;
    this.y = centerY - this.height / 2;
    this.collected = false;
  }

  update(dt) {
    this.y += POWERUP.fallSpeed * dt;
  }

  isOffscreen() {
    return this.y > CANVAS_HEIGHT;
  }

  draw(ctx) {
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;
    const r = this.width / 2;

    ctx.fillStyle = POWERUP.types[this.type].color;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#0a0a12';
    if (this.type === 'life') {
      ctx.fillRect(cx - r * 0.6, cy - r * 0.15, r * 1.2, r * 0.3);
      ctx.fillRect(cx - r * 0.15, cy - r * 0.6, r * 0.3, r * 1.2);
    } else if (this.type === 'shield') {
      // A small shield badge — a rounded-top pentagon.
      ctx.beginPath();
      ctx.moveTo(cx, cy - r * 0.65);
      ctx.lineTo(cx + r * 0.55, cy - r * 0.3);
      ctx.lineTo(cx + r * 0.4, cy + r * 0.55);
      ctx.lineTo(cx - r * 0.4, cy + r * 0.55);
      ctx.lineTo(cx - r * 0.55, cy - r * 0.3);
      ctx.closePath();
      ctx.fill();
    } else {
      // Lightning bolt for the charged-laser pickup.
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.15, cy - r * 0.6);
      ctx.lineTo(cx + r * 0.25, cy - r * 0.05);
      ctx.lineTo(cx - r * 0.05, cy - r * 0.05);
      ctx.lineTo(cx + r * 0.15, cy + r * 0.6);
      ctx.lineTo(cx - r * 0.25, cy + r * 0.05);
      ctx.lineTo(cx + r * 0.05, cy + r * 0.05);
      ctx.closePath();
      ctx.fill();
    }
  }
}
