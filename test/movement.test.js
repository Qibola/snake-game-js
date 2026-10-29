const test = require("node:test");
const assert = require("node:assert/strict");
const { createSnake, nextDirection, stepSnake, KEY_TO_DIRECTION } = require("../script.js");

test("createSnake starts 3 cells long, centered, heading right", () => {
  const snake = createSnake(20, 20);
  assert.deepEqual(snake.segments, [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }]);
  assert.equal(snake.direction, "right");
});

test("stepSnake moves the head one cell and keeps the length", () => {
  const moved = stepSnake(createSnake(20, 20));
  assert.deepEqual(moved.segments, [{ x: 11, y: 10 }, { x: 10, y: 10 }, { x: 9, y: 10 }]);
});

test("stepSnake follows a turn", () => {
  const moved = stepSnake({ ...createSnake(20, 20), direction: "up" });
  assert.deepEqual(moved.segments[0], { x: 10, y: 9 });
  assert.deepEqual(moved.segments[1], { x: 10, y: 10 });
});

test("nextDirection blocks reversing but allows turns", () => {
  assert.equal(nextDirection("right", "left"), "right");
  assert.equal(nextDirection("up", "down"), "up");
  assert.equal(nextDirection("right", "up"), "up");
  assert.equal(nextDirection("right", "bogus"), "right");
});

test("arrow keys and WASD map to directions", () => {
  assert.equal(KEY_TO_DIRECTION.ArrowLeft, "left");
  assert.equal(KEY_TO_DIRECTION.w, "up");
  assert.equal(KEY_TO_DIRECTION.D, "right");
});
