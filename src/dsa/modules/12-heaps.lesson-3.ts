import type { Lesson } from '../types';
import { tests } from './12-heaps.tests';

export const lesson3: Lesson = {
  id: 'k-way-merge',
  title: 'K-way merge: a heap of fronts',
  summary: 'Merge k sorted lists by keeping only the front of each list in a heap.',
  minutes: 20,
  blocks: [
    {
      kind: 'callout',
      tone: 'story',
      title: 'One timeline from k servers',
      text: "Your app runs on 3 servers. Each one writes a log file, and each file is already sorted by time. Something broke at 2:14 am and you need **one** timeline of everything that happened, in order. The files are huge: maybe too big to load all at once.",
    },
    {
      kind: 'text',
      text: "**The problem:** merge k sorted lists into one sorted list. Example: `A = [1, 4, 9]`, `B = [2, 3]`, `C = [5]` becomes `[1, 2, 3, 4, 5, 9]`. Let N be the total number of values across all lists.",
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Brute force: glue and sort',
      code: `function mergeK(lists):
    all ← empty list
    for each list in lists:
        append every value of list to all
    sort all                            // O(N log N)
    return all`,
    },
    {
      kind: 'text',
      text: "Honest truth: for small inputs this is fine. But it ignores the gift we were given: **each list is already sorted**. And it needs everything in memory. Another idea is to look at the k fronts each step and take the smallest. That throws the sort away but scans all k fronts every time, O(N · k). **The waste:** after taking one value, only **one** front changed, yet we compare all k again.",
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'Put the fronts in a min-heap',
      text: "The next value of the merged list is always the smallest **front**. Keep just the k fronts in a min-heap. Pop the smallest, write it out, and push the next value **from the same list**. The heap never holds more than k items, so each step is O(log k).",
    },
    {
      kind: 'trace',
      title: 'Merging A = [1, 4, 9], B = [2, 3], C = [5]',
      columns: ['step', 'pop', 'from', 'push next from that list', 'heap after'],
      rows: [
        ['start', '-', '-', '1 (A), 2 (B), 5 (C)', '{1, 2, 5}'],
        [1, 1, 'A', '4', '{2, 4, 5}'],
        [2, 2, 'B', '3', '{3, 4, 5}'],
        [3, 3, 'B', 'nothing, B is done', '{4, 5}'],
        [4, 4, 'A', '9', '{5, 9}'],
        [5, 5, 'C', 'nothing, C is done', '{9}'],
        [6, 9, 'A', 'nothing, A is done', '{}'],
      ],
      note: 'Output: 1, 2, 3, 4, 5, 9. Each heap item also remembers which list it came from, so we know where the next value is.',
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'K-way merge',
      code: `function mergeKSorted(lists):
    heap ← empty min-heap of [value, listIndex, position]
    for i from 0 to k - 1:
        if lists[i] is not empty:
            heap.push([lists[i][0], i, 0])
    out ← empty list
    while heap is not empty:
        [value, i, j] ← heap.pop()
        append value to out
        if j + 1 < length of lists[i]:
            heap.push([lists[i][j + 1], i, j + 1])
    return out`,
    },
    {
      kind: 'code',
      lang: 'js',
      code: `function mergeKSorted(lists) {
  const heap = new Heap((a, b) => a[0] - b[0]); // [value, listIndex, position]
  lists.forEach((list, i) => {
    if (list.length > 0) heap.push([list[0], i, 0]);
  });
  const out = [];
  while (!heap.isEmpty()) {
    const [value, i, j] = heap.pop();
    out.push(value);
    if (j + 1 < lists[i].length) heap.push([lists[i][j + 1], i, j + 1]);
  }
  return out;
}`,
    },
    {
      kind: 'compare',
      title: 'Merging k lists with N values in total',
      rows: [
        { approach: 'Glue + sort', time: 'O(N log N)', space: 'O(N)', note: 'Ignores that the lists are sorted. Needs everything in memory.' },
        { approach: 'Scan all k fronts each step', time: 'O(N · k)', space: 'O(1) extra', note: 'Uses the sorted order, but compares all k fronts every time.' },
        { approach: 'Min-heap of fronts', time: 'O(N log k)', space: 'O(k)', note: 'Only k items in the heap. Can stream from files and never load them fully.' },
      ],
    },
    {
      kind: 'text',
      text: "**The idea is bigger than lists.** Anything that gives you several sorted streams can be merged this way, even if the streams are never written down. Take two sorted arrays `nums1 = [1, 7, 11]` and `nums2 = [2, 4, 6]` and ask for the 3 pairs with the smallest sums. Every row of the sum grid below is sorted, so each row is a stream.",
    },
    {
      kind: 'diagram',
      title: 'Pair sums: each row is a sorted stream',
      art: `             nums2:   2    4    6
nums1:   1   row 0:   3    5    7
         7   row 1:   9   11   13
        11   row 2:  13   15   17

Heap starts with the first column: {3, 9, 13}
pop 3  (row 0)  → push the next in row 0: 5
pop 5  (row 0)  → push 7
pop 7  (row 0)  → done, k = 3 pairs found`,
      caption: 'We never build the 9-cell grid. The heap only holds one front per row.',
    },
    {
      kind: 'list',
      items: [
        '**Signals:** "k sorted lists / arrays / streams", "merge", "kth smallest across sorted things", "smallest pairs", "generate numbers in order".',
        '**Template:** push the first item of every stream with a tag saying where it came from. Pop the smallest, then push the next item from that same stream.',
      ],
    },
    {
      kind: 'callout',
      tone: 'trap',
      title: 'Traps',
      text: "**1.** Forgetting the tag: if the heap only stores values, you can't tell which list to advance. Store `[value, listIndex, position]`. **2.** Pushing the first item of an **empty** list (`lists[i][0]` is `undefined`). **3.** In the pairs grid, pushing all k² pairs up front. Push one front per row, then advance only the row you popped from.",
    },
  ],
  problems: [
    {
      id: 'heaps-merge-k-sorted',
      title: 'Merge sorted server logs',
      difficulty: 'medium',
      pattern: 'K-way merge',
      statement:
        "Each server writes timestamps to its own log, sorted from small to big. You get `lists`, an array of these sorted arrays (some may be empty). Return one sorted array with every timestamp. Duplicates stay.",
      examples: [
        { input: 'lists = [[1, 4, 7], [2, 5, 8], [3, 6, 9]]', output: '[1, 2, 3, 4, 5, 6, 7, 8, 9]' },
        { input: 'lists = [[1, 3], [], [2], []]', output: '[1, 2, 3]', explain: 'Empty logs just add nothing.' },
      ],
      constraints: ['0 ≤ k ≤ 10⁴', 'total values N ≤ 10⁴', 'each list is sorted ascending'],
      hints: [
        'The next value of the answer is always one of the k fronts.',
        'Keep only the fronts in a min-heap. Each item needs to remember its list and its position.',
        'Push `[value, listIndex, position]`. Pop the smallest, write it, then push `lists[i][j + 1]` if it exists.',
      ],
      approaches: [
        {
          name: 'Glue + sort',
          idea: 'Flatten everything and sort numbers with `(a, b) => a - b`. Correct, but it ignores that the lists are already sorted.',
          code: `function mergeKSorted(lists) {
  return lists.flat().sort((a, b) => a - b);
}`,
          time: 'O(N log N)',
          space: 'O(N)',
        },
        {
          name: 'Min-heap of fronts',
          idea: 'The smallest remaining value is always at the front of some list. The heap holds one front per list, so finding the smallest is O(log k), and only the list we took from gets a new front.',
          pseudo: `function mergeKSorted(lists):
    heap ← empty min-heap of [value, i, j]
    for each non-empty list i:
        heap.push([lists[i][0], i, 0])
    out ← empty list
    while heap is not empty:
        [value, i, j] ← heap.pop()
        append value to out
        if j + 1 < length of lists[i]:
            heap.push([lists[i][j + 1], i, j + 1])
    return out`,
          code: `function mergeKSorted(lists) {
  const heap = new Heap((a, b) => a[0] - b[0]);
  lists.forEach((list, i) => {
    if (list.length > 0) heap.push([list[0], i, 0]);
  });
  const out = [];
  while (!heap.isEmpty()) {
    const [value, i, j] = heap.pop();
    out.push(value);
    if (j + 1 < lists[i].length) heap.push([lists[i][j + 1], i, j + 1]);
  }
  return out;
}`,
          time: 'O(N log k)',
          space: 'O(k) + output',
        },
      ],
      fn: 'mergeKSorted',
      starter: `function mergeKSorted(lists) {
  // Merge k sorted arrays into one sorted array.
  return [];
}`,
      solution: `function mergeKSorted(lists) {
  const heap = new Heap((a, b) => a[0] - b[0]);
  lists.forEach((list, i) => {
    if (list.length > 0) heap.push([list[0], i, 0]);
  });
  const out = [];
  while (!heap.isEmpty()) {
    const [value, i, j] = heap.pop();
    out.push(value);
    if (j + 1 < lists[i].length) heap.push([lists[i][j + 1], i, j + 1]);
  }
  return out;
}`,
      tests: tests.mergeKSorted,
      takeaway: 'K sorted streams → heap of fronts tagged with where they came from. O(N log k).',
    },
    {
      id: 'heaps-k-smallest-pairs',
      title: 'Cheapest outfit combos',
      difficulty: 'medium',
      leetcode: 373,
      pattern: 'K-way merge (implicit rows)',
      statement:
        "A shop sells shirts with prices `nums1` and pants with prices `nums2`, both sorted from cheap to expensive. An outfit is one shirt plus one pants. Return the `k` outfits with the smallest total price, as pairs `[shirtPrice, pantsPrice]`. Any order is fine. The tests never have a tie for the last spot, and k is never more than the number of outfits.",
      examples: [
        { input: 'nums1 = [1, 7, 11], nums2 = [2, 4, 6], k = 3', output: '[[1, 2], [1, 4], [1, 6]]', explain: 'Sums 3, 5, 7. The next smallest is 7 + 2 = 9.' },
        { input: 'nums1 = [1, 1, 2], nums2 = [1, 2, 3], k = 2', output: '[[1, 1], [1, 1]]', explain: 'Both shirts priced 1 pair with pants priced 1.' },
      ],
      constraints: ['1 ≤ nums1.length, nums2.length ≤ 10⁵', 'both sorted ascending', '1 ≤ k ≤ 10⁴'],
      hints: [
        'Picture a grid: row i, column j holds `nums1[i] + nums2[j]`. Each row is sorted. Sound familiar?',
        'It is k-way merge with one stream per row. The front of row i starts at column 0.',
        'Push `[nums1[i] + nums2[0], i, 0]` for the first k rows. Pop k times; after popping `(i, j)`, push `(i, j + 1)`.',
      ],
      approaches: [
        {
          name: 'All pairs + sort',
          idea: 'Build every pair, sort by sum, take k. Correct, but with 10⁵ × 10⁵ pairs it is far too big.',
          time: 'O(m·n log(m·n))',
          space: 'O(m·n)',
        },
        {
          name: 'Heap of row fronts',
          idea: 'Each row of the sum grid is a sorted stream, so this is k-way merge. Only the first k rows can matter (any later row starts too high to make the top k). Each pop advances one row by one column.',
          pseudo: `function kSmallestPairs(nums1, nums2, k):
    heap ← empty min-heap of [sum, i, j]
    for i from 0 to min(length of nums1, k) - 1:
        heap.push([nums1[i] + nums2[0], i, 0])
    out ← empty list
    while size of out < k and heap is not empty:
        [sum, i, j] ← heap.pop()
        append [nums1[i], nums2[j]] to out
        if j + 1 < length of nums2:
            heap.push([nums1[i] + nums2[j + 1], i, j + 1])
    return out`,
          code: `function kSmallestPairs(nums1, nums2, k) {
  const heap = new Heap((a, b) => a[0] - b[0]); // [sum, i, j]
  for (let i = 0; i < Math.min(nums1.length, k); i++) {
    heap.push([nums1[i] + nums2[0], i, 0]);
  }
  const out = [];
  while (out.length < k && !heap.isEmpty()) {
    const [, i, j] = heap.pop();
    out.push([nums1[i], nums2[j]]);
    if (j + 1 < nums2.length) heap.push([nums1[i] + nums2[j + 1], i, j + 1]);
  }
  return out;
}`,
          time: 'O(k log k)',
          space: 'O(k)',
        },
      ],
      fn: 'kSmallestPairs',
      starter: `function kSmallestPairs(nums1, nums2, k) {
  // Return k pairs [a, b] with the smallest a + b.
  return [];
}`,
      solution: `function kSmallestPairs(nums1, nums2, k) {
  const heap = new Heap((a, b) => a[0] - b[0]);
  for (let i = 0; i < Math.min(nums1.length, k); i++) {
    heap.push([nums1[i] + nums2[0], i, 0]);
  }
  const out = [];
  while (out.length < k && !heap.isEmpty()) {
    const [, i, j] = heap.pop();
    out.push([nums1[i], nums2[j]]);
    if (j + 1 < nums2.length) heap.push([nums1[i] + nums2[j + 1], i, j + 1]);
  }
  return out;
}`,
      tests: tests.kSmallestPairs,
      compare: 'unordered',
      takeaway: 'A grid with sorted rows is k sorted streams. Merge it with a heap of row fronts, never build the grid.',
    },
    {
      id: 'heaps-ugly-number-ii',
      title: 'The nth ugly number',
      difficulty: 'medium',
      leetcode: 264,
      pattern: 'Heap as a sorted generator',
      statement:
        "An **ugly number** is a positive number whose only prime factors are 2, 3 and 5. So 1, 2, 3, 4, 5, 6, 8, 9, 10, 12 are the first ten (1 counts; 7 and 14 do not). Return the `n`th ugly number.",
      examples: [
        { input: 'n = 10', output: '12' },
        { input: 'n = 1', output: '1' },
      ],
      constraints: ['1 ≤ n ≤ 1690', 'the answer fits in a 32-bit int'],
      hints: [
        'Checking every integer is far too slow: the 1690th ugly number is over 2 billion.',
        'Every ugly number except 1 is a smaller ugly number times 2, 3 or 5. So you can grow them from 1.',
        'Min-heap starting with 1. Pop the smallest x, then push 2x, 3x, 5x. Use a Set so 6 (= 2·3 = 3·2) is not pushed twice. The nth pop is the answer.',
      ],
      approaches: [
        {
          name: 'Check every integer',
          idea: 'Divide out 2s, 3s and 5s from each number and see if 1 is left. Correct, but you would test about 2 billion numbers for n = 1690.',
          time: 'O(answer · log answer)',
          space: 'O(1)',
        },
        {
          name: 'Min-heap generator',
          idea: 'Grow ugly numbers from 1. The heap always hands back the smallest one not yet used, so pops come out in order. A Set stops duplicates like 6 = 2·3 = 3·2.',
          pseudo: `function nthUglyNumber(n):
    heap ← min-heap containing 1
    seen ← set containing 1
    for i from 1 to n:
        x ← heap.pop()
        for each f in [2, 3, 5]:
            if x * f not in seen:
                add x * f to seen
                heap.push(x * f)
    return x`,
          code: `function nthUglyNumber(n) {
  const heap = new Heap((a, b) => a - b);
  const seen = new Set([1]);
  heap.push(1);
  let x = 1;
  for (let i = 1; i <= n; i++) {
    x = heap.pop();
    for (const f of [2, 3, 5]) {
      if (!seen.has(x * f)) {
        seen.add(x * f);
        heap.push(x * f);
      }
    }
  }
  return x;
}`,
          time: 'O(n log n)',
          space: 'O(n)',
        },
        {
          name: 'Three pointers (merge of 3 streams)',
          idea: 'The ugly numbers times 2, times 3 and times 5 are three sorted streams. Merging 3 streams needs no heap: keep one pointer per stream and take the smallest of three. Advance every pointer that matched, which also removes duplicates.',
          pseudo: `function nthUglyNumber(n):
    ugly ← [1]
    i2 ← 0, i3 ← 0, i5 ← 0
    while size of ugly < n:
        next ← min(ugly[i2] * 2, ugly[i3] * 3, ugly[i5] * 5)
        append next to ugly
        if next = ugly[i2] * 2: i2 ← i2 + 1
        if next = ugly[i3] * 3: i3 ← i3 + 1
        if next = ugly[i5] * 5: i5 ← i5 + 1
    return ugly[n - 1]`,
          code: `function nthUglyNumber(n) {
  const ugly = [1];
  let i2 = 0;
  let i3 = 0;
  let i5 = 0;
  while (ugly.length < n) {
    const next = Math.min(ugly[i2] * 2, ugly[i3] * 3, ugly[i5] * 5);
    ugly.push(next);
    if (next === ugly[i2] * 2) i2++;
    if (next === ugly[i3] * 3) i3++;
    if (next === ugly[i5] * 5) i5++;
  }
  return ugly[n - 1];
}`,
          time: 'O(n)',
          space: 'O(n)',
        },
      ],
      fn: 'nthUglyNumber',
      starter: `function nthUglyNumber(n) {
  // Grow ugly numbers from 1 in sorted order.
  return 0;
}`,
      solution: `function nthUglyNumber(n) {
  const heap = new Heap((a, b) => a - b);
  const seen = new Set([1]);
  heap.push(1);
  let x = 1;
  for (let i = 1; i <= n; i++) {
    x = heap.pop();
    for (const f of [2, 3, 5]) {
      if (!seen.has(x * f)) {
        seen.add(x * f);
        heap.push(x * f);
      }
    }
  }
  return x;
}`,
      tests: tests.nthUglyNumber,
      takeaway: 'A heap can generate values in sorted order: pop the smallest, push what it leads to, skip repeats with a Set.',
    },
  ],
  quiz: [
    {
      prompt: 'You merge k = 8 sorted lists with N = 1,000,000 values in total. How big does the heap get?',
      options: ['8 items at most', '1,000,000 items', 'log N items', '8 × 1,000,000 items'],
      answer: 0,
      explanation: 'The heap holds at most one front per list, so never more than k = 8 items.',
    },
    {
      prompt: 'After popping `[value, i, j]`, what do you push?',
      options: ['The next front of every list', '`lists[i][j + 1]`, if it exists', '`lists[i + 1][0]`', 'Nothing'],
      answer: 1,
      explanation: 'Only list i lost its front, so only list i needs a new one.',
    },
    {
      prompt: 'Why can the k smallest pairs only come from the first k rows of the sum grid?',
      options: [
        'Because nums2 is sorted',
        'Row i starts with nums1[i] + nums2[0], and rows 0 to k-1 already give k sums at least that small',
        'Because the heap has size k',
        'It is a coincidence',
      ],
      answer: 1,
      explanation: 'Every pair in row k or later is ≥ the first pair of each of the k rows above it, so those k pairs win or tie.',
    },
  ],
  takeaways: [
    'K sorted streams → min-heap of fronts. Pop the smallest, push the next from the same stream.',
    'Tag heap items with where they came from: `[value, listIndex, position]`.',
    'Cost is O(N log k) with only k items in memory, so it works on streams too big to load.',
    'Streams can be implicit: rows of a sum grid, or multiples of 2, 3 and 5.',
  ],
};
