import type { Lesson } from '../types';

// Module 8, lesson 4: quickselect. Partition around a pivot, then keep only the side that holds the answer.
const lesson: Lesson = {
  id: 'quickselect',
  title: 'Quickselect: find the k-th without sorting',
  summary: 'Partition around a pivot, keep only the side that holds the answer: the k-th largest in O(n) on average.',
  minutes: 20,
  blocks: [
    {
      kind: 'callout',
      tone: 'story',
      title: 'The p95 number on every dashboard',
      text: 'Your team\'s dashboard says **p95 latency: 840 ms**. That means 95% of requests were faster than 840 ms. It is the 95th-percentile response time: line up every response time from fastest to slowest and read the one 95% of the way along. A housing site does the same for the **median house price** across a million listings, and a race app for the **3rd-fastest lap**. Each needs one value at one position. None of them needs the whole line.',
    },
    {
      kind: 'text',
      text: '**The problem.** Given `nums = [3, 2, 1, 5, 6, 4]` and `k = 2`, return the **k-th largest** value. Count down from the top: 6 is the 1st largest, 5 is the 2nd. So the answer is `5`. Repeats count separately: in `[5, 5, 4]` the 2nd largest is 5, not 4.',
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Brute force: sort, then read one slot',
      code: `function findKthLargest(nums, k):
    sort nums from small to big
    return nums[n - k]                  // k-th from the top`,
    },
    {
      kind: 'text',
      text: 'This works, and it is often fine in real life. It costs **O(n log n)**. **Spot the waste:** sorting puts *every* item in its exact place. You care about one place: index `n - k`. Whether 1 sits before 2 or 2 before 3 does not matter to you at all. It is like ranking every runner in a marathon just to find out who came 3rd.',
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'Partition, then keep only one side',
      text: '**Partition** means: pick one value, the **pivot**. Move every smaller value to its left and every bigger value to its right. Now the pivot sits at its **final sorted index**, even though both sides are still messy. Compare that index with the one you want. Equal? Done. Pivot index smaller than the one you want? The answer is on the right, so throw the left side away for good. Then repeat on the side you kept. That is **quickselect**.',
    },
    {
      kind: 'steps',
      title: '3rd largest of [6, 1, 8, 3, 9, 2, 5]: target index 7 − 3 = 4',
      frames: [
        {
          cells: [6, 1, 8, 3, 9, 2, 5],
          pointers: { i: 0, j: 0, pivot: 6 },
          active: [6],
          vars: { pivot: 5, target: 'index 4' },
          note: 'Pivot = the last value, 5. `i` is the next slot for a value smaller than the pivot. `j` scans from the left.',
        },
        {
          cells: [6, 1, 8, 3, 9, 2, 5],
          pointers: { i: 0, j: 0, pivot: 6 },
          active: [0],
          vars: { pivot: 5, target: 'index 4' },
          note: '`j = 0`: 6 is not smaller than 5. Leave it there and move `j` on.',
        },
        {
          cells: [1, 6, 8, 3, 9, 2, 5],
          pointers: { i: 1, j: 1, pivot: 6 },
          active: [0, 1],
          vars: { pivot: 5, target: 'index 4' },
          note: '`j = 1`: 1 is smaller. Swap it into slot `i = 0` (6 moves to index 1). Then `i` moves to 1.',
        },
        {
          cells: [1, 6, 8, 3, 9, 2, 5],
          pointers: { i: 1, j: 2, pivot: 6 },
          active: [2],
          vars: { pivot: 5, target: 'index 4' },
          note: '`j = 2`: 8 is bigger. Skip.',
        },
        {
          cells: [1, 3, 8, 6, 9, 2, 5],
          pointers: { i: 2, j: 3, pivot: 6 },
          active: [1, 3],
          vars: { pivot: 5, target: 'index 4' },
          note: '`j = 3`: 3 is smaller. Swap it with 6 in slot `i = 1`. Now `i = 2`.',
        },
        {
          cells: [1, 3, 2, 6, 9, 8, 5],
          pointers: { i: 3, j: 5, pivot: 6 },
          active: [2, 5],
          vars: { pivot: 5, target: 'index 4' },
          note: '`j = 4`: 9 is bigger, skip. `j = 5`: 2 is smaller. Swap it with 8 in slot `i = 2`. Now `i = 3`.',
        },
        {
          cells: [1, 3, 2, 5, 9, 8, 6],
          pointers: { i: 3 },
          active: [3, 6],
          vars: { 'pivot index': 3, target: 'index 4' },
          note: 'Scan done. Swap the pivot into slot `i`. Now 5 sits at index 3, its **final** spot: 3 smaller values on its left, 3 bigger on its right.',
        },
        {
          cells: [1, 3, 2, 5, 9, 8, 6],
          pointers: { lo: 4, hi: 6 },
          active: [4, 5, 6],
          done: [0, 1, 2, 3],
          vars: { 'pivot index': 3, target: 'index 4' },
          note: 'Target 4 is bigger than 3, so the answer is on the right. Indexes 0 to 3 are thrown away. You never look at them again.',
        },
        {
          cells: [1, 3, 2, 5, 6, 8, 9],
          pointers: { lo: 4, hi: 6 },
          found: [4],
          done: [0, 1, 2, 3],
          vars: { 'pivot index': 4, target: 'index 4' },
          note: 'Partition indexes 4 to 6 with pivot 6: nothing is smaller, so 6 swaps into index 4. That is the target. The 3rd largest is **6**.',
        },
      ],
    },
    {
      kind: 'diagram',
      title: 'How much each call looks at (n = 16)',
      art: `lucky pivots: the range halves each time
call 1  ################   16
call 2          ########    8
call 3          ####        4
call 4            ##        2
call 5             #        1
                  total =  31  (less than 2 × 16)

unlucky pivots: always the biggest value
call 1  ################   16
call 2  ###############    15
call 3  ##############     14
  ...                      ...
                  total = 136  (about 16² / 2)`,
      caption: 'Each call scans its whole range once, then keeps one part. The cost is the sum of the range sizes.',
    },
    {
      kind: 'text',
      text: '**The cost, with the lesson 2 lens (count the work per level).** Here there is only *one* call per level. If the pivot splits the range roughly in half, the work is `n + n/2 + n/4 + … ≈ 2n`, so **O(n)** on average. If the pivot is always the smallest or largest value, each call removes just one item: `n + (n − 1) + … ≈ n²/2`, so **O(n²)**. A "last item" pivot on already-sorted input does exactly that. The fix is a **random pivot**: no input order can fool it on purpose, and on average it lands near the middle. Quicksort, if you have heard of it, uses the same partition but recurses into **both** sides, so each level costs n and it totals O(n log n). Quickselect wins because it throws one side away.',
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Quickselect with a random pivot',
      code: `function findKthLargest(nums, k):
    return select(nums, 0, n - 1, n - k)   // k-th largest = index n - k

function select(a, lo, hi, target):
    if lo = hi:
        return a[lo]                    // one value left: it is the answer
    r ← random index from lo to hi
    swap a[r] and a[hi]                 // park the random pivot at the end
    mid ← partition(a, lo, hi)
    if mid = target:
        return a[mid]
    if target < mid:
        return select(a, lo, mid - 1, target)
    return select(a, mid + 1, hi, target)

function partition(a, lo, hi):          // pivot is a[hi]
    pivot ← a[hi]
    i ← lo                              // next slot for a small value
    for j from lo to hi - 1:
        if a[j] < pivot:
            swap a[i] and a[j]
            i ← i + 1
    swap a[i] and a[hi]                 // pivot to its final spot
    return i`,
    },
    {
      kind: 'code',
      lang: 'js',
      code: `function findKthLargest(nums, k) {
  const target = nums.length - k; // k-th largest = this index in sorted order
  let lo = 0;
  let hi = nums.length - 1;
  // The recursive call was the last step, so a loop does the same job
  // and can never overflow the call stack, even with very unlucky pivots.
  while (true) {
    const r = lo + Math.floor(Math.random() * (hi - lo + 1));
    [nums[r], nums[hi]] = [nums[hi], nums[r]]; // random pivot, parked at the end
    const mid = partition(nums, lo, hi);
    if (mid === target) return nums[mid];
    if (target < mid) hi = mid - 1;
    else lo = mid + 1;
  }
}

function partition(a, lo, hi) {
  const pivot = a[hi];
  let i = lo; // next slot for a value smaller than the pivot
  for (let j = lo; j < hi; j++) {
    if (a[j] < pivot) {
      [a[i], a[j]] = [a[j], a[i]];
      i++;
    }
  }
  [a[i], a[hi]] = [a[hi], a[i]];
  return i;
}`,
    },
    {
      kind: 'compare',
      title: 'Finding the k-th largest',
      rows: [
        { approach: 'Sort, read index n - k', time: 'O(n log n)', space: 'O(n)', note: 'Simple and correct. Puts all n values in order to read one.' },
        { approach: 'Min-heap of size k (module 12)', time: 'O(n log k)', space: 'O(k)', note: 'Great when values stream in and you cannot keep them all.' },
        { approach: 'Quickselect, last value as pivot', time: 'O(n) avg, O(n²) worst', space: 'O(1)', note: 'Sorted input makes every pivot the biggest value.' },
        { approach: 'Quickselect, random pivot', time: 'O(n) avg, O(n²) worst', space: 'O(1)', note: 'The worst case is so unlikely it never shows up in practice. Use this.' },
      ],
    },
    {
      kind: 'text',
      text: '**When to reach for quickselect.** The task asks for the k-th largest or k-th smallest, the median, a percentile, or "the k closest / k biggest in any order". You need **one position**, not the full order. And you are allowed to reorder the array (or copy it). If the values arrive one at a time and never stop, use a heap instead (module 12).',
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Template: select the value at sorted index target',
      code: `function select(a, target):             // target = index in sorted order
    lo ← 0
    hi ← n - 1
    while true:
        pick a random pivot from a[lo..hi]
        mid ← partition a[lo..hi] around it  // pivot lands at a[mid]
        if mid = target: return a[mid]
        if target < mid: hi ← mid - 1       // keep the left side
        else: lo ← mid + 1                  // keep the right side`,
    },
    {
      kind: 'callout',
      tone: 'trap',
      title: 'Lots of equal values make it slow',
      text: 'Try `[2, 2, 2, 2, 2, 2]`. With "smaller goes left", nothing is smaller than the pivot 2, so the pivot lands at the far left every time. Each call removes one item: **O(n²)**, random pivot or not. The fix is a **three-way partition**: three groups, *less than*, *equal to*, and *greater than* the pivot. If the target index falls inside the equal group, you are done. On all-equal input that takes one pass. It is the Dutch national flag idea from module 3.',
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Quickselect with a three-way partition',
      code: `function select(a, target):
    lo ← 0
    hi ← n - 1
    while true:
        pivot ← a[random index from lo to hi]
        lt ← lo                         // a[lo..lt-1]  < pivot
        i ← lo                          // a[lt..i-1]   = pivot
        gt ← hi                         // a[gt+1..hi]  > pivot
        while i ≤ gt:
            if a[i] < pivot:
                swap a[lt] and a[i]
                lt ← lt + 1
                i ← i + 1
            else if a[i] > pivot:
                swap a[i] and a[gt]
                gt ← gt - 1             // do not move i: check the new a[i]
            else:
                i ← i + 1
        if target < lt: hi ← lt - 1
        else if target > gt: lo ← gt + 1
        else: return pivot              // target is among the equals`,
    },
    {
      kind: 'callout',
      tone: 'trap',
      title: 'k-th largest is index n - k, not k',
      text: 'Partition sorts small to big, so the **k-th largest** sits at index `n - k`. With `n = 6, k = 2` that is index 4. Writing `k`, `k - 1` or `n - k - 1` gives the wrong value with no error. Check it on `k = 1`: the 1st largest is the maximum, at index `n - 1`. Second trap: quickselect **reorders** the array. If the caller still needs the original order, copy it first with `[...nums]`.',
    },
  ],
  problems: [
    {
      id: 'recursion-kth-largest',
      title: 'K-th largest score',
      difficulty: 'medium',
      leetcode: 215,
      pattern: 'Quickselect',
      statement: 'A game keeps every player\'s score in an array `nums`. The "top k" badge goes to anyone who scores at least the **k-th largest** score. Return that score. Repeats count separately: in `[5, 5, 4]` the 2nd largest is 5. Try to beat sorting.',
      examples: [
        { input: 'nums = [3, 2, 1, 5, 6, 4], k = 2', output: '5', explain: 'From the top: 6, then 5.' },
        { input: 'nums = [3, 2, 3, 1, 2, 4, 5, 5, 6], k = 4', output: '4', explain: 'From the top: 6, 5, 5, 4. The two 5s count as two places.' },
      ],
      constraints: ['1 ≤ k ≤ n ≤ 10⁵', '-10⁴ ≤ nums[i] ≤ 10⁴'],
      hints: [
        'In sorted order (small to big), the k-th largest sits at index `n - k`. You only need that one index.',
        'Pick a pivot and partition: smaller values left, bigger right. Where does the pivot end up, compared with `n - k`?',
        'Keep only the side that contains index `n - k` and repeat. Use a random pivot, and group values equal to the pivot together so repeats cannot slow you down.',
      ],
      approaches: [
        {
          name: 'Sort, read index n - k',
          idea: 'After sorting small to big, the k-th largest is k places from the end, at index `n - k`. Correct, but it orders every value to read one.',
          code: `function findKthLargest(nums, k) {
  const sorted = [...nums].sort((a, b) => a - b);
  return sorted[nums.length - k];
}`,
          time: 'O(n log n)',
          space: 'O(n)',
        },
        {
          name: 'Min-heap of size k',
          idea: 'Keep the k biggest values seen so far in a min-heap. The smallest of them sits on top, and once all values are in, that top is the k-th largest. You learn heaps in module 12.',
          time: 'O(n log k)',
          space: 'O(k)',
        },
        {
          name: 'Quickselect, two-way partition',
          idea: 'Partition around a random pivot: it lands at its final sorted index. Keep only the side that holds index `n - k`. Ranges shrink fast on average, so the total work is about 2n. Many equal values still slow it down.',
          code: `function findKthLargest(nums, k) {
  const target = nums.length - k;
  let lo = 0;
  let hi = nums.length - 1;
  while (true) {
    const r = lo + Math.floor(Math.random() * (hi - lo + 1));
    [nums[r], nums[hi]] = [nums[hi], nums[r]];
    const pivot = nums[hi];
    let i = lo;
    for (let j = lo; j < hi; j++) {
      if (nums[j] < pivot) {
        [nums[i], nums[j]] = [nums[j], nums[i]];
        i++;
      }
    }
    [nums[i], nums[hi]] = [nums[hi], nums[i]];
    if (i === target) return nums[i];
    if (target < i) hi = i - 1;
    else lo = i + 1;
  }
}`,
          time: 'O(n) average, O(n²) worst',
          space: 'O(1)',
        },
        {
          name: 'Quickselect, three-way partition',
          idea: 'Same idea, but split the range into less / equal / greater. All copies of the pivot land in their final spots at once, so if the target falls among them you stop. Repeats can no longer drag it down to O(n²). A loop instead of recursion keeps the extra memory at O(1).',
          pseudo: `function findKthLargest(nums, k):
    target ← n - k
    lo ← 0
    hi ← n - 1
    while true:
        pivot ← nums[random index from lo to hi]
        lt ← lo
        i ← lo
        gt ← hi
        while i ≤ gt:                   // less | equal | unseen | greater
            if nums[i] < pivot:
                swap nums[lt] and nums[i]
                lt ← lt + 1
                i ← i + 1
            else if nums[i] > pivot:
                swap nums[i] and nums[gt]
                gt ← gt - 1
            else:
                i ← i + 1
        if target < lt: hi ← lt - 1
        else if target > gt: lo ← gt + 1
        else: return pivot`,
          code: `function findKthLargest(nums, k) {
  const target = nums.length - k; // k-th largest = this index in sorted order
  let lo = 0;
  let hi = nums.length - 1;
  while (true) {
    const pivot = nums[lo + Math.floor(Math.random() * (hi - lo + 1))];
    // [lo, lt) < pivot, [lt, i) = pivot, (gt, hi] > pivot
    let lt = lo;
    let i = lo;
    let gt = hi;
    while (i <= gt) {
      if (nums[i] < pivot) {
        [nums[lt], nums[i]] = [nums[i], nums[lt]];
        lt++;
        i++;
      } else if (nums[i] > pivot) {
        [nums[i], nums[gt]] = [nums[gt], nums[i]];
        gt--;
      } else {
        i++;
      }
    }
    if (target < lt) hi = lt - 1;
    else if (target > gt) lo = gt + 1;
    else return pivot;
  }
}`,
          time: 'O(n) average, O(n²) worst',
          space: 'O(1)',
        },
      ],
      fn: 'findKthLargest',
      starter: `function findKthLargest(nums, k) {
  // Return the k-th largest value (repeats count separately).
  return 0;
}`,
      solution: `function findKthLargest(nums, k) {
  const target = nums.length - k; // k-th largest = this index in sorted order
  let lo = 0;
  let hi = nums.length - 1;
  while (true) {
    const pivot = nums[lo + Math.floor(Math.random() * (hi - lo + 1))];
    // [lo, lt) < pivot, [lt, i) = pivot, (gt, hi] > pivot
    let lt = lo;
    let i = lo;
    let gt = hi;
    while (i <= gt) {
      if (nums[i] < pivot) {
        [nums[lt], nums[i]] = [nums[i], nums[lt]];
        lt++;
        i++;
      } else if (nums[i] > pivot) {
        [nums[i], nums[gt]] = [nums[gt], nums[i]];
        gt--;
      } else {
        i++;
      }
    }
    if (target < lt) hi = lt - 1;
    else if (target > gt) lo = gt + 1;
    else return pivot;
  }
}`,
      tests: [
        { name: 'example 1', args: [[3, 2, 1, 5, 6, 4], 2], expected: 5 },
        { name: 'example 2, repeats', args: [[3, 2, 3, 1, 2, 4, 5, 5, 6], 4], expected: 4 },
        { name: 'one element', args: [[7], 1], expected: 7 },
        { name: 'all equal', args: [[2, 2, 2, 2, 2], 3], expected: 2 },
        { name: 'k = 1 is the max', args: [[4, 9, 1, 7], 1], expected: 9 },
        { name: 'k = n is the min', args: [[4, 9, 1, 7], 4], expected: 1 },
        { name: 'negatives', args: [[-5, -1, -10, -3], 2], expected: -3 },
        { name: 'many duplicates', args: [[1, 5, 1, 5, 1, 5, 9], 2], expected: 5 },
        { name: 'already sorted', args: [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], 5], expected: 16 },
      ],
      takeaway: 'You need one position, not the whole order: partition, then keep only the side that holds index `n - k`.',
    },
    {
      id: 'recursion-min-moves-median',
      title: 'Meeting point on one street',
      difficulty: 'medium',
      leetcode: 462,
      pattern: 'Quickselect (median)',
      statement: 'Your friends all live on one long street. `nums[i]` is the house number of friend `i`. You will all meet at one house (any number, it does not have to be someone\'s home). Each step moves one friend one house left or right. Return the **smallest total number of steps** so everyone ends up at the same house. In array terms: each move adds 1 to or subtracts 1 from one number, and you want all numbers equal.',
      examples: [
        { input: 'nums = [1, 2, 3]', output: '2', explain: 'Meet at house 2: the friend at 1 walks 1 step, the friend at 3 walks 1 step.' },
        { input: 'nums = [1, 10, 2, 9]', output: '16', explain: 'Meet anywhere from 2 to 9, for example 2: 1 + 8 + 0 + 7 = 16.' },
      ],
      constraints: ['1 ≤ n ≤ 10⁵', '-10⁹ ≤ nums[i] ≤ 10⁹', 'the answer fits in a 32-bit integer'],
      hints: [
        'The meeting house only needs to be one of the friends\' houses. Which one?',
        'Picture the meeting point between the friends. If more friends live to its right than to its left, sliding it one house right saves more steps than it costs.',
        'So the best point has as many friends on its left as on its right: the **median**. Find it with quickselect at index `floor(n / 2)`, then add up `|x - median|`.',
      ],
      approaches: [
        {
          name: 'Try every house',
          idea: 'The best meeting point is always one of the friends\' houses, so try each one and add up everyone\'s walk. Correct, but every try scans all n friends.',
          code: `function minMoves2(nums) {
  let best = Infinity;
  for (const target of nums) {
    let moves = 0;
    for (const x of nums) moves += Math.abs(x - target);
    best = Math.min(best, moves);
  }
  return best;
}`,
          time: 'O(n²)',
          space: 'O(1)',
        },
        {
          name: 'Sort, meet at the median',
          idea: 'Move the meeting point away from the median and more people walk one step farther than walk one step closer, so the total grows. The median is the best spot. Sort and read the middle value.',
          code: `function minMoves2(nums) {
  const sorted = [...nums].sort((a, b) => a - b);
  const median = sorted[Math.floor(nums.length / 2)];
  let moves = 0;
  for (const x of nums) moves += Math.abs(x - median);
  return moves;
}`,
          time: 'O(n log n)',
          space: 'O(n)',
        },
        {
          name: 'Quickselect the median',
          idea: 'You only need the value at the middle index, not the full order. That is exactly what quickselect gives you, in O(n) on average. Then one more pass adds up the steps.',
          pseudo: `function minMoves2(nums):
    m ← select(nums, floor(n / 2))      // the median, by quickselect
    moves ← 0
    for each x in nums:
        moves ← moves + |x - m|
    return moves

function select(a, target):             // three-way quickselect
    lo ← 0
    hi ← n - 1
    while true:
        pivot ← a[random index from lo to hi]
        split a[lo..hi] into < pivot | = pivot | > pivot,
            with the equal group at a[lt..gt]
        if target < lt: hi ← lt - 1
        else if target > gt: lo ← gt + 1
        else: return pivot`,
          code: `function minMoves2(nums) {
  const median = select(nums, Math.floor(nums.length / 2));
  let moves = 0;
  for (const x of nums) moves += Math.abs(x - median);
  return moves;
}

// Returns the value that would sit at index target if a were sorted.
function select(a, target) {
  let lo = 0;
  let hi = a.length - 1;
  while (true) {
    const pivot = a[lo + Math.floor(Math.random() * (hi - lo + 1))];
    let lt = lo;
    let i = lo;
    let gt = hi;
    while (i <= gt) {
      if (a[i] < pivot) {
        [a[lt], a[i]] = [a[i], a[lt]];
        lt++;
        i++;
      } else if (a[i] > pivot) {
        [a[i], a[gt]] = [a[gt], a[i]];
        gt--;
      } else {
        i++;
      }
    }
    if (target < lt) hi = lt - 1;
    else if (target > gt) lo = gt + 1;
    else return pivot;
  }
}`,
          time: 'O(n) average, O(n²) worst',
          space: 'O(1)',
        },
      ],
      fn: 'minMoves2',
      starter: `function minMoves2(nums) {
  // Return the fewest +1 / -1 moves to make every number equal.
  return 0;
}`,
      solution: `function minMoves2(nums) {
  const median = select(nums, Math.floor(nums.length / 2));
  let moves = 0;
  for (const x of nums) moves += Math.abs(x - median);
  return moves;
}

// Returns the value that would sit at index target if a were sorted.
function select(a, target) {
  let lo = 0;
  let hi = a.length - 1;
  while (true) {
    const pivot = a[lo + Math.floor(Math.random() * (hi - lo + 1))];
    let lt = lo;
    let i = lo;
    let gt = hi;
    while (i <= gt) {
      if (a[i] < pivot) {
        [a[lt], a[i]] = [a[i], a[lt]];
        lt++;
        i++;
      } else if (a[i] > pivot) {
        [a[i], a[gt]] = [a[gt], a[i]];
        gt--;
      } else {
        i++;
      }
    }
    if (target < lt) hi = lt - 1;
    else if (target > gt) lo = gt + 1;
    else return pivot;
  }
}`,
      tests: [
        { name: 'example 1', args: [[1, 2, 3]], expected: 2 },
        { name: 'example 2, even length', args: [[1, 10, 2, 9]], expected: 16 },
        { name: 'one friend', args: [[5]], expected: 0 },
        { name: 'all equal', args: [[4, 4, 4, 4]], expected: 0 },
        { name: 'negatives', args: [[-3, -1, 0, 4]], expected: 8 },
        { name: 'unsorted, odd length', args: [[7, 1, 9, 3, 3]], expected: 12 },
        { name: 'repeats around the middle', args: [[1, 0, 0, 8, 6]], expected: 14 },
        { name: 'big values', args: [[1000000000, -1000000000, 0, 7]], expected: 2000000007 },
      ],
      takeaway: 'Minimising total distance to one point? Meet at the median, and find the median with quickselect.',
    },
    {
      id: 'recursion-kth-largest-string',
      title: 'K-th largest of huge numbers',
      difficulty: 'medium',
      leetcode: 1985,
      pattern: 'Quickselect with a comparator',
      statement: 'A bank exports account balances as **strings of digits**, because some are up to 100 digits long. No string has leading zeros (except `"0"` itself). Given the array `nums` and a number `k`, return the **k-th largest** balance as a string. Repeats count separately: in `["5", "5", "4"]` the 2nd largest is `"5"`.',
      examples: [
        { input: 'nums = ["3", "6", "7", "10"], k = 4', output: '"3"', explain: 'From the top: 10, 7, 6, 3.' },
        { input: 'nums = ["2", "21", "12", "1"], k = 3', output: '"2"', explain: 'From the top: 21, 12, 2, 1.' },
      ],
      constraints: ['1 ≤ k ≤ n ≤ 10⁴', '1 ≤ nums[i].length ≤ 100', 'only digits, no leading zeros'],
      hints: [
        'You cannot turn these into numbers: `Number("12345678901234567890")` loses its last digits (JS numbers are exact only up to about 9 × 10¹⁵).',
        'You cannot compare them as plain strings either: `"9" > "10"` is `true`, because text compares the first letter first.',
        'No leading zeros means a longer string is a bigger number. Same length? Then plain string order is number order. Use that rule as the comparison inside quickselect.',
      ],
      approaches: [
        {
          name: 'Sort with a comparator',
          idea: 'Write `cmp(a, b)`: compare lengths first, then the strings. Sort with it and read index `n - k`. Each comparison can read up to L digits, where L is the longest string.',
          code: `function kthLargestNumber(nums, k) {
  const cmp = (a, b) => a.length - b.length || (a < b ? -1 : a > b ? 1 : 0);
  const sorted = [...nums].sort(cmp);
  return sorted[nums.length - k];
}`,
          time: 'O(n log n · L)',
          space: 'O(n)',
        },
        {
          name: 'Quickselect with the same comparator',
          idea: 'Quickselect only needs to ask "is this smaller, equal or bigger than the pivot?". Swap `<` and `>` for `cmp` and everything else stays the same, so you get the k-th largest in O(n · L) on average.',
          pseudo: `function cmp(a, b):                     // < 0 smaller, 0 equal, > 0 bigger
    if length(a) ≠ length(b):
        return length(a) - length(b)    // more digits = bigger number
    if a < b as text: return -1         // same length: text order works
    if a > b as text: return 1
    return 0

function kthLargestNumber(nums, k):
    target ← n - k
    lo ← 0
    hi ← n - 1
    while true:
        pivot ← nums[random index from lo to hi]
        three-way partition nums[lo..hi] around pivot using cmp,
            with the equal group at nums[lt..gt]
        if target < lt: hi ← lt - 1
        else if target > gt: lo ← gt + 1
        else: return pivot`,
          code: `function kthLargestNumber(nums, k) {
  // Longer means bigger (no leading zeros). Same length: string order works.
  const cmp = (a, b) => a.length - b.length || (a < b ? -1 : a > b ? 1 : 0);
  const target = nums.length - k;
  let lo = 0;
  let hi = nums.length - 1;
  while (true) {
    const pivot = nums[lo + Math.floor(Math.random() * (hi - lo + 1))];
    let lt = lo;
    let i = lo;
    let gt = hi;
    while (i <= gt) {
      const c = cmp(nums[i], pivot);
      if (c < 0) {
        [nums[lt], nums[i]] = [nums[i], nums[lt]];
        lt++;
        i++;
      } else if (c > 0) {
        [nums[i], nums[gt]] = [nums[gt], nums[i]];
        gt--;
      } else {
        i++;
      }
    }
    if (target < lt) hi = lt - 1;
    else if (target > gt) lo = gt + 1;
    else return pivot;
  }
}`,
          time: 'O(n · L) average, O(n² · L) worst',
          space: 'O(1)',
        },
      ],
      fn: 'kthLargestNumber',
      starter: `function kthLargestNumber(nums, k) {
  // Return the k-th largest number, as a string.
  return '';
}`,
      solution: `function kthLargestNumber(nums, k) {
  // Longer means bigger (no leading zeros). Same length: string order works.
  const cmp = (a, b) => a.length - b.length || (a < b ? -1 : a > b ? 1 : 0);
  const target = nums.length - k;
  let lo = 0;
  let hi = nums.length - 1;
  while (true) {
    const pivot = nums[lo + Math.floor(Math.random() * (hi - lo + 1))];
    let lt = lo;
    let i = lo;
    let gt = hi;
    while (i <= gt) {
      const c = cmp(nums[i], pivot);
      if (c < 0) {
        [nums[lt], nums[i]] = [nums[i], nums[lt]];
        lt++;
        i++;
      } else if (c > 0) {
        [nums[i], nums[gt]] = [nums[gt], nums[i]];
        gt--;
      } else {
        i++;
      }
    }
    if (target < lt) hi = lt - 1;
    else if (target > gt) lo = gt + 1;
    else return pivot;
  }
}`,
      tests: [
        { name: 'example 1', args: [['3', '6', '7', '10'], 4], expected: '3' },
        { name: 'example 2', args: [['2', '21', '12', '1'], 3], expected: '2' },
        { name: 'zeros', args: [['0', '0'], 2], expected: '0' },
        { name: '"9" vs "10"', args: [['9', '10'], 1], expected: '10' },
        { name: 'one number', args: [['42'], 1], expected: '42' },
        {
          name: '20+ digits, last digit differs',
          args: [['12345678901234567891', '12345678901234567890', '12345678901234567899', '12345678901234567895'], 2],
          expected: '12345678901234567895',
        },
        { name: 'duplicates count twice', args: [['5', '10', '7', '10', '5'], 2], expected: '10' },
        { name: 'duplicates, middle', args: [['5', '10', '7', '10', '5'], 4], expected: '5' },
        { name: 'mixed lengths', args: [['100', '99', '9', '1000', '999'], 3], expected: '100' },
      ],
      takeaway: 'Quickselect only needs "smaller, equal or bigger": plug in any comparator, like length-then-text for huge numbers.',
    },
  ],
  quiz: [
    {
      prompt: 'You want sorted index 2. After one partition the pivot lands at index 5. What next?',
      options: [
        'Keep searching in indexes 0 to 4, and drop the rest.',
        'Keep searching in indexes 6 to the end.',
        'Sort indexes 0 to 4.',
        'Partition the whole array again with a new pivot.',
      ],
      answer: 0,
      explanation: 'Everything left of index 5 is smaller than the pivot, and index 2 is on that side. The right side can never hold index 2, so it is dropped for good.',
    },
    {
      prompt: 'Quicksort and quickselect use the same partition. Why is quickselect O(n) on average but quicksort O(n log n)?',
      options: [
        'Quickselect uses a faster partition.',
        'Quickselect recurses into one side only, so the work is n + n/2 + n/4 + … ≈ 2n.',
        'Quickselect never has a worst case.',
      ],
      answer: 1,
      explanation: 'Quicksort must finish both sides, so every level of the recursion tree costs about n. Quickselect has one call per level, and the ranges shrink each time.',
    },
    {
      prompt: 'Quickselect always uses the **last** value as pivot. Which input makes it slowest?',
      options: ['A random shuffle', 'An already sorted array', 'An array of length 1'],
      answer: 1,
      explanation: 'On sorted input the last value is always the biggest, so each partition removes just one item: about n²/2 steps. A random pivot fixes this.',
    },
    {
      prompt: 'An array has 10 values. In sorted order (small to big), which index holds the 3rd largest?',
      options: ['2', '3', '7', '8'],
      answer: 2,
      explanation: 'The k-th largest is at index n - k = 10 - 3 = 7. Check: the largest is at index 9, the 2nd at 8, the 3rd at 7.',
    },
  ],
  takeaways: [
    '**Partition** puts the pivot at its final sorted index. Keep only the side that holds the index you want.',
    'One call per level with shrinking ranges: n + n/2 + … ≈ 2n, so **O(n)** on average. Use a random pivot to dodge the O(n²) worst case.',
    'The k-th largest is index `n - k`. Many equal values? Use a three-way partition (less / equal / greater).',
  ],
};

export default lesson;
