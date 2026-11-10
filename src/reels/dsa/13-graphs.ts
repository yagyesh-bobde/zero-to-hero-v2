import type { DiagramEdge, DiagramNode, GridScene, Series } from '../types';

// /dsa/reels module 13. One reel per lesson of src/dsa/modules/13-graphs*.ts, in lesson order.
// Brief: src/reels/dsa/README.md. Rules: src/reels/AUTHORING.md.

// ---- Lesson 1: the friendship graph (0-1, 0-2, 1-3, 2-3, 3-4, and lonely 5) ----

type NodeState = 'seen' | 'now' | 'goal' | 'off' | undefined;

const friendSpots: Record<string, [number, number]> = {
  '0': [1, 0], '1': [0, 1], '2': [2, 1], '3': [1, 2], '4': [0, 3], '5': [2, 3],
};

function friends(states: Record<string, NodeState>, hot: string[] = []): { nodes: DiagramNode[]; edges: DiagramEdge[] } {
  const nodes = Object.entries(friendSpots).map(([id, [x, y]]): DiagramNode => {
    const s = states[id];
    return {
      id, label: id, x, y, shape: 'circle',
      ...(s === 'now' ? { active: true } : {}),
      ...(s === 'seen' || s === 'goal' ? { tone: 'good' } : {}),
      ...(s === 'off' ? { dim: true } : {}),
    };
  });
  const pairs = [['0', '1'], ['0', '2'], ['1', '3'], ['2', '3'], ['3', '4']];
  const edges = pairs.map(([from, to]): DiagramEdge => ({
    from, to, both: true,
    ...(hot.includes(`${from}${to}`) ? { active: true } : {}),
  }));
  return { nodes, edges };
}

// ---- Lesson 2: the island map ----

const W = '0';
const L = '1';
const map = [
  [L, L, W, W, W],
  [L, L, W, W, W],
  [W, W, L, W, W],
  [W, W, W, L, L],
];
const water: [number, number][] = [];
map.forEach((row, r) => row.forEach((v, c) => { if (v === W) water.push([r, c]); }));

/** The map with these cells sunk (turned to water). */
function sunk(cells: [number, number][]): string[][] {
  const g = map.map((row) => [...row]);
  for (const [r, c] of cells) g[r][c] = W;
  return g;
}

// ---- Lesson 3: the maze. '#' = wall, '' = not reached yet, numbers = cells on the path so far ----

const mazeTitle = 'BFS, one ring at a time';
function maze(cells: (string | number)[][], rest: Partial<GridScene>): GridScene {
  return { type: 'grid', title: mazeTitle, cells, done: [[1, 0], [1, 1], [2, 0], [2, 1]], ...rest };
}

// ---- Lesson 4: two rotten oranges ----

const crate = [
  [2, 1, 1, 1],
  [1, 1, 0, 1],
  [1, 1, 1, 2],
];
const rotTitle = 'Minute each orange rots';
function rot(cells: (string | number)[][], rest: Partial<GridScene>): GridScene {
  return { type: 'grid', title: rotTitle, cells, done: [[1, 2]], ...rest };
}

// ---- Lesson 5: the course diamond 0 → 1, 0 → 2, 1 → 3, 2 → 3 ----

const courseSpots: Record<string, [number, number]> = { '0': [1, 0], '1': [0, 1.5], '2': [2, 1.5], '3': [1, 3] };

/** `marks` is one letter per course: L = locked (still waiting), R = ready, T = taken. */
function courses(waits: number[], marks: string, now?: string, hot: string[] = []): { nodes: DiagramNode[]; edges: DiagramEdge[] } {
  const icon: Record<string, string> = { L: '⏳', R: '🔓', T: '✅' };
  const nodes = Object.entries(courseSpots).map(([id, [x, y]]): DiagramNode => {
    const m = marks[Number(id)];
    return {
      id, label: `Course ${id}`, sub: `waits for ${waits[Number(id)]}`, x, y, icon: icon[m],
      ...(m === 'T' ? { tone: 'good' } : {}),
      ...(m === 'R' ? { tone: 'info' } : {}),
      ...(id === now ? { active: true } : {}),
    };
  });
  const pairs = [['0', '1'], ['0', '2'], ['1', '3'], ['2', '3']];
  const edges = pairs.map(([from, to]): DiagramEdge => ({
    from, to,
    ...(hot.includes(`${from}${to}`) ? { active: true } : {}),
  }));
  return { nodes, edges };
}

export const series: Series = {
  id: 'dsa-graphs',
  title: 'Graphs: BFS, DFS & topological sort',
  emoji: '🕸️',
  color: '#fb923c',
  order: 13,
  blurb: 'Grids, islands, shortest steps and dependency order.',
  reels: [
    // ------------------------------------------------------------------ Lesson 1
    {
      id: 'dsa-graphs-graph-basics',
      title: 'What a graph is and how to walk it',
      link: { label: 'Solve it', href: '/dsa#/m/graphs/graph-basics/graphs-path-exists' },
      beats: [
        {
          say: 'Pizza to black holes, clicking only links. Can you get there?',
          emphasis: ['black', 'holes'],
          scene: { type: 'title', kicker: 'Graphs · Lesson 1', title: 'From pizza to *black holes*', emoji: '🕳️', style: 'slam' },
        },
        {
          say: 'Six friends, and each line is a friendship. A message from zero reaches four, but nobody reaches five.',
          emphasis: ['four', 'five'],
          sfx: 'pop',
          scene: {
            type: 'diagram', title: 'A friendship graph', cols: 3, rows: 4,
            ...friends({ '0': 'now', '1': 'seen', '3': 'seen', '4': 'goal', '5': 'off' }, ['01', '13', '34']),
            caption: '0 reaches 4 through 1 and 3',
          },
        },
        {
          say: 'The easy way rereads the whole edge list, again and again, until nobody new is reached.',
          emphasis: ['whole', 'again'],
          sfx: 'type',
          scene: {
            type: 'code', lang: 'pseudo', file: 'Brute force',
            code: `function canReach(edges, start, goal):
    reached ← set with start
    changed ← true
    while changed:
        changed ← false
        for each [a, b] in edges:
            if a in reached, b not:
                add b; changed ← true
            if b in reached, a not:
                add a; changed ← true
    return goal in reached`,
            highlight: [[4, 6]],
            note: { line: 6, text: 'every pass reads every edge', tone: 'warn' },
          },
        },
        {
          say: 'Ten thousand people and fifty thousand friendships can mean five hundred million edge reads.',
          emphasis: ['million'],
          sfx: 'error',
          scene: { type: 'stat', value: '500M', label: 'edge reads for *10,000* people', sub: 'O(n·E): rereads every edge, every pass', tone: 'bad' },
        },
        {
          say: 'So write each person’s friends down once. Then never visit anyone twice.',
          emphasis: ['once', 'twice'],
          sfx: 'ding',
          scene: { type: 'title', kicker: 'The insight', title: 'Write the *neighbors* down once', emoji: '💡', style: 'slam' },
        },
        {
          say: 'Read each edge once and add it both ways. Now three’s friends are a single lookup: one, two and four.',
          emphasis: ['both', 'lookup'],
          sfx: 'pop',
          scene: {
            type: 'grid', title: 'An adjacency list',
            rowLabels: ['adj[0]', 'adj[1]', 'adj[2]', 'adj[3]', 'adj[4]', 'adj[5]'],
            cells: [[1, 2, ''], [0, 3, ''], [0, 3, ''], [1, 2, 4], [3, '', ''], ['', '', '']],
            found: [[3, 0], [3, 1], [3, 2]],
            caption: 'person 5 still gets an empty row',
          },
        },
        {
          say: 'Now walk it with a stack. Pop zero, then push one and two, and mark them seen right away.',
          emphasis: ['stack', 'seen'],
          scene: {
            type: 'diagram', title: 'DFS from 0, with a stack', cols: 3, rows: 4,
            ...friends({ '0': 'now', '1': 'seen', '2': 'seen', '3': 'off', '4': 'off', '5': 'off' }, ['01', '02']),
            caption: 'stack [1, 2] · seen 0 1 2',
          },
        },
        {
          say: 'Pop two. Zero is already seen, so only three gets pushed.',
          emphasis: ['three'],
          scene: {
            type: 'diagram', title: 'DFS from 0, with a stack', cols: 3, rows: 4,
            ...friends({ '0': 'seen', '1': 'seen', '2': 'now', '3': 'seen', '4': 'off', '5': 'off' }, ['23']),
            caption: 'stack [1, 3] · seen 0 1 2 3',
          },
        },
        {
          say: 'Pop three. One and two are seen, so push just four. A stack dives deep first.',
          emphasis: ['deep'],
          scene: {
            type: 'diagram', title: 'DFS from 0, with a stack', cols: 3, rows: 4,
            ...friends({ '0': 'seen', '1': 'seen', '2': 'seen', '3': 'now', '4': 'seen', '5': 'off' }, ['34']),
            caption: 'stack [1, 4] · seen 0 to 4',
          },
        },
        {
          say: 'Pop four, then one. Nothing new, and the stack is empty. Four was reached, five never was.',
          emphasis: ['four', 'five'],
          sfx: 'success',
          scene: {
            type: 'diagram', title: 'DFS from 0, with a stack', cols: 3, rows: 4,
            ...friends({ '0': 'seen', '1': 'seen', '2': 'seen', '3': 'seen', '4': 'goal', '5': 'off' }),
            caption: 'stack empty · 4 yes, 5 no',
          },
        },
        {
          say: 'In JavaScript, mark a node the moment you push it. Each node once, each edge twice, so it is O of n plus E.',
          speak: 'In JavaScript, mark a node the moment you push it. Each node once, each edge twice, so it is oh of n plus E.',
          emphasis: ['moment', 'push'],
          sfx: 'type',
          scene: {
            type: 'code', lang: 'js', file: 'reachable.js',
            code: `function reachable(adj, start) {
  const seen = new Set([start]);
  const stack = [start];
  while (stack.length) {
    const node = stack.pop();
    for (const next of adj[node]) {
      if (!seen.has(next)) {
        seen.add(next);
        stack.push(next);
      }
    }
  }
  return seen;
}`,
            highlight: [[7, 8]],
            note: { line: 8, text: 'mark on push: O(n + E)', tone: 'good' },
          },
        },
        {
          say: 'Reach for this when you ask, can X reach Y, or how many groups are there?',
          emphasis: ['reach', 'groups'],
          scene: {
            type: 'list', title: 'Reach for this when…',
            items: [
              { text: 'Can X *reach* Y?', icon: '🧭' },
              { text: 'How many *groups* are there?', icon: '👥' },
              { text: 'A node has many routes in', icon: '🔀' },
            ],
            active: 0,
          },
        },
        {
          say: 'The classic bug is no visited set. Zero pushes one, one pushes zero, and it never stops.',
          emphasis: ['visited', 'never'],
          sfx: 'error',
          scene: {
            type: 'code', lang: 'js', file: 'trap.js',
            code: `// no seen set!
while (stack.length) {
  const node = stack.pop();
  for (const next of adj[node]) {
    stack.push(next);
  }
}`,
            errors: [5],
            note: { line: 5, text: '0, 1, 0, 1… forever', tone: 'bad' },
          },
        },
        {
          say: 'Quick check. A graph has n nodes and E edges in an adjacency list. What does one full walk cost?',
          sfx: 'riser',
          scene: {
            type: 'quiz',
            question: 'n nodes, E edges, an adjacency list. One full DFS costs?',
            options: ['O(n)', 'O(E)', 'O(n + E)', 'O(n · E)'],
            answer: 2,
          },
        },
        {
          say: 'It is O of n plus E. Every node is popped once, and every edge is read from both ends.',
          speak: 'It is oh of n plus E. Every node is popped once, and every edge is read from both ends.',
          emphasis: ['once', 'both'],
          sfx: 'ding',
          scene: {
            type: 'quiz',
            question: 'n nodes, E edges, an adjacency list. One full DFS costs?',
            options: ['O(n)', 'O(E)', 'O(n + E)', 'O(n · E)'],
            answer: 2,
            reveal: true,
            explain: 'n pops, plus 2E neighbor reads.',
          },
        },
        {
          say: 'Remember this. Build the adjacency list, and always keep a visited set. Now tap solve it and try it yourself.',
          emphasis: ['adjacency', 'visited'],
          sfx: 'success',
          scene: {
            type: 'outro',
            points: ['Build an *adjacency list* first', 'Always keep a *visited* set', 'DFS uses a stack, BFS a queue'],
            tagline: 'Now go solve it.',
          },
        },
      ],
    },

    // ------------------------------------------------------------------ Lesson 2
    {
      id: 'dsa-graphs-grids-are-graphs',
      title: 'Grids are graphs: flood fill and islands',
      link: { label: 'Solve it', href: '/dsa#/m/graphs/grids-are-graphs/graphs-number-of-islands' },
      beats: [
        {
          say: 'Click the paint bucket, and a whole blob changes color. How?',
          emphasis: ['paint', 'bucket'],
          scene: { type: 'title', kicker: 'Graphs · Lesson 2', title: 'The *paint bucket* is a graph walk', emoji: '🪣', style: 'slam' },
        },
        {
          say: 'One is land, zero is water. Land that touches up, down, left or right is one island. This map has three.',
          emphasis: ['island', 'three'],
          sfx: 'pop',
          scene: {
            type: 'grid', title: 'Count the islands', cells: map,
            found: [[0, 0], [0, 1], [1, 0], [1, 1], [2, 2], [3, 3], [3, 4]],
            done: water,
            vars: { islands: 3 },
            caption: 'corners don’t touch',
          },
        },
        {
          say: 'The easy way explores the whole island from every land cell, then checks if it was counted already.',
          emphasis: ['every', 'already'],
          sfx: 'type',
          scene: {
            type: 'code', lang: 'pseudo', file: 'Brute force',
            code: `function numIslands(grid):
    found ← empty list of islands
    for each land cell (r, c):
        island ← explore from (r, c)
        if island not in found:
            add island to found
    return size of found`,
            highlight: [[3, 4]],
            note: { line: 4, text: 'the same island, again', tone: 'warn' },
          },
        },
        {
          say: 'A three hundred by three hundred map has ninety thousand cells. That can mean eight billion steps.',
          emphasis: ['billion'],
          sfx: 'error',
          scene: { type: 'stat', value: '8.1B', label: 'steps on a *300 × 300* map', sub: 'O((R·C)²): explores islands again', tone: 'bad' },
        },
        {
          say: 'So when you find new land, count it once, then sink its whole island into water.',
          emphasis: ['count', 'sink'],
          sfx: 'ding',
          scene: { type: 'title', kicker: 'The insight', title: '*Sink* the island as you go', emoji: '💡', style: 'slam' },
        },
        {
          say: 'Scan row by row. The top left cell is land, so that is island one. Start a flood here.',
          emphasis: ['one', 'flood'],
          scene: {
            type: 'grid', title: 'Scan, then flood', cells: map,
            active: [[0, 0]], done: water,
            vars: { islands: 1, stack: '(0,0)' },
          },
        },
        {
          say: 'Pop it, and push its land neighbors. Each cell turns to water the moment it is pushed.',
          emphasis: ['water', 'pushed'],
          scene: {
            type: 'grid', title: 'Scan, then flood', cells: sunk([[0, 0], [0, 1], [1, 0]]),
            active: [[0, 0]], done: water,
            vars: { islands: 1, stack: '(1,0) (0,1)' },
          },
        },
        {
          say: 'Pop the next cell, sink the last land piece, and the stack runs dry. Four cells, one island.',
          emphasis: ['dry', 'one'],
          scene: {
            type: 'grid', title: 'Scan, then flood', cells: sunk([[0, 0], [0, 1], [1, 0], [1, 1]]),
            active: [[1, 1]], done: [...water, [0, 0], [0, 1], [1, 0]],
            vars: { islands: 1, stack: 'empty' },
          },
        },
        {
          say: 'The scan skips the sunk cells and finds land in the middle. That is island two, all alone.',
          emphasis: ['two'],
          scene: {
            type: 'grid', title: 'Scan, then flood', cells: sunk([[0, 0], [0, 1], [1, 0], [1, 1], [2, 2]]),
            active: [[2, 2]], done: [...water, [0, 0], [0, 1], [1, 0], [1, 1]],
            vars: { islands: 2, stack: 'empty' },
          },
        },
        {
          say: 'Corners don’t count, so the bottom right pair is island three. Every cell was handled once.',
          emphasis: ['three', 'once'],
          sfx: 'success',
          scene: {
            type: 'grid', title: 'Scan, then flood', cells: sunk([[0, 0], [0, 1], [1, 0], [1, 1], [2, 2]]),
            found: [[3, 3], [3, 4]], done: [...water, [0, 0], [0, 1], [1, 0], [1, 1], [2, 2]],
            vars: { islands: 3, stack: 'empty' },
          },
        },
        {
          say: 'In JavaScript, flip a cell to zero right when you push it. Each cell once, so it is O of rows times columns.',
          speak: 'In JavaScript, flip a cell to zero right when you push it. Each cell once, so it is oh of rows times columns.',
          emphasis: ['push', 'once'],
          sfx: 'type',
          scene: {
            type: 'code', lang: 'js', file: 'numIslands.js',
            code: `if (grid[r][c] !== '1') continue;
count++;
grid[r][c] = '0';
const stack = [[r, c]];
while (stack.length) {
  const [cr, cc] = stack.pop();
  for (const [dr, dc] of DIRS) {
    const y = cr + dr, x = cc + dc;
    if (!inside(y, x)) continue;
    if (grid[y][x] !== '1') continue;
    grid[y][x] = '0';
    stack.push([y, x]);
  }
}`,
            highlight: [[11, 12]],
            note: { line: 12, text: 'sink on push: O(R·C)', tone: 'good' },
          },
        },
        {
          say: 'Reach for this when you see a grid and words like islands, regions or paint bucket.',
          emphasis: ['grid', 'islands'],
          scene: {
            type: 'list', title: 'Reach for this when…',
            items: [
              { text: 'The input is a *grid* of cells', icon: '🗺️' },
              { text: 'Islands, regions, paint bucket', icon: '🏝️' },
              { text: 'Cells join up, down, left, right', icon: '➕' },
            ],
            active: 1,
          },
        },
        {
          say: 'The trap is a recursive flood. On a map of all land, the calls go ninety thousand deep and crash.',
          emphasis: ['recursive', 'crash'],
          sfx: 'error',
          scene: {
            type: 'code', lang: 'js', file: 'trap.js',
            code: `function sink(r, c) {
  if (grid[r]?.[c] !== '1') return;
  grid[r][c] = '0';
  sink(r + 1, c); sink(r - 1, c);
  sink(r, c + 1); sink(r, c - 1);
}`,
            errors: [[4, 5]],
            note: { line: 5, text: 'all land: 90,000 calls deep', tone: 'bad' },
          },
        },
        {
          say: 'Quick check. In JavaScript, what does if cell do when the cell is the string zero?',
          sfx: 'riser',
          scene: {
            type: 'quiz',
            question: "In JS, what does if (cell) do when cell is the string '0'?",
            options: ['Skips it: it is falsy', 'Runs: it is truthy', 'Throws an error'],
            answer: 1,
          },
        },
        {
          say: 'It runs. Only the empty string is falsy, so water looks like land. Compare with the string one instead.',
          emphasis: ['empty', 'falsy'],
          sfx: 'ding',
          scene: {
            type: 'quiz',
            question: "In JS, what does if (cell) do when cell is the string '0'?",
            options: ['Skips it: it is falsy', 'Runs: it is truthy', 'Throws an error'],
            answer: 1,
            reveal: true,
            explain: "Only '' is a falsy string. Test === '1'.",
          },
        },
        {
          say: 'Remember this. A grid is a graph, and you sink each island as you count it. Now tap solve it and try it yourself.',
          emphasis: ['graph', 'sink'],
          sfx: 'success',
          scene: {
            type: 'outro',
            points: ['A grid is a *graph*: 4 neighbors', 'Count it, then *sink* the island', 'Big grid? Use a *stack*, not recursion'],
            tagline: 'Now go solve it.',
          },
        },
      ],
    },

    // ------------------------------------------------------------------ Lesson 3
    {
      id: 'dsa-graphs-bfs-fewest-steps',
      title: 'BFS for the fewest steps',
      link: { label: 'Solve it', href: '/dsa#/m/graphs/bfs-fewest-steps/graphs-shortest-path-binary-matrix' },
      beats: [
        {
          say: 'Metro apps find the fewest stops in a blink. How?',
          emphasis: ['fewest', 'stops'],
          scene: { type: 'title', kicker: 'Graphs · Lesson 3', title: 'Find the *fewest* stops', emoji: '🚇', style: 'slam' },
        },
        {
          say: 'Walk from the top left to the bottom right, eight directions, around the walls. The shortest path visits four cells.',
          emphasis: ['four'],
          sfx: 'pop',
          scene: {
            type: 'grid', title: 'Shortest path in a maze',
            cells: [[1, 2, ''], ['#', '#', 3], ['#', '#', 4]],
            found: [[0, 0], [0, 1], [1, 2], [2, 2]],
            done: [[1, 0], [1, 1], [2, 0], [2, 1]],
            vars: { cells: 4 },
            caption: 'diagonal moves are allowed',
          },
        },
        {
          say: 'The easy way uses DFS to try every path, and keeps the shortest one it finds.',
          emphasis: ['every', 'path'],
          sfx: 'type',
          scene: {
            type: 'code', lang: 'pseudo', file: 'Brute force',
            code: `function tryAll(cell, path):
    if cell is the goal:
        best ← min(best, length of path)
        return
    for each open neighbor next:
        if next not in path:
            tryAll(next, path + next)`,
            highlight: [[5, 7]],
            note: { line: 7, text: 'every path, even long ones', tone: 'warn' },
          },
        },
        {
          say: 'The number of paths explodes. And the first path DFS finds is just a path, not the shortest.',
          emphasis: ['explodes', 'shortest'],
          sfx: 'error',
          scene: {
            type: 'compare', title: 'Fewest steps on a grid',
            left: { title: 'DFS, every path', verdict: 'bad', items: ['Exponential time', 'Can’t stop early'] },
            right: { title: 'BFS, by rings', verdict: 'ok', items: ['O(n²) time', 'First touch is shortest'] },
          },
        },
        {
          say: 'Drop a stone in a pond. The ripple reaches every cell one step away, then two steps away.',
          emphasis: ['ripple'],
          sfx: 'ding',
          scene: { type: 'title', kicker: 'The insight', title: 'BFS explores in *rings*', emoji: '💡', style: 'slam' },
        },
        {
          say: 'Start at the top left. It is a path of one cell, so write one and put it in the queue.',
          emphasis: ['queue'],
          scene: maze([[1, '', ''], ['#', '#', ''], ['#', '#', '']], {
            active: [[0, 0]], vars: { queue: '(0,0)' },
          }),
        },
        {
          say: 'Pop it. Only one neighbor is open, so it gets a two and joins the queue.',
          emphasis: ['two'],
          scene: maze([[1, 2, ''], ['#', '#', ''], ['#', '#', '']], {
            active: [[0, 1]], reads: [[0, 0]], vars: { queue: '(0,1)' },
          }),
        },
        {
          say: 'Pop that two. Two new cells are one ring further out, so both get a three.',
          emphasis: ['three'],
          scene: maze([[1, 2, 3], ['#', '#', 3], ['#', '#', '']], {
            active: [[0, 2], [1, 2]], reads: [[0, 1]], vars: { queue: '(0,2) (1,2)' },
          }),
        },
        {
          say: 'Pop the top right. Its neighbor already has a number, so skip it. Marking on push saves that work.',
          emphasis: ['skip', 'push'],
          scene: maze([[1, 2, 3], ['#', '#', 3], ['#', '#', '']], {
            active: [[0, 2]], reads: [[1, 2]], vars: { queue: '(1,2)' },
          }),
        },
        {
          say: 'Pop the last three. The goal gets a four. The first touch is the shortest, so we stop.',
          emphasis: ['four', 'first'],
          sfx: 'success',
          scene: maze([[1, 2, 3], ['#', '#', 3], ['#', '#', 4]], {
            found: [[0, 0], [0, 1], [1, 2], [2, 2]], vars: { queue: '(2,2)', answer: 4 },
          }),
        },
        {
          say: 'In JavaScript, mark a cell when you push it, with its distance. Each cell once, so it is O of n squared.',
          speak: 'In JavaScript, mark a cell when you push it, with its distance. Each cell once, so it is oh of n squared.',
          emphasis: ['mark', 'push'],
          sfx: 'type',
          scene: {
            type: 'code', lang: 'js', file: 'shortestPath.js',
            code: `const L = grid.length - 1;
grid[0][0] = 1;
const q = [[0, 0, 1]];
for (let i = 0; i < q.length; i++) {
  const [r, c, d] = q[i];
  if (r === L && c === L) return d;
  for (const [y, x] of around(r, c)) {
    if (grid[y]?.[x] !== 0) continue;
    grid[y][x] = 1;
    q.push([y, x, d + 1]);
  }
}
return -1;`,
            highlight: [[9, 10]],
            note: { line: 10, text: 'mark on push: O(n²)', tone: 'good' },
          },
        },
        {
          say: 'Reach for this when you want the fewest steps, and every step costs the same.',
          emphasis: ['fewest', 'same'],
          scene: {
            type: 'list', title: 'Reach for this when…',
            items: [
              { text: 'Fewest *steps*, moves or hops', icon: '👣' },
              { text: 'Every step costs the *same*', icon: '⚖️' },
              { text: 'States like lock codes count too', icon: '🔐' },
            ],
            active: 1,
          },
        },
        {
          say: 'The trap is shift. In JavaScript it moves every item, so a big queue gets slow. Use a head index.',
          speak: 'The trap is shift. In JavaScript it moves every item, so a big queue gets slow. Use a head index.',
          emphasis: ['shift', 'index'],
          sfx: 'error',
          scene: {
            type: 'code', lang: 'js', file: 'trap.js',
            code: `while (queue.length) {
  const cell = queue.shift();
  visit(cell);
}`,
            errors: [2],
            note: { line: 2, text: 'shift() is O(n) every time', tone: 'bad' },
          },
        },
        {
          say: 'Quick check. Roads are two or seven kilometers long. Does plain BFS find the shortest distance?',
          sfx: 'riser',
          scene: {
            type: 'quiz',
            question: 'Roads are 2 km or 7 km long. Does BFS find the shortest distance?',
            options: ['Yes, always', 'No, use Dijkstra', 'Only with a stack'],
            answer: 1,
          },
        },
        {
          say: 'No. BFS counts roads, not their lengths. When steps cost different amounts, you need Dijkstra.',
          emphasis: ['counts', 'Dijkstra'],
          sfx: 'ding',
          scene: {
            type: 'quiz',
            question: 'Roads are 2 km or 7 km long. Does BFS find the shortest distance?',
            options: ['Yes, always', 'No, use Dijkstra', 'Only with a stack'],
            answer: 1,
            reveal: true,
            explain: 'BFS counts edges, not their lengths.',
          },
        },
        {
          say: 'Remember this. Same cost per step means BFS, and you mark cells when you push them. Now tap solve it and try it yourself.',
          emphasis: ['BFS', 'push'],
          sfx: 'success',
          scene: {
            type: 'outro',
            points: ['Fewest equal steps? Use *BFS*', 'The first touch is the *shortest*', 'Mark on *push*, not on pop'],
            tagline: 'Now go solve it.',
          },
        },
      ],
    },

    // ------------------------------------------------------------------ Lesson 4
    {
      id: 'dsa-graphs-multi-source-bfs',
      title: 'Multi-source BFS: spreading from many places at once',
      link: { label: 'Solve it', href: '/dsa#/m/graphs/multi-source-bfs/graphs-rotting-oranges' },
      beats: [
        {
          say: 'Three kids start a rumor at once. When does everyone know?',
          emphasis: ['everyone'],
          scene: { type: 'title', kicker: 'Graphs · Lesson 4', title: 'When does *everyone* know?', emoji: '🗣️', style: 'slam' },
        },
        {
          say: 'Two is rotten, one is fresh. Each minute, rot spreads to fresh neighbors. Here, all of them rot in two minutes.',
          emphasis: ['rotten', 'two'],
          sfx: 'pop',
          scene: {
            type: 'grid', title: 'A crate of oranges', cells: crate,
            active: [[0, 0], [2, 3]], done: [[1, 2]],
            vars: { answer: '2 min' },
            caption: 'up, down, left and right',
          },
        },
        {
          say: 'The easy way simulates it. Every minute, rescan the whole crate for fresh oranges next to rot.',
          emphasis: ['rescan', 'whole'],
          sfx: 'type',
          scene: {
            type: 'code', lang: 'pseudo', file: 'Brute force',
            code: `minutes ← 0
while something rotted last minute:
    for each cell (r, c):
        if fresh and next to rotten:
            rot it after this scan
    minutes ← minutes + 1`,
            highlight: [[3, 4]],
            note: { line: 4, text: 'every cell, every minute', tone: 'warn' },
          },
        },
        {
          say: 'A long snake of oranges can take a minute per cell. On a big crate, that is billions of checks.',
          emphasis: ['billions'],
          sfx: 'error',
          scene: { type: 'stat', value: '8.1B', label: 'checks on a *300 × 300* crate', sub: 'O((R·C)²): rescans rotted cells', tone: 'bad' },
        },
        {
          say: 'So put every rotten orange in the queue at minute zero. Then run one normal BFS.',
          emphasis: ['every', 'one'],
          sfx: 'ding',
          scene: { type: 'title', kicker: 'The insight', title: 'Start *every* source at once', emoji: '💡', style: 'slam' },
        },
        {
          say: 'Both rotten oranges go in the queue together, at minute zero. Nine fresh ones are left.',
          emphasis: ['together', 'zero'],
          scene: rot([[0, '', '', ''], ['', '', '—', ''], ['', '', '', 0]], {
            active: [[0, 0], [2, 3]], vars: { minute: 0, fresh: 9 },
          }),
        },
        {
          say: 'Minute one. Each source rots the oranges right next to it. Both ripples spread at the same time.',
          emphasis: ['same', 'time'],
          scene: rot([[0, 1, '', ''], [1, '', '—', 1], ['', '', 1, 0]], {
            active: [[0, 1], [1, 0], [1, 3], [2, 2]], reads: [[0, 0], [2, 3]], vars: { minute: 1, fresh: 5 },
          }),
        },
        {
          say: 'Minute two. The ripples meet in the middle, and the last five fresh oranges rot.',
          emphasis: ['meet', 'five'],
          scene: rot([[0, 1, 2, 2], [1, 2, '—', 1], [2, 2, 1, 0]], {
            active: [[0, 2], [0, 3], [1, 1], [2, 0], [2, 1]], vars: { minute: 2, fresh: 0 },
          }),
        },
        {
          say: 'Fresh hits zero, so stop. The answer is two minutes, and each cell joined the queue once.',
          emphasis: ['two', 'once'],
          sfx: 'success',
          scene: rot([[0, 1, 2, 2], [1, 2, '—', 1], [2, 2, 1, 0]], {
            found: [[0, 2], [0, 3], [1, 1], [2, 0], [2, 1]], vars: { minute: 2, fresh: 0 },
            caption: 'answer: 2 minutes',
          }),
        },
        {
          say: 'In JavaScript, run one level per minute, and swap in the next level. That is O of rows times columns.',
          speak: 'In JavaScript, run one level per minute, and swap in the next level. That is oh of rows times columns.',
          emphasis: ['level', 'minute'],
          sfx: 'type',
          scene: {
            type: 'code', lang: 'js', file: 'orangesRotting.js',
            code: `// queue starts with ALL rotten ones
let minutes = 0;
while (queue.length && fresh > 0) {
  minutes++;
  const next = [];
  for (const [r, c] of queue) {
    for (const [y, x] of near(r, c)) {
      if (grid[y][x] !== 1) continue;
      grid[y][x] = 2; fresh--;
      next.push([y, x]);
    }
  }
  queue = next;
}`,
            highlight: [1, 13],
            note: { line: 13, text: 'one level = one minute', tone: 'good' },
          },
        },
        {
          say: 'Reach for this when many sources spread at once, or you need the distance to the nearest one.',
          emphasis: ['many', 'nearest'],
          scene: {
            type: 'list', title: 'Reach for this when…',
            items: [
              { text: 'Many *sources* spread at once', icon: '🌊' },
              { text: 'Distance to the *nearest* X', icon: '📍' },
              { text: 'The answer is minutes or rounds', icon: '⏱️' },
            ],
            active: 1,
          },
        },
        {
          say: 'The trap is one minute too many. If you count a level that rots nothing, you get three, not two.',
          emphasis: ['too', 'many'],
          sfx: 'error',
          scene: {
            type: 'code', lang: 'js', file: 'trap.js',
            code: `while (queue.length) {
  minutes++;
  queue = spread(queue);
}
return minutes;`,
            errors: [2],
            note: { line: 2, text: 'counts a minute with no rot', tone: 'bad' },
          },
        },
        {
          say: 'Quick check. Three fresh oranges in a row, and no rotten ones. What is the answer?',
          sfx: 'riser',
          scene: {
            type: 'quiz',
            question: 'Grid [[1, 1, 1]]: three fresh oranges, no rotten ones. Answer?',
            options: ['0', '3', '-1', '1'],
            answer: 2,
          },
        },
        {
          say: 'It is minus one. Nothing can ever rot them, so fresh oranges stay forever.',
          emphasis: ['minus', 'forever'],
          sfx: 'ding',
          scene: {
            type: 'quiz',
            question: 'Grid [[1, 1, 1]]: three fresh oranges, no rotten ones. Answer?',
            options: ['0', '3', '-1', '1'],
            answer: 2,
            reveal: true,
            explain: 'No source, so they stay fresh: -1.',
          },
        },
        {
          say: 'Remember this. Push every source first, then run one BFS, level by level. Now tap solve it and try it yourself.',
          emphasis: ['every', 'level'],
          sfx: 'success',
          scene: {
            type: 'outro',
            points: ['Push *every* source first', 'One BFS, one level per *minute*', 'Nearest X? Start *from* the X’s'],
            tagline: 'Now go solve it.',
          },
        },
      ],
    },

    // ------------------------------------------------------------------ Lesson 5
    {
      id: 'dsa-graphs-cycles-and-topological-sort',
      title: 'Cycles and topological sort: doing things in dependency order',
      link: { label: 'Solve it', href: '/dsa#/m/graphs/cycles-and-topological-sort/graphs-course-schedule' },
      beats: [
        {
          say: 'Socks before shoes. How does your computer know what to install first?',
          emphasis: ['before'],
          scene: { type: 'title', kicker: 'Graphs · Lesson 5', title: 'Socks *before* shoes', emoji: '🧦', style: 'slam' },
        },
        {
          say: 'Four courses. An arrow means take this one first. So zero, then one and two, then three.',
          emphasis: ['arrow', 'first'],
          sfx: 'pop',
          scene: {
            type: 'diagram', title: 'Courses and prerequisites', cols: 3, rows: 4,
            ...courses([0, 1, 1, 2], 'TTTT'),
            caption: 'one valid order: 0, 1, 2, 3',
          },
        },
        {
          say: 'The easy way scans every rule, every round, hunting for a course you can take.',
          emphasis: ['every', 'round'],
          sfx: 'type',
          scene: {
            type: 'code', lang: 'pseudo', file: 'Brute force',
            code: `taken ← empty set; order ← empty
repeat n times:
    find a course not taken whose
        prerequisites are all taken
    if none found: return "impossible"
    add it to taken and to order
return order`,
            highlight: [[3, 4]],
            note: { line: 4, text: 'rescans every rule', tone: 'warn' },
          },
        },
        {
          say: 'Ten thousand courses with fifty thousand rules means about six hundred million checks.',
          emphasis: ['million'],
          sfx: 'error',
          scene: { type: 'stat', value: '600M', label: 'checks for *10,000* courses', sub: 'O(n·(n+E)): rescans every round', tone: 'bad' },
        },
        {
          say: 'So give each course a counter: how many courses it still waits for. Zero means ready.',
          emphasis: ['counter', 'ready'],
          sfx: 'ding',
          scene: { type: 'title', kicker: 'The insight', title: 'Count what is still *missing*', emoji: '💡', style: 'slam' },
        },
        {
          say: 'Count the arrows coming in. Only course zero waits for nothing, so it goes in the ready queue.',
          emphasis: ['zero', 'ready'],
          scene: {
            type: 'diagram', title: 'Kahn’s algorithm', cols: 3, rows: 4,
            ...courses([0, 1, 1, 2], 'RLLL', '0'),
            caption: 'ready: 0 · order: none yet',
          },
        },
        {
          say: 'Take zero. Its arrows lower one and two to zero, so both are ready now.',
          emphasis: ['both'],
          scene: {
            type: 'diagram', title: 'Kahn’s algorithm', cols: 3, rows: 4,
            ...courses([0, 0, 0, 2], 'TRRL', '0', ['01', '02']),
            caption: 'ready: 1, 2 · order: 0',
          },
        },
        {
          say: 'Take one. Course three drops to one. It still waits for course two.',
          emphasis: ['still'],
          scene: {
            type: 'diagram', title: 'Kahn’s algorithm', cols: 3, rows: 4,
            ...courses([0, 0, 0, 1], 'TTRL', '1', ['13']),
            caption: 'ready: 2 · order: 0, 1',
          },
        },
        {
          say: 'Take two. Now course three waits for nothing, so it joins the queue.',
          emphasis: ['nothing'],
          scene: {
            type: 'diagram', title: 'Kahn’s algorithm', cols: 3, rows: 4,
            ...courses([0, 0, 0, 0], 'TTTR', '2', ['23']),
            caption: 'ready: 3 · order: 0, 1, 2',
          },
        },
        {
          say: 'Take three. Four of four are taken, so there is no cycle. Leftovers would mean a loop.',
          emphasis: ['no', 'cycle'],
          sfx: 'success',
          scene: {
            type: 'diagram', title: 'Kahn’s algorithm', cols: 3, rows: 4,
            ...courses([0, 0, 0, 0], 'TTTT', '3'),
            caption: 'order: 0, 1, 2, 3',
          },
        },
        {
          say: 'In JavaScript, each arrow lowers a counter once. That makes it O of n plus E.',
          speak: 'In JavaScript, each arrow lowers a counter once. That makes it oh of n plus E.',
          emphasis: ['once'],
          sfx: 'type',
          scene: {
            type: 'code', lang: 'js', file: 'canFinish.js',
            code: `for (const [course, pre] of rules) {
  adj[pre].push(course);
  indeg[course]++;
}
const q = [];
for (let c = 0; c < n; c++)
  if (indeg[c] === 0) q.push(c);
for (let i = 0; i < q.length; i++) {
  for (const y of adj[q[i]]) {
    indeg[y]--;
    if (indeg[y] === 0) q.push(y);
  }
}
return q.length === n; // no cycle`,
            highlight: [[10, 11]],
            note: { line: 11, text: 'each arrow once: O(n + E)', tone: 'good' },
          },
        },
        {
          say: 'Reach for this when you see words like prerequisite, depends on, or must come before.',
          emphasis: ['prerequisite', 'before'],
          scene: {
            type: 'list', title: 'Reach for this when…',
            items: [
              { text: '*Prerequisites* or depends on', icon: '🔗' },
              { text: 'Must come *before*', icon: '⏭️' },
              { text: 'Can you finish them all?', icon: '✅' },
            ],
            active: 1,
          },
        },
        {
          say: 'The trap is arrow direction. In the pair a, b, the b comes first, so the arrow goes from b to a.',
          emphasis: ['direction'],
          sfx: 'error',
          scene: {
            type: 'code', lang: 'js', file: 'trap.js',
            code: `// [a, b] means b comes first
for (const [a, b] of rules) {
  adj[a].push(b);
  indeg[b]++;
}`,
            errors: [[3, 4]],
            note: { line: 4, text: 'backwards: should be b → a', tone: 'bad' },
          },
        },
        {
          say: 'Quick check. The algorithm takes five of seven courses, then stops. What does that tell you?',
          sfx: 'riser',
          scene: {
            type: 'quiz',
            question: 'Kahn’s algorithm takes 5 of 7 courses, then stops. Why?',
            options: ['The answer is 5', 'A cycle traps 2 courses', 'It used the wrong queue'],
            answer: 1,
          },
        },
        {
          say: 'There is a cycle. The two leftovers wait on each other, so they never reach zero.',
          emphasis: ['cycle', 'never'],
          sfx: 'ding',
          scene: {
            type: 'quiz',
            question: 'Kahn’s algorithm takes 5 of 7 courses, then stops. Why?',
            options: ['The answer is 5', 'A cycle traps 2 courses', 'It used the wrong queue'],
            answer: 1,
            reveal: true,
            explain: 'They wait on each other forever.',
          },
        },
        {
          say: 'Remember this. Rules become arrows, ready means zero, and leftovers mean a cycle. Now tap solve it and try it yourself.',
          emphasis: ['arrows', 'cycle'],
          sfx: 'success',
          scene: {
            type: 'outro',
            points: ['Rules become *arrows*', 'Ready means in-degree *zero*', 'Leftovers mean a *cycle*'],
            tagline: 'Now go solve it.',
          },
        },
      ],
    },
  ],
};
