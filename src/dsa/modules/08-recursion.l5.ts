import type { Lesson } from '../types';

// Module 8, lesson 5: divide and conquer beyond sorting.
// Split at every operator (241), or split around a "bad" item that can never be in the answer (1763, 395).
const lesson: Lesson = {
  id: 'divide-and-conquer',
  title: 'Divide and conquer beyond sorting',
  summary: 'Split anywhere that makes independent parts: at every operator, or around an item that can never be in the answer.',
  minutes: 22,
  blocks: [
    {
      kind: 'callout',
      tone: 'story',
      title: 'A calculator with no brackets',
      text: 'Type `2*3-4*5` into a cheap calculator that works left to right and you get `((2*3)-4)*5 = 10`. A spreadsheet follows school rules and gets `(2*3)-(4*5) = -14`. Same keys, different answers. Spreadsheets and compilers settle this with **precedence**: a fixed rule for which operator goes first. Today you flip the question around: what are **all** the answers you could get, one for each way to place the brackets?',
    },
    {
      kind: 'text',
      text: '**The problem.** You get an expression of whole numbers (0 to 99) joined by `+`, `-` and `*`. Return the value of every way to fully bracket it, one value per bracket placement, so duplicates stay. `2-1-1` has two placements: `(2-1)-1 = 0` and `2-(1-1) = 2`, so the answer is `[0, 2]`. `2*3-4*5` has five placements, and two of them both give `-10`, so the answer is `[-34, -14, -10, -10, 10]`.',
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Brute force: try every order of the operators',
      code: `function waysBrute(expr):
    results ← empty list
    seen ← empty set                    // bracket strings already counted
    for each order of the k operators:  // k! orders
        apply the operators in that order,
            writing brackets around each step
        if that bracket string is not in seen:
            add it to seen
            append its value to results
    return results`,
    },
    {
      kind: 'text',
      text: 'This works. The cost is the problem. With `k` operators there are `k!` orders (k factorial: k × (k-1) × … × 1). In `2*3-4*5`, "first `*`, then second `*`" and "second `*`, then first `*`" both build `(2*3)-(4*5)`, so 6 orders give only 5 placements. At 9 operators it gets silly: **362,880 orders for only 4,862 placements**. **Spot the waste:** most orders rebuild a bracket string you already have, and every order starts from scratch, so a small piece like `4*5` is worked out again and again.',
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'Pick the operator that runs last',
      text: 'Every bracket placement has exactly one operator that is applied **last**. Fix it. Everything to its left is a smaller expression, everything to its right is another one, and the two sides do not affect each other. So **trust the calls**: `ways(left)` returns every value the left side can make, `ways(right)` every value of the right side. Pair **every** left value with **every** right value using that operator. Do this for each operator in turn. If there is no operator at all, the string is just a number.',
    },
    {
      kind: 'diagram',
      title: 'Splitting "2*3-4*5" at each operator',
      art: `ways("2*3-4*5")
│
├─ last op = 1st *    "2"  *  "3-4*5"
│    ways("2") = [2]
│    ways("3-4*5"):
│       last op - :  [3] - [20]   → [-17]
│       last op * :  [-1] * [5]   → [-5]
│       = [-17, -5]
│    2 * each of [-17, -5]        → [-34, -10]
│
├─ last op = -        "2*3"  -  "4*5"
│    [6] - [20]                   → [-14]
│
├─ last op = 2nd *    "2*3-4"  *  "5"
│    ways("2*3-4") = [-2, 2]
│    each of [-2, 2] * 5          → [-10, 10]
│
└─ answer: [-34, -10, -14, -10, 10]`,
      caption: 'Each branch is one choice of the last operator. Lists of values flow **up**; the parent only pairs them. Every placement is built exactly once.',
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Split at every operator',
      code: `function ways(expr):
    results ← empty list
    for i from 0 to length(expr) - 1:
        op ← expr[i]
        if op is not +, - or *:
            continue                    // digits are not split points
        lefts ← ways(expr[0 .. i - 1])  // trust the call
        rights ← ways(expr[i + 1 .. end])
        for each a in lefts:
            for each b in rights:
                append (a op b) to results
    if results is empty:                // no operator: a plain number
        append number(expr) to results
    return results`,
    },
    {
      kind: 'code',
      lang: 'js',
      code: `function diffWaysToCompute(expression) {
  const results = [];
  for (let i = 0; i < expression.length; i++) {
    const op = expression[i];
    if (op !== '+' && op !== '-' && op !== '*') continue;
    const lefts = diffWaysToCompute(expression.slice(0, i));
    const rights = diffWaysToCompute(expression.slice(i + 1));
    for (const a of lefts) {
      for (const b of rights) {
        if (op === '+') results.push(a + b);
        else if (op === '-') results.push(a - b);
        else results.push(a * b);
      }
    }
  }
  // No operator found: the whole string is one number, maybe two digits like "11".
  if (results.length === 0) results.push(Number(expression));
  return results;
}`,
    },
    {
      kind: 'compare',
      title: 'All bracket placements (k = number of operators)',
      rows: [
        {
          approach: 'Every order of operators + skip repeats',
          time: 'O(k! · n)',
          space: 'O(R · n)',
          note: 'Correct, but most of the `k!` orders rebuild a placement already seen. R = number of results.',
        },
        {
          approach: 'Split at every operator',
          time: 'fast-growing (Catalan)',
          space: 'same as the output',
          note: 'Each placement is built once. The count grows fast (1, 2, 5, 14, 42, …) but is fine for ≤ 20 characters.',
        },
        {
          approach: 'Split + cache each sub-expression',
          time: 'less repeated work',
          space: 'cache of lists',
          note: '`ways("4*5")` is asked for many times. Saving the answer the first time is **memoization**, module 16.',
        },
      ],
    },
    {
      kind: 'text',
      text: '**Second kind of split: around a bad item.** A chef plans a tasting menu: a row of dishes, and she will serve one unbroken stretch. One dish uses a spoiled ingredient. Any stretch that contains it is ruined, so she cuts the row at that dish and plans each side on its own. The string version: in `ababbc`, find the longest substring (an unbroken piece of the string) where **every letter appears at least `k = 2` times**. The answer is `ababb`, length 5. Brute force checks all n² substrings with a 26-letter count: about `26 · n²` steps, too slow for n = 10,000.',
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'A rare letter is a wall',
      text: 'If a letter appears fewer than `k` times **in the current piece**, no substring of that piece can hold `k` copies of it. So it can never be in the answer: it is a wall. Cut the piece at every wall, trust the call on each smaller piece, and keep the best. If a piece has no wall, every letter is frequent enough, so the whole piece is valid: return its length. Each smaller piece is missing at least one letter its parent had, so there are at most 26 levels: about `26 · n` steps.',
    },
    {
      kind: 'steps',
      title: 'Longest substring with every letter at least k = 3 times, on "bbaaacbd"',
      frames: [
        {
          cells: ['b', 'b', 'a', 'a', 'a', 'c', 'b', 'd'],
          active: [0, 1, 2, 3, 4, 5, 6, 7],
          vars: { piece: '"bbaaacbd"', counts: 'a:3 b:3 c:1 d:1' },
          note: 'Count every letter in the whole string. `k = 3`.',
        },
        {
          cells: ['b', 'b', 'a', 'a', 'a', 'c', 'b', 'd'],
          active: [5, 7],
          vars: { walls: 'c, d', pieces: '"bbaaa", "b"' },
          note: '`c` and `d` appear fewer than 3 times. No valid substring can contain them, so they are walls. Cut there.',
        },
        {
          cells: ['b', 'b', 'a', 'a', 'a', 'c', 'b', 'd'],
          active: [0, 1, 2, 3, 4],
          done: [5, 7],
          vars: { piece: '"bbaaa"', counts: 'a:3 b:2' },
          note: 'Trust the call on the left piece. It counts again: `b` was fine in the whole string, but here it appears only 2 times. New wall.',
        },
        {
          cells: ['b', 'b', 'a', 'a', 'a', 'c', 'b', 'd'],
          found: [2, 3, 4],
          done: [0, 1, 5, 7],
          vars: { piece: '"aaa"', counts: 'a:3', returns: 3 },
          note: 'Cut at both `b`s. In `aaa` every letter appears at least 3 times, so there is no wall: return the length, **3**.',
        },
        {
          cells: ['b', 'b', 'a', 'a', 'a', 'c', 'b', 'd'],
          active: [6],
          found: [2, 3, 4],
          done: [0, 1, 5, 7],
          vars: { piece: '"b"', returns: 0 },
          note: 'The right piece `b` is shorter than `k`, so it returns 0 right away.',
        },
        {
          cells: ['b', 'b', 'a', 'a', 'a', 'c', 'b', 'd'],
          found: [2, 3, 4],
          done: [0, 1, 5, 6, 7],
          vars: { answer: 3 },
          note: 'Keep the best piece: `max(3, 0) = 3`. The answer is `aaa`.',
        },
      ],
    },
    {
      kind: 'list',
      items: [
        '**Divide and conquer** means: split the problem into parts that do not affect each other, solve each part with a recursive call (trust it), then combine the answers.',
        '**Split in half** when combining two halves is cheap (merge sort, lesson 3).',
        '**Try every split** when the answer depends on where you cut: every operator, every split point. Combine by pairing every left result with every right result.',
        '**Split around a bad item** when some item can never be in the answer (a rare letter, a letter missing its other case). Combine by keeping the best piece.',
        'Not the same as **backtracking** (module 9): backtracking builds one answer a choice at a time and undoes choices. Here each part is solved fully on its own and the results are combined.',
      ],
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Two templates',
      code: `// Try every split: all results
function solve(expr):
    results ← empty list
    for each split point p in expr:
        lefts ← solve(part left of p)
        rights ← solve(part right of p)
        for each a in lefts:
            for each b in rights:
                append combine(a, p, b) to results
    if there was no split point:
        return [value of expr]          // base case
    return results

// Split around bad items: best piece
function best(piece):
    if piece is too small: return 0
    walls ← items that can never be in an answer here
    if walls is empty:
        return answer for the whole piece   // base case
    result ← 0
    for each part between walls:
        result ← max(result, best(part))
    return result`,
    },
    {
      kind: 'callout',
      tone: 'trap',
      title: 'Base cases and ties',
      text: '**No operator means a number.** If a call gets no split point, return `[Number(expr)]`. Do not read just `expr[0]`: numbers can have two digits, like `11`. **No wall means the whole piece.** In the rare-letter problem, if nothing is too rare you must return the piece length. Splitting again would call the same piece forever. **Ties keep the earliest.** When you keep the longest piece, replace the best only when the new one is strictly longer, so the left (earlier) piece wins a tie.',
    },
  ],
  problems: [
    {
      id: 'recursion-add-parentheses',
      title: 'Every way to place the brackets',
      difficulty: 'medium',
      leetcode: 241,
      pattern: 'Divide and conquer (try every split)',
      statement: 'Your calculator app lost its bracket keys. You get an expression made of whole numbers (0 to 99) and the operators `+`, `-` and `*`, with no spaces. Return the value of **every** way to fully bracket it. Give one value per bracket placement, so if two placements give the same number, it appears twice. Any order is fine.',
      examples: [
        { input: 'expression = "2-1-1"', output: '[0, 2]', explain: '`(2-1)-1 = 0` and `2-(1-1) = 2`.' },
        {
          input: 'expression = "2*3-4*5"',
          output: '[-34, -14, -10, -10, 10]',
          explain: '`2*(3-(4*5))`, `(2*3)-(4*5)`, `(2*(3-4))*5`, `2*((3-4)*5)`, `((2*3)-4)*5`.',
        },
      ],
      constraints: [
        '1 ≤ expression.length ≤ 20',
        'only digits and `+ - *`',
        'every number is between 0 and 99',
      ],
      hints: [
        'Think about the operator that is applied **last**. What sits on its left and on its right?',
        'Both sides are smaller expressions of the same kind. Ask your own function for all their values.',
        'For each operator: `lefts = solve(left part)`, `rights = solve(right part)`, push `a op b` for every pair. If the string has no operator, return `[Number(expression)]`.',
      ],
      approaches: [
        {
          name: 'Every order of operators, skip repeats',
          idea: 'Every bracket placement comes from applying the operators in some order. Try all `k!` orders, write down the bracket string each one builds, and keep a value only the first time you see its string. Correct, but many orders build the same placement, and nothing is reused between orders.',
          code: `function diffWaysToCompute(expression) {
  const nums = expression.split(/[-+*]/).map(Number);
  const ops = expression.match(/[-+*]/g) || [];
  const calc = (a, op, b) => (op === '+' ? a + b : op === '-' ? a - b : a * b);
  const seen = new Set(); // bracket strings already counted
  const results = [];
  function tryOrders(vals, texts, ops) {
    if (ops.length === 0) {
      if (!seen.has(texts[0])) {
        seen.add(texts[0]);
        results.push(vals[0]);
      }
      return;
    }
    for (let i = 0; i < ops.length; i++) {
      // apply operator i next: merge its two neighbours into one
      const v = calc(vals[i], ops[i], vals[i + 1]);
      const t = '(' + texts[i] + ops[i] + texts[i + 1] + ')';
      tryOrders(
        [...vals.slice(0, i), v, ...vals.slice(i + 2)],
        [...texts.slice(0, i), t, ...texts.slice(i + 2)],
        [...ops.slice(0, i), ...ops.slice(i + 1)],
      );
    }
  }
  tryOrders(nums, nums.map(String), ops);
  return results;
}`,
          time: 'O(k! · n), k = operators',
          space: 'O(R · n), R = results',
        },
        {
          name: 'Split at every operator (divide and conquer)',
          idea: 'Choose which operator runs last. Its left side and right side are independent smaller expressions, so a recursive call returns all values of each. Pairing every left value with every right value gives every placement with that operator last, each exactly once. A string with no operator is just a number.',
          pseudo: `function ways(expr):
    results ← empty list
    for i from 0 to length(expr) - 1:
        op ← expr[i]
        if op is not +, - or *:
            continue
        lefts ← ways(expr[0 .. i - 1])
        rights ← ways(expr[i + 1 .. end])
        for each a in lefts:
            for each b in rights:
                append (a op b) to results
    if results is empty:                // no operator
        append number(expr) to results
    return results`,
          code: `function diffWaysToCompute(expression) {
  const results = [];
  for (let i = 0; i < expression.length; i++) {
    const op = expression[i];
    if (op !== '+' && op !== '-' && op !== '*') continue;
    const lefts = diffWaysToCompute(expression.slice(0, i));
    const rights = diffWaysToCompute(expression.slice(i + 1));
    for (const a of lefts) {
      for (const b of rights) {
        if (op === '+') results.push(a + b);
        else if (op === '-') results.push(a - b);
        else results.push(a * b);
      }
    }
  }
  if (results.length === 0) results.push(Number(expression));
  return results;
}`,
          time: 'fast-growing (Catalan), fine for ≤ 20 chars',
          space: 'same as the output',
        },
      ],
      fn: 'diffWaysToCompute',
      starter: `function diffWaysToCompute(expression) {
  // Return the value of every way to bracket the expression.
  return [];
}`,
      solution: `function diffWaysToCompute(expression) {
  const results = [];
  for (let i = 0; i < expression.length; i++) {
    const op = expression[i];
    if (op !== '+' && op !== '-' && op !== '*') continue;
    const lefts = diffWaysToCompute(expression.slice(0, i));
    const rights = diffWaysToCompute(expression.slice(i + 1));
    for (const a of lefts) {
      for (const b of rights) {
        if (op === '+') results.push(a + b);
        else if (op === '-') results.push(a - b);
        else results.push(a * b);
      }
    }
  }
  if (results.length === 0) results.push(Number(expression));
  return results;
}`,
      tests: [
        { name: 'two minuses', args: ['2-1-1'], expected: [0, 2] },
        { name: 'duplicates stay', args: ['2*3-4*5'], expected: [-34, -14, -10, -10, 10] },
        { name: 'just a two-digit number', args: ['11'], expected: [11] },
        { name: 'one operator', args: ['1+2'], expected: [3] },
        { name: 'zero times', args: ['0*5-3'], expected: [-3, 0] },
        { name: 'two-digit numbers', args: ['99*99'], expected: [9801] },
        {
          name: 'four operators',
          args: ['2+3*4-5*2'],
          expected: [-30, -16, -10, -10, -4, -4, -2, 4, 4, 10, 16, 18, 18, 30],
        },
        {
          name: 'all minuses',
          args: ['10-2-3-4-5'],
          expected: [-4, 2, 2, 2, 4, 4, 6, 10, 10, 12, 12, 12, 14, 20],
        },
        {
          name: 'five operators',
          args: ['1-2+3*4-5*6'],
          expected: [
            -144, -126, -108, -89, -84, -79, -53, -53, -52, -49, -48, -48, -46, -43, -43, -24, -22, -19, -19, -19, -19,
            -12, -12, 7, 11, 12, 17, 17, 17, 17, 18, 24, 24, 31, 31, 36, 36, 36, 41, 77, 104, 131,
          ],
        },
      ],
      compare: 'unordered',
      takeaway: 'Fix the operator that runs last: the two sides become independent, and every left answer pairs with every right answer.',
    },
    {
      id: 'recursion-longest-nice-substring',
      title: 'Longest balanced-case substring',
      difficulty: 'easy',
      leetcode: 1763,
      pattern: 'Divide and conquer (split around a bad item)',
      statement: 'Call a string **nice** if every letter in it shows up in both cases: if it has `a` it also has `A`, and the other way round. `"aAbB"` is nice, `"aAb"` is not (no `B`). Given a string `s` of English letters, return its longest nice substring (an unbroken piece of `s`). If several are equally long, return the one that starts earliest. If there is none, return `""`.',
      examples: [
        { input: 's = "YazaAay"', output: '"aAa"', explain: '`a` and `A` both appear. `z` and `y` have no partner, so any longer piece fails.' },
        { input: 's = "dDzeE"', output: '"dD"', explain: '`dD` and `eE` tie at length 2; `dD` starts first.' },
        { input: 's = "c"', output: '""' },
      ],
      constraints: ['1 ≤ s.length ≤ 100', 's has only English letters'],
      hints: [
        'Find a letter in `s` whose other case never appears in `s`. Can it be part of any nice substring?',
        'No. It is a wall: every nice substring lies completely between two walls.',
        'Cut `s` at every wall, solve each piece with your own function, and keep the longest. Replace the best only when the new one is strictly longer, so ties keep the earliest. If there is no wall, the whole `s` is nice.',
      ],
      approaches: [
        {
          name: 'Check every substring',
          idea: 'Try every start and end, and check if the piece is nice by putting its letters in a set and looking up each partner. Keeping a new best only when it is strictly longer means the earliest one wins a tie, because starts are tried left to right.',
          code: `function longestNiceSubstring(s) {
  let best = '';
  for (let i = 0; i < s.length; i++) {
    for (let j = i + 2; j <= s.length; j++) {
      const t = s.slice(i, j);
      const set = new Set(t);
      const nice = [...set].every((c) => set.has(c.toLowerCase()) && set.has(c.toUpperCase()));
      if (nice && t.length > best.length) best = t;
    }
  }
  return best;
}`,
          time: 'O(n³)',
          space: 'O(n)',
        },
        {
          name: 'Split around letters with no partner',
          idea: 'A letter whose other case is missing from the current piece can never be inside a nice substring of that piece, so it is a wall. Cut at every wall, trust the call on each piece, and keep the longest (strictly longer wins, so the earliest piece keeps ties). Each piece is missing a whole letter its parent had, so there are at most 26 levels of calls.',
          pseudo: `function nice(s):
    letters ← set of characters in s
    walls ← positions i where the other case of s[i]
            is not in letters
    if walls is empty:
        return s                        // every letter has its partner
    best ← ""
    for each piece of s between walls:
        candidate ← nice(piece)         // trust the call
        if length(candidate) > length(best):
            best ← candidate            // strictly longer: ties keep earliest
    return best`,
          code: `function longestNiceSubstring(s) {
  const letters = new Set(s);
  const isWall = (c) => !(letters.has(c.toLowerCase()) && letters.has(c.toUpperCase()));
  if (![...s].some(isWall)) return s; // every letter has its partner
  let best = '';
  let start = 0;
  for (let i = 0; i <= s.length; i++) {
    if (i === s.length || isWall(s[i])) {
      const candidate = longestNiceSubstring(s.slice(start, i));
      if (candidate.length > best.length) best = candidate;
      start = i + 1;
    }
  }
  return best;
}`,
          time: 'O(26 · n)',
          space: 'O(26 · n)',
        },
      ],
      fn: 'longestNiceSubstring',
      starter: `function longestNiceSubstring(s) {
  // Return the longest (earliest on ties) substring where every letter appears in both cases.
  return '';
}`,
      solution: `function longestNiceSubstring(s) {
  const letters = new Set(s);
  const isWall = (c) => !(letters.has(c.toLowerCase()) && letters.has(c.toUpperCase()));
  if (![...s].some(isWall)) return s;
  let best = '';
  let start = 0;
  for (let i = 0; i <= s.length; i++) {
    if (i === s.length || isWall(s[i])) {
      const candidate = longestNiceSubstring(s.slice(start, i));
      if (candidate.length > best.length) best = candidate;
      start = i + 1;
    }
  }
  return best;
}`,
      tests: [
        { name: 'classic', args: ['YazaAay'], expected: 'aAa' },
        { name: 'whole string', args: ['Bb'], expected: 'Bb' },
        { name: 'single letter', args: ['c'], expected: '' },
        { name: 'tie keeps earliest', args: ['dDzeE'], expected: 'dD' },
        { name: 'no partners at all', args: ['abc'], expected: '' },
        { name: 'wall in the middle, tie', args: ['AaxBb'], expected: 'Aa' },
        { name: 'wall only inside a piece', args: ['aAbcB'], expected: 'aA' },
        { name: 'all nice', args: ['aAbBcC'], expected: 'aAbBcC' },
        { name: 'longer', args: ['aAaBbcCxYyXzz'], expected: 'aAaBbcCxYyX' },
      ],
      takeaway: 'A letter with no partner can never be in the answer, so cut there and solve each side.',
    },
    {
      id: 'recursion-longest-k-repeating',
      title: 'Longest stretch where every letter repeats k times',
      difficulty: 'medium',
      leetcode: 395,
      pattern: 'Divide and conquer (split around a bad item)',
      statement: 'A bakery tray holds a row of cookies, each flavor written as a lowercase letter. You want the longest unbroken stretch of the row where **every flavor in the stretch appears at least `k` times** inside that stretch. Return its length, or `0` if there is no such stretch.',
      examples: [
        { input: 's = "aaabb", k = 3', output: '3', explain: '`aaa` works. `b` appears only twice in the whole tray, so it can never be in the answer.' },
        { input: 's = "ababbc", k = 2', output: '5', explain: '`ababb` has `a` twice and `b` three times.' },
      ],
      constraints: ['1 ≤ s.length ≤ 10⁴', 's has only lowercase letters', '1 ≤ k ≤ 10⁵'],
      hints: [
        'Count letters in the whole string. Look at a letter that appears fewer than `k` times. Can a valid stretch contain it?',
        'No. So it is a wall, and the answer lies completely inside one of the pieces between walls.',
        'Solve each piece with your own function. Count again **inside the piece**: a letter that was fine before may now be too rare. If a piece has no rare letter, its whole length is valid.',
      ],
      approaches: [
        {
          name: 'Check every substring',
          idea: 'For each start, grow the end one step at a time and keep 26 counts. After each step, the stretch is valid if every count is 0 or at least `k`. Correct, but with n = 10⁴ that is about 50 million stretches, each checking 26 counts: over a billion steps.',
          code: `function longestSubstring(s, k) {
  let best = 0;
  for (let i = 0; i < s.length; i++) {
    const count = new Array(26).fill(0);
    for (let j = i; j < s.length; j++) {
      count[s.charCodeAt(j) - 97]++;
      if (count.every((c) => c === 0 || c >= k)) best = Math.max(best, j - i + 1);
    }
  }
  return best;
}`,
          time: 'O(26 · n²)',
          space: 'O(26)',
        },
        {
          name: 'Split around rare letters',
          idea: 'A letter that appears fewer than `k` times in the current piece can never be in a valid stretch of that piece, so it is a wall. Cut at every wall and trust the call on each piece. A piece with no wall is valid as a whole. Each piece lacks at least one letter its parent had, so there are at most 26 levels, each doing O(n) counting.',
          pseudo: `function solve(lo, hi):              // the piece s[lo .. hi - 1]
    if hi - lo < k:
        return 0                        // too short to repeat anything k times
    count ← letter counts of s[lo .. hi - 1]
    best ← 0
    start ← lo
    for i from lo to hi - 1:
        if count[s[i]] < k:             // rare letter: a wall
            best ← max(best, solve(start, i))
            start ← i + 1
    if start = lo:
        return hi - lo                  // no wall: the whole piece works
    return max(best, solve(start, hi))`,
          code: `function longestSubstring(s, k) {
  const solve = (lo, hi) => {
    // the piece s[lo .. hi - 1]
    if (hi - lo < k) return 0;
    const count = {};
    for (let i = lo; i < hi; i++) count[s[i]] = (count[s[i]] || 0) + 1;
    let best = 0;
    let start = lo;
    for (let i = lo; i < hi; i++) {
      if (count[s[i]] < k) {
        best = Math.max(best, solve(start, i));
        start = i + 1;
      }
    }
    if (start === lo) return hi - lo; // no wall: every letter repeats k times
    return Math.max(best, solve(start, hi));
  };
  return solve(0, s.length);
}`,
          time: 'O(26 · n)',
          space: 'O(26) levels of calls',
        },
      ],
      fn: 'longestSubstring',
      starter: `function longestSubstring(s, k) {
  // Return the length of the longest substring where every letter appears at least k times.
  return 0;
}`,
      solution: `function longestSubstring(s, k) {
  const solve = (lo, hi) => {
    if (hi - lo < k) return 0;
    const count = {};
    for (let i = lo; i < hi; i++) count[s[i]] = (count[s[i]] || 0) + 1;
    let best = 0;
    let start = lo;
    for (let i = lo; i < hi; i++) {
      if (count[s[i]] < k) {
        best = Math.max(best, solve(start, i));
        start = i + 1;
      }
    }
    if (start === lo) return hi - lo;
    return Math.max(best, solve(start, hi));
  };
  return solve(0, s.length);
}`,
      tests: [
        { name: 'classic', args: ['aaabb', 3], expected: 3 },
        { name: 'wall at the end', args: ['ababbc', 2], expected: 5 },
        { name: 'k = 1: whole string', args: ['abcde', 1], expected: 5 },
        { name: 'k bigger than length', args: ['ab', 3], expected: 0 },
        { name: 'all same letter', args: ['aaaa', 2], expected: 4 },
        { name: 'nothing repeats', args: ['abcd', 2], expected: 0 },
        { name: 'rare only inside a piece', args: ['bbaaacbd', 3], expected: 3 },
        { name: 'frequent overall, never valid', args: ['ababacb', 3], expected: 0 },
        { name: 'longer', args: ['aaabbbcdddeeefffggxyzzzzbb', 3], expected: 9 },
      ],
      takeaway: 'Too-rare letters are walls. Recount inside every piece, because a letter can become rare after a cut.',
    },
  ],
  quiz: [
    {
      prompt: 'How many values does `diffWaysToCompute("1+2+3")` return?',
      options: ['1', '2', '3', '6'],
      answer: 1,
      explanation: 'Two bracket placements: `(1+2)+3` and `1+(2+3)`. Both are 6, and you keep one value per placement, so the answer is `[6, 6]`.',
    },
    {
      prompt: 'Why does the bracket problem split at the operator that is applied **last**?',
      options: [
        'Because it is always the rightmost operator.',
        'Because its two sides are complete smaller expressions that do not affect each other.',
        'Because `*` must always be applied last.',
        'Because it makes the recursion only one level deep.',
      ],
      answer: 1,
      explanation: 'Whatever brackets the left side gets, it does not change the right side. So you can solve each side on its own and pair the results.',
    },
    {
      prompt: 'In `"bbaaacbd"` with `k = 3`, the letter `b` appears 3 times overall. Why is `b` not in the answer?',
      options: [
        'Letters at the start of the string are always cut.',
        'After cutting at `c`, the piece `bbaaa` holds only 2 `b`s, so `b` becomes a wall inside that piece.',
        '`b` comes before `c` in the alphabet.',
        'The answer must use only one letter.',
      ],
      answer: 1,
      explanation: 'Rare is measured in the **current piece**, not the whole string. That is why every call counts again.',
    },
    {
      prompt: 'In the rare-letter problem, what goes wrong if a piece with no rare letter calls itself on the same piece again?',
      options: ['Nothing, it just runs slower.', 'It returns 0.', 'It never stops: the same piece is split forever.', 'It returns a wrong length.'],
      answer: 2,
      explanation: 'With no wall, there is nothing to cut, so the "smaller" piece is the same piece. The base case must return its length.',
    },
  ],
  takeaways: [
    'Divide and conquer: split into parts that do not affect each other, trust the calls, combine. The split can be in half, at every operator, or around a bad item.',
    '**Try every split**: for each operator, solve the left and right sides and pair every left result with every right result.',
    '**Split around a bad item**: anything that can never be in an answer is a wall. Solve each piece between walls, and recount inside every piece.',
  ],
};

export default lesson;
