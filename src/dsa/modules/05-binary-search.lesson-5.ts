import type { Lesson } from '../types';

// Module 5, lesson 5: sorted 2D matrices and binary search inside a design problem.
const lesson: Lesson = {
  id: 'matrix-and-design',
  title: 'Sorted grids and time lookups',
  summary: 'Treat a grid as one long sorted list, and use binary search inside a design problem.',
  minutes: 20,
  blocks: [
    {
      kind: 'callout',
      tone: 'story',
      title: 'A grid that is secretly a list',
      text: "Think of an old printed phone book. Every page is sorted, and every page starts right after the previous page ends. It looks like a stack of pages, but it is really one long sorted list, folded into pages. A calendar works the same way: rows of weeks, but really one long line of days.",
    },
    {
      kind: 'text',
      text: "**The problem.** A grid `matrix` has `m` rows and `n` columns. Each row is sorted, and the first value of each row is bigger than the last value of the row above. Is `target` in the grid? Example: `[[1, 3, 5, 7], [10, 11, 16, 20], [23, 30, 34, 60]]` with `target = 30` gives `true`.",
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Brute force: look at every cell',
      code: `function searchGridSlow(matrix, target):
    for r from 0 to m - 1:
        for c from 0 to n - 1:
            if matrix[r][c] = target:
                return true
    return false`,
    },
    {
      kind: 'text',
      text: "That is 12 checks here and a million for a 1000 × 1000 grid: O(m · n). **Spot the waste:** read the rows one after another: 1, 3, 5, 7, 10, 11, 16, …, 60. That is one sorted list of `m × n` values, and we are scanning it cell by cell.",
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'Unfold the grid with math',
      text: "Pretend the grid is one array of length `m × n`. Position `i` in that array lives at row `floor(i / n)` and column `i % n` (`%` is the remainder after dividing). Now run classic binary search on `0..m·n - 1`, turning each `mid` into a row and column. Nothing gets copied.",
    },
    {
      kind: 'diagram',
      title: 'Position i in the unfolded list',
      art: `       col 0    1    2    3
row 0      1    3    5    7   i = 0..3
row 1     10   11   16   20   i = 4..7
row 2     23   30   34   60   i = 8..11

i = 9  ->  row = floor(9 / 4) = 2
           col = 9 % 4 = 1
           matrix[2][1] = 30`,
      caption: 'Each row holds n = 4 values, so dividing by 4 tells you the row, and the remainder tells you the column.',
    },
    {
      kind: 'steps',
      title: 'Find 30 in the unfolded grid',
      frames: [
        {
          cells: [1, 3, 5, 7, 10, 11, 16, 20, 23, 30, 34, 60],
          pointers: { lo: 0, mid: 5, hi: 11 },
          active: [5],
          vars: { mid: 5, cell: 'row 1, col 1', value: 11 },
          note: '`mid = 5` is row 1, col 1: value 11. 11 < 30, so `lo = 6`.',
        },
        {
          cells: [1, 3, 5, 7, 10, 11, 16, 20, 23, 30, 34, 60],
          pointers: { lo: 6, mid: 8, hi: 11 },
          active: [8],
          done: [0, 1, 2, 3, 4, 5],
          vars: { mid: 8, cell: 'row 2, col 0', value: 23 },
          note: '`mid = 8` is row 2, col 0: value 23. 23 < 30, so `lo = 9`.',
        },
        {
          cells: [1, 3, 5, 7, 10, 11, 16, 20, 23, 30, 34, 60],
          pointers: { lo: 9, mid: 10, hi: 11 },
          active: [10],
          done: [0, 1, 2, 3, 4, 5, 6, 7, 8],
          vars: { mid: 10, cell: 'row 2, col 2', value: 34 },
          note: '`mid = 10` is row 2, col 2: value 34. 34 > 30, so `hi = 9`.',
        },
        {
          cells: [1, 3, 5, 7, 10, 11, 16, 20, 23, 30, 34, 60],
          pointers: { lo: 9, mid: 9, hi: 9 },
          found: [9],
          done: [0, 1, 2, 3, 4, 5, 6, 7, 8, 10, 11],
          vars: { mid: 9, cell: 'row 2, col 1', value: 30 },
          note: '`mid = 9` is row 2, col 1: value 30. Found, in 4 looks out of 12 cells.',
        },
      ],
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Search a chained grid',
      code: `function searchMatrix(matrix, target):
    lo ← 0
    hi ← m × n - 1
    while lo ≤ hi:
        mid ← floor((lo + hi) / 2)
        value ← matrix[floor(mid / n)][mid % n]
        if value = target:
            return true
        else if value < target:
            lo ← mid + 1
        else:
            hi ← mid - 1
    return false`,
    },
    {
      kind: 'code',
      lang: 'js',
      title: 'JavaScript',
      code: `function searchMatrix(matrix, target) {
  const rows = matrix.length;
  const cols = matrix[0].length;
  let lo = 0;
  let hi = rows * cols - 1;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    const value = matrix[Math.floor(mid / cols)][mid % cols];
    if (value === target) return true;
    if (value < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return false;
}`,
    },
    {
      kind: 'text',
      text: "**A weaker grid.** Sometimes each row is sorted and each column is sorted, but rows don't chain: row 2 may start smaller than row 1 ends. Unfolding fails. Start at the **top-right** corner instead. If the value is too big, everything below it in that column is bigger still, so drop the column and move left. If it is too small, everything to its left in that row is smaller, so drop the row and move down. Each step throws away a whole row or column: O(m + n).",
    },
    {
      kind: 'text',
      text: "**Binary search inside a design.** A document editor saves history: `set(\"title\", \"Draft\", 1)`, later `set(\"title\", \"Final\", 5)`. Someone asks: what was the title at time 3? The answer is the value with the **latest time ≤ 3**, which is \"Draft\". Times only go up, so each key's history is a sorted list for free. Then `get` is a binary search: find the first entry with time > 3 (the upper bound from lesson 2), and step back one.",
    },
    {
      kind: 'trace',
      title: 'get("title", t), history = (1, Draft) (5, Final) (9, Done)',
      columns: ['t', 'first index with time > t', 'answer'],
      rows: [
        [0, 0, 'nothing yet: ""'],
        [3, 1, 'history[0] = Draft'],
        [5, 2, 'history[1] = Final'],
        [100, 3, 'history[2] = Done'],
      ],
      note: 'Index 0 means every entry is after `t`, so there is no answer yet.',
    },
    {
      kind: 'compare',
      title: 'Searching a grid',
      rows: [
        { approach: 'Scan every cell', time: 'O(m · n)', space: 'O(1)', note: 'Works on any grid.' },
        {
          approach: 'Binary search each row',
          time: 'O(m log n)',
          space: 'O(1)',
          note: 'Only needs sorted rows.',
        },
        {
          approach: 'Staircase from the top-right',
          time: 'O(m + n)',
          space: 'O(1)',
          note: 'Rows and columns sorted, rows not chained.',
        },
        {
          approach: 'Unfold + one binary search',
          time: 'O(log(m · n))',
          space: 'O(1)',
          note: 'Only when rows chain into one sorted list.',
        },
      ],
    },
    {
      kind: 'list',
      items: [
        '**Grid whose rows continue each other:** unfold it, `row = floor(i / cols)`, `col = i % cols`, then classic search.',
        '**Rows and columns sorted separately:** staircase walk from the top-right corner.',
        '**Design with "value at time t", "latest before", "version at":** keep a sorted list per key and upper-bound into it.',
      ],
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Template: latest entry at or before t',
      code: `// history: list of (time, value), times increasing
function valueAt(history, t):
    lo ← 0
    hi ← length of history
    while lo < hi:              // first entry with time > t
        mid ← floor((lo + hi) / 2)
        if history[mid].time > t:
            hi ← mid
        else:
            lo ← mid + 1
    if lo = 0:
        return nothing          // every entry is after t
    return history[lo - 1].value`,
    },
    {
      kind: 'callout',
      tone: 'trap',
      title: 'Rows vs columns, and the empty answer',
      text: "Unfolding divides by the number of **columns**: `row = Math.floor(i / cols)`, `col = i % cols`. Dividing by the number of rows only works on square grids, so square test cases hide the bug. Always test one wide grid and one tall grid. In the design, a `get` with a time before the first `set` must return `\"\"`. That is the `lo = 0` case. Forget it and you read `history[-1]`, which is `undefined` in JS, and the crash comes later.",
    },
  ],
  problems: [
    {
      id: 'binary-search-matrix',
      title: 'Search a Sorted Grid',
      difficulty: 'medium',
      leetcode: 74,
      pattern: 'Binary search (unfolded grid)',
      statement:
        "A cinema stores sold ticket numbers in a grid. Each row is sorted left to right, and each row starts with a number bigger than the last number of the row above. Return `true` if ticket `target` is in the grid. Aim for O(log(m · n)).",
      examples: [
        { input: 'matrix = [[1, 3, 5, 7], [10, 11, 16, 20], [23, 30, 34, 60]], target = 3', output: 'true' },
        { input: 'matrix = [[1, 3, 5, 7], [10, 11, 16, 20], [23, 30, 34, 60]], target = 13', output: 'false' },
      ],
      constraints: ['1 ≤ m, n ≤ 100'],
      hints: [
        'Read the grid row by row. What do you get?',
        'One sorted list of `m × n` values. You don\'t need to build it: can you turn a position `i` into a row and a column?',
        '`row = Math.floor(i / cols)`, `col = i % cols`. Run classic binary search over `0..m·n - 1`.',
      ],
      approaches: [
        {
          name: 'Scan every cell',
          idea: 'Two loops. Ignores all the sorting.',
          time: 'O(m · n)',
          space: 'O(1)',
        },
        {
          name: 'Find the row, then search it',
          idea: 'Binary search the first column to find the last row starting ≤ target, then binary search inside that row. Two searches, same speed as the best one, a little more code.',
          time: 'O(log m + log n)',
          space: 'O(1)',
        },
        {
          name: 'Unfold into one list',
          idea: 'Because rows chain, the grid read row by row is one sorted list. Binary search positions `0..m·n - 1` and convert each `mid` to `[floor(mid / n)][mid % n]`.',
          pseudo: `function searchMatrix(matrix, target):
    lo ← 0
    hi ← m × n - 1
    while lo ≤ hi:
        mid ← floor((lo + hi) / 2)
        value ← matrix[floor(mid / n)][mid % n]
        if value = target:
            return true
        else if value < target:
            lo ← mid + 1
        else:
            hi ← mid - 1
    return false`,
          code: `function searchMatrix(matrix, target) {
  const rows = matrix.length;
  const cols = matrix[0].length;
  let lo = 0;
  let hi = rows * cols - 1;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    const value = matrix[Math.floor(mid / cols)][mid % cols];
    if (value === target) return true;
    if (value < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return false;
}`,
          time: 'O(log(m · n))',
          space: 'O(1)',
        },
      ],
      fn: 'searchMatrix',
      starter: `function searchMatrix(matrix, target) {
  // Return true if target is in the chained sorted grid.
  return false;
}`,
      solution: `function searchMatrix(matrix, target) {
  const rows = matrix.length;
  const cols = matrix[0].length;
  let lo = 0;
  let hi = rows * cols - 1;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    const value = matrix[Math.floor(mid / cols)][mid % cols];
    if (value === target) return true;
    if (value < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return false;
}`,
      tests: [
        { name: 'found in the first row', args: [[[1, 3, 5, 7], [10, 11, 16, 20], [23, 30, 34, 60]], 3], expected: true },
        { name: 'missing, between values', args: [[[1, 3, 5, 7], [10, 11, 16, 20], [23, 30, 34, 60]], 13], expected: false },
        { name: 'first cell of a row', args: [[[1, 3, 5, 7], [10, 11, 16, 20], [23, 30, 34, 60]], 23], expected: true },
        { name: 'last cell', args: [[[1, 3, 5, 7], [10, 11, 16, 20], [23, 30, 34, 60]], 60], expected: true },
        { name: 'smaller than everything', args: [[[1, 3, 5, 7], [10, 11, 16, 20], [23, 30, 34, 60]], 0], expected: false },
        { name: 'bigger than everything', args: [[[1, 3, 5, 7], [10, 11, 16, 20], [23, 30, 34, 60]], 61], expected: false },
        { name: 'single cell, found', args: [[[1]], 1], expected: true },
        { name: 'single cell, missing', args: [[[1]], 2], expected: false },
        { name: 'one wide row', args: [[[1, 3, 5, 7, 9]], 7], expected: true },
        { name: 'one tall column', args: [[[1], [3], [5], [7]], 5], expected: true },
        { name: 'tall grid, missing', args: [[[1, 2], [4, 5], [7, 8], [10, 11]], 6], expected: false },
      ],
      takeaway: 'A grid whose rows chain is one sorted list: `row = floor(i / cols)`, `col = i % cols`.',
    },
    {
      id: 'binary-search-matrix-staircase',
      title: 'Search a Row-and-Column Sorted Grid',
      difficulty: 'medium',
      leetcode: 240,
      pattern: 'Staircase elimination',
      statement:
        "A warehouse stores box IDs in a grid. Each row is sorted left to right, and each column is sorted top to bottom, but rows do **not** chain: a row can start with a smaller ID than the row above ends with. Return `true` if `target` is in the grid.",
      examples: [
        { input: 'matrix = [[1, 4, 7, 11], [2, 5, 8, 12], [3, 6, 9, 16], [10, 13, 14, 17]], target = 5', output: 'true' },
        { input: 'matrix = [[1, 4, 7, 11], [2, 5, 8, 12], [3, 6, 9, 16], [10, 13, 14, 17]], target = 15', output: 'false' },
      ],
      constraints: ['1 ≤ m, n ≤ 300'],
      hints: [
        'Unfolding does not work here: row by row, the values are not sorted. But each row alone is.',
        'From the top-left corner, both moves (right and down) make values bigger, so one comparison can\'t pick a direction. Which corner is better?',
        'Start top-right. Too big? Move left (the whole column below is bigger too). Too small? Move down (the whole row to the left is smaller too).',
      ],
      approaches: [
        {
          name: 'Scan every cell',
          idea: 'Two loops.',
          time: 'O(m · n)',
          space: 'O(1)',
        },
        {
          name: 'Binary search every row',
          idea: 'Each row is sorted, so run classic binary search on each one.',
          time: 'O(m log n)',
          space: 'O(1)',
        },
        {
          name: 'Staircase from the top-right',
          idea: 'At the top-right corner, left means smaller and down means bigger, so one comparison picks a direction. Every step rules out a whole column or a whole row. The walk takes at most m + n steps.',
          pseudo: `function searchMatrix2(matrix, target):
    r ← 0
    c ← n - 1                   // top-right corner
    while r < m and c ≥ 0:
        value ← matrix[r][c]
        if value = target:
            return true
        else if value > target:
            c ← c - 1           // column c below is even bigger
        else:
            r ← r + 1           // row r to the left is even smaller
    return false`,
          code: `function searchMatrix2(matrix, target) {
  let r = 0;
  let c = matrix[0].length - 1;
  while (r < matrix.length && c >= 0) {
    const value = matrix[r][c];
    if (value === target) return true;
    if (value > target) c--;
    else r++;
  }
  return false;
}`,
          time: 'O(m + n)',
          space: 'O(1)',
        },
      ],
      fn: 'searchMatrix2',
      starter: `function searchMatrix2(matrix, target) {
  // Rows and columns are sorted (rows do not chain). Is target there?
  return false;
}`,
      solution: `function searchMatrix2(matrix, target) {
  let r = 0;
  let c = matrix[0].length - 1;
  while (r < matrix.length && c >= 0) {
    const value = matrix[r][c];
    if (value === target) return true;
    if (value > target) c--;
    else r++;
  }
  return false;
}`,
      tests: [
        { name: 'found inside', args: [[[1, 4, 7, 11], [2, 5, 8, 12], [3, 6, 9, 16], [10, 13, 14, 17]], 5], expected: true },
        { name: 'missing', args: [[[1, 4, 7, 11], [2, 5, 8, 12], [3, 6, 9, 16], [10, 13, 14, 17]], 15], expected: false },
        { name: 'bottom-left corner', args: [[[1, 4, 7, 11], [2, 5, 8, 12], [3, 6, 9, 16], [10, 13, 14, 17]], 10], expected: true },
        { name: 'bottom-right corner', args: [[[1, 4, 7, 11], [2, 5, 8, 12], [3, 6, 9, 16], [10, 13, 14, 17]], 17], expected: true },
        { name: 'smaller than everything', args: [[[1, 4, 7, 11], [2, 5, 8, 12], [3, 6, 9, 16], [10, 13, 14, 17]], 0], expected: false },
        { name: 'single cell', args: [[[1]], 1], expected: true },
        { name: 'single negative cell, missing', args: [[[-5]], -10], expected: false },
        { name: 'small square', args: [[[1, 4], [2, 5]], 2], expected: true },
        { name: 'one row', args: [[[1, 3, 5, 7, 9]], 4], expected: false },
        { name: 'one column', args: [[[1], [3], [5], [7]], 7], expected: true },
      ],
      takeaway: 'Pick a starting point where one comparison tells you which way to go.',
    },
    {
      id: 'binary-search-time-map',
      title: 'Time-Based Key-Value Store',
      difficulty: 'medium',
      leetcode: 981,
      pattern: 'Upper bound inside a design',
      statement:
        "Build a tiny version-history store. `set(key, value, time)` saves `value` for `key` at `time`. `get(key, time)` returns the value saved for `key` at the **latest time ≤ `time`**, or `\"\"` if there is none. Times passed to `set` only go up. Write `runTimeMap(ops)`: each op is `[\"set\", key, value, time]` or `[\"get\", key, time]`. Return one output per op: `null` for a set, the string for a get.",
      examples: [
        {
          input: 'ops = [["set","foo","bar",1], ["get","foo",1], ["get","foo",3], ["set","foo","bar2",4], ["get","foo",4], ["get","foo",5]]',
          output: '[null, "bar", "bar", null, "bar2", "bar2"]',
          explain: 'At time 3 the latest save is "bar" (time 1). From time 4 on it is "bar2".',
        },
        {
          input: 'ops = [["set","love","high",10], ["get","love",5]]',
          output: '[null, ""]',
          explain: 'Nothing was saved at or before time 5.',
        },
      ],
      constraints: ['up to 2 × 10⁵ ops', 'set times strictly increase', 'values are non-empty strings'],
      hints: [
        'Store a list of `[time, value]` pairs per key in a `Map`. Since times only go up, each list is already sorted.',
        'For `get`, scanning the list backwards works but is O(n). The list is sorted by time: which bound gives you "the last time ≤ t"?',
        'Find the first index whose time is `> t` (upper bound). The answer is the entry just before it. If that index is 0, return `""`.',
      ],
      approaches: [
        {
          name: 'Scan the history',
          idea: 'Keep a list of `[time, value]` per key. For `get`, walk backwards until a time ≤ t. Simple, but a key with 100,000 saves makes every get slow.',
          time: 'set O(1), get O(n)',
          space: 'O(total sets)',
        },
        {
          name: 'Sorted history + upper bound',
          idea: 'Appending keeps each list sorted by time for free, because times only grow. `get` is an upper-bound search: the first entry with time > t, then one step back.',
          pseudo: `store ← empty map            // key → list of (time, value)

function set(key, value, time):
    if key not in store:
        store[key] ← empty list
    append (time, value) to store[key]

function get(key, time):
    history ← store[key], or empty list
    lo ← 0
    hi ← length of history
    while lo < hi:              // first entry with time > t
        mid ← floor((lo + hi) / 2)
        if history[mid].time > time:
            hi ← mid
        else:
            lo ← mid + 1
    if lo = 0:
        return ""
    return history[lo - 1].value`,
          code: `function runTimeMap(ops) {
  const store = new Map(); // key -> [[time, value], ...], times increasing

  const set = (key, value, time) => {
    if (!store.has(key)) store.set(key, []);
    store.get(key).push([time, value]);
  };

  const get = (key, time) => {
    const history = store.get(key) || [];
    let lo = 0;
    let hi = history.length;
    while (lo < hi) {
      const mid = Math.floor((lo + hi) / 2);
      if (history[mid][0] > time) hi = mid;
      else lo = mid + 1;
    }
    return lo === 0 ? '' : history[lo - 1][1];
  };

  const out = [];
  for (const op of ops) {
    if (op[0] === 'set') {
      set(op[1], op[2], op[3]);
      out.push(null);
    } else {
      out.push(get(op[1], op[2]));
    }
  }
  return out;
}`,
          time: 'set O(1), get O(log n)',
          space: 'O(total sets)',
        },
      ],
      fn: 'runTimeMap',
      starter: `function runTimeMap(ops) {
  // ops: ["set", key, value, time] or ["get", key, time]
  // Return one output per op: null for set, a string for get.
  return [];
}`,
      solution: `function runTimeMap(ops) {
  const store = new Map();
  const set = (key, value, time) => {
    if (!store.has(key)) store.set(key, []);
    store.get(key).push([time, value]);
  };
  const get = (key, time) => {
    const history = store.get(key) || [];
    let lo = 0;
    let hi = history.length;
    while (lo < hi) {
      const mid = Math.floor((lo + hi) / 2);
      if (history[mid][0] > time) hi = mid;
      else lo = mid + 1;
    }
    return lo === 0 ? '' : history[lo - 1][1];
  };
  const out = [];
  for (const op of ops) {
    if (op[0] === 'set') {
      set(op[1], op[2], op[3]);
      out.push(null);
    } else {
      out.push(get(op[1], op[2]));
    }
  }
  return out;
}`,
      tests: [
        {
          name: 'basic history',
          args: [[['set', 'foo', 'bar', 1], ['get', 'foo', 1], ['get', 'foo', 3], ['set', 'foo', 'bar2', 4], ['get', 'foo', 4], ['get', 'foo', 5]]],
          expected: [null, 'bar', 'bar', null, 'bar2', 'bar2'],
        },
        {
          name: 'get before the first set',
          args: [[['set', 'love', 'high', 10], ['set', 'love', 'low', 20], ['get', 'love', 5], ['get', 'love', 10], ['get', 'love', 15], ['get', 'love', 20], ['get', 'love', 25]]],
          expected: [null, null, '', 'high', 'high', 'low', 'low'],
        },
        {
          name: 'unknown key',
          args: [[['get', 'ghost', 100]]],
          expected: [''],
        },
        {
          name: 'two keys stay separate',
          args: [[['set', 'a', 'x', 1], ['set', 'b', 'y', 2], ['set', 'a', 'z', 3], ['get', 'a', 2], ['get', 'b', 2], ['get', 'b', 1], ['get', 'a', 3]]],
          expected: [null, null, null, 'x', 'y', '', 'z'],
        },
        {
          name: 'many versions',
          args: [[['set', 'doc', 'v1', 1], ['set', 'doc', 'v2', 3], ['set', 'doc', 'v3', 6], ['set', 'doc', 'v4', 10], ['set', 'doc', 'v5', 15], ['get', 'doc', 9], ['get', 'doc', 2], ['get', 'doc', 15], ['get', 'doc', 0], ['get', 'doc', 6]]],
          expected: [null, null, null, null, null, 'v3', 'v1', 'v5', '', 'v3'],
        },
        {
          name: 'gets between sets',
          args: [[['set', 'k', 'one', 5], ['get', 'k', 7], ['set', 'k', 'two', 8], ['get', 'k', 7], ['get', 'k', 8]]],
          expected: [null, 'one', null, 'one', 'two'],
        },
      ],
      takeaway: 'If data arrives in time order, each list is sorted for free. "Latest at or before t" is upper bound minus one.',
    },
  ],
  quiz: [
    {
      prompt: 'A grid has 3 rows and 5 columns. Position `i = 7` in the unfolded list is at…',
      options: ['row 1, col 2', 'row 2, col 1', 'row 2, col 2', 'row 1, col 3'],
      answer: 0,
      explanation: 'Divide by the number of columns: `floor(7 / 5) = 1` and `7 % 5 = 2`.',
    },
    {
      prompt: 'A key was set at times `[2, 4, 8]`. `get` at time 7 returns the value saved at time…',
      options: ['4', '8', '2', 'nothing'],
      answer: 0,
      explanation: 'The latest time that is ≤ 7 is 4. The first time > 7 is 8 (index 2), and one step back is index 1, time 4.',
    },
    {
      prompt: 'Rows and columns are sorted, but rows do not chain. Where should the staircase walk start?',
      options: ['Top-right (or bottom-left) corner', 'Top-left corner', 'The center'],
      answer: 0,
      explanation: 'At the top-right, moving left makes values smaller and moving down makes them bigger, so one comparison picks the way. At the top-left, both moves make values bigger.',
    },
  ],
  takeaways: [
    'A grid whose rows chain is one sorted list: `row = floor(i / cols)`, `col = i % cols`.',
    'If times only go up, each key\'s history is sorted for free. "Latest at or before t" = upper bound minus one.',
    'Rows and columns sorted separately? Walk from the top-right corner in O(m + n).',
  ],
};

export default lesson;
