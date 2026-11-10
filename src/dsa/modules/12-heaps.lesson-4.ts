import type { Lesson } from '../types';
import { tests } from './12-heaps.tests';

export const lesson4: Lesson = {
  id: 'two-heaps',
  title: 'Two heaps: the running median',
  summary: 'Split the data into a low half and a high half. Their tops are the middle.',
  minutes: 20,
  blocks: [
    {
      kind: 'callout',
      tone: 'story',
      title: 'Your food is usually here in 32 minutes',
      text: "A delivery app shows the **median** delivery time, live. Why not the average? One order stuck for 3 hours would drag the average way up, but the median (the middle value) barely moves. Orders finish all day, and the number on screen must update after every one.",
    },
    {
      kind: 'text',
      text: "**The problem:** numbers arrive one at a time. After each one, report the median of everything so far. If the count is odd, it is the middle value. If even, it is the average of the two middle values. Times `5, 15, 1, 3, 8` should give medians `5, 10, 5, 4, 5`.",
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Brute force: keep a sorted list',
      code: `function addNum(x):
    insert x into sorted list at the right place   // O(n) shifting

function findMedian():
    m ← floor(n / 2)
    if n is odd:
        return list[m]
    return (list[m - 1] + list[m]) / 2`,
    },
    {
      kind: 'text',
      text: "`findMedian` is O(1), but every insert shifts up to n values. **The waste:** we keep the whole list in perfect order, but we only ever read the one or two values in the middle. Nobody cares where 1 and 15 sit, only that they are on the correct side.",
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'Two halves, two heaps',
      text: "Split the numbers into a **low half** and a **high half**. Keep the low half in a **max-heap** (its top is the biggest of the small ones) and the high half in a **min-heap** (its top is the smallest of the big ones). Those two tops are the middle! Keep the sizes equal, or let low have one extra. Then the median is `low.peek()` or the average of both tops.",
    },
    {
      kind: 'diagram',
      title: 'After adding 5, 15, 1, 3, 8',
      art: `   low half (max-heap)       high half (min-heap)
   +----------------+        +----------------+
   |  1   3   [5]   |   ≤    |  [8]   15      |
   +----------------+        +----------------+
              top ^             ^ top

 low has one extra → median = low top = 5
 if sizes were equal → median = (5 + 8) / 2`,
      caption: 'Every value in low ≤ every value in high. Only the two tops touch the middle.',
    },
    {
      kind: 'text',
      text: "**Adding a number safely, in 3 moves:** (1) push it into low. (2) Move low's top into high. That makes sure the biggest small value really belongs on the low side. (3) If high is now bigger than low, move high's top back. Each move is O(log n).",
    },
    {
      kind: 'trace',
      title: 'Adding 5, 15, 1, 3, 8 (tops shown first)',
      columns: ['add', 'low (max-heap)', 'high (min-heap)', 'median'],
      rows: [
        [5, '5', '-', '5'],
        [15, '5', '15', '(5 + 15) / 2 = 10'],
        [1, '5, 1', '15', '5'],
        [3, '3, 1', '5, 15', '(3 + 5) / 2 = 4'],
        [8, '5, 3, 1', '8, 15', '5'],
      ],
      note: 'When 3 arrives: it goes into low, low gives its top 5 to high, and the sizes end up 2 and 2.',
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Running median with two heaps',
      code: `low ← empty max-heap                  // smaller half
high ← empty min-heap                 // bigger half

function addNum(x):
    low.push(x)
    high.push(low.pop())              // biggest small value moves up
    if high.size() > low.size():
        low.push(high.pop())          // keep low the same size or one bigger

function findMedian():
    if low.size() > high.size():
        return low.peek()
    return (low.peek() + high.peek()) / 2`,
    },
    {
      kind: 'code',
      lang: 'js',
      code: `const low = new Heap((a, b) => b - a);  // max-heap
const high = new Heap((a, b) => a - b); // min-heap

function addNum(x) {
  low.push(x);
  high.push(low.pop());
  if (high.size() > low.size()) low.push(high.pop());
}

function findMedian() {
  if (low.size() > high.size()) return low.peek();
  return (low.peek() + high.peek()) / 2;
}`,
    },
    {
      kind: 'compare',
      title: 'n adds, a median after each',
      rows: [
        { approach: 'Re-sort after each add', time: 'O(n² log n)', space: 'O(n)', note: 'Works for tiny inputs only.' },
        { approach: 'Sorted list + insert', time: 'O(n²)', space: 'O(n)', note: 'Median is instant, but each insert shifts values.' },
        { approach: 'Two heaps', time: 'O(n log n)', space: 'O(n)', note: 'O(log n) per add, O(1) per median.' },
      ],
    },
    {
      kind: 'list',
      items: [
        '**Signals:** "median", "middle", a stream, or any problem that splits data into a smaller group and a bigger group and needs the boundary.',
        '**Other shapes of two heaps:** two candidate pools (pick the cheapest from the left end or the right end), or "available" vs "busy" (free servers in one heap, working servers in another, ordered by when they finish).',
        '**Template:** decide what each heap holds and what its top means, then write the rule that keeps them in balance after every change.',
      ],
    },
    {
      kind: 'callout',
      tone: 'trap',
      title: 'Traps',
      text: "**1.** Skipping the rebalance step. Then one heap keeps growing and its top is no longer the middle. **2.** The max-heap needs `(a, b) => b - a`. Using `a - b` for both turns low into a min-heap and the median is wrong. **3.** For an even count, the median can be a decimal like 1.5. Divide by 2 with `/`, never `>> 1` or `Math.floor`.",
    },
  ],
  problems: [
    {
      id: 'heaps-median-finder',
      title: 'Live median delivery time',
      difficulty: 'hard',
      leetcode: 295,
      pattern: 'Two heaps (running median)',
      statement:
        "Build a live median tracker. (LeetCode calls this hard, but you just watched it run.) You get a list of operations: `['addNum', x]` adds a number, `['findMedian']` asks for the median of all numbers added so far. Return one output per operation: `addNum` gives `null`, `findMedian` gives the median. For an even count, the median is the average of the two middle numbers. `findMedian` is only called after at least one `addNum`.",
      examples: [
        {
          input: "ops = [['addNum', 1], ['addNum', 2], ['findMedian'], ['addNum', 3], ['findMedian']]",
          output: '[null, null, 1.5, null, 2]',
          explain: '[1, 2] has median (1 + 2) / 2 = 1.5. [1, 2, 3] has median 2.',
        },
      ],
      constraints: ['-10⁵ ≤ x ≤ 10⁵', 'up to 5 · 10⁴ operations'],
      hints: [
        'The median only depends on the one or two values in the middle.',
        'Split into a low half and a high half. The low half needs its biggest, the high half needs its smallest.',
        'Max-heap `low`, min-heap `high`. Add: push into low, move low top to high, and if high is bigger, move high top back. Median: low top, or the average of both tops.',
      ],
      approaches: [
        {
          name: 'Sorted array',
          idea: 'Insert each number in its sorted spot, then read the middle. Reading is O(1), but each insert shifts up to n values.',
          time: 'O(n) per add',
          space: 'O(n)',
        },
        {
          name: 'Two heaps',
          idea: 'The low half lives in a max-heap and the high half in a min-heap, so the two middle values are always on top. Sending each new value through low and then to high puts it on the correct side; one final move keeps the sizes balanced.',
          pseudo: `function runMedianFinder(ops):
    low ← empty max-heap
    high ← empty min-heap
    out ← empty list
    for each op in ops:
        if op is addNum x:
            low.push(x)
            high.push(low.pop())
            if high.size() > low.size():
                low.push(high.pop())
            append null to out
        else:
            if low.size() > high.size():
                append low.peek() to out
            else:
                append (low.peek() + high.peek()) / 2 to out
    return out`,
          code: `function runMedianFinder(ops) {
  const low = new Heap((a, b) => b - a);
  const high = new Heap((a, b) => a - b);
  const out = [];
  for (const [op, x] of ops) {
    if (op === 'addNum') {
      low.push(x);
      high.push(low.pop());
      if (high.size() > low.size()) low.push(high.pop());
      out.push(null);
    } else if (low.size() > high.size()) {
      out.push(low.peek());
    } else {
      out.push((low.peek() + high.peek()) / 2);
    }
  }
  return out;
}`,
          time: 'O(log n) per add, O(1) per median',
          space: 'O(n)',
        },
      ],
      fn: 'runMedianFinder',
      starter: `function runMedianFinder(ops) {
  // Keep a low half and a high half. Return one output per op.
  return [];
}`,
      solution: `function runMedianFinder(ops) {
  const low = new Heap((a, b) => b - a);
  const high = new Heap((a, b) => a - b);
  const out = [];
  for (const [op, x] of ops) {
    if (op === 'addNum') {
      low.push(x);
      high.push(low.pop());
      if (high.size() > low.size()) low.push(high.pop());
      out.push(null);
    } else if (low.size() > high.size()) {
      out.push(low.peek());
    } else {
      out.push((low.peek() + high.peek()) / 2);
    }
  }
  return out;
}`,
      tests: tests.runMedianFinder,
      compare: 'float',
      takeaway: 'Median of a stream = max-heap for the low half + min-heap for the high half, sizes kept within one.',
    },
    {
      id: 'heaps-hire-workers',
      title: 'Hire from both ends of the line',
      difficulty: 'medium',
      leetcode: 2462,
      pattern: 'Two heaps (two candidate pools)',
      statement:
        "Workers stand in a line, and `costs[i]` is what worker i charges. You will hire `k` workers in `k` rounds. Each round you may only consider the first `candidates` workers and the last `candidates` workers still in line (if those groups overlap, it is just everyone left). Hire the cheapest of them; if there is a tie, hire the one with the smaller index. That worker leaves the line. Return the total cost.",
      examples: [
        {
          input: 'costs = [17, 12, 10, 2, 7, 2, 11, 20, 8], k = 3, candidates = 4',
          output: '11',
          explain: 'Round 1: front [17, 12, 10, 2], back [2, 11, 20, 8]. Cheapest is 2, the one at index 3 wins the tie. Round 2 hires the other 2. Round 3 hires 7. Total 11.',
        },
        { input: 'costs = [1, 2, 4, 1], k = 3, candidates = 3', output: '4', explain: 'The groups overlap, so everyone is a candidate: hire 1, 1, 2.' },
      ],
      constraints: ['1 ≤ costs.length ≤ 10⁵', '1 ≤ k, candidates ≤ costs.length'],
      hints: [
        'Two pools: the front group and the back group. Each needs its cheapest worker fast.',
        'One min-heap for the front, one for the back. Two pointers `l` and `r` mark the next worker to bring in on each side.',
        'Each round: refill each heap up to `candidates` while `l ≤ r`. Compare the two tops; on a tie take the front (its indexes are smaller). Pop that one.',
      ],
      approaches: [
        {
          name: 'Scan both groups each round',
          idea: 'Each round, look at every candidate in both groups and take the cheapest. Correct, but each round costs O(candidates), and removing from the middle of an array costs O(n).',
          time: 'O(k · (candidates + n))',
          space: 'O(1)',
        },
        {
          name: 'Two min-heaps + two pointers',
          idea: 'Each group is a pool that changes by one worker per round, so each gets a min-heap. The pointers bring in the next worker on the side that lost one. Everyone in the front heap has a smaller index than everyone in the back heap, so ties go to the front.',
          pseudo: `function totalCost(costs, k, candidates):
    front ← empty min-heap
    back ← empty min-heap
    l ← 0
    r ← n - 1
    total ← 0
    for round from 1 to k:
        while front.size() < candidates and l ≤ r:
            front.push(costs[l])
            l ← l + 1
        while back.size() < candidates and l ≤ r:
            back.push(costs[r])
            r ← r - 1
        a ← front.peek(), or infinity if front is empty
        b ← back.peek(), or infinity if back is empty
        if a ≤ b:
            total ← total + front.pop()
        else:
            total ← total + back.pop()
    return total`,
          code: `function totalCost(costs, k, candidates) {
  const front = new Heap((a, b) => a - b);
  const back = new Heap((a, b) => a - b);
  let l = 0;
  let r = costs.length - 1;
  let total = 0;
  for (let round = 0; round < k; round++) {
    while (front.size() < candidates && l <= r) front.push(costs[l++]);
    while (back.size() < candidates && l <= r) back.push(costs[r--]);
    const a = front.isEmpty() ? Infinity : front.peek();
    const b = back.isEmpty() ? Infinity : back.peek();
    total += a <= b ? front.pop() : back.pop();
  }
  return total;
}`,
          time: 'O((k + candidates) log candidates)',
          space: 'O(candidates)',
        },
      ],
      fn: 'totalCost',
      starter: `function totalCost(costs, k, candidates) {
  // One pool at the front of the line, one at the back.
  return 0;
}`,
      solution: `function totalCost(costs, k, candidates) {
  const front = new Heap((a, b) => a - b);
  const back = new Heap((a, b) => a - b);
  let l = 0;
  let r = costs.length - 1;
  let total = 0;
  for (let round = 0; round < k; round++) {
    while (front.size() < candidates && l <= r) front.push(costs[l++]);
    while (back.size() < candidates && l <= r) back.push(costs[r--]);
    const a = front.isEmpty() ? Infinity : front.peek();
    const b = back.isEmpty() ? Infinity : back.peek();
    total += a <= b ? front.pop() : back.pop();
  }
  return total;
}`,
      tests: tests.totalCost,
      takeaway: 'Two pools that each need their best member = two heaps. Pointers feed new items into whichever pool shrank.',
    },
  ],
  quiz: [
    {
      prompt: 'In the running-median setup, what is the top of the low half?',
      options: ['The smallest number overall', 'The biggest number in the smaller half', 'The median, always', 'The newest number'],
      answer: 1,
      explanation: 'Low is a max-heap of the smaller half, so its top is the biggest of the small values: one of the middle values.',
    },
    {
      prompt: 'Low holds {5, 3, 1} and high holds {8, 15}. What is the median?',
      options: ['5', '6.5', '8', '3'],
      answer: 0,
      explanation: 'Low has one extra, so the count is odd and the median is low’s top: 5.',
    },
    {
      prompt: 'Why does `addNum` send every new number through low and then into high?',
      options: [
        'To make it slower',
        'So the number lands on the correct side: low gives up its biggest, which belongs in high if it is bigger than the rest',
        'Because heaps can only hold one value',
        'To sort the numbers',
      ],
      answer: 1,
      explanation: 'After the trip, every value in low is ≤ every value in high. Then one optional move fixes the sizes.',
    },
  ],
  takeaways: [
    'Running median: max-heap for the low half, min-heap for the high half. The tops are the middle.',
    'Keep sizes equal or let low have one extra. Rebalance after every add.',
    'Two heaps also fit "two pools": front vs back of a line, or free vs busy.',
  ],
};
