import type { Lesson } from '../types';

const lesson: Lesson = {
  id: 'bellman-ford',
  title: 'Bellman-Ford: at most k stops and negative edges',
  summary: 'Relax every edge, round after round. Round i knows the best cost using at most i edges.',
  minutes: 22,
  blocks: [
    {
      kind: 'callout',
      tone: 'story',
      title: 'Cheap, but too many layovers',
      text: 'You are booking a flight home. The direct flight costs 500. A travel site finds a 300 trip, but it has **2 layovers** (a layover, or stop, is landing in a city in between and catching another flight). You hate layovers: you will take **at most 1**. Is there something cheaper than 500 that fits? Every flight search with a "max stops" filter has to answer this.',
    },
    {
      kind: 'text',
      text: 'The problem: 4 cities, numbered 0 to 3. You start at city **0** and want to reach city **3** with **at most k = 1 stop**. Each flight is `[from, to, price]` and goes one way. Here are the trips: `0→3` costs 500 (0 stops). `0→2→3` costs 250 + 100 = **350** (1 stop). `0→1→2→3` costs 300 but has 2 stops, so it is not allowed. The answer is **350**.',
    },
    {
      kind: 'diagram',
      title: 'The flight map (arrows are one-way flights)',
      art: [
        '  (0) ------------- 500 ------------> (3)',
        '   | \\                                 ^',
        '   |   \\  250                          |',
        '100|     \\                             | 100',
        '   v       v                           |',
        '  (1) -100-> (2) ----------------------+',
      ].join('\n'),
      caption: 'flights = `[[0,1,100], [1,2,100], [2,3,100], [0,2,250], [0,3,500]]`. With k = 1, the best trip is 0→2→3 for 350.',
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Brute force: try every trip with at most k + 1 flights',
      code: `// k stops = at most k + 1 flights
best ← ∞

function explore(city, flightsUsed, cost):
    if city = dst:
        best ← min(best, cost)
        return
    if flightsUsed = k + 1:              // no flights left
        return
    for each [next, price] in graph[city]:
        explore(next, flightsUsed + 1, cost + price)

explore(src, 0, 0)
return -1 if best = ∞, else best`,
    },
    {
      kind: 'text',
      text: 'It works, but it is slow. Each city can have up to n - 1 flights out, so there can be about **n^(k+1)** trips to try. With 100 cities and k = 10, that is about 100¹¹ = 10²² trips. **Why not just use Dijkstra from lesson 2?** Let us try it, with one change: each heap entry also counts the flights used, and we never fly on if that would break the stop limit.',
    },
    {
      kind: 'trace',
      title: 'Dijkstra with a stop limit gives the wrong answer (k = 1)',
      columns: ['pop [cost, city, flights]', 'what happens', 'dist'],
      rows: [
        ['[0, 0, 0]', 'push [100,1,1], [250,2,1], [500,3,1]', '0, 100, 250, 500'],
        ['[100, 1, 1]', '100 + 100 = 200 < 250, so dist[2] = 200, push [200,2,2]', '0, 100, 200, 500'],
        ['[200, 2, 2]', '2 flights used. One more = 2 stops > k. Stop here.', '0, 100, 200, 500'],
        ['[250, 2, 1]', '250 > dist[2] = 200: stale, thrown away!', '0, 100, 200, 500'],
        ['[500, 3, 1]', 'reached city 3: returns 500', '0, 100, 200, 500'],
      ],
      note: 'The thrown-away entry `[250, 2, 1]` was the good one: pricier, but with **fewer flights**. Dijkstra keeps only the cheapest cost per city, so it forgets that a pricier route with fewer stops can still win. The right answer is 350.',
    },
    {
      kind: 'text',
      text: '**Spot the waste.** The brute force re-flies the same beginnings again and again. Every trip through city 2 re-computes "what is the cheapest way to reach city 2 in 2 flights?". So store it once: let `best[i][c]` be the cheapest cost to reach city `c` using **at most i flights**. The row for i + 1 flights comes straight from the row for i flights: for every flight `[u, v, price]`, try `best[i][u] + price` as a cost for `v`. You only ever need the last row, so keep two arrays: `prev` (last round) and `next` (this round).',
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'Relax every edge, one round per extra flight',
      text: 'Remember **relax** from lesson 2: check if going through edge `u→v` gives a cheaper way to reach `v`, and if yes, write down the cheaper cost. **Bellman-Ford** relaxes *every* edge, round after round. After round i, the array holds the best cost using **at most i edges**. k stops = at most k + 1 flights = **k + 1 rounds**. One rule makes it exact: inside a round, **read from `prev`** (a copy of last round) and **write to `next`**.',
    },
    {
      kind: 'trace',
      title: 'Bellman-Ford with prev and next (k = 1, so 2 rounds)',
      columns: ['round', 'prev (read only)', 'flight', 'prev[from] + price', 'next (written)'],
      rows: [
        ['1', '0, ∞, ∞, ∞', '0→1 (100)', '0 + 100 = 100 < ∞', '0, 100, ∞, ∞'],
        ['1', '0, ∞, ∞, ∞', '1→2 (100)', 'prev[1] = ∞: skip', '0, 100, ∞, ∞'],
        ['1', '0, ∞, ∞, ∞', '2→3 (100)', 'prev[2] = ∞: skip', '0, 100, ∞, ∞'],
        ['1', '0, ∞, ∞, ∞', '0→2 (250)', '0 + 250 = 250 < ∞', '0, 100, 250, ∞'],
        ['1', '0, ∞, ∞, ∞', '0→3 (500)', '0 + 500 = 500 < ∞', '0, 100, 250, 500'],
        ['2', '0, 100, 250, 500', '0→1 (100)', '100, not less than 100', '0, 100, 250, 500'],
        ['2', '0, 100, 250, 500', '1→2 (100)', '100 + 100 = 200 < 250', '0, 100, 200, 500'],
        ['2', '0, 100, 250, 500', '2→3 (100)', '250 + 100 = 350 < 500', '0, 100, 200, 350'],
        ['2', '0, 100, 250, 500', '0→2 (250)', '250, not less than 200', '0, 100, 200, 350'],
        ['2', '0, 100, 250, 500', '0→3 (500)', '500, not less than 350', '0, 100, 200, 350'],
      ],
      note: 'In round 1, flight 1→2 is skipped because `prev[1]` is still ∞, even though `next[1]` just became 100. In round 2, flight 2→3 reads `prev[2] = 250` (a 1-flight cost), not the 200 written a moment ago (a 2-flight cost). So 350 is a real 2-flight trip: 0→2→3. Answer: `next[3]` = **350**.',
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Bellman-Ford with at most k stops',
      code: `function findCheapestPrice(n, flights, src, dst, k):
    prev ← array of n values, all ∞
    prev[src] ← 0
    repeat k + 1 times:                   // round i allows i flights
        next ← copy of prev
        for each [u, v, price] in flights:
            if prev[u] + price < next[v]: // read OLD, write NEW
                next[v] ← prev[u] + price
        prev ← next
    if prev[dst] = ∞:
        return -1
    return prev[dst]`,
    },
    {
      kind: 'code',
      lang: 'js',
      title: 'Bellman-Ford with at most k stops',
      code: `function findCheapestPrice(n, flights, src, dst, k) {
  let prev = new Array(n).fill(Infinity);
  prev[src] = 0;
  for (let round = 1; round <= k + 1; round++) {
    const next = prev.slice();            // this round writes here
    for (const [u, v, price] of flights) {
      if (prev[u] + price < next[v]) next[v] = prev[u] + price; // read last round only
    }
    prev = next;
  }
  return prev[dst] === Infinity ? -1 : prev[dst];
}`,
    },
    {
      kind: 'text',
      text: '**Negative edges are fine.** Bellman-Ford never says "this city is done". It just keeps relaxing, so an edge with a negative cost (a refund, a cashback road, a sponsor paying you) is no problem. Dijkstra breaks here: it trusts that a city leaving the heap is final, but a negative edge found later can still make it cheaper. Without a stop limit, a cheapest route never needs more than **n - 1 edges**, so **n - 1 rounds** are enough. Now run **round n**. If something *still* gets cheaper, there is a **negative cycle**: a loop of edges whose total cost is below 0, so every lap makes the cost smaller, forever. In currency trading that loop is free money, called **arbitrage**. Some internet routers use this same "relax and share" idea to find routes (the RIP protocol).',
    },
    {
      kind: 'compare',
      title: 'Cheapest flight with at most k stops (n cities, E flights)',
      rows: [
        { approach: 'Try every trip (DFS)', time: 'O(n^(k+1))', space: 'O(n + E)', note: 'Correct, but explodes as k grows.' },
        { approach: 'Plain Dijkstra + stop check', time: 'O(E log E)', space: 'O(n + E)', note: '**Wrong.** Throws away a pricier route that has fewer stops.' },
        { approach: 'Dijkstra on (city, flights used)', time: 'O(k · E · log(k · E))', space: 'O(k · E)', note: 'Correct. Each heap entry carries its flight count, and a city is skipped only if it was already popped with fewer flights (and so a cheaper cost).' },
        { approach: 'Bellman-Ford, k + 1 rounds', time: 'O(k · E)', space: 'O(n)', note: 'Simplest. Two arrays, one loop per round.' },
      ],
    },
    {
      kind: 'list',
      items: [
        '**"At most k stops / k edges / k steps"** on a weighted graph: k + 1 rounds with `prev` and `next`.',
        '**Negative costs** (refunds, cashback, discounts): Dijkstra is out, Bellman-Ford is in. Full run is **O(V · E)** (V = cities, E = edges).',
        '**"Can it get better forever?"** (arbitrage, endless loops): run round n and see if anything still improves.',
      ],
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Pattern: Bellman-Ford with a negative cycle check',
      code: `function bellmanFord(n, edges, src):
    dist ← array of n values, all ∞
    dist[src] ← 0
    repeat n - 1 times:                  // a cheapest path has ≤ n - 1 edges
        for each [u, v, w] in edges:
            if dist[u] ≠ ∞ and dist[u] + w < dist[v]:
                dist[v] ← dist[u] + w
    for each [u, v, w] in edges:         // round n: one more try
        if dist[u] ≠ ∞ and dist[u] + w < dist[v]:
            return "negative cycle"      // still improving = a loop that pays you
    return dist

// Limit of at most L edges (k stops → L = k + 1):
// repeat L times, read from prev, write to next ← copy of prev`,
    },
    {
      kind: 'steps',
      title: 'The trap: one array, no copy (k = 1)',
      frames: [
        {
          cells: [0, '∞', '∞', '∞'],
          vars: { round: 1, rule: 'read and write the same array' },
          note: 'Buggy version: a single `dist` array, updated in place. k = 1, so 2 rounds.',
        },
        {
          cells: [0, 100, '∞', '∞'],
          active: [1],
          vars: { round: 1, flight: '0→1 (100)' },
          note: 'Flight 0→1: city 1 becomes 100. So far so good: 1 flight.',
        },
        {
          cells: [0, 100, 200, '∞'],
          active: [2],
          vars: { round: 1, flight: '1→2 (100)' },
          note: 'Flight 1→2 reads `dist[1] = 100`, written a moment ago in this *same* round. So 200 already uses **2 flights** in round 1.',
        },
        {
          cells: [0, 100, 200, 300],
          active: [3],
          vars: { round: 1, flight: '2→3 (100)' },
          note: 'Flight 2→3 chains again: 300 is the trip 0→1→2→3. That is **3 flights (2 stops)**, still in round 1.',
        },
        {
          cells: [0, 100, 200, 300],
          done: [0, 1, 2],
          vars: { round: 2, change: 'none' },
          note: 'The rest of round 1: flights 0→2 (250) and 0→3 (500) do not beat what is there. Round 2 then changes nothing.',
        },
        {
          cells: [0, 100, 200, 300],
          found: [3],
          vars: { buggy: 300, correct: 350 },
          note: 'Answer 300. **Wrong!** That trip has 2 stops, but k = 1. The `prev`/`next` version gives 350.',
        },
      ],
    },
    {
      kind: 'callout',
      tone: 'trap',
      title: 'No copy = secret extra stops',
      text: 'If you update `dist` in place, one round can chain several edges, so "round i" no longer means "at most i edges". With a stop limit, that gives answers that break the limit. Always do `next = prev.slice()`, read `prev`, write `next`. (With **no** edge limit, like plain shortest paths, in place is fine: chaining only reaches the final answer sooner.) Also: if `dst` is still ∞ at the end, return `-1`, not `Infinity`.',
    },
  ],
  problems: [
    {
      id: 'advanced-graphs-cheapest-flights-k-stops',
      title: 'Cheapest Flights Within K Stops',
      difficulty: 'medium',
      leetcode: 787,
      pattern: 'Bellman-Ford (at most k edges)',
      statement:
        'You are booking a trip. There are `n` cities, numbered 0 to n - 1. Each flight `[from, to, price]` goes one way. You start at `src` and want to reach `dst` with **at most `k` stops** (a stop is a city you land in between). Return the cheapest total price, or `-1` if no trip fits the limit.',
      examples: [
        {
          input: 'n = 4, flights = [[0,1,100],[1,2,100],[2,3,100],[0,2,250],[0,3,500]], src = 0, dst = 3, k = 1',
          output: '350',
          explain: '0→2→3 costs 350 with 1 stop. 0→1→2→3 costs 300 but has 2 stops, which is too many.',
        },
        {
          input: 'same flights, k = 0',
          output: '500',
          explain: 'No stops allowed, so only the direct flight 0→3 counts.',
        },
        {
          input: 'n = 3, flights = [[0,1,100]], src = 0, dst = 2, k = 1',
          output: '-1',
          explain: 'No flight ever lands in city 2.',
        },
      ],
      constraints: [
        '1 ≤ n ≤ 100',
        '0 ≤ flights.length ≤ n · (n - 1) / 2',
        'no flight goes from a city to itself, and no two flights share the same from and to',
        '1 ≤ price ≤ 10⁴',
        '0 ≤ src, dst, k < n, and src ≠ dst',
      ],
      hints: [
        'Think in flights, not stops: k stops means at most k + 1 flights.',
        'Let `best[c]` be the cheapest cost to reach city c using at most i flights. How do you get the answer for i + 1 flights from the answer for i flights?',
        'Run k + 1 rounds. In each round, try every flight `[u, v, p]`: `next[v] = min(next[v], prev[u] + p)`.',
        'Start each round with `next = prev.slice()` and read only from `prev`. If you read values written in the same round, one round can chain several flights.',
      ],
      approaches: [
        {
          name: 'Try every trip (DFS)',
          idea: 'Walk out from `src`, trying every flight, and stop a branch once it has used k + 1 flights. Every allowed trip gets checked, so the cheapest one is found. But the number of trips grows like n^(k+1).',
          time: 'O(n^(k+1))',
          space: 'O(n + E)',
        },
        {
          name: 'Dijkstra on (city, flights used)',
          idea: 'Plain Dijkstra keeps one cost per city and forgets pricier routes with fewer stops. Fix it by putting the flight count in each heap entry. Pop the cheapest entry. If it is `dst`, that is the answer (nothing cheaper is left). Skip a city only if it was already popped with fewer or equal flights, because that earlier pop was also cheaper, so it wins on both counts.',
          code: `function findCheapestPrice(n, flights, src, dst, k) {
  const graph = Array.from({ length: n }, () => []);
  for (const [u, v, w] of flights) graph[u].push([v, w]);
  const fewest = new Array(n).fill(Infinity); // fewest flights a city was popped with
  const heap = new Heap((a, b) => a[0] - b[0]); // [cost, city, flightsUsed]
  heap.push([0, src, 0]);
  while (!heap.isEmpty()) {
    const [cost, u, used] = heap.pop();
    if (u === dst) return cost;
    if (used > k || used >= fewest[u]) continue; // no flights left, or beaten
    fewest[u] = used;
    for (const [v, w] of graph[u]) heap.push([cost + w, v, used + 1]);
  }
  return -1;
}`,
          time: 'O(k · E · log(k · E))',
          space: 'O(k · E)',
        },
        {
          name: 'Bellman-Ford, k + 1 rounds',
          idea: 'After round i, `prev[c]` is the cheapest cost to reach c with at most i flights. Each round tries every flight once, reading only last round\'s costs, so no round can sneak in extra flights. After k + 1 rounds, `prev[dst]` is the answer.',
          pseudo: `function findCheapestPrice(n, flights, src, dst, k):
    prev ← array of n values, all ∞
    prev[src] ← 0
    repeat k + 1 times:
        next ← copy of prev
        for each [u, v, price] in flights:
            if prev[u] + price < next[v]:
                next[v] ← prev[u] + price
        prev ← next
    if prev[dst] = ∞:
        return -1
    return prev[dst]`,
          code: `function findCheapestPrice(n, flights, src, dst, k) {
  let prev = new Array(n).fill(Infinity);
  prev[src] = 0;
  for (let round = 1; round <= k + 1; round++) {
    const next = prev.slice();
    for (const [u, v, price] of flights) {
      if (prev[u] + price < next[v]) next[v] = prev[u] + price;
    }
    prev = next;
  }
  return prev[dst] === Infinity ? -1 : prev[dst];
}`,
          time: 'O(k · E)',
          space: 'O(n)',
        },
      ],
      fn: 'findCheapestPrice',
      starter: `function findCheapestPrice(n, flights, src, dst, k) {
  // cheapest price from src to dst with at most k stops, or -1
  return -1;
}`,
      solution: `function findCheapestPrice(n, flights, src, dst, k) {
  let prev = new Array(n).fill(Infinity);
  prev[src] = 0;
  for (let round = 1; round <= k + 1; round++) {
    const next = prev.slice();
    for (const [u, v, price] of flights) {
      if (prev[u] + price < next[v]) next[v] = prev[u] + price;
    }
    prev = next;
  }
  return prev[dst] === Infinity ? -1 : prev[dst];
}`,
      tests: [
        { name: 'lesson map, k = 1', args: [4, [[0, 1, 100], [1, 2, 100], [2, 3, 100], [0, 2, 250], [0, 3, 500]], 0, 3, 1], expected: 350 },
        { name: 'lesson map, k = 0: direct only', args: [4, [[0, 1, 100], [1, 2, 100], [2, 3, 100], [0, 2, 250], [0, 3, 500]], 0, 3, 0], expected: 500 },
        { name: 'lesson map, k = 2: long trip allowed', args: [4, [[0, 1, 100], [1, 2, 100], [2, 3, 100], [0, 2, 250], [0, 3, 500]], 0, 3, 2], expected: 300 },
        { name: 'loop in the map', args: [4, [[0, 1, 100], [1, 2, 100], [2, 0, 100], [1, 3, 600], [2, 3, 200]], 0, 3, 1], expected: 700 },
        { name: 'cheaper middle city needs more stops', args: [5, [[0, 1, 5], [1, 2, 5], [0, 3, 2], [3, 1, 2], [1, 4, 1], [4, 2, 1]], 0, 2, 2], expected: 7 },
        { name: 'no flight reaches dst', args: [3, [[0, 1, 100]], 0, 2, 1], expected: -1 },
        { name: 'route exists but needs too many stops', args: [4, [[0, 1, 10], [1, 2, 10], [2, 3, 10]], 0, 3, 1], expected: -1 },
        { name: 'flights point the wrong way', args: [3, [[1, 0, 5], [2, 1, 5]], 0, 2, 2], expected: -1 },
        { name: 'single direct flight', args: [2, [[0, 1, 7]], 0, 1, 0], expected: 7 },
        { name: 'flights listed backwards, big k', args: [4, [[2, 3, 100], [1, 2, 100], [0, 1, 100], [0, 3, 1000]], 0, 3, 3], expected: 300 },
      ],
      takeaway: 'k stops = k + 1 rounds of relaxing every flight, always reading last round\'s copy.',
    },
    {
      id: 'advanced-graphs-shortest-with-negative-edges',
      title: 'Cashback road trip',
      difficulty: 'medium',
      pattern: 'Bellman-Ford (negative cycle check)',
      statement:
        'A road-trip app knows the cost of every one-way road `[u, v, cost]` between `n` towns (numbered 0 to n - 1). Some roads have a sponsor who pays you cashback, so their cost is **negative**. Starting from town `src`, return an array where entry `t` is the cheapest total cost to reach town `t` (0 for `src` itself), or `null` if `t` cannot be reached. But if you can reach a loop of roads whose total cost is below 0, you could drive it forever and make the cost as small as you like, so return the string `"negative cycle"` instead. A negative loop that you cannot reach from `src` does not matter.',
      examples: [
        {
          input: 'n = 4, roads = [[0,1,5],[0,2,2],[1,2,-4],[2,3,3]], src = 0',
          output: '[0, 5, 1, 4]',
          explain: 'Town 2 is cheaper through town 1: 5 + (-4) = 1, which beats the direct road (2). Then town 3 costs 1 + 3 = 4.',
        },
        {
          input: 'n = 3, roads = [[0,1,1],[1,2,-3],[2,1,1]], src = 0',
          output: '"negative cycle"',
          explain: 'The loop 1→2→1 costs -3 + 1 = -2. Each lap makes the trip 2 cheaper, forever.',
        },
        {
          input: 'n = 4, roads = [[0,1,2],[2,3,-5],[3,2,1]], src = 0',
          output: '[0, 2, null, null]',
          explain: 'The loop 2→3→2 is negative, but you can never get there from town 0, so it does not count.',
        },
      ],
      constraints: [
        '1 ≤ n ≤ 100',
        '0 ≤ roads.length ≤ 500',
        '-100 ≤ cost ≤ 100',
        'no road starts and ends in the same town',
        '0 ≤ src < n',
      ],
      hints: [
        'Dijkstra is out: it treats a town as final when it leaves the heap, but a cashback road found later can still make it cheaper.',
        'With no negative loop, a cheapest route never repeats a town, so it uses at most n - 1 roads. That means n - 1 rounds of relaxing every road are enough.',
        'After those rounds, try every road one more time. If anything still gets cheaper, a negative loop is reachable.',
        'Only relax a road if its start town has been reached (`dist[u] !== Infinity`), so a loop you cannot reach never raises the alarm. Turn ∞ into `null` at the end.',
      ],
      approaches: [
        {
          name: 'Try every route (DFS)',
          idea: 'Walk every route from `src` that never repeats a town, and keep the smallest cost seen for each town. If a road leads back to a town already on the current route and that loop adds up to less than 0, report the negative cycle. It is correct, but the number of routes can grow like n!.',
          time: 'O(n!)',
          space: 'O(n + E)',
        },
        {
          name: 'Bellman-Ford + one extra round',
          idea: 'Relax every road for n - 1 rounds. Each round lets cheaper costs travel one more road, and a cheapest route has at most n - 1 roads, so after that every reachable town is right. A copy is not needed here: there is no limit on roads, so chaining in one round only gets there sooner. One more round that still improves something proves a reachable negative loop.',
          pseudo: `function cheapestCosts(n, roads, src):
    dist ← array of n values, all ∞
    dist[src] ← 0
    repeat n - 1 times:
        changed ← false
        for each [u, v, w] in roads:
            if dist[u] ≠ ∞ and dist[u] + w < dist[v]:
                dist[v] ← dist[u] + w
                changed ← true
        if not changed: stop repeating      // nothing moved, so we are done early
    for each [u, v, w] in roads:            // round n
        if dist[u] ≠ ∞ and dist[u] + w < dist[v]:
            return "negative cycle"
    return dist with every ∞ turned into null`,
          code: `function cheapestCosts(n, roads, src) {
  const dist = new Array(n).fill(Infinity);
  dist[src] = 0;
  for (let round = 1; round <= n - 1; round++) {
    let changed = false;
    for (const [u, v, w] of roads) {
      if (dist[u] !== Infinity && dist[u] + w < dist[v]) {
        dist[v] = dist[u] + w;
        changed = true;
      }
    }
    if (!changed) break; // nothing moved: done early
  }
  for (const [u, v, w] of roads) {
    if (dist[u] !== Infinity && dist[u] + w < dist[v]) return 'negative cycle';
  }
  return dist.map((d) => (d === Infinity ? null : d));
}`,
          time: 'O(V · E)',
          space: 'O(V)',
        },
      ],
      fn: 'cheapestCosts',
      starter: `function cheapestCosts(n, roads, src) {
  // cheapest cost to every town (null if unreachable), or "negative cycle"
  return [];
}`,
      solution: `function cheapestCosts(n, roads, src) {
  const dist = new Array(n).fill(Infinity);
  dist[src] = 0;
  for (let round = 1; round <= n - 1; round++) {
    let changed = false;
    for (const [u, v, w] of roads) {
      if (dist[u] !== Infinity && dist[u] + w < dist[v]) {
        dist[v] = dist[u] + w;
        changed = true;
      }
    }
    if (!changed) break;
  }
  for (const [u, v, w] of roads) {
    if (dist[u] !== Infinity && dist[u] + w < dist[v]) return 'negative cycle';
  }
  return dist.map((d) => (d === Infinity ? null : d));
}`,
      tests: [
        { name: 'no negative roads', args: [4, [[0, 1, 4], [0, 2, 1], [2, 1, 2], [1, 3, 1]], 0], expected: [0, 3, 1, 4] },
        { name: 'negative road, no loop', args: [4, [[0, 1, 5], [0, 2, 2], [1, 2, -4], [2, 3, 3]], 0], expected: [0, 5, 1, 4] },
        { name: 'cashback found late (Dijkstra trap)', args: [3, [[0, 1, 1], [0, 2, 5], [2, 1, -10]], 0], expected: [0, -5, 5] },
        { name: 'unreachable town', args: [3, [[0, 1, 2]], 0], expected: [0, 2, null] },
        { name: 'reachable negative loop', args: [3, [[0, 1, 1], [1, 2, -3], [2, 1, 1]], 0], expected: 'negative cycle' },
        { name: 'negative loop through src', args: [2, [[0, 1, -1], [1, 0, -1]], 0], expected: 'negative cycle' },
        { name: 'negative loop NOT reachable', args: [4, [[0, 1, 2], [2, 3, -5], [3, 2, 1]], 0], expected: [0, 2, null, null] },
        { name: 'zero-cost loop is fine', args: [3, [[0, 1, 2], [1, 2, -1], [2, 1, 1]], 0], expected: [0, 2, 1] },
        { name: 'src is not town 0', args: [3, [[1, 0, -2], [0, 2, 3]], 1], expected: [-2, 0, 1] },
        { name: 'long chain, roads listed backwards', args: [5, [[3, 4, 1], [2, 3, 1], [1, 2, 1], [0, 1, -1]], 0], expected: [0, -1, 0, 1, 2] },
        { name: 'single town', args: [1, [], 0], expected: [0] },
      ],
      takeaway: 'Negative edges: n - 1 rounds of relaxing. Still improving in round n = a negative cycle.',
    },
    {
      id: 'advanced-graphs-currency-arbitrage',
      title: 'Currency arbitrage loop',
      difficulty: 'medium',
      pattern: 'Bellman-Ford (negative cycle check)',
      statement:
        'A money exchange lists one-way rates `[from, to, rate]`: 1 unit of currency `from` buys `rate` units of currency `to`. Currencies are numbered 0 to n - 1. Is there a loop of trades that starts and ends with the same currency and leaves you with **more** than you started with? Traders call that **arbitrage**. Return `true` or `false`.',
      examples: [
        {
          input: 'n = 3, rates = [[0,1,0.9],[1,2,0.8],[2,0,1.5]]',
          output: 'true',
          explain: '1 → 0.9 → 0.72 → 1.08. You end with 8% more than you started.',
        },
        {
          input: 'n = 2, rates = [[0,1,2],[1,0,0.5]]',
          output: 'false',
          explain: '1 → 2 → 1. A fair loop: you end exactly where you started.',
        },
        {
          input: 'n = 4, rates = [[0,1,1],[2,3,2],[3,2,0.6]]',
          output: 'true',
          explain: 'The loop 2→3→2 gives 2 · 0.6 = 1.2. It does not need to touch currency 0.',
        },
      ],
      constraints: ['1 ≤ n ≤ 50', '0 ≤ rates.length ≤ 300', '0 < rate ≤ 10', 'every loop that pays, pays at least 1% more'],
      hints: [
        'This is Bellman-Ford with two swaps: amounts **multiply** along a path instead of adding, and you want the **most** money, not the least.',
        'A paying loop is like a negative cycle: going around it once more always makes things better, forever.',
        'The loop could be anywhere, so start with 1 unit of *every* currency (`best = all 1s`). Run n - 1 rounds of `best[v] = max(best[v], best[u] · rate)`.',
        'Then do round n: if any trade still raises a `best`, return true. Decimals have tiny rounding errors, so only count a gain bigger than a tiny margin, like `best[u] * rate > best[v] * (1 + 1e-9)`.',
      ],
      approaches: [
        {
          name: 'Try every loop (DFS)',
          idea: 'From each currency, walk every path that does not repeat a currency, multiplying the rates. Whenever a trade leads back to the start, check if you have more than 1. It checks every simple loop, and any paying loop contains a simple paying loop, so it is correct. But the number of paths can grow like n!.',
          time: 'O(n · n!)',
          space: 'O(n + E)',
        },
        {
          name: 'Bellman-Ford on "most money"',
          idea: 'Start with 1 unit of every currency and relax every trade for n - 1 rounds, keeping the **biggest** amount per currency. With no paying loop, nothing can keep growing after that. So if round n still raises an amount, a paying loop exists. (A classic trick does the same with costs `-log(rate)`: multiplying turns into adding, and "more than 1" turns into a negative cycle.)',
          pseudo: `function hasArbitrage(n, rates):
    best ← array of n values, all 1     // 1 unit of every currency
    repeat n - 1 times:
        for each [u, v, rate] in rates:
            if best[u] · rate > best[v] · (1 + tiny):
                best[v] ← best[u] · rate
    for each [u, v, rate] in rates:     // round n
        if best[u] · rate > best[v] · (1 + tiny):
            return true                 // still growing = a paying loop
    return false`,
          code: `function hasArbitrage(n, rates) {
  const best = new Array(n).fill(1);
  const grows = (u, v, rate) => best[u] * rate > best[v] * (1 + 1e-9);
  for (let round = 1; round <= n - 1; round++) {
    for (const [u, v, rate] of rates) {
      if (grows(u, v, rate)) best[v] = best[u] * rate;
    }
  }
  return rates.some(([u, v, rate]) => grows(u, v, rate));
}`,
          time: 'O(V · E)',
          space: 'O(V)',
        },
      ],
      fn: 'hasArbitrage',
      starter: `function hasArbitrage(n, rates) {
  // true if some loop of trades ends with more money than it started
  return false;
}`,
      solution: `function hasArbitrage(n, rates) {
  const best = new Array(n).fill(1);
  const grows = (u, v, rate) => best[u] * rate > best[v] * (1 + 1e-9);
  for (let round = 1; round <= n - 1; round++) {
    for (const [u, v, rate] of rates) {
      if (grows(u, v, rate)) best[v] = best[u] * rate;
    }
  }
  return rates.some(([u, v, rate]) => grows(u, v, rate));
}`,
      tests: [
        { name: 'three-way loop pays 8%', args: [3, [[0, 1, 0.9], [1, 2, 0.8], [2, 0, 1.5]]], expected: true },
        { name: 'fair loop', args: [2, [[0, 1, 2], [1, 0, 0.5]]], expected: false },
        { name: 'losing loop', args: [2, [[0, 1, 0.9], [1, 0, 1.1]]], expected: false },
        { name: 'no loop at all', args: [3, [[0, 1, 2], [1, 2, 3]]], expected: false },
        { name: 'paying loop away from currency 0', args: [4, [[0, 1, 1], [2, 3, 2], [3, 2, 0.6]]], expected: true },
        { name: 'only the long way round pays', args: [3, [[0, 1, 1], [1, 0, 0.95], [1, 2, 1.1], [2, 0, 0.95]]], expected: true },
        { name: 'three-way fair loop', args: [3, [[0, 1, 0.8], [1, 2, 1.25], [2, 0, 1]]], expected: false },
        { name: 'single currency', args: [1, []], expected: false },
      ],
      takeaway: 'Same skeleton, new rules: multiply instead of add, keep the max, and "still improving in round n" means free money.',
    },
  ],
  quiz: [
    {
      prompt: 'You may make at most **k = 2** stops. How many Bellman-Ford rounds do you run?',
      options: ['2', '3', 'n - 1', 'n'],
      answer: 1,
      explanation: '2 stops = at most 3 flights, and round i allows i flights. So 3 rounds.',
    },
    {
      prompt: 'Why does each round read from `prev` (a copy of last round) instead of the array it is writing to?',
      options: [
        'It makes the code run faster',
        'Otherwise one round can chain several flights, so a trip can use more stops than allowed',
        'JavaScript arrays cannot be read and written in the same loop',
        'It is needed for negative edges',
      ],
      answer: 1,
      explanation: 'Reading a value written in the same round lets that round add a second (or third) flight on top. Then "round i" no longer means "at most i flights".',
    },
    {
      prompt: 'You ran n - 1 rounds. In round n, one cost still gets smaller. What does that tell you?',
      options: [
        'You need one more round',
        'The graph has an unreachable town',
        'A loop with a total cost below 0 can be reached from the start',
        'Some edge costs are 0',
      ],
      answer: 2,
      explanation: 'Without a negative cycle, every cheapest route uses at most n - 1 edges, so n - 1 rounds finish the job. Still improving means some loop keeps paying you.',
    },
    {
      prompt: 'Some roads have negative costs (cashback). Which method can you trust?',
      options: ['BFS', 'Dijkstra', 'Bellman-Ford', 'Any of them'],
      answer: 2,
      explanation: 'BFS needs every edge to cost the same. Dijkstra assumes a town leaving the heap is final, which a negative edge can break. Bellman-Ford never finalizes early.',
    },
  ],
  takeaways: [
    'Bellman-Ford: relax every edge, round after round. After round i, you know the best cost using at most i edges.',
    'At most k stops = k + 1 rounds. Read from `prev`, write to `next`, or a round secretly uses extra stops.',
    'Negative edges are fine. If round n still improves something, there is a reachable negative cycle.',
    'Cost: O(k · E) with a stop limit, O(V · E) in general. Dijkstra on (city, stops used) also solves k stops.',
  ],
};

export default lesson;
