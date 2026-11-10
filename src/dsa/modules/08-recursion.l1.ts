import type { Lesson } from '../types';

// Module 8, lesson 1: thinking recursively. Base case, smaller input, trust the call, the call stack.
const lesson: Lesson = {
  id: 'thinking-recursively',
  title: 'Thinking recursively',
  summary: 'Solve a problem by solving a smaller copy of it: base case, smaller input, trust the call.',
  minutes: 18,
  blocks: [
    {
      kind: 'callout',
      tone: 'story',
      title: 'How big is this folder?',
      text: "Right-click a folder and your computer says \"Photos: 3.2 GB\". How does it know? A folder holds files and *more folders*. So: **folder size = its files + the size of each subfolder**. And each subfolder is the same question, just smaller. Russian dolls work the same way: open a doll, find a smaller doll, do the same thing again, until you reach the tiny solid one that does not open.",
    },
    {
      kind: 'text',
      text: "That is **recursion**: a function that calls itself on a smaller input. **The problem.** The Fibonacci numbers go `0, 1, 1, 2, 3, 5, 8, 13, …`. Each one is the sum of the two before it. Write `fib(n)`, where `fib(0) = 0` and `fib(1) = 1`. For example `fib(5) = 5` and `fib(7) = 13`.",
    },
    {
      kind: 'list',
      ordered: true,
      items: [
        "**What is the smallest input I can answer directly?** That is the **base case**, the place where the calls stop. For fib: `n = 0` gives 0 and `n = 1` gives 1.",
        "**How do I make the input smaller?** Go from `n` to `n - 1` and `n - 2`.",
        "**If I trust the smaller answers, how do I finish?** Add them: `fib(n) = fib(n - 1) + fib(n - 2)`.",
      ],
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Brute force: the definition, word for word',
      code: `function fib(n):
    if n ≤ 1:                       // base case: fib(0) = 0, fib(1) = 1
        return n
    return fib(n - 1) + fib(n - 2)  // trust both calls`,
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'Trust the call',
      text: "When you write `fib(n)`, **pretend `fib(n - 1)` and `fib(n - 2)` already work**. Do not trace every level in your head. You only check two things: the base case is right, and one step turns correct smaller answers into a correct bigger one. Like dominoes: if the first one falls, and each one knocks over the next, they all fall.",
    },
    {
      kind: 'trace',
      title: 'What the computer does for fib(3): the call stack',
      columns: ['#', 'what happens', 'stack (bottom → top)'],
      rows: [
        [1, 'call fib(3)', 'fib(3)'],
        [2, 'fib(3) pauses, calls fib(2)', 'fib(3), fib(2)'],
        [3, 'fib(2) pauses, calls fib(1)', 'fib(3), fib(2), fib(1)'],
        [4, 'fib(1) is a base case: return 1', 'fib(3), fib(2)'],
        [5, 'fib(2) resumes, calls fib(0)', 'fib(3), fib(2), fib(0)'],
        [6, 'fib(0) is a base case: return 0', 'fib(3), fib(2)'],
        [7, 'fib(2) returns 1 + 0 = 1', 'fib(3)'],
        [8, 'fib(3) resumes, calls fib(1)', 'fib(3), fib(1)'],
        [9, 'fib(1) returns 1', 'fib(3)'],
        [10, 'fib(3) returns 1 + 1 = 2', '(empty)'],
      ],
      note: "The **call stack** is a pile of paused calls. Each new call goes on top (push). It waits there until its answer comes back, then leaves the top (pop) and the call below it carries on. Each entry, called a **frame**, remembers its own `n` and where it paused. Here the pile is never more than 3 tall, even though there are 5 calls in total.",
    },
    {
      kind: 'diagram',
      title: 'Every call made by fib(5)',
      art: `fib(5)
├─ fib(4)
│  ├─ fib(3)            ← fib(3) worked out here
│  │  ├─ fib(2)
│  │  │  ├─ fib(1) = 1
│  │  │  └─ fib(0) = 0
│  │  └─ fib(1) = 1
│  └─ fib(2)
│     ├─ fib(1) = 1
│     └─ fib(0) = 0
└─ fib(3)               ← ...and again, from scratch
   ├─ fib(2)
   │  ├─ fib(1) = 1
   │  └─ fib(0) = 0
   └─ fib(1) = 1`,
      caption: "15 calls to get the number 5. `fib(3)` is computed twice and `fib(2)` three times.",
    },
    {
      kind: 'text',
      text: "**Spot the waste.** The brute force is correct. But each call starts two more, so the number of calls roughly doubles every time `n` grows by one: about **2ⁿ**. `fib(30)` makes about 2.7 million calls to compute 832040. Most of them redo work that was already done. The next lesson measures exactly how much. (Saving answers so you never redo them is called memoization; module 16 teaches it.) Here, a simpler fix: start from the bottom, `0, 1`, and walk up, keeping only the last two numbers.",
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Fast: walk up from the bottom with two variables',
      code: `function fib(n):
    a ← 0                    // fib(0)
    b ← 1                    // fib(1)
    for i from 1 to n:
        (a, b) ← (b, a + b)  // slide one step up the sequence
    return a                 // after n steps, a = fib(n)`,
    },
    {
      kind: 'code',
      lang: 'js',
      code: `// Recursion straight from the definition: correct, but about 2^n calls
function fibSlow(n) {
  if (n <= 1) return n; // base case
  return fibSlow(n - 1) + fibSlow(n - 2); // trust both calls
}

// Two variables, bottom up: n steps, no stack
function fib(n) {
  let a = 0; // fib(0)
  let b = 1; // fib(1)
  for (let i = 1; i <= n; i++) {
    [a, b] = [b, a + b];
  }
  return a;
}`,
    },
    {
      kind: 'compare',
      title: 'Computing fib(n)',
      rows: [
        { approach: 'Recursion from the definition', time: 'about O(2ⁿ)', space: 'O(n) stack', note: 'Easy to write and obviously right. Recomputes the same values again and again. Lesson 2 counts the calls.' },
        { approach: 'Two-variable loop', time: 'O(n)', space: 'O(1)', note: 'Each value is computed once and only the last two are kept.' },
      ],
    },
    {
      kind: 'text',
      text: "**When to think recursively.** Look for an input that holds a smaller copy of itself: a folder holds folders, row `n` of a pattern is built from row `n - 1`, a circle of `n` people becomes a circle of `n - 1` after one leaves. If the answer would be easy *if someone handed you* the answer for the smaller copy, ask the three questions and trust the call. Sometimes, like fib, a loop is faster afterwards. Sometimes, like the circle below, no loop is obvious at all until recursion shows you the way.",
    },
    {
      kind: 'diagram',
      title: 'Trust the call on a circle (Josephus, n = 5, k = 2)',
      art: `Count 2 people around the circle; the 2nd one leaves.

circle of 5:  1  2  3  4  5
label:        0  1  2  3  4
                 ✗  (person 2 leaves)

the game goes on from person 3, with 4 people:
circle of 4:        3  4  5  1
new label:          0  1  2  3

old label = (new label + k) % 5
smaller game's winner: new label 0
→ old label (0 + 2) % 5 = 2 → person 3 wins`,
      caption: "After one person leaves, what is left is the **same game** with one fewer person, just starting k seats later. Trust the call for 4 people, then shift its answer back by k. That is the third problem below.",
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Template: the three questions in code',
      code: `function solve(input):
    if input is tiny:              // Q1: base case, answer directly
        return the direct answer
    smaller ← shrink(input)        // Q2: n - 1, n / 2, a subfolder...
    sub ← solve(smaller)           // trust it: assume it is right
    return finish(sub, input)      // Q3: one small step of work

// Example: the folder from the story
function folderSize(folder):
    total ← sum of the sizes of the files in folder
    for each sub in the subfolders of folder:
        total ← total + folderSize(sub)   // trust the call
    return total    // no subfolders = base case, the loop does nothing`,
    },
    {
      kind: 'callout',
      tone: 'trap',
      title: 'Mirrors facing each other: stack overflow',
      text: "Every call that has not finished yet takes a frame on the stack, and JavaScript only has room for roughly **10,000** of them (the exact number depends on the engine). Go past that and you get `RangeError: Maximum call stack size exceeded`. Two ways to get there. **No reachable base case:** write fib with only `if (n === 1) return 1`, and `fib(2)` calls `fib(0)`, which calls `fib(-1)`, `fib(-2)`, … forever, like two mirrors reflecting each other. **Correct but too deep:** a recursion that goes `n → n - 1` with `n = 10⁵` needs 100,000 frames. When the depth can reach 10⁵, write a loop instead.",
    },
  ],
  problems: [
    {
      id: 'recursion-fibonacci',
      title: 'Fibonacci number',
      difficulty: 'easy',
      leetcode: 509,
      pattern: 'Recursion (then a loop)',
      statement: "Count the spirals of seeds in a sunflower and you often get a Fibonacci number. The sequence starts `0, 1`, and every next number is the sum of the two before it: `0, 1, 1, 2, 3, 5, 8, 13, …`. Given `n`, return `fib(n)`, where `fib(0) = 0` and `fib(1) = 1`.",
      examples: [
        { input: 'n = 2', output: '1', explain: '`fib(2) = fib(1) + fib(0) = 1 + 0`.' },
        { input: 'n = 4', output: '3', explain: '`0, 1, 1, 2, 3`: the number at position 4 is 3.' },
        { input: 'n = 10', output: '55' },
      ],
      constraints: ['0 ≤ n ≤ 30'],
      hints: [
        'Ask the three questions. Which inputs can you answer without any work?',
        'The base cases are `n = 0` and `n = 1`. Every other `fib(n)` is `fib(n - 1) + fib(n - 2)`: trust those two calls.',
        'Faster: start from `a = 0, b = 1` and slide up `n` times with `(a, b) = (b, a + b)`. Then `a` is the answer.',
      ],
      approaches: [
        {
          name: 'Recursion, straight from the definition',
          idea: 'The definition already is a recursive function: two base cases and one step that adds two smaller answers. It is correct, but every call starts two more, so the same values get recomputed over and over: about 2ⁿ calls (the next lesson counts them).',
          code: `function fib(n) {
  if (n <= 1) return n;
  return fib(n - 1) + fib(n - 2);
}`,
          time: 'about O(2ⁿ)',
          space: 'O(n) stack',
        },
        {
          name: 'Two-variable loop',
          idea: 'Each Fibonacci number only needs the two before it. So start at `0, 1` and walk up, keeping just the last two. Every value is computed exactly once.',
          pseudo: `function fib(n):
    a ← 0
    b ← 1
    for i from 1 to n:
        (a, b) ← (b, a + b)
    return a`,
          code: `function fib(n) {
  let a = 0;
  let b = 1;
  for (let i = 1; i <= n; i++) {
    [a, b] = [b, a + b];
  }
  return a;
}`,
          time: 'O(n)',
          space: 'O(1)',
        },
      ],
      fn: 'fib',
      starter: `function fib(n) {
  // Your code here: return the n-th Fibonacci number.
  return 0;
}`,
      solution: `function fib(n) {
  let a = 0;
  let b = 1;
  for (let i = 1; i <= n; i++) {
    [a, b] = [b, a + b];
  }
  return a;
}`,
      tests: [
        { name: 'n = 0 (base case)', args: [0], expected: 0 },
        { name: 'n = 1 (base case)', args: [1], expected: 1 },
        { name: 'n = 2', args: [2], expected: 1 },
        { name: 'n = 3', args: [3], expected: 2 },
        { name: 'n = 4', args: [4], expected: 3 },
        { name: 'n = 10', args: [10], expected: 55 },
        { name: 'n = 20', args: [20], expected: 6765 },
        { name: 'largest n = 30', args: [30], expected: 832040 },
      ],
      takeaway: 'A recursive definition is a correct first draft. If it recomputes the same values, build up from the bottom instead.',
    },
    {
      id: 'recursion-kth-symbol',
      title: 'K-th symbol in the fair-turns sequence',
      difficulty: 'medium',
      leetcode: 779,
      pattern: 'Trust the smaller call',
      statement: "Two friends pick sweets from a bowl. Taking turns `0 1 0 1` is unfair: player 0 always picks first. A fairer order comes from this rule. Row 1 is `0`. To make the next row, replace every `0` in the row above with `01` and every `1` with `10`. So the rows are `0`, `01`, `0110`, `01101001`, … Given `n` and `k` (both counted from 1), return the `k`-th symbol of row `n` as the number `0` or `1`.",
      examples: [
        { input: 'n = 1, k = 1', output: '0', explain: 'Row 1 is just `0`.' },
        { input: 'n = 2, k = 2', output: '1', explain: 'Row 2 is `01`.' },
        {
          input: 'n = 4, k = 5',
          output: '1',
          explain: 'Row 4 is `0110 1001`. Without building it: 5 is odd, so it copies its parent, position 3 of row 3. 3 is odd, so that copies position 2 of row 2. 2 is even, so that is the flip of position 1 of row 1, which is 0. Answer: 1.',
        },
      ],
      constraints: ['1 ≤ n ≤ 30', '1 ≤ k ≤ 2ⁿ⁻¹ (row n has 2ⁿ⁻¹ symbols)'],
      hints: [
        'Row 30 has over 500 million symbols. Do not build it. Instead ask: where did position `k` come from?',
        'Every symbol in row `n - 1` makes two symbols in row `n`. So position `k` comes from position `ceil(k / 2)` of the row above, its **parent**.',
        'An odd `k` is the first child: `0 → 01` and `1 → 10` both start with the parent, so it equals the parent. An even `k` is the second child, the flipped parent. Trust the call for the parent; the base case is row 1, which is `0`.',
      ],
      approaches: [
        {
          name: 'Build every row',
          idea: 'Follow the rule literally: start from `"0"` and build each row from the one above as a string, then read position `k`. It works for small `n`, but each row is twice as long as the one before, and row 30 has 2²⁹ (about 537 million) symbols. Far too much time and memory.',
          time: 'O(2ⁿ)',
          space: 'O(2ⁿ)',
        },
        {
          name: 'Ask the parent (recursion)',
          idea: 'You do not need the whole row, only the chain of parents above position `k`. The parent of `k` is `ceil(k / 2)` in row `n - 1`. Trust the call to give you the parent symbol, then keep it if `k` is odd and flip it if `k` is even. Each call drops one row, so there are only `n` calls.',
          pseudo: `function kthGrammar(n, k):
    if n = 1:
        return 0                                // row 1 is "0"
    parent ← kthGrammar(n - 1, ceil(k / 2))     // trust the call
    if k is odd:
        return parent                           // first child copies the parent
    return 1 - parent                           // second child is flipped`,
          code: `function kthGrammar(n, k) {
  if (n === 1) return 0;
  const parent = kthGrammar(n - 1, Math.ceil(k / 2));
  return k % 2 === 1 ? parent : 1 - parent;
}`,
          time: 'O(n)',
          space: 'O(n) stack',
        },
      ],
      fn: 'kthGrammar',
      starter: `function kthGrammar(n, k) {
  // Your code here: return the k-th symbol (0 or 1) of row n.
  return 0;
}`,
      solution: `function kthGrammar(n, k) {
  if (n === 1) return 0;
  const parent = kthGrammar(n - 1, Math.ceil(k / 2));
  return k % 2 === 1 ? parent : 1 - parent;
}`,
      tests: [
        { name: 'row 1', args: [1, 1], expected: 0 },
        { name: 'row 2, second symbol', args: [2, 2], expected: 1 },
        { name: 'row 3, k = 3', args: [3, 3], expected: 1 },
        { name: 'row 4, k = 5', args: [4, 5], expected: 1 },
        { name: 'last of row 4', args: [4, 8], expected: 1 },
        { name: 'row 5, k = 10', args: [5, 10], expected: 0 },
        { name: 'row 10, k = 300', args: [10, 300], expected: 1 },
        { name: 'row 25, big k', args: [25, 7777777], expected: 0 },
        { name: 'first of row 30', args: [30, 1], expected: 0 },
        { name: 'last of row 30 (k = 2²⁹)', args: [30, 536870912], expected: 1 },
        { name: 'row 30, k = 123456789', args: [30, 123456789], expected: 1 },
      ],
      takeaway: "Don't build the giant thing. Ask where position k came from, and trust the call for the parent.",
    },
    {
      id: 'recursion-josephus',
      title: 'Last friend standing',
      difficulty: 'medium',
      leetcode: 1823,
      pattern: 'Trust the smaller call',
      statement: "\"Eeny, meeny, miny, moe\": `n` friends sit in a circle, numbered `1` to `n` clockwise. Start at friend 1 and count `k` friends clockwise, counting the one you start on. The `k`-th friend leaves the circle. Start counting again from the friend just after the one who left. Repeat until one friend is left, and return their number. The count wraps around the circle, so `k` may be bigger than the number of friends left. (Legend says the historian Josephus used this puzzle to pick the one safe spot in a circle.)",
      examples: [
        {
          input: 'n = 5, k = 2',
          output: '3',
          explain: 'Friends 1 2 3 4 5. Count 1, 2: friend 2 leaves. Count 3, 4: friend 4 leaves. Count 5, 1: friend 1 leaves. Count 3, 5: friend 5 leaves. Friend 3 wins.',
        },
        {
          input: 'n = 6, k = 5',
          output: '1',
          explain: 'Friends leave in the order 5, 4, 6, 2, 3. Friend 1 is left.',
        },
        { input: 'n = 4, k = 1', output: '4', explain: 'With k = 1 each count removes the friend you start on: 1, 2, 3 leave, and the last friend wins.' },
      ],
      constraints: ['1 ≤ n ≤ 500', '1 ≤ k ≤ 500'],
      hints: [
        'After one friend leaves, what is left is the same game with `n - 1` friends. Only the starting point moved.',
        'Number the seats from 0. In the smaller circle, the new seat 0 is the friend just after the one who left: old seat `k % n`.',
        'So new seat `x` is old seat `(x + k) % n`. The winner of `n` friends is `(winner of n - 1 friends + k) % n`, and with 1 friend the winner is seat 0. Add 1 at the end to turn seats into friend numbers.',
      ],
      approaches: [
        {
          name: 'Simulate the circle',
          idea: 'Put the friends in an array and act it out. If the count starts at index `i`, the friend who leaves is at index `(i + k - 1) % length`. Remove them, and the next count starts at that same index, because everyone after them shifts one place left. Correct, but each removal shifts up to `n` items.',
          code: `function findTheWinner(n, k) {
  const circle = Array.from({ length: n }, (_, i) => i + 1);
  let i = 0;
  while (circle.length > 1) {
    i = (i + k - 1) % circle.length;
    circle.splice(i, 1);
  }
  return circle[0];
}`,
          time: 'O(n²)',
          space: 'O(n)',
        },
        {
          name: 'Trust the call on the smaller circle',
          idea: 'Use seats `0` to `n - 1`. After the first friend leaves, the game restarts at old seat `k % n` with `n - 1` friends. Call that seat new seat 0: every label shifted by `k`. Trust the call to find the winner\'s seat `w` in the smaller circle, then shift back: `(w + k) % n`. One friend alone sits at seat 0. For very big `n` (deep stacks), write the same formula as a loop: `w = 0`, then `w = (w + k) % m` for `m` from 2 to `n`.',
          pseudo: `function findTheWinner(n, k):
    return winner(n, k) + 1            // seat 0..n-1 → friend 1..n

function winner(m, k):                 // winning seat in a circle of m
    if m = 1:
        return 0                       // one friend: seat 0 wins
    w ← winner(m - 1, k)               // trust the call
    return (w + k) mod m               // shift the seat back by k`,
          code: `function findTheWinner(n, k) {
  // winning seat (0-based) in a circle of m friends
  function winner(m) {
    if (m === 1) return 0;
    return (winner(m - 1) + k) % m;
  }
  return winner(n) + 1;
}`,
          time: 'O(n)',
          space: 'O(n) stack',
        },
      ],
      fn: 'findTheWinner',
      starter: `function findTheWinner(n, k) {
  // Your code here: return the number of the last friend left.
  return 1;
}`,
      solution: `function findTheWinner(n, k) {
  function winner(m) {
    if (m === 1) return 0;
    return (winner(m - 1) + k) % m;
  }
  return winner(n) + 1;
}`,
      tests: [
        { name: 'classic', args: [5, 2], expected: 3 },
        { name: 'k close to n', args: [6, 5], expected: 1 },
        { name: 'one friend', args: [1, 1], expected: 1 },
        { name: 'k = 1: last friend wins', args: [4, 1], expected: 4 },
        { name: 'k bigger than n', args: [3, 7], expected: 3 },
        { name: 'n = 7, k = 3', args: [7, 3], expected: 4 },
        { name: 'k = n', args: [10, 10], expected: 8 },
        { name: 'big circle', args: [500, 13], expected: 370 },
        { name: 'biggest circle, k = 500', args: [500, 500], expected: 69 },
      ],
      takeaway: 'Removing one item can leave the same problem, relabeled. Trust the call on the smaller one, then translate its answer back.',
    },
  ],
  quiz: [
    {
      prompt: 'You write `function f(n) { return f(n - 1) + 1; }` and call `f(5)`. What happens?',
      options: [
        'It returns 5.',
        'It returns 6.',
        'It throws `RangeError: Maximum call stack size exceeded`.',
        'It returns `undefined`.',
      ],
      answer: 2,
      explanation: 'There is no base case. `n` goes 5, 4, 3, …, 0, -1, -2 and never stops, so the paused calls pile up until the stack runs out of room.',
    },
    {
      prompt: 'While `fib(3)` runs, what is the most frames on the call stack at the same time?',
      options: ['2', '3', '5', '10'],
      answer: 1,
      explanation: '`fib(3)` waits on `fib(2)`, which waits on `fib(1)`: 3 frames. There are 5 calls in total, but never more than `n` are paused at once.',
    },
    {
      prompt: 'Row 4 of the fair-turns sequence is `01101001`. To find position 6 with the recursive idea, what do you do?',
      options: [
        'Call `kthGrammar(3, 3)` and keep its answer.',
        'Call `kthGrammar(3, 3)` and flip its answer.',
        'Call `kthGrammar(3, 6)` and keep its answer.',
        'Call `kthGrammar(3, 2)` and flip its answer.',
      ],
      answer: 1,
      explanation: 'The parent of position 6 is `ceil(6 / 2) = 3` in row 3. 6 is even, so it is the second child: flip. Row 3 is `0110`, position 3 is 1, flipped gives 0, and indeed `01101001` has 0 at position 6.',
    },
    {
      prompt: 'Last friend standing with k = 2: the winning seat (0-based) for 4 friends is 0. Who wins with 5 friends?',
      options: ['Friend 1', 'Friend 2', 'Friend 3', 'Friend 5'],
      answer: 2,
      explanation: 'Shift the smaller answer back by k: `(0 + 2) % 5 = 2`, which is seat 2, so friend 3. That matches acting it out: 2, 4, 1, 5 leave.',
    },
  ],
  takeaways: [
    'Recursion = a base case + a call on a smaller input + one step to finish. Ask the three questions every time.',
    'Trust the call: check the base case and one step. Do not trace every level in your head.',
    'Every waiting call sits on the call stack. JavaScript runs out at roughly 10,000 frames, so if the depth can reach 10⁵, use a loop.',
    'Recursion is a way to think, not always the fastest code: naive fib repeats work (lesson 2 measures it) and a loop fixes it.',
  ],
};

export default lesson;
