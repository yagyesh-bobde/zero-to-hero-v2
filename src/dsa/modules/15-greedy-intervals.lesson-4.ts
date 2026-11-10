import type { Lesson } from '../types';

const erasePseudo = `function eraseOverlapIntervals(intervals):
    sort intervals by end
    kept ← 0
    lastEnd ← -infinity
    for each [s, e] in intervals:
        if s ≥ lastEnd:              // starts after the last kept one ends
            kept ← kept + 1
            lastEnd ← e
        // else: it clashes, drop it
    return n - kept`;

const eraseCode = `function eraseOverlapIntervals(intervals) {
  intervals.sort((a, b) => a[1] - b[1]);
  let kept = 0;
  let lastEnd = -Infinity;
  for (const [s, e] of intervals) {
    if (s >= lastEnd) {
      kept++;
      lastEnd = e;
    }
  }
  return intervals.length - kept;
}`;

const arrowsCode = `function findMinArrowShots(points) {
  if (points.length === 0) return 0;
  points.sort((a, b) => a[1] - b[1]);
  let arrows = 1;
  let arrow = points[0][1]; // shoot at the first end
  for (const [s, e] of points) {
    if (s > arrow) {
      arrows++;
      arrow = e;
    }
  }
  return arrows;
}`;

const coveredCode = `function removeCoveredIntervals(intervals) {
  intervals.sort((a, b) => a[0] - b[0] || b[1] - a[1]);
  let count = 0;
  let maxEnd = -Infinity;
  for (const [, e] of intervals) {
    if (e > maxEnd) {
      count++;
      maxEnd = e;
    }
  }
  return count;
}`;

const lesson: Lesson = {
  id: 'sort-by-end',
  title: 'Sort by end: keep the most, shoot the fewest',
  summary: 'To fit the most intervals, always keep the one that finishes first.',
  minutes: 20,
  blocks: [
    {
      kind: 'callout',
      tone: 'story',
      title: 'A day at a music festival',
      text: 'Six shows on different stages, each with a start and end time. You want to see as many *full* shows as possible, and you can only be at one show at a time. You can\'t see them all, so which do you skip? A single meeting room taking the most bookings, or one airport gate taking the most flights, is the same choice.',
    },
    {
      kind: 'text',
      text: '**The problem.** Shows `[[1,3], [2,5], [4,6], [6,8], [5,9], [8,10]]`. A show ending at 6 and one starting at 6 don\'t clash. What is the most shows you can watch? Its twin asks for the fewest shows to **remove** so nothing overlaps. That is just `total − most kept`. Here: keep 4, remove 2.',
    },
    {
      kind: 'text',
      text: '**Brute force first.** Try every subset of shows, check that none overlap, and keep the biggest. Correct, but there are 2ⁿ subsets: 40 shows is already a trillion.',
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Brute force: every subset',
      code: `function mostShows(shows):
    best ← 0
    for each subset of shows:
        if no two shows in subset overlap:
            best ← max(best, size of subset)
    return best`,
    },
    {
      kind: 'text',
      text: '**Spot the waste: which show first?** Most subsets are obviously bad. A smart rule would pick one show, then the next, and never look back. But which rule? "Earliest start" fails: `[1, 100]` starts first and blocks everything. "Shortest first" fails too:',
    },
    {
      kind: 'diagram',
      title: 'Shortest first loses',
      art: `time:     1  2  3  4  5  6  7  8  9  10
A [1,5]   |-----------|
B [4,7]            |--------|
C [6,10]                 |-----------|

shortest first: B (length 3), blocks A and C -> 1
earliest end:   A (ends at 5), then C         -> 2`,
      caption: 'B is the shortest show, but it sits right across the gap between A and C.',
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'Keep the one that ends first',
      text: 'Pick the show that **ends** earliest. Then the next show that starts after it ends, and so on. Why is it safe? Take any best plan. Swap its first show for the earliest-ending show. That show ends no later, so the rest of the plan still fits. Same count, and now it starts with your choice. The same swap works at every step.',
    },
    {
      kind: 'steps',
      title: 'Shows sorted by end',
      frames: [
        {
          cells: ['[1,3]', '[2,5]', '[4,6]', '[6,8]', '[5,9]', '[8,10]'],
          pointers: { i: 0 },
          active: [0],
          found: [0],
          vars: { 'last end': 3, kept: 1 },
          note: 'Sorted by end. `[1,3]` ends first: keep it. The last kept show ends at 3.',
        },
        {
          cells: ['[1,3]', '[2,5]', '[4,6]', '[6,8]', '[5,9]', '[8,10]'],
          pointers: { i: 1 },
          active: [1],
          found: [0],
          done: [1],
          vars: { 'last end': 3, kept: 1 },
          note: '`[2,5]` starts at 2, before 3. It clashes: skip it.',
        },
        {
          cells: ['[1,3]', '[2,5]', '[4,6]', '[6,8]', '[5,9]', '[8,10]'],
          pointers: { i: 2 },
          active: [2],
          found: [0, 2],
          done: [1],
          vars: { 'last end': 6, kept: 2 },
          note: '`[4,6]` starts at 4, after 3. Keep it. Last end = 6.',
        },
        {
          cells: ['[1,3]', '[2,5]', '[4,6]', '[6,8]', '[5,9]', '[8,10]'],
          pointers: { i: 3 },
          active: [3],
          found: [0, 2, 3],
          done: [1],
          vars: { 'last end': 8, kept: 3 },
          note: '`[6,8]` starts at 6, exactly when the last one ends. Touching is fine here: keep it.',
        },
        {
          cells: ['[1,3]', '[2,5]', '[4,6]', '[6,8]', '[5,9]', '[8,10]'],
          pointers: { i: 4 },
          active: [4],
          found: [0, 2, 3],
          done: [1, 4],
          vars: { 'last end': 8, kept: 3 },
          note: '`[5,9]` starts at 5, before 8. Skip.',
        },
        {
          cells: ['[1,3]', '[2,5]', '[4,6]', '[6,8]', '[5,9]', '[8,10]'],
          pointers: { i: 5 },
          active: [5],
          found: [0, 2, 3, 5],
          done: [1, 4],
          vars: { 'last end': 10, kept: 4 },
          note: '`[8,10]` starts at 8. Keep it.',
        },
        {
          cells: ['[1,3]', '[2,5]', '[4,6]', '[6,8]', '[5,9]', '[8,10]'],
          found: [0, 2, 3, 5],
          done: [1, 4],
          vars: { kept: 4, removed: 2 },
          note: 'Kept 4 of 6. To remove every overlap, drop 6 − 4 = **2** shows.',
        },
      ],
    },
    { kind: 'code', lang: 'pseudo', title: 'Non-overlapping Intervals', code: erasePseudo },
    { kind: 'code', lang: 'js', title: 'Non-overlapping Intervals in JavaScript', code: eraseCode },
    {
      kind: 'compare',
      title: 'Most intervals with no overlap',
      rows: [
        { approach: 'Try every subset', time: 'O(2ⁿ · n)', space: 'O(n)', note: 'Correct, useless past about 25 intervals.' },
        { approach: 'DP over sorted intervals', time: 'O(n²)', space: 'O(n)', note: 'Works (module 16 teaches this kind of DP), but slower and longer.' },
        { approach: 'Sort by end (greedy)', time: 'O(n log n)', space: 'O(1) extra', note: 'Sort, then one pass.' },
      ],
    },
    {
      kind: 'text',
      text: '**Level up: arrows and balloons.** Balloons are taped flat on a wall, each covering `[x1, x2]`. An arrow shot straight up at position `x` pops every balloon with `x1 ≤ x ≤ x2`. Fewest arrows? Same greedy. Sort by end. The first balloon needs some arrow; shoot it at the balloon\'s **end**, the farthest right it can go while still popping it. Skip every balloon that arrow already pops. Repeat.',
    },
    {
      kind: 'trace',
      title: 'Arrows for [[10,16], [2,8], [1,6], [7,12]]',
      columns: ['balloon', 'start > arrow?', 'action', 'arrow at', 'arrows'],
      rows: [
        ['[1,6]', 'first one', 'shoot at its end', 6, 1],
        ['[2,8]', '2 > 6? no', 'already popped', 6, 1],
        ['[7,12]', '7 > 6? yes', 'shoot at its end', 12, 2],
        ['[10,16]', '10 > 12? no', 'already popped', 12, 2],
      ],
      note: 'Sorted by end: `[1,6], [2,8], [7,12], [10,16]`. Two arrows. A balloon that starts exactly at the arrow is popped, so you need a new arrow only when `start > arrow`.',
    },
    { kind: 'text', text: '**The pattern: sort by end.** Reach for it when you see:' },
    {
      kind: 'list',
      items: [
        'The **most** intervals with no overlap, or the **fewest** to remove.',
        'The **fewest** points (arrows, cameras, guards) so that every interval contains one.',
        'Taking an interval "uses up" time, and you want to leave the most room for the rest.',
      ],
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Template: sort by end',
      code: `sort intervals by end
count ← 0
lastEnd ← -infinity
for each [s, e] in intervals:
    if s ≥ lastEnd:        // use s > lastEnd if touching clashes
        count ← count + 1
        lastEnd ← e
return count`,
    },
    {
      kind: 'callout',
      tone: 'trap',
      title: '≥ or >? Read what "touching" means',
      text: 'In Non-overlapping Intervals, `[1, 2]` and `[2, 3]` do *not* overlap, so you keep the next one when `s ≥ lastEnd`. With balloons, one arrow at 2 pops both `[1, 2]` and `[2, 3]`, so you need a new arrow only when `s > arrow`. Same code, one character different, and swapping them breaks half the tests.',
    },
  ],
  problems: [
    {
      id: 'greedy-intervals-non-overlapping',
      title: 'Non-overlapping Intervals',
      difficulty: 'medium',
      leetcode: 435,
      pattern: 'Sort by end',
      statement:
        'You get a list of bookings `[start, end]` for one room. Remove as few bookings as possible so that no two of the rest overlap. Bookings that only touch, like `[1, 2]` and `[2, 3]`, do not overlap. Return how many you remove.',
      examples: [
        { input: 'intervals = [[1, 2], [2, 3], [3, 4], [1, 3]]', output: '1', explain: 'Remove [1, 3]. The rest only touch.' },
        { input: 'intervals = [[1, 2], [1, 2], [1, 2]]', output: '2' },
        { input: 'intervals = [[1, 2], [2, 3]]', output: '0' },
      ],
      constraints: ['0 ≤ intervals.length ≤ 10⁵', '−5·10⁴ ≤ start < end ≤ 5·10⁴'],
      hints: [
        'Flip it: removing the fewest is the same as keeping the most.',
        'Which booking is the safest one to keep first? The one that leaves the most room for the others.',
        'Sort by end. Keep a booking if it starts at or after the end of the last one you kept. Answer = n − kept.',
      ],
      approaches: [
        {
          name: 'Try every subset',
          idea: 'Check every subset for overlaps and keep the largest clean one. Correct, but 2ⁿ subsets.',
          time: 'O(2ⁿ · n)',
          space: 'O(n)',
        },
        {
          name: 'DP over sorted intervals',
          idea: 'Sort by start. `best[i]` = most bookings you can keep ending with booking `i`, built from every earlier booking that ends before `i` starts. Correct but quadratic.',
          time: 'O(n²)',
          space: 'O(n)',
        },
        {
          name: 'Sort by end (greedy)',
          idea: 'The booking that ends first leaves the most room. Any best plan can swap its first booking for this one and still fit everything else. Keep it, skip whatever clashes, repeat.',
          pseudo: erasePseudo,
          code: eraseCode,
          time: 'O(n log n)',
          space: 'O(1) extra',
        },
      ],
      fn: 'eraseOverlapIntervals',
      starter: `function eraseOverlapIntervals(intervals) {
  // Return the fewest intervals to remove so none overlap.
  return 0;
}`,
      solution: eraseCode,
      tests: [
        { name: 'example', args: [[[1, 2], [2, 3], [3, 4], [1, 3]]], expected: 1 },
        { name: 'all the same', args: [[[1, 2], [1, 2], [1, 2]]], expected: 2 },
        { name: 'touching is fine', args: [[[1, 2], [2, 3]]], expected: 0 },
        { name: 'empty', args: [[]], expected: 0 },
        { name: 'festival shows', args: [[[1, 3], [2, 5], [4, 6], [6, 8], [5, 9], [8, 10]]], expected: 2 },
        { name: 'shortest-first trap', args: [[[1, 5], [4, 7], [6, 10]]], expected: 1 },
        { name: 'one long blocker', args: [[[1, 100], [11, 22], [1, 11], [2, 12]]], expected: 2 },
        { name: 'negatives', args: [[[-5, -1], [-3, 2], [0, 4]]], expected: 1 },
      ],
      takeaway: 'Most intervals kept = sort by end, keep whatever fits. Fewest removed = n − that.',
    },
    {
      id: 'greedy-intervals-min-arrows',
      title: 'Pop All the Balloons',
      difficulty: 'medium',
      leetcode: 452,
      pattern: 'Sort by end',
      statement:
        'Balloons are taped flat along a wall. Balloon `i` covers the range `points[i] = [x1, x2]`. You shoot arrows straight up from the floor. An arrow at position `x` pops every balloon with `x1 ≤ x ≤ x2` and keeps flying. Return the fewest arrows needed to pop every balloon.',
      examples: [
        { input: 'points = [[10, 16], [2, 8], [1, 6], [7, 12]]', output: '2', explain: 'An arrow at 6 pops [1, 6] and [2, 8]. An arrow at 12 pops [7, 12] and [10, 16].' },
        { input: 'points = [[1, 2], [3, 4], [5, 6], [7, 8]]', output: '4' },
        { input: 'points = [[1, 2], [2, 3], [3, 4], [4, 5]]', output: '2', explain: 'Arrows at 2 and 4.' },
      ],
      constraints: ['0 ≤ points.length ≤ 10⁵', '−2³¹ ≤ x1 ≤ x2 ≤ 2³¹ − 1'],
      hints: [
        'Look at the balloon that ends first. Some arrow must pop it. Where should that arrow go?',
        'As far right as it can while still hitting that balloon: exactly at its end. That way it hits the most other balloons too.',
        'Sort by end. Shoot at the first end. Skip balloons with `start ≤ arrow`. When `start > arrow`, shoot a new arrow at this balloon\'s end.',
      ],
      approaches: [
        {
          name: 'Sort by start, shrink the group',
          idea: 'Sort by start. Keep a group of balloons that one arrow can still hit: the arrow must be at or before the smallest end in the group. When a balloon starts after that smallest end, the group is done: one arrow, start a new group. Correct, but you must remember to shrink with `min`.',
          time: 'O(n log n)',
          space: 'O(1) extra',
        },
        {
          name: 'Sort by end (greedy)',
          idea: 'The balloon that ends first must be popped by an arrow at or before its end. Putting the arrow exactly at its end is never worse than earlier, because it reaches every balloon an earlier arrow would, and maybe more.',
          pseudo: `function findMinArrowShots(points):
    if points is empty:
        return 0
    sort points by end
    arrows ← 1
    arrow ← end of points[0]          // shoot at the first end
    for each [s, e] in points:
        if s > arrow:                 // out of reach of this arrow
            arrows ← arrows + 1
            arrow ← e
    return arrows`,
          code: arrowsCode,
          time: 'O(n log n)',
          space: 'O(1) extra',
        },
      ],
      fn: 'findMinArrowShots',
      starter: `function findMinArrowShots(points) {
  // Return the fewest arrows that pop every balloon.
  return 0;
}`,
      solution: arrowsCode,
      tests: [
        { name: 'example', args: [[[10, 16], [2, 8], [1, 6], [7, 12]]], expected: 2 },
        { name: 'no overlaps', args: [[[1, 2], [3, 4], [5, 6], [7, 8]]], expected: 4 },
        { name: 'touching shares an arrow', args: [[[1, 2], [2, 3], [3, 4], [4, 5]]], expected: 2 },
        { name: 'one balloon', args: [[[1, 2]]], expected: 1 },
        { name: 'no balloons', args: [[]], expected: 0 },
        { name: 'long balloon over short ones', args: [[[1, 10], [2, 3], [4, 5]]], expected: 2 },
        { name: 'huge values', args: [[[-2147483646, -2147483645], [2147483646, 2147483647]]], expected: 2 },
        {
          name: 'many overlaps',
          args: [[[3, 9], [7, 12], [3, 8], [6, 8], [9, 10], [2, 9], [0, 9], [3, 9], [0, 6], [2, 8]]],
          expected: 2,
        },
      ],
      takeaway: 'Fewest points that hit every interval: sort by end and put each point at an end.',
    },
    {
      id: 'greedy-intervals-remove-covered',
      title: 'Remove Covered Zones',
      difficulty: 'medium',
      leetcode: 1288,
      pattern: 'Sort with a tie-break',
      statement:
        'A delivery app splits one long street into zones, each `[start, end]`. A zone is *covered* if another zone contains it completely: `[a, b]` is covered by `[c, d]` when `c ≤ a` and `b ≤ d`. Remove every covered zone and return how many are left. No two zones are exactly the same.',
      examples: [
        { input: 'intervals = [[1, 4], [3, 6], [2, 8]]', output: '2', explain: '[3, 6] sits inside [2, 8].' },
        { input: 'intervals = [[1, 4], [2, 3]]', output: '1' },
      ],
      constraints: ['1 ≤ intervals.length ≤ 1000', '0 ≤ start < end ≤ 10⁵', 'all intervals are different'],
      hints: [
        'Sort by start. Now a zone can only be covered by a zone that comes before it.',
        'Track the biggest end seen so far. If the current zone ends at or before it, it is covered.',
        'Ties: `[1, 2]` and `[1, 4]` have the same start. Put the longer one first (end descending on ties) so the shorter one gets caught.',
      ],
      approaches: [
        {
          name: 'Check every pair',
          idea: 'For each zone, look for any other zone that contains it. Correct, but n² pairs.',
          time: 'O(n²)',
          space: 'O(1)',
        },
        {
          name: 'Sort by start, then end descending',
          idea: 'After this sort, every earlier zone starts no later than the current one. So the current zone is covered exactly when some earlier zone ends at or after it: compare with the biggest end so far. The tie-break makes sure a longer zone with the same start comes first.',
          pseudo: `function removeCoveredIntervals(intervals):
    sort by start ascending, and by end descending when starts tie
    count ← 0
    maxEnd ← -infinity
    for each [s, e] in intervals:
        if e > maxEnd:           // sticks out past every earlier zone
            count ← count + 1
            maxEnd ← e
        // else: an earlier zone starts no later and ends no earlier
    return count`,
          code: coveredCode,
          time: 'O(n log n)',
          space: 'O(1) extra',
        },
      ],
      fn: 'removeCoveredIntervals',
      starter: `function removeCoveredIntervals(intervals) {
  // Return how many intervals are not covered by another.
  return 0;
}`,
      solution: coveredCode,
      tests: [
        { name: 'example', args: [[[1, 4], [3, 6], [2, 8]]], expected: 2 },
        { name: 'one inside another', args: [[[1, 4], [2, 3]]], expected: 1 },
        { name: 'same start (tie-break)', args: [[[1, 2], [1, 4], [3, 4]]], expected: 1 },
        { name: 'one zone', args: [[[1, 2]]], expected: 1 },
        { name: 'no covering', args: [[[1, 2], [3, 4]]], expected: 2 },
        { name: 'same end', args: [[[3, 10], [4, 10], [5, 11]]], expected: 2 },
        { name: 'partial overlap only', args: [[[0, 10], [5, 12]]], expected: 2 },
      ],
      takeaway: 'Pick the sort key, and the tie-break, that makes the check a single comparison.',
    },
  ],
  quiz: [
    {
      prompt: 'Which rule is safe for keeping the most non-overlapping intervals?',
      options: ['Earliest start first', 'Shortest first', 'Earliest end first', 'Latest start first'],
      answer: 2,
      explanation: 'Earliest start fails on `[1, 100]`. Shortest fails on `[1,5], [4,7], [6,10]`. Earliest end always leaves the most room.',
    },
    {
      prompt: 'You can keep at most `k` of `n` intervals without overlaps. How many must you remove?',
      options: ['k', 'n − k', 'n − k − 1', 'n / k'],
      answer: 1,
      explanation: 'Removing the fewest is the same as keeping the most.',
    },
    {
      prompt: 'Balloons `[1, 2]` and `[2, 3]`. How many arrows?',
      options: ['1', '2'],
      answer: 0,
      explanation: 'An arrow at 2 hits both, because `x1 ≤ 2 ≤ x2` for each. That is why balloons use `start > arrow`.',
    },
    {
      prompt: 'Remove Covered Intervals sorts by start, then by end **descending** on ties. Why?',
      options: [
        'To keep the sort stable',
        'So the longest zone with a given start comes first and catches the shorter ones',
        'So the output is sorted',
        'It does not matter',
      ],
      answer: 1,
      explanation: 'With `[1, 2]` before `[1, 4]`, the shorter one would be counted before the zone that covers it shows up.',
    },
  ],
  takeaways: [
    'To fit the most intervals, keep the one that ends first. It leaves the most room for the rest.',
    'Fewest removed = `n − most kept`.',
    'Fewest points that hit every interval: sort by end and place each point at an end.',
    'Decide whether touching counts. `≥` versus `>` is the whole difference between 435 and 452.',
  ],
};

export default lesson;
