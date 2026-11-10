import type { Lesson } from '../types';

// ---------- shared code strings (reused by lesson blocks and problems) ----------

const connectingCitiesCode = `function minimumCost(n, connections) {
  // cities are numbered 1..n, so the arrays get n + 1 slots (slot 0 unused)
  const parent = Array.from({ length: n + 1 }, (_, i) => i);
  const size = new Array(n + 1).fill(1);
  function find(x) {
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]]; // path compression (halving)
      x = parent[x];
    }
    return x;
  }
  function union(a, b) {
    let ra = find(a), rb = find(b);
    if (ra === rb) return false;          // already in the same group
    if (size[ra] < size[rb]) [ra, rb] = [rb, ra];
    parent[rb] = ra;                       // small group joins big group
    size[ra] += size[rb];
    return true;
  }

  connections.sort((a, b) => a[2] - b[2]); // cheapest road first
  let total = 0, used = 0;
  for (const [a, b, cost] of connections) {
    if (!union(a, b)) continue;            // already linked: this road makes a loop
    total += cost;
    used++;
    if (used === n - 1) break;             // n cities need exactly n - 1 roads
  }
  return used === n - 1 ? total : -1;
}`;

const connectPointsCode = `function minCostConnectPoints(points) {
  const n = points.length;
  const best = new Array(n).fill(Infinity); // cheapest wire from the tree to each point
  const inTree = new Array(n).fill(false);
  best[0] = 0;                              // start the tree at point 0 for free
  let total = 0;
  for (let round = 0; round < n; round++) {
    let u = -1;                             // the closest point not in the tree yet
    for (let i = 0; i < n; i++) {
      if (!inTree[i] && (u === -1 || best[i] < best[u])) u = i;
    }
    inTree[u] = true;
    total += best[u];
    for (let v = 0; v < n; v++) {           // u is in the tree now: can it offer a shorter wire?
      if (inTree[v]) continue;
      const d = Math.abs(points[u][0] - points[v][0]) + Math.abs(points[u][1] - points[v][1]);
      if (d < best[v]) best[v] = d;
    }
  }
  return total;
}`;

const waterCode = `function minCostToSupplyWater(n, wells, pipes) {
  // node 0 is the water source; a well at house i = a pipe 0-i costing wells[i - 1]
  const edges = [...pipes];
  for (let i = 1; i <= n; i++) edges.push([0, i, wells[i - 1]]);

  const parent = Array.from({ length: n + 1 }, (_, i) => i);
  const size = new Array(n + 1).fill(1);
  function find(x) {
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]]; // path compression (halving)
      x = parent[x];
    }
    return x;
  }
  function union(a, b) {
    let ra = find(a), rb = find(b);
    if (ra === rb) return false;          // already in the same group
    if (size[ra] < size[rb]) [ra, rb] = [rb, ra];
    parent[rb] = ra;                       // small group joins big group
    size[ra] += size[rb];
    return true;
  }

  edges.sort((a, b) => a[2] - b[2]);       // cheapest first
  let total = 0, used = 0;
  for (const [a, b, cost] of edges) {
    if (!union(a, b)) continue;            // would make a loop
    total += cost;
    used++;
    if (used === n) break;                 // n + 1 nodes need n edges
  }
  return total;
}`;

// ---------- the lesson ----------

const lesson: Lesson = {
  id: 'minimum-spanning-tree',
  title: 'Minimum spanning tree: connect everything for the least cost',
  summary: 'Kruskal (sort + union-find) and Prim (grow one tree with a heap) find the cheapest network that reaches every node.',
  minutes: 25,
  blocks: [
    {
      kind: 'callout',
      tone: 'story',
      title: 'Fiber for five towns',
      text: 'An internet company wants to bring fiber to 5 towns. Engineers have priced every cable route that is possible: hills, rivers and roads make some routes cheap and some expensive. The company does not care how far a signal travels. It only needs every town linked to every other town, directly or through other towns, and it wants to pay as little as possible for cable. Power grids, water pipes and computer networks all face this same question.',
    },
    {
      kind: 'text',
      text: 'Towns are nodes and cable routes are weighted edges (the weight is the cost). A **spanning tree** is a set of edges that connects all n nodes and has no loop (no way to walk in a circle back to where you started). It always has exactly **n − 1 edges**: fewer cannot reach everyone, and one more would close a loop. A **minimum spanning tree (MST)** is the spanning tree with the smallest total cost. Below, the cheapest network costs **11**. Your job is to find that number.',
    },
    {
      kind: 'diagram',
      title: 'Five towns, seven possible cables',
      art: String.raw`              0
            /   \
         (1)     (4)
          /         \
         2 ---(2)--- 1
         | \         |
        (9)  (8)    (5)
         |      \    |
         4 ---(3)--- 3`,
      caption: 'Edges as `[u, v, cost]`: `[0,1,4] [0,2,1] [1,2,2] [1,3,5] [2,3,8] [3,4,3] [2,4,9]`. We need to pick 4 of these 7 cables.',
    },
    {
      kind: 'diagram',
      title: 'MST is not "shortest paths"',
      art: String.raw`      A               A               A
     / \             /               / \
   (2) (3)         (2)             (2) (3)
   /     \         /               /     \
  B--(2)--C       B--(2)--C       B       C

  all cables      MST: 4          shortest from A: 5`,
      caption: 'Dijkstra (lesson 2) finds the fastest route from A to each town, so it uses A–C (3) instead of going A–B–C (4). The MST does not care about routes from A. It just wants the cheapest set of cables, so it takes the two 2s. Different question, different tree.',
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Brute force: try every set of n − 1 edges',
      code: `function mstBruteForce(n, edges):
    best ← ∞
    for each set S of n - 1 edges chosen from edges:
        if S connects all n nodes:              // check with one DFS
            best ← min(best, total cost of S)
    if best = ∞:
        return -1                               // the graph is not connected
    return best`,
    },
    {
      kind: 'text',
      text: 'It works. For our 5 towns there are only 35 ways to choose 4 of the 7 cables. But 100 towns with 300 possible cables gives about 10⁸¹ sets, more than the number of atoms in the universe. **Spot the waste:** most of those sets are silly. Many contain a loop, so they spend money on a cable that links two towns that were already linked. Others skip a cheap cable and pay for an expensive one that does the same job.',
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'Cheapest edge that does not make a loop',
      text: 'Sort the edges from cheapest to most expensive. Walk through them and **take an edge only if its two ends are not connected yet**. If they are already connected, the edge would make a loop, so skip it. Stop once you have n − 1 edges. This is **Kruskal\'s algorithm**. Why it is safe: when two groups of towns must be joined, the cheapest cable between them is never a worse choice than a pricier one. "Are these two already connected?" is exactly what union-find (also called disjoint set union, DSU) from lesson 1 answers: `union(u, v)` returns `false` when u and v are already in the same group.',
    },
    {
      kind: 'trace',
      title: 'Kruskal on the five towns (edges sorted by cost)',
      columns: ['edge (cost)', 'find(u), find(v)', 'taken?', 'total', 'parent after'],
      rows: [
        ['start', '-', '-', 0, '[0,1,2,3,4]'],
        ['0–2 (1)', '0, 2', 'yes', 1, '[0,1,0,3,4]'],
        ['1–2 (2)', '1, 0', 'yes', 3, '[0,0,0,3,4]'],
        ['3–4 (3)', '3, 4', 'yes', 6, '[0,0,0,3,3]'],
        ['0–1 (4)', '0, 0', 'no: loop', 6, '[0,0,0,3,3]'],
        ['1–3 (5)', '0, 3', 'yes, 4th edge', 11, '[0,0,0,0,3]'],
      ],
      note: 'After 4 edges (n − 1 = 4) we stop. Cables 2–3 (8) and 2–4 (9) are never even looked at. In the 1–2 row, group {1} is smaller than group {0, 2}, so 1 joins under 0. Total: **11**.',
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Kruskal',
      code: `function kruskal(n, edges):                 // edges: [u, v, cost]
    sort edges by cost, smallest first
    make n groups, one per node             // union-find
    total ← 0
    used ← 0
    for each [u, v, cost] in edges:
        if union(u, v) = false:             // same group: this edge makes a loop
            continue
        total ← total + cost
        used ← used + 1
        if used = n - 1:                    // a tree on n nodes has n - 1 edges
            break
    if used < n - 1:
        return -1                           // some node never joined
    return total`,
    },
    {
      kind: 'code',
      lang: 'js',
      title: 'Kruskal in JavaScript (union-find from lesson 1, unchanged)',
      code: `function kruskalMST(n, edges) {
  const parent = Array.from({ length: n }, (_, i) => i);
  const size = new Array(n).fill(1);
  function find(x) {
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]]; // path compression (halving)
      x = parent[x];
    }
    return x;
  }
  function union(a, b) {
    let ra = find(a), rb = find(b);
    if (ra === rb) return false;          // already in the same group
    if (size[ra] < size[rb]) [ra, rb] = [rb, ra];
    parent[rb] = ra;                       // small group joins big group
    size[ra] += size[rb];
    return true;
  }

  edges.sort((a, b) => a[2] - b[2]);       // cheapest first (needs the comparator!)
  let total = 0, used = 0;
  for (const [u, v, w] of edges) {
    if (!union(u, v)) continue;            // would make a loop: skip
    total += w;
    used++;
    if (used === n - 1) break;
  }
  return used === n - 1 ? total : -1;      // fewer than n - 1 edges: not connected
}

kruskalMST(5, [[0,1,4],[0,2,1],[1,2,2],[1,3,5],[2,3,8],[3,4,3],[2,4,9]]); // 11`,
    },
    {
      kind: 'text',
      text: '**A second way: Prim\'s algorithm.** Kruskal grows many little groups and merges them. Prim grows **one** tree from a start node. At every step it looks at the edges that leave the tree (one end inside, one end outside) and adds the cheapest one. A min-heap always hands you the smallest item first, so it hands you that cheapest edge. The code looks almost exactly like Dijkstra from lesson 2, with one big difference: the heap key is **the cost of that one edge**, not the total distance from the start. An entry for a node that is already in the tree is a stale entry: skip it.',
    },
    {
      kind: 'trace',
      title: 'Prim on the five towns, starting at 0 (heap shown as cost:node)',
      columns: ['pop [cost, node]', 'action', 'total', 'in tree', 'heap after'],
      rows: [
        ['[0, 0]', 'add 0, push its edges', 0, '{0}', '1:2  4:1'],
        ['[1, 2]', 'add 2, push its edges', 1, '{0,2}', '2:1  4:1  8:3  9:4'],
        ['[2, 1]', 'add 1, push 5:3', 3, '{0,1,2}', '4:1  5:3  8:3  9:4'],
        ['[4, 1]', 'skip: 1 already in tree', 3, '{0,1,2}', '5:3  8:3  9:4'],
        ['[5, 3]', 'add 3, push 3:4', 8, '{0,1,2,3}', '3:4  8:3  9:4'],
        ['[3, 4]', 'add 4: all 5 in, stop', 11, '{0,1,2,3,4}', '8:3  9:4'],
      ],
      note: 'Same total as Kruskal: **11**. In the `[5, 3]` row, town 4 enters the heap at 3 (cable 3–4), not 8 + 3 = 11, because the key is that one cable\'s cost.',
    },
    {
      kind: 'code',
      lang: 'js',
      title: 'Prim with a heap (looks like Dijkstra, but the key is the edge cost)',
      code: `function primMST(n, edges) {
  const graph = Array.from({ length: n }, () => []);
  for (const [u, v, w] of edges) {
    graph[u].push([v, w]);
    graph[v].push([u, w]);                  // cables go both ways
  }
  const inTree = new Array(n).fill(false);
  const heap = new Heap((a, b) => a[0] - b[0]); // [edge cost, node], cheapest edge first
  heap.push([0, 0]);                        // node 0 joins for free
  let total = 0, count = 0;
  while (!heap.isEmpty() && count < n) {
    const [w, u] = heap.pop();
    if (inTree[u]) continue;                // stale entry: u joined the tree already
    inTree[u] = true;
    total += w;
    count++;
    for (const [v, cost] of graph[u]) {
      if (!inTree[v]) heap.push([cost, v]); // key = this ONE edge's cost
    }
  }
  return count === n ? total : -1;
}`,
    },
    {
      kind: 'text',
      text: '**Dense graphs: Prim with a plain array.** Sometimes every node can connect to every other node, like points on a map (problem 1584 below). Then n = 1000 points means about 500,000 edges. Sorting or heaping all of them is slow and eats memory. Instead keep `best[v]` = the cheapest edge from the tree to v. Each round, scan all n nodes to find the smallest `best` outside the tree (n steps), add it, then update `best` for the others (n steps). That is n rounds of 2n work: **O(n²)**, no heap, no edge list.',
    },
    {
      kind: 'compare',
      title: 'Four ways to find the MST (n nodes, E edges)',
      rows: [
        { approach: 'Brute force: every set of n − 1 edges', time: 'O(C(E, n−1) · n)', space: 'O(n + E)', note: 'Correct, hopeless past about 20 edges.' },
        { approach: 'Kruskal: sort + union-find', time: 'O(E log E)', space: 'O(n)', note: 'Sorting is the cost. Best when you are handed an edge list.' },
        { approach: 'Prim with a heap', time: 'O(E log E)', space: 'O(n + E)', note: 'Needs an adjacency list. Fine for sparse graphs too.' },
        { approach: 'Prim with an array', time: 'O(n²)', space: 'O(n)', note: 'Best when every pair can connect (E ≈ n²/2).' },
      ],
    },
    {
      kind: 'table',
      title: 'Signals: when to reach for an MST',
      head: ['The problem says', 'Reach for'],
      rows: [
        ['"connect all ... for the least total cost", "cheapest network"', 'MST'],
        ['You get an edge list `[a, b, cost]`', 'Kruskal'],
        ['Only points or houses; any pair can connect', 'Prim with an array, O(n²)'],
        ['Some nodes can serve themselves (a well, a generator)', 'Virtual node 0 + MST'],
        ['"cheapest route from A to B"', 'Not MST: Dijkstra (lesson 2)'],
      ],
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Pattern templates',
      code: `// Kruskal: sort the edges, join groups with union-find
sort edges by cost
for each [u, v, cost] in edges:
    if union(u, v):                         // true = two different groups
        total ← total + cost
        used ← used + 1
return total if used = n - 1, else -1

// Prim, dense version: grow one tree, no heap
best ← array of n, all ∞
best[0] ← 0
repeat n times:
    u ← the node not in tree with the smallest best[u]
    add u to tree
    total ← total + best[u]
    for each node v not in tree:
        best[v] ← min(best[v], cost(u, v))
return total`,
    },
    {
      kind: 'callout',
      tone: 'trap',
      title: 'Prim is not Dijkstra',
      text: 'If you copy Dijkstra and push `[d + w, v]` (the total distance), you build the shortest-path tree, not the MST. On the five towns that buggy version joins town 4 with cable 2–4 (9) instead of 3–4 (3) and pays **17** instead of **11**. Push `[w, v]`: the cost of that one edge. Two more traps: in Kruskal, always check that you took n − 1 edges (fewer means the graph is not connected, so return -1), and never call `sort()` without `(a, b) => a[2] - b[2]`, or JavaScript sorts the edges as strings.',
    },
  ],
  problems: [
    {
      id: 'advanced-graphs-connecting-cities',
      title: 'Connecting Cities With Minimum Cost',
      difficulty: 'medium',
      leetcode: 1135,
      pattern: 'MST (Kruskal)',
      statement: 'A new country has n cities, numbered 1 to n, and no roads yet. The planners list every road they could build: `connections[i] = [a, b, cost]` means a two-way road between city a and city b costs `cost`. Return the least total cost to build roads so that every city can reach every other city (directly or through other cities). If even building every listed road would leave some city cut off, return -1.',
      examples: [
        {
          input: 'n = 5, connections = [[1,2,4],[1,3,1],[2,3,2],[2,4,5],[3,4,8],[4,5,3],[3,5,9]]',
          output: '11',
          explain: 'This is the five-towns graph from the lesson, renumbered 1 to 5. Take 1–3 (1), 2–3 (2), 4–5 (3), skip 1–2 (4) because 1 and 2 are already linked, take 2–4 (5). 4 roads for 5 cities, total 11.',
        },
        {
          input: 'n = 4, connections = [[1,2,3],[3,4,4]]',
          output: '-1',
          explain: 'Cities 1, 2 and cities 3, 4 form two islands. No listed road joins them.',
        },
      ],
      constraints: ['1 ≤ n ≤ 10⁴', '0 ≤ connections.length ≤ 10⁴', '1 ≤ a, b ≤ n, a ≠ b', '0 ≤ cost ≤ 10⁵', 'The same pair of cities may appear more than once'],
      hints: [
        '"Every city reachable, least total cost" is an MST question, not a shortest-path one.',
        'Sort the roads by cost and walk through them from cheapest to most expensive.',
        'Use union-find. If `union(a, b)` returns `false`, the two cities are already linked, so the road would make a loop: skip it.',
        'Count the roads you take. A full network needs exactly n − 1. Fewer means return -1. Cities start at 1, so give the arrays n + 1 slots.',
      ],
      approaches: [
        {
          name: 'Brute force: every set of n − 1 roads',
          idea: 'Any valid network with no wasted road has exactly n − 1 roads. Try every such set, check with a DFS that it reaches every city, and keep the cheapest. Correct but the number of sets explodes.',
          time: 'O(C(E, n−1) · n)',
          space: 'O(n + E)',
        },
        {
          name: 'Prim with a heap',
          idea: 'Build an adjacency list, start at city 1, and keep adding the cheapest road that leaves the tree, using a min-heap keyed by the road cost. If the heap runs dry before all n cities join, return -1.',
          time: 'O(E log E)',
          space: 'O(n + E)',
        },
        {
          name: 'Kruskal + union-find',
          idea: 'The input is already an edge list, so sort it and take each road whose two cities are in different groups. A road between cities in the same group would only close a loop. Stop at n − 1 roads; if you never get there, the country cannot be connected.',
          pseudo: `function minimumCost(n, connections):
    sort connections by cost, smallest first
    make groups for cities 1 to n           // union-find
    total ← 0
    used ← 0
    for each [a, b, cost] in connections:
        if union(a, b) = false:             // already linked: loop
            continue
        total ← total + cost
        used ← used + 1
        if used = n - 1:
            break
    if used < n - 1:
        return -1
    return total`,
          code: connectingCitiesCode,
          time: 'O(E log E)',
          space: 'O(n)',
        },
      ],
      fn: 'minimumCost',
      starter: `function minimumCost(n, connections) {
  // connections[i] = [a, b, cost]; return the least total cost, or -1
  return -1;
}`,
      solution: connectingCitiesCode,
      tests: [
        { name: 'lesson example', args: [5, [[1, 2, 4], [1, 3, 1], [2, 3, 2], [2, 4, 5], [3, 4, 8], [4, 5, 3], [3, 5, 9]]], expected: 11 },
        { name: 'two islands', args: [4, [[1, 2, 3], [3, 4, 4]]], expected: -1 },
        { name: 'one city, no roads', args: [1, []], expected: 0 },
        { name: 'two cities, one road', args: [2, [[1, 2, 7]]], expected: 7 },
        { name: 'same pair twice: take the cheaper', args: [2, [[1, 2, 9], [1, 2, 3]]], expected: 3 },
        { name: 'triangle', args: [3, [[1, 2, 4], [1, 3, 6], [2, 3, 2]]], expected: 6 },
        { name: 'one city left out', args: [4, [[1, 2, 1], [2, 3, 1], [1, 3, 1]]], expected: -1 },
        { name: 'free roads', args: [4, [[1, 2, 0], [2, 3, 0], [3, 4, 5], [1, 4, 2]]], expected: 2 },
        { name: 'all roads cost the same', args: [4, [[1, 2, 3], [1, 3, 3], [1, 4, 3], [2, 3, 3], [2, 4, 3], [3, 4, 3]]], expected: 9 },
        { name: 'six cities', args: [6, [[1, 2, 7], [1, 3, 9], [1, 6, 14], [2, 3, 10], [2, 4, 15], [3, 4, 11], [3, 6, 2], [4, 5, 6], [5, 6, 9]]], expected: 33 },
      ],
      takeaway: 'Edge list + "connect everything cheaply" = sort + union-find, and check you took n − 1 edges.',
    },
    {
      id: 'advanced-graphs-min-cost-connect-points',
      title: 'Min Cost to Connect All Points',
      difficulty: 'medium',
      leetcode: 1584,
      pattern: 'MST (dense Prim)',
      statement: 'You are wiring n garden lamps. Lamp i stands at `points[i] = [x, y]`. Wires must follow the garden\'s grid paths, so a wire between two lamps is as long as their Manhattan distance: `|x1 − x2| + |y1 − y2|`. Any two lamps can be wired together. Return the least total wire length so that every lamp is connected to every other lamp (directly or through other lamps).',
      examples: [
        {
          input: 'points = [[0,0],[2,2],[3,10],[5,2],[7,0]]',
          output: '20',
          explain: 'Wire [0,0]–[2,2] (4), [2,2]–[5,2] (3), [5,2]–[7,0] (4), [2,2]–[3,10] (9). Total 4 + 3 + 4 + 9 = 20.',
        },
        {
          input: 'points = [[0,0],[1,0],[5,0],[2,0]]',
          output: '5',
          explain: 'All lamps sit on one line. Wire neighbours in order: 1 + 1 + 3 = 5.',
        },
      ],
      constraints: ['1 ≤ n ≤ 1000', '−10⁶ ≤ x, y ≤ 10⁶', 'All points are different'],
      hints: [
        'Every pair of lamps is a possible edge whose cost is the Manhattan distance. You want an MST of this complete graph.',
        'Kruskal works: build all n(n − 1)/2 edges, sort, union-find. But for n = 1000 that is about 500,000 edges to build and sort.',
        'Prim without a heap: keep `best[i]` = the cheapest wire from the tree so far to lamp i. Each round, pick the lamp outside the tree with the smallest `best`.',
        'After adding lamp u, set `best[v] = min(best[v], dist(u, v))` for every lamp v outside the tree. n rounds of n work is O(n²).',
      ],
      approaches: [
        {
          name: 'Kruskal on all pairs',
          idea: 'Write down every pair as an edge `[i, j, distance]`, sort, and run Kruskal. Correct, but storing and sorting about n²/2 edges is the slow, memory-hungry part.',
          time: 'O(n² log n)',
          space: 'O(n²)',
        },
        {
          name: 'Prim with a heap',
          idea: 'Grow one tree from lamp 0. Each time a lamp joins, push a `[distance, lamp]` entry for every lamp outside the tree. Pop the cheapest, skip stale entries. Up to n² entries go through the heap.',
          time: 'O(n² log n)',
          space: 'O(n²)',
        },
        {
          name: 'Prim with an array',
          idea: 'In a complete graph you look at every pair anyway, so skip the heap. `best[v]` remembers the cheapest wire from the tree to v. A linear scan finds the next lamp to add, and one more scan updates `best`. Each round is O(n), there are n rounds, and nothing bigger than three arrays is stored.',
          pseudo: `function minCostConnectPoints(points):
    n ← length of points
    best ← array of n, all ∞                // cheapest wire from the tree to each lamp
    inTree ← array of n, all false
    best[0] ← 0                             // lamp 0 starts the tree for free
    total ← 0
    repeat n times:
        u ← the lamp not in tree with the smallest best[u]
        inTree[u] ← true
        total ← total + best[u]
        for each lamp v not in tree:
            d ← |x[u] - x[v]| + |y[u] - y[v]|
            best[v] ← min(best[v], d)
    return total`,
          code: connectPointsCode,
          time: 'O(n²)',
          space: 'O(n)',
        },
      ],
      fn: 'minCostConnectPoints',
      starter: `function minCostConnectPoints(points) {
  // points[i] = [x, y]; return the least total Manhattan wire length
  return 0;
}`,
      solution: connectPointsCode,
      tests: [
        { name: 'five lamps', args: [[[0, 0], [2, 2], [3, 10], [5, 2], [7, 0]]], expected: 20 },
        { name: 'lamps on one line', args: [[[0, 0], [1, 0], [5, 0], [2, 0]]], expected: 5 },
        { name: 'one lamp', args: [[[4, -7]]], expected: 0 },
        { name: 'two lamps', args: [[[1, 1], [4, 5]]], expected: 7 },
        { name: 'unit square', args: [[[0, 0], [0, 1], [1, 0], [1, 1]]], expected: 3 },
        { name: 'negative coordinates', args: [[[3, 12], [-2, 5], [-4, 1]]], expected: 18 },
        { name: 'huge coordinates', args: [[[-1000000, -1000000], [1000000, 1000000]]], expected: 4000000 },
        { name: 'seven scattered lamps', args: [[[6, -2], [-7, 10], [3, 5], [-8, -3], [9, 8], [5, 7], [-2, -9]]], expected: 60 },
      ],
      takeaway: 'When every pair can connect, Prim with a plain array (O(n²)) beats building and sorting n² edges.',
    },
    {
      id: 'advanced-graphs-water-distribution',
      title: 'Optimize Water Distribution in a Village',
      difficulty: 'hard',
      leetcode: 1168,
      pattern: 'MST + virtual node',
      statement: 'Stretch: a village has n houses, numbered 1 to n, and none has water yet. For each house you can dig its own well: `wells[i]` is the cost of a well at house i + 1. Or you can lay pipes: `pipes[j] = [a, b, cost]` is a two-way pipe between houses a and b. A house has water if it has a well, or if pipes join it to a house that has water. Return the least total cost so that every house has water.',
      examples: [
        {
          input: 'n = 3, wells = [1,4,4], pipes = [[1,2,1],[2,3,1]]',
          output: '3',
          explain: 'Dig a well at house 1 (1), then pipe 1–2 (1) and 2–3 (1). Total 3. Digging wells at 2 and 3 would cost 4 each.',
        },
        {
          input: 'n = 3, wells = [1,1,1], pipes = [[1,2,5],[2,3,5]]',
          output: '3',
          explain: 'Wells are so cheap that every house digs its own. Total 1 + 1 + 1 = 3.',
        },
      ],
      constraints: ['1 ≤ n ≤ 10⁴', 'wells.length = n', '0 ≤ wells[i] ≤ 10⁵', '0 ≤ pipes.length ≤ 10⁴', '1 ≤ a, b ≤ n, a ≠ b', '0 ≤ cost ≤ 10⁵'],
      hints: [
        'A well is a strange kind of edge: it connects a house to... where? Water has to come from somewhere.',
        'Invent house 0: the water source. Digging a well at house i is the same as laying a pipe 0–i that costs `wells[i − 1]`.',
        'Now a house has water exactly when it is connected to house 0. "Connect all n + 1 nodes as cheaply as possible" is an MST.',
        'Add the n well edges to the pipes, then run Kruskal over nodes 0 to n. You need n edges. It always connects, because every house has an edge to 0.',
      ],
      approaches: [
        {
          name: 'Brute force: every set of wells and pipes',
          idea: 'Try every choice of which houses dig wells and which pipes get laid. For each choice, check with a DFS from the wells that every house is reached, and keep the cheapest. Correct but doubles in size with every house and pipe.',
          time: 'O(2^(n + P) · (n + P))',
          space: 'O(n + P)',
        },
        {
          name: 'Virtual source + Prim with a heap',
          idea: 'Add node 0 with an edge 0–i of cost `wells[i − 1]`. Start Prim at node 0: its first edges are the wells, and the heap picks wells or pipes, whichever is cheapest next. The tree it grows is the cheapest way to reach every house from the source.',
          time: 'O((n + P) log (n + P))',
          space: 'O(n + P)',
        },
        {
          name: 'Virtual source + Kruskal',
          idea: 'Same virtual node 0. Now wells and pipes are just edges in one list. Sort them and use union-find: take an edge if it joins two different groups. Every house ends up in the same group as 0, so every house has water, and Kruskal guarantees the cheapest way to do it.',
          pseudo: `function minCostToSupplyWater(n, wells, pipes):
    edges ← copy of pipes
    for i from 1 to n:
        append [0, i, wells[i - 1]] to edges    // well = pipe from the source
    sort edges by cost, smallest first
    make groups for nodes 0 to n                // union-find
    total ← 0
    used ← 0
    for each [a, b, cost] in edges:
        if union(a, b) = false:                 // would make a loop
            continue
        total ← total + cost
        used ← used + 1
        if used = n:                            // n + 1 nodes need n edges
            break
    return total`,
          code: waterCode,
          time: 'O((n + P) log (n + P))',
          space: 'O(n + P)',
        },
      ],
      fn: 'minCostToSupplyWater',
      starter: `function minCostToSupplyWater(n, wells, pipes) {
  // wells[i] = cost of a well at house i + 1; pipes[j] = [a, b, cost]
  return 0;
}`,
      solution: waterCode,
      tests: [
        { name: 'one well, then pipes', args: [3, [1, 4, 4], [[1, 2, 1], [2, 3, 1]]], expected: 3 },
        { name: 'wells are cheaper', args: [3, [1, 1, 1], [[1, 2, 5], [2, 3, 5]]], expected: 3 },
        { name: 'no pipes at all', args: [3, [4, 2, 7], []], expected: 13 },
        { name: 'one house', args: [1, [7], []], expected: 7 },
        { name: 'same pipe listed twice', args: [2, [5, 5], [[1, 2, 1], [1, 2, 3]]], expected: 6 },
        { name: 'two separate wells needed', args: [4, [1, 10, 10, 1], [[1, 2, 2], [3, 4, 2]]], expected: 6 },
        { name: 'free well', args: [3, [9, 0, 9], [[1, 2, 4], [2, 3, 4], [1, 3, 1]]], expected: 5 },
        { name: 'five houses, mixed', args: [5, [6, 2, 1, 4, 9], [[2, 1, 3], [4, 5, 3], [4, 1, 5], [2, 1, 3], [1, 5, 1], [5, 1, 3]]], expected: 10 },
      ],
      takeaway: 'When a node can "serve itself" for a price, add a virtual node 0 with that price as an edge, then run a plain MST.',
    },
  ],
  quiz: [
    {
      prompt: 'A connected graph has 8 nodes and 20 edges. How many edges does every spanning tree of it have?',
      options: ['8', '7', '20', '19'],
      answer: 1,
      explanation: 'A tree on n nodes always has n − 1 edges: 8 − 1 = 7. The 20 edges only tell you how many choices you have.',
    },
    {
      prompt: 'Kruskal reaches edge 3–7 and `union(3, 7)` returns `false`. What does that mean?',
      options: [
        'Take the edge: it is the cheapest one left',
        'Skip it: 3 and 7 are already connected, so it would make a loop',
        'Stop: the tree is finished',
        'Return -1: the graph is not connected',
      ],
      answer: 1,
      explanation: '`union` returns `false` when both ends already share a group. Adding the edge would spend money to close a loop.',
    },
    {
      prompt: 'You turn your Dijkstra code into Prim. What must the heap key be?',
      options: [
        'The total distance from the start node to this node',
        'The cost of the single edge that would join this node to the tree',
        'The node number',
        'How many edges are in the tree so far',
      ],
      answer: 1,
      explanation: 'Prim only asks "how much does it cost to add this one edge?". Keying by total distance builds the shortest-path tree, which can cost more.',
    },
    {
      prompt: 'You have 1,000 points and any two can be connected. Which MST approach fits best?',
      options: [
        'Kruskal: build and sort all ~500,000 edges',
        'Prim with a heap fed every pair',
        'Prim with a plain array: O(n²), no edge list',
        'BFS from point 0',
      ],
      answer: 2,
      explanation: 'In a complete graph E ≈ n²/2, so the array version (O(n²) time, O(n) space) avoids sorting or heaping hundreds of thousands of edges.',
    },
  ],
  takeaways: [
    'A spanning tree connects all n nodes with exactly n − 1 edges and no loop. The MST is the cheapest one. It is not the shortest-path tree.',
    'Kruskal = sort edges + union-find. Take an edge only when `union` returns true. Fewer than n − 1 edges taken means not connected, so return -1.',
    'Prim = grow one tree with a min-heap keyed by the single edge cost. When every pair can connect, use the O(n²) array version.',
    'If a node can serve itself for a price (a well, a generator), add a virtual node 0 with that price as an edge, then run a plain MST.',
  ],
};

export default lesson;
