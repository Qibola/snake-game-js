# snake-game-js

A classic Snake game in vanilla JavaScript and HTML5 canvas — built one small step at a time.

## Run it

Open `index.html` in any browser. No build step or dependencies.

Steer with the arrow keys or WASD. Eat the red food to grow; hitting a wall or your own body ends the run (for now the board just freezes — a game-over screen and restart come next).

## Test

```bash
node --test
```

## Roadmap

- [x] Scaffold: index.html/style.css/script.js/README + canvas setup + static grid
- [x] Snake movement + keyboard controls (arrow keys / WASD)
- [x] Food spawning + growth + collisions (self / wall)
- [ ] Score display + game-over screen + restart
- [ ] localStorage high score + polish

## Files

- `index.html` — page with the 400x400 canvas
- `style.css` — dark theme + canvas border
- `script.js` — game code (grid, snake movement, keyboard controls, food, collisions)
- `test/movement.test.js` — Node tests for movement and direction rules
- `test/food-collision.test.js` — Node tests for food spawning, growth and wall/self collisions
