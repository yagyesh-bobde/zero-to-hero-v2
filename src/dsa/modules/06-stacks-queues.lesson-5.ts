import type { Lesson } from '../types';

// Module 6, lesson 5: queues, ring buffers and the monotonic deque.
const lesson: Lesson = {
  id: 'queues-deques',
  title: 'Queues and deques',
  summary: 'Old items leave from the front; a deque also lets you throw out useless items from the back.',
  minutes: 25,
  blocks: [
    {
      kind: 'callout',
      tone: 'story',
      title: 'How an API says "slow down"',
      text: 'Many APIs allow, say, 100 requests per minute. Go over and you get **429 Too Many Requests**. To decide, the server keeps the times of your recent requests in a line. New requests join the back. Requests older than a minute fall off the front. If the line is too long, you are blocked. That line is a **queue**.',
    },
    {
      kind: 'text',
      text: 'A **queue** is first in, first out (**FIFO**): add at the back (**enqueue**), remove from the front (**dequeue**), like people at a ticket counter or jobs waiting for a printer. **The problem.** Requests arrive at increasing times (in ms): `[1, 100, 3001, 3002]`. For each one, how many requests happened in the last 3000 ms, counting itself (the window `[t - 3000, t]`)? Answer: `[1, 2, 3, 3]`.',
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Brute force: recount everything every time',
      code: `function countRecentSlow(times):
    answer ← empty list
    for i from 0 to n - 1:
        count ← 0
        for j from 0 to i:
            if times[j] ≥ times[i] - 3000: count ← count + 1
        append count to answer
    return answer                       // O(n²)`,
    },
    {
      kind: 'text',
      text: '**Spot the waste.** Times only go up. Once a request is too old for the window, it is too old **forever**. So throw it away and never look at it again. The old ones are always at the front, the new one goes at the back: a queue. The count is just the queue length.',
    },
    {
      kind: 'trace',
      title: 'Rate window of 3000 ms',
      columns: ['t', 'window', 'drop from front', 'queue after', 'count'],
      rows: [
        [1, '[-2999, 1]', '-', '1', 1],
        [100, '[-2900, 100]', '-', '1 100', 2],
        [3001, '[1, 3001]', '-', '1 100 3001', 3],
        [3002, '[2, 3002]', '1', '100 3001 3002', 3],
      ],
      note: 'Each time is added once and dropped at most once. O(n) in total.',
    },
    {
      kind: 'callout',
      tone: 'trap',
      title: '`shift()` is O(n) in JavaScript',
      text: '`arr.shift()` removes the first element, then moves every other element one slot left. In a loop that is O(n²). Instead keep a **head index**: the front is `q[head]`, dequeue is `head++`, and the size is `q.length - head`. The array never shifts.',
    },
    {
      kind: 'code',
      lang: 'js',
      title: 'A queue with a head index',
      code: `function countRecentCalls(times) {
  const q = [];
  let head = 0; // q[head] is the front
  const answer = [];
  for (const t of times) {
    q.push(t);
    while (q[head] < t - 3000) head++; // drop too-old requests
    answer.push(q.length - head);
  }
  return answer;
}`,
    },
    {
      kind: 'text',
      text: '**Fixed size? Use a ring.** A keyboard buffer or an audio player holds at most k items and reuses memory. A **circular queue** (also called a ring buffer) is an array of size k with a `head` index and a `count`. Moving past the last slot wraps to slot 0 using `% k`. The next free slot is `(head + count) % k`.',
    },
    {
      kind: 'diagram',
      title: 'Ring buffer, k = 4, holding 2, 3, 4 (front to back)',
      art: ` index:    0     1     2     3
 slot:  [  3  |  4  |     |  2  ]
                  ^     ^     ^
                rear  next  head (front)

 head = 3, count = 3
 rear = (head + count - 1) % 4 = 1
 next = (head + count) % 4     = 2`,
      caption: 'The front sits at slot 3 and the line wraps around to slots 0 and 1. Nothing ever moves; only `head` and `count` change.',
    },
    {
      kind: 'text',
      text: '**Now a harder one: the deque.** A stock chart shows "highest price in the last 3 minutes", updated every minute. Prices `[1, 3, -1, -3, 5, 3, 6, 7]`, window size 3. The window maxima are `[3, 3, 5, 5, 6, 7]`. Recomputing the max of each window costs O(k) each time, O(n·k) in total. Can we keep the max ready, like the queue kept the count ready?',
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'Smaller and older? It can never win.',
      text: 'If a new price is bigger than an older one still in the window, the older one can **never** be the max again: the bigger one is newer, so it stays in the window at least as long. Throw the older one out. To do that we need to remove from the **back** too. A **deque** (double-ended queue, said "deck") lets you add and remove at both ends. Keep indexes whose prices go **down** from front to back. The front is the max.',
    },
    {
      kind: 'steps',
      title: 'Sliding window max, k = 3 (deque holds indexes)',
      frames: [
        { cells: [1, 3, -1, -3, 5, 3, 6, 7], pointers: { i: 0 }, active: [0], found: [0], vars: { deque: '0(1)', out: '' }, note: 'Push index 0. The window is not full yet.' },
        { cells: [1, 3, -1, -3, 5, 3, 6, 7], pointers: { i: 1 }, active: [0, 1], found: [1], vars: { deque: '1(3)', out: '' }, note: '3 beats 1, and 1 is older: 1 can never be a max. Pop it from the back. Push 1.' },
        { cells: [1, 3, -1, -3, 5, 3, 6, 7], pointers: { i: 2, L: 0 }, active: [0, 1, 2], found: [1], vars: { deque: '1(3) 2(-1)', out: '3' }, note: '-1 is smaller, so it might win later. Push. Window full: the front, 3, is the max.' },
        { cells: [1, 3, -1, -3, 5, 3, 6, 7], pointers: { i: 3, L: 1 }, active: [1, 2, 3], found: [1], done: [0], vars: { deque: '1(3) 2(-1) 3(-3)', out: '3 3' }, note: 'Push -3. Front index 1 is still inside the window. Max 3.' },
        { cells: [1, 3, -1, -3, 5, 3, 6, 7], pointers: { i: 4, L: 2 }, active: [2, 3, 4], found: [4], done: [0, 1], vars: { deque: '4(5)', out: '3 3 5' }, note: 'Index 1 slid out: drop it from the front. 5 beats -3 and -1: pop them from the back. Max 5.' },
        { cells: [1, 3, -1, -3, 5, 3, 6, 7], pointers: { i: 5, L: 3 }, active: [3, 4, 5], found: [4], done: [0, 1, 2], vars: { deque: '4(5) 5(3)', out: '3 3 5 5' }, note: '3 is smaller than 5. Push it; it may win once 5 leaves. Max 5.' },
        { cells: [1, 3, -1, -3, 5, 3, 6, 7], pointers: { i: 6, L: 4 }, active: [4, 5, 6], found: [6], done: [0, 1, 2, 3], vars: { deque: '6(6)', out: '3 3 5 5 6' }, note: '6 beats 3 and 5. Pop both from the back. Max 6.' },
        { cells: [1, 3, -1, -3, 5, 3, 6, 7], pointers: { i: 7, L: 5 }, active: [5, 6, 7], found: [7], done: [0, 1, 2, 3, 4], vars: { deque: '7(7)', out: '3 3 5 5 6 7' }, note: '7 beats 6. Pop, push. Max 7. Done in one pass.' },
      ],
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Monotonic deque',
      code: `function maxSlidingWindow(nums, k):
    deque ← empty deque              // indexes, values going down
    answer ← empty list
    for i from 0 to n - 1:
        if deque is not empty and deque.front() ≤ i - k:
            deque.popFront()          // slid out of the window
        while deque is not empty and nums[deque.back()] ≤ nums[i]:
            deque.popBack()           // older and not bigger: useless
        deque.pushBack(i)
        if i ≥ k - 1:
            append nums[deque.front()] to answer
    return answer`,
    },
    {
      kind: 'code',
      lang: 'js',
      code: `function maxSlidingWindow(nums, k) {
  const dq = []; // indexes; the front is dq[head]
  let head = 0;
  const answer = [];
  for (let i = 0; i < nums.length; i++) {
    if (dq.length > head && dq[head] <= i - k) head++;
    while (dq.length > head && nums[dq[dq.length - 1]] <= nums[i]) dq.pop();
    dq.push(i);
    if (i >= k - 1) answer.push(nums[dq[head]]);
  }
  return answer;
}`,
    },
    {
      kind: 'compare',
      title: 'Window maximum',
      rows: [
        { approach: 'Max of every window', time: 'O(n · k)', space: 'O(1) extra', note: 'Simple. Slow when k is big.' },
        { approach: 'Max-heap of (value, index)', time: 'O(n log n)', space: 'O(n)', note: 'Throw away stale tops lazily. Heaps are module 12.' },
        { approach: 'Monotonic deque', time: 'O(n)', space: 'O(k)', note: 'Each index enters once and leaves once.' },
      ],
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Template: monotonic deque over a window',
      code: `deque ← empty deque                    // indexes
for i from 0 to n - 1:
    drop the front while it is outside the window
    while back of deque can never beat a[i]:
        deque.popBack()
    deque.pushBack(i)
    the front is the best in the window`,
    },
    {
      kind: 'callout',
      tone: 'tip',
      title: 'Stack, queue or deque?',
      text: 'Need the **newest** item? Stack. Need the **oldest** item? Queue. Need the oldest **and** to throw away useless newer ones? Deque. Fixed space, items reused over and over? Ring buffer. (Window basics live in module 4; here the new tool is the deque.)',
    },
  ],
  problems: [
    {
      id: 'stacks-queues-recent-counter',
      title: 'Requests in the Last 3 Seconds',
      difficulty: 'easy',
      leetcode: 933,
      pattern: 'Queue (drop from the front)',
      statement:
        'You are writing a rate limiter. `times` lists request times in milliseconds, in **strictly increasing** order. For each request at time `t`, report how many requests (including this one) happened in the window `[t - 3000, t]`. Return the list of counts. (On LeetCode this is a class with a `ping(t)` method; here one function returns every answer.)',
      examples: [
        { input: 'times = [1,100,3001,3002]', output: '[1,2,3,3]', explain: 'At 3002 the window is [2, 3002], so the request at 1 is out.' },
      ],
      constraints: ['0 ≤ times.length ≤ 10⁴', '1 ≤ times[i] ≤ 10⁹, strictly increasing'],
      hints: [
        'Once a request is too old, can it ever count again?',
        'No, because times only go up. Old requests leave from the front; new ones join the back. That is a queue.',
        'Use an array plus a `head` index. Push `t`, then `head++` while `q[head] < t - 3000`. The count is `q.length - head`.',
      ],
      approaches: [
        {
          name: 'Recount every time',
          idea: 'For each request, loop over all earlier ones and count those in the window. Correct, but O(n) per request.',
          time: 'O(n²)',
          space: 'O(1) extra',
        },
        {
          name: 'Queue with a head index',
          idea: 'Keep the requests that are still inside the window. The oldest are at the front, so dropping stale ones is just moving `head` forward. Each time enters once and leaves once.',
          pseudo: `function countRecentCalls(times):
    queue ← empty queue
    answer ← empty list
    for each t in times:
        queue.pushBack(t)
        while queue.front() < t - 3000:
            queue.popFront()
        append size of queue to answer
    return answer`,
          code: `function countRecentCalls(times) {
  const q = [];
  let head = 0;
  const answer = [];
  for (const t of times) {
    q.push(t);
    while (q[head] < t - 3000) head++;
    answer.push(q.length - head);
  }
  return answer;
}`,
          time: 'O(n)',
          space: 'O(n)',
        },
      ],
      fn: 'countRecentCalls',
      starter: `function countRecentCalls(times) {
  // for each t, count requests in [t - 3000, t]
  return [];
}`,
      solution: `function countRecentCalls(times) {
  const q = [];
  let head = 0;
  const answer = [];
  for (const t of times) {
    q.push(t);
    while (q[head] < t - 3000) head++;
    answer.push(q.length - head);
  }
  return answer;
}`,
      tests: [
        { name: 'example', args: [[1, 100, 3001, 3002]], expected: [1, 2, 3, 3] },
        { name: 'one request', args: [[5]], expected: [1] },
        { name: 'all close together', args: [[1, 2, 3]], expected: [1, 2, 3] },
        { name: 'edge of window counts', args: [[1, 3001, 6001]], expected: [1, 2, 2] },
        { name: 'far apart', args: [[1, 5000, 10000]], expected: [1, 1, 1] },
        { name: 'sliding along', args: [[100, 3100, 3101, 6101, 6102]], expected: [1, 2, 2, 2, 2] },
        { name: 'no requests', args: [[]], expected: [] },
      ],
      takeaway: 'If items only ever expire from the old end, a queue with a head index keeps the count in O(1).',
    },
    {
      id: 'stacks-queues-circular-queue',
      title: 'Ring Buffer for a Print Queue',
      difficulty: 'medium',
      leetcode: 622,
      pattern: 'Circular queue (ring buffer)',
      statement:
        'A small printer has memory for exactly `k` jobs. Build `MyCircularQueue(k)` using a fixed array of size `k`: `enQueue(v)` adds a job at the back (return `false` if full, else `true`), `deQueue()` removes the front job (return `false` if empty, else `true`), `Front()` and `Rear()` return the front or back job (or `-1` if empty), plus `isEmpty()` and `isFull()`. **Testing:** the runner `runCircularQueue(k, ops)` is already written. It runs a list like `[["enQueue", 1], ["Front"]]` and returns one output per operation.',
      examples: [
        {
          input: 'k = 3, ops = [["enQueue",1],["enQueue",2],["enQueue",3],["enQueue",4],["Rear"],["isFull"],["deQueue"],["enQueue",4],["Rear"]]',
          output: '[true,true,true,false,3,true,true,true,4]',
          explain: 'The 4th job does not fit until one is removed. Then it wraps into the freed slot.',
        },
      ],
      constraints: ['1 ≤ k ≤ 1000', 'up to 3000 operations'],
      hints: [
        'Do not move items around. Keep a `head` index for the front and a `count` of items.',
        'The slot after the last item is `(head + count) % k`. The last item is at `(head + count - 1) % k`.',
        'Dequeue is `head = (head + 1) % k; count--`. Empty means `count === 0`, full means `count === k`.',
      ],
      approaches: [
        {
          name: 'Array with shift',
          idea: 'Use a normal array: `push` to enqueue, `shift` to dequeue, check the length against `k`. Easy, but `shift` moves every item and it does not reuse a fixed block of memory.',
          time: 'O(k) per deQueue',
          space: 'O(k)',
        },
        {
          name: 'Ring buffer: head + count',
          idea: 'A fixed array where positions wrap with `% k`. The front is at `head`; items continue for `count` slots, wrapping past the end. Nothing ever moves, so every operation is O(1).',
          pseudo: `init(k):  slots ← array of size k; head ← 0; count ← 0
enQueue(v):
    if count = k: return false
    slots[(head + count) mod k] ← v
    count ← count + 1
    return true
deQueue():
    if count = 0: return false
    head ← (head + 1) mod k
    count ← count - 1
    return true
Front(): return -1 if count = 0, else slots[head]
Rear():  return -1 if count = 0, else slots[(head + count - 1) mod k]`,
          code: `class MyCircularQueue {
  constructor(k) {
    this.slots = new Array(k);
    this.k = k;
    this.head = 0;
    this.count = 0;
  }
  enQueue(v) {
    if (this.count === this.k) return false;
    this.slots[(this.head + this.count) % this.k] = v;
    this.count++;
    return true;
  }
  deQueue() {
    if (this.count === 0) return false;
    this.head = (this.head + 1) % this.k;
    this.count--;
    return true;
  }
  Front() {
    return this.count === 0 ? -1 : this.slots[this.head];
  }
  Rear() {
    return this.count === 0 ? -1 : this.slots[(this.head + this.count - 1) % this.k];
  }
  isEmpty() {
    return this.count === 0;
  }
  isFull() {
    return this.count === this.k;
  }
}`,
          time: 'O(1) every operation',
          space: 'O(k)',
        },
      ],
      fn: 'runCircularQueue',
      starter: `class MyCircularQueue {
  constructor(k) {
    // a fixed array of size k, plus whatever indexes you need
  }
  enQueue(v) {}
  deQueue() {}
  Front() {}
  Rear() {}
  isEmpty() {}
  isFull() {}
}

// Already written: runs the test operations. Leave it as is.
function runCircularQueue(k, ops) {
  const q = new MyCircularQueue(k);
  return ops.map(([op, arg]) => {
    const out = q[op](arg);
    return out === undefined ? null : out;
  });
}`,
      solution: `class MyCircularQueue {
  constructor(k) {
    this.slots = new Array(k);
    this.k = k;
    this.head = 0;
    this.count = 0;
  }
  enQueue(v) {
    if (this.count === this.k) return false;
    this.slots[(this.head + this.count) % this.k] = v;
    this.count++;
    return true;
  }
  deQueue() {
    if (this.count === 0) return false;
    this.head = (this.head + 1) % this.k;
    this.count--;
    return true;
  }
  Front() {
    return this.count === 0 ? -1 : this.slots[this.head];
  }
  Rear() {
    return this.count === 0 ? -1 : this.slots[(this.head + this.count - 1) % this.k];
  }
  isEmpty() {
    return this.count === 0;
  }
  isFull() {
    return this.count === this.k;
  }
}

function runCircularQueue(k, ops) {
  const q = new MyCircularQueue(k);
  return ops.map(([op, arg]) => {
    const out = q[op](arg);
    return out === undefined ? null : out;
  });
}`,
      tests: [
        {
          name: 'example',
          args: [3, [['enQueue', 1], ['enQueue', 2], ['enQueue', 3], ['enQueue', 4], ['Rear'], ['isFull'], ['deQueue'], ['enQueue', 4], ['Rear']]],
          expected: [true, true, true, false, 3, true, true, true, 4],
        },
        {
          name: 'empty queue',
          args: [1, [['Front'], ['Rear'], ['deQueue'], ['isEmpty'], ['isFull']]],
          expected: [-1, -1, false, true, false],
        },
        {
          name: 'wraps around',
          args: [2, [['enQueue', 1], ['enQueue', 2], ['deQueue'], ['enQueue', 3], ['Front'], ['Rear'], ['deQueue'], ['deQueue'], ['isEmpty'], ['deQueue']]],
          expected: [true, true, true, true, 2, 3, true, true, true, false],
        },
        {
          name: 'size one',
          args: [1, [['enQueue', 5], ['isFull'], ['enQueue', 6], ['Front'], ['deQueue'], ['enQueue', 7], ['Rear']]],
          expected: [true, true, false, 5, true, true, 7],
        },
        {
          name: 'many laps',
          args: [3, [['enQueue', 1], ['deQueue'], ['enQueue', 2], ['deQueue'], ['enQueue', 3], ['enQueue', 4], ['enQueue', 5], ['Front'], ['Rear'], ['isFull']]],
          expected: [true, true, true, true, true, true, true, 3, 5, true],
        },
      ],
      takeaway: 'A ring buffer is an array plus `head` and `count`; `% k` does the wrapping.',
    },
    {
      id: 'stacks-queues-sliding-window-max',
      title: 'Highest Price in the Window (stretch)',
      difficulty: 'hard',
      leetcode: 239,
      pattern: 'Monotonic deque',
      statement:
        '**Stretch problem.** A stock dashboard shows the highest price over the last `k` minutes. Given `nums` (one price per minute) and window size `k`, return the maximum of every window of `k` neighbours, from left to right. There are `n - k + 1` windows.',
      examples: [
        { input: 'nums = [1,3,-1,-3,5,3,6,7], k = 3', output: '[3,3,5,5,6,7]' },
        { input: 'nums = [9,8,7,6], k = 2', output: '[9,8,7]' },
      ],
      constraints: ['1 ≤ k ≤ nums.length ≤ 10⁵', '-10⁴ ≤ nums[i] ≤ 10⁴'],
      hints: [
        'When a new price arrives that is bigger than some older price in the window, can that older price ever be the max again?',
        'No. So keep only prices that still have a chance, newest at the back. Their values go down from front to back.',
        'Deque of indexes. Drop the front if it is `≤ i - k`. Pop the back while its value is `≤ nums[i]`. Push `i`. The front is the max.',
      ],
      approaches: [
        {
          name: 'Max of every window',
          idea: 'For each of the `n - k + 1` windows, loop over its `k` items and take the max.',
          time: 'O(n · k)',
          space: 'O(1) extra',
        },
        {
          name: 'Max-heap with lazy deletes',
          idea: 'Push `[value, index]` into a max-heap. Before reading the top, pop it while its index has left the window. Works, with a log factor. (Heaps are taught in module 12.)',
          time: 'O(n log n)',
          space: 'O(n)',
        },
        {
          name: 'Monotonic deque',
          idea: 'An older, smaller price can never be the max once a bigger, newer price is in the window, so remove it from the back. What is left goes down from front to back, so the front is the max. Indexes let us spot when the front slid out.',
          pseudo: `function maxSlidingWindow(nums, k):
    deque ← empty deque                     // indexes
    answer ← empty list
    for i from 0 to n - 1:
        if deque is not empty and deque.front() ≤ i - k:
            deque.popFront()
        while deque is not empty and nums[deque.back()] ≤ nums[i]:
            deque.popBack()
        deque.pushBack(i)
        if i ≥ k - 1:
            append nums[deque.front()] to answer
    return answer`,
          code: `function maxSlidingWindow(nums, k) {
  const dq = [];
  let head = 0;
  const answer = [];
  for (let i = 0; i < nums.length; i++) {
    if (dq.length > head && dq[head] <= i - k) head++;
    while (dq.length > head && nums[dq[dq.length - 1]] <= nums[i]) dq.pop();
    dq.push(i);
    if (i >= k - 1) answer.push(nums[dq[head]]);
  }
  return answer;
}`,
          time: 'O(n)',
          space: 'O(k)',
        },
      ],
      fn: 'maxSlidingWindow',
      starter: `function maxSlidingWindow(nums, k) {
  // return the max of every window of size k
  return [];
}`,
      solution: `function maxSlidingWindow(nums, k) {
  const dq = [];
  let head = 0;
  const answer = [];
  for (let i = 0; i < nums.length; i++) {
    if (dq.length > head && dq[head] <= i - k) head++;
    while (dq.length > head && nums[dq[dq.length - 1]] <= nums[i]) dq.pop();
    dq.push(i);
    if (i >= k - 1) answer.push(nums[dq[head]]);
  }
  return answer;
}`,
      tests: [
        { name: 'example', args: [[1, 3, -1, -3, 5, 3, 6, 7], 3], expected: [3, 3, 5, 5, 6, 7] },
        { name: 'single item', args: [[1], 1], expected: [1] },
        { name: 'falling prices', args: [[9, 8, 7, 6], 2], expected: [9, 8, 7] },
        { name: 'rising prices', args: [[1, 2, 3, 4], 2], expected: [2, 3, 4] },
        { name: 'all equal', args: [[4, 4, 4], 2], expected: [4, 4] },
        { name: 'window of one', args: [[1, -1], 1], expected: [1, -1] },
        { name: 'one window', args: [[7, 2, 4], 3], expected: [7] },
        { name: 'max stays put', args: [[-7, -8, 7, 5, 7, 1, 6, 0], 4], expected: [7, 7, 7, 7, 7] },
        { name: 'front expires', args: [[1, 3, 1, 2, 0, 5], 3], expected: [3, 3, 2, 5] },
      ],
      takeaway: 'Monotonic deque: drop expired items from the front, drop hopeless items from the back; the front is the answer.',
    },
  ],
  quiz: [
    {
      prompt: 'Why is `while (q.length) q.shift()` slow on a big array?',
      options: [
        '`shift` copies the array to a new place in memory every time.',
        'Each `shift` moves every remaining element one slot left, so the loop is O(n²).',
        'It is not slow; `shift` is O(1).',
      ],
      answer: 1,
      explanation: 'Use a head index instead: `head++` is O(1) and nothing moves.',
    },
    {
      prompt: 'Ring buffer with k = 5, head = 3, count = 4. Where does the next `enQueue` write?',
      options: ['Slot 7', 'Slot 2', 'Slot 4'],
      answer: 1,
      explanation: '`(head + count) % k = (3 + 4) % 5 = 2`. The line has wrapped around.',
    },
    {
      prompt: 'Sliding window max: the deque holds prices 5, 3 (front to back) and 4 arrives. What happens?',
      options: [
        'Push 4 behind 3.',
        'Pop 3 from the back (it can never beat 4), then push 4.',
        'Pop 5 from the front.',
      ],
      answer: 1,
      explanation: '3 is older and smaller than 4, so it is hopeless. 5 stays: it is bigger, and it leaves only when it slides out.',
    },
  ],
  takeaways: [
    'Queue = FIFO. In JS use an array plus a head index, never `shift()` in a loop.',
    'Ring buffer: fixed array, `head`, `count`, and `% k` to wrap.',
    'Monotonic deque: expired items leave the front, hopeless items leave the back, the front is the best.',
  ],
};

export default lesson;
