import { CANVAS_WIDTH, CANVAS_HEIGHT, ALIEN, PLAYER, STATE } from './config.js';
import { Player } from './entities/player.js';
import { Alien } from './entities/alien.js';
import { Explosion } from './entities/explosion.js';
import { Starfield } from './starfield.js';

export class Game {
  constructor(ctx, input) {
    this.ctx = ctx;
    this.input = input;
    this.starfield = new Starfield();
    this.state = STATE.START;
    this._resetRunState();
  }

  _resetRunState() {
    this.player = new Player();
    this.bullets = [];
    this.aliens = [];
    this.explosions = [];
    this.score = 0;
    this.lives = PLAYER.startLives;
    this.wave = 1;
  }

  startGame() {
    this._resetRunState();
    this.state = STATE.PLAYING;
    this._spawnWave();
  }

  _spawnWave() {
    const count = Math.min(
      ALIEN.countBase + (this.wave - 1) * ALIEN.countPerWave,
      ALIEN.maxCount
    );
    const speed = ALIEN.baseSpeed + (this.wave - 1) * ALIEN.speedPerWave;

    const cols = Math.min(count, Math.floor(CANVAS_WIDTH / ALIEN.colSpacing));
    const startX = (CANVAS_WIDTH - cols * ALIEN.colSpacing) / 2 + ALIEN.colSpacing / 2;

    for (let i = 0; i < count; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * ALIEN.colSpacing - ALIEN.width / 2;
      const y = -ALIEN.rowSpacing * (row + 1);
      this.aliens.push(new Alien(x, y, speed));
    }
  }

  update(dt) {
    this.starfield.update(dt);

    if (this.state === STATE.START) {
      if (this.input.consumeFirePressed()) {
        this.startGame();
      }
      return;
    }

    if (this.state === STATE.GAME_OVER) {
      if (this.input.consumeFirePressed()) {
        this.startGame();
      }
      return;
    }

    this._updatePlaying(dt);
  }

  _updatePlaying(dt) {
    this.player.update(dt, this.input, this.bullets);

    for (const bullet of this.bullets) bullet.update(dt);
    this.bullets = this.bullets.filter((b) => !b.isOffscreen());

    for (const alien of this.aliens) alien.update(dt);

    for (const explosion of this.explosions) explosion.update(dt);
    this.explosions = this.explosions.filter((e) => !e.isDone());

    this._handleCollisions();

    const reachedBottom = this.aliens.some((a) => a.hasReachedBottom());
    if (reachedBottom) {
      this._loseLife();
    }

    if (this.aliens.length === 0 && this.state === STATE.PLAYING) {
      this.wave += 1;
      this._spawnWave();
    }
  }

  _handleCollisions() {
    for (const bullet of this.bullets) {
      for (const alien of this.aliens) {
        if (this._isColliding(bullet, alien)) {
          bullet.hit = true;
          alien.hit = true;
          this.score += ALIEN.scoreValue;
          this.explosions.push(
            new Explosion(alien.x + alien.width / 2, alien.y + alien.height / 2)
          );
        }
      }
    }
    this.bullets = this.bullets.filter((b) => !b.hit);
    this.aliens = this.aliens.filter((a) => !a.hit);
  }

  _isColliding(a, b) {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }

  _loseLife() {
    this.lives -= 1;
    this.aliens = [];
    this.bullets = [];

    if (this.lives <= 0) {
      this.state = STATE.GAME_OVER;
    } else {
      this._spawnWave();
    }
  }

  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    this.starfield.draw(ctx);

    if (this.state === STATE.START) {
      this._drawStartScreen();
      return;
    }

    this.player.draw(ctx);
    for (const bullet of this.bullets) bullet.draw(ctx);
    for (const alien of this.aliens) alien.draw(ctx);
    for (const explosion of this.explosions) explosion.draw(ctx);

    this._drawHud();

    if (this.state === STATE.GAME_OVER) {
      this._drawGameOverScreen();
    }
  }

  _drawHud() {
    const ctx = this.ctx;
    ctx.fillStyle = '#ffffff';
    ctx.font = '18px "Courier New", monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`Score: ${this.score}`, 16, 28);
    ctx.fillText(`Wave: ${this.wave}`, 16, 52);

    ctx.textAlign = 'right';
    ctx.fillText(`Lives: ${'▲'.repeat(Math.max(this.lives, 0))}`, CANVAS_WIDTH - 16, 28);
    ctx.textAlign = 'left';
  }

  _drawStartScreen() {
    const ctx = this.ctx;
    ctx.textAlign = 'center';

    ctx.fillStyle = '#4fd1ff';
    ctx.font = 'bold 48px "Courier New", monospace';
    ctx.fillText('STAR DEFENDER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 100);

    ctx.fillStyle = '#ffffff';
    ctx.font = '20px "Courier New", monospace';
    ctx.fillText('Move: ← → or A / D', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);
    ctx.fillText('Shoot: SPACE (hold for rapid fire)', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 12);
    ctx.fillText('Destroy aliens before they reach you!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 44);

    ctx.fillStyle = '#ffe066';
    ctx.font = 'bold 24px "Courier New", monospace';
    ctx.fillText('Press SPACE to Start', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 110);

    ctx.textAlign = 'left';
  }

  _drawGameOverScreen() {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#ff5c8a';
    ctx.font = 'bold 48px "Courier New", monospace';
    ctx.fillText('GAME OVER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 60);

    ctx.fillStyle = '#ffffff';
    ctx.font = '22px "Courier New", monospace';
    ctx.fillText(`Final Score: ${this.score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 10);
    ctx.fillText(`Wave Reached: ${this.wave}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 22);

    ctx.fillStyle = '#ffe066';
    ctx.font = 'bold 22px "Courier New", monospace';
    ctx.fillText('Press SPACE to Restart', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 80);

    ctx.textAlign = 'left';
  }
}
