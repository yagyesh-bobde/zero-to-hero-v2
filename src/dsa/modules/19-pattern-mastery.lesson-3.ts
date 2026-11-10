import type { Lesson } from '../types';

// Module 19, lesson 3. Owner: Content J.

const surroundedPseudo = `function solve(board):
    m ← number of rows, n ← number of columns
    dirs ← [(1, 0), (-1, 0), (0, 1), (0, -1)]   // down, up, right, left
    stack ← empty
    for each cell (r, c) on the border:
        if board[r][c] = 'O':
            board[r][c] ← 'S'                    // S = safe, touches the edge
            push (r, c) onto stack
    while stack is not empty:
        (r, c) ← pop from stack
        for each (dr, dc) in dirs:
            nr ← r + dr, nc ← c + dc
            if 0 ≤ nr ≤ m - 1 and 0 ≤ nc ≤ n - 1 and board[nr][nc] = 'O':
                board[nr][nc] ← 'S'
                push (nr, nc) onto stack
    for each cell (r, c):                        // cleanup pass
        if board[r][c] = 'S': board[r][c] ← 'O'  // un-mark: safe
        else: board[r][c] ← 'X'                  // leftover 'O' was trapped
    return board`;

const surroundedCode = `function solve(board) {
  const m = board.length;
  if (m === 0) return board;
  const n = board[0].length;
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  const stack = [];
  // 1. Every 'O' on the border is safe. Mark it 'S' and remember it.
  for (let r = 0; r < m; r++) {
    for (let c = 0; c < n; c++) {
      const onBorder = r === 0 || c === 0 || r === m - 1 || c === n - 1;
      if (onBorder && board[r][c] === 'O') {
        board[r][c] = 'S';
        stack.push([r, c]);
      }
    }
  }
  // 2. Spread "safe" to every 'O' connected to a safe cell.
  while (stack.length) {
    const [r, c] = stack.pop();
    for (const [dr, dc] of dirs) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr < 0 || nr >= m || nc < 0 || nc >= n) continue; // off the board
      if (board[nr][nc] !== 'O') continue;
      board[nr][nc] = 'S';
      stack.push([nr, nc]);
    }
  }
  // 3. Cleanup: 'S' goes back to 'O', every other 'O' was trapped.
  for (let r = 0; r < m; r++) {
    for (let c = 0; c < n; c++) {
      board[r][c] = board[r][c] === 'S' ? 'O' : 'X';
    }
  }
  return board;
}`;

const spiralPseudo = `function spiralOrder(matrix):
    out ← empty list
    top ← 0, bottom ← rows - 1
    left ← 0, right ← cols - 1
    while top ≤ bottom and left ≤ right:
        for c from left to right: append matrix[top][c] to out
        top ← top + 1
        for r from top to bottom: append matrix[r][right] to out
        right ← right - 1
        if top ≤ bottom:                   // a bottom row is still left
            for c from right down to left: append matrix[bottom][c] to out
            bottom ← bottom - 1
        if left ≤ right:                   // a left column is still left
            for r from bottom down to top: append matrix[r][left] to out
            left ← left + 1
    return out`;

const spiralCode = `function spiralOrder(matrix) {
  const out = [];
  if (matrix.length === 0) return out;
  let top = 0;
  let bottom = matrix.length - 1;
  let left = 0;
  let right = matrix[0].length - 1;
  while (top <= bottom && left <= right) {
    for (let c = left; c <= right; c++) out.push(matrix[top][c]);
    top++;
    for (let r = top; r <= bottom; r++) out.push(matrix[r][right]);
    right--;
    if (top <= bottom) {
      for (let c = right; c >= left; c--) out.push(matrix[bottom][c]);
      bottom--;
    }
    if (left <= right) {
      for (let r = bottom; r >= top; r--) out.push(matrix[r][left]);
      left++;
    }
  }
  return out;
}`;

const lifePseudo = `function gameOfLife(board):
    // 2 = was alive, now dead.   3 = was dead, now alive.
    for each cell (r, c):
        live ← 0
        for each of the 8 neighbors (nr, nc) inside the board:
            if board[nr][nc] = 1 or board[nr][nc] = 2:   // alive BEFORE this round
                live ← live + 1
        if board[r][c] = 1 and (live < 2 or live > 3):
            board[r][c] ← 2
        else if board[r][c] = 0 and live = 3:
            board[r][c] ← 3
    for each cell (r, c):                                // cleanup pass
        if board[r][c] = 2: board[r][c] ← 0
        if board[r][c] = 3: board[r][c] ← 1
    return board`;

const lifeCode = `function gameOfLife(board) {
  const m = board.length;
  const n = board[0].length;
  // 2 = was alive, now dead. 3 = was dead, now alive.
  const wasAlive = (v) => v === 1 || v === 2;
  for (let r = 0; r < m; r++) {
    for (let c = 0; c < n; c++) {
      let live = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < m && nc >= 0 && nc < n && wasAlive(board[nr][nc])) live++;
        }
      }
      if (board[r][c] === 1 && (live < 2 || live > 3)) board[r][c] = 2;
      else if (board[r][c] === 0 && live === 3) board[r][c] = 3;
    }
  }
  for (let r = 0; r < m; r++) {
    for (let c = 0; c < n; c++) {
      if (board[r][c] === 2) board[r][c] = 0;
      else if (board[r][c] === 3) board[r][c] = 1;
    }
  }
  return board;
}`;

const pacificPseudo = `function pacificAtlantic(heights):
    pacific ← climb(every cell in the top row and the left column)
    atlantic ← climb(every cell in the bottom row and the right column)
    return every (r, c), row by row, where pacific[r][c] and atlantic[r][c]

function climb(starts):                      // water flows backwards: uphill
    seen ← grid of false
    mark every start as seen, queue ← starts
    while queue is not empty:
        (r, c) ← queue.popFront()
        for each neighbor (nr, nc) inside the grid:
            if not seen[nr][nc] and heights[nr][nc] ≥ heights[r][c]:
                seen[nr][nc] ← true
                push (nr, nc) to queue
    return seen`;

const pacificCode = `function pacificAtlantic(heights) {
  const m = heights.length;
  const n = heights[0].length;
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];

  // Reverse flow: from the ocean, climb to cells that are as high or higher.
  const climb = (starts) => {
    const seen = Array.from({ length: m }, () => Array(n).fill(false));
    const queue = [];
    for (const [r, c] of starts) {
      if (!seen[r][c]) {
        seen[r][c] = true;
        queue.push([r, c]);
      }
    }
    for (let i = 0; i < queue.length; i++) {
      const [r, c] = queue[i];
      for (const [dr, dc] of dirs) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr < 0 || nr >= m || nc < 0 || nc >= n) continue;
        if (seen[nr][nc] || heights[nr][nc] < heights[r][c]) continue;
        seen[nr][nc] = true;
        queue.push([nr, nc]);
      }
    }
    return seen;
  };

  const pacificStarts = [];
  const atlanticStarts = [];
  for (let r = 0; r < m; r++) {
    pacificStarts.push([r, 0]);
    atlanticStarts.push([r, n - 1]);
  }
  for (let c = 0; c < n; c++) {
    pacificStarts.push([0, c]);
    atlanticStarts.push([m - 1, c]);
  }
  const pacific = climb(pacificStarts);
  const atlantic = climb(atlanticStarts);

  const out = [];
  for (let r = 0; r < m; r++) {
    for (let c = 0; c < n; c++) {
      if (pacific[r][c] && atlantic[r][c]) out.push([r, c]);
    }
  }
  return out;
}`;

const lesson: Lesson = {
  id: 'mixed-grids',
  title: 'Mixed set B: grids & matrices',
  summary: 'A grid hides three families: walk it, update it all at once, or search it. Learn to tell them apart.',
  minutes: 25,
  blocks: [
    {
      kind: 'callout',
      tone: 'story',
      title: 'One photo, three algorithms',
      text: "You open a photo in an editor. A photo is just a grid of pixels. **Rotate** it: every pixel moves to a new spot in a fixed order. **Blur** it: every pixel becomes the average of its neighbors, all at the same time. **Paint bucket**: click one pixel and every connected pixel of the same color changes. Same grid. Three totally different algorithms.",
    },
    {
      kind: 'text',
      text: "Lesson 1's flow chart says *grid → BFS / DFS*. That is only part of the story. *Grid* is not a pattern. It hides three families, and picking the wrong one wastes your whole interview. The fix is one question: **what does each cell need?** A fixed visiting order? Its neighbors' *old* values? Or to know what it is *connected* to?",
    },
    {
      kind: 'table',
      title: 'Grid signals → family',
      head: ['You see…', 'Family', 'Key move', 'Module'],
      rows: [
        ['*spiral*, *rotate*, *layer by layer*', 'Walk', 'Shrink four boundaries, no search', 'none'],
        ['*all cells at once*, *in place*', 'Update all at once', 'Old + new state in one cell, then clean up', '18 (bit idea)'],
        ['*connected*, *region*, *island*', 'Search', 'DFS/BFS with a `dirs` array', '13'],
        ['*can reach the edge*, *nearest exit*', 'Search backwards', 'Start from the border or all targets', '13'],
        ['*fewest steps*, *minutes until all…*', 'BFS in layers', 'One layer = one step', '13'],
        ['*only right or down*, *count paths*', 'Grid DP, not search', '`dp[r][c]` from above and left', '17'],
      ],
    },
    {
      kind: 'list',
      ordered: true,
      items: [
        "**Does each cell just get visited once, in a fixed order?** Walk. Keep `top`, `bottom`, `left`, `right` and shrink them. No visited set, no search.",
        "**Does each cell's new value depend on its neighbors' old values, and must you work in place?** Update all at once. If you overwrite a cell too early, its neighbors read the *new* value by mistake.",
        "**Does the answer depend on what a cell can reach?** Search. Then ask the follow-up: *can I start from the border or the target instead of from every cell?*",
      ],
    },
    {
      kind: 'text',
      text: "Worked example. A board has `'X'` walls and `'O'` land. A group of `'O'` cells that touch each other up/down/left/right is a *region*. A region is **trapped** if none of its cells is on the edge of the board. Turn every trapped `'O'` into `'X'`. Regions that touch the edge stay.",
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Brute force: ask every cell',
      code: `function solveBrute(board):
    for each cell (r, c) with board[r][c] = 'O':
        region ← flood fill from (r, c) over 'O' cells
        if no cell in region is on the border:
            remember (r, c) as trapped
    turn every remembered cell into 'X'`,
    },
    {
      kind: 'text',
      text: "It works. But a big region of 1,000 cells gets flooded 1,000 times, once from each of its cells. On an all-`'O'` board that is `(mn)` floods of `(mn)` cells each: **O((mn)²)**. You could fix it with a visited set and decide each region once, but then you must collect every region's cells and wait to learn its fate. There is a simpler way.",
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'Flip the question',
      text: "Don't ask *which regions are trapped?* Ask *which `'O'` cells are safe?* A cell is safe only if it connects to an `'O'` on the border. So **start at the border**. Every `'O'` you can reach from there is safe. Everything you never reach is trapped. One search, every cell touched once: **O(mn)**.",
    },
    {
      kind: 'diagram',
      title: 'Mark from the border, then flip',
      art: `  before          mark from border     cleanup
  X X X X X       X X X X X            X X X X X
  X O O X X       X O O X X            X X X X X
  X X O X X       X X O X X            X X X X X
  X O X O O       X S X S S            X O X O O
  X O X X X       X S X X X            X O X X X

  border O's: (3,4) and (4,1)
  (3,4) spreads to (3,3); (4,1) spreads to (3,1)
  the middle O's are never reached: trapped`,
      caption: "`S` means *safe*. In the cleanup pass, `S` turns back into `'O'` and every `'O'` still left becomes `'X'`.",
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Reverse search from the border',
      code: surroundedPseudo,
    },
    {
      kind: 'code',
      lang: 'js',
      title: 'Surrounded regions in JavaScript',
      code: surroundedCode,
    },
    {
      kind: 'compare',
      title: 'Surrounded regions',
      rows: [
        { approach: 'Flood fill from every O', time: 'O((mn)²)', space: 'O(mn)', note: 'Same region flooded again and again.' },
        { approach: 'Flood each region once, decide later', time: 'O(mn)', space: 'O(mn)', note: 'Fast, but you must store each region until you know if it touched the edge.' },
        { approach: 'Search backwards from the border', time: 'O(mn)', space: 'O(mn)', note: 'Anything reached is safe, decided on the spot. Best and simplest.' },
      ],
    },
    {
      kind: 'callout',
      tone: 'tip',
      title: 'The dirs idiom',
      text: "Every grid search uses the same two lines. `const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]]` lists the 4 moves. Then `nr = r + dr`, `nc = c + dc`, and **check bounds first**: `if (nr < 0 || nr >= m || nc < 0 || nc >= n) continue`. Need all 8 neighbors, diagonals included? Loop `dr` and `dc` from -1 to 1 and skip `(0, 0)`.",
    },
    {
      kind: 'callout',
      tone: 'trap',
      title: 'Three grid traps',
      text: "**1. Forgetting to un-mark.** If you leave the temporary `'S'` on the board, the answer is wrong. Always end with a cleanup pass. **2. Recursion depth.** A recursive DFS on a 200×200 all-`'O'` board can go 40,000 calls deep and crash with *Maximum call stack size exceeded*. Use an explicit stack or queue, like the code above. **3. Shared rows.** `Array(m).fill(Array(n).fill(0))` makes `m` pointers to ONE row: change one cell and every row changes. Use `Array.from({ length: m }, () => Array(n).fill(0))`, and copy a grid with `grid.map((row) => [...row])`.",
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Template: reverse search from the border (or targets)',
      code: `// Question: which cells can reach the border / a target?
// Don't search from every cell. Start at the goal and walk back.
seen ← grid of false
queue ← every border (or target) cell that qualifies
mark them seen
while queue is not empty:
    (r, c) ← queue.popFront()
    for each (dr, dc) in dirs:
        nr ← r + dr, nc ← c + dc
        if (nr, nc) is inside and not seen[nr][nc]
           and the move (nr, nc) → (r, c) is allowed:
            seen[nr][nc] ← true
            push (nr, nc) to queue
// seen now holds every cell that can reach the goal`,
    },
  ],
  problems: [
    {
      id: 'pattern-mastery-surrounded-regions',
      title: 'Capture the trapped land',
      difficulty: 'medium',
      leetcode: 130,
      pattern: 'Mixed set B',
      statement:
        "In a territory game, the board is a grid of `'X'` (your walls) and `'O'` (enemy land). Enemy cells that touch up, down, left or right form one group. A group that has **no cell on the edge of the board** is fully surrounded, so you capture it: every cell in it becomes `'X'`. A group with at least one cell on the edge escapes and stays `'O'`. Diagonal touches do not count. Change the board in place, and also **return the board so we can check it**.",
      examples: [
        {
          input: "board = [['X','X','X','X'],['X','O','O','X'],['X','X','X','X'],['X','O','X','O']]",
          output: "[['X','X','X','X'],['X','X','X','X'],['X','X','X','X'],['X','O','X','O']]",
          explain: "The two `'O'` cells in row 1 form a group with no edge cell, so they are captured. Both `'O'` cells in the bottom row are on the edge, so they stay.",
        },
      ],
      constraints: ['1 ≤ rows, cols ≤ 200', "every cell is 'X' or 'O'"],
      hints: [
        "Which pattern fits? Look at the words *group of touching cells* and *on the edge*. And ask yourself: is it easier to find the trapped groups, or the free ones?",
        "This is grid search, DFS/BFS from module 13. The twist: don't start from every `'O'`. Start only from the `'O'` cells on the border.",
        "Mark every `'O'` you can reach from a border `'O'` with a temporary letter like `'S'`. Then one last pass: `'S'` → `'O'`, every other `'O'` → `'X'`.",
      ],
      approaches: [
        {
          name: 'Flood fill from every O',
          idea: "For each `'O'`, flood its whole region and check if any cell is on the border. Correct, but a region of k cells gets flooded k times, so the same work repeats.",
          pseudo: `for each cell (r, c) with board[r][c] = 'O':
    region ← flood fill from (r, c)
    if no cell in region is on the border:
        remember (r, c) as trapped
turn every remembered cell into 'X'`,
          time: 'O((mn)²)',
          space: 'O(mn)',
        },
        {
          name: 'Search backwards from the border',
          idea: "A cell is safe exactly when it connects to a border `'O'`. So start from every border `'O'` at once and mark what you reach as safe. Each cell is marked at most once. Whatever stays unmarked is trapped.",
          pseudo: surroundedPseudo,
          code: surroundedCode,
          time: 'O(mn)',
          space: 'O(mn)',
        },
      ],
      fn: 'solve',
      starter: `function solve(board) {
  // turn every trapped 'O' into 'X', then return the board
  return board;
}`,
      solution: surroundedCode,
      tests: [
        { name: '1×1 wall', args: [[['X']]], expected: [['X']] },
        { name: '1×1 land is on the edge', args: [[['O']]], expected: [['O']] },
        {
          name: 'all O: everything touches the edge',
          args: [[['O', 'O', 'O'], ['O', 'O', 'O'], ['O', 'O', 'O']]],
          expected: [['O', 'O', 'O'], ['O', 'O', 'O'], ['O', 'O', 'O']],
        },
        { name: 'no O at all', args: [[['X', 'X', 'X'], ['X', 'X', 'X']]], expected: [['X', 'X', 'X'], ['X', 'X', 'X']] },
        {
          name: 'lesson board: border regions + trapped middle',
          args: [[['X', 'X', 'X', 'X', 'X'], ['X', 'O', 'O', 'X', 'X'], ['X', 'X', 'O', 'X', 'X'], ['X', 'O', 'X', 'O', 'O'], ['X', 'O', 'X', 'X', 'X']]],
          expected: [['X', 'X', 'X', 'X', 'X'], ['X', 'X', 'X', 'X', 'X'], ['X', 'X', 'X', 'X', 'X'], ['X', 'O', 'X', 'O', 'O'], ['X', 'O', 'X', 'X', 'X']],
        },
        {
          name: 'ring around a hole: all trapped',
          args: [[['X', 'X', 'X', 'X', 'X'], ['X', 'O', 'O', 'O', 'X'], ['X', 'O', 'X', 'O', 'X'], ['X', 'O', 'O', 'O', 'X'], ['X', 'X', 'X', 'X', 'X']]],
          expected: [['X', 'X', 'X', 'X', 'X'], ['X', 'X', 'X', 'X', 'X'], ['X', 'X', 'X', 'X', 'X'], ['X', 'X', 'X', 'X', 'X'], ['X', 'X', 'X', 'X', 'X']],
        },
        {
          name: 'long path reaches the edge',
          args: [[['X', 'X', 'X', 'X'], ['X', 'O', 'O', 'X'], ['X', 'X', 'O', 'X'], ['X', 'X', 'O', 'X']]],
          expected: [['X', 'X', 'X', 'X'], ['X', 'O', 'O', 'X'], ['X', 'X', 'O', 'X'], ['X', 'X', 'O', 'X']],
        },
        {
          name: 'diagonal touch does not save you',
          args: [[['X', 'X', 'X', 'X'], ['X', 'O', 'X', 'X'], ['X', 'X', 'O', 'X'], ['X', 'X', 'X', 'O']]],
          expected: [['X', 'X', 'X', 'X'], ['X', 'X', 'X', 'X'], ['X', 'X', 'X', 'X'], ['X', 'X', 'X', 'O']],
        },
        { name: 'single row: every cell is on the edge', args: [[['O', 'X', 'O', 'O', 'X']]], expected: [['O', 'X', 'O', 'O', 'X']] },
      ],
      takeaway: "*Which cells connect to the edge?* → search backwards from the border once, instead of from every cell.",
    },
    {
      id: 'pattern-mastery-spiral-order',
      title: 'Spiral reveal',
      difficulty: 'medium',
      leetcode: 54,
      pattern: 'Mixed set B',
      statement:
        "A loading screen reveals an image tile by tile, in a spiral: across the top row left to right, down the right column, back along the bottom row right to left, up the left column, and then the same again one ring further in, until every tile is shown. Given the grid of tiles `matrix`, return the tile values in the order they are revealed.",
      examples: [
        {
          input: 'matrix = [[1,2,3],[4,5,6],[7,8,9]]',
          output: '[1,2,3,6,9,8,7,4,5]',
          explain: 'Outer ring: 1 2 3, then 6 9, then 8 7, then 4. The inner ring is just 5.',
        },
        { input: 'matrix = [[1,2,3,4],[5,6,7,8],[9,10,11,12]]', output: '[1,2,3,4,8,12,11,10,9,5,6,7]' },
      ],
      constraints: ['1 ≤ rows, cols ≤ 10', '-100 ≤ matrix[r][c] ≤ 100'],
      hints: [
        "Which pattern fits? You are not looking for anything. Every cell is visited exactly once, in a fixed order. So what do you need to keep track of, instead of a visited set?",
        "This is a walk / simulation: pure index bookkeeping, no search. Keep four boundaries `top`, `bottom`, `left`, `right`, and shrink one after each side you walk.",
        "Loop while `top ≤ bottom` and `left ≤ right`: top row, then `top++`; right column, then `right--`; bottom row backwards only if `top ≤ bottom`, then `bottom--`; left column upwards only if `left ≤ right`, then `left++`.",
      ],
      approaches: [
        {
          name: 'Walk and turn, with a visited grid',
          idea: "Walk right, and turn clockwise whenever the next cell is off the grid or already visited. It works because the spiral always turns at a wall, but it needs an extra `m × n` grid of booleans.",
          pseudo: `seen ← grid of false, dirs ← [right, down, left, up], d ← 0
(r, c) ← (0, 0)
repeat rows × cols times:
    append matrix[r][c] to out, seen[r][c] ← true
    if next cell in direction d is outside or seen:
        d ← (d + 1) mod 4
    step (r, c) in direction d`,
          time: 'O(mn)',
          space: 'O(mn)',
        },
        {
          name: 'Four shrinking boundaries',
          idea: "The walls of the spiral are just four numbers. After you walk the top row, that row is used up, so `top` moves down by one. Same for the other three sides. The two `if` checks stop you from walking a single leftover row or column twice.",
          pseudo: spiralPseudo,
          code: spiralCode,
          time: 'O(mn)',
          space: 'O(1) extra',
        },
      ],
      fn: 'spiralOrder',
      starter: `function spiralOrder(matrix) {
  // return the values in spiral order, outside in
  return [];
}`,
      solution: spiralCode,
      tests: [
        { name: '1×1', args: [[[7]]], expected: [7] },
        { name: 'single row', args: [[[1, 2, 3, 4]]], expected: [1, 2, 3, 4] },
        { name: 'single column', args: [[[1], [2], [3]]], expected: [1, 2, 3] },
        { name: '2×2', args: [[[1, 2], [3, 4]]], expected: [1, 2, 4, 3] },
        { name: '3×3 square', args: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]]], expected: [1, 2, 3, 6, 9, 8, 7, 4, 5] },
        { name: '3×4 wide', args: [[[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]]], expected: [1, 2, 3, 4, 8, 12, 11, 10, 9, 5, 6, 7] },
        { name: '4×3 tall', args: [[[1, 2, 3], [4, 5, 6], [7, 8, 9], [10, 11, 12]]], expected: [1, 2, 3, 6, 9, 12, 11, 10, 7, 4, 5, 8] },
        {
          name: '4×4 two full rings',
          args: [[[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12], [13, 14, 15, 16]]],
          expected: [1, 2, 3, 4, 8, 12, 16, 15, 14, 13, 9, 5, 6, 7, 11, 10],
        },
      ],
      takeaway: "*Visit every cell once in a fixed shape (spiral, layers)* → walk with shrinking boundaries, no search.",
    },
    {
      id: 'pattern-mastery-game-of-life',
      title: 'One tick of the Game of Life',
      difficulty: 'medium',
      leetcode: 289,
      pattern: 'Mixed set B',
      statement:
        "A tiny screensaver shows a grid of cells: `1` is alive, `0` is dead. Each cell has up to 8 neighbors (diagonals count). Every tick, **all cells change at the same time**, using the board as it was *before* the tick: a live cell with 2 or 3 live neighbors stays alive, any other live cell dies; a dead cell with exactly 3 live neighbors comes alive, any other dead cell stays dead. The device has almost no spare memory, so update `board` in place, and **return the board so we can check it**.",
      examples: [
        {
          input: 'board = [[0,0,0],[1,1,1],[0,0,0]]',
          output: '[[0,1,0],[0,1,0],[0,1,0]]',
          explain: 'The middle cell has 2 live neighbors and stays. The two ends have 1 each and die. The cells above and below the middle have 3 and are born.',
        },
      ],
      constraints: ['1 ≤ rows, cols ≤ 25', 'board[r][c] is 0 or 1'],
      hints: [
        "Which pattern fits? Read *all cells change at the same time*, *using the board as it was before*, and *in place*. What goes wrong if you overwrite a cell and then its neighbor counts it?",
        "This is the *update all at once* family. Store the old state and the new state in the same cell. A cell can hold more than just 0 and 1 (the same idea as packing bits, module 18).",
        "Use `2` for *was alive, now dead* and `3` for *was dead, now alive*. When counting neighbors, treat `1` and `2` as alive (that is the old state). After the pass, turn `2` → `0` and `3` → `1`.",
      ],
      approaches: [
        {
          name: 'Copy the board first',
          idea: "Make a full copy, read neighbors from the copy, write into the board. Correct because the copy never changes, but it uses `m × n` extra memory.",
          pseudo: `old ← copy of board (copy every row!)
for each cell (r, c):
    live ← number of 1s among the 8 neighbors in old
    board[r][c] ← next state from old[r][c] and live`,
          time: 'O(mn)',
          space: 'O(mn)',
        },
        {
          name: 'Encode old + new in one cell',
          idea: "Values `2` and `3` remember both the old state and the new one. Neighbors still read the old state (`1` or `2` means it *was* alive), so counts stay correct even after you changed a cell. A final pass turns the codes into plain `0` and `1`.",
          pseudo: lifePseudo,
          code: lifeCode,
          time: 'O(mn)',
          space: 'O(1) extra',
        },
      ],
      fn: 'gameOfLife',
      starter: `function gameOfLife(board) {
  // compute one tick in place, then return the board
  return board;
}`,
      solution: lifeCode,
      tests: [
        {
          name: 'blinker flips from flat to standing',
          args: [[[0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 1, 1, 1, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0]]],
          expected: [[0, 0, 0, 0, 0], [0, 0, 1, 0, 0], [0, 0, 1, 0, 0], [0, 0, 1, 0, 0], [0, 0, 0, 0, 0]],
        },
        {
          name: 'block never changes',
          args: [[[0, 0, 0, 0], [0, 1, 1, 0], [0, 1, 1, 0], [0, 0, 0, 0]]],
          expected: [[0, 0, 0, 0], [0, 1, 1, 0], [0, 1, 1, 0], [0, 0, 0, 0]],
        },
        { name: '1×1 alive dies alone', args: [[[1]]], expected: [[0]] },
        { name: 'all dead stays dead', args: [[[0, 0, 0], [0, 0, 0], [0, 0, 0]]], expected: [[0, 0, 0], [0, 0, 0], [0, 0, 0]] },
        { name: 'corner cell is born', args: [[[1, 1], [1, 0]]], expected: [[1, 1], [1, 1]] },
        {
          name: 'crowded: only corners survive',
          args: [[[1, 1, 1], [1, 1, 1], [1, 1, 1]]],
          expected: [[1, 0, 1], [0, 0, 0], [1, 0, 1]],
        },
        {
          name: 'glider moves one step',
          args: [[[0, 1, 0, 0], [0, 0, 1, 0], [1, 1, 1, 0], [0, 0, 0, 0]]],
          expected: [[0, 0, 0, 0], [1, 0, 1, 0], [0, 1, 1, 0], [0, 1, 0, 0]],
        },
        { name: 'single row: edges die', args: [[[1, 1, 1]]], expected: [[0, 1, 0]] },
      ],
      takeaway: "*Every cell updates at once, in place* → store old + new state in the same cell, then a cleanup pass.",
    },
    {
      id: 'pattern-mastery-pacific-atlantic',
      title: 'Rain on the island',
      difficulty: 'medium',
      leetcode: 417,
      pattern: 'Mixed set B',
      statement:
        "An island map is a grid of heights. The **Pacific** ocean touches the top edge and the left edge. The **Atlantic** touches the bottom edge and the right edge. When rain falls on a cell, the water can move up, down, left or right to a neighbor whose height is **less than or equal to** the current one. Water on an edge cell can spill into the ocean on that side. Return every cell `[r, c]` where rain can reach **both** oceans. Any order is fine, but listing them row by row reads best.",
      examples: [
        {
          input: 'heights = [[1,2],[3,4]]',
          output: '[[0,1],[1,0],[1,1]]',
          explain: '`(0,0)` is the lowest cell: water there is stuck and can only reach the Pacific. `(0,1)` touches the top edge (Pacific) and the right edge (Atlantic). `(1,0)` touches the left edge (Pacific) and the bottom edge (Atlantic). `(1,1)` is the highest and can flow down to either.',
        },
      ],
      constraints: ['1 ≤ rows, cols ≤ 200', '0 ≤ heights[r][c] ≤ 10⁵'],
      hints: [
        "Which pattern fits? Look for *flows*, *reach* and *edge*. Starting from every cell and asking *can I reach the edge?* repeats a lot of work. Can you flip the question around?",
        "Grid search (DFS/BFS, module 13), run backwards from the border, just like capturing trapped land. Backwards, water climbs: from a cell, step to a neighbor only if it is **as high or higher**.",
        "Run one search from all Pacific edge cells and one from all Atlantic edge cells, each with its own `seen` grid. The answer is every cell that both searches reached.",
      ],
      approaches: [
        {
          name: 'Search from every cell',
          idea: "From each cell, flow downhill with DFS and note which edges you hit. Correct, but cells high up get explored again and again from every cell above them.",
          pseudo: `for each cell (r, c):
    reached ← DFS from (r, c), moving to neighbors with height ≤ current
    if reached touches top/left edge and bottom/right edge:
        add [r, c] to answer`,
          time: 'O((mn)²)',
          space: 'O(mn)',
        },
        {
          name: 'Reverse search from each ocean',
          idea: "Water flowing down from a cell to the ocean is the same path as climbing up from the ocean to that cell. So start at each ocean's edge and climb to neighbors that are as high or higher. Each search touches every cell at most once. Cells reached by both searches are the answer.",
          pseudo: pacificPseudo,
          code: pacificCode,
          time: 'O(mn)',
          space: 'O(mn)',
        },
      ],
      fn: 'pacificAtlantic',
      starter: `function pacificAtlantic(heights) {
  // return [r, c] for every cell that can reach both oceans
  return [];
}`,
      solution: pacificCode,
      compare: 'unordered',
      tests: [
        { name: '1×1 touches every edge', args: [[[5]]], expected: [[0, 0]] },
        { name: 'single row', args: [[[1, 2, 3]]], expected: [[0, 0], [0, 1], [0, 2]] },
        { name: 'single column', args: [[[3], [1], [2]]], expected: [[0, 0], [1, 0], [2, 0]] },
        { name: 'flat land flows anywhere', args: [[[2, 2], [2, 2]]], expected: [[0, 0], [0, 1], [1, 0], [1, 1]] },
        { name: 'slope: low corner is stuck', args: [[[1, 2], [3, 4]]], expected: [[0, 1], [1, 0], [1, 1]] },
        {
          name: 'valley in the middle is stuck',
          args: [[[3, 3, 3], [3, 1, 3], [3, 3, 3]]],
          expected: [[0, 0], [0, 1], [0, 2], [1, 0], [1, 2], [2, 0], [2, 1], [2, 2]],
        },
        {
          name: 'peak in the middle reaches both',
          args: [[[1, 1, 1], [1, 9, 1], [1, 1, 1]]],
          expected: [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2], [2, 0], [2, 1], [2, 2]],
        },
        {
          name: 'high left side',
          args: [[[4, 3, 2], [5, 1, 1], [6, 5, 2]]],
          expected: [[0, 0], [0, 1], [0, 2], [1, 0], [2, 0]],
        },
      ],
      takeaway: "*Which cells can reach the edge / both edges?* → reverse search from each border (climb uphill), then intersect.",
    },
  ],
  quiz: [
    {
      prompt: "You must rotate a square image 90° clockwise, in place. Which family is this?",
      options: [
        'Graph search from the border (module 13)',
        'Walk / simulate: move cells in a fixed order, layer by layer',
        'Update all at once with 2/3 state codes',
        'Grid DP (module 17)',
      ],
      answer: 1,
      explanation: "Every cell moves to one known spot. Nothing is searched and no cell depends on its neighbors' values. It is pure index bookkeeping, layer by layer, like the spiral.",
    },
    {
      prompt: "In the in-place Game of Life, why write `2` (was alive, now dead) instead of just writing `0`?",
      options: [
        'Because `0` is not allowed in the output',
        'To make the code faster',
        'So that neighbors visited later still see that this cell WAS alive when they count',
        'So that the board uses less memory',
      ],
      answer: 2,
      explanation: "All cells must update from the *old* board. If you wrote `0`, the next cell would count this neighbor as dead and get the wrong answer. `2` keeps the old state (alive) and the new one (dead) in one cell.",
    },
    {
      prompt: "A grid has rooms (`0`), walls (`-1`) and several exits (`E`). For every room you want the distance to its nearest exit. What is the best plan?",
      options: [
        'BFS from every room until it finds an exit',
        'One BFS that starts from all exits at once',
        'Walk the grid in spiral order',
        'DP where each cell looks only up and left',
      ],
      answer: 1,
      explanation: "Searching from every room repeats work: O((mn)²). Flip it: put every exit in the queue at the start (multi-source BFS, module 13). Each room is reached first by its nearest exit, in O(mn). Up-and-left DP fails because the shortest path may need to go in any of the 4 directions.",
    },
    {
      prompt: "You write `const seen = Array(3).fill(Array(3).fill(false))` and then `seen[0][0] = true`. What is `seen[2][0]`?",
      options: ['`false`', '`true`', '`undefined`', 'It throws an error'],
      answer: 1,
      explanation: "`fill` puts the SAME inner array in all 3 slots, so all rows are one row. Use `Array.from({ length: 3 }, () => Array(3).fill(false))` to get 3 separate rows.",
    },
  ],
  takeaways: [
    "A grid is not one pattern. Ask what each cell needs: a fixed visiting order (walk), its neighbors' old values (update all at once), or what it connects to (search).",
    "*Which cells can reach the edge or a target?* → search backwards from the border or targets once, not from every cell.",
    "*All cells change at once, in place* → keep old + new state in the same cell, then a cleanup pass.",
    "Grid search habits: a `dirs` array, bounds check first, an explicit stack/queue for big grids, and `Array.from` for fresh rows.",
  ],
};

export default lesson;
