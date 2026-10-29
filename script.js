// Snake game — step 2: snake movement + keyboard controls.

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
function stepSnake(snake) {
  const head = snake.segments[0];
  const d = DIRECTIONS[snake.direction];
  const newHead = { x: head.x + d.x, y: head.y + d.y };
  return {
    ...snake,
    segments: [newHead, ...snake.segments.slice(0, -1)],
  };
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
  let snake = createSnake();
  // Buffer the latest key press and apply it once per tick, so two quick
  // presses (e.g. up then left while heading right) can't reverse the snake.
  let requested = snake.direction;

  document.addEventListener("keydown", (event) => {
    const dir = KEY_TO_DIRECTION[event.key];
    if (!dir) return;
    event.preventDefault(); // stop arrow keys from scrolling the page
    requested = dir;
  });

  setInterval(() => {
    snake = stepSnake({ ...snake, direction: nextDirection(snake.direction, requested) });
    drawGrid(ctx);
    drawSnake(ctx, snake);
  }, TICK_MS);

  drawGrid(ctx);
  drawSnake(ctx, snake);
}

if (typeof module !== "undefined") {
  module.exports = {
    drawGrid, createSnake, isOpposite, nextDirection, stepSnake,
    DIRECTIONS, KEY_TO_DIRECTION, TILE_SIZE, GRID_COLS, GRID_ROWS,
  };
}
