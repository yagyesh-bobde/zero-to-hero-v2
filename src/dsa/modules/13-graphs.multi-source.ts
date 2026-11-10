import type { Lesson } from '../types';

const lesson: Lesson = {
  id: 'multi-source-bfs',
  title: 'Multi-source BFS: spreading from many places at once',
  summary: 'Put every starting point in the queue at time 0 and let one BFS spread from all of them.',
  minutes: 18,
  blocks: [
    {
      kind: 'callout',
      tone: 'story',
      title: 'A rumor in the school yard',
      text: "Three kids hear a rumor at 9:00. Every minute, everyone who knows it tells the kids standing right next to them. When does the last kid hear it? Same question: a delivery app wants, for every house, the distance to its **nearest** store. A virus spreads from several sick people at once. In all of these, the spread starts from **many** places at the same time.",
    },
    {
      kind: 'text',
      text: "**The problem.** A crate of oranges is a grid: `0` empty, `1` fresh, `2` rotten. Every minute, each rotten orange rots the fresh oranges right next to it (up, down, left, right). How many minutes until no fresh orange is left? If some fresh orange can never rot, return `-1`.",
    },
    {
      kind: 'diagram',
      title: 'Minute by minute',
      art: `min 0    min 1    min 2    min 3    min 4
2 1 1    2 2 1    2 2 2    2 2 2    2 2 2
1 1 0    2 1 0    2 2 0    2 2 0    2 2 0
0 1 1    0 1 1    0 1 1    0 2 1    0 2 2

answer: 4 minutes`,
    },
    {
      kind: 'text',
      text: "**Brute force.** Simulate it. Each minute, scan the whole grid, find fresh oranges next to a rotten one, rot them, and repeat until a minute changes nothing. That works, but every minute rescans all `R · C` cells, even the ones that rotted long ago. A long snake of oranges can take `R · C` minutes, so this is `O((R·C)²)`. Another idea, running a separate BFS from each rotten orange and taking the minimum per cell, costs `O(k · R · C)` for `k` rotten oranges.",
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'One BFS, many starting points',
      text: "Put **all** rotten oranges in the queue at time 0, then run a normal BFS. It is like dropping several stones in a pond at once: the ripples spread together, and each cell is reached first by the ripple from its **nearest** source. Every cell is pushed once, so it costs `O(R · C)` no matter how many sources there are.",
    },
    {
      kind: 'trace',
      title: 'The queue, one minute (level) at a time',
      columns: ['minute', 'cells that rot this minute', 'fresh left'],
      rows: [
        [0, 'start queue: (0,0)', 6],
        [1, '(1,0), (0,1)', 4],
        [2, '(1,1), (0,2)', 2],
        [3, '(2,1)', 1],
        [4, '(2,2)', 0],
      ],
      note: "Each row is one BFS level: we pop exactly the cells that were in the queue when the minute started. Fresh count hits 0 at minute 4.",
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Rotting oranges',
      code: `function orangesRotting(grid):
    queue ← empty; fresh ← 0
    for each cell (r, c):
        if grid[r][c] = 2: append (r, c) to queue   // all sources
        if grid[r][c] = 1: fresh ← fresh + 1
    minutes ← 0
    while queue is not empty and fresh > 0:
        minutes ← minutes + 1
        repeat (size of queue right now) times:     // one level
            (r, c) ← queue.popFront()
            for each of the 4 neighbors (nr, nc):
                if inside grid and grid[nr][nc] = 1:
                    grid[nr][nc] ← 2
                    fresh ← fresh - 1
                    append (nr, nc) to queue
    if fresh > 0: return -1
    return minutes`,
    },
    {
      kind: 'code',
      lang: 'js',
      code: `function orangesRotting(grid) {
  const rows = grid.length, cols = grid[0].length;
  let queue = [];
  let fresh = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === 2) queue.push([r, c]);
      else if (grid[r][c] === 1) fresh++;
    }
  }
  let minutes = 0;
  while (queue.length && fresh > 0) {
    minutes++;
    const next = []; // the next level
    for (const [r, c] of queue) {
      for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nr = r + dr, nc = c + dc;
        if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue;
        if (grid[nr][nc] !== 1) continue;
        grid[nr][nc] = 2;
        fresh--;
        next.push([nr, nc]);
      }
    }
    queue = next;
  }
  return fresh > 0 ? -1 : minutes;
}`,
    },
    {
      kind: 'callout',
      tone: 'tip',
      title: 'Two ways to know the level',
      text: "Above, each level lives in its own array (`queue = next`). That is the cleanest way when you need \"minutes\" or \"rounds\". The other way, from lesson 3, stores the distance inside each entry: `[r, c, d]`. Both are the same BFS.",
    },
    {
      kind: 'compare',
      title: 'Rotting oranges on an R × C grid with k rotten',
      rows: [
        { approach: 'Simulate: rescan the grid every minute', time: 'O((R·C)²)', space: 'O(R·C)', note: 'Simple, but rescans finished cells.' },
        { approach: 'Separate BFS from each rotten orange', time: 'O(k · R·C)', space: 'O(R·C)', note: 'Take the min time per cell. Repeats work.' },
        { approach: 'Multi-source BFS', time: 'O(R·C)', space: 'O(R·C)', note: 'All sources start in the queue. Each cell once.' },
      ],
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Pattern: multi-source BFS (distance to the nearest source)',
      code: `dist ← grid of -1                      // -1 = not reached yet
queue ← empty
for each source cell s:
    dist[s] ← 0; append s to queue
while queue is not empty:
    cell ← queue.popFront()
    for each neighbor nb of cell:
        if nb is inside and allowed and dist[nb] = -1:
            dist[nb] ← dist[cell] + 1
            append nb to queue
// dist[x] is now the distance from x to its nearest source`,
    },
    {
      kind: 'callout',
      tone: 'trap',
      title: 'Edge cases that cost points',
      text: "1) **No fresh oranges at the start** → answer `0`, even if there are no rotten ones. 2) **Fresh oranges but no rotten ones** → `-1`. 3) **Counting one minute too many.** If you add a minute after the last level even when nothing new rotted, you get 5 instead of 4. Stop when `fresh` hits 0, or only count levels that rot something. 4) **Flip the question.** \"Distance from each cell to the nearest X\" means start from all the X's, not from each cell.",
    },
  ],
  problems: [
    {
      id: 'graphs-rotting-oranges',
      title: 'Rotting oranges',
      difficulty: 'medium',
      leetcode: 994,
      pattern: 'Multi-source BFS',
      statement:
        "A crate is a grid: `0` is empty, `1` is a fresh orange, `2` is a rotten orange. Every minute, every fresh orange that is up, down, left or right of a rotten one becomes rotten. Return the number of minutes until no fresh orange is left. If that never happens, return `-1`.",
      examples: [
        { input: 'grid = [[2,1,1],[1,1,0],[0,1,1]]', output: '4' },
        { input: 'grid = [[2,1,1],[0,1,1],[1,0,1]]', output: '-1', explain: 'The bottom-left orange has no neighbors at all.' },
        { input: 'grid = [[0,2]]', output: '0', explain: 'No fresh oranges to begin with.' },
      ],
      constraints: ['1 ≤ rows, cols ≤ 10', 'cells are 0, 1 or 2'],
      hints: [
        "All rotten oranges start spreading at the same moment. How can one BFS start from all of them?",
        "Put every `2` in the queue before the loop. Also count the fresh oranges.",
        "Process the queue one level at a time. Each level is one minute. At the end, if any fresh orange remains, return -1.",
      ],
      approaches: [
        {
          name: 'Simulate minute by minute',
          idea: "Each minute, scan the grid, collect fresh oranges next to rotten ones, rot them. Stop when a minute changes nothing. Correct, but each minute rescans the whole grid.",
          time: 'O((R·C)²)',
          space: 'O(R·C)',
        },
        {
          name: 'Multi-source BFS by levels',
          idea: "All rotten oranges go in the queue at minute 0. BFS level `m` holds exactly the oranges that rot at minute `m`, because each orange is reached first by its nearest rotten source. Count levels until no fresh orange is left.",
          pseudo: `function orangesRotting(grid):
    queue ← all cells with 2; fresh ← count of cells with 1
    minutes ← 0
    while queue is not empty and fresh > 0:
        minutes ← minutes + 1
        next ← empty list
        for each (r, c) in queue:
            for each of the 4 neighbors (nr, nc):
                if inside grid and grid[nr][nc] = 1:
                    grid[nr][nc] ← 2; fresh ← fresh - 1
                    append (nr, nc) to next
        queue ← next
    return -1 if fresh > 0 else minutes`,
          code: `function orangesRotting(grid) {
  const rows = grid.length, cols = grid[0].length;
  let queue = [];
  let fresh = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === 2) queue.push([r, c]);
      else if (grid[r][c] === 1) fresh++;
    }
  }
  let minutes = 0;
  while (queue.length && fresh > 0) {
    minutes++;
    const next = [];
    for (const [r, c] of queue) {
      for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nr = r + dr, nc = c + dc;
        if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue;
        if (grid[nr][nc] !== 1) continue;
        grid[nr][nc] = 2;
        fresh--;
        next.push([nr, nc]);
      }
    }
    queue = next;
  }
  return fresh > 0 ? -1 : minutes;
}`,
          time: 'O(R·C)',
          space: 'O(R·C)',
        },
      ],
      fn: 'orangesRotting',
      starter: `function orangesRotting(grid) {
  // start the BFS from every rotten orange at once
  return -1;
}`,
      solution: `function orangesRotting(grid) {
  const rows = grid.length, cols = grid[0].length;
  let queue = [];
  let fresh = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === 2) queue.push([r, c]);
      else if (grid[r][c] === 1) fresh++;
    }
  }
  let minutes = 0;
  while (queue.length && fresh > 0) {
    minutes++;
    const next = [];
    for (const [r, c] of queue) {
      for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nr = r + dr, nc = c + dc;
        if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue;
        if (grid[nr][nc] !== 1) continue;
        grid[nr][nc] = 2;
        fresh--;
        next.push([nr, nc]);
      }
    }
    queue = next;
  }
  return fresh > 0 ? -1 : minutes;
}`,
      tests: [
        { name: 'spreads in 4 minutes', args: [[[2, 1, 1], [1, 1, 0], [0, 1, 1]]], expected: 4 },
        { name: 'one orange cut off', args: [[[2, 1, 1], [0, 1, 1], [1, 0, 1]]], expected: -1 },
        { name: 'nothing fresh', args: [[[0, 2]]], expected: 0 },
        { name: 'empty crate', args: [[[0]]], expected: 0 },
        { name: 'fresh but no rotten', args: [[[1]]], expected: -1 },
        { name: 'two sources meet in the middle', args: [[[2, 1, 1, 1, 2]]], expected: 2 },
        { name: 'one minute', args: [[[2, 2], [1, 1]]], expected: 1 },
      ],
      takeaway: 'Several sources spreading at once → push them all before the BFS loop.',
    },
    {
      id: 'graphs-01-matrix',
      title: 'Distance to the nearest zero',
      difficulty: 'medium',
      leetcode: 542,
      pattern: 'Multi-source BFS',
      statement:
        "You get a grid of `0`s and `1`s with at least one `0`. Think of each `0` as a store and each `1` as a house. For every cell, find how many steps (up, down, left, right) it is from the **nearest** `0`. Return a grid of those distances (a `0` cell has distance 0).",
      examples: [
        { input: 'mat = [[0,0,0],[0,1,0],[1,1,1]]', output: '[[0,0,0],[0,1,0],[1,2,1]]' },
        { input: 'mat = [[0,1,1,1]]', output: '[[0,1,2,3]]' },
      ],
      constraints: ['1 ≤ rows · cols ≤ 10⁴', 'at least one cell is 0'],
      hints: [
        "BFS from every `1` to find its nearest `0` works, but repeats a lot of work.",
        "Flip it: start from all the `0`s at once.",
        "Set `dist = 0` for zeros and `-1` for ones. A neighbor with `-1` gets `dist[cell] + 1` and joins the queue.",
      ],
      approaches: [
        {
          name: 'BFS from every 1',
          idea: "For each `1`, run a BFS until it hits a `0`. Correct, but on a big grid of ones each BFS can scan the whole grid.",
          time: 'O((R·C)²)',
          space: 'O(R·C)',
        },
        {
          name: 'Multi-source BFS from all zeros',
          idea: "Every zero is a source at distance 0. The ripples spread together, so each `1` is first reached by the ripple from its nearest zero, and that is its answer. Each cell is pushed once.",
          pseudo: `function updateMatrix(mat):
    dist ← grid of -1; queue ← empty
    for each cell (r, c) with mat[r][c] = 0:
        dist[r][c] ← 0; append (r, c) to queue
    while queue is not empty:
        (r, c) ← queue.popFront()
        for each of the 4 neighbors (nr, nc):
            if inside grid and dist[nr][nc] = -1:
                dist[nr][nc] ← dist[r][c] + 1
                append (nr, nc) to queue
    return dist`,
          code: `function updateMatrix(mat) {
  const rows = mat.length, cols = mat[0].length;
  const dist = mat.map((row) => row.map((v) => (v === 0 ? 0 : -1)));
  const queue = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (mat[r][c] === 0) queue.push([r, c]);
    }
  }
  for (let head = 0; head < queue.length; head++) {
    const [r, c] = queue[head];
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nr = r + dr, nc = c + dc;
      if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue;
      if (dist[nr][nc] !== -1) continue;
      dist[nr][nc] = dist[r][c] + 1;
      queue.push([nr, nc]);
    }
  }
  return dist;
}`,
          time: 'O(R·C)',
          space: 'O(R·C)',
        },
      ],
      fn: 'updateMatrix',
      starter: `function updateMatrix(mat) {
  // distance from every cell to its nearest 0
  return mat;
}`,
      solution: `function updateMatrix(mat) {
  const rows = mat.length, cols = mat[0].length;
  const dist = mat.map((row) => row.map((v) => (v === 0 ? 0 : -1)));
  const queue = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (mat[r][c] === 0) queue.push([r, c]);
    }
  }
  for (let head = 0; head < queue.length; head++) {
    const [r, c] = queue[head];
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nr = r + dr, nc = c + dc;
      if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue;
      if (dist[nr][nc] !== -1) continue;
      dist[nr][nc] = dist[r][c] + 1;
      queue.push([nr, nc]);
    }
  }
  return dist;
}`,
      tests: [
        { name: 'single 1 in the middle', args: [[[0, 0, 0], [0, 1, 0], [0, 0, 0]]], expected: [[0, 0, 0], [0, 1, 0], [0, 0, 0]] },
        { name: 'bottom row of ones', args: [[[0, 0, 0], [0, 1, 0], [1, 1, 1]]], expected: [[0, 0, 0], [0, 1, 0], [1, 2, 1]] },
        { name: 'one cell', args: [[[0]]], expected: [[0]] },
        { name: 'one row, zero at the start', args: [[[0, 1, 1, 1]]], expected: [[0, 1, 2, 3]] },
        { name: 'zero in the middle of a row', args: [[[1, 1, 0, 1, 1]]], expected: [[2, 1, 0, 1, 2]] },
        { name: 'zero in a corner', args: [[[0, 1, 1], [1, 1, 1], [1, 1, 1]]], expected: [[0, 1, 2], [1, 2, 3], [2, 3, 4]] },
        { name: 'two zeros share the work', args: [[[0, 1, 1, 1, 1, 0]]], expected: [[0, 1, 2, 2, 1, 0]] },
      ],
      takeaway: '"Distance to the nearest X" for every cell → multi-source BFS from all the X cells.',
    },
    {
      id: 'graphs-as-far-from-land',
      title: 'As far from land as possible',
      difficulty: 'medium',
      leetcode: 1162,
      pattern: 'Multi-source BFS',
      statement:
        "A square map has `1` (land) and `0` (water). You want to anchor a boat at the water cell that is **farthest** from any land. Distance means steps up, down, left or right (so from `(r1,c1)` to `(r2,c2)` it is `|r1 - r2| + |c1 - c2|`). Return that largest distance-to-nearest-land. If the map has no land or no water, return `-1`.",
      examples: [
        { input: 'grid = [[1,0,1],[0,0,0],[1,0,1]]', output: '2', explain: 'The center is 2 steps from every corner.' },
        { input: 'grid = [[1,0,0],[0,0,0],[0,0,0]]', output: '4', explain: 'The bottom-right corner is 4 steps from the only land.' },
      ],
      constraints: ['1 ≤ n ≤ 100', 'cells are 0 or 1'],
      hints: [
        "For each water cell you need its distance to the nearest land. Sound familiar?",
        "Start a BFS from all land cells at once.",
        "The last level the BFS reaches is the answer. Handle the all-land and all-water cases first.",
      ],
      approaches: [
        {
          name: 'Check every water cell against every land cell',
          idea: "For each water cell, compute the distance to every land cell and keep the smallest; the answer is the largest of those. Correct, but `O(n⁴)` on an n × n map.",
          time: 'O(n⁴)',
          space: 'O(1)',
        },
        {
          name: 'Multi-source BFS from all land',
          idea: "Spread from all land cells together. Each water cell is reached first from its nearest land, at exactly that distance. The farthest water cell is the one reached in the last level.",
          pseudo: `function maxDistance(grid):
    queue ← all land cells
    if queue is empty or every cell is land: return -1
    level ← -1
    while queue is not empty:
        level ← level + 1
        next ← empty list
        for each (r, c) in queue:
            for each of the 4 neighbors (nr, nc):
                if inside grid and grid[nr][nc] = 0:
                    grid[nr][nc] ← 1            // visited
                    append (nr, nc) to next
        queue ← next
    return level`,
          code: `function maxDistance(grid) {
  const n = grid.length;
  let queue = [];
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (grid[r][c] === 1) queue.push([r, c]);
    }
  }
  if (queue.length === 0 || queue.length === n * n) return -1;
  let level = -1;
  while (queue.length) {
    level++;
    const next = [];
    for (const [r, c] of queue) {
      for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nr = r + dr, nc = c + dc;
        if (nr < 0 || nc < 0 || nr >= n || nc >= n) continue;
        if (grid[nr][nc] !== 0) continue;
        grid[nr][nc] = 1;
        next.push([nr, nc]);
      }
    }
    queue = next;
  }
  return level;
}`,
          time: 'O(n²)',
          space: 'O(n²)',
        },
      ],
      fn: 'maxDistance',
      starter: `function maxDistance(grid) {
  // farthest water cell from any land; -1 if no land or no water
  return -1;
}`,
      solution: `function maxDistance(grid) {
  const n = grid.length;
  let queue = [];
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (grid[r][c] === 1) queue.push([r, c]);
    }
  }
  if (queue.length === 0 || queue.length === n * n) return -1;
  let level = -1;
  while (queue.length) {
    level++;
    const next = [];
    for (const [r, c] of queue) {
      for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nr = r + dr, nc = c + dc;
        if (nr < 0 || nc < 0 || nr >= n || nc >= n) continue;
        if (grid[nr][nc] !== 0) continue;
        grid[nr][nc] = 1;
        next.push([nr, nc]);
      }
    }
    queue = next;
  }
  return level;
}`,
      tests: [
        { name: 'land in four corners', args: [[[1, 0, 1], [0, 0, 0], [1, 0, 1]]], expected: 2 },
        { name: 'one island in a corner', args: [[[1, 0, 0], [0, 0, 0], [0, 0, 0]]], expected: 4 },
        { name: 'all land', args: [[[1, 1], [1, 1]]], expected: -1 },
        { name: 'all water', args: [[[0, 0], [0, 0]]], expected: -1 },
        { name: '1 × 1 land', args: [[[1]]], expected: -1 },
        { name: 'land in the center', args: [[[0, 0, 0], [0, 1, 0], [0, 0, 0]]], expected: 2 },
        { name: 'two land cells', args: [[[1, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 1]]], expected: 3 },
      ],
      takeaway: 'The last BFS level is the farthest anything is from its nearest source.',
    },
  ],
  quiz: [
    {
      prompt: "In multi-source BFS, when do the sources go into the queue?",
      options: ['One at a time, each with its own BFS', 'All of them before the loop starts, at distance 0', 'Only the closest one', 'At the end, to check the answer'],
      answer: 1,
      explanation: "Starting them together makes the ripples spread in step, so each cell is first reached by its nearest source.",
    },
    {
      prompt: "`grid = [[1, 1, 1]]` for rotting oranges (fresh oranges, no rotten ones). What is the answer?",
      options: ['0', '3', '-1', '1'],
      answer: 2,
      explanation: "Nothing can ever rot them, so fresh oranges remain forever: `-1`.",
    },
    {
      prompt: "You need the distance from every house to its nearest hospital on a grid with `h` hospitals. What is the cost of multi-source BFS?",
      options: ['`O(h · R · C)`', '`O(R · C)`', '`O(h²)`', '`O((R · C)²)`'],
      answer: 1,
      explanation: "Each cell enters the queue once, no matter how many sources there are.",
    },
  ],
  takeaways: [
    "Many sources spreading at the same speed → push all of them first, then run one BFS.",
    "\"Distance to the nearest X\" for every cell → start from the X's, not from each cell.",
    "Process the queue level by level when the answer is a number of rounds or minutes.",
  ],
};

export default lesson;
