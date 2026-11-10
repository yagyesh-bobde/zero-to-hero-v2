import type { Lesson } from '../types';

const lesson: Lesson = {
  id: 'dijkstra',
  title: 'Dijkstra: shortest paths when roads have different lengths',
  summary: 'BFS counts roads. Dijkstra counts minutes: always finish the closest place next, with a min-heap.',
  minutes: 25,
  blocks: [
    {
      kind: 'callout',
      tone: 'story',
      title: 'Google Maps does not count turns',
      text: "You ask Google Maps for the fastest way to the airport. One route uses 2 long roads stuck in traffic. Another uses 3 short, empty roads. Maps picks the 3 roads, because it adds up *minutes*, not *roads*. Your internet works the same way: a packet hops between routers, and each link has its own delay. Both are one problem: **shortest path in a weighted graph**. A *weighted graph* is a graph where every edge has a number on it (its *weight*): minutes, meters, milliseconds, cost.",
    },
    {
      kind: 'text',
      text: "In module 13, BFS found the shortest path by counting edges. That is only right when every edge costs 1. Look at this map. BFS reaches D first through B (2 roads), and stops. But that route takes 5 + 5 = **10** minutes. The route through C and E has 3 roads and takes 1 + 1 + 1 = **3** minutes. Fewest roads is not fastest.",
    },
    {
      kind: 'diagram',
      title: 'Where BFS picks the wrong route',
      art: `           5             5
    A ----------- B ----------- D
    |                           |
  1 |                           | 1
    |                           |
    C --------------------------E
                  1

  A-B-D:   2 roads, 5 + 5     = 10 minutes  (BFS)
  A-C-E-D: 3 roads, 1 + 1 + 1 =  3 minutes  (right)`,
      caption: 'BFS finds the fewest edges. With weights, we want the smallest total.',
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Brute force: walk every path, keep the cheapest',
      code: `function cheapestByTryingAll(graph, src, target):
    best ← ∞
    function explore(u, cost, visited):
        if u = target:
            best ← min(best, cost)
            return
        for each [v, w] in graph[u]:       // road u → v that costs w
            if v not in visited:
                add v to visited
                explore(v, cost + w, visited)
                remove v from visited
    explore(src, 0, {src})
    return best`,
    },
    {
      kind: 'text',
      text: "This is correct. It is also hopeless. The number of different paths can double with every node you add, so 30 nodes can already mean millions of paths. Another honest idea: keep checking every edge, 'can this edge make some cost smaller?', and stop when nothing changes. That is **Bellman-Ford**. It takes about V × E steps (V = number of nodes, E = number of edges) and it also handles negative weights. Lesson 4 covers it.",
    },
    {
      kind: 'text',
      text: "**Spot the waste.** The brute force walks the same roads again and again. Once you *know* the fastest way to C is 1 minute, every later path that reaches C in 4 minutes is pointless, and so is everything it explores after C. We should remember the best cost to each place, and only keep going from a place when we found a better way to it.",
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'Finish the closest place first',
      text: "Of all places you have reached but not finished, take the one with the smallest cost so far. Its cost is final: any other way to it must pass through a place that is already at least as far, and roads only *add* time. A min-heap always hands you the smallest item first, so it gives you that place for free. **Dijkstra is BFS with a min-heap instead of a queue.**",
    },
    {
      kind: 'list',
      items: [
        "`dist[v]` = the cheapest cost to reach `v` that we know *so far*. It starts at `∞` for everyone, and `0` for the start.",
        "**Relax** an edge `u → v` with cost `w` = check if going through `u` gives a cheaper way to `v`. If `dist[u] + w < dist[v]`, write down the cheaper cost and push `[dist[v], v]` onto the heap.",
        "**Pop = done.** When `[d, u]` comes off the heap and `d` equals `dist[u]`, that cost is final. We never need to improve `u` again.",
        "**Stale entry** = an old heap item for a node we have since reached more cheaply. We don't delete it from the heap (heaps can't do that quickly). When it pops and `d > dist[u]`, we just skip it. Leaving these duplicates in is fine: each one costs one pop and nothing else.",
      ],
    },
    {
      kind: 'diagram',
      title: 'Walkthrough graph (one-way roads, start at 0)',
      art: `     0 -----5----> 1
     |            ^|
     |           / |
   1 |        2 /  | 1
     |         /   |
     v        /    v
     2 ------'     3 ----3----> 4
      \\            ^
       '-----5-----'`,
      caption: 'Edges: 0→1 (5), 0→2 (1), 2→1 (2), 1→3 (1), 2→3 (5), 3→4 (3). The direct road 0→1 costs 5, but 0→2→1 costs 3.',
    },
    {
      kind: 'trace',
      title: 'Dijkstra from node 0',
      columns: ['step', 'popped [d, node]', 'heap after (smallest first)', 'dist [0,1,2,3,4]', 'note'],
      rows: [
        ['start', '-', '[0,0]', '[0, ∞, ∞, ∞, ∞]', 'dist[0] = 0, push the start'],
        [1, '[0, 0]', '[1,2] [5,1]', '[0, 5, 1, ∞, ∞]', 'relax 0→1: 0+5 = 5; relax 0→2: 0+1 = 1'],
        [2, '[1, 2]', '[3,1] [5,1] [6,3]', '[0, 3, 1, 6, ∞]', '2→1: 1+2 = 3 < 5, better; 2→3: 1+5 = 6'],
        [3, '[3, 1]', '[4,3] [5,1] [6,3]', '[0, 3, 1, 4, ∞]', '1→3: 3+1 = 4 < 6, better'],
        [4, '[4, 3]', '[5,1] [6,3] [7,4]', '[0, 3, 1, 4, 7]', '3→4: 4+3 = 7'],
        [5, '[5, 1]', '[6,3] [7,4]', '[0, 3, 1, 4, 7]', 'stale: 5 > dist[1] = 3, skip'],
        [6, '[6, 3]', '[7,4]', '[0, 3, 1, 4, 7]', 'stale: 6 > dist[3] = 4, skip'],
        [7, '[7, 4]', 'empty', '[0, 3, 1, 4, 7]', 'node 4 has no roads out. Done.'],
      ],
      note: 'Nodes are finished in order 0, 2, 1, 3, 4: always the closest one left. The two stale entries were pushed before a cheaper way was found.',
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Dijkstra',
      code: `function dijkstra(n, edges, src):
    graph ← adjacency list built from edges   // graph[u] = list of [v, w]
    dist ← array of n values, all ∞
    dist[src] ← 0
    heap ← min-heap of [distance, node]
    heap.push([0, src])
    while heap is not empty:
        [d, u] ← heap.pop()                   // closest unfinished node
        if d > dist[u]:                       // stale entry
            continue
        for each [v, w] in graph[u]:          // relax every road out of u
            if d + w < dist[v]:
                dist[v] ← d + w
                heap.push([dist[v], v])
    return dist`,
    },
    {
      kind: 'code',
      lang: 'js',
      title: 'Dijkstra in JavaScript (the template for this module)',
      code: `function dijkstra(n, edges, src) {
  const graph = Array.from({ length: n }, () => []);
  for (const [u, v, w] of edges) graph[u].push([v, w]);
  const dist = new Array(n).fill(Infinity);
  dist[src] = 0;
  const heap = new Heap((a, b) => a[0] - b[0]); // [distance, node], smallest distance first
  heap.push([0, src]);
  while (!heap.isEmpty()) {
    const [d, u] = heap.pop();
    if (d > dist[u]) continue;            // stale entry: we already found a shorter way to u
    for (const [v, w] of graph[u]) {
      if (d + w < dist[v]) {
        dist[v] = d + w;
        heap.push([dist[v], v]);
      }
    }
  }
  return dist;
}

dijkstra(5, [[0, 1, 5], [0, 2, 1], [2, 1, 2], [1, 3, 1], [2, 3, 5], [3, 4, 3]], 0);
// [0, 3, 1, 4, 7]`,
    },
    {
      kind: 'text',
      text: "**How fast?** Every node is finished once, and every edge is relaxed once, when its start node is finished. Each relax can push one item, so the heap never holds more than about E items. A push or pop costs about log(heap size) steps. That is (V + E) heap operations of about log V steps each: **O((V + E) log V)** time and O(V + E) space. For 10⁴ places and 10⁵ roads, that is roughly 2 million steps. (Strictly it is log E, but log E is at most 2 × log V, so people write log V.)",
    },
    {
      kind: 'compare',
      title: 'Shortest path with weights',
      rows: [
        { approach: 'Try every path (DFS)', time: 'O(V!) worst', space: 'O(V)', note: 'Correct, but explodes past about 15 nodes.' },
        { approach: 'BFS (module 13)', time: 'O(V + E)', space: 'O(V)', note: 'Fast, but **wrong** when edges cost different amounts.' },
        { approach: 'Relax all edges until stable (Bellman-Ford)', time: 'O(V × E)', space: 'O(V)', note: 'Slower, but handles negative weights. Lesson 4.' },
        { approach: 'Dijkstra with a min-heap', time: 'O((V + E) log V)', space: 'O(V + E)', note: 'The default whenever all weights are 0 or more.' },
      ],
    },
    {
      kind: 'list',
      items: [
        "**Signals:** 'shortest', 'cheapest', 'fastest', 'least time' or 'least effort', and the edges have *different* costs.",
        "The cost of a path never gets better as the path grows: non-negative weights, a product of chances that are all ≤ 1, or the biggest step on the path.",
        "If every edge costs the same, plain BFS is enough (module 13). If some weights are negative, use Bellman-Ford (lesson 4).",
      ],
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Pattern template',
      code: `dist ← ∞ for every node; dist[src] ← 0
heap.push([0, src])
while heap is not empty:
    [d, u] ← heap.pop()
    if d > dist[u]:
        continue                         // stale entry
    if u = target:
        return d                         // optional: popped means final
    for each [v, w] in graph[u]:
        next ← d + w                     // or max(d, w), or d × p
        if next is better than dist[v]:
            dist[v] ← next
            heap.push([next, v])`,
    },
    {
      kind: 'diagram',
      title: 'One negative edge breaks the promise',
      art: `          2
    A ---------> B
    |            ^
  3 |            | -2
    v            |
    C -----------'

  pop A (0):  dist B = 2, dist C = 3
  pop B (2):  "B is final at 2"  <- wrong promise
  pop C (3):  C->B costs 3 + (-2) = 1 < 2`,
      caption: 'B was popped as finished, yet A→C→B is cheaper. The real answer for B is 1.',
    },
    {
      kind: 'callout',
      tone: 'trap',
      title: 'Negative weights break Dijkstra',
      text: "'Pop = done' only holds because roads never *subtract* time. With a negative edge, a node can get cheaper after it was finished. Versions that mark nodes as done on pop then return wrong answers (2 instead of 1 above). Our template re-pushes B and gets lucky here, but then nodes can be reopened again and again (very slow on bad graphs), and a loop with negative total cost never stops. Negative weights mean Bellman-Ford (lesson 4). Also: keep the stale check. Without it, old entries relax edges with outdated costs and waste a lot of time.",
    },
  ],
  problems: [
    {
      id: 'advanced-graphs-network-delay-time',
      title: 'Network Delay Time',
      difficulty: 'medium',
      leetcode: 743,
      pattern: 'Dijkstra',
      statement:
        "You run a network of `n` servers, numbered `1` to `n`. Each `times[i] = [u, v, w]` is a one-way cable: a message sent from server `u` reaches server `v` after `w` milliseconds. Server `k` sends a signal at time 0, and every server passes it on as soon as it hears it. How many milliseconds until **every** server has heard the signal? If some server can never hear it, return `-1`.",
      examples: [
        {
          input: 'times = [[2,1,1],[2,3,1],[3,4,1]], n = 4, k = 2',
          output: '2',
          explain: 'Server 2 reaches 1 and 3 after 1 ms. Server 4 hears it through 3 after 2 ms. The last one is at 2 ms.',
        },
        {
          input: 'times = [[1,2,1]], n = 2, k = 2',
          output: '-1',
          explain: 'The only cable goes 1 → 2. Server 2 can never reach server 1.',
        },
      ],
      constraints: [
        '1 ≤ n ≤ 100',
        '0 ≤ times.length ≤ 6000',
        '0 ≤ w ≤ 100',
        'There can be two cables between the same pair of servers.',
      ],
      hints: [
        'Each server hears the signal at the time of its *fastest* route from `k`. The answer is the largest of those times.',
        'Fastest route when cables have different delays: that is Dijkstra from `k`.',
        'Servers are numbered from 1, so make arrays of size `n + 1` and ignore index 0. After Dijkstra, if any `dist[i]` for `i` in 1..n is still `Infinity`, return `-1`; otherwise return the biggest one.',
      ],
      approaches: [
        {
          name: 'Try every route (DFS)',
          idea: 'From `k`, walk every route and record the smallest arrival time at each server. It is correct because it looks at every possible route, but the number of routes explodes.',
          time: 'O(n!) worst',
          space: 'O(n)',
        },
        {
          name: 'Relax every cable until nothing changes (Bellman-Ford)',
          idea: 'Repeat `n - 1` times: for every cable, check if it gives a faster time to its end. After `n - 1` rounds every fastest route (at most `n - 1` cables long) has been found. Correct, and fine for n = 100, but it redoes every cable every round. Lesson 4 covers it.',
          time: 'O(n × E)',
          space: 'O(n)',
        },
        {
          name: 'Dijkstra with a min-heap',
          idea: 'Always finish the server with the smallest arrival time so far. Its time is final, because cable delays are never negative. Each cable is relaxed once. Then the answer is the slowest of the final times.',
          pseudo: `function networkDelayTime(times, n, k):
    graph ← n + 1 empty lists
    for each [u, v, w] in times:
        append [v, w] to graph[u]
    dist ← array of n + 1 values, all ∞
    dist[k] ← 0
    heap ← min-heap of [time, server]
    heap.push([0, k])
    while heap is not empty:
        [d, u] ← heap.pop()
        if d > dist[u]:
            continue                       // stale entry
        for each [v, w] in graph[u]:
            if d + w < dist[v]:
                dist[v] ← d + w
                heap.push([dist[v], v])
    answer ← max of dist[1..n]
    if answer = ∞:
        return -1
    return answer`,
          code: `function networkDelayTime(times, n, k) {
  const graph = Array.from({ length: n + 1 }, () => []);
  for (const [u, v, w] of times) graph[u].push([v, w]);
  const dist = new Array(n + 1).fill(Infinity);
  dist[k] = 0;
  const heap = new Heap((a, b) => a[0] - b[0]); // [time, server], smallest time first
  heap.push([0, k]);
  while (!heap.isEmpty()) {
    const [d, u] = heap.pop();
    if (d > dist[u]) continue;            // stale entry
    for (const [v, w] of graph[u]) {
      if (d + w < dist[v]) {
        dist[v] = d + w;
        heap.push([dist[v], v]);
      }
    }
  }
  let answer = 0;
  for (let i = 1; i <= n; i++) answer = Math.max(answer, dist[i]);
  return answer === Infinity ? -1 : answer;
}`,
          time: 'O((n + E) log n)',
          space: 'O(n + E)',
        },
      ],
      fn: 'networkDelayTime',
      starter: `function networkDelayTime(times, n, k) {
  // Dijkstra from k, then the slowest server decides the answer
  return -1;
}`,
      solution: `function networkDelayTime(times, n, k) {
  const graph = Array.from({ length: n + 1 }, () => []);
  for (const [u, v, w] of times) graph[u].push([v, w]);
  const dist = new Array(n + 1).fill(Infinity);
  dist[k] = 0;
  const heap = new Heap((a, b) => a[0] - b[0]);
  heap.push([0, k]);
  while (!heap.isEmpty()) {
    const [d, u] = heap.pop();
    if (d > dist[u]) continue;
    for (const [v, w] of graph[u]) {
      if (d + w < dist[v]) {
        dist[v] = d + w;
        heap.push([dist[v], v]);
      }
    }
  }
  let answer = 0;
  for (let i = 1; i <= n; i++) answer = Math.max(answer, dist[i]);
  return answer === Infinity ? -1 : answer;
}`,
      tests: [
        { name: 'example', args: [[[2, 1, 1], [2, 3, 1], [3, 4, 1]], 4, 2], expected: 2 },
        { name: 'one cable', args: [[[1, 2, 1]], 2, 1], expected: 1 },
        { name: 'wrong direction', args: [[[1, 2, 1]], 2, 2], expected: -1 },
        { name: 'single server', args: [[], 1, 1], expected: 0 },
        { name: 'fewest cables is slower', args: [[[1, 2, 10], [1, 3, 1], [3, 4, 1], [4, 2, 1]], 4, 1], expected: 3 },
        { name: 'two cables, same pair', args: [[[1, 2, 5], [1, 2, 2]], 2, 1], expected: 2 },
        { name: 'one server unreachable', args: [[[1, 2, 1], [2, 3, 1]], 4, 1], expected: -1 },
        { name: 'with a cycle', args: [[[1, 2, 1], [2, 3, 2], [3, 1, 4], [3, 4, 1]], 4, 1], expected: 4 },
        {
          name: 'lesson walkthrough graph',
          args: [[[1, 2, 5], [1, 3, 1], [3, 2, 2], [2, 4, 1], [3, 4, 5], [4, 5, 3]], 5, 1],
          expected: 7,
        },
        { name: 'zero-delay cables', args: [[[1, 2, 0], [2, 3, 0]], 3, 1], expected: 0 },
        {
          name: 'bigger network',
          args: [
            [
              [5, 3, 11], [8, 6, 11], [7, 8, 1], [8, 2, 4], [8, 1, 8], [6, 8, 17], [6, 1, 12], [4, 2, 18], [1, 7, 3],
              [1, 6, 15], [7, 6, 0], [3, 2, 13], [4, 3, 16], [3, 7, 11], [2, 4, 12], [7, 5, 7], [6, 5, 8], [5, 2, 1],
            ],
            8,
            5,
          ],
          expected: 31,
        },
      ],
      takeaway: "'Time until everyone hears it' = the largest shortest-path distance from the start.",
    },
    {
      id: 'advanced-graphs-path-with-max-probability',
      title: 'Path with Maximum Probability',
      difficulty: 'medium',
      leetcode: 1514,
      pattern: 'Dijkstra (max-heap, multiply)',
      statement:
        "A delivery drone flies between `n` towns, numbered `0` to `n - 1`. Each `edges[i] = [a, b]` is a route that works both ways, and the drone survives it with chance `succProb[i]` (a number from 0 to 1). The chance of surviving a whole trip is all its route chances **multiplied** together. Return the highest chance of getting from `start` to `end`. If there is no way to get there, return `0`.",
      examples: [
        {
          input: 'n = 3, edges = [[0,1],[1,2],[0,2]], succProb = [0.5,0.5,0.2], start = 0, end = 2',
          output: '0.25',
          explain: 'Direct: 0.2. Through town 1: 0.5 × 0.5 = 0.25. The longer trip is safer.',
        },
        {
          input: 'n = 3, edges = [[0,1]], succProb = [0.5], start = 0, end = 2',
          output: '0',
          explain: 'No route reaches town 2.',
        },
      ],
      constraints: [
        '2 ≤ n ≤ 10⁴',
        '0 ≤ edges.length ≤ 2 × 10⁴',
        '0 ≤ succProb[i] ≤ 1',
        'start ≠ end',
        'Answers within 0.00001 of the right one count as correct.',
      ],
      hints: [
        'Every extra route multiplies the chance by a number ≤ 1, so a trip can only get *less* likely as it grows. That is just like costs that only grow.',
        'Flip Dijkstra: `best[v]` = the highest chance found so far, the heap hands out the *most likely* town first, and you relax with `best[u] × p`.',
        'Use a max-heap: `new Heap((a, b) => b[0] - a[0])`. Start with `best[start] = 1`. An entry is stale if `p < best[u]`. You may return as soon as `end` is popped.',
      ],
      approaches: [
        {
          name: 'Try every trip (DFS)',
          idea: 'Walk every trip from `start` that never visits a town twice, multiply as you go, and keep the biggest product that reaches `end`. Correct, but the number of trips explodes.',
          time: 'O(n!) worst',
          space: 'O(n)',
        },
        {
          name: 'Relax every route until nothing changes',
          idea: "Like Bellman-Ford (lesson 4): keep going over all routes, and if `best[a] × p > best[b]`, raise `best[b]` (and the same the other way). Stop when a full pass changes nothing. Correct, but each pass touches every route.",
          time: 'O(n × E)',
          space: 'O(n + E)',
        },
        {
          name: 'Dijkstra with a max-heap',
          idea: "Always finish the town with the highest chance so far. Multiplying by a number ≤ 1 can never make a chance bigger, so no later trip can beat it: this is the same reason non-negative costs only grow. Fun fact: taking `-log` of every chance turns the products into sums of non-negative numbers, so this really *is* normal Dijkstra in disguise.",
          pseudo: `function maxProbability(n, edges, succProb, start, end):
    graph ← n empty lists
    for i from 0 to edges.length - 1:
        [a, b] ← edges[i]
        append [b, succProb[i]] to graph[a]
        append [a, succProb[i]] to graph[b]     // both ways
    best ← array of n values, all 0
    best[start] ← 1
    heap ← max-heap of [chance, town]
    heap.push([1, start])
    while heap is not empty:
        [p, u] ← heap.pop()                     // most likely town left
        if p < best[u]:
            continue                            // stale entry
        if u = end:
            return p                            // popped means final
        for each [v, q] in graph[u]:
            if p × q > best[v]:
                best[v] ← p × q
                heap.push([best[v], v])
    return 0`,
          code: `function maxProbability(n, edges, succProb, start, end) {
  const graph = Array.from({ length: n }, () => []);
  edges.forEach(([a, b], i) => {
    graph[a].push([b, succProb[i]]);
    graph[b].push([a, succProb[i]]);
  });
  const best = new Array(n).fill(0);
  best[start] = 1;
  const heap = new Heap((a, b) => b[0] - a[0]); // [chance, town], biggest chance first
  heap.push([1, start]);
  while (!heap.isEmpty()) {
    const [p, u] = heap.pop();
    if (p < best[u]) continue;            // stale entry
    if (u === end) return p;              // popped means final
    for (const [v, q] of graph[u]) {
      if (p * q > best[v]) {
        best[v] = p * q;
        heap.push([best[v], v]);
      }
    }
  }
  return 0;
}`,
          time: 'O((n + E) log n)',
          space: 'O(n + E)',
        },
      ],
      fn: 'maxProbability',
      starter: `function maxProbability(n, edges, succProb, start, end) {
  // Dijkstra, but keep the biggest product and use a max-heap
  return 0;
}`,
      solution: `function maxProbability(n, edges, succProb, start, end) {
  const graph = Array.from({ length: n }, () => []);
  edges.forEach(([a, b], i) => {
    graph[a].push([b, succProb[i]]);
    graph[b].push([a, succProb[i]]);
  });
  const best = new Array(n).fill(0);
  best[start] = 1;
  const heap = new Heap((a, b) => b[0] - a[0]);
  heap.push([1, start]);
  while (!heap.isEmpty()) {
    const [p, u] = heap.pop();
    if (p < best[u]) continue;
    if (u === end) return p;
    for (const [v, q] of graph[u]) {
      if (p * q > best[v]) {
        best[v] = p * q;
        heap.push([best[v], v]);
      }
    }
  }
  return 0;
}`,
      tests: [
        { name: 'longer trip is safer', args: [3, [[0, 1], [1, 2], [0, 2]], [0.5, 0.5, 0.2], 0, 2], expected: 0.25 },
        { name: 'direct route wins', args: [3, [[0, 1], [1, 2], [0, 2]], [0.5, 0.5, 0.3], 0, 2], expected: 0.3 },
        { name: 'unreachable', args: [3, [[0, 1]], [0.5], 0, 2], expected: 0 },
        {
          name: 'three safe hops beat one risky one',
          args: [4, [[0, 3], [0, 1], [1, 2], [2, 3]], [0.1, 0.9, 0.9, 0.9], 0, 3],
          expected: 0.729,
        },
        { name: 'perfectly safe routes', args: [3, [[0, 1], [1, 2]], [1, 1], 0, 2], expected: 1 },
        { name: 'route with zero chance', args: [2, [[0, 1]], [0], 0, 1], expected: 0 },
        { name: 'edge listed backwards', args: [2, [[1, 0]], [0.6], 0, 1], expected: 0.6 },
        {
          name: 'bigger map',
          args: [
            7,
            [[2, 3], [5, 1], [5, 4], [6, 1], [2, 4], [4, 0], [3, 1], [6, 4], [2, 1], [5, 2], [2, 0], [1, 4]],
            [0.1, 0.2, 0.6, 0.5, 0.7, 0.3, 0.3, 0.5, 0.5, 0.1, 0.9, 0.6],
            0,
            6,
          ],
          expected: 0.315,
        },
      ],
      compare: 'float',
      takeaway: 'Dijkstra works for any path score that only gets worse as the path grows: sums of non-negative costs, products of chances ≤ 1, maximums.',
    },
    {
      id: 'advanced-graphs-path-with-minimum-effort',
      title: 'Path With Minimum Effort',
      difficulty: 'medium',
      leetcode: 1631,
      pattern: 'Dijkstra (cost = max) / binary search + BFS',
      statement:
        "You are hiking on a grid map. `heights[r][c]` is the height of cell `(r, c)`. You start at the top-left cell and want to reach the bottom-right cell, moving up, down, left or right. The *climb* of one step is the absolute height difference between the two cells. The **effort** of a route is its single biggest climb (not the total). Return the smallest effort any route can have.",
      examples: [
        {
          input: 'heights = [[1,2,2],[3,8,2],[5,3,5]]',
          output: '2',
          explain: 'Route 1 → 3 → 5 → 3 → 5 (down the left, then along the bottom) has climbs 2, 2, 2, 2. Its biggest climb is 2. No route does better.',
        },
        {
          input: 'heights = [[1,10,6]]',
          output: '9',
          explain: 'Only one route: climbs 9 and 4. The biggest is 9.',
        },
      ],
      constraints: ['1 ≤ rows, cols ≤ 100', '1 ≤ heights[r][c] ≤ 10⁶'],
      hints: [
        'The effort of a route is the max of its climbs. Adding one more step can never make that max smaller.',
        'Treat each cell as a node. Keep `effort[r][c]` = the smallest effort to reach that cell so far. Relax with `max(d, climb)` instead of `d + w`.',
        "Another way: guess a limit `L`. Can you reach the end using only steps with climb ≤ `L`? That's a yes/no BFS, and a bigger `L` only makes 'yes' easier. So you can binary search on `L` (module 5).",
      ],
      approaches: [
        {
          name: 'Try every route (DFS)',
          idea: 'Walk every route that never revisits a cell, track the biggest climb so far, and keep the smallest result at the end. Correct, but a 5 × 5 grid already has over a million such routes.',
          time: 'exponential',
          space: 'O(rows × cols)',
        },
        {
          name: 'Binary search on the answer + BFS',
          idea: "If you can finish with limit `L`, you can also finish with any bigger limit. So the answers look like no, no, no, yes, yes, yes, and binary search finds the first yes. Each check is a BFS that only takes steps with climb ≤ `L`. Heights are at most 10⁶, so about 20 checks.",
          pseudo: `function minimumEffortPath(heights):
    lo ← 0, hi ← 10⁶
    while lo < hi:
        mid ← floor((lo + hi) / 2)
        if canReach(mid):
            hi ← mid                         // mid works, try smaller
        else:
            lo ← mid + 1                     // too strict
    return lo

function canReach(limit):
    BFS from (0, 0), only stepping to a neighbour
    when |height difference| ≤ limit
    return true if (rows - 1, cols - 1) was reached`,
          code: `function minimumEffortPath(heights) {
  const rows = heights.length, cols = heights[0].length;
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  function canReach(limit) {
    const seen = Array.from({ length: rows }, () => new Array(cols).fill(false));
    const queue = [[0, 0]];
    seen[0][0] = true;
    for (let i = 0; i < queue.length; i++) {
      const [r, c] = queue[i];
      if (r === rows - 1 && c === cols - 1) return true;
      for (const [dr, dc] of dirs) {
        const nr = r + dr, nc = c + dc;
        if (nr < 0 || nr >= rows || nc < 0 || nc >= cols || seen[nr][nc]) continue;
        if (Math.abs(heights[nr][nc] - heights[r][c]) > limit) continue;
        seen[nr][nc] = true;
        queue.push([nr, nc]);
      }
    }
    return false;
  }
  let lo = 0, hi = 1000000;
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (canReach(mid)) hi = mid;
    else lo = mid + 1;
  }
  return lo;
}`,
          time: 'O(rows × cols × log 10⁶)',
          space: 'O(rows × cols)',
        },
        {
          name: 'Dijkstra where the cost is a max',
          idea: "Same template, new way to add up a path: `next = max(d, climb)` instead of `d + w`. A max never shrinks when the path grows, just like a sum of non-negative weights, so the cell with the smallest effort so far is final when popped. Stop as soon as the bottom-right cell is popped.",
          pseudo: `function minimumEffortPath(heights):
    effort ← rows × cols grid, all ∞
    effort[0][0] ← 0
    heap ← min-heap of [effort, r, c]
    heap.push([0, 0, 0])
    while heap is not empty:
        [d, r, c] ← heap.pop()
        if d > effort[r][c]:
            continue                         // stale entry
        if (r, c) is the bottom-right cell:
            return d
        for each neighbour (nr, nc) inside the grid:
            next ← max(d, |heights[nr][nc] - heights[r][c]|)
            if next < effort[nr][nc]:
                effort[nr][nc] ← next
                heap.push([next, nr, nc])`,
          code: `function minimumEffortPath(heights) {
  const rows = heights.length, cols = heights[0].length;
  const effort = Array.from({ length: rows }, () => new Array(cols).fill(Infinity));
  effort[0][0] = 0;
  const heap = new Heap((a, b) => a[0] - b[0]); // [effort, row, col], smallest effort first
  heap.push([0, 0, 0]);
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  while (!heap.isEmpty()) {
    const [d, r, c] = heap.pop();
    if (d > effort[r][c]) continue;       // stale entry
    if (r === rows - 1 && c === cols - 1) return d;
    for (const [dr, dc] of dirs) {
      const nr = r + dr, nc = c + dc;
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
      const next = Math.max(d, Math.abs(heights[nr][nc] - heights[r][c]));
      if (next < effort[nr][nc]) {
        effort[nr][nc] = next;
        heap.push([next, nr, nc]);
      }
    }
  }
  return 0;
}`,
          time: 'O(rows × cols × log(rows × cols))',
          space: 'O(rows × cols)',
        },
      ],
      fn: 'minimumEffortPath',
      starter: `function minimumEffortPath(heights) {
  // Dijkstra on the grid, where a path costs its biggest climb
  return 0;
}`,
      solution: `function minimumEffortPath(heights) {
  const rows = heights.length, cols = heights[0].length;
  const effort = Array.from({ length: rows }, () => new Array(cols).fill(Infinity));
  effort[0][0] = 0;
  const heap = new Heap((a, b) => a[0] - b[0]);
  heap.push([0, 0, 0]);
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  while (!heap.isEmpty()) {
    const [d, r, c] = heap.pop();
    if (d > effort[r][c]) continue;
    if (r === rows - 1 && c === cols - 1) return d;
    for (const [dr, dc] of dirs) {
      const nr = r + dr, nc = c + dc;
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
      const next = Math.max(d, Math.abs(heights[nr][nc] - heights[r][c]));
      if (next < effort[nr][nc]) {
        effort[nr][nc] = next;
        heap.push([next, nr, nc]);
      }
    }
  }
  return 0;
}`,
      tests: [
        { name: 'example', args: [[[1, 2, 2], [3, 8, 2], [5, 3, 5]]], expected: 2 },
        { name: 'detour through the right', args: [[[1, 2, 3], [3, 8, 4], [5, 3, 5]]], expected: 1 },
        {
          name: 'flat path exists',
          args: [[[1, 2, 1, 1, 1], [1, 2, 1, 2, 1], [1, 2, 1, 2, 1], [1, 2, 1, 2, 1], [1, 1, 1, 2, 1]]],
          expected: 0,
        },
        { name: 'single cell', args: [[[5]]], expected: 0 },
        { name: 'one row', args: [[[1, 10, 6]]], expected: 9 },
        { name: 'one column', args: [[[1], [4], [2]]], expected: 3 },
        { name: 'gentle slope around the wall', args: [[[1, 9, 9], [2, 9, 9], [3, 4, 5]]], expected: 1 },
        { name: 'mixed 3x3', args: [[[1, 3, 6], [8, 9, 7], [4, 2, 10]]], expected: 3 },
        {
          name: 'random 4x4',
          args: [[[18, 15, 20, 6], [5, 10, 8, 16], [11, 19, 16, 11], [19, 8, 12, 18]]],
          expected: 8,
        },
      ],
      takeaway: "Dijkstra doesn't need a sum. Any path cost that never shrinks as the path grows (like a max) works.",
    },
  ],
  quiz: [
    {
      prompt: 'In the walkthrough, which node does Dijkstra finish second?',
      options: ['Node 1, because 0→1 is a direct road', 'Node 2, at distance 1', 'Node 3', 'Node 4'],
      answer: 1,
      explanation: 'After popping 0, the heap holds [1, 2] and [5, 1]. The smallest distance is 1, so node 2 comes out next.',
    },
    {
      prompt: 'A popped entry `[d, u]` has `d > dist[u]`. What should happen?',
      options: [
        'Relax its edges anyway, to be safe',
        'Push it back onto the heap',
        'Skip it: it is a stale entry, a cheaper way to u was already found and used',
        'Stop the whole algorithm',
      ],
      answer: 2,
      explanation: 'When `dist[u]` got smaller, a new entry was pushed and has already been handled. The old one carries an outdated cost, so we just skip it.',
    },
    {
      prompt: 'Which graph can make Dijkstra give a wrong or very slow answer?',
      options: [
        'One where every edge costs 1',
        'One with an edge that costs 0',
        'One with an edge that costs -2',
        'One with a cycle of positive edges',
      ],
      answer: 2,
      explanation: "Negative edges break 'pop = done': a finished node can get cheaper later. Zero-cost edges and positive cycles are fine. Use Bellman-Ford (lesson 4) for negative edges.",
    },
    {
      prompt: 'Why does a max-heap Dijkstra work for the most likely path (multiplying chances)?',
      options: [
        'Because multiplication is faster than addition',
        'Because every chance is ≤ 1, so a trip only gets less likely as it grows',
        'Because the graph is undirected',
        'It does not work; you must try every path',
      ],
      answer: 1,
      explanation: 'Multiplying by a number ≤ 1 never makes a chance bigger. So the most likely town popped from the heap cannot be beaten later, just like the closest node with non-negative costs.',
    },
  ],
  takeaways: [
    'Dijkstra = BFS with a min-heap: always finish the closest unfinished node. Its cost is then final.',
    'Relax: if `d + w < dist[v]`, write it down and push. Old heap entries become stale: skip them with `if (d > dist[u]) continue`.',
    'It works when a path never gets better as it grows: non-negative weights, products of chances ≤ 1, the max climb. Negative edges need Bellman-Ford (lesson 4).',
    'Cost: O((V + E) log V) time, O(V + E) space.',
  ],
};

export default lesson;
