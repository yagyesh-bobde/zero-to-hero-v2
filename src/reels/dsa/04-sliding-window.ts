import type { Series } from '../types';

// /dsa/reels module 4. One reel per lesson of src/dsa/modules/04-sliding-window*.ts, in lesson order.
// Brief: src/reels/dsa/README.md. Rules: src/reels/AUTHORING.md.

const subs = [1, 12, -5, -6, 50, 3];
const runs = [2, 3, 1, 2, 4, 3];
const dna = ['G', 'A', 'G', 'T', 'C', 'A', 'G'];
const text = ['C', 'O', 'D', 'E', 'B', 'A', 'N', 'C'];
const hits = [10, 5, 2, 6];

const fixedRun = 'Sliding a window of 4';
const growRun = 'Shortest stretch, sum ≥ 7';
const mapRun = 'Any order of CAT';
const coverRun = 'Cover A, B and C';
const countRun = 'Products below 100';

export const series: Series = {
  id: 'dsa-sliding-window',
  title: 'Sliding window',
  emoji: '🪟',
  color: '#22d3ee',
  order: 4,
  blurb: 'Grow and shrink a window to answer every subarray question in one pass.',
  reels: [
    // ─── Lesson 1: fixed-size windows ───────────────────────────────────────
    {
      id: 'dsa-sliding-window-fixed-window',
      title: 'Fixed-size windows',
      link: { label: 'Solve it', href: '/dsa#/m/sliding-window/fixed-window/sliding-window-max-average-subarray' },
      beats: [
        {
          say: 'Which four days in a row won you the most new subscribers?',
          emphasis: ['four', 'days'],
          scene: { type: 'title', kicker: 'Sliding window · Lesson 1', title: 'The best *4-day* stretch', emoji: '📺', style: 'slam' },
        },
        {
          say: 'Here are six days of sign-ups minus cancels. The best four in a row add up to fifty-one.',
          emphasis: ['fifty-one'],
          sfx: 'pop',
          scene: {
            type: 'array',
            title: 'New subscribers per day',
            cells: subs,
            window: [1, 4],
            found: [1, 2, 3, 4],
            vars: { k: 4, best: 51 },
            caption: 'best average: 51 / 4 = 12.75',
          },
        },
        {
          say: 'The easy way adds up every window from scratch. That is k additions, again and again.',
          emphasis: ['scratch'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'pseudo',
            file: 'Brute force',
            code: `function maxAverage(nums, k):
    best ← -infinity
    for start from 0 to n - k:
        sum ← 0
        for i from start to start + k - 1:
            sum ← sum + nums[i]
        best ← max(best, sum)
    return best / k`,
            highlight: [[5, 6]],
            note: { line: 6, text: 'k adds for every window', tone: 'warn' },
          },
        },
        {
          say: 'That is O of n times k. A hundred thousand days in windows of fifty thousand is billions of adds.',
          speak: 'That is oh of n times k. A hundred thousand days in windows of fifty thousand is billions of adds.',
          emphasis: ['billions'],
          sfx: 'error',
          scene: {
            type: 'stat',
            value: '2.5B',
            label: 'adds for *100,000* days',
            sub: 'O(n·k) with k = 50,000',
            tone: 'bad',
          },
        },
        {
          say: 'Two neighbor windows share three numbers. Only one number left, and one came in.',
          emphasis: ['share'],
          scene: {
            type: 'array',
            title: 'Spot the waste',
            cells: subs,
            window: [1, 4],
            active: [4],
            reads: [1, 2, 3],
            done: [0],
            caption: 'only 1 left and 50 came in',
          },
        },
        {
          say: 'So never rebuild. Add the number coming in, and subtract the one going out.',
          emphasis: ['coming', 'going'],
          sfx: 'ding',
          scene: { type: 'title', kicker: 'The insight', title: 'Slide, don’t *rebuild*', emoji: '💡', style: 'slam' },
        },
        {
          say: 'Build the first window once, the slow way. One plus twelve, minus five, minus six is two.',
          emphasis: ['once'],
          scene: {
            type: 'array',
            title: fixedRun,
            cells: subs,
            pointers: { L: 0, R: 3 },
            window: [0, 3],
            active: [0, 1, 2, 3],
            vars: { sum: 2, best: 2 },
          },
        },
        {
          say: 'Slide. Fifty comes in and one goes out. Two plus fifty minus one is fifty-one, a new best.',
          emphasis: ['fifty-one'],
          scene: {
            type: 'array',
            title: fixedRun,
            cells: subs,
            pointers: { L: 1, R: 4 },
            window: [1, 4],
            active: [4],
            done: [0],
            vars: { sum: 51, best: 51 },
          },
        },
        {
          say: 'Slide again. Three comes in and twelve goes out. That makes forty-two, so the best stays.',
          emphasis: ['stays'],
          scene: {
            type: 'array',
            title: fixedRun,
            cells: subs,
            pointers: { L: 2, R: 5 },
            window: [2, 5],
            active: [5],
            done: [0, 1],
            vars: { sum: 42, best: 51 },
          },
        },
        {
          say: 'R hit the end. Divide the best sum by four just once, and you get twelve point seven five.',
          emphasis: ['once'],
          sfx: 'success',
          scene: {
            type: 'array',
            title: fixedRun,
            cells: subs,
            found: [1, 2, 3, 4],
            vars: { sum: 42, best: 51 },
            caption: 'answer: 51 / 4 = 12.75',
          },
        },
        {
          say: 'In JavaScript, each step is one add and one subtract. That is O of n, however big k gets.',
          speak: 'In JavaScript, each step is one add and one subtract. That is oh of n, however big k gets.',
          emphasis: ['add', 'subtract'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'maxAverage.js',
            code: `function maxAverage(nums, k) {
  const n = nums.length;
  let sum = 0;
  for (let i = 0; i < k; i++) {
    sum += nums[i];
  }
  let best = sum;
  for (let r = k; r < n; r++) {
    sum += nums[r];     // in
    sum -= nums[r - k]; // out
    best = Math.max(best, sum);
  }
  return best / k;
}`,
            highlight: [[9, 10]],
            note: { line: 10, text: 'O(n), no matter how big k is', tone: 'good' },
          },
        },
        {
          say: 'The trap is starting best at zero. If every number is negative, zero beats every real window.',
          emphasis: ['zero', 'negative'],
          sfx: 'error',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'trap.js',
            code: `// nums: all negative
let best = 0;   // too high!
let best = sum; // a real one`,
            errors: [2],
            added: [3],
            note: { line: 3, text: 'start from a real window', tone: 'good' },
          },
        },
        {
          say: 'Quick check. A window of size k just took in the item at right. Which one leaves?',
          emphasis: ['leaves'],
          sfx: 'riser',
          scene: {
            type: 'quiz',
            question: 'A window of size k just took in nums[right]. Which item leaves?',
            options: ['nums[right - k + 1]', 'nums[right - k]', 'nums[right - 1]', 'nums[k]'],
            answer: 1,
          },
        },
        {
          say: 'It is right minus k. The window now starts one past it, so that item just fell off.',
          emphasis: ['minus'],
          sfx: 'ding',
          scene: {
            type: 'quiz',
            question: 'A window of size k just took in nums[right]. Which item leaves?',
            options: ['nums[right - k + 1]', 'nums[right - k]', 'nums[right - 1]', 'nums[k]'],
            answer: 1,
            reveal: true,
            explain: 'The window is right - k + 1 to right, so right - k just fell off.',
          },
        },
        {
          say: 'Remember this. Slide the window, never rebuild it. Now tap solve it and find the best stretch yourself.',
          emphasis: ['slide', 'never'],
          sfx: 'success',
          scene: {
            type: 'outro',
            points: ['Update the window, never *rebuild*', 'Add what enters, drop what leaves', 'Start best from the *first window*'],
            tagline: 'Now go solve it.',
          },
        },
      ],
    },

    // ─── Lesson 2: variable windows ─────────────────────────────────────────
    {
      id: 'dsa-sliding-window-variable-window',
      title: 'Variable windows: grow and shrink',
      link: { label: 'Solve it', href: '/dsa#/m/sliding-window/variable-window/sliding-window-min-size-subarray-sum' },
      beats: [
        {
          say: 'You ran twelve K. How does your app find your fastest five?',
          speak: 'You ran twelve kay. How does your app find your fastest five?',
          emphasis: ['fastest'],
          scene: { type: 'title', kicker: 'Sliding window · Lesson 2', title: 'Your *fastest* 5 km', emoji: '🏃', style: 'slam' },
        },
        {
          say: 'Each number is how far you ran that minute. The shortest stretch reaching seven is two minutes: four plus three.',
          emphasis: ['shortest', 'two'],
          sfx: 'pop',
          scene: {
            type: 'array',
            title: 'Distance each minute',
            cells: runs,
            window: [4, 5],
            found: [4, 5],
            vars: { target: 7, best: 2 },
            caption: 'shortest run with a sum of at least 7',
          },
        },
        {
          say: 'The easy way tries every start, then walks the end forward again. Every single time.',
          emphasis: ['again'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'pseudo',
            file: 'Brute force',
            code: `function minLen(target, nums):
    best ← infinity
    for i from 0 to n - 1:
        sum ← 0
        for j from i to n - 1:
            sum ← sum + nums[j]
            if sum ≥ target:
                best ← min(best, j - i + 1)
                stop
    return best`,
            highlight: [[3, 5]],
            note: { line: 5, text: 'the end starts over each time', tone: 'warn' },
          },
        },
        {
          say: 'That is O of n squared. A hundred thousand minutes means about five billion steps.',
          speak: 'That is oh of n squared. A hundred thousand minutes means about five billion steps.',
          emphasis: ['squared', 'billion'],
          sfx: 'error',
          scene: {
            type: 'stat',
            value: '5B',
            label: 'steps for *100,000* minutes',
            sub: 'O(n²): the end keeps going back',
            tone: 'bad',
          },
        },
        {
          say: 'Start zero already summed to eight. Start one adds it all again, but eight minus two is just six.',
          emphasis: ['six'],
          scene: {
            type: 'array',
            title: 'Spot the waste',
            cells: runs,
            window: [1, 3],
            reads: [1, 2, 3],
            done: [0],
            vars: { before: 8, now: '8 − 2 = 6' },
          },
        },
        {
          say: 'So grow the right edge until it works, then shrink the left while it still works.',
          emphasis: ['grow', 'shrink'],
          sfx: 'ding',
          scene: { type: 'title', kicker: 'The insight', title: 'Grow right, *shrink* left', emoji: '💡', style: 'slam' },
        },
        {
          say: 'Grow: two, three, one, two. Eight works, so the best is four long. Now shrink.',
          emphasis: ['works'],
          scene: {
            type: 'array',
            title: growRun,
            cells: runs,
            pointers: { L: 0, R: 3 },
            window: [0, 3],
            active: [3],
            vars: { sum: 8, best: 4 },
          },
        },
        {
          say: 'Drop the first two, and six is too small. So grow: add four to make ten.',
          emphasis: ['drop', 'grow'],
          scene: {
            type: 'array',
            title: growRun,
            cells: runs,
            pointers: { L: 1, R: 4 },
            window: [1, 4],
            active: [4],
            done: [0],
            vars: { sum: 10, best: 4 },
          },
        },
        {
          say: 'Shrink. Drop the three, and seven still works. Three long is a new best.',
          emphasis: ['new', 'best'],
          scene: {
            type: 'array',
            title: growRun,
            cells: runs,
            pointers: { L: 2, R: 4 },
            window: [2, 4],
            active: [2, 3, 4],
            done: [0, 1],
            vars: { sum: 7, best: 3 },
          },
        },
        {
          say: 'Drop the one, and it breaks. Grow to the last three, and nine works again.',
          emphasis: ['breaks', 'again'],
          scene: {
            type: 'array',
            title: growRun,
            cells: runs,
            pointers: { L: 3, R: 5 },
            window: [3, 5],
            active: [5],
            done: [0, 1, 2],
            vars: { sum: 9, best: 3 },
          },
        },
        {
          say: 'Drop the two. Seven in just two minutes. Neither edge ever moved back.',
          emphasis: ['two', 'back'],
          sfx: 'success',
          scene: {
            type: 'array',
            title: growRun,
            cells: runs,
            pointers: { L: 4, R: 5 },
            window: [4, 5],
            found: [4, 5],
            done: [0, 1, 2, 3],
            vars: { sum: 7, best: 2 },
          },
        },
        {
          say: 'In JavaScript it is a while inside a for. But left only moves right, so it is still O of n.',
          speak: 'In JavaScript it is a while inside a for. But left only moves right, so it is still oh of n.',
          emphasis: ['only', 'right'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'minLen.js',
            code: `function minLen(target, nums) {
  const n = nums.length;
  let l = 0, sum = 0, ans = Infinity;
  for (let r = 0; r < n; r++) {
    sum += nums[r];       // grow
    while (sum >= target) {
      ans = Math.min(ans, r - l + 1);
      sum -= nums[l++];   // shrink
    }
  }
  return ans === Infinity ? 0 : ans;
}`,
            highlight: [[6, 8]],
            note: { line: 8, text: 'l only moves right: O(n)', tone: 'good' },
          },
        },
        {
          say: 'The trap is negative numbers. Dropping one can make the sum bigger, so use prefix sums instead.',
          emphasis: ['negative', 'prefix'],
          sfx: 'error',
          scene: {
            type: 'compare',
            title: 'Negatives break it',
            left: { title: 'Window', verdict: 'bad', items: ['A drop can grow the sum', 'No clear move'] },
            right: { title: 'Prefix sums', verdict: 'ok', items: ['Negatives are fine', 'From module 2'] },
          },
        },
        {
          say: 'Quick check. There is a while inside a for. Why is it still O of n?',
          speak: 'Quick check. There is a while inside a for. Why is it still oh of n?',
          sfx: 'riser',
          scene: {
            type: 'quiz',
            question: 'A while inside a for. Why is it still O(n)?',
            options: ['The while runs once per round', 'left only ever moves right', 'The numbers are sorted', 'It is really O(n log n)'],
            answer: 1,
          },
        },
        {
          say: 'Left only moves right. Over the whole run, the inner loop takes at most n steps in total.',
          emphasis: ['total'],
          sfx: 'ding',
          scene: {
            type: 'quiz',
            question: 'A while inside a for. Why is it still O(n)?',
            options: ['The while runs once per round', 'left only ever moves right', 'The numbers are sorted', 'It is really O(n log n)'],
            answer: 1,
            reveal: true,
            explain: 'left moves at most n times in the whole run, not per round.',
          },
        },
        {
          say: 'Remember this. Grow the right, shrink the left, and never move back. Now tap solve it and try it yourself.',
          emphasis: ['grow', 'shrink'],
          sfx: 'success',
          scene: {
            type: 'outro',
            points: ['Grow right, *shrink* left', 'Both edges only move forward', 'Negatives? Use *prefix sums*'],
            tagline: 'Now go solve it.',
          },
        },
      ],
    },

    // ─── Lesson 3: windows with a frequency map ─────────────────────────────
    {
      id: 'dsa-sliding-window-window-frequency-map',
      title: 'Windows with a frequency map',
      link: { label: 'Solve it', href: '/dsa#/m/sliding-window/window-frequency-map/sliding-window-permutation-in-string' },
      beats: [
        {
          say: 'A DNA marker can show up scrambled. How do you find it fast?',
          emphasis: ['scrambled'],
          scene: { type: 'title', kicker: 'Sliding window · Lesson 3', title: 'Find *CAT* in any order', emoji: '🧬', style: 'slam' },
        },
        {
          say: 'Look for cat in this strand, in any order. T, C, A starts at index three, and that counts.',
          speak: 'Look for cat in this strand, in any order. T, C, A starts at index three, and that counts.',
          emphasis: ['any', 'order'],
          sfx: 'pop',
          scene: {
            type: 'array',
            title: 'A strand of DNA',
            cells: dna,
            window: [3, 5],
            found: [3, 4, 5],
            vars: { pattern: 'CAT' },
            caption: 'TCA has one C, one A and one T',
          },
        },
        {
          say: 'The easy way sorts every window and compares it to the sorted pattern. That is slow, O of n times m log m.',
          speak: 'The easy way sorts every window and compares it to the sorted pattern. That is slow, oh of n times m log m.',
          emphasis: ['sorts', 'every'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'pseudo',
            file: 'Brute force',
            code: `function checkInclusion(p, s):
    key ← sort the letters of p
    m ← length of p
    for start from 0 to n - m:
        window ← s from start, length m
        if sort(window) = key:
            return true
    return false`,
            highlight: [[5, 6]],
            note: { line: 6, text: 'sorts every window again', tone: 'warn' },
          },
        },
        {
          say: 'Neighbor windows share two of their three letters. Counting them again is the same waste as lesson one.',
          emphasis: ['share'],
          scene: {
            type: 'array',
            title: 'Spot the waste',
            cells: dna,
            window: [2, 4],
            active: [4],
            reads: [2, 3],
            done: [1],
            caption: 'one letter in, one out, two shared',
          },
        },
        {
          say: 'So keep a count of each letter you still need, plus one number: how many are missing.',
          emphasis: ['need', 'missing'],
          sfx: 'ding',
          scene: { type: 'title', kicker: 'The insight', title: 'Count what’s *missing*', emoji: '💡', style: 'slam' },
        },
        {
          say: 'Count the pattern first. You need one C, one A and one T, so three are missing.',
          emphasis: ['three'],
          scene: {
            type: 'array',
            title: mapRun,
            cells: dna,
            vars: { need: 'C:1 A:1 T:1', missing: 3 },
            caption: 'nothing in the window yet',
          },
        },
        {
          say: 'The first window is G, A, G. Only the A helps, so missing drops to two.',
          emphasis: ['two'],
          scene: {
            type: 'array',
            title: mapRun,
            cells: dna,
            pointers: { L: 0, R: 2 },
            window: [0, 2],
            active: [1],
            vars: { need: 'C:1 A:0 T:1', missing: 2 },
          },
        },
        {
          say: 'T comes in and it is needed, so missing is one. A G goes out, but it was extra.',
          emphasis: ['needed', 'extra'],
          scene: {
            type: 'array',
            title: mapRun,
            cells: dna,
            pointers: { L: 1, R: 3 },
            window: [1, 3],
            active: [3],
            done: [0],
            vars: { need: 'C:1 A:0 T:0', missing: 1 },
          },
        },
        {
          say: 'C comes in, but the A goes out. We need an A again, so missing stays at one.',
          emphasis: ['again'],
          scene: {
            type: 'array',
            title: mapRun,
            cells: dna,
            pointers: { L: 2, R: 4 },
            window: [2, 4],
            active: [4],
            done: [0, 1],
            vars: { need: 'C:0 A:1 T:0', missing: 1 },
          },
        },
        {
          say: 'A comes in, and missing hits zero. T, C, A is a match, so return true.',
          emphasis: ['zero', 'match'],
          sfx: 'success',
          scene: {
            type: 'array',
            title: mapRun,
            cells: dna,
            pointers: { L: 3, R: 5 },
            window: [3, 5],
            found: [3, 4, 5],
            done: [0, 1, 2],
            vars: { need: 'C:0 A:0 T:0', missing: 0 },
          },
        },
        {
          say: 'In JavaScript, check a letter before you lower its count. Each slide is constant work, so it is O of n.',
          speak: 'In JavaScript, check a letter before you lower its count. Each slide is constant work, so it is oh of n.',
          emphasis: ['before'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'checkInclusion.js',
            code: `const need = {}, m = p.length;
for (const c of s) need[c] = 0;
for (const c of p) need[c]++;
let missing = m;
for (let r = 0; r < s.length; r++) {
  if (need[s[r]]-- > 0) missing--;
  const out = s[r - m];
  if (r >= m && ++need[out] > 0) {
    missing++;
  }
  if (missing === 0) return true;
}
return false;`,
            highlight: [6, 8],
            note: { line: 8, text: 'O(1) per slide, O(n) in all', tone: 'good' },
          },
        },
        {
          say: 'Reach for this when you hear anagram, or any order. The window is as long as the pattern.',
          emphasis: ['anagram'],
          scene: {
            type: 'list',
            title: 'Reach for this when…',
            items: [
              { text: '“*Anagram*” or “any order”', icon: '🔀' },
              { text: 'Window size = pattern length', icon: '📏' },
              { text: 'Compare *counts*, not letters', icon: '🧮' },
            ],
            active: 0,
          },
        },
        {
          say: 'The trap is the order. Lower the count first, and a letter you needed never counts.',
          emphasis: ['order'],
          sfx: 'error',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'trap.js',
            code: `// need.A is 1. An A comes in.
need.A--;   // now 0
if (need.A > 0) missing--;`,
            errors: [[2, 3]],
            note: { line: 3, text: 'check first, then lower', tone: 'bad' },
          },
        },
        {
          say: 'Quick check. The pattern is A, B. You still need a B, but another A comes in. What happens?',
          sfx: 'riser',
          scene: {
            type: 'quiz',
            question: 'Pattern AB. need is A:0, B:1. Another A comes in. Then?',
            options: ['missing drops to 0', 'need A is −1, missing stays', 'missing goes up to 2', 'The window matches'],
            answer: 1,
          },
        },
        {
          say: 'The A was not needed anymore. Its count goes below zero, and missing stays at one.',
          emphasis: ['stays'],
          sfx: 'ding',
          scene: {
            type: 'quiz',
            question: 'Pattern AB. need is A:0, B:1. Another A comes in. Then?',
            options: ['missing drops to 0', 'need A is −1, missing stays', 'missing goes up to 2', 'The window matches'],
            answer: 1,
            reveal: true,
            explain: 'need.A was already 0, so this A is an extra. missing does not move.',
          },
        },
        {
          say: 'Remember this. Any order means compare counts, and one missing number tells you when it matches. Now tap solve it.',
          emphasis: ['counts', 'missing'],
          sfx: 'success',
          scene: {
            type: 'outro',
            points: ['Any order? Compare *counts*', 'A *missing* counter says “match” in O(1)', 'One letter in, one letter out'],
            tagline: 'Now go solve it.',
          },
        },
      ],
    },

    // ─── Lesson 4: minimum window ───────────────────────────────────────────
    {
      id: 'dsa-sliding-window-minimum-window',
      title: 'Minimum window: the classic hard one',
      link: { label: 'Solve it', href: '/dsa#/m/sliding-window/minimum-window/sliding-window-min-window-substring' },
      beats: [
        {
          say: 'How does search find the shortest snippet with all your words?',
          emphasis: ['shortest', 'all'],
          scene: { type: 'title', kicker: 'Sliding window · Lesson 4', title: 'The *tightest* snippet', emoji: '🔎', style: 'slam' },
        },
        {
          say: 'Letter version: find the shortest stretch with an A, a B and a C. Here, it is the last four letters.',
          emphasis: ['shortest'],
          sfx: 'pop',
          scene: {
            type: 'array',
            title: 'Cover every letter of ABC',
            cells: text,
            window: [4, 7],
            found: [4, 5, 6, 7],
            vars: { need: 'A B C', best: 'BANC' },
            caption: 'shortest stretch with A, B and C',
          },
        },
        {
          say: 'The easy way tries every start, grows until it covers all three, then starts over.',
          emphasis: ['starts', 'over'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'pseudo',
            file: 'Brute force',
            code: `function minWindow(s, t):
    best ← ""
    for start from 0 to n - 1:
        for end from start to n - 1:
            if s[start..end] covers t:
                keep it if shorter
                stop
    return best`,
            highlight: [[3, 5]],
            note: { line: 5, text: 'rescans for every start', tone: 'warn' },
          },
        },
        {
          say: 'That is O of n squared times m. A long page means billions of checks.',
          speak: 'That is oh of n squared times m. A long page means billions of checks.',
          emphasis: ['billions'],
          sfx: 'error',
          scene: {
            type: 'stat',
            value: '15B',
            label: 'checks for *100,000* letters',
            sub: 'O(n² · m) with 3 letters to find',
            tone: 'bad',
          },
        },
        {
          say: 'It is labelled hard, but it is two easy ideas glued together: grow and shrink, plus a missing counter.',
          emphasis: ['two', 'easy'],
          sfx: 'ding',
          scene: { type: 'title', kicker: 'The insight', title: 'Lesson 2 *+* lesson 3', sub: 'grow and shrink, plus a need map', emoji: '💡', style: 'slam' },
        },
        {
          say: 'Grow until nothing is missing. By the A, the window covers all three. Best so far: six letters.',
          emphasis: ['six'],
          scene: {
            type: 'array',
            title: coverRun,
            cells: text,
            pointers: { L: 0, R: 5 },
            window: [0, 5],
            active: [5],
            vars: { missing: 0, best: 'CODEBA' },
          },
        },
        {
          say: 'Shrink: drop the C. Now a C is missing, so stop shrinking.',
          emphasis: ['missing'],
          scene: {
            type: 'array',
            title: coverRun,
            cells: text,
            pointers: { L: 1, R: 5 },
            window: [1, 5],
            done: [0],
            vars: { missing: 1, best: 'CODEBA' },
          },
        },
        {
          say: 'Grow past the N to the next C. Covered again, but seven letters is not better.',
          emphasis: ['seven'],
          scene: {
            type: 'array',
            title: coverRun,
            cells: text,
            pointers: { L: 1, R: 7 },
            window: [1, 7],
            active: [7],
            done: [0],
            vars: { missing: 0, best: 'CODEBA' },
          },
        },
        {
          say: 'Shrink: drop O, D and E. It still covers, and four letters is a new best.',
          emphasis: ['new', 'best'],
          scene: {
            type: 'array',
            title: coverRun,
            cells: text,
            pointers: { L: 4, R: 7 },
            window: [4, 7],
            active: [4, 5, 6, 7],
            done: [0, 1, 2, 3],
            vars: { missing: 0, best: 'BANC' },
          },
        },
        {
          say: 'Dropping the B breaks it, and R is at the end. The answer is BANC.',
          speak: 'Dropping the B breaks it, and R is at the end. The answer is B A N C.',
          emphasis: ['answer'],
          sfx: 'success',
          scene: {
            type: 'array',
            title: coverRun,
            cells: text,
            found: [4, 5, 6, 7],
            done: [0, 1, 2, 3],
            vars: { missing: 1, best: 'BANC' },
          },
        },
        {
          say: 'In JavaScript, record the window while you shrink. Each letter goes in once and out once, so it is O of n.',
          speak: 'In JavaScript, record the window while you shrink. Each letter goes in once and out once, so it is oh of n.',
          emphasis: ['record', 'shrink'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'minWindow.js',
            code: `let l = 0, start = 0, len = Infinity;
for (let r = 0; r < s.length; r++) {
  if (need[s[r]]-- > 0) missing--;
  while (missing === 0) {
    if (r - l + 1 < len) {
      start = l;
      len = r - l + 1;
    }
    if (++need[s[l]] > 0) missing++;
    l++;
  }
}
if (len === Infinity) return '';
return s.slice(start, start + len);`,
            highlight: [[4, 5]],
            note: { line: 5, text: 'record while shrinking', tone: 'good' },
          },
        },
        {
          say: 'Reach for this when you need the shortest stretch that contains all of something.',
          emphasis: ['contains', 'all'],
          scene: {
            type: 'list',
            title: 'Reach for this when…',
            items: [
              { text: 'Shortest stretch that has *all*', icon: '🎯' },
              { text: 'Repeats count, so use counts', icon: '🧮' },
              { text: 'Record while you *shrink*', icon: '📏' },
            ],
            active: 0,
          },
        },
        {
          say: 'The trap is using a set. If t is A, A, B, you need two As. A set forgets that, a count does not.',
          speak: 'The trap is using a set. If t is A, A, B, you need two ayes. A set forgets that, a count does not.',
          emphasis: ['set', 'two'],
          sfx: 'error',
          scene: {
            type: 'compare',
            title: 'Repeats matter',
            left: { title: 'A set', verdict: 'bad', items: ['Only knows “has A”', 'AB looks done'] },
            right: { title: 'A count map', verdict: 'ok', items: ['Needs A twice', 'Waits for both As'] },
          },
        },
        {
          say: 'Quick check. Two windows tie for shortest, and you want the leftmost. Which test do you use?',
          sfx: 'riser',
          scene: {
            type: 'quiz',
            question: 'Two windows tie for shortest. Keep the leftmost with…',
            options: ['length ≤ len', 'length < len', 'length === len', 'It does not matter'],
            answer: 1,
          },
        },
        {
          say: 'Strictly less than. The left one is found first, so a later tie never replaces it.',
          emphasis: ['first'],
          sfx: 'ding',
          scene: {
            type: 'quiz',
            question: 'Two windows tie for shortest. Keep the leftmost with…',
            options: ['length ≤ len', 'length < len', 'length === len', 'It does not matter'],
            answer: 1,
            reveal: true,
            explain: 'The left one is found first. With <, a later tie never replaces it.',
          },
        },
        {
          say: 'Remember this. Hard problems are often two easy ideas glued together. Now tap solve it and try it yourself.',
          emphasis: ['two', 'easy'],
          sfx: 'success',
          scene: {
            type: 'outro',
            points: ['Hard = *two easy ideas* glued', 'Grow, then shrink with a need map', 'Record with a strict *<*'],
            tagline: 'Now go solve it.',
          },
        },
      ],
    },

    // ─── Lesson 5: counting subarrays ───────────────────────────────────────
    {
      id: 'dsa-sliding-window-counting-windows',
      title: 'Counting subarrays: the “at most k” trick',
      link: { label: 'Solve it', href: '/dsa#/m/sliding-window/counting-windows/sliding-window-product-less-than-k' },
      beats: [
        {
          say: 'Anti-cheat asks: how many combos stay under a hundred?',
          emphasis: ['how', 'many'],
          scene: { type: 'title', kicker: 'Sliding window · Lesson 5', title: 'Count *every* combo', emoji: '🎮', style: 'slam' },
        },
        {
          say: 'Ten, five, two, six. Eight runs multiply to under a hundred, like five times two times six.',
          emphasis: ['eight'],
          sfx: 'pop',
          scene: {
            type: 'array',
            title: 'Hit multipliers',
            cells: hits,
            window: [1, 3],
            found: [1, 2, 3],
            vars: { k: 100, count: 8 },
            caption: '5 × 2 × 6 = 60, under 100',
          },
        },
        {
          say: 'The easy way lists every run, one by one. That is O of n squared, and there can be billions of runs.',
          speak: 'The easy way lists every run, one by one. That is oh of n squared, and there can be billions of runs.',
          emphasis: ['one', 'by'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'pseudo',
            file: 'Brute force',
            code: `function count(nums, k):
    count ← 0
    for start from 0 to n - 1:
        product ← 1
        for end from start to n - 1:
            product ← product * nums[end]
            if product ≥ k: stop
            count ← count + 1
    return count`,
            highlight: [[5, 8]],
            note: { line: 8, text: 'counts one run at a time', tone: 'warn' },
          },
        },
        {
          say: 'If five, two, six is under a hundred, then two, six and six alone are too. Fewer items, smaller product.',
          emphasis: ['too'],
          scene: {
            type: 'array',
            title: 'Spot the waste',
            cells: hits,
            pointers: { L: 1, R: 3 },
            window: [1, 3],
            active: [3],
            reads: [1, 2],
            caption: '3 runs end at R: 6, 2·6, 5·2·6',
          },
        },
        {
          say: 'So count every window that ends at right in one go: right minus left plus one.',
          emphasis: ['one', 'go'],
          sfx: 'ding',
          scene: { type: 'title', kicker: 'The insight', title: 'Add *right − left + 1*', sub: 'every window ending at right, at once', emoji: '💡', style: 'slam' },
        },
        {
          say: 'Ten is under a hundred. One window ends here, so the count is one.',
          emphasis: ['one'],
          scene: {
            type: 'array',
            title: countRun,
            cells: hits,
            pointers: { L: 0, R: 0 },
            window: [0, 0],
            active: [0],
            vars: { product: 10, added: 1, count: 1 },
          },
        },
        {
          say: 'Times five is fifty. Two windows end here, so add two. The count is three.',
          emphasis: ['two', 'three'],
          scene: {
            type: 'array',
            title: countRun,
            cells: hits,
            pointers: { L: 0, R: 1 },
            window: [0, 1],
            active: [1],
            vars: { product: 50, added: 2, count: 3 },
          },
        },
        {
          say: 'Times two is a hundred, too big. Drop the ten to get ten again. Add two, and the count is five.',
          emphasis: ['drop', 'five'],
          scene: {
            type: 'array',
            title: countRun,
            cells: hits,
            pointers: { L: 1, R: 2 },
            window: [1, 2],
            active: [2],
            done: [0],
            vars: { product: 10, added: 2, count: 5 },
          },
        },
        {
          say: 'Times six is sixty. Three windows end here, so add three. That is eight in total.',
          emphasis: ['eight'],
          sfx: 'success',
          scene: {
            type: 'array',
            title: countRun,
            cells: hits,
            pointers: { L: 1, R: 3 },
            window: [1, 3],
            found: [1, 2, 3],
            done: [0],
            vars: { product: 60, added: 3, count: 8 },
          },
        },
        {
          say: 'In JavaScript, shrink while the product is too big, then add right minus left plus one. That is O of n.',
          speak: 'In JavaScript, shrink while the product is too big, then add right minus left plus one. That is oh of n.',
          emphasis: ['shrink', 'add'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'countUnder.js',
            code: `function countUnder(nums, k) {
  if (k <= 1) return 0;
  const n = nums.length;
  let l = 0, product = 1, count = 0;
  for (let r = 0; r < n; r++) {
    product *= nums[r];
    while (product >= k) {
      product /= nums[l++];
    }
    count += r - l + 1; // end at r
  }
  return count;
}`,
            highlight: [10],
            note: { line: 10, text: 'all windows ending at r: O(n)', tone: 'good' },
          },
        },
        {
          say: 'For exactly k, count at most k, then subtract at most k minus one. Fourteen minus ten leaves four.',
          emphasis: ['exactly', 'subtract'],
          scene: {
            type: 'list',
            title: 'Exactly 2 in 1,0,1,0,1',
            items: [
              { text: 'atMost(2) = *14*', sub: 'all but the whole array', icon: '📦' },
              { text: 'atMost(1) = *10*', sub: 'zero or one buy', icon: '📦' },
              { text: 'exactly(2) = *4*', sub: '14 − 10', icon: '🎯' },
            ],
          },
        },
        {
          say: 'The trap is adding one per step. That counts only the longest window. Add right minus left plus one.',
          emphasis: ['one', 'longest'],
          sfx: 'error',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'trap.js',
            code: `count += 1;         // one
count += r - l + 1; // all`,
            errors: [1],
            added: [2],
            note: { line: 2, text: 'one per start, ending at r', tone: 'good' },
          },
        },
        {
          say: 'Quick check. After shrinking, the window runs from three to seven. How many valid runs end at seven?',
          sfx: 'riser',
          scene: {
            type: 'quiz',
            question: 'After shrinking, the window is 3 to 7. How many valid runs end at 7?',
            options: ['1', '4', '5', '8'],
            answer: 2,
          },
        },
        {
          say: 'Five. Starts three, four, five, six and seven all work. Seven minus three plus one.',
          emphasis: ['five'],
          sfx: 'ding',
          scene: {
            type: 'quiz',
            question: 'After shrinking, the window is 3 to 7. How many valid runs end at 7?',
            options: ['1', '4', '5', '8'],
            answer: 2,
            reveal: true,
            explain: 'Starts 3, 4, 5, 6 and 7 all work: 7 − 3 + 1 = 5.',
          },
        },
        {
          say: 'Remember this. Count windows by their right end, and turn exactly into two at mosts. Now tap solve it.',
          emphasis: ['right', 'exactly'],
          sfx: 'success',
          scene: {
            type: 'outro',
            points: ['Count windows by their *right end*', 'Add right − left + 1 each step', '*Exactly k* = two “at most” counts'],
            tagline: 'Now go solve it.',
          },
        },
      ],
    },
  ],
};
