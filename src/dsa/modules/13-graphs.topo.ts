import type { Lesson } from '../types';

const lesson: Lesson = {
  id: 'cycles-and-topological-sort',
  title: 'Cycles and topological sort: doing things in dependency order',
  summary: "Count each task's unmet prerequisites; whatever hits zero is ready. Leftovers mean a cycle.",
  minutes: 25,
  blocks: [
    {
      kind: 'callout',
      tone: 'story',
      title: 'Socks before shoes',
      text: "Getting dressed has rules: socks before shoes, shirt before jacket. `npm install` has rules too: a package's dependencies are installed before the package. Excel recalculates a cell only after the cells its formula uses. And when two cells point at each other, Excel shows a **circular reference** warning, because no order can work. Finding a valid order (or proving there is none) is called **topological sort**.",
    },
    {
      kind: 'text',
      text: "**The problem.** There are `4` courses, `0` to `3`. `prerequisites = [[1,0],[2,0],[3,1],[3,2]]`, where `[a, b]` means *you must take b before a*. Can you finish all courses? In what order? Draw each rule as an arrow `b → a` (\"b unlocks a\"). A graph with arrows is a **directed graph**. If you can follow arrows and come back to where you started, that loop is a **cycle**, and then no order exists.",
    },
    {
      kind: 'diagram',
      title: 'Prerequisites as arrows',
      art: `[1,0] [2,0] [3,1] [3,2]   means   0→1  0→2  1→3  2→3

          0
        /   \\
       v     v
       1     2
        \\   /
         v v
          3

in-degree (arrows coming in):  0:0  1:1  2:1  3:2`,
      caption: "The **in-degree** of a course is how many prerequisites it still waits for. Course 0 waits for nothing, so it can go first.",
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Brute force: keep scanning for a course you can take',
      code: `taken ← empty set; order ← empty list
repeat n times:
    find a course c not in taken whose prerequisites
        are all in taken                // scan every rule
    if none found: return "impossible"  // stuck: a cycle
    add c to taken; append c to order
return order`,
    },
    {
      kind: 'text',
      text: "This is correct. But every round rescans all `E` rules for all courses, so it costs about `O(n · (n + E))`. **The waste:** when you finish course 0, only the courses that 0 unlocks (1 and 2) can change. Every other course is exactly as stuck as before, yet we check it again.",
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: "Kahn's algorithm: count what is still missing",
      text: "Keep a counter per course: its in-degree, the number of prerequisites not yet taken. Put every course with counter 0 in a **ready** queue. Take a ready course, then lower the counter of each course it unlocks; any that hit 0 become ready. Each arrow is used once: `O(n + E)`. If the queue empties before all `n` courses are taken, the leftovers are stuck in a cycle (they wait on each other forever).",
    },
    {
      kind: 'trace',
      title: "Kahn's algorithm on the 4 courses",
      columns: ['take', 'unlocks (new in-degree)', 'ready queue after', 'order so far'],
      rows: [
        ['-', 'start: in-degree [0,1,1,2]', '[0]', '[]'],
        [0, '1 → 0, 2 → 0', '[1, 2]', '[0]'],
        [1, '3 → 1', '[2]', '[0, 1]'],
        [2, '3 → 0', '[3]', '[0, 1, 2]'],
        [3, 'nothing', '[]', '[0, 1, 2, 3]'],
      ],
      note: "4 courses taken out of 4: no cycle. With `[[1,0],[0,1]]` both courses start at in-degree 1, the ready queue starts empty, and we take 0 of 2: a cycle.",
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: "Kahn's algorithm",
      code: `function topoOrder(n, prerequisites):
    adj ← list of n empty lists
    indeg ← array of n zeros
    for each [course, pre] in prerequisites:
        append course to adj[pre]           // arrow pre → course
        indeg[course] ← indeg[course] + 1
    queue ← every course c with indeg[c] = 0
    order ← empty list
    while queue is not empty:
        c ← queue.popFront()
        append c to order
        for each next in adj[c]:
            indeg[next] ← indeg[next] - 1
            if indeg[next] = 0: append next to queue
    if length of order < n: return []       // cycle
    return order`,
    },
    {
      kind: 'code',
      lang: 'js',
      code: `function topoOrder(n, prerequisites) {
  const adj = Array.from({ length: n }, () => []);
  const indeg = new Array(n).fill(0);
  for (const [course, pre] of prerequisites) {
    adj[pre].push(course);
    indeg[course]++;
  }
  const queue = [];
  for (let c = 0; c < n; c++) if (indeg[c] === 0) queue.push(c);
  for (let head = 0; head < queue.length; head++) {
    for (const next of adj[queue[head]]) {
      indeg[next]--;
      if (indeg[next] === 0) queue.push(next);
    }
  }
  // the queue array itself is the order
  return queue.length === n ? queue : [];
}`,
    },
    {
      kind: 'text',
      text: "**The other way: DFS with three colors.** Give every node a color. **White** = not started. **Gray** = started, still exploring what it leads to (it is on the current path). **Black** = finished, everything after it is explored. If DFS ever steps onto a **gray** node, you walked in a circle back onto your own path: that is a cycle.",
    },
    {
      kind: 'diagram',
      title: 'Why two colors are not enough',
      art: `diamond: no cycle            loop: cycle

      0                      1 -----> 2
    /   \\                    ^        |
   v     v                   |        v
   1     2                   +------- 3
    \\   /
     v v
      3`,
      caption: "In the diamond, DFS reaches 3 via 1, finishes it (black), then reaches 3 again via 2. A plain `visited` set would shout \"cycle!\" here, wrongly. Colors know 3 is black: finished, not on the path. In the loop, DFS goes 1 → 2 → 3 → 1 and finds 1 still gray: a real cycle.",
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Cycle check with three colors',
      code: `color ← array of n WHITE
function hasCycle(node):
    color[node] ← GRAY                  // on the current path
    for each next in adj[node]:
        if color[next] = GRAY: return true      // back onto the path
        if color[next] = WHITE and hasCycle(next): return true
    color[node] ← BLACK                 // done, safe
    return false

for each node with color WHITE:
    if hasCycle(node): report a cycle`,
    },
    {
      kind: 'compare',
      title: 'Ordering n tasks with E rules',
      rows: [
        { approach: 'Rescan for a ready task each round', time: 'O(n · (n + E))', space: 'O(n)', note: 'Correct, rechecks tasks that cannot have changed.' },
        { approach: 'DFS with three colors', time: 'O(n + E)', space: 'O(n + E)', note: 'Great for "is there a cycle?" and "which nodes reach a cycle?". Recursion depth can be n.' },
        { approach: "Kahn's algorithm (in-degree queue)", time: 'O(n + E)', space: 'O(n + E)', note: 'Gives the order directly, no recursion, easy to make the order canonical.' },
      ],
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Pattern: topological sort',
      code: `// Signals: "prerequisite", "depends on", "must come before",
// "order of tasks/builds/courses", "is it possible to finish".
build adj and indeg from the rules (arrow: before → after)
ready ← all nodes with indeg 0
while ready is not empty:
    take x from ready; append x to order
    for each y in adj[x]:
        indeg[y] ← indeg[y] - 1
        if indeg[y] = 0: add y to ready
cycle exists  ⇔  length of order < n`,
    },
    {
      kind: 'callout',
      tone: 'trap',
      title: 'Arrow direction and "which order?"',
      text: "1) **`[a, b]` means b comes first**, so the arrow is `b → a` and `a` gets the in-degree. Flip it and your order comes out backwards. 2) **Many valid orders can exist.** Courses 1 and 2 above can go in either order. When a test needs one exact answer, the problem must say which (for example \"smallest number first\"): then use a min-heap as the ready list. 3) **A plain visited set is not a cycle check** in a directed graph. Use gray/black.",
    },
  ],
  problems: [
    {
      id: 'graphs-course-schedule',
      title: 'Can you finish every course?',
      difficulty: 'medium',
      leetcode: 207,
      pattern: 'Topological sort / cycle detection',
      statement:
        "A university has `numCourses` courses numbered `0` to `numCourses - 1`. Each pair `[a, b]` in `prerequisites` means you must finish course `b` before course `a`. A course can even list itself, which makes it impossible. Return `true` if there is some order that lets you finish every course, otherwise `false`.",
      examples: [
        { input: 'numCourses = 2, prerequisites = [[1,0]]', output: 'true', explain: 'Take 0, then 1.' },
        { input: 'numCourses = 2, prerequisites = [[1,0],[0,1]]', output: 'false', explain: 'Each waits for the other.' },
      ],
      constraints: ['1 ≤ numCourses ≤ 2000', '0 ≤ prerequisites.length ≤ 5000', 'no pair appears twice'],
      hints: [
        "Draw an arrow `b → a` for each pair. When is finishing impossible?",
        "It is impossible exactly when the arrows contain a cycle.",
        "Kahn: count prerequisites per course, start with the zeros, and see if you can take all `numCourses`.",
      ],
      approaches: [
        {
          name: 'Rescan for a takeable course',
          idea: "Repeat: find any untaken course whose prerequisites are all taken. If you get stuck before taking all, there is a cycle. Correct but rescans everything each round.",
          time: 'O(n · (n + E))',
          space: 'O(n)',
        },
        {
          name: 'DFS with three colors',
          idea: "Mark a course gray while exploring what it unlocks and black when done. Meeting a gray course means you looped back onto your own path: a cycle.",
          time: 'O(n + E)',
          space: 'O(n + E)',
        },
        {
          name: "Kahn's algorithm",
          idea: "Track how many prerequisites each course still misses. Courses at 0 are ready; taking one lowers the count of the courses it unlocks. Courses in a cycle never reach 0, so the number taken falls short of `numCourses`.",
          pseudo: `function canFinish(numCourses, prerequisites):
    adj ← list of numCourses empty lists
    indeg ← array of numCourses zeros
    for each [a, b] in prerequisites:
        append a to adj[b]; indeg[a] ← indeg[a] + 1
    queue ← every course with indeg 0
    taken ← 0
    while queue is not empty:
        c ← queue.popFront(); taken ← taken + 1
        for each next in adj[c]:
            indeg[next] ← indeg[next] - 1
            if indeg[next] = 0: append next to queue
    return taken = numCourses`,
          code: `function canFinish(numCourses, prerequisites) {
  const adj = Array.from({ length: numCourses }, () => []);
  const indeg = new Array(numCourses).fill(0);
  for (const [a, b] of prerequisites) {
    adj[b].push(a);
    indeg[a]++;
  }
  const queue = [];
  for (let c = 0; c < numCourses; c++) if (indeg[c] === 0) queue.push(c);
  for (let head = 0; head < queue.length; head++) {
    for (const next of adj[queue[head]]) {
      indeg[next]--;
      if (indeg[next] === 0) queue.push(next);
    }
  }
  return queue.length === numCourses;
}`,
          time: 'O(n + E)',
          space: 'O(n + E)',
        },
      ],
      fn: 'canFinish',
      starter: `function canFinish(numCourses, prerequisites) {
  // [a, b] means b must come before a
  return false;
}`,
      solution: `function canFinish(numCourses, prerequisites) {
  const adj = Array.from({ length: numCourses }, () => []);
  const indeg = new Array(numCourses).fill(0);
  for (const [a, b] of prerequisites) {
    adj[b].push(a);
    indeg[a]++;
  }
  const queue = [];
  for (let c = 0; c < numCourses; c++) if (indeg[c] === 0) queue.push(c);
  for (let head = 0; head < queue.length; head++) {
    for (const next of adj[queue[head]]) {
      indeg[next]--;
      if (indeg[next] === 0) queue.push(next);
    }
  }
  return queue.length === numCourses;
}`,
      tests: [
        { name: 'one rule', args: [2, [[1, 0]]], expected: true },
        { name: 'two courses wait on each other', args: [2, [[1, 0], [0, 1]]], expected: false },
        { name: 'no rules', args: [5, []], expected: true },
        { name: 'course needs itself', args: [3, [[0, 0]]], expected: false },
        { name: 'diamond is fine', args: [4, [[1, 0], [2, 0], [3, 1], [3, 2]]], expected: true },
        { name: 'cycle that skips course 0', args: [4, [[1, 0], [2, 1], [3, 2], [1, 3]]], expected: false },
        { name: 'single course', args: [1, []], expected: true },
      ],
      takeaway: 'Finishable ⇔ no cycle ⇔ Kahn takes all n nodes.',
    },
    {
      id: 'graphs-course-schedule-ii',
      title: 'Plan the course order',
      difficulty: 'medium',
      leetcode: 210,
      pattern: 'Topological sort (Kahn + min-heap)',
      statement:
        "Same setup: `numCourses` courses and `prerequisites` where `[a, b]` means take `b` before `a`. Return an order that takes every course. To make the answer unique, follow this rule: **whenever several courses are ready (all their prerequisites done), take the one with the smallest number first.** If no order works, return an empty array.",
      examples: [
        { input: 'numCourses = 4, prerequisites = [[1,0],[2,0],[3,1],[3,2]]', output: '[0,1,2,3]', explain: 'After 0, both 1 and 2 are ready; 1 is smaller.' },
        { input: 'numCourses = 4, prerequisites = [[0,3],[1,3],[2,0]]', output: '[3,0,1,2]', explain: 'Only 3 is ready at first. Then 0 and 1 are ready: take 0, which unlocks 2. Then 1 < 2.' },
        { input: 'numCourses = 2, prerequisites = [[0,1],[1,0]]', output: '[]' },
      ],
      constraints: ['1 ≤ numCourses ≤ 2000', '0 ≤ prerequisites.length ≤ 5000'],
      hints: [
        "This is Kahn's algorithm, but the order matters now.",
        "A normal queue takes courses in the order they became ready, not smallest first.",
        "Use a min-heap as the ready list (`Heap` from module 12: `new Heap((a, b) => a - b)` pops the smallest). Return `[]` if fewer than `numCourses` were taken.",
      ],
      approaches: [
        {
          name: 'Rescan for the smallest ready course',
          idea: "Each round, scan all untaken courses from 0 upward and take the first whose prerequisites are all done. Correct and naturally smallest-first, but every round rescans everything.",
          time: 'O(n · (n + E))',
          space: 'O(n)',
        },
        {
          name: "Kahn's algorithm with a min-heap",
          idea: "Same in-degree counting as before, but the ready courses sit in a min-heap, so each pop gives the smallest ready course. That follows the rule exactly. Heap push/pop cost `log n`.",
          pseudo: `function findOrder(numCourses, prerequisites):
    build adj and indeg (arrow b → a for each [a, b])
    ready ← min-heap of every course with indeg 0
    order ← empty list
    while ready is not empty:
        c ← ready.pop()                     // smallest ready course
        append c to order
        for each next in adj[c]:
            indeg[next] ← indeg[next] - 1
            if indeg[next] = 0: ready.push(next)
    if length of order < numCourses: return []
    return order`,
          code: `function findOrder(numCourses, prerequisites) {
  const adj = Array.from({ length: numCourses }, () => []);
  const indeg = new Array(numCourses).fill(0);
  for (const [a, b] of prerequisites) {
    adj[b].push(a);
    indeg[a]++;
  }
  const ready = new Heap((x, y) => x - y);
  for (let c = 0; c < numCourses; c++) if (indeg[c] === 0) ready.push(c);
  const order = [];
  while (!ready.isEmpty()) {
    const c = ready.pop();
    order.push(c);
    for (const next of adj[c]) {
      indeg[next]--;
      if (indeg[next] === 0) ready.push(next);
    }
  }
  return order.length === numCourses ? order : [];
}`,
          time: 'O((n + E) log n)',
          space: 'O(n + E)',
        },
      ],
      fn: 'findOrder',
      starter: `function findOrder(numCourses, prerequisites) {
  // smallest ready course first; [] if impossible
  return [];
}`,
      solution: `function findOrder(numCourses, prerequisites) {
  const adj = Array.from({ length: numCourses }, () => []);
  const indeg = new Array(numCourses).fill(0);
  for (const [a, b] of prerequisites) {
    adj[b].push(a);
    indeg[a]++;
  }
  const ready = new Heap((x, y) => x - y);
  for (let c = 0; c < numCourses; c++) if (indeg[c] === 0) ready.push(c);
  const order = [];
  while (!ready.isEmpty()) {
    const c = ready.pop();
    order.push(c);
    for (const next of adj[c]) {
      indeg[next]--;
      if (indeg[next] === 0) ready.push(next);
    }
  }
  return order.length === numCourses ? order : [];
}`,
      tests: [
        { name: 'one rule', args: [2, [[1, 0]]], expected: [0, 1] },
        { name: 'diamond, smaller first', args: [4, [[1, 0], [2, 0], [3, 1], [3, 2]]], expected: [0, 1, 2, 3] },
        { name: 'single course', args: [1, []], expected: [0] },
        { name: 'no rules: plain order', args: [3, []], expected: [0, 1, 2] },
        { name: 'cycle', args: [2, [[0, 1], [1, 0]]], expected: [] },
        { name: 'a big number goes first', args: [4, [[0, 3], [1, 3], [2, 0]]], expected: [3, 0, 1, 2] },
        { name: 'two starting points', args: [5, [[1, 4], [2, 4], [3, 1], [3, 2]]], expected: [0, 4, 1, 2, 3] },
        { name: 'a plain queue gets this wrong', args: [3, [[0, 1]]], expected: [1, 0, 2] },
        { name: 'unlocked course is smaller than a waiting one', args: [3, [[0, 2]]], expected: [1, 2, 0] },
      ],
      takeaway: 'When the order must be canonical, make the ready list a min-heap.',
    },
    {
      id: 'graphs-eventual-safe-states',
      title: 'Safe rooms',
      difficulty: 'medium',
      leetcode: 802,
      pattern: 'Cycle detection (three colors)',
      statement:
        "A game map has rooms `0` to `n - 1` with one-way doors: `graph[i]` lists the rooms you can go to from room `i`. A room with no doors out is an exit. A room is **safe** if every possible walk from it ends at an exit, so you can never get stuck walking in circles. Return all safe rooms in increasing order.",
      examples: [
        { input: 'graph = [[1,2],[2,3],[5],[0],[5],[],[]]', output: '[2,4,5,6]', explain: '0 → 1 → 3 → 0 is a loop, so 0, 1 and 3 are not safe.' },
        { input: 'graph = [[1,2,3,4],[1,2],[3,4],[0,4],[]]', output: '[4]' },
      ],
      constraints: ['1 ≤ n ≤ 10⁴', 'a room may have a door to itself'],
      hints: [
        "A room is unsafe exactly when some walk from it reaches a cycle.",
        "Three colors: gray = on the current DFS path, black = proven safe.",
        "If DFS from a room meets a gray room or an unsafe room, the room is unsafe; leave it gray for good. If all its doors lead to safe rooms, color it black.",
      ],
      approaches: [
        {
          name: 'Search every walk from every room',
          idea: "For each room, DFS all walks and see if any revisits a room on the current path. Correct, but rooms are re-explored from scratch each time.",
          time: 'O(n · (n + E))',
          space: 'O(n)',
        },
        {
          name: 'DFS with three colors, remembering results',
          idea: "Color a room gray while exploring it. If any door leads to a gray room (a loop) or an unsafe room, this room can reach a cycle: unsafe, and it stays gray so later searches see it as unsafe instantly. Otherwise it becomes black (safe). Each room is fully explored once.",
          pseudo: `function eventualSafeNodes(graph):
    color ← array of n WHITE
    function isSafe(node):
        if color[node] ≠ WHITE: return color[node] = BLACK
        color[node] ← GRAY
        for each next in graph[node]:
            if not isSafe(next): return false   // stays GRAY
        color[node] ← BLACK
        return true
    return every node from 0 to n - 1 where isSafe(node)`,
          code: `function eventualSafeNodes(graph) {
  const n = graph.length;
  const color = new Array(n).fill(0); // 0 white, 1 gray, 2 black
  const isSafe = (node) => {
    if (color[node] !== 0) return color[node] === 2;
    color[node] = 1;
    for (const next of graph[node]) {
      if (!isSafe(next)) return false;
    }
    color[node] = 2;
    return true;
  };
  const safe = [];
  for (let i = 0; i < n; i++) if (isSafe(i)) safe.push(i);
  return safe;
}`,
          time: 'O(n + E)',
          space: 'O(n)',
        },
      ],
      fn: 'eventualSafeNodes',
      starter: `function eventualSafeNodes(graph) {
  // rooms from which every walk ends at an exit, sorted
  return [];
}`,
      solution: `function eventualSafeNodes(graph) {
  const n = graph.length;
  const color = new Array(n).fill(0);
  const isSafe = (node) => {
    if (color[node] !== 0) return color[node] === 2;
    color[node] = 1;
    for (const next of graph[node]) {
      if (!isSafe(next)) return false;
    }
    color[node] = 2;
    return true;
  };
  const safe = [];
  for (let i = 0; i < n; i++) if (isSafe(i)) safe.push(i);
  return safe;
}`,
      tests: [
        { name: 'loop through 0, 1, 3', args: [[[1, 2], [2, 3], [5], [0], [5], [], []]], expected: [2, 4, 5, 6] },
        { name: 'only the exit is safe', args: [[[1, 2, 3, 4], [1, 2], [3, 4], [0, 4], []]], expected: [4] },
        { name: 'one exit room', args: [[[]]], expected: [0] },
        { name: 'room loops to itself', args: [[[0]]], expected: [] },
        { name: 'straight line', args: [[[1], [2], []]], expected: [0, 1, 2] },
        { name: 'two rooms in a loop', args: [[[1], [0], []]], expected: [2] },
        { name: 'walk into a loop', args: [[[1], [2], [1], []]], expected: [3] },
      ],
      takeaway: 'Gray = on the path (loop if you see it again), black = finished and safe.',
    },
    {
      id: 'graphs-parallel-courses',
      title: 'Fewest semesters',
      difficulty: 'medium',
      leetcode: 1136,
      pattern: 'Topological sort by levels',
      statement:
        "There are `n` courses numbered `1` to `n`. Each `[prev, next]` in `relations` means `prev` must be finished in an **earlier** semester than `next`. In one semester you can take any number of courses, as long as all their prerequisites were finished before. Return the fewest semesters needed to take every course, or `-1` if it is impossible.",
      examples: [
        { input: 'n = 3, relations = [[1,3],[2,3]]', output: '2', explain: 'Semester 1: courses 1 and 2. Semester 2: course 3.' },
        { input: 'n = 3, relations = [[1,2],[2,3],[3,1]]', output: '-1', explain: 'The three courses wait on each other.' },
      ],
      constraints: ['1 ≤ n ≤ 5000', 'courses are numbered from 1'],
      hints: [
        "In semester 1 you can take every course with no prerequisites. Then what?",
        "Run Kahn's algorithm one level at a time. Each level is one semester.",
        "Count levels and courses taken. Fewer than `n` taken means a cycle: return -1. Watch the 1-based numbering.",
      ],
      approaches: [
        {
          name: 'Longest chain from each course',
          idea: "The answer is the number of courses on the longest prerequisite chain. Compute it by searching from every course without remembering anything. Correct (if you also detect cycles), but repeats chains many times.",
          time: 'O(n · (n + E))',
          space: 'O(n)',
        },
        {
          name: "Kahn's algorithm, level by level",
          idea: "All courses that are ready right now can be taken together this semester, so each BFS level of Kahn's algorithm is one semester. Taking ready courses as early as possible can never make you finish later.",
          pseudo: `function minimumSemesters(n, relations):
    build adj and indeg for courses 1..n (arrow prev → next)
    ready ← every course with indeg 0
    semesters ← 0; taken ← 0
    while ready is not empty:
        semesters ← semesters + 1
        nextReady ← empty list
        for each c in ready:
            taken ← taken + 1
            for each d in adj[c]:
                indeg[d] ← indeg[d] - 1
                if indeg[d] = 0: append d to nextReady
        ready ← nextReady
    return semesters if taken = n else -1`,
          code: `function minimumSemesters(n, relations) {
  const adj = Array.from({ length: n + 1 }, () => []);
  const indeg = new Array(n + 1).fill(0);
  for (const [prev, next] of relations) {
    adj[prev].push(next);
    indeg[next]++;
  }
  let ready = [];
  for (let c = 1; c <= n; c++) if (indeg[c] === 0) ready.push(c);
  let semesters = 0, taken = 0;
  while (ready.length) {
    semesters++;
    const nextReady = [];
    for (const c of ready) {
      taken++;
      for (const d of adj[c]) {
        indeg[d]--;
        if (indeg[d] === 0) nextReady.push(d);
      }
    }
    ready = nextReady;
  }
  return taken === n ? semesters : -1;
}`,
          time: 'O(n + E)',
          space: 'O(n + E)',
        },
      ],
      fn: 'minimumSemesters',
      starter: `function minimumSemesters(n, relations) {
  // courses are 1..n; one BFS level = one semester
  return -1;
}`,
      solution: `function minimumSemesters(n, relations) {
  const adj = Array.from({ length: n + 1 }, () => []);
  const indeg = new Array(n + 1).fill(0);
  for (const [prev, next] of relations) {
    adj[prev].push(next);
    indeg[next]++;
  }
  let ready = [];
  for (let c = 1; c <= n; c++) if (indeg[c] === 0) ready.push(c);
  let semesters = 0, taken = 0;
  while (ready.length) {
    semesters++;
    const nextReady = [];
    for (const c of ready) {
      taken++;
      for (const d of adj[c]) {
        indeg[d]--;
        if (indeg[d] === 0) nextReady.push(d);
      }
    }
    ready = nextReady;
  }
  return taken === n ? semesters : -1;
}`,
      tests: [
        { name: 'two then one', args: [3, [[1, 3], [2, 3]]], expected: 2 },
        { name: 'cycle', args: [3, [[1, 2], [2, 3], [3, 1]]], expected: -1 },
        { name: 'one course', args: [1, []], expected: 1 },
        { name: 'no rules: all at once', args: [4, []], expected: 1 },
        { name: 'one long chain', args: [4, [[1, 2], [2, 3], [3, 4]]], expected: 4 },
        { name: 'diamond then tail', args: [5, [[1, 2], [1, 3], [3, 4], [2, 4], [4, 5]]], expected: 4 },
        { name: 'cycle off to the side', args: [4, [[1, 2], [3, 4], [4, 3]]], expected: -1 },
      ],
      takeaway: 'Kahn level by level = "how many rounds" when independent tasks run in parallel.',
    },
  ],
  quiz: [
    {
      prompt: "For `prerequisites = [[1,0],[2,1]]` (`[a, b]` = b before a), what are the in-degrees of courses 0, 1, 2?",
      options: ['0, 1, 1', '1, 1, 0', '2, 1, 0', '0, 0, 2'],
      answer: 0,
      explanation: "Arrows are 0 → 1 and 1 → 2. Course 0 has no arrows in, 1 has one (from 0), 2 has one (from 1).",
    },
    {
      prompt: "Kahn's algorithm stops with 5 of 7 courses taken. What does that tell you?",
      options: ['The answer is the 5 courses', 'There is a cycle; the 2 leftover courses can never be taken', 'You used the wrong queue', 'Two courses had no prerequisites'],
      answer: 1,
      explanation: "Courses in or behind a cycle never reach in-degree 0, so they never become ready.",
    },
    {
      prompt: "During a three-color DFS you step onto a node that is **black**. Is that a cycle?",
      options: ['Yes, you saw it before', 'No: black means it is finished and not on the current path', 'Only in undirected graphs'],
      answer: 1,
      explanation: "Only gray (on the current path) means a loop back. Black nodes were fully explored earlier, like node 3 in the diamond.",
    },
    {
      prompt: "When several courses are ready at once, why does `findOrder` use a min-heap instead of a normal queue?",
      options: ['A heap is faster than a queue', 'The rule asks for the smallest ready course first, and a heap always pops the smallest', 'A queue cannot detect cycles'],
      answer: 1,
      explanation: "A queue takes courses in the order they became ready. The heap enforces the \"smallest first\" rule, which makes the answer unique.",
    },
  ],
  takeaways: [
    "Dependencies → directed graph. Arrow from \"must come first\" to \"comes after\".",
    "Kahn: in-degree counts, a ready list of zeros, and `taken < n` means a cycle.",
    "Directed cycle check with DFS needs three colors: white, gray (on the path), black (done).",
    "Several valid orders? Make it canonical with a min-heap, or answer with a count or yes/no.",
  ],
};

export default lesson;
