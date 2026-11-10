import type { Lesson } from '../types';

const mergePseudo = `function merge(intervals):
    sort intervals by start
    out ← empty list
    for each [s, e] in intervals:
        if out is not empty and s ≤ end of last in out:
            end of last ← max(end of last, e)    // overlap: stretch
        else:
            append [s, e] to out                 // gap: new block
    return out`;

const mergeCode = `function merge(intervals) {
  intervals.sort((a, b) => a[0] - b[0]);
  const out = [];
  for (const [s, e] of intervals) {
    const last = out[out.length - 1];
    if (last && s <= last[1]) {
      last[1] = Math.max(last[1], e); // overlap: stretch
    } else {
      out.push([s, e]); // gap: new block
    }
  }
  return out;
}`;

const insertCode = `function insert(intervals, newInterval) {
  const out = [];
  let [ns, ne] = newInterval;
  let i = 0;
  const n = intervals.length;
  while (i < n && intervals[i][1] < ns) out.push(intervals[i++]); // before
  while (i < n && intervals[i][0] <= ne) {
    // overlaps the new one: swallow it
    ns = Math.min(ns, intervals[i][0]);
    ne = Math.max(ne, intervals[i][1]);
    i++;
  }
  out.push([ns, ne]);
  while (i < n) out.push(intervals[i++]); // after
  return out;
}`;

const roomsCode = `function canAttendAll(intervals) {
  intervals.sort((a, b) => a[0] - b[0]);
  for (let i = 1; i < intervals.length; i++) {
    if (intervals[i][0] < intervals[i - 1][1]) return false;
  }
  return true;
}`;

const intersectCode = `function intervalIntersection(a, b) {
  const out = [];
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    const lo = Math.max(a[i][0], b[j][0]);
    const hi = Math.min(a[i][1], b[j][1]);
    if (lo <= hi) out.push([lo, hi]);
    if (a[i][1] < b[j][1]) i++; // a[i] ends first: it is used up
    else j++;
  }
  return out;
}`;

const lesson: Lesson = {
  id: 'merge-intervals',
  title: 'Merge and insert intervals',
  summary: 'Sort by start, then each interval either stretches the last block or starts a new one.',
  minutes: 22,
  blocks: [
    {
      kind: 'callout',
      tone: 'story',
      title: 'Your calendar\'s "busy" view',
      text: 'When you share your calendar, people see busy blocks, not your meetings. Standup 9:00-9:30, a 1:1 at 9:15-10:00 and lunch at 12-1 show up as two blocks: 9:00-10:00 and 12-1. The calendar app had to *merge* the overlapping times. Booking sites, video editors joining clips, and download managers joining byte ranges all do the same thing.',
    },
    {
      kind: 'text',
      text: 'An **interval** is a pair `[start, end]`. Two intervals **overlap** when one starts before the other ends. **The problem:** merge every overlapping group in `[[1, 3], [8, 10], [2, 6], [15, 18]]` into one interval. Answer: `[[1, 6], [8, 10], [15, 18]]`. In this problem, intervals that only touch, like `[1, 2]` and `[2, 3]`, also merge (into `[1, 3]`).',
    },
    {
      kind: 'text',
      text: '**Brute force first.** Compare every pair. If two overlap, replace them with one interval that covers both. Repeat until a full pass changes nothing.',
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Brute force: merge pairs until nothing changes',
      code: `function mergeSlow(intervals):
    changed ← true
    while changed:
        changed ← false
        for each pair a, b in intervals:
            if a.start ≤ b.end and b.start ≤ a.end:     // overlap
                remove a and b from intervals
                add [min(a.start, b.start), max(a.end, b.end)]
                changed ← true
                stop this pass                           // list changed
    return intervals`,
    },
    {
      kind: 'text',
      text: '**Spot the waste.** One pass looks at O(n²) pairs, and you may need up to n passes: O(n³). The waste comes from the mess. In random order, *any* interval might overlap *any* other, so you keep re-checking pairs you already looked at.',
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'Sort by start',
      text: 'Sort the intervals by start. Walk left to right and keep a list of finished blocks. The next interval starts at or after every block you built, and every block except the last already ended before the last one began. So it can only overlap the **last** block. Either it starts before that block ends (stretch the block\'s end), or it starts after it (begin a new block). One look per interval.',
    },
    {
      kind: 'steps',
      title: 'Merging after the sort',
      frames: [
        {
          cells: ['[1,3]', '[8,10]', '[2,6]', '[15,18]'],
          active: [0, 2],
          note: 'Unsorted. `[1,3]` and `[2,6]` overlap, but they are not next to each other. You would have to check every pair.',
        },
        {
          cells: ['[1,3]', '[2,6]', '[8,10]', '[15,18]'],
          pointers: { i: 0 },
          active: [0],
          vars: { out: '[1,3]' },
          note: 'Sorted by start. The first interval starts the first block.',
        },
        {
          cells: ['[1,3]', '[2,6]', '[8,10]', '[15,18]'],
          pointers: { i: 1 },
          active: [1],
          done: [0],
          vars: { out: '[1,6]' },
          note: '`[2,6]` starts at 2, before the last block ends (3). Overlap: stretch the end to max(3, 6) = 6.',
        },
        {
          cells: ['[1,3]', '[2,6]', '[8,10]', '[15,18]'],
          pointers: { i: 2 },
          active: [2],
          done: [0, 1],
          vars: { out: '[1,6] [8,10]' },
          note: '`[8,10]` starts at 8, after 6. No overlap: start a new block.',
        },
        {
          cells: ['[1,3]', '[2,6]', '[8,10]', '[15,18]'],
          pointers: { i: 3 },
          active: [3],
          done: [0, 1, 2],
          vars: { out: '[1,6] [8,10] [15,18]' },
          note: '15 is after 10: another new block.',
        },
        {
          cells: ['[1,3]', '[2,6]', '[8,10]', '[15,18]'],
          found: [0, 1, 2, 3],
          vars: { out: '[1,6] [8,10] [15,18]' },
          note: 'One pass after the sort. Answer: `[[1,6], [8,10], [15,18]]`.',
        },
      ],
    },
    { kind: 'code', lang: 'pseudo', title: 'Merge Intervals', code: mergePseudo },
    { kind: 'code', lang: 'js', title: 'Merge Intervals in JavaScript', code: mergeCode },
    {
      kind: 'compare',
      title: 'Merging n intervals',
      rows: [
        { approach: 'Merge pairs until stable', time: 'O(n³)', space: 'O(n)', note: 'Re-checks the same pairs every pass.' },
        { approach: 'Sort by start + one sweep', time: 'O(n log n)', space: 'O(n)', note: 'The sort is the slow part. The sweep is O(n). Output can be n intervals.' },
      ],
    },
    {
      kind: 'text',
      text: '**Level up: insert one interval.** Now the list is already sorted with no overlaps, and one new booking comes in. Don\'t sort again. Walk once, in three parts. Intervals that end before the new one starts: copy them. Intervals that overlap it: swallow them into it (stretch its start and end). Everything after: copy.',
    },
    {
      kind: 'diagram',
      title: 'Insert [4, 8]',
      art: `new:            [4 ........... 8]
list:  [1,2]  [3,5]  [6,7]  [8,10]  [12,16]
       before |-- overlaps new --|  after

swallow: [min(4,3), max(8,10)] = [3,10]
result:  [1,2]  [3,10]  [12,16]`,
      caption: '`[8, 10]` only touches the new interval at 8, and in this problem touching merges. `[12, 16]` starts after 10, so it is copied as is.',
    },
    { kind: 'text', text: '**The pattern: sort by start, then sweep.** Reach for it when you see:' },
    {
      kind: 'list',
      items: [
        'A list of `[start, end]` pairs: meetings, bookings, time ranges, byte ranges.',
        'Words like *merge*, *overlap*, *combine*, *conflict*, *free time*.',
        'The input order doesn\'t matter, so you are free to sort it. (If it is already sorted, skip the sort.)',
      ],
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Template: sort by start, sweep',
      code: `sort intervals by start
out ← empty list
for each [s, e] in intervals:
    if out not empty and s ≤ end of last in out:
        end of last ← max(end of last, e)
    else:
        append [s, e] to out
return out`,
    },
    {
      kind: 'callout',
      tone: 'trap',
      title: 'Two bugs everyone writes once',
      text: 'First, `intervals.sort()` with no comparator turns each pair into text, so `[10, 12]` ("10,12") lands before `[2, 3]` ("2,3"). Write `intervals.sort((a, b) => a[0] - b[0])`. Second, stretch with `max(last end, e)`, not `e`. With `[1, 10]` then `[2, 3]`, setting the end to 3 shrinks the block and loses 4 to 10.',
    },
  ],
  problems: [
    {
      id: 'greedy-intervals-merge-intervals',
      title: 'Merge Intervals',
      difficulty: 'medium',
      leetcode: 56,
      pattern: 'Sort by start + sweep',
      statement:
        'Given a list of intervals `[start, end]` in any order, merge every group that overlaps into one interval. Intervals that only touch (`[1, 4]` and `[4, 5]`) also merge. Return the merged intervals sorted by start.',
      examples: [
        { input: 'intervals = [[1, 3], [2, 6], [8, 10], [15, 18]]', output: '[[1, 6], [8, 10], [15, 18]]' },
        { input: 'intervals = [[1, 4], [4, 5]]', output: '[[1, 5]]', explain: 'They touch at 4, so they merge.' },
      ],
      constraints: ['0 ≤ intervals.length ≤ 10⁴', '0 ≤ start ≤ end ≤ 10⁴'],
      hints: [
        'In random order, any interval could overlap any other. What order would make overlaps sit next to each other?',
        'Sort by start. Now the next interval can only overlap the last block you built.',
        'If `start ≤ last end`, set `last end = max(last end, end)`. Otherwise push a new block.',
      ],
      approaches: [
        {
          name: 'Merge pairs until stable',
          idea: 'Keep merging any two overlapping intervals until a full pass changes nothing. Correct because it stops only when no overlaps are left, but it re-checks pairs over and over.',
          time: 'O(n³)',
          space: 'O(n)',
        },
        {
          name: 'Sort by start + sweep',
          idea: 'After sorting, every block before the last one ended before the last one started, so a new interval can only touch the last block. Stretch it or start a new one.',
          pseudo: mergePseudo,
          code: mergeCode,
          time: 'O(n log n)',
          space: 'O(n)',
        },
      ],
      fn: 'merge',
      starter: `function merge(intervals) {
  // Return the merged intervals, sorted by start.
  return [];
}`,
      solution: mergeCode,
      tests: [
        { name: 'example', args: [[[1, 3], [2, 6], [8, 10], [15, 18]]], expected: [[1, 6], [8, 10], [15, 18]] },
        { name: 'touching', args: [[[1, 4], [4, 5]]], expected: [[1, 5]] },
        { name: 'one interval', args: [[[1, 4]]], expected: [[1, 4]] },
        { name: 'empty', args: [[]], expected: [] },
        { name: 'one swallows the rest', args: [[[1, 10], [2, 3], [4, 5]]], expected: [[1, 10]] },
        { name: 'unsorted, no overlaps', args: [[[5, 6], [1, 2], [3, 4]]], expected: [[1, 2], [3, 4], [5, 6]] },
        { name: 'double digits (sort trap)', args: [[[10, 12], [2, 3]]], expected: [[2, 3], [10, 12]] },
        { name: 'starts before the first', args: [[[1, 4], [0, 4]]], expected: [[0, 4]] },
        { name: 'duplicates', args: [[[1, 3], [1, 3]]], expected: [[1, 3]] },
      ],
      takeaway: 'Sort by start, and each interval only needs to look at the last block.',
    },
    {
      id: 'greedy-intervals-insert-interval',
      title: 'Insert Interval',
      difficulty: 'medium',
      leetcode: 57,
      pattern: 'Sorted sweep in three parts',
      statement:
        'Your calendar keeps busy blocks as a list of intervals that is **sorted by start** and has **no overlaps**. A new booking `newInterval` arrives. Add it, merging anything it overlaps (touching counts), so the list is again sorted with no overlaps. Return the new list.',
      examples: [
        { input: 'intervals = [[1, 3], [6, 9]], newInterval = [2, 5]', output: '[[1, 5], [6, 9]]' },
        {
          input: 'intervals = [[1, 2], [3, 5], [6, 7], [8, 10], [12, 16]], newInterval = [4, 8]',
          output: '[[1, 2], [3, 10], [12, 16]]',
          explain: '[4, 8] overlaps [3, 5], [6, 7] and touches [8, 10].',
        },
      ],
      constraints: ['0 ≤ intervals.length ≤ 10⁴', 'intervals is sorted by start with no overlaps'],
      hints: [
        'The list is already sorted. Do you need to sort again?',
        'Split the list into three parts: ends before the new one starts, overlaps it, starts after it ends.',
        'For the middle part, grow the new interval: `start = min(start, s)`, `end = max(end, e)`. Push it once, after the middle part.',
      ],
      approaches: [
        {
          name: 'Append, then merge',
          idea: 'Push `newInterval` onto the list and run Merge Intervals. Correct, but it sorts a list that was already sorted.',
          time: 'O(n log n)',
          space: 'O(n)',
        },
        {
          name: 'One pass in three parts',
          idea: 'Because the list is sorted and has no overlaps, the intervals that overlap the new one sit together in one stretch. Copy what comes before, swallow the stretch into the new interval, copy what comes after.',
          pseudo: `function insert(intervals, newInterval):
    out ← empty list
    [ns, ne] ← newInterval
    i ← 0
    while i < n and intervals[i].end < ns:        // fully before
        append intervals[i] to out
        i ← i + 1
    while i < n and intervals[i].start ≤ ne:      // overlaps new
        ns ← min(ns, intervals[i].start)
        ne ← max(ne, intervals[i].end)
        i ← i + 1
    append [ns, ne] to out
    while i < n:                                  // fully after
        append intervals[i] to out
        i ← i + 1
    return out`,
          code: insertCode,
          time: 'O(n)',
          space: 'O(n)',
        },
      ],
      fn: 'insert',
      starter: `function insert(intervals, newInterval) {
  // Return the list with newInterval added and merged.
  return [];
}`,
      solution: insertCode,
      tests: [
        { name: 'example', args: [[[1, 3], [6, 9]], [2, 5]], expected: [[1, 5], [6, 9]] },
        { name: 'swallows several', args: [[[1, 2], [3, 5], [6, 7], [8, 10], [12, 16]], [4, 8]], expected: [[1, 2], [3, 10], [12, 16]] },
        { name: 'empty list', args: [[], [5, 7]], expected: [[5, 7]] },
        { name: 'inside an existing block', args: [[[1, 5]], [2, 3]], expected: [[1, 5]] },
        { name: 'goes at the end', args: [[[1, 5]], [6, 8]], expected: [[1, 5], [6, 8]] },
        { name: 'goes at the front', args: [[[3, 5]], [1, 2]], expected: [[1, 2], [3, 5]] },
        { name: 'touches both sides', args: [[[1, 2], [5, 6]], [2, 5]], expected: [[1, 6]] },
        { name: 'covers everything', args: [[[1, 2], [3, 4]], [0, 10]], expected: [[0, 10]] },
      ],
      takeaway: 'Sorted input with no overlaps: the affected intervals are one stretch. One pass, no sort.',
    },
    {
      id: 'greedy-intervals-meeting-rooms',
      title: 'One Person, All Meetings',
      difficulty: 'easy',
      leetcode: 252,
      pattern: 'Sort by start + check neighbors',
      statement:
        'You get a list of meetings, each `[start, end]`. A meeting that ends at 10 and one that starts at 10 do **not** clash: you walk straight from one to the next. Return `true` if one person can attend every meeting. (Counting how many rooms you need is a heap problem: see module 12.)',
      examples: [
        { input: 'intervals = [[0, 30], [5, 10], [15, 20]]', output: 'false', explain: '[5, 10] starts before [0, 30] ends.' },
        { input: 'intervals = [[7, 10], [2, 4]]', output: 'true' },
      ],
      constraints: ['0 ≤ intervals.length ≤ 10⁴', '0 ≤ start < end ≤ 10⁶'],
      hints: [
        'Two meetings clash if one starts before the other ends.',
        'After sorting by start, which meeting could clash with meeting `i`?',
        'Only the one right before it. Return false if `intervals[i][0] < intervals[i - 1][1]` for some `i`.',
      ],
      approaches: [
        {
          name: 'Check every pair',
          idea: 'Compare every two meetings and look for a clash. Correct, but n² pairs.',
          time: 'O(n²)',
          space: 'O(1)',
        },
        {
          name: 'Sort by start, check neighbors',
          idea: 'After sorting, if meeting `i` clashes with any earlier meeting, it also clashes with the one right before it (that one started even later). So checking neighbors is enough.',
          pseudo: `function canAttendAll(intervals):
    sort intervals by start
    for i from 1 to n - 1:
        if intervals[i].start < intervals[i - 1].end:
            return false              // starts before the last one ends
    return true`,
          code: roomsCode,
          time: 'O(n log n)',
          space: 'O(1) extra',
        },
      ],
      fn: 'canAttendAll',
      starter: `function canAttendAll(intervals) {
  // Return true if no two meetings clash.
  return true;
}`,
      solution: roomsCode,
      tests: [
        { name: 'clash', args: [[[0, 30], [5, 10], [15, 20]]], expected: false },
        { name: 'unsorted, no clash', args: [[[7, 10], [2, 4]]], expected: true },
        { name: 'no meetings', args: [[]], expected: true },
        { name: 'one meeting', args: [[[1, 5]]], expected: true },
        { name: 'touching is fine', args: [[[1, 2], [2, 3]]], expected: true },
        { name: 'same end', args: [[[5, 8], [6, 8]]], expected: false },
        { name: 'double digits (sort trap)', args: [[[10, 20], [2, 3], [3, 10]]], expected: true },
      ],
      takeaway: 'After sorting by start, a clash always shows up between neighbors.',
    },
    {
      id: 'greedy-intervals-interval-intersections',
      title: 'When Are We Both Free?',
      difficulty: 'medium',
      leetcode: 986,
      pattern: 'Two pointers on intervals',
      statement:
        'Two friends share their free time as lists of intervals `a` and `b`. Each list is sorted by start and has no overlaps inside it. Return every window when **both** are free, sorted by start. A window can be a single moment: `[5, 5]` counts.',
      examples: [
        {
          input: 'a = [[0, 2], [5, 10], [13, 23], [24, 25]], b = [[1, 5], [8, 12], [15, 24], [25, 26]]',
          output: '[[1, 2], [5, 5], [8, 10], [15, 23], [24, 24], [25, 25]]',
        },
        { input: 'a = [[1, 7]], b = [[3, 10]]', output: '[[3, 7]]' },
      ],
      constraints: ['0 ≤ a.length, b.length ≤ 1000', 'each list is sorted with no overlaps'],
      hints: [
        'Look at one interval from each list. Where do they overlap, if at all?',
        'The overlap of `[s1, e1]` and `[s2, e2]` is `[max(s1, s2), min(e1, e2)]`. It is real only if start ≤ end.',
        'Use two pointers. After checking a pair, move the pointer whose interval **ends first**: it can\'t overlap anything later in the other list.',
      ],
      approaches: [
        {
          name: 'Check every pair',
          idea: 'Compare every interval of `a` with every interval of `b`, keep the real overlaps, then sort them. Correct, but most pairs are far apart.',
          time: 'O(n·m)',
          space: 'O(n + m)',
        },
        {
          name: 'Two pointers',
          idea: 'Both lists are sorted, so walk them together like merging two sorted lists. The interval that ends first is finished: everything after it in the other list starts later. Drop it and move on.',
          pseudo: `function intervalIntersection(a, b):
    out ← empty list
    i ← 0
    j ← 0
    while i < length of a and j < length of b:
        lo ← max(a[i].start, b[j].start)
        hi ← min(a[i].end, b[j].end)
        if lo ≤ hi:
            append [lo, hi] to out
        if a[i].end < b[j].end:       // a[i] is used up
            i ← i + 1
        else:
            j ← j + 1
    return out`,
          code: intersectCode,
          time: 'O(n + m)',
          space: 'O(n + m) output',
        },
      ],
      fn: 'intervalIntersection',
      starter: `function intervalIntersection(a, b) {
  // Return the windows that are in both lists.
  return [];
}`,
      solution: intersectCode,
      tests: [
        {
          name: 'example',
          args: [[[0, 2], [5, 10], [13, 23], [24, 25]], [[1, 5], [8, 12], [15, 24], [25, 26]]],
          expected: [[1, 2], [5, 5], [8, 10], [15, 23], [24, 24], [25, 25]],
        },
        { name: 'b is empty', args: [[[1, 3], [5, 9]], []], expected: [] },
        { name: 'a is empty', args: [[], [[4, 8]]], expected: [] },
        { name: 'simple overlap', args: [[[1, 7]], [[3, 10]]], expected: [[3, 7]] },
        { name: 'no overlap', args: [[[1, 2]], [[3, 4]]], expected: [] },
        { name: 'touching point', args: [[[1, 3]], [[3, 5]]], expected: [[3, 3]] },
        { name: 'one long, many short', args: [[[0, 10]], [[1, 2], [4, 5], [7, 8]]], expected: [[1, 2], [4, 5], [7, 8]] },
      ],
      takeaway: 'Overlap of two intervals = [max of starts, min of ends]. Advance whichever ends first.',
    },
  ],
  quiz: [
    {
      prompt: 'After sorting by start, why does a new interval only need to check the last block in `out`?',
      options: [
        'Because the last block is always the biggest',
        'Because it starts at or after the last block\'s start, and every earlier block ended before that',
        'Because sorting removes all overlaps',
        'Because an interval never overlaps more than one other',
      ],
      answer: 1,
      explanation: 'Earlier blocks are finished and end before the last block begins. Anything starting later can\'t reach back to them.',
    },
    {
      prompt: 'Merge `[[1, 4], [2, 3]]`. What is the answer?',
      options: ['[[1, 3]]', '[[1, 4]]', '[[1, 4], [2, 3]]', '[[2, 4]]'],
      answer: 1,
      explanation: '`[2, 3]` sits inside `[1, 4]`. The end must be `max(4, 3) = 4`. Using the new end (3) is the classic bug.',
    },
    {
      prompt: 'Meetings `[1, 5]` and `[5, 8]`. Can one person attend both?',
      options: ['Yes: one ends exactly when the other starts', 'No: they share the moment 5'],
      answer: 0,
      explanation: 'In Meeting Rooms touching is fine (`<`). In Merge Intervals touching merges (`≤`). Always check which one your problem wants.',
    },
    {
      prompt: 'In Interval List Intersections, after checking `a[i]` and `b[j]`, which pointer moves?',
      options: ['Always `i`', 'The one whose interval ends first', 'The one whose interval starts first', 'Both'],
      answer: 1,
      explanation: 'The interval that ends first can\'t overlap anything later in the other list, so it is done.',
    },
  ],
  takeaways: [
    'Sorting by start turns an all-pairs problem into one left-to-right sweep.',
    'In the sweep, a new interval either stretches the last block (`max` of the ends) or starts a new block.',
    'If the input is already sorted, skip the sort: Insert Interval and Intersections are O(n).',
    'Check whether touching intervals count as overlapping. It decides `<` versus `≤`.',
  ],
};

export default lesson;
