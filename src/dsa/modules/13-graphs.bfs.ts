import type { Lesson } from '../types';

const lesson: Lesson = {
  id: 'bfs-fewest-steps',
  title: 'BFS for the fewest steps',
  summary: 'BFS reaches nodes in rings of distance, so the first time you reach the goal is the shortest way.',
  minutes: 24,
  blocks: [
    {
      kind: 'callout',
      tone: 'story',
      title: 'Six degrees of Kevin Bacon',
      text: "There is a game: name any actor, then link them to Kevin Bacon through movies they shared, in as few hops as possible. Metro apps ask the same thing (\"fewest stops from here to the airport\"), and LinkedIn shows it as \"2nd\" or \"3rd\" connection. Every edge counts the same: one hop, one stop, one step. That is exactly when **BFS** finds the shortest route.",
    },
    {
      kind: 'text',
      text: "**The problem.** A grid has `0` (open) and `1` (wall). You start at the top-left cell and want to reach the bottom-right cell. Each move goes to one of the **8** cells around you (diagonals allowed). Return how many cells the shortest path visits, counting start and end, or `-1` if you cannot get there.",
    },
    {
      kind: 'diagram',
      title: 'The maze and the answer',
      art: `grid          cells on a shortest path

0 0 0          1 2 .
1 1 0          # # 3
1 1 0          # # 4

answer: 4  (right, diagonal down-right, down)`,
    },
    {
      kind: 'text',
      text: "**Brute force.** Use DFS to try every path that never repeats a cell, and keep the shortest one. It works on a 3 × 3 grid. But the number of paths explodes: on an open 10 × 10 grid there are more paths than atoms you could count. And DFS cannot stop early: the first path it finds is just *a* path, not the shortest.",
    },
    {
      kind: 'text',
      text: "**Spot the waste.** DFS reaches the same cell again and again by different routes, and each time it has to keep going because a later route might be shorter. If we could reach every cell **by its shortest route first**, we would never need to look at it again.",
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'BFS explores in rings',
      text: "Drop a stone in a pond: the ripple reaches everything 1 step away, then everything 2 steps away, and so on. BFS does the same with a queue. All cells at distance `d` leave the queue before any cell at distance `d + 1`. So **the first time BFS touches a cell, it got there by a shortest route.** Mark it visited right then and never look at it again. This only holds when every step costs the same. Roads with different lengths need Dijkstra (module 14).",
    },
    {
      kind: 'trace',
      title: 'BFS on the maze (each queue entry is a cell and its distance)',
      columns: ['pop', 'new open neighbors (distance)', 'queue after'],
      rows: [
        ['-', 'start (0,0) = 1', '[(0,0)·1]'],
        ['(0,0)·1', '(0,1)·2   (walls at (1,0), (1,1))', '[(0,1)·2]'],
        ['(0,1)·2', '(0,2)·3, (1,2)·3', '[(0,2)·3, (1,2)·3]'],
        ['(0,2)·3', 'none new ((1,2) already seen)', '[(1,2)·3]'],
        ['(1,2)·3', '(2,2)·4  ← the goal', '[(2,2)·4]'],
        ['(2,2)·4', 'it is the goal: return 4', '-'],
      ],
      note: "(1,2) was marked when (0,1) pushed it. So (0,2) does not push it again. Marking on push keeps every cell in the queue at most once.",
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Shortest path in a grid with BFS',
      code: `function shortestPath(grid):
    n ← rows of grid
    if grid[0][0] = 1 or grid[n-1][n-1] = 1: return -1
    grid[0][0] ← 1                      // mark visited (reuse walls)
    queue ← [(0, 0, 1)]                 // row, col, cells so far
    while queue is not empty:
        (r, c, d) ← queue.popFront()
        if (r, c) = (n-1, n-1): return d
        for each of the 8 neighbors (nr, nc):
            if inside grid and grid[nr][nc] = 0:
                grid[nr][nc] ← 1        // mark when you push
                append (nr, nc, d + 1) to queue
    return -1`,
    },
    {
      kind: 'code',
      lang: 'js',
      code: `function shortestPathBinaryMatrix(grid) {
  const n = grid.length;
  if (grid[0][0] === 1 || grid[n - 1][n - 1] === 1) return -1;
  grid[0][0] = 1;
  const queue = [[0, 0, 1]];
  for (let head = 0; head < queue.length; head++) {
    const [r, c, d] = queue[head];
    if (r === n - 1 && c === n - 1) return d;
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const nr = r + dr, nc = c + dc;
        if (nr < 0 || nc < 0 || nr >= n || nc >= n) continue;
        if (grid[nr][nc] !== 0) continue; // wall or seen
        grid[nr][nc] = 1;
        queue.push([nr, nc, d + 1]);
      }
    }
  }
  return -1;
}`,
    },
    {
      kind: 'compare',
      title: 'Fewest steps on an n × n grid',
      rows: [
        { approach: 'DFS over every simple path', time: 'exponential', space: 'O(n²)', note: 'Correct, hopeless past tiny grids.' },
        { approach: 'BFS, mark when popped', time: 'O(n²), up to 8× the pushes', space: 'O(8 · n²)', note: 'Correct, but each of 8 neighbors can push the same cell before it is popped.' },
        { approach: 'BFS, mark when pushed', time: 'O(n²)', space: 'O(n²)', note: 'Each cell enters the queue once. The standard.' },
      ],
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Pattern: BFS shortest steps (graph, grid, or states)',
      code: `visited ← set with start
queue ← [(start, 0)]
while queue is not empty:
    (node, d) ← queue.popFront()
    if node is the goal: return d
    for each next reachable in one step from node:
        if next is allowed and next not in visited:
            add next to visited
            append (next, d + 1) to queue
return -1                               // goal never reached`,
    },
    {
      kind: 'callout',
      tone: 'tip',
      title: 'The graph does not have to be drawn for you',
      text: "In many problems the nodes are **states**, not places: a lock showing `\"0000\"`, a word like `\"hit\"`. One move (turn one wheel, change one letter) is one edge. You never build the whole graph. You just generate the neighbors of the state you popped. This is called an *implicit graph*.",
    },
    {
      kind: 'callout',
      tone: 'trap',
      title: 'Three BFS slips',
      text: "1) **Mark when you push, not when you pop.** Otherwise one cell can sit in the queue many times. 2) **`queue.shift()` is `O(n)` in JS.** On 10⁴ entries it quietly turns BFS into `O(n²)`. Use a head index. 3) **Read what is being counted.** Here the answer counts cells (start = 1). Other problems count moves (start = 0). Check with the smallest example.",
    },
  ],
  problems: [
    {
      id: 'graphs-shortest-path-binary-matrix',
      title: 'Shortest clear path',
      difficulty: 'medium',
      leetcode: 1091,
      pattern: 'BFS shortest path',
      statement:
        "A square grid has `0` (open) and `1` (blocked). A robot starts at the top-left cell and must reach the bottom-right cell. Each move goes to any of the 8 surrounding cells (diagonals too), and only through open cells. Return the number of cells on the shortest route, **counting the start and the end**. If there is no route, return `-1`.",
      examples: [
        { input: 'grid = [[0,1],[1,0]]', output: '2', explain: 'One diagonal move: 2 cells.' },
        { input: 'grid = [[0,0,0],[1,1,0],[1,1,0]]', output: '4' },
        { input: 'grid = [[1,0,0],[1,1,0],[1,1,0]]', output: '-1', explain: 'The start is blocked.' },
      ],
      constraints: ['1 ≤ n ≤ 100', 'cells are 0 or 1'],
      hints: [
        "\"Fewest\" + every move costs the same → BFS, not DFS.",
        "Store the distance with each cell in the queue, starting at 1 for the start cell.",
        "Check the start and end cells first. Mark cells when you push them. Try all 8 `(dr, dc)` pairs from -1 to 1.",
      ],
      approaches: [
        {
          name: 'DFS over all paths',
          idea: "Try every path that does not repeat a cell and keep the shortest. Correct, but the number of paths grows exponentially, and you cannot stop at the first path found.",
          time: 'exponential',
          space: 'O(n²)',
        },
        {
          name: 'BFS from the start',
          idea: "BFS pops cells in order of distance, so the first time it pops the goal, that distance is the smallest possible. Each cell is pushed at most once because we mark it when pushing.",
          pseudo: `function shortestPathBinaryMatrix(grid):
    n ← rows of grid
    if grid[0][0] = 1 or grid[n-1][n-1] = 1: return -1
    grid[0][0] ← 1
    queue ← [(0, 0, 1)]
    while queue is not empty:
        (r, c, d) ← queue.popFront()
        if r = n - 1 and c = n - 1: return d
        for dr from -1 to 1:
            for dc from -1 to 1:
                (nr, nc) ← (r + dr, c + dc)
                if inside grid and grid[nr][nc] = 0:
                    grid[nr][nc] ← 1
                    append (nr, nc, d + 1) to queue
    return -1`,
          code: `function shortestPathBinaryMatrix(grid) {
  const n = grid.length;
  if (grid[0][0] === 1 || grid[n - 1][n - 1] === 1) return -1;
  grid[0][0] = 1;
  const queue = [[0, 0, 1]];
  for (let head = 0; head < queue.length; head++) {
    const [r, c, d] = queue[head];
    if (r === n - 1 && c === n - 1) return d;
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const nr = r + dr, nc = c + dc;
        if (nr < 0 || nc < 0 || nr >= n || nc >= n) continue;
        if (grid[nr][nc] !== 0) continue;
        grid[nr][nc] = 1;
        queue.push([nr, nc, d + 1]);
      }
    }
  }
  return -1;
}`,
          time: 'O(n²)',
          space: 'O(n²)',
        },
      ],
      fn: 'shortestPathBinaryMatrix',
      starter: `function shortestPathBinaryMatrix(grid) {
  // BFS from (0, 0); count cells, not moves
  return -1;
}`,
      solution: `function shortestPathBinaryMatrix(grid) {
  const n = grid.length;
  if (grid[0][0] === 1 || grid[n - 1][n - 1] === 1) return -1;
  grid[0][0] = 1;
  const queue = [[0, 0, 1]];
  for (let head = 0; head < queue.length; head++) {
    const [r, c, d] = queue[head];
    if (r === n - 1 && c === n - 1) return d;
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const nr = r + dr, nc = c + dc;
        if (nr < 0 || nc < 0 || nr >= n || nc >= n) continue;
        if (grid[nr][nc] !== 0) continue;
        grid[nr][nc] = 1;
        queue.push([nr, nc, d + 1]);
      }
    }
  }
  return -1;
}`,
      tests: [
        { name: 'one diagonal move', args: [[[0, 1], [1, 0]]], expected: 2 },
        { name: 'around the walls', args: [[[0, 0, 0], [1, 1, 0], [1, 1, 0]]], expected: 4 },
        { name: 'start blocked', args: [[[1, 0, 0], [1, 1, 0], [1, 1, 0]]], expected: -1 },
        { name: 'end blocked', args: [[[0, 0], [0, 1]]], expected: -1 },
        { name: '1 × 1 open', args: [[[0]]], expected: 1 },
        { name: 'boxed in', args: [[[0, 1, 0], [1, 1, 0], [0, 0, 0]]], expected: -1 },
        { name: 'open grid goes diagonal', args: [[[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]], expected: 4 },
        { name: 'zig-zag corridor', args: [[[0, 1, 1, 1], [1, 0, 1, 1], [1, 1, 0, 1], [1, 1, 1, 0]]], expected: 4 },
      ],
      takeaway: 'Unweighted + fewest steps = BFS. The first time you reach the goal is the answer.',
    },
    {
      id: 'graphs-nearest-exit',
      title: 'Nearest exit from a maze',
      difficulty: 'medium',
      leetcode: 1926,
      pattern: 'BFS shortest path',
      statement:
        "A maze is a grid of `'.'` (open) and `'+'` (wall). You stand at `entrance = [row, col]`, an open cell. Each step moves up, down, left or right into an open cell. An **exit** is an open cell on the outer border of the maze, but the entrance itself does not count as an exit. Return the fewest steps to reach any exit, or `-1` if there is none you can reach.",
      examples: [
        { input: 'maze = [["+","+",".","+"],[".",".",".","+"],["+","+","+","."]], entrance = [1,2]', output: '1', explain: 'Step up to (0,2), which is on the top border.' },
        { input: 'maze = [["+","+","+"],[".",".","."],["+","+","+"]], entrance = [1,0]', output: '2', explain: 'The entrance is on the border but does not count. (1,2) is 2 steps away.' },
        { input: 'maze = [[".","+"]], entrance = [0,0]', output: '-1' },
      ],
      constraints: ['1 ≤ rows, cols ≤ 100', 'entrance is an open cell'],
      hints: [
        "Fewest steps, every step the same cost: BFS from the entrance.",
        "Here we count moves, so the entrance has distance 0.",
        "When you pop a cell that is on the border and is not the entrance, return its distance.",
      ],
      approaches: [
        {
          name: 'BFS from every exit',
          idea: "List every border cell, run a BFS from the entrance to each one, and take the smallest. Correct, but repeats almost the same BFS once per exit.",
          time: 'O((R + C) · R · C)',
          space: 'O(R·C)',
        },
        {
          name: 'One BFS, stop at the first border cell',
          idea: "BFS pops cells in order of distance, so the first border cell it pops (other than the entrance) is the nearest exit. One BFS answers the question for all exits at once.",
          pseudo: `function nearestExit(maze, entrance):
    (sr, sc) ← entrance
    mark maze[sr][sc] as wall           // visited
    queue ← [(sr, sc, 0)]
    while queue is not empty:
        (r, c, d) ← queue.popFront()
        if d > 0 and (r, c) is on the border: return d
        for each of the 4 neighbors (nr, nc):
            if inside maze and maze[nr][nc] = '.':
                maze[nr][nc] ← '+'
                append (nr, nc, d + 1) to queue
    return -1`,
          code: `function nearestExit(maze, entrance) {
  const rows = maze.length, cols = maze[0].length;
  const [sr, sc] = entrance;
  maze[sr][sc] = '+';
  const queue = [[sr, sc, 0]];
  for (let head = 0; head < queue.length; head++) {
    const [r, c, d] = queue[head];
    const onBorder = r === 0 || c === 0 || r === rows - 1 || c === cols - 1;
    if (d > 0 && onBorder) return d;
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nr = r + dr, nc = c + dc;
      if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue;
      if (maze[nr][nc] !== '.') continue;
      maze[nr][nc] = '+';
      queue.push([nr, nc, d + 1]);
    }
  }
  return -1;
}`,
          time: 'O(R·C)',
          space: 'O(R·C)',
        },
      ],
      fn: 'nearestExit',
      starter: `function nearestExit(maze, entrance) {
  // BFS from entrance; the entrance is not an exit
  return -1;
}`,
      solution: `function nearestExit(maze, entrance) {
  const rows = maze.length, cols = maze[0].length;
  const [sr, sc] = entrance;
  maze[sr][sc] = '+';
  const queue = [[sr, sc, 0]];
  for (let head = 0; head < queue.length; head++) {
    const [r, c, d] = queue[head];
    const onBorder = r === 0 || c === 0 || r === rows - 1 || c === cols - 1;
    if (d > 0 && onBorder) return d;
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nr = r + dr, nc = c + dc;
      if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue;
      if (maze[nr][nc] !== '.') continue;
      maze[nr][nc] = '+';
      queue.push([nr, nc, d + 1]);
    }
  }
  return -1;
}`,
      tests: [
        { name: 'one step up', args: [[['+', '+', '.', '+'], ['.', '.', '.', '+'], ['+', '+', '+', '.']], [1, 2]], expected: 1 },
        { name: 'entrance on border does not count', args: [[['+', '+', '+'], ['.', '.', '.'], ['+', '+', '+']], [1, 0]], expected: 2 },
        { name: 'nowhere to go', args: [[['.', '+']], [0, 0]], expected: -1 },
        { name: '1 × 1 maze', args: [[['.']], [0, 0]], expected: -1 },
        { name: 'center of an open room', args: [[['.', '.', '.'], ['.', '.', '.'], ['.', '.', '.']], [1, 1]], expected: 1 },
        { name: 'walled in', args: [[['+', '+', '+'], ['+', '.', '+'], ['+', '+', '+']], [1, 1]], expected: -1 },
        { name: 'long corridor', args: [[['+', '+', '+', '+', '+'], ['.', '.', '.', '.', '+'], ['+', '+', '+', '+', '+']], [1, 3]], expected: 3 },
      ],
      takeaway: 'Many possible goals? One BFS still finds the nearest: stop at the first goal you pop.',
    },
    {
      id: 'graphs-open-the-lock',
      title: 'Open the lock',
      difficulty: 'medium',
      leetcode: 752,
      pattern: 'BFS on states (implicit graph)',
      statement:
        "A bike lock has 4 wheels, each showing a digit `0`-`9`. It starts at `\"0000\"`. One move turns one wheel by one click, up or down, and wheels wrap around (`9` up is `0`, `0` down is `9`). Some codes in `deadends` jam the lock: you may never pass through them. Return the fewest moves to reach `target`, or `-1` if it is impossible.",
      examples: [
        { input: 'deadends = ["0201","0101","0102","1212","2002"], target = "0202"', output: '6', explain: 'For example 0000 → 1000 → 1100 → 1200 → 1201 → 1202 → 0202.' },
        { input: 'deadends = ["8888"], target = "0009"', output: '1', explain: 'Turn the last wheel down once.' },
        { input: 'deadends = ["0000"], target = "8888"', output: '-1', explain: 'The start itself is jammed.' },
      ],
      constraints: ['1 ≤ deadends.length ≤ 500', 'all codes have 4 digits'],
      hints: [
        "Each code is a node. Two codes are connected if one wheel click turns one into the other.",
        "Every code has exactly 8 neighbors (4 wheels × up or down). Generate them on the fly.",
        "BFS from \"0000\". Put the dead ends in the visited set from the start so you never enter them. Check if \"0000\" itself is dead.",
      ],
      approaches: [
        {
          name: 'Try every sequence of moves',
          idea: "Try all sequences of 1 move, then 2 moves, and so on, without remembering codes you already saw. Correct, but the number of sequences grows as 8ᵏ.",
          time: 'O(8ᵏ) for answer k',
          space: 'O(k)',
        },
        {
          name: 'BFS over the 10,000 codes',
          idea: "There are only 10,000 codes. BFS visits each one at most once, in order of how many moves it takes to reach it. So the first time we pop `target`, we have the fewest moves.",
          pseudo: `function openLock(deadends, target):
    visited ← set of deadends
    if "0000" in visited: return -1
    add "0000" to visited
    queue ← [("0000", 0)]
    while queue is not empty:
        (code, d) ← queue.popFront()
        if code = target: return d
        for i from 0 to 3:
            for each step in [+1, -1]:
                digit ← (code[i] + step + 10) mod 10
                next ← code with position i set to digit
                if next not in visited:
                    add next to visited
                    append (next, d + 1) to queue
    return -1`,
          code: `function openLock(deadends, target) {
  const seen = new Set(deadends);
  if (seen.has('0000')) return -1;
  seen.add('0000');
  const queue = [['0000', 0]];
  for (let head = 0; head < queue.length; head++) {
    const [code, d] = queue[head];
    if (code === target) return d;
    for (let i = 0; i < 4; i++) {
      for (const step of [1, 9]) { // +9 mod 10 is the same as -1
        const digit = (Number(code[i]) + step) % 10;
        const next = code.slice(0, i) + digit + code.slice(i + 1);
        if (!seen.has(next)) {
          seen.add(next);
          queue.push([next, d + 1]);
        }
      }
    }
  }
  return -1;
}`,
          time: 'O(10⁴ · 8)',
          space: 'O(10⁴)',
        },
      ],
      fn: 'openLock',
      starter: `function openLock(deadends, target) {
  // BFS from "0000"; each code has 8 neighbors
  return -1;
}`,
      solution: `function openLock(deadends, target) {
  const seen = new Set(deadends);
  if (seen.has('0000')) return -1;
  seen.add('0000');
  const queue = [['0000', 0]];
  for (let head = 0; head < queue.length; head++) {
    const [code, d] = queue[head];
    if (code === target) return d;
    for (let i = 0; i < 4; i++) {
      for (const step of [1, 9]) {
        const digit = (Number(code[i]) + step) % 10;
        const next = code.slice(0, i) + digit + code.slice(i + 1);
        if (!seen.has(next)) {
          seen.add(next);
          queue.push([next, d + 1]);
        }
      }
    }
  }
  return -1;
}`,
      tests: [
        { name: 'detour around dead ends', args: [['0201', '0101', '0102', '1212', '2002'], '0202'], expected: 6 },
        { name: 'one click down', args: [['8888'], '0009'], expected: 1 },
        { name: 'target fully surrounded', args: [['8887', '8889', '8878', '8898', '8788', '8988', '7888', '9888'], '8888'], expected: -1 },
        { name: 'start is a dead end', args: [['0000'], '8888'], expected: -1 },
        { name: 'already open', args: [['1111'], '0000'], expected: 0 },
        { name: 'wrap around to 9999', args: [['1234'], '9999'], expected: 4 },
        { name: 'farthest code', args: [['1111'], '5555'], expected: 20 },
      ],
      takeaway: 'Nodes can be states. Generate neighbors on the fly and BFS over them.',
    },
    {
      id: 'graphs-word-ladder',
      title: 'Word ladder (stretch)',
      difficulty: 'hard',
      leetcode: 127,
      pattern: 'BFS on states (implicit graph)',
      statement:
        "**Stretch problem.** In a word game you turn `beginWord` into `endWord` one letter at a time. Every word you step on after the first must be in `wordList`, and each step changes exactly one letter. All words have the same length and use lowercase letters. Return how many words the shortest ladder has, **counting both** `beginWord` and `endWord`. Return `0` if there is no ladder.",
      examples: [
        { input: 'beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log","cog"]', output: '5', explain: 'hit → hot → dot → dog → cog.' },
        { input: 'beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log"]', output: '0', explain: '"cog" is not in the list.' },
      ],
      constraints: ['1 ≤ word length ≤ 10', '1 ≤ wordList.length ≤ 5000', 'beginWord ≠ endWord'],
      hints: [
        "Each word is a node. Two words are neighbors if they differ in exactly one letter.",
        "Comparing every pair of words is slow. Instead, from a word, try all 26 letters in each position and check the list (as a `Set`).",
        "BFS from `beginWord` with distance 1. Remove words from the set when you push them, so each is used once.",
      ],
      approaches: [
        {
          name: 'Build the graph by comparing all pairs',
          idea: "Compare every pair of words letter by letter to build an adjacency list, then BFS. Correct, but with 5,000 words that is 12.5 million comparisons.",
          time: 'O(N² · L)',
          space: 'O(N²)',
        },
        {
          name: 'BFS, generating neighbors letter by letter',
          idea: "From a word of length L, there are only `26 · L` possible one-letter changes. Check each against a `Set` of unused words. BFS reaches words in order of ladder length, so the first time we pop `endWord` is the shortest ladder.",
          pseudo: `function ladderLength(beginWord, endWord, wordList):
    unused ← set of wordList
    if endWord not in unused: return 0
    queue ← [(beginWord, 1)]
    while queue is not empty:
        (word, d) ← queue.popFront()
        if word = endWord: return d
        for i from 0 to length of word - 1:
            for each letter ch from 'a' to 'z':
                next ← word with position i set to ch
                if next in unused:
                    remove next from unused     // visited
                    append (next, d + 1) to queue
    return 0`,
          code: `function ladderLength(beginWord, endWord, wordList) {
  const unused = new Set(wordList);
  if (!unused.has(endWord)) return 0;
  const queue = [[beginWord, 1]];
  for (let head = 0; head < queue.length; head++) {
    const [word, d] = queue[head];
    if (word === endWord) return d;
    for (let i = 0; i < word.length; i++) {
      for (let code = 97; code <= 122; code++) {
        const next = word.slice(0, i) + String.fromCharCode(code) + word.slice(i + 1);
        if (unused.has(next)) {
          unused.delete(next);
          queue.push([next, d + 1]);
        }
      }
    }
  }
  return 0;
}`,
          time: 'O(N · L² · 26)',
          space: 'O(N · L)',
        },
      ],
      fn: 'ladderLength',
      starter: `function ladderLength(beginWord, endWord, wordList) {
  // BFS over words; count words, not steps
  return 0;
}`,
      solution: `function ladderLength(beginWord, endWord, wordList) {
  const unused = new Set(wordList);
  if (!unused.has(endWord)) return 0;
  const queue = [[beginWord, 1]];
  for (let head = 0; head < queue.length; head++) {
    const [word, d] = queue[head];
    if (word === endWord) return d;
    for (let i = 0; i < word.length; i++) {
      for (let code = 97; code <= 122; code++) {
        const next = word.slice(0, i) + String.fromCharCode(code) + word.slice(i + 1);
        if (unused.has(next)) {
          unused.delete(next);
          queue.push([next, d + 1]);
        }
      }
    }
  }
  return 0;
}`,
      tests: [
        { name: 'classic ladder', args: ['hit', 'cog', ['hot', 'dot', 'dog', 'lot', 'log', 'cog']], expected: 5 },
        { name: 'end word missing', args: ['hit', 'cog', ['hot', 'dot', 'dog', 'lot', 'log']], expected: 0 },
        { name: 'one step', args: ['a', 'c', ['a', 'b', 'c']], expected: 2 },
        { name: 'no bridge word', args: ['hot', 'dog', ['hot', 'dog']], expected: 0 },
        { name: 'one bridge word', args: ['hot', 'dog', ['hot', 'dot', 'dog']], expected: 3 },
        { name: 'begin word not in list is fine', args: ['cat', 'cot', ['cot']], expected: 2 },
      ],
      takeaway: 'Generate neighbors (26 · L per word) instead of comparing every pair.',
    },
  ],
  quiz: [
    {
      prompt: "Why does the first time BFS reaches a node give the shortest path, in a graph where every edge costs 1?",
      options: [
        'BFS tries the shortest edges first',
        'BFS finishes every node at distance d before any node at distance d + 1',
        'BFS visits fewer nodes than DFS',
        'It is a lucky coincidence on small graphs',
      ],
      answer: 1,
      explanation: "The queue holds distance-d nodes in front of distance-(d+1) nodes. So when a node is first reached, no shorter route can still be waiting.",
    },
    {
      prompt: "Roads have different lengths (2 km, 7 km, …). You want the shortest total distance. Is plain BFS correct?",
      options: ['Yes, BFS always finds shortest paths', 'No: BFS counts edges, not their lengths. Use Dijkstra (module 14)', 'Only if you use a stack'],
      answer: 1,
      explanation: "BFS minimizes the number of edges. One 10 km road beats two 1 km roads in BFS's eyes, which is wrong here.",
    },
    {
      prompt: "In BFS you mark a node as visited when you **pop** it instead of when you push it. What goes wrong?",
      options: ['The answer becomes wrong', 'Nothing at all', 'The same node can be pushed many times, wasting time and memory', 'It turns into DFS'],
      answer: 2,
      explanation: "The answer stays correct, but two neighbors can both push the same unmarked node before it is popped. On grids this can blow up the queue.",
    },
  ],
  takeaways: [
    "\"Fewest steps / moves / hops\" with equal-cost steps → BFS.",
    "Store the distance with each queue entry, or process the queue one level at a time.",
    "Mark visited on push. Use a head index, not `shift()`.",
    "States (lock codes, words) are nodes too: generate neighbors on the fly.",
  ],
};

export default lesson;
