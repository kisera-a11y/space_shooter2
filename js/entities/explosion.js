// Small particle-burst effect, reused for alien kills, the ship exploding,
// and power-up pickups — callers just pass different sizing/color options.
export class Explosion {
  constructor(x, y, options = {}) {
    this.x = x;
    this.y = y;
    this.age = 0;
    this.duration = options.duration ?? 0.35;
    this.minRadius = options.minRadius ?? 4;
    this.maxRadius = options.maxRadius ?? 22;
    this.color = options.color ?? '#ffb347';

    const particleCount = options.particleCount ?? 8;
    this.particles = Array.from({ length: particleCount }, (_, i) => {
      const angle = (Math.PI * 2 * i) / particleCount;
      return {
        dx: Math.cos(angle),
        dy: Math.sin(angle),
      };
    });
  }

  update(dt) {
    this.age += dt;
  }

  isDone() {
    return this.age >= this.duration;
  }

  draw(ctx) {
    const progress = this.age / this.duration;
    const radius = this.minRadius + progress * (this.maxRadius - this.minRadius);
    const alpha = 1 - progress;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = this.color;
    for (const p of this.particles) {
      const px = this.x + p.dx * radius;
      const py = this.y + p.dy * radius;
      ctx.beginPath();
      ctx.arc(px, py, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}
