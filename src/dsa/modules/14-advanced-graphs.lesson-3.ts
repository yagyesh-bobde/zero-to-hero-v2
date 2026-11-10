import type { Lesson } from '../types';

// k diamonds in a row, every road 1 minute: 0 -> {1, 2} -> 3 -> {4, 5} -> 6 ...
// Each diamond doubles the number of fastest routes, so the answer is 2^k (mod 1e9+7).
function diamondChain(k: number): [number, number[][]] {
  const roads: number[][] = [];
  for (let i = 0; i < k; i++) {
    const a = 3 * i;
    roads.push([a, a + 1, 1], [a, a + 2, 1], [a + 1, a + 3, 1], [a + 2, a + 3, 1]);
  }
  return [3 * k + 1, roads];
}

const walkRoads = [
  [0, 1, 2],
  [0, 2, 3],
  [1, 3, 3],
  [2, 3, 2],
  [3, 4, 1],
  [0, 4, 7],
];

const lesson: Lesson = {
  id: 'dijkstra-variants',
  title: 'Dijkstra variants: counting routes and minimax paths',
  summary: 'Bend Dijkstra: count equally fast routes, get all-pairs distances, and minimize the worst step.',
  minutes: 25,
  blocks: [
    {
      kind: 'callout',
      tone: 'story',
      title: 'Two routes, same time',
      text: "A ride-hailing app finds that the fastest way to the airport takes 6 minutes. Then it notices a second route that also takes exactly 6 minutes. Now it can say \"2 equally fast routes\" and hand the driver a backup if one road is blocked. To do that, it must **count** fastest routes, not just find one.",
    },
    {
      kind: 'text',
      text: "Here is the task with small numbers. A town has 5 intersections, 0 to 4. Each road goes both ways and has a travel time in minutes. You start at 0. Find the fastest time to 4, **and** how many different routes hit exactly that time. BFS from module 13 could count shortest routes if every road cost 1. Here roads cost 1, 2, 3 or 7 minutes, so we need Dijkstra from lesson 2.",
    },
    {
      kind: 'text',
      text: "**Brute force.** Walk every route with DFS (never visiting the same intersection twice on one route). Keep the best time seen so far and how many routes reached it. It is correct. But the number of routes can explode: on a map where every intersection connects to every other, 15 intersections already have billions of routes.",
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Brute force: try every route',
      code: `function countFastest(graph, src, dst):
    best ← ∞
    count ← 0
    function dfs(u, time, visited):
        if u = dst:
            if time < best:
                best ← time
                count ← 1                 // a new record: start counting again
            else if time = best:
                count ← count + 1         // another route just as fast
            return
        for each [v, w] in graph[u]:
            if v not in visited:
                add v to visited
                dfs(v, time + w, visited)
                remove v from visited
    dfs(src, 0, {src})
    return count`,
    },
    {
      kind: 'text',
      text: "**Spot the waste.** Two routes reach intersection 3 in 5 minutes: 0→1→3 and 0→2→3. DFS walks everything after 3 once for the first route and **again** for the second. If there were 10 ways into 3, it would walk the rest of the map 10 times. But we only need one number: *how many* fastest ways reach 3. Every fastest route that passes through 3 is one fastest way into 3, then one fastest way from 3 onwards.",
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'Bend 1: carry a second array next to dist',
      text: "Keep `ways[v]` = how many fastest routes reach v so far. Start with `ways[src] = 1`. When you relax an edge u→v (lesson 2): if `d + w < dist[v]`, the old routes to v are all beaten, so **replace**: `ways[v] = ways[u]`. If `d + w === dist[v]`, these routes are just as fast, so **add**: `ways[v] += ways[u]`. Everything else is plain Dijkstra.",
    },
    {
      kind: 'diagram',
      title: 'The town: numbers on roads are minutes',
      art: `  +---------------------- 7 ----------------------+
  |                                               |
 (0) ---- 2 ---- (1) ---- 3 ---- (3) ---- 1 ---- (4)
  |                               |
  +------- 3 --- (2) --- 2 -------+`,
      caption: "Roads: 0–1 (2), 0–2 (3), 1–3 (3), 2–3 (2), 3–4 (1), and a direct road 0–4 (7). Fastest to 4 is 6 minutes, two ways: 0→1→3→4 and 0→2→3→4.",
    },
    {
      kind: 'trace',
      title: 'Dijkstra with a ways array, one row per pop',
      columns: ['pop [d, node]', 'what happens', 'dist 0..4', 'ways 0..4', 'heap after'],
      rows: [
        ['start', 'dist[0] = 0, ways[0] = 1', '0 ∞ ∞ ∞ ∞', '1 0 0 0 0', '[0,0]'],
        ['[0,0]', '0→1 (2), 0→2 (3), 0→4 (7): all shorter, copy ways[0]', '0 2 3 ∞ 7', '1 1 1 0 1', '[2,1] [3,2] [7,4]'],
        ['[2,1]', '1→3: 2 + 3 = 5 < ∞, so ways[3] = ways[1]', '0 2 3 5 7', '1 1 1 1 1', '[3,2] [5,3] [7,4]'],
        ['[3,2]', '2→3: 3 + 2 = 5 = dist[3], a tie: ways[3] += ways[2]', '0 2 3 5 7', '1 1 1 2 1', '[5,3] [7,4]'],
        ['[5,3]', '3→4: 5 + 1 = 6 < 7, so ways[4] = ways[3]', '0 2 3 5 6', '1 1 1 2 2', '[6,4] [7,4]'],
        ['[6,4]', 'no neighbour gets faster', '0 2 3 5 6', '1 1 1 2 2', '[7,4]'],
        ['[7,4]', '7 > dist[4] = 6: stale entry, skip', '0 2 3 5 6', '1 1 1 2 2', 'empty'],
      ],
      note: "Answer: `ways[4] = 2`. Look at the row for [5,3]: the old count for 4 (the 7-minute direct road) is thrown away, because both 6-minute routes beat it.",
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Dijkstra that counts fastest routes',
      code: `function countFastest(graph, n, src, dst):
    dist ← array of n values, all ∞
    ways ← array of n values, all 0
    dist[src] ← 0
    ways[src] ← 1
    heap.push([0, src])                   // [distance, node]
    while heap is not empty:
        [d, u] ← heap.pop()
        if d > dist[u]:
            continue                      // stale entry: never count from it
        for each [v, w] in graph[u]:
            if d + w < dist[v]:           // strictly faster: old routes lose
                dist[v] ← d + w
                ways[v] ← ways[u]
                heap.push([dist[v], v])
            else if d + w = dist[v]:      // just as fast: add u's routes
                ways[v] ← (ways[v] + ways[u]) mod 1,000,000,007
    return ways[dst]`,
    },
    {
      kind: 'code',
      lang: 'js',
      title: 'JavaScript',
      code: `function countFastest(n, roads, src, dst) {
  const MOD = 1e9 + 7;
  const graph = Array.from({ length: n }, () => []);
  for (const [u, v, w] of roads) {
    graph[u].push([v, w]);
    graph[v].push([u, w]); // two-way roads
  }
  const dist = new Array(n).fill(Infinity);
  const ways = new Array(n).fill(0);
  dist[src] = 0;
  ways[src] = 1;
  const heap = new Heap((a, b) => a[0] - b[0]); // smallest distance first
  heap.push([0, src]);
  while (!heap.isEmpty()) {
    const [d, u] = heap.pop();
    if (d > dist[u]) continue; // stale entry
    for (const [v, w] of graph[u]) {
      if (d + w < dist[v]) {
        dist[v] = d + w;
        ways[v] = ways[u];
        heap.push([dist[v], v]);
      } else if (d + w === dist[v]) {
        ways[v] = (ways[v] + ways[u]) % MOD; // % after every add
      }
    }
  }
  return ways[dst];
}`,
    },
    {
      kind: 'text',
      text: "**Bend 2: distances between every pair.** A delivery company wants to put its hub in the city that is closest to all the others. Now you need the shortest distance from **every** city to every city (all-pairs). The easy way: run Dijkstra once from each city. That is n runs, about O(n · m log n) for m roads. On a small graph (n ≤ 100) there is an even simpler tool, **Floyd-Warshall**: a table `dist[i][j]` plus three loops. For each city k, ask every pair (i, j): is going i → k → j shorter than what I have? After every k has had its turn as the middle stop, the table holds every shortest distance. It costs O(n³), which is 1,000,000 steps for n = 100. Easy.",
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Floyd-Warshall: all-pairs shortest distances',
      code: `function allPairs(n, edges):
    dist ← n × n table, ∞ everywhere, 0 where i = j
    for each [u, v, w] in edges:
        dist[u][v] ← min(dist[u][v], w)
        dist[v][u] ← min(dist[v][u], w)   // two-way roads
    for k from 0 to n - 1:                // k = the middle stop; MUST be the outer loop
        for i from 0 to n - 1:
            for j from 0 to n - 1:
                if dist[i][k] + dist[k][j] < dist[i][j]:
                    dist[i][j] ← dist[i][k] + dist[k][j]
    return dist`,
    },
    {
      kind: 'text',
      text: "**Bend 3: the worst step, not the sum.** Water rises over a hilly field, 1 metre per hour. You can walk a path once every square on it is under water, so the hour you can go is set by the **highest** square on the path. You want the path whose highest point is as low as possible. This is a **minimax path**: the cost of a path is its biggest step, and you minimize that. You met this in lesson 2 (Path With Minimum Effort): run Dijkstra with `max(d, w)` instead of `d + w`. It is safe because `max(d, w) ≥ d`: a longer path never gets cheaper. The new twist here is that the cost sits on the **squares** (their heights), not on the edges between them.",
    },
    {
      kind: 'compare',
      title: 'Costs at a glance (n nodes, m edges)',
      rows: [
        { approach: 'DFS over every route', time: 'O(n!) worst', space: 'O(n)', note: 'Counts routes correctly, but only on tiny maps.' },
        { approach: 'Dijkstra + ways array', time: 'O(m log n)', space: 'O(n + m)', note: 'Same cost as plain Dijkstra. One extra array.' },
        { approach: 'Dijkstra from every node', time: 'O(n · m log n)', space: 'O(n + m)', note: 'All pairs. Good when the graph has few edges.' },
        { approach: 'Floyd-Warshall', time: 'O(n³)', space: 'O(n²)', note: 'All pairs in three loops. Great for n ≤ 100.' },
        { approach: 'Minimax Dijkstra', time: 'O(m log n)', space: 'O(n + m)', note: 'Plain Dijkstra with max instead of +.' },
      ],
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Pattern: Dijkstra with a twist (three knobs)',
      code: `function bentDijkstra(graph, n, src):
    best ← array of n values, all ∞
    best[src] ← startCost                 // 0 for sums, the start's own cost for minimax
    extra[src] ← startExtra               // e.g. ways[src] ← 1
    heap.push([best[src], src])
    while heap is not empty:
        [d, u] ← heap.pop()
        if d > best[u]:
            continue                      // stale entry
        for each [v, w] in graph[u]:
            nd ← combine(d, w)            // knob 1: d + w, or max(d, w)
            if nd < best[v]:
                best[v] ← nd
                extra[v] ← from u         // knob 2: replace (ways[v] ← ways[u])
                heap.push([nd, v])
            else if nd = best[v]:
                merge u into extra[v]     // knob 3: on a tie (ways[v] += ways[u])
    return best, extra`,
    },
    {
      kind: 'list',
      items: [
        "**\"How many shortest / fastest / cheapest ways\"** → Dijkstra + a `ways` array (replace on shorter, add on equal).",
        "**\"For every node\", \"from each city\", n ≤ 100** → all-pairs: Dijkstra from each node, or Floyd-Warshall.",
        "**\"Minimize the maximum\", \"the highest point\", \"the steepest step\", \"water level\"** → minimax Dijkstra with `max(d, w)`.",
        "Combine rule never makes a path cheaper as it grows → the min-heap is safe. If it can (negative edges), wait for lesson 4.",
      ],
    },
    {
      kind: 'callout',
      tone: 'trap',
      title: 'Count only from real pops, and keep numbers small',
      text: "**Stale pops:** if you skip the `d > dist[u]` check, a node can be expanded twice, and its routes get added to its neighbours twice. Example (a different small map): road 0–2 costs 3, roads 0–4 and 4–2 cost 1 each. Node 2 first gets the entry [3, 2], then the cheaper [2, 2] through 4. Expand the stale [3, 2] too, and node 2's routes are sent to its neighbours a second time. **Big numbers:** route counts double with every diamond-shaped part of a map. JavaScript numbers are only exact up to 2⁵³ (about 9 × 10¹⁵). Take `% 1e9+7` after **every** add, never once at the end. Two numbers below 1e9+7 add up to well under 2⁵³, so each step stays exact.",
    },
  ],
  problems: [
    {
      id: 'advanced-graphs-ways-to-arrive',
      title: 'Number of Ways to Arrive at Destination',
      difficulty: 'medium',
      leetcode: 1976,
      pattern: 'Dijkstra + counting',
      statement:
        "A ride-hailing app models a city as `n` intersections, numbered 0 to n - 1. Each road `[u, v, time]` connects two intersections both ways and takes `time` minutes. At most one road joins any pair, and every intersection can be reached. A rider waits at 0 and wants to get to n - 1. Return how many **different routes** take exactly the fastest possible time. The count can be huge, so return it modulo 1,000,000,007.",
      examples: [
        {
          input: 'n = 5, roads = [[0,1,2],[0,2,3],[1,3,3],[2,3,2],[3,4,1],[0,4,7]]',
          output: '2',
          explain: 'Fastest time is 6 minutes: 0→1→3→4 and 0→2→3→4. The direct road 0→4 takes 7, too slow.',
        },
        {
          input: 'n = 2, roads = [[1,0,10]]',
          output: '1',
          explain: 'Only one road, so only one route.',
        },
        {
          input: 'n = 1, roads = []',
          output: '1',
          explain: 'The rider is already there. Staying put is one route of 0 minutes.',
        },
      ],
      constraints: [
        '1 ≤ n ≤ 200',
        'n - 1 ≤ roads.length ≤ n · (n - 1) / 2',
        '1 ≤ time ≤ 10⁹',
        'every intersection is reachable from 0',
      ],
      hints: [
        'First, can you find the fastest time to every intersection? That is lesson 2.',
        'How many fastest routes reach v? Add up the counts of every u where dist[u] + time = dist[v].',
        'Inside Dijkstra: if d + w < dist[v], set ways[v] = ways[u]. If d + w === dist[v], do ways[v] += ways[u].',
        'Skip stale heap entries before counting, and take % 1e9+7 after every add.',
      ],
      approaches: [
        {
          name: 'DFS over every route',
          idea: 'Walk every route without repeating an intersection. Track the best time and how many routes hit it. Correct, but the number of routes can grow like n!, so it times out quickly.',
          time: 'O(n!) worst',
          space: 'O(n)',
        },
        {
          name: 'Dijkstra, then count in distance order',
          idea: 'Run plain Dijkstra to get `dist`. A road u→v is on some fastest route exactly when `dist[u] + time = dist[v]`. Visit intersections from smallest dist to largest, and push each count along those roads. It works because every road on a fastest route goes from a smaller dist to a bigger one, so a count is finished before it is used.',
          time: 'O(m log n)',
          space: 'O(n + m)',
        },
        {
          name: 'Dijkstra that carries ways (one pass)',
          idea: 'Do the counting while Dijkstra runs. When a node is popped for real (not stale), all faster nodes were popped before it, so its count is final. Shorter path found: replace the count. Equal path found: add the count.',
          pseudo: `function countPaths(n, roads):
    build graph: for each [u, v, t] in roads, add u → v and v → u with cost t
    dist ← array of n values, all ∞
    ways ← array of n values, all 0
    dist[0] ← 0
    ways[0] ← 1
    heap.push([0, 0])
    while heap is not empty:
        [d, u] ← heap.pop()
        if d > dist[u]:
            continue                       // stale entry
        for each [v, w] in graph[u]:
            if d + w < dist[v]:
                dist[v] ← d + w
                ways[v] ← ways[u]
                heap.push([dist[v], v])
            else if d + w = dist[v]:
                ways[v] ← (ways[v] + ways[u]) mod 1,000,000,007
    return ways[n - 1]`,
          code: `function countPaths(n, roads) {
  const MOD = 1e9 + 7;
  const graph = Array.from({ length: n }, () => []);
  for (const [u, v, w] of roads) {
    graph[u].push([v, w]);
    graph[v].push([u, w]);
  }
  const dist = new Array(n).fill(Infinity);
  const ways = new Array(n).fill(0);
  dist[0] = 0;
  ways[0] = 1;
  const heap = new Heap((a, b) => a[0] - b[0]);
  heap.push([0, 0]);
  while (!heap.isEmpty()) {
    const [d, u] = heap.pop();
    if (d > dist[u]) continue; // stale entry: never count from it
    for (const [v, w] of graph[u]) {
      if (d + w < dist[v]) {
        dist[v] = d + w;
        ways[v] = ways[u];
        heap.push([dist[v], v]);
      } else if (d + w === dist[v]) {
        ways[v] = (ways[v] + ways[u]) % MOD;
      }
    }
  }
  return ways[n - 1];
}`,
          time: 'O(m log n)',
          space: 'O(n + m)',
        },
      ],
      fn: 'countPaths',
      starter: `function countPaths(n, roads) {
  // count the fastest routes from 0 to n - 1, modulo 1e9 + 7
  return 0;
}`,
      solution: `function countPaths(n, roads) {
  const MOD = 1e9 + 7;
  const graph = Array.from({ length: n }, () => []);
  for (const [u, v, w] of roads) {
    graph[u].push([v, w]);
    graph[v].push([u, w]);
  }
  const dist = new Array(n).fill(Infinity);
  const ways = new Array(n).fill(0);
  dist[0] = 0;
  ways[0] = 1;
  const heap = new Heap((a, b) => a[0] - b[0]);
  heap.push([0, 0]);
  while (!heap.isEmpty()) {
    const [d, u] = heap.pop();
    if (d > dist[u]) continue;
    for (const [v, w] of graph[u]) {
      if (d + w < dist[v]) {
        dist[v] = d + w;
        ways[v] = ways[u];
        heap.push([dist[v], v]);
      } else if (d + w === dist[v]) {
        ways[v] = (ways[v] + ways[u]) % MOD;
      }
    }
  }
  return ways[n - 1];
}`,
      tests: [
        { name: 'two equally fast routes', args: [5, walkRoads], expected: 2 },
        { name: 'one road', args: [2, [[1, 0, 10]]], expected: 1 },
        { name: 'already there', args: [1, []], expected: 1 },
        {
          name: '3×3 grid of streets',
          args: [
            9,
            [
              [0, 1, 1], [0, 3, 1], [1, 2, 1], [1, 4, 1], [2, 5, 1], [3, 4, 1],
              [3, 6, 1], [4, 5, 1], [4, 7, 1], [5, 8, 1], [6, 7, 1], [7, 8, 1],
            ],
          ],
          expected: 6,
        },
        {
          name: 'stale entry must not be counted',
          args: [6, [[1, 0, 1], [2, 0, 3], [3, 2, 3], [4, 2, 1], [5, 3, 1], [4, 0, 1]]],
          expected: 1,
        },
        {
          name: 'big times (sums past 2³¹)',
          args: [3, [[0, 1, 1000000000], [1, 2, 1000000000], [0, 2, 2000000000]]],
          expected: 2,
        },
        {
          name: 'many ties',
          args: [
            8,
            [
              [1, 0, 2], [2, 1, 1], [3, 2, 1], [4, 1, 1], [5, 0, 2], [6, 5, 1], [7, 2, 1], [2, 4, 2],
              [2, 6, 2], [1, 3, 2], [7, 6, 1], [5, 1, 2], [4, 5, 1], [4, 0, 1], [6, 1, 1],
            ],
          ],
          expected: 7,
        },
        {
          name: 'mixed map',
          args: [
            7,
            [[1, 0, 1], [2, 1, 1], [3, 2, 2], [4, 1, 2], [5, 2, 2], [6, 4, 2], [6, 5, 2], [4, 5, 2], [2, 4, 2], [2, 0, 1]],
          ],
          expected: 3,
        },
        { name: '2³⁰ routes: needs the modulo', args: diamondChain(30), expected: 73741817 },
      ],
      takeaway: 'Shorter path found → replace the count. Equal path found → add the count. Only from non-stale pops.',
    },
    {
      id: 'advanced-graphs-city-fewest-neighbors',
      title: 'Find the City With the Smallest Number of Neighbors at a Threshold Distance',
      difficulty: 'medium',
      leetcode: 1334,
      pattern: 'All-pairs shortest paths',
      statement:
        "A delivery company is picking a quiet city for its new warehouse. There are `n` cities, 0 to n - 1, and two-way roads `[from, to, length]`. A city can **reach** another city if the shortest road distance between them is at most `distanceThreshold`. Return the city that can reach the **fewest** other cities. If several cities tie, return the one with the **largest** number.",
      examples: [
        {
          input: 'n = 5, edges = [[0,1,3],[1,2,1],[2,3,1],[3,4,4],[1,4,2]], distanceThreshold = 3',
          output: '0',
          explain: 'City 0 reaches only city 1 (distance 3). City 2 is 4 away, too far. Every other city reaches at least 2 cities.',
        },
        {
          input: 'n = 4, edges = [[0,1,2],[1,2,2],[2,3,2]], distanceThreshold = 2',
          output: '3',
          explain: 'Cities 0 and 3 each reach just 1 city. It is a tie, so pick the larger number: 3.',
        },
      ],
      constraints: [
        '2 ≤ n ≤ 100',
        '1 ≤ edges.length ≤ n · (n - 1) / 2',
        '1 ≤ length, distanceThreshold ≤ 10⁴',
        'at most one road between any two cities',
      ],
      hints: [
        'You need the shortest distance from every city to every other city.',
        'With n ≤ 100, even an O(n³) method is fast: 1,000,000 steps.',
        'Floyd-Warshall: for each middle city k, for each pair (i, j), try dist[i][k] + dist[k][j]. Keep k as the outer loop.',
        'For the tie rule, scan cities from 0 up and replace the best when count ≤ bestCount (≤, not <).',
      ],
      approaches: [
        {
          name: 'Dijkstra from every city',
          idea: 'Run Dijkstra once from each city and count how many cities end up within the threshold. You can even stop a road from being relaxed when it would go past the threshold, since those cities do not count anyway.',
          code: `function findTheCity(n, edges, distanceThreshold) {
  const graph = Array.from({ length: n }, () => []);
  for (const [u, v, w] of edges) {
    graph[u].push([v, w]);
    graph[v].push([u, w]);
  }
  function countReachable(src) {
    const dist = new Array(n).fill(Infinity);
    dist[src] = 0;
    const heap = new Heap((a, b) => a[0] - b[0]);
    heap.push([0, src]);
    let count = 0;
    while (!heap.isEmpty()) {
      const [d, u] = heap.pop();
      if (d > dist[u]) continue;
      if (u !== src) count++; // each city has exactly one real pop
      for (const [v, w] of graph[u]) {
        if (d + w <= distanceThreshold && d + w < dist[v]) {
          dist[v] = d + w;
          heap.push([dist[v], v]);
        }
      }
    }
    return count;
  }
  let best = -1;
  let bestCount = Infinity;
  for (let city = 0; city < n; city++) {
    const count = countReachable(city);
    if (count <= bestCount) {
      best = city;
      bestCount = count;
    }
  }
  return best;
}`,
          time: 'O(n · m log n)',
          space: 'O(n + m)',
        },
        {
          name: 'Floyd-Warshall (simplest for n ≤ 100)',
          idea: 'Fill an n × n table with direct road lengths. Then let each city k take a turn as a middle stop: if i → k → j is shorter than the best i → j so far, write it down. After all n turns, every pair has its shortest distance. Then count per city.',
          pseudo: `function findTheCity(n, edges, threshold):
    dist ← n × n table, ∞ everywhere, 0 where i = j
    for each [u, v, w] in edges:
        dist[u][v] ← w
        dist[v][u] ← w
    for k from 0 to n - 1:
        for i from 0 to n - 1:
            for j from 0 to n - 1:
                if dist[i][k] + dist[k][j] < dist[i][j]:
                    dist[i][j] ← dist[i][k] + dist[k][j]
    best ← -1
    bestCount ← ∞
    for i from 0 to n - 1:
        count ← number of j ≠ i with dist[i][j] ≤ threshold
        if count ≤ bestCount:              // ≤ so a larger city wins a tie
            best ← i
            bestCount ← count
    return best`,
          code: `function findTheCity(n, edges, distanceThreshold) {
  const dist = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? 0 : Infinity)),
  );
  for (const [u, v, w] of edges) {
    dist[u][v] = w;
    dist[v][u] = w;
  }
  for (let k = 0; k < n; k++) {
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (dist[i][k] + dist[k][j] < dist[i][j]) {
          dist[i][j] = dist[i][k] + dist[k][j];
        }
      }
    }
  }
  let best = -1;
  let bestCount = Infinity;
  for (let i = 0; i < n; i++) {
    let count = 0;
    for (let j = 0; j < n; j++) {
      if (j !== i && dist[i][j] <= distanceThreshold) count++;
    }
    if (count <= bestCount) {
      best = i;
      bestCount = count;
    }
  }
  return best;
}`,
          time: 'O(n³)',
          space: 'O(n²)',
        },
      ],
      fn: 'findTheCity',
      starter: `function findTheCity(n, edges, distanceThreshold) {
  // return the city that reaches the fewest others (ties → largest number)
  return -1;
}`,
      solution: `function findTheCity(n, edges, distanceThreshold) {
  const dist = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? 0 : Infinity)),
  );
  for (const [u, v, w] of edges) {
    dist[u][v] = w;
    dist[v][u] = w;
  }
  for (let k = 0; k < n; k++) {
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (dist[i][k] + dist[k][j] < dist[i][j]) {
          dist[i][j] = dist[i][k] + dist[k][j];
        }
      }
    }
  }
  let best = -1;
  let bestCount = Infinity;
  for (let i = 0; i < n; i++) {
    let count = 0;
    for (let j = 0; j < n; j++) {
      if (j !== i && dist[i][j] <= distanceThreshold) count++;
    }
    if (count <= bestCount) {
      best = i;
      bestCount = count;
    }
  }
  return best;
}`,
      tests: [
        { name: 'smallest city wins', args: [5, [[0, 1, 3], [1, 2, 1], [2, 3, 1], [3, 4, 4], [1, 4, 2]], 3], expected: 0 },
        { name: 'tie goes to the larger city', args: [4, [[0, 1, 2], [1, 2, 2], [2, 3, 2]], 2], expected: 3 },
        { name: 'two cities', args: [2, [[0, 1, 3]], 3], expected: 1 },
        { name: 'every road too long', args: [3, [[0, 1, 5], [1, 2, 5]], 4], expected: 2 },
        { name: 'map in two pieces', args: [5, [[0, 1, 2], [2, 3, 1], [3, 4, 1]], 2], expected: 1 },
        { name: 'short path beats a long direct road', args: [4, [[0, 3, 10], [0, 1, 1], [1, 2, 1], [2, 3, 1]], 2], expected: 3 },
        { name: 'chain with one far city', args: [5, [[0, 1, 1], [1, 2, 1], [2, 3, 1], [3, 4, 5]], 2], expected: 4 },
        { name: 'mixed map 1', args: [6, [[1, 0, 6], [2, 1, 3], [3, 0, 2], [4, 2, 3], [5, 3, 6], [0, 4, 1]], 8], expected: 5 },
        { name: 'mixed map 2', args: [6, [[1, 0, 4], [2, 1, 5], [3, 0, 1], [4, 0, 3], [5, 1, 6], [2, 3, 2]], 5], expected: 5 },
        { name: 'star with long arms', args: [5, [[1, 0, 1], [2, 0, 5], [3, 0, 6], [4, 2, 5]], 9], expected: 4 },
      ],
      takeaway: 'Need every pair on a small graph? Floyd-Warshall is three loops with the middle stop k outside.',
    },
    {
      id: 'advanced-graphs-swim-in-rising-water',
      title: 'Swim in Rising Water',
      difficulty: 'hard',
      leetcode: 778,
      pattern: 'Minimax Dijkstra',
      statement:
        "Stretch: a square field is an `n × n` grid of heights, and all heights are different. It starts raining. At time `t` the water level everywhere is `t`. You can swim from a square to a neighbour (up, down, left, right) only when **both** squares have height ≤ t. Swimming itself takes no time. Return the earliest time `t` at which you can get from the top-left square to the bottom-right square.",
      examples: [
        {
          input: 'grid = [[0,2],[1,3]]',
          output: '3',
          explain: 'You cannot leave until the bottom-right square (height 3) is under water too. At t = 3, every square is covered.',
        },
        {
          input: 'grid = [[0,1,2],[7,8,3],[6,5,4]]',
          output: '4',
          explain: 'Go right along the top, then down the right edge: 0, 1, 2, 3, 4. The highest square on that path is 4.',
        },
      ],
      constraints: ['1 ≤ n ≤ 50', '0 ≤ grid[r][c] < n²', 'all heights are different'],
      hints: [
        'The time a path needs is the height of its highest square. You want the path whose highest square is lowest.',
        'If you can make it at time t, you can also make it at t + 1. That smells like binary search on t.',
        'Faster: Dijkstra where a path costs max(heights on it), not their sum. Start with cost grid[0][0].',
        'Push [max(t, grid[nr][nc]), nr, nc]. The first time the bottom-right square is popped, that cost is the answer.',
      ],
      approaches: [
        {
          name: 'Binary search on t + DFS',
          idea: 'For a fixed t, a simple DFS over squares with height ≤ t tells you if the corners connect. If t works, every bigger t works too, so binary search for the smallest t that works, between 0 and n² - 1.',
          code: `function swimInWater(grid) {
  const n = grid.length;
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  function canSwim(t) {
    if (grid[0][0] > t) return false;
    const seen = Array.from({ length: n }, () => new Array(n).fill(false));
    const stack = [[0, 0]];
    seen[0][0] = true;
    while (stack.length) {
      const [r, c] = stack.pop();
      if (r === n - 1 && c === n - 1) return true;
      for (const [dr, dc] of dirs) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr < 0 || nc < 0 || nr >= n || nc >= n) continue;
        if (seen[nr][nc] || grid[nr][nc] > t) continue;
        seen[nr][nc] = true;
        stack.push([nr, nc]);
      }
    }
    return false;
  }
  let lo = 0;
  let hi = n * n - 1;
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (canSwim(mid)) hi = mid;
    else lo = mid + 1;
  }
  return lo;
}`,
          time: 'O(n² log n)',
          space: 'O(n²)',
        },
        {
          name: 'Minimax Dijkstra (min-heap)',
          idea: 'Treat each square as a node. The cost to enter a square is its height, and a path costs its highest square: `max(t, height)`. That cost never goes down as a path grows, so the min-heap trick still holds: the first time the bottom-right square is popped, no other path can beat it. (Another way: union-find from lesson 1. Add squares from lowest to highest and stop when the two corners join.)',
          pseudo: `function swimInWater(grid):
    n ← number of rows
    best ← n × n table, all ∞
    best[0][0] ← grid[0][0]
    heap.push([grid[0][0], 0, 0])           // [time, row, col]
    while heap is not empty:
        [t, r, c] ← heap.pop()
        if t > best[r][c]:
            continue                        // stale entry
        if r = n - 1 and c = n - 1:
            return t
        for each neighbour (nr, nc) inside the grid:
            nt ← max(t, grid[nr][nc])       // the worst square so far
            if nt < best[nr][nc]:
                best[nr][nc] ← nt
                heap.push([nt, nr, nc])`,
          code: `function swimInWater(grid) {
  const n = grid.length;
  const best = Array.from({ length: n }, () => new Array(n).fill(Infinity));
  best[0][0] = grid[0][0];
  const heap = new Heap((a, b) => a[0] - b[0]); // [time, row, col]
  heap.push([grid[0][0], 0, 0]);
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  while (!heap.isEmpty()) {
    const [t, r, c] = heap.pop();
    if (t > best[r][c]) continue; // stale entry
    if (r === n - 1 && c === n - 1) return t;
    for (const [dr, dc] of dirs) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr < 0 || nc < 0 || nr >= n || nc >= n) continue;
      const nt = Math.max(t, grid[nr][nc]);
      if (nt < best[nr][nc]) {
        best[nr][nc] = nt;
        heap.push([nt, nr, nc]);
      }
    }
  }
  return -1;
}`,
          time: 'O(n² log n)',
          space: 'O(n²)',
        },
      ],
      fn: 'swimInWater',
      starter: `function swimInWater(grid) {
  // return the earliest time t to swim from top-left to bottom-right
  return 0;
}`,
      solution: `function swimInWater(grid) {
  const n = grid.length;
  const best = Array.from({ length: n }, () => new Array(n).fill(Infinity));
  best[0][0] = grid[0][0];
  const heap = new Heap((a, b) => a[0] - b[0]);
  heap.push([grid[0][0], 0, 0]);
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  while (!heap.isEmpty()) {
    const [t, r, c] = heap.pop();
    if (t > best[r][c]) continue;
    if (r === n - 1 && c === n - 1) return t;
    for (const [dr, dc] of dirs) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr < 0 || nc < 0 || nr >= n || nc >= n) continue;
      const nt = Math.max(t, grid[nr][nc]);
      if (nt < best[nr][nc]) {
        best[nr][nc] = nt;
        heap.push([nt, nr, nc]);
      }
    }
  }
  return -1;
}`,
      tests: [
        { name: 'one square', args: [[[0]]], expected: 0 },
        { name: 'end square is the highest', args: [[[0, 2], [1, 3]]], expected: 3 },
        { name: 'start square is the highest', args: [[[3, 1], [2, 0]]], expected: 3 },
        { name: 'go around the ridge', args: [[[0, 1, 2], [7, 8, 3], [6, 5, 4]]], expected: 4 },
        { name: 'down then right', args: [[[0, 8, 7], [1, 4, 6], [2, 3, 5]]], expected: 5 },
        {
          name: 'long winding path',
          args: [[[0, 1, 2, 3, 4], [24, 23, 22, 21, 5], [12, 13, 14, 15, 16], [11, 17, 18, 19, 20], [10, 9, 8, 7, 6]]],
          expected: 16,
        },
        { name: 'random 4×4 a', args: [[[7, 11, 9, 1], [5, 14, 12, 15], [13, 10, 6, 8], [0, 3, 2, 4]]], expected: 12 },
        { name: 'random 4×4 b', args: [[[7, 0, 4, 10], [14, 8, 12, 13], [9, 11, 1, 3], [15, 5, 2, 6]]], expected: 11 },
        {
          name: 'random 5×5',
          args: [[[1, 11, 17, 20, 21], [16, 2, 7, 14, 8], [10, 19, 6, 3, 23], [9, 13, 5, 22, 24], [0, 15, 12, 18, 4]]],
          expected: 18,
        },
        {
          name: 'random 6×6',
          args: [
            [
              [28, 27, 20, 17, 15, 4],
              [13, 8, 33, 3, 12, 35],
              [1, 23, 34, 21, 19, 31],
              [2, 5, 11, 6, 9, 18],
              [0, 26, 16, 32, 7, 30],
              [24, 29, 10, 22, 25, 14],
            ],
          ],
          expected: 28,
        },
      ],
      takeaway: 'When a path costs its worst step, run Dijkstra with max(d, w) instead of d + w.',
    },
  ],
  quiz: [
    {
      prompt: 'You pop a real (not stale) entry [d, u]. For a road u→v with time w, `d + w` equals `dist[v]`. What do you do?',
      options: [
        'Set `ways[v] = ways[u]`',
        'Set `ways[v] = ways[v] + ways[u]` (mod 1e9+7)',
        'Nothing, v already has that distance',
        'Push [d + w, v] onto the heap again',
      ],
      answer: 1,
      explanation: "The routes through u are just as fast as the ones already counted, so you add them. Replacing (`=`) is only for a strictly shorter path. No push is needed, v's distance did not change.",
    },
    {
      prompt: 'The heap pops [3, 2] but `dist[2]` is already 2. Why must you skip it before counting?',
      options: [
        "Popping it again would crash the heap",
        "Node 2's routes would be added to its neighbours a second time",
        'Its distance would become 3 again',
        'You do not need to skip it',
      ],
      answer: 1,
      explanation: 'Node 2 was already expanded with its real distance 2. Expanding it again sends its ways count out twice, so ties get double counted.',
    },
    {
      prompt: 'A path costs its **highest** step, not the sum. Why can Dijkstra with a min-heap still be used?',
      options: [
        'Because all heights are different',
        'Because a grid has no cycles',
        'Because adding a step never makes the cost smaller: max(d, w) ≥ d',
        'It cannot; you must use BFS',
      ],
      answer: 2,
      explanation: 'Dijkstra only needs this: once the cheapest item is popped, nothing found later can beat it. That holds when costs never go down as a path grows.',
    },
    {
      prompt: 'n = 80 cities and you need the shortest distance between every pair. What is the simplest fast choice?',
      options: ['DFS over every route from every city', 'BFS from every city', 'Floyd-Warshall: 80³ = 512,000 steps', 'One Dijkstra from city 0'],
      answer: 2,
      explanation: "Floyd-Warshall is three short loops and 512,000 steps is nothing. BFS ignores road lengths, and one Dijkstra only gives distances from city 0.",
    },
  ],
  takeaways: [
    'Dijkstra can carry extra info per node: on a strictly shorter path **replace** it, on an equal path **merge** it (for counting: add).',
    'Count only from non-stale pops, and in JS take `% (1e9 + 7)` after every add to stay below 2⁵³.',
    'All pairs on a small graph: Dijkstra from every node, or Floyd-Warshall with the middle stop k as the outer loop.',
    'If the path cost never goes down as the path grows (a sum of non-negative steps, or the max step), the min-heap still works. Just change how you combine.',
  ],
};

export default lesson;
