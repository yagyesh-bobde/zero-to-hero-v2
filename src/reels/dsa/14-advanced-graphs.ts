import type { DiagramEdge, DiagramNode, GridScene, Series } from '../types';

// /dsa/reels module 14. One reel per lesson of src/dsa/modules/14-advanced-graphs*.ts, in lesson order.
// Brief: src/reels/dsa/README.md. Rules: src/reels/AUTHORING.md.

type Spots = Record<string, [number, number]>;

/** Circle nodes at fixed spots; `good` ids glow green-ish, `off` ids fade, `now` pulses. */
function circles(spots: Spots, opts: { now?: string; good?: string[]; off?: string[] } = {}): DiagramNode[] {
  return Object.entries(spots).map(([id, [x, y]]): DiagramNode => ({
    id, label: id, x, y, shape: 'circle',
    ...(opts.now === id ? { active: true } : {}),
    ...(opts.good?.includes(id) ? { tone: 'good' } : {}),
    ...(opts.off?.includes(id) ? { dim: true } : {}),
  }));
}

// ---- Lesson 1: six computers, cables 0-1, 2-3, 1-3, 4-5, 3-0, 5-3 ----

const pcSpots: Spots = { '0': [0, 0], '1': [2, 0], '2': [0, 1], '3': [2, 1], '4': [0, 2], '5': [2, 2] };
const ufTitle = 'parent[i], cable by cable';
const ufCaption = 'each cell holds its parent';

// ---- Lesson 2: one-way roads 0→1 (5), 0→2 (1), 2→1 (2), 1→3 (1), 2→3 (5), 3→4 (3) ----

const roadSpots: Spots = { '0': [1, 0], '2': [0, 1], '1': [2, 1], '3': [1, 2], '4': [1, 3] };
const roads: [string, string, number][] = [['0', '1', 5], ['0', '2', 1], ['2', '1', 2], ['1', '3', 1], ['2', '3', 5], ['3', '4', 3]];

/** `cost` per node: a number is "best so far", `[n]` is final, null is unreached. */
function dijkstra(cost: Record<string, number | [number] | null>, now?: string, hot: string[] = []): { nodes: DiagramNode[]; edges: DiagramEdge[] } {
  const nodes = Object.entries(roadSpots).map(([id, [x, y]]): DiagramNode => {
    const c = cost[id];
    const final = Array.isArray(c);
    return {
      id, label: `Node ${id}`, x, y,
      sub: c === null ? 'best ∞' : final ? `final ${c[0]}` : `best ${c}`,
      ...(final ? { tone: 'good' } : {}),
      ...(c === null ? { dim: true } : {}),
      ...(now === id ? { active: true } : {}),
    };
  });
  const edges = roads.map(([from, to, w]): DiagramEdge => ({
    from, to, label: String(w),
    ...(hot.includes(`${from}${to}`) ? { active: true } : {}),
  }));
  return { nodes, edges };
}

// ---- Lesson 3: two-way roads 0–1 (2), 0–2 (3), 1–3 (3), 2–3 (2), 3–4 (1), plus a direct 0–4 (7) ----

const waysTitle = 'Dijkstra with a ways row';
function ways(dist: (number | string)[], count: number[], rest: Partial<GridScene>): GridScene {
  return {
    type: 'grid', title: waysTitle,
    rowLabels: ['dist', 'ways'], colLabels: ['0', '1', '2', '3', '4'],
    cells: [dist, count], caption: 'shorter: replace · tie: add', ...rest,
  };
}

// ---- Lesson 4: flights 0→1 (100), 1→2 (100), 2→3 (100), 0→2 (250), 0→3 (500), k = 1 ----

const bfTitle = 'Two rounds, k = 1 stop';
const INF = '∞';
function rounds(prev: (number | string)[], next: (number | string)[], rest: Partial<GridScene>): GridScene {
  return {
    type: 'grid', title: bfTitle,
    rowLabels: ['prev', 'next'], colLabels: ['0', '1', '2', '3'],
    cells: [prev, next], caption: 'read prev, write next', ...rest,
  };
}

// ---- Lesson 5: five towns, seven cables ----

const townSpots: Spots = { '0': [1, 0], '2': [0, 1], '1': [2, 1], '4': [0, 3], '3': [2, 3] };
const cables: [string, string, number][] = [['0', '2', 1], ['1', '2', 2], ['3', '4', 3], ['0', '1', 4], ['1', '3', 5], ['2', '3', 8], ['2', '4', 9]];

/** Kruskal state: `taken` cable keys, the `now` cable, `skip` = cables rejected as loops. */
function kruskal(taken: string[], now?: string, skip: string[] = []): DiagramEdge[] {
  return cables.map(([from, to, w]): DiagramEdge => {
    const key = `${from}${to}`;
    return {
      from, to, label: String(w), both: true,
      ...(taken.includes(key) ? { tone: 'good' } : {}),
      ...(skip.includes(key) ? { tone: 'bad', dashed: true } : {}),
      ...(now === key ? { active: true } : {}),
    };
  });
}

export const series: Series = {
  id: 'dsa-advanced-graphs',
  title: 'Union-find, Dijkstra & MST',
  emoji: '🛰️',
  color: '#fb923c',
  order: 14,
  blurb: 'Connected groups, weighted shortest paths and cheapest networks.',
  reels: [
    // ------------------------------------------------------------------ Lesson 1
    {
      id: 'dsa-advanced-graphs-union-find',
      title: 'Union-find: who is in the same group?',
      link: { label: 'Solve it', href: '/dsa#/m/advanced-graphs/union-find/advanced-graphs-number-of-provinces' },
      beats: [
        {
          say: 'Cables arrive one at a time. Can these two computers talk yet?',
          emphasis: ['talk'],
          scene: { type: 'title', kicker: 'Graphs II · Lesson 1', title: 'Can *3* talk to *5* yet?', emoji: '🔌', style: 'slam' },
        },
        {
          say: 'Six computers, and cables arrive one by one. After each one: how many groups, and was the cable useless?',
          emphasis: ['groups', 'useless'],
          sfx: 'pop',
          scene: {
            type: 'diagram', title: 'Six computers', cols: 3, rows: 3,
            nodes: circles(pcSpots, { now: '3', good: ['0'] }),
            edges: [
              { from: '0', to: '1', both: true }, { from: '2', to: '3', both: true },
              { from: '1', to: '3', both: true }, { from: '4', to: '5', both: true },
              { from: '3', to: '0', both: true, dashed: true, tone: 'bad' },
            ],
            caption: 'cable 3-0 is useless: they already talk',
          },
        },
        {
          say: 'The easy way gives everyone a group label. But every join renames the whole group, one by one.',
          emphasis: ['renames', 'whole'],
          sfx: 'type',
          scene: {
            type: 'code', lang: 'pseudo', file: 'Brute force',
            code: `label[i] ← i for every node
function same(a, b):
    return label[a] = label[b]
function union(a, b):
    old ← label[b]; new ← label[a]
    if old = new: return false
    for i from 0 to n - 1:
        if label[i] = old:
            label[i] ← new
    return true`,
            highlight: [[7, 9]],
            note: { line: 9, text: 'renames everyone: O(n)', tone: 'warn' },
          },
        },
        {
          say: 'A million cables on a million computers is about a trillion steps.',
          emphasis: ['trillion'],
          sfx: 'error',
          scene: { type: 'stat', value: '1T', label: 'steps for *a million* cables', sub: 'O(n) per join: renames a whole group', tone: 'bad' },
        },
        {
          say: 'So make each group a tree. Everyone points up to a boss, and a join is one write.',
          emphasis: ['boss', 'one'],
          sfx: 'ding',
          scene: { type: 'title', kicker: 'The insight', title: 'Point at a *boss*, not a label', emoji: '💡', style: 'slam' },
        },
        {
          say: 'Everyone starts as their own boss. Cables zero one and two three make one and three point up.',
          emphasis: ['boss', 'point'],
          scene: {
            type: 'array', title: ufTitle, cells: [0, 0, 2, 2, 4, 5],
            pointers: { a: 2, b: 3 }, active: [1, 3],
            vars: { cable: '2-3', groups: 4, useless: 'no' }, caption: ufCaption,
          },
        },
        {
          say: 'Cable one three. Their bosses are zero and two, so two points at zero. Three groups.',
          emphasis: ['bosses', 'zero'],
          scene: {
            type: 'array', title: ufTitle, cells: [0, 0, 0, 2, 4, 5],
            pointers: { a: 1, b: 3 }, active: [2], reads: [0],
            vars: { cable: '1-3', groups: 3, useless: 'no' }, caption: ufCaption,
          },
        },
        {
          say: 'Cable four five. Five points at four, and two groups are left.',
          emphasis: ['two'],
          scene: {
            type: 'array', title: ufTitle, cells: [0, 0, 0, 2, 4, 4],
            pointers: { a: 4, b: 5 }, active: [5],
            vars: { cable: '4-5', groups: 2, useless: 'no' }, caption: ufCaption,
          },
        },
        {
          say: 'Cable three zero. Both bosses are zero, so it is useless. On the way up, three now points straight at zero.',
          emphasis: ['useless', 'straight'],
          sfx: 'error',
          scene: {
            type: 'array', title: ufTitle, cells: [0, 0, 0, 0, 4, 4],
            pointers: { a: 3, b: 0 }, active: [3],
            vars: { cable: '3-0', groups: 2, useless: 'yes' }, caption: ufCaption,
          },
        },
        {
          say: 'Cable five three. The small group joins the big one, so four points at zero. One group.',
          emphasis: ['small', 'big'],
          sfx: 'success',
          scene: {
            type: 'array', title: ufTitle, cells: [0, 0, 0, 0, 0, 4],
            pointers: { a: 5, b: 3 }, active: [4], found: [0],
            vars: { cable: '5-3', groups: 1, useless: 'no' }, caption: ufCaption,
          },
        },
        {
          say: 'In JavaScript, find walks up and shortens the path. Union points one boss at the other. Both are almost one step.',
          emphasis: ['find', 'union'],
          sfx: 'type',
          scene: {
            type: 'code', lang: 'js', file: 'unionFind.js',
            code: `function find(x) {
  while (parent[x] !== x)
    x = parent[x] = parent[parent[x]];
  return x;
}
function union(a, b) {
  let ra = find(a), rb = find(b);
  if (ra === rb) return false;
  if (size[ra] < size[rb])
    [ra, rb] = [rb, ra];
  parent[rb] = ra;
  size[ra] += size[rb];
  return true;
}`,
            highlight: [3, 11],
            note: { line: 11, text: 'one write joins two groups', tone: 'good' },
          },
        },
        {
          say: 'Reach for this when things merge into groups, and pairs keep arriving one at a time.',
          emphasis: ['groups', 'arriving'],
          scene: {
            type: 'list', title: 'Reach for this when…',
            items: [
              { text: 'Things merge into *groups*', icon: '🧩' },
              { text: 'Pairs keep *arriving*', icon: '📬' },
              { text: 'Find the edge that makes a loop', icon: '🔁' },
            ],
            active: 1,
          },
        },
        {
          say: 'The trap is comparing parents. Five and three have different parents, but the same boss. Compare roots.',
          emphasis: ['parents', 'roots'],
          sfx: 'error',
          scene: {
            type: 'code', lang: 'js', file: 'trap.js',
            code: `// parent = [0, 0, 0, 0, 0, 4]
parent[5] === parent[3]; // false
find(5) === find(3);     // true`,
            errors: [2],
            added: [3],
            note: { line: 2, text: 'same group, different parents', tone: 'bad' },
          },
        },
        {
          say: 'Quick check. The parent array is zero, zero, one, three, three. How many groups?',
          sfx: 'riser',
          scene: {
            type: 'quiz',
            question: 'parent = [0, 0, 1, 3, 3]. How many groups are there?',
            options: ['Roots 0 and 3: 2 groups', 'Roots 0, 1, 3: 3 groups', 'Every node: 5 groups', 'Only 0: 1 group'],
            answer: 0,
          },
        },
        {
          say: 'Two groups. A root points at itself, and only zero and three do.',
          emphasis: ['root', 'itself'],
          sfx: 'ding',
          scene: {
            type: 'quiz',
            question: 'parent = [0, 0, 1, 3, 3]. How many groups are there?',
            options: ['Roots 0 and 3: 2 groups', 'Roots 0, 1, 3: 3 groups', 'Every node: 5 groups', 'Only 0: 1 group'],
            answer: 0,
            reveal: true,
            explain: '2 → 1 → 0 and 4 → 3. Two roots.',
          },
        },
        {
          say: 'Remember this. Each group is a tree with a boss, and same group means same root. Now tap solve it and try it yourself.',
          emphasis: ['boss', 'root'],
          sfx: 'success',
          scene: {
            type: 'outro',
            points: ['Groups are trees with a *boss*', 'Same group means same *root*', 'Union false? That edge is a *loop*'],
            tagline: 'Now go solve it.',
          },
        },
      ],
    },

    // ------------------------------------------------------------------ Lesson 2
    {
      id: 'dsa-advanced-graphs-dijkstra',
      title: 'Dijkstra: shortest paths when roads have different lengths',
      link: { label: 'Solve it', href: '/dsa#/m/advanced-graphs/dijkstra/advanced-graphs-network-delay-time' },
      beats: [
        {
          say: 'Two jammed roads, or three empty ones. Which way is faster?',
          emphasis: ['faster'],
          scene: { type: 'title', kicker: 'Graphs II · Lesson 2', title: 'Maps adds up *minutes*', emoji: '🗺️', style: 'slam' },
        },
        {
          say: 'The road from zero to one takes five minutes. Going through two takes one plus two: just three.',
          emphasis: ['five', 'three'],
          sfx: 'pop',
          scene: {
            type: 'diagram', title: 'One-way roads, in minutes', cols: 3, rows: 4,
            ...dijkstra({ '0': [0], '1': [3], '2': [1], '3': 4, '4': 7 }, '1', ['02', '21']),
            caption: 'fewest roads is not fastest',
          },
        },
        {
          say: 'The easy way walks every path from the start, and keeps the cheapest total it finds.',
          emphasis: ['every', 'path'],
          sfx: 'type',
          scene: {
            type: 'code', lang: 'pseudo', file: 'Brute force',
            code: `function explore(u, cost):
    if u = target:
        best ← min(best, cost)
        return
    for each [v, w] in graph[u]:
        if v not visited:
            explore(v, cost + w)`,
            highlight: [[5, 7]],
            note: { line: 7, text: 'walks the same roads again', tone: 'warn' },
          },
        },
        {
          say: 'Paths can double with every place you add. Just thirty places can mean millions of paths.',
          emphasis: ['double', 'millions'],
          sfx: 'error',
          scene: { type: 'stat', value: '30', unit: 'places', label: 'can mean *millions* of paths', sub: 'paths double with each new place', tone: 'bad' },
        },
        {
          say: 'So always finish the closest place you have reached. Roads only add time, so its cost is final.',
          emphasis: ['closest', 'final'],
          sfx: 'ding',
          scene: { type: 'title', kicker: 'The insight', title: 'Finish the *closest* place first', emoji: '💡', style: 'slam' },
        },
        {
          say: 'Start at zero, cost zero. Pop it, and its roads give two a best of one, and one a best of five.',
          emphasis: ['one', 'five'],
          scene: {
            type: 'diagram', title: 'Dijkstra from 0', cols: 3, rows: 4,
            ...dijkstra({ '0': [0], '1': 5, '2': 1, '3': null, '4': null }, '0', ['01', '02']),
            caption: 'heap: 2 at 1, 1 at 5',
          },
        },
        {
          say: 'The heap hands us the closest: two, at one. Through two, node one drops from five to three.',
          emphasis: ['closest', 'three'],
          scene: {
            type: 'diagram', title: 'Dijkstra from 0', cols: 3, rows: 4,
            ...dijkstra({ '0': [0], '1': 3, '2': [1], '3': 6, '4': null }, '2', ['21', '23']),
            caption: 'heap: 1 at 3, 1 at 5, 3 at 6',
          },
        },
        {
          say: 'Pop node one at three. Its road makes node three cost four, better than six.',
          emphasis: ['four'],
          scene: {
            type: 'diagram', title: 'Dijkstra from 0', cols: 3, rows: 4,
            ...dijkstra({ '0': [0], '1': [3], '2': [1], '3': 4, '4': null }, '1', ['13']),
            caption: 'heap: 3 at 4, 1 at 5, 3 at 6',
          },
        },
        {
          say: 'Pop node three at four, and node four gets seven.',
          emphasis: ['seven'],
          scene: {
            type: 'diagram', title: 'Dijkstra from 0', cols: 3, rows: 4,
            ...dijkstra({ '0': [0], '1': [3], '2': [1], '3': [4], '4': 7 }, '3', ['34']),
            caption: 'heap: 1 at 5, 3 at 6, 4 at 7',
          },
        },
        {
          say: 'The old entries for one and three are stale, so skip them. Pop four, and every cost is final.',
          emphasis: ['stale', 'final'],
          sfx: 'success',
          scene: {
            type: 'diagram', title: 'Dijkstra from 0', cols: 3, rows: 4,
            ...dijkstra({ '0': [0], '1': [3], '2': [1], '3': [4], '4': [7] }, '4'),
            caption: 'heap: empty',
          },
        },
        {
          say: 'In JavaScript, pop the closest, skip stale entries, and relax every road out. That is O of E log V.',
          speak: 'In JavaScript, pop the closest, skip stale entries, and relax every road out. That is oh of E log V.',
          emphasis: ['stale', 'relax'],
          sfx: 'type',
          scene: {
            type: 'code', lang: 'js', file: 'dijkstra.js',
            code: `dist[src] = 0;
heap.push([0, src]);
while (!heap.isEmpty()) {
  const [d, u] = heap.pop();
  if (d > dist[u]) continue; // stale
  for (const [v, w] of graph[u]) {
    if (d + w < dist[v]) {
      dist[v] = d + w;
      heap.push([dist[v], v]);
    }
  }
}
return dist;`,
            highlight: [[7, 9]],
            note: { line: 9, text: 'O((V + E) log V)', tone: 'good' },
          },
        },
        {
          say: 'Reach for this when you want the shortest or cheapest path, and roads cost different amounts.',
          emphasis: ['cheapest', 'different'],
          scene: {
            type: 'list', title: 'Reach for this when…',
            items: [
              { text: 'Shortest, cheapest, *fastest*', icon: '🏁' },
              { text: 'Roads cost *different* amounts', icon: '⚖️' },
              { text: 'No cost is below zero', icon: '➕' },
            ],
            active: 1,
          },
        },
        {
          say: 'The trap is a negative road. B is finished at two, then C finds a way to it that costs only one.',
          emphasis: ['negative'],
          sfx: 'error',
          scene: {
            type: 'diagram', title: 'A negative road breaks it', cols: 3, rows: 3,
            nodes: [
              { id: 'a', label: 'A', x: 0, y: 0, shape: 'circle' },
              { id: 'b', label: 'B', x: 2, y: 0, shape: 'circle', tone: 'bad', active: true },
              { id: 'c', label: 'C', x: 1, y: 2, shape: 'circle' },
            ],
            edges: [
              { from: 'a', to: 'b', label: '2' },
              { from: 'a', to: 'c', label: '3' },
              { from: 'c', to: 'b', label: '-2', tone: 'bad', active: true },
            ],
            caption: 'B was "final" at 2, but A, C, B costs 1',
          },
        },
        {
          say: 'Quick check. Which of these graphs can make Dijkstra give a wrong answer?',
          sfx: 'riser',
          scene: {
            type: 'quiz',
            question: 'Which graph can make Dijkstra give a wrong answer?',
            options: ['Every edge costs 1', 'One edge costs 0', 'One edge costs -2', 'A cycle of positive edges'],
            answer: 2,
          },
        },
        {
          say: 'The minus two. A negative edge can make a finished node cheaper later. Use Bellman-Ford there.',
          emphasis: ['negative', 'finished'],
          sfx: 'ding',
          scene: {
            type: 'quiz',
            question: 'Which graph can make Dijkstra give a wrong answer?',
            options: ['Every edge costs 1', 'One edge costs 0', 'One edge costs -2', 'A cycle of positive edges'],
            answer: 2,
            reveal: true,
            explain: 'Zero and positive costs are fine.',
          },
        },
        {
          say: 'Remember this. Dijkstra is BFS with a min-heap, and a popped node is final. Now tap solve it and try it yourself.',
          emphasis: ['min-heap', 'final'],
          sfx: 'success',
          scene: {
            type: 'outro',
            points: ['Dijkstra is BFS with a *min-heap*', 'The closest pop is *final*', 'Skip *stale* heap entries'],
            tagline: 'Now go solve it.',
          },
        },
      ],
    },

    // ------------------------------------------------------------------ Lesson 3
    {
      id: 'dsa-advanced-graphs-dijkstra-variants',
      title: 'Dijkstra variants: counting routes and minimax paths',
      link: { label: 'Solve it', href: '/dsa#/m/advanced-graphs/dijkstra-variants/advanced-graphs-ways-to-arrive' },
      beats: [
        {
          say: 'Two routes to the airport, both six minutes. Can you count them?',
          emphasis: ['count'],
          scene: { type: 'title', kicker: 'Graphs II · Lesson 3', title: 'Two routes, *same* time', emoji: '🚕', style: 'slam' },
        },
        {
          say: 'Five corners, and roads marked in minutes. The fastest trip to four takes six minutes, and there are two ways.',
          emphasis: ['six', 'two'],
          sfx: 'pop',
          scene: {
            type: 'diagram', title: 'Roads in minutes', cols: 3, rows: 4,
            nodes: Object.entries({ '0': [1, 0], '1': [0, 1], '2': [2, 1], '3': [1, 2], '4': [1, 3] }).map(([id, [x, y]]): DiagramNode => ({
              id, label: `Corner ${id}`, x, y, shape: 'pill', ...(id === '4' ? { active: true } : {}),
            })),
            edges: [
              { from: '0', to: '1', label: '2', active: true },
              { from: '0', to: '2', label: '3', active: true },
              { from: '1', to: '3', label: '3', active: true },
              { from: '2', to: '3', label: '2', active: true },
              { from: '3', to: '4', label: '1', active: true },
            ],
            caption: 'and a direct road from 0 to 4: 7 min',
          },
        },
        {
          say: 'The easy way walks every route with DFS, and counts the ones that tie the best time.',
          emphasis: ['every', 'tie'],
          sfx: 'type',
          scene: {
            type: 'code', lang: 'pseudo', file: 'Brute force',
            code: `function dfs(u, time):
    if u is the goal:
        if time < best:
            best ← time; count ← 1
        else if time = best:
            count ← count + 1
        return
    for each [v, w] in graph[u]:
        if v not visited:
            dfs(v, time + w)`,
            highlight: [[8, 10]],
            note: { line: 10, text: 'walks past 3 once per route', tone: 'warn' },
          },
        },
        {
          say: 'When every corner links to every other, fifteen corners already have billions of routes.',
          emphasis: ['billions'],
          sfx: 'error',
          scene: { type: 'stat', value: 'Billions', label: 'of routes with *15* corners', sub: 'when every corner links to all others', tone: 'bad' },
        },
        {
          say: 'So run Dijkstra, and carry a second number: how many fastest routes reach each corner.',
          emphasis: ['second', 'how'],
          sfx: 'ding',
          scene: { type: 'title', kicker: 'The insight', title: 'Carry a *ways* count', emoji: '💡', style: 'slam' },
        },
        {
          say: 'Zero starts with one way. Pop it, and corners one, two and four each copy that one way.',
          emphasis: ['copy'],
          scene: ways([0, 2, 3, INF, 7], [1, 1, 1, 0, 1], {
            active: [[1, 1], [1, 2], [1, 4]], reads: [[1, 0]], vars: { popped: '0 at 0' },
          }),
        },
        {
          say: 'Pop one. Corner three is reached in five minutes for the first time, so it copies one way.',
          emphasis: ['first'],
          scene: ways([0, 2, 3, 5, 7], [1, 1, 1, 1, 1], {
            active: [[1, 3]], reads: [[1, 1]], vars: { popped: '1 at 2' },
          }),
        },
        {
          say: 'Pop two. It also reaches three in five minutes. A tie, so add: three now has two ways.',
          emphasis: ['tie', 'add'],
          scene: ways([0, 2, 3, 5, 7], [1, 1, 1, 2, 1], {
            active: [[1, 3]], reads: [[1, 2]], vars: { popped: '2 at 3' },
          }),
        },
        {
          say: 'Pop three. Six minutes beats the direct seven, so throw the old count away. Four copies two ways.',
          emphasis: ['beats', 'away'],
          scene: ways([0, 2, 3, 5, 6], [1, 1, 1, 2, 2], {
            active: [[1, 4]], reads: [[1, 3]], vars: { popped: '3 at 5' },
          }),
        },
        {
          say: 'Pop four at six. The old seven entry is stale, so skip it. The answer is two ways.',
          emphasis: ['stale', 'two'],
          sfx: 'success',
          scene: ways([0, 2, 3, 5, 6], [1, 1, 1, 2, 2], {
            found: [[0, 4], [1, 4]], vars: { popped: '4 at 6' },
          }),
        },
        {
          say: 'In JavaScript, a shorter path replaces the count, and an equal one adds to it.',
          emphasis: ['replaces', 'adds'],
          sfx: 'type',
          scene: {
            type: 'code', lang: 'js', file: 'countFastest.js',
            code: `const [d, u] = heap.pop();
if (d > dist[u]) continue; // stale
for (const [v, w] of graph[u]) {
  if (d + w < dist[v]) {
    dist[v] = d + w;
    ways[v] = ways[u];
    heap.push([dist[v], v]);
  } else if (d + w === dist[v]) {
    ways[v] = (ways[v] + ways[u]) % M;
  }
}`,
            highlight: [6, 9],
            note: { line: 9, text: 'a tie: add the ways', tone: 'good' },
          },
        },
        {
          say: 'Reach for a bent Dijkstra when you count fastest ways, or a path costs its highest step.',
          emphasis: ['count', 'highest'],
          scene: {
            type: 'list', title: 'Reach for this when…',
            items: [
              { text: 'How *many* fastest ways?', icon: '🔢' },
              { text: 'A path costs its *highest* step', icon: '⛰️' },
              { text: 'A cost never drops as paths grow', icon: '📈' },
            ],
            active: 0,
          },
        },
        {
          say: 'The trap is a stale entry. Expand one, and its ways get added to its neighbors twice.',
          emphasis: ['stale', 'twice'],
          sfx: 'error',
          scene: {
            type: 'code', lang: 'js', file: 'trap.js',
            code: `const [d, u] = heap.pop();
// forgot: if (d > dist[u]) continue;
for (const [v, w] of graph[u]) {
  // ways[v] += ways[u] ... again!
}`,
            errors: [2],
            note: { line: 2, text: 'stale pops count twice', tone: 'bad' },
          },
        },
        {
          say: 'Quick check. You pop a real entry, and d plus w equals dist of v. What do you do?',
          sfx: 'riser',
          scene: {
            type: 'quiz',
            question: 'A real pop. d + w equals dist[v]. What do you do?',
            options: ['ways[v] = ways[u]', 'ways[v] += ways[u]', 'Nothing at all', 'Push v again'],
            answer: 1,
          },
        },
        {
          say: 'Add them. These routes are just as fast, and v’s distance did not change, so there is no push.',
          emphasis: ['add', 'fast'],
          sfx: 'ding',
          scene: {
            type: 'quiz',
            question: 'A real pop. d + w equals dist[v]. What do you do?',
            options: ['ways[v] = ways[u]', 'ways[v] += ways[u]', 'Nothing at all', 'Push v again'],
            answer: 1,
            reveal: true,
            explain: 'Replace only on a strictly shorter path.',
          },
        },
        {
          say: 'Remember this. Shorter replaces, equal adds, and you never count from a stale pop. Now tap solve it and try it yourself.',
          emphasis: ['replaces', 'adds'],
          sfx: 'success',
          scene: {
            type: 'outro',
            points: ['Shorter path: *replace* the count', 'Same time: *add* the count', 'Never count from a *stale* pop'],
            tagline: 'Now go solve it.',
          },
        },
      ],
    },

    // ------------------------------------------------------------------ Lesson 4
    {
      id: 'dsa-advanced-graphs-bellman-ford',
      title: 'Bellman-Ford: at most k stops and negative edges',
      link: { label: 'Solve it', href: '/dsa#/m/advanced-graphs/bellman-ford/advanced-graphs-cheapest-flights-k-stops' },
      beats: [
        {
          say: 'The cheap flight has two layovers. You will only take one.',
          emphasis: ['layovers', 'one'],
          scene: { type: 'title', kicker: 'Graphs II · Lesson 4', title: 'Cheap, but too many *layovers*', emoji: '✈️', style: 'slam' },
        },
        {
          say: 'Four cities. With at most one stop, the best trip is zero, two, three, for three hundred fifty.',
          emphasis: ['one', 'stop'],
          sfx: 'pop',
          scene: {
            type: 'diagram', title: 'One-way flights', cols: 3, rows: 3,
            nodes: circles({ '0': [0, 0], '3': [2, 0], '1': [0, 2], '2': [2, 2] }, { now: '3', good: ['0', '2'] }),
            edges: [
              { from: '0', to: '3', label: '500' },
              { from: '0', to: '1', label: '100' },
              { from: '1', to: '2', label: '100' },
              { from: '2', to: '3', label: '100', active: true },
              { from: '0', to: '2', label: '250', active: true },
            ],
            caption: '0, 1, 2, 3 is 300, but has two stops',
          },
        },
        {
          say: 'The easy way tries every trip that has at most k plus one flights.',
          emphasis: ['every', 'trip'],
          sfx: 'type',
          scene: {
            type: 'code', lang: 'pseudo', file: 'Brute force',
            code: `function explore(city, flights, cost):
    if city = dst:
        best ← min(best, cost)
        return
    if flights = k + 1: return
    for each [next, price] from city:
        explore(next, flights + 1,
                cost + price)`,
            highlight: [[6, 8]],
            note: { line: 8, text: 'about n^(k+1) trips', tone: 'warn' },
          },
        },
        {
          say: 'A hundred cities with ten stops is about ten to the twenty-second trips.',
          emphasis: ['twenty-second'],
          sfx: 'error',
          scene: { type: 'stat', value: '10²²', label: 'trips: *100* cities, k = 10', sub: 'O(n^(k+1)): every trip, one by one', tone: 'bad' },
        },
        {
          say: 'So relax every flight, round after round. After round i, you know the best cost with i flights.',
          emphasis: ['round', 'flights'],
          sfx: 'ding',
          scene: { type: 'title', kicker: 'The insight', title: 'One round per *flight*', emoji: '💡', style: 'slam' },
        },
        {
          say: 'Round one reads prev, where only city zero is known. Flight zero to one writes a hundred into next.',
          emphasis: ['reads', 'writes'],
          scene: rounds([0, INF, INF, INF], [0, 100, INF, INF], {
            active: [[1, 1]], reads: [[0, 0]], vars: { round: 1, flight: '0 to 1' },
          }),
        },
        {
          say: 'Flight one to two reads prev of one. It is still infinity, so skip it. One round, one flight.',
          emphasis: ['skip'],
          scene: rounds([0, INF, INF, INF], [0, 100, INF, INF], {
            active: [[1, 2]], reads: [[0, 1]], vars: { round: 1, flight: '1 to 2' },
          }),
        },
        {
          say: 'The direct flights write two fifty and five hundred. Round one is done, so next becomes prev.',
          emphasis: ['prev'],
          scene: rounds([0, 100, 250, 500], [0, 100, 250, 500], {
            active: [[0, 2], [0, 3]], vars: { round: 1, flight: 'all done' },
          }),
        },
        {
          say: 'Round two. Flight one to two costs two hundred, which beats two fifty.',
          emphasis: ['beats'],
          scene: rounds([0, 100, 250, 500], [0, 100, 200, 500], {
            active: [[1, 2]], reads: [[0, 1]], vars: { round: 2, flight: '1 to 2' },
          }),
        },
        {
          say: 'Flight two to three reads the old two fifty, not the new two hundred. Three fifty wins.',
          emphasis: ['old', 'wins'],
          sfx: 'success',
          scene: rounds([0, 100, 250, 500], [0, 100, 200, 350], {
            found: [[1, 3]], reads: [[0, 2]], vars: { round: 2, flight: '2 to 3' },
          }),
        },
        {
          say: 'In JavaScript, copy prev into next, then read old and write new. That is O of k times E.',
          speak: 'In JavaScript, copy prev into next, then read old and write new. That is oh of k times E.',
          emphasis: ['copy', 'old'],
          sfx: 'type',
          scene: {
            type: 'code', lang: 'js', file: 'cheapestFlight.js',
            code: `let prev = Array(n).fill(Infinity);
prev[src] = 0;
for (let r = 1; r <= k + 1; r++) {
  const next = prev.slice();
  for (const [u, v, p] of flights) {
    if (prev[u] + p < next[v])
      next[v] = prev[u] + p;
  }
  prev = next;
}
return prev[dst] === Infinity
  ? -1 : prev[dst];`,
            highlight: [[6, 7]],
            note: { line: 7, text: 'read old, write new: O(k·E)', tone: 'good' },
          },
        },
        {
          say: 'Reach for this when you see at most k stops, or costs that can go below zero.',
          emphasis: ['stops', 'below'],
          scene: {
            type: 'list', title: 'Reach for this when…',
            items: [
              { text: 'At most *k* stops or steps', icon: '🛑' },
              { text: '*Negative* costs, like refunds', icon: '💸' },
              { text: 'Can it keep improving forever?', icon: '♾️' },
            ],
            active: 0,
          },
        },
        {
          say: 'The trap is one array. Then round one chains zero, one, two, three, and sneaks in two stops.',
          emphasis: ['one', 'array'],
          sfx: 'error',
          scene: {
            type: 'code', lang: 'js', file: 'trap.js',
            code: `for (let r = 1; r <= k + 1; r++) {
  for (const [u, v, p] of flights) {
    if (dist[u] + p < dist[v])
      dist[v] = dist[u] + p;
  }
}`,
            errors: [[3, 4]],
            note: { line: 4, text: 'chains flights in one round', tone: 'bad' },
          },
        },
        {
          say: 'Quick check. You may make at most two stops. How many rounds do you run?',
          sfx: 'riser',
          scene: {
            type: 'quiz',
            question: 'At most k = 2 stops. How many rounds do you run?',
            options: ['2', '3', 'n - 1', 'n'],
            answer: 1,
          },
        },
        {
          say: 'Three. Two stops means three flights, and each round adds one flight.',
          emphasis: ['three', 'flight'],
          sfx: 'ding',
          scene: {
            type: 'quiz',
            question: 'At most k = 2 stops. How many rounds do you run?',
            options: ['2', '3', 'n - 1', 'n'],
            answer: 1,
            reveal: true,
            explain: '2 stops = 3 flights = 3 rounds.',
          },
        },
        {
          say: 'Remember this. Round i means at most i flights, and you always read from prev. Now tap solve it and try it yourself.',
          emphasis: ['flights', 'prev'],
          sfx: 'success',
          scene: {
            type: 'outro',
            points: ['Round i = at most *i* flights', 'k stops means *k + 1* rounds', 'Read *prev*, write *next*'],
            tagline: 'Now go solve it.',
          },
        },
      ],
    },

    // ------------------------------------------------------------------ Lesson 5
    {
      id: 'dsa-advanced-graphs-minimum-spanning-tree',
      title: 'Minimum spanning tree: connect everything for the least cost',
      link: { label: 'Solve it', href: '/dsa#/m/advanced-graphs/minimum-spanning-tree/advanced-graphs-connecting-cities' },
      beats: [
        {
          say: 'Link five towns with fiber cables. What is the cheapest way?',
          emphasis: ['cheapest'],
          scene: { type: 'title', kicker: 'Graphs II · Lesson 5', title: 'Fiber for *five* towns', emoji: '🌐', style: 'slam' },
        },
        {
          say: 'Seven possible cables, each with a price. You need just four, and the cheapest set costs eleven.',
          emphasis: ['four', 'eleven'],
          sfx: 'pop',
          scene: {
            type: 'diagram', title: 'Five towns, seven cables', cols: 3, rows: 4,
            nodes: circles(townSpots, { good: ['0', '1', '2', '3', '4'] }),
            edges: kruskal(['02', '12', '34', '13']),
            caption: 'four green cables, total 11',
          },
        },
        {
          say: 'The easy way tries every set of four cables, and keeps the cheapest one that links every town.',
          emphasis: ['every', 'set'],
          sfx: 'type',
          scene: {
            type: 'code', lang: 'pseudo', file: 'Brute force',
            code: `best ← ∞
for each set S of n - 1 edges:
    if S connects every node:
        best ← min(best, cost of S)
return best`,
            highlight: [[2, 3]],
            note: { line: 3, text: 'every set: far too many', tone: 'warn' },
          },
        },
        {
          say: 'A hundred towns and three hundred cables give ten to the eighty-first sets. More than atoms in the universe.',
          emphasis: ['atoms'],
          sfx: 'error',
          scene: { type: 'stat', value: '10⁸¹', label: 'sets: *100* towns, 300 cables', sub: 'more than the atoms in the universe', tone: 'bad' },
        },
        {
          say: 'So sort the cables by price. Take each one, unless its two towns are already connected.',
          emphasis: ['sort', 'connected'],
          sfx: 'ding',
          scene: { type: 'title', kicker: 'The insight', title: 'Cheapest cable with *no loop*', emoji: '💡', style: 'slam' },
        },
        {
          say: 'The cheapest cable joins zero and two for one. They are in different groups, so take it.',
          emphasis: ['take'],
          scene: {
            type: 'diagram', title: 'Kruskal, cheapest first', cols: 3, rows: 4,
            nodes: circles(townSpots), edges: kruskal(['02'], '02'),
            caption: 'total 1 · cables 1 of 4',
          },
        },
        {
          say: 'Next, one to two for two. Town one joins the group, so take it.',
          emphasis: ['joins'],
          scene: {
            type: 'diagram', title: 'Kruskal, cheapest first', cols: 3, rows: 4,
            nodes: circles(townSpots), edges: kruskal(['02', '12'], '12'),
            caption: 'total 3 · cables 2 of 4',
          },
        },
        {
          say: 'Three to four for three. A brand new pair, so take it too.',
          emphasis: ['new'],
          scene: {
            type: 'diagram', title: 'Kruskal, cheapest first', cols: 3, rows: 4,
            nodes: circles(townSpots), edges: kruskal(['02', '12', '34'], '34'),
            caption: 'total 6 · cables 3 of 4',
          },
        },
        {
          say: 'Zero to one for four. They are already connected through two, so it would make a loop. Skip it.',
          emphasis: ['loop', 'skip'],
          sfx: 'error',
          scene: {
            type: 'diagram', title: 'Kruskal, cheapest first', cols: 3, rows: 4,
            nodes: circles(townSpots), edges: kruskal(['02', '12', '34'], '01', ['01']),
            caption: 'total 6 · skip: union says false',
          },
        },
        {
          say: 'One to three for five links the two groups. Four cables, total eleven. Stop: the eight and nine never get looked at.',
          emphasis: ['eleven', 'stop'],
          sfx: 'success',
          scene: {
            type: 'diagram', title: 'Kruskal, cheapest first', cols: 3, rows: 4,
            nodes: circles(townSpots, { good: ['0', '1', '2', '3', '4'] }), edges: kruskal(['02', '12', '34', '13'], '13', ['01']),
            caption: 'total 11 · cables 4 of 4',
          },
        },
        {
          say: 'In JavaScript, sort, then let union-find reject loops. The sort costs the most: O of E log E.',
          speak: 'In JavaScript, sort, then let union-find reject loops. The sort costs the most: oh of E log E.',
          emphasis: ['sort', 'loops'],
          sfx: 'type',
          scene: {
            type: 'code', lang: 'js', file: 'kruskal.js',
            code: `edges.sort((a, b) => a[2] - b[2]);
let total = 0, used = 0;
for (const [u, v, cost] of edges) {
  if (!union(u, v)) continue; // loop
  total += cost;
  used++;
  if (used === n - 1) break;
}
return used === n - 1 ? total : -1;`,
            highlight: [4],
            note: { line: 4, text: 'O(E log E), mostly the sort', tone: 'good' },
          },
        },
        {
          say: 'Reach for this when you must connect everything for the least total cost.',
          emphasis: ['everything', 'least'],
          scene: {
            type: 'list', title: 'Reach for this when…',
            items: [
              { text: 'Connect *everything*, cheapest', icon: '🕸️' },
              { text: 'You get edges as [a, b, cost]', icon: '📋' },
              { text: 'Not A to B: that is Dijkstra', icon: '🚫' },
            ],
            active: 0,
          },
        },
        {
          say: 'The trap: Prim is not Dijkstra. Key its heap by total distance, and you pay seventeen, not eleven.',
          emphasis: ['seventeen', 'eleven'],
          sfx: 'error',
          scene: {
            type: 'code', lang: 'js', file: 'trap.js',
            code: `// Prim grows one tree with a heap
heap.push([d + w, v]); // Dijkstra!
heap.push([w, v]);     // Prim`,
            errors: [2],
            added: [3],
            note: { line: 2, text: 'pays 17 instead of 11', tone: 'bad' },
          },
        },
        {
          say: 'Quick check. A connected graph has eight nodes and twenty edges. How many edges does every spanning tree have?',
          sfx: 'riser',
          scene: {
            type: 'quiz',
            question: '8 nodes, 20 edges. How many edges does a spanning tree have?',
            options: ['8', '7', '20', '19'],
            answer: 1,
          },
        },
        {
          say: 'Seven. A tree on n nodes always has n minus one edges.',
          emphasis: ['Seven'],
          sfx: 'ding',
          scene: {
            type: 'quiz',
            question: '8 nodes, 20 edges. How many edges does a spanning tree have?',
            options: ['8', '7', '20', '19'],
            answer: 1,
            reveal: true,
            explain: 'n − 1 = 8 − 1 = 7.',
          },
        },
        {
          say: 'Remember this. Sort the cables, skip the loops, and stop at n minus one. Now tap solve it and try it yourself.',
          emphasis: ['loops', 'one'],
          sfx: 'success',
          scene: {
            type: 'outro',
            points: ['A tree on n nodes: *n − 1* edges', 'Kruskal: sort + *union-find*', 'MST is not *shortest paths*'],
            tagline: 'Now go solve it.',
          },
        },
      ],
    },
  ],
};
