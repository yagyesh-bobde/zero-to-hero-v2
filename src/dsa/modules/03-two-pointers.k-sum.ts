import type { Lesson } from '../types';

// Lesson 5 of module 3: 3Sum and k-sum (sort, fix some, two pointers for the rest).
export const kSum: Lesson = {
  id: 'k-sum',
  title: '3Sum & k-sum',
  summary: 'Sort, fix one number, and solve the rest as a sorted pair problem.',
  minutes: 24,
  blocks: [
    {
      kind: 'callout',
      tone: 'story',
      title: 'Transactions that cancel out',
      text: "An accounting team hunts for groups of transactions that add up to zero: a 50 dollar charge with refunds of 20 and 30 often means a customer was billed twice and then fixed by hand. Each ledger line is a signed amount. The team wants every such **triple**, listed once.",
    },
    {
      kind: 'text',
      text: "**The problem.** Given `[-1, 0, 1, 2, -1, -4]`, list every **unique** triple of values (from three different positions) that sums to 0. Answer: `[-1, -1, 2]` and `[-1, 0, 1]`. The two `-1`s can make `[-1, 0, 1]` in two ways, but you list it only once.",
    },
    {
      kind: 'text',
      text: "**Brute force first.** Try every triple of positions. Sort each hit and store it in a set so repeats collapse.",
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Brute force: every triple',
      code: `function threeSum(a):
    found ← empty set
    for i from 0 to n - 3:
        for j from i + 1 to n - 2:
            for k from j + 1 to n - 1:
                if a[i] + a[j] + a[k] = 0:
                    add sorted [a[i], a[j], a[k]] to found
    return found as a list`,
    },
    {
      kind: 'text',
      text: "Three nested loops: **O(n³)**. With 3,000 ledger lines that is about 4.5 billion triples.",
    },
    {
      kind: 'text',
      text: "**Spot the waste.** Fix the first number, say `-1`. Now you need two other numbers that add up to `+1`. That is exactly the gift-card problem from lesson 1! If the array is sorted, two pointers find every such pair in **one** O(n) sweep, instead of the O(n²) inner loops. Sorting also puts equal values side by side, so you can skip repeats by looking at the neighbor. No set needed.",
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'k-sum = fix one, then solve (k − 1)-sum',
      text: "Sort once. Loop `i` over the first number. For each `i`, run opposite-end two pointers on the part after `i`, looking for a pair that sums to `-a[i]`. To avoid listing a triple twice, skip any `i` (and any partner) whose value equals the one just before it.",
    },
    {
      kind: 'trace',
      title: '3Sum on sorted [-4, -1, -1, 0, 1, 2]',
      columns: ['i', 'a[i]', 'L', 'R', 'sum', 'what happens'],
      rows: [
        [0, -4, 1, 5, -3, 'too small → L++'],
        [0, -4, 2, 5, -3, 'too small → L++'],
        [0, -4, 3, 5, -2, 'too small → L++'],
        [0, -4, 4, 5, -1, 'too small → L++, L meets R'],
        [1, -1, 2, 5, 0, 'found [-1, -1, 2], move both'],
        [1, -1, 3, 4, 0, 'found [-1, 0, 1], move both'],
        [2, -1, '–', '–', '–', 'same value as a[1] → skip i'],
        [3, 0, 4, 5, 3, 'too big → R--, L meets R'],
      ],
      note: "Each `i` costs one sweep of at most n steps, so the whole thing is O(n²). Skipping `i = 2` is what stops `[-1, 0, 1]` from appearing twice.",
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Sort + fix one + two pointers',
      code: `function threeSum(a):
    sort a ascending
    result ← empty list
    for i from 0 to n - 3:
        if i > 0 and a[i] = a[i - 1]:
            skip to the next i              // same first number
        L ← i + 1
        R ← n - 1
        while L < R:
            sum ← a[i] + a[L] + a[R]
            if sum = 0:
                append [a[i], a[L], a[R]] to result
                L ← L + 1
                R ← R - 1
                while L < R and a[L] = a[L - 1]:
                    L ← L + 1               // same partner again
            else if sum < 0:
                L ← L + 1
            else:
                R ← R - 1
    return result`,
    },
    {
      kind: 'code',
      lang: 'js',
      code: `function threeSum(nums) {
  nums.sort((a, b) => a - b);
  const result = [];
  for (let i = 0; i < nums.length - 2; i++) {
    if (i > 0 && nums[i] === nums[i - 1]) continue;
    let left = i + 1;
    let right = nums.length - 1;
    while (left < right) {
      const sum = nums[i] + nums[left] + nums[right];
      if (sum === 0) {
        result.push([nums[i], nums[left], nums[right]]);
        left++;
        right--;
        while (left < right && nums[left] === nums[left - 1]) left++;
      } else if (sum < 0) left++;
      else right--;
    }
  }
  return result;
}`,
    },
    {
      kind: 'compare',
      title: '3Sum',
      rows: [
        { approach: 'Every triple + set', time: 'O(n³)', space: 'O(n) for the set', note: 'Correct, too slow past a few hundred values.' },
        {
          approach: 'Fix one + hash set for the pair',
          time: 'O(n²)',
          space: 'O(n)',
          note: "Module 2's Two Sum inside a loop. Dedupe gets fiddly.",
        },
        {
          approach: 'Sort + fix one + two pointers',
          time: 'O(n²)',
          space: 'O(1) extra (plus the sort)',
          note: 'Sorted order gives the pointer moves and easy dedupe.',
        },
      ],
    },
    {
      kind: 'text',
      text: "**Going bigger.** 4Sum fixes **two** numbers with two loops and runs two pointers inside: O(n³). In general, k-sum on sorted data costs O(nᵏ⁻¹): every extra number adds one loop, and the last two always share a single two-pointer sweep. The same sweep also answers near-miss questions: **3Sum Closest** keeps the closest sum seen instead of waiting for an exact hit.",
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Template: fix one, sweep the rest',
      code: `sort a ascending
for i from 0 to n - 3:
    if i > 0 and a[i] = a[i - 1]: skip to the next i
    L ← i + 1
    R ← n - 1
    while L < R:
        sum ← a[i] + a[L] + a[R]
        if sum hits the goal: record it, move both, skip repeats
        else if sum is too small: L ← L + 1
        else: R ← R - 1`,
    },
    {
      kind: 'list',
      items: [
        "The task asks for **3 or 4 numbers** that sum to (or close to) a target.",
        "It says **unique** combinations, or no duplicate answers.",
        "The order of the input doesn't matter, so sorting is allowed.",
        "n is up to a few thousand, which allows O(n²) (or O(n³) for 4Sum with n ≤ 200).",
      ],
    },
    {
      kind: 'callout',
      tone: 'trap',
      title: 'Skip repeats looking backward',
      text: "Skip `i` when `a[i] = a[i - 1]`, not when `a[i] = a[i + 1]`. The forward check skips the first `-1` in `[-1, -1, 2]` before it ever gets to use the second `-1` as a partner, so that triple is lost. Same idea for partners: after a hit, move `L` past values equal to `a[L - 1]`. In other languages 4Sum can overflow (four values of 10⁹); JavaScript numbers are exact up to 2⁵³, so it is safe here.",
    },
  ],
  problems: [
    {
      id: 'two-pointers-three-sum',
      title: '3Sum',
      difficulty: 'medium',
      leetcode: 15,
      pattern: 'Sort + two pointers (k-sum)',
      statement:
        "The ledger check. Given signed amounts `nums`, return every **unique** triple `[a, b, c]` of values taken from three different positions with `a + b + c = 0`. No triple may appear twice. The order of triples, and of numbers inside a triple, doesn't matter.",
      examples: [
        { input: 'nums = [-1, 0, 1, 2, -1, -4]', output: '[[-1, -1, 2], [-1, 0, 1]]' },
        { input: 'nums = [0, 1, 1]', output: '[]' },
        { input: 'nums = [0, 0, 0]', output: '[[0, 0, 0]]' },
      ],
      constraints: ['3 ≤ n ≤ 3000', '-10⁵ ≤ nums[i] ≤ 10⁵'],
      hints: [
        "If you fix the first number `x`, what do the other two need to add up to?",
        "Sort first. Then for each `i`, run the sorted two-pointer pair search on the part after `i` with goal `-nums[i]`.",
        "Skip `i` when `nums[i] === nums[i - 1]`. After a hit, move both pointers and skip partners equal to the previous one.",
      ],
      approaches: [
        {
          name: 'Every triple + set',
          idea: "Check every triple of positions and store sorted hits in a set (as strings) to remove repeats. Correct but O(n³).",
          time: 'O(n³)',
          space: 'O(n)',
        },
        {
          name: 'Sort + fix one + two pointers',
          idea: "Once the first number is fixed, the rest is a sorted pair-sum problem, which two pointers solve in one sweep. Sorting also groups equal values, so skipping a value equal to its left neighbor removes every repeat.",
          pseudo: `function threeSum(nums):
    sort nums ascending
    result ← empty list
    for i from 0 to n - 3:
        if i > 0 and nums[i] = nums[i - 1]:
            skip to the next i
        L ← i + 1
        R ← n - 1
        while L < R:
            sum ← nums[i] + nums[L] + nums[R]
            if sum = 0:
                append [nums[i], nums[L], nums[R]] to result
                L ← L + 1
                R ← R - 1
                while L < R and nums[L] = nums[L - 1]:
                    L ← L + 1
            else if sum < 0:
                L ← L + 1
            else:
                R ← R - 1
    return result`,
          code: `function threeSum(nums) {
  nums.sort((a, b) => a - b);
  const result = [];
  for (let i = 0; i < nums.length - 2; i++) {
    if (i > 0 && nums[i] === nums[i - 1]) continue;
    let left = i + 1;
    let right = nums.length - 1;
    while (left < right) {
      const sum = nums[i] + nums[left] + nums[right];
      if (sum === 0) {
        result.push([nums[i], nums[left], nums[right]]);
        left++;
        right--;
        while (left < right && nums[left] === nums[left - 1]) left++;
      } else if (sum < 0) left++;
      else right--;
    }
  }
  return result;
}`,
          time: 'O(n²)',
          space: 'O(1) extra (plus the sort)',
        },
      ],
      fn: 'threeSum',
      starter: `function threeSum(nums) {
  // return every unique triple that sums to 0
  return [];
}`,
      solution: `function threeSum(nums) {
  nums.sort((a, b) => a - b);
  const result = [];
  for (let i = 0; i < nums.length - 2; i++) {
    if (i > 0 && nums[i] === nums[i - 1]) continue;
    let left = i + 1;
    let right = nums.length - 1;
    while (left < right) {
      const sum = nums[i] + nums[left] + nums[right];
      if (sum === 0) {
        result.push([nums[i], nums[left], nums[right]]);
        left++;
        right--;
        while (left < right && nums[left] === nums[left - 1]) left++;
      } else if (sum < 0) left++;
      else right--;
    }
  }
  return result;
}`,
      compare: 'nested',
      tests: [
        { name: 'classic', args: [[-1, 0, 1, 2, -1, -4]], expected: [[-1, -1, 2], [-1, 0, 1]] },
        { name: 'no triple', args: [[0, 1, 1]], expected: [] },
        { name: 'three zeros', args: [[0, 0, 0]], expected: [[0, 0, 0]] },
        { name: 'four zeros, listed once', args: [[0, 0, 0, 0]], expected: [[0, 0, 0]] },
        { name: 'two answers with -2', args: [[-2, 0, 1, 1, 2]], expected: [[-2, 0, 2], [-2, 1, 1]] },
        { name: 'all positive', args: [[1, 2, 3]], expected: [] },
        { name: 'repeat partner', args: [[-1, 0, 1, 0]], expected: [[-1, 0, 1]] },
        {
          name: 'many answers',
          args: [[-4, -2, -2, -2, 0, 1, 2, 2, 2, 3, 3, 4, 4, 6, 6]],
          expected: [[-4, -2, 6], [-4, 0, 4], [-4, 1, 3], [-4, 2, 2], [-2, -2, 4], [-2, 0, 2]],
        },
      ],
      takeaway: "Sort, fix one value, two-pointer the rest, and skip values equal to their left neighbor.",
    },
    {
      id: 'two-pointers-three-sum-closest',
      title: '3Sum Closest',
      difficulty: 'medium',
      leetcode: 16,
      pattern: 'Sort + two pointers (k-sum)',
      statement:
        "A gift basket shop picks three items whose total price is as close as possible to the customer's budget. Given prices `nums` and a `target`, choose three values from different positions whose sum is closest to `target`, and return that **sum**. Each input has exactly one closest sum.",
      examples: [
        { input: 'nums = [-1, 2, 1, -4], target = 1', output: '2', explain: "-1 + 2 + 1 = 2 is 1 away from the target. No triple gets closer." },
        { input: 'nums = [0, 0, 0], target = 1', output: '0' },
      ],
      constraints: ['3 ≤ n ≤ 500', '-1000 ≤ nums[i] ≤ 1000', '-10⁴ ≤ target ≤ 10⁴'],
      hints: [
        "This is 3Sum, except you never get a guaranteed exact hit. What should you remember while sweeping?",
        "Keep `best`, the sum closest to `target` so far. Update it at every step of every sweep.",
        "Sum too small: `left++`. Too big: `right--`. Exactly `target`: return right away, nothing can be closer.",
      ],
      approaches: [
        {
          name: 'Every triple',
          idea: "Try all triples and keep the one with the smallest distance to the target. Correct but O(n³).",
          time: 'O(n³)',
          space: 'O(1)',
        },
        {
          name: 'Sort + fix one + two pointers',
          idea: "For a fixed `i`, moving `left` right makes the sum bigger and moving `right` left makes it smaller. So if the sum is below the target, only `left++` can bring it closer; if above, only `right--`. Check every sum you pass on the way.",
          pseudo: `function threeSumClosest(nums, target):
    sort nums ascending
    best ← nums[0] + nums[1] + nums[2]
    for i from 0 to n - 3:
        L ← i + 1
        R ← n - 1
        while L < R:
            sum ← nums[i] + nums[L] + nums[R]
            if |sum - target| < |best - target|:
                best ← sum
            if sum = target: return sum
            if sum < target:
                L ← L + 1
            else:
                R ← R - 1
    return best`,
          code: `function threeSumClosest(nums, target) {
  nums.sort((a, b) => a - b);
  let best = nums[0] + nums[1] + nums[2];
  for (let i = 0; i < nums.length - 2; i++) {
    let left = i + 1;
    let right = nums.length - 1;
    while (left < right) {
      const sum = nums[i] + nums[left] + nums[right];
      if (Math.abs(sum - target) < Math.abs(best - target)) best = sum;
      if (sum === target) return sum;
      if (sum < target) left++;
      else right--;
    }
  }
  return best;
}`,
          time: 'O(n²)',
          space: 'O(1) extra (plus the sort)',
        },
      ],
      fn: 'threeSumClosest',
      starter: `function threeSumClosest(nums, target) {
  // return the sum of three values closest to target
  return 0;
}`,
      solution: `function threeSumClosest(nums, target) {
  nums.sort((a, b) => a - b);
  let best = nums[0] + nums[1] + nums[2];
  for (let i = 0; i < nums.length - 2; i++) {
    let left = i + 1;
    let right = nums.length - 1;
    while (left < right) {
      const sum = nums[i] + nums[left] + nums[right];
      if (Math.abs(sum - target) < Math.abs(best - target)) best = sum;
      if (sum === target) return sum;
      if (sum < target) left++;
      else right--;
    }
  }
  return best;
}`,
      tests: [
        { name: 'classic', args: [[-1, 2, 1, -4], 1], expected: 2 },
        { name: 'all zeros', args: [[0, 0, 0], 1], expected: 0 },
        { name: 'target far below', args: [[1, 1, 1, 0], -100], expected: 2 },
        { name: 'exact hit', args: [[1, 1, -1, -1, 3], -1], expected: -1 },
        { name: 'mixed signs', args: [[4, 0, 5, -5, 3, 3, 0, -4, -5], -2], expected: -2 },
        { name: 'between two sums', args: [[10, 20, 30, 40], 72], expected: 70 },
        { name: 'target far above', args: [[1, 2, 3, 4], 100], expected: 9 },
      ],
      takeaway: "The same sweep works for 'closest': the sign of sum - target still tells you which pointer to move.",
    },
    {
      id: 'two-pointers-four-sum',
      title: '4Sum',
      difficulty: 'medium',
      leetcode: 18,
      pattern: 'Sort + two pointers (k-sum)',
      statement:
        "A fantasy-sports app wants every **unique** lineup of four player scores (from four different positions in `nums`) that add up to exactly `target`. Return all such quadruples, each listed once. Order doesn't matter.",
      examples: [
        { input: 'nums = [1, 0, -1, 0, -2, 2], target = 0', output: '[[-2, -1, 1, 2], [-2, 0, 0, 2], [-1, 0, 0, 1]]' },
        { input: 'nums = [2, 2, 2, 2, 2], target = 8', output: '[[2, 2, 2, 2]]' },
      ],
      constraints: ['1 ≤ n ≤ 200', '-10⁹ ≤ nums[i] ≤ 10⁹', '-10⁹ ≤ target ≤ 10⁹'],
      hints: [
        "3Sum fixed one number and swept for the other two. How many must you fix here?",
        "Sort. Two loops fix `nums[i]` and `nums[j]` (with `j > i`). Then two pointers sweep the part after `j`.",
        "Skip repeats at **every** level: `i` when `nums[i] === nums[i - 1]`, `j` when `j > i + 1 && nums[j] === nums[j - 1]`, and partners after a hit.",
      ],
      approaches: [
        {
          name: 'Every quadruple + set',
          idea: "Four nested loops and a set of sorted hits. Correct but O(n⁴): about 66 million checks for n = 200 per test, too slow.",
          time: 'O(n⁴)',
          space: 'O(n)',
        },
        {
          name: 'Sort + fix two + two pointers',
          idea: "Fixing two values leaves a sorted pair-sum problem, solved by one two-pointer sweep. Skipping a value equal to its left neighbor at each level removes duplicates, just like in 3Sum.",
          pseudo: `function fourSum(nums, target):
    sort nums ascending
    result ← empty list
    for i from 0 to n - 4:
        if i > 0 and nums[i] = nums[i - 1]: skip to next i
        for j from i + 1 to n - 3:
            if j > i + 1 and nums[j] = nums[j - 1]: skip to next j
            L ← j + 1
            R ← n - 1
            while L < R:
                sum ← nums[i] + nums[j] + nums[L] + nums[R]
                if sum = target:
                    append [nums[i], nums[j], nums[L], nums[R]]
                    L ← L + 1
                    R ← R - 1
                    while L < R and nums[L] = nums[L - 1]:
                        L ← L + 1
                else if sum < target:
                    L ← L + 1
                else:
                    R ← R - 1
    return result`,
          code: `function fourSum(nums, target) {
  nums.sort((a, b) => a - b);
  const n = nums.length;
  const result = [];
  for (let i = 0; i < n - 3; i++) {
    if (i > 0 && nums[i] === nums[i - 1]) continue;
    for (let j = i + 1; j < n - 2; j++) {
      if (j > i + 1 && nums[j] === nums[j - 1]) continue;
      let left = j + 1;
      let right = n - 1;
      while (left < right) {
        const sum = nums[i] + nums[j] + nums[left] + nums[right];
        if (sum === target) {
          result.push([nums[i], nums[j], nums[left], nums[right]]);
          left++;
          right--;
          while (left < right && nums[left] === nums[left - 1]) left++;
        } else if (sum < target) left++;
        else right--;
      }
    }
  }
  return result;
}`,
          time: 'O(n³)',
          space: 'O(1) extra (plus the sort)',
        },
      ],
      fn: 'fourSum',
      starter: `function fourSum(nums, target) {
  // return every unique quadruple that sums to target
  return [];
}`,
      solution: `function fourSum(nums, target) {
  nums.sort((a, b) => a - b);
  const n = nums.length;
  const result = [];
  for (let i = 0; i < n - 3; i++) {
    if (i > 0 && nums[i] === nums[i - 1]) continue;
    for (let j = i + 1; j < n - 2; j++) {
      if (j > i + 1 && nums[j] === nums[j - 1]) continue;
      let left = j + 1;
      let right = n - 1;
      while (left < right) {
        const sum = nums[i] + nums[j] + nums[left] + nums[right];
        if (sum === target) {
          result.push([nums[i], nums[j], nums[left], nums[right]]);
          left++;
          right--;
          while (left < right && nums[left] === nums[left - 1]) left++;
        } else if (sum < target) left++;
        else right--;
      }
    }
  }
  return result;
}`,
      compare: 'nested',
      tests: [
        { name: 'classic', args: [[1, 0, -1, 0, -2, 2], 0], expected: [[-2, -1, 1, 2], [-2, 0, 0, 2], [-1, 0, 0, 1]] },
        { name: 'all the same', args: [[2, 2, 2, 2, 2], 8], expected: [[2, 2, 2, 2]] },
        { name: 'too short', args: [[1, 2, 3], 6], expected: [] },
        { name: 'no match', args: [[0, 0, 0, 0], 1], expected: [] },
        { name: 'mixed signs', args: [[-3, -1, 0, 2, 4, 5], 2], expected: [[-3, -1, 2, 4]] },
        { name: 'huge values', args: [[1000000000, 1000000000, 1000000000, 1000000000], -294967296], expected: [] },
        { name: 'negative target', args: [[-5, -4, -3, -2, -1, 0], -10], expected: [[-5, -4, -1, 0], [-5, -3, -2, 0], [-4, -3, -2, -1]] },
      ],
      takeaway: "Each extra number in k-sum costs one more loop; the last two always share one sweep.",
    },
    {
      id: 'two-pointers-max-k-sum-pairs',
      title: 'Max Number of K-Sum Pairs',
      difficulty: 'medium',
      leetcode: 1679,
      pattern: 'Sort + two pointers',
      statement:
        "A team-building game pairs up players so that each pair's scores add up to exactly `k`. Each player can be in at most one pair. Given the scores `nums` and `k`, return the **largest number of pairs** you can form.",
      examples: [
        { input: 'nums = [1, 2, 3, 4], k = 5', output: '2', explain: "Pairs (1, 4) and (2, 3)." },
        { input: 'nums = [3, 1, 3, 4, 3], k = 6', output: '1', explain: "Only one (3, 3) pair; the third 3 has no partner." },
      ],
      constraints: ['1 ≤ n ≤ 10⁵', '1 ≤ nums[i] ≤ 10⁹', '1 ≤ k ≤ 10⁹'],
      hints: [
        "You only need the count of pairs, not which ones. Does the order of `nums` matter?",
        "Sort, then put `left` at the smallest and `right` at the biggest score.",
        "Sum equals `k`: count a pair and move both. Too small: `left++`. Too big: `right--`.",
      ],
      approaches: [
        {
          name: 'Greedy scan with used flags',
          idea: "For each unused player, scan for an unused partner with score `k - x`. Mark both used. Correct, but each scan is O(n).",
          time: 'O(n²)',
          space: 'O(n)',
        },
        {
          name: 'Count map',
          idea: "Keep a count of unmatched scores in a map. For each `x`, if `k - x` is waiting, use it up and count a pair; otherwise add `x`. This is the hashing approach from module 2.",
          time: 'O(n)',
          space: 'O(n)',
        },
        {
          name: 'Sort + two pointers',
          idea: "After sorting, a too-small sum means the left score can't pair with anyone left (even the biggest), and a too-big sum means the right score can't pair with anyone left. On a match, using those two is safe: any other partner for them would need the same value anyway.",
          pseudo: `function maxOperations(nums, k):
    sort nums ascending
    L ← 0
    R ← n - 1
    pairs ← 0
    while L < R:
        sum ← nums[L] + nums[R]
        if sum = k:
            pairs ← pairs + 1
            L ← L + 1
            R ← R - 1
        else if sum < k:
            L ← L + 1
        else:
            R ← R - 1
    return pairs`,
          code: `function maxOperations(nums, k) {
  nums.sort((a, b) => a - b);
  let left = 0;
  let right = nums.length - 1;
  let pairs = 0;
  while (left < right) {
    const sum = nums[left] + nums[right];
    if (sum === k) {
      pairs++;
      left++;
      right--;
    } else if (sum < k) left++;
    else right--;
  }
  return pairs;
}`,
          time: 'O(n log n) for the sort',
          space: 'O(1) extra (plus the sort)',
        },
      ],
      fn: 'maxOperations',
      starter: `function maxOperations(nums, k) {
  // return the most pairs that each sum to k (each value used once)
  return 0;
}`,
      solution: `function maxOperations(nums, k) {
  nums.sort((a, b) => a - b);
  let left = 0;
  let right = nums.length - 1;
  let pairs = 0;
  while (left < right) {
    const sum = nums[left] + nums[right];
    if (sum === k) {
      pairs++;
      left++;
      right--;
    } else if (sum < k) left++;
    else right--;
  }
  return pairs;
}`,
      tests: [
        { name: 'two pairs', args: [[1, 2, 3, 4], 5], expected: 2 },
        { name: 'odd one out', args: [[3, 1, 3, 4, 3], 6], expected: 1 },
        { name: 'all the same', args: [[2, 2, 2, 2], 4], expected: 2 },
        { name: 'single', args: [[1], 2], expected: 0 },
        { name: 'three of a kind', args: [[1, 1, 1], 2], expected: 1 },
        { name: 'no pairs', args: [[5, 6, 7], 3], expected: 0 },
        { name: 'long mixed', args: [[2, 5, 4, 4, 1, 3, 4, 4, 1, 4, 4, 1, 2, 1, 2, 2, 3, 2, 4, 2], 3], expected: 4 },
      ],
      takeaway: "Counting pairs instead of listing them is the same sorted sweep: count, then move both.",
    },
  ],
  quiz: [
    {
      prompt: 'Why does 3Sum sort the array first?',
      options: [
        'So two pointers can find pairs in one sweep and equal values sit side by side for easy dedupe',
        'Because the answer must be printed in sorted order',
        'Sorting makes the array smaller',
        'Because JavaScript arrays are always sorted',
      ],
      answer: 0,
      explanation: "Sorted order gives the pointer rule (too small → left, too big → right) and puts repeats next to each other.",
    },
    {
      prompt: 'What is the time cost of sort + fix one + two pointers for 3Sum?',
      options: ['O(n²)', 'O(n log n)', 'O(n³)', 'O(n)'],
      answer: 0,
      explanation: "n choices for `i`, each followed by an O(n) sweep. The O(n log n) sort is smaller than that.",
    },
    {
      prompt: "You skip `i` when `nums[i] === nums[i + 1]` instead of `nums[i - 1]`. On `[-1, -1, 2]`, what happens?",
      options: [
        'The triple `[-1, -1, 2]` is missed',
        'It is listed twice',
        'It still works the same',
        'The loop never ends',
      ],
      answer: 0,
      explanation: "The first `-1` is skipped because the next value is also `-1`. Then the second `-1` is fixed, and only `2` is left after it, so no triple is found.",
    },
    {
      prompt: 'How fast is 4Sum with sort + two loops + two pointers?',
      options: ['O(n³)', 'O(n²)', 'O(n⁴)', 'O(n log n)'],
      answer: 0,
      explanation: "Two nested loops fix two numbers (n² combos), and each gets an O(n) sweep.",
    },
  ],
  takeaways: [
    "k-sum on sorted data: fix k - 2 numbers with loops, then one two-pointer sweep. Cost O(nᵏ⁻¹).",
    "Dedupe by skipping a value equal to its **left** neighbor, at every level and for partners after a hit.",
    "The same sweep handles exact hits, closest sums, and counting pairs.",
  ],
};
