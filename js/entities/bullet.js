import { BULLET, CANVAS_WIDTH } from '../config.js';

export class Bullet {
  constructor(x, y, options = {}) {
    this.x = x;
    this.y = y;
    this.width = options.width ?? BULLET.width;
    this.height = options.height ?? BULLET.height;
    this.damage = options.damage ?? 1;
    this.pierce = options.pierce ?? false;
    this.color = options.color ?? BULLET.color;
    this.vx = options.vx ?? 0; // horizontal drift, used by the spread weapon tier
    this.charged = options.charged ?? false; // renders as a glowing beam instead of a flat rect
    this.age = 0; // drives the charged beam's pulse
  }

  update(dt) {
    this.age += dt;
    this.x += this.vx * dt;
    this.y -= BULLET.speed * dt;
  }

  isOffscreen() {
    return this.y + this.height < 0 || this.x + this.width < 0 || this.x > CANVAS_WIDTH;
  }

  draw(ctx) {
    if (this.charged) {
      this._drawChargedBeam(ctx);
      return;
    }
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  // Layered glow (soft outer wash + solid beam + white-hot core) with a
  // gentle pulse, instead of a flat rect, so the strongest shot in the
  // game actually reads as powerful in flight, not just wider.
  _drawChargedBeam(ctx) {
    const pulse = 0.85 + 0.15 * Math.sin(this.age * 20);
    const cx = this.x + this.width / 2;

    ctx.save();
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 20 * pulse;

    ctx.globalAlpha = 0.45;
    ctx.fillStyle = this.color;
    ctx.fillRect(cx - (this.width * 1.4) / 2, this.y, this.width * 1.4, this.height);

    ctx.globalAlpha = 1;
    ctx.fillRect(this.x, this.y, this.width, this.height);

    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(cx - (this.width * 0.35) / 2, this.y, this.width * 0.35, this.height);

    ctx.restore();
  }
}
