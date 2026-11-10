import type { Series } from '../types';

// /dsa/reels module 19. One reel per lesson of src/dsa/modules/19-pattern-mastery*.ts, in lesson order.
// Brief: src/reels/dsa/README.md. Rules: src/reels/AUTHORING.md.

const solve = (lesson: string, problem: string) => ({
  label: 'Solve it',
  href: `/dsa#/m/pattern-mastery/${lesson}/pattern-mastery-${problem}`,
});

// Lesson 1: "tree" → "eert"
const tree = ['t', 'r', 'e', 'e'];

// Lesson 2: runs whose sum divides by 5
const cash = [4, 5, 0, -2, -3, 1];

// Lesson 3: surrounded regions
const boardStart = [
  ['X', 'X', 'X', 'X', 'X'],
  ['X', 'O', 'O', 'X', 'X'],
  ['X', 'X', 'O', 'X', 'X'],
  ['X', 'O', 'X', 'O', 'O'],
  ['X', 'O', 'X', 'X', 'X'],
];
const boardBorder = [
  ['X', 'X', 'X', 'X', 'X'],
  ['X', 'O', 'O', 'X', 'X'],
  ['X', 'X', 'O', 'X', 'X'],
  ['X', 'O', 'X', 'O', 'S'],
  ['X', 'S', 'X', 'X', 'X'],
];
const boardRight = [
  ['X', 'X', 'X', 'X', 'X'],
  ['X', 'O', 'O', 'X', 'X'],
  ['X', 'X', 'O', 'X', 'X'],
  ['X', 'O', 'X', 'S', 'S'],
  ['X', 'S', 'X', 'X', 'X'],
];
const boardMarked = [
  ['X', 'X', 'X', 'X', 'X'],
  ['X', 'O', 'O', 'X', 'X'],
  ['X', 'X', 'O', 'X', 'X'],
  ['X', 'S', 'X', 'S', 'S'],
  ['X', 'S', 'X', 'X', 'X'],
];
const boardDone = [
  ['X', 'X', 'X', 'X', 'X'],
  ['X', 'X', 'X', 'X', 'X'],
  ['X', 'X', 'X', 'X', 'X'],
  ['X', 'O', 'X', 'O', 'O'],
  ['X', 'O', 'X', 'X', 'X'],
];

// Lesson 4: find the duplicate
const dup = [1, 3, 4, 2, 2];

// Lesson 5: car fleet, target 10, front car first
const fleet = [
  [8, 6, 4, 1],
  [2, 1, 3, 3],
];

export const series: Series = {
  id: 'dsa-pattern-mastery',
  title: 'Pattern recognition & interview playbook',
  emoji: '🧭',
  color: '#818cf8',
  order: 19,
  blurb: 'Mixed problems: spot the pattern from the statement and solve under time pressure.',
  reels: [
    // ───────────────────────── Lesson 1 ─────────────────────────
    {
      id: 'dsa-pattern-mastery-signals-to-patterns',
      title: 'Signals → pattern: the decision guide',
      link: solve('signals-to-patterns', 'sort-by-frequency'),
      beats: [
        {
          say: 'A good mechanic hears one squeal and knows the tool. Can you?',
          emphasis: ['squeal', 'tool'],
          scene: { type: 'title', kicker: 'Patterns · Lesson 1', title: 'Hear the *symptom*, pick the tool', emoji: '🔧', style: 'slam' },
        },
        {
          say: "Don't start coding. Read three things, in order: the size limit, the input shape, then the ask.",
          emphasis: ['three', 'order'],
          scene: {
            type: 'timeline',
            title: 'Read three things, in order',
            steps: [
              { label: 'Size limit', sub: 'how fast must it be?', icon: '📏' },
              { label: 'Input shape', sub: 'array? grid? tree?', icon: '🧩' },
              { label: 'The ask', sub: 'count? longest? ways?', icon: '❓' },
            ],
            active: 0,
          },
        },
        {
          say: 'The size limit sets your speed. Up to a hundred thousand items means n log n or better.',
          speak: 'The size limit sets your speed. Up to a hundred thousand items means n log n or better.',
          emphasis: ['speed'],
          scene: {
            type: 'list',
            title: 'Size limit → target speed',
            items: [
              { text: 'n ≈ 20: try *every choice*', icon: '🌳' },
              { text: 'n ≈ 5,000: two loops, *O(n²)*', icon: '🔁' },
              { text: 'n ≈ 10⁵: *O(n log n)* or O(n)', icon: '⚡' },
              { text: 'n ≈ 10⁹: *O(log n)* or math', icon: '🧮' },
            ],
            active: 2,
          },
        },
        {
          say: 'Bananas, ships and pages are all decoration. The ask and the size limit pick the pattern.',
          emphasis: ['decoration', 'ask'],
          sfx: 'ding',
          scene: { type: 'title', kicker: 'The insight', title: 'The story is *decoration*', emoji: '💡', style: 'slam' },
        },
        {
          say: 'Try it. Sort the letters of tree, most common first. Two e, then r, then t.',
          emphasis: ['most', 'common'],
          sfx: 'pop',
          scene: {
            type: 'array',
            title: 'Sort letters by count',
            cells: tree,
            found: [2, 3],
            vars: { input: 'tree', answer: 'eert' },
            caption: 'ties go in letter order',
          },
        },
        {
          say: 'Triage it. Half a million letters means n log n at most. The ask is how often, so count.',
          speak: 'Triage it. Half a million letters means n log n at most. The ask is how often, so count.',
          emphasis: ['how', 'often'],
          scene: {
            type: 'timeline',
            title: 'Read three things, in order',
            steps: [
              { label: 'Size limit', sub: '5 × 10⁵: O(n log n)', icon: '📏' },
              { label: 'Input shape', sub: 'one string', icon: '🧩' },
              { label: 'The ask', sub: 'how often: count it', icon: '❓' },
            ],
            active: 2,
          },
        },
        {
          say: 'Walk the string once with a counting map. First t, then r, each seen once.',
          emphasis: ['counting', 'map'],
          scene: {
            type: 'array',
            title: 'Count each letter',
            cells: tree,
            pointers: { i: 1 },
            active: [1],
            done: [0],
            vars: { t: 1, r: 1, e: 0 },
          },
        },
        {
          say: 'Then e shows up twice. Now every letter has its count.',
          emphasis: ['twice'],
          scene: {
            type: 'array',
            title: 'Count each letter',
            cells: tree,
            pointers: { i: 3 },
            active: [3],
            reads: [2],
            done: [0, 1],
            vars: { t: 1, r: 1, e: 2 },
          },
        },
        {
          say: 'A count is a small whole number, so use it as a bucket number. r and t share bucket one.',
          emphasis: ['bucket'],
          sfx: 'pop',
          scene: {
            type: 'grid',
            title: 'Bucket by count',
            rowLabels: ['f = 2', 'f = 1', 'out'],
            cells: [
              ['e', '', '', ''],
              ['r', 't', '', ''],
              ['', '', '', ''],
            ],
            active: [[1, 1]],
            caption: 'each bucket stays in letter order',
          },
        },
        {
          say: 'Walk the buckets from the biggest count down. Bucket two gives e, written twice.',
          emphasis: ['biggest'],
          scene: {
            type: 'grid',
            title: 'Bucket by count',
            rowLabels: ['f = 2', 'f = 1', 'out'],
            cells: [
              ['e', '', '', ''],
              ['r', 't', '', ''],
              ['e', 'e', '', ''],
            ],
            active: [[2, 1]],
            reads: [[0, 0]],
            caption: 'write each letter f times',
          },
        },
        {
          say: 'Then bucket one gives r, then t. The answer is e, e, r, t.',
          emphasis: ['answer'],
          sfx: 'success',
          scene: {
            type: 'grid',
            title: 'Bucket by count',
            rowLabels: ['f = 2', 'f = 1', 'out'],
            cells: [
              ['e', '', '', ''],
              ['r', 't', '', ''],
              ['e', 'e', 'r', 't'],
            ],
            found: [[2, 0], [2, 1], [2, 2], [2, 3]],
            caption: 'no sort over the whole string',
          },
        },
        {
          say: 'In JavaScript, count with a map, then drop each letter into its bucket. That is O of n.',
          speak: 'In JavaScript, count with a map, then drop each letter into its bucket. That is oh of n.',
          emphasis: ['bucket'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'frequencySort.js',
            code: `function frequencySort(s) {
  const cnt = new Map();
  for (const c of s)
    cnt.set(c, (cnt.get(c) ?? 0) + 1);
  const b = []; // b[f]: seen f times
  const keys = [...cnt.keys()].sort();
  for (const c of keys)
    (b[cnt.get(c)] ??= []).push(c);
  let out = '';
  for (let f = s.length; f >= 1; f--)
    for (const c of b[f] ?? [])
      out += c.repeat(f);
  return out;
}`,
            highlight: [[7, 8]],
            note: { line: 8, text: 'a count is an index: O(n)', tone: 'good' },
          },
        },
        {
          say: 'The trap is same words, different pattern. With negative numbers, a sum window breaks. Use prefix sums and a map.',
          emphasis: ['negative', 'prefix'],
          sfx: 'error',
          scene: {
            type: 'compare',
            title: 'Subarray sum is k, negatives',
            left: { title: 'Sliding window', verdict: 'bad', items: ['Sum can shrink', 'Shrink rule breaks'] },
            right: { title: 'Prefix sum + map', verdict: 'ok', items: ['Seen prefix − k?', 'Fine with negatives'] },
          },
        },
        {
          say: 'Quick check. n is at most fifteen. Return every way to split a team evenly. Which pattern?',
          sfx: 'riser',
          scene: {
            type: 'quiz',
            question: 'n ≤ 15. Return every way to split a team evenly. Pattern?',
            options: ['Sliding window', 'Backtracking', 'Binary search', 'Monotonic stack'],
            answer: 1,
          },
        },
        {
          say: 'Backtracking. Every way plus a tiny n means you can afford to try every choice.',
          emphasis: ['every', 'tiny'],
          sfx: 'ding',
          scene: {
            type: 'quiz',
            question: 'n ≤ 15. Return every way to split a team evenly. Pattern?',
            options: ['Sliding window', 'Backtracking', 'Binary search', 'Monotonic stack'],
            answer: 1,
            reveal: true,
            explain: '2¹⁵ is only about 33,000 tries.',
          },
        },
        {
          say: 'Remember this. Read the size, the shape, then the ask, and ignore the story. Now tap solve it and try it yourself.',
          emphasis: ['size', 'shape', 'ask'],
          sfx: 'success',
          scene: {
            type: 'outro',
            points: ['Size, then shape, then *the ask*', 'The story is *decoration*', 'Check the *small words*'],
            tagline: 'Now go solve it.',
          },
        },
      ],
    },

    // ───────────────────────── Lesson 2 ─────────────────────────
    {
      id: 'dsa-pattern-mastery-mixed-arrays-strings',
      title: 'Mixed set A: arrays & strings',
      link: solve('mixed-arrays-strings', 'sums-divisible-by-k'),
      beats: [
        {
          say: 'Daily cash, with refunds. How many runs split evenly five ways?',
          emphasis: ['five', 'ways'],
          scene: { type: 'title', kicker: 'Patterns · Lesson 2', title: 'Five *envelopes*', emoji: '✉️', style: 'slam' },
        },
        {
          say: 'Six days, and k is five. Seven runs add up to a multiple of five, like five then zero.',
          emphasis: ['Seven'],
          sfx: 'pop',
          scene: {
            type: 'array',
            title: 'Cash per day, k = 5',
            cells: cash,
            found: [1, 2],
            vars: { k: 5, answer: 7 },
            caption: '5 + 0 = 5 divides by 5',
          },
        },
        {
          say: 'Nobody names the pattern, so underline the words: runs in a row, a sum, divisible, how many.',
          emphasis: ['underline'],
          scene: {
            type: 'list',
            title: 'Underline the signal words',
            items: [
              { text: '*Runs* of days: contiguous', icon: '📅' },
              { text: '*Add up*: a sum', icon: '➕' },
              { text: '*Split by 5*: divisible', icon: '✂️' },
              { text: '*How many*: a count', icon: '🔢' },
            ],
            active: 0,
          },
        },
        {
          say: 'Brute force tries every start and keeps a running sum. A loop in a loop is O of n squared.',
          speak: 'Brute force tries every start and keeps a running sum. A loop in a loop is oh of n squared.',
          emphasis: ['every', 'squared'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'pseudo',
            file: 'Brute force',
            code: `function countDivisible(nums, k):
    count ← 0
    for i from 0 to n - 1:
        sum ← 0
        for j from i to n - 1:
            sum ← sum + nums[j]
            if sum mod k = 0:
                count ← count + 1
    return count`,
            highlight: [[5, 6]],
            note: { line: 6, text: 'O(n²): re-adds the same days', tone: 'warn' },
          },
        },
        {
          say: 'The waste: the run from day one re-adds five, zero and minus two. Day zero already did that.',
          emphasis: ['re-adds'],
          scene: {
            type: 'array',
            title: 'Spot the waste',
            cells: cash,
            pointers: { i: 1 },
            active: [1],
            reads: [2, 3],
            done: [0],
            caption: 'every start adds the same numbers',
          },
        },
        {
          say: 'If two running sums leave the same remainder, the days between them divide by five.',
          emphasis: ['same', 'remainder'],
          sfx: 'ding',
          scene: { type: 'title', kicker: 'The insight', title: 'Same *remainder*, good run', emoji: '💡', style: 'slam' },
        },
        {
          say: 'Remainder zero starts seen once, for the empty prefix. Day zero gives four, which is new.',
          emphasis: ['empty', 'prefix'],
          scene: {
            type: 'array',
            title: 'Count remainders mod 5',
            cells: cash,
            pointers: { i: 0 },
            active: [0],
            vars: { sum: 4, rem: 4, seen: '0:1, 4:1', answer: 0 },
          },
        },
        {
          say: 'Sum nine, remainder four. One earlier prefix had four, so one good run ends here.',
          emphasis: ['one', 'good'],
          scene: {
            type: 'array',
            title: 'Count remainders mod 5',
            cells: cash,
            pointers: { i: 1 },
            active: [1],
            vars: { sum: 9, rem: 4, seen: '0:1, 4:2', answer: 1 },
          },
        },
        {
          say: 'Remainder four again, seen twice before. Add two: five then zero, and zero alone.',
          emphasis: ['twice'],
          scene: {
            type: 'array',
            title: 'Count remainders mod 5',
            cells: cash,
            pointers: { i: 2 },
            active: [2],
            found: [1],
            vars: { sum: 9, rem: 4, seen: '0:1, 4:3', answer: 3 },
          },
        },
        {
          say: 'Skip ahead to day four. The sum is four again, and four was seen three times. Add three.',
          emphasis: ['three'],
          scene: {
            type: 'array',
            title: 'Count remainders mod 5',
            cells: cash,
            pointers: { i: 4 },
            active: [4],
            found: [1, 2],
            vars: { sum: 4, rem: 4, seen: '0:1, 4:4, 2:1', answer: 6 },
          },
        },
        {
          say: 'Last day, the sum is five, remainder zero. The empty prefix matches, so the whole array counts. Seven.',
          emphasis: ['whole', 'Seven'],
          sfx: 'success',
          scene: {
            type: 'array',
            title: 'Count remainders mod 5',
            cells: cash,
            pointers: { i: 5 },
            found: [0, 1, 2, 3, 4, 5],
            vars: { sum: 5, rem: 0, seen: '0:2, 4:4, 2:1', answer: 7 },
          },
        },
        {
          say: 'In JavaScript, add how many earlier prefixes share your remainder, then record yours. One pass.',
          emphasis: ['earlier', 'One'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'subarraysDivByK.js',
            code: `function subarraysDivByK(nums, k) {
  const seen = new Array(k).fill(0);
  seen[0] = 1; // the empty prefix
  let rem = 0;
  let count = 0;
  for (const x of nums) {
    rem = (((rem + x) % k) + k) % k;
    count += seen[rem];
    seen[rem]++;
  }
  return count;
}`,
            highlight: [[8, 9]],
            note: { line: 9, text: 'one pass: O(n + k)', tone: 'good' },
          },
        },
        {
          say: 'The trap: in JavaScript, minus one mod five is minus one, not four. Add k, then mod again.',
          emphasis: ['minus', 'again'],
          sfx: 'error',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'trap.js',
            code: `rem = sum % k;           // -1, not 4
rem = ((sum % k) + k) % k; // 4`,
            errors: [1],
            added: [2],
            note: { line: 2, text: 'always 0 to k - 1', tone: 'good' },
          },
        },
        {
          say: 'Quick check. Why does the map start with remainder zero already seen once?',
          sfx: 'riser',
          scene: {
            type: 'quiz',
            question: 'Why does the map start with remainder 0 seen once?',
            options: ['To avoid dividing by 0', 'It is the empty prefix', 'Because k is never 0', 'It is not needed'],
            answer: 1,
          },
        },
        {
          say: 'It stands for the empty prefix, so runs that start on day zero get counted too.',
          emphasis: ['empty', 'prefix'],
          sfx: 'ding',
          scene: {
            type: 'quiz',
            question: 'Why does the map start with remainder 0 seen once?',
            options: ['To avoid dividing by 0', 'It is the empty prefix', 'Because k is never 0', 'It is not needed'],
            answer: 1,
            reveal: true,
            explain: 'Runs from day 0 need a partner before day 0.',
          },
        },
        {
          say: 'Remember this. Underline the signals, count matching remainders, and fix the minus sign. Now tap solve it and try it yourself.',
          emphasis: ['signals', 'remainders'],
          sfx: 'success',
          scene: {
            type: 'outro',
            points: ['Underline the *signal words* first', 'Count runs with *prefix + map*', 'In JS, fix *negative* remainders'],
            tagline: 'Now go solve it.',
          },
        },
      ],
    },

    // ───────────────────────── Lesson 3 ─────────────────────────
    {
      id: 'dsa-pattern-mastery-mixed-grids',
      title: 'Mixed set B: grids & matrices',
      link: solve('mixed-grids', 'surrounded-regions'),
      beats: [
        {
          say: 'One photo grid, three totally different algorithms. Which one do you need?',
          emphasis: ['three'],
          scene: { type: 'title', kicker: 'Patterns · Lesson 3', title: 'One grid, *three* families', emoji: '🖼️', style: 'slam' },
        },
        {
          say: "Ask what each cell needs: a fixed visiting order, its neighbors' old values, or what it can reach.",
          emphasis: ['each', 'cell'],
          scene: {
            type: 'list',
            title: 'What does each cell need?',
            items: [
              { text: 'A fixed order: *walk*', sub: 'spiral, rotate', icon: '🌀' },
              { text: 'Old neighbor values: *update*', sub: 'all at once, in place', icon: '🔄' },
              { text: 'What it reaches: *search*', sub: 'regions, islands, exits', icon: '🔎' },
            ],
            active: 2,
          },
        },
        {
          say: "Here's a board. A group of O cells that never touches the edge is trapped, and becomes X.",
          emphasis: ['trapped'],
          sfx: 'pop',
          scene: {
            type: 'grid',
            title: 'Surrounded regions',
            cells: boardStart,
            active: [[1, 1], [1, 2], [2, 2]],
            caption: 'these three O cells are trapped',
          },
        },
        {
          say: 'Brute force floods from every O and checks if its region touches the border.',
          emphasis: ['every'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'pseudo',
            file: 'Brute force',
            code: `function solveBrute(board):
    for each cell (r, c) that is 'O':
        region ← flood fill from (r, c)
        if region misses the border:
            remember (r, c) as trapped
    turn every trapped cell into 'X'`,
            highlight: [3],
            note: { line: 3, text: 'same region, flooded again', tone: 'warn' },
          },
        },
        {
          say: 'A region of a thousand cells gets flooded a thousand times. That is a million visits.',
          emphasis: ['million'],
          sfx: 'error',
          scene: {
            type: 'stat',
            value: '1M',
            label: 'visits for a *1,000* cell region',
            sub: 'O((mn)²): each cell floods it again',
            tone: 'bad',
          },
        },
        {
          say: "Flip the question. Don't ask which cells are trapped. Ask which are safe, starting from the edge.",
          emphasis: ['safe', 'edge'],
          sfx: 'ding',
          scene: { type: 'title', kicker: 'The insight', title: 'Start at the *border*', emoji: '💡', style: 'slam' },
        },
        {
          say: 'Every O on the border is safe. Mark both of them S, one on the right, one at the bottom.',
          emphasis: ['border', 'safe'],
          scene: {
            type: 'grid',
            title: 'Mark from the border',
            cells: boardBorder,
            found: [[3, 4], [4, 1]],
            vars: { stack: '(3,4) (4,1)' },
          },
        },
        {
          say: 'From the right edge, step left. That O touches a safe cell, so it is safe too.',
          emphasis: ['safe', 'too'],
          scene: {
            type: 'grid',
            title: 'Mark from the border',
            cells: boardRight,
            found: [[3, 4], [4, 1]],
            reads: [[3, 4]],
            active: [[3, 3]],
            vars: { stack: '(4,1) (3,3)' },
          },
        },
        {
          say: 'From the bottom edge, step up. Another safe O joins the marked cells.',
          emphasis: ['safe'],
          scene: {
            type: 'grid',
            title: 'Mark from the border',
            cells: boardMarked,
            found: [[3, 4], [4, 1], [3, 3]],
            reads: [[4, 1]],
            active: [[3, 1]],
            vars: { stack: '(3,3) (3,1)' },
          },
        },
        {
          say: 'The stack runs empty. The three middle O cells were never reached, so they are trapped.',
          emphasis: ['never', 'trapped'],
          scene: {
            type: 'grid',
            title: 'Mark from the border',
            cells: boardMarked,
            found: [[3, 4], [4, 1], [3, 3], [3, 1]],
            active: [[1, 1], [1, 2], [2, 2]],
            vars: { stack: 'empty' },
          },
        },
        {
          say: 'Clean up: every S goes back to O, and every other O becomes X. One search, O of m n.',
          speak: 'Clean up: every S goes back to O, and every other O becomes X. One search, oh of m n.',
          emphasis: ['Clean', 'One'],
          sfx: 'success',
          scene: {
            type: 'grid',
            title: 'Mark from the border',
            cells: boardDone,
            found: [[3, 4], [4, 1], [3, 3], [3, 1]],
            vars: { stack: 'done' },
          },
        },
        {
          say: 'In JavaScript, pop a safe cell, try its four neighbors, and mark every O you can reach.',
          emphasis: ['four', 'neighbors'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'solve.js',
            code: `// stack: every border 'O', marked 'S'
while (stack.length) {
  const [r, c] = stack.pop();
  for (const [dr, dc] of dirs) {
    const nr = r + dr, nc = c + dc;
    if (nr < 0 || nr >= m) continue;
    if (nc < 0 || nc >= n) continue;
    if (b[nr][nc] !== 'O') continue;
    b[nr][nc] = 'S'; // safe
    stack.push([nr, nc]);
  }
}`,
            highlight: [[9, 10]],
            note: { line: 10, text: 'each cell once: O(mn)', tone: 'good' },
          },
        },
        {
          say: 'The trap: fill puts the same row in every slot. Change one cell, and every row changes.',
          emphasis: ['same', 'row'],
          sfx: 'error',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'trap.js',
            code: `const seen = Array(3).fill(
  Array(3).fill(false));
seen[0][0] = true;
console.log(seen[2][0]); // true!`,
            errors: [[1, 2]],
            note: { line: 4, text: 'use Array.from for fresh rows', tone: 'bad' },
          },
        },
        {
          say: 'Quick check. You must rotate a square image a quarter turn, in place. Which family is it?',
          sfx: 'riser',
          scene: {
            type: 'quiz',
            question: 'Rotate a square image 90°, in place. Which family?',
            options: ['Search from the border', 'Walk in a fixed order', 'Update all at once', 'Grid DP'],
            answer: 1,
          },
        },
        {
          say: 'A walk. Every cell moves to one known spot, layer by layer. Nothing gets searched.',
          emphasis: ['walk'],
          sfx: 'ding',
          scene: {
            type: 'quiz',
            question: 'Rotate a square image 90°, in place. Which family?',
            options: ['Search from the border', 'Walk in a fixed order', 'Update all at once', 'Grid DP'],
            answer: 1,
            reveal: true,
            explain: 'Pure index bookkeeping, like a spiral.',
          },
        },
        {
          say: 'Remember this. Ask what each cell needs, and search from the edge, not from every cell. Now tap solve it and try it yourself.',
          emphasis: ['needs', 'edge'],
          sfx: 'success',
          scene: {
            type: 'outro',
            points: ['Ask what each *cell needs*', 'Reach the edge? *Start there*', 'Fresh rows need *Array.from*'],
            tagline: 'Now go solve it.',
          },
        },
      ],
    },

    // ───────────────────────── Lesson 4 ─────────────────────────
    {
      id: 'dsa-pattern-mastery-interview-playbook',
      title: 'The interview playbook: talk, test, time',
      link: solve('interview-playbook', 'find-duplicate'),
      beats: [
        {
          say: 'Pilots with twenty thousand hours still read the checklist. So should you.',
          emphasis: ['checklist'],
          scene: { type: 'title', kicker: 'Patterns · Lesson 4', title: 'Read the *checklist*', emoji: '✈️', style: 'slam' },
        },
        {
          say: 'Split forty-five minutes into stages: clarify, brute force, optimize, code, then test by hand.',
          emphasis: ['clarify', 'test'],
          scene: {
            type: 'timeline',
            title: 'The 45-minute plan',
            steps: [
              { label: 'Clarify', sub: 'minute 0 to 5', icon: '❓' },
              { label: 'Brute force', sub: 'say it and its cost', icon: '🔨' },
              { label: 'Optimize', sub: 'agree before coding', icon: '💡' },
              { label: 'Code', sub: 'talk as you type', icon: '⌨️' },
              { label: 'Test', sub: 'trace a tiny input', icon: '🔍' },
            ],
            active: 0,
          },
        },
        {
          say: 'Try it on this. Five numbers, each from one to four, so one must repeat. Here it is two.',
          emphasis: ['repeat', 'two'],
          sfx: 'pop',
          scene: {
            type: 'array',
            title: 'Find the duplicate',
            cells: dup,
            found: [3, 4],
            vars: { values: '1 to 4', answer: 2 },
            caption: 'n + 1 numbers, each from 1 to n',
          },
        },
        {
          say: "Clarify first. You can't sort it, you can't use a set, but the values are always one to n.",
          emphasis: ['sort', 'set'],
          scene: {
            type: 'list',
            title: 'Clarifying changes the plan',
            items: [
              { text: 'Can I sort it? *No*', icon: '🚫' },
              { text: 'A set? *O(1) space only*', icon: '🚫' },
              { text: 'Values? *Always 1 to n*', icon: '🔑' },
            ],
            active: 2,
          },
        },
        {
          say: 'Guess a middle value. If too many numbers are at most that guess, the repeat is at or below it.',
          emphasis: ['middle', 'too', 'many'],
          sfx: 'ding',
          scene: { type: 'title', kicker: 'The insight', title: 'Search the *values*', emoji: '💡', style: 'slam' },
        },
        {
          say: 'The answer is a value from one to four. So lo starts at one, and hi starts at four.',
          emphasis: ['value'],
          scene: {
            type: 'array',
            title: 'Binary search on values',
            cells: dup,
            vars: { lo: 1, hi: 4, mid: '-', count: '-' },
            caption: 'the duplicate is in lo to hi',
          },
        },
        {
          say: 'Guess two. Three numbers are two or less, but only two values fit there. So hi becomes two.',
          emphasis: ['Three', 'hi'],
          scene: {
            type: 'array',
            title: 'Binary search on values',
            cells: dup,
            active: [0, 3, 4],
            vars: { lo: 1, hi: 4, mid: 2, count: 3 },
            caption: '3 values in 2 slots: too many',
          },
        },
        {
          say: 'Guess one. Just one number is one or less, which is fine. So lo becomes two.',
          emphasis: ['fine', 'lo'],
          scene: {
            type: 'array',
            title: 'Binary search on values',
            cells: dup,
            active: [0],
            vars: { lo: 1, hi: 2, mid: 1, count: 1 },
            caption: '1 value in 1 slot: fine',
          },
        },
        {
          say: 'Now lo and hi meet at two. The duplicate is two, and you used no extra memory.',
          emphasis: ['two', 'memory'],
          sfx: 'success',
          scene: {
            type: 'array',
            title: 'Binary search on values',
            cells: dup,
            found: [3, 4],
            vars: { lo: 2, hi: 2, mid: '-', count: '-' },
            caption: 'lo = hi: one value left',
          },
        },
        {
          say: 'In JavaScript, count values up to mid, then keep the half that is too full. O of n log n.',
          speak: 'In JavaScript, count values up to mid, then keep the half that is too full. Oh of n log n.',
          emphasis: ['too', 'full'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'findDuplicate.js',
            code: `function findDuplicate(nums) {
  let lo = 1;
  let hi = nums.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    let count = 0;
    for (const x of nums)
      if (x <= mid) count++;
    if (count > mid) hi = mid;
    else lo = mid + 1;
  }
  return lo;
}`,
            highlight: [9],
            note: { line: 9, text: 'O(n log n) time, O(1) space', tone: 'good' },
          },
        },
        {
          say: 'The trap is testing by re-reading. This line looks like normal binary search, and it is wrong.',
          emphasis: ['re-reading', 'wrong'],
          sfx: 'error',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'buggy.js',
            code: `if (count > mid) hi = mid - 1;
else lo = mid + 1;`,
            errors: [1],
            note: { line: 2, text: 'looks fine when you re-read it', tone: 'bad' },
          },
        },
        {
          say: 'So trace real values. Three is more than two, so hi drops to one, and the answer two is gone.',
          emphasis: ['trace', 'gone'],
          scene: {
            type: 'grid',
            title: 'Trace it with real values',
            colLabels: ['lo', 'hi', 'mid', 'cnt'],
            rowLabels: ['step 1', 'step 2'],
            cells: [
              [1, 4, 2, 3],
              [1, 1, '-', '-'],
            ],
            active: [[1, 1]],
            caption: 'hi skipped past 2, so it returns 1',
          },
        },
        {
          say: "Quick check. It's minute twenty, and you only have a slow O of n squared idea. What now?",
          speak: "Quick check. It's minute twenty, and you only have a slow oh of n squared idea. What now?",
          sfx: 'riser',
          scene: {
            type: 'quiz',
            question: 'Minute 20. You only have an O(n²) idea. What now?',
            options: ['Think quietly', 'Say it, code it, improve', 'Code a half-formed idea', 'Give up'],
            answer: 1,
          },
        },
        {
          say: 'Say the plan, code it, and improve it if time is left. Working code beats a half idea.',
          emphasis: ['Working', 'code'],
          sfx: 'ding',
          scene: {
            type: 'quiz',
            question: 'Minute 20. You only have an O(n²) idea. What now?',
            options: ['Think quietly', 'Say it, code it, improve', 'Code a half-formed idea', 'Give up'],
            answer: 1,
            reveal: true,
            explain: 'Slow code you can test beats fast code you never finish.',
          },
        },
        {
          say: 'Remember this. Clarify first, talk the whole time, and test by tracing real values. Now tap solve it and try it yourself.',
          emphasis: ['Clarify', 'talk', 'tracing'],
          sfx: 'success',
          scene: {
            type: 'outro',
            points: ['Clarify before you *code*', 'Talk the *whole* time', 'Test by *tracing*, not reading'],
            tagline: 'Now go solve it.',
          },
        },
      ],
    },

    // ───────────────────────── Lesson 5 ─────────────────────────
    {
      id: 'dsa-pattern-mastery-mock-interviews-1',
      title: 'Mock interviews 1 & 2',
      link: solve('mock-interviews-1', 'car-fleet'),
      beats: [
        {
          say: 'Pilots crash in the simulator, so they never crash in the sky.',
          emphasis: ['simulator'],
          scene: { type: 'title', kicker: 'Patterns · Lesson 5', title: 'Crash in the *simulator*', emoji: '🎮', style: 'slam' },
        },
        {
          say: 'Set a forty-five minute timer for two problems. Talk out loud, and score yourself before you peek.',
          emphasis: ['timer', 'score'],
          scene: {
            type: 'list',
            title: 'Run a mock on yourself',
            items: [
              { text: '*45 minutes*, two problems', icon: '⏱️' },
              { text: 'Talk out *loud* the whole time', icon: '🗣️' },
              { text: 'No hints for *10 minutes*', icon: '🙈' },
              { text: 'Score it *before* the answer', icon: '📝' },
            ],
            active: 0,
          },
        },
        {
          say: "Mock one: four cars drive to mile ten. They can't pass, so fast cars get stuck. How many groups arrive?",
          emphasis: ['groups'],
          sfx: 'pop',
          scene: {
            type: 'grid',
            title: 'Car fleet, target 10',
            colLabels: ['A', 'B', 'C', 'D'],
            rowLabels: ['pos', 'speed', 'time'],
            cells: [
              [1, 4, 6, 8],
              [3, 2, 4, 1],
              ['', '', '', ''],
            ],
            vars: { target: 10, fleets: '?' },
            caption: 'cars can never pass each other',
          },
        },
        {
          say: 'You could simulate tick by tick. But car C catches car D at two thirds of an hour, between ticks.',
          emphasis: ['simulate', 'between'],
          sfx: 'error',
          scene: {
            type: 'stat',
            value: '0.67',
            unit: 'h',
            label: 'when car *C* catches car D',
            sub: 'whole-hour ticks miss the meeting',
            tone: 'bad',
          },
        },
        {
          say: 'Stop simulating. A car can only be slowed by the car in front, so compare arrival times.',
          emphasis: ['in', 'front'],
          sfx: 'ding',
          scene: { type: 'title', kicker: 'The insight', title: 'Only the car *in front* matters', emoji: '💡', style: 'slam' },
        },
        {
          say: 'For each car, work out its time on an empty road. Car C has four miles left at speed four: one hour.',
          emphasis: ['empty', 'road'],
          scene: {
            type: 'grid',
            title: 'Car fleet, target 10',
            colLabels: ['A', 'B', 'C', 'D'],
            rowLabels: ['pos', 'speed', 'time'],
            cells: [
              [1, 4, 6, 8],
              [3, 2, 4, 1],
              [3, 3, 1, 2],
            ],
            active: [[2, 2]],
            reads: [[0, 2], [1, 2]],
            vars: { target: 10, fleets: '?' },
            caption: 'time = (10 − pos) ÷ speed',
          },
        },
        {
          say: 'Sort by position, front car first. Car D arrives at hour two, and starts the first fleet.',
          emphasis: ['front', 'first'],
          sfx: 'pop',
          scene: {
            type: 'grid',
            title: 'Front car first',
            colLabels: ['D', 'C', 'B', 'A'],
            rowLabels: ['pos', 'time'],
            cells: fleet,
            active: [[1, 0]],
            vars: { lead: 2, fleets: 1 },
            caption: 'later than the lead: new fleet',
          },
        },
        {
          say: "Car C would arrive at hour one, but it's stuck behind D. It joins that fleet.",
          emphasis: ['stuck', 'joins'],
          scene: {
            type: 'grid',
            title: 'Front car first',
            colLabels: ['D', 'C', 'B', 'A'],
            rowLabels: ['pos', 'time'],
            cells: fleet,
            active: [[1, 1]],
            reads: [[1, 0]],
            found: [[1, 0]],
            vars: { lead: 2, fleets: 1 },
            caption: 'not later than the lead: joins',
          },
        },
        {
          say: 'Car B needs three hours, later than two. It can never catch up, so it starts a new fleet.',
          emphasis: ['never', 'new'],
          scene: {
            type: 'grid',
            title: 'Front car first',
            colLabels: ['D', 'C', 'B', 'A'],
            rowLabels: ['pos', 'time'],
            cells: fleet,
            active: [[1, 2]],
            found: [[1, 0]],
            done: [[1, 1]],
            vars: { lead: 3, fleets: 2 },
            caption: 'later than the lead: new fleet',
          },
        },
        {
          say: 'Car A ties at hour three. They meet right at the target, so it joins. Two fleets.',
          emphasis: ['ties', 'Two'],
          sfx: 'success',
          scene: {
            type: 'grid',
            title: 'Front car first',
            colLabels: ['D', 'C', 'B', 'A'],
            rowLabels: ['pos', 'time'],
            cells: fleet,
            found: [[1, 0], [1, 2]],
            done: [[1, 1], [1, 3]],
            vars: { lead: 3, fleets: 2 },
            caption: 'a tie at the target still joins',
          },
        },
        {
          say: 'In JavaScript, sort front first, then keep one number: the lead fleet’s time. O of n log n.',
          speak: 'In JavaScript, sort front first, then keep one number: the lead fleet’s time. Oh of n log n.',
          emphasis: ['one', 'number'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'carFleet.js',
            code: `function carFleet(target, pos, sp) {
  const cars = pos.map((p, i) =>
    [p, (target - p) / sp[i]]);
  cars.sort((a, b) => b[0] - a[0]);
  let fleets = 0;
  let lead = 0;
  for (const [, time] of cars) {
    if (time > lead) {
      fleets++;
      lead = time;
    }
  }
  return fleets;
}`,
            highlight: [[8, 10]],
            note: { line: 10, text: 'sort + one pass: O(n log n)', tone: 'good' },
          },
        },
        {
          say: 'The trap is the tie. Arriving at the same time as the fleet means joining it. Only later starts a new one.',
          emphasis: ['tie', 'later'],
          sfx: 'error',
          scene: {
            type: 'compare',
            title: 'Car A ties at hour 3',
            left: { title: 'time >= lead', verdict: 'bad', items: ['A tie starts a fleet', 'Answers 3: wrong'] },
            right: { title: 'time > lead', verdict: 'ok', items: ['A tie joins the fleet', 'Answers 2: right'] },
          },
        },
        {
          say: 'Quick check. Why do you sweep from the car closest to the target?',
          sfx: 'riser',
          scene: {
            type: 'quiz',
            question: 'Why sweep from the car closest to the target?',
            options: ['Only the car ahead slows you', 'Sorting makes it O(n)', 'The closest is fastest', 'JS sorts from the end'],
            answer: 0,
          },
        },
        {
          say: 'Each car can only be slowed by the fleet ahead, so you decide that fleet first.',
          emphasis: ['ahead', 'first'],
          sfx: 'ding',
          scene: {
            type: 'quiz',
            question: 'Why sweep from the car closest to the target?',
            options: ['Only the car ahead slows you', 'Sorting makes it O(n)', 'The closest is fastest', 'JS sorts from the end'],
            answer: 0,
            reveal: true,
            explain: 'The fleet ahead is already decided.',
          },
        },
        {
          say: 'Remember this. Mock yourself with a timer, score it honestly, and only the car in front matters. Now tap solve it and try it yourself.',
          emphasis: ['timer', 'honestly'],
          sfx: 'success',
          scene: {
            type: 'outro',
            points: ['Mock with a *timer*, out loud', 'Score yourself *honestly*', 'Only the one *in front* matters'],
            tagline: 'Now go solve it.',
          },
        },
      ],
    },

    // ───────────────────────── Lesson 6 ─────────────────────────
    {
      id: 'dsa-pattern-mastery-mock-interviews-2',
      title: 'Mock interviews 3 & 4 (and what comes next)',
      link: solve('mock-interviews-2', 'evaluate-division'),
      beats: [
        {
          say: 'You never saw a dollar to rupee rate. Can you still work it out?',
          emphasis: ['rupee'],
          scene: { type: 'title', kicker: 'Patterns · Lesson 6', title: 'A graph in *disguise*', emoji: '💰', style: 'slam' },
        },
        {
          say: 'One dollar is one point one euros, and one euro is ninety rupees. Hop twice: ninety-nine rupees.',
          emphasis: ['Hop', 'ninety-nine'],
          sfx: 'pop',
          scene: {
            type: 'diagram',
            title: 'The airport board',
            cols: 1,
            rows: 4,
            nodes: [
              { id: 'usd', label: 'USD', icon: '💵', x: 0, y: 0 },
              { id: 'eur', label: 'EUR', icon: '💶', x: 0, y: 1.5 },
              { id: 'inr', label: 'INR', icon: '💴', x: 0, y: 3, tone: 'good' },
            ],
            edges: [
              { from: 'usd', to: 'eur', label: '× 1.1' },
              { from: 'eur', to: 'inr', label: '× 90' },
            ],
            caption: '1 USD = 1.1 × 90 = 99 INR',
          },
        },
        {
          say: 'Nobody said graph. But things with links between them, and a can I get from X to Y question, give it away.',
          emphasis: ['graph'],
          scene: {
            type: 'list',
            title: 'Hidden graph signals',
            items: [
              { text: '*Things* plus links between them', icon: '🔗' },
              { text: 'Can I get from *X to Y*?', icon: '🧭' },
              { text: 'Ratios that *multiply* along', icon: '✖️' },
              { text: 'Pairs like *[a, b]* in the input', icon: '📋' },
            ],
            active: 1,
          },
        },
        {
          say: 'Rename the nouns. Currencies, courses and people become nodes. Rates and rules become edges.',
          emphasis: ['nodes', 'edges'],
          sfx: 'ding',
          scene: { type: 'title', kicker: 'The insight', title: 'Rename the *nouns*', emoji: '💡', style: 'slam' },
        },
        {
          say: 'Each fact gives two arrows. If a over b is two, then b over a is one half.',
          emphasis: ['two', 'arrows'],
          scene: {
            type: 'diagram',
            title: 'a / b = 2 and b / c = 3',
            cols: 1,
            rows: 4,
            nodes: [
              { id: 'a', label: 'a', sub: 'node', x: 0, y: 0 },
              { id: 'b', label: 'b', sub: 'node', x: 0, y: 1.5 },
              { id: 'c', label: 'c', sub: 'node', x: 0, y: 3 },
            ],
            edges: [
              { from: 'a', to: 'b', label: '× 2, back × ½', both: true, active: true },
              { from: 'b', to: 'c', label: '× 3, back × ⅓', both: true },
            ],
            caption: 'query a / c: multiply along a path',
          },
        },
        {
          say: 'To find a over c, start a search at a, carrying a product of one.',
          emphasis: ['product'],
          scene: {
            type: 'diagram',
            title: 'BFS for a / c',
            cols: 1,
            rows: 4,
            nodes: [
              { id: 'a', label: 'a', sub: 'product 1', x: 0, y: 0, active: true },
              { id: 'b', label: 'b', sub: 'not seen', x: 0, y: 1.5, dim: true },
              { id: 'c', label: 'c', sub: 'not seen', x: 0, y: 3, dim: true },
            ],
            edges: [
              { from: 'a', to: 'b', label: '× 2', both: true },
              { from: 'b', to: 'c', label: '× 3', both: true },
            ],
            caption: 'the queue holds (node, product)',
          },
        },
        {
          say: "Step to b, and multiply by two. b's product is two.",
          emphasis: ['multiply'],
          scene: {
            type: 'diagram',
            title: 'BFS for a / c',
            cols: 1,
            rows: 4,
            nodes: [
              { id: 'a', label: 'a', sub: 'product 1', x: 0, y: 0, dim: true },
              { id: 'b', label: 'b', sub: '1 × 2 = 2', x: 0, y: 1.5, active: true },
              { id: 'c', label: 'c', sub: 'not seen', x: 0, y: 3, dim: true },
            ],
            edges: [
              { from: 'a', to: 'b', label: '× 2', both: true, active: true },
              { from: 'b', to: 'c', label: '× 3', both: true },
            ],
            packets: [{ from: 'a', to: 'b', label: '×2' }],
            caption: 'the queue holds (node, product)',
          },
        },
        {
          say: 'From b, a is already seen, so skip it. Step to c: two times three is six.',
          emphasis: ['seen', 'six'],
          scene: {
            type: 'diagram',
            title: 'BFS for a / c',
            cols: 1,
            rows: 4,
            nodes: [
              { id: 'a', label: 'a', sub: 'seen, skip', x: 0, y: 0, dim: true },
              { id: 'b', label: 'b', sub: '1 × 2 = 2', x: 0, y: 1.5, dim: true },
              { id: 'c', label: 'c', sub: '2 × 3 = 6', x: 0, y: 3, active: true },
            ],
            edges: [
              { from: 'a', to: 'b', label: '× 2', both: true },
              { from: 'b', to: 'c', label: '× 3', both: true, active: true },
            ],
            packets: [{ from: 'b', to: 'c', label: '×3' }],
            caption: 'the queue holds (node, product)',
          },
        },
        {
          say: 'c is the goal, so a over c is six. Every query is one quick search.',
          emphasis: ['six'],
          sfx: 'success',
          scene: {
            type: 'diagram',
            title: 'BFS for a / c',
            cols: 1,
            rows: 4,
            nodes: [
              { id: 'a', label: 'a', sub: 'start', x: 0, y: 0, tone: 'good' },
              { id: 'b', label: 'b', sub: '1 × 2 = 2', x: 0, y: 1.5, tone: 'good' },
              { id: 'c', label: 'c', sub: 'a / c = 6', x: 0, y: 3, tone: 'good', active: true },
            ],
            edges: [
              { from: 'a', to: 'b', label: '× 2', both: true, tone: 'good' },
              { from: 'b', to: 'c', label: '× 3', both: true, tone: 'good' },
            ],
            caption: 'answer = 2 × 3 = 6',
          },
        },
        {
          say: 'In JavaScript, each queue item carries a node and its product. Multiply as you step.',
          emphasis: ['Multiply'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'query.js',
            code: `function query(g, start, goal) {
  const seen = new Set([start]);
  const queue = [[start, 1]];
  while (queue.length) {
    const [n, prod] = queue.shift();
    if (n === goal) return prod;
    for (const [nx, w] of g.get(n)) {
      if (seen.has(nx)) continue;
      seen.add(nx);
      queue.push([nx, prod * w]);
    }
  }
  return -1;
}`,
            highlight: [10],
            note: { line: 10, text: 'O(V + E) per query', tone: 'good' },
          },
        },
        {
          say: 'The trap: x over x looks like one. But x is in no fact, so the answer is minus one.',
          emphasis: ['minus', 'one'],
          sfx: 'error',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'trap.js',
            code: `// facts: a / b = 2. Ask: x / x
if (start === goal) return 1;`,
            errors: [2],
            note: { line: 2, text: 'x is in no fact: answer -1', tone: 'bad' },
          },
        },
        {
          say: 'After the course, redo every miss after one, three and seven days, and run one mock a week.',
          emphasis: ['redo', 'mock'],
          scene: {
            type: 'list',
            title: 'What comes next',
            items: [
              { text: 'Redo misses after *1, 3, 7* days', icon: '🔁' },
              { text: 'One mixed mock *a week*', icon: '⏱️' },
              { text: 'A *miss log*: signal → pattern', icon: '📓' },
              { text: 'About *150* mediums, all patterns', icon: '🎯' },
            ],
            active: 0,
          },
        },
        {
          say: 'Quick check. Which of these is secretly a graph problem?',
          sfx: 'riser',
          scene: {
            type: 'quiz',
            question: 'Which of these is secretly a graph problem?',
            options: ['Courses: take A before B', 'Biggest contiguous sum', 'K-th largest score', 'Longest unique substring'],
            answer: 0,
          },
        },
        {
          say: 'The courses. Each course is a node, and take A before B is an arrow.',
          emphasis: ['node', 'arrow'],
          sfx: 'ding',
          scene: {
            type: 'quiz',
            question: 'Which of these is secretly a graph problem?',
            options: ['Courses: take A before B', 'Biggest contiguous sum', 'K-th largest score', 'Longest unique substring'],
            answer: 0,
            reveal: true,
            explain: 'Arrows between courses: topological sort.',
          },
        },
        {
          say: 'Remember this. Rename the nouns, multiply along the path, and redo your misses. Now tap solve it and try it yourself.',
          emphasis: ['nouns', 'misses'],
          sfx: 'success',
          scene: {
            type: 'outro',
            points: ['Rename nouns: *nodes* and *edges*', 'Ratios multiply along a *path*', 'Redo misses after *1, 3, 7* days'],
            tagline: 'Now go solve it.',
          },
        },
      ],
    },
  ],
};
