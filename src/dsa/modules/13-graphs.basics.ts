import type { Lesson } from '../types';

const lesson: Lesson = {
  id: 'graph-basics',
  title: 'What a graph is and how to walk it',
  summary: 'Store a graph as an adjacency list, then walk it with DFS or BFS and a visited set.',
  minutes: 20,
  blocks: [
    {
      kind: 'callout',
      tone: 'story',
      title: 'The Wikipedia rabbit hole',
      text: "You open the Wikipedia page for *Pizza*. You click *Naples*, then *Mount Vesuvius*, then *Volcano*. Twenty minutes later you are reading about black holes. Can you get from *Pizza* to *Black hole* by clicking links only? Each page is a dot. Each link is an arrow between two dots. That picture is a **graph**, and your question is the most common graph question there is: **can I get from here to there?**",
    },
    {
      kind: 'list',
      items: [
        "A **node** (also called a *vertex*) is one thing: a page, a person, a room, a city.",
        "An **edge** is a connection between two nodes: a link, a friendship, a door, a road.",
        "**Undirected** edges go both ways, like Facebook friends. **Directed** edges go one way, like a Wikipedia link or following someone on X.",
        "The **neighbors** of a node are the nodes one edge away from it.",
        "A **path** is a chain of edges from one node to another. A **connected component** is a group of nodes that can all reach each other, like one friend circle.",
      ],
    },
    {
      kind: 'text',
      text: "**The problem.** You get `n = 6` people numbered 0 to 5 and a list of friendships: `edges = [[0,1],[0,2],[1,3],[2,3],[3,4]]`. Person 5 has no friends in the list. Can a message passed from friend to friend get from person 0 to person 4? From 0 to 5?",
    },
    {
      kind: 'diagram',
      title: 'The friendship graph',
      art: `  0 ----- 1
  |       |
  |       |
  2 ----- 3 ----- 4         5

edges = [[0,1],[0,2],[1,3],[2,3],[3,4]]`,
      caption: "0 reaches 4 through 1 → 3 → 4 (or 2 → 3 → 4). Nobody reaches 5.",
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Brute force: keep re-reading the edge list',
      code: `function canReach(n, edges, start, goal):
    reached ← set with start
    changed ← true
    while changed:                      // one "pass" per loop
        changed ← false
        for each [a, b] in edges:
            if a in reached and b not in reached:
                add b to reached; changed ← true
            if b in reached and a not in reached:
                add a to reached; changed ← true
    return goal in reached`,
    },
    {
      kind: 'text',
      text: "This works. Each pass grows the reached group by at least one person, so it stops after at most `n` passes. But every pass reads **all** `E` edges, so the cost is about `O(n · E)`. **The waste:** to answer \"who are 3's friends?\" we scan the whole list every time, even the edges on the other side of the world. We keep asking the same question and never write the answer down.",
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'Write the neighbors down once, then never revisit a node',
      text: "Turn the edge list into an **adjacency list**: an array where `adj[x]` is the list of x's neighbors. Building it reads each edge once. Then walk from the start, and keep a **visited set** (the nodes you already reached) so you never process a node twice. Every node is handled once and every edge is looked at twice (once from each end): `O(n + E)` total.",
    },
    {
      kind: 'diagram',
      title: 'Edge list → adjacency list',
      art: `edge list                 adjacency list
[0,1]                     adj[0] = [1, 2]
[0,2]        build        adj[1] = [0, 3]
[1,3]      ------->       adj[2] = [0, 3]
[2,3]   (add both ways)   adj[3] = [1, 2, 4]
[3,4]                     adj[4] = [3]
                          adj[5] = []`,
      caption: "Start from `n` empty lists, not from the edges, or person 5 (no edges) disappears.",
    },
    {
      kind: 'trace',
      title: 'DFS from 0 with a stack (mark visited when you push)',
      columns: ['step', 'pop', 'push (new neighbors)', 'stack after', 'visited'],
      rows: [
        [0, '-', '0', '[0]', '{0}'],
        [1, 0, '1, 2', '[1, 2]', '{0,1,2}'],
        [2, 2, '3  (0 is seen)', '[1, 3]', '{0,1,2,3}'],
        [3, 3, '4  (1, 2 seen)', '[1, 4]', '{0,1,2,3,4}'],
        [4, 4, '-  (3 seen)', '[1]', '{0,1,2,3,4}'],
        [5, 1, '-  (0, 3 seen)', '[]', '{0,1,2,3,4}'],
      ],
      note: "**DFS** (depth-first search) uses a stack, so it dives deep along one branch before backing up. 4 is in the visited set, 5 is not: 0 reaches 4 but not 5.",
    },
    {
      kind: 'trace',
      title: 'BFS from 0 with a queue',
      columns: ['step', 'take from front', 'add to back', 'queue after'],
      rows: [
        [0, '-', '0', '[0]'],
        [1, 0, '1, 2', '[1, 2]'],
        [2, 1, '3', '[2, 3]'],
        [3, 2, '-  (0, 3 seen)', '[3]'],
        [4, 3, '4', '[4]'],
        [5, 4, '-', '[]'],
      ],
      note: "**BFS** (breadth-first search) uses a queue, so it visits in rings: first 0, then everyone 1 edge away (1, 2), then 2 edges away (3), then 3 away (4). It is the level-order walk from module 10, plus a visited set because graphs can loop back.",
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Build the graph, then walk it',
      code: `function buildGraph(n, edges):
    adj ← list of n empty lists
    for each [a, b] in edges:
        append b to adj[a]
        append a to adj[b]              // undirected: both ways
    return adj

function walk(adj, start):              // DFS with a stack
    visited ← set with start
    stack ← [start]
    while stack is not empty:
        node ← pop from stack
        for each next in adj[node]:
            if next not in visited:
                add next to visited
                push next onto stack
    return visited

// Same walk, recursive:
function dfs(node):
    add node to visited
    for each next in adj[node]:
        if next not in visited:
            dfs(next)`,
    },
    {
      kind: 'code',
      lang: 'js',
      code: `function buildGraph(n, edges) {
  const adj = Array.from({ length: n }, () => []);
  for (const [a, b] of edges) {
    adj[a].push(b);
    adj[b].push(a);
  }
  return adj;
}

function reachable(adj, start) {
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
}

// BFS: same idea, but read from the front with a head index.
// queue.shift() is O(n) in JS, so avoid it in a loop.
function bfsOrder(adj, start) {
  const seen = new Set([start]);
  const queue = [start];
  for (let head = 0; head < queue.length; head++) {
    for (const next of adj[queue[head]]) {
      if (!seen.has(next)) {
        seen.add(next);
        queue.push(next);
      }
    }
  }
  return queue; // the order BFS reached the nodes
}`,
    },
    {
      kind: 'table',
      title: 'Three ways to store a graph',
      head: ['Storage', 'Neighbors of x', 'Space', 'Use it when'],
      rows: [
        ['Edge list `[[a,b], ...]`', 'scan all edges: `O(E)`', '`O(E)`', 'it is the input format; convert it'],
        ['Adjacency list `adj[x]`', 'read `adj[x]`: fast', '`O(n + E)`', 'almost always (default)'],
        ['Matrix `m[a][b] = 1`', 'scan a row: `O(n)`', '`O(n²)`', 'small dense graphs, "is a-b an edge?"'],
      ],
    },
    {
      kind: 'compare',
      title: 'Can 0 reach 4?',
      rows: [
        { approach: 'Re-scan the edge list until nothing changes', time: 'O(n · E)', space: 'O(n)', note: 'Works, but re-reads every edge on every pass.' },
        { approach: 'Adjacency list + DFS (stack or recursion)', time: 'O(n + E)', space: 'O(n + E)', note: 'Each node once, each edge twice.' },
        { approach: 'Adjacency list + BFS (queue)', time: 'O(n + E)', space: 'O(n + E)', note: 'Same cost. Pick BFS when you also need the fewest steps (lesson 3).' },
      ],
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Pattern: visit every node, count the groups',
      code: `adj ← buildGraph(n, edges)
visited ← empty set
groups ← 0
for node from 0 to n - 1:
    if node not in visited:
        groups ← groups + 1             // a new component starts here
        walk from node, adding everything reached to visited
return groups`,
    },
    {
      kind: 'callout',
      tone: 'trap',
      title: 'The three graph bugs everyone writes once',
      text: "1) **No visited set.** In a graph, 0 → 1 → 0 → 1 … loops forever. Trees never loop back, graphs do. 2) **Undirected edge added one way only.** `[3,4]` must go in `adj[3]` and `adj[4]`. 3) **Building `adj` from the edges instead of from `n`.** A node with no edges (person 5) still exists and still counts as its own group.",
    },
  ],
  problems: [
    {
      id: 'graphs-path-exists',
      title: 'Is there a path?',
      difficulty: 'easy',
      leetcode: 1971,
      pattern: 'Graph DFS / BFS',
      statement:
        "A town has `n` houses numbered `0` to `n - 1` and some two-way roads, given as `edges` where `[a, b]` is a road between house a and house b. Return `true` if you can drive from house `source` to house `destination` using the roads, otherwise `false`. A house can always reach itself.",
      examples: [
        { input: 'n = 3, edges = [[0,1],[1,2],[2,0]], source = 0, destination = 2', output: 'true', explain: 'There is a direct road 2-0.' },
        { input: 'n = 6, edges = [[0,1],[0,2],[3,5],[5,4],[4,3]], source = 0, destination = 5', output: 'false', explain: '{0,1,2} and {3,4,5} are two separate groups.' },
      ],
      constraints: ['1 ≤ n ≤ 2 · 10⁵', '0 ≤ edges.length ≤ 2 · 10⁵', 'no duplicate roads, no road from a house to itself'],
      hints: [
        "First turn the edge list into an adjacency list so you can find a house's neighbors fast.",
        "Roads are two-way: add each edge in both directions.",
        "Walk from `source` with a stack or queue and a visited set. Return `true` the moment you reach `destination`.",
      ],
      approaches: [
        {
          name: 'Re-scan the edges until nothing changes',
          idea: "Keep a set of reached houses. Sweep all edges again and again, adding the far end of any edge that touches the set. Stop when a full sweep adds nobody. Correct, but each sweep re-reads every edge.",
          time: 'O(n · E)',
          space: 'O(n)',
        },
        {
          name: 'Adjacency list + DFS',
          idea: "Write down each house's neighbors once. Then walk from `source`, marking houses as visited so each is handled once. If `destination` ever gets marked, a path exists.",
          pseudo: `function validPath(n, edges, source, destination):
    adj ← list of n empty lists
    for each [a, b] in edges:
        append b to adj[a]; append a to adj[b]
    visited ← set with source
    stack ← [source]
    while stack is not empty:
        node ← pop from stack
        if node = destination: return true
        for each next in adj[node]:
            if next not in visited:
                add next to visited
                push next onto stack
    return false`,
          code: `function validPath(n, edges, source, destination) {
  const adj = Array.from({ length: n }, () => []);
  for (const [a, b] of edges) {
    adj[a].push(b);
    adj[b].push(a);
  }
  const seen = new Set([source]);
  const stack = [source];
  while (stack.length) {
    const node = stack.pop();
    if (node === destination) return true;
    for (const next of adj[node]) {
      if (!seen.has(next)) {
        seen.add(next);
        stack.push(next);
      }
    }
  }
  return false;
}`,
          time: 'O(n + E)',
          space: 'O(n + E)',
        },
      ],
      fn: 'validPath',
      starter: `function validPath(n, edges, source, destination) {
  // build an adjacency list, then walk from source
  return false;
}`,
      solution: `function validPath(n, edges, source, destination) {
  const adj = Array.from({ length: n }, () => []);
  for (const [a, b] of edges) {
    adj[a].push(b);
    adj[b].push(a);
  }
  const seen = new Set([source]);
  const stack = [source];
  while (stack.length) {
    const node = stack.pop();
    if (node === destination) return true;
    for (const next of adj[node]) {
      if (!seen.has(next)) {
        seen.add(next);
        stack.push(next);
      }
    }
  }
  return false;
}`,
      tests: [
        { name: 'triangle', args: [3, [[0, 1], [1, 2], [2, 0]], 0, 2], expected: true },
        { name: 'two separate groups', args: [6, [[0, 1], [0, 2], [3, 5], [5, 4], [4, 3]], 0, 5], expected: false },
        { name: 'source is destination', args: [1, [], 0, 0], expected: true },
        { name: 'no roads at all', args: [2, [], 0, 1], expected: false },
        { name: 'long chain', args: [5, [[0, 1], [1, 2], [2, 3], [3, 4]], 0, 4], expected: true },
        { name: 'edges written backwards still count', args: [3, [[1, 0], [2, 1]], 0, 2], expected: true },
      ],
      takeaway: 'Edge list in, adjacency list out, then walk with a visited set.',
    },
    {
      id: 'graphs-keys-and-rooms',
      title: 'Keys and rooms',
      difficulty: 'medium',
      leetcode: 841,
      pattern: 'Graph DFS / BFS',
      statement:
        "You are in an escape room with `n` locked rooms numbered `0` to `n - 1`. Only room `0` is open. Inside each room you find some keys: `rooms[i]` lists the room numbers whose keys are in room `i`. A key opens its room for good. Return `true` if you can get into **every** room, otherwise `false`.",
      examples: [
        { input: 'rooms = [[1],[2],[3],[]]', output: 'true', explain: '0 gives key 1, room 1 gives key 2, room 2 gives key 3.' },
        { input: 'rooms = [[1,3],[3,0,1],[2],[0]]', output: 'false', explain: 'The only key to room 2 is inside room 2.' },
      ],
      constraints: ['1 ≤ n ≤ 1000', 'total keys ≤ 3000'],
      hints: [
        "`rooms` is already an adjacency list. Room i has a one-way edge to each room whose key it holds.",
        "Start at room 0 and walk. Opening a room = visiting a node.",
        "At the end, compare how many rooms you visited with `n`.",
      ],
      approaches: [
        {
          name: 'Sweep until nothing new opens',
          idea: "Keep a set of open rooms. Loop over every open room and add all its keys. Repeat until a full sweep opens nothing. Correct, but each sweep re-reads rooms you already emptied.",
          time: 'O(n · K) for K keys',
          space: 'O(n)',
        },
        {
          name: 'DFS from room 0',
          idea: "Each room is a node; each key is a directed edge. Walk from room 0 with a stack and a visited set. Every room is opened once and every key is read once. If the visited count is `n`, every room is reachable.",
          pseudo: `function canVisitAllRooms(rooms):
    visited ← set with 0
    stack ← [0]
    while stack is not empty:
        room ← pop from stack
        for each key in rooms[room]:
            if key not in visited:
                add key to visited
                push key onto stack
    return size of visited = length of rooms`,
          code: `function canVisitAllRooms(rooms) {
  const seen = new Set([0]);
  const stack = [0];
  while (stack.length) {
    const room = stack.pop();
    for (const key of rooms[room]) {
      if (!seen.has(key)) {
        seen.add(key);
        stack.push(key);
      }
    }
  }
  return seen.size === rooms.length;
}`,
          time: 'O(n + K)',
          space: 'O(n)',
        },
      ],
      fn: 'canVisitAllRooms',
      starter: `function canVisitAllRooms(rooms) {
  // rooms[i] = the keys inside room i
  return false;
}`,
      solution: `function canVisitAllRooms(rooms) {
  const seen = new Set([0]);
  const stack = [0];
  while (stack.length) {
    const room = stack.pop();
    for (const key of rooms[room]) {
      if (!seen.has(key)) {
        seen.add(key);
        stack.push(key);
      }
    }
  }
  return seen.size === rooms.length;
}`,
      tests: [
        { name: 'chain of keys', args: [[[1], [2], [3], []]], expected: true },
        { name: 'key locked inside its own room', args: [[[1, 3], [3, 0, 1], [2], [0]]], expected: false },
        { name: 'only one room', args: [[[]]], expected: true },
        { name: 'room 0 is empty', args: [[[], [0]]], expected: false },
        { name: 'keys point back and forth', args: [[[1], [0]]], expected: true },
        { name: 'room holds its own key', args: [[[0, 1], [1]]], expected: true },
        { name: 'keys in a strange order', args: [[[2], [], [1]]], expected: true },
      ],
      takeaway: 'Sometimes the input already is the adjacency list. Recognize it and just walk.',
    },
    {
      id: 'graphs-count-components',
      title: 'Count the friend groups',
      difficulty: 'medium',
      leetcode: 323,
      pattern: 'Connected components',
      statement:
        "A school has `n` students numbered `0` to `n - 1`. `edges` lists pairs of students who are friends (friendship goes both ways). A friend group is a set of students who are all linked through chains of friends. Return how many friend groups there are. A student with no friends is a group of one.",
      examples: [
        { input: 'n = 5, edges = [[0,1],[1,2],[3,4]]', output: '2', explain: 'Groups {0,1,2} and {3,4}.' },
        { input: 'n = 4, edges = []', output: '4', explain: 'Everyone is alone.' },
      ],
      constraints: ['1 ≤ n ≤ 2000', '0 ≤ edges.length ≤ 5000'],
      hints: [
        "One walk from a student marks their whole group as visited.",
        "Loop over all students. When you meet one who is not visited yet, that is a brand-new group.",
        "Count how many times you start a new walk.",
      ],
      approaches: [
        {
          name: 'Label from scratch for every student',
          idea: "For each student, run a fresh walk to find their whole group, then check whether that group was already counted (for example by its smallest member). Correct, but each group gets walked once per member.",
          time: 'O(n · (n + E))',
          space: 'O(n + E)',
        },
        {
          name: 'One shared visited set',
          idea: "Keep a single visited set across all walks. A walk from an unvisited student marks their whole group, so the next unvisited student must belong to a new group. Each student is visited once overall. (Module 14 shows another tool for this, union-find.)",
          pseudo: `function countComponents(n, edges):
    adj ← buildGraph(n, edges)          // both directions
    visited ← empty set
    groups ← 0
    for s from 0 to n - 1:
        if s in visited: continue
        groups ← groups + 1
        add s to visited
        stack ← [s]
        while stack is not empty:
            node ← pop from stack
            for each next in adj[node]:
                if next not in visited:
                    add next to visited
                    push next onto stack
    return groups`,
          code: `function countComponents(n, edges) {
  const adj = Array.from({ length: n }, () => []);
  for (const [a, b] of edges) {
    adj[a].push(b);
    adj[b].push(a);
  }
  const seen = new Array(n).fill(false);
  let groups = 0;
  for (let s = 0; s < n; s++) {
    if (seen[s]) continue;
    groups++;
    seen[s] = true;
    const stack = [s];
    while (stack.length) {
      const node = stack.pop();
      for (const next of adj[node]) {
        if (!seen[next]) {
          seen[next] = true;
          stack.push(next);
        }
      }
    }
  }
  return groups;
}`,
          time: 'O(n + E)',
          space: 'O(n + E)',
        },
      ],
      fn: 'countComponents',
      starter: `function countComponents(n, edges) {
  // count how many separate groups there are
  return 0;
}`,
      solution: `function countComponents(n, edges) {
  const adj = Array.from({ length: n }, () => []);
  for (const [a, b] of edges) {
    adj[a].push(b);
    adj[b].push(a);
  }
  const seen = new Array(n).fill(false);
  let groups = 0;
  for (let s = 0; s < n; s++) {
    if (seen[s]) continue;
    groups++;
    seen[s] = true;
    const stack = [s];
    while (stack.length) {
      const node = stack.pop();
      for (const next of adj[node]) {
        if (!seen[next]) {
          seen[next] = true;
          stack.push(next);
        }
      }
    }
  }
  return groups;
}`,
      tests: [
        { name: 'two groups', args: [5, [[0, 1], [1, 2], [3, 4]]], expected: 2 },
        { name: 'one long chain', args: [5, [[0, 1], [1, 2], [2, 3], [3, 4]]], expected: 1 },
        { name: 'one student', args: [1, []], expected: 1 },
        { name: 'no friendships', args: [4, []], expected: 4 },
        { name: 'same friendship listed twice', args: [6, [[0, 1], [2, 3], [4, 5], [1, 0]]], expected: 3 },
        { name: 'a loop of friends', args: [3, [[0, 1], [1, 2], [2, 0]]], expected: 1 },
        { name: 'lonely students in the middle', args: [5, [[0, 4]]], expected: 4 },
      ],
      takeaway: 'Number of groups = number of times you start a walk from an unvisited node.',
    },
    {
      id: 'graphs-reorder-routes',
      title: 'Point every road to the capital',
      difficulty: 'medium',
      leetcode: 1466,
      pattern: 'Graph DFS with edge direction',
      statement:
        "A country has `n` cities numbered `0` to `n - 1` and exactly `n - 1` one-way roads, so there is exactly one way to travel between any two cities if you ignore direction. `connections[i] = [a, b]` is a road from a to b. A big festival is in city `0`, and everyone must be able to drive there. Return the **fewest roads you must flip** (reverse their direction) so every city can reach city 0.",
      examples: [
        { input: 'n = 6, connections = [[0,1],[1,3],[2,3],[4,0],[4,5]]', output: '3', explain: 'Flip 0→1, 1→3 and 4→5.' },
        { input: 'n = 3, connections = [[1,0],[2,0]]', output: '0', explain: 'Both roads already lead to 0.' },
      ],
      constraints: ['2 ≤ n ≤ 5 · 10⁴', 'the roads form a tree if you ignore direction'],
      hints: [
        "Ignore direction for a moment: walk the road map outward from city 0.",
        "As you walk away from 0 along a road, ask: does this road point away from 0? Then it must be flipped.",
        "Store each road twice: `a → b` with cost 1 (it points away when you walk it forward) and `b → a` with cost 0. Walk from 0 and add up the costs.",
      ],
      approaches: [
        {
          name: 'Check every road separately',
          idea: "For each road `a → b`, search from 0 (ignoring direction) to see whether a or b is closer to 0. If a is closer, the road points away and must be flipped. Correct, but one search per road.",
          time: 'O(n²)',
          space: 'O(n)',
        },
        {
          name: 'One walk from 0 with a cost on each edge',
          idea: "Add every road both ways: the real direction gets cost 1, the reverse gets cost 0. Walking out from 0, every road is crossed exactly once. If you crossed it in its real direction, it points away from 0, so it needs flipping. Sum the costs.",
          pseudo: `function minReorder(n, connections):
    adj ← list of n empty lists
    for each [a, b] in connections:
        append (b, 1) to adj[a]         // real road: away from a
        append (a, 0) to adj[b]         // fake reverse edge
    visited ← set with 0
    stack ← [0]
    flips ← 0
    while stack is not empty:
        city ← pop from stack
        for each (next, cost) in adj[city]:
            if next not in visited:
                add next to visited
                flips ← flips + cost
                push next onto stack
    return flips`,
          code: `function minReorder(n, connections) {
  const adj = Array.from({ length: n }, () => []);
  for (const [a, b] of connections) {
    adj[a].push([b, 1]);
    adj[b].push([a, 0]);
  }
  const seen = new Array(n).fill(false);
  seen[0] = true;
  const stack = [0];
  let flips = 0;
  while (stack.length) {
    const city = stack.pop();
    for (const [next, cost] of adj[city]) {
      if (!seen[next]) {
        seen[next] = true;
        flips += cost;
        stack.push(next);
      }
    }
  }
  return flips;
}`,
          time: 'O(n)',
          space: 'O(n)',
        },
      ],
      fn: 'minReorder',
      starter: `function minReorder(n, connections) {
  // count roads that point away from city 0
  return 0;
}`,
      solution: `function minReorder(n, connections) {
  const adj = Array.from({ length: n }, () => []);
  for (const [a, b] of connections) {
    adj[a].push([b, 1]);
    adj[b].push([a, 0]);
  }
  const seen = new Array(n).fill(false);
  seen[0] = true;
  const stack = [0];
  let flips = 0;
  while (stack.length) {
    const city = stack.pop();
    for (const [next, cost] of adj[city]) {
      if (!seen[next]) {
        seen[next] = true;
        flips += cost;
        stack.push(next);
      }
    }
  }
  return flips;
}`,
      tests: [
        { name: 'mixed directions', args: [6, [[0, 1], [1, 3], [2, 3], [4, 0], [4, 5]]], expected: 3 },
        { name: 'two flips needed', args: [5, [[1, 0], [1, 2], [3, 2], [3, 4]]], expected: 2 },
        { name: 'already fine', args: [3, [[1, 0], [2, 0]]], expected: 0 },
        { name: 'one road, wrong way', args: [2, [[0, 1]]], expected: 1 },
        { name: 'chain pointing away', args: [4, [[0, 1], [1, 2], [2, 3]]], expected: 3 },
        { name: 'chain pointing home', args: [4, [[1, 0], [2, 1], [3, 2]]], expected: 0 },
      ],
      takeaway: 'Need to know edge direction while walking both ways? Store both ways with a flag.',
    },
  ],
  quiz: [
    {
      prompt: "You run DFS on a graph with **no** visited set. The graph has the edges 0-1 and 1-2. What happens?",
      options: ['It visits 0, 1, 2 and stops', 'It loops forever between 0 and 1', 'It skips node 2', 'It crashes immediately'],
      answer: 1,
      explanation: "0 pushes 1, 1 pushes 0 back (it is a neighbor), 0 pushes 1 again… Undirected edges always lead back. The visited set is what stops the loop.",
    },
    {
      prompt: "What does `adj[3]` hold for `edges = [[0,1],[0,2],[1,3],[2,3],[3,4]]` (undirected)?",
      options: ['`[4]`', '`[1, 2]`', '`[1, 2, 4]`', '`[0, 1, 2, 4]`'],
      answer: 2,
      explanation: "3 appears in [1,3], [2,3] and [3,4], so its neighbors are 1, 2 and 4.",
    },
    {
      prompt: "A graph has `n` nodes and `E` edges stored as an adjacency list. How long does one full DFS take?",
      options: ['`O(n)`', '`O(E)`', '`O(n + E)`', '`O(n · E)`'],
      answer: 2,
      explanation: "Each node is popped once (`n`) and each adjacency entry is read once (`2E` for undirected). Together `O(n + E)`.",
    },
    {
      prompt: "Which needs a different data structure than the other two?",
      options: ['Recursive DFS', 'DFS with an explicit stack', 'BFS'],
      answer: 2,
      explanation: "Recursion uses the call stack, so both DFS versions are stack-based. BFS needs a queue.",
    },
  ],
  takeaways: [
    "Convert the edge list to an adjacency list first: `adj = Array.from({ length: n }, () => [])`, add undirected edges both ways.",
    "Every graph walk needs a visited set. Mark a node when you push it, so it is never added twice.",
    "DFS = stack (or recursion), BFS = queue. Both cost `O(n + E)`.",
    "Count groups by counting how many times you start a walk from an unvisited node.",
  ],
};

export default lesson;
