const test = require("node:test");
const assert = require("node:assert/strict");
const { createSnake, stepSnake, spawnFood, hitsWall, hitsSelf, tick } = require("../script.js");

test("stepSnake with grow keeps the tail and adds a cell", () => {
  const grown = stepSnake(createSnake(20, 20), true);
  assert.deepEqual(grown.segments, [{ x: 11, y: 10 }, { x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }]);
});

test("spawnFood never lands on the snake and returns null on a full board", () => {
  const snake = { segments: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }], direction: "right" };
  // 2x2 board with three cells taken leaves exactly one free cell.
  const tiny = { segments: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }], direction: "right" };
  assert.deepEqual(spawnFood(tiny, 2, 2, () => 0.99), { x: 1, y: 1 });
  for (let i = 0; i < 20; i++) {
    const food = spawnFood(snake, 3, 3, () => i / 20);
    assert.ok(!snake.segments.some((s) => s.x === food.x && s.y === food.y));
  }
  const full = { segments: [{ x: 0, y: 0 }, { x: 1, y: 0 }], direction: "right" };
  assert.equal(spawnFood(full, 2, 1), null);
});

test("hitsWall detects every edge", () => {
  assert.equal(hitsWall({ x: 0, y: 0 }, 20, 20), false);
  assert.equal(hitsWall({ x: 19, y: 19 }, 20, 20), false);
  assert.equal(hitsWall({ x: -1, y: 5 }, 20, 20), true);
  assert.equal(hitsWall({ x: 20, y: 5 }, 20, 20), true);
  assert.equal(hitsWall({ x: 5, y: -1 }, 20, 20), true);
  assert.equal(hitsWall({ x: 5, y: 20 }, 20, 20), true);
});

test("hitsSelf only when the head overlaps the body", () => {
  assert.equal(hitsSelf(createSnake(20, 20).segments), false);
  assert.equal(hitsSelf([{ x: 1, y: 1 }, { x: 2, y: 1 }, { x: 1, y: 1 }]), true);
});

test("tick eats food: snake grows and new food spawns off the snake", () => {
  const snake = createSnake(20, 20);
  const result = tick({ snake, food: { x: 11, y: 10 }, dead: false }, 20, 20, () => 0);
  assert.equal(result.ate, true);
  assert.equal(result.dead, false);
  assert.equal(result.snake.segments.length, 4);
  assert.deepEqual(result.food, { x: 0, y: 0 });
});

test("tick without food keeps length and food position", () => {
  const result = tick({ snake: createSnake(20, 20), food: { x: 0, y: 0 }, dead: false }, 20, 20);
  assert.equal(result.ate, false);
  assert.equal(result.snake.segments.length, 3);
  assert.deepEqual(result.food, { x: 0, y: 0 });
});

test("tick flags death when the snake runs into a wall", () => {
  const snake = { segments: [{ x: 19, y: 5 }, { x: 18, y: 5 }, { x: 17, y: 5 }], direction: "right" };
  assert.equal(tick({ snake, food: { x: 0, y: 0 }, dead: false }, 20, 20).dead, true);
});

test("tick flags death when the snake turns into its own body", () => {
  // A 5-long snake curled so that moving down hits its own segment.
  const snake = {
    segments: [{ x: 5, y: 5 }, { x: 6, y: 5 }, { x: 6, y: 6 }, { x: 5, y: 6 }, { x: 4, y: 6 }],
    direction: "down",
  };
  assert.equal(tick({ snake, food: { x: 0, y: 0 }, dead: false }, 20, 20).dead, true);
});

test("tick lets the head follow straight into the cell the tail just left", () => {
  // A 2x2 loop: moving up puts the head where the tail was, which is legal.
  const snake = {
    segments: [{ x: 5, y: 6 }, { x: 6, y: 6 }, { x: 6, y: 5 }, { x: 5, y: 5 }],
    direction: "up",
  };
  assert.equal(tick({ snake, food: { x: 0, y: 0 }, dead: false }, 20, 20).dead, false);
});
