import type { Lesson } from '../types';

// The shared union-find template (lesson 5 reuses it word for word).
const UF = `const parent = Array.from({ length: n }, (_, i) => i);
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
}`;

// Same template, indented to sit inside a function body.
const UF_IN = UF.split('\n')
  .map((line) => '  ' + line)
  .join('\n');

const UF_PSEUDO = `parent ← array where parent[i] = i      // every node starts as its own root
size ← array of n ones                  // size[r] = how many nodes hang under root r

function find(x):
    while parent[x] ≠ x:
        parent[x] ← parent[parent[x]]   // skip one level: path compression
        x ← parent[x]
    return x

function union(a, b):
    ra ← find(a)
    rb ← find(b)
    if ra = rb:
        return false                    // already in the same group
    if size[ra] < size[rb]:
        swap ra and rb
    parent[rb] ← ra                     // small group joins big group
    size[ra] ← size[ra] + size[rb]
    return true`;

// ---------- Problem code ----------

const provincesCode = `function findCircleNum(isConnected) {
  const n = isConnected.length;
${UF_IN}
  let groups = n;
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (isConnected[i][j] === 1 && union(i, j)) groups--;
    }
  }
  return groups;
}`;

const provincesDfs = `function findCircleNum(isConnected) {
  const n = isConnected.length;
  const seen = new Array(n).fill(false);
  function dfs(u) {
    seen[u] = true;
    for (let v = 0; v < n; v++) {
      if (isConnected[u][v] === 1 && !seen[v]) dfs(v);
    }
  }
  let groups = 0;
  for (let i = 0; i < n; i++) {
    if (!seen[i]) {
      groups++;
      dfs(i);
    }
  }
  return groups;
}`;

const redundantCode = `function findRedundantConnection(edges) {
  const n = edges.length + 1;            // nodes are 1..edges.length, slot 0 unused
${UF_IN}
  for (const [a, b] of edges) {
    if (!union(a, b)) return [a, b];     // a and b were already connected
  }
  return [];
}`;

const equationsCode = `function equationsPossible(equations) {
  const n = 26;                          // one node per letter a..z
${UF_IN}
  const id = (ch) => ch.charCodeAt(0) - 97;
  for (const e of equations) {
    if (e[1] === '=') union(id(e[0]), id(e[3]));
  }
  for (const e of equations) {
    if (e[1] === '!' && find(id(e[0])) === find(id(e[3]))) return false;
  }
  return true;
}`;

const accountsCode = `function accountsMerge(accounts) {
  const n = accounts.length;             // one node per account
${UF_IN}
  const owner = new Map();               // email -> first account that had it
  for (let i = 0; i < n; i++) {
    for (let j = 1; j < accounts[i].length; j++) {
      const email = accounts[i][j];
      if (owner.has(email)) union(i, owner.get(email));
      else owner.set(email, i);
    }
  }
  const byRoot = new Map();              // root account -> its emails
  for (const [email, i] of owner) {
    const r = find(i);
    if (!byRoot.has(r)) byRoot.set(r, []);
    byRoot.get(r).push(email);
  }
  const result = [];
  for (const [r, emails] of byRoot) {
    result.push([accounts[r][0], ...emails.sort()]);
  }
  return result;
}`;

const lesson: Lesson = {
  id: 'union-find',
  title: 'Union-find: who is in the same group?',
  summary: 'Merge groups and ask "same group?" in almost one step, using a forest of parent pointers.',
  minutes: 22,
  blocks: [
    {
      kind: 'callout',
      tone: 'story',
      title: 'Are these two computers on the same network?',
      text: 'An office has 6 computers. A technician plugs in cables one at a time. After every cable, someone asks: "can computer 3 talk to computer 5 yet?" Two computers can talk if there is any chain of cables between them. The same question shows up when apps merge friend groups, or when a shop finds that two customer accounts belong to one person and merges them.',
    },
    {
      kind: 'text',
      text: 'Computers are numbered 0 to 5. Cables arrive in this order: **0-1, 2-3, 1-3, 4-5, 3-0, 5-3**. After each cable we want two answers: *how many separate groups are there now?* and *was this cable useless, because its two ends could already talk?* A group here means a set of computers that can all reach each other. At the start there are 6 groups of one.',
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Brute force: a group label for every node',
      code: `label ← array where label[i] = i       // label = the name of i's group

function connected(a, b):
    return label[a] = label[b]          // 1 step

function union(a, b):                   // join a's group and b's group
    old ← label[b]
    new ← label[a]
    if old = new:
        return false                    // already one group
    for i from 0 to n - 1:              // rename everyone in the old group
        if label[i] = old:
            label[i] ← new
    return true`,
    },
    {
      kind: 'text',
      text: 'This works. Asking is 1 step, but every join scans all n nodes: **O(n) per union**, so a million cables on a million computers is about 10¹² steps. The other easy idea, running a fresh DFS from module 13 for every question, costs **O(n + e) per question** (e = number of edges so far). Same problem: each answer redoes the work of the last one.',
    },
    {
      kind: 'text',
      text: '**Spot the waste.** When two groups join, the label array renames every member of one group, even though nothing about those members changed. We only need *one* member of each group to stand for the whole group. Everyone else just needs a way to find that member.',
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'Point at a boss, not at a label',
      text: 'Make each group a little tree. Every node keeps one number, `parent[i]`: the node it points to. The node that points at itself is the **root**, the boss of the group. **find(x)** = follow parents up until you hit the root. **union(a, b)** = find both roots and point one root at the other: one write joins two whole groups. Two tricks keep the trees short. **Union by size**: the smaller group joins under the bigger one. **Path compression**: while you walk up, point nodes closer to the root, so the next walk is shorter. Together they make each operation *almost constant*: in practice ≤ 4-5 steps, even for millions of nodes. This structure is called **union-find** (also called **disjoint set union, DSU**; disjoint = no node is in two groups).',
    },
    {
      kind: 'steps',
      title: 'The parent array as the cables arrive (cell i shows parent[i])',
      frames: [
        {
          cells: [0, 1, 2, 3, 4, 5],
          vars: { groups: 6 },
          note: 'Start: `parent[i] = i`. Every computer is its own root, so there are 6 groups.',
        },
        {
          cells: [0, 0, 2, 3, 4, 5],
          pointers: { a: 0, b: 1 },
          active: [1],
          vars: { groups: 5, union: 'true', 'size[0]': 2 },
          note: 'Cable 0-1: roots are 0 and 1, sizes tie, so 1 points at 0. One write, one group fewer.',
        },
        {
          cells: [0, 0, 2, 2, 4, 5],
          pointers: { a: 2, b: 3 },
          active: [3],
          vars: { groups: 4, union: 'true', 'size[2]': 2 },
          note: 'Cable 2-3: same thing. 3 points at 2.',
        },
        {
          cells: [0, 0, 0, 2, 4, 5],
          pointers: { a: 1, b: 3 },
          active: [2],
          vars: { groups: 3, union: 'true', 'size[0]': 4 },
          note: '`find(1)` walks 1 → 0, root 0. `find(3)` walks 3 → 2, root 2. Sizes tie (2 and 2), so root 2 points at root 0. Node 3 still points at 2: the path 3 → 2 → 0 is now 2 steps long.',
        },
        {
          cells: [0, 0, 0, 2, 4, 4],
          pointers: { a: 4, b: 5 },
          active: [5],
          vars: { groups: 2, union: 'true', 'size[4]': 2 },
          note: 'Cable 4-5: 5 points at 4. Two groups left: {0, 1, 2, 3} and {4, 5}.',
        },
        {
          cells: [0, 0, 0, 0, 4, 4],
          pointers: { a: 3, b: 0 },
          active: [3],
          vars: { groups: 2, union: 'false' },
          note: '`find(3)`: 3 points at 2, and 2 points at 0. Path compression points 3 straight at 0 (its grandparent) and lands on root 0. `find(0)` is 0. Same root, so `union` returns **false**: 3 and 0 could already talk, and this cable makes a loop (a cycle). Groups stay 2.',
        },
        {
          cells: [0, 0, 0, 0, 0, 4],
          pointers: { a: 5, b: 3 },
          active: [4],
          found: [0],
          vars: { groups: 1, union: 'true', 'size[0]': 6 },
          note: 'Cable 5-3: roots are 4 (size 2) and 0 (size 4). Small group joins big group: 4 points at 0. Node 5 still points at 4; the next `find(5)` will shorten that. One group.',
        },
      ],
    },
    {
      kind: 'diagram',
      title: 'The same forest drawn as trees',
      art: `After cable 4-5           After cable 5-3

    0         4                0
   / \\        |             / / \\ \\
  1   2       5            1 2   3 4
      |                            |
      3                            5

2 roots = 2 groups        1 root = 1 group`,
      caption: 'A root is a node whose parent is itself. Count roots and you have counted groups. Path compression pulled 3 up next to 0.',
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Union-find',
      code: UF_PSEUDO,
    },
    {
      kind: 'code',
      lang: 'js',
      title: 'Union-find in JavaScript (copy this into any problem)',
      code: UF,
    },
    {
      kind: 'compare',
      title: 'Answering "same group?" while edges keep arriving',
      rows: [
        {
          approach: 'Fresh DFS per question',
          time: 'O(n + e) per question',
          space: 'O(n + e)',
          note: 'Simple, but redoes all the work every time.',
        },
        {
          approach: 'Group label array',
          time: 'O(1) ask, O(n) per union',
          space: 'O(n)',
          note: 'Fast questions, slow joins: renames a whole group.',
        },
        {
          approach: 'Parent tree, no tricks',
          time: 'up to O(n) per find',
          space: 'O(n)',
          note: 'Unlucky joins build one long chain, and `find` walks all of it.',
        },
        {
          approach: 'Union-find (size + path compression)',
          time: 'almost O(1) per operation',
          space: 'O(n)',
          note: 'Trees stay flat: in practice ≤ 4-5 steps per `find`.',
        },
      ],
    },
    {
      kind: 'text',
      text: 'DFS from module 13 can also count groups: start a DFS from every unvisited node and count how many times you start. If you get the whole graph at once and only need that count, DFS is fine. Pick **union-find** when edges arrive one at a time (you must answer after each one), or when you need "were these two already connected?" while you are still adding edges.',
    },
    {
      kind: 'list',
      items: [
        'Things merge into groups: friends, networks, accounts, letters that must be equal.',
        'Questions like "are a and b connected?" or "how many groups?" while pairs keep arriving.',
        'You must spot the first edge that closes a cycle.',
        'Merge items that share *something* (an email, a value) without building a full graph.',
      ],
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Pattern template: count groups and catch cycles',
      code: `groups ← n                              // n groups of one
make parent and size for n nodes
for each pair (a, b):
    if union(a, b):
        groups ← groups - 1             // two groups became one
    else:
        // a and b were already connected: this pair closes a cycle
same group?  →  find(a) = find(b)`,
    },
    {
      kind: 'callout',
      tone: 'trap',
      title: 'Compare roots, not parents',
      text: 'After the cables above, `parent[5]` is 4 and `parent[3]` is 0, yet 5 and 3 are in the same group. Always compare `find(a) === find(b)`, never `parent[a] === parent[b]`. Two more traps: if nodes are numbered from 1 (like `[1, 2]`), make the arrays size n + 1 so `parent[n]` exists. And only subtract from `groups` when `union` returns true.',
    },
  ],
  problems: [
    {
      id: 'advanced-graphs-number-of-provinces',
      title: 'Number of Provinces',
      difficulty: 'medium',
      leetcode: 547,
      pattern: 'Union-find (count groups)',
      statement:
        'A country has n cities. Some pairs of cities have a direct road. Cities that are linked directly, or through other cities, belong to the same **province**. You get an n × n grid `isConnected`: `isConnected[i][j]` is 1 if city i and city j have a direct road, else 0. The grid is symmetric and `isConnected[i][i]` is always 1. Return how many provinces there are.',
      examples: [
        {
          input: 'isConnected = [[1,1,0],[1,1,0],[0,0,1]]',
          output: '2',
          explain: 'Cities 0 and 1 share a road. City 2 is alone. Two provinces.',
        },
        {
          input: 'isConnected = [[1,0,0],[0,1,0],[0,0,1]]',
          output: '3',
          explain: 'No roads at all, so every city is its own province.',
        },
        {
          input: 'isConnected = [[1,1,0,0],[1,1,1,0],[0,1,1,1],[0,0,1,1]]',
          output: '1',
          explain: 'Roads 0-1, 1-2, 2-3 form a chain. City 0 reaches city 3 through 1 and 2.',
        },
      ],
      constraints: ['1 ≤ n ≤ 200', 'isConnected[i][j] is 0 or 1', 'isConnected[i][i] = 1', 'isConnected[i][j] = isConnected[j][i]'],
      hints: [
        'Start by assuming every city is its own province. How many is that?',
        'Each road can join two provinces into one. When does a road *not* lower the count?',
        'Union-find: start with `groups = n`. For every 1 at `[i][j]` with `j > i`, call `union(i, j)`. If it returns true, `groups--`.',
      ],
      approaches: [
        {
          name: 'DFS from every unvisited city',
          idea: 'Like counting islands in module 13: start a DFS from each city nobody has visited yet. Each start discovers one whole province, so count the starts. The grid row of a city lists its neighbours.',
          code: provincesDfs,
          time: 'O(n²)',
          space: 'O(n)',
        },
        {
          name: 'Union-find',
          idea: 'Begin with n groups. Walk the top half of the grid (the bottom half is the same roads again). Every road whose `union` succeeds merges two provinces, so the count goes down by one. A road inside one province returns false and changes nothing.',
          pseudo: `function findCircleNum(isConnected):
    n ← number of rows
    make parent and size for n nodes
    groups ← n
    for i from 0 to n - 1:
        for j from i + 1 to n - 1:
            if isConnected[i][j] = 1 and union(i, j):
                groups ← groups - 1
    return groups`,
          code: provincesCode,
          time: 'O(n²) (reading the grid; each union is almost O(1))',
          space: 'O(n)',
        },
      ],
      fn: 'findCircleNum',
      starter: `function findCircleNum(isConnected) {
  // return how many provinces (groups of linked cities) there are
  return 0;
}`,
      solution: provincesCode,
      tests: [
        { name: 'one city', args: [[[1]]], expected: 1 },
        { name: 'pair plus loner', args: [[[1, 1, 0], [1, 1, 0], [0, 0, 1]]], expected: 2 },
        { name: 'no roads', args: [[[1, 0, 0], [0, 1, 0], [0, 0, 1]]], expected: 3 },
        {
          name: 'everyone linked',
          args: [[[1, 1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 1]]],
          expected: 1,
        },
        {
          name: 'chain, ends not direct',
          args: [[[1, 1, 0, 0], [1, 1, 1, 0], [0, 1, 1, 1], [0, 0, 1, 1]]],
          expected: 1,
        },
        {
          name: 'two mixed groups',
          args: [
            [
              [1, 0, 0, 1, 0],
              [0, 1, 1, 0, 1],
              [0, 1, 1, 0, 0],
              [1, 0, 0, 1, 0],
              [0, 1, 0, 0, 1],
            ],
          ],
          expected: 2,
        },
        {
          name: 'four provinces',
          args: [
            [
              [1, 0, 0, 0, 0, 0],
              [0, 1, 0, 0, 0, 1],
              [0, 0, 1, 1, 0, 0],
              [0, 0, 1, 1, 0, 0],
              [0, 0, 0, 0, 1, 0],
              [0, 1, 0, 0, 0, 1],
            ],
          ],
          expected: 4,
        },
      ],
      takeaway: 'Groups = n minus the number of unions that returned true.',
    },
    {
      id: 'advanced-graphs-redundant-connection',
      title: 'Redundant Connection',
      difficulty: 'medium',
      leetcode: 684,
      pattern: 'Union-find (find the cycle edge)',
      statement:
        'A tree of n nodes (numbered 1 to n) had one extra cable added, so now it has n edges and exactly one loop. You get the edges as a list `edges`, where `edges[i] = [a, b]`. Return the edge you can remove so the rest is a tree again (connected, no loop). If several edges would work, return the one that appears **last** in the list.',
      examples: [
        {
          input: 'edges = [[1,2],[1,3],[2,3]]',
          output: '[2,3]',
          explain: 'The loop is 1-2-3. Any of its edges could go; [2,3] comes last.',
        },
        {
          input: 'edges = [[1,2],[2,3],[3,4],[1,4],[1,5]]',
          output: '[1,4]',
          explain: 'The loop is 1-2-3-4. [1,5] is not on it. Of the loop edges, [1,4] comes last.',
        },
      ],
      constraints: ['3 ≤ n ≤ 1000', 'edges.length = n', '1 ≤ a, b ≤ n and a ≠ b', 'no repeated edges; the graph is connected'],
      hints: [
        'Add the edges one by one. Which edge is the first one that is not needed?',
        'An edge is not needed if its two ends could already reach each other before you added it.',
        'Union-find: the first edge whose `union` returns false is the answer. Nodes start at 1, so size the arrays n + 1.',
      ],
      approaches: [
        {
          name: 'Remove each edge and test',
          idea: 'Try edges from last to first. Remove it, then run a DFS from node 1. If all n nodes are reached, the rest is a tree, so that edge is the answer. Going from the back gives "the last one" for free.',
          time: 'O(n²)',
          space: 'O(n)',
        },
        {
          name: 'Union-find, stop at the first failed union',
          idea: 'Add edges in order. While the edges so far have no loop, every `union` succeeds. The first `union` that returns false joins two nodes that were already connected: that edge closes the loop. There is only one loop, and this edge is the last of its edges in the list, which is exactly what the task asks for.',
          pseudo: `function findRedundantConnection(edges):
    make parent and size for nodes 0 to n   // n ← length of edges
    for each [a, b] in edges:
        if not union(a, b):
            return [a, b]                       // a and b were already connected
    return []`,
          code: redundantCode,
          time: 'O(n), almost (each union is almost O(1))',
          space: 'O(n)',
        },
      ],
      fn: 'findRedundantConnection',
      starter: `function findRedundantConnection(edges) {
  // return the edge [a, b] that closes the loop (the last such edge in the list)
  return [];
}`,
      solution: redundantCode,
      tests: [
        { name: 'triangle', args: [[[1, 2], [1, 3], [2, 3]]], expected: [2, 3] },
        { name: 'loop plus a tail', args: [[[1, 2], [2, 3], [3, 4], [1, 4], [1, 5]]], expected: [1, 4] },
        { name: 'loop closed backwards', args: [[[1, 2], [2, 3], [3, 1]]], expected: [3, 1] },
        { name: 'square, tail after', args: [[[1, 2], [2, 3], [3, 4], [4, 1], [4, 5]]], expected: [4, 1] },
        {
          name: 'loop edges spread out',
          args: [[[3, 4], [1, 2], [2, 4], [3, 5], [2, 5]]],
          expected: [2, 5],
        },
        {
          name: 'loop in the middle',
          args: [[[1, 4], [3, 4], [1, 3], [1, 2], [4, 5]]],
          expected: [1, 3],
        },
        { name: 'big node numbers first', args: [[[2, 1], [3, 1], [4, 2], [1, 4]]], expected: [1, 4] },
      ],
      takeaway: '`union` returns false = the two ends were already connected = this edge makes a cycle.',
    },
    {
      id: 'advanced-graphs-satisfiability-of-equations',
      title: 'Satisfiability of Equality Equations',
      difficulty: 'medium',
      leetcode: 990,
      pattern: 'Union-find (two passes)',
      statement:
        'You get a list of rules about single-letter variables. Each rule is 4 characters: `"a==b"` means a and b must be equal, `"a!=b"` means they must be different. Return true if you can give every letter a number so that **all** rules hold, otherwise false.',
      examples: [
        {
          input: 'equations = ["a==b","b!=a"]',
          output: 'false',
          explain: 'a must equal b and also differ from b. Impossible.',
        },
        {
          input: 'equations = ["a==b","b==c","a==c"]',
          output: 'true',
          explain: 'Give a, b and c the same number.',
        },
        {
          input: 'equations = ["a!=b","b==c","c==a"]',
          output: 'false',
          explain: 'b == c and c == a force a == b, which breaks the first rule. The "!=" came first, so check it only after all the "==" rules.',
        },
      ],
      constraints: ['1 ≤ equations.length ≤ 500', 'each rule is 4 characters', 'characters 0 and 3 are lowercase letters', 'characters 1-2 are "==" or "!="'],
      hints: [
        'Equal is contagious: if a == b and b == c, then a == c. That sounds like groups.',
        'Put all letters linked by "==" into one group. A "!=" rule breaks only if its two letters landed in the same group.',
        'Two passes. Pass 1: `union` every "==" pair. Pass 2: for every "!=" pair, if `find(x) === find(y)` return false.',
      ],
      approaches: [
        {
          name: 'DFS for every "!=" rule',
          idea: 'Build a graph with an edge for each "==" rule. For each "!=" rule, run a DFS from one letter and see if it reaches the other. If it does, they are forced equal, so the answer is false.',
          time: 'O(m²) for m rules',
          space: 'O(m)',
        },
        {
          name: 'Union-find over 26 letters',
          idea: 'Each letter is a node (a = 0, ..., z = 25). First join every "==" pair, so each group holds letters that must be equal. Then each "!=" pair must sit in two different groups. Doing all the joins first matters: a "!=" can be broken by a "==" that comes later in the list.',
          pseudo: `function equationsPossible(equations):
    make parent and size for 26 letters
    for each rule in equations:
        if rule[1] = '=':
            union(rule[0], rule[3])
    for each rule in equations:
        if rule[1] = '!' and find(rule[0]) = find(rule[3]):
            return false
    return true`,
          code: equationsCode,
          time: 'O(m), almost',
          space: 'O(1) (26 letters)',
        },
      ],
      fn: 'equationsPossible',
      starter: `function equationsPossible(equations) {
  // return true if every "==" and "!=" rule can hold at once
  return false;
}`,
      solution: equationsCode,
      tests: [
        { name: 'direct clash', args: [['a==b', 'b!=a']], expected: false },
        { name: 'same rule twice', args: [['b==a', 'a==b']], expected: true },
        { name: 'all equal', args: [['a==b', 'b==c', 'a==c']], expected: true },
        { name: 'clash through a chain', args: [['a==b', 'b!=c', 'c==a']], expected: false },
        { name: 'self equal, others differ', args: [['c==c', 'b==d', 'x!=z']], expected: true },
        { name: 'letter differs from itself', args: [['a!=a']], expected: false },
        { name: '"!=" comes first', args: [['a!=b', 'b==c', 'c==a']], expected: false },
        { name: 'two separate groups', args: [['a==b', 'c==d', 'a!=d']], expected: true },
        { name: 'long chain clash', args: [['a==b', 'b==c', 'c==d', 'd==e', 'e!=a']], expected: false },
      ],
      takeaway: 'Do all the unions first, then check the "must differ" rules.',
    },
    {
      id: 'advanced-graphs-accounts-merge',
      title: 'Accounts Merge',
      difficulty: 'medium',
      leetcode: 721,
      pattern: 'Union-find (merge by shared key)',
      statement:
        'A shop has a messy customer list. Each account is `[name, email1, email2, ...]`. Two accounts belong to the same person if they share **at least one** email (directly, or through a chain of accounts). Two people can have the same name and still be different people. Merge the accounts. Return one entry per person: `[name, ...emails]`, with that person\'s emails unique and sorted in plain string order (JavaScript `.sort()` with no comparator). The order of the people in the result does not matter.',
      examples: [
        {
          input:
            'accounts = [["John","johnsmith@mail.com","john_newyork@mail.com"],["John","johnsmith@mail.com","john00@mail.com"],["Mary","mary@mail.com"],["John","johnnybravo@mail.com"]]',
          output:
            '[["John","john00@mail.com","john_newyork@mail.com","johnsmith@mail.com"],["Mary","mary@mail.com"],["John","johnnybravo@mail.com"]]',
          explain:
            'The first two Johns share johnsmith@mail.com, so they are one person. The third John shares nothing, so he is someone else.',
        },
        {
          input: 'accounts = [["Lee","a@x.com","b@x.com"],["Lee","c@x.com","d@x.com"],["Lee","b@x.com","c@x.com"]]',
          output: '[["Lee","a@x.com","b@x.com","c@x.com","d@x.com"]]',
          explain: 'Accounts 1 and 2 share nothing, but account 3 shares an email with each, so all three are one person.',
        },
      ],
      constraints: [
        '1 ≤ accounts.length ≤ 1000',
        '2 ≤ accounts[i].length ≤ 10',
        'emails use lowercase letters, digits, "_", "@" and "."',
        'accounts of one person always share the same name',
      ],
      hints: [
        'Make each *account* a node. Which accounts should be joined?',
        'Keep a map from email to the first account that had it. When you see that email again in another account, join the two accounts.',
        'After all unions, group every email under `find(owner of that email)`. Each root is one person: name = that root account\'s name, then the emails sorted.',
      ],
      approaches: [
        {
          name: 'Merge pairs until nothing changes',
          idea: 'Look at every pair of accounts. If they share an email, pour one into the other and start over. Stop when a full pass merges nothing. It is correct, but each pass compares all pairs and there can be many passes.',
          time: 'O(n³ · k) for n accounts of k emails',
          space: 'O(n · k)',
        },
        {
          name: 'Email graph + DFS',
          idea: 'Link the first email of each account to its other emails. Emails of one person now form one connected group. A DFS from each unvisited email collects one person (module 13 style).',
          time: 'O(N log N) for N emails in total (the sorting)',
          space: 'O(N)',
        },
        {
          name: 'Union-find on accounts',
          idea: 'Accounts are the nodes. The map `owner` remembers which account first had each email. Seeing that email again means "same person", so `union` the two accounts. Afterwards every email belongs to `find(owner)`, and each root stands for one person. The name check is never needed: matching emails decide everything, so two different Johns stay apart.',
          pseudo: `function accountsMerge(accounts):
    make parent and size for n accounts
    owner ← empty map                       // email → first account with it
    for i from 0 to n - 1:
        for each email in accounts[i] after the name:
            if email in owner:
                union(i, owner[email])
            else:
                owner[email] ← i
    byRoot ← empty map                      // root account → its emails
    for each (email, i) in owner:
        append email to byRoot[find(i)]
    result ← empty list
    for each (r, emails) in byRoot:
        sort emails
        append [name of account r, ...emails] to result
    return result`,
          code: accountsCode,
          time: 'O(N log N) for N emails in total (the sorting; unions are almost O(1))',
          space: 'O(N)',
        },
      ],
      fn: 'accountsMerge',
      starter: `function accountsMerge(accounts) {
  // return one [name, ...sorted unique emails] per person
  return [];
}`,
      solution: accountsCode,
      compare: 'unordered',
      tests: [
        {
          name: 'two Johns merge, one stays',
          args: [
            [
              ['John', 'johnsmith@mail.com', 'john_newyork@mail.com'],
              ['John', 'johnsmith@mail.com', 'john00@mail.com'],
              ['Mary', 'mary@mail.com'],
              ['John', 'johnnybravo@mail.com'],
            ],
          ],
          expected: [
            ['John', 'john00@mail.com', 'john_newyork@mail.com', 'johnsmith@mail.com'],
            ['Mary', 'mary@mail.com'],
            ['John', 'johnnybravo@mail.com'],
          ],
        },
        { name: 'one account', args: [[['Ana', 'ana@x.com']]], expected: [['Ana', 'ana@x.com']] },
        {
          name: 'duplicate email in one account',
          args: [[['Ana', 'b@x.com', 'a@x.com', 'b@x.com']]],
          expected: [['Ana', 'a@x.com', 'b@x.com']],
        },
        {
          name: 'same name, different people',
          args: [[['Sam', 'sam@a.com'], ['Sam', 'sam@b.com']]],
          expected: [['Sam', 'sam@a.com'], ['Sam', 'sam@b.com']],
        },
        {
          name: 'joined through a middle account',
          args: [
            [
              ['Lee', 'a@x.com', 'b@x.com'],
              ['Lee', 'c@x.com', 'd@x.com'],
              ['Lee', 'b@x.com', 'c@x.com'],
            ],
          ],
          expected: [['Lee', 'a@x.com', 'b@x.com', 'c@x.com', 'd@x.com']],
        },
        {
          name: 'chain plus a stranger',
          args: [
            [
              ['Kim', 'k3@x.com'],
              ['Kim', 'k1@x.com', 'k2@x.com'],
              ['Kim', 'k2@x.com', 'k3@x.com'],
              ['Bo', 'bo@x.com'],
            ],
          ],
          expected: [
            ['Kim', 'k1@x.com', 'k2@x.com', 'k3@x.com'],
            ['Bo', 'bo@x.com'],
          ],
        },
        {
          name: 'string order: digit before "_"',
          args: [
            [
              ['Zed', 'z_1@q.com', 'z1@q.com'],
              ['Amy', 'amy@q.com'],
              ['Amy', 'amy2@q.com', 'amy@q.com'],
            ],
          ],
          expected: [
            ['Zed', 'z1@q.com', 'z_1@q.com'],
            ['Amy', 'amy2@q.com', 'amy@q.com'],
          ],
        },
      ],
      takeaway: 'When things merge because they share a key, map key → first owner and union on repeats.',
    },
  ],
  quiz: [
    {
      prompt: 'parent = [0, 0, 1, 3, 3]. Which nodes are roots, and how many groups are there?',
      options: ['Roots 0 and 3, so 2 groups', 'Roots 0, 1 and 3, so 3 groups', 'Every node is a root, so 5 groups', 'Root 0 only, so 1 group'],
      answer: 0,
      explanation: 'A root points at itself: `parent[0] = 0` and `parent[3] = 3`. Node 2 → 1 → 0 and node 4 → 3. Two roots, two groups.',
    },
    {
      prompt: 'You call `union(a, b)` and it returns false. What does that tell you?',
      options: [
        'a or b does not exist',
        'a and b were already in the same group, so the edge a-b closes a cycle',
        'The groups were the same size',
        'The union failed and must be retried',
      ],
      answer: 1,
      explanation: '`union` returns false exactly when `find(a) === find(b)`: they could already reach each other, so this edge adds a loop.',
    },
    {
      prompt: 'Why does `union` put the smaller group under the bigger one?',
      options: [
        'So the result array comes out sorted',
        'So the number of groups is counted right',
        'So trees stay short and `find` takes few steps',
        'It does not matter, it is just a style choice',
      ],
      answer: 2,
      explanation: 'Hanging the small tree under the big one makes only the few small-group nodes one step deeper. That keeps every `find` short.',
    },
    {
      prompt: 'You get a full graph once and only need the number of groups. Which is a fine choice?',
      options: ['Only union-find works', 'Only DFS works', 'Either DFS or union-find', 'Neither; you need Dijkstra'],
      answer: 2,
      explanation: 'Both count groups in about the same time. Union-find shines when edges arrive one at a time, or when you need "already connected?" while adding.',
    },
  ],
  takeaways: [
    'Union-find keeps groups as trees of parent pointers. The root names the group; same group means `find(a) === find(b)`.',
    'Union by size plus path compression make each operation almost constant: in practice ≤ 4-5 steps.',
    'Groups = n minus successful unions. A union that returns false means that edge closes a cycle.',
    'Pick union-find over DFS when edges arrive one at a time or you need "already connected?" checks while adding.',
  ],
};

export default lesson;
