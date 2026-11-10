import type { Module } from '../types';
import unionFind from './14-advanced-graphs.lesson-1';
import dijkstra from './14-advanced-graphs.lesson-2';
import dijkstraVariants from './14-advanced-graphs.lesson-3';
import bellmanFord from './14-advanced-graphs.lesson-4';
import mst from './14-advanced-graphs.lesson-5';

const mod: Module = {
  id: 'advanced-graphs',
  number: 14,
  part: 'nonlinear',
  title: 'Union-find, Dijkstra & MST',
  tagline: 'Connected groups, weighted shortest paths and cheapest networks.',
  draft: false,
  intro:
    'Module 13 gave you BFS, which finds the shortest path only when every edge costs the same. Real maps are not like that: roads have lengths, flights have prices, cables have costs. ' +
    'Here you learn four tools: **union-find** to track which things are in the same group as links arrive, **Dijkstra** for the cheapest path when costs differ, **Bellman-Ford** for "at most k stops" and negative costs, and **minimum spanning trees** to connect everything for the least money. ' +
    'After this module you can solve the classic weighted-graph mediums: network delay, cheapest flights, accounts merge and connecting points.',
  lessons: [unionFind, dijkstra, dijkstraVariants, bellmanFord, mst],
  patterns: [
    {
      name: 'Union-find (groups and cycles)',
      signals: [
        'Links or "same as" rules arrive one by one, and you must answer "are these two connected?"',
        'Count groups, or find the first edge that **closes a loop**',
        'Merge things that share something (an email, a letter, a row)',
      ],
      template: `parent[i] ← i for every node, size[i] ← 1
groups ← n
function find(x):
    while parent[x] ≠ x:
        parent[x] ← parent[parent[x]]   // path compression
        x ← parent[x]
    return x
function union(a, b):
    ra ← find(a), rb ← find(b)
    if ra = rb: return false            // already together: a loop
    attach the smaller root under the bigger one
    groups ← groups - 1
    return true`,
      examples: [
        'advanced-graphs-number-of-provinces',
        'advanced-graphs-redundant-connection',
        'advanced-graphs-satisfiability-of-equations',
        'advanced-graphs-accounts-merge',
      ],
    },
    {
      name: 'Dijkstra (weighted shortest path)',
      signals: [
        'Edges have **different non-negative costs** and you want the cheapest, fastest or safest path',
        'BFS would work "if every edge cost 1", but they don\'t',
        'Path cost is a sum, a product of probabilities ≤ 1, or the biggest step on the path (minimax)',
      ],
      template: `dist[every node] ← ∞, dist[src] ← 0
heap.push([0, src])                     // min-heap by distance
while heap not empty:
    [d, u] ← heap.pop()
    if d > dist[u]: continue            // stale entry
    for each [v, w] in graph[u]:
        if d + w < dist[v]:             // relax the edge
            dist[v] ← d + w
            heap.push([dist[v], v])
return dist`,
      examples: [
        'advanced-graphs-network-delay-time',
        'advanced-graphs-path-with-max-probability',
        'advanced-graphs-path-with-minimum-effort',
        'advanced-graphs-ways-to-arrive',
        'advanced-graphs-city-fewest-neighbors',
        'advanced-graphs-swim-in-rising-water',
      ],
    },
    {
      name: 'Bellman-Ford (limited edges, negative costs)',
      signals: [
        '"At most k stops / k flights / k edges"',
        'Some costs can be **negative** (cashback, refunds, exchange gains)',
        'You must detect a loop that keeps making the cost smaller',
      ],
      template: `dist[every node] ← ∞, dist[src] ← 0
repeat rounds times:                    // k + 1 for k stops, n - 1 for all
    next ← copy of dist                 // read old, write new
    for each [u, v, w] in edges:
        if dist[u] ≠ ∞ and dist[u] + w < next[v]:
            next[v] ← dist[u] + w
    dist ← next
// one more round that still improves = negative cycle
return dist`,
      examples: [
        'advanced-graphs-cheapest-flights-k-stops',
        'advanced-graphs-shortest-with-negative-edges',
        'advanced-graphs-currency-arbitrage',
      ],
    },
    {
      name: 'Minimum spanning tree (Kruskal / Prim)',
      signals: [
        'Connect **all** nodes for the least total cost',
        'Any node may reach any other through others; no single start or end',
        'Cables, pipes, roads, power lines; "minimum cost to connect"',
      ],
      template: `// Kruskal: cheapest edge that does not make a loop
sort edges by cost
total ← 0, used ← 0
for each [a, b, cost] in edges:
    if union(a, b):
        total ← total + cost
        used ← used + 1
        if used = n - 1: return total
return -1                               // not connected`,
      examples: [
        'advanced-graphs-connecting-cities',
        'advanced-graphs-min-cost-connect-points',
        'advanced-graphs-water-distribution',
      ],
    },
  ],
  practice: [
    {
      title: 'Number of Operations to Make Network Connected',
      leetcode: 1319,
      difficulty: 'medium',
      hint: 'Count groups with union-find. Each extra cable that closes a loop can be moved once.',
    },
    {
      title: 'Lexicographically Smallest Equivalent String',
      leetcode: 1061,
      difficulty: 'medium',
      hint: 'Union equal letters, and always keep the smallest letter as the root.',
    },
    {
      title: 'Most Stones Removed with Same Row or Column',
      leetcode: 947,
      difficulty: 'medium',
      hint: 'Stones sharing a row or column are one group. Answer = stones - groups.',
    },
    {
      title: 'Smallest String With Swaps',
      leetcode: 1202,
      difficulty: 'medium',
      hint: 'Swap pairs form groups. Inside each group, sort the letters and put them back in order.',
    },
    {
      title: 'Minimum Score of a Path Between Two Cities',
      leetcode: 2492,
      difficulty: 'medium',
      hint: 'You may reuse roads, so look at every road in the group that contains city 1.',
    },
    {
      title: 'Number of Restricted Paths From First to Last Node',
      leetcode: 1786,
      difficulty: 'medium',
      hint: 'Run Dijkstra from node n, then count paths that move to strictly smaller distances.',
    },
    {
      title: 'Minimum Cost to Make at Least One Valid Path in a Grid',
      leetcode: 1368,
      difficulty: 'hard',
      hint: 'Following the arrow costs 0, changing it costs 1. Dijkstra (or a 0-1 BFS) on the grid.',
    },
    {
      title: 'Minimum Obstacle Removal to Reach Corner',
      leetcode: 2290,
      difficulty: 'hard',
      hint: 'An empty cell costs 0 to enter and a wall costs 1. Edge costs are only 0 or 1.',
    },
    {
      title: 'Checking Existence of Edge Length Limited Paths',
      leetcode: 1697,
      difficulty: 'hard',
      hint: 'Sort the queries by limit and add edges to union-find in cost order as the limit grows.',
    },
    {
      title: 'Find Critical and Pseudo-Critical Edges in Minimum Spanning Tree',
      leetcode: 1489,
      difficulty: 'hard',
      hint: 'Run Kruskal once without each edge, and once forcing each edge in. Compare the totals.',
    },
  ],
};

export default mod;
