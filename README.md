# Star Defender

A small 2D arcade-style space shooter prototype. Move your ship along the
bottom of the screen, shoot down descending aliens, and survive as long as
you can as waves get progressively harder.

## Technology

Plain **HTML5 Canvas + vanilla JavaScript (ES modules)** — no build step,
no external dependencies. This keeps the prototype easy to run (just open
a file / serve a static folder) and easy to read, while still letting
gameplay systems (input, entities, game state) live in separate modules
that can grow as features are added.

## Project structure

```
index.html          Canvas element + page shell
css/style.css        Basic arcade-style page styling
js/
  config.js          All tunable gameplay constants (speeds, sizes, difficulty)
  input.js            Keyboard input, exposed as intent methods (isLeft/isRight/isFiring)
  starfield.js         Twinkling/scrolling background stars
  game.js              Game state machine (start / playing / game over), spawning,
                        collisions, wave/difficulty progression, HUD and screens
  entities/
    player.js          Player ship: movement, firing, cooldown, respawn, drawing
    bullet.js           Player projectile (normal or charged-laser variant)
    alien.js             Alien: type-driven stats/shape, hp, downward movement
    powerup.js            Falling pickup (charged laser / extra life)
    explosion.js          Configurable particle burst (alien kill, ship loss, pickup)
  audio.js              Synthesized sound effects (Web Audio API, no asset files)
  main.js               Bootstraps the canvas, input, game loop (requestAnimationFrame)
```

## How to run

No build tools or installs are required. From the project directory, start
any static file server, for example:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000/index.html` in your browser.

(Opening `index.html` directly via `file://` also works in most browsers,
but some browsers restrict ES module loading over `file://`, so a local
server is recommended.)

## Controls

- **Move**: `←` / `→` arrow keys or `A` / `D`
- **Shoot**: `Space` (hold for repeated shots — a small cooldown keeps
  the screen from filling with bullets instantly)
- **Start / Restart**: `Space`, from the start screen or game-over screen

## Gameplay

- Destroy aliens by shooting them to score points.
- If an alien actually touches the ship, you lose a life and the wave
  resets — an alien that merely passes the bottom of the screen without
  hitting you just despawns.
- Clearing all aliens in a wave advances you to the next wave, which
  spawns more aliens moving faster.
- The game ends when you run out of lives; press Space to restart.

### Alien types

Defined in `js/config.js` (`ALIEN_TYPES`) and phased in by wave via each
type's `minWave`, so adding another type later is just a new config entry:

- **Grunt** (pink hexagon) — the baseline alien, available from wave 1.
- **Scout** (green diamond) — smaller and faster, from wave 2.
- **Brute** (purple, larger) — takes 3 hits to destroy and is worth more
  points, from wave 3. Remaining hits are shown as pips above it and it
  visibly dims as it takes damage.

### Power-ups

Destroyed aliens have a chance (`POWERUP.dropChance` in `config.js`) to
drop a falling pickup; touch it with the ship to collect:

- **Charged laser** (cyan bolt) — for a few seconds, shots are wider,
  pierce through aliens instead of stopping at the first one, and deal
  enough damage to one-shot any current alien type. The ship glows while
  it's active, and the HUD shows the time remaining.
- **Extra life** (red plus) — an immediate `+1` life.

### Losing a life

When an alien collides with the ship, it plays an explosion (particle
burst + a synthesized boom), disappears for a moment, then reappears
re-centered at the bottom before play continues.

### Sound

All sound is synthesized with the Web Audio API (`js/audio.js`) — no
audio asset files. A quiet ambient drone plays while a run is active
(starts on Space to begin, stops on game over), alongside the laser-fire
and explosion sound effects.

## What's next

This is intentionally a minimal, playable prototype. Natural next steps
(not yet implemented) include touch-drag movement and more alien
behaviors (e.g. side-to-side movement or shooting back).
