import type { Lesson } from '../types';
import { tests } from './12-heaps.tests';

export const lesson2: Lesson = {
  id: 'top-k',
  title: 'Top-k with a small heap',
  summary: 'Keep only the k best in a heap of size k. The surprise: k largest needs a MIN-heap.',
  minutes: 22,
  blocks: [
    {
      kind: 'callout',
      tone: 'story',
      title: 'The leaderboard bouncer',
      text: "A game shows a Top 3 leaderboard. Millions of scores stream in. The game does not keep every score sorted. It keeps exactly 3 scores and a bouncer at the door: the **weakest of the Top 3**. A new score only gets in if it beats the bouncer. Then the bouncer is kicked out and the new weakest takes the job.",
    },
    {
      kind: 'text',
      text: "**The problem:** scores arrive one at a time. After each new score, report the **3rd largest score so far**. Start with `[4, 5, 8, 2]`, then scores `3, 5, 10, 9, 4` arrive. The answers should be `4, 5, 5, 8, 8`.",
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Brute force: sort after every score',
      code: `function add(x):
    append x to all
    sort all from big to small          // O(n log n) every time
    return all[k - 1]`,
    },
    {
      kind: 'text',
      text: "That works, and for 50 scores it is fine. But after a million scores each `add` sorts a million values. **The waste:** a score that is not in the Top 3 right now can never be in the Top 3 later, because scores only get added. Yet we keep it and sort it again and again.",
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'k largest → min-heap of size k',
      text: "Keep only k values in a **min-heap**. Its top is the smallest of the k, the bouncer. That is exactly the kth largest! For each new value: push it, and if the heap grows past k, pop the top (kick out the weakest). Each step costs O(log k), and k is usually tiny.",
    },
    {
      kind: 'steps',
      title: '3rd largest, k = 3 (the min-heap array)',
      frames: [
        { cells: [4, 5, 8], found: [0], vars: { answer: 4 }, note: 'Push 4, 5, 8. The heap holds k = 3 values. The top, 4, is the 3rd largest.' },
        { cells: [4, 5, 8], active: [0], vars: { incoming: 2, answer: 4 }, note: '2 arrives (still part of the start). Push it, size is 4 > k, pop the top: 2 itself leaves.' },
        { cells: [4, 5, 8], active: [0], vars: { incoming: 3, answer: 4 }, note: '3 arrives. Same thing: it is smaller than the bouncer 4, so it gets popped right away. Answer 4.' },
        { cells: [5, 5, 8], found: [0], vars: { incoming: 5, answer: 5 }, note: '5 arrives. Push 5, pop the top 4. The new bouncer is 5. Answer 5.' },
        { cells: [5, 10, 8], found: [0], vars: { incoming: 10, answer: 5 }, note: '10 arrives. Push 10, pop one 5. The other 5 is the new top. Answer 5.' },
        { cells: [8, 9, 10], found: [0], vars: { incoming: 9, answer: 8 }, note: '9 arrives. Push 9, pop 5. Top is 8. Answer 8.' },
        { cells: [8, 9, 10], active: [0], vars: { incoming: 4, answer: 8 }, note: '4 arrives and is popped right away. Answer 8. The heap never held more than 4 values.' },
      ],
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Top-k template',
      code: `function kthLargest(items, k):
    heap ← empty min-heap               // top = weakest of the best k
    for each x in items:
        heap.push(x)
        if heap.size() > k:
            heap.pop()                  // kick out the weakest
    return heap.peek()                  // the kth largest`,
    },
    {
      kind: 'code',
      lang: 'js',
      code: `function kthLargest(items, k) {
  const heap = new Heap((a, b) => a - b);
  for (const x of items) {
    heap.push(x);
    if (heap.size() > k) heap.pop();
  }
  return heap.peek();
}`,
    },
    {
      kind: 'compare',
      title: 'Top k of n values',
      rows: [
        { approach: 'Sort everything', time: 'O(n log n)', space: 'O(n)', note: 'Simple and fine for small n. Does way more work than needed.' },
        { approach: 'Max-heap of all n, pop k times', time: 'O(n log n)', space: 'O(n)', note: 'Pushes all n values (O(n + k log n) with heapify). Needs everything in memory.' },
        { approach: 'Min-heap of size k', time: 'O(n log k)', space: 'O(k)', note: 'Works on a stream. With n = 10⁶ and k = 10, log k ≈ 3 instead of 20.' },
        { approach: 'Quickselect', time: 'O(n) average', space: 'O(1)', note: 'Fastest for a one-off kth value on an array, but not for streams. Covered in module 8.' },
      ],
    },
    {
      kind: 'table',
      title: 'Which heap do I keep? The opposite one.',
      head: ['You want', 'Keep a heap of size k that is a', 'Because the top must be'],
      rows: [
        ['k largest / kth largest', 'min-heap', 'the smallest of the winners, the one to kick out'],
        ['k smallest / k closest', 'max-heap', 'the biggest (farthest) of the winners'],
        ['k most frequent', 'min-heap by count', 'the least frequent of the winners'],
      ],
    },
    {
      kind: 'list',
      items: [
        '**Signals:** "k largest", "k smallest", "k closest", "top k", "kth biggest", or a stream where you keep reporting a rank.',
        '**Template:** push, and if `size > k`, pop. The top is the boundary of the club.',
        '**Output order:** popping the heap gives the winners from weakest to strongest. Reverse at the end if you need best first.',
      ],
    },
    {
      kind: 'callout',
      tone: 'trap',
      title: 'Traps',
      text: "**1.** Reaching for a max-heap to find the k largest. It works only if you store all n values. **2.** Ties: when the problem says *break ties alphabetically*, the comparator decides who counts as weaker, so it must be the **reverse** of the output order. **3.** Forgetting to reverse: popping gives weakest first.",
    },
  ],
  problems: [
    {
      id: 'heaps-kth-largest-stream',
      title: 'Kth largest score, live',
      difficulty: 'easy',
      leetcode: 703,
      pattern: 'Top-k (min-heap of size k)',
      statement:
        "A game keeps a live leaderboard. You get `k`, the starting scores `nums`, and a list of new scores `adds` that arrive one by one. After each new score, record the **kth largest score so far** (counting the starting scores too). Return the list of recorded answers. There will always be at least k scores when you record an answer.",
      examples: [
        {
          input: 'k = 3, nums = [4, 5, 8, 2], adds = [3, 5, 10, 9, 4]',
          output: '[4, 5, 5, 8, 8]',
          explain: 'After 3 arrives the scores are 8, 5, 4, 3, 2, so the 3rd largest is 4. After 5: 8, 5, 5, ... so it is 5. And so on.',
        },
        { input: 'k = 1, nums = [], adds = [-3, -2, -4, 0, 4]', output: '[-3, -2, -2, 0, 4]', explain: 'With k = 1 it is just the max so far.' },
      ],
      constraints: ['1 ≤ k ≤ 10⁴', '0 ≤ nums.length ≤ 10⁴', 'up to 10⁴ adds'],
      hints: [
        'Once a score drops out of the top k, can it ever come back?',
        'Keep only k scores. Which one do you need to look at and kick out? The smallest of them.',
        'Min-heap: push the score; if `size > k`, pop. The answer is `peek()`.',
      ],
      approaches: [
        {
          name: 'Sort after each add',
          idea: 'Push the new score and sort descending, then read index k - 1. Correct, but it re-sorts everything each time.',
          time: 'O(m · n log n) for m adds',
          space: 'O(n)',
        },
        {
          name: 'Min-heap of size k',
          idea: 'The heap holds the current top k. Its top is the weakest of them, which is exactly the kth largest. Anything smaller is popped at once and never matters again.',
          pseudo: `function runKthLargest(k, nums, adds):
    heap ← empty min-heap
    function add(x):
        heap.push(x)
        if heap.size() > k:
            heap.pop()
        return heap.peek()
    for each x in nums:
        add(x)
    out ← empty list
    for each x in adds:
        append add(x) to out
    return out`,
          code: `function runKthLargest(k, nums, adds) {
  const heap = new Heap((a, b) => a - b);
  const add = (x) => {
    heap.push(x);
    if (heap.size() > k) heap.pop();
    return heap.peek();
  };
  for (const x of nums) add(x);
  return adds.map(add);
}`,
          time: 'O((n + m) log k)',
          space: 'O(k)',
        },
      ],
      fn: 'runKthLargest',
      starter: `function runKthLargest(k, nums, adds) {
  // After each new score, record the kth largest so far.
  return [];
}`,
      solution: `function runKthLargest(k, nums, adds) {
  const heap = new Heap((a, b) => a - b);
  const add = (x) => {
    heap.push(x);
    if (heap.size() > k) heap.pop();
    return heap.peek();
  };
  for (const x of nums) add(x);
  return adds.map(add);
}`,
      tests: tests.runKthLargest,
      takeaway: 'Kth largest in a stream = peek of a min-heap capped at size k.',
    },
    {
      id: 'heaps-k-closest-points',
      title: 'Nearest k drivers',
      difficulty: 'medium',
      leetcode: 973,
      pattern: 'Top-k (max-heap of size k)',
      statement:
        "A rider is standing at (0, 0). Drivers are at `points[i] = [x, y]`. Return the `k` drivers closest to the rider (straight-line distance). Any order is fine. The tests never have a tie for the last spot.",
      examples: [
        { input: 'points = [[1, 3], [-2, 2]], k = 1', output: '[[-2, 2]]', explain: '(1, 3) is √10 away, (-2, 2) is √8 away. √8 is smaller.' },
        { input: 'points = [[3, 3], [5, -1], [-2, 4]], k = 2', output: '[[3, 3], [-2, 4]]' },
      ],
      constraints: ['1 ≤ k ≤ points.length ≤ 10⁴', '-10⁴ ≤ x, y ≤ 10⁴'],
      hints: [
        'You never need the real distance. Comparing `x * x + y * y` gives the same order and skips `Math.sqrt`.',
        'You want the k smallest distances. Which heap keeps the boundary on top?',
        'A max-heap by distance, capped at size k. The top is the farthest of the current winners: kick it out when a closer one arrives.',
      ],
      approaches: [
        {
          name: 'Sort by distance',
          idea: 'Sort all points by squared distance and take the first k. Clear and correct.',
          code: `function kClosest(points, k) {
  const d = ([x, y]) => x * x + y * y;
  return [...points].sort((a, b) => d(a) - d(b)).slice(0, k);
}`,
          time: 'O(n log n)',
          space: 'O(n)',
        },
        {
          name: 'Max-heap of size k',
          idea: 'Keep the k closest seen so far. The farthest of them sits on top, so a closer point can replace it in O(log k). Quickselect (module 8) gets O(n) on average if you need even more speed.',
          pseudo: `function kClosest(points, k):
    heap ← empty max-heap by distance    // top = farthest winner
    for each p in points:
        heap.push(p)
        if heap.size() > k:
            heap.pop()
    return everything left in heap`,
          code: `function kClosest(points, k) {
  const dist = ([x, y]) => x * x + y * y;
  const heap = new Heap((a, b) => dist(b) - dist(a));
  for (const p of points) {
    heap.push(p);
    if (heap.size() > k) heap.pop();
  }
  const out = [];
  while (!heap.isEmpty()) out.push(heap.pop());
  return out;
}`,
          time: 'O(n log k)',
          space: 'O(k)',
        },
      ],
      fn: 'kClosest',
      starter: `function kClosest(points, k) {
  // Return the k points closest to (0, 0), in any order.
  return [];
}`,
      solution: `function kClosest(points, k) {
  const dist = ([x, y]) => x * x + y * y;
  const heap = new Heap((a, b) => dist(b) - dist(a));
  for (const p of points) {
    heap.push(p);
    if (heap.size() > k) heap.pop();
  }
  const out = [];
  while (!heap.isEmpty()) out.push(heap.pop());
  return out;
}`,
      tests: tests.kClosest,
      compare: 'unordered',
      takeaway: 'k smallest / closest = max-heap of size k. Compare squared distances, skip the square root.',
    },
    {
      id: 'heaps-top-k-frequent-words',
      title: 'Top k search words',
      difficulty: 'medium',
      leetcode: 692,
      pattern: 'Top-k with a tie-break comparator',
      statement:
        "A search box logs every word people type. Given the list `words` and a number `k`, return the `k` most frequent words. Sort the answer from most to least frequent. If two words have the same count, the one that comes first in the alphabet goes first.",
      examples: [
        { input: "words = ['i', 'love', 'leetcode', 'i', 'love', 'coding'], k = 2", output: "['i', 'love']", explain: "'i' and 'love' both appear twice. 'i' comes first alphabetically." },
        {
          input: "words = ['the', 'day', 'is', 'sunny', 'the', 'the', 'the', 'sunny', 'is', 'is'], k = 4",
          output: "['the', 'is', 'sunny', 'day']",
          explain: 'Counts: the 4, is 3, sunny 2, day 1.',
        },
      ],
      constraints: ['1 ≤ words.length ≤ 500', 'words are lowercase', '1 ≤ k ≤ number of unique words'],
      hints: [
        'Count first: a `Map` from word to count.',
        'Keep a min-heap of size k. Which word is the *weakest*? Lower count. With equal counts, the one LATER in the alphabet.',
        'Comparator: `count.get(a) - count.get(b) || (a < b ? 1 : -1)`. Pop everything at the end and reverse.',
      ],
      approaches: [
        {
          name: 'Count + sort',
          idea: 'Count every word, then sort the unique words by count (high first) and then alphabetically. Take the first k. Totally fine here.',
          code: `function topKFrequent(words, k) {
  const count = new Map();
  for (const w of words) count.set(w, (count.get(w) || 0) + 1);
  return [...count.keys()]
    .sort((a, b) => count.get(b) - count.get(a) || (a < b ? -1 : 1))
    .slice(0, k);
}`,
          time: 'O(n + u log u)',
          space: 'O(u)',
        },
        {
          name: 'Count + min-heap of size k',
          idea: 'The heap keeps the k best words with the weakest on top. "Weakest" is the exact reverse of the output order, so the tie-break flips too. Pops come out weakest first, so reverse at the end.',
          pseudo: `function topKFrequent(words, k):
    count ← map of word → how many times it appears
    heap ← empty heap, weakest on top:
        lower count is weaker
        equal count: later in the alphabet is weaker
    for each w in keys of count:
        heap.push(w)
        if heap.size() > k:
            heap.pop()
    out ← pop everything from heap
    return out reversed`,
          code: `function topKFrequent(words, k) {
  const count = new Map();
  for (const w of words) count.set(w, (count.get(w) || 0) + 1);
  const heap = new Heap((a, b) => count.get(a) - count.get(b) || (a < b ? 1 : -1));
  for (const w of count.keys()) {
    heap.push(w);
    if (heap.size() > k) heap.pop();
  }
  const out = [];
  while (!heap.isEmpty()) out.push(heap.pop());
  return out.reverse();
}`,
          time: 'O(n + u log k)',
          space: 'O(u)',
        },
      ],
      fn: 'topKFrequent',
      starter: `function topKFrequent(words, k) {
  // Most frequent first; equal counts go alphabetically.
  return [];
}`,
      solution: `function topKFrequent(words, k) {
  const count = new Map();
  for (const w of words) count.set(w, (count.get(w) || 0) + 1);
  const heap = new Heap((a, b) => count.get(a) - count.get(b) || (a < b ? 1 : -1));
  for (const w of count.keys()) {
    heap.push(w);
    if (heap.size() > k) heap.pop();
  }
  const out = [];
  while (!heap.isEmpty()) out.push(heap.pop());
  return out.reverse();
}`,
      tests: tests.topKFrequent,
      takeaway: 'In a top-k heap the comparator defines "weakest", so the tie-break is the reverse of the output order.',
    },
    {
      id: 'heaps-furthest-building',
      title: 'Rooftop run',
      difficulty: 'medium',
      leetcode: 1642,
      pattern: 'Top-k (min-heap of the biggest climbs)',
      statement:
        "You are running across rooftops. `heights[i]` is the height of roof i. Going down or staying level is free. Going **up** by d needs either **d bricks** (to build steps) or **one ladder** (any height). You have `bricks` bricks and `ladders` ladders. Return the index of the furthest roof you can reach if you use them wisely.",
      examples: [
        {
          input: 'heights = [4, 2, 7, 6, 9, 14, 12], bricks = 5, ladders = 1',
          output: '4',
          explain: '2 → 7 costs 5 bricks. 6 → 9 uses the ladder. 9 → 14 needs 5 more bricks, but none are left. Stuck at index 4.',
        },
        { input: 'heights = [4, 12, 2, 7, 3, 18, 20, 3, 19], bricks = 10, ladders = 2', output: '7' },
      ],
      constraints: ['1 ≤ heights.length ≤ 10⁵', '0 ≤ bricks ≤ 10⁹', '0 ≤ ladders ≤ heights.length'],
      hints: [
        'Ladders are worth the most on the BIGGEST climbs. Bricks should pay for the small ones.',
        "You don't know the future, so pretend: give every climb a ladder for now, and fix it later.",
        'Keep the climbs that use ladders in a min-heap. When there are more climbs than ladders, pop the smallest and pay for it with bricks. If bricks go below 0, you are stuck at the current roof.',
      ],
      approaches: [
        {
          name: 'Check every prefix',
          idea: 'For each roof, collect all climbs before it, give ladders to the biggest ones and check if bricks cover the rest. Correct, but re-sorting for every roof is slow.',
          time: 'O(n² log n)',
          space: 'O(n)',
        },
        {
          name: 'Min-heap of ladder climbs',
          idea: 'The ladders should always cover the `ladders` biggest climbs so far: a top-k club. The heap keeps those climbs with the smallest on top. When the club gets too big, the smallest climb gets kicked out and paid for with bricks.',
          pseudo: `function furthestBuilding(heights, bricks, ladders):
    heap ← empty min-heap               // climbs covered by ladders
    for i from 0 to n - 2:
        climb ← heights[i + 1] - heights[i]
        if climb > 0:
            heap.push(climb)
            if heap.size() > ladders:
                bricks ← bricks - heap.pop()
            if bricks < 0:
                return i
    return n - 1`,
          code: `function furthestBuilding(heights, bricks, ladders) {
  const heap = new Heap((a, b) => a - b);
  for (let i = 0; i < heights.length - 1; i++) {
    const climb = heights[i + 1] - heights[i];
    if (climb <= 0) continue;
    heap.push(climb);
    if (heap.size() > ladders) bricks -= heap.pop();
    if (bricks < 0) return i;
  }
  return heights.length - 1;
}`,
          time: 'O(n log L)',
          space: 'O(L)',
        },
      ],
      fn: 'furthestBuilding',
      starter: `function furthestBuilding(heights, bricks, ladders) {
  // Ladders go on the biggest climbs, bricks on the rest.
  return 0;
}`,
      solution: `function furthestBuilding(heights, bricks, ladders) {
  const heap = new Heap((a, b) => a - b);
  for (let i = 0; i < heights.length - 1; i++) {
    const climb = heights[i + 1] - heights[i];
    if (climb <= 0) continue;
    heap.push(climb);
    if (heap.size() > ladders) bricks -= heap.pop();
    if (bricks < 0) return i;
  }
  return heights.length - 1;
}`,
      tests: tests.furthestBuilding,
      takeaway: 'Top-k hides in disguise: "save the best resource for the k biggest things" is a size-k min-heap.',
    },
  ],
  quiz: [
    {
      prompt: 'You want the 5 largest values from a stream of a billion numbers. Which heap do you keep?',
      options: ['A max-heap of everything', 'A min-heap of size 5', 'A max-heap of size 5', 'A sorted array of everything'],
      answer: 1,
      explanation: 'A min-heap of size 5 keeps the weakest winner on top, so you can kick it out when a bigger number arrives. It never holds more than 6 values.',
    },
    {
      prompt: 'For "k closest points", the heap of size k should have which point on top?',
      options: ['The closest one', 'The farthest of the k winners', 'A random one', 'The origin'],
      answer: 1,
      explanation: 'The top is the one you might kick out. For k closest, that is the farthest of the current winners, so use a max-heap by distance.',
    },
    {
      prompt: 'What does a size-k top-k loop cost for n values?',
      options: ['O(n)', 'O(n log k)', 'O(k log n)', 'O(n log n)'],
      answer: 1,
      explanation: 'Each of the n values does a push and maybe a pop on a heap of size ≤ k + 1, so each step is O(log k).',
    },
  ],
  takeaways: [
    'Top-k: push, and if `size > k`, pop. The heap holds the winners; its top is the weakest winner.',
    'Keep the opposite heap: k largest → min-heap, k smallest/closest → max-heap.',
    'O(n log k) beats sorting when k is small, and it works on streams that never end.',
    'With tie-breaks, write the comparator for "who is weaker", then reverse the pops for the answer.',
  ],
};
