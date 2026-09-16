import { CANVAS_WIDTH, CANVAS_HEIGHT, ALIEN, ALIEN_TYPES, PLAYER, POWERUP, STATE } from './config.js';
import { Player } from './entities/player.js';
import { Alien } from './entities/alien.js';
import { Explosion } from './entities/explosion.js';
import { PowerUp } from './entities/powerup.js';
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
    this.powerups = [];
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
      const typeKey = this._pickAlienType();
      const width = ALIEN_TYPES[typeKey].width;
      const x = startX + col * ALIEN.colSpacing - width / 2;
      const y = -ALIEN.rowSpacing * (row + 1);
      this.aliens.push(new Alien(x, y, speed, typeKey));
    }
  }

  // Picks uniformly among alien types unlocked for the current wave
  // (see minWave in ALIEN_TYPES), so tougher types phase in automatically.
  _pickAlienType() {
    const available = Object.keys(ALIEN_TYPES).filter(
      (key) => this.wave >= ALIEN_TYPES[key].minWave
    );
    return available[Math.floor(Math.random() * available.length)];
  }

  // Weighted pick across POWERUP.types (see config.js) — laser is common,
  // extra life is rarer.
  _pickPowerUpType() {
    const entries = Object.entries(POWERUP.types);
    const totalWeight = entries.reduce((sum, [, type]) => sum + type.weight, 0);
    let roll = Math.random() * totalWeight;
    for (const [key, type] of entries) {
      if (roll < type.weight) return key;
      roll -= type.weight;
    }
    return entries[0][0];
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

    for (const powerup of this.powerups) powerup.update(dt);

    for (const explosion of this.explosions) explosion.update(dt);
    this.explosions = this.explosions.filter((e) => !e.isDone());

    this._handleCollisions();

    // Ship is hidden/inactive while its destruction plays out, so it
    // can't collect anything during that window.
    if (this.player.respawnTimer <= 0) {
      this._handlePowerupCollisions();
    }
    this.powerups = this.powerups.filter((p) => !p.collected && !p.isOffscreen());

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
      if (bullet.hit) continue;
      for (const alien of this.aliens) {
        if (alien.destroyed) continue;
        if (this._isColliding(bullet, alien)) {
          if (!bullet.pierce) bullet.hit = true;
          if (alien.takeHit(bullet.damage)) {
            this.score += alien.scoreValue;
            const cx = alien.x + alien.width / 2;
            const cy = alien.y + alien.height / 2;
            this.explosions.push(new Explosion(cx, cy));
            if (Math.random() < POWERUP.dropChance) {
              this.powerups.push(new PowerUp(cx, cy, this._pickPowerUpType()));
            }
          }
          if (!bullet.pierce) break; // a normal bullet can only hit one alien
        }
      }
    }
    this.bullets = this.bullets.filter((b) => !b.hit);
    this.aliens = this.aliens.filter((a) => !a.destroyed);
  }

  _handlePowerupCollisions() {
    for (const powerup of this.powerups) {
      if (powerup.collected) continue;
      if (this._isColliding(this.player, powerup)) {
        powerup.collected = true;
        this._applyPowerUp(powerup);
      }
    }
  }

  _applyPowerUp(powerup) {
    if (powerup.type === 'life') {
      this.lives += 1;
    } else if (powerup.type === 'laser') {
      this.player.activateChargedLaser(POWERUP.types.laser.duration);
    }

    this.explosions.push(
      new Explosion(powerup.x + powerup.width / 2, powerup.y + powerup.height / 2, {
        duration: 0.25,
        maxRadius: 14,
        particleCount: 6,
        color: POWERUP.types[powerup.type].color,
      })
    );
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
    this.powerups = [];

    this.explosions.push(
      new Explosion(this.player.centerX, this.player.centerY, {
        duration: 0.6,
        minRadius: 6,
        maxRadius: 40,
        particleCount: 14,
        color: '#4fd1ff',
      })
    );

    if (this.lives <= 0) {
      this.state = STATE.GAME_OVER;
    } else {
      this.player.respawn();
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
    for (const powerup of this.powerups) powerup.draw(ctx);
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

    if (this.player.chargedLaserTimeRemaining > 0) {
      ctx.fillStyle = '#8be9ff';
      ctx.fillText(`Laser: ${this.player.chargedLaserTimeRemaining.toFixed(1)}s`, 16, 76);
    }

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
    ctx.fillText('Move: ← → / A / D / on-screen buttons', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);
    ctx.fillText('Shoot: SPACE or ● (hold for rapid fire)', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 12);
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
