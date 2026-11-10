import type { Lesson } from '../types';

// Lesson 4 of module 3: partitioning and the Dutch national flag.
export const partitioning: Lesson = {
  id: 'partitioning',
  title: 'Partitioning (Dutch flag)',
  summary: 'Split an array into zones in one pass by swapping items to the zone borders.',
  minutes: 20,
  blocks: [
    {
      kind: 'callout',
      tone: 'story',
      title: 'Sorting the laundry',
      text: "Before a wash you split clothes into whites, colors and darks. You don't spread three piles over the floor: you work on one shelf with exactly enough room, grab one item, and swap it into the right zone. The computer scientist Edsger Dijkstra called this the **Dutch national flag** problem, after the flag's three stripes.",
    },
    {
      kind: 'text',
      text: "**The problem.** `nums` holds only `0` (white), `1` (color) and `2` (dark). Rearrange it **in place** so all 0s come first, then 1s, then 2s. Example: `[2, 0, 2, 1, 1, 0]` becomes `[0, 0, 1, 1, 2, 2]`. Goal: one pass, O(1) extra memory.",
    },
    {
      kind: 'text',
      text: "**Brute force first.** Calling `sort` works in O(n log n). A smarter honest option: count how many 0s, 1s and 2s there are, then overwrite the array.",
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Counting, then overwriting',
      code: `function sortColors(a):
    count ← [0, 0, 0]
    for each x in a:
        count[x] ← count[x] + 1
    i ← 0
    for color from 0 to 2:
        repeat count[color] times:
            a[i] ← color
            i ← i + 1`,
    },
    {
      kind: 'text',
      text: "**Spot the waste.** Counting is O(n) and fine for plain numbers. But it walks the array **twice**, and it *rewrites* values instead of moving items. That breaks once items carry data: support tickets tagged urgent / normal / low, or shirts that each have an owner. You can't \"write a 0\". You have to move the actual ticket.",
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'Three zones that grow as you scan',
      text: "Keep 0s at the front, 2s at the back, 1s in the middle. Three pointers mark the borders: `low` is the next spot for a 0, `mid` is the item you are looking at, `high` is the next spot for a 2. Look at `a[mid]`: a **0** swaps to `low`, a **2** swaps to `high`, a **1** is already in the right zone. One pass, swaps only.",
    },
    {
      kind: 'diagram',
      title: 'The four zones at any moment',
      art: `index: 0  1  2  3  4  5  6  7  8
 a:    0  0  1  1  ?  ?  ?  2  2
             ^     ^     ^
            low   mid   high

 a[0 .. low-1]      all 0s
 a[low .. mid-1]    all 1s
 a[mid .. high]     not checked yet
 a[high+1 .. n-1]   all 2s`,
      caption: "Every step shrinks the unchecked zone `[mid .. high]` by one. When it is empty, you are done.",
    },
    {
      kind: 'steps',
      title: 'Dutch flag on [2, 0, 2, 1, 1, 0]',
      frames: [
        {
          cells: [2, 0, 2, 1, 1, 0],
          pointers: { low: 0, mid: 0, high: 5 },
          active: [0],
          note: "Everything is unchecked. `a[mid]` is 2, so it belongs at the back.",
        },
        {
          cells: [0, 0, 2, 1, 1, 2],
          pointers: { low: 0, mid: 0, high: 4 },
          active: [0],
          done: [5],
          note: "Swapped `a[0]` with `a[5]`, then `high` moves to 4. `mid` stays: the 0 that arrived hasn't been checked yet.",
        },
        {
          cells: [0, 0, 2, 1, 1, 2],
          pointers: { low: 1, mid: 1, high: 4 },
          active: [1],
          done: [0, 5],
          note: "`a[mid]` is 0: swap with `low` (same cell here), then move both `low` and `mid`.",
        },
        {
          cells: [0, 0, 2, 1, 1, 2],
          pointers: { low: 2, mid: 2, high: 4 },
          active: [2],
          done: [0, 1, 5],
          note: "0 again: swap with `low`, move `low` and `mid`. Now `a[mid]` is 2.",
        },
        {
          cells: [0, 0, 1, 1, 2, 2],
          pointers: { low: 2, mid: 2, high: 3 },
          active: [2],
          done: [0, 1, 4, 5],
          note: "Swapped the 2 with `a[high]` (a 1). `high` moves to 3, `mid` stays to check the 1 that arrived.",
        },
        {
          cells: [0, 0, 1, 1, 2, 2],
          pointers: { low: 2, mid: 3, high: 3 },
          active: [3],
          done: [0, 1, 2, 4, 5],
          note: "`a[mid]` is 1, already in the middle zone. Just move `mid`.",
        },
        {
          cells: [0, 0, 1, 1, 2, 2],
          pointers: { low: 2, mid: 4, high: 3 },
          found: [0, 1, 2, 3, 4, 5],
          note: "Another 1, `mid` moves to 4. Now `mid > high`: nothing unchecked is left. Sorted in one pass.",
        },
      ],
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Dutch national flag',
      code: `function sortColors(a):
    low ← 0
    mid ← 0
    high ← n - 1
    while mid ≤ high:
        if a[mid] = 0:
            swap a[low] and a[mid]
            low ← low + 1
            mid ← mid + 1
        else if a[mid] = 2:
            swap a[mid] and a[high]
            high ← high - 1          // don't move mid: new item unchecked
        else:
            mid ← mid + 1
    return a`,
    },
    {
      kind: 'code',
      lang: 'js',
      code: `function sortColors(nums) {
  let low = 0;
  let mid = 0;
  let high = nums.length - 1;
  while (mid <= high) {
    if (nums[mid] === 0) {
      [nums[low], nums[mid]] = [nums[mid], nums[low]];
      low++;
      mid++;
    } else if (nums[mid] === 2) {
      [nums[mid], nums[high]] = [nums[high], nums[mid]];
      high--;
    } else {
      mid++;
    }
  }
  return nums;
}`,
    },
    {
      kind: 'compare',
      title: 'Sort three kinds of items',
      rows: [
        { approach: 'Built-in sort', time: 'O(n log n)', space: 'O(log n) to O(n)', note: 'Works, but does more than needed.' },
        { approach: 'Count, then overwrite', time: 'O(n), two passes', space: 'O(1)', note: 'Fine for plain numbers. Fails when items carry data.' },
        { approach: 'Dutch flag (three pointers)', time: 'O(n), one pass', space: 'O(1)', note: 'Moves real items with swaps.' },
      ],
    },
    {
      kind: 'text',
      text: "**Two zones** is the easy version: evens before odds, or non-zeros before zeros (that was Move Zeroes). Use only `low` and `mid`. Need to keep the **original order** inside each zone? Swaps can't promise that, because a swap can jump an item past others. Then build a result array and fill it from both ends, as in Partition Around a Pivot below.",
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Template: three-way partition',
      code: `low ← 0
mid ← 0
high ← n - 1
while mid ≤ high:
    if a[mid] belongs in front:
        swap a[low] and a[mid]
        low ← low + 1
        mid ← mid + 1
    else if a[mid] belongs at the back:
        swap a[mid] and a[high]
        high ← high - 1
    else:
        mid ← mid + 1`,
    },
    {
      kind: 'list',
      items: [
        "Items fall into **two or three groups** (colors, signs, smaller / equal / bigger than a pivot).",
        "You must group them **in place**, or in **one pass**.",
        "The order inside a group doesn't matter. If it does, fill a new array from both ends instead.",
      ],
    },
    {
      kind: 'callout',
      tone: 'trap',
      title: "Don't move mid after a swap with high",
      text: "The item that comes back from `high` hasn't been checked yet. If you move `mid` past it, a 0 can get stuck in the middle. Try `[1, 2, 0]`: moving `mid` after the swap gives `[1, 0, 2]`. Also loop while `mid ≤ high`, not `mid < high`, or the last unchecked item is skipped.",
    },
  ],
  problems: [
    {
      id: 'two-pointers-sort-colors',
      title: 'Sort Colors',
      difficulty: 'medium',
      leetcode: 75,
      pattern: 'Two pointers (three-way partition)',
      statement:
        "Laundry day. `nums` holds only `0` (whites), `1` (colors) and `2` (darks). Rearrange it in place so all 0s come first, then all 1s, then all 2s. Don't use the built-in sort. Try for one pass with O(1) extra memory. Return `nums` after the change.",
      examples: [
        { input: 'nums = [2, 0, 2, 1, 1, 0]', output: '[0, 0, 1, 1, 2, 2]' },
        { input: 'nums = [2, 0, 1]', output: '[0, 1, 2]' },
      ],
      constraints: ['1 ≤ n ≤ 300', 'nums[i] is 0, 1 or 2'],
      hints: [
        "Counting the 0s, 1s and 2s, then overwriting, already works in two passes.",
        "For one pass, keep three zones: 0s in front, 2s at the back, unchecked items in between.",
        "Pointers `low`, `mid`, `high`. 0: swap with `low`, move `low` and `mid`. 2: swap with `high`, move only `high`. 1: move `mid`. Loop while `mid <= high`.",
      ],
      approaches: [
        {
          name: 'Count, then overwrite',
          idea: "Count each color, then write that many 0s, 1s and 2s back. Correct and O(n), but it takes two passes and only works because the items are plain numbers.",
          time: 'O(n)',
          space: 'O(1)',
        },
        {
          name: 'Dutch national flag',
          idea: "Keep the front zone all 0s and the back zone all 2s. Each step checks one unchecked item and either swaps it to a border or leaves it in the middle. After a swap with `high` you must check the incoming item, so `mid` stays.",
          pseudo: `function sortColors(nums):
    low ← 0
    mid ← 0
    high ← n - 1
    while mid ≤ high:
        if nums[mid] = 0:
            swap nums[low] and nums[mid]
            low ← low + 1
            mid ← mid + 1
        else if nums[mid] = 2:
            swap nums[mid] and nums[high]
            high ← high - 1
        else:
            mid ← mid + 1
    return nums`,
          code: `function sortColors(nums) {
  let low = 0;
  let mid = 0;
  let high = nums.length - 1;
  while (mid <= high) {
    if (nums[mid] === 0) {
      [nums[low], nums[mid]] = [nums[mid], nums[low]];
      low++;
      mid++;
    } else if (nums[mid] === 2) {
      [nums[mid], nums[high]] = [nums[high], nums[mid]];
      high--;
    } else {
      mid++;
    }
  }
  return nums;
}`,
          time: 'O(n)',
          space: 'O(1)',
        },
      ],
      fn: 'sortColors',
      starter: `function sortColors(nums) {
  // put 0s first, then 1s, then 2s, in place
  return nums;
}`,
      solution: `function sortColors(nums) {
  let low = 0;
  let mid = 0;
  let high = nums.length - 1;
  while (mid <= high) {
    if (nums[mid] === 0) {
      [nums[low], nums[mid]] = [nums[mid], nums[low]];
      low++;
      mid++;
    } else if (nums[mid] === 2) {
      [nums[mid], nums[high]] = [nums[high], nums[mid]];
      high--;
    } else {
      mid++;
    }
  }
  return nums;
}`,
      tests: [
        { name: 'classic', args: [[2, 0, 2, 1, 1, 0]], expected: [0, 0, 1, 1, 2, 2] },
        { name: 'three items', args: [[2, 0, 1]], expected: [0, 1, 2] },
        { name: 'mid-after-swap trap', args: [[1, 2, 0]], expected: [0, 1, 2] },
        { name: 'single', args: [[1]], expected: [1] },
        { name: 'all the same', args: [[2, 2, 2]], expected: [2, 2, 2] },
        { name: 'already sorted', args: [[0, 0, 1, 2]], expected: [0, 0, 1, 2] },
        { name: 'reversed', args: [[2, 2, 1, 1, 0, 0]], expected: [0, 0, 1, 1, 2, 2] },
        { name: 'no ones', args: [[2, 0, 2, 0]], expected: [0, 0, 2, 2] },
      ],
      takeaway: "Three pointers carve the array into fixed zones; only the unchecked middle shrinks.",
    },
    {
      id: 'two-pointers-partition-pivot',
      title: 'Partition Around a Pivot',
      difficulty: 'medium',
      leetcode: 2161,
      pattern: 'Two pointers (fill from both ends)',
      statement:
        "A delivery app sorts orders by due time around a cut-off `pivot`: orders due **before** the cut-off first, orders due **exactly at** it next, later orders last. Inside each group, orders must stay in the order they arrived. Given `nums` and `pivot`, return the new arrangement.",
      examples: [
        {
          input: 'nums = [9, 12, 5, 10, 14, 3, 10], pivot = 10',
          output: '[9, 5, 3, 10, 10, 12, 14]',
          explain: "Smaller: 9, 5, 3 (same order as before). Equal: 10, 10. Bigger: 12, 14.",
        },
        { input: 'nums = [-3, 4, 3, 2], pivot = 2', output: '[-3, 2, 4, 3]' },
      ],
      constraints: ['1 ≤ n ≤ 10⁵', '-10⁶ ≤ nums[i] ≤ 10⁶', 'pivot appears in nums'],
      hints: [
        "Order inside each group must stay the same, so in-place swaps (Dutch flag) won't work here.",
        "Three separate lists (smaller, equal, bigger) joined together is a fine O(n) answer.",
        "One pass, one result array: walk `i` from the front placing smaller values at `lo++`, and at the same time walk `j` from the back placing bigger values at `hi--`. The gap left in the middle is all pivots.",
      ],
      approaches: [
        {
          name: 'Stable sort by group',
          idea: "Give each value a group number (0 smaller, 1 equal, 2 bigger) and sort by it. JavaScript's sort is stable, so arrival order inside a group is kept. Correct but O(n log n).",
          time: 'O(n log n)',
          space: 'O(n)',
        },
        {
          name: 'Three lists',
          idea: "Walk once, pushing each value into `smaller`, `equal` or `bigger`, then join them. Simple and O(n), it just builds three extra arrays.",
          time: 'O(n)',
          space: 'O(n)',
        },
        {
          name: 'Fill one array from both ends',
          idea: "Smaller values belong at the front in arrival order, so scan from the front and fill from the front. Bigger values belong at the back in arrival order, so scan from the **back** and fill from the back. Both scans run in the same loop. Whatever is left in the middle is the pivot.",
          pseudo: `function partitionArray(nums, pivot):
    result ← array of size n, every cell = pivot
    lo ← 0
    hi ← n - 1
    for i from 0 to n - 1:
        j ← n - 1 - i                 // same step, from the back
        if nums[i] < pivot:
            result[lo] ← nums[i]
            lo ← lo + 1
        if nums[j] > pivot:
            result[hi] ← nums[j]
            hi ← hi - 1
    return result`,
          code: `function partitionArray(nums, pivot) {
  const n = nums.length;
  const result = new Array(n).fill(pivot);
  let lo = 0;
  let hi = n - 1;
  for (let i = 0; i < n; i++) {
    const j = n - 1 - i;
    if (nums[i] < pivot) {
      result[lo] = nums[i];
      lo++;
    }
    if (nums[j] > pivot) {
      result[hi] = nums[j];
      hi--;
    }
  }
  return result;
}`,
          time: 'O(n)',
          space: 'O(n) for the output',
        },
      ],
      fn: 'partitionArray',
      starter: `function partitionArray(nums, pivot) {
  // smaller first, then equal, then bigger; keep arrival order in each group
  return [];
}`,
      solution: `function partitionArray(nums, pivot) {
  const n = nums.length;
  const result = new Array(n).fill(pivot);
  let lo = 0;
  let hi = n - 1;
  for (let i = 0; i < n; i++) {
    const j = n - 1 - i;
    if (nums[i] < pivot) {
      result[lo] = nums[i];
      lo++;
    }
    if (nums[j] > pivot) {
      result[hi] = nums[j];
      hi--;
    }
  }
  return result;
}`,
      tests: [
        { name: 'classic', args: [[9, 12, 5, 10, 14, 3, 10], 10], expected: [9, 5, 3, 10, 10, 12, 14] },
        { name: 'negatives', args: [[-3, 4, 3, 2], 2], expected: [-3, 2, 4, 3] },
        { name: 'single', args: [[1], 1], expected: [1] },
        { name: 'all equal', args: [[7, 7, 7], 7], expected: [7, 7, 7] },
        { name: 'reverse order stays', args: [[5, 4, 3, 2, 1], 3], expected: [2, 1, 3, 5, 4] },
        { name: 'pivot at the front', args: [[1, 9, 0, 8, 1], 1], expected: [0, 1, 1, 9, 8] },
      ],
      takeaway: "Need a stable split? Fill from the front for one group and from the back for the other.",
    },
    {
      id: 'two-pointers-rearrange-by-sign',
      title: 'Alternate Positive and Negative',
      difficulty: 'medium',
      leetcode: 2149,
      pattern: 'Two pointers (two write pointers)',
      statement:
        "A debate show seats speakers alternately: *for*, *against*, *for*, *against*… `nums` has the same number of positive values (for) and negative values (against), and no zeros. Return a new array that starts with a positive value and then alternates signs, keeping the original order among the positives and among the negatives.",
      examples: [
        {
          input: 'nums = [3, 1, -2, -5, 2, -4]',
          output: '[3, -2, 1, -5, 2, -4]',
          explain: "Positives in order: 3, 1, 2. Negatives in order: -2, -5, -4. Interleave them.",
        },
        { input: 'nums = [-1, 1]', output: '[1, -1]' },
      ],
      constraints: ['2 ≤ n ≤ 2 · 10⁵, n is even', 'half the values are positive, half negative', 'no zeros'],
      hints: [
        "Where does the 1st positive go? The 2nd? The k-th?",
        "Positives go to indexes 0, 2, 4, …; negatives go to 1, 3, 5, ….",
        "Keep two write pointers, `pos = 0` and `neg = 1`. For each value, write it at its pointer and move that pointer by 2.",
      ],
      approaches: [
        {
          name: 'Split, then interleave',
          idea: "Copy positives into one list and negatives into another, then take one from each in turn. Correct and O(n), with two extra lists.",
          time: 'O(n)',
          space: 'O(n)',
        },
        {
          name: 'Two write pointers',
          idea: "You already know exactly where each kind goes: positives on even indexes, negatives on odd ones, in arrival order. So one pass with two write pointers places every value directly.",
          pseudo: `function rearrangeArray(nums):
    result ← array of size n
    pos ← 0
    neg ← 1
    for each x in nums:
        if x > 0:
            result[pos] ← x
            pos ← pos + 2
        else:
            result[neg] ← x
            neg ← neg + 2
    return result`,
          code: `function rearrangeArray(nums) {
  const result = new Array(nums.length);
  let pos = 0;
  let neg = 1;
  for (const x of nums) {
    if (x > 0) {
      result[pos] = x;
      pos += 2;
    } else {
      result[neg] = x;
      neg += 2;
    }
  }
  return result;
}`,
          time: 'O(n)',
          space: 'O(n) for the output',
        },
      ],
      fn: 'rearrangeArray',
      starter: `function rearrangeArray(nums) {
  // positive, negative, positive, ... keeping order within each sign
  return [];
}`,
      solution: `function rearrangeArray(nums) {
  const result = new Array(nums.length);
  let pos = 0;
  let neg = 1;
  for (const x of nums) {
    if (x > 0) {
      result[pos] = x;
      pos += 2;
    } else {
      result[neg] = x;
      neg += 2;
    }
  }
  return result;
}`,
      tests: [
        { name: 'classic', args: [[3, 1, -2, -5, 2, -4]], expected: [3, -2, 1, -5, 2, -4] },
        { name: 'negative first', args: [[-1, 1]], expected: [1, -1] },
        { name: 'already alternating', args: [[1, -1]], expected: [1, -1] },
        { name: 'negatives first', args: [[-1, -2, 3, 4]], expected: [3, -1, 4, -2] },
        { name: 'already in place', args: [[5, -5, 6, -6, 7, -7]], expected: [5, -5, 6, -6, 7, -7] },
        { name: 'repeated values', args: [[2, 2, -3, -3]], expected: [2, -3, 2, -3] },
      ],
      takeaway: "When you know each group's target slots, one write pointer per group places items directly.",
    },
  ],
  quiz: [
    {
      prompt: "Dutch flag: `a[mid]` is 2. You swap it with `a[high]` and do `high--`. Why does `mid` not move?",
      options: [
        'The item that just arrived at `mid` has not been checked yet',
        'Because `mid` must always equal `low`',
        'To make the loop run faster',
        'Because 2s belong in the middle',
      ],
      answer: 0,
      explanation: "The swap brought an unknown item from the unchecked zone. It could be a 0 that still needs to go to the front.",
    },
    {
      prompt: 'Counting 0s, 1s and 2s and overwriting is also O(n). When is the Dutch flag method the only good choice?',
      options: [
        'When items carry extra data and must be moved, not rewritten',
        'When the array is already sorted',
        'When the array has only one color',
        'Never, counting is always better',
      ],
      answer: 0,
      explanation: "Counting rebuilds values from scratch. Real records (tickets, users, shirts) have to be moved as whole items, which swapping does.",
    },
    {
      prompt: "Which loop condition is right for the Dutch flag?",
      options: ['`while mid ≤ high`', '`while mid < high`', '`while low < high`', '`while low ≤ mid`'],
      answer: 0,
      explanation: "`[mid .. high]` is the unchecked zone. When `mid = high` there is still one item to check.",
    },
  ],
  takeaways: [
    "Partitioning keeps zones at the edges and shrinks an unchecked middle, one swap at a time.",
    "Dutch flag: 0 swaps to `low` (move `low` and `mid`), 2 swaps to `high` (move only `high`), 1 just moves `mid`.",
    "Swaps break original order. If order must stay, fill a result array from both ends instead.",
  ],
};
