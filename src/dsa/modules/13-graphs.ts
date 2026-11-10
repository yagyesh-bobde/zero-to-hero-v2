import type { Module } from '../types';
import basics from './13-graphs.basics';
import bfs from './13-graphs.bfs';
import grids from './13-graphs.grids';
import multiSource from './13-graphs.multi-source';
import topo from './13-graphs.topo';

const mod: Module = {
  id: 'graphs',
  number: 13,
  part: 'nonlinear',
  title: 'Graphs: BFS, DFS & topological sort',
  tagline: 'Grids, islands, shortest steps and dependency order.',
  draft: false,
  intro:
    "Friend networks, maps, mazes, build systems and course plans are all **graphs**: things (nodes) joined by connections (edges). Almost every graph question is answered by one of two walks, DFS (a stack) or BFS (a queue), plus a visited set. After this module you can store any graph, count islands on a grid, find the fewest steps with BFS (even from many starting points at once), and put tasks in dependency order or prove a cycle makes it impossible. Weighted shortest paths, union-find and spanning trees come next, in module 14.",
  lessons: [basics, grids, bfs, multiSource, topo],
  patterns: [
    {
      name: 'Graph walk + visited set (DFS / BFS)',
      signals: [
        "\"can X reach Y\", \"how many groups / components\", \"visit everything\"",
        'Input is an edge list or an adjacency list (`rooms[i]`, `graph[i]`)',
        'A node can be reached by more than one route (needs a visited set)',
      ],
      template: `adj ← list of n empty lists
for each [a, b] in edges: append b to adj[a]; append a to adj[b]
visited ← empty set; groups ← 0
for s from 0 to n - 1:
    if s in visited: continue
    groups ← groups + 1
    add s to visited; stack ← [s]
    while stack is not empty:
        node ← pop from stack
        for each next in adj[node]:
            if next not in visited:
                add next to visited; push next onto stack`,
      examples: ['graphs-path-exists', 'graphs-keys-and-rooms', 'graphs-count-components', 'graphs-reorder-routes'],
    },
    {
      name: 'Grid flood fill',
      signals: [
        'A 2D grid of cells: land/water, colors, open/wall',
        "\"islands\", \"regions\", \"connected area\", \"paint bucket\"",
        'Cells connect up, down, left, right',
      ],
      template: `for each cell (r, c):
    if cell starts a new region:
        handle region; mark (r, c); stack ← [(r, c)]
        while stack is not empty:
            (r, c) ← pop from stack
            for each (dr, dc) in [(1,0), (-1,0), (0,1), (0,-1)]:
                (nr, nc) ← (r + dr, c + dc)
                if inside grid and matches and not marked:
                    mark (nr, nc); push (nr, nc)`,
      examples: ['graphs-flood-fill', 'graphs-number-of-islands', 'graphs-max-area-of-island', 'graphs-number-of-enclaves'],
    },
    {
      name: 'BFS shortest steps (single or multi-source)',
      signals: [
        "\"fewest steps / moves / minutes\", \"nearest\", \"shortest path\" with every step costing the same",
        'Something spreads from several places at once (rot, fire, rumor)',
        "\"distance from every cell to the nearest X\" (start from all the X's)",
        'States like lock codes or words, where one move changes the state',
      ],
      template: `visited ← all sources; queue ← all sources at distance 0
while queue is not empty:
    (node, d) ← queue.popFront()
    if node is the goal: return d
    for each next one step from node:
        if next is allowed and next not in visited:
            add next to visited
            append (next, d + 1) to queue
return -1`,
      examples: [
        'graphs-shortest-path-binary-matrix',
        'graphs-nearest-exit',
        'graphs-open-the-lock',
        'graphs-word-ladder',
        'graphs-rotting-oranges',
        'graphs-01-matrix',
        'graphs-as-far-from-land',
      ],
    },
    {
      name: 'Topological sort / directed cycle check',
      signals: [
        "\"prerequisites\", \"depends on\", \"must come before\", \"build order\"",
        "\"is it possible to finish\" (= is there no cycle?)",
        "\"rooms/nodes that never get stuck in a loop\" (three-color DFS)",
      ],
      template: `build adj and indeg (arrow: before → after)
ready ← all nodes with indeg 0           // min-heap if order must be canonical
order ← empty list
while ready is not empty:
    x ← take from ready; append x to order
    for each y in adj[x]:
        indeg[y] ← indeg[y] - 1
        if indeg[y] = 0: add y to ready
if length of order < n: there is a cycle`,
      examples: ['graphs-course-schedule', 'graphs-course-schedule-ii', 'graphs-eventual-safe-states', 'graphs-parallel-courses'],
    },
  ],
  practice: [
    { title: 'Island Perimeter', leetcode: 463, difficulty: 'easy', hint: 'Each land cell adds 4 edges, minus one for each land neighbor.' },
    { title: 'Number of Closed Islands', leetcode: 1254, difficulty: 'medium', hint: 'Sink everything touching the border first, then count islands.' },
    { title: 'Count Sub Islands', leetcode: 1905, difficulty: 'medium', hint: 'Flood each island in grid2 and check every cell is land in grid1 too.' },
    { title: 'All Paths From Source to Target', leetcode: 797, difficulty: 'medium', hint: 'The graph has no cycles, so DFS needs no visited set; keep the current path.' },
    { title: 'Is Graph Bipartite?', leetcode: 785, difficulty: 'medium', hint: 'BFS and color each node the opposite of its parent. A clash means no.' },
    { title: 'Shortest Bridge', leetcode: 934, difficulty: 'medium', hint: 'Flood one island into a queue, then multi-source BFS toward the other.' },
    { title: 'Walls and Gates', leetcode: 286, difficulty: 'medium', hint: 'Every gate is a source. One BFS from all of them.' },
    { title: 'Minimum Genetic Mutation', leetcode: 433, difficulty: 'medium', hint: 'Same as the word ladder, with 4 letters instead of 26.' },
    { title: 'Shortest Path with Alternating Colors', leetcode: 1129, difficulty: 'medium', hint: 'The state is (node, color of the last edge). BFS over states.' },
    { title: 'Alien Dictionary', leetcode: 269, difficulty: 'hard', hint: 'Compare neighboring words to get "letter a before letter b" rules, then topological sort.' },
  ],
};

export default mod;
