import type { Lesson } from '../types';

// Lesson 2 of module 3: read/write pointers for in-place edits.
export const readWrite: Lesson = {
  id: 'read-write',
  title: 'Read/write pointer (in place)',
  summary: 'One pointer reads every item, the other marks where the next keeper goes.',
  minutes: 20,
  blocks: [
    {
      kind: 'callout',
      tone: 'story',
      title: 'Cleaning a playlist on a cheap phone',
      text: "Your music app merges two playlists and sorts the songs by track ID. Repeats now sit side by side: `[101, 101, 205, 340, 340, 340, 512]`. The app runs on a cheap phone with little memory, so it must clean the list **in place**: no second copy of the list.",
    },
    {
      kind: 'text',
      text: "**The problem.** Given a sorted array, keep each value once, packed at the front of the **same** array, and return how many you kept (`k`). Whatever sits after position `k` does not matter. Small example: `[1, 1, 2, 3, 3, 3, 4]` should start with `[1, 2, 3, 4]`, and `k = 4`.",
    },
    {
      kind: 'text',
      text: "**Brute force first.** Walk the array. Each time you see a repeat, delete it by shifting everything after it one step left.",
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Brute force: delete by shifting',
      code: `function removeDuplicates(a):
    size ← n
    i ← 1
    while i < size:
        if a[i] = a[i - 1]:
            for j from i to size - 2:      // shift the tail left
                a[j] ← a[j + 1]
            size ← size - 1
        else:
            i ← i + 1
    return size`,
    },
    {
      kind: 'text',
      text: "It works and uses no extra memory. But each delete shifts up to n items, so with many repeats it is **O(n²)**. A playlist of 100,000 copies of one song means billions of moves.",
    },
    {
      kind: 'text',
      text: "**Spot the waste.** In `[1, 1, 2, 3, 3, 3, 4]` the `4` gets shifted left once for *every* repeat before it. But it only needs to move once, straight to its final spot. If you always knew where the next unique value belongs, you could drop it there directly.",
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'Two pointers, same direction',
      text: "`read` visits every cell, one by one. `write` points at the next free spot in the answer. Everything left of `write` is finished. When `read` finds a value worth keeping, copy it to `write` and move `write` forward. Each value moves at most once, so the whole thing is O(n).",
    },
    {
      kind: 'steps',
      title: 'Read/write on [1, 1, 2, 3, 3, 3, 4]',
      frames: [
        {
          cells: [1, 1, 2, 3, 3, 3, 4],
          pointers: { w: 1, r: 1 },
          found: [0],
          note: "The first value is always kept. So `write` starts at 1 and `read` starts at 1.",
        },
        {
          cells: [1, 1, 2, 3, 3, 3, 4],
          pointers: { w: 1, r: 1 },
          found: [0],
          active: [1],
          note: "`a[read]` is 1, the same as the last kept value `a[write - 1]`. Skip it.",
        },
        {
          cells: [1, 2, 2, 3, 3, 3, 4],
          pointers: { w: 2, r: 2 },
          found: [0, 1],
          active: [2],
          note: "2 is new. Copy it to `a[1]` and move `write` to 2.",
        },
        {
          cells: [1, 2, 3, 3, 3, 3, 4],
          pointers: { w: 3, r: 3 },
          found: [0, 1, 2],
          active: [3],
          note: "3 is new. Copy it to `a[2]` and move `write` to 3.",
        },
        {
          cells: [1, 2, 3, 3, 3, 3, 4],
          pointers: { w: 3, r: 4 },
          found: [0, 1, 2],
          active: [4],
          note: "3 again, same as the last kept value. Skip.",
        },
        {
          cells: [1, 2, 3, 3, 3, 3, 4],
          pointers: { w: 3, r: 5 },
          found: [0, 1, 2],
          active: [5],
          note: "3 again. Skip. `write` waits, `read` keeps going.",
        },
        {
          cells: [1, 2, 3, 4, 3, 3, 4],
          pointers: { w: 4, r: 6 },
          found: [0, 1, 2, 3],
          active: [6],
          note: "4 is new. Copy it to `a[3]` and move `write` to 4.",
        },
        {
          cells: [1, 2, 3, 4, 3, 3, 4],
          pointers: { w: 4 },
          found: [0, 1, 2, 3],
          done: [4, 5, 6],
          vars: { k: 4 },
          note: "`read` is done. The answer is the first `write` = 4 cells. The rest is leftover junk.",
        },
      ],
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Read/write pointers',
      code: `function removeDuplicates(a):
    if n = 0: return 0
    write ← 1                          // a[0] is always kept
    for read from 1 to n - 1:
        if a[read] ≠ a[write - 1]:     // a value we haven't kept yet
            a[write] ← a[read]
            write ← write + 1
    return write`,
    },
    {
      kind: 'code',
      lang: 'js',
      code: `function removeDuplicates(nums) {
  if (nums.length === 0) return 0;
  let write = 1;
  for (let read = 1; read < nums.length; read++) {
    if (nums[read] !== nums[write - 1]) {
      nums[write] = nums[read];
      write++;
    }
  }
  return write;
}`,
    },
    {
      kind: 'callout',
      tone: 'tip',
      title: 'How this course checks in-place answers',
      text: "On LeetCode the grader reads your array after the call. Here the grader can only see what you **return**, so in-place problems in this module ask you to return the changed part, like `nums.slice(0, k)`, or the whole array.",
    },
    {
      kind: 'compare',
      title: 'Remove duplicates from a sorted array',
      rows: [
        { approach: 'Delete by shifting', time: 'O(n²)', space: 'O(1)', note: 'In place, but values move many times.' },
        { approach: 'Copy unique values to a new array', time: 'O(n)', space: 'O(n)', note: 'Fast and simple, but breaks the in-place rule.' },
        { approach: 'Read/write pointers', time: 'O(n)', space: 'O(1)', note: 'Each value moves at most once, no extra array.' },
      ],
    },
    {
      kind: 'text',
      text: "The same two pointers solve many cleanup jobs. **Move Zeroes** keeps the non-zero values at `write`, then fills the rest with zeros. **Backspace String Compare** runs its pointers from the **back**, because a `#` deletes what came *before* it. Merging two sorted arrays into the first one (LeetCode 88) also fills from the back, so you never overwrite a value you haven't read yet.",
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Template: read/write',
      code: `write ← 0
for read from 0 to n - 1:
    if a[read] should be kept:      // the only line that changes
        a[write] ← a[read]
        write ← write + 1
return write                         // new length`,
    },
    {
      kind: 'list',
      items: [
        "The task says **in place** or **O(1) extra space**.",
        "You remove, keep, or compact items and **return the new length**.",
        "The kept items must stay in their original order.",
        "If later items can cancel earlier ones (like a backspace), walk from the back.",
      ],
    },
    {
      kind: 'callout',
      tone: 'trap',
      title: 'Compare with what you kept, not with what you read',
      text: "In Remove Duplicates II (keep at most two), check `a[read] ≠ a[write - 2]`. Checking `a[read - 2]` looks the same but is wrong: that cell may already be overwritten. On `[1, 1, 1, 2, 2, 2, 3]` the wrong check returns `[1, 1, 2, 3]` and loses a 2. Also return `write`, not `write - 1`: `write` is already the count.",
    },
  ],
  problems: [
    {
      id: 'two-pointers-remove-duplicates',
      title: 'Remove Duplicates from Sorted Array',
      difficulty: 'easy',
      leetcode: 26,
      pattern: 'Two pointers (read/write)',
      statement:
        "Clean a sorted playlist in place. `nums` is sorted. Keep each value once, packed at the front of `nums` in the same order, using O(1) extra memory. On LeetCode you return the count `k`. Here, return `nums.slice(0, k)` (the kept part) so the grader can check it.",
      examples: [
        { input: 'nums = [1, 1, 2]', output: '[1, 2]' },
        { input: 'nums = [0, 0, 1, 1, 1, 2, 2, 3, 3, 4]', output: '[0, 1, 2, 3, 4]' },
      ],
      constraints: ['0 ≤ n ≤ 3 · 10⁴', '-100 ≤ nums[i] ≤ 100', 'nums is sorted in non-decreasing order'],
      hints: [
        "Because the array is sorted, all copies of a value sit next to each other.",
        "Keep a `write` index for the next free spot. Compare each value with the last value you kept.",
        "`write = 1`; for each `read` from 1: if `nums[read] !== nums[write - 1]`, copy it to `nums[write]` and do `write++`.",
      ],
      approaches: [
        {
          name: 'New array',
          idea: "Push a value into a new array whenever it differs from the last pushed one. Correct and O(n), but uses O(n) extra memory, which the task forbids.",
          time: 'O(n)',
          space: 'O(n)',
        },
        {
          name: 'Read/write pointers',
          idea: "`read` scans every value. `write` marks the end of the cleaned part. A value is new exactly when it differs from the last kept value `nums[write - 1]`, so copy it there. Each value moves at most once.",
          pseudo: `function removeDuplicates(nums):
    if n = 0: return empty list
    write ← 1
    for read from 1 to n - 1:
        if nums[read] ≠ nums[write - 1]:
            nums[write] ← nums[read]
            write ← write + 1
    return nums[0 .. write - 1]`,
          code: `function removeDuplicates(nums) {
  if (nums.length === 0) return [];
  let write = 1;
  for (let read = 1; read < nums.length; read++) {
    if (nums[read] !== nums[write - 1]) {
      nums[write] = nums[read];
      write++;
    }
  }
  return nums.slice(0, write);
}`,
          time: 'O(n)',
          space: 'O(1)',
        },
      ],
      fn: 'removeDuplicates',
      starter: `function removeDuplicates(nums) {
  // keep each value once at the front of nums, in place
  let k = 0;
  return nums.slice(0, k);
}`,
      solution: `function removeDuplicates(nums) {
  if (nums.length === 0) return [];
  let write = 1;
  for (let read = 1; read < nums.length; read++) {
    if (nums[read] !== nums[write - 1]) {
      nums[write] = nums[read];
      write++;
    }
  }
  return nums.slice(0, write);
}`,
      tests: [
        { name: 'short', args: [[1, 1, 2]], expected: [1, 2] },
        { name: 'many repeats', args: [[0, 0, 1, 1, 1, 2, 2, 3, 3, 4]], expected: [0, 1, 2, 3, 4] },
        { name: 'single value', args: [[7]], expected: [7] },
        { name: 'all the same', args: [[5, 5, 5, 5]], expected: [5] },
        { name: 'no repeats', args: [[1, 2, 3]], expected: [1, 2, 3] },
        { name: 'negatives', args: [[-3, -3, -1, 0, 0]], expected: [-3, -1, 0] },
        { name: 'empty', args: [[]], expected: [] },
      ],
      takeaway: "Read everything, write only the keepers; the write index is the new length.",
    },
    {
      id: 'two-pointers-move-zeroes',
      title: 'Move Zeroes',
      difficulty: 'easy',
      leetcode: 283,
      pattern: 'Two pointers (read/write)',
      statement:
        "On a phone home screen, deleted apps leave empty slots (`0`). Slide every real app (non-zero) to the front, **keeping their order**, and push all the empty slots to the end. Do it in place, without a second array. Return `nums` after the change.",
      examples: [
        { input: 'nums = [0, 1, 0, 3, 12]', output: '[1, 3, 12, 0, 0]' },
        { input: 'nums = [0]', output: '[0]' },
      ],
      constraints: ['1 ≤ n ≤ 10⁴', '-2³¹ ≤ nums[i] ≤ 2³¹ - 1'],
      hints: [
        "This is Remove Duplicates with a different keep rule: keep anything that is not 0.",
        "After packing the non-zeros at the front, what should the cells from `write` to the end become?",
        "One-pass version: when `nums[read]` is non-zero, **swap** it with `nums[write]` and move `write`. The zeros drift to the back by themselves.",
      ],
      approaches: [
        {
          name: 'New array',
          idea: "Collect the non-zeros into a new array, then add zeros until the length matches. Simple, but uses O(n) extra memory.",
          time: 'O(n)',
          space: 'O(n)',
        },
        {
          name: 'Read/write, then fill zeros',
          idea: "Copy each non-zero to `nums[write]` and move `write`. When the scan ends, every non-zero is packed in order, so set every cell from `write` to the end to 0.",
          time: 'O(n)',
          space: 'O(1)',
        },
        {
          name: 'Read/write with swaps (one pass)',
          idea: "Same scan, but swap instead of copy. Everything before `write` is non-zero and in order. Everything between `write` and `read` is zero. A swap moves the next non-zero to the front and a zero back, so no second pass is needed.",
          pseudo: `function moveZeroes(nums):
    write ← 0
    for read from 0 to n - 1:
        if nums[read] ≠ 0:
            swap nums[write] and nums[read]
            write ← write + 1
    return nums`,
          code: `function moveZeroes(nums) {
  let write = 0;
  for (let read = 0; read < nums.length; read++) {
    if (nums[read] !== 0) {
      [nums[write], nums[read]] = [nums[read], nums[write]];
      write++;
    }
  }
  return nums;
}`,
          time: 'O(n)',
          space: 'O(1)',
        },
      ],
      fn: 'moveZeroes',
      starter: `function moveZeroes(nums) {
  // move all 0s to the end in place, keep the order of the rest
  return nums;
}`,
      solution: `function moveZeroes(nums) {
  let write = 0;
  for (let read = 0; read < nums.length; read++) {
    if (nums[read] !== 0) {
      [nums[write], nums[read]] = [nums[read], nums[write]];
      write++;
    }
  }
  return nums;
}`,
      tests: [
        { name: 'classic', args: [[0, 1, 0, 3, 12]], expected: [1, 3, 12, 0, 0] },
        { name: 'single zero', args: [[0]], expected: [0] },
        { name: 'single non-zero', args: [[1]], expected: [1] },
        { name: 'zeros first', args: [[0, 0, 1]], expected: [1, 0, 0] },
        { name: 'no zeros', args: [[1, 2, 3]], expected: [1, 2, 3] },
        { name: 'negatives', args: [[4, 0, -2, 0, 0, 5]], expected: [4, -2, 5, 0, 0, 0] },
        { name: 'all zeros', args: [[0, 0, 0]], expected: [0, 0, 0] },
      ],
      takeaway: "Swapping instead of copying lets the unwanted items collect at the back for free.",
    },
    {
      id: 'two-pointers-remove-duplicates-ii',
      title: 'Remove Duplicates II (keep at most two)',
      difficulty: 'medium',
      leetcode: 80,
      pattern: 'Two pointers (read/write)',
      statement:
        "A photo app groups burst shots by timestamp, so `nums` is sorted. Keep **at most two** copies of each value, packed at the front of `nums` in order, in place with O(1) extra memory. Return `nums.slice(0, k)`, where `k` is how many you kept.",
      examples: [
        { input: 'nums = [1, 1, 1, 2, 2, 3]', output: '[1, 1, 2, 2, 3]' },
        { input: 'nums = [0, 0, 1, 1, 1, 1, 2, 3, 3]', output: '[0, 0, 1, 1, 2, 3, 3]' },
      ],
      constraints: ['1 ≤ n ≤ 3 · 10⁴', '-10⁴ ≤ nums[i] ≤ 10⁴', 'nums is sorted in non-decreasing order'],
      hints: [
        "The first two values can always be kept.",
        "A value can be kept if the kept part does not already end with two copies of it.",
        "Since the array is sorted, you only need to compare with `nums[write - 2]`. If they differ, keep it. Compare with the kept part, not with `nums[read - 2]`.",
      ],
      approaches: [
        {
          name: 'Count runs into a new array',
          idea: "Walk the array, track how many times in a row you've seen the current value, and push it to a new array only while that count is 1 or 2. Correct but uses O(n) extra memory.",
          time: 'O(n)',
          space: 'O(n)',
        },
        {
          name: 'Read/write, compare two back',
          idea: "The kept part is sorted. If `nums[read]` equals `nums[write - 2]`, then both kept cells `write - 2` and `write - 1` already hold this value, so a third copy is not allowed. Otherwise keep it.",
          pseudo: `function removeDuplicatesTwice(nums):
    write ← 0
    for read from 0 to n - 1:
        if write < 2 or nums[read] ≠ nums[write - 2]:
            nums[write] ← nums[read]
            write ← write + 1
    return nums[0 .. write - 1]`,
          code: `function removeDuplicatesTwice(nums) {
  let write = 0;
  for (let read = 0; read < nums.length; read++) {
    if (write < 2 || nums[read] !== nums[write - 2]) {
      nums[write] = nums[read];
      write++;
    }
  }
  return nums.slice(0, write);
}`,
          time: 'O(n)',
          space: 'O(1)',
        },
      ],
      fn: 'removeDuplicatesTwice',
      starter: `function removeDuplicatesTwice(nums) {
  // keep at most two copies of each value at the front, in place
  let k = 0;
  return nums.slice(0, k);
}`,
      solution: `function removeDuplicatesTwice(nums) {
  let write = 0;
  for (let read = 0; read < nums.length; read++) {
    if (write < 2 || nums[read] !== nums[write - 2]) {
      nums[write] = nums[read];
      write++;
    }
  }
  return nums.slice(0, write);
}`,
      tests: [
        { name: 'classic', args: [[1, 1, 1, 2, 2, 3]], expected: [1, 1, 2, 2, 3] },
        { name: 'long run in the middle', args: [[0, 0, 1, 1, 1, 1, 2, 3, 3]], expected: [0, 0, 1, 1, 2, 3, 3] },
        { name: 'overwrite trap', args: [[1, 1, 1, 2, 2, 2, 3]], expected: [1, 1, 2, 2, 3] },
        { name: 'single', args: [[1]], expected: [1] },
        { name: 'two same', args: [[1, 1]], expected: [1, 1] },
        { name: 'all the same', args: [[2, 2, 2, 2]], expected: [2, 2] },
        { name: 'no repeats', args: [[1, 2, 3]], expected: [1, 2, 3] },
      ],
      takeaway: "To allow at most k copies in sorted data, compare with the kept value k steps back.",
    },
    {
      id: 'two-pointers-backspace-compare',
      title: 'Backspace String Compare',
      difficulty: 'easy',
      leetcode: 844,
      pattern: 'Two pointers (from the back)',
      statement:
        "Two people type into chat boxes, and `#` means they pressed backspace. A backspace on an empty box does nothing. Given what each person typed, `s` and `t`, return `true` if both boxes end up showing the same text. Try to use O(1) extra memory.",
      examples: [
        { input: 's = "ab#c", t = "ad#c"', output: 'true', explain: 'Both become "ac".' },
        { input: 's = "ab##", t = "c#d#"', output: 'true', explain: 'Both become empty.' },
        { input: 's = "a#c", t = "b"', output: 'false', explain: '"c" is not "b".' },
      ],
      constraints: ['1 ≤ s.length, t.length ≤ 200', 's and t contain lowercase letters and #'],
      hints: [
        "The easy way: build each final text with an array as a stack (push letters, pop on `#`). That's O(n) memory.",
        "A `#` only affects characters **before** it. Which direction makes it easy to know what gets deleted?",
        "Walk both strings from the back. Keep a `skip` counter: `#` adds one, a letter with `skip > 0` uses one up. The first letter you reach with `skip = 0` is a real one. Compare real letters pair by pair.",
      ],
      approaches: [
        {
          name: 'Build both texts',
          idea: "Replay the typing for each string with an array: push letters, pop on `#`. Then compare the two results. Correct and clear, but uses O(n + m) memory.",
          time: 'O(n + m)',
          space: 'O(n + m)',
        },
        {
          name: 'Two pointers from the back',
          idea: "From the back you see each `#` before the letter it deletes, so a simple counter tells you what to skip. Find the next surviving letter in each string and compare. Any mismatch, or one string running out first, means the texts differ.",
          pseudo: `function backspaceCompare(s, t):
    i ← length of s - 1
    j ← length of t - 1
    while true:
        i ← nextReal(s, i)
        j ← nextReal(t, j)
        if i < 0 and j < 0: return true    // both used up
        if i < 0 or j < 0: return false    // one ran out first
        if s[i] ≠ t[j]: return false
        i ← i - 1
        j ← j - 1

function nextReal(str, i):    // index of next surviving char, or -1
    skip ← 0
    while i ≥ 0:
        if str[i] = '#':
            skip ← skip + 1
        else if skip > 0:
            skip ← skip - 1                 // this letter was deleted
        else:
            return i
        i ← i - 1
    return -1`,
          code: `function backspaceCompare(s, t) {
  const nextReal = (str, i) => {
    let skip = 0;
    while (i >= 0) {
      if (str[i] === '#') skip++;
      else if (skip > 0) skip--;
      else return i;
      i--;
    }
    return -1;
  };
  let i = s.length - 1;
  let j = t.length - 1;
  while (true) {
    i = nextReal(s, i);
    j = nextReal(t, j);
    if (i < 0 && j < 0) return true;
    if (i < 0 || j < 0) return false;
    if (s[i] !== t[j]) return false;
    i--;
    j--;
  }
}`,
          time: 'O(n + m)',
          space: 'O(1)',
        },
      ],
      fn: 'backspaceCompare',
      starter: `function backspaceCompare(s, t) {
  // '#' deletes the character before it; do both texts end up equal?
  return false;
}`,
      solution: `function backspaceCompare(s, t) {
  const nextReal = (str, i) => {
    let skip = 0;
    while (i >= 0) {
      if (str[i] === '#') skip++;
      else if (skip > 0) skip--;
      else return i;
      i--;
    }
    return -1;
  };
  let i = s.length - 1;
  let j = t.length - 1;
  while (true) {
    i = nextReal(s, i);
    j = nextReal(t, j);
    if (i < 0 && j < 0) return true;
    if (i < 0 || j < 0) return false;
    if (s[i] !== t[j]) return false;
    i--;
    j--;
  }
}`,
      tests: [
        { name: 'both become ac', args: ['ab#c', 'ad#c'], expected: true },
        { name: 'both become empty', args: ['ab##', 'c#d#'], expected: true },
        { name: 'different letters', args: ['a#c', 'b'], expected: false },
        { name: 'backspace on empty box', args: ['a##c', '#a#c'], expected: true },
        { name: 'longer, equal', args: ['bxj##tw', 'bxo#j##tw'], expected: true },
        { name: 'different lengths', args: ['a', 'aa#a'], expected: false },
        { name: 'no backspaces', args: ['abc', 'abc'], expected: true },
        { name: 'one empty, one not', args: ['a#', 'b'], expected: false },
      ],
      takeaway: "When later items cancel earlier ones, walk from the back and count what to skip.",
    },
  ],
  quiz: [
    {
      prompt: "You run Remove Duplicates on `[2, 2, 3, 3, 3, 5]`. What is `k`, and what are the first `k` cells?",
      options: ['k = 3, `[2, 3, 5]`', 'k = 6, `[2, 2, 3, 3, 3, 5]`', 'k = 2, `[2, 3]`', 'k = 3, `[2, 2, 3]`'],
      answer: 0,
      explanation: "Each distinct value is kept once: 2, 3, 5. So `write` ends at 3.",
    },
    {
      prompt: 'In the read/write pattern, what is true about every cell to the left of `write`?',
      options: [
        'It holds the finished answer, in order',
        'It holds values not read yet',
        'It is always zero',
        'It is junk that will be overwritten',
      ],
      answer: 0,
      explanation: "`write` only moves after a keeper is copied in, so the part before it is always the finished, ordered answer so far.",
    },
    {
      prompt: 'Why does Backspace String Compare walk from the back?',
      options: [
        'A `#` deletes what comes before it, so from the back you know what to skip before you reach it',
        'Strings in JavaScript can only be read backwards',
        'It is faster to compare the last letters',
        'It avoids having to lowercase the strings',
      ],
      answer: 0,
      explanation: "Walking forward, you would only learn a letter is deleted after you've passed it. Walking backward, the `#` comes first, so a counter is enough.",
    },
  ],
  takeaways: [
    "In-place cleanup = `read` scans everything, `write` marks the end of the finished part.",
    "Change only the keep rule: not a repeat, not zero, at most two copies.",
    "Compare with what you kept (`a[write - 1]`, `a[write - 2]`), never with cells you may have overwritten.",
    "If later items cancel earlier ones, run the pointers from the back.",
  ],
};
