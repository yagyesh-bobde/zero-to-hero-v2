import type { Problem } from '../types';

const uniquePaths: Problem = {
  id: 'dp-2d-unique-paths',
  title: 'Unique Paths',
  difficulty: 'medium',
  leetcode: 62,
  pattern: 'Grid DP',
  statement:
    'A delivery robot starts at the top-left corner of a city map with `m` rows and `n` columns of blocks. It must reach the bottom-right corner, and it can only move **right** or **down**, one block at a time. How many different routes can it take?',
  examples: [
    { input: 'm = 3, n = 4', output: '10', explain: 'Every route makes 2 down moves and 3 right moves in some order. There are 10 orders.' },
    { input: 'm = 3, n = 2', output: '3', explain: 'Right-Down-Down, Down-Right-Down, Down-Down-Right.' },
  ],
  constraints: ['1 ≤ m, n ≤ 100', 'the answer fits in a normal JS number'],
  hints: [
    'You can only arrive at a cell from the cell **above** it or the cell to its **left**.',
    'So the number of ways to reach a cell = ways to reach the cell above + ways to reach the cell to the left.',
    'Every cell in the top row and the left column has exactly 1 way: go straight there.',
    'Fill a table row by row. You only ever look at the row above, so one row of size `n` is enough: `row[c] ← row[c] + row[c - 1]`.',
  ],
  approaches: [
    {
      name: 'Plain recursion',
      idea: '`ways(r, c) = ways(r - 1, c) + ways(r, c - 1)`, with 1 for any cell in the top row or left column. Correct, but the same cells get solved again and again, so the call tree explodes.',
      code: `function uniquePaths(m, n) {
  const ways = (r, c) => (r === 0 || c === 0 ? 1 : ways(r - 1, c) + ways(r, c - 1));
  return ways(m - 1, n - 1);
}`,
      time: 'O(2^(m+n))',
      space: 'O(m + n)',
    },
    {
      name: 'Memo keyed by "r,c"',
      idea: 'There are only `m × n` different cells. Save each answer in a map under the key `"r,c"` the first time, and reuse it after that.',
      time: 'O(m × n)',
      space: 'O(m × n)',
    },
    {
      name: 'Table with one row',
      idea: 'Fill the grid top to bottom, left to right. Each new row only needs the row above, so keep one array. Before you update `row[c]` it still holds the value from the row above, and `row[c - 1]` was just updated for this row.',
      pseudo: `function uniquePaths(m, n):
    row ← array of n ones           // the top row: 1 way to each cell
    for r from 1 to m - 1:
        for c from 1 to n - 1:
            row[c] ← row[c] + row[c - 1]   // from above + from left
    return row[n - 1]`,
      code: `function uniquePaths(m, n) {
  const row = new Array(n).fill(1);
  for (let r = 1; r < m; r++) {
    for (let c = 1; c < n; c++) row[c] += row[c - 1];
  }
  return row[n - 1];
}`,
      time: 'O(m × n)',
      space: 'O(n)',
    },
  ],
  fn: 'uniquePaths',
  starter: `function uniquePaths(m, n) {
  // count the right/down routes from the top-left to the bottom-right
  return 0;
}`,
  solution: `function uniquePaths(m, n) {
  const row = new Array(n).fill(1);
  for (let r = 1; r < m; r++) {
    for (let c = 1; c < n; c++) row[c] += row[c - 1];
  }
  return row[n - 1];
}`,
  tests: [
    { name: '3 × 4 (the lesson grid)', args: [3, 4], expected: 10 },
    { name: '3 × 7', args: [3, 7], expected: 28 },
    { name: '7 × 3 (same as 3 × 7)', args: [7, 3], expected: 28 },
    { name: '3 × 2', args: [3, 2], expected: 3 },
    { name: 'single cell', args: [1, 1], expected: 1 },
    { name: 'one row', args: [1, 5], expected: 1 },
    { name: '3 × 3', args: [3, 3], expected: 6 },
    { name: '10 × 10', args: [10, 10], expected: 48620 },
  ],
  takeaway: 'In a grid, the state is the cell `(r, c)`. Its answer is built from the cells you can arrive from.',
};

const uniquePathsObstacles: Problem = {
  id: 'dp-2d-unique-paths-obstacles',
  title: 'Unique Paths II (with roadblocks)',
  difficulty: 'medium',
  leetcode: 63,
  pattern: 'Grid DP',
  statement:
    'Same robot, same right/down moves, but now some blocks are closed for road work. The map is a grid of `0`s (open) and `1`s (closed). Count the routes from the top-left to the bottom-right that never step on a closed block. If the start or the end is closed, the answer is `0`.',
  examples: [
    { input: 'grid = [[0,0,0],[0,1,0],[0,0,0]]', output: '2', explain: 'The middle is closed, so you go around it on the top-right or the bottom-left.' },
    { input: 'grid = [[0,1,0],[0,0,0]]', output: '1', explain: 'The roadblock in the top row cuts off everything to its right in that row.' },
  ],
  constraints: ['1 ≤ rows, columns ≤ 100', 'grid[r][c] is 0 or 1'],
  hints: [
    'Same recurrence as Unique Paths: ways from above + ways from the left.',
    'A closed cell has **0** ways. Nothing can pass through it.',
    'Careful with the top row: once you hit a roadblock, every cell to its right in that row has 0 ways, not 1.',
    'With one row: `if grid[r][c] = 1 then row[c] ← 0 else if c > 0 then row[c] ← row[c] + row[c - 1]`. Start with `row[0] ← 1` if the start is open.',
  ],
  approaches: [
    {
      name: 'Recursion from the goal',
      idea: 'Ways to reach `(r, c)` = 0 if it is closed or off the map, 1 at the start, else ways from above + ways from the left. Same idea as the table, but it repeats work.',
      time: 'O(2^(m+n))',
      space: 'O(m + n)',
    },
    {
      name: 'One-row table',
      idea: 'Walk the grid row by row. A closed cell is set to 0. Any other cell adds the cell to its left (this row) to what it already holds (the row above). Starting with `row = [1, 0, 0, ...]` makes the top row and left column handle themselves, roadblocks included.',
      pseudo: `function uniquePathsWithObstacles(grid):
    n ← number of columns
    row ← array of n zeros
    row[0] ← 1                         // one way to stand on the start
    for each line in grid:
        for c from 0 to n - 1:
            if line[c] = 1:
                row[c] ← 0             // roadblock: no routes through here
            else if c > 0:
                row[c] ← row[c] + row[c - 1]
    return row[n - 1]`,
      code: `function uniquePathsWithObstacles(grid) {
  const n = grid[0].length;
  const row = new Array(n).fill(0);
  row[0] = 1;
  for (const line of grid) {
    for (let c = 0; c < n; c++) {
      if (line[c] === 1) row[c] = 0;
      else if (c > 0) row[c] += row[c - 1];
    }
  }
  return row[n - 1];
}`,
      time: 'O(m × n)',
      space: 'O(n)',
    },
  ],
  fn: 'uniquePathsWithObstacles',
  starter: `function uniquePathsWithObstacles(grid) {
  // count right/down routes that avoid the 1s
  return 0;
}`,
  solution: `function uniquePathsWithObstacles(grid) {
  const n = grid[0].length;
  const row = new Array(n).fill(0);
  row[0] = 1;
  for (const line of grid) {
    for (let c = 0; c < n; c++) {
      if (line[c] === 1) row[c] = 0;
      else if (c > 0) row[c] += row[c - 1];
    }
  }
  return row[n - 1];
}`,
  tests: [
    { name: 'block in the middle', args: [[[0, 0, 0], [0, 1, 0], [0, 0, 0]]], expected: 2 },
    { name: 'block in the top row', args: [[[0, 1, 0], [0, 0, 0]]], expected: 1 },
    { name: '2 × 2 with one block', args: [[[0, 1], [0, 0]]], expected: 1 },
    { name: 'start is closed', args: [[[1, 0], [0, 0]]], expected: 0 },
    { name: 'end is closed', args: [[[0, 0], [0, 1]]], expected: 0 },
    { name: 'single closed cell', args: [[[1]]], expected: 0 },
    { name: 'single open cell', args: [[[0]]], expected: 1 },
    { name: 'column cut in half', args: [[[0], [1], [0]]], expected: 0 },
    { name: '4 × 4 with three blocks', args: [[[0, 0, 0, 0], [0, 1, 0, 0], [0, 0, 0, 1], [1, 0, 0, 0]]], expected: 3 },
  ],
  takeaway: 'Obstacles just mean "this cell is 0". Let the recurrence carry the zero forward.',
};

const minPathSum: Problem = {
  id: 'dp-2d-min-path-sum',
  title: 'Minimum Path Sum',
  difficulty: 'medium',
  leetcode: 64,
  pattern: 'Grid DP',
  statement:
    'You are walking across a field split into a grid. Each cell has a number: the minutes it takes to cross that patch (mud is slow, grass is fast). You start top-left, finish bottom-right, and move only right or down. Return the smallest total time, counting both the start and the end cell.',
  examples: [
    { input: 'grid = [[1,3,1],[1,5,1],[4,2,1]]', output: '7', explain: 'Right, right, down, down: 1 + 3 + 1 + 1 + 1 = 7.' },
    { input: 'grid = [[1,2,3],[4,5,6]]', output: '12', explain: '1 + 2 + 3 + 6 = 12.' },
  ],
  constraints: ['1 ≤ rows, columns ≤ 200', '0 ≤ grid[r][c] ≤ 100'],
  hints: [
    'Same shape as Unique Paths, but instead of adding the two ways in, you pick the **cheaper** one.',
    '`best(r, c) = grid[r][c] + min(best(r - 1, c), best(r, c - 1))`.',
    'The top row can only be reached from the left, and the left column only from above. Handle those edges first.',
    'One row works again: `row[c] ← grid[r][c] + min(row[c], row[c - 1])`.',
  ],
  approaches: [
    {
      name: 'Try every route',
      idea: 'Recursively try right and down from every cell and keep the smaller sum. Correct, but there are exponentially many routes.',
      time: 'O(2^(m+n))',
      space: 'O(m + n)',
    },
    {
      name: 'One-row table',
      idea: 'The cheapest way into a cell must come through the cheaper of its two neighbours (above or left), so we only need those two numbers. Keep one row: `row[c]` holds the best cost of the cell above until we overwrite it.',
      pseudo: `function minPathSum(grid):
    m ← number of rows, n ← number of columns
    row ← array of n values, all ∞
    row[0] ← 0
    for r from 0 to m - 1:
        row[0] ← row[0] + grid[r][0]            // left column: only from above
        for c from 1 to n - 1:
            row[c] ← grid[r][c] + min(row[c], row[c - 1])
    return row[n - 1]`,
      code: `function minPathSum(grid) {
  const n = grid[0].length;
  const row = new Array(n).fill(Infinity);
  row[0] = 0;
  for (const line of grid) {
    row[0] += line[0];
    for (let c = 1; c < n; c++) row[c] = line[c] + Math.min(row[c], row[c - 1]);
  }
  return row[n - 1];
}`,
      time: 'O(m × n)',
      space: 'O(n)',
    },
  ],
  fn: 'minPathSum',
  starter: `function minPathSum(grid) {
  // smallest right/down path sum from top-left to bottom-right
  return 0;
}`,
  solution: `function minPathSum(grid) {
  const n = grid[0].length;
  const row = new Array(n).fill(Infinity);
  row[0] = 0;
  for (const line of grid) {
    row[0] += line[0];
    for (let c = 1; c < n; c++) row[c] = line[c] + Math.min(row[c], row[c - 1]);
  }
  return row[n - 1];
}`,
  tests: [
    { name: '3 × 3 example', args: [[[1, 3, 1], [1, 5, 1], [4, 2, 1]]], expected: 7 },
    { name: '2 × 3', args: [[[1, 2, 3], [4, 5, 6]]], expected: 12 },
    { name: 'single cell', args: [[[5]]], expected: 5 },
    { name: 'one row', args: [[[1, 2, 3]]], expected: 6 },
    { name: 'one column', args: [[[1], [2], [3]]], expected: 6 },
    { name: 'all zeros', args: [[[0, 0], [0, 0]]], expected: 0 },
    { name: 'winding cheap path', args: [[[1, 9, 9, 9], [1, 1, 9, 9], [9, 1, 1, 1]]], expected: 6 },
    { name: 'greedy trap', args: [[[3, 1, 2], [9, 9, 1], [1, 1, 1]]], expected: 8 },
  ],
  takeaway: 'Counting paths uses `+`, cheapest path uses `min`. Same table, different combine step.',
};

const triangle: Problem = {
  id: 'dp-2d-triangle',
  title: 'Triangle',
  difficulty: 'medium',
  leetcode: 120,
  pattern: 'Grid DP',
  statement:
    'A ball drops from the top of a pinball triangle. Row `r` has `r + 1` pins, each with a cost. From pin `i` in one row, the ball can fall to pin `i` or pin `i + 1` in the row below. Return the smallest total cost from the top to any pin in the bottom row.',
  examples: [
    {
      input: 'triangle = [[2],[3,4],[6,5,7],[4,1,8,3]]',
      output: '11',
      explain: '2 → 3 → 5 → 1 = 11.',
    },
    { input: 'triangle = [[-10]]', output: '-10' },
  ],
  constraints: ['1 ≤ rows ≤ 200', 'row r has r + 1 numbers', 'numbers can be negative'],
  hints: [
    'From the top you have two choices each step, and the bottom row has many possible endings. Which direction has only one ending?',
    'Go **bottom-up**: the top has exactly one cell, so the answer will land in one place.',
    '`best(r, i) = triangle[r][i] + min(best(r + 1, i), best(r + 1, i + 1))`. The bottom row is its own best.',
    'Keep one array, start it as a copy of the bottom row, and update it upward. `below[0]` is the answer.',
  ],
  approaches: [
    {
      name: 'Try every path',
      idea: 'From each pin, try both pins below. Every path is tried, so there are `2^(rows - 1)` of them.',
      time: 'O(2^n)',
      space: 'O(n)',
    },
    {
      name: 'Bottom-up, one row',
      idea: 'Start with the bottom row: the best cost from a bottom pin is just its own cost. For each row above, the best from pin `i` is its own cost plus the cheaper of the two pins under it. When you reach the top, one number is left: the answer.',
      pseudo: `function minimumTotal(triangle):
    below ← copy of the last row of triangle
    for r from rows - 2 down to 0:
        for i from 0 to r:
            below[i] ← triangle[r][i] + min(below[i], below[i + 1])
    return below[0]`,
      code: `function minimumTotal(triangle) {
  const below = [...triangle[triangle.length - 1]];
  for (let r = triangle.length - 2; r >= 0; r--) {
    for (let i = 0; i <= r; i++) {
      below[i] = triangle[r][i] + Math.min(below[i], below[i + 1]);
    }
  }
  return below[0];
}`,
      time: 'O(n²) for n rows',
      space: 'O(n)',
    },
  ],
  fn: 'minimumTotal',
  starter: `function minimumTotal(triangle) {
  // smallest top-to-bottom path sum
  return 0;
}`,
  solution: `function minimumTotal(triangle) {
  const below = [...triangle[triangle.length - 1]];
  for (let r = triangle.length - 2; r >= 0; r--) {
    for (let i = 0; i <= r; i++) {
      below[i] = triangle[r][i] + Math.min(below[i], below[i + 1]);
    }
  }
  return below[0];
}`,
  tests: [
    { name: '4 rows', args: [[[2], [3, 4], [6, 5, 7], [4, 1, 8, 3]]], expected: 11 },
    { name: 'one pin', args: [[[-10]]], expected: -10 },
    { name: 'two rows', args: [[[1], [2, 3]]], expected: 3 },
    { name: 'negatives', args: [[[-1], [2, 3], [1, -1, -3]]], expected: -1 },
    { name: 'all ones', args: [[[1], [1, 1], [1, 1, 1]]], expected: 3 },
    { name: 'greedy trap', args: [[[5], [9, 6], [4, 6, 8], [0, 7, 1, 5]]], expected: 18 },
  ],
  takeaway: 'If one end of the grid has a single cell, fill toward it: the answer lands in one place.',
};

export const gridProblems: Problem[] = [uniquePaths, uniquePathsObstacles, minPathSum, triangle];
