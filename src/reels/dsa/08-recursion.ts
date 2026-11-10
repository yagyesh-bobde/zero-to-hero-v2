import type { Series } from '../types';

// /dsa/reels module 8. One reel per lesson of src/dsa/modules/08-recursion*.ts, in lesson order.
// Brief: src/reels/dsa/README.md. Rules: src/reels/AUTHORING.md.

const fibSeq = [0, 1, 1, 2, 3, 5, 8, 13];
const mergeNums = [5, 2, 4, 7, 1, 3, 2, 6];
const expr = ['2', '×', '3', '−', '4', '×', '5'];
const stickers = [2, 3, 1, 3, 2];

export const series: Series = {
  id: 'dsa-recursion',
  title: 'Recursion & divide and conquer',
  emoji: '🪆',
  color: '#e879f9',
  order: 8,
  blurb: 'Trust the smaller call: recursion, merge sort, quickselect.',
  reels: [
    // ─── Lesson 1: thinking recursively ───────────────────────────────────────────────
    {
      id: 'dsa-recursion-thinking-recursively',
      title: 'Thinking recursively',
      link: { label: 'Solve it', href: '/dsa#/m/recursion/thinking-recursively/recursion-fibonacci' },
      beats: [
        {
          say: 'A folder holds more folders. So how does your computer know its size?',
          emphasis: ['folders', 'size'],
          scene: { type: 'title', kicker: 'Recursion · Lesson 1', title: 'A folder full of *folders*', emoji: '🪆', style: 'slam' },
        },
        {
          say: 'It asks the same question, just smaller. Each Fibonacci number adds the two before it, so fib of five is five.',
          emphasis: ['smaller', 'two'],
          sfx: 'pop',
          scene: {
            type: 'array',
            title: 'Fibonacci numbers',
            cells: fibSeq,
            active: [5],
            reads: [3, 4],
            vars: { 'fib(5)': '2 + 3 = 5' },
            caption: 'each one adds the two before it',
          },
        },
        {
          say: 'First ask: what is the smallest input? Zero and one answer right away. That is the base case, where the calls stop.',
          emphasis: ['base', 'case'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'pseudo',
            file: 'The definition',
            code: `function fib(n):
    if n ≤ 1:
        return n
    return fib(n - 1) + fib(n - 2)`,
            highlight: [[2, 3]],
            note: { line: 3, text: 'base case: the calls stop here', tone: 'warn' },
          },
        },
        {
          say: 'For the rest, pretend the two smaller calls already work. Do not trace every level. Just trust the call.',
          emphasis: ['trust'],
          sfx: 'ding',
          scene: { type: 'title', kicker: 'The insight', title: 'Trust the *smaller* call', emoji: '💡', style: 'slam' },
        },
        {
          say: 'Watch the computer run it. fib of three pauses and calls fib of two, which goes on top.',
          emphasis: ['pauses', 'top'],
          scene: {
            type: 'array',
            title: 'The call stack for fib(3)',
            cells: ['fib(3)', 'fib(2)', ''],
            indices: false,
            pointers: { top: 1 },
            active: [1],
            vars: { depth: 2, returned: '–' },
            caption: 'a pile of paused calls',
          },
        },
        {
          say: 'fib of two calls fib of one. That is a base case, so it returns one and pops off.',
          emphasis: ['returns', 'one'],
          scene: {
            type: 'array',
            title: 'The call stack for fib(3)',
            cells: ['fib(3)', 'fib(2)', 'fib(1)'],
            indices: false,
            pointers: { top: 2 },
            active: [2],
            vars: { depth: 3, returned: 1 },
            caption: 'a pile of paused calls',
          },
        },
        {
          say: 'Next, fib of two calls fib of zero. Another base case, so it returns zero.',
          emphasis: ['zero'],
          scene: {
            type: 'array',
            title: 'The call stack for fib(3)',
            cells: ['fib(3)', 'fib(2)', 'fib(0)'],
            indices: false,
            pointers: { top: 2 },
            active: [2],
            vars: { depth: 3, returned: 0 },
            caption: 'a pile of paused calls',
          },
        },
        {
          say: 'fib of two adds one plus zero, returns one, and leaves. Then fib of three calls fib of one.',
          emphasis: ['leaves'],
          scene: {
            type: 'array',
            title: 'The call stack for fib(3)',
            cells: ['fib(3)', 'fib(1)', ''],
            indices: false,
            pointers: { top: 1 },
            active: [1],
            vars: { depth: 2, returned: 1 },
            caption: 'a pile of paused calls',
          },
        },
        {
          say: 'Both answers are back, so fib of three returns two. The stack was never more than three tall.',
          emphasis: ['two', 'three'],
          sfx: 'success',
          scene: {
            type: 'array',
            title: 'The call stack for fib(3)',
            cells: ['fib(3)', '', ''],
            indices: false,
            pointers: { top: 0 },
            found: [0],
            vars: { depth: 1, returned: 2 },
            caption: 'a pile of paused calls',
          },
        },
        {
          say: 'But every call starts two more. fib of thirty makes almost three million calls, mostly repeats.',
          emphasis: ['three', 'million'],
          sfx: 'error',
          scene: {
            type: 'stat',
            value: '2.7M',
            label: 'calls to work out *fib(30)*',
            sub: 'about 2ⁿ: the same calls, over and over',
            tone: 'bad',
          },
        },
        {
          say: 'The fix is a loop. Walk up from zero and one, keeping just the last two numbers. That is O of n.',
          speak: 'The fix is a loop. Walk up from zero and one, keeping just the last two numbers. That is oh of n.',
          emphasis: ['last', 'two'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'fib.js',
            code: `function fib(n) {
  let a = 0;
  let b = 1;
  for (let i = 1; i <= n; i++) {
    [a, b] = [b, a + b];
  }
  return a;
}`,
            highlight: [5],
            note: { line: 5, text: 'one step up: O(n), no stack', tone: 'good' },
          },
        },
        {
          say: 'Reach for recursion when the input holds a smaller copy of itself, like folders inside folders.',
          emphasis: ['smaller', 'copy'],
          scene: {
            type: 'list',
            title: 'Reach for this when…',
            items: [
              { text: 'The input holds a *smaller copy*', icon: '🪆' },
              { text: 'Easy if handed the smaller answer', icon: '🎁' },
              { text: 'You can name a base case', icon: '🛑' },
            ],
            active: 0,
          },
        },
        {
          say: 'The trap is going too deep. JavaScript has room for about ten thousand waiting calls, so this one overflows.',
          emphasis: ['deep', 'overflows'],
          sfx: 'error',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'trap.js',
            code: `function sum(n) {
  if (n === 0) return 0;
  return n + sum(n - 1);
}
sum(100000); // RangeError`,
            errors: [5],
            note: { line: 5, text: '100,000 frames: stack overflow', tone: 'bad' },
          },
        },
        {
          say: 'Quick check. This function has no base case. What happens when you call f of five?',
          sfx: 'riser',
          scene: {
            type: 'quiz',
            question: 'f(n) returns f(n - 1) + 1, with no base case. What does f(5) do?',
            options: ['Returns 5', 'Returns 6', 'Stack overflow error', 'Returns undefined'],
            answer: 2,
          },
        },
        {
          say: 'It never stops. n keeps going down past zero, until the stack runs out of room.',
          emphasis: ['never', 'stops'],
          sfx: 'ding',
          scene: {
            type: 'quiz',
            question: 'f(n) returns f(n - 1) + 1, with no base case. What does f(5) do?',
            options: ['Returns 5', 'Returns 6', 'Stack overflow error', 'Returns undefined'],
            answer: 2,
            reveal: true,
            explain: 'n goes 5, 4, 3… past 0 and never stops. The stack runs out.',
          },
        },
        {
          say: 'Remember this. Name the base case, shrink the input, and trust the call. Now tap solve it and try it yourself.',
          emphasis: ['base', 'trust'],
          sfx: 'success',
          scene: {
            type: 'outro',
            points: ['Base case, smaller call, *one step*', 'Trust the call, never trace it', 'Too deep? Use a *loop*'],
            tagline: 'Now go solve it.',
          },
        },
      ],
    },

    // ─── Lesson 2: recursion trees, cost & fast power ─────────────────────────────────
    {
      id: 'dsa-recursion-recursion-trees-and-fast-power',
      title: 'Recursion trees, cost & fast power',
      link: { label: 'Solve it', href: '/dsa#/m/recursion/recursion-trees-and-fast-power/recursion-pow' },
      beats: [
        {
          say: 'Fold paper forty-two times, and the stack reaches the Moon.',
          emphasis: ['Moon'],
          scene: { type: 'title', kicker: 'Fast power · Lesson 2', title: 'Fold it 42 times: past the *Moon*', emoji: '📄', style: 'slam' },
        },
        {
          say: 'Recursion can double like that. Draw every call as a node: fib of four makes nine calls, and fib of two is built twice.',
          emphasis: ['double', 'twice'],
          sfx: 'pop',
          scene: {
            type: 'tree',
            title: 'Every call fib(4) makes',
            caption: 'calls double each level: O(2ⁿ)',
            root: {
              id: 'f4',
              label: 'f(4)',
              children: [
                {
                  id: 'f3',
                  label: 'f(3)',
                  children: [
                    { id: 'f3-2', label: 'f(2)', active: true, children: [{ id: 'f3-2-1', label: 'f(1)' }, { id: 'f3-2-0', label: 'f(0)' }] },
                    { id: 'f3-1', label: 'f(1)' },
                  ],
                },
                { id: 'f2', label: 'f(2)', active: true, children: [{ id: 'f2-1', label: 'f(1)' }, { id: 'f2-0', label: 'f(0)' }] },
              ],
            },
          },
        },
        {
          say: 'Now flip it. A power button that multiplies by x, n times, does two billion steps for a big n.',
          emphasis: ['two', 'billion'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'pseudo',
            file: 'Brute force',
            code: `function myPow(x, n):
    result ← 1
    for i from 1 to n:
        result ← result × x
    return result`,
            highlight: [[3, 4]],
            note: { line: 4, text: 'n = 2 billion: 2 billion steps', tone: 'warn' },
          },
        },
        {
          say: 'But x to the ten is just x to the five, squared. So work out the half once, and square it.',
          emphasis: ['half', 'once'],
          sfx: 'ding',
          scene: { type: 'title', kicker: 'The insight', title: 'Square the *half*', emoji: '💡', style: 'slam' },
        },
        {
          say: 'Take three to the fifth. Half of five, rounded down, is two, so make one call on two.',
          emphasis: ['one', 'call'],
          scene: {
            type: 'grid',
            title: 'Fast power: 3⁵',
            rowLabels: ['n', '3ⁿ'],
            cells: [
              [5, '', '', ''],
              ['', '', '', ''],
            ],
            active: [[0, 0]],
            vars: { work: '⌊5 / 2⌋ = 2' },
          },
        },
        {
          say: 'Keep halving: two, one, zero. Zero is the base case, and anything to the zero is one.',
          emphasis: ['halving', 'base'],
          scene: {
            type: 'grid',
            title: 'Fast power: 3⁵',
            rowLabels: ['n', '3ⁿ'],
            cells: [
              [5, 2, 1, 0],
              ['', '', '', 1],
            ],
            active: [[1, 3]],
            vars: { work: '3⁰ = 1' },
          },
        },
        {
          say: 'Now the answers flow back up. For one, square the one. One is odd, so times three. That makes three.',
          emphasis: ['back', 'up'],
          scene: {
            type: 'grid',
            title: 'Fast power: 3⁵',
            rowLabels: ['n', '3ⁿ'],
            cells: [
              [5, 2, 1, 0],
              ['', '', 3, 1],
            ],
            active: [[1, 2]],
            reads: [[1, 3]],
            vars: { work: '1 × 1 × 3' },
          },
        },
        {
          say: 'For two, three squared is nine. Two is even, so there is no extra three.',
          emphasis: ['even'],
          scene: {
            type: 'grid',
            title: 'Fast power: 3⁵',
            rowLabels: ['n', '3ⁿ'],
            cells: [
              [5, 2, 1, 0],
              ['', 9, 3, 1],
            ],
            active: [[1, 1]],
            reads: [[1, 2]],
            vars: { work: '3 × 3' },
          },
        },
        {
          say: 'For five, nine squared is eighty-one. Five is odd, so times three: two hundred forty-three.',
          emphasis: ['odd'],
          sfx: 'success',
          scene: {
            type: 'grid',
            title: 'Fast power: 3⁵',
            rowLabels: ['n', '3ⁿ'],
            cells: [
              [5, 2, 1, 0],
              [243, 9, 3, 1],
            ],
            reads: [[1, 1]],
            found: [[1, 0]],
            vars: { work: '9 × 9 × 3' },
          },
        },
        {
          say: 'In JavaScript, call once, save the half in a variable, and square it. That is O of log n.',
          speak: 'In JavaScript, call once, save the half in a variable, and square it. That is oh of log n.',
          emphasis: ['once'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'myPow.js',
            code: `function myPow(x, n) {
  if (n < 0) return 1 / myPow(x, -n);
  if (n === 0) return 1;
  const h = Math.floor(n / 2);
  const half = myPow(x, h);
  const result = half * half;
  return n % 2 ? result * x : result;
}`,
            highlight: [5],
            note: { line: 5, text: 'one call on n / 2: O(log n)', tone: 'good' },
          },
        },
        {
          say: 'Reach for this when the exponent is huge, or the same step repeats n times.',
          emphasis: ['huge'],
          scene: {
            type: 'list',
            title: 'Reach for this when…',
            items: [
              { text: 'A *huge* power, like n = 10⁹', icon: '🚀' },
              { text: 'The same step done n times', icon: '🔁' },
              { text: 'Two half runs make a full run', icon: '✂️' },
            ],
            active: 0,
          },
        },
        {
          say: 'The trap is writing the call twice. Now the calls double on every level, and the speed is gone.',
          emphasis: ['twice'],
          sfx: 'error',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'trap.js',
            code: `const h = Math.floor(n / 2);
return myPow(x, h) * myPow(x, h);`,
            errors: [2],
            note: { line: 2, text: 'two calls: back to O(n)', tone: 'bad' },
          },
        },
        {
          say: 'Quick check. About how many calls does fast power make for n of one million?',
          sfx: 'riser',
          scene: {
            type: 'quiz',
            question: 'About how many calls does fast power make for n = 1,000,000?',
            options: ['21', '1,000', '500,000', '1,000,000'],
            answer: 0,
          },
        },
        {
          say: 'Just twenty one. A million halves down to one in about twenty steps.',
          emphasis: ['twenty', 'one'],
          sfx: 'ding',
          scene: {
            type: 'quiz',
            question: 'About how many calls does fast power make for n = 1,000,000?',
            options: ['21', '1,000', '500,000', '1,000,000'],
            answer: 0,
            reveal: true,
            explain: 'A million halves to 1 in about 20 steps, plus the base case.',
          },
        },
        {
          say: 'Remember this. Count the calls in the tree, and work out the half only once. Now tap solve it and try it yourself.',
          emphasis: ['calls', 'once'],
          sfx: 'success',
          scene: {
            type: 'outro',
            points: ['Cost = calls × work per call', 'Two calls on n - 1: *O(2ⁿ)*', 'Square the half: *O(log n)*'],
            tagline: 'Now go solve it.',
          },
        },
      ],
    },

    // ─── Lesson 3: merge sort ─────────────────────────────────────────────────────────
    {
      id: 'dsa-recursion-merge-sort',
      title: 'Merge sort: split, trust, merge',
      link: { label: 'Solve it', href: '/dsa#/m/recursion/merge-sort/recursion-sort-array' },
      beats: [
        {
          say: 'How does a librarian sort a thousand cards without really sorting?',
          emphasis: ['without'],
          scene: { type: 'title', kicker: 'Merge sort · Lesson 3', title: 'Sort by *not* sorting', emoji: '🗂️', style: 'slam' },
        },
        {
          say: 'Sort these eight numbers from small to big, with no built-in sort. The real input has fifty thousand.',
          emphasis: ['no', 'built-in'],
          sfx: 'pop',
          scene: {
            type: 'array',
            title: 'Sort these eight',
            cells: mergeNums,
            vars: { goal: 'small to big', n: 8 },
            caption: 'no built-in sort allowed',
          },
        },
        {
          say: 'The easy way scans the rest of the array to find the smallest, then does it again for every slot.',
          emphasis: ['every', 'slot'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'pseudo',
            file: 'Brute force',
            code: `function selectionSort(nums):
    for i from 0 to n - 2:
        best ← i
        for j from i + 1 to n - 1:
            if nums[j] < nums[best]:
                best ← j
        swap nums[i] and nums[best]
    return nums`,
            highlight: [[2, 4]],
            note: { line: 4, text: 'scan the rest, for every slot', tone: 'warn' },
          },
        },
        {
          say: 'That is O of n squared. Fifty thousand numbers means about two and a half billion steps.',
          speak: 'That is oh of n squared. Fifty thousand numbers means about two and a half billion steps.',
          emphasis: ['squared', 'billion'],
          sfx: 'error',
          scene: {
            type: 'stat',
            value: '2.5B',
            label: 'steps for *50,000* numbers',
            sub: 'O(n²): way past a one second limit',
            tone: 'bad',
          },
        },
        {
          say: 'But merging two sorted piles is cheap. Just take the smaller front card each time.',
          emphasis: ['merging', 'cheap'],
          sfx: 'ding',
          scene: { type: 'title', kicker: 'The insight', title: 'Split, trust, *merge*', emoji: '💡', style: 'slam' },
        },
        {
          say: 'Split in half until every piece is one number, already sorted. Then merge back up: five and two become two, five.',
          emphasis: ['split', 'merge'],
          scene: {
            type: 'array',
            title: 'Merge back up',
            cells: [2, 5, 4, 7, 1, 3, 2, 6],
            window: [0, 1],
            active: [0, 1],
            vars: { left: '5', right: '2' },
          },
        },
        {
          say: 'Four and seven are already in order. Merge the two pairs, and the left half is two, four, five, seven.',
          emphasis: ['left', 'half'],
          scene: {
            type: 'array',
            title: 'Merge back up',
            cells: [2, 4, 5, 7, 1, 3, 2, 6],
            window: [0, 3],
            active: [0, 1, 2, 3],
            vars: { left: '2, 5', right: '4, 7' },
          },
        },
        {
          say: 'The right half does the same thing, and comes back as one, two, three, six.',
          emphasis: ['right', 'half'],
          scene: {
            type: 'array',
            title: 'Merge back up',
            cells: [2, 4, 5, 7, 1, 2, 3, 6],
            window: [4, 7],
            active: [4, 5, 6, 7],
            done: [0, 1, 2, 3],
            vars: { left: '1, 3', right: '2, 6' },
          },
        },
        {
          say: 'The last merge. Put a finger on the front of each half. One beats two, so take the one.',
          emphasis: ['finger', 'front'],
          scene: {
            type: 'array',
            title: 'Merge back up',
            cells: [2, 4, 5, 7, 1, 2, 3, 6],
            window: [0, 7],
            pointers: { i: 0, j: 4 },
            active: [4],
            reads: [0],
            vars: { left: '2, 4, 5, 7', right: '1, 2, 3, 6' },
          },
        },
        {
          say: 'Keep taking the smaller front, and the array is sorted. Each merge read its numbers only once.',
          emphasis: ['once'],
          sfx: 'success',
          scene: {
            type: 'array',
            title: 'Merge back up',
            cells: [1, 2, 2, 3, 4, 5, 6, 7],
            window: [0, 7],
            found: [0, 1, 2, 3, 4, 5, 6, 7],
            vars: { left: '2, 4, 5, 7', right: '1, 2, 3, 6' },
          },
        },
        {
          say: 'In code, it is three lines: sort the left, sort the right, merge. Each level does n work, so it is O of n log n.',
          speak: 'In code, it is three lines: sort the left, sort the right, merge. Each level does n work, so it is oh of n log n.',
          emphasis: ['three', 'lines'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'mergeSort.js',
            code: `function sort(lo, hi) {
  if (lo >= hi) return;
  const m = Math.floor((lo + hi) / 2);
  sort(lo, m);
  sort(m + 1, hi);
  merge(lo, m, hi);
}`,
            highlight: [[4, 6]],
            note: { line: 6, text: 'n work × log n levels', tone: 'good' },
          },
        },
        {
          say: 'Reach for merge sort when you cannot use the built-in, or you need to count pairs across two halves.',
          emphasis: ['pairs'],
          scene: {
            type: 'list',
            title: 'Reach for this when…',
            items: [
              { text: 'Sort with no *built-in*', icon: '🚫' },
              { text: 'Count pairs *out of order*', icon: '🔀' },
              { text: 'Merge lists already sorted', icon: '📚' },
            ],
            active: 0,
          },
        },
        {
          say: 'The trap is ties. Take from the left with less than or equal, so equal items keep their order.',
          emphasis: ['ties', 'left'],
          sfx: 'error',
          scene: {
            type: 'compare',
            title: 'On a tie, take from…',
            left: { title: 'left < right', verdict: 'bad', items: ['Ties take the right', 'Equal items swap'] },
            right: { title: 'left <= right', verdict: 'ok', items: ['Ties take the left', 'Order kept: stable'] },
          },
        },
        {
          say: 'Quick check. Merge sort runs on sixteen numbers. How many levels of merging are there?',
          sfx: 'riser',
          scene: {
            type: 'quiz',
            question: 'Merge sort on 16 numbers. How many levels of merging are there?',
            options: ['2', '4', '8', '16'],
            answer: 1,
          },
        },
        {
          say: 'Four. Sixteen halves down to one in four steps, and each level does sixteen work.',
          emphasis: ['Four'],
          sfx: 'ding',
          scene: {
            type: 'quiz',
            question: 'Merge sort on 16 numbers. How many levels of merging are there?',
            options: ['2', '4', '8', '16'],
            answer: 1,
            reveal: true,
            explain: '16, 8, 4, 2, 1: four halvings. Each level does 16 work.',
          },
        },
        {
          say: 'Remember this. Split in half, trust both calls, and do the real work in the merge. Now tap solve it and try it yourself.',
          emphasis: ['trust', 'merge'],
          sfx: 'success',
          scene: {
            type: 'outro',
            points: ['Split, trust both halves, *merge*', 'n work × log n levels', 'Ties take the *left*'],
            tagline: 'Now go solve it.',
          },
        },
      ],
    },

    // ─── Lesson 4: quickselect ────────────────────────────────────────────────────────
    {
      id: 'dsa-recursion-quickselect',
      title: 'Quickselect: find the k-th without sorting',
      link: { label: 'Solve it', href: '/dsa#/m/recursion/quickselect/recursion-kth-largest' },
      beats: [
        {
          say: 'To find the third fastest lap, do you really sort every lap?',
          emphasis: ['every'],
          scene: { type: 'title', kicker: 'Quickselect · Lesson 4', title: 'Find 3rd place, skip the *sort*', emoji: '🏁', style: 'slam' },
        },
        {
          say: 'Find the second largest number here. Six is the largest, so the answer is five.',
          emphasis: ['five'],
          sfx: 'pop',
          scene: {
            type: 'array',
            title: 'The k-th largest',
            cells: [3, 2, 1, 5, 6, 4],
            found: [3],
            vars: { k: 2, answer: 5 },
          },
        },
        {
          say: 'The easy way sorts everything, then reads one slot. That is O of n log n, for just one number.',
          speak: 'The easy way sorts everything, then reads one slot. That is oh of n log n, for just one number.',
          emphasis: ['everything', 'one'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'pseudo',
            file: 'Brute force',
            code: `function findKthLargest(nums, k):
    sort nums from small to big
    return nums[n - k]`,
            highlight: [2],
            note: { line: 2, text: 'orders all n to read one', tone: 'warn' },
          },
        },
        {
          say: 'Instead, pick a pivot. Put smaller values left, bigger ones right, and keep only the side with your answer.',
          emphasis: ['pivot', 'only'],
          sfx: 'ding',
          scene: { type: 'title', kicker: 'The insight', title: 'Partition, keep *one* side', emoji: '💡', style: 'slam' },
        },
        {
          say: 'Seven numbers, so the third largest sits at index four once sorted. Pick the last value, five, as the pivot.',
          emphasis: ['index', 'four', 'pivot'],
          scene: {
            type: 'array',
            title: 'Third largest: index 4',
            cells: [6, 1, 8, 3, 9, 2, 5],
            pointers: { i: 0, j: 0, pivot: 6 },
            active: [6],
            vars: { pivot: 5, target: 4 },
          },
        },
        {
          say: 'Scan with j. Six is bigger than five, so skip it. One is smaller, so swap it to the front.',
          emphasis: ['smaller', 'front'],
          scene: {
            type: 'array',
            title: 'Third largest: index 4',
            cells: [1, 6, 8, 3, 9, 2, 5],
            pointers: { i: 1, j: 1, pivot: 6 },
            active: [0],
            vars: { pivot: 5, target: 4 },
          },
        },
        {
          say: 'Eight and nine are bigger, so skip them. Three and two are smaller, so they swap in next.',
          emphasis: ['three', 'two'],
          scene: {
            type: 'array',
            title: 'Third largest: index 4',
            cells: [1, 3, 2, 6, 9, 8, 5],
            pointers: { i: 3, j: 5, pivot: 6 },
            active: [1, 2],
            vars: { pivot: 5, target: 4 },
          },
        },
        {
          say: 'Now swap the pivot into slot i. Five lands at index three, its final sorted spot.',
          emphasis: ['final'],
          scene: {
            type: 'array',
            title: 'Third largest: index 4',
            cells: [1, 3, 2, 5, 9, 8, 6],
            pointers: { i: 3 },
            active: [3],
            vars: { pivot: 5, target: 4 },
          },
        },
        {
          say: 'We want index four, which is on the right. So throw the whole left side away, for good.',
          emphasis: ['throw', 'away'],
          scene: {
            type: 'array',
            title: 'Third largest: index 4',
            cells: [1, 3, 2, 5, 9, 8, 6],
            pointers: { lo: 4, hi: 6 },
            window: [4, 6],
            done: [0, 1, 2, 3],
            vars: { pivot: 5, target: 4 },
          },
        },
        {
          say: 'Partition those three with pivot six. Nothing is smaller, so six lands at index four. That is the answer.',
          emphasis: ['six', 'answer'],
          sfx: 'success',
          scene: {
            type: 'array',
            title: 'Third largest: index 4',
            cells: [1, 3, 2, 5, 6, 8, 9],
            pointers: { lo: 4, hi: 6 },
            window: [4, 6],
            found: [4],
            done: [0, 1, 2, 3],
            vars: { pivot: 6, target: 4 },
          },
        },
        {
          say: 'In code, keep one side by moving lo or hi. With a random pivot, that is O of n on average.',
          speak: 'In code, keep one side by moving lo or hi. With a random pivot, that is oh of n on average.',
          emphasis: ['random', 'average'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'kthLargest.js',
            code: `function kthLargest(a, k) {
  const target = a.length - k;
  let lo = 0;
  let hi = a.length - 1;
  while (true) {
    randomPivot(a, lo, hi);
    const mid = partition(a, lo, hi);
    if (mid === target) return a[mid];
    if (target < mid) hi = mid - 1;
    else lo = mid + 1;
  }
}`,
            highlight: [[9, 10]],
            note: { line: 10, text: 'keep one side: O(n) on average', tone: 'good' },
          },
        },
        {
          say: 'Reach for this when you need one position, like a median, not the whole sorted order.',
          emphasis: ['one', 'position'],
          scene: {
            type: 'list',
            title: 'Reach for this when…',
            items: [
              { text: 'The k-th largest or *smallest*', icon: '🥉' },
              { text: 'A median or a percentile', icon: '📊' },
              { text: 'One spot, not the full order', icon: '🎯' },
            ],
            active: 0,
          },
        },
        {
          say: 'The trap: partition sorts small to big, so the k-th largest sits at index n minus k, not k.',
          emphasis: ['minus'],
          sfx: 'error',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'trap.js',
            code: `// the k-th largest of n values
return select(a, k);     // wrong
return select(a, n - k); // right`,
            errors: [2],
            added: [3],
            note: { line: 3, text: 'small to big, so count from the end', tone: 'good' },
          },
        },
        {
          say: 'Quick check. You want index two, and the pivot lands at index five. What next?',
          sfx: 'riser',
          scene: {
            type: 'quiz',
            question: 'You want sorted index 2. The pivot lands at index 5. Now what?',
            options: ['Search indexes 0 to 4', 'Search 6 to the end', 'Sort indexes 0 to 4', 'Start over'],
            answer: 0,
          },
        },
        {
          say: 'Search zero to four. Index two is on the left, so the right side is dropped.',
          emphasis: ['dropped'],
          sfx: 'ding',
          scene: {
            type: 'quiz',
            question: 'You want sorted index 2. The pivot lands at index 5. Now what?',
            options: ['Search indexes 0 to 4', 'Search 6 to the end', 'Sort indexes 0 to 4', 'Start over'],
            answer: 0,
            reveal: true,
            explain: 'Everything left of 5 is smaller, and index 2 is there. Drop the right.',
          },
        },
        {
          say: 'Remember this. Partition, then keep only the side that holds your answer. Now tap solve it and try it yourself.',
          emphasis: ['only', 'side'],
          sfx: 'success',
          scene: {
            type: 'outro',
            points: ['Partition puts the pivot *in place*', 'Keep only the side you need', 'k-th largest is index *n - k*'],
            tagline: 'Now go solve it.',
          },
        },
      ],
    },

    // ─── Lesson 5: divide and conquer beyond sorting ──────────────────────────────────
    {
      id: 'dsa-recursion-divide-and-conquer',
      title: 'Divide and conquer beyond sorting',
      link: { label: 'Solve it', href: '/dsa#/m/recursion/divide-and-conquer/recursion-add-parentheses' },
      beats: [
        {
          say: 'Two times three minus four times five. Two calculators give two answers.',
          emphasis: ['two', 'answers'],
          scene: { type: 'title', kicker: 'Splitting · Lesson 5', title: 'Same keys, *different* answers', emoji: '🧮', style: 'slam' },
        },
        {
          say: 'A cheap calculator gets ten. A spreadsheet gets minus fourteen. Your job: list every answer the brackets allow.',
          emphasis: ['every', 'answer'],
          sfx: 'pop',
          scene: {
            type: 'compare',
            title: 'Where do the brackets go?',
            left: { title: 'Calculator', verdict: 'neutral', items: ['((2×3)−4)×5', 'One at a time', 'gives 10'] },
            right: { title: 'Spreadsheet', verdict: 'neutral', items: ['(2×3)−(4×5)', 'Times first', 'gives −14'] },
          },
        },
        {
          say: 'The easy way tries every order of the operators. But many orders build the same brackets again.',
          emphasis: ['same', 'again'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'pseudo',
            file: 'Brute force',
            code: `function waysBrute(expr):
    results ← empty list
    for each order of the operators:
        apply them in that order
        if the brackets are new:
            add the value to results
    return results`,
            highlight: [3],
            note: { line: 3, text: 'k! orders, most are repeats', tone: 'warn' },
          },
        },
        {
          say: 'With nine operators, that is three hundred sixty thousand orders, for fewer than five thousand answers.',
          emphasis: ['fewer'],
          sfx: 'error',
          scene: {
            type: 'stat',
            value: '362K',
            label: 'orders for just *4,862* answers',
            sub: 'nine operators: k! is mostly repeats',
            tone: 'bad',
          },
        },
        {
          say: 'Every placement has one operator that runs last. Its left and right sides never affect each other.',
          emphasis: ['last'],
          sfx: 'ding',
          scene: { type: 'title', kicker: 'The insight', title: 'Pick the op that runs *last*', emoji: '💡', style: 'slam' },
        },
        {
          say: 'So try each operator as the last step, and trust the calls to solve each side on its own.',
          emphasis: ['each', 'trust'],
          scene: {
            type: 'array',
            title: 'Split at each operator',
            cells: expr,
            vars: { left: '?', right: '?' },
            caption: 'any operator can be the last one',
          },
        },
        {
          say: 'First times goes last. The left gives two. Trust the call: the right gives minus seventeen or minus five.',
          emphasis: ['trust'],
          scene: {
            type: 'array',
            title: 'Split at each operator',
            cells: expr,
            pointers: { op: 1 },
            active: [1],
            reads: [0, 2, 3, 4, 5, 6],
            vars: { left: '2', right: '−17, −5' },
            caption: 'pair them up: −34 and −10',
          },
        },
        {
          say: 'Now the minus goes last. Six minus twenty gives minus fourteen.',
          emphasis: ['fourteen'],
          scene: {
            type: 'array',
            title: 'Split at each operator',
            cells: expr,
            pointers: { op: 3 },
            active: [3],
            reads: [0, 1, 2, 4, 5, 6],
            vars: { left: '6', right: '20' },
            caption: 'pair them up: −14',
          },
        },
        {
          say: 'Then the last times goes last. The left gives minus two or two. Times five, that is minus ten and ten.',
          emphasis: ['ten'],
          scene: {
            type: 'array',
            title: 'Split at each operator',
            cells: expr,
            pointers: { op: 5 },
            active: [5],
            reads: [0, 1, 2, 3, 4, 6],
            vars: { left: '−2, 2', right: '5' },
            caption: 'pair them up: −10 and 10',
          },
        },
        {
          say: 'Five placements, five answers, and each one was built exactly once.',
          emphasis: ['once'],
          sfx: 'success',
          scene: {
            type: 'array',
            title: 'Split at each operator',
            cells: expr,
            found: [0, 1, 2, 3, 4, 5, 6],
            vars: { splits: 3, answers: 5 },
            caption: 'all: −34, −10, −14, −10, 10',
          },
        },
        {
          say: 'In code, for each operator, call ways on the left and on the right, then pair every result.',
          emphasis: ['pair', 'every'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'ways.js',
            code: `function ways(s) {
  const out = [];
  for (let i = 0; i < s.length; i++) {
    const op = s[i];
    if (!'+-*'.includes(op)) continue;
    const L = ways(s.slice(0, i));
    const R = ways(s.slice(i + 1));
    for (const a of L)
      for (const b of R)
        out.push(calc(a, op, b));
  }
  if (out.length) return out;
  return [Number(s)]; // just a number
}`,
            highlight: [[6, 7]],
            note: { line: 7, text: 'trust both sides', tone: 'good' },
          },
        },
        {
          say: 'Reach for this when the answer depends on where you cut, and the two sides never touch.',
          emphasis: ['cut'],
          scene: {
            type: 'list',
            title: 'Reach for this when…',
            items: [
              { text: 'The answer depends on *the cut*', icon: '✂️' },
              { text: 'The sides never affect each other', icon: '🧱' },
              { text: 'Pair every left with every right', icon: '🤝' },
            ],
            active: 0,
          },
        },
        {
          say: 'The trap: with no operator, return the whole string as a number. Reading only the first digit breaks eleven.',
          emphasis: ['whole', 'string'],
          sfx: 'error',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'trap.js',
            code: `// "11" has no operator
return [Number(s[0])]; // 1
return [Number(s)];    // 11`,
            errors: [2],
            added: [3],
            note: { line: 3, text: 'the whole string is the number', tone: 'good' },
          },
        },
        {
          say: 'Quick check. How many values does ways of one plus two plus three return?',
          sfx: 'riser',
          scene: {
            type: 'quiz',
            question: 'How many values does ways("1+2+3") return?',
            options: ['1', '2', '3', '6'],
            answer: 1,
          },
        },
        {
          say: 'Two. There are two placements. Both give six, and you keep one value per placement.',
          emphasis: ['Two'],
          sfx: 'ding',
          scene: {
            type: 'quiz',
            question: 'How many values does ways("1+2+3") return?',
            options: ['1', '2', '3', '6'],
            answer: 1,
            reveal: true,
            explain: '(1+2)+3 and 1+(2+3): both give 6, and both are kept.',
          },
        },
        {
          say: 'Remember this. Split where the parts never touch, trust the calls, then combine. Now tap solve it and try it yourself.',
          emphasis: ['trust', 'combine'],
          sfx: 'success',
          scene: {
            type: 'outro',
            points: ['Pick the op that runs *last*', 'Trust the calls on each side', 'Pair every left with every *right*'],
            tagline: 'Now go solve it.',
          },
        },
      ],
    },

    // ─── Lesson 6: the sorting toolkit ────────────────────────────────────────────────
    {
      id: 'dsa-recursion-sorting-toolkit',
      title: 'The sorting toolkit: comparators, stability, counting sort',
      link: { label: 'Solve it', href: '/dsa#/m/recursion/sorting-toolkit/recursion-sort-by-frequency' },
      beats: [
        {
          say: 'A shop sorted its prices, and the most expensive came first. Why?',
          emphasis: ['expensive', 'first'],
          scene: { type: 'title', kicker: 'Sorting · Lesson 6', title: 'Sorted prices, *wrong* order', emoji: '🛒', style: 'slam' },
        },
        {
          say: 'With no rule, sort compares numbers as text. Pass a comparator, a minus b, and it sorts small to big.',
          emphasis: ['text', 'comparator'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'sort.js',
            code: `[100, 25, 3].sort();
// [100, 25, 3]: compared as text

[100, 25, 3].sort((a, b) => a - b);
// [3, 25, 100]`,
            errors: [[1, 2]],
            added: [[4, 5]],
            note: { line: 5, text: 'negative means a goes first', tone: 'good' },
          },
        },
        {
          say: 'Now sort stickers rarest first. If two tie, the bigger number goes first. Here that is one, three, three, two, two.',
          emphasis: ['rarest', 'bigger'],
          sfx: 'pop',
          scene: {
            type: 'array',
            title: 'Rarest stickers first',
            cells: stickers,
            vars: { answer: '1, 3, 3, 2, 2' },
            caption: 'a tie? the bigger number first',
          },
        },
        {
          say: 'The easy way counts inside the comparator. But sort asks about n log n pairs, and each count walks the whole array.',
          emphasis: ['inside', 'whole'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'pseudo',
            file: 'Brute force',
            code: `sort nums by (a, b):
    countA ← times a appears in nums
    countB ← times b appears in nums
    if countA ≠ countB:
        return countA - countB
    return b - a`,
            highlight: [[2, 3]],
            note: { line: 3, text: 'walks all n, every compare', tone: 'warn' },
          },
        },
        {
          say: 'But the count of two never changes. So count every value once, into a map, before you sort.',
          emphasis: ['once'],
          sfx: 'ding',
          scene: { type: 'title', kicker: 'The insight', title: 'Count *once*, then compare', emoji: '💡', style: 'slam' },
        },
        {
          say: 'One pass. The first value is two, so the count of two becomes one.',
          emphasis: ['one', 'pass'],
          scene: {
            type: 'array',
            title: 'Count once, then sort',
            cells: stickers,
            pointers: { x: 0 },
            active: [0],
            vars: { 'count(1)': 0, 'count(2)': 1, 'count(3)': 0 },
          },
        },
        {
          say: 'After all five, one shows up once, while two and three show up twice each.',
          emphasis: ['once', 'twice'],
          scene: {
            type: 'array',
            title: 'Count once, then sort',
            cells: stickers,
            pointers: { x: 4 },
            active: [4],
            done: [0, 1, 2, 3],
            vars: { 'count(1)': 1, 'count(2)': 2, 'count(3)': 2 },
          },
        },
        {
          say: 'Now sort. Two against one: one is rarer, so one goes first.',
          emphasis: ['rarer'],
          scene: {
            type: 'array',
            title: 'Count once, then sort',
            cells: stickers,
            pointers: { a: 0, b: 2 },
            active: [2],
            reads: [0],
            vars: { 'count(1)': 1, 'count(2)': 2, 'count(3)': 2 },
          },
        },
        {
          say: 'Three against two is a tie, both twice. So the bigger number, three, goes first.',
          emphasis: ['tie', 'bigger'],
          scene: {
            type: 'array',
            title: 'Count once, then sort',
            cells: stickers,
            pointers: { a: 1, b: 0 },
            active: [1],
            reads: [0],
            vars: { 'count(1)': 1, 'count(2)': 2, 'count(3)': 2 },
          },
        },
        {
          say: 'Each compare is just two lookups. Rarest first, ties by size: one, three, three, two, two.',
          emphasis: ['lookups'],
          sfx: 'success',
          scene: {
            type: 'array',
            title: 'Count once, then sort',
            cells: [1, 3, 3, 2, 2],
            found: [0, 1, 2, 3, 4],
            vars: { 'count(1)': 1, 'count(2)': 2, 'count(3)': 2 },
          },
        },
        {
          say: 'In JavaScript, count into a map, then compare the counts. A tie gives zero, so the second rule kicks in.',
          emphasis: ['tie', 'zero'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'frequencySort.js',
            code: `function frequencySort(nums) {
  const cnt = new Map();
  for (const x of nums)
    cnt.set(x, (cnt.get(x) ?? 0) + 1);
  return [...nums].sort((a, b) =>
    cnt.get(a) - cnt.get(b) || b - a
  );
}`,
            highlight: [6],
            note: { line: 6, text: 'O(1) per compare: O(n log n)', tone: 'good' },
          },
        },
        {
          say: 'Reach for this when the order is not just small to big, or ties need a second rule.',
          emphasis: ['second', 'rule'],
          scene: {
            type: 'list',
            title: 'Reach for this when…',
            items: [
              { text: 'Order is not plain *small to big*', icon: '↕️' },
              { text: 'Ties need a second rule', icon: '⚖️' },
              { text: 'The key is slow to compute', icon: '🐢' },
            ],
            active: 0,
          },
        },
        {
          say: 'The trap: a comparator that returns true or false. It never says negative, so nothing gets sorted.',
          emphasis: ['true', 'false'],
          sfx: 'error',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'trap.js',
            code: `[3, 1, 2].sort((a, b) => a > b);
// [3, 1, 2]: not sorted!`,
            errors: [[1, 2]],
            note: { line: 2, text: 'true or false is never negative', tone: 'bad' },
          },
        },
        {
          say: 'Quick check. Your comparator returns five for a and b. Who goes first?',
          sfx: 'riser',
          scene: {
            type: 'quiz',
            question: 'Your comparator returns 5 for the pair (a, b). What happens?',
            options: ['a goes first', 'b goes first', 'They keep their order', 'a moves 5 places'],
            answer: 1,
          },
        },
        {
          say: 'B goes first. Only the sign matters: negative means a, positive means b, and zero keeps the order.',
          emphasis: ['sign'],
          sfx: 'ding',
          scene: {
            type: 'quiz',
            question: 'Your comparator returns 5 for the pair (a, b). What happens?',
            options: ['a goes first', 'b goes first', 'They keep their order', 'a moves 5 places'],
            answer: 1,
            reveal: true,
            explain: 'Only the sign counts. Negative: a first. Positive: b first. 0: keep.',
          },
        },
        {
          say: 'Remember this. Always pass a comparator, and work out slow keys once. Now tap solve it and try it yourself.',
          emphasis: ['comparator', 'once'],
          sfx: 'success',
          scene: {
            type: 'outro',
            points: ['Numbers need a *comparator*', 'Count keys once, then sort', 'A tie? Use a *second rule*'],
            tagline: 'Now go solve it.',
          },
        },
      ],
    },
  ],
};
