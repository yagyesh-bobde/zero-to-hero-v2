import type { Lesson } from '../types';

/** 8 cells, most significant bit first: bits8(45) -> [0,0,1,0,1,1,0,1]. */
export const bits8 = (n: number): number[] => n.toString(2).padStart(8, '0').split('').map(Number);

const lesson: Lesson = {
  id: 'binary-and-operators',
  title: 'Binary and the bit operators',
  summary: 'Read a number as a row of switches, and flip them with & | ^ ~ << >> >>>.',
  minutes: 22,
  blocks: [
    {
      kind: 'callout',
      tone: 'story',
      title: 'chmod 754',
      text: "On Linux and macOS, `chmod 754 notes.txt` sets who can read, write and run a file. Each digit is really three switches: read is worth 4, write 2, run 1. So `7` = `111` = read + write + run, `5` = `101` = read + run, `4` = `100` = read only. When you open the file, the system asks \"is the write switch on?\" with one operation: `perm & 2`. Feature flags in apps, Discord permissions and colors like `0xFF8800` are stored the same way: many on/off facts packed into one number.",
    },
    {
      kind: 'text',
      text: "**The problem.** A phone app keeps a user's 32 notification switches in one number. Bit `i` is 1 when switch `i` is on. Given `n = 45`, how many switches are on? To answer, you first need to see 45 the way the computer does.",
    },
    {
      kind: 'text',
      text: 'In binary, each position is worth double the one to its right: 1, 2, 4, 8, 16, 32, and so on. A number is the sum of the positions that hold a 1. We count positions from the right, starting at 0. So 45 = 32 + 8 + 4 + 1:',
    },
    {
      kind: 'table',
      title: '45 written as 8 bits',
      head: ['bit', '7', '6', '5', '4', '3', '2', '1', '0'],
      rows: [
        ['worth', '128', '64', '32', '16', '8', '4', '2', '1'],
        ['45', '0', '0', '**1**', '0', '**1**', '**1**', '0', '**1**'],
      ],
    },
    {
      kind: 'table',
      title: 'The seven bit operators (examples use small numbers)',
      head: ['operator', 'what it does to each bit', 'example'],
      rows: [
        ['`a & b` (AND)', '1 only if **both** bits are 1', '`1100 & 1010 = 1000` (12 & 10 = 8)'],
        ['`a | b` (OR)', '1 if **either** bit is 1', '`1100 | 1010 = 1110` (12 | 10 = 14)'],
        ['`a ^ b` (XOR)', '1 if the bits are **different**', '`1100 ^ 1010 = 0110` (12 ^ 10 = 6)'],
        ['`~a` (NOT)', 'flips every bit', '`~5 = -6` (all 32 bits flip, see below)'],
        ['`a << k`', 'slides bits k places left, fills with 0. Same as × 2ᵏ', '`0011 << 2 = 1100` (3 << 2 = 12)'],
        ['`a >> k`', 'slides bits k places right, copies the sign bit. Like ÷ 2ᵏ rounded down', '`13 >> 1 = 6`, `-8 >> 1 = -4`'],
        ['`a >>> k`', 'slides bits right, fills with 0 (unsigned shift)', '`-1 >>> 0 = 4294967295`'],
      ],
    },
    {
      kind: 'table',
      title: 'The four moves you will use in every problem',
      head: ['you want to', 'write', 'why it works'],
      rows: [
        ['read bit i', '`(n >> i) & 1`', 'slide bit i to the end, then keep only the last bit'],
        ['turn bit i on', '`n | (1 << i)`', '`1 << i` is a number with only bit i on; OR switches it on'],
        ['turn bit i off', '`n & ~(1 << i)`', '`~(1 << i)` has every bit on except i; AND keeps the rest'],
        ['flip bit i', '`n ^ (1 << i)`', 'XOR with 1 flips a bit, XOR with 0 leaves it alone'],
      ],
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Brute force: turn it into text and count',
      code: `function countOnes(n):
    s ← n written in binary as text      // 45 → "101101"
    count ← 0
    for each ch in s:
        if ch = '1':
            count ← count + 1
    return count`,
    },
    {
      kind: 'text',
      text: "**Spot the waste.** This works, but it builds a whole string just to look at bits the number already has. It also checks every 0, even when there are only a few 1s. You can ask the number directly: `n & 1` is the last bit, and `n >>> 1` drops the last bit. Do that 32 times and you have read every bit, with no string.",
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'n & (n - 1) erases the rightmost 1',
      text: "Subtracting 1 turns the rightmost 1 into 0 and every 0 to its right into 1. The bits to the left stay the same. So when you AND `n` with `n - 1`, the rightmost 1 and everything after it become 0, and the rest survives. Repeat until `n` is 0 and count the rounds: the loop runs once per 1 bit, not 32 times.",
    },
    {
      kind: 'steps',
      title: 'Counting the 1s in 45 with n & (n - 1)',
      frames: [
        {
          cells: bits8(45),
          active: [7],
          vars: { n: 45, count: 0 },
          note: 'Start with `n = 45` = `00101101`. It has four 1s. The rightmost 1 is bit 0 (the last cell).',
        },
        {
          cells: bits8(44),
          active: [5],
          vars: { 'n − 1 was': '00101100', n: 44, count: 1 },
          note: '`45 − 1 = 44` only changes bit 0. `45 & 44 = 44`: the rightmost 1 is gone. count = 1.',
        },
        {
          cells: bits8(40),
          active: [4],
          vars: { 'n − 1 was': '00101011', n: 40, count: 2 },
          note: '`44 − 1 = 43` turns bit 2 off and the two 0s below it on. AND wipes all three: `44 & 43 = 40`. count = 2.',
        },
        {
          cells: bits8(32),
          active: [2],
          vars: { 'n − 1 was': '00100111', n: 32, count: 3 },
          note: '`40 & 39 = 32`. Bit 3 is gone. count = 3.',
        },
        {
          cells: bits8(0),
          vars: { 'n − 1 was': '00011111', n: 0, count: 4 },
          note: '`32 & 31 = 0`. n is 0, so stop. The answer is 4, and the loop ran 4 times, not 32.',
        },
      ],
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Two clean ways to count 1 bits',
      code: `// AND: a bit is 1 only when it is 1 in both numbers
// n >> i: slide the bits of n i places to the right

function countOnesShift(n):            // looks at all 32 bits
    count ← 0
    for i from 0 to 31:
        if (n >> i) AND 1 = 1:
            count ← count + 1
    return count

function countOnes(n):                 // one round per 1 bit
    count ← 0
    while n ≠ 0:
        n ← n AND (n - 1)              // erase the rightmost 1
        count ← count + 1
    return count`,
    },
    {
      kind: 'code',
      lang: 'js',
      code: `function hammingWeight(n) {
  let count = 0;
  while (n !== 0) {
    n &= n - 1; // erase the rightmost 1
    count++;
  }
  return count;
}

hammingWeight(45); // 4`,
    },
    {
      kind: 'compare',
      title: 'Counting the 1 bits of a 32-bit number',
      rows: [
        { approach: 'Binary string, count "1"', time: 'O(b)', space: 'O(b)', note: 'b = 32 bits. Easy, but builds a string and breaks on negatives (`(-1).toString(2)` is `"-1"`).' },
        { approach: 'Check each bit with >> and & 1', time: 'O(b)', space: 'O(1)', note: 'Always 32 rounds. Works for any bit question, not just counting.' },
        { approach: 'n & (n − 1) loop', time: 'O(k)', space: 'O(1)', note: 'k = number of 1 bits. Fastest when few bits are on.' },
      ],
    },
    {
      kind: 'table',
      title: 'JavaScript and bits: the 32-bit catch',
      head: ['expression', 'result', 'why'],
      rows: [
        ['`1 << 31`', '`-2147483648`', 'bit 31 is the sign bit: when it is on, JS reads the number as negative'],
        ['`(1 << 31) >>> 0`', '`2147483648`', '`>>> 0` reads the same 32 bits as an unsigned number'],
        ['`2 ** 32 | 0`', '`0`', 'only the low 32 bits survive a bit operator'],
        ['`(2 ** 40) >> 1`', '`0`', 'big numbers get chopped first. Use `Math.floor(x / 2)` or BigInt'],
        ['`(1n << 40n) >> 1n`', '`549755813888n`', 'BigInt bit operators have no 32-bit limit'],
      ],
    },
    {
      kind: 'text',
      text: "JS numbers are normally 64-bit decimals. Every bit operator first chops the number down to a **signed 32-bit integer** (bit 31 means \"negative\"), does the work, and gives back a signed 32-bit result. That is why `~5` is `-6`: flipping all 32 bits of 5 also flips the sign bit. Rule of thumb: bit tricks are safe for values in −2³¹ … 2³¹ − 1. Add `>>> 0` at the end when you want the unsigned view (0 … 2³² − 1).",
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Pattern: walk the bits',
      code: `// Signals: "binary", "1 bits", "flip", "set bits", each bit matters on its own
for i from 0 to 31:
    bit ← (n >> i) AND 1           // 0 or 1
    // decide something using bit i
// or, to visit only the 1 bits:
while n ≠ 0:
    n ← n AND (n - 1)`,
    },
    {
      kind: 'callout',
      tone: 'trap',
      title: '>> on a negative number never reaches 0',
      text: "`>>` copies the sign bit into the left side. So `-1 >> 1` is still `-1`, and `while (n !== 0) { ...; n >>= 1; }` loops forever on negative input. Use `>>>` (fills with 0) or loop exactly 32 times. Second trap: `===` runs before `&`, so `n & 4 === 0` means `n & (4 === 0)`. Always wrap it: `(n & 4) === 0`.",
    },
  ],
  problems: [
    {
      id: 'bits-math-number-of-1-bits',
      title: 'Number of 1 bits',
      difficulty: 'easy',
      leetcode: 191,
      pattern: 'Walk the bits',
      statement:
        "A phone app stores a user's 32 notification switches in one number `n`: bit `i` is 1 when switch `i` is on. Return how many switches are on. `n` is given as a plain non-negative number between 0 and 2³² − 1 (so it can be bigger than 2³¹ − 1).",
      examples: [
        { input: 'n = 11', output: '3', explain: '11 is `1011` in binary: three 1s.' },
        { input: 'n = 128', output: '1', explain: '`10000000`.' },
        { input: 'n = 4294967293', output: '31', explain: 'All 32 bits are on except bit 1.' },
      ],
      constraints: ['0 ≤ n ≤ 2³² − 1'],
      hints: [
        '`n & 1` tells you whether the last bit is 1.',
        'Shift with `>>>` (not `>>`) so large inputs do not turn negative and loop forever.',
        '`n & (n - 1)` erases the rightmost 1. Count how many times you can do that before `n` is 0.',
      ],
      approaches: [
        {
          name: 'Binary string',
          idea: '`n.toString(2)` writes `n` in binary. Count the `"1"` characters. Works because `n` is never negative here.',
          code: `function hammingWeight(n) {
  return n.toString(2).split('').filter((c) => c === '1').length;
}`,
          time: 'O(32)',
          space: 'O(32)',
        },
        {
          name: 'Check all 32 bits',
          idea: 'Look at the last bit with `& 1`, then drop it with `>>> 1`. After 32 rounds every bit has been seen.',
          code: `function hammingWeight(n) {
  let count = 0;
  for (let i = 0; i < 32; i++) {
    count += n & 1;
    n >>>= 1;
  }
  return count;
}`,
          time: 'O(32)',
          space: 'O(1)',
        },
        {
          name: 'Erase the rightmost 1',
          idea: '`n & (n - 1)` turns the rightmost 1 into 0 and keeps every other 1. Each round removes exactly one 1, so the number of rounds is the answer.',
          pseudo: `function hammingWeight(n):
    count ← 0
    while n ≠ 0:
        n ← n AND (n - 1)        // erase the rightmost 1
        count ← count + 1
    return count`,
          code: `function hammingWeight(n) {
  let count = 0;
  while (n !== 0) {
    n &= n - 1;
    count++;
  }
  return count;
}`,
          time: 'O(k), k = number of 1s',
          space: 'O(1)',
        },
      ],
      fn: 'hammingWeight',
      starter: `function hammingWeight(n) {
  // count the 1 bits in n
  return 0;
}`,
      solution: `function hammingWeight(n) {
  let count = 0;
  while (n !== 0) {
    n &= n - 1;
    count++;
  }
  return count;
}`,
      tests: [
        { name: 'example 11', args: [11], expected: 3 },
        { name: 'one bit', args: [128], expected: 1 },
        { name: 'zero', args: [0], expected: 0 },
        { name: 'one', args: [1], expected: 1 },
        { name: '2³¹ − 1 (31 ones)', args: [2147483647], expected: 31 },
        { name: 'only bit 31 (2³¹)', args: [2147483648], expected: 1 },
        { name: 'all 32 bits', args: [4294967295], expected: 32 },
        { name: 'all but bit 1', args: [4294967293], expected: 31 },
      ],
      takeaway: '`n & (n - 1)` erases the rightmost 1: loop it to visit only the 1 bits.',
    },
    {
      id: 'bits-math-power-of-two',
      title: 'Power of two',
      difficulty: 'easy',
      leetcode: 231,
      pattern: 'Walk the bits',
      statement:
        'A game engine only accepts texture sizes that are powers of two: 1, 2, 4, 8, 16, … Given a whole number `n` (it can be zero or negative), return `true` if `n` is a power of two.',
      examples: [
        { input: 'n = 16', output: 'true', explain: '16 = 2⁴ = `10000`.' },
        { input: 'n = 6', output: 'false', explain: '`110` has two 1 bits.' },
        { input: 'n = 1', output: 'true', explain: '1 = 2⁰.' },
      ],
      constraints: ['−2³¹ ≤ n ≤ 2³¹ − 1'],
      hints: [
        'Write a few powers of two in binary. What do they all look like?',
        'A power of two has exactly one 1 bit.',
        'What does `n & (n - 1)` give when there is only one 1? Do not forget zero and negatives.',
      ],
      approaches: [
        {
          name: 'Keep dividing by 2',
          idea: 'While `n` is even, halve it. A power of two ends at exactly 1.',
          code: `function isPowerOfTwo(n) {
  if (n <= 0) return false;
  while (n % 2 === 0) n /= 2;
  return n === 1;
}`,
          time: 'O(log n)',
          space: 'O(1)',
        },
        {
          name: 'Exactly one 1 bit',
          idea: 'A power of two is a single 1 followed by 0s. Erasing its rightmost 1 with `n & (n - 1)` leaves 0. Any other positive number still has a 1 left.',
          pseudo: `function isPowerOfTwo(n):
    return n > 0 and (n AND (n - 1)) = 0`,
          code: `function isPowerOfTwo(n) {
  return n > 0 && (n & (n - 1)) === 0;
}`,
          time: 'O(1)',
          space: 'O(1)',
        },
      ],
      fn: 'isPowerOfTwo',
      starter: `function isPowerOfTwo(n) {
  // true if n is 1, 2, 4, 8, ...
  return false;
}`,
      solution: `function isPowerOfTwo(n) {
  return n > 0 && (n & (n - 1)) === 0;
}`,
      tests: [
        { name: 'one', args: [1], expected: true },
        { name: 'sixteen', args: [16], expected: true },
        { name: 'three', args: [3], expected: false },
        { name: 'six', args: [6], expected: false },
        { name: 'zero', args: [0], expected: false },
        { name: 'negative', args: [-16], expected: false },
        { name: '2³⁰', args: [1073741824], expected: true },
        { name: '2³¹ − 1', args: [2147483647], expected: false },
        { name: '−2³¹ (one bit, but negative)', args: [-2147483648], expected: false },
      ],
      takeaway: 'Power of two = exactly one 1 bit = `n > 0 && (n & (n - 1)) === 0`.',
    },
    {
      id: 'bits-math-reverse-bits',
      title: 'Reverse bits',
      difficulty: 'easy',
      leetcode: 190,
      pattern: 'Walk the bits',
      statement:
        'A sensor sends 32-bit readings with the bits in the wrong order. Flip the order: bit 0 becomes bit 31, bit 1 becomes bit 30, and so on. The input is a plain non-negative number between 0 and 2³² − 1. Return the result as a non-negative number too (use `>>> 0` at the end).',
      examples: [
        {
          input: 'n = 43261596',
          output: '964176192',
          explain: '`00000010100101000001111010011100` reversed is `00111001011110000010100101000000`.',
        },
        { input: 'n = 1', output: '2147483648', explain: 'Bit 0 moves to bit 31: 2³¹.' },
      ],
      constraints: ['0 ≤ n ≤ 2³² − 1', 'Always use all 32 bits, including leading zeros.'],
      hints: [
        'Build the answer one bit at a time.',
        'Each round: shift the answer left by one to make room, then put the last bit of `n` there.',
        '`result = (result << 1) | (n & 1)`, then `n >>>= 1`. Do it exactly 32 times, and return `result >>> 0`.',
      ],
      approaches: [
        {
          name: 'String reverse',
          idea: 'Write `n` as 32 binary characters (pad with zeros), reverse the text, read it back with `parseInt(…, 2)`.',
          code: `function reverseBits(n) {
  const s = n.toString(2).padStart(32, '0');
  return parseInt(s.split('').reverse().join(''), 2);
}`,
          time: 'O(32)',
          space: 'O(32)',
        },
        {
          name: 'Move one bit per round',
          idea: 'Take bits off the right end of `n` and push them onto the right end of the answer. The first bit taken ends up furthest left after 32 shifts, so the order flips.',
          pseudo: `// <<: slide bits left (make room on the right)   OR: combine bits
function reverseBits(n):
    result ← 0
    repeat 32 times:
        result ← (result << 1) OR (n AND 1)   // copy n's last bit in
        n ← n >>> 1                           // drop n's last bit
    return result as unsigned`,
          code: `function reverseBits(n) {
  let result = 0;
  for (let i = 0; i < 32; i++) {
    result = (result << 1) | (n & 1);
    n >>>= 1;
  }
  return result >>> 0;
}`,
          time: 'O(32)',
          space: 'O(1)',
        },
      ],
      fn: 'reverseBits',
      starter: `function reverseBits(n) {
  // reverse all 32 bits; return a non-negative number
  return 0;
}`,
      solution: `function reverseBits(n) {
  let result = 0;
  for (let i = 0; i < 32; i++) {
    result = (result << 1) | (n & 1);
    n >>>= 1;
  }
  return result >>> 0;
}`,
      tests: [
        { name: 'example', args: [43261596], expected: 964176192 },
        { name: 'big input', args: [4294967293], expected: 3221225471 },
        { name: 'zero', args: [0], expected: 0 },
        { name: 'one → 2³¹', args: [1], expected: 2147483648 },
        { name: '2³¹ → one', args: [2147483648], expected: 1 },
        { name: 'two', args: [2], expected: 1073741824 },
        { name: 'three', args: [3], expected: 3221225472 },
        { name: 'all ones', args: [4294967295], expected: 4294967295 },
      ],
      takeaway: 'Build a number bit by bit with `(result << 1) | bit`, and finish with `>>> 0` for the unsigned view.',
    },
    {
      id: 'bits-math-min-flips-or',
      title: 'Minimum flips to make a OR b equal c',
      difficulty: 'medium',
      leetcode: 1318,
      pattern: 'Walk the bits',
      statement:
        'Two light panels `a` and `b` drive one display. A pixel lights up when it is on in either panel (`a | b`). You want the display to show the pattern `c`. One flip changes one bit of `a` or of `b`. Return the fewest flips needed.',
      examples: [
        {
          input: 'a = 2, b = 6, c = 5',
          output: '3',
          explain: '`010 | 110` must become `101`. Bit 0: needs a 1, both are 0: 1 flip. Bit 1: needs 0, both are 1: 2 flips.',
        },
        { input: 'a = 4, b = 2, c = 7', output: '1' },
        { input: 'a = 1, b = 2, c = 3', output: '0' },
      ],
      constraints: ['0 ≤ a, b, c ≤ 10⁹'],
      hints: [
        'Each bit position is its own small puzzle. Bits never affect each other.',
        'Read bit `i` of `a`, `b` and `c` with `(x >> i) & 1`.',
        'If `c` wants a 1: you need 1 flip only when both `a` and `b` have 0. If `c` wants a 0: every 1 in `a` or `b` must flip.',
      ],
      approaches: [
        {
          name: 'Compare binary strings',
          idea: 'Pad all three numbers to 30 binary characters and compare position by position. Correct, but juggles strings for no reason.',
          time: 'O(30)',
          space: 'O(30)',
        },
        {
          name: 'Walk the 30 bits',
          idea: 'For each bit, the cost depends only on that bit of `a`, `b` and `c`. Add up the cost of every bit.',
          pseudo: `function minFlips(a, b, c):
    flips ← 0
    for i from 0 to 29:                 // 10⁹ < 2³⁰
        x ← (a >> i) AND 1
        y ← (b >> i) AND 1
        z ← (c >> i) AND 1
        if z = 1:
            if x = 0 and y = 0:
                flips ← flips + 1       // turn one of them on
        else:
            flips ← flips + x + y       // every 1 must go off
    return flips`,
          code: `function minFlips(a, b, c) {
  let flips = 0;
  for (let i = 0; i < 30; i++) {
    const x = (a >> i) & 1;
    const y = (b >> i) & 1;
    const z = (c >> i) & 1;
    if (z === 1) flips += x === 0 && y === 0 ? 1 : 0;
    else flips += x + y;
  }
  return flips;
}`,
          time: 'O(30)',
          space: 'O(1)',
        },
      ],
      fn: 'minFlips',
      starter: `function minFlips(a, b, c) {
  // fewest bit flips in a and b so that (a | b) === c
  return 0;
}`,
      solution: `function minFlips(a, b, c) {
  let flips = 0;
  for (let i = 0; i < 30; i++) {
    const x = (a >> i) & 1;
    const y = (b >> i) & 1;
    const z = (c >> i) & 1;
    if (z === 1) flips += x === 0 && y === 0 ? 1 : 0;
    else flips += x + y;
  }
  return flips;
}`,
      tests: [
        { name: 'example 1', args: [2, 6, 5], expected: 3 },
        { name: 'example 2', args: [4, 2, 7], expected: 1 },
        { name: 'already equal', args: [1, 2, 3], expected: 0 },
        { name: 'all zero', args: [0, 0, 0], expected: 0 },
        { name: 'need one bit on', args: [0, 0, 1], expected: 1 },
        { name: 'turn everything off', args: [7, 7, 0], expected: 6 },
        { name: 'mixed', args: [8, 3, 5], expected: 3 },
        { name: 'large values', args: [1000000000, 1, 999999999], expected: 9 },
      ],
      takeaway: 'When bits do not affect each other, solve one bit at a time and add up the answers.',
    },
  ],
  quiz: [
    {
      prompt: 'What is `12 & 10`? (12 = `1100`, 10 = `1010`)',
      options: ['14', '8', '6', '2'],
      answer: 1,
      explanation: 'AND keeps a bit only where both have a 1: `1000` = 8. 14 is OR, 6 is XOR.',
    },
    {
      prompt: 'Which expression reads bit 3 of `n` as 0 or 1?',
      options: ['`n & 3`', '`n >> 3`', '`(n >> 3) & 1`', '`n | (1 << 3)`'],
      answer: 2,
      explanation: 'Slide bit 3 to the end with `>> 3`, then keep only the last bit with `& 1`. `n >> 3` alone still has the higher bits.',
    },
    {
      prompt: 'Why does `1 << 31` give a negative number in JavaScript?',
      options: [
        'Shifts multiply by 3',
        'Bit operators work on signed 32-bit integers, and bit 31 is the sign bit',
        'JavaScript numbers cannot go above 2³⁰',
        'It is a bug in the browser',
      ],
      answer: 1,
      explanation: 'The result is read as a signed 32-bit integer. Use `(1 << 31) >>> 0` for the unsigned value 2147483648.',
    },
    {
      prompt: 'n = 40 (`101000`). What is `n & (n - 1)`?',
      options: ['39', '32', '8', '0'],
      answer: 1,
      explanation: '39 = `100111`. AND with `101000` gives `100000` = 32: the rightmost 1 (worth 8) is gone.',
    },
  ],
  takeaways: [
    'Read bit i with `(n >> i) & 1`; set it with `| (1 << i)`; clear it with `& ~(1 << i)`; flip it with `^ (1 << i)`.',
    '`n & (n - 1)` erases the rightmost 1. Power of two means only one 1 bit.',
    'JS bit operators work on signed 32-bit integers. Use `>>>` to shift without the sign, `>>> 0` for the unsigned view, BigInt for more bits.',
    'Wrap bit expressions in brackets before comparing: `(n & 4) === 0`.',
  ],
};

export default lesson;
