import type { Lesson } from '../types';

const lesson: Lesson = {
  id: 'grids-are-graphs',
  title: 'Grids are graphs: flood fill and islands',
  summary: 'Each cell is a node, its 4 neighbors are edges. Sink each island as you explore it.',
  minutes: 22,
  blocks: [
    {
      kind: 'callout',
      tone: 'story',
      title: 'The paint bucket tool',
      text: "In any paint app, you click the bucket on one pixel and the whole blob of same-colored pixels around it changes color. It stops at the edges of the blob. The app is running a graph search on a grid. Satellite apps do the same thing to count lakes or islands on a map, and phone cameras do it to find the outline of the sky.",
    },
    {
      kind: 'text',
      text: "**The problem.** A map is a grid of `'1'` (land) and `'0'` (water). An **island** is a group of land cells joined up, down, left or right (diagonals do not count). How many islands are there?",
    },
    {
      kind: 'diagram',
      title: 'The map, and the hidden graph inside it',
      art: `grid                    neighbors of (r, c)

1 1 0 0 0                    (r-1, c)
1 1 0 0 0                       |
0 0 1 0 0          (r, c-1) -- (r, c) -- (r, c+1)
0 0 0 1 1                       |
                             (r+1, c)
answer: 3 islands`,
      caption: "Every cell is a node. Its edges go to the up/down/left/right cells that are inside the grid. No adjacency list needed: you compute neighbors on the fly.",
    },
    {
      kind: 'text',
      text: "**Brute force.** For every land cell, run a search to find its whole island, then check if that island was already counted (say, by comparing its top-left cell). It is correct. But an island of 1,000 cells gets explored 1,000 times. On a 300 × 300 map that is up to 90,000 cells times 90,000 steps.",
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'Sink the island while you explore it',
      text: "When you find a land cell you have not seen, count one island, then **flood** it: visit every land cell connected to it and mark each one as seen (or just turn it into water, `'0'`). Later cells of that island are already water, so nobody counts it twice. Each cell is visited once: `O(rows · cols)`.",
    },
    {
      kind: 'trace',
      title: 'Scanning the map row by row',
      columns: ['scan reaches', 'cell is', 'action', 'islands'],
      rows: [
        ['(0,0)', "'1'", 'count it, flood (0,0) (0,1) (1,0) (1,1) to water', 1],
        ['(0,1) … (1,1)', "'0' now", 'skip, already sunk', 1],
        ['(2,2)', "'1'", 'count it, flood (2,2) alone', 2],
        ['(3,3)', "'1'", 'count it, flood (3,3) (3,4)', 3],
        ['(3,4)', "'0' now", 'skip', 3],
      ],
      note: "(2,2) and (3,3) touch only at a corner. Diagonals are not neighbors, so they are two islands.",
    },
    {
      kind: 'diagram',
      title: 'Inside one flood (stack, starting at (0,0))',
      art: `stack           pop     pushes (land neighbors)
[(0,0)]         (0,0)   (1,0) (0,1)
[(1,0),(0,1)]   (0,1)   (1,1)
[(1,0),(1,1)]   (1,1)   -   ((0,1),(1,0) already sunk)
[(1,0)]         (1,0)   -
[]              done: 4 cells sunk`,
      caption: "We sink a cell the moment we push it, so (1,1) is pushed once even though two cells point to it.",
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Number of islands',
      code: `function numIslands(grid):
    count ← 0
    for r from 0 to rows - 1:
        for c from 0 to cols - 1:
            if grid[r][c] = '1':
                count ← count + 1
                sink(grid, r, c)
    return count

function sink(grid, r, c):              // flood fill with a stack
    grid[r][c] ← '0'
    stack ← [(r, c)]
    while stack is not empty:
        (r, c) ← pop from stack
        for each (dr, dc) in [(1,0), (-1,0), (0,1), (0,-1)]:
            nr ← r + dr; nc ← c + dc
            if nr, nc inside grid and grid[nr][nc] = '1':
                grid[nr][nc] ← '0'
                push (nr, nc) onto stack`,
    },
    {
      kind: 'code',
      lang: 'js',
      code: `const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];

function numIslands(grid) {
  const rows = grid.length, cols = grid[0].length;
  let count = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] !== '1') continue;
      count++;
      grid[r][c] = '0';
      const stack = [[r, c]];
      while (stack.length) {
        const [cr, cc] = stack.pop();
        for (const [dr, dc] of DIRS) {
          const nr = cr + dr, nc = cc + dc;
          if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue;
          if (grid[nr][nc] !== '1') continue;
          grid[nr][nc] = '0';
          stack.push([nr, nc]);
        }
      }
    }
  }
  return count;
}`,
    },
    {
      kind: 'compare',
      title: 'Counting islands on an R × C map',
      rows: [
        { approach: 'Search the whole island from every land cell', time: 'O((R·C)²)', space: 'O(R·C)', note: 'Correct, but re-explores each island once per cell.' },
        { approach: 'Flood + separate visited set', time: 'O(R·C)', space: 'O(R·C)', note: 'Keeps the input unchanged.' },
        { approach: 'Flood + sink in place', time: 'O(R·C)', space: 'O(R·C) stack worst case', note: 'No extra set. Changes the input, so say so in an interview.' },
      ],
    },
    {
      kind: 'table',
      title: 'Mark in place or keep a visited set?',
      head: ['Choice', 'Good', 'Watch out'],
      rows: [
        ['Overwrite the cell (`grid[r][c] = 0`)', 'no extra memory, simple', 'destroys the input; copy it first if the caller needs it'],
        ['`seen` 2D array of booleans', 'input stays the same', '`Array.from({ length: R }, () => new Array(C).fill(false))`'],
        ['`Set` of `r * C + c` keys', 'fine for sparse grids', 'string keys like `"3,4"` are slow; use the number'],
      ],
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Pattern: grid flood fill',
      code: `for each cell (r, c):
    if cell is a start (land, unvisited, right color…):
        handle a new region (count it, measure it…)
        mark (r, c); stack ← [(r, c)]
        while stack is not empty:
            (r, c) ← pop from stack
            for each of the 4 neighbors (nr, nc):
                if inside grid and it matches and not marked:
                    mark (nr, nc); push (nr, nc)`,
    },
    {
      kind: 'callout',
      tone: 'trap',
      title: 'Recursion depth, bounds, and the string "0"',
      text: "1) **Recursive flood fill can crash.** A 300 × 300 map that is all land makes a chain of 90,000 nested calls. JavaScript usually overflows the call stack around 10,000. Use an explicit stack for big grids. 2) **Check bounds before reading.** `grid[-1]` is `undefined`, so `grid[-1][0]` throws. 3) **In JS, `'0'` is truthy.** `if (grid[r][c])` is true for water too. Compare with `=== '1'`.",
    },
  ],
  problems: [
    {
      id: 'graphs-flood-fill',
      title: 'Paint bucket',
      difficulty: 'easy',
      leetcode: 733,
      pattern: 'Grid flood fill',
      statement:
        "An image is a grid of numbers, each number a color. You click the paint bucket on pixel `(sr, sc)` with a new `color`. Every pixel that has the **same color** as the clicked pixel and is connected to it up, down, left or right (through same-colored pixels) gets the new color. Return the image after the fill.",
      examples: [
        { input: 'image = [[1,1,1],[1,1,0],[1,0,1]], sr = 1, sc = 1, color = 2', output: '[[2,2,2],[2,2,0],[2,0,1]]', explain: 'The bottom-right 1 touches the blob only at a corner, so it stays.' },
        { input: 'image = [[0,0,0],[0,0,0]], sr = 0, sc = 0, color = 0', output: '[[0,0,0],[0,0,0]]', explain: 'Already that color: nothing changes.' },
      ],
      constraints: ['1 ≤ rows, cols ≤ 50', '0 ≤ colors < 2¹⁶'],
      hints: [
        "Remember the starting color first: `old = image[sr][sc]`.",
        "Walk from the start. A neighbor joins if it is inside the image and has color `old`.",
        "If `old` already equals `color`, return right away, or your walk can loop forever (painted cells still look unvisited).",
      ],
      approaches: [
        {
          name: 'Flood fill with a stack',
          idea: "The clicked blob is one connected region of cells with color `old`. Paint a cell when you push it; painted cells no longer have color `old`, so the paint itself acts as the visited mark.",
          pseudo: `function floodFill(image, sr, sc, color):
    old ← image[sr][sc]
    if old = color: return image
    image[sr][sc] ← color
    stack ← [(sr, sc)]
    while stack is not empty:
        (r, c) ← pop from stack
        for each of the 4 neighbors (nr, nc):
            if inside image and image[nr][nc] = old:
                image[nr][nc] ← color
                push (nr, nc) onto stack
    return image`,
          code: `function floodFill(image, sr, sc, color) {
  const old = image[sr][sc];
  if (old === color) return image;
  const rows = image.length, cols = image[0].length;
  image[sr][sc] = color;
  const stack = [[sr, sc]];
  while (stack.length) {
    const [r, c] = stack.pop();
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nr = r + dr, nc = c + dc;
      if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue;
      if (image[nr][nc] !== old) continue;
      image[nr][nc] = color;
      stack.push([nr, nc]);
    }
  }
  return image;
}`,
          time: 'O(R·C)',
          space: 'O(R·C)',
        },
      ],
      fn: 'floodFill',
      starter: `function floodFill(image, sr, sc, color) {
  // repaint the blob that contains (sr, sc)
  return image;
}`,
      solution: `function floodFill(image, sr, sc, color) {
  const old = image[sr][sc];
  if (old === color) return image;
  const rows = image.length, cols = image[0].length;
  image[sr][sc] = color;
  const stack = [[sr, sc]];
  while (stack.length) {
    const [r, c] = stack.pop();
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nr = r + dr, nc = c + dc;
      if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue;
      if (image[nr][nc] !== old) continue;
      image[nr][nc] = color;
      stack.push([nr, nc]);
    }
  }
  return image;
}`,
      tests: [
        { name: 'corner touch does not spread', args: [[[1, 1, 1], [1, 1, 0], [1, 0, 1]], 1, 1, 2], expected: [[2, 2, 2], [2, 2, 0], [2, 0, 1]] },
        { name: 'same color: no change', args: [[[0, 0, 0], [0, 0, 0]], 0, 0, 0], expected: [[0, 0, 0], [0, 0, 0]] },
        { name: 'single pixel', args: [[[5]], 0, 0, 3], expected: [[3]] },
        { name: 'diagonal pixels are separate', args: [[[1, 0], [0, 1]], 0, 0, 7], expected: [[7, 0], [0, 1]] },
        { name: 'start in a corner', args: [[[0, 0, 1], [0, 1, 1]], 1, 2, 4], expected: [[0, 0, 4], [0, 4, 4]] },
        { name: 'fills around a wall', args: [[[3, 3, 3], [3, 9, 3], [3, 3, 3]], 0, 0, 1], expected: [[1, 1, 1], [1, 9, 1], [1, 1, 1]] },
      ],
      takeaway: 'Changing the cell can be the visited mark, as long as the new value cannot match again.',
    },
    {
      id: 'graphs-number-of-islands',
      title: 'Number of islands',
      difficulty: 'medium',
      leetcode: 200,
      pattern: 'Grid flood fill',
      statement:
        "A satellite photo is turned into a grid of strings: `'1'` is land, `'0'` is water. Land cells that touch up, down, left or right belong to the same island (corners do not count). Everything outside the grid is water. Return the number of islands.",
      examples: [
        { input: 'grid = [["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]]', output: '3' },
        { input: 'grid = [["1","0"],["0","1"]]', output: '2', explain: 'The two land cells touch only at a corner.' },
      ],
      constraints: ['1 ≤ rows, cols ≤ 300', "each cell is '0' or '1'"],
      hints: [
        "Scan every cell. What should happen the first time you step on a piece of an island?",
        "Count it, then visit the whole island so you never count it again.",
        "Sink each visited land cell to `'0'` as you push it. Use an explicit stack, not recursion, for big grids.",
      ],
      approaches: [
        {
          name: 'Explore from every land cell',
          idea: "For each land cell, search its island and check whether that island was counted before. Correct, but a big island is explored once per cell.",
          time: 'O((R·C)²)',
          space: 'O(R·C)',
        },
        {
          name: 'Count, then sink',
          idea: "When the scan finds land, that is a new island: count it and flood it to water. Every other cell of that island is now water, so it can never be counted again. Each cell is touched a constant number of times.",
          pseudo: `function numIslands(grid):
    count ← 0
    for each cell (r, c):
        if grid[r][c] = '1':
            count ← count + 1
            grid[r][c] ← '0'; stack ← [(r, c)]
            while stack is not empty:
                (r, c) ← pop from stack
                for each of the 4 neighbors (nr, nc):
                    if inside grid and grid[nr][nc] = '1':
                        grid[nr][nc] ← '0'
                        push (nr, nc) onto stack
    return count`,
          code: `function numIslands(grid) {
  const rows = grid.length, cols = grid[0].length;
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  let count = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] !== '1') continue;
      count++;
      grid[r][c] = '0';
      const stack = [[r, c]];
      while (stack.length) {
        const [cr, cc] = stack.pop();
        for (const [dr, dc] of dirs) {
          const nr = cr + dr, nc = cc + dc;
          if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue;
          if (grid[nr][nc] !== '1') continue;
          grid[nr][nc] = '0';
          stack.push([nr, nc]);
        }
      }
    }
  }
  return count;
}`,
          time: 'O(R·C)',
          space: 'O(R·C)',
        },
      ],
      fn: 'numIslands',
      starter: `function numIslands(grid) {
  // grid cells are the strings '1' (land) and '0' (water)
  return 0;
}`,
      solution: `function numIslands(grid) {
  const rows = grid.length, cols = grid[0].length;
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  let count = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] !== '1') continue;
      count++;
      grid[r][c] = '0';
      const stack = [[r, c]];
      while (stack.length) {
        const [cr, cc] = stack.pop();
        for (const [dr, dc] of dirs) {
          const nr = cr + dr, nc = cc + dc;
          if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue;
          if (grid[nr][nc] !== '1') continue;
          grid[nr][nc] = '0';
          stack.push([nr, nc]);
        }
      }
    }
  }
  return count;
}`,
      tests: [
        { name: 'one big island', args: [[['1', '1', '1', '1', '0'], ['1', '1', '0', '1', '0'], ['1', '1', '0', '0', '0'], ['0', '0', '0', '0', '0']]], expected: 1 },
        { name: 'three islands', args: [[['1', '1', '0', '0', '0'], ['1', '1', '0', '0', '0'], ['0', '0', '1', '0', '0'], ['0', '0', '0', '1', '1']]], expected: 3 },
        { name: 'all water', args: [[['0', '0'], ['0', '0']]], expected: 0 },
        { name: 'single land cell', args: [[['1']]], expected: 1 },
        { name: 'diagonal does not join', args: [[['1', '0'], ['0', '1']]], expected: 2 },
        { name: 'snake shape is one island', args: [[['1', '1', '1'], ['0', '0', '1'], ['1', '1', '1']]], expected: 1 },
        { name: 'one row', args: [[['1', '0', '1', '0', '1']]], expected: 3 },
        { name: 'ring with a lake inside', args: [[['1', '1', '1'], ['1', '0', '1'], ['1', '1', '1']]], expected: 1 },
      ],
      takeaway: 'Islands = how many times the scan starts a new flood.',
    },
    {
      id: 'graphs-max-area-of-island',
      title: 'Biggest island',
      difficulty: 'medium',
      leetcode: 695,
      pattern: 'Grid flood fill',
      statement:
        "A map is a grid of `1` (land) and `0` (water). Land cells joined up, down, left or right form an island. The **area** of an island is how many cells it has. Return the area of the biggest island, or `0` if there is no land.",
      examples: [
        { input: 'grid = [[1,1,0,0],[1,0,0,1],[0,0,1,1],[0,0,0,1]]', output: '4', explain: 'Top-left island has 3 cells, the right island has 4.' },
        { input: 'grid = [[0,0,0],[0,0,0]]', output: '0' },
      ],
      constraints: ['1 ≤ rows, cols ≤ 50', 'cells are 0 or 1'],
      hints: [
        "Same scan as counting islands. What extra number do you need per island?",
        "Count cells as you pop them during the flood.",
        "Keep `best = max(best, size)` after each flood.",
      ],
      approaches: [
        {
          name: 'Measure from every land cell',
          idea: "From each land cell, run a fresh search with its own visited set and count the island. Correct, but each island is measured once per cell.",
          time: 'O((R·C)²)',
          space: 'O(R·C)',
        },
        {
          name: 'Flood, count, sink',
          idea: "Each flood visits exactly one island, so counting the cells it pops gives that island's area. Sinking cells as we go means each island is measured once.",
          pseudo: `function maxAreaOfIsland(grid):
    best ← 0
    for each cell (r, c) with grid[r][c] = 1:
        size ← 0
        grid[r][c] ← 0; stack ← [(r, c)]
        while stack is not empty:
            (r, c) ← pop from stack
            size ← size + 1
            for each of the 4 neighbors (nr, nc):
                if inside grid and grid[nr][nc] = 1:
                    grid[nr][nc] ← 0
                    push (nr, nc) onto stack
        best ← max(best, size)
    return best`,
          code: `function maxAreaOfIsland(grid) {
  const rows = grid.length, cols = grid[0].length;
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  let best = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] !== 1) continue;
      let size = 0;
      grid[r][c] = 0;
      const stack = [[r, c]];
      while (stack.length) {
        const [cr, cc] = stack.pop();
        size++;
        for (const [dr, dc] of dirs) {
          const nr = cr + dr, nc = cc + dc;
          if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue;
          if (grid[nr][nc] !== 1) continue;
          grid[nr][nc] = 0;
          stack.push([nr, nc]);
        }
      }
      best = Math.max(best, size);
    }
  }
  return best;
}`,
          time: 'O(R·C)',
          space: 'O(R·C)',
        },
      ],
      fn: 'maxAreaOfIsland',
      starter: `function maxAreaOfIsland(grid) {
  // return the size of the largest island
  return 0;
}`,
      solution: `function maxAreaOfIsland(grid) {
  const rows = grid.length, cols = grid[0].length;
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  let best = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] !== 1) continue;
      let size = 0;
      grid[r][c] = 0;
      const stack = [[r, c]];
      while (stack.length) {
        const [cr, cc] = stack.pop();
        size++;
        for (const [dr, dc] of dirs) {
          const nr = cr + dr, nc = cc + dc;
          if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue;
          if (grid[nr][nc] !== 1) continue;
          grid[nr][nc] = 0;
          stack.push([nr, nc]);
        }
      }
      best = Math.max(best, size);
    }
  }
  return best;
}`,
      tests: [
        { name: 'two islands, 3 and 4', args: [[[1, 1, 0, 0], [1, 0, 0, 1], [0, 0, 1, 1], [0, 0, 0, 1]]], expected: 4 },
        { name: 'no land', args: [[[0, 0, 0], [0, 0, 0]]], expected: 0 },
        { name: 'one cell', args: [[[1]]], expected: 1 },
        { name: 'checkerboard corners', args: [[[1, 0, 1], [0, 1, 0], [1, 0, 1]]], expected: 1 },
        { name: 'all land', args: [[[1, 1, 1], [1, 1, 1]]], expected: 6 },
        { name: 'one row', args: [[[1, 0, 1, 1, 1]]], expected: 3 },
      ],
      takeaway: 'A flood fill can return something: count, sum, or bounds of the region.',
    },
    {
      id: 'graphs-number-of-enclaves',
      title: 'Trapped land',
      difficulty: 'medium',
      leetcode: 1020,
      pattern: 'Flood fill from the border',
      statement:
        "A grid has `1` (land) and `0` (sea). You can walk between land cells that touch up, down, left or right. Stepping off the edge of the grid means you escaped. Return the number of land cells from which you **cannot** escape, no matter how you walk.",
      examples: [
        { input: 'grid = [[0,0,0,0],[1,0,1,0],[0,1,1,0],[0,0,0,0]]', output: '3', explain: 'The left 1 is on the border. The other three are boxed in.' },
        { input: 'grid = [[0,1,1,0],[0,0,1,0],[0,0,1,0],[0,0,0,0]]', output: '0', explain: 'That island touches the top edge.' },
      ],
      constraints: ['1 ≤ rows, cols ≤ 500', 'cells are 0 or 1'],
      hints: [
        "Asking \"can this cell escape?\" for every cell is slow. Flip the question.",
        "Which cells can escape for sure? Land on the border, and anything connected to it.",
        "Flood (sink) from every border land cell first. Whatever land is left is trapped: count it.",
      ],
      approaches: [
        {
          name: 'Search from every land cell',
          idea: "For each land cell, search its island and see if any cell sits on the border. Correct, but repeats the search for every cell of the same island.",
          time: 'O((R·C)²)',
          space: 'O(R·C)',
        },
        {
          name: 'Sink everything reachable from the border',
          idea: "A cell can escape exactly when it is connected to a border land cell. So flood from all border land cells and sink them. The land that survives is trapped. Starting from the target (the edge) instead of from every cell is a trick worth remembering.",
          pseudo: `function numEnclaves(grid):
    for each cell (r, c) on the border with grid[r][c] = 1:
        sink(grid, r, c)                // flood fill to 0
    count ← 0
    for each cell (r, c):
        if grid[r][c] = 1: count ← count + 1
    return count`,
          code: `function numEnclaves(grid) {
  const rows = grid.length, cols = grid[0].length;
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  const sink = (r, c) => {
    if (grid[r][c] !== 1) return;
    grid[r][c] = 0;
    const stack = [[r, c]];
    while (stack.length) {
      const [cr, cc] = stack.pop();
      for (const [dr, dc] of dirs) {
        const nr = cr + dr, nc = cc + dc;
        if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue;
        if (grid[nr][nc] !== 1) continue;
        grid[nr][nc] = 0;
        stack.push([nr, nc]);
      }
    }
  };
  for (let r = 0; r < rows; r++) {
    sink(r, 0);
    sink(r, cols - 1);
  }
  for (let c = 0; c < cols; c++) {
    sink(0, c);
    sink(rows - 1, c);
  }
  let count = 0;
  for (const row of grid) for (const cell of row) count += cell;
  return count;
}`,
          time: 'O(R·C)',
          space: 'O(R·C)',
        },
      ],
      fn: 'numEnclaves',
      starter: `function numEnclaves(grid) {
  // count land cells that cannot reach the edge
  return 0;
}`,
      solution: `function numEnclaves(grid) {
  const rows = grid.length, cols = grid[0].length;
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  const sink = (r, c) => {
    if (grid[r][c] !== 1) return;
    grid[r][c] = 0;
    const stack = [[r, c]];
    while (stack.length) {
      const [cr, cc] = stack.pop();
      for (const [dr, dc] of dirs) {
        const nr = cr + dr, nc = cc + dc;
        if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue;
        if (grid[nr][nc] !== 1) continue;
        grid[nr][nc] = 0;
        stack.push([nr, nc]);
      }
    }
  };
  for (let r = 0; r < rows; r++) {
    sink(r, 0);
    sink(r, cols - 1);
  }
  for (let c = 0; c < cols; c++) {
    sink(0, c);
    sink(rows - 1, c);
  }
  let count = 0;
  for (const row of grid) for (const cell of row) count += cell;
  return count;
}`,
      tests: [
        { name: 'three trapped cells', args: [[[0, 0, 0, 0], [1, 0, 1, 0], [0, 1, 1, 0], [0, 0, 0, 0]]], expected: 3 },
        { name: 'island touches the top', args: [[[0, 1, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 0, 0]]], expected: 0 },
        { name: 'all land escapes', args: [[[1, 1, 1], [1, 1, 1], [1, 1, 1]]], expected: 0 },
        { name: 'one cell in the middle', args: [[[0, 0, 0], [0, 1, 0], [0, 0, 0]]], expected: 1 },
        { name: 'single border cell', args: [[[1]]], expected: 0 },
        { name: 'trapped 2 × 2 block', args: [[[0, 0, 0, 0], [0, 1, 1, 0], [0, 1, 1, 0], [0, 0, 0, 0]]], expected: 4 },
      ],
      takeaway: 'Flip the question: flood from the boundary, then look at what was not reached.',
    },
  ],
  quiz: [
    {
      prompt: "How many islands does `[['1','1','0'],['0','1','0'],['0','0','1']]` have?",
      options: ['1', '2', '3', '0'],
      answer: 1,
      explanation: "The top-left three cells join up/down/left/right. The bottom-right cell touches them only at a corner, so it is a second island.",
    },
    {
      prompt: "Why can a recursive flood fill crash on a 300 × 300 grid of all land?",
      options: ['It visits cells twice', 'The recursion can go about 90,000 calls deep and overflow the call stack', 'Grids cannot be graphs', 'It runs in `O(n²)`'],
      answer: 1,
      explanation: "The flood can snake through every cell before returning. JS call stacks hold roughly 10,000 frames. An explicit stack array has no such limit.",
    },
    {
      prompt: "In JavaScript, what does `if (grid[r][c])` do when the cell is the string `'0'`?",
      options: ['Skips it, because `\'0\'` is falsy', 'Enters the `if`, because a non-empty string is truthy', 'Throws an error', 'Converts it to the number 0 first'],
      answer: 1,
      explanation: "Only the empty string is a falsy string. Compare with `=== '1'` instead.",
    },
  ],
  takeaways: [
    "A grid is a graph: each cell has up to 4 neighbors `[[1,0],[-1,0],[0,1],[0,-1]]`, checked for bounds.",
    "Count regions by starting a flood from each unvisited cell; sink or mark cells as you push them.",
    "Prefer an explicit stack over recursion on big grids.",
    "\"Which cells can reach the edge?\" → flood from the edge instead.",
  ],
};

export default lesson;
