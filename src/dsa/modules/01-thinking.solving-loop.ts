import type { Lesson } from '../types';

const lesson: Lesson = {
  id: 'solving-loop',
  title: 'The solving loop',
  summary: 'Start with examples, find repeated work, and check a faster plan by hand.',
  minutes: 20,
  blocks: [
    {
      kind: 'callout',
      tone: 'story',
      title: 'The tiny voting machine',
      text: 'A class votes for a president. Each number names a candidate: `[2, 1, 2]` means two votes for candidate 2 and one for candidate 1. You are promised that one candidate has more than half the votes. Can you find that candidate while remembering just two values?',
    },
    {
      kind: 'text',
      text: 'The **majority** is the value that appears more than half the time. In `[2, 1, 2]`, candidate 2 has 2 of the 3 votes, so return `2`. In `[5]`, return `5`. A value appearing exactly half the time would not be a majority.',
    },
    {
      kind: 'list',
      ordered: true,
      items: [
        '**Understand**: say what goes in, what comes out, and what is promised.',
        '**Examples**: work a small case by hand, then try a different one.',
        '**Brute force**: write an obvious correct plan and count its work.',
        '**Spot the waste**: find what the plan repeats or forgets.',
        '**Optimize**: change the plan to do less work or use less memory.',
        '**Dry run**: follow the new plan by hand.',
        '**Edge cases**: check boundary situations, such as one item or all values equal.',
        '**Code**: translate the plan and test it.',
      ],
    },
    {
      kind: 'text',
      text: 'An **edge case** is a boundary situation that is easy to overlook. Follow the constraints: this voting problem always has at least one vote, so an empty array is not an allowed input. The largest size is 50,000 votes. O(n²) could mean about 2.5 billion comparisons, so look for less repeated counting.',
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
      text: 'For `[2, 1, 2]`, the brute force can count the votes for 2 twice: once for each place 2 appears. Sorting is one improvement. It puts equal votes together, and a group longer than half the array must cover the middle position. For `[2, 1, 2]`, sorted order is `[1, 2, 2]`; the middle is 2.',
    },
    {
      kind: 'text',
      text: 'Sorting works, but we want to remember only two values. Let’s try removing pairs of different votes. In `[2, 1, 2]`, remove one 2 and one 1. A 2 remains. With more than half the votes, the winner has more votes than all other candidates combined. Removing different pairs cannot remove its lead.',
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'Remember the votes that have not paired off',
      text: 'Keep a `candidate`, the name on the votes you are holding, and a `count`, how many are left unmatched. A matching vote raises the count. A different vote pairs off with one held vote and lowers it. At zero, you hold no votes, so the next vote starts a new group. This method is called **Boyer-Moore voting**.',
    },
    {
      kind: 'callout',
      tone: 'tip',
      title: 'Count is not the total number of votes',
      text: 'On `[2, 1, 2]`, your count goes `1 → 0 → 1`. Candidate 2 received 2 votes, but the final count is only 1 because a pair was removed. Use Next below to follow the same rule on seven votes.',
    },
    {
      kind: 'steps',
      title: '6. Dry run on [2, 2, 1, 1, 1, 2, 2]',
      frames: [
        {
          cells: [2, 2, 1, 1, 1, 2, 2],
          pointers: {
            i: 0,
          },
          active: [0],
          vars: {
            candidate: 2,
            count: 1,
          },
          note: 'Count is 0, so the first vote, 2, becomes the candidate.',
        },
        {
          cells: [2, 2, 1, 1, 1, 2, 2],
          pointers: {
            i: 1,
          },
          active: [1],
          done: [0],
          vars: {
            candidate: 2,
            count: 2,
          },
          note: 'Another 2 matches the candidate: count goes up.',
        },
        {
          cells: [2, 2, 1, 1, 1, 2, 2],
          pointers: {
            i: 2,
          },
          active: [2],
          done: [0, 1],
          vars: {
            candidate: 2,
            count: 1,
          },
          note: 'A 1 cancels one of the 2s: count goes down.',
        },
        {
          cells: [2, 2, 1, 1, 1, 2, 2],
          pointers: {
            i: 3,
          },
          active: [3],
          done: [0, 1, 2],
          vars: {
            candidate: 2,
            count: 0,
          },
          note: 'Another 1 cancels the last 2. Everything so far has paired off.',
        },
        {
          cells: [2, 2, 1, 1, 1, 2, 2],
          pointers: {
            i: 4,
          },
          active: [4],
          done: [0, 1, 2, 3],
          vars: {
            candidate: 1,
            count: 1,
          },
          note: 'Count is 0, so 1 becomes the new candidate.',
        },
        {
          cells: [2, 2, 1, 1, 1, 2, 2],
          pointers: {
            i: 5,
          },
          active: [5],
          done: [0, 1, 2, 3, 4],
          vars: {
            candidate: 1,
            count: 0,
          },
          note: 'A 2 cancels the 1. Count is back to 0.',
        },
        {
          cells: [2, 2, 1, 1, 1, 2, 2],
          pointers: {
            i: 6,
          },
          found: [6],
          done: [0, 1, 2, 3, 4, 5],
          vars: {
            candidate: 2,
            count: 1,
          },
          note: 'Count is 0, so the last 2 becomes the candidate. It survives: the answer is 2.',
        },
      ],
    },
    {
      kind: 'callout',
      tone: 'tip',
      title: 'Read the two if lines separately',
      text: '`none` means there is no candidate yet; JavaScript uses `null` for that. If the count is zero, choose the current value. Then still run the next `if`: that value matches your new candidate, so its count becomes 1.',
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
      kind: 'list',
      items: [
        '**One vote** `[5]`: choose 5, count becomes 1, return 5.',
        '**All equal** `[4, 4, 4]`: the count reaches 3, return 4.',
        '**A late change** `[1, 2, 2]`: the first pair cancels, then the last 2 becomes the candidate.',
        '**Negative candidate names** `[-1, -1, 2]`: values are labels; only equality matters. Return -1.',
      ],
    },
    {
      kind: 'callout',
      tone: 'tip',
      title: 'Read the short JavaScript update',
      text: '`count += x === candidate ? 1 : -1` adds 1 if the values match, otherwise it adds -1. The `? ... : ...` expression chooses between two values. It is the same decision as the longer if/else in the pseudocode.',
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
      kind: 'callout',
      tone: 'tip',
      title: 'Read the alternatives in the comparison',
      text: 'A `Map` stores a value beside a key (a label you use to look it up), such as “candidate 2 → 4 votes”. Counting once with a map is another approach, taught in module 2. “Distinct” means different: `[2, 2, 1]` has 2 distinct values. The comparison’s middle index n / 2 means rounded down: for 7 votes, use index 3. Sorting may need extra working memory; its exact amount depends on the sorting tool.',
    },
    {
      kind: 'compare',
      title: 'Majority element',
      rows: [
        {
          approach: 'Count every value',
          time: 'O(n²)',
          space: 'O(1)',
          note: 'Recounts the same value again and again.',
        },
        {
          approach: 'Sort, take the middle',
          time: 'O(n log n)',
          space: 'O(1) to O(n)',
          note: 'The majority always covers index n / 2.',
        },
        {
          approach: 'Count in a map (module 2)',
          time: 'O(n)',
          space: 'O(n)',
          note: 'Fast, but needs memory for every distinct value.',
        },
        {
          approach: 'Boyer-Moore voting',
          time: 'O(n)',
          space: 'O(1)',
          note: 'One pass, two variables.',
        },
      ],
    },
    {
      kind: 'text',
      text: '**Pattern: use the solving loop.** Start with a plan you can explain, then look for repeated work. A trick like vote cancellation can take time to find. The loop gives you useful next actions even when a faster idea is not obvious.',
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Template: a checklist you can repeat',
      code: `state the input, output, limits, and promises
work a tiny example by hand
write an obvious correct plan
estimate its time and extra memory at the largest size
if it does too much work:
    find one repeated task and try to remove it
dry-run the new plan on a small example
check the allowed edge cases
translate into code and test`,
    },
    {
      kind: 'callout',
      tone: 'trap',
      title: 'Voting needs the promise',
      text: 'Boyer-Moore always returns *some* candidate, even when no value has more than half. On `[1, 2, 3]` it returns `3`, which is wrong. It only works because the problem **guarantees** a majority. Without that promise, do a second pass to count the candidate and check it really is more than `n / 2`.',
    },
    {
      kind: 'callout',
      tone: 'tip',
      title: 'Read the sorting code in the practice approaches',
      text: '`[...nums]` copies the items into a new array. `.sort((a, b) => a - b)` orders numbers from small to big; `b - a` orders big to small. `Math.floor(7 / 2)` is 3: round down to a whole-number index. The next lesson explains these tools and their traps.',
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
        'Votes are candidate numbers in `nums`. You are promised that one number appears more than half the time. Return it; this number is the majority. For `[3, 2, 3]`, 3 has 2 of the 3 votes, so return `3`. Try to keep only a fixed number of variables: O(1) extra space.',
      examples: [
        { input: 'nums = [3,2,3]', output: '3' },
        { input: 'nums = [2,2,1,1,1,2,2]', output: '2', explain: '2 has 4 of the 7 votes.' },
      ],
      constraints: [
        'There are 1 to 50,000 votes.',
        'Each candidate number is from -1,000,000,000 to 1,000,000,000.',
        'One candidate always has more than half the votes.',
      ],
      hints: [
        'Count every value on a tiny example. If you put equal values together by sorting, where would the majority sit?',
        'A group longer than half the array must cover the middle. Sorting works, but can you avoid keeping a sorted copy?',
        'On `[3, 2, 3]`, remove a 3 and a 2. A 3 remains. A winner with more than half the votes survives removing different pairs.',
        'Keep candidate and count. At count 0, choose the current vote. Then add 1 if it matches candidate, otherwise subtract 1.',
      ],
      approaches: [
        {
          name: 'Count every value',
          idea: 'For every candidate you encounter, count its votes across the whole array. Return it if the count is above n / 2. This is correct, but may count the same candidate repeatedly.',
          time: 'O(n²)',
          space: 'O(1)',
        },
        {
          name: 'Sort, take the middle',
          idea: 'Put equal values together by sorting a copy. In `[2, 1, 2]`, sorted order is `[1, 2, 2]`, and the middle value is 2. A majority occupies more than half the positions, so it must cover index Math.floor(n / 2); Math.floor rounds down.',
          code: `function majorityElement(nums) {
  const sorted = [...nums].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}`,
          time: 'O(n log n)',
          space: 'O(n) for the copy',
        },
        {
          name: 'Boyer-Moore voting',
          idea: 'Let’s use the majority promise to avoid sorting. Remove pairs of different votes: the majority has more votes than all others combined, so some of its votes must survive. Keep one candidate and its unmatched count; this count records what is left after pairing, not its total votes.',
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
      takeaway:
        'A promise like “more than half” can make a faster plan valid. Check which promise your plan needs.',
    },
    {
      id: 'thinking-max-product-two',
      title: 'Maximum Product of Two Elements',
      difficulty: 'easy',
      leetcode: 1464,
      pattern: 'Track the top few',
      statement:
        'Pick two power-ups at different positions in `nums`. A level x gives a boost of x - 1. Multiply the two boosts and return the biggest result. For `[3, 4, 5, 2]`, choose levels 4 and 5: `(4 - 1) × (5 - 1) = 12`. Equal levels may be used if they come from two positions.',
      examples: [
        { input: 'nums = [3,4,5,2]', output: '12', explain: '(5 - 1) × (4 - 1) = 12.' },
        {
          input: 'nums = [1,5,4,5]',
          output: '16',
          explain: 'The two 5s are at different positions: 4 × 4 = 16.',
        },
      ],
      constraints: [
        'There are 2 to 500 power-ups.',
        'Each level is from 1 to 1,000, so every boost is at least 0.',
      ],
      hints: [
        'Check every pair on `[3, 4, 5, 2]`. Which two levels give the largest product?',
        'All boosts are zero or bigger. Making either boost bigger cannot make the product smaller, so choose the two biggest levels.',
        'You can sort, but only two values matter. Keep first and second as you read the array.',
        'If x > first, move the old first to second, then put x in first. Otherwise, if x > second, replace second. Return (first - 1) × (second - 1).',
      ],
      approaches: [
        {
          name: 'Every pair',
          idea: 'Try each pair of positions and keep the biggest product after subtracting 1 from each level. With at most 500 values, this O(n²) method is already practical.',
          time: 'O(n²)',
          space: 'O(1)',
        },
        {
          name: 'Sort',
          idea: 'Every boost is at least zero, so the two largest levels give the largest product. Sort from small to big, then use the last two values. Equal values at different positions still count.',
          time: 'O(n log n)',
          space: 'O(n) for a copy',
        },
        {
          name: 'Track the two biggest',
          idea: 'Let’s avoid ordering values we will not use. On `[3, 4, 5]`, the largest and second largest become `(3, 0)`, then `(4, 3)`, then `(5, 4)`. When a new largest arrives, save the old largest as second before replacing it.',
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
        'A game needs the three highest different scores from `nums`. Return the third-highest different score. If fewer than three different scores exist, return the highest. For `[2, 2, 3, 1]`, the different scores in order are 3, 2, 1, so return `1`. The repeated 2 does not get another place.',
      examples: [
        { input: 'nums = [3,2,1]', output: '1' },
        {
          input: 'nums = [1,2]',
          output: '2',
          explain: 'Only two different scores, so return the highest.',
        },
        { input: 'nums = [2,2,3,1]', output: '1', explain: 'The distinct scores are 3, 2, 1.' },
      ],
      constraints: [
        'There are 1 to 10,000 scores.',
        'Scores are whole numbers from -2,147,483,648 to 2,147,483,647.',
      ],
      hints: [
        'On `[2, 2, 3, 1]`, why should the second 2 not take another place? Think about repeated values first.',
        'You could remove repeats, sort from big to small, then choose the third value if it exists.',
        'To avoid sorting, keep first, second, and third. Skip values already in those slots; insert a new value where it belongs and move smaller ones down.',
        'Start slots at null, meaning “nothing yet”. Skip repeats before updating. If third is still null at the end, return first.',
      ],
      approaches: [
        {
          name: 'Sort the distinct values',
          idea: 'Remove repeated values, sort big to small, and choose index 2 if there are at least three values; otherwise choose index 0. A Set is a JavaScript collection that keeps each value once, so `[...new Set(nums)]` makes the repeat-free array. In the code, `condition ? a : b` chooses a when true and b otherwise.',
          code: `function thirdMax(nums) {
  const distinct = [...new Set(nums)].sort((a, b) => b - a);
  return distinct.length >= 3 ? distinct[2] : distinct[0];
}`,
          time: 'O(n log n)',
          space: 'O(n)',
        },
        {
          name: 'Track the top three',
          idea: 'Let’s keep only the three scores that matter. Skip any value already in a slot; a new larger value pushes smaller scores down. null means an empty slot, continue skips to the next loop item, and `[first, second, third] = [x, first, second]` saves the old values on the right before replacing the slots together.',
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
        'A smooth descent is one or more neighboring days in `prices` where each next price is exactly 1 lower. A single day also counts. Return the number of such periods. For `[3, 2, 1]`, count `[3]`, `[2]`, `[1]`, `[3,2]`, `[2,1]`, and `[3,2,1]`: return `6`. A drop of 2 does not continue a run.',
      examples: [
        {
          input: 'prices = [3,2,1,4]',
          output: '7',
          explain: '[3], [2], [1], [4], [3,2], [2,1], [3,2,1].',
        },
        {
          input: 'prices = [8,6,7,7]',
          output: '4',
          explain: 'Only the single days. 8 → 6 drops by 2, not 1.',
        },
      ],
      constraints: ['There are 1 to 100,000 days.', 'Each price is from 1 to 100,000.'],
      hints: [
        'List the periods ending at the last day of `[3, 2, 1]`. How many are there?',
        'They have lengths 1, 2, and 3. Just as with zero-filled windows, a run of length L gives L periods ending here.',
        'If today is exactly 1 below yesterday, increase run by 1. Otherwise set run to 1, because the single day counts.',
        'Add run to total every day. Only compare with yesterday when i > 0.',
      ],
      approaches: [
        {
          name: 'Extend from every start',
          idea: 'Start at every day and extend the period while each next price is exactly 1 lower. Count each extension. A long descent gets revisited from many starts, so this can take O(n²) time.',
          time: 'O(n²)',
          space: 'O(1)',
        },
        {
          name: 'Streak counter',
          idea: 'Let’s count each period where it ends. On `[3, 2, 1]`, run lengths are 1, 2, 3, so add `1 + 2 + 3 = 6`. If the price does not drop by exactly 1, restart run at 1 for the single day; this visits each day only once.',
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
      takeaway:
        'A run can count valid periods as well as measure their length: add its length at each ending position.',
    },
  ],
  quiz: [
    {
      prompt:
        'You wrote a correct brute force and its Big-O is too slow for the limits. What is the next step of the loop?',
      options: [
        'Start coding it anyway',
        'Spot the waste: find work that is repeated or thrown away',
        'Check edge cases',
        'Look up the answer',
      ],
      answer: 1,
      explanation:
        'The waste in the brute force is the map to the faster idea. Edge cases and code come after the idea.',
    },
    {
      prompt: 'Run Boyer-Moore voting on `[1, 1, 2, 2, 2]`. What is the final candidate?',
      options: ['1', '2', 'none', 'It depends on the order of the loop'],
      answer: 1,
      explanation:
        '1 (count 1), 1 (2), 2 (1), 2 (0), then 2 becomes candidate with count 1. Answer: 2.',
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
      explanation:
        'The trick relies on the "more than half" promise. Without it, you add a second pass to verify the candidate.',
    },
  ],
  takeaways: [
    'State the input, output, and promises before choosing a solution.',
    'Use a correct brute force to find repeated work you could remove.',
    'Dry-run a faster idea and check allowed edge cases before coding it.',
    'Vote cancellation relies on the promise that one value appears more than half the time.',
  ],
};

export default lesson;
