import type { Lesson } from '../types';

const lesson: Lesson = {
  id: 'solving-loop',
  title: 'The solving loop',
  summary: 'One repeatable path from "no idea" to working code: brute force, waste, insight, dry run, edge cases.',
  minutes: 20,
  blocks: [
    {
      kind: 'callout',
      tone: 'story',
      title: 'The tiny voting machine',
      text: 'A school votes for class president on an old machine. The rules promise that the winner got **more than half** of all votes. The machine streams the votes past once and has room to remember just two numbers. Can it still name the winner?',
    },
    {
      kind: 'text',
      text: 'Good solvers do not wait for a flash of genius. They run the same loop every time, and the idea shows up somewhere in the middle. Here is the loop. We will run it on the voting machine, step by step.',
    },
    {
      kind: 'list',
      ordered: true,
      items: [
        '**Understand**: say the problem back in one sentence. Ask what is guaranteed.',
        '**Examples**: work 2-3 by hand, including a tiny one.',
        '**Brute force**: the obvious correct answer, and its Big-O.',
        '**Spot the waste**: what is repeated or thrown away?',
        '**Optimize**: one idea that removes the waste. Check it against the constraint target.',
        '**Dry run**: run the idea by hand on an example.',
        '**Edge cases**: empty, one item, all the same, negatives, biggest n.',
        '**Code**: translate the pseudocode, then test the edge cases.',
      ],
    },
    {
      kind: 'text',
      text: '**1-2. Understand and examples.** Given `nums`, return the value that appears **more than n / 2 times**. It is guaranteed to exist. `[3, 2, 3]` → `3`. `[2, 2, 1, 1, 1, 2, 2]` → `2` (four of seven). Tiny case: `[5]` → `5`. Limits: `n ≤ 5·10⁴`, so O(n²) (about 2.5·10⁹) is too slow; aim for O(n log n) or O(n).',
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: '3. Brute force: count every value',
      code: `function majorityElement(nums):
    for each candidate in nums:
        count ← 0
        for each x in nums:
            if x = candidate:
                count ← count + 1
        if count > n / 2:
            return candidate`,
    },
    {
      kind: 'text',
      text: '**4. Spot the waste.** The value `2` gets counted from scratch every time it shows up as a candidate. Two common fixes: **sort** the array, and the majority must sit in the middle (it covers more than half, so it covers index `n / 2`): O(n log n). Or **count** each value once in a map: O(n) time but O(n) extra memory (that is module 2). The machine only has room for two numbers. Can we do O(n) time *and* O(1) memory?',
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: '5. Optimize: votes cancel out',
      text: 'Pair each vote for the winner with one vote for someone else and throw both away. The winner has more votes than everyone else **combined**, so it is the one left standing. On a stream, keep a `candidate` and a `count`: same vote, count up; different vote, count down; at zero, the next vote becomes the new candidate. This is the **Boyer-Moore voting** trick.',
    },
    {
      kind: 'steps',
      title: '6. Dry run on [2, 2, 1, 1, 1, 2, 2]',
      frames: [
        {
          cells: [2, 2, 1, 1, 1, 2, 2],
          pointers: { i: 0 },
          active: [0],
          vars: { candidate: 2, count: 1 },
          note: 'Count is 0, so the first vote, 2, becomes the candidate.',
        },
        {
          cells: [2, 2, 1, 1, 1, 2, 2],
          pointers: { i: 1 },
          active: [1],
          done: [0],
          vars: { candidate: 2, count: 2 },
          note: 'Another 2 matches the candidate: count goes up.',
        },
        {
          cells: [2, 2, 1, 1, 1, 2, 2],
          pointers: { i: 2 },
          active: [2],
          done: [0, 1],
          vars: { candidate: 2, count: 1 },
          note: 'A 1 cancels one of the 2s: count goes down.',
        },
        {
          cells: [2, 2, 1, 1, 1, 2, 2],
          pointers: { i: 3 },
          active: [3],
          done: [0, 1, 2],
          vars: { candidate: 2, count: 0 },
          note: 'Another 1 cancels the last 2. Everything so far has paired off.',
        },
        {
          cells: [2, 2, 1, 1, 1, 2, 2],
          pointers: { i: 4 },
          active: [4],
          done: [0, 1, 2, 3],
          vars: { candidate: 1, count: 1 },
          note: 'Count is 0, so 1 becomes the new candidate.',
        },
        {
          cells: [2, 2, 1, 1, 1, 2, 2],
          pointers: { i: 5 },
          active: [5],
          done: [0, 1, 2, 3, 4],
          vars: { candidate: 1, count: 0 },
          note: 'A 2 cancels the 1. Count is back to 0.',
        },
        {
          cells: [2, 2, 1, 1, 1, 2, 2],
          pointers: { i: 6 },
          found: [6],
          done: [0, 1, 2, 3, 4, 5],
          vars: { candidate: 2, count: 1 },
          note: 'Count is 0, so the last 2 becomes the candidate. It survives: the answer is 2.',
        },
      ],
    },
    {
      kind: 'code',
      lang: 'pseudo',
      code: `function majorityElement(nums):
    candidate ← none
    count ← 0
    for each x in nums:
        if count = 0:
            candidate ← x
        if x = candidate:
            count ← count + 1
        else:
            count ← count - 1
    return candidate`,
    },
    {
      kind: 'code',
      lang: 'js',
      title: '8. Code',
      code: `function majorityElement(nums) {
  let candidate = null;
  let count = 0;
  for (const x of nums) {
    if (count === 0) candidate = x;
    count += x === candidate ? 1 : -1;
  }
  return candidate;
}`,
    },
    {
      kind: 'list',
      items: [
        '**7. Edge cases.** One vote `[5]`: it becomes the candidate with count 1. Correct.',
        '**All the same** `[4, 4, 4]`: count only goes up. Correct.',
        '**Winner shows up last** `[1, 2, 2]`: 1 is cancelled by the first 2, the last 2 takes over. Correct.',
        '**Negative values** `[-1, -1, 2]`: nothing in the idea cares about sign. Correct.',
      ],
    },
    {
      kind: 'compare',
      title: 'Majority element',
      rows: [
        { approach: 'Count every value', time: 'O(n²)', space: 'O(1)', note: 'Recounts the same value again and again.' },
        { approach: 'Sort, take the middle', time: 'O(n log n)', space: 'O(1) to O(n)', note: 'The majority always covers index n / 2.' },
        { approach: 'Count in a map (module 2)', time: 'O(n)', space: 'O(n)', note: 'Fast, but needs memory for every distinct value.' },
        { approach: 'Boyer-Moore voting', time: 'O(n)', space: 'O(1)', note: 'One pass, two variables.' },
      ],
    },
    {
      kind: 'text',
      text: '**The pattern is the loop itself.** You did not need to know Boyer-Moore in advance: the brute force showed you the waste, and the "two numbers only" limit pushed you to the cancel-out idea. Run this loop on every problem in this course.',
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Template: the solving loop',
      code: `function solve(problem):
    restate it in one sentence, list what is guaranteed
    work 2-3 examples by hand, one of them tiny
    write the brute force and its Big-O
    target ← Big-O allowed by the constraints
    while brute force Big-O > target:
        find the work that is repeated or thrown away
        remove it with one idea
    dry-run the idea on an example
    check edge cases: empty, one item, all same, negatives, max n
    write the code and test those edge cases`,
    },
    {
      kind: 'callout',
      tone: 'trap',
      title: 'Voting needs the promise',
      text: 'Boyer-Moore always returns *some* candidate, even when no value has more than half. On `[1, 2, 3]` it returns `3`, which is wrong. It only works because the problem **guarantees** a majority. Without that promise, do a second pass to count the candidate and check it really is more than `n / 2`.',
    },
  ],
  problems: [
    {
      id: 'thinking-majority-element',
      title: 'Majority Element',
      difficulty: 'easy',
      leetcode: 169,
      pattern: 'Solving loop',
      statement:
        'Votes for class president arrive as `nums`. One candidate got **more than half** of all the votes (this is guaranteed). Return that candidate. Try to use O(1) extra memory.',
      examples: [
        { input: 'nums = [3,2,3]', output: '3' },
        { input: 'nums = [2,2,1,1,1,2,2]', output: '2', explain: '2 has 4 of the 7 votes.' },
      ],
      constraints: ['1 ≤ n ≤ 5·10⁴', '-10⁹ ≤ nums[i] ≤ 10⁹', 'a majority always exists'],
      hints: [
        'Start with the brute force: count each value. Then ask what work it repeats.',
        'If you sort, where in the array must the majority value sit?',
        'For O(1) memory: pair one winner vote with one other vote and drop both. Who is left?',
        'Keep `candidate` and `count`. When `count` is 0, take the current vote as candidate; then add 1 if it matches, subtract 1 if not.',
      ],
      approaches: [
        {
          name: 'Count every value',
          idea: 'For each value, count how often it appears and return the one above n / 2. Correct but it recounts the same value many times.',
          time: 'O(n²)',
          space: 'O(1)',
        },
        {
          name: 'Sort, take the middle',
          idea: 'After sorting, equal values sit together. A block longer than half the array must cover the middle index, so `sorted[floor(n / 2)]` is the answer.',
          code: `function majorityElement(nums) {
  const sorted = [...nums].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}`,
          time: 'O(n log n)',
          space: 'O(n) for the copy',
        },
        {
          name: 'Boyer-Moore voting',
          idea: 'Cancel each winner vote against one different vote. The winner has more votes than all the others together, so after every cancellation it is still standing. A candidate plus a count is enough to do this in one pass.',
          pseudo: `function majorityElement(nums):
    candidate ← none
    count ← 0
    for each x in nums:
        if count = 0:
            candidate ← x
        if x = candidate:
            count ← count + 1
        else:
            count ← count - 1
    return candidate`,
          code: `function majorityElement(nums) {
  let candidate = null;
  let count = 0;
  for (const x of nums) {
    if (count === 0) candidate = x;
    count += x === candidate ? 1 : -1;
  }
  return candidate;
}`,
          time: 'O(n)',
          space: 'O(1)',
        },
      ],
      fn: 'majorityElement',
      starter: `function majorityElement(nums) {
  // return the value that appears more than n / 2 times
  return 0;
}`,
      solution: `function majorityElement(nums) {
  let candidate = null;
  let count = 0;
  for (const x of nums) {
    if (count === 0) candidate = x;
    count += x === candidate ? 1 : -1;
  }
  return candidate;
}`,
      tests: [
        { name: 'example', args: [[3, 2, 3]], expected: 3 },
        { name: 'longer example', args: [[2, 2, 1, 1, 1, 2, 2]], expected: 2 },
        { name: 'one vote', args: [[1]], expected: 1 },
        { name: 'all the same', args: [[5, 5, 5, 5]], expected: 5 },
        { name: 'winner shows up last', args: [[1, 2, 2]], expected: 2 },
        { name: 'negatives', args: [[-1, -1, 2]], expected: -1 },
        { name: 'winner split up', args: [[4, 4, 7, 7, 7, 4, 4]], expected: 4 },
        { name: 'winner in the middle', args: [[10, 9, 9, 9, 10]], expected: 9 },
      ],
      takeaway: 'A strong promise in the statement ("more than half") often unlocks an O(1)-memory trick.',
    },
    {
      id: 'thinking-max-product-two',
      title: 'Maximum Product of Two Elements',
      difficulty: 'easy',
      leetcode: 1464,
      pattern: 'Track the top few',
      statement:
        'In a game you combine two different power-ups from `nums`. A power-up of level `x` gives a boost of `x - 1`, and two boosts multiply. Pick two **different positions** `i ≠ j` and return the biggest `(nums[i] - 1) × (nums[j] - 1)`.',
      examples: [
        { input: 'nums = [3,4,5,2]', output: '12', explain: '(5 - 1) × (4 - 1) = 12.' },
        { input: 'nums = [1,5,4,5]', output: '16', explain: 'The two 5s are at different positions: 4 × 4 = 16.' },
      ],
      constraints: ['2 ≤ n ≤ 500', '1 ≤ nums[i] ≤ 1000'],
      hints: [
        'Run the loop: brute force is every pair. What do you notice about which pair always wins?',
        'All boosts are 0 or more, so the two biggest values give the biggest product.',
        'Sorting works, but you can find the two biggest values in one pass with two variables.',
        'For each x: if x > first, then second = first and first = x; else if x > second, second = x.',
      ],
      approaches: [
        {
          name: 'Every pair',
          idea: 'Try every pair `i < j` and keep the biggest product. With n ≤ 500 this is fast enough, and it is a correct starting point.',
          time: 'O(n²)',
          space: 'O(1)',
        },
        {
          name: 'Sort',
          idea: 'Since every boost is at least 0, the two largest values win. Sort and multiply the last two.',
          time: 'O(n log n)',
          space: 'O(n) for a copy',
        },
        {
          name: 'Track the two biggest',
          idea: 'You only ever need the top two values, so keep them in two variables while walking. When a new value beats the first, the old first slides down to second.',
          pseudo: `function maxProduct(nums):
    first ← 0
    second ← 0
    for each x in nums:
        if x > first:
            second ← first
            first ← x
        else if x > second:
            second ← x
    return (first - 1) × (second - 1)`,
          code: `function maxProduct(nums) {
  let first = 0;
  let second = 0;
  for (const x of nums) {
    if (x > first) {
      second = first;
      first = x;
    } else if (x > second) {
      second = x;
    }
  }
  return (first - 1) * (second - 1);
}`,
          time: 'O(n)',
          space: 'O(1)',
        },
      ],
      fn: 'maxProduct',
      starter: `function maxProduct(nums) {
  // return the biggest (nums[i] - 1) * (nums[j] - 1) with i !== j
  return 0;
}`,
      solution: `function maxProduct(nums) {
  let first = 0;
  let second = 0;
  for (const x of nums) {
    if (x > first) {
      second = first;
      first = x;
    } else if (x > second) {
      second = x;
    }
  }
  return (first - 1) * (second - 1);
}`,
      tests: [
        { name: 'example', args: [[3, 4, 5, 2]], expected: 12 },
        { name: 'top value twice', args: [[1, 5, 4, 5]], expected: 16 },
        { name: 'two items', args: [[3, 7]], expected: 12 },
        { name: 'all ones', args: [[1, 1]], expected: 0 },
        { name: 'biggest first', args: [[10, 2, 5, 2]], expected: 36 },
        { name: 'all the same', args: [[2, 2, 2]], expected: 1 },
        { name: 'biggest values', args: [[1, 1000, 1000]], expected: 998001 },
      ],
      takeaway: 'If only the top two values matter, two variables beat a sort.',
    },
    {
      id: 'thinking-third-max',
      title: 'Third Maximum Number',
      difficulty: 'easy',
      leetcode: 414,
      pattern: 'Track the top few',
      statement:
        'A game shows a podium for the top three **different** scores in `nums`. Return the third-highest distinct score. If there are fewer than three different scores, return the highest score instead.',
      examples: [
        { input: 'nums = [3,2,1]', output: '1' },
        { input: 'nums = [1,2]', output: '2', explain: 'Only two different scores, so return the highest.' },
        { input: 'nums = [2,2,3,1]', output: '1', explain: 'The distinct scores are 3, 2, 1.' },
      ],
      constraints: ['1 ≤ n ≤ 10⁴', '-2³¹ ≤ nums[i] ≤ 2³¹ - 1'],
      hints: [
        'Edge cases first: duplicates, fewer than three distinct values, and very negative values.',
        'A sort works: sort, drop duplicates, and pick. Can you do it in one pass?',
        'Keep `first`, `second`, `third`. Skip a value equal to any of them. A bigger value shifts the others down.',
        'Use `null` (or `-Infinity`) for "not found yet", never a real number like `0` or `-2³¹`, because those can be real scores.',
      ],
      approaches: [
        {
          name: 'Sort the distinct values',
          idea: 'Remove duplicates, sort big to small, take index 2 if it exists, else index 0. Correct and easy to reason about.',
          code: `function thirdMax(nums) {
  const distinct = [...new Set(nums)].sort((a, b) => b - a);
  return distinct.length >= 3 ? distinct[2] : distinct[0];
}`,
          time: 'O(n log n)',
          space: 'O(n)',
        },
        {
          name: 'Track the top three',
          idea: 'Only the three best distinct scores can matter, so keep three slots. A new value either slides into one slot and pushes the smaller ones down, or it is too small (or a duplicate) and is ignored.',
          pseudo: `function thirdMax(nums):
    first ← none
    second ← none
    third ← none
    for each x in nums:
        if x = first or x = second or x = third:
            continue
        if first is none or x > first:
            third ← second
            second ← first
            first ← x
        else if second is none or x > second:
            third ← second
            second ← x
        else if third is none or x > third:
            third ← x
    if third is none:
        return first
    return third`,
          code: `function thirdMax(nums) {
  let first = null;
  let second = null;
  let third = null;
  for (const x of nums) {
    if (x === first || x === second || x === third) continue;
    if (first === null || x > first) {
      [first, second, third] = [x, first, second];
    } else if (second === null || x > second) {
      [second, third] = [x, second];
    } else if (third === null || x > third) {
      third = x;
    }
  }
  return third === null ? first : third;
}`,
          time: 'O(n)',
          space: 'O(1)',
        },
      ],
      fn: 'thirdMax',
      starter: `function thirdMax(nums) {
  // return the third biggest distinct value, or the biggest if there is none
  return 0;
}`,
      solution: `function thirdMax(nums) {
  let first = null;
  let second = null;
  let third = null;
  for (const x of nums) {
    if (x === first || x === second || x === third) continue;
    if (first === null || x > first) {
      [first, second, third] = [x, first, second];
    } else if (second === null || x > second) {
      [second, third] = [x, second];
    } else if (third === null || x > third) {
      third = x;
    }
  }
  return third === null ? first : third;
}`,
      tests: [
        { name: 'example', args: [[3, 2, 1]], expected: 1 },
        { name: 'only two distinct', args: [[1, 2]], expected: 2 },
        { name: 'duplicates', args: [[2, 2, 3, 1]], expected: 1 },
        { name: 'one value', args: [[5]], expected: 5 },
        { name: 'all the same', args: [[1, 1, 1]], expected: 1 },
        { name: 'many duplicates', args: [[1, 2, 2, 5, 3, 5]], expected: 2 },
        { name: 'smallest 32-bit int is real', args: [[1, 2, -2147483648]], expected: -2147483648 },
        { name: 'smallest int comes first', args: [[-2147483648, 1, 2]], expected: -2147483648 },
        { name: 'two distinct with repeats', args: [[5, 5, 4, 4]], expected: 5 },
      ],
      takeaway: 'Use a "nothing yet" marker (null) that can never be a real input value.',
    },
    {
      id: 'thinking-smooth-descent',
      title: 'Smooth Descent Periods of a Stock',
      difficulty: 'medium',
      leetcode: 2110,
      pattern: 'Streak counter',
      statement:
        'Your stock app wants to highlight **smooth descents**: one or more days in a row where each day\'s price is **exactly 1 lower** than the day before. A single day counts as a smooth descent by itself. Given `prices`, return how many smooth descent periods there are.',
      examples: [
        {
          input: 'prices = [3,2,1,4]',
          output: '7',
          explain: '[3], [2], [1], [4], [3,2], [2,1], [3,2,1].',
        },
        { input: 'prices = [8,6,7,7]', output: '4', explain: 'Only the single days. 8 → 6 drops by 2, not 1.' },
      ],
      constraints: ['1 ≤ n ≤ 10⁵', '1 ≤ prices[i] ≤ 10⁵'],
      hints: [
        'Run the loop. n ≤ 10⁵, so checking every period (O(n²)) is too slow.',
        'Count each period at its **last** day. How many smooth periods end on day `i`?',
        'If day `i` is exactly 1 below day `i - 1`, the run ending at `i` is one longer than the run ending at `i - 1`. Otherwise it is 1.',
        'Add the current run length to the answer every day.',
      ],
      approaches: [
        {
          name: 'Extend from every start',
          idea: 'From each day, extend right while each price drops by exactly 1, counting one period per step. Correct but O(n²) when the whole array is one long descent.',
          time: 'O(n²)',
          space: 'O(1)',
        },
        {
          name: 'Streak counter',
          idea: 'If the smooth run ending today has length `L`, then exactly `L` periods end today (lengths 1 to L). The run grows by one when today is exactly 1 below yesterday, else it restarts at 1. Adding `L` every day counts every period once.',
          pseudo: `function getDescentPeriods(prices):
    run ← 0
    total ← 0
    for i from 0 to n - 1:
        if i > 0 and prices[i] = prices[i - 1] - 1:
            run ← run + 1
        else:
            run ← 1
        total ← total + run
    return total`,
          code: `function getDescentPeriods(prices) {
  let run = 0;
  let total = 0;
  for (let i = 0; i < prices.length; i++) {
    if (i > 0 && prices[i] === prices[i - 1] - 1) run++;
    else run = 1;
    total += run;
  }
  return total;
}`,
          time: 'O(n)',
          space: 'O(1)',
        },
      ],
      fn: 'getDescentPeriods',
      starter: `function getDescentPeriods(prices) {
  // count periods where each day is exactly 1 below the day before
  return 0;
}`,
      solution: `function getDescentPeriods(prices) {
  let run = 0;
  let total = 0;
  for (let i = 0; i < prices.length; i++) {
    if (i > 0 && prices[i] === prices[i - 1] - 1) run++;
    else run = 1;
    total += run;
  }
  return total;
}`,
      tests: [
        { name: 'example', args: [[3, 2, 1, 4]], expected: 7 },
        { name: 'drop by 2 does not count', args: [[8, 6, 7, 7]], expected: 4 },
        { name: 'one day', args: [[1]], expected: 1 },
        { name: 'one long descent', args: [[5, 4, 3, 2, 1]], expected: 15 },
        { name: 'going up', args: [[1, 2, 3]], expected: 3 },
        { name: 'two short descents', args: [[4, 3, 3, 2]], expected: 6 },
        { name: 'gap in the middle', args: [[10, 9, 7, 6]], expected: 6 },
        { name: 'flat prices', args: [[2, 2, 2]], expected: 3 },
      ],
      takeaway: 'Same streak trick as zero-filled windows: count each period at the day it ends.',
    },
  ],
  quiz: [
    {
      prompt: 'You wrote a correct brute force and its Big-O is too slow for the limits. What is the next step of the loop?',
      options: ['Start coding it anyway', 'Spot the waste: find work that is repeated or thrown away', 'Check edge cases', 'Look up the answer'],
      answer: 1,
      explanation: 'The waste in the brute force is the map to the faster idea. Edge cases and code come after the idea.',
    },
    {
      prompt: 'Run Boyer-Moore voting on `[1, 1, 2, 2, 2]`. What is the final candidate?',
      options: ['1', '2', 'none', 'It depends on the order of the loop'],
      answer: 1,
      explanation: '1 (count 1), 1 (2), 2 (1), 2 (0), then 2 becomes candidate with count 1. Answer: 2.',
    },
    {
      prompt: 'Boyer-Moore returns `3` on `[1, 2, 3]`. Why is that not a bug in this problem?',
      options: [
        'Because 3 is the biggest value',
        'Because the problem guarantees a majority exists, so this input can never appear',
        'Because the last value always wins',
        'It is a bug: Boyer-Moore is wrong',
      ],
      answer: 1,
      explanation: 'The trick relies on the "more than half" promise. Without it, you add a second pass to verify the candidate.',
    },
  ],
  takeaways: [
    'Understand → examples → brute → waste → optimize → dry run → edge cases → code. Every time.',
    'The brute force is not wasted effort: its repeated work points straight at the better idea.',
    'Read every guarantee in the statement; tricks like voting only work because of one.',
  ],
};

export default lesson;
