import type { Series } from '../types';

// /dsa/reels module 5. One reel per lesson of src/dsa/modules/05-binary-search*.ts, in lesson order.
// Brief: src/reels/dsa/README.md. Rules: src/reels/AUTHORING.md.

const sorted = [2, 5, 8, 12, 16, 23, 38, 56];
const dupes = [1, 3, 3, 5, 5, 5, 8, 9, ''];
const rotated = [4, 5, 6, 7, 0, 1, 2];
const speeds = [1, 2, 3, 4, 5, 6, 7, 8];
const tickets = [
  [1, 3, 5, 7],
  [10, 11, 16, 20],
  [23, 30, 34, 60],
];

export const series: Series = {
  id: 'dsa-binary-search',
  title: 'Binary search',
  emoji: '🔎',
  color: '#22d3ee',
  order: 5,
  blurb: 'Halve the search space, on arrays and on the answer itself.',
  reels: [
    {
      id: 'dsa-binary-search-classic-binary-search',
      title: 'Classic binary search',
      link: { label: 'Solve it', href: '/dsa#/m/binary-search/classic-binary-search/binary-search-classic' },
      beats: [
        {
          say: "Pick any number up to a million. I'll guess it in twenty tries.",
          emphasis: ['twenty'],
          scene: { type: 'title', kicker: 'Binary search · Lesson 1', title: 'A million numbers, *20* guesses', emoji: '🎯', style: 'slam' },
        },
        {
          say: 'Here is a sorted list. Find thirty-eight and say where it sits. The answer is index six.',
          emphasis: ['sorted', 'six'],
          sfx: 'pop',
          scene: {
            type: 'array',
            title: 'Sorted book IDs',
            cells: sorted,
            pointers: { here: 6 },
            found: [6],
            vars: { target: 38, index: 6 },
            caption: 'return the index, or -1 if missing',
          },
        },
        {
          say: 'The easy way checks every cell, one by one, from the left.',
          emphasis: ['every'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'pseudo',
            file: 'Brute force',
            code: `function linearSearch(nums, target):
    for i from 0 to n - 1:
        if nums[i] = target:
            return i
    return -1`,
            highlight: [[2, 3]],
            note: { line: 3, text: 'one cell per look', tone: 'warn' },
          },
        },
        {
          say: 'That is O of n. A missing number in a million items costs a million checks.',
          speak: 'That is oh of n. A missing number in a million items costs a million checks.',
          emphasis: ['million'],
          sfx: 'error',
          scene: {
            type: 'stat',
            value: '1M',
            label: 'checks for a *million* items',
            sub: 'O(n): it ignores the sorted order',
            tone: 'bad',
          },
        },
        {
          say: 'Look at twelve. It is smaller than thirty-eight, so every cell to its left is smaller too.',
          emphasis: ['smaller', 'left'],
          scene: {
            type: 'array',
            title: 'Spot the waste',
            cells: sorted,
            active: [3],
            done: [0, 1, 2],
            vars: { target: 38, seen: 12 },
            caption: 'one look rules out four cells',
          },
        },
        {
          say: 'So always look in the middle, and throw away the half that cannot hold it.',
          emphasis: ['middle', 'half'],
          sfx: 'ding',
          scene: { type: 'title', kicker: 'The insight', title: 'Look in the middle, *drop half*', emoji: '💡', style: 'slam' },
        },
        {
          say: 'The whole list is still in play. Low starts at zero, and high at seven.',
          emphasis: ['low', 'high'],
          scene: {
            type: 'array',
            title: 'Find 38',
            cells: sorted,
            pointers: { lo: 0, hi: 7 },
            window: [0, 7],
            active: [0, 7],
            vars: { target: 38, 'at mid': '–', looks: 0 },
          },
        },
        {
          say: 'The middle is index three, holding twelve. Too small, so thirty-eight must be on the right.',
          emphasis: ['small', 'right'],
          scene: {
            type: 'array',
            title: 'Find 38',
            cells: sorted,
            pointers: { lo: 0, mid: 3, hi: 7 },
            window: [0, 7],
            active: [3],
            vars: { target: 38, 'at mid': 12, looks: 1 },
          },
        },
        {
          say: 'Drop the left half. The new middle holds twenty-three. Still too small, so go right again.',
          emphasis: ['Drop'],
          scene: {
            type: 'array',
            title: 'Find 38',
            cells: sorted,
            pointers: { lo: 4, mid: 5, hi: 7 },
            window: [4, 7],
            active: [5],
            done: [0, 1, 2, 3],
            vars: { target: 38, 'at mid': 23, looks: 2 },
          },
        },
        {
          say: 'Now the middle is thirty-eight. Found it in three looks, not seven.',
          emphasis: ['three'],
          sfx: 'success',
          scene: {
            type: 'array',
            title: 'Find 38',
            cells: sorted,
            pointers: { lo: 6, mid: 6, hi: 7 },
            window: [6, 7],
            found: [6],
            done: [0, 1, 2, 3, 4, 5],
            vars: { target: 38, 'at mid': 38, looks: 3 },
          },
        },
        {
          say: 'In JavaScript, too small moves low past mid. Too big moves high below it. That is O of log n.',
          speak: 'In JavaScript, too small moves low past mid. Too big moves high below it. That is oh of log n.',
          emphasis: ['low', 'high', 'log'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'search.js',
            code: `function search(nums, t) {
  let lo = 0;
  let hi = nums.length - 1;
  while (lo <= hi) {
    const mid = Math.floor((lo+hi)/2);
    if (nums[mid] === t) return mid;
    if (nums[mid] < t) lo = mid + 1;
    else hi = mid - 1;
  }
  return -1;
}`,
            highlight: [[7, 8]],
            note: { line: 8, text: 'halve the range: O(log n)', tone: 'good' },
          },
        },
        {
          say: 'Reach for this when the data is sorted, n is huge, and each look says found, left or right.',
          emphasis: ['sorted', 'huge'],
          scene: {
            type: 'list',
            title: 'Reach for this when…',
            items: [
              { text: 'The data is *sorted*', icon: '📚' },
              { text: 'n is huge, like a billion', icon: '🐘' },
              { text: 'Each look: found, left or right', icon: '↔️' },
            ],
            active: 0,
          },
        },
        {
          say: 'The trap is low less than high. When both meet on one cell, you skip it and miss the answer.',
          emphasis: ['skip', 'miss'],
          sfx: 'error',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'trap.js',
            code: `while (lo < hi) {
  const mid = Math.floor((lo+hi)/2);
  if (nums[mid] === t) return mid;
  if (nums[mid] < t) lo = mid + 1;
  else hi = mid - 1;
}
return -1;`,
            errors: [1],
            note: { line: 1, text: 'lo = hi: one cell never checked', tone: 'bad' },
          },
        },
        {
          say: 'Quick check. A sorted list has a million numbers. About how many looks, at worst?',
          sfx: 'riser',
          scene: {
            type: 'quiz',
            question: 'A million sorted numbers. How many looks, worst case?',
            options: ['About 1,000', 'About 500,000', 'About 20', 'Just 1'],
            answer: 2,
          },
        },
        {
          say: 'About twenty. Each look halves the list, and twenty halvings shrink a million down to one.',
          emphasis: ['twenty', 'halves'],
          sfx: 'ding',
          scene: {
            type: 'quiz',
            question: 'A million sorted numbers. How many looks, worst case?',
            options: ['About 1,000', 'About 500,000', 'About 20', 'Just 1'],
            answer: 2,
            reveal: true,
            explain: '2 to the 20th is about a million, so 20 halvings.',
          },
        },
        {
          say: 'Remember this. Keep a range where the answer must be, and halve it every look. Now tap solve it and try it yourself.',
          emphasis: ['range', 'halve'],
          sfx: 'success',
          scene: {
            type: 'outro',
            points: ['Keep a range where it *must* be', 'Look in the middle, *drop half*', 'Use lo ≤ hi, then mid ± 1'],
            tagline: 'Now go solve it.',
          },
        },
      ],
    },
    {
      id: 'dsa-binary-search-lower-upper-bound',
      title: 'Lower and upper bound',
      link: { label: 'Solve it', href: '/dsa#/m/binary-search/lower-upper-bound/binary-search-insert-position' },
      beats: [
        {
          say: 'One of a hundred commits broke your app. Find it in seven tests.',
          emphasis: ['seven'],
          scene: { type: 'title', kicker: 'Binary search · Lesson 2', title: 'Find the *first* bad commit', emoji: '🐛', style: 'slam' },
        },
        {
          say: 'These scores are sorted, with repeats. Where does the first five start? At index three.',
          emphasis: ['first', 'three'],
          sfx: 'pop',
          scene: {
            type: 'array',
            title: 'Sorted high scores',
            cells: [1, 3, 3, 5, 5, 5, 8, 9],
            pointers: { first: 3 },
            found: [3],
            vars: { target: 5, first: 3 },
            caption: 'a new 4 would also go at index 3',
          },
        },
        {
          say: 'The easy way walks from the left until a value is big enough.',
          emphasis: ['big', 'enough'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'pseudo',
            file: 'Brute force',
            code: `function firstAtLeast(nums, target):
    for i from 0 to n - 1:
        if nums[i] ≥ target:
            return i
    return n`,
            highlight: [[2, 3]],
            note: { line: 3, text: 'one cell at a time: O(n)', tone: 'warn' },
          },
        },
        {
          say: 'Testing a hundred commits one by one takes a hundred tests. Halving takes about seven.',
          emphasis: ['hundred', 'seven'],
          sfx: 'error',
          scene: {
            type: 'stat',
            value: '100',
            unit: 'tests',
            label: 'to check *100* commits one by one',
            sub: 'halving the range needs about 7',
            tone: 'bad',
          },
        },
        {
          say: 'Ask one question at every cell: is it at least five? The answers are all no, then all yes.',
          emphasis: ['no', 'yes'],
          scene: {
            type: 'grid',
            title: 'Is it at least 5?',
            colLabels: ['0', '1', '2', '3', '4', '5', '6', '7'],
            rowLabels: ['nums', '≥ 5?'],
            cells: [
              [1, 3, 3, 5, 5, 5, 8, 9],
              ['N', 'N', 'N', 'Y', 'Y', 'Y', 'Y', 'Y'],
            ],
            found: [[1, 3]],
            caption: 'the first yes is the answer',
          },
        },
        {
          say: "So don't hunt for the value. Hunt for the spot where no turns into yes.",
          emphasis: ['spot'],
          sfx: 'ding',
          scene: { type: 'title', kicker: 'The insight', title: 'Search for the *flip*', emoji: '💡', style: 'slam' },
        },
        {
          say: "The empty cell means after the end. That's a real answer, so high starts at eight.",
          emphasis: ['after', 'eight'],
          scene: {
            type: 'array',
            title: 'Lower bound of 5',
            cells: dupes,
            pointers: { lo: 0, hi: 8 },
            window: [0, 8],
            active: [8],
            vars: { 'at mid': '–', '≥ 5?': '–', answer: '?' },
          },
        },
        {
          say: 'The middle is index four, a five. Yes! So the first yes is here or to its left.',
          emphasis: ['Yes', 'left'],
          scene: {
            type: 'array',
            title: 'Lower bound of 5',
            cells: dupes,
            pointers: { lo: 0, mid: 4, hi: 8 },
            window: [0, 8],
            active: [4],
            vars: { 'at mid': 5, '≥ 5?': 'yes', answer: '?' },
          },
        },
        {
          say: 'High moves to four, and keeps it. The new middle is a three. No, so low jumps to three.',
          emphasis: ['keeps', 'No'],
          scene: {
            type: 'array',
            title: 'Lower bound of 5',
            cells: dupes,
            pointers: { lo: 0, mid: 2, hi: 4 },
            window: [0, 4],
            active: [2],
            done: [5, 6, 7, 8],
            vars: { 'at mid': 3, '≥ 5?': 'no', answer: '?' },
          },
        },
        {
          say: "The middle is a five again. Yes, so high drops to three and meets low. That's the first five.",
          emphasis: ['first', 'five'],
          sfx: 'success',
          scene: {
            type: 'array',
            title: 'Lower bound of 5',
            cells: dupes,
            pointers: { lo: 3, hi: 3 },
            window: [3, 3],
            found: [3],
            done: [0, 1, 2, 4, 5, 6, 7, 8],
            vars: { 'at mid': '–', '≥ 5?': '–', answer: 3 },
          },
        },
        {
          say: 'In code, a yes keeps mid as the new high. A no drops it, so low is mid plus one.',
          emphasis: ['yes', 'no'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'searchInsert.js',
            code: `function searchInsert(nums, target) {
  let lo = 0;
  let hi = nums.length;
  while (lo < hi) {
    const mid = Math.floor((lo+hi)/2);
    if (nums[mid] >= target) hi = mid;
    else lo = mid + 1;
  }
  return lo;
}`,
            highlight: [[6, 7]],
            note: { line: 7, text: 'keep mid on a yes: O(log n)', tone: 'good' },
          },
        },
        {
          say: 'Reach for this on first or last position, where a value would go, or any no then yes question.',
          emphasis: ['first', 'last'],
          scene: {
            type: 'list',
            title: 'Reach for this when…',
            items: [
              { text: 'First or last *position* of x', icon: '📍' },
              { text: 'Where would x be inserted?', icon: '➕' },
              { text: 'All no, then all yes', icon: '🚦' },
            ],
            active: 2,
          },
        },
        {
          say: "The trap is mixing templates. Low less than or equal to high, with high equals mid, never ends.",
          emphasis: ['mixing', 'never'],
          sfx: 'error',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'trap.js',
            code: `while (lo <= hi) {
  const mid = Math.floor((lo+hi)/2);
  if (nums[mid] >= target) hi = mid;
  else lo = mid + 1;
}`,
            errors: [1],
            note: { line: 1, text: 'lo = hi = mid: loops forever', tone: 'bad' },
          },
        },
        {
          say: 'Quick check. You bisect sixty-four commits. How many tests, at worst?',
          emphasis: ['sixty-four'],
          sfx: 'riser',
          scene: {
            type: 'quiz',
            question: 'You bisect 64 commits. How many tests, worst case?',
            options: ['6', '8', '32', '64'],
            answer: 0,
          },
        },
        {
          say: 'Six. Sixty-four halves to thirty-two, then sixteen, eight, four, two and one.',
          emphasis: ['Six'],
          sfx: 'ding',
          scene: {
            type: 'quiz',
            question: 'You bisect 64 commits. How many tests, worst case?',
            options: ['6', '8', '32', '64'],
            answer: 0,
            reveal: true,
            explain: '64 → 32 → 16 → 8 → 4 → 2 → 1: six halvings.',
          },
        },
        {
          say: 'Remember this. Turn it into a no then yes question, and find the first yes. Now tap solve it and try it yourself.',
          emphasis: ['first', 'yes'],
          sfx: 'success',
          scene: {
            type: 'outro',
            points: ['Find the *first yes*', 'Yes: hi = mid. No: lo = mid + 1', 'Upper bound is the first *> x*'],
            tagline: 'Now go solve it.',
          },
        },
      ],
    },
    {
      id: 'dsa-binary-search-rotated-arrays',
      title: 'Rotated sorted arrays',
      link: { label: 'Solve it', href: '/dsa#/m/binary-search/rotated-arrays/binary-search-rotated-min' },
      beats: [
        {
          say: 'Your log buffer wrapped around. Where is the oldest entry?',
          emphasis: ['oldest'],
          scene: { type: 'title', kicker: 'Binary search · Lesson 3', title: 'Find the *oldest* log', emoji: '🔄', style: 'slam' },
        },
        {
          say: 'A ring buffer reads back sorted, but cut and wrapped. The oldest log, zero, sits at index four.',
          emphasis: ['wrapped', 'zero'],
          sfx: 'pop',
          scene: {
            type: 'array',
            title: 'Log times, read from slot 0',
            cells: rotated,
            pointers: { min: 4 },
            found: [4],
            vars: { oldest: 0 },
            caption: 'sorted, then rotated',
          },
        },
        {
          say: 'The easy way checks every slot and keeps the smallest one.',
          emphasis: ['every', 'smallest'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'pseudo',
            file: 'Brute force',
            code: `function findMinSlow(nums):
    best ← nums[0]
    for i from 1 to n - 1:
        if nums[i] < best:
            best ← nums[i]
    return best`,
            highlight: [[3, 4]],
            note: { line: 4, text: 'reads every slot', tone: 'warn' },
          },
        },
        {
          say: 'That is O of n. A million logs means a million reads, when about twenty would do.',
          speak: 'That is oh of n. A million logs means a million reads, when about twenty would do.',
          emphasis: ['million', 'twenty'],
          sfx: 'error',
          scene: {
            type: 'stat',
            value: '1M',
            label: 'reads for a *million* logs',
            sub: 'O(n), but it is almost sorted',
            tone: 'bad',
          },
        },
        {
          say: "It's really two sorted runs, a high one and a low one. The last value always sits on the low run.",
          emphasis: ['two', 'low'],
          scene: {
            type: 'array',
            title: 'Two sorted runs',
            cells: rotated,
            window: [4, 6],
            active: [6],
            done: [0, 1, 2, 3],
            caption: 'the minimum sits right after the cliff',
          },
        },
        {
          say: 'So compare the middle with the right end. That tells you which run you are on.',
          emphasis: ['right', 'end'],
          sfx: 'ding',
          scene: { type: 'title', kicker: 'The insight', title: 'Compare mid with the *right end*', emoji: '💡', style: 'slam' },
        },
        {
          say: "The middle is seven, the right end is two. Seven is bigger, so we're on the high run.",
          emphasis: ['high'],
          scene: {
            type: 'array',
            title: 'Find the minimum',
            cells: rotated,
            pointers: { lo: 0, mid: 3, hi: 6 },
            window: [0, 6],
            active: [3],
            reads: [6],
            vars: { 'at mid': 7, 'at hi': 2, run: 'high' },
          },
        },
        {
          say: 'The cliff is to the right, so drop the left half. Now the middle is one, smaller than two.',
          emphasis: ['cliff', 'smaller'],
          scene: {
            type: 'array',
            title: 'Find the minimum',
            cells: rotated,
            pointers: { lo: 4, mid: 5, hi: 6 },
            window: [4, 6],
            active: [5],
            reads: [6],
            done: [0, 1, 2, 3],
            vars: { 'at mid': 1, 'at hi': 2, run: 'low' },
          },
        },
        {
          say: "That's the low run, so the minimum is here or to the left. High moves in, and zero beats one.",
          emphasis: ['low', 'left'],
          scene: {
            type: 'array',
            title: 'Find the minimum',
            cells: rotated,
            pointers: { lo: 4, mid: 4, hi: 5 },
            window: [4, 5],
            active: [4],
            reads: [5],
            done: [0, 1, 2, 3, 6],
            vars: { 'at mid': 0, 'at hi': 1, run: 'low' },
          },
        },
        {
          say: 'Low meets high at index four. The minimum is zero, the oldest log, in three looks.',
          emphasis: ['zero', 'three'],
          sfx: 'success',
          scene: {
            type: 'array',
            title: 'Find the minimum',
            cells: rotated,
            pointers: { lo: 4, hi: 4 },
            window: [4, 4],
            found: [4],
            done: [0, 1, 2, 3, 5, 6],
            vars: { 'at mid': '–', 'at hi': '–', run: 'found' },
          },
        },
        {
          say: 'In code, a middle bigger than the right end means go right. Otherwise keep mid. Still O of log n.',
          speak: 'In code, a middle bigger than the right end means go right. Otherwise keep mid. Still oh of log n.',
          emphasis: ['bigger', 'keep'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'findMin.js',
            code: `function findMin(nums) {
  let lo = 0;
  let hi = nums.length - 1;
  while (lo < hi) {
    const mid = Math.floor((lo+hi)/2);
    if (nums[mid] > nums[hi]) {
      lo = mid + 1; // high run
    } else {
      hi = mid;     // low run
    }
  }
  return nums[lo];
}`,
            highlight: [6],
            note: { line: 6, text: 'the right end decides: O(log n)', tone: 'good' },
          },
        },
        {
          say: 'Reach for this when a list is sorted but rotated, or shaped like a mountain.',
          emphasis: ['rotated', 'mountain'],
          scene: {
            type: 'list',
            title: 'Reach for this when…',
            items: [
              { text: 'Sorted, but *rotated*', icon: '🔄' },
              { text: 'Up, then down: a mountain', icon: '⛰️' },
              { text: 'One look at mid picks a side', icon: '👈' },
            ],
            active: 0,
          },
        },
        {
          say: 'The trap: comparing with the left end. On a list that was never rotated, you walk right and return five.',
          emphasis: ['left', 'five'],
          sfx: 'error',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'trap.js',
            code: `if (nums[mid] > nums[lo]) {
  lo = mid + 1;
} else {
  hi = mid;
}
// [1, 2, 3, 4, 5] returns 5`,
            errors: [1],
            note: { line: 1, text: 'not rotated? walks to the max', tone: 'bad' },
          },
        },
        {
          say: 'Quick check. Six, seven, one, two, three, four, five. Mid is two, the end is five. Where is the minimum?',
          sfx: 'riser',
          scene: {
            type: 'quiz',
            question: 'In [6, 7, 1, 2, 3, 4, 5], mid is 2 and the end is 5. Where is the min?',
            options: ['At mid or left of it', 'Right of mid', "You can't tell"],
            answer: 0,
          },
        },
        {
          say: 'At mid or to its left. Two is smaller than five, so mid sits on the low run.',
          emphasis: ['left', 'low'],
          sfx: 'ding',
          scene: {
            type: 'quiz',
            question: 'In [6, 7, 1, 2, 3, 4, 5], mid is 2 and the end is 5. Where is the min?',
            options: ['At mid or left of it', 'Right of mid', "You can't tell"],
            answer: 0,
            reveal: true,
            explain: '2 ≤ 5 means the low run, so hi = mid.',
          },
        },
        {
          say: 'Remember this. Compare mid with the right end, and keep the side with the cliff. Now tap solve it and try it yourself.',
          emphasis: ['right', 'cliff'],
          sfx: 'success',
          scene: {
            type: 'outro',
            points: ['Two sorted runs, one *cliff*', 'Compare mid with the *right end*', 'Any test that picks a side works'],
            tagline: 'Now go solve it.',
          },
        },
      ],
    },
    {
      id: 'dsa-binary-search-search-the-answer',
      title: 'Binary search on the answer',
      link: { label: 'Solve it', href: '/dsa#/m/binary-search/search-the-answer/binary-search-eating-speed' },
      beats: [
        {
          say: 'No formula gives the answer. But checking a guess is easy.',
          emphasis: ['guess'],
          scene: { type: 'title', kicker: 'Binary search · Lesson 4', title: 'Binary search a *guess*', emoji: '🐼', style: 'slam' },
        },
        {
          say: 'A panda has four bamboo piles and eight hours. What is the slowest speed that finishes? Four an hour.',
          emphasis: ['slowest', 'Four'],
          sfx: 'pop',
          scene: {
            type: 'array',
            title: 'Bamboo piles',
            cells: [3, 6, 7, 8],
            indices: false,
            active: [3],
            vars: { hours: 8, speed: 4 },
            caption: 'k shoots an hour, one pile at a time',
          },
        },
        {
          say: 'The easy way tries every speed from one up, until one fits in time.',
          emphasis: ['every', 'speed'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'pseudo',
            file: 'Brute force',
            code: `function minSpeedSlow(piles, h):
    for k from 1 to max(piles):
        if hoursNeeded(piles, k) ≤ h:
            return k`,
            highlight: [[2, 3]],
            note: { line: 3, text: 'every check walks every pile', tone: 'warn' },
          },
        },
        {
          say: 'If a pile has a billion shoots, that is up to a billion speeds to try.',
          emphasis: ['billion'],
          sfx: 'error',
          scene: {
            type: 'stat',
            value: '1B',
            label: 'speeds to try for a *huge* pile',
            sub: 'binary search needs about 30',
            tone: 'bad',
          },
        },
        {
          say: "Write down every speed's answer: no, no, no, then yes forever. That flip is all binary search needs.",
          emphasis: ['flip'],
          scene: {
            type: 'grid',
            title: 'Does speed k fit in 8 hours?',
            colLabels: ['k', 'hrs', 'fits'],
            cells: [
              [1, 24, 'no'],
              [2, 13, 'no'],
              [3, 9, 'no'],
              [4, 7, 'yes'],
              [5, 7, 'yes'],
              [6, 6, 'yes'],
              [7, 5, 'yes'],
              [8, 4, 'yes'],
            ],
            found: [[3, 2]],
          },
        },
        {
          say: "So don't search the piles. Search the speeds from one to eight, the biggest pile, and ask: does it fit?",
          emphasis: ['speeds', 'fit'],
          sfx: 'ding',
          scene: { type: 'title', kicker: 'The insight', title: 'Search the *answers*', emoji: '💡', style: 'slam' },
        },
        {
          say: 'These cells are speeds, not piles. Try the middle, four. Seven hours fits, so the answer is four or slower.',
          emphasis: ['speeds', 'fits'],
          scene: {
            type: 'array',
            title: 'Speeds 1 to 8',
            cells: speeds,
            pointers: { lo: 0, mid: 3, hi: 7 },
            window: [0, 7],
            active: [3],
            vars: { speed: 4, hours: 7, fits: 'yes' },
          },
        },
        {
          say: 'Try speed two. Thirteen hours is too slow, and anything slower is too slow too.',
          emphasis: ['slow'],
          scene: {
            type: 'array',
            title: 'Speeds 1 to 8',
            cells: speeds,
            pointers: { lo: 0, mid: 1, hi: 3 },
            window: [0, 3],
            active: [1],
            done: [4, 5, 6, 7],
            vars: { speed: 2, hours: 13, fits: 'no' },
          },
        },
        {
          say: 'Speed three takes nine hours. Still one hour too slow, so low moves up to four.',
          emphasis: ['nine'],
          scene: {
            type: 'array',
            title: 'Speeds 1 to 8',
            cells: speeds,
            pointers: { lo: 2, mid: 2, hi: 3 },
            window: [2, 3],
            active: [2],
            done: [0, 1, 4, 5, 6, 7],
            vars: { speed: 3, hours: 9, fits: 'no' },
          },
        },
        {
          say: "Low meets high at four. That's the slowest speed that works, found in three checks.",
          emphasis: ['four', 'three'],
          sfx: 'success',
          scene: {
            type: 'array',
            title: 'Speeds 1 to 8',
            cells: speeds,
            pointers: { lo: 3, hi: 3 },
            window: [3, 3],
            found: [3],
            done: [0, 1, 2, 4, 5, 6, 7],
            vars: { speed: 4, hours: 7, fits: 'yes' },
          },
        },
        {
          say: "In code, it's the same first yes loop, with a fits check inside. Each check is one pass over the piles.",
          emphasis: ['fits', 'check'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'minEatingSpeed.js',
            code: `// hrs(piles, k): sum of ceil(p / k)
function minEatingSpeed(piles, h) {
  const ok = k => hrs(piles, k) <= h;
  let lo = 1;
  let hi = Math.max(...piles);
  while (lo < hi) {
    const mid = Math.floor((lo+hi)/2);
    if (ok(mid)) hi = mid;
    else lo = mid + 1;
  }
  return lo;
}`,
            highlight: [8],
            note: { line: 8, text: 'O(n) per check, log(max) checks', tone: 'good' },
          },
        },
        {
          say: 'Reach for this on smallest speed, capacity or days, when checking a guess is easy.',
          emphasis: ['smallest', 'easy'],
          scene: {
            type: 'list',
            title: 'Reach for this when…',
            items: [
              { text: 'Smallest *speed*, size or days', icon: '🚚' },
              { text: 'Checking one guess is easy', icon: '✅' },
              { text: 'Bigger guesses never do worse', icon: '📈' },
            ],
            active: 1,
          },
        },
        {
          say: 'The trap is plain division. Seven shoots at speed three take three hours, not two point three.',
          emphasis: ['three'],
          sfx: 'error',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'trap.js',
            code: `let t = 0;
for (const p of piles) {
  t += p / k;
}
// 7 / 3 = 2.33 hours?`,
            errors: [3],
            note: { line: 3, text: 'round up: Math.ceil(p / k)', tone: 'bad' },
          },
        },
        {
          say: 'Quick check. Why can we binary search the eating speed at all?',
          sfx: 'riser',
          scene: {
            type: 'quiz',
            question: 'Why can we binary search the eating speed?',
            options: ['If k works, faster works', 'The piles are sorted', 'Speeds are whole numbers', 'h is always small'],
            answer: 0,
          },
        },
        {
          say: 'If a speed works, every faster speed works too. That one way flip is all it needs.',
          emphasis: ['faster', 'flip'],
          sfx: 'ding',
          scene: {
            type: 'quiz',
            question: 'Why can we binary search the eating speed?',
            options: ['If k works, faster works', 'The piles are sorted', 'Speeds are whole numbers', 'h is always small'],
            answer: 0,
            reveal: true,
            explain: 'No, no, then yes forever. The piles need no sorting.',
          },
        },
        {
          say: 'Remember this. If you can check a guess, binary search the answer itself. Now tap solve it and try it yourself.',
          emphasis: ['check', 'answer'],
          sfx: 'success',
          scene: {
            type: 'outro',
            points: ['Search the *answers*, not the data', 'Write the check first', 'Cost: one check × *log(range)*'],
            tagline: 'Now go solve it.',
          },
        },
      ],
    },
    {
      id: 'dsa-binary-search-matrix-and-design',
      title: 'Sorted grids and time lookups',
      link: { label: 'Solve it', href: '/dsa#/m/binary-search/matrix-and-design/binary-search-matrix' },
      beats: [
        {
          say: "A phone book has lots of pages. But it's really one long list.",
          emphasis: ['one', 'list'],
          scene: { type: 'title', kicker: 'Binary search · Lesson 5', title: 'A grid is a *folded* list', emoji: '📒', style: 'slam' },
        },
        {
          say: 'Ticket numbers sit in a grid. Each row is sorted, and starts after the last row ends. Is thirty here?',
          emphasis: ['sorted', 'thirty'],
          sfx: 'pop',
          scene: {
            type: 'grid',
            title: 'Sold tickets',
            cells: tickets,
            found: [[2, 1]],
            vars: { target: 30, found: 'yes' },
            caption: 'each row starts after the last ends',
          },
        },
        {
          say: 'The easy way checks every row, and every cell in it.',
          emphasis: ['every'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'pseudo',
            file: 'Brute force',
            code: `function searchGrid(matrix, target):
    for r from 0 to m - 1:
        for c from 0 to n - 1:
            if matrix[r][c] = target:
                return true
    return false`,
            highlight: [[2, 3]],
            note: { line: 3, text: 'a loop in a loop: O(m · n)', tone: 'warn' },
          },
        },
        {
          say: 'A thousand by thousand grid means a million checks. One binary search needs about twenty.',
          emphasis: ['million', 'twenty'],
          sfx: 'error',
          scene: {
            type: 'stat',
            value: '1M',
            label: 'checks for a *1000 × 1000* grid',
            sub: 'one binary search needs about 20',
            tone: 'bad',
          },
        },
        {
          say: 'Read it row after row: one, three, five, seven, then ten. It never goes down. It is one sorted list.',
          emphasis: ['never', 'one'],
          scene: {
            type: 'grid',
            title: 'Spot the shape',
            colLabels: ['0', '1', '2', '3'],
            rowLabels: ['0', '1', '2'],
            cells: tickets,
            active: [[1, 0]],
            reads: [[0, 3]],
            caption: 'row 1 picks up where row 0 ends',
          },
        },
        {
          say: 'So number the cells zero to eleven. Divide by four for the row. The remainder is the column.',
          emphasis: ['row', 'column'],
          sfx: 'ding',
          scene: { type: 'title', kicker: 'The insight', title: 'Unfold it with *division*', emoji: '💡', style: 'slam' },
        },
        {
          say: 'Low is zero, high is eleven, so the middle is five. Five over four is one, remainder one.',
          emphasis: ['five', 'remainder'],
          scene: {
            type: 'grid',
            title: 'Find 30',
            colLabels: ['0', '1', '2', '3'],
            rowLabels: ['0', '1', '2'],
            cells: tickets,
            active: [[1, 1]],
            vars: { mid: 5, row: 1, col: 1, value: 11 },
          },
        },
        {
          say: 'Eleven is too small, so drop it and all before it. Middle eight is row two, column zero: twenty-three.',
          emphasis: ['small', 'twenty-three'],
          scene: {
            type: 'grid',
            title: 'Find 30',
            colLabels: ['0', '1', '2', '3'],
            rowLabels: ['0', '1', '2'],
            cells: tickets,
            active: [[2, 0]],
            done: [[0, 0], [0, 1], [0, 2], [0, 3], [1, 0], [1, 1]],
            vars: { mid: 8, row: 2, col: 0, value: 23 },
          },
        },
        {
          say: 'Still too small. Middle ten is row two, column two. Thirty-four is too big, so high drops to nine.',
          emphasis: ['big', 'nine'],
          scene: {
            type: 'grid',
            title: 'Find 30',
            colLabels: ['0', '1', '2', '3'],
            rowLabels: ['0', '1', '2'],
            cells: tickets,
            active: [[2, 2]],
            done: [[0, 0], [0, 1], [0, 2], [0, 3], [1, 0], [1, 1], [1, 2], [1, 3], [2, 0]],
            vars: { mid: 10, row: 2, col: 2, value: 34 },
          },
        },
        {
          say: 'Middle nine is row two, column one. Thirty! Found in four looks out of twelve.',
          emphasis: ['Thirty', 'four'],
          sfx: 'success',
          scene: {
            type: 'grid',
            title: 'Find 30',
            colLabels: ['0', '1', '2', '3'],
            rowLabels: ['0', '1', '2'],
            cells: tickets,
            found: [[2, 1]],
            done: [[0, 0], [0, 1], [0, 2], [0, 3], [1, 0], [1, 1], [1, 2], [1, 3], [2, 0], [2, 2], [2, 3]],
            vars: { mid: 9, row: 2, col: 1, value: 30 },
          },
        },
        {
          say: 'In code, it is classic binary search. Just turn each mid into a row and a column.',
          emphasis: ['row', 'column'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'searchMatrix.js',
            code: `function searchMatrix(m, target) {
  const cols = m[0].length;
  let lo = 0;
  let hi = m.length * cols - 1;
  while (lo <= hi) {
    const mid = Math.floor((lo+hi)/2);
    const r = Math.floor(mid / cols);
    const v = m[r][mid % cols];
    if (v === target) return true;
    if (v < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return false;
}`,
            highlight: [[7, 8]],
            note: { line: 8, text: 'one search: O(log(m · n))', tone: 'good' },
          },
        },
        {
          say: 'Reach for this when each row picks up where the last one ends, or you look up a value at a time.',
          emphasis: ['row', 'time'],
          scene: {
            type: 'list',
            title: 'Reach for this when…',
            items: [
              { text: 'Each row starts after the last', icon: '📒' },
              { text: 'One lookup, in *log* time', icon: '⏱️' },
              { text: 'A design asks "value at time t"', icon: '🕰️' },
            ],
            active: 0,
          },
        },
        {
          say: 'The trap is dividing by the rows. Square grids hide this bug, so always test a wide grid.',
          emphasis: ['rows', 'wide'],
          sfx: 'error',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'trap.js',
            code: `const r = Math.floor(mid / rows);
const c = mid % rows;
// a square grid hides the bug`,
            errors: [[1, 2]],
            note: { line: 2, text: 'divide by columns, not rows', tone: 'bad' },
          },
        },
        {
          say: 'Quick check. A grid has three rows and five columns. Where is position seven?',
          sfx: 'riser',
          scene: {
            type: 'quiz',
            question: '3 rows, 5 columns. Where is position 7?',
            options: ['Row 1, col 2', 'Row 2, col 1', 'Row 2, col 2', 'Row 1, col 3'],
            answer: 0,
          },
        },
        {
          say: 'Row one, column two. Seven over five is one, with two left over.',
          emphasis: ['one', 'two'],
          sfx: 'ding',
          scene: {
            type: 'quiz',
            question: '3 rows, 5 columns. Where is position 7?',
            options: ['Row 1, col 2', 'Row 2, col 1', 'Row 2, col 2', 'Row 1, col 3'],
            answer: 0,
            reveal: true,
            explain: 'Divide by columns: 7 / 5 = 1, remainder 2.',
          },
        },
        {
          say: 'Remember this. A grid whose rows chain is one sorted list in disguise. Now tap solve it and try it yourself.',
          emphasis: ['one', 'list'],
          sfx: 'success',
          scene: {
            type: 'outro',
            points: ['A chained grid is *one* sorted list', 'Row = i / cols, col = i % cols', 'Value at time t: upper bound'],
            tagline: 'Now go solve it.',
          },
        },
      ],
    },
  ],
};
