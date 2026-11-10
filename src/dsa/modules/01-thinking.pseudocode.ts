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
      text: 'Days `[1, 1, 0, 1, 1, 1]`. The runs of 1s have lengths 2 and 3, so the answer is `3`. Before writing any JavaScript, you will plan it in **pseudocode**: the steps in plain words, with no fighting over `let` vs `const` or `<` vs `<=` while you are still finding the idea.',
    },
    {
      kind: 'table',
      title: 'Course pseudocode, and the JavaScript it becomes',
      head: ['Pseudocode', 'Means', 'JavaScript'],
      rows: [
        ['`best ← 0`', 'store 0 in best', '`let best = 0`'],
        ['`if x = 1:`', 'compare (not store)', '`if (x === 1) {`'],
        ['`for i from 0 to n - 1:`', 'both ends included', '`for (let i = 0; i < n; i++)`'],
        ['`for each x in nums:`', 'every item, in order', '`for (const x of nums)`'],
        ['`≠  ≤  ≥  and  or  not`', 'plain-word logic', '`!==  <=  >=  &&  ||  !`'],
        ['4-space indent after `:`', 'the block inside', '`{ ... }`'],
      ],
    },
    {
      kind: 'list',
      items: [
        '**Too vague**: "find the longest run of 1s". That is the question again, not a plan.',
        '**Too much code**: `for (let i=0;i<nums.length;i++){if(nums[i]===1)...`. You are writing JavaScript early and thinking about brackets.',
        '**Just right**: every line is one small action a friend could do by hand, and each name says what it holds.',
      ],
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
      text: '**Spot the waste.** On `[1, 1, 1, 1, 0]`, starting at day 0 walks 4 days. Starting at day 1 walks the *same* days again (3 of them), then day 2 walks 2… All ones gives about `n²/2` steps. Every walk re-counts a streak we already measured.',
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
      note: 'A **dry run** means running your plan by hand on a small example, one row per loop step. Do it before you type code: it catches most bugs for free.',
    },
    {
      kind: 'code',
      lang: 'js',
      title: 'Translated line by line',
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
        { approach: 'Walk from every start', time: 'O(n²)', space: 'O(1)', note: 'Re-walks the same streak many times.' },
        { approach: 'Carry the current streak', time: 'O(n)', space: 'O(1)', note: 'One look per day, two variables.' },
      ],
    },
    {
      kind: 'text',
      text: '**The pattern: streak counter.** Reach for it when the problem says "consecutive", "in a row", "contiguous run of the same kind" or "longest streak". The run that ends at day `i` is built from the run that ended at day `i - 1`, so you never look back.',
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
  ],
  problems: [
    {
      id: 'thinking-max-consecutive-ones',
      title: 'Max Consecutive Ones',
      difficulty: 'easy',
      leetcode: 485,
      pattern: 'Streak counter',
      statement:
        'Your fitness app logs `nums`: `1` for a day you hit your goal, `0` for a day you missed. Return the length of your longest run of `1`s in a row.',
      examples: [
        { input: 'nums = [1,1,0,1,1,1]', output: '3' },
        { input: 'nums = [1,0,1,1,0,1]', output: '2' },
      ],
      constraints: ['1 ≤ n ≤ 10⁵', 'nums[i] is 0 or 1'],
      hints: [
        'Write the plan in pseudocode first. What two numbers do you need to remember while walking?',
        '`current` = length of the run ending today. `best` = longest run so far.',
        'On a 1: `current + 1`, then update `best`. On a 0: `current = 0`. Check that a run at the very end still counts.',
      ],
      approaches: [
        {
          name: 'Walk from every start',
          idea: 'From each day, walk right while you see 1s. Correct, but it re-walks the same streak from every starting point inside it.',
          time: 'O(n²)',
          space: 'O(1)',
        },
        {
          name: 'Carry the current streak',
          idea: 'The streak ending today is the streak ending yesterday plus one, or zero if today is a 0. So one pass with two variables measures every streak exactly once.',
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
        'A score counter `X` starts at `0`. Two developers wrote the log in different styles: `"++X"` and `"X++"` both mean add 1, `"--X"` and `"X--"` both mean subtract 1. Given the log `operations`, return the final value of `X`.',
      examples: [
        { input: 'operations = ["--X","X++","X++"]', output: '1', explain: '0 - 1 + 1 + 1 = 1.' },
        { input: 'operations = ["++X","++X","X++"]', output: '3' },
      ],
      constraints: ['1 ≤ n ≤ 100', 'each operation is one of "++X", "X++", "--X", "X--"'],
      hints: [
        'Write the plan in words first: start at 0, go through each log line, change X.',
        'You do not need to check all four spellings. Which character is always a `+` or a `-`, no matter the style?',
        'The middle character, `op[1]`, is `+` for both add styles and `-` for both subtract styles.',
      ],
      approaches: [
        {
          name: 'Check all four spellings',
          idea: 'Compare each operation with `"++X"`, `"X++"`, `"--X"`, `"X--"`. Correct but wordy, and easy to typo.',
          time: 'O(n)',
          space: 'O(1)',
        },
        {
          name: 'Look at the middle character',
          idea: 'Every operation is 3 characters, and whichever side the X is on, the middle character is always the sign. So `op[1]` alone tells you add or subtract.',
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
        'A server monitor logs the number of errors each minute in `nums`. A **quiet window** is one or more minutes **in a row** that all have `0` errors. Return how many quiet windows there are. Windows that overlap still count separately.',
      examples: [
        {
          input: 'nums = [1,3,0,0,2,0,0,4]',
          output: '6',
          explain: 'Four windows of one zero, and two windows of two zeros.',
        },
        { input: 'nums = [0,0,0,2,0,0]', output: '9', explain: 'The run of 3 zeros gives 6 windows, the run of 2 gives 3.' },
      ],
      constraints: ['1 ≤ n ≤ 10⁵', '-10⁹ ≤ nums[i] ≤ 10⁹'],
      hints: [
        'n ≤ 10⁵, so checking every window (O(n²)) is too slow. Think about runs of zeros.',
        'Look at the windows that **end** at the current zero. If the current run of zeros has length `L`, how many windows end here?',
        'Exactly `L` of them (lengths 1, 2, …, L). So add the current run length to the answer on every zero.',
      ],
      approaches: [
        {
          name: 'Extend from every start',
          idea: 'From each index, extend right while you see zeros, counting one window per step. Correct, but a long run of zeros gets re-walked from every start.',
          time: 'O(n²)',
          space: 'O(1)',
        },
        {
          name: 'Add the run length at each zero',
          idea: 'Count each window at its last minute. If the run of zeros ending here has length `L`, the windows ending here have lengths 1 to `L`, which is `L` windows. Adding `L` on every zero counts every window exactly once.',
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
      takeaway: 'To count windows, count each one at its right end: a run of length L ends L windows there.',
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
      prompt: 'In course pseudocode, what is the difference between `best ← current` and `best = current`?',
      options: [
        'None, they are the same',
        '`←` stores a value; `=` asks whether two values are equal',
        '`←` compares; `=` stores',
        '`←` is only for arrays',
      ],
      answer: 1,
      explanation: 'The arrow means "put this value into that name". `=` is a question with a yes/no answer, like `===` in JavaScript.',
    },
    {
      prompt: 'A version updates `best` only when it sees a `0`. What does it return for `[0, 1, 1, 1]`?',
      options: ['0', '1', '3', '4'],
      answer: 0,
      explanation: 'The streak of three 1s is never followed by a 0, so it is never recorded. The fix: update `best` on every step.',
    },
  ],
  takeaways: [
    'Pseudocode is the plan: one small action per line, clear names, no syntax worries.',
    'Dry-run the plan on a tiny example in a table before writing JavaScript.',
    '"In a row" or "consecutive" usually means a streak counter: build today\'s run from yesterday\'s.',
  ],
};

export default lesson;
