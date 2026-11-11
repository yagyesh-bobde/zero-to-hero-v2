import type { Lesson } from '../types';

const lesson: Lesson = {
  id: 'pseudocode',
  title: 'Writing pseudocode',
  summary: 'Plan the steps in plain words first, then turn them into JavaScript line by line.',
  minutes: 16,
  blocks: [
    {
      kind: 'callout',
      tone: 'story',
      title: 'Your longest streak',
      text: 'A fitness app logs one number per day: `1` if you hit your step goal, `0` if you missed. The profile page proudly shows "Longest streak: 3 days". Somebody had to write the few lines that compute that number.',
    },
    {
      kind: 'text',
      text: 'Days are `[1, 1, 0, 1, 1, 1]`. The two runs of 1s have lengths 2 and 3, so return `3`. **Consecutive** means next to each other, with no gaps. Let’s plan the steps in pseudocode before worrying about JavaScript punctuation.',
    },
    {
      kind: 'table',
      title: 'Read each line as an instruction',
      head: ['Pseudocode', 'Read it as', 'JavaScript'],
      rows: [
        ['`current ← 0`', 'Store 0 in current.', '`let current = 0;`'],
        ['`if x = 1:`', 'Ask whether x equals 1.', '`if (x === 1) {`'],
        [
          '`for i from 0 to 2:`',
          'Visit 0, 1, and 2; both ends count.',
          '`for (let i = 0; i <= 2; i++) {`',
        ],
        ['`for each x in nums:`', 'Read each value, in order.', '`for (const x of nums) {`'],
        [
          '`≠`, `and`, `or`, `not`',
          'Not equal; both true; either true; opposite.',
          '`!==`, `&&`, `||`, `!`',
        ],
        [
          'Indented lines after `:`',
          'Do these lines inside that loop or condition.',
          'Lines inside `{ ... }`',
        ],
      ],
    },
    {
      kind: 'text',
      text: 'Try the obvious plan: start at each day and count the 1s until you reach a 0 or the end. On `[1, 1, 0]`, starting at index 0 gives length 2. Starting at index 1 gives length 1. Starting at index 2 gives length 0. Keep the biggest length: `2`.',
    },
    {
      kind: 'callout',
      tone: 'tip',
      title: 'Read the while condition',
      text: '`length` starts at 0. `start + length` is the next position to check. `while` repeats as long as its condition is true. Check that the position is below `n` before reading it; then check that the value there is 1. `and` requires both checks to pass.',
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Brute force: start a walk at every day',
      code: `function longestStreak(nums):
    best ← 0
    for start from 0 to n - 1:
        length ← 0
        while start + length < n and nums[start + length] = 1:
            length ← length + 1
        best ← max(best, length)
    return best`,
    },
    {
      kind: 'text',
      text: 'This works, but on `[1, 1, 1, 0]` you count 3 ones, then count 2 of those same ones, then count 1 again. A long run causes O(n²) work. Let’s remember the run we have already counted, so each day needs just one visit.',
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'Carry the current streak',
      text: 'Walk once and keep two numbers: `current`, the length of the streak that ends today, and `best`, the longest streak so far. A `1` makes `current` grow by one. A `0` resets it to zero. Nothing is ever counted twice.',
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'One pass',
      code: `function findMaxConsecutiveOnes(nums):
    current ← 0
    best ← 0
    for each x in nums:
        if x = 1:
            current ← current + 1
            best ← max(best, current)
        else:
            current ← 0
    return best`,
    },
    {
      kind: 'callout',
      tone: 'tip',
      title: 'Run the plan by hand',
      text: 'A **dry run** means following your plan on a small example without executing code. In the table, each row is one day. `current` and `best` show their values after reading that day. At a 0, only `current` resets; the record stays.',
    },
    {
      kind: 'trace',
      title: 'Dry run on [1, 1, 0, 1, 1, 1]',
      columns: ['i', 'nums[i]', 'current', 'best', 'what happened'],
      rows: [
        [0, 1, 1, 1, 'a streak starts'],
        [1, 1, 2, 2, 'it grows'],
        [2, 0, 0, 2, 'a 0 breaks it; best keeps 2'],
        [3, 1, 1, 2, 'a new streak'],
        [4, 1, 2, 2, 'ties the record'],
        [5, 1, 3, 3, 'new record'],
      ],
      note: 'At the last day, current reaches 3. The final best is 3, so that is the output.',
    },
    {
      kind: 'code',
      lang: 'js',
      title: 'Translate the plan into JavaScript',
      code: `function findMaxConsecutiveOnes(nums) {
  let current = 0;
  let best = 0;
  for (const x of nums) {
    if (x === 1) {
      current++;
      best = Math.max(best, current);
    } else {
      current = 0;
    }
  }
  return best;
}`,
    },
    {
      kind: 'compare',
      title: 'Longest streak of 1s',
      rows: [
        {
          approach: 'Walk from every start',
          time: 'O(n²)',
          space: 'O(1)',
          note: 'Re-walks the same streak many times.',
        },
        {
          approach: 'Carry the current streak',
          time: 'O(n)',
          space: 'O(1)',
          note: 'One look per day, two variables.',
        },
      ],
    },
    {
      kind: 'text',
      text: '**Pattern: streak counter.** “Consecutive”, “in a row”, and “contiguous” all mean no gaps. Keep the length of the run ending at the item you just read. Update your answer as the run grows. For a longest run, keep the biggest length. For counting all runs, you may need to add lengths instead.',
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Template: streak counter',
      code: `current ← 0
answer ← 0
for i from 0 to n - 1:
    if item i continues the run:
        current ← current + 1
    else:
        current ← 1 if item i starts a new run, else 0
    answer ← update answer using current
return answer`,
    },
    {
      kind: 'callout',
      tone: 'trap',
      title: 'The streak at the very end',
      text: 'A common version only updates `best` when it sees a `0` ("the streak just ended, record it"). On `[0, 1, 1, 1]` the last streak never meets a `0`, so it returns 0 instead of 3. Update `best` on every step, or once more after the loop.',
    },
    {
      kind: 'callout',
      tone: 'tip',
      title: 'From longest run to number of windows',
      text: 'A **subarray**, also called a window here, is one or more neighboring array items. In `[0, 0]`, there are 3 zero-only windows: the first zero, the second zero, and both together. At the first zero, 1 window ends. At the second zero, 2 end. Add `1 + 2 = 3`; this is the idea behind the last practice problem.',
    },
    {
      kind: 'text',
      text: 'For the score-log problem below, **simulation** means following the given actions in order. You already know how: start with a value, read an action, update it, and repeat. Pseudocode makes this plan explicit before you choose JavaScript syntax.',
    },
  ],
  problems: [
    {
      id: 'thinking-max-consecutive-ones',
      title: 'Max Consecutive Ones',
      difficulty: 'easy',
      leetcode: 485,
      pattern: 'Streak counter',
      statement:
        'Your fitness app records 1 for a day you hit your goal and 0 for a day you missed. Return the longest run of 1s in a row in `nums`. For `[1, 1, 0, 1]`, the run lengths are 2 and 1, so return `2`.',
      examples: [
        { input: 'nums = [1,1,0,1,1,1]', output: '3' },
        { input: 'nums = [1,0,1,1,0,1]', output: '2' },
      ],
      constraints: ['There are 1 to 100,000 days.', 'Every value is 0 or 1.'],
      hints: [
        'Read `[1, 1, 0, 1]` from left to right. How does the current run length change at each value?',
        'Keep current for the run ending here and best for the longest run seen.',
        'On 1, add 1 to current and update best. On 0, set current to 0. Update best as a run grows so a run at the end is counted.',
      ],
      approaches: [
        {
          name: 'Walk from every start',
          idea: 'Start at every position and count 1s until you reach 0 or the end. In `[1, 1, 0]`, the first two starts count some of the same days. It is correct, but a long run repeats work.',
          time: 'O(n²)',
          space: 'O(1)',
        },
        {
          name: 'Carry the current streak',
          idea: 'Let’s reuse the run already counted. In `[1, 1, 0, 1]`, current goes 1 → 2 → 0 → 1, while best stays at 2 after reaching it. One visit per value and two counters give O(n) time and O(1) extra space.',
          pseudo: `function findMaxConsecutiveOnes(nums):
    current ← 0
    best ← 0
    for each x in nums:
        if x = 1:
            current ← current + 1
            best ← max(best, current)
        else:
            current ← 0
    return best`,
          code: `function findMaxConsecutiveOnes(nums) {
  let current = 0;
  let best = 0;
  for (const x of nums) {
    if (x === 1) {
      current++;
      best = Math.max(best, current);
    } else {
      current = 0;
    }
  }
  return best;
}`,
          time: 'O(n)',
          space: 'O(1)',
        },
      ],
      fn: 'findMaxConsecutiveOnes',
      starter: `function findMaxConsecutiveOnes(nums) {
  // return the longest run of 1s in a row
  return 0;
}`,
      solution: `function findMaxConsecutiveOnes(nums) {
  let current = 0;
  let best = 0;
  for (const x of nums) {
    if (x === 1) {
      current++;
      best = Math.max(best, current);
    } else {
      current = 0;
    }
  }
  return best;
}`,
      tests: [
        { name: 'example', args: [[1, 1, 0, 1, 1, 1]], expected: 3 },
        { name: 'two short runs', args: [[1, 0, 1, 1, 0, 1]], expected: 2 },
        { name: 'single 0', args: [[0]], expected: 0 },
        { name: 'single 1', args: [[1]], expected: 1 },
        { name: 'all zeros', args: [[0, 0, 0]], expected: 0 },
        { name: 'all ones', args: [[1, 1, 1, 1]], expected: 4 },
        { name: 'longest run at the end', args: [[0, 1, 1, 1]], expected: 3 },
        { name: 'longest run in the middle', args: [[0, 1, 1, 1, 0, 1, 1]], expected: 3 },
      ],
      takeaway: 'Plan in pseudocode, dry-run it on a tiny example, then translate line by line.',
    },
    {
      id: 'thinking-final-value',
      title: 'Final Value After Operations',
      difficulty: 'easy',
      leetcode: 2011,
      pattern: 'Simulation',
      statement:
        'A score X starts at 0. In the log `operations`, both `"++X"` and `"X++"` mean add 1; both `"--X"` and `"X--"` mean subtract 1. Return the final score. For `["--X", "X++", "X++"]`, it goes `0 → -1 → 0 → 1`, so return `1`. Treat each log entry as text to read.',
      examples: [
        { input: 'operations = ["--X","X++","X++"]', output: '1', explain: '0 - 1 + 1 + 1 = 1.' },
        { input: 'operations = ["++X","++X","X++"]', output: '3' },
      ],
      constraints: [
        'There are 1 to 100 operations.',
        'Each entry is "++X", "X++", "--X", or "X--".',
      ],
      hints: [
        'Write the plan in words first: start at 0, go through each log line, change X.',
        'You do not need to check all four spellings. Which character is always a `+` or a `-`, no matter the style?',
        'The middle character, `op[1]`, is `+` for both add styles and `-` for both subtract styles.',
      ],
      approaches: [
        {
          name: 'Check all four spellings',
          idea: 'Read the log in order. Compare each entry with the four allowed spellings, then add or subtract 1. This directly follows the rules and takes O(n) time.',
          time: 'O(n)',
          space: 'O(1)',
        },
        {
          name: 'Look at the middle character',
          idea: 'Let’s use the shared detail in both spellings. Index 1 is the middle character, and it is always + for addition or - for subtraction. Read op[1] and update x; the time is still O(n), but there are fewer cases to write.',
          pseudo: `function finalValueAfterOperations(operations):
    x ← 0
    for each op in operations:
        if op[1] = '+':
            x ← x + 1
        else:
            x ← x - 1
    return x`,
          code: `function finalValueAfterOperations(operations) {
  let x = 0;
  for (const op of operations) {
    if (op[1] === '+') x++;
    else x--;
  }
  return x;
}`,
          time: 'O(n)',
          space: 'O(1)',
        },
      ],
      fn: 'finalValueAfterOperations',
      starter: `function finalValueAfterOperations(operations) {
  // start at 0 and apply each operation
  return 0;
}`,
      solution: `function finalValueAfterOperations(operations) {
  let x = 0;
  for (const op of operations) {
    if (op[1] === '+') x++;
    else x--;
  }
  return x;
}`,
      tests: [
        { name: 'example', args: [['--X', 'X++', 'X++']], expected: 1 },
        { name: 'all adds', args: [['++X', '++X', 'X++']], expected: 3 },
        { name: 'cancels out', args: [['X++', '++X', '--X', 'X--']], expected: 0 },
        { name: 'one subtract', args: [['X--']], expected: -1 },
        { name: 'goes negative', args: [['--X', '--X']], expected: -2 },
        { name: 'one add', args: [['++X']], expected: 1 },
      ],
      takeaway: 'Before coding every case, look for the one detail that tells the cases apart.',
    },
    {
      id: 'thinking-zero-filled-subarrays',
      title: 'Number of Zero-Filled Subarrays',
      difficulty: 'medium',
      leetcode: 2348,
      pattern: 'Streak counter',
      statement:
        'A server logs error counts each minute in `nums`. Count **subarrays** made only of zeros: one or more neighboring minutes with no errors. Overlapping windows count separately. For `[0, 0, 2, 0]`, count the first zero, the second zero, the first two together, and the last zero: return `4`.',
      examples: [
        {
          input: 'nums = [1,3,0,0,2,0,0,4]',
          output: '6',
          explain: 'Four windows of one zero, and two windows of two zeros.',
        },
        {
          input: 'nums = [0,0,0,2,0,0]',
          output: '9',
          explain: 'The run of 3 zeros gives 6 windows, the run of 2 gives 3.',
        },
      ],
      constraints: [
        'There are 1 to 100,000 numbers.',
        'Each number is from -1,000,000,000 to 1,000,000,000.',
      ],
      hints: [
        'In `[0, 0, 0]`, list just the windows that end at the last position. How many are there?',
        'There are 3: the last zero, the last two zeros, and all three. A run of length L has L windows ending here.',
        'On each zero, increase run by 1 and add run to total. On any other value, reset run to 0.',
      ],
      approaches: [
        {
          name: 'Extend from every start',
          idea: 'Start at each position and extend right while the values stay zero. Count each extension as one window. A long zero run gets visited again from many starts, so this can take O(n²) time.',
          time: 'O(n²)',
          space: 'O(1)',
        },
        {
          name: 'Add the run length at each zero',
          idea: 'Let’s count windows at their last position to avoid revisiting them. In `[0, 0, 0]`, the successive positions end 1, 2, and 3 windows, for 6 in total. Keep the zero-run length, add it to total at each zero, and reset it at other values.',
          pseudo: `function zeroFilledSubarray(nums):
    run ← 0
    total ← 0
    for each x in nums:
        if x = 0:
            run ← run + 1
            total ← total + run
        else:
            run ← 0
    return total`,
          code: `function zeroFilledSubarray(nums) {
  let run = 0;
  let total = 0;
  for (const x of nums) {
    if (x === 0) {
      run++;
      total += run;
    } else {
      run = 0;
    }
  }
  return total;
}`,
          time: 'O(n)',
          space: 'O(1)',
        },
      ],
      fn: 'zeroFilledSubarray',
      starter: `function zeroFilledSubarray(nums) {
  // count the contiguous windows made only of zeros
  return 0;
}`,
      solution: `function zeroFilledSubarray(nums) {
  let run = 0;
  let total = 0;
  for (const x of nums) {
    if (x === 0) {
      run++;
      total += run;
    } else {
      run = 0;
    }
  }
  return total;
}`,
      tests: [
        { name: 'example', args: [[1, 3, 0, 0, 2, 0, 0, 4]], expected: 6 },
        { name: 'two runs', args: [[0, 0, 0, 2, 0, 0]], expected: 9 },
        { name: 'no zeros', args: [[2, 10, 2019]], expected: 0 },
        { name: 'single zero', args: [[0]], expected: 1 },
        { name: 'all zeros', args: [[0, 0, 0, 0]], expected: 10 },
        { name: 'lonely zeros', args: [[1, 0, 1, 0, 1]], expected: 2 },
        { name: 'negatives around', args: [[-1, 0, 0, -1]], expected: 3 },
      ],
      takeaway:
        'Count each window at its last position. A zero run of length L gives L windows ending there.',
    },
  ],
  quiz: [
    {
      prompt: 'How many times does `for i from 1 to 4:` run?',
      options: ['3', '4', '5', 'It depends on n'],
      answer: 1,
      explanation: 'Course ranges include both ends: i = 1, 2, 3, 4.',
    },
    {
      prompt:
        'In course pseudocode, what is the difference between `best ← current` and `best = current`?',
      options: [
        'None, they are the same',
        '`←` stores a value; `=` asks whether two values are equal',
        '`←` compares; `=` stores',
        '`←` is only for arrays',
      ],
      answer: 1,
      explanation:
        'The arrow means "put this value into that name". `=` is a question with a yes/no answer, like `===` in JavaScript.',
    },
    {
      prompt:
        'A version updates `best` only when it sees a `0`. What does it return for `[0, 1, 1, 1]`?',
      options: ['0', '1', '3', '4'],
      answer: 0,
      explanation:
        'The streak of three 1s is never followed by a 0, so it is never recorded. The fix: update `best` on every step.',
    },
  ],
  takeaways: [
    'Write one small action per line of pseudocode, with names that say what you remember.',
    'Dry-run the plan by hand. Track each variable after each item.',
    'For items in a row, carry the current run length instead of counting it again.',
  ],
};

export default lesson;
