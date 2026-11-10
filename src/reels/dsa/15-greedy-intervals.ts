import type { IntervalBar, Series } from '../types';

// /dsa/reels module 15. One reel per lesson of src/dsa/modules/15-greedy-intervals*.ts, in lesson order.
// Brief: src/reels/dsa/README.md. Rules: src/reels/AUTHORING.md.

// Lesson 1: kids' needs (row 0) and cookie sizes (row 1), both already sorted.
const cookieRows = ['needs', 'cookie'];
const cookieGrid = [
  [1, 2, 3, 5],
  [1, 1, 3, 6],
];

// Lesson 2: stepping stones.
const stones = [3, 2, 1, 0, 4];

// Lesson 3: the lesson's [[1,3],[8,10],[2,6],[15,18]], with the last range moved to [11,12] to fit a 12-tick axis.
const rangeA: IntervalBar = { id: 'a', from: 1, to: 3 };
const rangeB: IntervalBar = { id: 'b', from: 8, to: 10 };
const rangeC: IntervalBar = { id: 'c', from: 2, to: 6 };
const rangeD: IntervalBar = { id: 'd', from: 11, to: 12 };

// Lesson 4: festival shows, sorted by end.
const show1: IntervalBar = { id: 's1', from: 1, to: 3 };
const show2: IntervalBar = { id: 's2', from: 2, to: 5 };
const show3: IntervalBar = { id: 's3', from: 4, to: 6 };
const show4: IntervalBar = { id: 's4', from: 6, to: 8 };
const show5: IntervalBar = { id: 's5', from: 5, to: 9 };
const show6: IntervalBar = { id: 's6', from: 8, to: 10 };

// Lesson 5: the lesson's "abcabddefe" -> [5, 2, 3], cut to 8 letters so the cells stay readable on a phone.
const word = 'abacbdde'.split(''); // -> [5, 2, 1]

export const series: Series = {
  id: 'dsa-greedy-intervals',
  title: 'Greedy & intervals',
  emoji: '🎯',
  color: '#f472b6',
  order: 15,
  blurb: 'Make the locally best move, and know when that is safe.',
  reels: [
    // ───────────────────────────── Lesson 1: greedy thinking ─────────────────────────────
    {
      id: 'dsa-greedy-intervals-greedy-thinking',
      title: 'Greedy thinking: the best move now',
      link: { label: 'Solve it', href: '/dsa#/m/greedy-intervals/greedy-thinking/greedy-intervals-assign-cookies' },
      beats: [
        {
          say: 'Cookies of different sizes. How many kids can you make happy?',
          emphasis: ['happy'],
          scene: { type: 'title', kicker: 'Greedy · Lesson 1', title: 'Make the *most* kids happy', emoji: '🍪', style: 'slam' },
        },
        {
          say: 'Each kid needs a cookie at least as big as their number. Here, the best you can do is three happy kids.',
          emphasis: ['three'],
          sfx: 'pop',
          scene: {
            type: 'grid',
            title: 'Who gets a cookie?',
            rowLabels: cookieRows,
            cells: cookieGrid,
            found: [[0, 0], [0, 1], [0, 2], [1, 0], [1, 2], [1, 3]],
            vars: { happy: 3 },
            caption: 'a cookie fits when size ≥ need',
          },
        },
        {
          say: 'The slow way tries every hand-out. Each cookie goes to any kid it fits, or to nobody.',
          emphasis: ['every'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'pseudo',
            file: 'Brute force',
            code: `function tryAll(c):
    if c = number of cookies:
        return kids fed
    best ← tryAll(c + 1)    // skip it
    for each hungry kid k:
        if cookie[c] fits k:
            feed k
            best ← max(best, tryAll(c + 1))
            unfeed k
    return best`,
            highlight: [[5, 8]],
            note: { line: 8, text: 'every cookie tries every kid', tone: 'warn' },
          },
        },
        {
          say: 'Ten kids and ten cookies already means about twenty six billion tries.',
          emphasis: ['billion'],
          sfx: 'error',
          scene: {
            type: 'stat',
            value: '26B',
            label: 'tries for *10* kids and 10 cookies',
            sub: 'each cookie: any kid, or nobody',
            tone: 'bad',
          },
        },
        {
          say: 'Most tries are silly. Why spend the size six cookie on a kid who only needs one?',
          emphasis: ['silly'],
          scene: {
            type: 'grid',
            title: 'Spot the waste',
            rowLabels: cookieRows,
            cells: cookieGrid,
            active: [[1, 3]],
            reads: [[0, 0]],
            caption: 'a size 6 cookie spent on a need of 1',
          },
        },
        {
          say: 'So be greedy. Give the smallest cookie that fits, and never take it back.',
          emphasis: ['greedy', 'smallest'],
          sfx: 'ding',
          scene: { type: 'title', kicker: 'The insight', title: 'Best move now, *no undo*', emoji: '💡', style: 'slam' },
        },
        {
          say: 'Sort both lists. The smallest cookie meets the kid who needs one. It fits, so give it.',
          emphasis: ['fits'],
          scene: {
            type: 'grid',
            title: 'Smallest cookie first',
            rowLabels: cookieRows,
            cells: cookieGrid,
            active: [[1, 0]],
            reads: [[0, 0]],
            vars: { happy: 1 },
            caption: 'it fits: give it',
          },
        },
        {
          say: 'The next cookie is one, but this kid needs two. Everyone left needs even more, so throw it away.',
          emphasis: ['throw'],
          scene: {
            type: 'grid',
            title: 'Smallest cookie first',
            rowLabels: cookieRows,
            cells: cookieGrid,
            active: [[1, 1]],
            reads: [[0, 1]],
            found: [[0, 0], [1, 0]],
            vars: { happy: 1 },
            caption: 'too small for every kid left',
          },
        },
        {
          say: 'Cookie three fits the kid who needs two. That makes two happy kids.',
          emphasis: ['two'],
          scene: {
            type: 'grid',
            title: 'Smallest cookie first',
            rowLabels: cookieRows,
            cells: cookieGrid,
            active: [[1, 2]],
            reads: [[0, 1]],
            found: [[0, 0], [1, 0]],
            done: [[1, 1]],
            vars: { happy: 2 },
            caption: 'it fits: give it',
          },
        },
        {
          say: 'Cookie six fits the kid who needs three. No cookies are left, so three kids are happy.',
          emphasis: ['three'],
          sfx: 'success',
          scene: {
            type: 'grid',
            title: 'Smallest cookie first',
            rowLabels: cookieRows,
            cells: cookieGrid,
            found: [[0, 0], [1, 0], [0, 1], [1, 2], [0, 2], [1, 3]],
            done: [[1, 1], [0, 3]],
            vars: { happy: 3 },
            caption: 'the kid who needs 5 stays hungry',
          },
        },
        {
          say: "In JavaScript, sort both lists, then walk the cookies once. The sorts cost the most, so it's O of n log n.",
          speak: "In JavaScript, sort both lists, then walk the cookies once. The sorts cost the most, so it's oh of n log n.",
          emphasis: ['once'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'feed.js',
            code: `function feed(kids, cookies) {
  kids.sort((a, b) => a - b);
  cookies.sort((a, b) => a - b);
  let k = 0; // next hungry kid
  for (const c of cookies) {
    if (k === kids.length) break;
    if (c >= kids[k]) k++;
  }
  return k;
}`,
            highlight: [7],
            note: { line: 7, text: 'the sorts cost most: O(n log n)', tone: 'good' },
          },
        },
        {
          say: 'Reach for greedy when you want the most or fewest of something, and you can say why each move is safe.',
          emphasis: ['most', 'safe'],
          scene: {
            type: 'list',
            title: 'Reach for this when…',
            items: [
              { text: 'It asks for the *most* or *fewest*', icon: '🎯' },
              { text: 'There is a natural order to try', icon: '📶' },
              { text: 'You can say *why* it is safe', icon: '✅' },
            ],
            active: 2,
          },
        },
        {
          say: 'The trap: plain sort compares numbers as text, so ten lands before two. Always pass a compare function.',
          emphasis: ['text'],
          sfx: 'error',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'trap.js',
            code: `const sizes = [10, 9, 2];
sizes.sort();
sizes.sort((a, b) => a - b);`,
            errors: [2],
            added: [3],
            note: { line: 2, text: 'gives [10, 2, 9]: text order', tone: 'bad' },
          },
        },
        {
          say: 'Quick check. Coins of one, three and four. Make six by grabbing the biggest coin first. How many coins?',
          sfx: 'riser',
          scene: {
            type: 'quiz',
            question: 'Coins 1, 3 and 4. Make 6, biggest coin first. How many coins?',
            options: ['2 coins', '3 coins', '6 coins'],
            answer: 1,
          },
        },
        {
          say: 'Three coins: four, one and one. But three plus three needs only two, so greedy fails here. Always check first.',
          emphasis: ['fails'],
          sfx: 'ding',
          scene: {
            type: 'quiz',
            question: 'Coins 1, 3 and 4. Make 6, biggest coin first. How many coins?',
            options: ['2 coins', '3 coins', '6 coins'],
            answer: 1,
            reveal: true,
            explain: '4 + 1 + 1 is 3 coins, but 3 + 3 is just 2.',
          },
        },
        {
          say: 'Remember this. Make the best move now, but only once you know why it is safe. Now tap solve it and try it yourself.',
          emphasis: ['best', 'safe'],
          sfx: 'success',
          scene: {
            type: 'outro',
            points: ['Best move now, *never undo*', 'Check *why* the move is safe', 'Sort numbers with *a - b*'],
            tagline: 'Now go solve it.',
          },
        },
      ],
    },

    // ───────────────────────────── Lesson 2: farthest reach ─────────────────────────────
    {
      id: 'dsa-greedy-intervals-reach-and-jumps',
      title: 'Farthest reach: jump games',
      link: { label: 'Solve it', href: '/dsa#/m/greedy-intervals/reach-and-jumps/greedy-intervals-jump-game' },
      beats: [
        {
          say: 'Stones across a river. Each one says how far you can leap.',
          emphasis: ['leap'],
          scene: { type: 'title', kicker: 'Greedy · Lesson 2', title: 'Can you cross the *river*?', emoji: '🪨', style: 'slam' },
        },
        {
          say: "You start on stone zero. Can you reach the last stone? Here you can't: every path gets stuck on the zero.",
          emphasis: ['stuck'],
          sfx: 'pop',
          scene: {
            type: 'array',
            title: 'Leap up to the painted number',
            cells: stones,
            pointers: { start: 0, goal: 4 },
            active: [3],
            vars: { answer: 'false' },
            caption: 'every path gets stuck on the 0',
          },
        },
        {
          say: 'The slow way tries every leap from every stone, and keeps going from there.',
          emphasis: ['every', 'leap'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'pseudo',
            file: 'Brute force',
            code: `function canReach(nums, i):
    if i ≥ n - 1:
        return true
    for step from 1 to nums[i]:
        if canReach(nums, i + step):
            return true
    return false`,
            highlight: [[4, 5]],
            note: { line: 5, text: 'tries every path', tone: 'warn' },
          },
        },
        {
          say: 'Paths roughly double with every stone. Thirty stones can mean over a hundred million paths.',
          emphasis: ['double', 'million'],
          sfx: 'error',
          scene: {
            type: 'stat',
            value: '100M',
            label: 'paths for just *30* stones',
            sub: 'O(2ⁿ): doubles with every stone',
            tone: 'bad',
          },
        },
        {
          say: "But you don't need the path. If you can reach stone three, you can reach one and two too. Just leap shorter.",
          emphasis: ['shorter'],
          scene: {
            type: 'array',
            title: 'Spot the waste',
            cells: stones,
            window: [0, 3],
            active: [3],
            reads: [1, 2],
            caption: 'reachable stones form one block',
          },
        },
        {
          say: 'So track one number: the farthest stone you can reach so far.',
          emphasis: ['farthest'],
          sfx: 'ding',
          scene: { type: 'title', kicker: 'The insight', title: 'Track one number: *reach*', emoji: '💡', style: 'slam' },
        },
        {
          say: 'Stone zero says three. So every stone up to three is in reach.',
          emphasis: ['three'],
          scene: {
            type: 'array',
            title: 'Reach scan',
            cells: stones,
            pointers: { i: 0 },
            window: [0, 3],
            active: [0],
            vars: { 'i + leap': '0 + 3', reach: 3 },
          },
        },
        {
          say: "Stones one and two can't leap past three either. Reach stays at three.",
          emphasis: ['stays'],
          scene: {
            type: 'array',
            title: 'Reach scan',
            cells: stones,
            pointers: { i: 2 },
            window: [0, 3],
            active: [2],
            done: [0, 1],
            vars: { 'i + leap': '2 + 1', reach: 3 },
          },
        },
        {
          say: "Stone three says zero. It can't move you forward at all.",
          emphasis: ['zero'],
          scene: {
            type: 'array',
            title: 'Reach scan',
            cells: stones,
            pointers: { i: 3 },
            window: [0, 3],
            active: [3],
            done: [0, 1, 2],
            vars: { 'i + leap': '3 + 0', reach: 3 },
          },
        },
        {
          say: 'Stone four is past reach. There is a gap you can never cross, so the answer is false.',
          emphasis: ['gap', 'false'],
          sfx: 'error',
          scene: {
            type: 'array',
            title: 'Reach scan',
            cells: stones,
            pointers: { i: 4 },
            window: [0, 3],
            active: [4],
            done: [0, 1, 2, 3],
            vars: { 'i + leap': 'out of reach', reach: 3 },
            caption: 'i is past reach: return false',
          },
        },
        {
          say: 'In JavaScript, it is one loop and one number, with the gap check first. That is O of n.',
          speak: 'In JavaScript, it is one loop and one number, with the gap check first. That is oh of n.',
          emphasis: ['one', 'number'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'canJump.js',
            code: `// a[i]: longest leap from stone i
function canJump(a) {
  let reach = 0;
  for (let i = 0; i < a.length; i++) {
    if (i > reach) return false;
    reach = Math.max(reach, i + a[i]);
  }
  return true;
}`,
            highlight: [[5, 6]],
            note: { line: 6, text: 'one pass, one number: O(n)', tone: 'good' },
          },
        },
        {
          say: 'Reach for this when each spot lets you move up to some distance, and you only need yes or no.',
          emphasis: ['distance'],
          scene: {
            type: 'list',
            title: 'Reach for this when…',
            items: [
              { text: 'You may leap *up to* a distance', icon: '🦘' },
              { text: 'You ask *can I get there*, not how', icon: '🗺️' },
              { text: 'Or the *fewest* jumps to get there', icon: '🪜' },
            ],
            active: 0,
          },
        },
        {
          say: "The trap: forget the gap check, and stone four stretches reach to eight. You'd say yes, but you never got there.",
          emphasis: ['gap'],
          sfx: 'error',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'trap.js',
            code: `for (let i = 0; i < a.length; i++) {
  // no gap check here
  reach = Math.max(reach, i + a[i]);
}
return reach >= a.length - 1;`,
            errors: [[2, 3]],
            note: { line: 3, text: 'stone 4 pushes reach to 8', tone: 'bad' },
          },
        },
        {
          say: 'Quick check. Run the reach scan on one, zero, two. What happens?',
          sfx: 'riser',
          scene: {
            type: 'quiz',
            question: 'Run the reach scan on [1, 0, 2]. What happens?',
            options: ['True at stone 2', 'False at stone 2', 'False at stone 1'],
            answer: 1,
          },
        },
        {
          say: 'False at stone two. Stone one says zero, so reach stops at one, and two is past it.',
          emphasis: ['false'],
          sfx: 'ding',
          scene: {
            type: 'quiz',
            question: 'Run the reach scan on [1, 0, 2]. What happens?',
            options: ['True at stone 2', 'False at stone 2', 'False at stone 1'],
            answer: 1,
            reveal: true,
            explain: 'Reach stops at 1, and stone 2 is past it.',
          },
        },
        {
          say: 'Remember this. Reachable stones have no holes, so one number tells you everything. Now tap solve it and try it yourself.',
          emphasis: ['holes'],
          sfx: 'success',
          scene: {
            type: 'outro',
            points: ['Track the *farthest reach*', 'Past reach means *stuck*', 'One pass, one number: *O(n)*'],
            tagline: 'Now go solve it.',
          },
        },
      ],
    },

    // ───────────────────────────── Lesson 3: merge intervals ─────────────────────────────
    {
      id: 'dsa-greedy-intervals-merge-intervals',
      title: 'Merge and insert intervals',
      link: { label: 'Solve it', href: '/dsa#/m/greedy-intervals/merge-intervals/greedy-intervals-merge-intervals' },
      beats: [
        {
          say: 'Three meetings, but your calendar shows just two busy blocks. How?',
          emphasis: ['busy'],
          scene: { type: 'title', kicker: 'Intervals · Lesson 3', title: 'Merge the *busy* times', emoji: '📅', style: 'slam' },
        },
        {
          say: 'Here are four time ranges. One to three overlaps two to six, so together they make one to six.',
          emphasis: ['overlaps'],
          sfx: 'pop',
          scene: {
            type: 'intervals',
            title: 'Merge every overlap',
            axis: [0, 12],
            bars: [{ ...rangeA, tone: 'warn' }, rangeB, { ...rangeC, tone: 'warn' }, rangeD],
            caption: 'answer: [1,6] [8,10] [11,12]',
          },
        },
        {
          say: 'The slow way checks every pair, merges any two that overlap, and repeats until nothing changes.',
          emphasis: ['every', 'pair'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'pseudo',
            file: 'Brute force',
            code: `function mergeSlow(list):
    changed ← true
    while changed:
        changed ← false
        for each pair a, b in list:
            if a and b overlap:
                replace both with one
                changed ← true
    return list`,
            highlight: [[3, 5]],
            note: { line: 5, text: 'every pair, again and again', tone: 'warn' },
          },
        },
        {
          say: 'Every pair, up to n times over, is O of n cubed. Ten thousand ranges means a trillion steps.',
          speak: 'Every pair, up to n times over, is oh of n cubed. Ten thousand ranges means a trillion steps.',
          emphasis: ['cubed', 'trillion'],
          sfx: 'error',
          scene: {
            type: 'stat',
            value: '1T',
            label: 'steps for *10,000* ranges',
            sub: 'O(n³): the same pairs, over and over',
            tone: 'bad',
          },
        },
        {
          say: 'So sort by start. Then a range can only overlap the last block you built.',
          emphasis: ['start', 'last'],
          sfx: 'ding',
          scene: { type: 'title', kicker: 'The insight', title: 'Sort by *start* first', emoji: '💡', style: 'slam' },
        },
        {
          say: "Right now, one to three and two to six sit far apart, so you'd have to check every pair.",
          emphasis: ['apart'],
          scene: {
            type: 'intervals',
            title: 'Sort, then sweep',
            axis: [0, 12],
            bars: [{ ...rangeA, active: true }, { ...rangeB, dim: true }, { ...rangeC, active: true }, { ...rangeD, dim: true }],
            caption: 'unsorted: overlaps sit far apart',
          },
        },
        {
          say: 'Sort by start, and the overlaps line up. One to three opens the first block.',
          emphasis: ['line', 'up'],
          scene: {
            type: 'intervals',
            title: 'Sort, then sweep',
            axis: [0, 12],
            bars: [{ ...rangeA, active: true }, rangeC, rangeB, rangeD],
            marker: 3,
            vars: { end: 3, blocks: 1 },
          },
        },
        {
          say: 'Two to six starts before three. They overlap, so stretch the block to end at six.',
          emphasis: ['stretch'],
          scene: {
            type: 'intervals',
            title: 'Sort, then sweep',
            axis: [0, 12],
            bars: [{ ...rangeA, to: 6, active: true }, rangeB, rangeD],
            marker: 6,
            vars: { end: 6, blocks: 1 },
          },
        },
        {
          say: 'Eight starts after six, so there is a gap. Eight to ten opens a new block.',
          emphasis: ['new'],
          scene: {
            type: 'intervals',
            title: 'Sort, then sweep',
            axis: [0, 12],
            bars: [{ ...rangeA, to: 6, tone: 'good' }, { ...rangeB, active: true }, rangeD],
            marker: 10,
            vars: { end: 10, blocks: 2 },
          },
        },
        {
          say: 'Eleven is after ten, so one more block. Three blocks, from one pass after the sort.',
          emphasis: ['one', 'pass'],
          sfx: 'success',
          scene: {
            type: 'intervals',
            title: 'Sort, then sweep',
            axis: [0, 12],
            bars: [{ ...rangeA, to: 6, tone: 'good' }, { ...rangeB, tone: 'good' }, { ...rangeD, tone: 'good' }],
            marker: 12,
            vars: { end: 12, blocks: 3 },
          },
        },
        {
          say: 'In JavaScript, sort by start, then stretch the last block or push a new one. It is O of n log n.',
          speak: 'In JavaScript, sort by start, then stretch the last block or push a new one. It is oh of n log n.',
          emphasis: ['stretch', 'push'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'merge.js',
            code: `function merge(list) {
  list.sort((a, b) => a[0] - b[0]);
  const out = [];
  for (const [s, e] of list) {
    const last = out[out.length - 1];
    if (last && s <= last[1]) {
      last[1] = Math.max(last[1], e);
    } else {
      out.push([s, e]);
    }
  }
  return out;
}`,
            highlight: [[6, 7]],
            note: { line: 7, text: 'sort + one pass: O(n log n)', tone: 'good' },
          },
        },
        {
          say: 'Reach for this when you get start and end pairs, and the question says merge or overlap.',
          emphasis: ['merge', 'overlap'],
          scene: {
            type: 'list',
            title: 'Reach for this when…',
            items: [
              { text: 'A list of *start, end* pairs', icon: '📅' },
              { text: 'Words like *merge* or *overlap*', icon: '🔗' },
              { text: "Order doesn't matter, so *sort*", icon: '🔀' },
            ],
            active: 1,
          },
        },
        {
          say: 'The trap: stretch with max, not the new end. One to ten, then two to three, would shrink to one to three.',
          emphasis: ['max'],
          sfx: 'error',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'trap.js',
            code: `// last is [1,10], next is [2,3]
last[1] = e;
last[1] = Math.max(last[1], e);`,
            errors: [2],
            added: [3],
            note: { line: 2, text: 'shrinks the block to [1,3]', tone: 'bad' },
          },
        },
        {
          say: 'Quick check. Merge one to four with two to three. What do you get?',
          sfx: 'riser',
          scene: {
            type: 'quiz',
            question: 'Merge [1,4] and [2,3]. What do you get?',
            options: ['[1,3]', '[1,4]', '[2,4]'],
            answer: 1,
          },
        },
        {
          say: 'One to four. Two to three sits inside it, and the bigger end is four.',
          emphasis: ['inside'],
          sfx: 'ding',
          scene: {
            type: 'quiz',
            question: 'Merge [1,4] and [2,3]. What do you get?',
            options: ['[1,3]', '[1,4]', '[2,4]'],
            answer: 1,
            reveal: true,
            explain: '[2,3] sits inside. The end is max(4, 3) = 4.',
          },
        },
        {
          say: 'Remember this. Sort by start, then stretch the last block or start a new one. Now tap solve it and try it yourself.',
          emphasis: ['start', 'stretch'],
          sfx: 'success',
          scene: {
            type: 'outro',
            points: ['Sort by *start* first', 'Stretch the last block, or start new', 'Stretch with *max*, not the new end'],
            tagline: 'Now go solve it.',
          },
        },
      ],
    },

    // ───────────────────────────── Lesson 4: sort by end ─────────────────────────────
    {
      id: 'dsa-greedy-intervals-sort-by-end',
      title: 'Sort by end: keep the most, shoot the fewest',
      link: { label: 'Solve it', href: '/dsa#/m/greedy-intervals/sort-by-end/greedy-intervals-non-overlapping' },
      beats: [
        {
          say: 'A festival has six shows that clash. How many can you see?',
          emphasis: ['clash'],
          scene: { type: 'title', kicker: 'Intervals · Lesson 4', title: 'Six shows, one of *you*', emoji: '🎸', style: 'slam' },
        },
        {
          say: 'Here are the show times. The best you can do is four full shows, so you skip two.',
          emphasis: ['four'],
          sfx: 'pop',
          scene: {
            type: 'intervals',
            title: 'See the most full shows',
            axis: [0, 10],
            bars: [show1, show2, show3, show4, show5, show6],
            caption: 'best: keep 4 shows, skip 2',
          },
        },
        {
          say: 'The slow way tries every group of shows, and keeps the biggest one with no clashes.',
          emphasis: ['every', 'group'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'pseudo',
            file: 'Brute force',
            code: `function mostShows(shows):
    best ← 0
    for each subset of shows:
        if no two in subset overlap:
            best ← max(best, size)
    return best`,
            highlight: [3],
            note: { line: 3, text: 'every subset: 2ⁿ of them', tone: 'warn' },
          },
        },
        {
          say: 'That is O of two to the n. Forty shows already means a trillion groups.',
          speak: 'That is oh of two to the n. Forty shows already means a trillion groups.',
          emphasis: ['trillion'],
          sfx: 'error',
          scene: {
            type: 'stat',
            value: '1T',
            label: 'groups for just *40* shows',
            sub: 'O(2ⁿ): doubles with every show',
            tone: 'bad',
          },
        },
        {
          say: 'A rule would be faster, but which one? Shortest first grabs four to seven, and it blocks both others.',
          emphasis: ['shortest'],
          scene: {
            type: 'intervals',
            title: 'Which show goes first?',
            axis: [0, 10],
            bars: [
              { id: 'x', from: 1, to: 5, dim: true },
              { id: 'y', from: 4, to: 7, active: true, tone: 'bad' },
              { id: 'z', from: 6, to: 10, dim: true },
            ],
            caption: 'shortest first keeps 1 show, not 2',
          },
        },
        {
          say: 'The safe rule: keep the show that ends first. It leaves the most room for the rest.',
          emphasis: ['ends', 'first'],
          sfx: 'ding',
          scene: { type: 'title', kicker: 'The insight', title: 'Keep the one that *ends first*', emoji: '💡', style: 'slam' },
        },
        {
          say: 'Sorted by end, one to three finishes first. Keep it. The last show now ends at three.',
          emphasis: ['keep'],
          scene: {
            type: 'intervals',
            title: 'Sorted by end',
            axis: [0, 10],
            bars: [{ ...show1, active: true, tone: 'good' }, show2, show3, show4, show5, show6],
            marker: 3,
            vars: { 'last end': 3, kept: 1 },
          },
        },
        {
          say: 'Two to five starts before three, so skip it. Four to six fits, so keep it.',
          emphasis: ['skip', 'keep'],
          scene: {
            type: 'intervals',
            title: 'Sorted by end',
            axis: [0, 10],
            bars: [
              { ...show1, tone: 'good' },
              { ...show2, dim: true },
              { ...show3, active: true, tone: 'good' },
              show4,
              show5,
              show6,
            ],
            marker: 6,
            vars: { 'last end': 6, kept: 2 },
          },
        },
        {
          say: 'Six to eight starts right at six. Touching is fine here, so keep it.',
          emphasis: ['touching'],
          scene: {
            type: 'intervals',
            title: 'Sorted by end',
            axis: [0, 10],
            bars: [
              { ...show1, tone: 'good' },
              { ...show2, dim: true },
              { ...show3, tone: 'good' },
              { ...show4, active: true, tone: 'good' },
              show5,
              show6,
            ],
            marker: 8,
            vars: { 'last end': 8, kept: 3 },
          },
        },
        {
          say: 'Five to nine clashes, but eight to ten fits. Four kept out of six, so you remove two.',
          emphasis: ['remove', 'two'],
          sfx: 'success',
          scene: {
            type: 'intervals',
            title: 'Sorted by end',
            axis: [0, 10],
            bars: [
              { ...show1, tone: 'good' },
              { ...show2, dim: true },
              { ...show3, tone: 'good' },
              { ...show4, tone: 'good' },
              { ...show5, dim: true },
              { ...show6, active: true, tone: 'good' },
            ],
            marker: 10,
            vars: { 'last end': 10, kept: 4 },
            caption: 'remove 6 − 4 = 2',
          },
        },
        {
          say: 'In JavaScript, sort by end and keep what fits. The answer is n minus kept, in O of n log n.',
          speak: 'In JavaScript, sort by end and keep what fits. The answer is n minus kept, in oh of n log n.',
          emphasis: ['end'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'minRemove.js',
            code: `function minRemove(list) {
  list.sort((a, b) => a[1] - b[1]);
  let kept = 0;
  let lastEnd = -Infinity;
  for (const [s, e] of list) {
    if (s >= lastEnd) {
      kept++;
      lastEnd = e;
    }
  }
  return list.length - kept;
}`,
            highlight: [2, 6],
            note: { line: 6, text: 'sort + one pass: O(n log n)', tone: 'good' },
          },
        },
        {
          say: 'Reach for this when you want the most ranges with no overlap, or the fewest points that hit them all.',
          emphasis: ['most', 'fewest'],
          scene: {
            type: 'list',
            title: 'Reach for this when…',
            items: [
              { text: 'The *most* with no overlap', icon: '🎯' },
              { text: 'The *fewest* to remove', icon: '✂️' },
              { text: 'Fewest *points* to hit them all', icon: '🏹' },
            ],
            active: 0,
          },
        },
        {
          say: 'The trap is touching. Shows that only touch both fit. But one arrow at two pops two balloons that touch.',
          emphasis: ['touching'],
          sfx: 'error',
          scene: {
            type: 'compare',
            title: 'Does touching clash?',
            left: { title: 'Shows', verdict: 'neutral', icon: '🎸', code: 's >= end', items: ['Keep both shows'] },
            right: { title: 'Balloons', verdict: 'neutral', icon: '🎈', code: 's > arrow', items: ['One arrow pops both'] },
          },
        },
        {
          say: 'Quick check. Which rule always keeps the most shows?',
          sfx: 'riser',
          scene: {
            type: 'quiz',
            question: 'Which rule always keeps the most shows?',
            options: ['Earliest start', 'Shortest first', 'Earliest end'],
            answer: 2,
          },
        },
        {
          say: 'Earliest end. Earliest start loses to one long show, and shortest first loses to four to seven.',
          emphasis: ['end'],
          sfx: 'ding',
          scene: {
            type: 'quiz',
            question: 'Which rule always keeps the most shows?',
            options: ['Earliest start', 'Shortest first', 'Earliest end'],
            answer: 2,
            reveal: true,
            explain: 'Start fails on one long show. Shortest fails on [4,7].',
          },
        },
        {
          say: 'Remember this. Sort by end, keep what fits, and check if touching counts. Now tap solve it and try it yourself.',
          emphasis: ['end', 'touching'],
          sfx: 'success',
          scene: {
            type: 'outro',
            points: ['Keep the one that *ends first*', 'Removed = *n − kept*', 'Decide if *touching* clashes'],
            tagline: 'Now go solve it.',
          },
        },
      ],
    },

    // ───────────────────────────── Lesson 5: partition and grouping ─────────────────────────────
    {
      id: 'dsa-greedy-intervals-partition-and-grouping',
      title: 'Partition and grouping',
      link: { label: 'Solve it', href: '/dsa#/m/greedy-intervals/partition-and-grouping/greedy-intervals-partition-labels' },
      beats: [
        {
          say: 'Same labels must share a box. How many boxes can you make?',
          emphasis: ['share'],
          scene: { type: 'title', kicker: 'Greedy · Lesson 5', title: 'Cut into the *most* boxes', emoji: '📦', style: 'slam' },
        },
        {
          say: 'Cut this string into as many parts as you can, with each letter in just one part. You get five, two, one.',
          emphasis: ['one', 'part'],
          sfx: 'pop',
          scene: {
            type: 'array',
            title: 'Each letter in one part',
            cells: word,
            vars: { sizes: '[5, 2, 1]' },
            caption: 'abacb | dd | e',
          },
        },
        {
          say: 'The slow way rescans the rest of the string at every spot. That is O of n squared.',
          speak: 'The slow way rescans the rest of the string at every spot. That is oh of n squared.',
          emphasis: ['rescans', 'squared'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'pseudo',
            file: 'Brute force',
            code: `function partition(s):
    start ← 0
    for i from 0 to n - 1:
        part ← s[start .. i]
        rest ← s[i + 1 .. n - 1]
        if no letter of part is in rest:
            cut after i
            start ← i + 1`,
            highlight: [[5, 6]],
            note: { line: 6, text: 'rescans the rest: O(n²)', tone: 'warn' },
          },
        },
        {
          say: 'But all you need about a letter is where it shows up last. Work that out once, up front.',
          emphasis: ['last', 'once'],
          scene: {
            type: 'array',
            title: 'Spot the waste',
            cells: word,
            reads: [2, 3, 4, 6, 7],
            caption: 'last: a2 c3 b4 d6 e7',
          },
        },
        {
          say: 'Walk left to right. Stretch the part to the farthest last spot, and cut when you get there.',
          emphasis: ['stretch', 'cut'],
          sfx: 'ding',
          scene: { type: 'title', kicker: 'The insight', title: 'Stretch to the last spot, then *cut*', emoji: '💡', style: 'slam' },
        },
        {
          say: 'Letter a shows up last at two, so this part must reach at least two.',
          speak: 'Letter ay shows up last at two, so this part must reach at least two.',
          emphasis: ['two'],
          scene: {
            type: 'array',
            title: 'Cut as early as you can',
            cells: word,
            pointers: { i: 0 },
            window: [0, 2],
            active: [0],
            vars: { end: 2, sizes: '[]' },
          },
        },
        {
          say: 'Letter b shows up last at four. Stretch the part to four.',
          speak: 'Letter bee shows up last at four. Stretch the part to four.',
          emphasis: ['stretch'],
          scene: {
            type: 'array',
            title: 'Cut as early as you can',
            cells: word,
            pointers: { i: 1 },
            window: [0, 4],
            active: [1],
            vars: { end: 4, sizes: '[]' },
          },
        },
        {
          say: 'At four, you reach the end. Nothing here comes back later, so cut: size five.',
          emphasis: ['cut'],
          scene: {
            type: 'array',
            title: 'Cut as early as you can',
            cells: word,
            pointers: { i: 4 },
            window: [0, 4],
            found: [0, 1, 2, 3, 4],
            vars: { end: 4, sizes: '[5]' },
          },
        },
        {
          say: 'The next part is d, d. Letter d ends at six, so cut again: size two.',
          speak: 'The next part is dee, dee. Letter dee ends at six, so cut again: size two.',
          emphasis: ['again'],
          scene: {
            type: 'array',
            title: 'Cut as early as you can',
            cells: word,
            pointers: { i: 6 },
            window: [5, 6],
            found: [5, 6],
            done: [0, 1, 2, 3, 4],
            vars: { end: 6, sizes: '[5, 2]' },
          },
        },
        {
          say: 'Letter e shows up just once, at seven. Last cut: five, two, one.',
          speak: 'Letter ee shows up just once, at seven. Last cut: five, two, one.',
          emphasis: ['five', 'two', 'one'],
          sfx: 'success',
          scene: {
            type: 'array',
            title: 'Cut as early as you can',
            cells: word,
            pointers: { i: 7 },
            window: [7, 7],
            found: [7],
            done: [0, 1, 2, 3, 4, 5, 6],
            vars: { end: 7, sizes: '[5, 2, 1]' },
          },
        },
        {
          say: 'In JavaScript, one pass finds each last spot, and one pass cuts. That is O of n.',
          speak: 'In JavaScript, one pass finds each last spot, and one pass cuts. That is oh of n.',
          emphasis: ['last', 'cuts'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'partition.js',
            code: `function partition(s) {
  const last = {};
  for (let i = 0; i < s.length; i++)
    last[s[i]] = i;
  let sizes = [], start = 0, end = 0;
  for (let i = 0; i < s.length; i++) {
    end = Math.max(end, last[s[i]]);
    if (i === end) {
      sizes.push(i - start + 1);
      start = i + 1;
    }
  }
  return sizes;
}`,
            highlight: [[7, 8]],
            note: { line: 8, text: 'two passes: O(n)', tone: 'good' },
          },
        },
        {
          say: 'Reach for this when you cut into the most pieces, but some items must stay together.',
          emphasis: ['most', 'together'],
          scene: {
            type: 'list',
            title: 'Reach for this when…',
            items: [
              { text: 'Cut into the *most* pieces', icon: '✂️' },
              { text: 'Some items must *stay together*', icon: '🔗' },
              { text: 'Like jump games: *farthest reach*', icon: '🦘' },
            ],
            active: 1,
          },
        },
        {
          say: "The trap: don't cut when one letter ends. Letter a ends at two, but b still comes back, so wait for the whole part.",
          speak: "The trap: don't cut when one letter ends. Letter ay ends at two, but bee still comes back, so wait for the whole part.",
          emphasis: ['whole'],
          sfx: 'error',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'trap.js',
            code: `// wrong: cut when this letter ends
if (last[s[i]] === i) cut();
// right: cut when the part ends
if (i === end) cut();`,
            errors: [2],
            added: [4],
            note: { line: 2, text: 'cuts "aba", but b comes back', tone: 'bad' },
          },
        },
        {
          say: 'Quick check. Partition the letters a, b, a, b. What sizes come back?',
          speak: 'Quick check. Partition the letters ay, bee, ay, bee. What sizes come back?',
          sfx: 'riser',
          scene: {
            type: 'quiz',
            question: 'Partition Labels on "abab". What sizes come back?',
            options: ['[2, 2]', '[4]', '[1, 1, 1, 1]'],
            answer: 1,
          },
        },
        {
          say: "Just one part, size four. The last b is at three, so you can't cut any sooner.",
          speak: "Just one part, size four. The last bee is at three, so you can't cut any sooner.",
          emphasis: ['one', 'four'],
          sfx: 'ding',
          scene: {
            type: 'quiz',
            question: 'Partition Labels on "abab". What sizes come back?',
            options: ['[2, 2]', '[4]', '[1, 1, 1, 1]'],
            answer: 1,
            reveal: true,
            explain: 'b shows up last at 3, so the part must reach 3.',
          },
        },
        {
          say: 'Remember this. Stretch to the farthest last spot, and cut the moment you get there. Now tap solve it and try it yourself.',
          emphasis: ['stretch', 'cut'],
          sfx: 'success',
          scene: {
            type: 'outro',
            points: ['Find each letter\'s *last spot*', 'Stretch, then *cut* at the end', 'Cut early to get the *most*'],
            tagline: 'Now go solve it.',
          },
        },
      ],
    },
  ],
};
