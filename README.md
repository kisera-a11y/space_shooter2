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
    player.js          Player ship: movement, firing, cooldown, drawing
    bullet.js           Player projectile
    alien.js             Alien: downward movement, drawing
    explosion.js          Small particle burst shown when an alien is destroyed
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
- If any alien reaches the bottom of the screen, you lose a life and the
  wave resets.
- Clearing all aliens in a wave advances you to the next wave, which
  spawns more aliens moving faster.
- The game ends when you run out of lives; press Space to restart.

## What's next

This is intentionally a minimal, playable prototype. Natural next steps
(not yet implemented) include multiple alien types, touch/mouse controls
(the input layer is already structured to support this), power-ups, and
sound effects.
