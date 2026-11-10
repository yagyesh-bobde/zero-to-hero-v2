import type { Lesson } from '../types';

// Module 8, lesson 3: merge sort. Split in half, trust the two calls, merge with two fingers.
const lesson: Lesson = {
  id: 'merge-sort',
  title: 'Merge sort: split, trust, merge',
  summary: 'Sorting two halves and merging them beats comparing everything with everything: O(n log n).',
  minutes: 25,
  blocks: [
    {
      kind: 'callout',
      tone: 'story',
      title: 'The librarian and 1,000 cards',
      text: "A librarian has a pile of 1,000 return cards to put in order. She does not sort them herself. She splits the pile in half and hands each half to a helper. Each helper does the same thing, and so on, until someone gets **one card**: one card is already in order, so they just hand it back. Now the piles come back up, and each person only has to **merge two sorted piles**. That part is easy: look at the top card of each pile and take the smaller one.",
    },
    {
      kind: 'text',
      text: "**The problem.** Sort `[5, 2, 4, 7, 1, 3, 2, 6]` from small to big **without** calling the built-in `sort`. Interviews ask this directly (\"implement a sort in O(n log n)\"). It also matters later in this lesson: some problems need you to do extra work *inside* the sort, which a built-in sort will not let you do. The real input can have up to `n = 5·10⁴` numbers.",
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Brute force: selection sort',
      code: `function selectionSort(nums):
    for i from 0 to n - 2:
        best ← i                        // index of the smallest so far
        for j from i + 1 to n - 1:
            if nums[j] < nums[best]:
                best ← j
        swap nums[i] and nums[best]     // smallest of the rest goes to slot i
    return nums`,
    },
    {
      kind: 'text',
      text: "This works, and so does insertion sort (slide each new number left until it fits). Both cost **O(n²)**. For `n = 5·10⁴` that is on the order of `n² = 2.5·10⁹` steps. Even half of that is over a billion comparisons, which is far past a one-second time limit.",
    },
    {
      kind: 'text',
      text: "**Spot the waste.** Selection sort scans the whole rest of the array just to find **one** number, then forgets everything it saw and scans again. But there is a job that is cheap: **merging two lists that are already sorted**. Put one finger on the front of each list, take the smaller number, move that finger. Every step places one number, so merging `n` numbers costs only `O(n)`. You did exactly this with linked lists in module 7.",
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'Split in half, trust the calls, merge',
      text: "To sort a range: cut it in half, **sort each half with the same function** (trust that the smaller calls work, like in lesson 1), then merge the two sorted halves with two fingers. The base case: a range of 0 or 1 numbers is already sorted. All the real work happens in the merge.",
    },
    {
      kind: 'steps',
      title: 'Merge sort on [5, 2, 4, 7, 1, 3, 2, 6], merge by merge',
      frames: [
        {
          cells: [5, 2, 4, 7, 1, 3, 2, 6],
          vars: { call: 'sort(0, 7)' },
          note: "`sort(0, 7)` splits into `0..3` and `4..7`, and those keep splitting until every piece is one number. One number is already sorted, so nothing changes yet.",
        },
        {
          cells: [2, 5, 4, 7, 1, 3, 2, 6],
          active: [0, 1],
          vars: { merge: '[5] + [2]' },
          note: 'First merge on the way back up: `[5]` and `[2]` become `[2, 5]`.',
        },
        {
          cells: [2, 5, 4, 7, 1, 3, 2, 6],
          active: [2, 3],
          vars: { merge: '[4] + [7]' },
          note: '`[4]` and `[7]` are already in order. The merge just copies them back as `[4, 7]`.',
        },
        {
          cells: [2, 4, 5, 7, 1, 3, 2, 6],
          active: [0, 1, 2, 3],
          vars: { merge: '[2, 5] + [4, 7]' },
          note: 'Both halves of `0..3` are sorted now, so one merge gives `[2, 4, 5, 7]`. The left half is done.',
        },
        {
          cells: [2, 4, 5, 7, 1, 3, 2, 6],
          active: [4, 5],
          done: [0, 1, 2, 3],
          vars: { merge: '[1] + [3]' },
          note: 'Now the right half, the same way. `[1]` and `[3]` stay `[1, 3]`.',
        },
        {
          cells: [2, 4, 5, 7, 1, 3, 2, 6],
          active: [6, 7],
          done: [0, 1, 2, 3],
          vars: { merge: '[2] + [6]' },
          note: '`[2]` and `[6]` stay `[2, 6]`.',
        },
        {
          cells: [2, 4, 5, 7, 1, 2, 3, 6],
          active: [4, 5, 6, 7],
          done: [0, 1, 2, 3],
          vars: { merge: '[1, 3] + [2, 6]' },
          note: 'Merge the two right quarters: `[1, 2, 3, 6]`. Both halves of the whole array are sorted.',
        },
        {
          cells: [1, 2, 2, 3, 4, 5, 6, 7],
          found: [0, 1, 2, 3, 4, 5, 6, 7],
          vars: { merge: '[2, 4, 5, 7] + [1, 2, 3, 6]' },
          note: 'The last merge joins the two sorted halves. Seven merges in total, and each one walked over its numbers only once.',
        },
      ],
    },
    {
      kind: 'trace',
      title: 'The last merge: left = [2, 4, 5, 7], right = [1, 2, 3, 6]',
      columns: ['step', 'left finger', 'right finger', 'take', 'merged so far'],
      rows: [
        [1, 2, 1, '1 (right)', '1'],
        [2, 2, 2, '2 (left, tie)', '1 2'],
        [3, 4, 2, '2 (right)', '1 2 2'],
        [4, 4, 3, '3 (right)', '1 2 2 3'],
        [5, 4, 6, '4 (left)', '1 2 2 3 4'],
        [6, 5, 6, '5 (left)', '1 2 2 3 4 5'],
        [7, 7, 6, '6 (right)', '1 2 2 3 4 5 6'],
        [8, 7, '—', '7 (rest of left)', '1 2 2 3 4 5 6 7'],
      ],
      note: "8 numbers, 8 steps. When one side runs out, copy the rest of the other side: it is already sorted. On the tie in step 2 we take from the **left**. That detail matters below.",
    },
    {
      kind: 'diagram',
      title: 'Why it is n log n: same work on every level',
      art: `split (free)                      merge work
[5 2 4 7 1 3 2 6]                 8
[5 2 4 7]        [1 3 2 6]        4 + 4 = 8
[5 2]  [4 7]     [1 3]  [2 6]     2+2+2+2 = 8
[5][2] [4][7]    [1][3] [2][6]    base case: 0

3 levels of merges × 8 work each = 24 steps
in general: n work per level × log₂ n levels
          = O(n log n)`,
      caption: "Read the merges bottom-up: each row is built by merging the row under it, and every row holds all `n` numbers, so each level costs `n`. Halving `n` until you reach 1 takes `log₂ n` levels. For `n = 5·10⁴` that is about `5·10⁴ × 16 ≈ 8·10⁵` steps instead of `2.5·10⁹`.",
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Merge sort (one shared temp array)',
      code: `function sortArray(nums):
    temp ← array of n empty slots       // scratch space, shared
    sort(0, n - 1)
    return nums

function sort(lo, hi):
    if lo ≥ hi:                         // 0 or 1 number: already sorted
        return
    mid ← floor((lo + hi) / 2)
    sort(lo, mid)                       // trust: left half is sorted
    sort(mid + 1, hi)                   // trust: right half is sorted
    merge(lo, mid, hi)

function merge(lo, mid, hi):
    i ← lo                              // finger in the left half
    j ← mid + 1                         // finger in the right half
    k ← lo                              // next free slot in temp
    while i ≤ mid and j ≤ hi:
        if nums[i] ≤ nums[j]:           // tie → take left (stable)
            temp[k] ← nums[i]
            i ← i + 1
        else:
            temp[k] ← nums[j]
            j ← j + 1
        k ← k + 1
    copy what is left of nums[i..mid] into temp, then nums[j..hi]
    copy temp[lo..hi] back into nums[lo..hi]`,
    },
    {
      kind: 'code',
      lang: 'js',
      code: `function sortArray(nums) {
  const temp = new Array(nums.length);

  function sort(lo, hi) {
    if (lo >= hi) return; // 0 or 1 number: already sorted
    const mid = Math.floor((lo + hi) / 2);
    sort(lo, mid);
    sort(mid + 1, hi);
    merge(lo, mid, hi);
  }

  function merge(lo, mid, hi) {
    let i = lo;
    let j = mid + 1;
    let k = lo;
    while (i <= mid && j <= hi) {
      if (nums[i] <= nums[j]) temp[k++] = nums[i++]; // tie: take left
      else temp[k++] = nums[j++];
    }
    while (i <= mid) temp[k++] = nums[i++];
    while (j <= hi) temp[k++] = nums[j++];
    for (let x = lo; x <= hi; x++) nums[x] = temp[x];
  }

  sort(0, nums.length - 1);
  return nums;
}`,
    },
    {
      kind: 'compare',
      title: 'Sorting n numbers yourself',
      rows: [
        { approach: 'Selection sort', time: 'O(n²)', space: 'O(1)', note: 'Rescans the rest of the array for every slot.' },
        { approach: 'Insertion sort', time: 'O(n²)', space: 'O(1)', note: 'Fast on nearly sorted input, but reversed input is the worst case.' },
        { approach: 'Merge sort, new arrays each call', time: 'O(n log n)', space: 'O(n)', note: 'Easy to write with `slice`, but it creates many short-lived arrays.' },
        { approach: 'Merge sort, one shared temp array', time: 'O(n log n)', space: 'O(n)', note: 'Same speed, one allocation. The classic version, and the one above.' },
      ],
    },
    {
      kind: 'callout',
      tone: 'tip',
      title: 'Why `<=` and not `<`: stability',
      text: "A sort is **stable** when equal items keep the order they came in. Think of a game leaderboard sorted by score: Ana and Ben both have 90, and Ana got there first, so she should stay above Ben. In the merge, everything in the left half came earlier than everything in the right half. So on a tie, taking from the **left** (`nums[i] <= nums[j]`) keeps equal items in their old order. Lesson 6 goes deeper into stability.",
    },
    {
      kind: 'text',
      text: "**When to reach for merge sort.** You must sort without the built-in (or sort a linked list, where you cannot jump to an index). Or the question is about **pairs across positions**, like \"how many pairs are out of order\", where brute force checks every pair. While merging, every number in the left half sits before every number in the right half, so you can count or check cross pairs in bulk. And whenever you hold several **already sorted** lists (log files from many servers, two friends' ranked playlists), merging beats re-sorting.",
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Template: merge sort with extra work in the merge',
      code: `function solve(lo, hi):
    if lo ≥ hi:
        return 0                        // or: nothing to do
    mid ← floor((lo + hi) / 2)
    answer ← solve(lo, mid) + solve(mid + 1, hi)
    // both halves are sorted now: answer questions about
    // pairs (left item, right item) while you merge them
    answer ← answer + work done during merge(lo, mid, hi)
    return answer`,
    },
    {
      kind: 'callout',
      tone: 'trap',
      title: 'Three ways to break merge sort',
      text: "**1. `<` instead of `<=`** still sorts numbers, but on ties it takes from the right, so equal items swap order: the sort is no longer stable. **2. A split that never shrinks.** With `mid = floor((lo + hi) / 2)` the halves must be `lo..mid` and `mid+1..hi`. If you write `lo..mid-1` and `mid..hi`, the range `0..1` gives `mid = 0`, so the right half is `0..1` again. Same call forever, then a stack overflow. **3. Too many slices.** `mergeSort(a.slice(0, mid))` is fine for learning, but it allocates new arrays in every call. One shared `temp` array is the classic fix.",
    },
  ],
  problems: [
    {
      id: 'recursion-sort-array',
      title: 'Sort an array without the built-in sort',
      difficulty: 'medium',
      leetcode: 912,
      pattern: 'Divide and conquer (merge sort)',
      statement: "Your team's code runs on a tiny device whose JavaScript has no working `sort`. Write `sortArray(nums)` that returns the numbers in ascending order. It must be fast enough for 50,000 numbers, so aim for `O(n log n)` time. Do not call `nums.sort`.",
      examples: [
        { input: 'nums = [5, 2, 3, 1]', output: '[1, 2, 3, 5]' },
        { input: 'nums = [5, 1, 1, 2, 0, 0]', output: '[0, 0, 1, 1, 2, 5]', explain: 'Duplicates stay, each one in its place.' },
      ],
      constraints: ['1 ≤ n ≤ 5·10⁴', '-5·10⁴ ≤ nums[i] ≤ 5·10⁴', 'Do not use the built-in sort.'],
      hints: [
        'Merging two sorted arrays takes only `O(n)` with two fingers. Can you get two sorted arrays cheaply?',
        'Split the array in half and call your own function on each half. A range of 0 or 1 numbers is your base case.',
        'Use `mid = Math.floor((lo + hi) / 2)` and the halves `lo..mid` and `mid+1..hi`. Merge into one shared `temp` array, then copy back. On ties take from the left.',
      ],
      approaches: [
        {
          name: 'Selection or insertion sort',
          idea: 'Insertion sort grows a sorted prefix: take the next number and slide it left past every bigger number. It is correct and uses no extra memory, but each number may slide past all the earlier ones, so reversed input costs about `n²/2` moves. Selection sort has the same `O(n²)` cost.',
          code: `function sortArray(nums) {
  for (let i = 1; i < nums.length; i++) {
    const x = nums[i];
    let j = i - 1;
    while (j >= 0 && nums[j] > x) {
      nums[j + 1] = nums[j]; // shift bigger numbers right
      j--;
    }
    nums[j + 1] = x;
  }
  return nums;
}`,
          time: 'O(n²)',
          space: 'O(1)',
        },
        {
          name: 'Merge sort',
          idea: "Sort each half with the same function (trust it), then merge the two sorted halves with two fingers in `O(n)`. Every level of the split holds all `n` numbers, and there are `log₂ n` levels, so the total is `O(n log n)`. Taking from the left on ties keeps the sort stable.",
          pseudo: `function sortArray(nums):
    temp ← array of n empty slots
    sort(0, n - 1)
    return nums

function sort(lo, hi):
    if lo ≥ hi:
        return
    mid ← floor((lo + hi) / 2)
    sort(lo, mid)
    sort(mid + 1, hi)
    i ← lo
    j ← mid + 1
    k ← lo
    while i ≤ mid and j ≤ hi:
        if nums[i] ≤ nums[j]:
            temp[k] ← nums[i]
            i ← i + 1
        else:
            temp[k] ← nums[j]
            j ← j + 1
        k ← k + 1
    copy the rest of nums[i..mid], then nums[j..hi], into temp
    copy temp[lo..hi] back into nums[lo..hi]`,
          code: `function sortArray(nums) {
  const temp = new Array(nums.length);

  function sort(lo, hi) {
    if (lo >= hi) return;
    const mid = Math.floor((lo + hi) / 2);
    sort(lo, mid);
    sort(mid + 1, hi);
    let i = lo;
    let j = mid + 1;
    let k = lo;
    while (i <= mid && j <= hi) {
      if (nums[i] <= nums[j]) temp[k++] = nums[i++];
      else temp[k++] = nums[j++];
    }
    while (i <= mid) temp[k++] = nums[i++];
    while (j <= hi) temp[k++] = nums[j++];
    for (let x = lo; x <= hi; x++) nums[x] = temp[x];
  }

  sort(0, nums.length - 1);
  return nums;
}`,
          time: 'O(n log n)',
          space: 'O(n)',
        },
      ],
      fn: 'sortArray',
      starter: `function sortArray(nums) {
  // split in half, sort each half, merge them
  return nums;
}`,
      solution: `function sortArray(nums) {
  const temp = new Array(nums.length);

  function sort(lo, hi) {
    if (lo >= hi) return;
    const mid = Math.floor((lo + hi) / 2);
    sort(lo, mid);
    sort(mid + 1, hi);
    let i = lo;
    let j = mid + 1;
    let k = lo;
    while (i <= mid && j <= hi) {
      if (nums[i] <= nums[j]) temp[k++] = nums[i++];
      else temp[k++] = nums[j++];
    }
    while (i <= mid) temp[k++] = nums[i++];
    while (j <= hi) temp[k++] = nums[j++];
    for (let x = lo; x <= hi; x++) nums[x] = temp[x];
  }

  sort(0, nums.length - 1);
  return nums;
}`,
      tests: [
        { name: 'example', args: [[5, 2, 3, 1]], expected: [1, 2, 3, 5] },
        { name: 'the walkthrough array', args: [[5, 2, 4, 7, 1, 3, 2, 6]], expected: [1, 2, 2, 3, 4, 5, 6, 7] },
        { name: 'one element', args: [[42]], expected: [42] },
        { name: 'already sorted', args: [[1, 2, 3, 4, 5, 6]], expected: [1, 2, 3, 4, 5, 6] },
        { name: 'reversed', args: [[9, 8, 7, 6, 5, 4, 3, 2, 1]], expected: [1, 2, 3, 4, 5, 6, 7, 8, 9] },
        { name: 'duplicates', args: [[5, 1, 1, 2, 0, 0]], expected: [0, 0, 1, 1, 2, 5] },
        { name: 'negatives', args: [[3, -1, 0, -7, 2, -50000]], expected: [-50000, -7, -1, 0, 2, 3] },
        { name: 'all equal', args: [[4, 4, 4, 4, 4]], expected: [4, 4, 4, 4, 4] },
        {
          name: '30 mixed numbers',
          args: [[12, -5, 33, 0, 7, 7, -20, 15, 3, 99, -1, 42, 8, 0, -5, 61, 27, 3, 18, -9, 50, 7, 1, -30, 22, 0, 11, 4, -2, 6]],
          expected: [-30, -20, -9, -5, -5, -2, -1, 0, 0, 0, 1, 3, 3, 4, 6, 7, 7, 7, 8, 11, 12, 15, 18, 22, 27, 33, 42, 50, 61, 99],
        },
      ],
      takeaway: 'Merge sort = split in half, trust both calls, merge with two fingers. `n` work per level, `log n` levels.',
    },
    {
      id: 'recursion-sort-list',
      title: 'Sort a linked list',
      difficulty: 'medium',
      leetcode: 148,
      pattern: 'Divide and conquer (merge sort on a list)',
      statement: "A music app keeps your listening history as a linked list of song lengths in seconds. Return the list sorted from shortest to longest. Aim for `O(n log n)` time. You cannot jump to the middle of a linked list by index, so pick a sort that does not need to.",
      examples: [
        { input: 'head = 4 → 2 → 1 → 3', output: '1 → 2 → 3 → 4' },
        { input: 'head = -1 → 5 → 3 → 4 → 0', output: '-1 → 0 → 3 → 4 → 5' },
        { input: 'head = empty', output: 'empty' },
      ],
      constraints: ['0 ≤ n ≤ 5·10⁴', '-10⁵ ≤ val ≤ 10⁵'],
      hints: [
        'Merge sort only ever walks forward through its input. That suits a linked list perfectly.',
        'Find the middle with slow/fast pointers (module 7): `slow` moves 1 step, `fast` moves 2. Cut the list after `slow`.',
        'Start `fast` at `head.next`, not `head`. Then a 2-node list splits into 1 + 1. Sort both halves, then merge them with a dummy node.',
      ],
      approaches: [
        {
          name: 'Copy into an array, sort, write back',
          idea: 'Walk the list and copy the values into an array, sort it with `(a, b) => a - b`, then walk the list again and write the sorted values back into the nodes. Correct and short, but it needs `O(n)` extra memory and leans on the built-in sort.',
          code: `function sortList(head) {
  const vals = [];
  for (let node = head; node; node = node.next) vals.push(node.val);
  vals.sort((a, b) => a - b);
  let node = head;
  for (const v of vals) {
    node.val = v;
    node = node.next;
  }
  return head;
}`,
          time: 'O(n log n)',
          space: 'O(n)',
        },
        {
          name: 'Merge sort on the list',
          idea: "Find the middle with slow/fast pointers and cut the list in two. Trust `sortList` to sort each half, then merge the two sorted halves by re-linking nodes behind a dummy node. Splitting and merging both just walk forward, so the list never needs indexes. The only extra memory is the recursion stack, `log n` calls deep. (A bottom-up version that merges runs of 1, 2, 4, … with loops gets this down to `O(1)` extra space, but it is much fiddlier.)",
          pseudo: `function sortList(head):
    if head = null or head.next = null:
        return head                     // 0 or 1 node: sorted
    slow ← head
    fast ← head.next                    // so 2 nodes split 1 + 1
    while fast ≠ null and fast.next ≠ null:
        slow ← slow.next
        fast ← fast.next.next
    right ← slow.next
    slow.next ← null                    // cut into two lists
    return merge(sortList(head), sortList(right))

function merge(a, b):
    dummy ← new node(0)
    tail ← dummy
    while a ≠ null and b ≠ null:
        if a.val ≤ b.val:
            tail.next ← a
            a ← a.next
        else:
            tail.next ← b
            b ← b.next
        tail ← tail.next
    tail.next ← a if a ≠ null, otherwise b
    return dummy.next`,
          code: `function sortList(head) {
  if (!head || !head.next) return head;
  let slow = head;
  let fast = head.next;
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
  }
  const right = slow.next;
  slow.next = null; // cut
  return merge(sortList(head), sortList(right));
}

function merge(a, b) {
  const dummy = new ListNode(0);
  let tail = dummy;
  while (a && b) {
    if (a.val <= b.val) {
      tail.next = a;
      a = a.next;
    } else {
      tail.next = b;
      b = b.next;
    }
    tail = tail.next;
  }
  tail.next = a ?? b;
  return dummy.next;
}`,
          time: 'O(n log n)',
          space: 'O(log n)',
        },
      ],
      fn: 'sortList',
      starter: `function sortList(head) {
  // find the middle, cut, sort both halves, merge
  return head;
}`,
      solution: `function sortList(head) {
  if (!head || !head.next) return head;
  let slow = head;
  let fast = head.next;
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
  }
  const right = slow.next;
  slow.next = null;
  return merge(sortList(head), sortList(right));
}

function merge(a, b) {
  const dummy = new ListNode(0);
  let tail = dummy;
  while (a && b) {
    if (a.val <= b.val) {
      tail.next = a;
      a = a.next;
    } else {
      tail.next = b;
      b = b.next;
    }
    tail = tail.next;
  }
  tail.next = a ?? b;
  return dummy.next;
}`,
      tests: [
        { name: 'example', args: [[4, 2, 1, 3]], expected: [1, 2, 3, 4] },
        { name: 'empty list', args: [[]], expected: [] },
        { name: 'one node', args: [[7]], expected: [7] },
        { name: 'two nodes', args: [[2, 1]], expected: [1, 2] },
        { name: 'negatives', args: [[-1, 5, 3, 4, 0]], expected: [-1, 0, 3, 4, 5] },
        { name: 'duplicates', args: [[3, 1, 3, 2, 1, 2]], expected: [1, 1, 2, 2, 3, 3] },
        { name: 'already sorted', args: [[1, 2, 3, 4, 5, 6, 7]], expected: [1, 2, 3, 4, 5, 6, 7] },
        { name: 'reversed', args: [[10, 9, 8, 7, 6, 5, 4, 3, 2, 1]], expected: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
      ],
      shapes: { args: ['list'], result: 'list' },
      takeaway: 'Linked lists love merge sort: splitting (slow/fast) and merging (dummy node) only ever walk forward.',
    },
    {
      id: 'recursion-count-inversions',
      title: 'How unsorted is your playlist ranking?',
      difficulty: 'medium',
      pattern: 'Divide and conquer (count while merging)',
      statement: "The official chart ranks some songs 1, 2, 3, … You made your own top list of the same songs, and for each song in your order you wrote down its chart rank: `ranks`. A pair of positions `i < j` is an **inversion** when `ranks[i] > ranks[j]`: you put those two songs in the opposite order from the chart. Return the number of inversions. Equal ranks are **not** an inversion. 0 means you agree with the chart completely. This count is a real way to compare two rankings (it is called the Kendall tau distance).",
      examples: [
        {
          input: 'ranks = [2, 4, 1, 3, 5]',
          output: '3',
          explain: 'The out-of-order pairs are (2, 1), (4, 1) and (4, 3).',
        },
        { input: 'ranks = [2, 2, 1]', output: '2', explain: 'Both 2s are before the 1. The two 2s together do not count.' },
      ],
      constraints: ['0 ≤ n ≤ 5·10⁴', '-10⁹ ≤ ranks[i] ≤ 10⁹ (any integers work, not just 1..n)','The answer fits in a normal JS number.'],
      hints: [
        'Brute force checks every pair `i < j`. That is `O(n²)`. Which pairs could you count in bulk?',
        'Split in half. An inversion is either inside the left half, inside the right half, or crosses the middle. Trust the calls for the first two kinds.',
        'Count the crossing pairs while you merge the two sorted halves. When you take a number from the **right** half, every number still waiting in the left half is bigger than it, and each of those is an inversion: add `mid - i + 1`.',
      ],
      approaches: [
        {
          name: 'Check every pair',
          idea: 'Two loops: for every `i`, look at every `j > i` and count when `ranks[i] > ranks[j]`. It counts exactly what the question asks, but it looks at about `n²/2` pairs.',
          code: `function countInversions(ranks) {
  let count = 0;
  for (let i = 0; i < ranks.length; i++) {
    for (let j = i + 1; j < ranks.length; j++) {
      if (ranks[i] > ranks[j]) count++;
    }
  }
  return count;
}`,
          time: 'O(n²)',
          space: 'O(1)',
        },
        {
          name: 'Merge sort, count while merging',
          idea: "Sorting each half does not change which pairs cross the middle: every left item still came before every right item. So sort both halves (counting their inner inversions on the way), then merge. When the right finger's number is smaller than the left finger's number, it is also smaller than everything after the left finger (the left half is sorted). That is `mid - i + 1` inversions in one step. On a tie we take from the left first, so equal ranks are never counted.",
          pseudo: `function countInversions(ranks):
    a ← copy of ranks
    temp ← array of n empty slots
    return count(0, n - 1)

function count(lo, hi):
    if lo ≥ hi:
        return 0
    mid ← floor((lo + hi) / 2)
    total ← count(lo, mid) + count(mid + 1, hi)
    i ← lo
    j ← mid + 1
    k ← lo
    while i ≤ mid and j ≤ hi:
        if a[i] ≤ a[j]:                 // not an inversion
            temp[k] ← a[i]
            i ← i + 1
        else:                           // a[i..mid] are all > a[j]
            total ← total + (mid - i + 1)
            temp[k] ← a[j]
            j ← j + 1
        k ← k + 1
    copy the rest of a[i..mid], then a[j..hi], into temp
    copy temp[lo..hi] back into a[lo..hi]
    return total`,
          code: `function countInversions(ranks) {
  const a = ranks.slice();
  const temp = new Array(a.length);

  function count(lo, hi) {
    if (lo >= hi) return 0;
    const mid = Math.floor((lo + hi) / 2);
    let total = count(lo, mid) + count(mid + 1, hi);
    let i = lo;
    let j = mid + 1;
    let k = lo;
    while (i <= mid && j <= hi) {
      if (a[i] <= a[j]) {
        temp[k++] = a[i++];
      } else {
        total += mid - i + 1; // everything left of the cut is bigger
        temp[k++] = a[j++];
      }
    }
    while (i <= mid) temp[k++] = a[i++];
    while (j <= hi) temp[k++] = a[j++];
    for (let x = lo; x <= hi; x++) a[x] = temp[x];
    return total;
  }

  return count(0, a.length - 1);
}`,
          time: 'O(n log n)',
          space: 'O(n)',
        },
      ],
      fn: 'countInversions',
      starter: `function countInversions(ranks) {
  // count pairs i < j with ranks[i] > ranks[j]
  return 0;
}`,
      solution: `function countInversions(ranks) {
  const a = ranks.slice();
  const temp = new Array(a.length);

  function count(lo, hi) {
    if (lo >= hi) return 0;
    const mid = Math.floor((lo + hi) / 2);
    let total = count(lo, mid) + count(mid + 1, hi);
    let i = lo;
    let j = mid + 1;
    let k = lo;
    while (i <= mid && j <= hi) {
      if (a[i] <= a[j]) {
        temp[k++] = a[i++];
      } else {
        total += mid - i + 1;
        temp[k++] = a[j++];
      }
    }
    while (i <= mid) temp[k++] = a[i++];
    while (j <= hi) temp[k++] = a[j++];
    for (let x = lo; x <= hi; x++) a[x] = temp[x];
    return total;
  }

  return count(0, a.length - 1);
}`,
      tests: [
        { name: 'example', args: [[2, 4, 1, 3, 5]], expected: 3 },
        { name: 'already sorted', args: [[1, 2, 3, 4, 5]], expected: 0 },
        { name: 'reversed (n(n-1)/2)', args: [[5, 4, 3, 2, 1]], expected: 10 },
        { name: 'ties are not inversions', args: [[2, 2, 1]], expected: 2 },
        { name: 'all equal', args: [[1, 1, 1]], expected: 0 },
        { name: 'one song', args: [[7]], expected: 0 },
        { name: 'empty', args: [[]], expected: 0 },
        { name: 'reversed with negatives', args: [[5, 4, 3, 2, 1, 0, -1, -2]], expected: 28 },
        {
          name: '30 ranks with repeats',
          args: [[4, 4, 9, 1, 9, -3, 0, 4, 7, 2, 2, 8, -3, 5, 6, 1, 0, 9, 3, 3, -1, 4, 8, 7, 2, 6, 5, 1, 0, -2]],
          expected: 228,
        },
      ],
      takeaway: 'To count pairs across positions, count them in bulk while merging: one step from the right covers every item left in the left half.',
    },
    {
      id: 'recursion-merge-k-sorted',
      title: 'Merge k sorted server logs (stretch)',
      difficulty: 'hard',
      leetcode: 23,
      pattern: 'Divide and conquer (merge in pairs)',
      statement: "**Stretch problem.** You run `k` servers, and each one gives you its log timestamps already sorted. Merge them all into **one** sorted array. `lists` is an array of `k` sorted arrays; some may be empty, and `k` may be 0. (LeetCode's version uses linked lists. Here each list is an array so the test runner can feed it, but the idea is the same: merging two sorted lists from module 7.)",
      examples: [
        { input: 'lists = [[1, 4, 5], [1, 3, 4], [2, 6]]', output: '[1, 1, 2, 3, 4, 4, 5, 6]' },
        { input: 'lists = []', output: '[]', explain: 'No servers, no logs.' },
        { input: 'lists = [[], [3, 8], []]', output: '[3, 8]' },
      ],
      constraints: ['0 ≤ k ≤ 10⁴', 'total number of timestamps N ≤ 10⁴', 'each list is sorted ascending', '-10⁴ ≤ value ≤ 10⁴'],
      hints: [
        'You already know how to merge **two** sorted lists in `O(length)`. How do you use that for `k` lists?',
        'Merging list 1 into the result, then list 2, then list 3… works, but the result gets re-walked `k` times.',
        'Think of the lists like merge sort\'s pieces: merge them in pairs (1+2, 3+4, …), then merge the results in pairs, until one list is left. Recursively: merge `lists[lo..mid]`, merge `lists[mid+1..hi]`, then merge those two.',
      ],
      approaches: [
        {
          name: 'Concatenate and sort',
          idea: 'Glue every list into one big array and sort it. Correct and short, but it throws away the fact that each list is already sorted. `N` is the total number of timestamps.',
          code: `function mergeKSorted(lists) {
  return lists.flat().sort((a, b) => a - b);
}`,
          time: 'O(N log N)',
          space: 'O(N)',
        },
        {
          name: 'Merge one by one',
          idea: 'Keep a growing result and merge each list into it with two fingers. Each merge walks the whole result so far, and the result keeps growing, so early timestamps get walked over up to `k` times.',
          code: `function mergeKSorted(lists) {
  let result = [];
  for (const list of lists) result = mergeTwo(result, list);
  return result;
}

function mergeTwo(a, b) {
  const out = [];
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] <= b[j]) out.push(a[i++]);
    else out.push(b[j++]);
  }
  while (i < a.length) out.push(a[i++]);
  while (j < b.length) out.push(b[j++]);
  return out;
}`,
          time: 'O(N·k)',
          space: 'O(N)',
        },
        {
          name: 'Divide and conquer: merge in pairs',
          idea: "Treat the `k` lists like the pieces at the bottom of merge sort. Merge the left half of the lists, merge the right half (trust both calls), then merge those two results. Every timestamp takes part in one merge per level, and there are only `log₂ k` levels, so the total is `O(N log k)`. (Module 12 gets the same `O(N log k)` with a heap.)",
          pseudo: `function mergeKSorted(lists):
    if lists is empty:
        return empty list
    return mergeRange(0, k - 1)

function mergeRange(lo, hi):
    if lo = hi:
        return lists[lo]                // one list: already sorted
    mid ← floor((lo + hi) / 2)
    left ← mergeRange(lo, mid)
    right ← mergeRange(mid + 1, hi)
    return mergeTwo(left, right)        // two fingers, O(length)`,
          code: `function mergeKSorted(lists) {
  if (lists.length === 0) return [];

  function mergeRange(lo, hi) {
    if (lo === hi) return lists[lo];
    const mid = Math.floor((lo + hi) / 2);
    return mergeTwo(mergeRange(lo, mid), mergeRange(mid + 1, hi));
  }

  return mergeRange(0, lists.length - 1);
}

function mergeTwo(a, b) {
  const out = [];
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] <= b[j]) out.push(a[i++]);
    else out.push(b[j++]);
  }
  while (i < a.length) out.push(a[i++]);
  while (j < b.length) out.push(b[j++]);
  return out;
}`,
          time: 'O(N log k)',
          space: 'O(N)',
        },
      ],
      fn: 'mergeKSorted',
      starter: `function mergeKSorted(lists) {
  // merge the lists in pairs, like merge sort
  return [];
}`,
      solution: `function mergeKSorted(lists) {
  if (lists.length === 0) return [];

  function mergeRange(lo, hi) {
    if (lo === hi) return lists[lo];
    const mid = Math.floor((lo + hi) / 2);
    return mergeTwo(mergeRange(lo, mid), mergeRange(mid + 1, hi));
  }

  return mergeRange(0, lists.length - 1);
}

function mergeTwo(a, b) {
  const out = [];
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] <= b[j]) out.push(a[i++]);
    else out.push(b[j++]);
  }
  while (i < a.length) out.push(a[i++]);
  while (j < b.length) out.push(b[j++]);
  return out;
}`,
      tests: [
        { name: 'example', args: [[[1, 4, 5], [1, 3, 4], [2, 6]]], expected: [1, 1, 2, 3, 4, 4, 5, 6] },
        { name: 'no lists (k = 0)', args: [[]], expected: [] },
        { name: 'only empty lists', args: [[[], []]], expected: [] },
        { name: 'some empty lists', args: [[[], [3, 8], [], [1, 9]]], expected: [1, 3, 8, 9] },
        { name: 'one list', args: [[[1, 2, 3]]], expected: [1, 2, 3] },
        { name: 'duplicates across lists', args: [[[2, 2, 5], [2, 5, 5], [5]]], expected: [2, 2, 2, 5, 5, 5, 5] },
        { name: 'negatives', args: [[[-10, -3, 0], [-5, -5, 7], [-20]]], expected: [-20, -10, -5, -5, -3, 0, 7] },
        {
          name: 'five servers',
          args: [[[100, 340, 900], [120, 121, 800, 950], [90], [300, 301, 302, 999], [50, 500]]],
          expected: [50, 90, 100, 120, 121, 300, 301, 302, 340, 500, 800, 900, 950, 999],
        },
      ],
      takeaway: 'k sorted lists? Merge them in pairs like merge sort: `log k` rounds of `N` work each.',
    },
  ],
  quiz: [
    {
      prompt: 'Merge sort runs on 16 numbers. How many levels of merging are there, and how much work does each level do?',
      options: [
        '16 levels, 1 step each',
        '4 levels, about 16 steps each',
        '4 levels, 4 steps each',
        '8 levels, about 16 steps each',
      ],
      answer: 1,
      explanation: 'Halving 16 → 8 → 4 → 2 → 1 takes `log₂ 16 = 4` levels. Every level holds all 16 numbers, so its merges cost about 16 together. Total about `16 × 4 = 64`, which is `n log n`.',
    },
    {
      prompt: 'A leaderboard has Ana (90) before Ben (90). Ana is in the left half, Ben in the right half. Which merge rule keeps Ana above Ben?',
      options: [
        'Take from the left when `left < right`',
        'Take from the left when `left <= right`',
        'Take from the right when `left >= right`',
        'It does not matter: the scores are equal',
      ],
      answer: 1,
      explanation: 'With `<=`, a tie takes from the left half, and the left half holds the items that came first. That keeps equal items in their old order (a **stable** sort). With `<`, Ben would jump ahead of Ana.',
    },
    {
      prompt: 'While counting inversions you merge left `[3, 5, 8]` with right `[4]`. How many inversions does the merge add when `4` is taken?',
      options: ['0', '1', '2', '3'],
      answer: 2,
      explanation: '`3 ≤ 4`, so 3 is taken first. Then `5 > 4`: take 4, and the left items still waiting are 5 and 8, both bigger than 4. That adds `mid - i + 1 = 2`.',
    },
    {
      prompt: 'You split with `mid = floor((lo + hi) / 2)` and recurse on `lo..mid - 1` and `mid..hi`. What happens on the range `0..1`?',
      options: [
        'It sorts correctly',
        'mid = 0, so the right call is `0..1` again: infinite recursion',
        'It skips the number at index 1',
        'It returns the two numbers swapped',
      ],
      answer: 1,
      explanation: 'With `lo = 0, hi = 1` you get `mid = 0`. The right call `mid..hi` is `0..1`, exactly the same range, so it never shrinks and ends in a stack overflow. Use `lo..mid` and `mid+1..hi`.',
    },
  ],
  takeaways: [
    'Merge sort: split in half, trust both recursive calls, merge with two fingers. The merge is where the work is.',
    'Each level of the split does `n` work, and there are `log₂ n` levels, so merge sort is `O(n log n)` and needs `O(n)` extra space.',
    'Take from the left on ties (`<=`) so equal items keep their order: that is what makes merge sort stable.',
    'The merge step is a hook for extra work: counting inversions, merging k sorted lists, and sorting linked lists all reuse it.',
  ],
};

export default lesson;
