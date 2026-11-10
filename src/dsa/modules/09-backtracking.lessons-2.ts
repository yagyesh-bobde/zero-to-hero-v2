import type { Lesson } from '../types';

// ---------------------------------------------------------------------------
// Lesson 3: permutations
// ---------------------------------------------------------------------------

const permutationsLesson: Lesson = {
  id: 'permutations',
  title: 'Permutations: when order matters',
  summary: 'Try every unused item at every position with a used[] array, and handle repeated values without repeated answers.',
  minutes: 20,
  blocks: [
    {
      kind: 'callout',
      tone: 'story',
      title: 'Road-trip seating',
      text: "Three friends, Asha, Ben and Cy, get into a car with three seats. Who sits where? Asha-Ben-Cy is different from Cy-Ben-Asha, because now Cy is driving. There are 3 × 2 × 1 = **6** seatings. An ordering like this is a **permutation**: the same items, where order matters.",
    },
    {
      kind: 'text',
      text: "**The problem.** Given different numbers `nums`, return every ordering. `[1, 2, 3]` gives 6: `[1,2,3]`, `[1,3,2]`, `[2,1,3]`, `[2,3,1]`, `[3,1,2]`, `[3,2,1]`.",
    },
    {
      kind: 'text',
      text: "**What changes from combinations?** The start index made `[3, 2]` impossible to build. Now we *want* both `[3, 2]` and `[2, 3]`, because they are different answers. So at every position you may pick **any** number, as long as it isn't already in the path.",
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Brute force: fill every seat with anything, then filter',
      code: `function permute(nums):
    result ← empty list
    path ← empty list
    function go():
        if length of path = n:
            if path has no repeated item:
                append a copy of path to result
            return
        for each x in nums:
            push x onto path
            go()
            pop from path
    go()
    return result`,
    },
    {
      kind: 'text',
      text: "**Spot the waste.** This builds nⁿ sequences and keeps only n! of them. For n = 8 that is 16,777,216 built to keep 40,320. Almost all the work goes into sequences like `[1, 1, ...]` that were already broken at the second pick, yet we kept filling them to the end.",
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'Check before you pick: a used[] array',
      text: "Keep a true/false array `used`, one flag per index. Before picking `nums[i]`, look at `used[i]`; if it's taken, skip it. **Choose** = push and set `used[i] = true`. **Un-choose** = pop **and** set it back to `false`. Now every branch you grow is still a valid ordering, so nothing is wasted.",
    },
    {
      kind: 'diagram',
      title: 'The permutation tree for [1, 2, 3]',
      art: `path []
├─ 1 → [1]
│  ├─ 2 → [1,2] → 3 → [1,2,3]   save
│  └─ 3 → [1,3] → 2 → [1,3,2]   save
├─ 2 → [2]
│  ├─ 1 → [2,1] → 3 → [2,1,3]   save
│  └─ 3 → [2,3] → 1 → [2,3,1]   save
└─ 3 → [3]
   ├─ 1 → [3,1] → 2 → [3,1,2]   save
   └─ 2 → [3,2] → 1 → [3,2,1]   save`,
      caption: '3 choices, then 2, then 1: 3 × 2 × 1 = 6 leaves. That shrinking count is n! ("n factorial").',
    },
    {
      kind: 'steps',
      title: 'used[] in action on [1, 2, 3]',
      frames: [
        { cells: [1, 2, 3], pointers: { i: 0 }, active: [0], vars: { path: '[]', used: 'F F F' }, note: 'Position 1. Nothing is used yet, so index 0 is free: pick 1.' },
        { cells: [1, 2, 3], pointers: { i: 1 }, active: [1], done: [0], vars: { path: '[1]', used: 'T F F' }, note: 'Position 2. Index 0 is used (faded), skip it. Index 1 is free: pick 2.' },
        { cells: [1, 2, 3], pointers: { i: 2 }, active: [2], done: [0, 1], vars: { path: '[1,2]', used: 'T T F' }, note: 'Position 3. Only index 2 is free: pick 3.' },
        { cells: [1, 2, 3], found: [0, 1, 2], vars: { path: '[1,2,3]', used: 'T T T' }, note: 'The path is full. Save a copy: `[1,2,3]`.' },
        { cells: [1, 2, 3], pointers: { i: 2 }, active: [2], done: [0], vars: { path: '[1]', used: 'T F F' }, note: 'Back up: pop 3, then pop 2 and set `used[1] = false`. Position 2 now tries index 2: pick 3.' },
        { cells: [1, 2, 3], found: [0, 1, 2], vars: { path: '[1,3,2]', used: 'T T T' }, note: 'Position 3: only index 1 is free, so pick 2. Save `[1,3,2]`.' },
        { cells: [1, 2, 3], pointers: { i: 1 }, active: [1], vars: { path: '[]', used: 'F F F' }, note: 'Everything that starts with 1 is done. Pop 1, set `used[0] = false`, and position 1 tries index 1. The same story repeats.' },
      ],
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Permutations with used[]',
      code: `function permute(nums):
    result ← empty list
    path ← empty list
    used ← array of n false values
    function go():
        if length of path = n:
            append a copy of path to result
            return
        for i from 0 to n - 1:          // every index, no start
            if used[i]: continue
            used[i] ← true               // choose
            push nums[i] onto path
            go()                         // explore
            pop from path                // un-choose
            used[i] ← false
    go()
    return result`,
    },
    {
      kind: 'code',
      lang: 'js',
      code: `function permute(nums) {
  const result = [];
  const path = [];
  const used = new Array(nums.length).fill(false);
  function go() {
    if (path.length === nums.length) {
      result.push([...path]);
      return;
    }
    for (let i = 0; i < nums.length; i++) {
      if (used[i]) continue;
      used[i] = true;        // choose
      path.push(nums[i]);
      go();                  // explore
      path.pop();            // un-choose
      used[i] = false;
    }
  }
  go();
  return result;
}`,
    },
    {
      kind: 'text',
      text: "**Repeated values: orderings of `[1, 1, 2]`.** Call the two 1s *twins*. The used[] code finds 6 orderings, but `[1a, 1b, 2]` and `[1b, 1a, 2]` print the same. Only 3 are really different: `[1,1,2]`, `[1,2,1]`, `[2,1,1]`.",
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'Twins wait their turn',
      text: "Sort so twins sit side by side. Then add one rule: **a twin may only be picked if the twin on its left is already in the path.** In code: skip `i` when `i > 0`, `nums[i] = nums[i - 1]` and `not used[i - 1]`. This forces equal values to always be placed in left-to-right order, so each different ordering is built exactly once.",
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Permutations II: one extra check in the loop',
      code: `    sort nums ascending                     // once, before go()
    ...
        for i from 0 to n - 1:
            if used[i]: continue
            if i > 0 and nums[i] = nums[i - 1] and not used[i - 1]:
                continue                     // left twin not placed yet
            used[i] ← true
            push nums[i] onto path
            go()
            pop from path
            used[i] ← false`,
    },
    {
      kind: 'compare',
      title: 'All orderings of n items',
      rows: [
        { approach: 'Fill with anything, filter', time: 'O(n · nⁿ)', space: 'O(n)', note: 'Builds nⁿ sequences, keeps n!.' },
        { approach: 'used[] array', time: 'O(n · n!)', space: 'O(n)', note: 'Every branch is a valid partial ordering.' },
        { approach: 'used[] + twin rule', time: 'O(n · n!) worst case', space: 'O(n)', note: 'Handles repeated values with no set and no repeats.' },
      ],
    },
    {
      kind: 'table',
      title: 'How fast n! grows',
      head: ['n', 'n!', 'Verdict'],
      rows: [
        ['5', '120', 'instant'],
        ['8', '40,320', 'instant'],
        ['10', '3,628,800', 'OK, near the limit'],
        ['12', '479,001,600', 'too slow'],
      ],
    },
    {
      kind: 'text',
      text: "**The pattern.** Use the used[] loop when the problem says *orderings*, *arrangements*, *line-ups*, or anything where order matters. Loop from 0 every time (no start index) and skip used items. Add the twin rule when values repeat. Constraint signal: n ≤ 10. And if a partial ordering can already break a rule, check it when you place each item, not at the end (Beautiful Arrangement below).",
    },
    {
      kind: 'callout',
      tone: 'trap',
      title: 'Un-choose means undo everything',
      text: "Forget `used[i] = false` after popping and, after the first full path, every index looks taken: you get `[[1,2,3]]` and nothing else. Also, don't copy the combinations rule `i > start` here: permutations have no start. The twin check for permutations looks at `used[i - 1]` instead.",
    },
  ],
  problems: [
    {
      id: 'backtracking-permutations',
      title: 'Permutations',
      difficulty: 'medium',
      leetcode: 46,
      pattern: 'Backtracking (used array)',
      statement: "A DJ has a set of different song ids `nums` and wants to see every possible running order before choosing one. Return every ordering of `nums`, in any order.",
      examples: [
        { input: 'nums = [1, 2, 3]', output: '[[1,2,3], [1,3,2], [2,1,3], [2,3,1], [3,1,2], [3,2,1]]' },
        { input: 'nums = [0, 1]', output: '[[0,1], [1,0]]' },
        { input: 'nums = [1]', output: '[[1]]' },
      ],
      constraints: ['1 ≤ nums.length ≤ 6', '-10 ≤ nums[i] ≤ 10, all different'],
      hints: [
        'Position 1 can take any number. Position 2 can take any number except the one already placed. What do you need to remember?',
        'Keep a `used` array of booleans. Loop `i` from 0 every time and skip used indexes.',
        'Choose: `used[i] = true; path.push(nums[i])`. Explore. Un-choose: `path.pop(); used[i] = false`. Save a copy when `path.length === nums.length`.',
      ],
      approaches: [
        {
          name: 'Fill every slot, then filter',
          idea: 'Put any number in every slot (nⁿ sequences) and keep the ones with no repeated index. Correct, but almost every sequence is thrown away.',
          code: `function permute(nums) {
  const n = nums.length;
  const result = [];
  const path = [];
  function go() {
    if (path.length === n) {
      if (new Set(path).size === n) result.push(path.map((i) => nums[i]));
      return;
    }
    for (let i = 0; i < n; i++) {
      path.push(i);
      go();
      path.pop();
    }
  }
  go();
  return result;
}`,
          time: 'O(n · nⁿ)',
          space: 'O(n)',
        },
        {
          name: 'Backtracking with used[]',
          idea: 'At each position, try every index that is not used yet. Marking and unmarking `used` keeps every partial path a valid ordering, so the tree has exactly n! leaves.',
          pseudo: `function permute(nums):
    result ← empty list
    path ← empty list
    used ← array of n false values
    function go():
        if length of path = n:
            append a copy of path to result
            return
        for i from 0 to n - 1:
            if used[i]: continue
            used[i] ← true
            push nums[i] onto path
            go()
            pop from path
            used[i] ← false
    go()
    return result`,
          code: `function permute(nums) {
  const result = [];
  const path = [];
  const used = new Array(nums.length).fill(false);
  function go() {
    if (path.length === nums.length) {
      result.push([...path]);
      return;
    }
    for (let i = 0; i < nums.length; i++) {
      if (used[i]) continue;
      used[i] = true;
      path.push(nums[i]);
      go();
      path.pop();
      used[i] = false;
    }
  }
  go();
  return result;
}`,
          time: 'O(n · n!)',
          space: 'O(n) besides the output',
        },
      ],
      fn: 'permute',
      starter: `function permute(nums) {
  // return every ordering of nums
  return [];
}`,
      solution: `function permute(nums) {
  const result = [];
  const path = [];
  const used = new Array(nums.length).fill(false);
  function go() {
    if (path.length === nums.length) {
      result.push([...path]);
      return;
    }
    for (let i = 0; i < nums.length; i++) {
      if (used[i]) continue;
      used[i] = true;
      path.push(nums[i]);
      go();
      path.pop();
      used[i] = false;
    }
  }
  go();
  return result;
}`,
      compare: 'unordered',
      tests: [
        { name: 'three numbers', args: [[1, 2, 3]], expected: [[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]] },
        { name: 'two numbers', args: [[0, 1]], expected: [[0,1],[1,0]] },
        { name: 'one number', args: [[1]], expected: [[1]] },
        { name: 'negatives', args: [[-1, 2]], expected: [[-1,2],[2,-1]] },
        { name: 'four numbers', args: [[5, -1, 3, 0]], expected: [[5,-1,3,0],[5,-1,0,3],[5,3,-1,0],[5,3,0,-1],[5,0,-1,3],[5,0,3,-1],[-1,5,3,0],[-1,5,0,3],[-1,3,5,0],[-1,3,0,5],[-1,0,5,3],[-1,0,3,5],[3,5,-1,0],[3,5,0,-1],[3,-1,5,0],[3,-1,0,5],[3,0,5,-1],[3,0,-1,5],[0,5,-1,3],[0,5,3,-1],[0,-1,5,3],[0,-1,3,5],[0,3,5,-1],[0,3,-1,5]] },
      ],
      takeaway: 'No start index here: order matters, so every unused item is a choice at every position.',
    },
    {
      id: 'backtracking-permutations-ii',
      title: 'Permutations II',
      difficulty: 'medium',
      leetcode: 47,
      pattern: 'Backtracking (used array, skip duplicates)',
      statement: "Same DJ, but now some song ids repeat in `nums` (the hit is in the crate twice). Return every **different** running order. Orders that look the same count once. Any order.",
      examples: [
        { input: 'nums = [1, 1, 2]', output: '[[1,1,2], [1,2,1], [2,1,1]]' },
        { input: 'nums = [1, 2, 3]', output: '[[1,2,3], [1,3,2], [2,1,3], [2,3,1], [3,1,2], [3,2,1]]' },
      ],
      constraints: ['1 ≤ nums.length ≤ 8', '-10 ≤ nums[i] ≤ 10'],
      hints: [
        'Run the plain used[] solution on `[1, 1, 2]` by hand. Which answers show up twice, and why?',
        'Sort first, so equal values sit next to each other.',
        'Skip `nums[i]` when `i > 0`, `nums[i] === nums[i - 1]` and `!used[i - 1]`: the left twin must be placed first.',
      ],
      approaches: [
        {
          name: 'Plain permutations + a set',
          idea: 'Generate all n! orderings with used[], and keep each one only the first time its string key appears. Correct, but with many twins most of the work is repeated.',
          code: `function permuteUnique(nums) {
  const seen = new Set();
  const result = [];
  const path = [];
  const used = new Array(nums.length).fill(false);
  function go() {
    if (path.length === nums.length) {
      const key = JSON.stringify(path);
      if (!seen.has(key)) {
        seen.add(key);
        result.push([...path]);
      }
      return;
    }
    for (let i = 0; i < nums.length; i++) {
      if (used[i]) continue;
      used[i] = true;
      path.push(nums[i]);
      go();
      path.pop();
      used[i] = false;
    }
  }
  go();
  return result;
}`,
          time: 'O(n · n!)',
          space: 'O(n · n!) for the set',
        },
        {
          name: 'Sort + twin rule',
          idea: 'After sorting, twins are neighbours. Allow a twin only when its left twin is already in the path. Then equal values are always placed in the same left-to-right order, so every different ordering is built once.',
          pseudo: `function permuteUnique(nums):
    sort nums ascending
    result ← empty list
    path ← empty list
    used ← array of n false values
    function go():
        if length of path = n:
            append a copy of path to result
            return
        for i from 0 to n - 1:
            if used[i]: continue
            if i > 0 and nums[i] = nums[i - 1] and not used[i - 1]:
                continue
            used[i] ← true
            push nums[i] onto path
            go()
            pop from path
            used[i] ← false
    go()
    return result`,
          code: `function permuteUnique(nums) {
  nums.sort((a, b) => a - b);
  const result = [];
  const path = [];
  const used = new Array(nums.length).fill(false);
  function go() {
    if (path.length === nums.length) {
      result.push([...path]);
      return;
    }
    for (let i = 0; i < nums.length; i++) {
      if (used[i]) continue;
      if (i > 0 && nums[i] === nums[i - 1] && !used[i - 1]) continue;
      used[i] = true;
      path.push(nums[i]);
      go();
      path.pop();
      used[i] = false;
    }
  }
  go();
  return result;
}`,
          time: 'O(n · n!) worst case',
          space: 'O(n) besides the output',
        },
      ],
      fn: 'permuteUnique',
      starter: `function permuteUnique(nums) {
  // every different ordering, no repeats
  return [];
}`,
      solution: `function permuteUnique(nums) {
  nums.sort((a, b) => a - b);
  const result = [];
  const path = [];
  const used = new Array(nums.length).fill(false);
  function go() {
    if (path.length === nums.length) {
      result.push([...path]);
      return;
    }
    for (let i = 0; i < nums.length; i++) {
      if (used[i]) continue;
      if (i > 0 && nums[i] === nums[i - 1] && !used[i - 1]) continue;
      used[i] = true;
      path.push(nums[i]);
      go();
      path.pop();
      used[i] = false;
    }
  }
  go();
  return result;
}`,
      compare: 'unordered',
      tests: [
        { name: 'one pair', args: [[1, 1, 2]], expected: [[1,1,2],[1,2,1],[2,1,1]] },
        { name: 'no repeats', args: [[1, 2, 3]], expected: [[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]] },
        { name: 'all the same', args: [[2, 2, 2]], expected: [[2,2,2]] },
        { name: 'two pairs', args: [[1, 1, 2, 2]], expected: [[1,1,2,2],[1,2,1,2],[1,2,2,1],[2,1,1,2],[2,1,2,1],[2,2,1,1]] },
        { name: 'unsorted triple', args: [[3, 3, 0, 3]], expected: [[0,3,3,3],[3,0,3,3],[3,3,0,3],[3,3,3,0]] },
        { name: 'one number', args: [[1]], expected: [[1]] },
        { name: 'three zeros', args: [[0, 1, 0, 0, 9]], expected: [[0,0,0,1,9],[0,0,0,9,1],[0,0,1,0,9],[0,0,1,9,0],[0,0,9,0,1],[0,0,9,1,0],[0,1,0,0,9],[0,1,0,9,0],[0,1,9,0,0],[0,9,0,0,1],[0,9,0,1,0],[0,9,1,0,0],[1,0,0,0,9],[1,0,0,9,0],[1,0,9,0,0],[1,9,0,0,0],[9,0,0,0,1],[9,0,0,1,0],[9,0,1,0,0],[9,1,0,0,0]] },
      ],
      takeaway: 'Twins must be placed left to right. That one rule removes every repeated ordering.',
    },
    {
      id: 'backtracking-beautiful-arrangement',
      title: 'Beautiful Arrangement',
      difficulty: 'medium',
      leetcode: 526,
      pattern: 'Backtracking (used array, prune on placement)',
      statement: "A teacher lines up `n` kids wearing badges `1` to `n` in spots `1` to `n`. A line-up is **beautiful** if at every spot `i`, the badge number and `i` divide evenly one way or the other: `badge % i === 0` or `i % badge === 0`. Count the beautiful line-ups.",
      examples: [
        { input: 'n = 2', output: '2', explain: '`[1, 2]`: spot 1 has badge 1, spot 2 has badge 2, both fine. `[2, 1]`: 2 % 1 = 0 and 2 % 1 = 0, also fine.' },
        { input: 'n = 1', output: '1' },
        { input: 'n = 3', output: '3' },
      ],
      constraints: ['1 ≤ n ≤ 15'],
      hints: [
        'This is permutations of `1..n`, but you only need a count, not the line-ups.',
        "Don't build a full line-up and check it at the end. Check each badge the moment you put it in a spot.",
        '`go(pos)`: if `pos > n`, return 1. Otherwise add up `go(pos + 1)` over every unused badge `b` with `b % pos === 0 || pos % b === 0`.',
      ],
      approaches: [
        {
          name: 'All permutations, check each',
          idea: 'Generate all n! line-ups and test every spot. Correct, but n = 15 means 1.3 trillion line-ups.',
          code: `function countArrangement(n) {
  const used = new Array(n + 1).fill(false);
  const line = [];
  let count = 0;
  function go() {
    if (line.length === n) {
      if (line.every((b, i) => b % (i + 1) === 0 || (i + 1) % b === 0)) count++;
      return;
    }
    for (let b = 1; b <= n; b++) {
      if (used[b]) continue;
      used[b] = true;
      line.push(b);
      go();
      line.pop();
      used[b] = false;
    }
  }
  go();
  return count;
}`,
          time: 'O(n · n!)',
          space: 'O(n)',
        },
        {
          name: 'Backtracking, check on placement',
          idea: 'Fill spots one by one and only place a badge that works in this spot. A bad badge kills its whole subtree right away, so the search visits a tiny part of the n! tree.',
          pseudo: `function countArrangement(n):
    used ← array of n + 1 false values
    function go(pos):                   // fill spot pos
        if pos > n: return 1            // every spot filled
        count ← 0
        for b from 1 to n:
            if used[b]: continue
            if b mod pos ≠ 0 and pos mod b ≠ 0: continue   // prune
            used[b] ← true
            count ← count + go(pos + 1)
            used[b] ← false
        return count
    return go(1)`,
          code: `function countArrangement(n) {
  const used = new Array(n + 1).fill(false);
  function go(pos) {
    if (pos > n) return 1;
    let count = 0;
    for (let b = 1; b <= n; b++) {
      if (used[b]) continue;
      if (b % pos !== 0 && pos % b !== 0) continue; // prune
      used[b] = true;
      count += go(pos + 1);
      used[b] = false;
    }
    return count;
  }
  return go(1);
}`,
          time: 'O(n!) worst case, far less in practice',
          space: 'O(n)',
        },
      ],
      fn: 'countArrangement',
      starter: `function countArrangement(n) {
  // count the beautiful line-ups of badges 1..n
  return 0;
}`,
      solution: `function countArrangement(n) {
  const used = new Array(n + 1).fill(false);
  function go(pos) {
    if (pos > n) return 1;
    let count = 0;
    for (let b = 1; b <= n; b++) {
      if (used[b]) continue;
      if (b % pos !== 0 && pos % b !== 0) continue;
      used[b] = true;
      count += go(pos + 1);
      used[b] = false;
    }
    return count;
  }
  return go(1);
}`,
      tests: [
        { name: 'one kid', args: [1], expected: 1 },
        { name: 'two kids', args: [2], expected: 2 },
        { name: 'three kids', args: [3], expected: 3 },
        { name: 'four kids', args: [4], expected: 8 },
        { name: 'six kids', args: [6], expected: 36 },
        { name: 'ten kids', args: [10], expected: 700 },
        { name: 'fifteen kids (needs pruning)', args: [15], expected: 24679 },
      ],
      takeaway: 'Check rules at placement time, not at the end: one bad spot kills the whole branch.',
    },
  ],
  quiz: [
    {
      prompt: 'How many orderings do 5 different books have?',
      options: ['25', '32', '120', '3125'],
      answer: 2,
      explanation: '5 choices for the first spot, then 4, 3, 2, 1: 5! = 120.',
    },
    {
      prompt: 'Why does the permutations loop start at 0 instead of at a `start` index?',
      options: [
        'To make it faster',
        'Order matters, so after picking 3 you must still be able to pick 1',
        'Because of duplicates',
        'It makes no difference',
      ],
      answer: 1,
      explanation: '`[3, 1]` and `[1, 3]` are different answers here, so every unused item must stay available.',
    },
    {
      prompt: 'Sorted `[1, 1, 2]`, empty path. The loop reaches i = 1 (the second 1) and `used[0]` is false. What happens?',
      options: ['Pick it', 'Skip it: its left twin is not in the path', 'Stop the loop', 'Save the path'],
      answer: 1,
      explanation: 'The second 1 may only be placed after the first one. Starting with it would repeat the subtree that starts with the first 1.',
    },
    {
      prompt: 'You forget `used[i] = false` after popping. What does `permute([1, 2, 3])` return?',
      options: ['All 6 orderings', 'Only `[[1,2,3]]`', 'An infinite loop', 'Repeated orderings'],
      answer: 1,
      explanation: 'After the first full path every flag stays true, so every later loop skips everything.',
    },
  ],
  takeaways: [
    'Permutations: loop over every index each time and skip the ones marked in `used`.',
    'Un-choose means undo *everything*: pop the path **and** reset `used[i]`.',
    'Repeated values: sort, then skip when `nums[i] === nums[i - 1] && !used[i - 1]`.',
    'n! explodes fast: n ≤ 10 is the signal.',
  ],
};

// ---------------------------------------------------------------------------
// Lesson 4: strings — keypads and cutting
// ---------------------------------------------------------------------------

const stringsLesson: Lesson = {
  id: 'string-choices',
  title: 'Strings: phone keypads and cutting words',
  summary: 'When each step picks a letter or a piece of the string: phone letters, palindrome cuts and IP addresses.',
  minutes: 25,
  blocks: [
    {
      kind: 'callout',
      tone: 'story',
      title: 'T9 texting',
      text: "Before touch screens, phones had keys with 3 or 4 letters each. Pressing `2` then `3` could mean `ad`, `ae`, `af`, `bd`, ... `cf`: 3 × 3 = 9 options. The phone listed every combination and checked which were real words. That's backtracking where the **choices change with the position**: key 2 offers `abc`, key 3 offers `def`.",
    },
    {
      kind: 'text',
      text: "**Warm-up: phone letters.** For `digits = '23'`, position 0 picks from `abc` and position 1 picks from `def`. The tree has one level per digit and one branch per letter. There's no `used[]` and no start index, because each level has its own fixed list of choices.",
    },
    {
      kind: 'diagram',
      title: "digits = '23'",
      art: `path ''
├─ a ─┬─ d → ad
│     ├─ e → ae
│     └─ f → af
├─ b ─┬─ d → bd
│     ├─ e → be
│     └─ f → bf
└─ c ─┬─ d → cd
      ├─ e → ce
      └─ f → cf`,
      caption: 'One level per digit. 3 letters × 3 letters = 9 leaves.',
    },
    {
      kind: 'code',
      lang: 'js',
      title: 'Phone letters',
      code: `const KEYS = ['', '', 'abc', 'def', 'ghi', 'jkl', 'mno', 'pqrs', 'tuv', 'wxyz'];

function letterCombinations(digits) {
  if (digits === '') return [];
  const result = [];
  const path = [];
  function go(i) {
    if (i === digits.length) {
      result.push(path.join(''));
      return;
    }
    for (const ch of KEYS[digits[i]]) {
      path.push(ch); // choose
      go(i + 1);     // explore
      path.pop();    // un-choose
    }
  }
  go(0);
  return result;
}`,
    },
    {
      kind: 'text',
      text: "**The main problem: cut it into palindromes.** A *palindrome* reads the same forwards and backwards: `aba`, `noon`, `a`. Given `s = 'aab'`, cut it into pieces so that every piece is a palindrome, and list every way to do it. Answer: `['a','a','b']` and `['aa','b']`. (`'aab'` itself isn't a palindrome, so it can't stay in one piece.)",
    },
    {
      kind: 'text',
      text: "**Brute force first.** A string of length n has n - 1 gaps between letters, and each gap is either cut or not. That's 2ⁿ⁻¹ ways to cut. Try them all, then check that every piece is a palindrome. For `'aab'`: 4 ways (`a|a|b`, `a|ab`, `aa|b`, `aab`), and 2 survive.",
    },
    {
      kind: 'text',
      text: "**Spot the waste.** Say `s = 'abacdc...'` and the first piece is `'ab'`. That piece is not a palindrome, so *every* way of cutting the rest is doomed. The brute force still builds all of them and rejects them one by one at the end.",
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'Choose the next piece, check it right away',
      text: "Let each step choose **where the next piece ends**. From position `start`, try `end = start, start + 1, ...`. If `s[start..end]` is a palindrome, push it and recurse from `end + 1`. If it isn't, skip it, and the whole subtree under it is never built. When `start` reaches the end of the string, the path is a full answer.",
    },
    {
      kind: 'diagram',
      title: "Cutting 'aab'",
      art: `start 0, path []
├─ 'a'   palindrome → start 1, path [a]
│  ├─ 'a'  palindrome → start 2, path [a,a]
│  │  └─ 'b'  palindrome → start 3   save [a,a,b]
│  └─ 'ab' not a palindrome   skip
├─ 'aa'  palindrome → start 2, path [aa]
│  └─ 'b'  palindrome → start 3   save [aa,b]
└─ 'aab' not a palindrome   skip`,
      caption: "Each branch is one choice for the next piece. Bad pieces are skipped before anything is built under them.",
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Palindrome partitioning',
      code: `function partition(s):
    result ← empty list
    path ← empty list
    function go(start):
        if start = n:
            append a copy of path to result
            return
        for end from start to n - 1:
            if isPalindrome(s, start, end):     // check before going deeper
                push s[start..end] onto path
                go(end + 1)
                pop from path
    go(0)
    return result

function isPalindrome(s, lo, hi):
    while lo < hi:
        if s[lo] ≠ s[hi]: return false
        lo ← lo + 1
        hi ← hi - 1
    return true`,
    },
    {
      kind: 'code',
      lang: 'js',
      code: `function partition(s) {
  const result = [];
  const path = [];
  function isPalindrome(lo, hi) {
    while (lo < hi) {
      if (s[lo] !== s[hi]) return false;
      lo++;
      hi--;
    }
    return true;
  }
  function go(start) {
    if (start === s.length) {
      result.push([...path]);
      return;
    }
    for (let end = start; end < s.length; end++) {
      if (!isPalindrome(start, end)) continue; // prune
      path.push(s.slice(start, end + 1));
      go(end + 1);
      path.pop();
    }
  }
  go(0);
  return result;
}`,
    },
    {
      kind: 'compare',
      title: 'Palindrome partitioning, length n',
      rows: [
        { approach: 'Try all 2ⁿ⁻¹ cuts, check at the end', time: 'O(n · 2ⁿ)', space: 'O(n)', note: 'Builds every cut, even after a bad first piece.' },
        { approach: 'Backtracking, check each piece first', time: 'O(n · 2ⁿ) worst case', space: 'O(n)', note: "Worst case is `'aaaa...'`, where every cut is valid anyway. Usually far faster." },
      ],
    },
    {
      kind: 'text',
      text: "**Same idea, different rule: IP addresses.** A router log lost its dots: `'25525511135'`. Put back 3 dots to make 4 parts, each a number from 0 to 255 with no leading zero (`'0'` is fine, `'01'` is not). Each step chooses a piece of 1, 2 or 3 digits. Skip a piece that is invalid, and stop early when the digits left can't fill the parts left (each part needs 1 to 3 digits).",
    },
    {
      kind: 'text',
      text: "**The pattern.** For strings, ask: *what does one step decide?* One character (phone letters, letter case) → loop over that position's options. One piece (palindrome cuts, IP addresses) → loop over where the piece ends, and check the piece before you recurse.",
    },
    {
      kind: 'callout',
      tone: 'trap',
      title: 'Slices and zeros',
      text: "`s.slice(start, end + 1)`: the end of `slice` is *exclusive*, so add 1. For IP parts, `'0'` is valid but `'00'` and `'012'` are not: reject `piece.length > 1 && piece[0] === '0'`. And for phone letters, empty `digits` must return `[]`, not `['']`.",
    },
  ],
  problems: [
    {
      id: 'backtracking-phone-letters',
      title: 'Letter Combinations of a Phone Number',
      difficulty: 'medium',
      leetcode: 17,
      pattern: 'Backtracking (choices per position)',
      statement: "Old phones map digits to letters: 2 → `abc`, 3 → `def`, 4 → `ghi`, 5 → `jkl`, 6 → `mno`, 7 → `pqrs`, 8 → `tuv`, 9 → `wxyz`. Given a string of digits from 2 to 9, return every letter string those key presses could mean, in any order. If `digits` is empty, return an empty list.",
      examples: [
        { input: "digits = '23'", output: "['ad','ae','af','bd','be','bf','cd','ce','cf']" },
        { input: "digits = ''", output: '[]' },
        { input: "digits = '2'", output: "['a','b','c']" },
      ],
      constraints: ['0 ≤ digits.length ≤ 4', "each digit is between '2' and '9'"],
      hints: [
        'One level of the tree per digit. What are the choices at level `i`?',
        "Store the key letters in an array indexed by digit, so `KEYS[2]` is `'abc'`.",
        "At level `i`, loop over `KEYS[digits[i]]`: push the letter, recurse with `i + 1`, pop. Save `path.join('')` when `i === digits.length`. Handle empty input first.",
      ],
      approaches: [
        {
          name: 'Build level by level',
          idea: "Start with `['']`. For each digit, make a new list: every old string plus every letter of that key. After the last digit the list holds every combination.",
          code: `function letterCombinations(digits) {
  if (digits === '') return [];
  const KEYS = ['', '', 'abc', 'def', 'ghi', 'jkl', 'mno', 'pqrs', 'tuv', 'wxyz'];
  let result = [''];
  for (const d of digits) {
    const next = [];
    for (const str of result) for (const ch of KEYS[d]) next.push(str + ch);
    result = next;
  }
  return result;
}`,
          time: 'O(n · 4ⁿ)',
          space: 'O(n · 4ⁿ)',
        },
        {
          name: 'Backtracking',
          idea: "Level `i` chooses one letter for digit `i`. Each leaf is one full string, so there are at most 4ⁿ leaves, and the recursion only ever holds one path.",
          pseudo: `function letterCombinations(digits):
    if digits is empty: return []
    KEYS ← ['', '', 'abc', 'def', 'ghi', 'jkl', 'mno', 'pqrs', 'tuv', 'wxyz']
    result ← empty list
    path ← empty list
    function go(i):
        if i = n:
            append path joined into a string to result
            return
        for each ch in KEYS[digits[i]]:
            push ch onto path
            go(i + 1)
            pop from path
    go(0)
    return result`,
          code: `function letterCombinations(digits) {
  if (digits === '') return [];
  const KEYS = ['', '', 'abc', 'def', 'ghi', 'jkl', 'mno', 'pqrs', 'tuv', 'wxyz'];
  const result = [];
  const path = [];
  function go(i) {
    if (i === digits.length) {
      result.push(path.join(''));
      return;
    }
    for (const ch of KEYS[digits[i]]) {
      path.push(ch);
      go(i + 1);
      path.pop();
    }
  }
  go(0);
  return result;
}`,
          time: 'O(n · 4ⁿ)',
          space: 'O(n) besides the output',
        },
      ],
      fn: 'letterCombinations',
      starter: `function letterCombinations(digits) {
  // every letter string the key presses could mean
  return [];
}`,
      solution: `function letterCombinations(digits) {
  if (digits === '') return [];
  const KEYS = ['', '', 'abc', 'def', 'ghi', 'jkl', 'mno', 'pqrs', 'tuv', 'wxyz'];
  const result = [];
  const path = [];
  function go(i) {
    if (i === digits.length) {
      result.push(path.join(''));
      return;
    }
    for (const ch of KEYS[digits[i]]) {
      path.push(ch);
      go(i + 1);
      path.pop();
    }
  }
  go(0);
  return result;
}`,
      compare: 'unordered',
      tests: [
        { name: 'two keys', args: ['23'], expected: ['ad','ae','af','bd','be','bf','cd','ce','cf'] },
        { name: 'empty', args: [''], expected: [] },
        { name: 'one key', args: ['2'], expected: ['a','b','c'] },
        { name: 'four-letter key', args: ['7'], expected: ['p','q','r','s'] },
        { name: 'two four-letter keys', args: ['79'], expected: ['pw','px','py','pz','qw','qx','qy','qz','rw','rx','ry','rz','sw','sx','sy','sz'] },
        { name: 'three keys', args: ['234'], expected: ['adg','adh','adi','aeg','aeh','aei','afg','afh','afi','bdg','bdh','bdi','beg','beh','bei','bfg','bfh','bfi','cdg','cdh','cdi','ceg','ceh','cei','cfg','cfh','cfi'] },
        { name: 'same key twice', args: ['22'], expected: ['aa','ab','ac','ba','bb','bc','ca','cb','cc'] },
      ],
      takeaway: 'Each level can have its own list of choices. The template stays the same.',
    },
    {
      id: 'backtracking-palindrome-partition',
      title: 'Palindrome Partitioning',
      difficulty: 'medium',
      leetcode: 131,
      pattern: 'Backtracking (cut the string)',
      statement: "A word-game app wants to split a word `s` into pieces where every piece is a palindrome (reads the same both ways, like `noon` or `a`). Return every possible split as a list of pieces, keeping the pieces in their original order. The splits themselves can be in any order.",
      examples: [
        { input: "s = 'aab'", output: "[['a','a','b'], ['aa','b']]" },
        { input: "s = 'a'", output: "[['a']]" },
      ],
      constraints: ['1 ≤ s.length ≤ 16', 's has only lowercase letters'],
      hints: [
        'Each step chooses the next piece. Where can the next piece end?',
        "From `start`, try every `end`. Only go deeper if `s[start..end]` is a palindrome.",
        "When `start === s.length`, every letter is covered: save a copy of `path`. Use `s.slice(start, end + 1)` to get the piece.",
      ],
      approaches: [
        {
          name: 'Every cut pattern, check at the end',
          idea: 'Each of the n - 1 gaps is cut or not, giving 2ⁿ⁻¹ splits. Build each split, then keep it only if every piece is a palindrome.',
          code: `function partition(s) {
  const result = [];
  const isPal = (t) => t === [...t].reverse().join('');
  function go(i, pieces, current) {
    if (i === s.length) {
      const all = [...pieces, current];
      if (all.every(isPal)) result.push(all);
      return;
    }
    go(i + 1, [...pieces, current], s[i]); // cut before s[i]
    go(i + 1, pieces, current + s[i]);     // no cut
  }
  go(1, [], s[0]);
  return result;
}`,
          time: 'O(n · 2ⁿ)',
          space: 'O(n · 2ⁿ) with all the copies',
        },
        {
          name: 'Backtracking, check each piece first',
          idea: 'Choose where the next piece ends, and only recurse when that piece is a palindrome. A bad piece cuts off its whole subtree, so only valid splits are ever built.',
          pseudo: `function partition(s):
    result ← empty list
    path ← empty list
    function go(start):
        if start = n:
            append a copy of path to result
            return
        for end from start to n - 1:
            if s[start..end] is a palindrome:
                push s[start..end] onto path
                go(end + 1)
                pop from path
    go(0)
    return result`,
          code: `function partition(s) {
  const result = [];
  const path = [];
  function isPalindrome(lo, hi) {
    while (lo < hi) {
      if (s[lo] !== s[hi]) return false;
      lo++;
      hi--;
    }
    return true;
  }
  function go(start) {
    if (start === s.length) {
      result.push([...path]);
      return;
    }
    for (let end = start; end < s.length; end++) {
      if (!isPalindrome(start, end)) continue;
      path.push(s.slice(start, end + 1));
      go(end + 1);
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
      fn: 'partition',
      starter: `function partition(s) {
  // every way to cut s into palindromes
  return [];
}`,
      solution: `function partition(s) {
  const result = [];
  const path = [];
  function isPalindrome(lo, hi) {
    while (lo < hi) {
      if (s[lo] !== s[hi]) return false;
      lo++;
      hi--;
    }
    return true;
  }
  function go(start) {
    if (start === s.length) {
      result.push([...path]);
      return;
    }
    for (let end = start; end < s.length; end++) {
      if (!isPalindrome(start, end)) continue;
      path.push(s.slice(start, end + 1));
      go(end + 1);
      path.pop();
    }
  }
  go(0);
  return result;
}`,
      compare: 'unordered',
      tests: [
        { name: 'aab', args: ['aab'], expected: [['a','a','b'],['aa','b']] },
        { name: 'one letter', args: ['a'], expected: [['a']] },
        { name: 'two different letters', args: ['ab'], expected: [['a','b']] },
        { name: 'all the same', args: ['aaaa'], expected: [['a','a','a','a'],['a','a','aa'],['a','aa','a'],['a','aaa'],['aa','a','a'],['aa','aa'],['aaa','a'],['aaaa']] },
        { name: 'racecar', args: ['racecar'], expected: [['r','a','c','e','c','a','r'],['r','a','cec','a','r'],['r','aceca','r'],['racecar']] },
        { name: 'abba', args: ['abba'], expected: [['a','b','b','a'],['a','bb','a'],['abba']] },
        { name: 'no long palindromes', args: ['abcd'], expected: [['a','b','c','d']] },
      ],
      takeaway: 'Choose the next piece, not the next letter, and check it before you recurse.',
    },
    {
      id: 'backtracking-restore-ip',
      title: 'Restore IP Addresses',
      difficulty: 'medium',
      leetcode: 93,
      pattern: 'Backtracking (cut the string)',
      statement: "A router log lost the dots in its IP addresses. An IP address is 4 numbers from 0 to 255 joined by dots, and a number can't have a leading zero (`0` is fine, `01` is not). Given a string of digits `s`, return every valid IP address you can make by putting back exactly 3 dots. Don't move or drop any digit. Any order.",
      examples: [
        { input: "s = '25525511135'", output: "['255.255.11.135', '255.255.111.35']" },
        { input: "s = '0000'", output: "['0.0.0.0']" },
        { input: "s = '101023'", output: "['1.0.10.23', '1.0.102.3', '10.1.0.23', '10.10.2.3', '101.0.2.3']" },
      ],
      constraints: ['1 ≤ s.length ≤ 20', 's has only digits'],
      hints: [
        'Each step picks the next part: 1, 2 or 3 digits long.',
        "A part is valid if its value is at most 255 and it has no leading zero (unless it is exactly `'0'`).",
        'Prune: with `left` digits and `parts` parts still to fill, you need `parts ≤ left ≤ 3 × parts`. Save when you have 4 parts and every digit is used.',
      ],
      approaches: [
        {
          name: 'Three loops for the three dots',
          idea: 'Try every position for dot 1, dot 2 and dot 3 (each part 1 to 3 digits) and keep the splits where all 4 parts are valid. This is fine here, because there are at most 3 × 3 × 3 = 27 splits to check.',
          code: `function restoreIpAddresses(s) {
  const ok = (p) => p.length > 0 && p.length <= 3 && (p === '0' || p[0] !== '0') && Number(p) <= 255;
  const result = [];
  for (let a = 1; a <= 3; a++) {
    for (let b = a + 1; b <= a + 3; b++) {
      for (let c = b + 1; c <= b + 3; c++) {
        const parts = [s.slice(0, a), s.slice(a, b), s.slice(b, c), s.slice(c)];
        if (c < s.length && parts.every(ok)) result.push(parts.join('.'));
      }
    }
  }
  return result;
}`,
          time: 'O(1): at most 27 splits',
          space: 'O(1)',
        },
        {
          name: 'Backtracking with pruning',
          idea: 'Choose the next part (1 to 3 digits), skip invalid ones, and stop as soon as the digits left cannot fit the parts left. Same answers, but this shape also works when the rules change, for example 6 parts instead of 4.',
          pseudo: `function restoreIpAddresses(s):
    result ← empty list
    path ← empty list
    function go(start):
        partsLeft ← 4 - length of path
        digitsLeft ← n - start
        if partsLeft = 0:
            if digitsLeft = 0: append path joined with '.' to result
            return
        if digitsLeft < partsLeft or digitsLeft > 3 × partsLeft:
            return                              // can't fit: prune
        for len from 1 to 3:
            piece ← s[start .. start + len - 1]
            if piece is valid:                  // ≤ 255, no leading zero
                push piece onto path
                go(start + len)
                pop from path
    go(0)
    return result`,
          code: `function restoreIpAddresses(s) {
  const result = [];
  const path = [];
  function valid(p) {
    if (p.length > 1 && p[0] === '0') return false;
    return Number(p) <= 255;
  }
  function go(start) {
    const partsLeft = 4 - path.length;
    const digitsLeft = s.length - start;
    if (partsLeft === 0) {
      if (digitsLeft === 0) result.push(path.join('.'));
      return;
    }
    if (digitsLeft < partsLeft || digitsLeft > 3 * partsLeft) return;
    for (let len = 1; len <= 3 && start + len <= s.length; len++) {
      const piece = s.slice(start, start + len);
      if (!valid(piece)) continue;
      path.push(piece);
      go(start + len);
      path.pop();
    }
  }
  go(0);
  return result;
}`,
          time: 'O(1): at most 3⁴ = 81 paths',
          space: 'O(1)',
        },
      ],
      fn: 'restoreIpAddresses',
      starter: `function restoreIpAddresses(s) {
  // every valid IP address made by adding 3 dots
  return [];
}`,
      solution: `function restoreIpAddresses(s) {
  const result = [];
  const path = [];
  function valid(p) {
    if (p.length > 1 && p[0] === '0') return false;
    return Number(p) <= 255;
  }
  function go(start) {
    const partsLeft = 4 - path.length;
    const digitsLeft = s.length - start;
    if (partsLeft === 0) {
      if (digitsLeft === 0) result.push(path.join('.'));
      return;
    }
    if (digitsLeft < partsLeft || digitsLeft > 3 * partsLeft) return;
    for (let len = 1; len <= 3 && start + len <= s.length; len++) {
      const piece = s.slice(start, start + len);
      if (!valid(piece)) continue;
      path.push(piece);
      go(start + len);
      path.pop();
    }
  }
  go(0);
  return result;
}`,
      compare: 'unordered',
      tests: [
        { name: 'router log', args: ['25525511135'], expected: ['255.255.11.135','255.255.111.35'] },
        { name: 'all zeros', args: ['0000'], expected: ['0.0.0.0'] },
        { name: 'five answers', args: ['101023'], expected: ['1.0.10.23','1.0.102.3','10.1.0.23','10.10.2.3','101.0.2.3'] },
        { name: 'all ones', args: ['1111'], expected: ['1.1.1.1'] },
        { name: 'leading zeros', args: ['010010'], expected: ['0.10.0.10','0.100.1.0'] },
        { name: 'too short', args: ['123'], expected: [] },
        { name: 'too long', args: ['1234567890123'], expected: [] },
        { name: 'biggest address', args: ['255255255255'], expected: ['255.255.255.255'] },
        { name: 'every part too big', args: ['256256256256'], expected: [] },
      ],
      takeaway: 'Prune on what is left: if the remaining characters cannot fill the remaining slots, stop.',
    },
  ],
  quiz: [
    {
      prompt: "How many letter strings can digits '79' make? (7 → pqrs, 9 → wxyz)",
      options: ['8', '9', '12', '16'],
      answer: 3,
      explanation: '4 choices for the first key times 4 for the second: 16.',
    },
    {
      prompt: 'In palindrome partitioning, what does one recursive call choose?',
      options: ['One character', 'Where the next piece ends', 'Whether to reverse the string', 'How many pieces there will be'],
      answer: 1,
      explanation: 'The call loops over every possible end of the next piece and recurses from just after it.',
    },
    {
      prompt: 'Which of these is a valid IP address part?',
      options: ["`'256'`", "`'01'`", "`'0'`", "`'1000'`"],
      answer: 2,
      explanation: "`'0'` is a single zero, which is allowed. `'256'` is too big, `'01'` has a leading zero, and `'1000'` is 4 digits.",
    },
  ],
  takeaways: [
    'Ask what one step decides: a character, or a whole piece.',
    'Check a piece *before* recursing: a bad piece kills its whole subtree.',
    '`s.slice(start, end + 1)`: the end of `slice` is exclusive.',
  ],
};

export const lessonsPart2: Lesson[] = [permutationsLesson, stringsLesson];
