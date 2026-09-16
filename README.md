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
    player.js          Player ship: movement, firing (weapon-tier-driven), XP/level,
                       cooldown, respawn, drawing
    bullet.js           Player projectile (normal, parallel/spread, or charged-laser)
    alien.js             Alien: type-driven stats/shape, hp, downward movement
    meteor.js             Unkillable tumbling rock — a pure dodge hazard
    boss.js               Large boss: entry, left/right patrol, firing, hp/health bar,
                          four visually distinct variants
    finalBoss.js            One-time capstone boss: extends Boss with a forward/back
                          charge attack and multiple weapon patterns
    enemyBullet.js         Boss projectile aimed down at the player (straight or angled)
    powerup.js            Falling pickup (charged laser / extra life)
    explosion.js          Configurable particle burst (alien kill, ship loss, pickup)
  audio.js              Synthesized sound effects + 8-bit chiptune loop (Web Audio
                        API, no asset files)
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

- Destroy aliens by shooting them to score points and XP.
- Aliens for a regular wave trickle in one at a time at random x
  positions and random intervals — not a synchronized grid — so it reads
  more like flying through a stream of oncoming ships than clearing a
  fixed formation.
- If an alien actually touches the ship, you lose a life and the wave
  resets — an alien that merely passes the bottom of the screen without
  hitting you just despawns with no penalty.
- A wave is "cleared" once its full budget of aliens has been spawned and
  none remain on screen (killed or passed through), advancing you to the
  next wave, which spawns more aliens moving faster.
- The game ends when you run out of lives; press Space to restart.

### Alien types

Defined in `js/config.js` (`ALIEN_TYPES`) and phased in by wave via each
type's `minWave`, so adding another type later is just a new config entry:

- **Grunt** (pink hexagon) — the baseline alien, available from wave 1.
- **Scout** (green diamond) — smaller and faster, from wave 2.
- **Brute** (purple, larger) — takes 3 hits to destroy and is worth more
  points, from wave 3. Remaining hits are shown as pips above it and it
  visibly dims as it takes damage.

### Meteors

Alongside aliens, unkillable rocks (`js/entities/meteor.js`) tumble down
with a random rotation speed/direction and irregular jagged silhouette —
pure obstacles, not enemies. Bullets (even the piercing charged laser)
are absorbed on contact but do nothing to them; touching the ship costs
a life just like an alien would. They spawn continuously throughout both
regular and boss waves on their own independent timer (`METEOR` in
`config.js`), reinforcing the "dodge hazards while shooting enemies" feel
rather than being tied to a wave's kill count.

### Power-ups

Destroyed aliens have a chance (`POWERUP.dropChance` in `config.js`) to
drop a falling pickup; touch it with the ship to collect:

- **Charged laser** (cyan bolt) — for a few seconds, shots are wider,
  pierce through aliens instead of stopping at the first one, and deal
  enough damage to one-shot any current alien type. The ship glows while
  it's active, and the HUD shows the time remaining.
- **Extra life** (red plus) — an immediate `+1` life.

### Losing a life

When an alien (or a boss's shot) hits the ship, it plays an explosion
(particle burst + a synthesized boom), disappears for a moment, then
reappears re-centered at the bottom before play continues.

### Wave transitions

At the start of every wave (regular or boss), aliens/the boss hold in
place for a second (`WAVE_TRANSITION.holdDuration`) instead of
immediately being in motion, and a "WAVE n" label flashes at the center
of the screen for about half a second (`WAVE_TRANSITION.labelDuration`).
The player can still move and shoot during the hold.

### Boss fights

Every `BOSS.everyNWaves` waves (3 by default), the regular wave is
replaced by a single large boss — about a third of the screen wide —
instead of normal aliens:

- It descends into place, then patrols left/right along the top of the
  screen; it never advances toward the player like regular aliens do.
- It periodically fires a bullet straight down at the player.
- Its remaining hp is shown as a health bar above it (green → yellow →
  red as it takes damage). They're a real fight — `BOSS.baseHp`/`hpPerBoss`
  make even the first one take sustained, accurate fire to bring down.
- Each successive boss (the 2nd, 3rd, ...) has more hp, moves faster,
  and fires more often, via `BOSS.hpPerBoss` / `moveSpeedPerBoss` /
  `fireIntervalStepDown` in `config.js`.
- Losing a life mid-fight doesn't reset the boss's hp — only a regular
  wave respawns a fresh set of aliens after you die.
- Each encounter cycles through a different look (`BOSS_VARIANTS` in
  `config.js`): a hex-shaped ship, a saucer, a blocky carrier, and a
  spider-legged variant, repeating from there.

### Final boss

The 5th boss encounter (wave 15 by default, `FINAL_BOSS.bossNumber`) is
a unique, tougher capstone fight instead of the regular rotation:

- Alongside its left/right patrol, it periodically charges down toward
  the player, holds briefly, then retreats back up — it isn't limited to
  side-to-side movement like a regular boss, and the charge can actually
  hit the ship if you don't dodge out of its path.
- It cycles between three attack patterns: a single shot, a 3-way spread,
  and a 2-bullet burst.
- Defeating it ends the run with a victory screen instead of continuing
  to another wave.

### XP and weapon levels

Every alien and boss kill grants XP (`xpValue` in `ALIEN_TYPES`/`XP` in
`config.js`) — this is what makes killing regular aliens worthwhile
beyond score, not just a means to clear the wave. XP accumulates toward
a fixed progression of five weapon tiers (`WEAPON_LEVELS`), each a
permanent upgrade to the player's default fire:

1. **Single Shot** (start)
2. **Rapid Fire** — shorter cooldown
3. **Twin Cannons** — two parallel shots
4. **Triple Cannons** — three parallel shots, shorter cooldown still
5. **Spread Array** — three shots fanned outward, the fastest cooldown

Leveling up shows a "LEVEL UP!" banner with a sound and updates the HUD
(`Lvl n: <weapon name>`). The charged-laser power-up still overrides
whatever tier you're on with its own wide piercing shot for its
duration — the weapon level is the permanent baseline, the power-up is a
temporary boost on top of it.

### Sound

All sound is synthesized with the Web Audio API (`js/audio.js`) — no
audio asset files. An 8-bit style chiptune loop (square-wave melody +
triangle-wave bass) plays while a run is active (starts on Space to
begin, stops on game over), alongside the laser-fire, enemy-fire, and
explosion sound effects.

## What's next

This is intentionally a minimal, playable prototype. Natural next steps
(not yet implemented) include touch-drag movement and more alien
behaviors (e.g. side-to-side movement or shooting back).
