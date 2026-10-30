// Snake game — step 3: food, growth and collisions.

const TILE_SIZE = 20;   // pixels per grid cell
const GRID_COLS = 20;   // 20 * 20 = 400px wide
const GRID_ROWS = 20;   // 20 * 20 = 400px tall
const TICK_MS = 120;    // how often the snake moves one cell

// Unit vectors for each direction, in grid cells.
const DIRECTIONS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

// Arrow keys and WASD both steer the snake.
const KEY_TO_DIRECTION = {
  ArrowUp: "up", w: "up", W: "up",
  ArrowDown: "down", s: "down", S: "down",
  ArrowLeft: "left", a: "left", A: "left",
  ArrowRight: "right", d: "right", D: "right",
};

// Draw the faint grid lines onto a 2D canvas context.
function drawGrid(ctx, cols = GRID_COLS, rows = GRID_ROWS, tile = TILE_SIZE) {
  ctx.clearRect(0, 0, cols * tile, rows * tile);
  ctx.strokeStyle = "#222";
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = 0; x <= cols; x++) {
    ctx.moveTo(x * tile + 0.5, 0);
    ctx.lineTo(x * tile + 0.5, rows * tile);
  }
  for (let y = 0; y <= rows; y++) {
    ctx.moveTo(0, y * tile + 0.5);
    ctx.lineTo(cols * tile, y * tile + 0.5);
  }
  ctx.stroke();
}

// A 3-cell snake in the middle of the board, heading right.
// segments[0] is the head.
function createSnake(cols = GRID_COLS, rows = GRID_ROWS) {
  const x = Math.floor(cols / 2);
  const y = Math.floor(rows / 2);
  return {
    segments: [{ x, y }, { x: x - 1, y }, { x: x - 2, y }],
    direction: "right",
  };
}

// True when two directions point exactly opposite ways (e.g. left vs right).
function isOpposite(a, b) {
  return DIRECTIONS[a].x + DIRECTIONS[b].x === 0 &&
         DIRECTIONS[a].y + DIRECTIONS[b].y === 0;
}

// Pick the direction for the next tick. The snake can't reverse into itself,
// so an opposite or unknown direction keeps the current one.
function nextDirection(current, requested) {
  if (!DIRECTIONS[requested] || isOpposite(current, requested)) return current;
  return requested;
}

// Move the snake one cell: add a new head, drop the tail. Returns a new snake.
// When grow is true the tail stays put, so the snake gets one cell longer.
function stepSnake(snake, grow = false) {
  const head = snake.segments[0];
  const d = DIRECTIONS[snake.direction];
  const newHead = { x: head.x + d.x, y: head.y + d.y };
  const body = grow ? snake.segments : snake.segments.slice(0, -1);
  return {
    ...snake,
    segments: [newHead, ...body],
  };
}

function samePos(a, b) {
  return a.x === b.x && a.y === b.y;
}

// Put food on a random cell the snake isn't covering. Returns null when the
// board is full. rng is injectable so tests can pick the cell.
function spawnFood(snake, cols = GRID_COLS, rows = GRID_ROWS, rng = Math.random) {
  const free = [];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (!snake.segments.some((seg) => seg.x === x && seg.y === y)) free.push({ x, y });
    }
  }
  if (free.length === 0) return null;
  return free[Math.floor(rng() * free.length)];
}

function hitsWall(pos, cols = GRID_COLS, rows = GRID_ROWS) {
  return pos.x < 0 || pos.y < 0 || pos.x >= cols || pos.y >= rows;
}

// True when the head overlaps any other segment.
function hitsSelf(segments) {
  const [head, ...body] = segments;
  return body.some((seg) => samePos(seg, head));
}

// Advance the game one tick: move (growing if the head reaches the food),
// respawn eaten food, and flag death on a wall or self collision.
// Returns a new state { snake, food, dead, ate }.
function tick(state, cols = GRID_COLS, rows = GRID_ROWS, rng = Math.random) {
  const d = DIRECTIONS[state.snake.direction];
  const head = state.snake.segments[0];
  const ate = state.food !== null && samePos({ x: head.x + d.x, y: head.y + d.y }, state.food);
  const snake = stepSnake(state.snake, ate);
  const dead = hitsWall(snake.segments[0], cols, rows) || hitsSelf(snake.segments);
  const food = ate && !dead ? spawnFood(snake, cols, rows, rng) : state.food;
  return { snake, food, dead, ate };
}

function drawFood(ctx, food, tile = TILE_SIZE) {
  if (!food) return;
  ctx.fillStyle = "#e5484d";
  ctx.beginPath();
  ctx.arc(food.x * tile + tile / 2, food.y * tile + tile / 2, tile / 2 - 3, 0, Math.PI * 2);
  ctx.fill();
}

function drawSnake(ctx, snake, tile = TILE_SIZE) {
  snake.segments.forEach((seg, i) => {
    ctx.fillStyle = i === 0 ? "#3ddc84" : "#2a9d5c";
    ctx.fillRect(seg.x * tile + 1, seg.y * tile + 1, tile - 2, tile - 2);
  });
}

// Browser entry point (skipped when loaded under Node for tests).
if (typeof document !== "undefined") {
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  const snake = createSnake();
  let state = { snake, food: spawnFood(snake), dead: false };
  // Buffer the latest key press and apply it once per tick, so two quick
  // presses (e.g. up then left while heading right) can't reverse the snake.
  let requested = snake.direction;

  function render() {
    drawGrid(ctx);
    drawFood(ctx, state.food);
    drawSnake(ctx, state.snake);
  }

  document.addEventListener("keydown", (event) => {
    const dir = KEY_TO_DIRECTION[event.key];
    if (!dir) return;
    event.preventDefault(); // stop arrow keys from scrolling the page
    requested = dir;
  });

  const timer = setInterval(() => {
    const current = state.snake;
    const next = tick({ ...state, snake: { ...current, direction: nextDirection(current.direction, requested) } });
    // On a crash, freeze on the last valid frame. (Game-over screen comes next.)
    if (next.dead) {
      clearInterval(timer);
      return;
    }
    state = next;
    render();
  }, TICK_MS);

  render();
}

if (typeof module !== "undefined") {
  module.exports = {
    drawGrid, createSnake, isOpposite, nextDirection, stepSnake,
    samePos, spawnFood, hitsWall, hitsSelf, tick,
    DIRECTIONS, KEY_TO_DIRECTION, TILE_SIZE, GRID_COLS, GRID_ROWS,
  };
}
