import type { Lesson } from '../types';

// Lesson 1 of module 3: opposite ends on sorted data.
export const oppositeEnds: Lesson = {
  id: 'opposite-ends',
  title: 'Opposite ends on sorted data',
  summary: 'Start at both ends, drop the end that cannot be in the answer, meet in the middle.',
  minutes: 22,
  blocks: [
    {
      kind: 'callout',
      tone: 'story',
      title: 'Spend the gift card exactly',
      text: "Your aunt gives you a 35 dollar gift card for a game store. You want exactly two games, and you want to use every cent, because the card never gives change. The store app already lists prices from cheapest to most expensive.",
    },
    {
      kind: 'text',
      text: "**The problem.** Prices are `[2, 7, 11, 15, 24, 31, 40]` and the card is worth `35`. Find the two positions whose prices add up to exactly 35. (Spoiler: 11 + 24.)",
    },
    {
      kind: 'text',
      text: "**Brute force first.** Try every pair. Pick a first game, then try every game after it as the second.",
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Brute force: every pair',
      code: `function twoSumSorted(a, target):
    for i from 0 to n - 2:
        for j from i + 1 to n - 1:
            if a[i] + a[j] = target:
                return [i, j]
    return []`,
    },
    {
      kind: 'text',
      text: "It works. But there are about n²/2 pairs, so it is **O(n²)**. For 7 games that is 21 checks. For a store with 100,000 items it is about 5 billion checks.",
    },
    {
      kind: 'text',
      text: "**Spot the waste.** Look at the first check: cheapest + most expensive = 2 + 40 = 42. Too much. Now think about 40. Its best possible partner is the cheapest game, 2, and even that is over budget. So 40 cannot be in *any* answer. Brute force would still try 40 with 7, 11, 15 and the rest. One check already ruled out a whole row of pairs, and brute force ignores it.",
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'Each check removes one item forever',
      text: "Put one finger (`L`, left) on the cheapest item and one (`R`, right) on the most expensive. If the sum is **too big**, `R` is too pricey even with the cheapest item left, so drop it: move `R` left. If the sum is **too small**, `L` is too cheap even with the priciest item left, so drop it: move `L` right. Every step throws one item away for good, so you finish in at most n steps.",
    },
    {
      kind: 'steps',
      title: 'Two pointers on [2, 7, 11, 15, 24, 31, 40], target 35',
      frames: [
        {
          cells: [2, 7, 11, 15, 24, 31, 40],
          pointers: { L: 0, R: 6 },
          active: [0, 6],
          vars: { target: 35 },
          note: "Start with `L` on the cheapest game and `R` on the most expensive one.",
        },
        {
          cells: [2, 7, 11, 15, 24, 31, 40],
          pointers: { L: 0, R: 6 },
          active: [0, 6],
          vars: { sum: 42, target: 35 },
          note: "2 + 40 = 42, too big. 40 is over budget even with the cheapest game, so drop it: `R` moves left.",
        },
        {
          cells: [2, 7, 11, 15, 24, 31, 40],
          pointers: { L: 0, R: 5 },
          active: [0, 5],
          done: [6],
          vars: { sum: 33, target: 35 },
          note: "2 + 31 = 33, too small. 2 is too cheap even with the priciest game left, so drop it: `L` moves right.",
        },
        {
          cells: [2, 7, 11, 15, 24, 31, 40],
          pointers: { L: 1, R: 5 },
          active: [1, 5],
          done: [0, 6],
          vars: { sum: 38, target: 35 },
          note: "7 + 31 = 38, too big. Drop 31: `R` moves left.",
        },
        {
          cells: [2, 7, 11, 15, 24, 31, 40],
          pointers: { L: 1, R: 4 },
          active: [1, 4],
          done: [0, 5, 6],
          vars: { sum: 31, target: 35 },
          note: "7 + 24 = 31, too small. Drop 7: `L` moves right.",
        },
        {
          cells: [2, 7, 11, 15, 24, 31, 40],
          pointers: { L: 2, R: 4 },
          found: [2, 4],
          done: [0, 1, 5, 6],
          vars: { sum: 35, target: 35 },
          note: "11 + 24 = 35. Found it in 5 checks instead of up to 21.",
        },
      ],
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Two pointers',
      code: `function twoSumSorted(a, target):
    L ← 0
    R ← n - 1
    while L < R:
        sum ← a[L] + a[R]
        if sum = target:
            return [L, R]
        if sum > target:
            R ← R - 1              // a[R] is too big for everyone left
        else:
            L ← L + 1              // a[L] is too small for everyone left
    return []`,
    },
    {
      kind: 'code',
      lang: 'js',
      code: `function twoSumSorted(nums, target) {
  let left = 0;
  let right = nums.length - 1;
  while (left < right) {
    const sum = nums[left] + nums[right];
    if (sum === target) return [left, right];
    if (sum > target) right--;
    else left++;
  }
  return [];
}`,
    },
    {
      kind: 'compare',
      title: 'Pair that sums to target, sorted input',
      rows: [
        { approach: 'Every pair', time: 'O(n²)', space: 'O(1)', note: 'Simple. Too slow past a few thousand items.' },
        {
          approach: 'Hash map of seen values',
          time: 'O(n)',
          space: 'O(n)',
          note: "Module 2's Two Sum. Works even on unsorted data, but ignores the sorting and pays for memory.",
        },
        {
          approach: 'Two pointers',
          time: 'O(n)',
          space: 'O(1)',
          note: 'Uses the sorted order to drop one item per step. No extra memory.',
        },
      ],
    },
    {
      kind: 'text',
      text: "The same move works far beyond sums. In every problem in this lesson you ask one question per step: **which end can no longer be part of a better answer?** Drop that end. In Container With Most Water it is the shorter wall. In Boats to Save People it is the heaviest person. In Trapping Rain Water it is the side with the lower wall.",
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Template: opposite ends',
      code: `L ← 0
R ← n - 1
while L < R:
    look at a[L] and a[R]
    if they form an answer: record it (or return)
    if L can't help any more: L ← L + 1
    else: R ← R - 1`,
    },
    {
      kind: 'list',
      items: [
        "The input is **sorted**, or you are allowed to sort it.",
        "The task talks about **pairs**: two items that sum to, fit in, or beat something.",
        "The answer depends on the two ends: widest, heaviest + lightest, biggest + smallest.",
        "You are asked for O(1) extra space where a hash map would be the obvious tool.",
      ],
    },
    {
      kind: 'callout',
      tone: 'trap',
      title: 'L < R, not L ≤ R',
      text: "With `while L ≤ R`, the last step has `L = R` and you add a single item to *itself*. For target 10 and a lone 5, you would wrongly return a pair. (Boats to Save People is the exception: there `L = R` is one last person who still needs a raft, so it loops while `L ≤ R`.) Also: the drop rule only holds on **sorted** data. If the input is not sorted, sort it first, and remember that sorting loses the original indexes.",
    },
  ],
  problems: [
    {
      id: 'two-pointers-two-sum-sorted',
      title: 'Two Sum on a Sorted List',
      difficulty: 'medium',
      leetcode: 167,
      pattern: 'Two pointers (opposite ends)',
      statement:
        "A store lists game prices from cheapest to most expensive (`numbers`, sorted, may repeat). You have a gift card worth `target`. Return the positions of the two games that add up to exactly `target`, as `[i, j]` with `i < j`. Positions are **1-based** here (the first game is position 1), just like on LeetCode. There is always exactly one answer, and you cannot use the same game twice. Use only O(1) extra memory.",
      examples: [
        {
          input: 'numbers = [2, 7, 11, 15, 24, 31, 40], target = 35',
          output: '[3, 5]',
          explain: "11 + 24 = 35. They sit at 0-based indexes 2 and 4, so 1-based positions 3 and 5.",
        },
        { input: 'numbers = [2, 7, 11, 15], target = 9', output: '[1, 2]' },
        { input: 'numbers = [-1, 0], target = -1', output: '[1, 2]' },
      ],
      constraints: [
        '2 ≤ n ≤ 3 · 10⁴',
        '-1000 ≤ numbers[i] ≤ 1000',
        'numbers is sorted in non-decreasing order',
        'exactly one answer exists',
      ],
      hints: [
        "The list is sorted. What do the first and last values tell you?",
        "Add the first and last values. If the sum is too big, can the last value be in the answer at all?",
        "Use `left = 0`, `right = n - 1`. Sum too big: `right--`. Too small: `left++`. Equal: return `[left + 1, right + 1]`.",
      ],
      approaches: [
        {
          name: 'Brute force: every pair',
          idea: "Try each game with every game after it. Correct, because it checks every possible pair, but that is n²/2 checks.",
          time: 'O(n²)',
          space: 'O(1)',
        },
        {
          name: 'Binary search for the partner',
          idea: "For each `numbers[i]`, the partner must be `target - numbers[i]`. Because the list is sorted you can binary search for it in the part after i (module 5 teaches binary search). Better, but still not linear.",
          time: 'O(n log n)',
          space: 'O(1)',
        },
        {
          name: 'Two pointers from both ends',
          idea: "If the current sum is too big, the right value is too big even with the smallest value left, so it can never be in the answer: drop it. If too small, the left value is too small even with the largest value left: drop it. Each step removes one value, so at most n steps.",
          pseudo: `function twoSumSorted(numbers, target):
    L ← 0
    R ← n - 1
    while L < R:
        sum ← numbers[L] + numbers[R]
        if sum = target:
            return [L + 1, R + 1]      // 1-based
        if sum > target:
            R ← R - 1
        else:
            L ← L + 1
    return []`,
          code: `function twoSumSorted(numbers, target) {
  let left = 0;
  let right = numbers.length - 1;
  while (left < right) {
    const sum = numbers[left] + numbers[right];
    if (sum === target) return [left + 1, right + 1];
    if (sum > target) right--;
    else left++;
  }
  return [];
}`,
          time: 'O(n)',
          space: 'O(1)',
        },
      ],
      fn: 'twoSumSorted',
      starter: `function twoSumSorted(numbers, target) {
  // return [i, j] (1-based) where numbers[i] + numbers[j] === target
  return [];
}`,
      solution: `function twoSumSorted(numbers, target) {
  let left = 0;
  let right = numbers.length - 1;
  while (left < right) {
    const sum = numbers[left] + numbers[right];
    if (sum === target) return [left + 1, right + 1];
    if (sum > target) right--;
    else left++;
  }
  return [];
}`,
      tests: [
        { name: 'gift card example', args: [[2, 7, 11, 15, 24, 31, 40], 35], expected: [3, 5] },
        { name: 'first two', args: [[2, 7, 11, 15], 9], expected: [1, 2] },
        { name: 'first and last', args: [[1, 2, 4, 7, 9], 10], expected: [1, 5] },
        { name: 'negatives', args: [[-5, -3, 0, 2, 8], -8], expected: [1, 2] },
        { name: 'only two items', args: [[-1, 0], -1], expected: [1, 2] },
        { name: 'duplicates', args: [[0, 0, 3, 4], 0], expected: [1, 2] },
        { name: 'equal pair in the middle', args: [[1, 2, 3, 4, 4, 9, 56, 90], 8], expected: [4, 5] },
        { name: 'last two', args: [[5, 25, 75], 100], expected: [2, 3] },
      ],
      takeaway: "On sorted data, a pair sum that is too big or too small tells you exactly which end to drop.",
    },
    {
      id: 'two-pointers-sorted-squares',
      title: 'Sorted Squares',
      difficulty: 'easy',
      leetcode: 977,
      pattern: 'Two pointers (opposite ends)',
      statement:
        "A thermostat logs how far each reading was from the goal temperature, as signed numbers sorted from lowest to highest, like `[-4, -1, 0, 3, 10]`. The dashboard wants the **squared** errors, also sorted. Return a new array with the square of every number, in ascending order. Aim for O(n).",
      examples: [
        { input: 'nums = [-4, -1, 0, 3, 10]', output: '[0, 1, 9, 16, 100]' },
        {
          input: 'nums = [-7, -3, 2, 3, 11]',
          output: '[4, 9, 9, 49, 121]',
          explain: "Squaring makes -7 bigger than 3, so the order changes. The biggest squares come from the two ends.",
        },
      ],
      constraints: ['1 ≤ n ≤ 10⁴', '-10⁴ ≤ nums[i] ≤ 10⁴', 'nums is sorted in non-decreasing order'],
      hints: [
        "Negative numbers become big when squared. Where in the input are the biggest squares?",
        "The biggest square is always at one of the two ends: the most negative or the most positive number.",
        "Compare the squares at `left` and `right`. Put the bigger one at the **end** of the result, move that pointer inward, and fill the result from the back.",
      ],
      approaches: [
        {
          name: 'Square, then sort',
          idea: "Square every number, then sort the result with a number comparator. Correct and short, but sorting costs n log n and ignores that the input was already sorted.",
          time: 'O(n log n)',
          space: 'O(n)',
        },
        {
          name: 'Two pointers, fill from the back',
          idea: "The largest remaining square is always at the left end or the right end. So pick the bigger of the two, write it into the last free slot of the result, and drop that end. You place one number per step.",
          pseudo: `function sortedSquares(nums):
    result ← array of size n
    L ← 0
    R ← n - 1
    for write from n - 1 down to 0:
        if nums[L]² > nums[R]²:
            result[write] ← nums[L]²
            L ← L + 1
        else:
            result[write] ← nums[R]²
            R ← R - 1
    return result`,
          code: `function sortedSquares(nums) {
  const n = nums.length;
  const result = new Array(n);
  let left = 0;
  let right = n - 1;
  for (let write = n - 1; write >= 0; write--) {
    const a = nums[left] * nums[left];
    const b = nums[right] * nums[right];
    if (a > b) {
      result[write] = a;
      left++;
    } else {
      result[write] = b;
      right--;
    }
  }
  return result;
}`,
          time: 'O(n)',
          space: 'O(n) for the output',
        },
      ],
      fn: 'sortedSquares',
      starter: `function sortedSquares(nums) {
  // return the squares of nums in ascending order
  return [];
}`,
      solution: `function sortedSquares(nums) {
  const n = nums.length;
  const result = new Array(n);
  let left = 0;
  let right = n - 1;
  for (let write = n - 1; write >= 0; write--) {
    const a = nums[left] * nums[left];
    const b = nums[right] * nums[right];
    if (a > b) {
      result[write] = a;
      left++;
    } else {
      result[write] = b;
      right--;
    }
  }
  return result;
}`,
      tests: [
        { name: 'mixed signs', args: [[-4, -1, 0, 3, 10]], expected: [0, 1, 9, 16, 100] },
        { name: 'equal squares', args: [[-7, -3, 2, 3, 11]], expected: [4, 9, 9, 49, 121] },
        { name: 'all negative', args: [[-5, -3, -2, -1]], expected: [1, 4, 9, 25] },
        { name: 'all positive', args: [[1, 2, 3]], expected: [1, 4, 9] },
        { name: 'single element', args: [[-3]], expected: [9] },
        { name: 'duplicates and zero', args: [[-2, -2, 0, 2]], expected: [0, 4, 4, 4] },
      ],
      takeaway: "When the biggest values live at the two ends, fill the answer from the back.",
    },
    {
      id: 'two-pointers-container-most-water',
      title: 'Container With Most Water',
      difficulty: 'medium',
      leetcode: 11,
      pattern: 'Two pointers (opposite ends)',
      statement:
        "A row of walls stands 1 meter apart, like fence posts. `height[i]` is the height of wall i. Pick two walls: with the ground they make a tank. The tank holds `min(height[i], height[j]) × (j - i)` units of water, because the shorter wall decides how high the water can rise. Return the most water any tank can hold.",
      examples: [
        {
          input: 'height = [1, 8, 6, 2, 5, 4, 8, 3, 7]',
          output: '49',
          explain: "Walls at index 1 (height 8) and index 8 (height 7): min(8, 7) × (8 - 1) = 7 × 7 = 49.",
        },
        { input: 'height = [1, 1]', output: '1' },
      ],
      constraints: ['2 ≤ n ≤ 10⁵', '0 ≤ height[i] ≤ 10⁴'],
      hints: [
        "Start with the widest tank: the first and the last wall.",
        "When you move a pointer inward, the width shrinks by 1. The only way to get more water is a taller limiting wall.",
        "Moving the taller wall can never help: the shorter wall still caps the height and the width only shrinks. So always move the **shorter** wall.",
      ],
      approaches: [
        {
          name: 'Brute force: every pair of walls',
          idea: "Compute the water for every pair and keep the best. Correct, but n²/2 pairs is too slow for 10⁵ walls.",
          time: 'O(n²)',
          space: 'O(1)',
        },
        {
          name: 'Two pointers, move the shorter wall',
          idea: "Start widest. The shorter wall is the limit. Any other tank that uses it would be narrower and still capped by that same short wall, so it can never beat the tank you just measured. That wall is used up: drop it and move inward.",
          pseudo: `function maxArea(height):
    L ← 0
    R ← n - 1
    best ← 0
    while L < R:
        water ← min(height[L], height[R]) × (R - L)
        best ← max(best, water)
        if height[L] < height[R]:
            L ← L + 1              // the left wall is the limit
        else:
            R ← R - 1
    return best`,
          code: `function maxArea(height) {
  let left = 0;
  let right = height.length - 1;
  let best = 0;
  while (left < right) {
    const water = Math.min(height[left], height[right]) * (right - left);
    best = Math.max(best, water);
    if (height[left] < height[right]) left++;
    else right--;
  }
  return best;
}`,
          time: 'O(n)',
          space: 'O(1)',
        },
      ],
      fn: 'maxArea',
      starter: `function maxArea(height) {
  // return the most water two walls can hold
  return 0;
}`,
      solution: `function maxArea(height) {
  let left = 0;
  let right = height.length - 1;
  let best = 0;
  while (left < right) {
    const water = Math.min(height[left], height[right]) * (right - left);
    best = Math.max(best, water);
    if (height[left] < height[right]) left++;
    else right--;
  }
  return best;
}`,
      tests: [
        { name: 'classic', args: [[1, 8, 6, 2, 5, 4, 8, 3, 7]], expected: 49 },
        { name: 'two walls', args: [[1, 1]], expected: 1 },
        { name: 'tall ends', args: [[4, 3, 2, 1, 4]], expected: 16 },
        { name: 'small peak', args: [[1, 2, 1]], expected: 2 },
        { name: 'increasing', args: [[1, 2, 3, 4, 5]], expected: 6 },
        { name: 'best pair inside', args: [[2, 3, 4, 5, 18, 17, 6]], expected: 17 },
        { name: 'all zero', args: [[0, 0, 0]], expected: 0 },
        { name: 'wide and tall', args: [[10, 1, 1, 1, 10]], expected: 40 },
      ],
      takeaway: "Move the pointer that is limiting the answer; moving the other one can only make things worse.",
    },
    {
      id: 'two-pointers-boats',
      title: 'Boats to Save People',
      difficulty: 'medium',
      leetcode: 881,
      pattern: 'Two pointers (sort + opposite ends)',
      statement:
        "A flood rescue team has as many rafts as it needs. Each raft carries **at most two people** and at most `limit` kilograms in total. `people[i]` is the weight of person i, and nobody weighs more than `limit`. Return the fewest rafts needed to carry everyone. You may reorder (sort) `people`.",
      examples: [
        { input: 'people = [3, 2, 2, 1], limit = 3', output: '3', explain: "Rafts: (1, 2), (2), (3)." },
        { input: 'people = [3, 5, 3, 4], limit = 5', output: '4', explain: "No two people fit together, so everyone rides alone." },
        { input: 'people = [1, 2], limit = 3', output: '1' },
      ],
      constraints: ['1 ≤ n ≤ 5 · 10⁴', '1 ≤ people[i] ≤ limit ≤ 3 · 10⁴'],
      hints: [
        "Who is the hardest person to place? The heaviest one.",
        "The heaviest person can only share with someone light. Who is the best partner to try?",
        "Sort. Put the heaviest person (`right`) on a raft. If the lightest (`left`) also fits, take them too and move `left`. Always move `right` and count one raft.",
      ],
      approaches: [
        {
          name: 'Sort, then search for the best partner',
          idea: "Sort. For the heaviest person not yet placed, scan for the heaviest unplaced person who still fits with them, and mark both as used. Correct, but each scan is O(n).",
          time: 'O(n²)',
          space: 'O(n)',
        },
        {
          name: 'Sort + two pointers',
          idea: "The heaviest person needs a raft no matter what. If even the lightest person cannot fit with them, nobody can, so they ride alone. If the lightest fits, taking them is never a mistake: anyone else would be at least as heavy and harder to place later.",
          pseudo: `function numRescueBoats(people, limit):
    sort people ascending
    L ← 0
    R ← n - 1
    rafts ← 0
    while L ≤ R:                      // L = R: one person left
        if people[L] + people[R] ≤ limit:
            L ← L + 1                 // lightest rides along
        R ← R - 1                     // heaviest always leaves
        rafts ← rafts + 1
    return rafts`,
          code: `function numRescueBoats(people, limit) {
  people.sort((a, b) => a - b);
  let left = 0;
  let right = people.length - 1;
  let rafts = 0;
  while (left <= right) {
    if (people[left] + people[right] <= limit) left++;
    right--;
    rafts++;
  }
  return rafts;
}`,
          time: 'O(n log n) for the sort',
          space: 'O(1) extra (plus the sort)',
        },
      ],
      fn: 'numRescueBoats',
      starter: `function numRescueBoats(people, limit) {
  // return the fewest rafts (max 2 people, max limit kg each)
  return 0;
}`,
      solution: `function numRescueBoats(people, limit) {
  people.sort((a, b) => a - b);
  let left = 0;
  let right = people.length - 1;
  let rafts = 0;
  while (left <= right) {
    if (people[left] + people[right] <= limit) left++;
    right--;
    rafts++;
  }
  return rafts;
}`,
      tests: [
        { name: 'one raft', args: [[1, 2], 3], expected: 1 },
        { name: 'mixed', args: [[3, 2, 2, 1], 3], expected: 3 },
        { name: 'nobody pairs', args: [[3, 5, 3, 4], 5], expected: 4 },
        { name: 'everyone pairs', args: [[5, 1, 4, 2], 6], expected: 2 },
        { name: 'single person', args: [[2], 3], expected: 1 },
        { name: 'all same, pairs fit', args: [[1, 1, 1, 1], 2], expected: 2 },
        { name: 'odd count', args: [[2, 2, 2], 4], expected: 2 },
        { name: 'unsorted input', args: [[3, 8, 7, 1, 4], 9], expected: 3 },
      ],
      takeaway: "Sort, then pair the hardest item with the easiest one that still works.",
    },
    {
      id: 'two-pointers-trapping-rain-water',
      title: 'Trapping Rain Water (stretch)',
      difficulty: 'hard',
      leetcode: 42,
      pattern: 'Two pointers (opposite ends)',
      statement:
        "**Stretch problem (hard).** After a storm, rain fills the dips between buildings on a city block. `height[i]` is the height of the building at position i, and each building is 1 unit wide. Return how many units of water stay trapped. Key fact: the water above position i rises to `min(tallest on its left, tallest on its right)`, minus the building itself.",
      examples: [
        {
          input: 'height = [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]',
          output: '6',
          explain: "Position 5 (height 0) has walls 2 on the left and 3 on the right, so water stands min(2, 3) - 0 = 2 high there. Adding every position gives 6.",
        },
        { input: 'height = [4, 2, 0, 3, 2, 5]', output: '9' },
      ],
      constraints: ['0 ≤ n ≤ 2 · 10⁴', '0 ≤ height[i] ≤ 10⁵'],
      hints: [
        "Think about one position at a time. How high can the water stand above it?",
        "Water at i = min(tallest on the left, tallest on the right) - height[i]. Two extra arrays (best-from-left, best-from-right) give O(n) time.",
        "To drop the arrays, keep `leftMax` and `rightMax` while two pointers walk inward. Whichever side has the **smaller** max is safe to settle now: its water level is that smaller max.",
      ],
      approaches: [
        {
          name: 'For each position, scan both sides',
          idea: "For every i, walk left to find the tallest wall, walk right to find the tallest wall, and add `min(leftTallest, rightTallest) - height[i]`. Correct, but each position rescans the array.",
          time: 'O(n²)',
          space: 'O(1)',
        },
        {
          name: 'Precompute max-from-left and max-from-right',
          idea: "Build `leftMax[i]` (tallest at or before i) in one pass and `rightMax[i]` (tallest at or after i) in another. Then each position's water is a quick lookup.",
          time: 'O(n)',
          space: 'O(n)',
        },
        {
          name: 'Two pointers with running maxes',
          idea: "If `leftMax < rightMax`, the left position's water is capped by `leftMax`: you already know something at least `rightMax` tall stands on the right. So settle the left position and move inward. Otherwise settle the right one the same way.",
          pseudo: `function trap(height):
    L ← 0
    R ← n - 1
    leftMax ← 0
    rightMax ← 0
    water ← 0
    while L < R:
        leftMax ← max(leftMax, height[L])
        rightMax ← max(rightMax, height[R])
        if leftMax < rightMax:
            water ← water + leftMax - height[L]
            L ← L + 1
        else:
            water ← water + rightMax - height[R]
            R ← R - 1
    return water`,
          code: `function trap(height) {
  let left = 0;
  let right = height.length - 1;
  let leftMax = 0;
  let rightMax = 0;
  let water = 0;
  while (left < right) {
    leftMax = Math.max(leftMax, height[left]);
    rightMax = Math.max(rightMax, height[right]);
    if (leftMax < rightMax) {
      water += leftMax - height[left];
      left++;
    } else {
      water += rightMax - height[right];
      right--;
    }
  }
  return water;
}`,
          time: 'O(n)',
          space: 'O(1)',
        },
      ],
      fn: 'trap',
      starter: `function trap(height) {
  // return the total units of trapped water
  return 0;
}`,
      solution: `function trap(height) {
  let left = 0;
  let right = height.length - 1;
  let leftMax = 0;
  let rightMax = 0;
  let water = 0;
  while (left < right) {
    leftMax = Math.max(leftMax, height[left]);
    rightMax = Math.max(rightMax, height[right]);
    if (leftMax < rightMax) {
      water += leftMax - height[left];
      left++;
    } else {
      water += rightMax - height[right];
      right--;
    }
  }
  return water;
}`,
      tests: [
        { name: 'classic', args: [[0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]], expected: 6 },
        { name: 'deep pit', args: [[4, 2, 0, 3, 2, 5]], expected: 9 },
        { name: 'empty', args: [[]], expected: 0 },
        { name: 'single building', args: [[5]], expected: 0 },
        { name: 'rising, no dips', args: [[1, 2, 3]], expected: 0 },
        { name: 'one bowl', args: [[3, 0, 3]], expected: 3 },
        { name: 'falling then small bump', args: [[5, 4, 1, 2]], expected: 1 },
        { name: 'two bowls', args: [[2, 0, 2, 0, 2]], expected: 4 },
      ],
      takeaway: "Settle the side whose limit you already know for sure; the smaller running max is that side.",
    },
  ],
  quiz: [
    {
      prompt: "Target 18. `L` points at 3, `R` points at 20 in a sorted array. The sum is 23. What do you do?",
      options: ['Move `L` right', 'Move `R` left', 'Move both', 'Stop: no answer exists'],
      answer: 1,
      explanation: "23 is too big. 20 is too big even with the smallest value left (3), so 20 can never be in the answer. Drop it by moving `R` left.",
    },
    {
      prompt: 'Why does two pointers on sorted data never miss the answer?',
      options: [
        'Each move proves the dropped item cannot be in any remaining answer',
        'It secretly checks every pair',
        'The answer is always near the middle',
        'Sorting removes duplicates',
      ],
      answer: 0,
      explanation: "A too-big sum means the right item fails even with the smallest partner left, and a too-small sum means the left item fails even with the largest. So nothing you drop could have been part of an answer.",
    },
    {
      prompt: "Container With Most Water: the left wall is 5 tall, the right wall is 9 tall. Which pointer moves?",
      options: ['The right one (taller)', 'The left one (shorter)', 'Both', 'Neither, stop here'],
      answer: 1,
      explanation: "The 5-tall wall caps the water. Any tank that keeps it is narrower and still capped at 5, so it can never do better. Drop it.",
    },
  ],
  takeaways: [
    "Two pointers from both ends turn an O(n²) pair search into O(n) on sorted data.",
    "Each step, ask: which end can no longer be part of a better answer? Drop it.",
    "Use `while L < R` for pairs of different items. Sort first if the input is not sorted.",
  ],
};
