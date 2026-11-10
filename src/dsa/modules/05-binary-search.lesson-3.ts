import type { Lesson } from '../types';

// Module 5, lesson 3: rotated sorted arrays (and other "sorted, but" shapes).
const lesson: Lesson = {
  id: 'rotated-arrays',
  title: 'Rotated sorted arrays',
  summary: 'A sorted array that was cut and swapped still has one sorted half. Find it and keep halving.',
  minutes: 20,
  blocks: [
    {
      kind: 'callout',
      tone: 'story',
      title: 'The ring buffer',
      text: "A flight recorder keeps only the last 7 log timestamps in a fixed array. When the array is full, the next log overwrites slot 0, then slot 1, and so on. Read the slots in order and you get something like `[40, 50, 60, 70, 10, 20, 30]`: sorted, but **rotated**. Where is the oldest log? Routers, phones and databases store logs this way all the time. The structure is called a **ring buffer**: an array whose end wraps around to its start.",
    },
    {
      kind: 'text',
      text: "**The problem.** A sorted array of distinct values was rotated: a chunk from the front was cut off and moved to the back. `[0, 1, 2, 4, 5, 6, 7]` might become `[4, 5, 6, 7, 0, 1, 2]`. Find the smallest value in O(log n). After that, we'll find any target.",
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Brute force: check everything',
      code: `function findMinSlow(nums):
    best ← nums[0]
    for i from 1 to n - 1:
        if nums[i] < best:
            best ← nums[i]
    return best`,
    },
    {
      kind: 'text',
      text: "This is O(n), and it ignores that the array is *almost* sorted. Classic binary search fails here: compare `mid` with a target and you can't tell which way to go, because the order breaks somewhere. So let's look at the shape.",
    },
    {
      kind: 'diagram',
      title: '[4, 5, 6, 7, 0, 1, 2] drawn as heights',
      art: `value
  7 |          #
  6 |       #
  5 |    #
  4 | #
  2 |                   #
  1 |                #
  0 |             #
    +----------------------
      0  1  2  3  4  5  6   index`,
      caption: 'Two sorted runs: a high run (indexes 0-3) and a low run (4-6). Every value in the high run is bigger than every value in the low run. The minimum sits right after the cliff.',
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'Compare mid with the right end',
      text: "The last value, `nums[hi]`, always belongs to the low run. So compare `nums[mid]` with it. If `nums[mid] > nums[hi]`, mid is on the high run and the cliff is to its right: `lo = mid + 1`. Otherwise mid is on the low run, so the minimum is mid or left of it: `hi = mid`. This is the first-true template from the last lesson. The question is *is this value on the low run?* It answers no, no, no, then yes, yes.",
    },
    {
      kind: 'steps',
      title: 'Find the minimum of [4, 5, 6, 7, 0, 1, 2]',
      frames: [
        {
          cells: [4, 5, 6, 7, 0, 1, 2],
          pointers: { lo: 0, mid: 3, hi: 6 },
          active: [3, 6],
          vars: { 'nums[mid]': 7, 'nums[hi]': 2 },
          note: '7 > 2, so mid is on the high run. The cliff is to the right: `lo = 4`.',
        },
        {
          cells: [4, 5, 6, 7, 0, 1, 2],
          pointers: { lo: 4, mid: 5, hi: 6 },
          active: [5, 6],
          done: [0, 1, 2, 3],
          vars: { 'nums[mid]': 1, 'nums[hi]': 2 },
          note: '1 ≤ 2, so mid is on the low run. The minimum is mid or left of it: `hi = 5`.',
        },
        {
          cells: [4, 5, 6, 7, 0, 1, 2],
          pointers: { lo: 4, mid: 4, hi: 5 },
          active: [4, 5],
          done: [0, 1, 2, 3, 6],
          vars: { 'nums[mid]': 0, 'nums[hi]': 1 },
          note: '0 ≤ 1: low run again. `hi = 4`.',
        },
        {
          cells: [4, 5, 6, 7, 0, 1, 2],
          pointers: { lo: 4, hi: 4 },
          found: [4],
          done: [0, 1, 2, 3, 5, 6],
          vars: { minimum: 0 },
          note: '`lo = hi = 4`. The minimum is `nums[4] = 0`: the oldest log.',
        },
      ],
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Minimum of a rotated array',
      code: `function findMin(nums):
    lo ← 0
    hi ← n - 1
    while lo < hi:
        mid ← floor((lo + hi) / 2)
        if nums[mid] > nums[hi]:    // mid is on the high run
            lo ← mid + 1
        else:                       // mid is on the low run
            hi ← mid
    return nums[lo]`,
    },
    {
      kind: 'code',
      lang: 'js',
      title: 'JavaScript',
      code: `function findMin(nums) {
  let lo = 0;
  let hi = nums.length - 1;
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (nums[mid] > nums[hi]) lo = mid + 1;
    else hi = mid;
  }
  return nums[lo];
}

findMin([4, 5, 6, 7, 0, 1, 2]); // 0
findMin([1, 2, 3]);             // 1 (not rotated: still works)`,
    },
    {
      kind: 'text',
      text: "**Finding a target.** Cut a rotated array at any `mid`, and at least one of the two halves is fully sorted. Check which: if `nums[lo] ≤ nums[mid]`, the left half `lo..mid` is sorted; otherwise the right half `mid..hi` is. For a sorted half, you can tell right away if the target is inside it: just compare with its two ends. If it is, go there. If not, go to the other half.",
    },
    {
      kind: 'trace',
      title: 'Search for 0 in [4, 5, 6, 7, 0, 1, 2]',
      columns: ['lo', 'hi', 'mid', 'nums[mid]', 'sorted half', '0 inside it?', 'move'],
      rows: [
        [0, 6, 3, 7, 'left: 4 to 7', 'no', 'lo = 4'],
        [4, 6, 5, 1, 'left: 0 to 1', 'yes', 'hi = 4'],
        [4, 4, 4, 0, '-', '-', 'found at 4'],
      ],
      note: 'Every row still throws away half. We only added one question: which half is sorted?',
    },
    {
      kind: 'compare',
      title: 'Searching a rotated array',
      rows: [
        { approach: 'Linear scan', time: 'O(n)', space: 'O(1)', note: 'Always works, ignores the structure.' },
        {
          approach: 'Find the cliff, then classic search on one run',
          time: 'O(log n)',
          space: 'O(1)',
          note: 'Two binary searches. Easy to reason about.',
        },
        {
          approach: 'One pass: pick the sorted half',
          time: 'O(log n)',
          space: 'O(1)',
          note: 'One loop. The usual interview answer.',
        },
      ],
    },
    {
      kind: 'text',
      text: "**Same trick, other shapes.** Binary search works on any shape where one look at `mid` tells you which side to keep. A mountain array goes strictly up, then strictly down. Compare `arr[mid]` with its right neighbor `arr[mid + 1]`. Going uphill? The peak is to the right. Going downhill? The peak is `mid` or to its left.",
    },
    {
      kind: 'list',
      items: [
        '**The pattern: shape search.** Reach for it when an array is "sorted, but": rotated, shifted, wrapped around, or shaped like a mountain.',
        'Find a comparison at `mid` (with an end, or with a neighbor) that tells you which side holds the answer.',
        'If it is a "first spot where…" question, use first true (`lo < hi`, `hi = mid`). If you need an exact value, use the exact-match loop.',
      ],
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Template: shape search',
      code: `lo ← 0
hi ← n - 1
while lo < hi:
    mid ← floor((lo + hi) / 2)
    if the answer is right of mid:  // e.g. nums[mid] > nums[hi]
        lo ← mid + 1                //   or arr[mid] < arr[mid + 1]
    else:                           // answer is mid or left of it
        hi ← mid
return lo`,
    },
    {
      kind: 'callout',
      tone: 'trap',
      title: 'Compare with the right end, and beware repeats',
      text: "For the minimum, comparing `nums[mid]` with `nums[lo]` instead of `nums[hi]` breaks on arrays that were not rotated at all: in `[1, 2, 3, 4, 5]` every mid is ≥ `nums[lo]`, so you walk right and return 5. With **repeats**, like `[2, 2, 2, 0, 2]`, `nums[mid] = nums[hi]` tells you nothing: the cliff could be on either side. The safe move is to shrink by one (`hi = hi - 1`). That's correct, but the worst case becomes O(n). Think of all 2s with a single 0 hidden somewhere.",
    },
  ],
  problems: [
    {
      id: 'binary-search-rotated-min',
      title: 'Minimum in Rotated Sorted Array',
      difficulty: 'medium',
      leetcode: 153,
      pattern: 'Shape search (compare with the right end)',
      statement:
        "A ring buffer of log timestamps was read from slot 0, so the sorted list came out rotated, like `[4, 5, 6, 7, 0, 1, 2]`. All timestamps are different. It may also not be rotated at all. Return the smallest timestamp (the oldest log) in O(log n).",
      examples: [
        { input: 'nums = [3, 4, 5, 1, 2]', output: '1' },
        { input: 'nums = [4, 5, 6, 7, 0, 1, 2]', output: '0' },
        { input: 'nums = [11, 13, 15, 17]', output: '11', explain: 'Not rotated: the first value is the smallest.' },
      ],
      constraints: ['1 ≤ n ≤ 5000', 'values are distinct'],
      hints: [
        'The array is two sorted runs: a high one, then a low one. The minimum is the first value of the low run.',
        'The last value always belongs to the low run. Compare `nums[mid]` with `nums[hi]`.',
        '`nums[mid] > nums[hi]` means mid is on the high run: `lo = mid + 1`. Otherwise `hi = mid`. Return `nums[lo]`.',
      ],
      approaches: [
        {
          name: 'Scan',
          idea: 'Keep the smallest value seen. Or find the one spot where a value is bigger than the next one. Both O(n).',
          code: `function findMin(nums) {
  return Math.min(...nums);
}`,
          time: 'O(n)',
          space: 'O(1)',
        },
        {
          name: 'Binary search against the right end',
          idea: 'Every value in the high run is bigger than `nums[hi]`, and every value in the low run is not. So "is `nums[mid] ≤ nums[hi]`?" is no…no, yes…yes, and the first yes is the minimum.',
          pseudo: `function findMin(nums):
    lo ← 0
    hi ← n - 1
    while lo < hi:
        mid ← floor((lo + hi) / 2)
        if nums[mid] > nums[hi]:
            lo ← mid + 1        // mid on the high run
        else:
            hi ← mid            // mid on the low run
    return nums[lo]`,
          code: `function findMin(nums) {
  let lo = 0;
  let hi = nums.length - 1;
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (nums[mid] > nums[hi]) lo = mid + 1;
    else hi = mid;
  }
  return nums[lo];
}`,
          time: 'O(log n)',
          space: 'O(1)',
        },
      ],
      fn: 'findMin',
      starter: `function findMin(nums) {
  // Return the smallest value of a rotated sorted array.
  return 0;
}`,
      solution: `function findMin(nums) {
  let lo = 0;
  let hi = nums.length - 1;
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (nums[mid] > nums[hi]) lo = mid + 1;
    else hi = mid;
  }
  return nums[lo];
}`,
      tests: [
        { name: 'cliff in the middle', args: [[3, 4, 5, 1, 2]], expected: 1 },
        { name: 'cliff right of middle', args: [[4, 5, 6, 7, 0, 1, 2]], expected: 0 },
        { name: 'not rotated', args: [[11, 13, 15, 17]], expected: 11 },
        { name: 'single value', args: [[1]], expected: 1 },
        { name: 'two values, rotated', args: [[2, 1]], expected: 1 },
        { name: 'two values, sorted', args: [[1, 2]], expected: 1 },
        { name: 'min at index 1', args: [[5, 1, 2, 3, 4]], expected: 1 },
        { name: 'min at the end', args: [[2, 3, 4, 5, 1]], expected: 1 },
        { name: 'negatives', args: [[0, 3, -7, -4]], expected: -7 },
      ],
      takeaway: 'In a rotated array, compare `mid` with the right end to know which run you are on.',
    },
    {
      id: 'binary-search-rotated-search',
      title: 'Search in Rotated Sorted Array',
      difficulty: 'medium',
      leetcode: 33,
      pattern: 'Shape search (find the sorted half)',
      statement:
        "Same rotated array of distinct values, like `[4, 5, 6, 7, 0, 1, 2]`. Given `target`, return its index, or `-1` if it is not there. Use O(log n) time.",
      examples: [
        { input: 'nums = [4, 5, 6, 7, 0, 1, 2], target = 0', output: '4' },
        { input: 'nums = [4, 5, 6, 7, 0, 1, 2], target = 3', output: '-1' },
        { input: 'nums = [1], target = 0', output: '-1' },
      ],
      constraints: ['1 ≤ n ≤ 5000', 'values are distinct'],
      hints: [
        'Split at `mid`. At least one half, `lo..mid` or `mid..hi`, is fully sorted. How can you tell which?',
        'If `nums[lo] ≤ nums[mid]`, the left half is sorted. Otherwise the right half is.',
        'In the sorted half, check if target lies between its two ends. If yes, search there; if no, search the other half. Use the exact-match loop (`lo <= hi`).',
      ],
      approaches: [
        {
          name: 'Linear scan',
          idea: '`nums.indexOf(target)`. Correct, O(n).',
          time: 'O(n)',
          space: 'O(1)',
        },
        {
          name: 'Find the cliff, then search one run',
          idea: 'Use the previous problem to find the index of the minimum. Now you have two sorted runs: `0..min-1` and `min..n-1`. Pick the run whose range covers the target and run classic binary search on it.',
          time: 'O(log n)',
          space: 'O(1)',
        },
        {
          name: 'One pass: pick the sorted half',
          idea: 'At every step one half is sorted, and for a sorted half a range check tells you for sure if the target can be inside. If it can, keep that half. If not, the target can only be in the other half.',
          pseudo: `function searchRotated(nums, target):
    lo ← 0
    hi ← n - 1
    while lo ≤ hi:
        mid ← floor((lo + hi) / 2)
        if nums[mid] = target:
            return mid
        if nums[lo] ≤ nums[mid]:            // left half is sorted
            if nums[lo] ≤ target < nums[mid]:
                hi ← mid - 1
            else:
                lo ← mid + 1
        else:                               // right half is sorted
            if nums[mid] < target ≤ nums[hi]:
                lo ← mid + 1
            else:
                hi ← mid - 1
    return -1`,
          code: `function searchRotated(nums, target) {
  let lo = 0;
  let hi = nums.length - 1;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (nums[mid] === target) return mid;
    if (nums[lo] <= nums[mid]) {
      // left half lo..mid is sorted
      if (nums[lo] <= target && target < nums[mid]) hi = mid - 1;
      else lo = mid + 1;
    } else {
      // right half mid..hi is sorted
      if (nums[mid] < target && target <= nums[hi]) lo = mid + 1;
      else hi = mid - 1;
    }
  }
  return -1;
}`,
          time: 'O(log n)',
          space: 'O(1)',
        },
      ],
      fn: 'searchRotated',
      starter: `function searchRotated(nums, target) {
  // Return target's index in the rotated array, or -1.
  return -1;
}`,
      solution: `function searchRotated(nums, target) {
  let lo = 0;
  let hi = nums.length - 1;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (nums[mid] === target) return mid;
    if (nums[lo] <= nums[mid]) {
      if (nums[lo] <= target && target < nums[mid]) hi = mid - 1;
      else lo = mid + 1;
    } else {
      if (nums[mid] < target && target <= nums[hi]) lo = mid + 1;
      else hi = mid - 1;
    }
  }
  return -1;
}`,
      tests: [
        { name: 'target on the low run', args: [[4, 5, 6, 7, 0, 1, 2], 0], expected: 4 },
        { name: 'missing', args: [[4, 5, 6, 7, 0, 1, 2], 3], expected: -1 },
        { name: 'single, missing', args: [[1], 0], expected: -1 },
        { name: 'single, found', args: [[1], 1], expected: 0 },
        { name: 'two values, rotated', args: [[3, 1], 1], expected: 1 },
        { name: 'two values, sorted', args: [[1, 3], 3], expected: 1 },
        { name: 'target at index 0', args: [[5, 1, 3], 5], expected: 0 },
        { name: 'target at the end', args: [[5, 1, 3], 3], expected: 2 },
        { name: 'not rotated', args: [[1, 2, 3, 4, 5], 4], expected: 3 },
        { name: 'target on the high run', args: [[6, 7, 1, 2, 3, 4, 5], 7], expected: 1 },
        { name: 'target right before the cliff', args: [[4, 5, 6, 7, 8, 1, 2, 3], 8], expected: 4 },
      ],
      takeaway: 'Cut anywhere and one half is sorted. Range-check that half to decide where to go.',
    },
    {
      id: 'binary-search-rotated-duplicates',
      title: 'Rotated Array with Repeats',
      difficulty: 'medium',
      leetcode: 81,
      pattern: 'Shape search (with repeats)',
      statement:
        "A rotated sorted array again, but now values can repeat, like `[2, 5, 6, 0, 0, 1, 2]`. Return `true` if `target` is in it, else `false`. Try to keep it fast for most inputs. (Repeats make a true O(log n) impossible in the worst case.)",
      examples: [
        { input: 'nums = [2, 5, 6, 0, 0, 1, 2], target = 0', output: 'true' },
        { input: 'nums = [2, 5, 6, 0, 0, 1, 2], target = 3', output: 'false' },
        { input: 'nums = [1, 0, 1, 1, 1], target = 0', output: 'true', explain: '`nums[lo]`, `nums[mid]` and `nums[hi]` are all 1, so you can\'t tell which half is sorted.' },
      ],
      constraints: ['1 ≤ n ≤ 5000'],
      hints: [
        'Start from the previous problem. Which check breaks when values repeat?',
        'If `nums[lo] = nums[mid] = nums[hi]`, either half could hold the cliff. Is it safe to drop just `lo` and `hi`?',
        'Yes: neither is the target (it equals `nums[mid]`, which you already checked). So `lo++` and `hi--`, then continue. Otherwise use the same sorted-half logic as before.',
      ],
      approaches: [
        {
          name: 'Linear scan',
          idea: '`nums.includes(target)`. O(n), and with repeats the smart version can be O(n) too, but only on rare inputs.',
          time: 'O(n)',
          space: 'O(1)',
        },
        {
          name: 'Sorted half, shrink on a tie',
          idea: 'Same as the distinct version. The one new case is `nums[lo] = nums[mid] = nums[hi]`: you can\'t tell which half is sorted, but you know `nums[lo]` and `nums[hi]` are not the target (they equal `nums[mid]`). Drop both and try again.',
          pseudo: `function searchWithRepeats(nums, target):
    lo ← 0
    hi ← n - 1
    while lo ≤ hi:
        mid ← floor((lo + hi) / 2)
        if nums[mid] = target:
            return true
        if nums[lo] = nums[mid] and nums[mid] = nums[hi]:
            lo ← lo + 1             // can't tell: shrink both ends
            hi ← hi - 1
        else if nums[lo] ≤ nums[mid]:       // left half sorted
            if nums[lo] ≤ target < nums[mid]:
                hi ← mid - 1
            else:
                lo ← mid + 1
        else:                               // right half sorted
            if nums[mid] < target ≤ nums[hi]:
                lo ← mid + 1
            else:
                hi ← mid - 1
    return false`,
          code: `function searchWithRepeats(nums, target) {
  let lo = 0;
  let hi = nums.length - 1;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (nums[mid] === target) return true;
    if (nums[lo] === nums[mid] && nums[mid] === nums[hi]) {
      lo++;
      hi--;
    } else if (nums[lo] <= nums[mid]) {
      if (nums[lo] <= target && target < nums[mid]) hi = mid - 1;
      else lo = mid + 1;
    } else {
      if (nums[mid] < target && target <= nums[hi]) lo = mid + 1;
      else hi = mid - 1;
    }
  }
  return false;
}`,
          time: 'O(log n) usually, O(n) worst',
          space: 'O(1)',
        },
      ],
      fn: 'searchWithRepeats',
      starter: `function searchWithRepeats(nums, target) {
  // Return true if target is in the rotated array (repeats allowed).
  return false;
}`,
      solution: `function searchWithRepeats(nums, target) {
  let lo = 0;
  let hi = nums.length - 1;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (nums[mid] === target) return true;
    if (nums[lo] === nums[mid] && nums[mid] === nums[hi]) {
      lo++;
      hi--;
    } else if (nums[lo] <= nums[mid]) {
      if (nums[lo] <= target && target < nums[mid]) hi = mid - 1;
      else lo = mid + 1;
    } else {
      if (nums[mid] < target && target <= nums[hi]) lo = mid + 1;
      else hi = mid - 1;
    }
  }
  return false;
}`,
      tests: [
        { name: 'found on the low run', args: [[2, 5, 6, 0, 0, 1, 2], 0], expected: true },
        { name: 'missing', args: [[2, 5, 6, 0, 0, 1, 2], 3], expected: false },
        { name: 'ends and mid all equal', args: [[1, 0, 1, 1, 1], 0], expected: true },
        { name: 'hidden near the end', args: [[1, 1, 1, 0, 1], 0], expected: true },
        { name: 'all the same, missing', args: [[1, 1, 1, 1, 1], 2], expected: false },
        { name: 'single, found', args: [[1], 1], expected: true },
        { name: 'two values', args: [[3, 1], 1], expected: true },
        { name: 'peak among repeats', args: [[2, 2, 2, 3, 2, 2, 2], 3], expected: true },
        { name: 'high value hiding', args: [[1, 3, 1, 1, 1], 3], expected: true },
        { name: 'missing among repeats', args: [[5, 5, 1, 3, 5], 4], expected: false },
      ],
      takeaway: 'Repeats can hide which half is sorted. Shrink by one when you can\'t tell, and accept an O(n) worst case.',
    },
    {
      id: 'binary-search-mountain-peak',
      title: 'Peak of a Mountain Array',
      difficulty: 'medium',
      leetcode: 852,
      pattern: 'Shape search (compare with a neighbor)',
      statement:
        "A hiking app stores trail heights in `arr`. The heights go strictly up, then strictly down: a mountain with one peak, not at either end. Return the index of the peak in O(log n).",
      examples: [
        { input: 'arr = [0, 1, 0]', output: '1' },
        { input: 'arr = [0, 2, 1, 0]', output: '1' },
        { input: 'arr = [1, 2, 3, 4, 5, 3]', output: '4' },
      ],
      constraints: ['3 ≤ n ≤ 10⁵', 'arr is strictly increasing, then strictly decreasing'],
      hints: [
        'Stand at `mid`. Can you tell if you are on the uphill or the downhill side?',
        'Compare `arr[mid]` with `arr[mid + 1]`. Uphill means the peak is to the right.',
        'If `arr[mid] < arr[mid + 1]`, then `lo = mid + 1`. Otherwise the peak is `mid` or left: `hi = mid`. Loop while `lo < hi`.',
      ],
      approaches: [
        {
          name: 'Walk until it goes down',
          idea: 'Start at 0 and step right while the next height is bigger. Where you stop is the peak.',
          code: `function peakIndex(arr) {
  let i = 0;
  while (arr[i] < arr[i + 1]) i++;
  return i;
}`,
          time: 'O(n)',
          space: 'O(1)',
        },
        {
          name: 'Binary search on the slope',
          idea: '"Is the trail going down after index i?" (`arr[i] > arr[i + 1]`) is no on the uphill side and yes from the peak on. The peak is the first yes. `mid + 1` is always in range, because `lo < hi` means `mid < hi`.',
          pseudo: `function peakIndex(arr):
    lo ← 0
    hi ← n - 1
    while lo < hi:
        mid ← floor((lo + hi) / 2)
        if arr[mid] < arr[mid + 1]:     // uphill
            lo ← mid + 1
        else:                           // downhill (or the peak)
            hi ← mid
    return lo`,
          code: `function peakIndex(arr) {
  let lo = 0;
  let hi = arr.length - 1;
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (arr[mid] < arr[mid + 1]) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}`,
          time: 'O(log n)',
          space: 'O(1)',
        },
      ],
      fn: 'peakIndex',
      starter: `function peakIndex(arr) {
  // Return the index of the highest point of the mountain.
  return 0;
}`,
      solution: `function peakIndex(arr) {
  let lo = 0;
  let hi = arr.length - 1;
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (arr[mid] < arr[mid + 1]) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}`,
      tests: [
        { name: 'smallest mountain', args: [[0, 1, 0]], expected: 1 },
        { name: 'peak on the left', args: [[0, 2, 1, 0]], expected: 1 },
        { name: 'steep drop', args: [[0, 10, 5, 2]], expected: 1 },
        { name: 'long uphill', args: [[1, 2, 3, 4, 5, 3]], expected: 4 },
        { name: 'peak in the middle', args: [[3, 5, 7, 9, 6, 4, 1]], expected: 3 },
        { name: 'long downhill', args: [[0, 5, 4, 3, 2, 1]], expected: 1 },
        { name: 'bigger trail', args: [[24, 69, 100, 99, 79, 78, 67, 36, 26, 19]], expected: 2 },
        { name: 'negative heights', args: [[-10, -5, -1, -3, -8]], expected: 2 },
      ],
      takeaway: 'No target needed: comparing `mid` with a neighbor can tell you which side to keep.',
    },
  ],
  quiz: [
    {
      prompt: '`nums = [6, 7, 1, 2, 3, 4, 5]`, `lo = 0`, `hi = 6`, `mid = 3`. `nums[mid] = 2` and `nums[hi] = 5`. Where is the minimum?',
      options: ['At mid or to its left', 'Strictly to the right of mid', 'You cannot tell'],
      answer: 0,
      explanation: '2 ≤ 5 means mid is on the low run, so the cliff is at mid or before it. Set `hi = mid`.',
    },
    {
      prompt: 'You cut a rotated array of distinct values at some `mid`. How many of the two halves are sure to be sorted?',
      options: ['At least one', 'None', 'Always both', 'It depends on n'],
      answer: 0,
      explanation: 'The cliff can only be in one half, so the other half has no break in it.',
    },
    {
      prompt: 'Why can repeats make searching a rotated array O(n) in the worst case?',
      options: [
        'When `nums[lo]`, `nums[mid]` and `nums[hi]` are equal, you can\'t tell which half is sorted, so you can only drop one cell per end',
        'Repeats make the array unsorted',
        '`Math.floor` fails with repeats',
      ],
      answer: 0,
      explanation: 'Take `[1, 1, 1, 1, 0, 1, 1]`: every look sees 1, 1, 1. Only shrinking the ends one at a time is safe.',
    },
  ],
  takeaways: [
    'A rotated sorted array is two sorted runs. Compare `nums[mid]` with `nums[hi]` to know which run `mid` is on.',
    'To find a target, first find the sorted half, then check whether the target fits between its ends.',
    'Binary search only needs a test at `mid` that tells you which half to keep. Sorted is just the most common case.',
  ],
};

export default lesson;
