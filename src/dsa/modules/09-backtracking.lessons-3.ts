import type { Lesson } from '../types';

// ---------------------------------------------------------------------------
// Lesson 5: grid search
// ---------------------------------------------------------------------------

const gridLesson: Lesson = {
  id: 'grid-search',
  title: 'Grid search: mark, explore, unmark',
  summary: 'Walk a grid one cell at a time, mark where you have been, and restore it on the way back so other paths can use it.',
  minutes: 20,
  blocks: [
    {
      kind: 'callout',
      tone: 'story',
      title: 'Boggle',
      text: "In Boggle you shake 16 letter dice into a 4 × 4 grid and hunt for words by sliding from a letter to a neighbouring letter, never using the same die twice in one word. A Boggle checker does exactly what you do: start at every cell, try every direction, and back up as soon as the letters stop matching.",
    },
    {
      kind: 'text',
      text: "**The problem.** Given a grid of letters and a `word`, return `true` if the word can be traced through neighbouring cells (up, down, left, right; no diagonals) using each cell at most once.",
    },
    {
      kind: 'diagram',
      title: "Finding 'ABCCED'",
      art: `        col 0  1  2  3
row 0       A  B  C  E
row 1       S  F  C  S
row 2       A  D  E  E

A(0,0) → B(0,1) → C(0,2) → C(1,2)
       → E(2,2) → D(2,1)              found`,
      caption: 'Each step moves to a neighbour and must match the next letter of the word.',
    },
    {
      kind: 'text',
      text: "**Brute force first.** List every path of L cells (L = length of the word) from every starting cell, then compare each path with the word. From each cell a path can go 4 ways, then 3 ways (not straight back), and so on: about rows × cols × 4 × 3ᴸ⁻¹ paths. It works, but it fully builds paths like `A → S → A → D ...` that already failed at the second letter.",
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'Stop at the first wrong letter, and lend cells back',
      text: "Walk and compare at the same time: at step k the cell must hold `word[k]`, or you back up at once. To stop one path from using a cell twice, **mark** it (write `'#'` in it) before going deeper, and **restore** the letter on the way back. Restoring matters: the cell was off-limits only for *this* path. Another path might need it.",
    },
    {
      kind: 'trace',
      title: "Searching 'ABCCED' (directions tried: down, up, right, left)",
      columns: ['step', 'cell', 'holds', 'need', 'action'],
      rows: [
        [1, '(0,0)', 'A', 'A', 'match, mark #'],
        [2, '(1,0)', 'S', 'B', 'mismatch, back up'],
        [3, '(0,1)', 'B', 'B', 'match, mark #'],
        [4, '(1,1)', 'F', 'C', 'mismatch, back up'],
        [5, '(0,2)', 'C', 'C', 'match, mark #'],
        [6, '(1,2)', 'C', 'C', 'match, mark #'],
        [7, '(2,2)', 'E', 'E', 'match, mark #'],
        [8, '(1,2)', '#', 'D', 'on this path, skip'],
        [9, '(2,3)', 'E', 'D', 'mismatch, back up'],
        [10, '(2,1)', 'D', 'D', 'match: last letter, true'],
      ],
      note: "Off-board moves (like going up from row 0) are skipped and not shown. Step 8 is the mark doing its job: the path can't step back onto its own C.",
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Word search',
      code: `function exist(board, word):
    for r from 0 to rows - 1:
        for c from 0 to cols - 1:
            if dfs(r, c, 0): return true
    return false

function dfs(r, c, k):                 // can word[k..] start at (r, c)?
    if k = length of word: return true
    if (r, c) is off the board: return false
    if board[r][c] ≠ word[k]: return false     // wrong letter or '#'
    saved ← board[r][c]
    board[r][c] ← '#'                           // mark: choose
    found ← dfs(r + 1, c, k + 1) or dfs(r - 1, c, k + 1)
            or dfs(r, c + 1, k + 1) or dfs(r, c - 1, k + 1)
    board[r][c] ← saved                         // restore: un-choose
    return found`,
    },
    {
      kind: 'code',
      lang: 'js',
      code: `function exist(board, word) {
  const rows = board.length;
  const cols = board[0].length;
  function dfs(r, c, k) {
    if (k === word.length) return true;
    if (r < 0 || r >= rows || c < 0 || c >= cols) return false;
    if (board[r][c] !== word[k]) return false;
    const saved = board[r][c];
    board[r][c] = '#'; // mark
    const found =
      dfs(r + 1, c, k + 1) || dfs(r - 1, c, k + 1) ||
      dfs(r, c + 1, k + 1) || dfs(r, c - 1, k + 1);
    board[r][c] = saved; // restore
    return found;
  }
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (dfs(r, c, 0)) return true;
    }
  }
  return false;
}`,
    },
    {
      kind: 'callout',
      tone: 'tip',
      title: 'Cheap checks before you search',
      text: "Count letters first: if the word needs three `E`s and the board has two, return `false` without searching at all. And if the word's last letter is rarer on the board than its first letter, search for the reversed word instead: fewer cells match the first letter, so fewer paths ever start.",
    },
    {
      kind: 'compare',
      title: 'Word search, word length L',
      rows: [
        { approach: 'Build every path, compare at the end', time: 'O(rows · cols · 3ᴸ)', space: 'O(L)', note: 'Every path is grown to full length.' },
        { approach: 'Backtracking with early stop', time: 'O(rows · cols · 3ᴸ) worst case', space: 'O(L) recursion', note: 'Most paths die at the first or second letter, so the real cost is tiny.' },
      ],
    },
    {
      kind: 'text',
      text: "**Islands vs. word search.** In module 13 you will flood-fill islands on a grid and mark cells as visited *forever*. Here you **unmark** on the way back. Rule of thumb: asking 'can this cell be reached at all?' → mark forever. Asking about **paths** (one path uses a cell once, but different paths may share it) → restore.",
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Grid backtracking template',
      code: `function explore(r, c, state):
    if (r, c) is off the board, blocked, or on the path: return
    mark (r, c) as on the path                 // choose
    update the answer using state
    for each (dr, dc) in [(1,0), (-1,0), (0,1), (0,-1)]:
        explore(r + dr, c + dc, next state)    // explore
    unmark (r, c)                              // un-choose`,
    },
    {
      kind: 'callout',
      tone: 'trap',
      title: 'Restore on every way out',
      text: "If you `return true` from the middle of the loop before writing the letter back, the board stays changed. In word search that's harmless because you're done. But in problems that keep searching (like the gold mine below), a forgotten restore silently blocks that cell for every later path. Store the result in a variable, restore, *then* return.",
    },
  ],
  problems: [
    {
      id: 'backtracking-word-search',
      title: 'Word Search',
      difficulty: 'medium',
      leetcode: 79,
      pattern: 'Grid backtracking (mark and restore)',
      statement: "You're building a Boggle checker. Given a grid `board` of letters and a `word`, return `true` if the word can be traced through neighbouring cells (up, down, left, right) using each cell at most once, and `false` otherwise.",
      examples: [
        { input: "board = [['A','B','C','E'],['S','F','C','S'],['A','D','E','E']], word = 'ABCCED'", output: 'true' },
        { input: "same board, word = 'SEE'", output: 'true' },
        { input: "same board, word = 'ABCB'", output: 'false', explain: 'The path would have to step back onto the B it already used.' },
      ],
      constraints: ['1 ≤ rows, cols ≤ 6', '1 ≤ word.length ≤ 15', 'board and word have only English letters'],
      hints: [
        'Try every cell as a start. From a start, what must be true about each next cell?',
        'Write `dfs(r, c, k)`: does `word[k..]` start at `(r, c)`? Fail fast on off-board cells and wrong letters.',
        "Before exploring the 4 neighbours, set `board[r][c] = '#'` so this path can't reuse it. After, put the letter back.",
      ],
      approaches: [
        {
          name: 'Build every path, then compare',
          idea: 'From every cell, generate every path of word-length cells that never repeats a cell, then check whether its letters spell the word. Correct, but it grows paths long after they stopped matching.',
          time: 'O(rows · cols · 3ᴸ)',
          space: 'O(L)',
        },
        {
          name: 'Backtracking with mark and restore',
          idea: 'Compare as you walk and back up on the first mismatch. Marking the current path with `#` stops reuse, and restoring on the way back lets other paths use the cell.',
          pseudo: `function exist(board, word):
    for each cell (r, c):
        if dfs(r, c, 0): return true
    return false

function dfs(r, c, k):
    if k = length of word: return true
    if (r, c) off the board or board[r][c] ≠ word[k]: return false
    saved ← board[r][c]
    board[r][c] ← '#'
    found ← dfs on any of the 4 neighbours with k + 1
    board[r][c] ← saved
    return found`,
          code: `function exist(board, word) {
  const rows = board.length;
  const cols = board[0].length;
  function dfs(r, c, k) {
    if (k === word.length) return true;
    if (r < 0 || r >= rows || c < 0 || c >= cols) return false;
    if (board[r][c] !== word[k]) return false;
    const saved = board[r][c];
    board[r][c] = '#';
    const found =
      dfs(r + 1, c, k + 1) || dfs(r - 1, c, k + 1) ||
      dfs(r, c + 1, k + 1) || dfs(r, c - 1, k + 1);
    board[r][c] = saved;
    return found;
  }
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (dfs(r, c, 0)) return true;
    }
  }
  return false;
}`,
          time: 'O(rows · cols · 3ᴸ) worst case',
          space: 'O(L) recursion depth',
        },
      ],
      fn: 'exist',
      starter: `function exist(board, word) {
  // can word be traced through neighbouring cells?
  return false;
}`,
      solution: `function exist(board, word) {
  const rows = board.length;
  const cols = board[0].length;
  function dfs(r, c, k) {
    if (k === word.length) return true;
    if (r < 0 || r >= rows || c < 0 || c >= cols) return false;
    if (board[r][c] !== word[k]) return false;
    const saved = board[r][c];
    board[r][c] = '#';
    const found =
      dfs(r + 1, c, k + 1) || dfs(r - 1, c, k + 1) ||
      dfs(r, c + 1, k + 1) || dfs(r, c - 1, k + 1);
    board[r][c] = saved;
    return found;
  }
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (dfs(r, c, 0)) return true;
    }
  }
  return false;
}`,
      tests: [
        { name: 'classic path', args: [[['A', 'B', 'C', 'E'], ['S', 'F', 'C', 'S'], ['A', 'D', 'E', 'E']], 'ABCCED'], expected: true },
        { name: 'short word', args: [[['A', 'B', 'C', 'E'], ['S', 'F', 'C', 'S'], ['A', 'D', 'E', 'E']], 'SEE'], expected: true },
        { name: 'would reuse a cell', args: [[['A', 'B', 'C', 'E'], ['S', 'F', 'C', 'S'], ['A', 'D', 'E', 'E']], 'ABCB'], expected: false },
        { name: 'one cell, match', args: [[['A']], 'A'], expected: true },
        { name: 'one cell, no match', args: [[['A']], 'B'], expected: false },
        { name: 'needs a cell twice', args: [[['a', 'a']], 'aaa'], expected: false },
        { name: 'snake through the grid', args: [[['a', 'b', 'c'], ['f', 'e', 'd'], ['g', 'h', 'i']], 'abcdefghi'], expected: true },
        { name: 'diagonal not allowed', args: [[['a', 'x'], ['x', 'b']], 'ab'], expected: false },
        { name: 'dead end then success', args: [[['C', 'A', 'A'], ['A', 'A', 'A'], ['B', 'C', 'D']], 'AAB'], expected: true },
      ],
      takeaway: 'Mark the cell, try the 4 neighbours, unmark. Stop at the first mismatch.',
    },
    {
      id: 'backtracking-max-gold',
      title: 'Path with Maximum Gold',
      difficulty: 'medium',
      leetcode: 1219,
      pattern: 'Grid backtracking (mark and restore)',
      statement: "A gold mine is a grid. Each cell holds some gold, or `0` for rock. A miner may start at any cell with gold, step up, down, left or right, and collects the gold of every cell he enters. He can't step on rock, can't enter the same cell twice, and may stop whenever he likes. Return the most gold he can collect.",
      examples: [
        { input: 'grid = [[0,6,0],[5,8,7],[0,9,0]]', output: '24', explain: 'Path 9 → 8 → 7.' },
        { input: 'grid = [[1,0,7],[2,0,6],[3,4,5],[0,3,0],[9,0,20]]', output: '28', explain: 'Path 1 → 2 → 3 → 4 → 5 → 6 → 7.' },
      ],
      constraints: ['1 ≤ rows, cols ≤ 15', '0 ≤ grid[r][c] ≤ 100', 'at most 25 cells hold gold'],
      hints: [
        'You need the best over *all* paths from *all* gold cells. Small numbers (≤ 25 gold cells) say: just try them.',
        'Write `walk(r, c)` that returns the most gold you can collect starting at `(r, c)`, never reusing a cell.',
        'Inside `walk`: take the gold, set the cell to 0 (now it looks like rock, so no reuse), get the best of the 4 neighbours, put the gold back, and return gold + best.',
      ],
      approaches: [
        {
          name: 'Backtracking with a copied visited set',
          idea: 'From every gold cell, explore every path. Pass along a set of visited cells and copy it at each step so branches never share it. Correct, but copying a set at every step is slow and memory-hungry.',
          code: `function getMaximumGold(grid) {
  const rows = grid.length;
  const cols = grid[0].length;
  function walk(r, c, seen) {
    if (r < 0 || r >= rows || c < 0 || c >= cols) return 0;
    if (grid[r][c] === 0 || seen.has(r * cols + c)) return 0;
    const next = new Set(seen);
    next.add(r * cols + c);
    return grid[r][c] + Math.max(
      walk(r + 1, c, next), walk(r - 1, c, next),
      walk(r, c + 1, next), walk(r, c - 1, next));
  }
  let best = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) best = Math.max(best, walk(r, c, new Set()));
  }
  return best;
}`,
          time: 'O(g² · 3ᵍ), g = gold cells',
          space: 'O(g²)',
        },
        {
          name: 'Backtracking, mark in place',
          idea: 'Mark the cell by setting it to 0 (it now looks like rock), explore the 4 neighbours, and put the gold back. No copies: one grid serves every path, and restoring keeps it correct for the next path.',
          pseudo: `function getMaximumGold(grid):
    best ← 0
    for each cell (r, c) with gold:
        best ← max(best, walk(r, c))
    return best

function walk(r, c):                    // most gold starting at (r, c)
    if (r, c) is off the grid or grid[r][c] = 0: return 0
    gold ← grid[r][c]
    grid[r][c] ← 0                      // mark: looks like rock now
    more ← max(walk(r + 1, c), walk(r - 1, c),
               walk(r, c + 1), walk(r, c - 1))
    grid[r][c] ← gold                   // restore
    return gold + more`,
          code: `function getMaximumGold(grid) {
  const rows = grid.length;
  const cols = grid[0].length;
  function walk(r, c) {
    if (r < 0 || r >= rows || c < 0 || c >= cols) return 0;
    if (grid[r][c] === 0) return 0;
    const gold = grid[r][c];
    grid[r][c] = 0; // mark
    const more = Math.max(
      walk(r + 1, c), walk(r - 1, c),
      walk(r, c + 1), walk(r, c - 1));
    grid[r][c] = gold; // restore
    return gold + more;
  }
  let best = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] > 0) best = Math.max(best, walk(r, c));
    }
  }
  return best;
}`,
          time: 'O(g · 3ᵍ) worst case, g = gold cells',
          space: 'O(g) recursion depth',
        },
      ],
      fn: 'getMaximumGold',
      starter: `function getMaximumGold(grid) {
  // most gold collected on one path
  return 0;
}`,
      solution: `function getMaximumGold(grid) {
  const rows = grid.length;
  const cols = grid[0].length;
  function walk(r, c) {
    if (r < 0 || r >= rows || c < 0 || c >= cols) return 0;
    if (grid[r][c] === 0) return 0;
    const gold = grid[r][c];
    grid[r][c] = 0;
    const more = Math.max(
      walk(r + 1, c), walk(r - 1, c),
      walk(r, c + 1), walk(r, c - 1));
    grid[r][c] = gold;
    return gold + more;
  }
  let best = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] > 0) best = Math.max(best, walk(r, c));
    }
  }
  return best;
}`,
      tests: [
        { name: 'plus shape', args: [[[0, 6, 0], [5, 8, 7], [0, 9, 0]]], expected: 24 },
        { name: 'long winding path', args: [[[1, 0, 7], [2, 0, 6], [3, 4, 5], [0, 3, 0], [9, 0, 20]]], expected: 28 },
        { name: 'all rock', args: [[[0, 0], [0, 0]]], expected: 0 },
        { name: 'one cell', args: [[[5]]], expected: 5 },
        { name: 'one row', args: [[[1, 2, 3]]], expected: 6 },
        { name: 'rock splits the row', args: [[[1, 0, 4]]], expected: 4 },
        { name: 'full 3 × 3', args: [[[1, 1, 1], [1, 1, 1], [1, 1, 1]]], expected: 9 },
        { name: 'branch choice matters', args: [[[1, 1, 10], [1, 0, 0], [50, 0, 0]]], expected: 63 },
      ],
      takeaway: 'Setting a cell to a "blocked" value and restoring it is the cheapest visited-marker there is.',
    },
  ],
  quiz: [
    {
      prompt: 'Why do we restore a cell after exploring from it?',
      options: [
        'To save memory',
        'Another path may need that cell later',
        'To stop infinite loops',
        'Because the input must never change',
      ],
      answer: 1,
      explanation: 'The mark only means "on the current path". Once this path backs up, other paths may go through the cell.',
    },
    {
      prompt: 'Flood-filling islands (module 13) vs. word search: which one unmarks cells on the way back?',
      options: ['Islands', 'Word search', 'Both', 'Neither'],
      answer: 1,
      explanation: 'Islands only ask "reachable or not?", so a cell is done once seen. Word search asks about paths, so cells must be lent back.',
    },
    {
      prompt: 'The word needs three `E`s and the board has only two. Best move?',
      options: ['Search anyway', 'Return false right away', 'Search for the reversed word', 'Sort the board'],
      answer: 1,
      explanation: 'No path can spell the word, so a quick letter count saves the whole search.',
    },
  ],
  takeaways: [
    'Grid backtracking: mark the cell, try the 4 neighbours, unmark.',
    'Stopping at the first mismatch is what makes it fast.',
    'Paths share cells → restore. "Is it reachable?" → mark forever.',
  ],
};

// ---------------------------------------------------------------------------
// Lesson 6: pruning — N-Queens and friends
// ---------------------------------------------------------------------------

const pruningLesson: Lesson = {
  id: 'pruning-n-queens',
  title: 'Pruning: N-Queens and failing fast',
  summary: 'Check the rules the moment you place something, use sets for instant checks, and order your choices so dead ends show up early.',
  minutes: 25,
  blocks: [
    {
      kind: 'callout',
      tone: 'story',
      title: 'How a Sudoku app solves in a blink',
      text: "A Sudoku app solves a hard puzzle in milliseconds. It doesn't try every way to fill the grid. It places one digit, checks its row, column and box right away, and backs up the moment a rule breaks. That habit is **pruning**: cutting off branches of the search tree that can't possibly work. The classic puzzle for practising it is from 1848: put 8 chess queens on a board so that no two attack each other.",
    },
    {
      kind: 'text',
      text: "**The problem.** Place `n` queens on an `n × n` board so no two share a row, a column or a diagonal (a queen attacks along all of these). Return every such board. For n = 4 there are exactly 2.",
    },
    {
      kind: 'diagram',
      title: 'The two answers for n = 4',
      art: `solution 1      solution 2
. Q . .         . . Q .
. . . Q         Q . . .
Q . . .         . . . Q
. . Q .         . Q . .`,
    },
    {
      kind: 'text',
      text: "**Brute force first.** Choose any n of the n² squares and check the board. For n = 8 that's about 4.4 billion boards. A smarter brute force: every row must hold exactly one queen, so just pick a column for each row. That's 8⁸ = 16,777,216 boards, each checked at the end. It works, but it's slow.",
    },
    {
      kind: 'text',
      text: "**Spot the waste.** If the queens in rows 0 and 1 already attack each other, it doesn't matter where the other 6 go. The brute force still fills all 8 rows, 8⁶ = 262,144 ways for the last six, before it notices.",
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'Check on placement, with three sets',
      text: "Place queens row by row. Before putting a queen at `(row, col)`, ask three questions that each take O(1) time: is this **column** taken? Is this `\\` **diagonal** taken? Is this `/` **diagonal** taken? The trick: every square on one `\\` diagonal has the same `row - col`, and every square on one `/` diagonal has the same `row + col`. So keep three sets: `cols`, `diag1` (row - col) and `diag2` (row + col).",
    },
    {
      kind: 'diagram',
      title: 'Diagonal ids on a 4 × 4 board',
      art: String.raw`row - col  (same along each \ diagonal)
      c0  c1  c2  c3
r0     0  -1  -2  -3
r1     1   0  -1  -2
r2     2   1   0  -1
r3     3   2   1   0

row + col  (same along each / diagonal)
      c0  c1  c2  c3
r0     0   1   2   3
r1     1   2   3   4
r2     2   3   4   5
r3     3   4   5   6`,
      caption: 'One number names a whole diagonal, so "is this diagonal taken?" is a single set lookup.',
    },
    {
      kind: 'steps',
      title: 'Row-by-row search for n = 4 (cell i = column of the queen in row i)',
      frames: [
        { cells: [0, '', '', ''], active: [0], pointers: { row: 0 }, vars: { cols: '{0}', 'row-col': '{0}', 'row+col': '{0}' }, note: 'Row 0: column 0 is free. Place a queen there.' },
        { cells: [0, 2, '', ''], active: [1], pointers: { row: 1 }, vars: { cols: '{0,2}', 'row-col': '{0,-1}', 'row+col': '{0,3}' }, note: 'Row 1: column 0 is taken, and column 1 shares a `\\` diagonal with the first queen (row - col = 0). Column 2 is safe.' },
        { cells: [0, 2, '', ''], active: [2], pointers: { row: 2 }, note: 'Row 2: columns 0 and 2 are taken, column 1 hits row+col = 3, column 3 hits row-col = -1. Dead end: back up.' },
        { cells: [0, 3, '', ''], active: [1], pointers: { row: 1 }, vars: { cols: '{0,3}', 'row-col': '{0,-2}', 'row+col': '{0,4}' }, note: 'Move the row-1 queen to column 3.' },
        { cells: [0, 3, 1, ''], active: [2], pointers: { row: 2 }, note: 'Row 2: column 1 is safe.' },
        { cells: [0, 3, 1, ''], active: [3], pointers: { row: 3 }, note: 'Row 3: every column is attacked. Back up. Row 2 and row 1 have nothing left to try either.' },
        { cells: [1, '', '', ''], active: [0], pointers: { row: 0 }, note: 'Move the row-0 queen to column 1. Notice: no board starting 0, 2 ever reached row 3. That is pruning.' },
        { cells: [1, 3, 0, 2], found: [0, 1, 2, 3], note: 'Row 1 → column 3, row 2 → column 0, row 3 → column 2. All four placed: save this board.' },
      ],
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'N-Queens',
      code: `function solveNQueens(n):
    result ← empty list
    queens ← empty list                 // queens[row] = column
    cols ← empty set
    diag1 ← empty set                   // row - col
    diag2 ← empty set                   // row + col
    function place(row):
        if row = n:
            append the board drawn from queens to result
            return
        for col from 0 to n - 1:
            if col in cols or (row - col) in diag1 or (row + col) in diag2:
                continue                // attacked: prune
            add col to cols, row - col to diag1, row + col to diag2
            push col onto queens
            place(row + 1)
            pop from queens
            remove col from cols, row - col from diag1, row + col from diag2
    place(0)
    return result`,
    },
    {
      kind: 'code',
      lang: 'js',
      code: `function solveNQueens(n) {
  const result = [];
  const queens = [];
  const cols = new Set();
  const diag1 = new Set(); // row - col
  const diag2 = new Set(); // row + col
  function place(row) {
    if (row === n) {
      result.push(queens.map((c) => '.'.repeat(c) + 'Q' + '.'.repeat(n - c - 1)));
      return;
    }
    for (let col = 0; col < n; col++) {
      if (cols.has(col) || diag1.has(row - col) || diag2.has(row + col)) continue;
      cols.add(col); diag1.add(row - col); diag2.add(row + col);
      queens.push(col);
      place(row + 1);
      queens.pop();
      cols.delete(col); diag1.delete(row - col); diag2.delete(row + col);
    }
  }
  place(0);
  return result;
}`,
    },
    {
      kind: 'trace',
      title: 'How much pruning saves',
      columns: ['n', 'answers', 'boards checked (one per row)', 'queens placed with pruning'],
      rows: [
        [4, 2, '256', '16'],
        [5, 10, '3,125', '53'],
        [6, 4, '46,656', '152'],
        [8, 92, '16,777,216', '2,056'],
      ],
      note: 'For n = 8, pruning places about 2 thousand queens instead of checking almost 17 million full boards.',
    },
    {
      kind: 'compare',
      title: 'N-Queens',
      rows: [
        { approach: 'Any n squares, check at the end', time: 'O(n² · C(n², n))', space: 'O(n)', note: 'About 4.4 billion boards for n = 8.' },
        { approach: 'One queen per row, check at the end', time: 'O(n · nⁿ)', space: 'O(n)', note: 'Rows are free, but columns and diagonals are checked too late.' },
        { approach: 'Row by row + 3 sets', time: 'under O(n!), tiny in practice', space: 'O(n)', note: 'Each check is O(1) and a bad queen ends its branch at once.' },
      ],
    },
    {
      kind: 'list',
      items: [
        '**Check on placement**, not at the end: N-Queens, Beautiful Arrangement.',
        '**Quick "impossible" checks** before searching: a total that can\'t split evenly, a piece bigger than its slot, a letter the board doesn\'t have.',
        '**Biggest first**: place the largest pieces first so overflow shows up near the top of the tree (Matchsticks below).',
        '**Skip look-alike choices**: if two buckets are equally full, putting the next piece in either gives the same future, so only try one.',
      ],
    },
    {
      kind: 'text',
      text: "**The pattern.** Signals: 'place items so no rule is broken', 'fill a board', 'can it be split into ...', with small n. Template: the usual choose → explore → un-choose, plus a `canPlace` check that runs *before* choosing and is backed by sets or counters, so it costs O(1).",
    },
    {
      kind: 'callout',
      tone: 'trap',
      title: 'Diagonals and drawing the board',
      text: "`row - col` can be negative. That's fine in a `Set`, but if you use arrays instead, shift it: `row - col + n - 1`. And build each saved board as fresh strings, `'.'.repeat(col) + 'Q' + '.'.repeat(n - col - 1)`. Don't keep one board array and save it, or you hit the copy trap from lesson 1 again.",
    },
  ],
  problems: [
    {
      id: 'backtracking-n-queens',
      title: 'N-Queens (stretch)',
      difficulty: 'hard',
      leetcode: 51,
      pattern: 'Backtracking with pruning (sets)',
      statement: "**Stretch problem.** Place `n` queens on an `n × n` chessboard so that no two attack each other: no shared row, column or diagonal. Return every solution as a list of `n` strings, where row `i` has `'Q'` for the queen and `'.'` for empty squares. The solutions can be in any order.",
      examples: [
        { input: 'n = 4', output: "[['.Q..','...Q','Q...','..Q.'], ['..Q.','Q...','...Q','.Q..']]" },
        { input: 'n = 1', output: "[['Q']]" },
      ],
      constraints: ['1 ≤ n ≤ 9'],
      hints: [
        'Every row holds exactly one queen. So recurse over rows and choose a column for each.',
        'Before placing at `(row, col)`, check the column and both diagonals. Which number stays the same along a `\\` diagonal? Along a `/` diagonal?',
        'Use 3 sets: `cols`, `row - col` and `row + col`. Add on choose, delete on un-choose. Build the strings only when `row === n`.',
      ],
      approaches: [
        {
          name: 'One queen per row, check at the end',
          idea: 'Pick any column for every row (nⁿ boards), then keep the boards where no two queens share a column or diagonal. Correct, but it fills all rows even after an early clash.',
          code: `function solveNQueens(n) {
  const result = [];
  const queens = [];
  function ok() {
    for (let a = 0; a < n; a++) {
      for (let b = a + 1; b < n; b++) {
        if (queens[a] === queens[b]) return false;
        if (Math.abs(queens[a] - queens[b]) === b - a) return false;
      }
    }
    return true;
  }
  function place(row) {
    if (row === n) {
      if (ok()) result.push(queens.map((c) => '.'.repeat(c) + 'Q' + '.'.repeat(n - c - 1)));
      return;
    }
    for (let col = 0; col < n; col++) {
      queens.push(col);
      place(row + 1);
      queens.pop();
    }
  }
  place(0);
  return result;
}`,
          time: 'O(n² · nⁿ)',
          space: 'O(n)',
        },
        {
          name: 'Row by row with 3 sets',
          idea: 'Place one queen per row and only in a square whose column and two diagonals are free. Squares on one diagonal share `row - col` (or `row + col`), so each check is one set lookup, and an attacked square ends that branch at once.',
          pseudo: `function solveNQueens(n):
    result ← empty list
    queens ← empty list                 // queens[row] = column
    cols, diag1, diag2 ← three empty sets
    function place(row):
        if row = n:
            append the board drawn from queens to result
            return
        for col from 0 to n - 1:
            if col in cols or (row - col) in diag1 or (row + col) in diag2:
                continue
            add col to cols, row - col to diag1, row + col to diag2
            push col onto queens
            place(row + 1)
            pop from queens
            remove col from cols, row - col from diag1, row + col from diag2
    place(0)
    return result`,
          code: `function solveNQueens(n) {
  const result = [];
  const queens = [];
  const cols = new Set();
  const diag1 = new Set();
  const diag2 = new Set();
  function place(row) {
    if (row === n) {
      result.push(queens.map((c) => '.'.repeat(c) + 'Q' + '.'.repeat(n - c - 1)));
      return;
    }
    for (let col = 0; col < n; col++) {
      if (cols.has(col) || diag1.has(row - col) || diag2.has(row + col)) continue;
      cols.add(col); diag1.add(row - col); diag2.add(row + col);
      queens.push(col);
      place(row + 1);
      queens.pop();
      cols.delete(col); diag1.delete(row - col); diag2.delete(row + col);
    }
  }
  place(0);
  return result;
}`,
          time: 'O(n!) worst case, far less in practice',
          space: 'O(n)',
        },
      ],
      fn: 'solveNQueens',
      starter: `function solveNQueens(n) {
  // every board with n non-attacking queens
  return [];
}`,
      solution: `function solveNQueens(n) {
  const result = [];
  const queens = [];
  const cols = new Set();
  const diag1 = new Set();
  const diag2 = new Set();
  function place(row) {
    if (row === n) {
      result.push(queens.map((c) => '.'.repeat(c) + 'Q' + '.'.repeat(n - c - 1)));
      return;
    }
    for (let col = 0; col < n; col++) {
      if (cols.has(col) || diag1.has(row - col) || diag2.has(row + col)) continue;
      cols.add(col); diag1.add(row - col); diag2.add(row + col);
      queens.push(col);
      place(row + 1);
      queens.pop();
      cols.delete(col); diag1.delete(row - col); diag2.delete(row + col);
    }
  }
  place(0);
  return result;
}`,
      compare: 'unordered',
      tests: [
        { name: 'n = 1', args: [1], expected: [['Q']] },
        { name: 'n = 2 (impossible)', args: [2], expected: [] },
        { name: 'n = 3 (impossible)', args: [3], expected: [] },
        { name: 'n = 4', args: [4], expected: [['.Q..','...Q','Q...','..Q.'],['..Q.','Q...','...Q','.Q..']] },
        { name: 'n = 5', args: [5], expected: [['Q....','..Q..','....Q','.Q...','...Q.'],['Q....','...Q.','.Q...','....Q','..Q..'],['.Q...','...Q.','Q....','..Q..','....Q'],['.Q...','....Q','..Q..','Q....','...Q.'],['..Q..','Q....','...Q.','.Q...','....Q'],['..Q..','....Q','.Q...','...Q.','Q....'],['...Q.','Q....','..Q..','....Q','.Q...'],['...Q.','.Q...','....Q','..Q..','Q....'],['....Q','.Q...','...Q.','Q....','..Q..'],['....Q','..Q..','Q....','...Q.','.Q...']] },
        { name: 'n = 6', args: [6], expected: [['.Q....','...Q..','.....Q','Q.....','..Q...','....Q.'],['..Q...','.....Q','.Q....','....Q.','Q.....','...Q..'],['...Q..','Q.....','....Q.','.Q....','.....Q','..Q...'],['....Q.','..Q...','Q.....','.....Q','...Q..','.Q....']] },
      ],
      takeaway: 'Same diagonal ⇔ same `row - col` or same `row + col`. Sets make every safety check O(1).',
    },
    {
      id: 'backtracking-matchsticks',
      title: 'Matchsticks to Square',
      difficulty: 'medium',
      leetcode: 473,
      pattern: 'Backtracking with pruning (buckets)',
      statement: "A kid has matchsticks with lengths `matchsticks`. Can they use **every** stick, without breaking any, to form a square? Each stick goes on exactly one side. Return `true` or `false`.",
      examples: [
        { input: 'matchsticks = [1, 1, 2, 2, 2]', output: 'true', explain: 'Sides: 2, 2, 2 and 1 + 1.' },
        { input: 'matchsticks = [3, 3, 3, 3, 4]', output: 'false', explain: 'The total is 16, so each side must be 4, but four 3s can never make a 4.' },
      ],
      constraints: ['1 ≤ matchsticks.length ≤ 15', '1 ≤ matchsticks[i] ≤ 10⁸'],
      hints: [
        'The total must split into 4 equal sides. Which quick checks rule out a square before any search?',
        'Give each stick to one of 4 sides: 4 choices per stick. Keep a `sides` array with the 4 running lengths.',
        'Sort the sticks longest first. Skip a side if the stick would overflow it, and skip a side whose length equals one you already tried for this stick (same future).',
      ],
      approaches: [
        {
          name: 'Try every side for every stick',
          idea: 'Each stick goes to one of 4 sides: 4ⁿ ways. At the end, check that all four sides are equal. Correct, but 4¹⁵ is about a billion.',
          code: `function makesquare(matchsticks) {
  const sides = [0, 0, 0, 0];
  function place(i) {
    if (i === matchsticks.length) {
      return sides[0] === sides[1] && sides[1] === sides[2] && sides[2] === sides[3];
    }
    for (let s = 0; s < 4; s++) {
      sides[s] += matchsticks[i];
      if (place(i + 1)) return true;
      sides[s] -= matchsticks[i];
    }
    return false;
  }
  return place(0);
}`,
          time: 'O(4ⁿ)',
          space: 'O(n)',
        },
        {
          name: 'Sort + prune',
          idea: "Check the total first (must divide by 4, no stick longer than a side). Place sticks longest first so overflows show up early, never let a side go over its target, and don't try two sides that are equally full: they lead to the same future. If every stick fits, every side is exactly full.",
          pseudo: `function makesquare(sticks):
    total ← sum of sticks
    if total mod 4 ≠ 0: return false
    side ← total / 4
    sort sticks descending                     // biggest first
    if sticks[0] > side: return false
    sides ← [0, 0, 0, 0]
    function place(i):
        if i = n: return true                  // all used, none overflowed
        tried ← empty set
        for s from 0 to 3:
            if sides[s] + sticks[i] > side: continue
            if sides[s] in tried: continue     // same fill, same future
            add sides[s] to tried
            sides[s] ← sides[s] + sticks[i]    // choose
            if place(i + 1): return true       // explore
            sides[s] ← sides[s] - sticks[i]    // un-choose
        return false
    return place(0)`,
          code: `function makesquare(matchsticks) {
  const total = matchsticks.reduce((a, b) => a + b, 0);
  if (total % 4 !== 0) return false;
  const side = total / 4;
  matchsticks.sort((a, b) => b - a); // longest first
  if (matchsticks[0] > side) return false;
  const sides = [0, 0, 0, 0];
  function place(i) {
    if (i === matchsticks.length) return true;
    const tried = new Set();
    for (let s = 0; s < 4; s++) {
      if (sides[s] + matchsticks[i] > side) continue;
      if (tried.has(sides[s])) continue;
      tried.add(sides[s]);
      sides[s] += matchsticks[i];
      if (place(i + 1)) return true;
      sides[s] -= matchsticks[i];
    }
    return false;
  }
  return place(0);
}`,
          time: 'O(4ⁿ) worst case, tiny in practice',
          space: 'O(n)',
        },
      ],
      fn: 'makesquare',
      starter: `function makesquare(matchsticks) {
  // can all sticks form a square?
  return false;
}`,
      solution: `function makesquare(matchsticks) {
  const total = matchsticks.reduce((a, b) => a + b, 0);
  if (total % 4 !== 0) return false;
  const side = total / 4;
  matchsticks.sort((a, b) => b - a);
  if (matchsticks[0] > side) return false;
  const sides = [0, 0, 0, 0];
  function place(i) {
    if (i === matchsticks.length) return true;
    const tried = new Set();
    for (let s = 0; s < 4; s++) {
      if (sides[s] + matchsticks[i] > side) continue;
      if (tried.has(sides[s])) continue;
      tried.add(sides[s]);
      sides[s] += matchsticks[i];
      if (place(i + 1)) return true;
      sides[s] -= matchsticks[i];
    }
    return false;
  }
  return place(0);
}`,
      tests: [
        { name: 'two short sticks make a side', args: [[1, 1, 2, 2, 2]], expected: true },
        { name: 'right total, wrong pieces', args: [[3, 3, 3, 3, 4]], expected: false },
        { name: 'four equal sticks', args: [[5, 5, 5, 5]], expected: true },
        { name: 'fewer than four sticks', args: [[1, 1, 1]], expected: false },
        { name: 'pieces too long to combine', args: [[2, 2, 2, 2, 2, 2]], expected: false },
        { name: 'one stick too long', args: [[1, 1, 1, 9]], expected: false },
        { name: 'three per side', args: [[5, 5, 5, 5, 4, 4, 4, 4, 3, 3, 3, 3]], expected: true },
        { name: 'fifteen sticks, works', args: [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]], expected: true },
        { name: 'fifteen sticks, fails', args: [[6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 8]], expected: false },
      ],
      takeaway: 'Fail fast: quick total checks, biggest pieces first, and never try two look-alike choices.',
    },
  ],
  quiz: [
    {
      prompt: 'Squares `(2, 0)` and `(0, 2)` are on the same diagonal. Which one?',
      options: ['The `\\` diagonal (same `row - col`)', 'The `/` diagonal (same `row + col`)', 'Neither', 'Both'],
      answer: 1,
      explanation: '2 + 0 = 2 and 0 + 2 = 2, so they share `row + col`. Their `row - col` values are 2 and -2.',
    },
    {
      prompt: 'Why place queens row by row?',
      options: [
        'It looks nicer',
        'Each row needs exactly one queen, so rows never need checking',
        'Chess rules require it',
        'It makes diagonal clashes impossible',
      ],
      answer: 1,
      explanation: 'Building row by row bakes the row rule into the search, so only columns and diagonals need checks.',
    },
    {
      prompt: 'Matchsticks with a total length of 18. What should the code do?',
      options: ['Start the search', 'Return false right away', 'Sort and try 4.5 per side', 'Remove the longest stick'],
      answer: 1,
      explanation: '18 does not divide by 4, so no square is possible. A one-line check skips the whole search.',
    },
    {
      prompt: 'What is pruning?',
      options: [
        'Removing items from the input',
        'Stopping a branch as soon as it cannot lead to an answer',
        'Saving a copy of the path',
        'Sorting the answers at the end',
      ],
      answer: 1,
      explanation: 'Every branch you cut early removes its whole subtree from the search.',
    },
  ],
  takeaways: [
    '**Pruning** = check the rules at placement time and drop a branch the moment it breaks one.',
    'N-Queens: one queen per row, sets for columns, `row - col` and `row + col`.',
    'Fail fast: quick impossibility checks, biggest pieces first, skip look-alike choices.',
  ],
};

export const lessonsPart3: Lesson[] = [gridLesson, pruningLesson];
