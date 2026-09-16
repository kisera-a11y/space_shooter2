// Small particle-burst effect shown when an alien is destroyed.
export class Explosion {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.age = 0;
    this.duration = 0.35;
    this.particles = Array.from({ length: 8 }, (_, i) => {
      const angle = (Math.PI * 2 * i) / 8;
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
    const radius = 4 + progress * 18;
    const alpha = 1 - progress;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#ffb347';
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
