import type { Lesson } from '../types';

// Module 19, lesson 6. Owner: Content J.

const stockSpanCode = `class StockSpanner {
  constructor() {
    this.stack = []; // [price, span], prices go down from bottom to top
  }

  next(price) {
    let span = 1;
    while (this.stack.length && this.stack[this.stack.length - 1][0] <= price) {
      span += this.stack.pop()[1]; // swallow that day and everything it covered
    }
    this.stack.push([price, span]);
    return span;
  }
}

function runStockSpanner(prices) {
  const spanner = new StockSpanner();
  return prices.map((price) => spanner.next(price));
}`;

const goodNodesCode = `function goodNodes(root) {
  const dfs = (node, maxSoFar) => {
    if (!node) return 0;
    const good = node.val >= maxSoFar ? 1 : 0;
    const nextMax = Math.max(maxSoFar, node.val);
    return good + dfs(node.left, nextMax) + dfs(node.right, nextMax);
  };
  return dfs(root, -Infinity);
}`;

const divisionCode = `function calcEquation(equations, values, queries) {
  const graph = new Map(); // node -> [[neighbor, weight], ...]
  const addEdge = (from, to, weight) => {
    if (!graph.has(from)) graph.set(from, []);
    graph.get(from).push([to, weight]);
  };
  equations.forEach(([a, b], i) => {
    addEdge(a, b, values[i]);     // a / b = v
    addEdge(b, a, 1 / values[i]); // b / a = 1 / v
  });

  const ask = (start, goal) => {
    if (!graph.has(start) || !graph.has(goal)) return -1;
    const seen = new Set([start]);
    const queue = [[start, 1]];
    for (let head = 0; head < queue.length; head++) {
      const [node, product] = queue[head];
      if (node === goal) return product;
      for (const [next, weight] of graph.get(node)) {
        if (!seen.has(next)) {
          seen.add(next);
          queue.push([next, product * weight]);
        }
      }
    }
    return -1; // different islands: no chain connects them
  };

  return queries.map(([c, d]) => ask(c, d));
}`;

const lipCode = `function longestIncreasingPath(matrix) {
  const rows = matrix.length;
  const cols = matrix[0].length;
  const memo = Array.from({ length: rows }, () => new Array(cols).fill(0));
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];

  const dfs = (r, c) => {
    if (memo[r][c]) return memo[r][c];
    let best = 1; // the cell alone
    for (const [dr, dc] of dirs) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && matrix[nr][nc] > matrix[r][c]) {
        best = Math.max(best, 1 + dfs(nr, nc));
      }
    }
    memo[r][c] = best;
    return best;
  };

  let answer = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) answer = Math.max(answer, dfs(r, c));
  }
  return answer;
}`;

const lesson: Lesson = {
  id: 'mock-interviews-2',
  title: 'Mock interviews 3 & 4 (and what comes next)',
  summary: 'Two harder mocks, a debrief, and your practice plan for after the course.',
  minutes: 25,
  blocks: [
    {
      kind: 'callout',
      tone: 'story',
      title: 'A tougher sparring partner',
      text: "A boxer who wins every practice round against the same partner learns nothing new. So the coach brings in someone tougher. The point is to find the next weak spot, not to feel good. These two mocks are a little harder than the last two, and the last problem is a stretch.",
    },
    {
      kind: 'text',
      text: "Same setup as before: pick the pattern with the signals table (lesson 1), run the playbook stages (lesson 4), and follow the self-mock rules and score yourself with the rubric (lesson 5). After the mocks comes a debrief, then a plan for what to do once the course ends.",
    },
    {
      kind: 'callout',
      tone: 'tip',
      title: 'Stop here and do the mocks first',
      text: "**Mock 3** = problems 1 and 2 below (45 minutes for both). **Mock 4** = problems 3 and 4 (45 minutes; problem 4 is a hard stretch). Do Mock 3, score it, then do Mock 4, score it. Only then read on. Everything below this box is the **debrief** and has spoilers.",
    },
    {
      kind: 'text',
      text: "**Debrief (spoilers from here on).** Picture an airport board: *1 USD = 1.1 EUR* and *1 EUR = 90 INR*. You never saw a USD → INR rate, but you can hop: 1.1 × 90 = 99. Nobody said **graph**, yet it is one: currencies are nodes, rates are edges, and an answer is a path. Many problems talk about rates, courses, friends or words and never say *node* or *edge*. Your job is to see the graph, draw it, and reuse tools you already have: BFS and DFS (module 13), union-find and Dijkstra (module 14). These words give a hidden graph away:",
    },
    {
      kind: 'list',
      items: [
        "**Things plus pairwise links.** Rates between currencies, *take A before B*, *X is friends with Y*, two words that differ by one letter. Each thing is a node, each link is an edge.",
        "**A chain question.** *Can I get from X to Y?*, *how many steps from X to Y?*, *what is X in terms of Y?* That is a path search.",
        "**Ratios that multiply along a chain.** If a/b and b/c are known, a/c is their product. That is a weighted path: multiply the weights as you walk.",
        "**Arrows written as data.** Pairs like `[a, b]` or `a → b` in the input are almost always an edge list.",
        "**A grid with a move rule.** *Step to a neighbor only if it is higher* turns every cell into a node with arrows to some of its neighbors (Mock 4, problem 4).",
      ],
    },
    {
      kind: 'table',
      title: 'Quick debrief: the signal you should have heard',
      head: ['Problem', 'Signal in the words', 'Pattern (module)'],
      rows: [
        ['Stock span', '*how many days back in a row* was the price ≤ today', 'Monotonic stack of [price, span] (module 6)'],
        ['Good nodes', '*every value on the path from the root*', 'DFS that passes the max so far down (module 10)'],
        ['Evaluate division', 'pairs of things with a ratio, *what is c / d*', 'Hidden weighted graph + BFS (module 13)'],
        ['Longest increasing path', 'grid, move only to a bigger neighbor, longest', 'DFS + memo; no cycles possible (modules 13 and 16)'],
      ],
    },
    {
      kind: 'text',
      text: "**Modelling Evaluate Division.** Each letter is a node. A fact `a / b = 2` gives **two** arrows: a → b with weight 2, and b → a with weight 1/2 (flip the fraction). To answer `a / c`, walk any path from a to c and **multiply** the weights. If a letter never showed up in any fact, it is not in the graph, so the answer is −1. If a and c are in different islands, no path exists, so −1 again.",
    },
    {
      kind: 'diagram',
      title: 'Facts a / b = 2 and b / c = 3 as a graph',
      art: ` fact a / b = 2         fact b / c = 3

        ×2               ×3
   a ───────▶  b  ───────▶  c
   a ◀───────  b  ◀───────  c
        ×1/2             ×1/3

 a / c :  a → b → c   =  2 × 3       =  6
 c / a :  c → b → a   =  1/3 × 1/2   =  1/6
 a / e :  e is not a node             = -1`,
      caption: "Every fact adds an arrow both ways. A query is a path, and its answer is the product of the weights on it.",
    },
    {
      kind: 'trace',
      title: 'BFS for the query a / c',
      columns: ['Step', 'Take from queue', 'Push neighbors', 'Seen'],
      rows: [
        [0, '—', '(a, 1) to start', '{a}'],
        [1, '(a, 1)', '(b, 1 × 2 = 2)', '{a, b}'],
        [2, '(b, 2)', 'a is seen, skip; (c, 2 × 3 = 6)', '{a, b, c}'],
        [3, '(c, 6)', 'c is the goal → return 6', '{a, b, c}'],
      ],
      note: "Each queue item carries two things: the node, and the product from the start to that node.",
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'Rename the nouns',
      text: "When a problem feels new, rename its nouns. Currencies, courses, people, words, cells: call them **nodes**. Rates, rules, friendships, one-letter changes, legal moves: call them **edges**. Most of the time the problem you are left with is one you already solved in module 13 or 14.",
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Evaluate division: build the graph, then BFS each query',
      code: `function calcEquation(equations, values, queries):
    graph ← empty map                  // node → list of (next, weight)
    for i from 0 to n - 1:
        (a, b) ← equations[i]
        add (b, values[i]) to graph[a]
        add (a, 1 / values[i]) to graph[b]
    answers ← empty list
    for each (start, goal) in queries:
        if start not in graph or goal not in graph:
            append -1 to answers
            continue
        seen ← {start}
        queue ← [(start, 1)]
        result ← -1
        while queue is not empty:
            (node, product) ← queue.popFront()
            if node = goal:
                result ← product
                stop the loop
            for each (next, w) in graph[node]:
                if next not in seen:
                    add next to seen
                    queue.pushBack((next, product × w))
        append result to answers
    return answers`,
    },
    {
      kind: 'code',
      lang: 'js',
      title: 'Evaluate division in JavaScript',
      code: divisionCode,
    },
    {
      kind: 'compare',
      title: 'Ways to answer the queries',
      rows: [
        { approach: 'Fill a table of every pair (triple loop)', time: 'O(V³) once, O(1) per query', space: 'O(V²)', note: "Works, but fills in pairs nobody asked about. Worth it only for a huge number of queries." },
        { approach: 'Build the graph, BFS per query', time: 'O(Q × (V + E))', space: 'O(V + E)', note: "**Say this one in the interview.** Simple, and inputs are small. V = letters, E = facts, Q = queries." },
        { approach: 'Union-find with weights', time: 'nearly O(E + Q)', space: 'O(V)', note: "Each node stores its ratio to its group's root. Fastest, but tricky to write under time. Mention it as a follow-up (module 14)." },
      ],
    },
    {
      kind: 'callout',
      tone: 'trap',
      title: 'Three ways to lose points on this problem',
      text: "**1. Unknown letters.** `x / x` is 1 only if x appears in some fact. If x is unknown, the answer is −1, not 1. Check *both letters are in the graph* before anything else. **2. No seen set.** Every fact adds arrows both ways, so a → b → a → b … loops forever. Mark a node seen the moment you push it. **3. Forgetting the flip.** Adding only a → b means `b / a` comes back −1 when the answer is 1/2.",
    },
    {
      kind: 'list',
      items: [
        "**What comes next.** The course ends here; your practice doesn't. These four habits turn *I followed the lesson* into *I can solve it alone*.",
        "**Redo every miss after 1, 3 and 7 days.** A miss is any problem where you needed a hint or went over time. Redo it from a blank editor. If you nail it on day 7, it is yours.",
        "**One mixed mock per week.** Two random mediums from different patterns, 45 minutes, timer on, scored with the rubric from lesson 5.",
        "**Keep a miss log:** one line per miss, *signal I missed → pattern*. Example: *\"how many days back in a row\" → monotonic stack*. Read the log before every mock.",
        "**Aim for about 150 mediums**, spread over all the patterns. At 2 new problems a day, 6 days a week, that is about 12 weeks. Spread beats depth: 15 problems in each of 10 patterns beats 50 problems in 3.",
      ],
    },
    {
      kind: 'table',
      title: 'Your first 4 weeks (then repeat the cycle)',
      head: ['Week', 'New problems (2 a day)', 'Every day', 'End of week'],
      rows: [
        ['1', 'Your 3 weakest patterns from the miss log', 'Redo misses due today (day 1 / 3 / 7)', 'Mixed mock, score it'],
        ['2', 'The next 3 weakest patterns', 'Redo misses; add new ones to the log', 'Mixed mock, score it'],
        ['3', 'Graphs and DP (the biggest families)', 'Redo misses; say each signal out loud', 'Mixed mock with one hard'],
        ['4', 'Random mix only: hide the topic tag', 'Redo misses; read the log first', 'Two mocks; compare scores with week 1'],
      ],
    },
  ],
  problems: [
    {
      id: 'pattern-mastery-stock-span',
      title: 'Price streak badge',
      difficulty: 'medium',
      leetcode: 901,
      pattern: 'Mock 3',
      statement: "A stock app shows a *streak* badge next to today's price. The streak is how many days in a row, counting back from today and including today, the price was ≤ today's price. Prices arrive one day at a time, and the app must answer right after each one. Write `runStockSpanner(prices)` that feeds the prices in order and returns the streak for each day. Try to make each new day cheap, not a walk through all of history.",
      examples: [
        { input: 'prices = [100, 80, 60, 70, 60, 75, 85]', output: '[1, 1, 1, 2, 1, 4, 6]', explain: "On the day of 75, the days 60, 70, 60 and 75 itself are all ≤ 75, but 80 is not, so the streak is 4. On 85, everything back to (not including) 100 counts: 6." },
        { input: 'prices = [7, 7, 7]', output: '[1, 2, 3]', explain: 'Equal prices count, because the rule is ≤.' },
      ],
      constraints: ['1 ≤ price ≤ 10⁵', 'up to 10⁴ days'],
      hints: [
        "Which pattern fits? Look at *how many days back in a row* and *≤ today*. You keep asking about the nearest earlier day that is **bigger**. Which structure answers *nearest bigger to the left* fast?",
        "It is a monotonic stack (module 6). Keep a stack of past days whose prices go down from bottom to top. A smaller old day can never block a future day once a bigger one comes after it.",
        "Store pairs `[price, span]`. For a new price, start with span 1. While the top price is ≤ the new price, pop it and add its span to yours. Push `[price, span]` and return span.",
      ],
      approaches: [
        {
          name: 'Walk back every day',
          idea: 'Keep every price. For each new day, step backward until you hit a bigger price, counting as you go. Correct, but a long rising run makes each day walk all the way back.',
          time: 'O(n²)',
          space: 'O(n)',
        },
        {
          name: 'Monotonic stack of [price, span]',
          idea: "When today's price beats an old day, that old day can never be the blocker for any later day, because today is bigger and closer. So pop it and keep its span inside today's span. Each day is pushed once and popped at most once, so each call is O(1) on average.",
          pseudo: `class StockSpanner:
    stack ← empty stack                 // (price, span), prices go down
    function next(price):
        span ← 1
        while stack not empty and top price ≤ price:
            span ← span + top span
            pop from stack
        push (price, span) onto stack
        return span

function runStockSpanner(prices):
    spanner ← new StockSpanner
    answers ← empty list
    for each p in prices:
        append spanner.next(p) to answers
    return answers`,
          code: stockSpanCode,
          time: 'O(1) on average per day, O(n) total',
          space: 'O(n)',
        },
      ],
      fn: 'runStockSpanner',
      starter: `function runStockSpanner(prices) {
  // return the streak for each day, in order
  return [];
}`,
      solution: stockSpanCode,
      tests: [
        { name: 'classic example', args: [[100, 80, 60, 70, 60, 75, 85]], expected: [1, 1, 1, 2, 1, 4, 6] },
        { name: 'single day', args: [[5]], expected: [1] },
        { name: 'always rising', args: [[1, 2, 3, 4]], expected: [1, 2, 3, 4] },
        { name: 'always falling', args: [[4, 3, 2, 1]], expected: [1, 1, 1, 1] },
        { name: 'all equal', args: [[7, 7, 7]], expected: [1, 2, 3] },
        { name: 'big jump then drop', args: [[10, 4, 5, 90, 120, 80]], expected: [1, 1, 2, 4, 5, 1] },
        { name: 'zigzag', args: [[3, 1, 2, 1, 5, 4]], expected: [1, 1, 2, 1, 5, 1] },
      ],
      takeaway: "*how far back until something bigger* → monotonic stack that stores what each popped item covered.",
    },
    {
      id: 'pattern-mastery-good-nodes',
      title: 'Record-setting levels',
      difficulty: 'medium',
      leetcode: 1448,
      pattern: 'Mock 3',
      statement: "A game's levels form a binary tree, starting at the root level. Each level has your score. A level is a **record** if its score is ≥ every score on the path from the root down to it (the root is always a record). Write `goodNodes(root)` that returns how many record levels there are. Scores can be negative.",
      examples: [
        { input: 'root = [3, 1, 4, 3, null, 1, 5]', output: '4', explain: 'Records: 3 (root), 4 (3 → 4), 5 (3 → 4 → 5), and the left 3 (3 → 1 → 3). The 1s are smaller than 3.' },
        { input: 'root = [3, 3, null, 4, 2]', output: '3', explain: 'The root 3, the child 3 (equal counts), and 4. The 2 is below 3.' },
      ],
      constraints: ['1 ≤ number of nodes ≤ 10⁵', '-10⁴ ≤ value ≤ 10⁴'],
      hints: [
        "Which pattern fits? Look at *every score on the path from the root down to it*. What one number about that path would be enough to decide?",
        "It is a tree DFS (module 10) that passes information **down**: carry the biggest value seen on the path so far.",
        "`dfs(node, maxSoFar)`: return 0 for null. The node counts if `node.val ≥ maxSoFar`. Recurse into both children with `max(maxSoFar, node.val)`. Start with `-Infinity`, not 0, because scores can be negative.",
      ],
      approaches: [
        {
          name: 'Keep the whole path',
          idea: 'Walk the tree with a list of the values on the current path. At each node, check it against every value in the list. Correct, but a long thin tree makes each check long.',
          time: 'O(n × h)',
          space: 'O(h)',
        },
        {
          name: 'DFS passing the max down',
          idea: 'To beat every value on the path you only need to beat the biggest one. So carry just that one number down the tree. Each node is visited once.',
          pseudo: `function goodNodes(root):
    return dfs(root, -infinity)

function dfs(node, maxSoFar):
    if node is null:
        return 0
    good ← 1 if node.val ≥ maxSoFar else 0
    nextMax ← max(maxSoFar, node.val)
    return good + dfs(node.left, nextMax) + dfs(node.right, nextMax)`,
          code: goodNodesCode,
          time: 'O(n)',
          space: 'O(h) for the recursion',
        },
      ],
      fn: 'goodNodes',
      starter: `function goodNodes(root) {
  // count nodes that are >= every value above them
  return 0;
}`,
      solution: goodNodesCode,
      shapes: { args: ['tree'] },
      tests: [
        { name: 'mixed tree', args: [[3, 1, 4, 3, null, 1, 5]], expected: 4 },
        { name: 'equal values count', args: [[3, 3, null, 4, 2]], expected: 3 },
        { name: 'single node', args: [[1]], expected: 1 },
        { name: 'all negative, falling', args: [[-1, -2, -3]], expected: 1 },
        { name: 'negatives with a rise', args: [[-5, -3, -8, null, -3]], expected: 3 },
        { name: 'deeper tree', args: [[2, null, 4, 10, 8, null, null, 4]], expected: 4 },
        { name: 'falling chain', args: [[5, 4, null, 3, null, 2]], expected: 1 },
        { name: 'all equal', args: [[1, 1, 1, 1]], expected: 4 },
      ],
      takeaway: "*compare with everything on the path from the root* → DFS that carries one summary value (the max) down.",
    },
    {
      id: 'pattern-mastery-evaluate-division',
      title: 'Exchange board',
      difficulty: 'medium',
      leetcode: 399,
      pattern: 'Mock 4',
      statement: "An exchange board lists facts like `[\"a\", \"b\"]` with value 2.0, meaning *a / b = 2* (one a is worth 2 b). Then people ask questions like `[\"a\", \"c\"]`: what is a / c? Write `calcEquation(equations, values, queries)` that returns one number per question. If the answer can't be worked out from the facts, return −1 for it. The facts never contradict each other, and no value is 0.",
      examples: [
        { input: 'equations = [["a","b"],["b","c"]], values = [2, 3], queries = [["a","c"],["b","a"],["a","e"],["a","a"],["x","x"]]', output: '[6, 0.5, -1, 1, -1]', explain: 'a / c = (a / b) × (b / c) = 6. b / a = 1/2. e and x never appear in a fact, so −1, even for x / x.' },
        { input: 'equations = [["USD","EUR"],["EUR","INR"]], values = [1.1, 90], queries = [["USD","INR"]]', output: '[99]', explain: '1.1 × 90 = 99.' },
      ],
      constraints: ['1 ≤ equations ≤ 20', '1 ≤ queries ≤ 20', 'names are short strings', '0 < value ≤ 20'],
      hints: [
        "Which pattern fits? You have *things* and *links between pairs of things*, and you are asked *what is X compared to Y* when X and Y were never linked directly. What picture has things and links?",
        "It is a hidden graph (module 13). Each name is a node. `a / b = v` gives an edge a → b with weight v, and b → a with weight 1 / v.",
        "For each query, BFS from the first name. Carry the running product with each queue item and multiply by the edge weight as you step. Reach the goal → return the product. Unknown name or no path → −1. Use a seen set so you don't loop.",
      ],
      approaches: [
        {
          name: 'Fill a table of every pair',
          idea: 'Put every known ratio in a V × V table, then for each middle node k, fill `t[i][j] = t[i][k] × t[k][j]` when both are known (a triple loop over i, k, j). Then each query is a lookup. Correct, but it does V³ work for pairs nobody asked about.',
          time: 'O(V³ + Q)',
          space: 'O(V²)',
        },
        {
          name: 'Build the graph, BFS per query',
          idea: "Multiplying ratios along a chain gives the ratio of its ends: (a/b) × (b/c) = a/c. So any path from start to goal gives the answer, and BFS finds one. The facts never contradict, so every path gives the same number.",
          pseudo: `function calcEquation(equations, values, queries):
    graph ← map: node → list of (next, weight)
    for i from 0 to n - 1:
        (a, b) ← equations[i]
        add (b, values[i]) to graph[a]
        add (a, 1 / values[i]) to graph[b]
    for each (start, goal) in queries:
        if start or goal not in graph: answer -1
        BFS from (start, 1); on each step multiply by w
        reach goal → answer the product; else answer -1
    return the answers`,
          code: divisionCode,
          time: 'O(Q × (V + E))',
          space: 'O(V + E)',
        },
      ],
      fn: 'calcEquation',
      starter: `function calcEquation(equations, values, queries) {
  // one number per query, -1 when it can't be worked out
  return [];
}`,
      solution: divisionCode,
      compare: 'float',
      tests: [
        {
          name: 'classic example',
          args: [[['a', 'b'], ['b', 'c']], [2, 3], [['a', 'c'], ['b', 'a'], ['a', 'e'], ['a', 'a'], ['x', 'x']]],
          expected: [6, 0.5, -1, 1, -1],
        },
        {
          name: 'currency chain',
          args: [[['USD', 'EUR'], ['EUR', 'INR']], [1.1, 90], [['USD', 'INR'], ['INR', 'USD'], ['EUR', 'USD']]],
          expected: [99, 0.0101010101, 0.9090909091],
        },
        {
          name: 'two separate islands',
          args: [[['a', 'b'], ['c', 'd']], [2, 3], [['a', 'c'], ['a', 'b'], ['d', 'c'], ['b', 'd']]],
          expected: [-1, 2, 0.3333333333, -1],
        },
        {
          name: 'cycle in the facts',
          args: [[['a', 'b'], ['b', 'c'], ['a', 'c']], [2, 3, 6], [['c', 'a'], ['c', 'b'], ['b', 'b']]],
          expected: [0.1666666667, 0.3333333333, 1],
        },
        {
          name: 'long chain',
          args: [[['a', 'b'], ['b', 'c'], ['c', 'd'], ['d', 'e']], [2, 2, 2, 2], [['a', 'e'], ['e', 'a'], ['c', 'a']]],
          expected: [16, 0.0625, 0.25],
        },
        {
          name: 'unknown names, even x / x',
          args: [[['x1', 'x2']], [4], [['x2', 'x1'], ['x1', 'x2'], ['x1', 'x1'], ['x3', 'x3'], ['x1', 'x3']]],
          expected: [0.25, 4, 1, -1, -1],
        },
      ],
      takeaway: "*pairs of things with a ratio, ask about a pair never linked* → hidden weighted graph, multiply weights along a BFS path.",
    },
    {
      id: 'pattern-mastery-longest-increasing-path',
      title: 'Longest uphill hike',
      difficulty: 'hard',
      leetcode: 329,
      pattern: 'Mock 4',
      statement: "**Stretch (hard).** A hiking map is a grid of heights. You can start on any cell and step up, down, left or right (no diagonals, no leaving the map), but each step must go to a **strictly higher** cell. Write `longestIncreasingPath(matrix)` that returns the number of cells on the longest hike you can take.",
      examples: [
        { input: 'matrix = [[9,9,4],[6,6,8],[2,1,1]]', output: '4', explain: 'One longest hike: 1 → 2 → 6 → 9.' },
        { input: 'matrix = [[7,7],[7,7]]', output: '1', explain: 'Every neighbor is equal, not higher, so you can only stand still.' },
      ],
      constraints: ['1 ≤ rows, cols ≤ 200', '0 ≤ height ≤ 2³¹ − 1'],
      hints: [
        "Which pattern fits? Look at *step to a neighbor only if it is higher* and *longest*. Each cell plus its legal moves is a picture you know. And ask yourself: does the best hike from a cell ever change?",
        "It is a hidden graph (module 13): cells are nodes, an arrow goes from a cell to each higher neighbor. Steps always go up, so you can never come back to a cell: no cycles, so no seen set is needed.",
        "Use DFS with memo (module 16). `best(cell) = 1 + max(best(higher neighbor))`, or 1 if no neighbor is higher. Store each cell's answer the first time you compute it. Try every cell as a start and keep the max.",
      ],
      approaches: [
        {
          name: 'DFS from every cell, no memo',
          idea: 'From each cell, try every uphill neighbor and take the longest. Correct, but the same cell gets solved again and again from different starts, and the work can blow up exponentially.',
          time: 'exponential in the worst case',
          space: 'O(m × n) recursion',
        },
        {
          name: 'DFS + memo',
          idea: "The longest hike from a cell depends only on that cell, never on how you got there, so its answer never changes: compute it once and store it. Strictly higher steps mean no cycles, so the recursion always ends. Each cell is solved once and looks at 4 neighbors.",
          pseudo: `function longestIncreasingPath(matrix):
    memo ← rows × cols grid of 0
    answer ← 0
    for each cell (r, c):
        answer ← max(answer, best(r, c))
    return answer

function best(r, c):
    if memo[r][c] ≠ 0:
        return memo[r][c]
    result ← 1                          // the cell alone
    for each neighbor (nr, nc) inside the grid:
        if matrix[nr][nc] > matrix[r][c]:
            result ← max(result, 1 + best(nr, nc))
    memo[r][c] ← result
    return result`,
          code: lipCode,
          time: 'O(m × n)',
          space: 'O(m × n)',
        },
      ],
      fn: 'longestIncreasingPath',
      starter: `function longestIncreasingPath(matrix) {
  // number of cells on the longest strictly rising walk
  return 0;
}`,
      solution: lipCode,
      tests: [
        { name: 'classic example', args: [[[9, 9, 4], [6, 6, 8], [2, 1, 1]]], expected: 4 },
        { name: 'second example', args: [[[3, 4, 5], [3, 2, 6], [2, 2, 1]]], expected: 4 },
        { name: '1 × 1', args: [[[1]]], expected: 1 },
        { name: 'all equal', args: [[[7, 7], [7, 7]]], expected: 1 },
        { name: 'strictly increasing row', args: [[[1, 2, 3, 4, 5]]], expected: 5 },
        { name: 'snake through the whole grid', args: [[[1, 2, 3], [6, 5, 4], [7, 8, 9]]], expected: 9 },
        { name: 'single column', args: [[[3], [2], [1]]], expected: 3 },
        { name: 'loop around a 2 × 2', args: [[[1, 2], [4, 3]]], expected: 4 },
      ],
      takeaway: "*grid + move only to a higher neighbor + longest* → a one-way graph (no cycles) hiding in the grid, DFS + memo per cell.",
    },
  ],
  quiz: [
    {
      prompt: 'Which of these is secretly a graph problem?',
      options: [
        "Courses with rules like *take A before B*: can you finish them all?",
        'Find the biggest sum of a contiguous part of an array.',
        'Keep the k-th largest score as new scores arrive.',
        'Find the longest substring with no repeated letter.',
      ],
      answer: 0,
      explanation: "Courses are nodes and *A before B* is an arrow A → B. Can you finish them all means: is there a cycle? That's topological sort (module 13). The others are Kadane (module 16), a heap (module 12) and a sliding window (module 4).",
    },
    {
      prompt: 'You read the fact `a / b = 4`. What edges do you add?',
      options: [
        'Only a → b with weight 4.',
        'a → b with weight 4, and b → a with weight 1/4.',
        'a → b with weight 1/4, and b → a with weight 4.',
        'One undirected edge a — b with weight 4.',
      ],
      answer: 1,
      explanation: "a / b = 4 and so b / a = 1/4. You need both directions, or a query like `b / a` finds no path. An undirected edge can't carry two different weights.",
    },
    {
      prompt: 'In Evaluate Division, the query is `x / x`, but x never appears in any fact. What do you return?',
      options: ['1, because anything divided by itself is 1', '−1', '0', 'Throw an error'],
      answer: 1,
      explanation: "The rule is *answer only what the facts let you work out*. With no fact about x, you know nothing about it, so the answer is −1. Check that both names are in the graph before the x / x shortcut.",
    },
    {
      prompt: 'You needed a hint on a problem on Monday. Following the plan, when do you redo it?',
      options: [
        'Never, you saw the answer already',
        'Monday night, then never again',
        'Tuesday, Thursday and next Monday (after 1, 3 and 7 days)',
        'Only at the end of the 4 weeks',
      ],
      answer: 2,
      explanation: "Spaced redos make the pattern stick. One day later checks you understood it; three and seven days later check you can still **spot** it without the lesson in front of you.",
    },
  ],
  takeaways: [
    "If a problem has *things + pairwise links* and asks *can I get from X to Y* or *what is X in terms of Y*, draw it as nodes and edges, then reuse BFS/DFS (module 13) or union-find (module 14).",
    "Ratio facts become two weighted edges (v and 1/v). A query is a path, and its answer is the product of the weights. Unknown name → −1, even for x / x.",
    "Strictly increasing moves can't make a cycle, so DFS + memo is safe and each cell is solved once.",
    "After the course: redo misses after 1, 3 and 7 days, one mixed mock a week, a *signal → pattern* miss log, and about 150 mediums spread across patterns.",
  ],
};

export default lesson;
