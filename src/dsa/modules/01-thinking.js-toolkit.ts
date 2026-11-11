import type { Lesson } from '../types';

const lesson: Lesson = {
  id: 'js-toolkit',
  title: 'JavaScript toolkit and traps',
  summary: 'Sort and copy arrays safely, build separate rows, and avoid losing digits.',
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
      text: 'For a class photo, compare the current heights with the order from shortest to tallest. With `[2, 1, 3]`, the sorted line is `[1, 2, 3]`. Positions 0 and 1 differ, so return `2`. We need to keep the original line to make that comparison.',
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'First plan: keep both lines',
      code: `expected ← a sorted copy of heights
wrong ← 0
for i from 0 to n - 1:
    if heights[i] ≠ expected[i]:
        wrong ← wrong + 1
return wrong`,
    },
    {
      kind: 'code',
      lang: 'js',
      title: 'First JavaScript try: why does it return 0?',
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
      text: '`heights.sort()` changes `heights` itself. This is called changing an array **in place**. It also returns that same array. So `expected` and `heights` name the same line, and comparing them finds no differences. We must make a separate copy before sorting.',
    },
    {
      kind: 'callout',
      tone: 'tip',
      title: 'Spread makes a copy',
      text: 'In `[...heights]`, the three dots copy the values into a new array. For `[2, 1, 3]`, you get a second `[2, 1, 3]`. Sorting the copy will then leave the original numeric array alone. Copying n items takes O(n) time and O(n) space.',
    },
    {
      kind: 'text',
      text: 'There is a second bug. Without instructions, `sort()` compares values as text. In `[25, 9, 10]`, the text “10” starts with “1”, so it comes before “9”. Numeric order should be `[9, 10, 25]`. We need to tell sort how to compare numbers.',
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'Give sort a number comparison',
      text: 'A **comparator** is a function that tells sort which of two values belongs first. `(a, b) => a - b` returns a negative value if a is smaller, zero if equal, and a positive value if a is bigger. For 9 and 10, `9 - 10 = -1`, so 9 comes first. Use it after making the copy.',
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
      kind: 'callout',
      tone: 'tip',
      title: 'Read the comparison costs',
      text: 'For height values from 1 to 100, you can count each height instead of sorting by comparisons. That is **counting sort**, taught in module 8. O(n + 100) means visit n heights plus 100 counters. O(100) space is a fixed 100 counters, so it is constant with respect to n. The plain sort row below is incorrect even though it has a cost.',
    },
    {
      kind: 'compare',
      title: 'Height checker',
      rows: [
        {
          approach: '`heights.sort()`',
          time: 'O(n log n)',
          space: 'O(1)',
          note: 'Wrong twice: string order, and it overwrites the input.',
        },
        {
          approach: 'Copy + `sort((a, b) => a - b)`',
          time: 'O(n log n)',
          space: 'O(n)',
          note: 'Correct and simple. Fine for n ≤ 100.',
        },
        {
          approach: 'Count each height (module 8)',
          time: 'O(n + 100)',
          space: 'O(100)',
          note: 'Heights are at most 100, so counting sort skips the comparisons.',
        },
      ],
    },
    {
      kind: 'table',
      title: 'Array tools: what happens behind a short line',
      head: ['Tool', 'Example', 'Work'],
      rows: [
        [
          '`push` / `pop`',
          'Add / remove the last item.',
          'O(1) per call on average; occasional array growth can take longer.',
        ],
        [
          '`shift` / `unshift`',
          'Remove / add at the front.',
          'O(n): other positions may need to move.',
        ],
        [
          '`includes` / `indexOf`',
          'Look for a value; indexOf returns its first position, or -1.',
          'O(n) in the worst case: the value may be last or missing.',
        ],
        [
          '`slice` / spread / `concat`',
          'Copy items, or join arrays end to end.',
          'O(n) for n items copied. A short line still does the copying.',
        ],
        [
          '`sort` with a comparator',
          'Put numbers in order.',
          'Usually modeled as O(n log n); it changes the array you call it on.',
        ],
      ],
    },
    {
      kind: 'text',
      text: 'A **2D array**, or grid, is an array containing row arrays. For two empty rows, you want `[[], []]`, with each row separate. `new Array(2).fill([])` instead repeats the same row twice. Adding 7 through the first row gives `[[7], [7]]`.',
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
      caption:
        '`fill(value)` puts the **same** value in every slot. For arrays that means the same array. `Array.from` calls the function once per slot, so each row is new.',
    },
    {
      kind: 'code',
      lang: 'js',
      title: 'Make each row separately',
      code: `const grid = Array.from({ length: 2 }, () => new Array(3).fill(0));
// The function runs twice, making two separate rows:
// [[0, 0, 0], [0, 0, 0]]
grid[0][1] = 7;
// [[0, 7, 0], [0, 0, 0]]`,
    },
    {
      kind: 'text',
      text: 'To flip a grid, swap each cell’s row and column positions. In `[[1, 2, 3], [4, 5, 6]]`, the cell `2` is at row 0, column 1. It moves to row 1, column 0. The result is `[[1, 4], [2, 5], [3, 6]]`. This is called a **transpose**; the practice problem below builds it with separate rows.',
    },
    {
      kind: 'callout',
      tone: 'tip',
      title: 'Indexes need whole numbers',
      text: '`7 / 2` is 3.5. `Math.floor(7 / 2)` rounds down to 3, which you can use as an array index. To find a middle position between indexes `lo` and `hi`, use `Math.floor((lo + hi) / 2)`.',
    },
    {
      kind: 'callout',
      tone: 'tip',
      title: 'Remainders can be negative',
      text: '`7 % 3` is 1: divide by 3 and keep the remainder. JavaScript gives `-7 % 3` as -1. For a repeating row of 3 positions, use `((-7 % 3) + 3) % 3`, which gives index 2. The general formula is `((x % m) + m) % m` for a positive size m.',
    },
    {
      kind: 'callout',
      tone: 'tip',
      title: 'Strings need a different way to edit',
      text: 'A string is text, such as `"cat"`. You cannot replace a character by assigning to `word[0]`. Make a character array with `[...word]`, change it, then join it back with `.join(\'\')`. For example, changing the first array item to `"b"` turns `"cat"` into `"bat"` after joining.',
    },
    {
      kind: 'callout',
      tone: 'trap',
      title: 'A Number cannot keep every long integer exact',
      text: '`2⁵³` means multiply 2 by itself 53 times. JavaScript’s largest safe whole number is `2⁵³ - 1`, or 9,007,199,254,740,991. Above that, some integers are rounded: `9007199254740993` becomes `9007199254740992`. A 20-digit reading is too long to safely turn into a Number.',
    },
    {
      kind: 'callout',
      tone: 'tip',
      title: 'Keep the digits, or use BigInt',
      text: 'For `[1, 2, 9] + 1`, work from the right: 9 becomes 0 and carries 1 to the 2, making `[1, 3, 0]`. This avoids converting the full number. Another tool is **BigInt**, a JavaScript type for large whole numbers: `9007199254740993n + 1n` stays exact. Its ending `n` is JavaScript syntax, separate from our name n for input length.',
    },
    {
      kind: 'text',
      text: '**Pattern: build the result separately when you need the original.** Copy a numeric array before sorting it for comparison. For a new grid, create a fresh row for each row. Before using a convenient method, ask whether it changes the original and how many items it visits.',
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Template: keep the original for comparison',
      code: `expected ← a copy of input
put expected in the required order
answer ← 0
for each position i in input:
    if input[i] ≠ expected[i]:
        answer ← answer + 1
return answer`,
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
        'For a class photo, heights should go from shortest to tallest. Return how many positions in `heights` differ from that sorted line. For `[2, 1, 3]`, the sorted line is `[1, 2, 3]`. The first two positions differ, so return `2`.',
      examples: [
        {
          input: 'heights = [1,1,4,2,1,3]',
          output: '3',
          explain: 'Sorted is [1,1,1,2,3,4]; positions 2, 4 and 5 differ.',
        },
        { input: 'heights = [5,1,2,3,4]', output: '5' },
        { input: 'heights = [1,2,3,4,5]', output: '0' },
      ],
      constraints: ['There are 1 to 100 heights.', 'Each height is from 1 to 100.'],
      hints: [
        'Build the sorted line, then compare position by position.',
        'Does `sort()` change the original array? What does it return?',
        'Copy first and pass a comparator: `[...heights].sort((a, b) => a - b)`.',
      ],
      approaches: [
        {
          name: 'Sorted copy',
          idea: 'Sort a separate copy so you still have the original order to compare against. For `[2, 1, 3]`, positions 0 and 1 differ from `[1, 2, 3]`, so return 2. Pass a - b as the comparator to sort by numeric value.',
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
      takeaway:
        'Never call `sort()` on numbers without `(a, b) => a - b`, and copy first if you still need the original.',
    },
    {
      id: 'thinking-concatenation',
      title: 'Concatenation of Array',
      difficulty: 'easy',
      leetcode: 1929,
      pattern: 'Build an array',
      statement:
        'A music app has a “play twice” button. Return a new array with the playlist `nums` followed by the same items again. For `[4, 7]`, return `[4, 7, 4, 7]`. If the original length is n, the result length is `2n`, meaning `2 × n`.',
      examples: [
        { input: 'nums = [1,2,1]', output: '[1,2,1,1,2,1]' },
        { input: 'nums = [1,3,2,1]', output: '[1,3,2,1,1,3,2,1]' },
      ],
      constraints: ['The playlist has 1 to 1,000 items.', 'Each item is a number from 1 to 1,000.'],
      hints: [
        'Write the playlist twice on paper. The order stays the same in each half.',
        'For a loop solution, nums[i] belongs at i and at i + n. Or spread nums twice into a new array: [...nums, ...nums].',
      ],
      approaches: [
        {
          name: 'Fill both halves',
          idea: 'Make a new array twice as long. With `[4, 7]`, put 4 at positions 0 and 2, then 7 at positions 1 and 3. Each original item fills one slot in each half.',
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
          idea: 'Spread copies items into the new array in order. `[...nums, ...nums]` copies the playlist twice without changing nums. It makes 2 × n copies, so its time and output space still grow as O(n).',
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
      takeaway: 'Spread copies array items in order. Copying n items twice still has O(n) growth.',
    },
    {
      id: 'thinking-transpose',
      title: 'Transpose Matrix',
      difficulty: 'easy',
      leetcode: 867,
      pattern: 'Build a 2D grid',
      statement:
        'A spreadsheet is a grid `matrix`, stored as an array of row arrays. Make a new grid by swapping each cell’s row and column positions. For `[[1, 2, 3], [4, 5, 6]]`, return `[[1, 4], [2, 5], [3, 6]]`: the old columns become the new rows. This change is called a transpose.',
      examples: [
        { input: 'matrix = [[1,2,3],[4,5,6],[7,8,9]]', output: '[[1,4,7],[2,5,8],[3,6,9]]' },
        {
          input: 'matrix = [[1,2,3],[4,5,6]]',
          output: '[[1,4],[2,5],[3,6]]',
          explain: '2 rows × 3 columns becomes 3 rows × 2 columns.',
        },
      ],
      constraints: [
        'There are 1 to 1,000 rows and 1 to 1,000 columns.',
        'There are at most 100,000 cells in total.',
        'All rows have the same number of columns.',
      ],
      hints: [
        'Look at one column of the input. Where should its values go in the output?',
        'The result has one row for each old column. Make separate rows with Array.from, so writing in one cannot change another.',
        'For every old row r and column c, set out[c][r] = matrix[r][c]. Read matrix[r][c] as row r, then position c within that row.',
      ],
      approaches: [
        {
          name: 'New grid, copy each cell',
          idea: 'A grid with 2 rows and 3 columns becomes 3 rows with 2 columns each. Copy every cell once, placing matrix[r][c] at out[c][r]. Array.from calls its function for each new row, so the rows are separate; O(rows · cols) means the number of cells you visit and create.',
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
        {
          name: 'square',
          args: [
            [
              [1, 2, 3],
              [4, 5, 6],
              [7, 8, 9],
            ],
          ],
          expected: [
            [1, 4, 7],
            [2, 5, 8],
            [3, 6, 9],
          ],
        },
        {
          name: 'wide becomes tall',
          args: [
            [
              [1, 2, 3],
              [4, 5, 6],
            ],
          ],
          expected: [
            [1, 4],
            [2, 5],
            [3, 6],
          ],
        },
        { name: 'one cell', args: [[[5]]], expected: [[5]] },
        { name: 'one row', args: [[[1, 2, 3]]], expected: [[1], [2], [3]] },
        { name: 'one column', args: [[[1], [2]]], expected: [[1, 2]] },
        {
          name: 'negatives',
          args: [
            [
              [-1, 0],
              [0, -1],
            ],
          ],
          expected: [
            [-1, 0],
            [0, -1],
          ],
        },
      ],
      takeaway:
        'Swapping row and column positions needs a new grid with the dimensions swapped and each row separate.',
    },
    {
      id: 'thinking-plus-one',
      title: 'Plus One',
      difficulty: 'easy',
      leetcode: 66,
      pattern: 'Digit by digit',
      statement:
        'A car’s distance counter stores its digits from left to right in `digits`: `[1, 2, 9]` means 129. Add 1 and return the digits. For `[1, 2, 9]`, 9 + 1 gives 10: write 0 and carry 1 to the next place, making `[1, 3, 0]`. There can be up to 100 digits, so do not turn the whole reading into a Number. You may change the given array.',
      examples: [
        { input: 'digits = [1,2,3]', output: '[1,2,4]' },
        { input: 'digits = [1,2,9]', output: '[1,3,0]', explain: '9 + 1 = 10: write 0, carry 1.' },
        { input: 'digits = [9,9]', output: '[1,0,0]' },
      ],
      constraints: [
        'There are 1 to 100 digits.',
        'Each digit is from 0 to 9.',
        'The first digit is not 0 unless the whole number is 0.',
      ],
      hints: [
        'Start at the rightmost digit, just as you would when adding on paper.',
        'If that digit is below 9, raise it by 1 and stop. If it is 9, write 0 and carry the extra 1 to the left.',
        'Keep moving left through 9s. If you reach a digit below 9, increase it and return the array.',
        'If every digit was 9, they are now all 0. Return a new array with 1 followed by those zeros.',
      ],
      approaches: [
        {
          name: 'Convert to a number',
          idea: 'Joining digits as text and converting to Number works for a short reading, but long readings can be rounded above the safe integer limit. BigInt can hold the full integer, but direct digit work avoids converting it at all.',
          time: 'O(n)',
          space: 'O(n)',
        },
        {
          name: 'Carry from the right',
          idea: 'Let’s add directly to the digits so long readings stay exact. In `[1, 9, 9]`, the last 9 becomes 0, the next 9 becomes 0, and 1 becomes 2: `[2, 0, 0]`. Work from right to left until the carry stops; if every digit was 9, return a new leading 1 followed by zeros.',
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
      takeaway: 'For a very long integer, changing its digits directly avoids Number rounding.',
    },
  ],
  quiz: [
    {
      prompt: 'What does `[10, 9, 1].sort()` return?',
      options: ['[1, 9, 10]', '[1, 10, 9]', '[10, 9, 1]', '[9, 10, 1]'],
      answer: 1,
      explanation:
        'With no comparator, JS compares the numbers as text: "1" < "10" < "9". Use `(a, b) => a - b`.',
    },
    {
      prompt: '`const g = new Array(2).fill([]); g[0].push(7);` What is `g` now?',
      options: ['[[7], []]', '[[7], [7]]', '[7, []]', 'An error'],
      answer: 1,
      explanation:
        '`fill([])` puts the same single array in both slots, so pushing through one slot shows up in both.',
    },
    {
      prompt: 'Why can `Number("98765432109876543210") + 1` give a wrong answer?',
      options: [
        'Strings cannot be converted to numbers',
        'The value is past the safe integer limit, so Number rounds it',
        '`+ 1` always joins text instead of adding',
        'It always gives the right answer',
      ],
      answer: 1,
      explanation:
        'A Number cannot store every integer above 9,007,199,254,740,991 exactly. Keep the digits as an array, or use BigInt.',
    },
    {
      prompt: 'What is `-7 % 3` in JavaScript?',
      options: ['2', '-1', '1', '-2'],
      answer: 1,
      explanation:
        'JS keeps the sign of the left side. For a wrap-around index use `((x % m) + m) % m`, which gives 2.',
    },
  ],
  takeaways: [
    'For numeric sorting, pass a comparator. Copy first if you need the original order.',
    'For grids, create each row separately. fill([]) repeats the same array.',
    'Searching, copying, and changing the front of an array can each visit n items.',
    'Long integers may lose digits as a Number. Use digit-by-digit work or BigInt.',
  ],
};

export default lesson;
