import type { Lesson } from '../types';
import { tests } from './12-heaps.tests';

export const lesson1: Lesson = {
  id: 'how-a-heap-works',
  title: 'How a heap works: build one',
  summary: 'An array that always knows its smallest value. Build push and pop yourself, then meet the built-in Heap.',
  minutes: 25,
  blocks: [
    {
      kind: 'callout',
      tone: 'story',
      title: 'The ER waiting room',
      text: "A hospital ER does not treat people in the order they walk in. A nurse gives each patient an urgency number (1 = most urgent). When a doctor is free, the most urgent patient goes next. New patients keep arriving all night. The nurse needs two moves, fast: **add a patient** and **take the most urgent one**.",
    },
    {
      kind: 'text',
      text: "That is the whole job of a **priority queue**: a box where you `push` values in any order, and `pop` always hands back the smallest one. Patients with urgency 5, 3, 8, 1 arrive. `pop` should give 1, then 3, then 5, then 8, even if more patients arrive in between.",
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Brute force: a plain list',
      code: `function push(x):
    append x to list                    // O(1)

function popMin():
    m ← 0
    for i from 1 to n - 1:              // scan everything
        if list[i] < list[m]:
            m ← i
    remove list[m] and return it        // O(n)`,
    },
    {
      kind: 'text',
      text: "This works. But every `pop` scans all n values. With 100,000 patients that is 100,000 checks per pop, so about 10¹⁰ steps in total. Keeping the list **sorted** flips the problem: `pop` is instant, but every `push` must shift values to make room, which is O(n) again.",
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'Only the top matters',
      text: "A sorted list is too tidy. We never ask for the 2nd or 7th value, only the smallest. A **heap** keeps just enough order: every parent is ≤ its children. That puts the smallest value at the top and leaves the rest loose. Loose order is cheap to repair: one push or pop only fixes **one path** from top to bottom.",
    },
    {
      kind: 'diagram',
      title: 'A min-heap is a tree stored in an array',
      art: `           1            level 0: index 0
         /   \\
        3     5         level 1: index 1, 2
       / \\   /
      4   8 9           level 2: index 3, 4, 5

array:  [1, 3, 5, 4, 8, 9]
index:   0  1  2  3  4  5`,
      caption: "Read the tree level by level, left to right, and you get the array. No pointers needed. The tree is always filled level by level, so the array never has gaps.",
    },
    {
      kind: 'table',
      title: 'Moving around the tree with index math',
      head: ['You are at index i', 'Formula', 'Example (i = 1, value 3)'],
      rows: [
        ['Parent', '`(i - 1) >> 1` (same as floor((i - 1) / 2))', 'index 0 (value 1)'],
        ['Left child', '`2 * i + 1`', 'index 3 (value 4)'],
        ['Right child', '`2 * i + 2`', 'index 4 (value 8)'],
      ],
    },
    {
      kind: 'steps',
      title: 'push(2): add at the end, then sift up',
      frames: [
        { cells: [1, 3, 5, 4, 8, 9], note: 'A valid min-heap. Every parent is ≤ its children.' },
        {
          cells: [1, 3, 5, 4, 8, 9, 2],
          active: [6],
          pointers: { i: 6 },
          vars: { parent: '(6 - 1) >> 1 = 2' },
          note: 'Put 2 in the next free spot, the end of the array (index 6). Its parent is index 2.',
        },
        {
          cells: [1, 3, 2, 4, 8, 9, 5],
          active: [2, 6],
          pointers: { i: 2 },
          vars: { parent: '(2 - 1) >> 1 = 0' },
          note: '2 < its parent 5, so they swap. 2 moves up to index 2.',
        },
        {
          cells: [1, 3, 2, 4, 8, 9, 5],
          active: [0, 2],
          found: [2],
          pointers: { i: 2 },
          note: '2 ≥ its new parent 1. Order is fine, so we stop. Only 2 swaps, not a full sort.',
        },
      ],
    },
    {
      kind: 'steps',
      title: 'pop(): take the top, move the last value up, sift down',
      frames: [
        { cells: [1, 3, 2, 4, 8, 9, 5], found: [0], vars: { answer: 1 }, note: 'The smallest is always at index 0. Save it: this is what pop returns.' },
        {
          cells: [5, 3, 2, 4, 8, 9],
          active: [0],
          pointers: { i: 0 },
          vars: { answer: 1 },
          note: 'Fill the hole with the LAST value (5) and shrink the array. Now 5 sits on top, which is wrong.',
        },
        {
          cells: [5, 3, 2, 4, 8, 9],
          active: [0, 1, 2],
          pointers: { i: 0 },
          vars: { answer: 1, 'smaller child': 2 },
          note: 'Look at both children: 3 and 2. Pick the SMALLER one (2). 5 > 2, so swap them.',
        },
        {
          cells: [2, 3, 5, 4, 8, 9],
          active: [2, 5],
          pointers: { i: 2 },
          vars: { answer: 1 },
          note: '5 is now at index 2. Its only child is 9. 5 ≤ 9, so we stop.',
        },
        { cells: [2, 3, 5, 4, 8, 9], found: [0], vars: { answer: 1 }, note: 'Valid heap again, with 2 on top. pop returned 1.' },
      ],
    },
    {
      kind: 'text',
      text: "**Why is this fast?** A swap moves a value one level up or down. A tree that is filled level by level has about log₂(n) levels: 1,000,000 values fit in just 20 levels. So `push` and `pop` cost **O(log n)**, and `peek` (look at index 0) is O(1).",
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Min-heap: push and pop',
      code: `function push(x):
    append x to a
    i ← size of a - 1
    while i > 0:
        p ← floor((i - 1) / 2)          // parent
        if a[p] ≤ a[i]:
            break                       // order is fine
        swap a[i] and a[p]
        i ← p

function pop():
    if a is empty:
        return null
    top ← a[0]
    last ← remove the last item of a
    if a is not empty:
        a[0] ← last
        i ← 0
        while true:
            m ← i                       // index of the smallest of the three
            l ← 2 * i + 1
            r ← 2 * i + 2
            if l < size of a and a[l] < a[m]:
                m ← l
            if r < size of a and a[r] < a[m]:
                m ← r
            if m = i:
                break
            swap a[i] and a[m]
            i ← m
    return top`,
    },
    {
      kind: 'code',
      lang: 'js',
      title: 'The same thing in JavaScript',
      code: `class MinHeap {
  constructor() {
    this.a = [];
  }
  size() {
    return this.a.length;
  }
  peek() {
    return this.a.length ? this.a[0] : null;
  }
  push(x) {
    const a = this.a;
    a.push(x);
    let i = a.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (a[p] <= a[i]) break;
      [a[i], a[p]] = [a[p], a[i]];
      i = p;
    }
  }
  pop() {
    const a = this.a;
    if (a.length === 0) return null;
    const top = a[0];
    const last = a.pop();
    if (a.length > 0) {
      a[0] = last;
      let i = 0;
      while (true) {
        const l = 2 * i + 1;
        const r = l + 1;
        let m = i;
        if (l < a.length && a[l] < a[m]) m = l;
        if (r < a.length && a[r] < a[m]) m = r;
        if (m === i) break;
        [a[i], a[m]] = [a[m], a[i]];
        i = m;
      }
    }
    return top;
  }
}`,
    },
    {
      kind: 'compare',
      title: 'n pushes and n pops',
      rows: [
        { approach: 'Unsorted list', time: 'O(n²)', space: 'O(n)', note: 'push is O(1), but every pop scans everything.' },
        { approach: 'Sorted list', time: 'O(n²)', space: 'O(n)', note: 'pop is O(1), but every push shifts values to stay sorted.' },
        { approach: 'Binary heap', time: 'O(n log n)', space: 'O(n)', note: 'push and pop both O(log n). peek is O(1).' },
      ],
    },
    {
      kind: 'callout',
      tone: 'tip',
      title: 'Bonus: heapify in O(n)',
      text: "If you already have all n values, you can build a heap without n pushes. Run sift-down on every parent, from the last parent (index `floor(n / 2) - 1`) back to index 0. Most nodes sit near the bottom and barely move, so the total is **O(n)**, not O(n log n). Good to know; interviews rarely need it.",
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'From now on: use the built-in Heap',
      text: "You built one, so you know what it costs. In every later problem (and every later module), use the runner's `Heap` class instead: `new Heap(compare)`, with `push(x)`, `pop()` (smallest first, `undefined` when empty), `peek()`, `size()` and `isEmpty()`. The `compare(a, b)` function works like a sort comparator: it returns a **negative number when `a` should come out first**.",
    },
    {
      kind: 'code',
      lang: 'js',
      title: 'Built-in Heap cheat sheet',
      code: `const minH = new Heap((a, b) => a - b); // smallest on top
const maxH = new Heap((a, b) => b - a); // biggest on top

minH.push(5);
minH.push(1);
minH.peek();    // 1 (look, don't remove)
minH.pop();     // 1 (remove and return)
minH.size();    // 1
minH.isEmpty(); // false

// Tuples: order by the first item, e.g. [dist, x, y]
const byDist = new Heap((a, b) => a[0] - b[0]);

// Tie-break: fewer plays first; equal plays, then A to Z
const songs = new Heap((a, b) => a.plays - b.plays || a.name.localeCompare(b.name));`,
    },
    {
      kind: 'list',
      items: [
        '**Reach for a heap when** you need the smallest or biggest value **again and again** while values keep being added or removed.',
        '**Skip the heap when** you need the minimum only once (one scan, O(n)) or everything sorted once (just sort).',
        '**Template:** push items as they show up, pop the top when you need the next best. Max-heap if you need the biggest.',
      ],
    },
    {
      kind: 'callout',
      tone: 'trap',
      title: 'JavaScript heap traps',
      text: "**1.** JS has no built-in priority queue. On LeetCode JS you can use the provided `MinPriorityQueue` / `MaxPriorityQueue`, or paste your own heap. **2.** `nums.sort()` with no comparator sorts as strings: `[10, 9, 1].sort()` gives `[1, 10, 9]`. Always pass `(a, b) => a - b`. **3.** Do not fake a heap by pushing and re-sorting an array on every insert. That is O(n log n) per push. **4.** In sift-down, swap with the **smaller** child, not just the left one.",
    },
  ],
  problems: [
    {
      id: 'heaps-build-min-heap',
      title: 'Build a min-heap',
      difficulty: 'medium',
      pattern: 'Heap internals (sift up / sift down)',
      statement:
        "Write a min-heap from scratch. Do **not** use the built-in `Heap` here: the point is to build it. You get a list of operations: `['push', x]`, `['pop']`, `['peek']`, `['size']`. Return a list with one output per operation: `push` gives `null`, `pop` removes and returns the smallest value, `peek` returns the smallest without removing it, `size` returns how many values are inside. `pop` and `peek` on an empty heap give `null`.",
      examples: [
        {
          input: "ops = [['push', 5], ['push', 3], ['push', 8], ['peek'], ['pop'], ['pop'], ['size']]",
          output: '[null, null, null, 3, 3, 5, 1]',
          explain: 'After the pushes the smallest is 3. Pop gives 3, then 5. Only 8 is left, so size is 1.',
        },
        { input: "ops = [['pop'], ['peek'], ['size']]", output: '[null, null, 0]' },
      ],
      constraints: ['0 ≤ number of ops ≤ 200', '-10⁴ ≤ x ≤ 10⁴'],
      hints: [
        'Store the values in a plain array. Index 0 is the top. The children of index i are 2i + 1 and 2i + 2.',
        'push: add at the end, then keep swapping with the parent `(i - 1) >> 1` while the parent is bigger.',
        'pop: save `a[0]`, move the last value to index 0, then swap down with the SMALLER child until both children are ≥ it.',
      ],
      approaches: [
        {
          name: 'Sorted array',
          idea: 'Keep the array sorted. pop takes from the front, push inserts in the right place. Correct, but each push or pop shifts values, so it is O(n) per operation.',
          time: 'O(n) per op',
          space: 'O(n)',
        },
        {
          name: 'Binary heap in an array',
          idea: 'Only promise that each parent ≤ its children. A push or pop breaks that promise along one path only, and a path has about log n nodes. Sift up after push, sift down after pop.',
          pseudo: `function runMinHeap(ops):
    a ← empty list
    out ← empty list
    for each op in ops:
        if op is push x:
            append x to a, then sift it up
            append null to out
        else if op is pop:
            if a is empty:
                append null to out
            else:
                append a[0] to out
                move the last item of a to index 0
                sift index 0 down
        else if op is peek:
            append (a[0] if a is not empty, else null) to out
        else:
            append size of a to out
    return out`,
          code: `function runMinHeap(ops) {
  const heap = new MinHeap();
  const out = [];
  for (const [op, x] of ops) {
    if (op === 'push') {
      heap.push(x);
      out.push(null);
    } else if (op === 'pop') out.push(heap.pop());
    else if (op === 'peek') out.push(heap.peek());
    else out.push(heap.size());
  }
  return out;
}
// MinHeap is the class from the lesson above.`,
          time: 'O(log n) per push/pop',
          space: 'O(n)',
        },
      ],
      fn: 'runMinHeap',
      starter: `function runMinHeap(ops) {
  // Build your own heap (array + sift up / sift down), then replay ops.
  return [];
}`,
      solution: `class MinHeap {
  constructor() {
    this.a = [];
  }
  size() {
    return this.a.length;
  }
  peek() {
    return this.a.length ? this.a[0] : null;
  }
  push(x) {
    const a = this.a;
    a.push(x);
    let i = a.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (a[p] <= a[i]) break;
      [a[i], a[p]] = [a[p], a[i]];
      i = p;
    }
  }
  pop() {
    const a = this.a;
    if (a.length === 0) return null;
    const top = a[0];
    const last = a.pop();
    if (a.length > 0) {
      a[0] = last;
      let i = 0;
      while (true) {
        const l = 2 * i + 1;
        const r = l + 1;
        let m = i;
        if (l < a.length && a[l] < a[m]) m = l;
        if (r < a.length && a[r] < a[m]) m = r;
        if (m === i) break;
        [a[i], a[m]] = [a[m], a[i]];
        i = m;
      }
    }
    return top;
  }
}

function runMinHeap(ops) {
  const heap = new MinHeap();
  const out = [];
  for (const [op, x] of ops) {
    if (op === 'push') {
      heap.push(x);
      out.push(null);
    } else if (op === 'pop') out.push(heap.pop());
    else if (op === 'peek') out.push(heap.peek());
    else out.push(heap.size());
  }
  return out;
}`,
      tests: tests.runMinHeap,
      takeaway: 'A heap is an array where each parent ≤ its children. Fix one path after each change: O(log n).',
    },
    {
      id: 'heaps-last-stone-weight',
      title: 'Last stone standing',
      difficulty: 'easy',
      leetcode: 1046,
      pattern: 'Max-heap simulation',
      statement:
        "You have a pile of stones with weights. Each turn, grab the **two heaviest** and smash them together. If they weigh the same, both turn to dust. If not, the lighter one is destroyed and the heavier one shrinks by the lighter one's weight, then goes back on the pile. Keep going until at most one stone is left. Return its weight, or 0 if none is left.",
      examples: [
        {
          input: 'stones = [2, 7, 4, 1, 8, 1]',
          output: '1',
          explain: '8 vs 7 → 1. Pile [2, 4, 1, 1, 1]. 4 vs 2 → 2. Then 2 vs 1 → 1. Then 1 vs 1 → dust. One stone of weight 1 is left.',
        },
        { input: 'stones = [3, 3]', output: '0' },
      ],
      constraints: ['1 ≤ stones.length ≤ 30', '1 ≤ stones[i] ≤ 1000'],
      hints: [
        'Every turn you need the two biggest values, and the pile keeps changing.',
        'A max-heap gives you the biggest in O(log n): `new Heap((a, b) => b - a)`.',
        'Pop twice. If they differ, push the difference back. Stop when size < 2.',
      ],
      approaches: [
        {
          name: 'Sort every turn',
          idea: 'Sort the pile, take the two biggest, put the leftover back, and sort again. Correct, but re-sorting n times costs O(n² log n).',
          time: 'O(n² log n)',
          space: 'O(n)',
        },
        {
          name: 'Max-heap',
          idea: 'The heap always knows the biggest, and fixing it after a pop or push is O(log n). Each turn removes at least one stone, so there are at most n turns.',
          pseudo: `function lastStoneWeight(stones):
    heap ← max-heap of all stones
    while heap.size() > 1:
        y ← heap.pop()                  // heaviest
        x ← heap.pop()                  // second heaviest
        if y ≠ x:
            heap.push(y - x)
    if heap is empty:
        return 0
    return heap.pop()`,
          code: `function lastStoneWeight(stones) {
  const heap = new Heap((a, b) => b - a);
  for (const s of stones) heap.push(s);
  while (heap.size() > 1) {
    const y = heap.pop();
    const x = heap.pop();
    if (y !== x) heap.push(y - x);
  }
  return heap.isEmpty() ? 0 : heap.pop();
}`,
          time: 'O(n log n)',
          space: 'O(n)',
        },
      ],
      fn: 'lastStoneWeight',
      starter: `function lastStoneWeight(stones) {
  // Use the built-in Heap as a max-heap: new Heap((a, b) => b - a)
  return 0;
}`,
      solution: `function lastStoneWeight(stones) {
  const heap = new Heap((a, b) => b - a);
  for (const s of stones) heap.push(s);
  while (heap.size() > 1) {
    const y = heap.pop();
    const x = heap.pop();
    if (y !== x) heap.push(y - x);
  }
  return heap.isEmpty() ? 0 : heap.pop();
}`,
      tests: tests.lastStoneWeight,
      takeaway: '"Repeatedly take the biggest, then put something back" is a max-heap simulation.',
    },
    {
      id: 'heaps-remove-stones',
      title: 'Shrink the piles',
      difficulty: 'medium',
      leetcode: 1962,
      pattern: 'Max-heap greedy',
      statement:
        "You have a shrink ray with `k` shots and some piles of junk, `piles[i]` items in pile i. One shot at a pile with x items removes `floor(x / 2)` of them, so `x - floor(x / 2)` stay. You can shoot the same pile more than once. Use all k shots so the **total left over is as small as possible**, and return that total.",
      examples: [
        {
          input: 'piles = [5, 4, 9], k = 2',
          output: '12',
          explain: 'Shoot 9 → 5 left: [5, 4, 5]. Shoot a 5 → 3 left: [3, 4, 5]. Total 12.',
        },
        { input: 'piles = [4, 3, 6, 7], k = 3', output: '12' },
      ],
      constraints: ['1 ≤ piles.length ≤ 10⁵', '1 ≤ piles[i] ≤ 10⁴', '0 ≤ k ≤ 10⁵'],
      hints: [
        'Which pile loses the most items when you shoot it?',
        'Always shoot the current biggest pile. After the shot, it might not be the biggest anymore.',
        'Max-heap: pop the biggest, push back `x - Math.floor(x / 2)`, k times. Track the total as you go.',
      ],
      approaches: [
        {
          name: 'Scan for the max each visit',
          idea: 'The biggest pile loses the most, so shooting it is always safe. Finding it by scanning costs O(n) per shot.',
          time: 'O(k · n)',
          space: 'O(1)',
        },
        {
          name: 'Max-heap',
          idea: 'Same greedy, but the heap hands you the biggest pile in O(log n) and takes the shrunk pile back in O(log n).',
          pseudo: `function minStoneSum(piles, k):
    heap ← max-heap of all piles
    total ← sum of piles
    for t from 1 to k:
        x ← heap.pop()
        taken ← floor(x / 2)
        total ← total - taken
        heap.push(x - taken)
    return total`,
          code: `function minStoneSum(piles, k) {
  const heap = new Heap((a, b) => b - a);
  let total = 0;
  for (const p of piles) {
    heap.push(p);
    total += p;
  }
  for (let t = 0; t < k; t++) {
    const x = heap.pop();
    const taken = Math.floor(x / 2);
    total -= taken;
    heap.push(x - taken);
  }
  return total;
}`,
          time: 'O((n + k) log n)',
          space: 'O(n)',
        },
      ],
      fn: 'minStoneSum',
      starter: `function minStoneSum(piles, k) {
  // Each shot, hit the pile that loses the most.
  return 0;
}`,
      solution: `function minStoneSum(piles, k) {
  const heap = new Heap((a, b) => b - a);
  let total = 0;
  for (const p of piles) {
    heap.push(p);
    total += p;
  }
  for (let t = 0; t < k; t++) {
    const x = heap.pop();
    const taken = Math.floor(x / 2);
    total -= taken;
    heap.push(x - taken);
  }
  return total;
}`,
      tests: tests.minStoneSum,
      takeaway: 'Greedy "always act on the biggest" + values that change = max-heap.',
    },
  ],
  quiz: [
    {
      prompt: 'In the array `[1, 3, 5, 4, 8, 9]`, who is the parent of the value 9 (index 5)?',
      options: ['3 (index 1)', '5 (index 2)', '4 (index 3)', '1 (index 0)'],
      answer: 1,
      explanation: 'Parent index = `(5 - 1) >> 1` = 2, and index 2 holds 5.',
    },
    {
      prompt: 'During sift-down after a pop, the value on top is 7 and its children are 4 and 2. What happens?',
      options: ['Swap 7 with 4 (the left child)', 'Swap 7 with 2 (the smaller child)', 'Stop, 7 is fine', 'Swap 4 and 2'],
      answer: 1,
      explanation: 'Always swap with the smaller child. If 7 swapped with 4, then 4 would sit above 2, and the parent ≤ child rule would break.',
    },
    {
      prompt: 'Which comparator makes the built-in `Heap` return the biggest value first?',
      options: ['`(a, b) => a - b`', '`(a, b) => b - a`', '`(a, b) => a > b`', 'No comparator'],
      answer: 1,
      explanation: 'The heap pops whatever compares as "smaller". `b - a` is negative when a is bigger, so bigger values come out first.',
    },
    {
      prompt: 'A heap holds 1,000,000 values. About how many swaps can one push take, at most?',
      options: ['About 20', 'About 1,000', 'About 500,000', '1,000,000'],
      answer: 0,
      explanation: 'A swap moves one level, and a heap of 1,000,000 values has about log₂(1,000,000) ≈ 20 levels.',
    },
  ],
  takeaways: [
    'A heap is an array read as a tree: parent of i is `(i - 1) >> 1`, children are `2i + 1` and `2i + 2`.',
    'push = add at the end + sift up. pop = take index 0, move the last value up + sift down. Both O(log n).',
    'From here on use the built-in `Heap`: `(a, b) => a - b` is a min-heap, `(a, b) => b - a` is a max-heap.',
    'Never re-sort an array on every insert, and never call `sort()` on numbers without a comparator.',
  ],
};
