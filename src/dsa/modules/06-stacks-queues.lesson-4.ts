import type { Lesson } from '../types';

// Module 6, lesson 4: monotonic stacks for next-greater and histogram problems.
const lesson: Lesson = {
  id: 'monotonic-stack',
  title: 'Monotonic stacks: who is next bigger?',
  summary: 'Keep a stack of items still waiting for an answer; a bigger arrival answers them all.',
  minutes: 25,
  blocks: [
    {
      kind: 'callout',
      tone: 'story',
      title: 'When will it get warmer?',
      text: 'A weather app shows a line under each day: "3 days until warmer". A stock dashboard does the same: "days until the price beats today". Each day needs the **next** day that is **bigger**. For a year of data, checking every pair of days is slow. There is a one-pass trick.',
    },
    {
      kind: 'text',
      text: '**The problem.** Daily temperatures `[73, 74, 75, 71, 69, 72, 76, 73]`. For each day, how many days until a warmer one? Write 0 if it never gets warmer. Answer: `[1, 1, 4, 2, 1, 1, 0, 0]`. Day 2 (75) waits 4 days, until 76.',
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Brute force: look ahead from every day',
      code: `function dailyTemperaturesSlow(temps):
    answer ← list of n zeros
    for i from 0 to n - 1:
        for j from i + 1 to n - 1:
            if temps[j] > temps[i]:
                answer[i] ← j - i
                break
    return answer                         // O(n²) on a cooling streak`,
    },
    {
      kind: 'text',
      text: '**Spot the waste.** On a long cold streak, every day scans the same days again. Flip it around: instead of each day looking **forward**, let each new day look **back** at the days that are **still waiting** for a warmer day. Notice something about those waiting days: they get colder from oldest to newest. If an older day were colder than a newer one, the newer day would already have answered it.',
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'A stack of the still-waiting',
      text: 'Keep a stack of days with no answer yet. Their temperatures go **down** from bottom to top, so it is a **monotonic stack** (monotonic = always moving in one direction). When a warmer day arrives, it is the answer for every colder day on top: pop them and record the distance. Then push the new day; it is waiting now.',
    },
    {
      kind: 'steps',
      title: 'Daily temperatures (stack holds indexes, temps in brackets)',
      frames: [
        { cells: [73, 74, 75, 71, 69, 72, 76, 73], pointers: { i: 0 }, active: [0], vars: { stack: '0(73)', answer: '0 0 0 0 0 0 0 0' }, note: 'Nobody is waiting. Push day 0.' },
        { cells: [73, 74, 75, 71, 69, 72, 76, 73], pointers: { i: 1 }, active: [1], found: [0], vars: { stack: '1(74)', answer: '1 0 0 0 0 0 0 0' }, note: '74 > 73: day 0 is answered, 1 - 0 = 1 day. Pop it, push day 1.' },
        { cells: [73, 74, 75, 71, 69, 72, 76, 73], pointers: { i: 2 }, active: [2], found: [1], done: [0], vars: { stack: '2(75)', answer: '1 1 0 0 0 0 0 0' }, note: '75 > 74: day 1 answered with 1. Push day 2.' },
        { cells: [73, 74, 75, 71, 69, 72, 76, 73], pointers: { i: 3 }, active: [3], done: [0, 1], vars: { stack: '2(75) 3(71)', answer: '1 1 0 0 0 0 0 0' }, note: '71 is not warmer than 75. Nobody is answered. Push day 3.' },
        { cells: [73, 74, 75, 71, 69, 72, 76, 73], pointers: { i: 4 }, active: [4], done: [0, 1], vars: { stack: '2(75) 3(71) 4(69)', answer: '1 1 0 0 0 0 0 0' }, note: '69 is colder still. Push. The stack goes down: 75, 71, 69.' },
        { cells: [73, 74, 75, 71, 69, 72, 76, 73], pointers: { i: 5 }, active: [5], found: [3, 4], done: [0, 1], vars: { stack: '2(75) 5(72)', answer: '1 1 0 2 1 0 0 0' }, note: '72 beats 69 (wait 1) and 71 (wait 2). Pop both. 75 is still warmer, so stop. Push day 5.' },
        { cells: [73, 74, 75, 71, 69, 72, 76, 73], pointers: { i: 6 }, active: [6], found: [2, 5], done: [0, 1, 3, 4], vars: { stack: '6(76)', answer: '1 1 4 2 1 1 0 0' }, note: '76 beats 72 (wait 1) and 75 (wait 4). Pop both. Push day 6.' },
        { cells: [73, 74, 75, 71, 69, 72, 76, 73], pointers: { i: 7 }, active: [7], done: [0, 1, 2, 3, 4, 5], vars: { stack: '6(76) 7(73)', answer: '1 1 4 2 1 1 0 0' }, note: '73 is colder than 76. Push day 7.' },
        { cells: [73, 74, 75, 71, 69, 72, 76, 73], done: [0, 1, 2, 3, 4, 5], found: [6, 7], vars: { stack: '6(76) 7(73)', answer: '1 1 4 2 1 1 0 0' }, note: 'Done. Days still on the stack never got a warmer day, so they keep 0.' },
      ],
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Monotonic stack',
      code: `function dailyTemperatures(temps):
    answer ← list of n zeros
    stack ← empty stack                   // indexes, temps going down
    for i from 0 to n - 1:
        while stack is not empty and temps[i] > temps[top of stack]:
            j ← pop from stack
            answer[j] ← i - j             // day i answers day j
        push i onto stack
    return answer`,
    },
    {
      kind: 'code',
      lang: 'js',
      code: `function dailyTemperatures(temps) {
  const answer = new Array(temps.length).fill(0);
  const stack = []; // indexes
  for (let i = 0; i < temps.length; i++) {
    while (stack.length && temps[i] > temps[stack[stack.length - 1]]) {
      const j = stack.pop();
      answer[j] = i - j;
    }
    stack.push(i);
  }
  return answer;
}`,
    },
    {
      kind: 'text',
      text: 'There is a `while` inside a `for`, so is it O(n²)? No. Each index is **pushed once** and **popped at most once** over the whole run. That is at most 2n stack moves in total: **O(n)**.',
    },
    {
      kind: 'compare',
      title: 'Next warmer day',
      rows: [
        { approach: 'Look ahead from every day', time: 'O(n²)', space: 'O(1) extra', note: 'Fine for 100 days, too slow for 10⁵.' },
        { approach: 'Monotonic stack', time: 'O(n)', space: 'O(n)', note: 'Every index goes in once and out once.' },
      ],
    },
    {
      kind: 'text',
      text: '**Stretch: the biggest rectangle in a skyline.** Bars of heights `[2, 1, 5, 6, 2, 3]` stand side by side, each 1 wide. What is the largest rectangle you can fit inside them? Each bar can stretch left and right until it hits a **shorter** bar. So for each bar we need the next smaller bar on both sides. A monotonic stack (this time with heights going **up**) gives both at once.',
    },
    {
      kind: 'diagram',
      title: 'Heights [2, 1, 5, 6, 2, 3]: best area is 5 × 2 = 10',
      art: ` 6 |          #
 5 |       @  @
 4 |       @  @
 3 |       @  @     #
 2 | #     @  @  #  #
 1 | #  #  @  @  #  #
   +------------------
     2  1  5  6  2  3`,
      caption: 'The `@` cells are the answer: height 5, from bar 2 to bar 3. It stops at bar 1 (height 1) and bar 4 (height 2), the nearest shorter bars.',
    },
    {
      kind: 'trace',
      title: 'Largest rectangle: stack of indexes, heights going up',
      columns: ['i', 'h[i]', 'popped → area', 'stack after', 'best'],
      rows: [
        [0, 2, '-', '0', 0],
        [1, 1, 'bar 0: 2 × 1 = 2', '1', 2],
        [2, 5, '-', '1 2', 2],
        [3, 6, '-', '1 2 3', 2],
        [4, 2, 'bar 3: 6 × 1 = 6; bar 2: 5 × 2 = 10', '1 4', 10],
        [5, 3, '-', '1 4 5', 10],
        ['6 (end)', 0, 'bar 5: 3; bar 4: 2 × 4 = 8; bar 1: 1 × 6 = 6', '6', 10],
      ],
      note: 'When bar `i` is shorter than the top, the top bar cannot stretch further right. Its left wall is the new top after popping. Width = `i - newTop - 1` (or `i` if the stack is empty). A fake bar of height 0 at the end empties the stack.',
    },
    {
      kind: 'table',
      title: 'Four flavours of monotonic stack',
      head: ['You want', 'Stack goes', 'Pop while', 'Who gets the answer'],
      rows: [
        ['Next greater (right)', 'down', '`a[top] < x`', 'Each popped item gets `x`'],
        ['Next smaller (right)', 'up', '`a[top] > x`', 'Each popped item gets `x`'],
        ['Previous greater (left)', 'down', '`a[top] ≤ x`', '`x` gets the top left after popping'],
        ['Previous smaller (left)', 'up', '`a[top] ≥ x`', '`x` gets the top left after popping'],
      ],
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Template: next greater element',
      code: `answer ← list of n defaults            // 0 or -1: "never"
stack ← empty stack                    // indexes still waiting
for i from 0 to n - 1:
    while stack is not empty and a[i] > a[top of stack]:
        j ← pop from stack
        answer[j] ← a[i]               // or i - j, or i
    push i onto stack
// whatever is left in the stack keeps the default`,
    },
    {
      kind: 'callout',
      tone: 'trap',
      title: 'Store indexes, mind the equals sign',
      text: 'Push the **index**, not the value: from an index you can get the value (`a[j]`) and the distance (`i - j`), but not the other way round. Watch `>` versus `≥`: "warmer" means strictly greater, so equal days keep waiting. For a **circular** array, loop `i` from 0 to 2n - 1 and read `a[i % n]`, pushing only on the first lap.',
    },
  ],
  problems: [
    {
      id: 'stacks-queues-daily-temperatures',
      title: 'Days Until Warmer',
      difficulty: 'medium',
      leetcode: 739,
      pattern: 'Monotonic stack (next greater)',
      statement:
        'Your weather app shows, under each day, how many days you wait for a **strictly warmer** day. Given `temps`, return an array where `answer[i]` is the number of days after day `i` until a warmer temperature, or `0` if it never comes.',
      examples: [
        { input: 'temps = [73,74,75,71,69,72,76,73]', output: '[1,1,4,2,1,1,0,0]' },
        { input: 'temps = [30,60,90]', output: '[1,1,0]' },
      ],
      constraints: ['1 ≤ temps.length ≤ 10⁵', '30 ≤ temps[i] ≤ 100'],
      hints: [
        'Instead of each day looking forward, let each new day look back at days still waiting.',
        'The waiting days are colder from oldest to newest. Which ones does a warm day answer?',
        'Stack of indexes. While today is warmer than the top: pop `j`, set `answer[j] = i - j`. Then push `i`.',
      ],
      approaches: [
        {
          name: 'Look ahead from every day',
          idea: 'For each day, walk forward until you find a warmer one. Simple, but a long cooling streak makes every day scan almost the whole rest of the list.',
          time: 'O(n²)',
          space: 'O(1) extra',
        },
        {
          name: 'Monotonic stack of waiting days',
          idea: 'The stack holds days with no answer yet; their temps go down toward the top. A warmer day answers every colder day on top. Each index is pushed and popped once, so the whole thing is linear.',
          pseudo: `function dailyTemperatures(temps):
    answer ← list of n zeros
    stack ← empty stack
    for i from 0 to n - 1:
        while stack is not empty and temps[i] > temps[top of stack]:
            j ← pop from stack
            answer[j] ← i - j
        push i onto stack
    return answer`,
          code: `function dailyTemperatures(temps) {
  const answer = new Array(temps.length).fill(0);
  const stack = [];
  for (let i = 0; i < temps.length; i++) {
    while (stack.length && temps[i] > temps[stack[stack.length - 1]]) {
      const j = stack.pop();
      answer[j] = i - j;
    }
    stack.push(i);
  }
  return answer;
}`,
          time: 'O(n)',
          space: 'O(n)',
        },
      ],
      fn: 'dailyTemperatures',
      starter: `function dailyTemperatures(temps) {
  // answer[i] = days until a warmer day, or 0
  return [];
}`,
      solution: `function dailyTemperatures(temps) {
  const answer = new Array(temps.length).fill(0);
  const stack = [];
  for (let i = 0; i < temps.length; i++) {
    while (stack.length && temps[i] > temps[stack[stack.length - 1]]) {
      const j = stack.pop();
      answer[j] = i - j;
    }
    stack.push(i);
  }
  return answer;
}`,
      tests: [
        { name: 'example', args: [[73, 74, 75, 71, 69, 72, 76, 73]], expected: [1, 1, 4, 2, 1, 1, 0, 0] },
        { name: 'always rising', args: [[30, 40, 50, 60]], expected: [1, 1, 1, 0] },
        { name: 'short rise', args: [[30, 60, 90]], expected: [1, 1, 0] },
        { name: 'one day', args: [[50]], expected: [0] },
        { name: 'equal is not warmer', args: [[70, 70, 70]], expected: [0, 0, 0] },
        { name: 'always falling', args: [[90, 80, 70]], expected: [0, 0, 0] },
        { name: 'one warm day answers all', args: [[60, 50, 40, 70]], expected: [3, 2, 1, 0] },
        { name: 'bumpy', args: [[55, 38, 53, 81, 61, 93, 97, 32, 43, 78]], expected: [3, 1, 1, 2, 1, 1, 0, 1, 1, 0] },
      ],
      takeaway: 'A monotonic stack holds the items still waiting; each new item pops everyone it answers.',
    },
    {
      id: 'stacks-queues-next-greater-element',
      title: 'Next Bigger Number Lookup',
      difficulty: 'easy',
      leetcode: 496,
      pattern: 'Monotonic stack + hash map',
      statement:
        '`nums2` is a list of **distinct** numbers, and `nums1` is a few of them (also distinct). For each `x` in `nums1`, find where `x` sits in `nums2` and return the first number to its **right** that is bigger than `x`, or `-1` if there is none. Return the answers in the order of `nums1`.',
      examples: [
        { input: 'nums1 = [4,1,2], nums2 = [1,3,4,2]', output: '[-1,3,-1]', explain: 'Right of 4 is only 2. Right of 1, 3 is bigger. Right of 2 is nothing.' },
        { input: 'nums1 = [2,4], nums2 = [1,2,3,4]', output: '[3,-1]' },
      ],
      constraints: ['1 ≤ nums1.length ≤ nums2.length ≤ 1000', 'all values distinct'],
      hints: [
        'Answer the question for **every** number in `nums2` first, then look up the ones you need.',
        'Next greater for every element is the monotonic stack from this lesson.',
        'When you pop `x` because of a bigger `y`, save `next.set(x, y)` in a Map. Then map `nums1` through it, default `-1`.',
      ],
      approaches: [
        {
          name: 'Find, then scan right',
          idea: 'For each `x`, find it in `nums2` and walk right until something is bigger. Fine for small inputs.',
          time: 'O(m · n)',
          space: 'O(1) extra',
        },
        {
          name: 'Monotonic stack once, then look up',
          idea: 'One pass over `nums2` gives the next greater value for every number. Values are distinct, so a Map from value to answer works. Then each query is O(1).',
          pseudo: `function nextGreaterElement(nums1, nums2):
    next ← empty map
    stack ← empty stack                     // values, going down
    for each y in nums2:
        while stack is not empty and y > top of stack:
            next[pop from stack] ← y
        push y onto stack
    return [next[x] if x in next else -1, for each x in nums1]`,
          code: `function nextGreaterElement(nums1, nums2) {
  const next = new Map();
  const stack = [];
  for (const y of nums2) {
    while (stack.length && y > stack[stack.length - 1]) next.set(stack.pop(), y);
    stack.push(y);
  }
  return nums1.map((x) => next.get(x) ?? -1);
}`,
          time: 'O(m + n)',
          space: 'O(n)',
        },
      ],
      fn: 'nextGreaterElement',
      starter: `function nextGreaterElement(nums1, nums2) {
  // for each x in nums1: first bigger number to its right in nums2, or -1
  return [];
}`,
      solution: `function nextGreaterElement(nums1, nums2) {
  const next = new Map();
  const stack = [];
  for (const y of nums2) {
    while (stack.length && y > stack[stack.length - 1]) next.set(stack.pop(), y);
    stack.push(y);
  }
  return nums1.map((x) => next.get(x) ?? -1);
}`,
      tests: [
        { name: 'example', args: [[4, 1, 2], [1, 3, 4, 2]], expected: [-1, 3, -1] },
        { name: 'rising list', args: [[2, 4], [1, 2, 3, 4]], expected: [3, -1] },
        { name: 'single number', args: [[1], [1]], expected: [-1] },
        { name: 'falling list', args: [[5, 1], [5, 4, 3, 2, 1]], expected: [-1, -1] },
        { name: 'one giant at the end', args: [[1, 3, 5, 2, 4], [6, 5, 4, 3, 2, 1, 7]], expected: [7, 7, 7, 7, 7] },
        { name: 'skips a smaller neighbour', args: [[3], [3, 1, 5]], expected: [5] },
      ],
      takeaway: 'Solve "next greater" for everyone with one stack pass, then answer queries from a Map.',
    },
    {
      id: 'stacks-queues-next-greater-circular',
      title: 'Next Bigger on a Round Table',
      difficulty: 'medium',
      leetcode: 503,
      pattern: 'Monotonic stack (circular)',
      statement:
        'Players sit around a round table, each holding a number. Going clockwise from each player (and wrapping around past the end of the list), who is the first player holding a **bigger** number? Given `nums` in clockwise order, return that bigger number for each player, or `-1` if nobody holds one. Numbers can repeat.',
      examples: [
        { input: 'nums = [1,2,1]', output: '[2,-1,2]', explain: 'The last 1 wraps around and finds 2.' },
        { input: 'nums = [1,2,3,4,3]', output: '[2,3,4,-1,4]' },
      ],
      constraints: ['1 ≤ nums.length ≤ 10⁴', '-10⁹ ≤ nums[i] ≤ 10⁹'],
      hints: [
        'Pretend the list is written twice in a row: `[1,2,1,1,2,1]`. Then wrapping is just reading further.',
        'You do not need to build the copy. Loop `i` from 0 to `2n - 1` and use `nums[i % n]`.',
        'Push indexes only on the first lap (`i < n`). On both laps, pop and answer every waiting index with a smaller value.',
      ],
      approaches: [
        {
          name: 'Walk around from every player',
          idea: 'For each player, step through the next n - 1 seats (with `% n`) until someone is bigger.',
          time: 'O(n²)',
          space: 'O(1) extra',
        },
        {
          name: 'Monotonic stack, two laps',
          idea: 'Two laps around the table is enough: any player\'s answer is at most one full lap away. The second lap only answers players still waiting; it never pushes new ones.',
          pseudo: `function nextGreaterElements(nums):
    answer ← list of n values, all -1
    stack ← empty stack                     // indexes still waiting
    for i from 0 to 2n - 1:
        x ← nums[i mod n]
        while stack is not empty and x > nums[top of stack]:
            answer[pop from stack] ← x
        if i < n:
            push i onto stack
    return answer`,
          code: `function nextGreaterElements(nums) {
  const n = nums.length;
  const answer = new Array(n).fill(-1);
  const stack = [];
  for (let i = 0; i < 2 * n; i++) {
    const x = nums[i % n];
    while (stack.length && x > nums[stack[stack.length - 1]]) answer[stack.pop()] = x;
    if (i < n) stack.push(i);
  }
  return answer;
}`,
          time: 'O(n)',
          space: 'O(n)',
        },
      ],
      fn: 'nextGreaterElements',
      starter: `function nextGreaterElements(nums) {
  // next bigger number going around the circle, or -1
  return [];
}`,
      solution: `function nextGreaterElements(nums) {
  const n = nums.length;
  const answer = new Array(n).fill(-1);
  const stack = [];
  for (let i = 0; i < 2 * n; i++) {
    const x = nums[i % n];
    while (stack.length && x > nums[stack[stack.length - 1]]) answer[stack.pop()] = x;
    if (i < n) stack.push(i);
  }
  return answer;
}`,
      tests: [
        { name: 'wraps around', args: [[1, 2, 1]], expected: [2, -1, 2] },
        { name: 'example two', args: [[1, 2, 3, 4, 3]], expected: [2, 3, 4, -1, 4] },
        { name: 'one player', args: [[5]], expected: [-1] },
        { name: 'all equal', args: [[3, 3, 3]], expected: [-1, -1, -1] },
        { name: 'falling, biggest first', args: [[5, 4, 3, 2, 1]], expected: [-1, 5, 5, 5, 5] },
        { name: 'max at the end', args: [[1, 5, 3, 6, 8]], expected: [5, 6, 6, 8, -1] },
        { name: 'duplicates', args: [[2, 1, 2, 4, 3, 1]], expected: [4, 2, 4, -1, 4, 2] },
        { name: 'negatives', args: [[-1, -3, -2]], expected: [-1, -2, -1] },
      ],
      takeaway: 'Circular array? Loop twice with `i % n`, and only push on the first lap.',
    },
    {
      id: 'stacks-queues-largest-rectangle',
      title: 'Biggest Billboard in the Skyline (stretch)',
      difficulty: 'hard',
      leetcode: 84,
      pattern: 'Monotonic stack (next smaller on both sides)',
      statement:
        '**Stretch problem.** A city skyline is a row of buildings, each 1 unit wide, with heights `heights`. You want to paint the biggest possible rectangle billboard that fits **inside** the buildings (touching the ground). Return its area.',
      examples: [
        { input: 'heights = [2,1,5,6,2,3]', output: '10', explain: 'Height 5 across the two buildings of heights 5 and 6.' },
        { input: 'heights = [2,4]', output: '4' },
      ],
      constraints: ['1 ≤ heights.length ≤ 10⁵', '0 ≤ heights[i] ≤ 10⁴'],
      hints: [
        'The best rectangle is as tall as some building `j`. How wide can a rectangle of exactly that height be?',
        'It stretches left and right until the first **shorter** building on each side.',
        'Keep a stack of indexes with heights going up. When a shorter bar arrives at `i`, pop `j`: its right wall is `i`, its left wall is the new top. Width = `i - top - 1` (or `i` if empty).',
        'Add a fake height 0 at the end so every bar gets popped and measured.',
      ],
      approaches: [
        {
          name: 'Try every pair of walls',
          idea: 'For each start `l`, extend `r` to the right while tracking the shortest bar seen; area is `min × width`. Correct, but n² pairs.',
          time: 'O(n²)',
          space: 'O(1)',
        },
        {
          name: 'Monotonic stack (heights going up)',
          idea: 'For each bar we need the nearest shorter bar on both sides. In an increasing stack, the item below each bar is its nearest shorter bar on the left. When a shorter bar arrives, it is the nearest shorter bar on the right for everything it pops. So each pop measures one rectangle.',
          pseudo: `function largestRectangleArea(heights):
    append 0 to heights                       // forces a final cleanup
    stack ← empty stack                       // indexes, heights going up
    best ← 0
    for i from 0 to n - 1:
        while stack is not empty and heights[i] < heights[top of stack]:
            h ← heights[pop from stack]
            if stack is empty: width ← i
            else: width ← i - (top of stack) - 1
            best ← max(best, h · width)
        push i onto stack
    return best`,
          code: `function largestRectangleArea(heights) {
  const h = [...heights, 0];
  const stack = [];
  let best = 0;
  for (let i = 0; i < h.length; i++) {
    while (stack.length && h[i] < h[stack[stack.length - 1]]) {
      const height = h[stack.pop()];
      const width = stack.length ? i - stack[stack.length - 1] - 1 : i;
      best = Math.max(best, height * width);
    }
    stack.push(i);
  }
  return best;
}`,
          time: 'O(n)',
          space: 'O(n)',
        },
      ],
      fn: 'largestRectangleArea',
      starter: `function largestRectangleArea(heights) {
  // return the area of the biggest rectangle inside the bars
  return 0;
}`,
      solution: `function largestRectangleArea(heights) {
  const h = [...heights, 0];
  const stack = [];
  let best = 0;
  for (let i = 0; i < h.length; i++) {
    while (stack.length && h[i] < h[stack[stack.length - 1]]) {
      const height = h[stack.pop()];
      const width = stack.length ? i - stack[stack.length - 1] - 1 : i;
      best = Math.max(best, height * width);
    }
    stack.push(i);
  }
  return best;
}`,
      tests: [
        { name: 'example', args: [[2, 1, 5, 6, 2, 3]], expected: 10 },
        { name: 'two bars', args: [[2, 4]], expected: 4 },
        { name: 'one bar', args: [[1]], expected: 1 },
        { name: 'zero height', args: [[0]], expected: 0 },
        { name: 'all equal', args: [[2, 2, 2, 2]], expected: 8 },
        { name: 'rising', args: [[1, 2, 3, 4, 5]], expected: 9 },
        { name: 'falling', args: [[5, 4, 3, 2, 1]], expected: 9 },
        { name: 'bumpy', args: [[6, 2, 5, 4, 5, 1, 6]], expected: 12 },
        { name: 'short bar spans all', args: [[2, 1, 2]], expected: 3 },
        { name: 'gap of zero', args: [[4, 2, 0, 3, 2, 5]], expected: 6 },
      ],
      takeaway: 'Every bar\'s rectangle ends at the nearest shorter bar on each side; an increasing stack finds both.',
    },
  ],
  quiz: [
    {
      prompt: 'Daily temperatures has a `while` loop inside a `for` loop. Why is it still O(n)?',
      options: [
        'The while loop runs at most once per day.',
        'Each index is pushed once and popped at most once in total.',
        'Temperatures are between 30 and 100.',
      ],
      answer: 1,
      explanation: 'Count stack moves over the whole run, not per loop: at most n pushes and n pops.',
    },
    {
      prompt: 'For "next greater element", what order do values on the stack have, from bottom to top?',
      options: ['Going up (increasing)', 'Going down (decreasing)', 'No particular order'],
      answer: 1,
      explanation: 'Anything smaller than the new item gets popped, so what is left (plus the new item) goes down toward the top.',
    },
    {
      prompt: 'Why push indexes instead of values in daily temperatures?',
      options: [
        'Indexes use less memory.',
        'You need the distance `i - j`, and you can always read the value as `temps[j]`.',
        'Values cannot be compared.',
      ],
      answer: 1,
      explanation: 'An index gives you both the value and the position. A value alone loses the position.',
    },
  ],
  takeaways: [
    'Monotonic stack = stack of items still waiting for an answer, kept in sorted order.',
    'Each item is pushed once and popped once: O(n), even with a while inside the for.',
    'Push indexes. Choose `>` or `≥` on purpose. Circular arrays: loop 2n with `i % n`.',
  ],
};

export default lesson;
