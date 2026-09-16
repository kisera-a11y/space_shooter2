import { METEOR, CANVAS_HEIGHT } from '../config.js';

const VERTEX_COUNT = 8;

export class Meteor {
  constructor(x, y, size, speed) {
    this.x = x;
    this.y = y;
    this.width = size;
    this.height = size;
    this.speed = speed;

    this.rotation = Math.random() * Math.PI * 2;
    // Random direction (+/-) and magnitude, so no two rocks spin alike.
    this.rotationSpeed = (Math.random() * 2 - 1) * METEOR.maxRotationSpeed;

    // Jagged silhouette generated once so it stays consistent frame to
    // frame while still being unique per rock.
    this.vertices = Array.from({ length: VERTEX_COUNT }, (_, i) => {
      const angle = (Math.PI * 2 * i) / VERTEX_COUNT;
      const radius = (size / 2) * (0.7 + Math.random() * 0.3);
      return { angle, radius };
    });
  }

  update(dt) {
    this.y += this.speed * dt;
    this.rotation += this.rotationSpeed * dt;
  }

  hasReachedBottom() {
    return this.y > CANVAS_HEIGHT;
  }

  draw(ctx) {
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(this.rotation);

    ctx.fillStyle = METEOR.color;
    ctx.strokeStyle = '#3f3830';
    ctx.lineWidth = 2;
    ctx.beginPath();
    this.vertices.forEach((v, i) => {
      const px = Math.cos(v.angle) * v.radius;
      const py = Math.sin(v.angle) * v.radius;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }
}
