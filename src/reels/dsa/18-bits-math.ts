import type { Series } from '../types';

// /dsa/reels module 18. One reel per lesson of src/dsa/modules/18-bits-math*.ts, in lesson order.
// Brief: src/reels/dsa/README.md. Rules: src/reels/AUTHORING.md.

const worth6 = ['32', '16', '8', '4', '2', '1'];
const socks = [4, 1, 2, 1, 2];
const toppings = [3, 1, 2];

export const series: Series = {
  id: 'dsa-bits-math',
  title: 'Bit manipulation & math tricks',
  emoji: '🧮',
  color: '#818cf8',
  order: 18,
  blurb: 'XOR magic, masks, and the number tricks interviews love.',
  reels: [
    // ───────────────────────────── Lesson 1: binary and the bit operators
    {
      id: 'dsa-bits-math-binary-and-operators',
      title: 'Binary and the bit operators',
      link: { label: 'Solve it', href: '/dsa#/m/bits-math/binary-and-operators/bits-math-number-of-1-bits' },
      beats: [
        {
          say: 'What does chmod seven five four mean? Each digit hides three switches.',
          speak: 'What does ch-mod seven five four mean? Each digit hides three switches.',
          emphasis: ['three', 'switches'],
          scene: { type: 'title', kicker: 'Bits · Lesson 1', title: 'One digit, *three* switches', emoji: '🔐', style: 'slam' },
        },
        {
          say: 'Your computer sees forty-five as one zero one one zero one. Thirty-two, eight, four and one are on.',
          speak: 'Your computer sees forty-five as one, zero, one, one, zero, one. Thirty-two, eight, four and one are on.',
          emphasis: ['on'],
          sfx: 'pop',
          scene: {
            type: 'grid',
            title: '45 as six switches',
            colLabels: worth6,
            rowLabels: ['45'],
            cells: [[1, 0, 1, 1, 0, 1]],
            found: [[0, 0], [0, 2], [0, 3], [0, 5]],
            vars: { on: 4 },
            caption: '32 + 8 + 4 + 1 = 45',
          },
        },
        {
          say: 'AND gives a one only where both numbers have a one. So twelve AND ten is eight.',
          speak: 'And gives a one only where both numbers have a one. So twelve and ten is eight.',
          emphasis: ['both', 'eight'],
          scene: {
            type: 'grid',
            title: 'AND, one bit at a time',
            colLabels: ['8', '4', '2', '1'],
            rowLabels: ['12', '10', 'AND'],
            cells: [
              [1, 1, 0, 0],
              [1, 0, 1, 0],
              [1, 0, 0, 0],
            ],
            active: [[2, 0]],
            reads: [[0, 0], [1, 0]],
            caption: 'a 1 only where both are 1',
          },
        },
        {
          say: 'To count the ones, the easy way writes n out as text, then checks every character.',
          emphasis: ['text', 'every'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'pseudo',
            file: 'Brute force',
            code: `function countOnes(n):
    s ← n written in binary
    count ← 0
    for each ch in s:
        if ch = '1':
            count ← count + 1
    return count`,
            highlight: [[4, 5]],
            note: { line: 5, text: 'checks every 0 too', tone: 'warn' },
          },
        },
        {
          say: 'One hundred twenty-eight has a single one, but every zero still gets checked. Thirty-two bits means thirty-two checks.',
          emphasis: ['single', 'zero'],
          scene: {
            type: 'array',
            title: 'Spot the waste',
            cells: [1, 0, 0, 0, 0, 0, 0, 0],
            indices: false,
            active: [0],
            reads: [1, 2, 3, 4, 5, 6, 7],
            vars: { ones: 1, checks: 8 },
            caption: '128: one 1, yet every bit is read',
          },
        },
        {
          say: "Here's the trick. n AND n minus one erases the rightmost one, and keeps the rest.",
          speak: "Here's the trick. n and n minus one erases the rightmost one, and keeps the rest.",
          emphasis: ['erases', 'rightmost'],
          sfx: 'ding',
          scene: { type: 'title', kicker: 'The insight', title: 'n & (n−1) erases the *last 1*', emoji: '💡', style: 'slam' },
        },
        {
          say: 'Forty-five minus one only flips the last bit. AND them, and that last one is gone. Count one.',
          speak: 'Forty-five minus one only flips the last bit. And them, and that last one is gone. Count one.',
          emphasis: ['gone'],
          scene: {
            type: 'grid',
            title: 'Erase one 1 per round',
            colLabels: worth6,
            rowLabels: ['n', 'n − 1', 'AND'],
            cells: [
              [1, 0, 1, 1, 0, 1],
              [1, 0, 1, 1, 0, 0],
              [1, 0, 1, 1, 0, 0],
            ],
            active: [[0, 5]],
            vars: { n: 45, count: 1 },
          },
        },
        {
          say: 'Now n is forty-four. Minus one flips the low bits, so AND wipes out the next one. Count two.',
          speak: 'Now n is forty-four. Minus one flips the low bits, so and wipes out the next one. Count two.',
          emphasis: ['wipes'],
          scene: {
            type: 'grid',
            title: 'Erase one 1 per round',
            colLabels: worth6,
            rowLabels: ['n', 'n − 1', 'AND'],
            cells: [
              [1, 0, 1, 1, 0, 0],
              [1, 0, 1, 0, 1, 1],
              [1, 0, 1, 0, 0, 0],
            ],
            active: [[0, 3]],
            vars: { n: 44, count: 2 },
          },
        },
        {
          say: 'Forty AND thirty-nine is thirty-two. Another one gone. Count three.',
          speak: 'Forty and thirty-nine is thirty-two. Another one gone. Count three.',
          emphasis: ['three'],
          scene: {
            type: 'grid',
            title: 'Erase one 1 per round',
            colLabels: worth6,
            rowLabels: ['n', 'n − 1', 'AND'],
            cells: [
              [1, 0, 1, 0, 0, 0],
              [1, 0, 0, 1, 1, 1],
              [1, 0, 0, 0, 0, 0],
            ],
            active: [[0, 2]],
            vars: { n: 40, count: 3 },
          },
        },
        {
          say: 'Thirty-two AND thirty-one is zero, so we stop. Four ones, found in just four rounds.',
          speak: 'Thirty-two and thirty-one is zero, so we stop. Four ones, found in just four rounds.',
          emphasis: ['four', 'rounds'],
          sfx: 'success',
          scene: {
            type: 'grid',
            title: 'Erase one 1 per round',
            colLabels: worth6,
            rowLabels: ['n', 'n − 1', 'AND'],
            cells: [
              [1, 0, 0, 0, 0, 0],
              [0, 1, 1, 1, 1, 1],
              [0, 0, 0, 0, 0, 0],
            ],
            active: [[0, 0]],
            vars: { n: 32, count: 4 },
          },
        },
        {
          say: "In JavaScript, the loop runs once for each switch that's on. So it's O of k, where k is the number of ones.",
          speak: "In JavaScript, the loop runs once for each switch that's on. So it's oh of k, where k is the number of ones.",
          emphasis: ['once'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'hammingWeight.js',
            code: `function hammingWeight(n) {
  let count = 0;
  while (n !== 0) {
    n = n & (n - 1);
    count++;
  }
  return count;
}`,
            highlight: [4],
            note: { line: 4, text: 'one round per 1 bit: O(k)', tone: 'good' },
          },
        },
        {
          say: 'Reach for this when a problem talks about binary or one bits, and each bit can be decided alone.',
          emphasis: ['binary', 'alone'],
          scene: {
            type: 'list',
            title: 'Reach for this when…',
            items: [
              { text: 'You see *binary* or *1 bits*', icon: '🔢' },
              { text: 'Each bit is decided *alone*', icon: '🎚️' },
              { text: 'Only *O(1)* extra memory', icon: '📦' },
            ],
            active: 0,
          },
        },
        {
          say: 'The trap: a plain right shift copies the sign bit. So a negative n never hits zero, and this loops forever.',
          emphasis: ['sign', 'forever'],
          sfx: 'error',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'trap.js',
            code: `while (n !== 0) {
  count += n & 1;
  n = n >> 1;
}`,
            errors: [3],
            note: { line: 3, text: 'use >>> so zeros fill in', tone: 'bad' },
          },
        },
        {
          say: 'Quick check. Which one reads bit three of n as a zero or a one?',
          sfx: 'riser',
          scene: {
            type: 'quiz',
            question: 'Which one reads bit 3 of n as a 0 or a 1?',
            options: ['n & 3', 'n >> 3', '(n >> 3) & 1', 'n | (1 << 3)'],
            answer: 2,
          },
        },
        {
          say: 'Shift n right by three, then AND with one. That keeps just the last bit.',
          speak: 'Shift n right by three, then and with one. That keeps just the last bit.',
          emphasis: ['last'],
          sfx: 'ding',
          scene: {
            type: 'quiz',
            question: 'Which one reads bit 3 of n as a 0 or a 1?',
            options: ['n & 3', 'n >> 3', '(n >> 3) & 1', 'n | (1 << 3)'],
            answer: 2,
            reveal: true,
            explain: 'Slide bit 3 to the end, keep the last bit.',
          },
        },
        {
          say: 'Remember this. Read a bit with shift and AND, and erase ones with n AND n minus one. Now tap solve it and try it yourself.',
          speak: 'Remember this. Read a bit with shift and and, and erase ones with n and n minus one. Now tap solve it and try it yourself.',
          emphasis: ['shift', 'erase'],
          sfx: 'success',
          scene: {
            type: 'outro',
            points: ['A number is a row of *switches*', 'Read bit i with *(n >> i) & 1*', '*n & (n − 1)* erases the last 1'],
            tagline: 'Now go solve it.',
          },
        },
      ],
    },

    // ───────────────────────────── Lesson 2: XOR, the cancel button
    {
      id: 'dsa-bits-math-xor-tricks',
      title: 'XOR: the cancel button',
      link: { label: 'Solve it', href: '/dsa#/m/bits-math/xor-tricks/bits-math-single-number' },
      beats: [
        {
          say: 'A disk dies, and the server rebuilds it without any copy. How?',
          emphasis: ['without'],
          scene: { type: 'title', kicker: 'Bits · Lesson 2', title: 'Rebuild a dead disk, *no copy*', emoji: '💾', style: 'slam' },
        },
        {
          say: 'Every sock has a twin except one. In four, one, two, one, two, the lonely sock is four.',
          emphasis: ['lonely', 'four'],
          sfx: 'pop',
          scene: {
            type: 'array',
            title: 'The sock pile',
            cells: socks,
            found: [0],
            caption: 'every sock has a twin but one',
          },
        },
        {
          say: 'The easy way counts every number in a map, then returns the one it saw once.',
          emphasis: ['map', 'once'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'pseudo',
            file: 'Brute force',
            code: `function singleNumber(nums):
    counts ← empty map
    for each x in nums:
        counts[x] ← counts[x] + 1
    for each (x, c) in counts:
        if c = 1:
            return x`,
            highlight: [2],
            note: { line: 2, text: 'an entry for every number', tone: 'warn' },
          },
        },
        {
          say: "It's fast, but the map stores every pair, and pairs never matter. We want to forget a number the second time.",
          emphasis: ['forget'],
          scene: {
            type: 'array',
            title: 'Spot the waste',
            cells: socks,
            active: [0],
            done: [1, 2, 3, 4],
            vars: { stored: 3, needed: 1 },
            caption: 'the map keeps the pairs for nothing',
          },
        },
        {
          say: 'XOR does exactly that. A number XOR itself is zero, and XOR with zero changes nothing.',
          speak: 'Ex-or does exactly that. A number ex-or itself is zero, and ex-or with zero changes nothing.',
          emphasis: ['zero', 'nothing'],
          sfx: 'ding',
          scene: { type: 'title', kicker: 'The insight', title: 'x ^ x = 0, so *pairs vanish*', emoji: '💡', style: 'slam' },
        },
        {
          say: 'Start at zero and XOR in the four. The total is now four, one zero zero.',
          speak: 'Start at zero and ex-or in the four. The total is now four, one, zero, zero.',
          emphasis: ['four'],
          scene: {
            type: 'array',
            title: 'XOR them all',
            cells: socks,
            pointers: { i: 0 },
            active: [0],
            vars: { x: '4 = 100', acc: '4 = 100' },
          },
        },
        {
          say: 'XOR in the one, and we get five, one zero one. It looks messy, but nothing is lost.',
          speak: 'Ex-or in the one, and we get five, one, zero, one. It looks messy, but nothing is lost.',
          emphasis: ['five', 'lost'],
          scene: {
            type: 'array',
            title: 'XOR them all',
            cells: socks,
            pointers: { i: 1 },
            active: [1],
            done: [0],
            vars: { x: '1 = 001', acc: '5 = 101' },
          },
        },
        {
          say: 'XOR in the two, and the total becomes seven, one one one.',
          speak: 'Ex-or in the two, and the total becomes seven, one, one, one.',
          emphasis: ['seven'],
          scene: {
            type: 'array',
            title: 'XOR them all',
            cells: socks,
            pointers: { i: 2 },
            active: [2],
            done: [0, 1],
            vars: { x: '2 = 010', acc: '7 = 111' },
          },
        },
        {
          say: 'Here comes the second one. Its bit flips back off, so the two ones cancelled out.',
          emphasis: ['cancelled'],
          scene: {
            type: 'array',
            title: 'XOR them all',
            cells: socks,
            pointers: { i: 3 },
            active: [3],
            done: [0, 1, 2],
            vars: { x: '1 = 001', acc: '6 = 110' },
          },
        },
        {
          say: 'The second two cancels too. Only four is left standing: the lonely sock.',
          emphasis: ['four', 'lonely'],
          sfx: 'success',
          scene: {
            type: 'array',
            title: 'XOR them all',
            cells: socks,
            pointers: { i: 4 },
            found: [0],
            done: [1, 2, 3, 4],
            vars: { x: '2 = 010', acc: '4 = 100' },
          },
        },
        {
          say: "In JavaScript it's one line: XOR every number into acc. One pass, and no map at all.",
          speak: "In JavaScript it's one line: ex-or every number into acc. One pass, and no map at all.",
          emphasis: ['one', 'line'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'singleNumber.js',
            code: `function singleNumber(nums) {
  let acc = 0;
  for (const x of nums) acc = acc ^ x;
  return acc;
}`,
            highlight: [3],
            note: { line: 3, text: 'O(n) time, O(1) memory', tone: 'good' },
          },
        },
        {
          say: 'Reach for this when everything comes in pairs but one, or when one number is missing.',
          emphasis: ['pairs', 'missing'],
          scene: {
            type: 'list',
            title: 'Reach for this when…',
            items: [
              { text: 'All in *pairs*, except one', icon: '🧦' },
              { text: 'Find the *missing* number', icon: '🔍' },
              { text: 'Only *O(1)* extra memory', icon: '📦' },
            ],
            active: 0,
          },
        },
        {
          say: 'The trap: XOR only cancels pairs. If the others show up three times, one copy stays behind, and you get junk.',
          speak: 'The trap: ex-or only cancels pairs. If the others show up three times, one copy stays behind, and you get junk.',
          emphasis: ['pairs', 'three'],
          sfx: 'error',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'trap.js',
            code: `// the others appear 3 times
const nums = [2, 2, 3, 2];
let acc = 0;
for (const x of nums) acc = acc ^ x;
// acc is 1, not 3`,
            errors: [5],
            note: { line: 5, text: 'x ^ x ^ x is x, not 0', tone: 'bad' },
          },
        },
        {
          say: 'Quick check. What is nine XOR five XOR nine?',
          speak: 'Quick check. What is nine ex-or five ex-or nine?',
          sfx: 'riser',
          scene: {
            type: 'quiz',
            question: 'What is 9 ^ 5 ^ 9?',
            options: ['5', '9', '0', '13'],
            answer: 0,
          },
        },
        {
          say: "It's five. The two nines cancel each other, and the order doesn't matter.",
          emphasis: ['cancel', 'order'],
          sfx: 'ding',
          scene: {
            type: 'quiz',
            question: 'What is 9 ^ 5 ^ 9?',
            options: ['5', '9', '0', '13'],
            answer: 0,
            reveal: true,
            explain: '(9 ^ 9) ^ 5 = 0 ^ 5 = 5',
          },
        },
        {
          say: 'Remember this. Pairs cancel under XOR, so the lonely number is left standing. Now tap solve it and try it yourself.',
          speak: 'Remember this. Pairs cancel under ex-or, so the lonely number is left standing. Now tap solve it and try it yourself.',
          emphasis: ['cancel', 'lonely'],
          sfx: 'success',
          scene: {
            type: 'outro',
            points: ['*x ^ x = 0* and x ^ 0 = x', 'The order never matters', 'XOR it all: the *lonely one* stays'],
            tagline: 'Now go solve it.',
          },
        },
      ],
    },

    // ───────────────────────────── Lesson 3: counting bits (and math without + or /)
    {
      id: 'dsa-bits-math-counting-and-arithmetic',
      title: 'Counting bits and math without + or /',
      link: { label: 'Solve it', href: '/dsa#/m/bits-math/counting-and-arithmetic/bits-math-counting-bits' },
      beats: [
        {
          say: 'Count the one bits of every number up to a hundred thousand. Fast.',
          emphasis: ['every', 'fast'],
          scene: { type: 'title', kicker: 'Bits · Lesson 3', title: 'Reuse a *smaller* answer', emoji: '🔁', style: 'slam' },
        },
        {
          say: 'For n equals five, write each number in binary and count its ones: zero, one, one, two, one, two.',
          emphasis: ['ones'],
          sfx: 'pop',
          scene: {
            type: 'grid',
            title: 'Ones in 0 to 5',
            colLabels: ['0', '1', '2', '3', '4', '5'],
            rowLabels: ['bits', 'ones'],
            cells: [
              ['0', '1', '10', '11', '100', '101'],
              [0, 1, 1, 2, 1, 2],
            ],
            found: [[1, 0], [1, 1], [1, 2], [1, 3], [1, 4], [1, 5]],
            caption: 'the answer for n = 5',
          },
        },
        {
          say: 'The easy way counts each number from scratch. That can take thirty-two steps every time.',
          emphasis: ['scratch'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'pseudo',
            file: 'Brute force',
            code: `function countBits(n):
    ans ← empty list
    for i from 0 to n:
        append countOnes(i) to ans
    return ans`,
            highlight: [4],
            note: { line: 4, text: 'up to 32 steps per number', tone: 'warn' },
          },
        },
        {
          say: 'But five, one zero one, is just two, one zero, with one more bit on the end. And we already counted two.',
          speak: 'But five, one, zero, one, is just two, one, zero, with one more bit on the end. And we already counted two.',
          emphasis: ['already'],
          scene: {
            type: 'grid',
            title: 'Spot the waste',
            rowLabels: ['2', '5'],
            cells: [
              [1, 0, ''],
              [1, 0, 1],
            ],
            reads: [[0, 0], [0, 1]],
            active: [[1, 2]],
            caption: '5 is 2 with one more bit',
          },
        },
        {
          say: "So drop the last bit with a shift. That smaller number is already counted. Just add the last bit back.",
          emphasis: ['drop', 'add'],
          sfx: 'ding',
          scene: { type: 'title', kicker: 'The insight', title: 'Drop the last bit, *reuse* the rest', emoji: '💡', style: 'slam' },
        },
        {
          say: 'Zero, one and two are done. Three is one one: drop the last bit to get one. One plus one is two.',
          speak: 'Zero, one and two are done. Three is one, one: drop the last bit to get one. One plus one is two.',
          emphasis: ['two'],
          scene: {
            type: 'array',
            title: 'Fill bits[0..7]',
            cells: [0, 1, 1, 2, '', '', '', ''],
            pointers: { i: 3, half: 1 },
            active: [3],
            reads: [1],
            vars: { binary: '011', 'i >> 1': 1, 'i & 1': 1 },
          },
        },
        {
          say: 'Four drops to two, which has one. Its last bit is zero, so four has one.',
          emphasis: ['one'],
          scene: {
            type: 'array',
            title: 'Fill bits[0..7]',
            cells: [0, 1, 1, 2, 1, '', '', ''],
            pointers: { i: 4, half: 2 },
            active: [4],
            reads: [2],
            vars: { binary: '100', 'i >> 1': 2, 'i & 1': 0 },
          },
        },
        {
          say: 'Five drops to two as well. One, plus its last bit, one, makes two.',
          emphasis: ['two'],
          scene: {
            type: 'array',
            title: 'Fill bits[0..7]',
            cells: [0, 1, 1, 2, 1, 2, '', ''],
            pointers: { i: 5, half: 2 },
            active: [5],
            reads: [2],
            vars: { binary: '101', 'i >> 1': 2, 'i & 1': 1 },
          },
        },
        {
          say: 'Six drops to three, which has two. Plus zero, so six has two.',
          emphasis: ['three'],
          scene: {
            type: 'array',
            title: 'Fill bits[0..7]',
            cells: [0, 1, 1, 2, 1, 2, 2, ''],
            pointers: { i: 6, half: 3 },
            active: [6],
            reads: [3],
            vars: { binary: '110', 'i >> 1': 3, 'i & 1': 0 },
          },
        },
        {
          say: 'Seven reuses three too: two plus one is three. Every answer took just one step.',
          emphasis: ['one', 'step'],
          sfx: 'success',
          scene: {
            type: 'array',
            title: 'Fill bits[0..7]',
            cells: [0, 1, 1, 2, 1, 2, 2, 3],
            pointers: { i: 7, half: 3 },
            active: [7],
            reads: [3],
            vars: { binary: '111', 'i >> 1': 3, 'i & 1': 1 },
          },
        },
        {
          say: "In JavaScript, each count is one shift, one AND and one add. That's O of n.",
          speak: "In JavaScript, each count is one shift, one and, and one add. That's oh of n.",
          emphasis: ['shift', 'add'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'countBits.js',
            code: `function countBits(n) {
  const bits = Array(n + 1).fill(0);
  for (let i = 1; i <= n; i++)
    bits[i] = bits[i >> 1] + (i & 1);
  return bits;
}`,
            highlight: [4],
            note: { line: 4, text: 'one step per number: O(n)', tone: 'good' },
          },
        },
        {
          say: "Reach for this when you need an answer for every number, and a smaller number's answer helps.",
          emphasis: ['every', 'smaller'],
          scene: {
            type: 'list',
            title: 'Reach for this when…',
            items: [
              { text: 'You need *every* number 0 to n', icon: '🔢' },
              { text: 'A *smaller* answer helps', icon: '🧱' },
              { text: 'One step each is the goal', icon: '⚡' },
            ],
            active: 1,
          },
        },
        {
          say: "The trap: three divided by two is one and a half. There's no such slot, so you get NaN.",
          speak: "The trap: three divided by two is one and a half. There's no such slot, so you get nan.",
          emphasis: ['half', 'NaN'],
          sfx: 'error',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'trap.js',
            code: `for (let i = 1; i <= n; i++)
  bits[i] = bits[i / 2] + (i % 2);`,
            errors: [2],
            note: { line: 2, text: 'bits[1.5] is undefined', tone: 'bad' },
          },
        },
        {
          say: 'Quick check. Bits of six is two, and thirteen is one one zero one. What is bits of thirteen?',
          speak: 'Quick check. Bits of six is two, and thirteen is one, one, zero, one. What is bits of thirteen?',
          sfx: 'riser',
          scene: {
            type: 'quiz',
            question: 'bits[6] is 2. What is bits[13]? (13 = 1101)',
            options: ['2', '3', '4', '1'],
            answer: 1,
          },
        },
        {
          say: "It's three. Thirteen drops to six, which has two, plus its last bit, one.",
          emphasis: ['three'],
          sfx: 'ding',
          scene: {
            type: 'quiz',
            question: 'bits[6] is 2. What is bits[13]? (13 = 1101)',
            options: ['2', '3', '4', '1'],
            answer: 1,
            reveal: true,
            explain: '13 >> 1 is 6, so 2 + 1 = 3.',
          },
        },
        {
          say: 'Remember this. Drop the last bit, reuse the smaller answer, and add the bit back. Now tap solve it and try it yourself.',
          emphasis: ['reuse'],
          sfx: 'success',
          scene: {
            type: 'outro',
            points: ['*i >> 1* drops the last bit', 'Reuse the *smaller* answer', 'One step per number: *O(n)*'],
            tagline: 'Now go solve it.',
          },
        },
      ],
    },

    // ───────────────────────────── Lesson 4: bitmasks, a whole set in one number
    {
      id: 'dsa-bits-math-bitmasks-and-subsets',
      title: 'Bitmasks: a whole set in one number',
      link: { label: 'Solve it', href: '/dsa#/m/bits-math/bitmasks-and-subsets/bits-math-count-max-or-subsets' },
      beats: [
        {
          say: 'Discord stores everything a role can do in one single number. How?',
          emphasis: ['one', 'number'],
          scene: { type: 'title', kicker: 'Bits · Lesson 4', title: 'A whole *set* in one number', emoji: '🎛️', style: 'slam' },
        },
        {
          say: "A pizza's strength is the OR of the topping codes you pick. The best is three, and five picks reach it.",
          speak: "A pizza's strength is the or of the topping codes you pick. The best is three, and five picks reach it.",
          emphasis: ['three', 'five'],
          sfx: 'pop',
          scene: {
            type: 'array',
            title: 'Pizza topping codes',
            cells: toppings,
            vars: { best: 3, ways: 5 },
            caption: 'strength = OR of the codes you pick',
          },
        },
        {
          say: 'The usual first idea is recursion. For each topping, you either take it or skip it.',
          emphasis: ['take', 'skip'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'pseudo',
            file: 'Brute force',
            code: `function count(i, v):
    if i = n:
        return 1 if v = best else 0
    take ← count(i + 1, v OR nums[i])
    skip ← count(i + 1, v)
    return take + skip`,
            highlight: [[4, 5]],
            note: { line: 5, text: 'take it or skip it', tone: 'warn' },
          },
        },
        {
          say: 'It works, but you need a call stack and base cases, just to list yes or no choices.',
          emphasis: ['stack', 'yes'],
          scene: {
            type: 'tree',
            title: 'Spot the waste',
            caption: 'a whole call stack for subsets',
            root: {
              id: 'start', label: 'start', children: [
                { id: 't3', label: 'take 3', children: [{ id: 't3t1', label: 'take 1' }, { id: 't3s1', label: 'skip 1' }] },
                { id: 's3', label: 'skip 3', children: [{ id: 's3t1', label: 'take 1' }, { id: 's3s1', label: 'skip 1' }] },
              ],
            },
          },
        },
        {
          say: "Here's the trick. A row of yes or no answers is just a binary number. So count from one to seven.",
          emphasis: ['binary', 'number'],
          sfx: 'ding',
          scene: { type: 'title', kicker: 'The insight', title: 'Every *number* is a subset', emoji: '💡', style: 'slam' },
        },
        {
          say: 'Mask one is zero zero one, so it picks only the three. Its OR is three, the best. Count one.',
          speak: 'Mask one is zero, zero, one, so it picks only the three. Its or is three, the best. Count one.',
          emphasis: ['best'],
          scene: {
            type: 'grid',
            title: 'Masks 1 to 7',
            colLabels: ['b2', 'b1', 'b0', 'OR'],
            rowLabels: ['1', '2', '3', '4', '5', '6', '7'],
            cells: [
              [0, 0, 1, 3],
              ['', '', '', ''],
              ['', '', '', ''],
              ['', '', '', ''],
              ['', '', '', ''],
              ['', '', '', ''],
              ['', '', '', ''],
            ],
            active: [[0, 0], [0, 1], [0, 2]],
            found: [[0, 3]],
            vars: { picks: '3', count: 1 },
            caption: 'b0 is 3, b1 is 1, b2 is 2',
          },
        },
        {
          say: 'Mask two picks just the one, too weak. Mask three picks three and one. Count two.',
          emphasis: ['weak', 'two'],
          scene: {
            type: 'grid',
            title: 'Masks 1 to 7',
            colLabels: ['b2', 'b1', 'b0', 'OR'],
            rowLabels: ['1', '2', '3', '4', '5', '6', '7'],
            cells: [
              [0, 0, 1, 3],
              [0, 1, 0, 1],
              [0, 1, 1, 3],
              ['', '', '', ''],
              ['', '', '', ''],
              ['', '', '', ''],
              ['', '', '', ''],
            ],
            active: [[2, 0], [2, 1], [2, 2]],
            found: [[0, 3], [2, 3]],
            done: [[1, 3]],
            vars: { picks: '3, 1', count: 2 },
            caption: 'b0 is 3, b1 is 1, b2 is 2',
          },
        },
        {
          say: 'Mask four is the two alone, too weak. Mask five, one zero one, picks three and two. Count three.',
          speak: 'Mask four is the two alone, too weak. Mask five, one, zero, one, picks three and two. Count three.',
          emphasis: ['three'],
          scene: {
            type: 'grid',
            title: 'Masks 1 to 7',
            colLabels: ['b2', 'b1', 'b0', 'OR'],
            rowLabels: ['1', '2', '3', '4', '5', '6', '7'],
            cells: [
              [0, 0, 1, 3],
              [0, 1, 0, 1],
              [0, 1, 1, 3],
              [1, 0, 0, 2],
              [1, 0, 1, 3],
              ['', '', '', ''],
              ['', '', '', ''],
            ],
            active: [[4, 0], [4, 1], [4, 2]],
            found: [[0, 3], [2, 3], [4, 3]],
            done: [[1, 3], [3, 3]],
            vars: { picks: '3, 2', count: 3 },
            caption: 'b0 is 3, b1 is 1, b2 is 2',
          },
        },
        {
          say: 'Mask six picks one and two. One OR two is three, so count four.',
          speak: 'Mask six picks one and two. One or two is three, so count four.',
          emphasis: ['four'],
          scene: {
            type: 'grid',
            title: 'Masks 1 to 7',
            colLabels: ['b2', 'b1', 'b0', 'OR'],
            rowLabels: ['1', '2', '3', '4', '5', '6', '7'],
            cells: [
              [0, 0, 1, 3],
              [0, 1, 0, 1],
              [0, 1, 1, 3],
              [1, 0, 0, 2],
              [1, 0, 1, 3],
              [1, 1, 0, 3],
              ['', '', '', ''],
            ],
            active: [[5, 0], [5, 1], [5, 2]],
            found: [[0, 3], [2, 3], [4, 3], [5, 3]],
            done: [[1, 3], [3, 3]],
            vars: { picks: '1, 2', count: 4 },
            caption: 'b0 is 3, b1 is 1, b2 is 2',
          },
        },
        {
          say: 'Mask seven takes everything. Five masks hit the best, so the answer is five.',
          emphasis: ['five'],
          sfx: 'success',
          scene: {
            type: 'grid',
            title: 'Masks 1 to 7',
            colLabels: ['b2', 'b1', 'b0', 'OR'],
            rowLabels: ['1', '2', '3', '4', '5', '6', '7'],
            cells: [
              [0, 0, 1, 3],
              [0, 1, 0, 1],
              [0, 1, 1, 3],
              [1, 0, 0, 2],
              [1, 0, 1, 3],
              [1, 1, 0, 3],
              [1, 1, 1, 3],
            ],
            active: [[6, 0], [6, 1], [6, 2]],
            found: [[0, 3], [2, 3], [4, 3], [5, 3], [6, 3]],
            done: [[1, 3], [3, 3]],
            vars: { picks: '3, 1, 2', count: 5 },
            caption: 'b0 is 3, b1 is 1, b2 is 2',
          },
        },
        {
          say: "In code, m runs over every mask. If bit i is on, item i is in. That's O of two to the n, times n.",
          speak: "In code, m runs over every mask. If bit i is on, item i is in. That's oh of two to the n, times n.",
          emphasis: ['every', 'mask'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'countMaxOrSubsets.js',
            code: `function countMaxOrSubsets(nums) {
  const n = nums.length;
  let max = 0;
  for (const x of nums) max = max | x;
  let count = 0;
  for (let m = 1; m < 1 << n; m++) {
    let v = 0;
    for (let i = 0; i < n; i++)
      if ((m >> i) & 1)
        v = v | nums[i];
    if (v === max) count++;
  }
  return count;
}`,
            highlight: [[9, 10]],
            note: { line: 10, text: 'bit i on: item i is in', tone: 'good' },
          },
        },
        {
          say: 'Reach for this when n is twenty or less and you need every subset, or letters must be unique.',
          emphasis: ['twenty', 'subset'],
          scene: {
            type: 'list',
            title: 'Reach for this when…',
            items: [
              { text: 'n is *20* or less', icon: '🔢' },
              { text: 'You need *every subset*', icon: '🧺' },
              { text: 'Letters must be *unique*', icon: '🔤' },
            ],
            active: 1,
          },
        },
        {
          say: 'The trap: in JavaScript, one shifted left by thirty-two is just one. Masks over every subset only work for small n.',
          emphasis: ['one', 'small'],
          sfx: 'error',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'trap.js',
            code: `1 << 30; // 1073741824
1 << 31; // -2147483648
1 << 32; // 1, not 4294967296`,
            errors: [3],
            note: { line: 3, text: 'the shift wraps at 32', tone: 'bad' },
          },
        },
        {
          say: 'Quick check. Pen, cup and hat are bits zero, one and two. What is in mask five?',
          sfx: 'riser',
          scene: {
            type: 'quiz',
            question: 'Pen, cup and hat are bits 0, 1 and 2. What is in mask 5?',
            options: ['pen and cup', 'pen and hat', 'cup and hat', 'only hat'],
            answer: 1,
          },
        },
        {
          say: 'Pen and hat. Five is one zero one, so bits zero and two are on.',
          speak: 'Pen and hat. Five is one, zero, one, so bits zero and two are on.',
          emphasis: ['zero', 'two'],
          sfx: 'ding',
          scene: {
            type: 'quiz',
            question: 'Pen, cup and hat are bits 0, 1 and 2. What is in mask 5?',
            options: ['pen and cup', 'pen and hat', 'cup and hat', 'only hat'],
            answer: 1,
            reveal: true,
            explain: 'Bits 0 and 2 are on: item 0 and item 2.',
          },
        },
        {
          say: 'Remember this. A bitmask is a set: when bit i is on, item i is in. Now tap solve it and try it yourself.',
          emphasis: ['set'],
          sfx: 'success',
          scene: {
            type: 'outro',
            points: ['Bit i on means *item i is in*', 'Count masks to visit *every subset*', 'Use it when *n ≤ 20*'],
            tagline: 'Now go solve it.',
          },
        },
      ],
    },

    // ───────────────────────────── Lesson 5: number tricks (gcd)
    {
      id: 'dsa-bits-math-number-tricks',
      title: 'Number tricks: gcd, primes and modulo',
      link: { label: 'Solve it', href: '/dsa#/m/bits-math/number-tricks/bits-math-find-gcd-of-array' },
      beats: [
        {
          say: 'How big can the squares be, with no chocolate wasted?',
          emphasis: ['big', 'wasted'],
          scene: { type: 'title', kicker: 'Math · Lesson 5', title: 'Cut chocolate, *zero waste*', emoji: '🍫', style: 'slam' },
        },
        {
          say: 'The sheet is forty-eight by eighteen. Squares of six fit perfectly: eight across and three down.',
          emphasis: ['six', 'perfectly'],
          sfx: 'pop',
          scene: {
            type: 'grid',
            title: 'A 48 by 18 sheet',
            cells: [
              [6, 6, 6, 6, 6, 6, 6, 6],
              [6, 6, 6, 6, 6, 6, 6, 6],
              [6, 6, 6, 6, 6, 6, 6, 6],
            ],
            found: [
              [0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [0, 7],
              [1, 0], [1, 1], [1, 2], [1, 3], [1, 4], [1, 5], [1, 6], [1, 7],
              [2, 0], [2, 1], [2, 2], [2, 3], [2, 4], [2, 5], [2, 6], [2, 7],
            ],
            vars: { gcd: 6 },
            caption: 'six is the biggest size that fits both',
          },
        },
        {
          say: 'The easy way tries every size, counting down, until one divides both numbers.',
          emphasis: ['every', 'size'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'pseudo',
            file: 'Brute force',
            code: `function gcd(a, b):
    for d from min(a, b) down to 1:
        if a mod d = 0 and b mod d = 0:
            return d`,
            highlight: [2],
            note: { line: 2, text: 'tries every size', tone: 'warn' },
          },
        },
        {
          say: "For two numbers near a billion, that's almost a billion tries.",
          emphasis: ['billion'],
          sfx: 'error',
          scene: {
            type: 'stat',
            value: '1B',
            label: 'tries for *huge* numbers',
            sub: 'O(min(a, b)) steps',
            tone: 'bad',
          },
        },
        {
          say: 'Cut two eighteens off the forty-eight, and twelve is left. Any square that fits both must fit that twelve too.',
          emphasis: ['twelve'],
          scene: {
            type: 'array',
            title: 'Cut 18s off the 48',
            cells: [18, 18, 12],
            indices: false,
            active: [2],
            vars: { left: 12 },
            caption: 'the leftover keeps the answer',
          },
        },
        {
          say: "That's Euclid's rule. The gcd of a and b equals the gcd of b and the leftover.",
          emphasis: ['leftover'],
          sfx: 'ding',
          scene: { type: 'title', kicker: "Euclid's rule", title: 'Swap in the *leftover*', sub: 'gcd(a, b) = gcd(b, a mod b)', emoji: '💡', style: 'slam' },
        },
        {
          say: 'Forty-eight mod eighteen is twelve. That is the leftover strip.',
          emphasis: ['twelve'],
          scene: {
            type: 'grid',
            title: 'gcd(48, 18)',
            colLabels: ['a', 'b', 'mod'],
            cells: [
              [48, 18, 12],
              ['', '', ''],
              ['', '', ''],
              ['', '', ''],
            ],
            active: [[0, 2]],
            reads: [[0, 0], [0, 1]],
            vars: { pair: '(48, 18)', gcd: '?' },
          },
        },
        {
          say: 'Slide over to eighteen and twelve. Eighteen mod twelve is six.',
          emphasis: ['six'],
          scene: {
            type: 'grid',
            title: 'gcd(48, 18)',
            colLabels: ['a', 'b', 'mod'],
            cells: [
              [48, 18, 12],
              [18, 12, 6],
              ['', '', ''],
              ['', '', ''],
            ],
            active: [[1, 2]],
            reads: [[1, 0], [1, 1]],
            vars: { pair: '(18, 12)', gcd: '?' },
          },
        },
        {
          say: 'Then twelve and six. Twelve mod six is zero, so nothing is left over.',
          emphasis: ['zero'],
          scene: {
            type: 'grid',
            title: 'gcd(48, 18)',
            colLabels: ['a', 'b', 'mod'],
            cells: [
              [48, 18, 12],
              [18, 12, 6],
              [12, 6, 0],
              ['', '', ''],
            ],
            active: [[2, 2]],
            reads: [[2, 0], [2, 1]],
            vars: { pair: '(12, 6)', gcd: '?' },
          },
        },
        {
          say: 'Now b is zero, so we stop. The answer is six, in three steps instead of thirteen.',
          emphasis: ['six', 'three'],
          sfx: 'success',
          scene: {
            type: 'grid',
            title: 'gcd(48, 18)',
            colLabels: ['a', 'b', 'mod'],
            cells: [
              [48, 18, 12],
              [18, 12, 6],
              [12, 6, 0],
              [6, 0, ''],
            ],
            found: [[3, 0]],
            vars: { pair: '(6, 0)', gcd: 6 },
          },
        },
        {
          say: "For the problem, take the smallest and largest numbers, then run Euclid. It's O of log n.",
          speak: "For the problem, take the smallest and largest numbers, then run Euclid. It's oh of log n.",
          emphasis: ['smallest', 'largest'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'findGCD.js',
            code: `function findGCD(nums) {
  let a = Math.min(...nums);
  let b = Math.max(...nums);
  while (b !== 0) [a, b] = [b, a % b];
  return a;
}`,
            highlight: [4],
            note: { line: 4, text: 'shrinks fast: O(log n)', tone: 'good' },
          },
        },
        {
          say: 'Reach for the gcd when things must divide evenly, like the biggest equal pieces, or a simpler fraction.',
          emphasis: ['evenly'],
          scene: {
            type: 'list',
            title: 'Reach for this when…',
            items: [
              { text: 'It must divide *evenly*', icon: '✂️' },
              { text: 'The *biggest* equal pieces', icon: '🍫' },
              { text: 'Simplify a *fraction*', icon: '➗' },
            ],
            active: 0,
          },
        },
        {
          say: 'The trap: the least common multiple is a times b over the gcd. But a times b can get too big, so divide first.',
          emphasis: ['big', 'first'],
          sfx: 'error',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'lcm.js',
            code: `// lcm: least common multiple
lcm = (a * b) / gcd(a, b);
lcm = (a / gcd(a, b)) * b;`,
            errors: [2],
            added: [3],
            note: { line: 3, text: 'divide first to stay small', tone: 'good' },
          },
        },
        {
          say: "Quick check. Using Euclid's rule, what pair comes after thirty-five and fifteen?",
          sfx: 'riser',
          scene: {
            type: 'quiz',
            question: "Euclid's rule: what pair comes after (35, 15)?",
            options: ['(15, 20)', '(15, 5)', '(5, 0)', '(20, 15)'],
            answer: 1,
          },
        },
        {
          say: 'Fifteen and five. Thirty-five mod fifteen leaves five. Then five and zero, so the gcd is five.',
          emphasis: ['five'],
          sfx: 'ding',
          scene: {
            type: 'quiz',
            question: "Euclid's rule: what pair comes after (35, 15)?",
            options: ['(15, 20)', '(15, 5)', '(5, 0)', '(20, 15)'],
            answer: 1,
            reveal: true,
            explain: '35 mod 15 = 5. Next is (5, 0): gcd is 5.',
          },
        },
        {
          say: 'Remember this. Swap in the leftover until it hits zero, and the last size is the gcd. Now tap solve it and try it yourself.',
          emphasis: ['leftover', 'zero'],
          sfx: 'success',
          scene: {
            type: 'outro',
            points: ['gcd(a, b) = *gcd(b, a mod b)*', 'Stop when b is *0*', 'It shrinks fast: *O(log n)*'],
            tagline: 'Now go solve it.',
          },
        },
      ],
    },
  ],
};
