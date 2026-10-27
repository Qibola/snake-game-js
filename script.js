// Snake game — step 1: canvas setup + static grid.

const TILE_SIZE = 20;   // pixels per grid cell
const GRID_COLS = 20;   // 20 * 20 = 400px wide
const GRID_ROWS = 20;   // 20 * 20 = 400px tall

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

// Browser entry point (skipped when loaded under Node for tests).
if (typeof document !== "undefined") {
  const canvas = document.getElementById("game");
  drawGrid(canvas.getContext("2d"));
}

if (typeof module !== "undefined") {
  module.exports = { drawGrid, TILE_SIZE, GRID_COLS, GRID_ROWS };
}
