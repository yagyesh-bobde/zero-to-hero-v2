import type { Lesson } from '../types';

// ---------------------------------------------------------------------------
// Lesson 1: the template, learned on subsets
// ---------------------------------------------------------------------------

const subsetsLesson: Lesson = {
  id: 'subsets-template',
  title: 'Subsets: choose, explore, un-choose',
  summary: 'The one template behind every backtracking problem, learned on the simplest search: list every subset.',
  minutes: 20,
  blocks: [
    {
      kind: 'callout',
      tone: 'story',
      title: 'Build your own pizza',
      text: "A pizza app lets you add any of three toppings: cheese, olives, mushrooms. Each topping is either on or off, so there are 2 × 2 × 2 = **8** different pizzas, from plain to everything. The app wants to show all 8. That list is the set of **subsets**: every way to pick some of the items (maybe none, maybe all), where order doesn't matter.",
    },
    {
      kind: 'text',
      text: "**The problem.** You get `nums = [1, 2, 3]` (all different). Return every subset, in any order. There are 8: `[]`, `[1]`, `[2]`, `[3]`, `[1,2]`, `[1,3]`, `[2,3]`, `[1,2,3]`.",
    },
    {
      kind: 'text',
      text: "**Brute force first.** You could write one loop per item: 'take 1 or not', inside it 'take 2 or not', inside that 'take 3 or not'. Fine for 3 items, but 10 items need 10 nested loops, and you don't know n in advance. There is a neat loop trick that does work: start with only the empty subset. For each number, copy every subset you have so far and add the number to the copy. The list doubles each time.",
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Brute force: the doubling trick',
      code: `function subsets(nums):
    result ← [[]]
    for each x in nums:
        for each s in a snapshot of result:
            append (s plus x) to result
    return result`,
    },
    {
      kind: 'text',
      text: "**Spot the waste.** For plain subsets this is fine, because *every* subset is an answer. But change the question a little: 'only subsets that add up to 10', or 'only subsets of size 2'. The doubling trick still builds every half-finished subset and only checks at the very end. It can't say 'this one is already too big, stop growing it'. We want to build **one answer at a time**, step by step, and back out of a dead end the moment we see it. That is **backtracking**.",
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'One decision per item',
      text: "Walk the items left to right and make one decision each: **take it** or **skip it**. Keep your current picks in one shared array called `path`. To take an item: push it (**choose**), recurse to the next item (**explore**), then pop it (**un-choose**) so `path` is clean again before you try skipping it. When every item has been decided, `path` is one finished subset: save a copy.",
    },
    {
      kind: 'diagram',
      title: 'The decision tree for [1, 2, 3]',
      art: `start: path = []
├─ take 1 → [1]
│  ├─ take 2 → [1,2]
│  │  ├─ take 3 → [1,2,3]   save
│  │  └─ skip 3 → [1,2]     save
│  └─ skip 2 → [1]
│     ├─ take 3 → [1,3]     save
│     └─ skip 3 → [1]       save
└─ skip 1 → []
   ├─ take 2 → [2]
   │  ├─ take 3 → [2,3]     save
   │  └─ skip 3 → [2]       save
   └─ skip 2 → []
      ├─ take 3 → [3]       save
      └─ skip 3 → []        save`,
      caption: 'Each level decides one item. Each leaf is one subset: 3 yes/no decisions give 2 × 2 × 2 = 8 leaves.',
    },
    {
      kind: 'trace',
      title: 'Watch `path` grow and shrink',
      columns: ['step', 'deciding', 'action', 'path after', 'saved'],
      rows: [
        [1, 'item 1', 'take: push 1', '[1]', ''],
        [2, 'item 2', 'take: push 2', '[1,2]', ''],
        [3, 'item 3', 'take: push 3', '[1,2,3]', ''],
        [4, 'done', 'all decided', '[1,2,3]', '[1,2,3]'],
        [5, 'item 3', 'pop 3, then skip it', '[1,2]', ''],
        [6, 'done', 'all decided', '[1,2]', '[1,2]'],
        [7, 'item 2', 'pop 2, then skip it', '[1]', ''],
        [8, 'item 3', 'take: push 3', '[1,3]', ''],
        [9, 'done', 'all decided', '[1,3]', '[1,3]'],
        [10, 'item 3', 'pop 3, then skip it', '[1]', ''],
        [11, 'done', 'all decided', '[1]', '[1]'],
        [12, 'item 1', 'pop 1, then skip it', '[]', '4 more to come'],
      ],
      note: "One array does all the work. It grows on the way down and shrinks on the way back up. When the call for item 1 finishes, `path` is empty again, exactly as it started.",
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Backtracking: take or skip',
      code: `function subsets(nums):
    result ← empty list
    path ← empty list
    function go(i):                     // decide about nums[i]
        if i = n:                       // every item decided
            append a copy of path to result
            return
        push nums[i] onto path          // choose: take it
        go(i + 1)                       // explore
        pop from path                   // un-choose
        go(i + 1)                       // explore without it
    go(0)
    return result`,
    },
    {
      kind: 'code',
      lang: 'js',
      code: `function subsets(nums) {
  const result = [];
  const path = [];
  function go(i) {
    if (i === nums.length) {
      result.push([...path]); // save a COPY
      return;
    }
    path.push(nums[i]); // choose
    go(i + 1);          // explore
    path.pop();         // un-choose
    go(i + 1);          // skip nums[i]
  }
  go(0);
  return result;
}`,
    },
    {
      kind: 'callout',
      tone: 'trap',
      title: 'Save a copy, not the path',
      text: "`result.push(path)` saves a *reference* to the one shared array. You keep changing that array, and when the search ends it is empty, so your result looks like `[[], [], [], ...]`. Always save `[...path]` (or `path.slice()`). This is the number one backtracking bug.",
    },
    {
      kind: 'compare',
      title: 'Subsets of n items',
      rows: [
        { approach: 'Doubling trick', time: 'O(n · 2ⁿ)', space: 'O(n · 2ⁿ)', note: 'Simple and fine for plain subsets. Cannot stop a bad branch early.' },
        { approach: 'Backtracking (take or skip)', time: 'O(n · 2ⁿ)', space: 'O(n) + output', note: 'Same speed here, because all 2ⁿ subsets are answers. Wins big once you can cut branches.' },
      ],
    },
    {
      kind: 'table',
      title: 'How big does 2ⁿ get?',
      head: ['n', '2ⁿ', 'Verdict'],
      rows: [
        ['10', '1,024', 'instant'],
        ['15', '32,768', 'instant'],
        ['20', 'about 1 million', 'fine'],
        ['30', 'about 1 billion', 'too slow'],
      ],
    },
    {
      kind: 'text',
      text: "**Constraint signal:** when a problem says n ≤ 20 (often n ≤ 15) and asks for *all* the ways, it is inviting an exponential search like this one.",
    },
    {
      kind: 'text',
      text: "**The pattern.** Every backtracking problem fills in the same four blanks: the **path** (what you picked so far), the **choices** at this step, the **base case** (when is `path` a full answer?), and the **choose → explore → un-choose** move. The next lessons only change the blanks.",
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'The backtracking template',
      code: `function backtrack(state):
    if state is a full answer:
        append a copy of path to result
        return
    for each choice available in state:
        if choice breaks a rule: continue    // prune
        add choice to path                    // choose
        backtrack(next state)                 // explore
        remove choice from path               // un-choose`,
    },
    {
      kind: 'text',
      text: "**Same subsets, another shape.** Instead of take/skip, say: 'every `path` is already a subset, so save it. Then try adding each item that comes *after* the last one I added.' The loop starts at `start`, so you never go backwards and never build `[2,1]` after `[1,2]`. Next lesson uses this shape for combinations:",
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Subsets, loop version',
      code: `function go(start):
    append a copy of path to result     // every node is a subset
    for i from start to n - 1:
        push nums[i] onto path
        go(i + 1)
        pop from path`,
    },
  ],
  problems: [
    {
      id: 'backtracking-subsets',
      title: 'Subsets',
      difficulty: 'medium',
      leetcode: 78,
      pattern: 'Backtracking (take or skip)',
      statement: "Your pizza app stores toppings as different numbers in `nums`. Return every possible topping combo: every subset of `nums`, including the empty one and the full list. The order of the subsets, and the order inside each subset, don't matter.",
      examples: [
        { input: 'nums = [1, 2, 3]', output: '[[], [1], [2], [3], [1,2], [1,3], [2,3], [1,2,3]]' },
        { input: 'nums = [0]', output: '[[], [0]]' },
      ],
      constraints: ['0 ≤ nums.length ≤ 10', '-10 ≤ nums[i] ≤ 10', 'all numbers are different'],
      hints: [
        'For each number there are only two options: in the subset, or not.',
        'Keep one `path` array, and recurse with an index `i` that says which number you are deciding about.',
        'Base case: `i === nums.length` means `path` is a finished subset, so push a copy. Otherwise push `nums[i]`, recurse, pop, and recurse again without it.',
      ],
      approaches: [
        {
          name: 'Doubling trick',
          idea: "Start with `[[]]`. For each number, copy every subset you already have and add the number to the copy. Every old subset either lacks the new number or gets it, so the count doubles each time and nothing is missed.",
          code: `function subsets(nums) {
  const result = [[]];
  for (const x of nums) {
    const size = result.length;
    for (let j = 0; j < size; j++) result.push([...result[j], x]);
  }
  return result;
}`,
          time: 'O(n · 2ⁿ)',
          space: 'O(n · 2ⁿ)',
        },
        {
          name: 'Backtracking (take or skip)',
          idea: 'Decide about one number per level: take it or skip it. Push, recurse, pop keeps one shared `path` correct. Each leaf of the decision tree is one subset, so you save a copy there.',
          pseudo: `function subsets(nums):
    result ← empty list
    path ← empty list
    function go(i):
        if i = n:
            append a copy of path to result
            return
        push nums[i] onto path          // take
        go(i + 1)
        pop from path                   // un-choose
        go(i + 1)                       // skip
    go(0)
    return result`,
          code: `function subsets(nums) {
  const result = [];
  const path = [];
  function go(i) {
    if (i === nums.length) {
      result.push([...path]);
      return;
    }
    path.push(nums[i]);
    go(i + 1);
    path.pop();
    go(i + 1);
  }
  go(0);
  return result;
}`,
          time: 'O(n · 2ⁿ)',
          space: 'O(n) besides the output',
        },
      ],
      fn: 'subsets',
      starter: `function subsets(nums) {
  // return every subset of nums
  return [];
}`,
      solution: `function subsets(nums) {
  const result = [];
  const path = [];
  function go(i) {
    if (i === nums.length) {
      result.push([...path]);
      return;
    }
    path.push(nums[i]);
    go(i + 1);
    path.pop();
    go(i + 1);
  }
  go(0);
  return result;
}`,
      compare: 'nested',
      tests: [
        { name: 'three numbers', args: [[1, 2, 3]], expected: [[1,2,3],[1,2],[1,3],[1],[2,3],[2],[3],[]] },
        { name: 'one number', args: [[0]], expected: [[0],[]] },
        { name: 'empty list', args: [[]], expected: [[]] },
        { name: 'negatives', args: [[-1, 5]], expected: [[-1,5],[-1],[5],[]] },
        { name: 'four numbers', args: [[4, 1, 0, 9]], expected: [[4,1,0,9],[4,1,0],[4,1,9],[4,1],[4,0,9],[4,0],[4,9],[4],[1,0,9],[1,0],[1,9],[1],[0,9],[0],[9],[]] },
        { name: 'five numbers', args: [[1, 2, 3, 4, 5]], expected: [[1,2,3,4,5],[1,2,3,4],[1,2,3,5],[1,2,3],[1,2,4,5],[1,2,4],[1,2,5],[1,2],[1,3,4,5],[1,3,4],[1,3,5],[1,3],[1,4,5],[1,4],[1,5],[1],[2,3,4,5],[2,3,4],[2,3,5],[2,3],[2,4,5],[2,4],[2,5],[2],[3,4,5],[3,4],[3,5],[3],[4,5],[4],[5],[]] },
      ],
      takeaway: 'Two choices per item gives 2ⁿ answers. Push, recurse, pop, and save a copy.',
    },
    {
      id: 'backtracking-subset-xor-total',
      title: 'Sum of All Subset XOR Totals',
      difficulty: 'easy',
      leetcode: 1863,
      pattern: 'Backtracking (take or skip)',
      statement: "A card game scores every group of cards by XOR-ing their numbers together. XOR is the `^` operator in JS. You don't need to know how it works inside (module 18 covers bits); just know that `0 ^ x` is `x` and that you combine a group by doing `a ^ b ^ c`. The empty group scores 0. Return the **sum of the scores of every subset** of `nums`.",
      examples: [
        { input: 'nums = [1, 3]', output: '6', explain: 'Subsets: `[]` → 0, `[1]` → 1, `[3]` → 3, `[1,3]` → `1 ^ 3` = 2. Total 0 + 1 + 3 + 2 = 6.' },
        { input: 'nums = [5, 1, 6]', output: '28' },
      ],
      constraints: ['1 ≤ nums.length ≤ 12', '0 ≤ nums[i] ≤ 20'],
      hints: [
        'This is the subsets decision tree again: take or skip each number.',
        "You don't need to store the subset. Carry the XOR so far as a parameter instead of a `path`.",
        '`go(i, x)`: if `i === nums.length`, return `x`. Otherwise return `go(i + 1, x ^ nums[i]) + go(i + 1, x)`.',
      ],
      approaches: [
        {
          name: 'List every subset, then score it',
          idea: 'Build all subsets with the lesson code, XOR each one, and add up the scores. Correct, but it stores 2ⁿ arrays you only look at once.',
          code: `function subsetXORSum(nums) {
  const all = [[]];
  for (const x of nums) {
    const size = all.length;
    for (let j = 0; j < size; j++) all.push([...all[j], x]);
  }
  let sum = 0;
  for (const s of all) sum += s.reduce((a, b) => a ^ b, 0);
  return sum;
}`,
          time: 'O(n · 2ⁿ)',
          space: 'O(n · 2ⁿ)',
        },
        {
          name: 'Backtracking with a running XOR',
          idea: "Walk the take/skip tree but carry only the XOR so far. At a leaf, that number *is* the subset's score; each call returns the total of all leaves below it. Because `x` is passed as an argument, un-choosing is free: the caller's `x` never changed.",
          pseudo: `function subsetXORSum(nums):
    function go(i, x):                  // x = XOR of picks so far
        if i = n:
            return x
        return go(i + 1, x XOR nums[i]) + go(i + 1, x)
    return go(0, 0)`,
          code: `function subsetXORSum(nums) {
  function go(i, x) {
    if (i === nums.length) return x;
    return go(i + 1, x ^ nums[i]) + go(i + 1, x);
  }
  return go(0, 0);
}`,
          time: 'O(2ⁿ)',
          space: 'O(n) recursion depth',
        },
      ],
      fn: 'subsetXORSum',
      starter: `function subsetXORSum(nums) {
  // add up the XOR of every subset
  return 0;
}`,
      solution: `function subsetXORSum(nums) {
  function go(i, x) {
    if (i === nums.length) return x;
    return go(i + 1, x ^ nums[i]) + go(i + 1, x);
  }
  return go(0, 0);
}`,
      tests: [
        { name: 'two numbers', args: [[1, 3]], expected: 6 },
        { name: 'three numbers', args: [[5, 1, 6]], expected: 28 },
        { name: 'six numbers', args: [[3, 4, 5, 6, 7, 8]], expected: 480 },
        { name: 'one number', args: [[7]], expected: 7 },
        { name: 'equal numbers', args: [[1, 1]], expected: 2 },
        { name: 'zeros', args: [[0, 0]], expected: 0 },
        { name: 'twelve numbers', args: [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]], expected: 30720 },
      ],
      takeaway: 'When the state is a number passed as an argument, the un-choose step happens for free.',
    },
    {
      id: 'backtracking-letter-case',
      title: 'Letter Case Permutation',
      difficulty: 'medium',
      leetcode: 784,
      pattern: 'Backtracking (choices per position)',
      statement: "You remember your Wi-Fi password is `a1b2`, but not which letters were capitals. Given a string `s` of letters and digits, return every version of it where each letter may be lowercase or uppercase. Digits stay as they are. Any order is fine.",
      examples: [
        { input: "s = 'a1b2'", output: "['a1b2', 'a1B2', 'A1b2', 'A1B2']" },
        { input: "s = '3z4'", output: "['3z4', '3Z4']" },
      ],
      constraints: ['1 ≤ s.length ≤ 12', 's has only English letters and digits'],
      hints: [
        'Walk the string one character at a time. How many choices does a digit have? A letter?',
        'A digit has 1 choice and a letter has 2. It is the take/skip tree, but only letters split.',
        "Keep `path` as an array of characters. At index `i`, loop over the options for `s[i]`: push, recurse, pop. At the end, save `path.join('')`.",
      ],
      approaches: [
        {
          name: 'Doubling trick on strings',
          idea: "Start with `['']`. For each character, extend every string you have: with the character itself if it's a digit, or with both its lower and upper case if it's a letter.",
          code: `function letterCasePermutation(s) {
  let result = [''];
  for (const ch of s) {
    const options = ch.toLowerCase() === ch.toUpperCase() ? [ch] : [ch.toLowerCase(), ch.toUpperCase()];
    const next = [];
    for (const str of result) for (const c of options) next.push(str + c);
    result = next;
  }
  return result;
}`,
          time: 'O(n · 2ᴸ), L = number of letters',
          space: 'O(n · 2ᴸ)',
        },
        {
          name: 'Backtracking, one position per level',
          idea: 'Level `i` decides the character at position `i`. A digit gives one branch, a letter gives two. Every leaf is one full password, so the tree has exactly 2ᴸ leaves.',
          pseudo: `function letterCasePermutation(s):
    result ← empty list
    path ← empty list
    function go(i):
        if i = n:
            append path joined into a string to result
            return
        for each c in options for s[i]:    // [lower, upper] or [digit]
            push c onto path
            go(i + 1)
            pop from path
    go(0)
    return result`,
          code: `function letterCasePermutation(s) {
  const result = [];
  const path = [];
  function go(i) {
    if (i === s.length) {
      result.push(path.join(''));
      return;
    }
    const ch = s[i];
    const isLetter = ch.toLowerCase() !== ch.toUpperCase();
    const options = isLetter ? [ch.toLowerCase(), ch.toUpperCase()] : [ch];
    for (const c of options) {
      path.push(c); // choose
      go(i + 1);    // explore
      path.pop();   // un-choose
    }
  }
  go(0);
  return result;
}`,
          time: 'O(n · 2ᴸ)',
          space: 'O(n) besides the output',
        },
      ],
      fn: 'letterCasePermutation',
      starter: `function letterCasePermutation(s) {
  // return every upper/lower-case version of s
  return [];
}`,
      solution: `function letterCasePermutation(s) {
  const result = [];
  const path = [];
  function go(i) {
    if (i === s.length) {
      result.push(path.join(''));
      return;
    }
    const ch = s[i];
    const isLetter = ch.toLowerCase() !== ch.toUpperCase();
    const options = isLetter ? [ch.toLowerCase(), ch.toUpperCase()] : [ch];
    for (const c of options) {
      path.push(c);
      go(i + 1);
      path.pop();
    }
  }
  go(0);
  return result;
}`,
      compare: 'unordered',
      tests: [
        { name: 'letters and digits', args: ['a1b2'], expected: ['a1b2','a1B2','A1b2','A1B2'] },
        { name: 'one letter in digits', args: ['3z4'], expected: ['3z4','3Z4'] },
        { name: 'only digits', args: ['12345'], expected: ['12345'] },
        { name: 'single capital', args: ['C'], expected: ['c','C'] },
        { name: 'two letters', args: ['Ab'], expected: ['ab','aB','Ab','AB'] },
        { name: 'three letters', args: ['aBc1'], expected: ['abc1','abC1','aBc1','aBC1','Abc1','AbC1','ABc1','ABC1'] },
        { name: 'letter between zeros', args: ['0a0'], expected: ['0a0','0A0'] },
      ],
      takeaway: 'The number of branches can change from level to level: 1 for a digit, 2 for a letter. The template does not care.',
    },
  ],
  quiz: [
    {
      prompt: 'You write `result.push(path)` instead of `result.push([...path])` in subsets of `[1, 2]`. What do you get?',
      options: ['`[[], [1], [2], [1,2]]`', '`[[], [], [], []]`', '`[[1,2], [1,2], [1,2], [1,2]]`', 'An error'],
      answer: 1,
      explanation: 'All four entries point to the same array. The search pops everything back off at the end, so all four show the empty array.',
    },
    {
      prompt: 'How many subsets does a list of 5 different items have?',
      options: ['10', '25', '32', '120'],
      answer: 2,
      explanation: 'Each item is in or out: 2 × 2 × 2 × 2 × 2 = 2⁵ = 32, counting the empty subset.',
    },
    {
      prompt: 'Why do we pop right after the recursive call returns?',
      options: [
        'To save memory',
        'So `path` is back to how it was, ready for the next choice',
        'To stop the recursion',
        'Because JavaScript arrays need it',
      ],
      answer: 1,
      explanation: 'The next branch (skip this item) must start from the same `path` the take branch started from. Popping undoes the choice.',
    },
    {
      prompt: 'A problem says n ≤ 15 and asks for all valid groups. What does that hint?',
      options: ['Use binary search', 'An exponential search like backtracking is fine', 'You need O(n) time', 'Use a heap'],
      answer: 1,
      explanation: '2¹⁵ is about 32,000. Small n plus "list all" is the classic backtracking signal.',
    },
  ],
  takeaways: [
    'Backtracking builds one answer in a shared `path`: **choose**, **explore**, **un-choose**.',
    'Save `[...path]`, never `path` itself.',
    'n items have 2ⁿ subsets. n ≤ 20 is the signal that exponential is OK.',
  ],
};

// ---------------------------------------------------------------------------
// Lesson 2: combinations, sums, duplicates
// ---------------------------------------------------------------------------

const combinationsLesson: Lesson = {
  id: 'combinations',
  title: 'Combinations and combination sum',
  summary: 'A start index builds each group only once, sorting lets you stop early, and one line skips duplicate inputs.',
  minutes: 25,
  blocks: [
    {
      kind: 'callout',
      tone: 'story',
      title: 'Paying with coins',
      text: "A vending machine takes coins worth 2, 3, 6 and 7, and you have as many of each as you like. A snack costs 7. Which **bags of coins** pay exactly 7? `2+2+3` and `7`. Notice that `2+3+2` is the same bag as `2+2+3`: a bag doesn't care about order. A group where order doesn't matter is a **combination**.",
    },
    {
      kind: 'text',
      text: "**The problem.** Given different positive numbers `candidates` and a `target`, return every combination that adds up to `target`. You may use a number as many times as you like. `candidates = [2, 3, 6, 7]`, `target = 7` gives `[[2,2,3], [7]]`.",
    },
    {
      kind: 'text',
      text: "**Brute force first.** Keep adding any coin until the total reaches or passes 7. When it hits 7 exactly, sort the coins and put them in a set so repeats collapse. It works. But for target 7 it builds `[2,2,3]`, `[2,3,2]` and `[3,2,2]`: three orders of the same bag, and two get thrown away at the end.",
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Brute force: every order, dedupe at the end',
      code: `function combinationSum(candidates, target):
    seen ← empty set
    path ← empty list
    function go(total):
        if total = target:
            add sorted copy of path to seen     // collapses repeats
            return
        if total > target: return
        for each c in candidates:
            push c onto path
            go(total + c)
            pop from path
    go(0)
    return seen as a list`,
    },
    {
      kind: 'text',
      text: "**Spot the waste.** Two kinds. (1) **Same bag, many orders:** a bag of k coins can be built in up to k! orders, and every one is explored. (2) **Hopeless branches:** when the total is already 6 and the smallest coin is 2, every coin overshoots, yet each one still gets tried.",
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'Only move forward: the start index',
      text: "Line the candidates up and allow picks only in left-to-right order. Each call gets a `start` index and may only choose `candidates[start]` or later. Now `[2,2,3]` can be built but `[3,2,2]` can't: after picking 3 you may never go back to 2. Every bag is built **exactly once**. Bonus: sort the candidates first. Then the moment `total + candidates[i] > target` you can `break`, because every later coin is even bigger.",
    },
    {
      kind: 'diagram',
      title: 'Start-index tree for [2, 3, 6, 7], target 7',
      art: `go(start 0, total 0)   path []
├─ 2 → [2] total 2
│  ├─ 2 → [2,2] total 4
│  │  ├─ 2 → [2,2,2] total 6
│  │  │  └─ 2 → 8 > 7   break (the rest are bigger)
│  │  ├─ 3 → [2,2,3] total 7   save
│  │  └─ 6 → 10 > 7  break
│  ├─ 3 → [2,3] total 5
│  │  └─ 3 → 8 > 7   break
│  └─ 6 → 8 > 7   break
├─ 3 → [3] total 3
│  ├─ 3 → [3,3] total 6
│  │  └─ 3 → 9 > 7   break
│  └─ 6 → 9 > 7   break
├─ 6 → [6] total 6
│  └─ 6 → 12 > 7  break
└─ 7 → [7] total 7   save`,
      caption: 'Under `[3]` the loop starts at 3, so 2 is never offered again. Each bag shows up once, and `break` cuts every branch that would overshoot.',
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Combination sum with a start index',
      code: `function combinationSum(candidates, target):
    sort candidates ascending
    result ← empty list
    path ← empty list
    function go(start, total):
        if total = target:
            append a copy of path to result
            return
        for i from start to n - 1:
            if total + candidates[i] > target:
                break                     // sorted: the rest are bigger
            push candidates[i] onto path  // choose
            go(i, total + candidates[i])  // i, not i + 1: reuse allowed
            pop from path                 // un-choose
    go(0, 0)
    return result`,
    },
    {
      kind: 'code',
      lang: 'js',
      code: `function combinationSum(candidates, target) {
  candidates.sort((a, b) => a - b);
  const result = [];
  const path = [];
  function go(start, total) {
    if (total === target) {
      result.push([...path]);
      return;
    }
    for (let i = start; i < candidates.length; i++) {
      if (total + candidates[i] > target) break; // prune
      path.push(candidates[i]);
      go(i, total + candidates[i]); // same i: reuse ok
      path.pop();
    }
  }
  go(0, 0);
  return result;
}`,
    },
    {
      kind: 'table',
      title: 'One skeleton, a few dials',
      head: ['Problem', 'Recurse with', 'Save when'],
      rows: [
        ['Subsets (lesson 1)', '`go(i + 1)`', 'at every node'],
        ['Combinations: k of 1..n', '`go(i + 1)`', '`path.length === k`'],
        ['Combination sum (reuse)', '`go(i, total + x)`', '`total === target`'],
        ['Combination sum II (use once, duplicates)', '`go(i + 1, total + x)` + skip twins', '`total === target`'],
      ],
    },
    {
      kind: 'text',
      text: "**Duplicates in the input.** Now each coin may be used once, and the jar has repeats: `[10, 1, 2, 7, 6, 1, 5]`, target 8. Sorted: `[1, 1, 2, 5, 6, 7, 10]`. The plain start-index code finds `[1, 7]` twice, once with each 1. The two 1s look identical, so that is the same answer twice.",
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'Skip twins on the same level',
      text: "After sorting, equal numbers sit next to each other. In one loop (one level of the tree), only the **first** of a run of equal numbers may start a branch: `if i > start and nums[i] = nums[i - 1]: skip`. A second 1 there would just grow the exact same subtree again. Going *deeper* with both 1s is still fine: `[1, 1, 6]` is a real answer, because the second 1 is picked one level down, where it is the first in its loop.",
    },
    {
      kind: 'diagram',
      title: 'The twin skip on [1, 1, 2, 5, 6, 7, 10], target 8',
      art: `top loop (start = 0)
  i=0  1  explore [1, ...]       keep
  i=1  1  same subtree as i=0    SKIP (i > start)
  i=2  2  explore [2, ...]       keep
  ...
inside [1, ...] (start = 1)
  i=1  1  explore [1, 1, ...]    keep (i = start)
  i=2  2  explore [1, 2, ...]    keep

answers: [1,1,6]  [1,2,5]  [1,7]  [2,6]`,
      caption: '`i > start` means "not the first choice in this loop". That lets `[1, 1, 6]` through and blocks the second `[1, 7]`.',
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Combination sum II: the loop is all that changes',
      code: `    for i from start to n - 1:
        if i > start and nums[i] = nums[i - 1]:
            continue                       // twin on this level
        if total + nums[i] > target: break
        push nums[i] onto path
        go(i + 1, total + nums[i])         // i + 1: use once
        pop from path`,
    },
    {
      kind: 'compare',
      title: 'Combination sum',
      rows: [
        { approach: 'Every order + a set', time: 'exponential, each bag up to k! times', space: 'O(answers)', note: 'Explores every ordering and throws most of them away.' },
        { approach: 'Start index', time: 'exponential, each bag once', space: 'O(target / smallest)', note: 'Recursion depth is at most target ÷ smallest coin.' },
        { approach: 'Start index + sort + break', time: 'same worst case, far fewer calls', space: 'O(target / smallest)', note: 'Every overshooting branch is cut on the spot.' },
      ],
    },
    {
      kind: 'text',
      text: "**The pattern.** Reach for a start index when the problem says *combination*, *group*, *subset*, *team*, or *order doesn't matter*. Recurse with `i` if items can be reused and `i + 1` if not. Sort first when you want to prune with `break` or skip duplicates.",
    },
    {
      kind: 'callout',
      tone: 'trap',
      title: 'Three classic slips',
      text: "(1) Writing `i > 0` instead of `i > start` in the twin check: it also blocks `[1, 1, 6]`. (2) Recursing with `start + 1` instead of `i + 1`: after picking index 3 you could pick index 1 next, and repeated bags are back. (3) Using `break` without sorting first: a big number early in the list would stop the loop before a smaller one that still fits.",
    },
  ],
  problems: [
    {
      id: 'backtracking-combination-sum',
      title: 'Combination Sum',
      difficulty: 'medium',
      leetcode: 39,
      pattern: 'Backtracking (start index)',
      statement: "A vending machine accepts coins with the values in `candidates` (all different, all positive), and you have an unlimited supply of each. List every different bag of coins that adds up to exactly `target`. Two bags are the same if they hold the same coins, in any order. Return the bags in any order.",
      examples: [
        { input: 'candidates = [2, 3, 6, 7], target = 7', output: '[[2,2,3], [7]]' },
        { input: 'candidates = [2, 3, 5], target = 8', output: '[[2,2,2,2], [2,3,3], [3,5]]' },
        { input: 'candidates = [2], target = 1', output: '[]' },
      ],
      constraints: ['1 ≤ candidates.length ≤ 30', '2 ≤ candidates[i] ≤ 40, all different', '1 ≤ target ≤ 40'],
      hints: [
        'Try the brute force on paper: you build both `[2,2,3]` and `[3,2,2]`. How can you make sure a bag is built only once?',
        'Allow picks only from left to right: pass a `start` index and loop from there.',
        'Recurse with `i` (not `i + 1`) because a coin can be reused. Sort first and `break` as soon as `total + candidates[i] > target`.',
      ],
      approaches: [
        {
          name: 'Every order + a set',
          idea: 'Try every coin at every step until the total reaches the target, then sort the bag and store it in a set so different orders collapse into one. Correct, but it explores each bag in every possible order.',
          code: `function combinationSum(candidates, target) {
  const seen = new Set();
  const path = [];
  function go(total) {
    if (total === target) {
      seen.add(JSON.stringify([...path].sort((a, b) => a - b)));
      return;
    }
    if (total > target) return;
    for (const c of candidates) {
      path.push(c);
      go(total + c);
      path.pop();
    }
  }
  go(0);
  return [...seen].map((s) => JSON.parse(s));
}`,
          time: 'exponential, with k! repeats per bag',
          space: 'O(answers)',
        },
        {
          name: 'Start index + sort + break',
          idea: 'Only pick candidates at index `start` or later, so each bag is built in sorted order exactly once. Recurse with the same `i` to allow reuse. Because the list is sorted, the first coin that overshoots means all later ones do too: `break`.',
          pseudo: `function combinationSum(candidates, target):
    sort candidates ascending
    result ← empty list
    path ← empty list
    function go(start, total):
        if total = target:
            append a copy of path to result
            return
        for i from start to n - 1:
            if total + candidates[i] > target: break
            push candidates[i] onto path
            go(i, total + candidates[i])
            pop from path
    go(0, 0)
    return result`,
          code: `function combinationSum(candidates, target) {
  candidates.sort((a, b) => a - b);
  const result = [];
  const path = [];
  function go(start, total) {
    if (total === target) {
      result.push([...path]);
      return;
    }
    for (let i = start; i < candidates.length; i++) {
      if (total + candidates[i] > target) break;
      path.push(candidates[i]);
      go(i, total + candidates[i]);
      path.pop();
    }
  }
  go(0, 0);
  return result;
}`,
          time: 'exponential in target ÷ smallest coin',
          space: 'O(target ÷ smallest coin) recursion depth',
        },
      ],
      fn: 'combinationSum',
      starter: `function combinationSum(candidates, target) {
  // return every bag of coins that sums to target
  return [];
}`,
      solution: `function combinationSum(candidates, target) {
  candidates.sort((a, b) => a - b);
  const result = [];
  const path = [];
  function go(start, total) {
    if (total === target) {
      result.push([...path]);
      return;
    }
    for (let i = start; i < candidates.length; i++) {
      if (total + candidates[i] > target) break;
      path.push(candidates[i]);
      go(i, total + candidates[i]);
      path.pop();
    }
  }
  go(0, 0);
  return result;
}`,
      compare: 'nested',
      tests: [
        { name: 'vending machine', args: [[2, 3, 6, 7], 7], expected: [[2,2,3],[7]] },
        { name: 'several bags', args: [[2, 3, 5], 8], expected: [[2,2,2,2],[2,3,3],[3,5]] },
        { name: 'impossible', args: [[2], 1], expected: [] },
        { name: 'single coin repeated', args: [[1], 3], expected: [[1,1,1]] },
        { name: 'unsorted input', args: [[7, 3, 2], 18], expected: [[2,2,2,2,2,2,2,2,2],[2,2,2,2,2,2,3,3],[2,2,2,2,3,7],[2,2,2,3,3,3,3],[2,2,7,7],[2,3,3,3,7],[3,3,3,3,3,3]] },
        { name: 'coins bigger than target', args: [[50, 40], 30], expected: [] },
        { name: 'mixed sizes', args: [[8, 7, 4, 3], 11], expected: [[3,4,4],[3,8],[4,7]] },
      ],
      takeaway: 'A start index builds each group once. Recursing with the same `i` allows reuse.',
    },
    {
      id: 'backtracking-combinations',
      title: 'Combinations',
      difficulty: 'medium',
      leetcode: 77,
      pattern: 'Backtracking (start index)',
      statement: "A coach has players numbered `1` to `n` and must pick a squad of exactly `k`. List every possible squad. A squad is a group, so `[1,2]` and `[2,1]` are the same squad. Any order is fine.",
      examples: [
        { input: 'n = 4, k = 2', output: '[[1,2], [1,3], [1,4], [2,3], [2,4], [3,4]]' },
        { input: 'n = 1, k = 1', output: '[[1]]' },
      ],
      constraints: ['1 ≤ n ≤ 20', '1 ≤ k ≤ n'],
      hints: [
        'It is the loop version of subsets, but you only save when the squad is full.',
        'Base case: `path.length === k`. Loop `i` from `start` to `n` and recurse with `i + 1`.',
        'Prune: if the numbers left (`n - i + 1`) are fewer than the open spots (`k - path.length`), the loop can stop.',
      ],
      approaches: [
        {
          name: 'All subsets, keep size k',
          idea: 'Generate all 2ⁿ subsets of `1..n` and keep the ones with exactly k items. Correct, but most subsets have the wrong size.',
          code: `function combine(n, k) {
  const result = [];
  const path = [];
  function go(i) {
    if (i > n) {
      if (path.length === k) result.push([...path]);
      return;
    }
    path.push(i);
    go(i + 1);
    path.pop();
    go(i + 1);
  }
  go(1);
  return result;
}`,
          time: 'O(n · 2ⁿ)',
          space: 'O(n)',
        },
        {
          name: 'Start index + room check',
          idea: 'Choose the next player from `start` upward, recurse with `i + 1`, and save when `path` has k players. Stop the loop early once there are not enough players left to fill the squad, so no branch is a dead end.',
          pseudo: `function combine(n, k):
    result ← empty list
    path ← empty list
    function go(start):
        if length of path = k:
            append a copy of path to result
            return
        need ← k - length of path
        for i from start to n - need + 1:   // leave room for the rest
            push i onto path
            go(i + 1)
            pop from path
    go(1)
    return result`,
          code: `function combine(n, k) {
  const result = [];
  const path = [];
  function go(start) {
    if (path.length === k) {
      result.push([...path]);
      return;
    }
    const need = k - path.length;
    for (let i = start; i <= n - need + 1; i++) {
      path.push(i);
      go(i + 1);
      path.pop();
    }
  }
  go(1);
  return result;
}`,
          time: 'O(k · C(n, k))',
          space: 'O(k) besides the output',
        },
      ],
      fn: 'combine',
      starter: `function combine(n, k) {
  // return every group of k numbers from 1..n
  return [];
}`,
      solution: `function combine(n, k) {
  const result = [];
  const path = [];
  function go(start) {
    if (path.length === k) {
      result.push([...path]);
      return;
    }
    const need = k - path.length;
    for (let i = start; i <= n - need + 1; i++) {
      path.push(i);
      go(i + 1);
      path.pop();
    }
  }
  go(1);
  return result;
}`,
      compare: 'nested',
      tests: [
        { name: 'pairs from 4', args: [4, 2], expected: [[1,2],[1,3],[1,4],[2,3],[2,4],[3,4]] },
        { name: 'one player', args: [1, 1], expected: [[1]] },
        { name: 'take everyone', args: [3, 3], expected: [[1,2,3]] },
        { name: 'singles', args: [5, 1], expected: [[1],[2],[3],[4],[5]] },
        { name: 'three of five', args: [5, 3], expected: [[1,2,3],[1,2,4],[1,2,5],[1,3,4],[1,3,5],[1,4,5],[2,3,4],[2,3,5],[2,4,5],[3,4,5]] },
        { name: 'four of six', args: [6, 4], expected: [[1,2,3,4],[1,2,3,5],[1,2,3,6],[1,2,4,5],[1,2,4,6],[1,2,5,6],[1,3,4,5],[1,3,4,6],[1,3,5,6],[1,4,5,6],[2,3,4,5],[2,3,4,6],[2,3,5,6],[2,4,5,6],[3,4,5,6]] },
        { name: 'twenty of twenty', args: [20, 20], expected: [[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]] },
      ],
      takeaway: 'Save when `path` is full, and stop when there are not enough numbers left to fill it.',
    },
    {
      id: 'backtracking-combination-sum-ii',
      title: 'Combination Sum II',
      difficulty: 'medium',
      leetcode: 40,
      pattern: 'Backtracking (start index, skip duplicates)',
      statement: "You have a jar of coins `candidates` (values can repeat) and need to pay exactly `target`. Each coin in the jar can be used **at most once**. List every different bag of coins that works. Bags with the same values count once, even if they used different physical coins. Any order.",
      examples: [
        { input: 'candidates = [10, 1, 2, 7, 6, 1, 5], target = 8', output: '[[1,1,6], [1,2,5], [1,7], [2,6]]' },
        { input: 'candidates = [2, 5, 2, 1, 2], target = 5', output: '[[1,2,2], [5]]' },
      ],
      constraints: ['1 ≤ candidates.length ≤ 100', '1 ≤ candidates[i] ≤ 50', '1 ≤ target ≤ 30'],
      hints: [
        'Start from Combination Sum. Each coin is used once now: what changes in the recursive call?',
        'Recurse with `i + 1`. Now try `[1, 1, 2]` with target 3 by hand: `[1, 2]` appears twice. Why?',
        'Sort. In each loop, skip `candidates[i]` when `i > start` and it equals `candidates[i - 1]`. Keep the `break` when the sum overshoots.',
      ],
      approaches: [
        {
          name: 'Start index + a set of answers',
          idea: 'Sort, run the use-once search, and store each answer as a string in a set so repeats collapse. Correct, but with many equal coins it explores the same subtree again and again.',
          code: `function combinationSum2(candidates, target) {
  candidates.sort((a, b) => a - b);
  const seen = new Set();
  const path = [];
  function go(start, total) {
    if (total === target) {
      seen.add(JSON.stringify(path));
      return;
    }
    for (let i = start; i < candidates.length; i++) {
      if (total + candidates[i] > target) break;
      path.push(candidates[i]);
      go(i + 1, total + candidates[i]);
      path.pop();
    }
  }
  go(0, 0);
  return [...seen].map((s) => JSON.parse(s));
}`,
          time: 'O(n · 2ⁿ), repeats included',
          space: 'O(answers)',
        },
        {
          name: 'Sort + skip twins + break',
          idea: 'After sorting, equal coins are neighbours. In each loop only the first of a run of equal coins may start a branch (`i > start` check), so the same bag is never grown twice. Deeper levels may still use the next equal coin.',
          pseudo: `function combinationSum2(candidates, target):
    sort candidates ascending
    result ← empty list
    path ← empty list
    function go(start, total):
        if total = target:
            append a copy of path to result
            return
        for i from start to n - 1:
            if i > start and candidates[i] = candidates[i - 1]:
                continue                  // twin on this level
            if total + candidates[i] > target: break
            push candidates[i] onto path
            go(i + 1, total + candidates[i])
            pop from path
    go(0, 0)
    return result`,
          code: `function combinationSum2(candidates, target) {
  candidates.sort((a, b) => a - b);
  const result = [];
  const path = [];
  function go(start, total) {
    if (total === target) {
      result.push([...path]);
      return;
    }
    for (let i = start; i < candidates.length; i++) {
      if (i > start && candidates[i] === candidates[i - 1]) continue;
      if (total + candidates[i] > target) break;
      path.push(candidates[i]);
      go(i + 1, total + candidates[i]);
      path.pop();
    }
  }
  go(0, 0);
  return result;
}`,
          time: 'O(n · 2ⁿ) worst case',
          space: 'O(n) besides the output',
        },
      ],
      fn: 'combinationSum2',
      starter: `function combinationSum2(candidates, target) {
  // each coin at most once, no repeated bags
  return [];
}`,
      solution: `function combinationSum2(candidates, target) {
  candidates.sort((a, b) => a - b);
  const result = [];
  const path = [];
  function go(start, total) {
    if (total === target) {
      result.push([...path]);
      return;
    }
    for (let i = start; i < candidates.length; i++) {
      if (i > start && candidates[i] === candidates[i - 1]) continue;
      if (total + candidates[i] > target) break;
      path.push(candidates[i]);
      go(i + 1, total + candidates[i]);
      path.pop();
    }
  }
  go(0, 0);
  return result;
}`,
      compare: 'nested',
      tests: [
        { name: 'two ones', args: [[10, 1, 2, 7, 6, 1, 5], 8], expected: [[1,1,6],[1,2,5],[1,7],[2,6]] },
        { name: 'three twos', args: [[2, 5, 2, 1, 2], 5], expected: [[1,2,2],[5]] },
        { name: 'single coin fits', args: [[1], 1], expected: [[1]] },
        { name: 'single coin too big', args: [[2], 1], expected: [] },
        { name: 'all the same', args: [[1, 1, 1, 1, 1, 1, 1, 1, 1, 1], 3], expected: [[1,1,1]] },
        { name: 'repeats on both sides', args: [[3, 1, 3, 5, 1, 1], 8], expected: [[1,1,1,5],[1,1,3,3],[3,5]] },
        { name: 'many twins', args: [[4, 4, 2, 1, 4, 2, 2, 1, 3], 6], expected: [[1,1,2,2],[1,1,4],[1,2,3],[2,2,2],[2,4]] },
      ],
      takeaway: 'Sort, then `if (i > start && a[i] === a[i - 1]) continue` gives unique answers without a set.',
    },
    {
      id: 'backtracking-subsets-ii',
      title: 'Subsets II',
      difficulty: 'medium',
      leetcode: 90,
      pattern: 'Backtracking (start index, skip duplicates)',
      statement: "A fruit basket holds fruits labelled by number in `nums`, and some labels repeat (two apples are both `2`). List every different handful you could take: every subset, including none and all. Handfuls with the same labels are the same: from `[1, 2, 2]`, taking either apple gives the same `[1, 2]`. Any order.",
      examples: [
        { input: 'nums = [1, 2, 2]', output: '[[], [1], [1,2], [1,2,2], [2], [2,2]]' },
        { input: 'nums = [0]', output: '[[], [0]]' },
      ],
      constraints: ['1 ≤ nums.length ≤ 10', '-10 ≤ nums[i] ≤ 10'],
      hints: [
        'Use the loop version of subsets from lesson 1: save at every node, then loop `i` from `start`.',
        'Sort first so equal numbers are neighbours.',
        'In the loop, skip `nums[i]` when `i > start` and `nums[i] === nums[i - 1]`.',
      ],
      approaches: [
        {
          name: 'All subsets + a set',
          idea: 'Sort, generate all 2ⁿ subsets, and keep each one only the first time its string key shows up. Sorting first makes `[2,1]` and `[1,2]` impossible, so equal subsets get equal keys.',
          code: `function subsetsWithDup(nums) {
  nums.sort((a, b) => a - b);
  const seen = new Set();
  const result = [];
  const path = [];
  function go(i) {
    if (i === nums.length) {
      const key = JSON.stringify(path);
      if (!seen.has(key)) {
        seen.add(key);
        result.push([...path]);
      }
      return;
    }
    path.push(nums[i]);
    go(i + 1);
    path.pop();
    go(i + 1);
  }
  go(0);
  return result;
}`,
          time: 'O(n · 2ⁿ)',
          space: 'O(n · 2ⁿ) for the set',
        },
        {
          name: 'Sort + skip twins',
          idea: 'Every node of the loop-version tree is a subset. Skipping a twin at the same level means a subset like `[1, 2]` can only be grown from the first 2, so it appears once.',
          pseudo: `function subsetsWithDup(nums):
    sort nums ascending
    result ← empty list
    path ← empty list
    function go(start):
        append a copy of path to result     // every node is a subset
        for i from start to n - 1:
            if i > start and nums[i] = nums[i - 1]:
                continue                     // twin on this level
            push nums[i] onto path
            go(i + 1)
            pop from path
    go(0)
    return result`,
          code: `function subsetsWithDup(nums) {
  nums.sort((a, b) => a - b);
  const result = [];
  const path = [];
  function go(start) {
    result.push([...path]);
    for (let i = start; i < nums.length; i++) {
      if (i > start && nums[i] === nums[i - 1]) continue;
      path.push(nums[i]);
      go(i + 1);
      path.pop();
    }
  }
  go(0);
  return result;
}`,
          time: 'O(n · 2ⁿ) worst case',
          space: 'O(n) besides the output',
        },
      ],
      fn: 'subsetsWithDup',
      starter: `function subsetsWithDup(nums) {
  // every different subset, no repeats
  return [];
}`,
      solution: `function subsetsWithDup(nums) {
  nums.sort((a, b) => a - b);
  const result = [];
  const path = [];
  function go(start) {
    result.push([...path]);
    for (let i = start; i < nums.length; i++) {
      if (i > start && nums[i] === nums[i - 1]) continue;
      path.push(nums[i]);
      go(i + 1);
      path.pop();
    }
  }
  go(0);
  return result;
}`,
      compare: 'nested',
      tests: [
        { name: 'one pair', args: [[1, 2, 2]], expected: [[],[1],[1,2],[1,2,2],[2],[2,2]] },
        { name: 'one number', args: [[0]], expected: [[],[0]] },
        { name: 'all the same', args: [[2, 2, 2]], expected: [[],[2],[2,2],[2,2,2]] },
        { name: 'no duplicates', args: [[1, 2, 3]], expected: [[],[1],[1,2],[1,2,3],[1,3],[2],[2,3],[3]] },
        { name: 'unsorted twins', args: [[4, 4, 4, 1, 4]], expected: [[],[1],[1,4],[1,4,4],[1,4,4,4],[1,4,4,4,4],[4],[4,4],[4,4,4],[4,4,4,4]] },
        { name: 'negatives', args: [[-1, 1, -1]], expected: [[],[-1],[-1,-1],[-1,-1,1],[-1,1],[1]] },
        { name: 'two pairs', args: [[5, 5, 1, 1]], expected: [[],[1],[1,1],[1,1,5],[1,1,5,5],[1,5],[1,5,5],[5],[5,5]] },
      ],
      takeaway: 'The twin skip works for any start-index search: subsets, combinations and sums.',
    },
  ],
  quiz: [
    {
      prompt: 'In Combination Sum (reuse allowed), after choosing `candidates[i]` you call:',
      options: ['`go(i + 1, ...)`', '`go(i, ...)`', '`go(start + 1, ...)`', '`go(0, ...)`'],
      answer: 1,
      explanation: 'The same `i` lets you pick that coin again, but never anything to its left, so bags stay in sorted order.',
    },
    {
      prompt: 'Sorted input `[1, 1, 2]`. In the loop with `start = 0`, which index does `i > start && nums[i] === nums[i - 1]` skip?',
      options: ['index 0', 'index 1', 'index 2', 'none'],
      answer: 1,
      explanation: "Index 1 holds a 1 just like index 0, and it is not the first choice in this loop, so its subtree would repeat index 0's.",
    },
    {
      prompt: 'Why can a start-index search never build `[3, 2, 2]` from `[2, 3, 6, 7]`?',
      options: [
        'It sorts every path at the end',
        'After picking 3 (index 1), later picks start at index 1, so 2 is out of reach',
        'It checks a set of answers it has seen',
        'It limits paths to two coins',
      ],
      answer: 1,
      explanation: 'Picks only move left to right, so every bag is built in sorted order, exactly once.',
    },
    {
      prompt: 'When is `break` (instead of `continue`) safe in the "too big" check?',
      options: ['Always', 'Only after sorting ascending', 'Only when there are no duplicates', 'Only for groups of size k'],
      answer: 1,
      explanation: 'Only in a sorted list do you know that every later number is at least as big, so all of them overshoot too.',
    },
  ],
  takeaways: [
    'A **start index** builds each group once, in sorted order. No set needed.',
    'Reuse allowed → recurse with `i`. Use once → recurse with `i + 1`.',
    'Duplicates: sort, then `if (i > start && nums[i] === nums[i - 1]) continue`.',
    'Sort + `break` cuts every branch that is already too big.',
  ],
};

export const lessonsPart1: Lesson[] = [subsetsLesson, combinationsLesson];
