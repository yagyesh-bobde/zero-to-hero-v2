import type { Lesson } from '../types';

const lesson: Lesson = {
  id: 'js-toolkit',
  title: 'JavaScript toolkit and traps',
  summary: 'The JS tools you will use in every problem, what they cost, and the traps that break correct ideas.',
  minutes: 18,
  blocks: [
    {
      kind: 'callout',
      tone: 'story',
      title: 'The leaderboard that lied',
      text: 'A school sports-day app sorted 100 m times so the fastest kid came first. The times were `[25, 9, 10]` seconds. After `times.sort()` the board showed `10, 25, 9`. The kid who ran 9 seconds came **last**. The idea was right; one JavaScript detail was wrong.',
    },
    {
      kind: 'text',
      text: 'Same bug, real problem: kids stand in a line for a class photo with heights `heights`. The photographer wants them in order from shortest to tallest. Return **how many kids are standing in the wrong spot**. For `[1, 1, 4, 2, 1, 3]` the sorted line is `[1, 1, 1, 2, 3, 4]`, and 3 spots differ.',
    },
    {
      kind: 'code',
      lang: 'js',
      title: 'First try (has two bugs)',
      code: `function heightChecker(heights) {
  const expected = heights.sort();
  let wrong = 0;
  for (let i = 0; i < heights.length; i++) {
    if (heights[i] !== expected[i]) wrong++;
  }
  return wrong;
}`,
    },
    {
      kind: 'text',
      text: '**Spot the bugs.** (1) `sort()` with no comparator turns numbers into **strings** and sorts them like words: `"10"` comes before `"9"` because `"1"` comes before `"9"`. (2) `sort()` changes the array **in place** and returns the same array, so `expected` and `heights` are one array. Every spot "matches" and the answer is always `0`.',
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'Copy, then sort with a comparator',
      text: '`[...heights].sort((a, b) => a - b)` copies first, then sorts as numbers. The comparator returns a negative number when `a` should come first. `a - b` means small to big; `b - a` means big to small.',
    },
    {
      kind: 'trace',
      title: 'Dry run on [1, 1, 4, 2, 1, 3]',
      columns: ['i', 'heights[i]', 'expected[i]', 'wrong so far'],
      rows: [
        [0, 1, 1, 0],
        [1, 1, 1, 0],
        [2, 4, 1, 1],
        [3, 2, 2, 1],
        [4, 1, 3, 2],
        [5, 3, 4, 3],
      ],
      note: '`expected` is the sorted **copy** `[1, 1, 1, 2, 3, 4]`; `heights` is untouched.',
    },
    {
      kind: 'code',
      lang: 'pseudo',
      code: `function heightChecker(heights):
    expected ← a sorted copy of heights   // small to big
    wrong ← 0
    for i from 0 to n - 1:
        if heights[i] ≠ expected[i]:
            wrong ← wrong + 1
    return wrong`,
    },
    {
      kind: 'code',
      lang: 'js',
      code: `function heightChecker(heights) {
  const expected = [...heights].sort((a, b) => a - b);
  let wrong = 0;
  for (let i = 0; i < heights.length; i++) {
    if (heights[i] !== expected[i]) wrong++;
  }
  return wrong;
}`,
    },
    {
      kind: 'compare',
      title: 'Height checker',
      rows: [
        { approach: '`heights.sort()`', time: 'O(n log n)', space: 'O(1)', note: 'Wrong twice: string order, and it overwrites the input.' },
        { approach: 'Copy + `sort((a, b) => a - b)`', time: 'O(n log n)', space: 'O(n)', note: 'Correct and simple. Fine for n ≤ 100.' },
        { approach: 'Count each height (module 8)', time: 'O(n + 100)', space: 'O(100)', note: 'Heights are at most 100, so counting sort skips the comparisons.' },
      ],
    },
    {
      kind: 'table',
      title: 'What common JS operations cost',
      head: ['Operation', 'Cost', 'Why it matters'],
      rows: [
        ['`arr.push(x)`, `arr.pop()`', 'O(1)', 'The end of an array is cheap. Use it as a stack.'],
        ['`arr.shift()`, `arr.unshift(x)`', 'O(n)', 'Every item moves over. For a queue use an index (module 6).'],
        ['`arr.includes(x)`, `indexOf`', 'O(n)', 'A hidden loop. For many lookups use a `Set` (module 2).'],
        ['`slice`, `[...arr]`, `concat`', 'O(n)', 'Copies everything, every time you call it.'],
        ['`arr.sort(cmp)`', 'O(n log n)', 'Sorts in place: copy first if you need the original.'],
        ['`set.has(x)`, `map.get(k)`', 'O(1) on average', 'The fast way to ask "have I seen this?"'],
        ['`str.split(\'\')`, `[...str]`', 'O(n)', 'Turns a string into an array you can change.'],
      ],
    },
    {
      kind: 'diagram',
      title: 'Why new Array(3).fill([]) bites',
      art: `new Array(3).fill([])

  grid[0] ──┐
  grid[1] ──┼──>  [ ]     one shared array
  grid[2] ──┘

  grid[0].push(5)  ->  [[5], [5], [5]]

Array.from({ length: 3 }, () => [])

  grid[0] ──>  [ ]
  grid[1] ──>  [ ]        three separate arrays
  grid[2] ──>  [ ]

  grid[0].push(5)  ->  [[5], [], []]`,
      caption: '`fill(value)` puts the **same** value in every slot. For arrays that means the same array. `Array.from` calls the function once per slot, so each row is new.',
    },
    {
      kind: 'code',
      lang: 'js',
      title: 'Toolkit: the safe versions',
      code: `// Sort numbers: always pass a comparator
nums.sort((a, b) => a - b);                       // small to big
const sorted = [...nums].sort((a, b) => b - a);   // big to small, nums untouched

// 2D grid: a new row for every slot
const grid = Array.from({ length: rows }, () => new Array(cols).fill(0));

// Middle index: whole numbers only
const mid = Math.floor((lo + hi) / 2);

// Change a string: go through an array, join once
const chars = [...word];
chars[0] = chars[0].toUpperCase();
const fixed = chars.join('');

// Start values for "best so far"
let biggest = -Infinity;
let smallest = Infinity;

// Count things: Map keeps number keys as numbers
const count = new Map();
count.set(x, (count.get(x) ?? 0) + 1);

// Huge whole numbers: BigInt (note the n)
const huge = 2n ** 64n;`,
    },
    {
      kind: 'list',
      items: [
        '**Strings cannot be changed.** `s[0] = "X"` does nothing (and throws an error in strict mode). Make an array, change it, `join(\'\')`.',
        '**`7 / 2` is `3.5`**, not 3. Use `Math.floor` for indexes. For negatives, `Math.floor(-3.5)` is `-4` while `Math.trunc(-3.5)` is `-3`.',
        '**`-7 % 3` is `-1`** in JS, not 2. To wrap around safely: `((x % m) + m) % m`.',
        '**`Math.max(...arr)`** passes every item as an argument and can crash on very large arrays. A plain loop is always safe.',
        '**`for (const i in arr)`** gives the indexes as **strings** (`"0"`, `"1"`). Use `for (const x of arr)` or a counting `for` loop.',
      ],
    },
    {
      kind: 'callout',
      tone: 'trap',
      title: 'Numbers above 2⁵³',
      text: 'JS numbers are exact only up to `2⁵³ - 1 = 9,007,199,254,740,991` (`Number.MAX_SAFE_INTEGER`). Past that, `9007199254740993` quietly becomes `...992`. So turning 20 digits into a `Number` gives the wrong answer, and even `(a * b) % 1_000_000_007` is wrong when `a` and `b` are near 10⁹, because `a * b` is computed first. Use `BigInt` (`10n ** 18n`), or work digit by digit.',
    },
    {
      kind: 'callout',
      tone: 'tip',
      title: 'Map or plain object?',
      text: 'Prefer `Map` for counting and lookups. A plain object turns every key into a string (`obj[1]` and `obj["1"]` are the same slot) and already has built-in keys, so `"constructor" in {}` is `true`. `Map` keeps key types, has `.size`, and loops in the order you added keys. Module 2 is all about using it well.',
    },
  ],
  problems: [
    {
      id: 'thinking-height-checker',
      title: 'Height Checker',
      difficulty: 'easy',
      leetcode: 1051,
      pattern: 'JS sort with comparator',
      statement:
        'Kids line up for a class photo with heights `heights`. The photographer wants them sorted from shortest to tallest. Return how many positions `i` have a different height than the sorted line would have there.',
      examples: [
        { input: 'heights = [1,1,4,2,1,3]', output: '3', explain: 'Sorted is [1,1,1,2,3,4]; positions 2, 4 and 5 differ.' },
        { input: 'heights = [5,1,2,3,4]', output: '5' },
        { input: 'heights = [1,2,3,4,5]', output: '0' },
      ],
      constraints: ['1 ≤ n ≤ 100', '1 ≤ heights[i] ≤ 100'],
      hints: [
        'Build the sorted line, then compare position by position.',
        'Does `sort()` change the original array? What does it return?',
        'Copy first and pass a comparator: `[...heights].sort((a, b) => a - b)`.',
      ],
      approaches: [
        {
          name: 'Sorted copy',
          idea: 'The sorted copy is exactly the line the photographer wants, so every position where the two differ is a kid in the wrong spot. Copying keeps the original line to compare against, and the comparator sorts by number instead of by text.',
          pseudo: `function heightChecker(heights):
    expected ← a sorted copy of heights
    wrong ← 0
    for i from 0 to n - 1:
        if heights[i] ≠ expected[i]:
            wrong ← wrong + 1
    return wrong`,
          code: `function heightChecker(heights) {
  const expected = [...heights].sort((a, b) => a - b);
  let wrong = 0;
  for (let i = 0; i < heights.length; i++) {
    if (heights[i] !== expected[i]) wrong++;
  }
  return wrong;
}`,
          time: 'O(n log n)',
          space: 'O(n)',
        },
      ],
      fn: 'heightChecker',
      starter: `function heightChecker(heights) {
  // count positions that differ from the sorted line
  return 0;
}`,
      solution: `function heightChecker(heights) {
  const expected = [...heights].sort((a, b) => a - b);
  let wrong = 0;
  for (let i = 0; i < heights.length; i++) {
    if (heights[i] !== expected[i]) wrong++;
  }
  return wrong;
}`,
      tests: [
        { name: 'example', args: [[1, 1, 4, 2, 1, 3]], expected: 3 },
        { name: 'everyone moves', args: [[5, 1, 2, 3, 4]], expected: 5 },
        { name: 'already sorted', args: [[1, 2, 3, 4, 5]], expected: 0 },
        { name: 'one kid', args: [[7]], expected: 0 },
        { name: 'all the same', args: [[2, 2, 2]], expected: 0 },
        { name: 'multi-digit, already sorted', args: [[9, 10, 100]], expected: 0 },
        { name: 'multi-digit, scrambled', args: [[100, 9, 10]], expected: 3 },
        { name: 'two pairs swapped', args: [[3, 3, 1, 1]], expected: 4 },
      ],
      takeaway: 'Never call `sort()` on numbers without `(a, b) => a - b`, and copy first if you still need the original.',
    },
    {
      id: 'thinking-concatenation',
      title: 'Concatenation of Array',
      difficulty: 'easy',
      leetcode: 1929,
      pattern: 'Build an array',
      statement:
        'A music app has a playlist `nums` and a "play twice" button. Return a new array of length `2n` that is the playlist followed by the same playlist again.',
      examples: [
        { input: 'nums = [1,2,1]', output: '[1,2,1,1,2,1]' },
        { input: 'nums = [1,3,2,1]', output: '[1,3,2,1,1,3,2,1]' },
      ],
      constraints: ['1 ≤ n ≤ 1000', '1 ≤ nums[i] ≤ 1000'],
      hints: [
        'Position `i` and position `i + n` of the answer both hold `nums[i]`.',
        'In JS you can also spread the array twice into a new one: `[...nums, ...nums]`.',
      ],
      approaches: [
        {
          name: 'Fill both halves',
          idea: 'Make an array of length 2n. Each `nums[i]` belongs at `i` (first copy) and `i + n` (second copy).',
          code: `function getConcatenation(nums) {
  const n = nums.length;
  const ans = new Array(2 * n);
  for (let i = 0; i < n; i++) {
    ans[i] = nums[i];
    ans[i + n] = nums[i];
  }
  return ans;
}`,
          time: 'O(n)',
          space: 'O(n) for the output',
        },
        {
          name: 'Spread twice',
          idea: 'Spreading copies every item into the new array in order, so spreading twice gives the playlist then the playlist again. Same O(n) cost, one readable line.',
          pseudo: `function getConcatenation(nums):
    ans ← empty list
    append every item of nums to ans
    append every item of nums to ans
    return ans`,
          code: `function getConcatenation(nums) {
  return [...nums, ...nums];
}`,
          time: 'O(n)',
          space: 'O(n) for the output',
        },
      ],
      fn: 'getConcatenation',
      starter: `function getConcatenation(nums) {
  // return nums followed by nums again
  return [];
}`,
      solution: `function getConcatenation(nums) {
  return [...nums, ...nums];
}`,
      tests: [
        { name: 'example', args: [[1, 2, 1]], expected: [1, 2, 1, 1, 2, 1] },
        { name: 'four songs', args: [[1, 3, 2, 1]], expected: [1, 3, 2, 1, 1, 3, 2, 1] },
        { name: 'one song', args: [[5]], expected: [5, 5] },
        { name: 'same song twice', args: [[7, 7]], expected: [7, 7, 7, 7] },
        { name: 'big values', args: [[1000, 1]], expected: [1000, 1, 1000, 1] },
      ],
      takeaway: 'Spread `[...a, ...b]` builds a new array; it still costs O(n), it just reads nicer.',
    },
    {
      id: 'thinking-transpose',
      title: 'Transpose Matrix',
      difficulty: 'easy',
      leetcode: 867,
      pattern: 'Build a 2D grid',
      statement:
        'A spreadsheet `matrix` has one row per student and one column per subject. Flip it so each row is a subject and each column is a student: the value at row `r`, column `c` moves to row `c`, column `r`. Return the new grid.',
      examples: [
        { input: 'matrix = [[1,2,3],[4,5,6],[7,8,9]]', output: '[[1,4,7],[2,5,8],[3,6,9]]' },
        { input: 'matrix = [[1,2,3],[4,5,6]]', output: '[[1,4],[2,5],[3,6]]', explain: '2 rows × 3 columns becomes 3 rows × 2 columns.' },
      ],
      constraints: ['1 ≤ rows, cols ≤ 1000', '1 ≤ rows × cols ≤ 10⁵'],
      hints: [
        'The answer has `cols` rows and `rows` columns. It is not square in general.',
        'Create it with `Array.from({ length: cols }, () => new Array(rows))`, not `fill([])`.',
        'Then `out[c][r] = matrix[r][c]` for every cell.',
      ],
      approaches: [
        {
          name: 'New grid, copy each cell',
          idea: 'Every cell moves to exactly one new spot (row and column swap), so one visit per cell is enough. `Array.from` makes a separate array for each new row, so writing to one row does not change the others.',
          pseudo: `function transpose(matrix):
    rows ← number of rows in matrix
    cols ← number of columns in matrix
    out ← a grid with cols rows and rows columns
    for r from 0 to rows - 1:
        for c from 0 to cols - 1:
            out[c][r] ← matrix[r][c]
    return out`,
          code: `function transpose(matrix) {
  const rows = matrix.length;
  const cols = matrix[0].length;
  const out = Array.from({ length: cols }, () => new Array(rows));
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      out[c][r] = matrix[r][c];
    }
  }
  return out;
}`,
          time: 'O(rows · cols)',
          space: 'O(rows · cols) for the output',
        },
      ],
      fn: 'transpose',
      starter: `function transpose(matrix) {
  // return the grid flipped over its main diagonal
  return [];
}`,
      solution: `function transpose(matrix) {
  const rows = matrix.length;
  const cols = matrix[0].length;
  const out = Array.from({ length: cols }, () => new Array(rows));
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      out[c][r] = matrix[r][c];
    }
  }
  return out;
}`,
      tests: [
        { name: 'square', args: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]]], expected: [[1, 4, 7], [2, 5, 8], [3, 6, 9]] },
        { name: 'wide becomes tall', args: [[[1, 2, 3], [4, 5, 6]]], expected: [[1, 4], [2, 5], [3, 6]] },
        { name: 'one cell', args: [[[5]]], expected: [[5]] },
        { name: 'one row', args: [[[1, 2, 3]]], expected: [[1], [2], [3]] },
        { name: 'one column', args: [[[1], [2]]], expected: [[1, 2]] },
        { name: 'negatives', args: [[[-1, 0], [0, -1]]], expected: [[-1, 0], [0, -1]] },
      ],
      takeaway: 'Build grids with `Array.from({ length }, () => row)`; `fill([])` shares one row.',
    },
    {
      id: 'thinking-plus-one',
      title: 'Plus One',
      difficulty: 'easy',
      leetcode: 66,
      pattern: 'Digit by digit',
      statement:
        'A car\'s odometer stores its reading as an array of digits, most significant first: `[1, 2, 9]` means 129. Add one kilometre and return the new digits. The reading can have up to 100 digits, and there are no leading zeros (except the number 0 itself).',
      examples: [
        { input: 'digits = [1,2,3]', output: '[1,2,4]' },
        { input: 'digits = [1,2,9]', output: '[1,3,0]', explain: '9 + 1 = 10: write 0, carry 1.' },
        { input: 'digits = [9,9]', output: '[1,0,0]' },
      ],
      constraints: ['1 ≤ digits.length ≤ 100', '0 ≤ digits[i] ≤ 9'],
      hints: [
        'Why not `Number(digits.join(\'\')) + 1`? Think about 100 digits and 2⁵³.',
        'Add like you do on paper: start from the last digit.',
        'A digit below 9 just goes up by one and you are done. A 9 becomes 0 and the carry moves left.',
        'If every digit was 9, put a 1 in front.',
      ],
      approaches: [
        {
          name: 'Convert to a number',
          idea: '`Number(digits.join(\'\')) + 1` works for short inputs but breaks above 2⁵³ (about 16 digits). `BigInt` fixes that, but it builds and parses a whole new number for one +1.',
          time: 'O(n)',
          space: 'O(n)',
        },
        {
          name: 'Carry from the right',
          idea: 'Adding 1 only changes the trailing 9s (they become 0) and the first non-9 digit to their left (it goes up by one). Walk from the right, and stop as soon as there is no carry.',
          pseudo: `function plusOne(digits):
    for i from n - 1 down to 0:
        if digits[i] < 9:
            digits[i] ← digits[i] + 1
            return digits
        digits[i] ← 0
    put 1 at the front of digits
    return digits`,
          code: `function plusOne(digits) {
  for (let i = digits.length - 1; i >= 0; i--) {
    if (digits[i] < 9) {
      digits[i]++;
      return digits;
    }
    digits[i] = 0;
  }
  return [1, ...digits];
}`,
          time: 'O(n)',
          space: 'O(1), or O(n) when every digit is 9',
        },
      ],
      fn: 'plusOne',
      starter: `function plusOne(digits) {
  // return the digits of the number plus one
  return digits;
}`,
      solution: `function plusOne(digits) {
  for (let i = digits.length - 1; i >= 0; i--) {
    if (digits[i] < 9) {
      digits[i]++;
      return digits;
    }
    digits[i] = 0;
  }
  return [1, ...digits];
}`,
      tests: [
        { name: 'no carry', args: [[1, 2, 3]], expected: [1, 2, 4] },
        { name: 'four digits', args: [[4, 3, 2, 1]], expected: [4, 3, 2, 2] },
        { name: 'single 9', args: [[9]], expected: [1, 0] },
        { name: 'all nines', args: [[9, 9, 9]], expected: [1, 0, 0, 0] },
        { name: 'zero', args: [[0]], expected: [1] },
        { name: 'carry stops in the middle', args: [[1, 9, 9]], expected: [2, 0, 0] },
        {
          name: '20 digits (beyond 2^53)',
          args: [[9, 8, 7, 6, 5, 4, 3, 2, 1, 0, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0]],
          expected: [9, 8, 7, 6, 5, 4, 3, 2, 1, 0, 9, 8, 7, 6, 5, 4, 3, 2, 1, 1],
        },
        {
          name: '20 digits ending in 9s',
          args: [[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9, 9, 9]],
          expected: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
        },
      ],
      takeaway: 'If the number can be longer than ~15 digits, never turn it into a JS Number.',
    },
  ],
  quiz: [
    {
      prompt: 'What does `[10, 9, 1].sort()` return?',
      options: ['[1, 9, 10]', '[1, 10, 9]', '[10, 9, 1]', '[9, 10, 1]'],
      answer: 1,
      explanation: 'With no comparator, JS compares the numbers as text: "1" < "10" < "9". Use `(a, b) => a - b`.',
    },
    {
      prompt: '`const g = new Array(2).fill([]); g[0].push(7);` What is `g` now?',
      options: ['[[7], []]', '[[7], [7]]', '[7, []]', 'An error'],
      answer: 1,
      explanation: '`fill([])` puts the same single array in both slots, so pushing through one slot shows up in both.',
    },
    {
      prompt: 'Why can `Number("98765432109876543210") + 1` give a wrong answer?',
      options: [
        'Strings cannot be converted to numbers',
        'The value is above 2⁵³, so JS cannot store every digit exactly',
        '`+ 1` joins strings instead of adding',
        'It always gives the right answer',
      ],
      answer: 1,
      explanation: 'JS numbers are exact only up to 2⁵³ - 1 (about 9·10¹⁵). Bigger values get rounded. Use BigInt or work digit by digit.',
    },
    {
      prompt: 'What is `-7 % 3` in JavaScript?',
      options: ['2', '-1', '1', '-2'],
      answer: 1,
      explanation: 'JS keeps the sign of the left side. For a wrap-around index use `((x % m) + m) % m`, which gives 2.',
    },
  ],
  takeaways: [
    'Sort numbers with `(a, b) => a - b`, and copy first if you still need the original order.',
    'Make grids with `Array.from({ length: n }, () => ...)`; `fill([])` shares one array.',
    'Know the hidden costs: `shift`, `includes`, `slice` and spread are all O(n).',
    'Above 2⁵³ JS numbers lose digits: use BigInt or work digit by digit.',
  ],
};

export default lesson;
