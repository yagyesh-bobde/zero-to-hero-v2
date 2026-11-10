import type { Series } from '../types';

// /dsa/reels module 1. One reel per lesson of src/dsa/modules/01-thinking*.ts, in lesson order.
// Brief: src/reels/dsa/README.md. Rules: src/reels/AUTHORING.md.

const prices = [7, 1, 5, 3, 6, 4];
const ratings = [2, 5, 3, 4, 1];
const days = [1, 1, 0, 1, 1, 1];
const votes = [2, 2, 1, 1, 1, 2, 2];
const heights = [1, 1, 4, 2, 1, 3];
const sortedHeights = [1, 1, 1, 2, 3, 4];

export const series: Series = {
  id: 'dsa-thinking',
  title: 'How to think about a problem',
  emoji: '🧠',
  color: '#a78bfa',
  order: 1,
  blurb: 'Big-O from constraints, pseudocode, and a repeatable way to go from brute force to optimal.',
  reels: [
    {
      id: 'dsa-thinking-big-o',
      title: 'Big-O by counting steps',
      link: { label: 'Solve it', href: '/dsa#/m/thinking/big-o/thinking-best-stock' },
      beats: [
        {
          say: 'Years of stock prices. What was the best trade you could make?',
          emphasis: ['best', 'trade'],
          scene: { type: 'title', kicker: 'Big-O · Lesson 1', title: 'Buy low, sell *later*', emoji: '📈', style: 'slam' },
        },
        {
          say: 'Here are six days. Buy at one, then sell later at six. That is a profit of five.',
          emphasis: ['five'],
          sfx: 'pop',
          scene: {
            type: 'array',
            title: 'Prices, one per day',
            cells: prices,
            pointers: { buy: 1, sell: 4 },
            found: [1, 4],
            vars: { profit: 5 },
            caption: 'buy first, sell on a later day',
          },
        },
        {
          say: 'The easy way tries every pair. For each buy day, check every later sell day.',
          emphasis: ['every', 'pair'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'pseudo',
            file: 'Brute force',
            code: `function maxProfit(p):
    best ← 0
    for buy from 0 to n - 1:
        for sell from buy + 1 to n - 1:
            profit ← p[sell] - p[buy]
            best ← max(best, profit)
    return best`,
            highlight: [[3, 4]],
            note: { line: 4, text: 'a loop inside a loop', tone: 'warn' },
          },
        },
        {
          say: 'A loop inside a loop is called O of n squared. A hundred thousand days means five billion steps.',
          speak: 'A loop inside a loop is called oh of n squared. A hundred thousand days means five billion steps.',
          emphasis: ['squared', 'billion'],
          sfx: 'error',
          scene: {
            type: 'stat',
            value: '5B',
            label: 'steps for *100,000* days',
            sub: 'O(n²): about 50 seconds of waiting',
            tone: 'bad',
          },
        },
        {
          say: 'To sell on day four, it checks every earlier day. But only the cheapest one can ever win.',
          emphasis: ['cheapest'],
          scene: {
            type: 'array',
            title: 'Spot the waste',
            cells: prices,
            pointers: { sell: 4 },
            active: [1],
            reads: [0, 2, 3],
            caption: 'only the cheapest buy day matters',
          },
        },
        {
          say: 'So walk the days once, and carry just one number: the cheapest price so far.',
          emphasis: ['once', 'cheapest'],
          sfx: 'ding',
          scene: { type: 'title', kicker: 'The insight', title: 'Remember the *cheapest* so far', emoji: '💡', style: 'slam' },
        },
        {
          say: 'Day one, the price is one. That beats seven, so one is our new low.',
          emphasis: ['low'],
          scene: {
            type: 'array',
            title: 'One pass',
            cells: prices,
            pointers: { i: 1, low: 1 },
            active: [1],
            done: [0],
            vars: { low: 1, today: 0, best: 0 },
          },
        },
        {
          say: 'Day two, selling at five after buying at one earns four. That is our best so far.',
          emphasis: ['four'],
          scene: {
            type: 'array',
            title: 'One pass',
            cells: prices,
            pointers: { i: 2, low: 1 },
            active: [2],
            reads: [1],
            done: [0],
            vars: { low: 1, today: 4, best: 4 },
          },
        },
        {
          say: 'Day three earns only two, so the best stays at four. No looking back needed.',
          emphasis: ['stays'],
          scene: {
            type: 'array',
            title: 'One pass',
            cells: prices,
            pointers: { i: 3, low: 1 },
            active: [3],
            reads: [1],
            done: [0, 2],
            vars: { low: 1, today: 2, best: 4 },
          },
        },
        {
          say: 'Day four, six minus one is five. A new best, and we read each day just once.',
          emphasis: ['five', 'once'],
          sfx: 'success',
          scene: {
            type: 'array',
            title: 'One pass',
            cells: prices,
            pointers: { i: 4, low: 1 },
            found: [1, 4],
            done: [0, 2, 3],
            vars: { low: 1, today: 5, best: 5 },
          },
        },
        {
          say: 'In JavaScript, update the low, then the best. One loop, so it is O of n.',
          speak: 'In JavaScript, update the low, then the best. One loop, so it is oh of n.',
          emphasis: ['one', 'loop'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'maxProfit.js',
            code: `function maxProfit(prices) {
  let low = Infinity;
  let best = 0;
  for (const p of prices) {
    low = Math.min(low, p);
    best = Math.max(best, p - low);
  }
  return best;
}`,
            highlight: [[5, 6]],
            note: { line: 6, text: 'one look per day: O(n)', tone: 'good' },
          },
        },
        {
          say: 'Reach for this when the answer is a pair, and only the best earlier value matters.',
          emphasis: ['pair', 'best'],
          scene: {
            type: 'list',
            title: 'Reach for this when…',
            items: [
              { text: 'The answer is a *pair* of items', icon: '👯' },
              { text: 'Only the best left side matters', icon: '🏆' },
              { text: 'Carry it, never loop back', icon: '➡️' },
            ],
            active: 1,
          },
        },
        {
          say: 'The trap is a hidden loop. A call like includes walks the whole array, so you are back to n squared.',
          emphasis: ['hidden', 'includes'],
          sfx: 'error',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'trap.js',
            code: `for (const p of prices) {
  if (seen.includes(p)) count++;
}`,
            errors: [2],
            note: { line: 2, text: 'includes walks every item', tone: 'bad' },
          },
        },
        {
          say: 'Quick check. Two loops, one after the other, each over n items. What is the Big-O?',
          speak: 'Quick check. Two loops, one after the other, each over n items. What is the Big-Oh?',
          sfx: 'riser',
          scene: {
            type: 'quiz',
            question: 'Two loops, one after the other, each over n items. Big-O?',
            options: ['O(n²)', 'O(n)', 'O(log n)', 'O(1)'],
            answer: 1,
          },
        },
        {
          say: 'It is O of n. Loops in a row add up, and we drop the two.',
          speak: 'It is oh of n. Loops in a row add up, and we drop the two.',
          emphasis: ['add'],
          sfx: 'ding',
          scene: {
            type: 'quiz',
            question: 'Two loops, one after the other, each over n items. Big-O?',
            options: ['O(n²)', 'O(n)', 'O(log n)', 'O(1)'],
            answer: 1,
            reveal: true,
            explain: 'n + n = 2n. Drop the constant: O(n).',
          },
        },
        {
          say: 'Remember this. Count steps, not seconds, and carry the best so far. Now tap solve it and try it yourself.',
          emphasis: ['steps', 'best'],
          sfx: 'success',
          scene: {
            type: 'outro',
            points: ['Count steps, not seconds', 'A loop in a loop is *O(n²)*', 'Carry the *best so far*'],
            tagline: 'Now go solve it.',
          },
        },
      ],
    },
    {
      id: 'dsa-thinking-constraints',
      title: 'Constraints pick the target',
      link: { label: 'Solve it', href: '/dsa#/m/thinking/constraints/thinking-count-teams' },
      beats: [
        {
          say: 'A thousand kids in a line. How many relay teams of three?',
          emphasis: ['thousand', 'three'],
          scene: { type: 'title', kicker: 'Constraints · Lesson 2', title: 'How many *relay* teams?', emoji: '🏃', style: 'slam' },
        },
        {
          say: 'Pick three kids from left to right whose ratings go up, or go down. Here, that makes three teams.',
          emphasis: ['up', 'down'],
          sfx: 'pop',
          scene: {
            type: 'array',
            title: 'Speed ratings',
            cells: ratings,
            pointers: { i: 0, j: 2, k: 3 },
            found: [0, 2, 3],
            vars: { up: 1, down: 2, teams: 3 },
            caption: '2, 3, 4 goes up: one team',
          },
        },
        {
          say: 'Before any idea, read the limits. A computer does about a hundred million simple steps a second.',
          emphasis: ['limits', 'hundred', 'million'],
          scene: {
            type: 'stat',
            value: '100M',
            label: 'simple steps in *one second*',
            sub: 'our limit: at most 1,000 kids',
            tone: 'info',
          },
        },
        {
          say: 'Use this cheat sheet backwards. Our limit is a thousand, so a loop inside a loop is the target.',
          emphasis: ['backwards', 'target'],
          scene: {
            type: 'list',
            title: 'The limit picks the target',
            items: [
              { text: 'n ≤ 20: try every *subset*', icon: '🧺' },
              { text: 'n ≤ 500: three loops, *O(n³)*', icon: '🔁' },
              { text: 'n ≤ 5,000: loop in a loop, *O(n²)*', icon: '🎯' },
              { text: 'n ≤ 10⁶: a sort or *one pass*', icon: '➡️' },
              { text: 'n ≤ 10⁹: *binary search* or math', icon: '🔍' },
            ],
            active: 2,
          },
        },
        {
          say: 'The easy way tries every triple, with three loops, one inside the other.',
          emphasis: ['every', 'triple'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'pseudo',
            file: 'Brute force',
            code: `function numTeams(r):
    teams ← 0
    for i from 0 to n - 1:
        for j from i + 1 to n - 1:
            for k from j + 1 to n - 1:
                if the three go up or down:
                    teams ← teams + 1
    return teams`,
            highlight: [[3, 5]],
            note: { line: 5, text: 'three loops: O(n³)', tone: 'warn' },
          },
        },
        {
          say: 'That is O of n cubed. A thousand kids makes about a hundred seventy million triples. Over budget.',
          speak: 'That is oh of n cubed. A thousand kids makes about a hundred seventy million triples. Over budget.',
          emphasis: ['cubed', 'budget'],
          sfx: 'error',
          scene: {
            type: 'stat',
            value: '170M',
            label: 'triples for *1,000* kids',
            sub: 'O(n³): too slow for one second',
            tone: 'bad',
          },
        },
        {
          say: 'Listing teams one by one is the waste. Fix the middle kid, count partners on each side, and multiply.',
          emphasis: ['middle', 'multiply'],
          sfx: 'ding',
          scene: { type: 'title', kicker: 'The insight', title: 'Fix the *middle* kid', emoji: '💡', style: 'slam' },
        },
        {
          say: 'Middle five. Nobody on its left is faster, and nobody on its right is faster. Zero teams.',
          emphasis: ['zero'],
          scene: {
            type: 'array',
            title: 'Fix the middle',
            cells: ratings,
            pointers: { j: 1 },
            active: [1],
            reads: [0, 2, 3, 4],
            vars: { up: '1 × 0', down: '0 × 3', teams: 0 },
            caption: 'count slower and faster on each side',
          },
        },
        {
          say: 'Middle three. On its left, two is slower and five is faster.',
          emphasis: ['slower', 'faster'],
          scene: {
            type: 'array',
            title: 'Fix the middle',
            cells: ratings,
            pointers: { j: 2 },
            active: [2],
            reads: [0, 1],
            vars: { up: '1 × ?', down: '1 × ?', teams: 0 },
            caption: 'left side: one slower, one faster',
          },
        },
        {
          say: 'On its right, four is faster and one is slower. One times one, twice, adds two teams.',
          emphasis: ['two'],
          scene: {
            type: 'array',
            title: 'Fix the middle',
            cells: ratings,
            pointers: { j: 2 },
            active: [2],
            reads: [3, 4],
            vars: { up: '1 × 1', down: '1 × 1', teams: 2 },
            caption: 'right side: one faster, one slower',
          },
        },
        {
          say: 'Middle four. Five on its left and one on its right make one more team. Three in all.',
          emphasis: ['three'],
          sfx: 'success',
          scene: {
            type: 'array',
            title: 'Fix the middle',
            cells: ratings,
            pointers: { j: 3 },
            active: [3],
            reads: [1, 4],
            vars: { up: '2 × 0', down: '1 × 1', teams: 3 },
            caption: '5, 4, 1 goes down: one team',
          },
        },
        {
          say: 'In JavaScript, each middle walks the line once. That is O of n squared, about a million steps.',
          speak: 'In JavaScript, each middle walks the line once. That is oh of n squared, about a million steps.',
          emphasis: ['squared', 'million'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'numTeams.js',
            code: `function numTeams(r) {
  let teams = 0, n = r.length;
  for (let j = 1; j < n - 1; j++) {
    let lowL = 0, lowR = 0;
    for (let i = 0; i < j; i++)
      if (r[i] < r[j]) lowL++;
    for (let k = j + 1; k < n; k++)
      if (r[k] < r[j]) lowR++;
    const hiL = j - lowL;
    const hiR = n - 1 - j - lowR;
    teams += lowL * hiR + hiL * lowR;
  }
  return teams;
}`,
            highlight: [11],
            note: { line: 11, text: 'one walk per middle: O(n²)', tone: 'good' },
          },
        },
        {
          say: 'The trap: the examples only have five kids, so a slow idea passes them. The hidden tests use a thousand.',
          emphasis: ['hidden', 'thousand'],
          sfx: 'error',
          scene: {
            type: 'terminal',
            title: 'Submit the O(n³) idea',
            lines: [
              { cmd: 'submit numTeams.js' },
              { out: 'example 1 (n = 5)    passed', tone: 'good' },
              { out: 'example 2 (n = 3)    passed', tone: 'good' },
              { out: 'test 40 (n = 1000)', tone: 'muted' },
              { out: 'Time Limit Exceeded', tone: 'bad' },
            ],
          },
        },
        {
          say: 'Quick check. The limit says n is up to a hundred thousand, and your idea is O of n squared. Does it pass?',
          speak: 'Quick check. The limit says n is up to a hundred thousand, and your idea is oh of n squared. Does it pass?',
          sfx: 'riser',
          scene: {
            type: 'quiz',
            question: 'n ≤ 100,000 and your idea is O(n²). Does it pass?',
            options: ['Yes, 10⁵ is small', 'No, about 10¹⁰ steps', 'Yes, about 10⁷ steps', 'Only for small n'],
            answer: 1,
          },
        },
        {
          say: 'No. That is ten billion steps, a hundred times over budget. Aim for n log n, or n.',
          emphasis: ['billion'],
          sfx: 'ding',
          scene: {
            type: 'quiz',
            question: 'n ≤ 100,000 and your idea is O(n²). Does it pass?',
            options: ['Yes, 10⁵ is small', 'No, about 10¹⁰ steps', 'Yes, about 10⁷ steps', 'Only for small n'],
            answer: 1,
            reveal: true,
            explain: '(10⁵)² = 10¹⁰: a hundred times the 10⁸ budget.',
          },
        },
        {
          say: 'Remember this. The limits tell you the target before you write a line. Now tap solve it and try it yourself.',
          emphasis: ['limits', 'target'],
          sfx: 'success',
          scene: {
            type: 'outro',
            points: ['Plug the biggest *n* into Big-O', 'Stay under about *10⁸* steps', 'Triples? *Fix the middle*'],
            tagline: 'Now go solve it.',
          },
        },
      ],
    },
    {
      id: 'dsa-thinking-pseudocode',
      title: 'Writing pseudocode',
      link: { label: 'Solve it', href: '/dsa#/m/thinking/pseudocode/thinking-max-consecutive-ones' },
      beats: [
        {
          say: 'Your fitness app says, longest streak, three days. Who wrote that?',
          emphasis: ['streak'],
          scene: { type: 'title', kicker: 'Pseudocode · Lesson 3', title: 'Longest streak: *3 days*', emoji: '🔥', style: 'slam' },
        },
        {
          say: 'A one means you hit your step goal, and a zero means you missed. The longest run of ones is three.',
          emphasis: ['three'],
          sfx: 'pop',
          scene: {
            type: 'array',
            title: 'One number per day',
            cells: days,
            found: [3, 4, 5],
            vars: { best: 3 },
            caption: '1 = goal hit, 0 = missed',
          },
        },
        {
          say: 'Plan it in pseudocode first: plain steps, no brackets. The arrow means store, and equals means compare.',
          emphasis: ['store', 'compare'],
          scene: {
            type: 'code',
            lang: 'pseudo',
            file: 'Plan, then code',
            code: `best ← 0
// let best = 0;
if x = 1:
// if (x === 1) {
for each x in nums:
// for (const x of nums)`,
            highlight: [[1, 4]],
            note: { line: 4, text: '← stores, = compares', tone: 'info' },
          },
        },
        {
          say: 'The easy plan starts a walk at every day. But it walks the same ones again and again: O of n squared.',
          speak: 'The easy plan starts a walk at every day. But it walks the same ones again and again: oh of n squared.',
          emphasis: ['again', 'squared'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'pseudo',
            file: 'Brute force',
            code: `function longestStreak(nums):
    best ← 0
    for start from 0 to n - 1:
        length ← 0
        while nums[start + length] = 1:
            length ← length + 1
        best ← max(best, length)
    return best`,
            highlight: [[3, 5]],
            note: { line: 5, text: 're-walks the same streak', tone: 'warn' },
          },
        },
        {
          say: 'So walk once and carry two numbers: the current streak, and the best so far.',
          emphasis: ['current', 'best'],
          sfx: 'ding',
          scene: { type: 'title', kicker: 'The insight', title: 'Carry the *current* streak', emoji: '💡', style: 'slam' },
        },
        {
          say: 'Written as a plan, a one grows the streak, and a zero resets it. Every line is one small action.',
          emphasis: ['grows', 'resets'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'pseudo',
            file: 'One pass',
            code: `function longestStreak(nums):
    current ← 0
    best ← 0
    for each x in nums:
        if x = 1:
            current ← current + 1
            best ← max(best, current)
        else:
            current ← 0
    return best`,
            highlight: [[5, 9]],
            note: { line: 9, text: 'a 0 breaks the streak', tone: 'info' },
          },
        },
        {
          say: 'Now dry-run it by hand. Day zero is a one, so a streak starts. Current and best are both one.',
          emphasis: ['dry-run'],
          scene: {
            type: 'array',
            title: 'Dry run by hand',
            cells: days,
            pointers: { i: 0 },
            window: [0, 0],
            active: [0],
            vars: { current: 1, best: 1 },
            caption: 'the band is the current streak',
          },
        },
        {
          say: 'Another one. The streak grows to two, and that is a new best.',
          emphasis: ['two'],
          scene: {
            type: 'array',
            title: 'Dry run by hand',
            cells: days,
            pointers: { i: 1 },
            window: [0, 1],
            active: [1],
            vars: { current: 2, best: 2 },
            caption: 'a 1 adds one to the streak',
          },
        },
        {
          say: 'A zero breaks it. Current drops to zero, but best keeps two.',
          emphasis: ['breaks', 'keeps'],
          scene: {
            type: 'array',
            title: 'Dry run by hand',
            cells: days,
            pointers: { i: 2 },
            window: [2, 1],
            active: [2],
            vars: { current: 0, best: 2 },
            caption: 'a 0 resets the streak',
          },
        },
        {
          say: 'Days three and four build a new streak of two. That ties the record.',
          emphasis: ['ties'],
          scene: {
            type: 'array',
            title: 'Dry run by hand',
            cells: days,
            pointers: { i: 4 },
            window: [3, 4],
            active: [4],
            vars: { current: 2, best: 2 },
            caption: 'a new streak, built day by day',
          },
        },
        {
          say: 'Day five makes it three, a new record. We read each day just once.',
          emphasis: ['three', 'once'],
          sfx: 'success',
          scene: {
            type: 'array',
            title: 'Dry run by hand',
            cells: days,
            pointers: { i: 5 },
            window: [3, 5],
            found: [3, 4, 5],
            vars: { current: 3, best: 3 },
            caption: 'one pass, two numbers',
          },
        },
        {
          say: 'Then translate it line by line. The arrow becomes equals, and equals becomes three equals. That is O of n.',
          speak: 'Then translate it line by line. The arrow becomes equals, and equals becomes three equals. That is oh of n.',
          emphasis: ['line', 'translate'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'longestStreak.js',
            code: `function longestStreak(nums) {
  let current = 0;
  let best = 0;
  for (const x of nums) {
    if (x === 1) {
      current++;
      best = Math.max(best, current);
    } else {
      current = 0;
    }
  }
  return best;
}`,
            highlight: [[5, 7]],
            note: { line: 7, text: 'one look per day: O(n)', tone: 'good' },
          },
        },
        {
          say: 'The trap: saving best only when a zero shows up. On zero, one, one, one, the last streak is never saved.',
          emphasis: ['never', 'saved'],
          sfx: 'error',
          scene: {
            type: 'code',
            lang: 'pseudo',
            file: 'Buggy plan',
            code: `for each x in nums:
    if x = 1:
        current ← current + 1
    else:
        best ← max(best, current)
        current ← 0
return best`,
            errors: [5],
            note: { line: 7, text: '[0, 1, 1, 1] returns 0, not 3', tone: 'bad' },
          },
        },
        {
          say: 'Quick check. In pseudocode, what does the arrow mean?',
          sfx: 'riser',
          scene: {
            type: 'quiz',
            question: 'In pseudocode, what does the ← in best ← 0 mean?',
            options: ['Compare two values', 'Store a value', 'Move one step left', 'Less than or equal'],
            answer: 1,
          },
        },
        {
          say: 'It stores a value in a name. The equals sign only compares, like three equals in JavaScript.',
          emphasis: ['stores', 'question'],
          sfx: 'ding',
          scene: {
            type: 'quiz',
            question: 'In pseudocode, what does the ← in best ← 0 mean?',
            options: ['Compare two values', 'Store a value', 'Move one step left', 'Less than or equal'],
            answer: 1,
            reveal: true,
            explain: '← stores. = only asks a yes or no question.',
          },
        },
        {
          say: 'Remember this. Plan in small steps, then dry-run it by hand before you code. Now tap solve it and try it yourself.',
          emphasis: ['plan', 'dry-run'],
          sfx: 'success',
          scene: {
            type: 'outro',
            points: ['One small action per line', '*Dry-run* it on a tiny example', 'In a row? *Streak counter*'],
            tagline: 'Now go solve it.',
          },
        },
      ],
    },
    {
      id: 'dsa-thinking-solving-loop',
      title: 'The solving loop',
      link: { label: 'Solve it', href: '/dsa#/m/thinking/solving-loop/thinking-majority-element' },
      beats: [
        {
          say: 'A voting machine remembers just two numbers. Can it name the winner?',
          emphasis: ['two', 'winner'],
          scene: { type: 'title', kicker: 'Solving loop · Lesson 4', title: 'Two numbers, one *winner*', emoji: '🗳️', style: 'slam' },
        },
        {
          say: 'Good solvers do not wait for genius. They run the same loop every time, and the idea shows up in the middle.',
          emphasis: ['same', 'loop'],
          scene: {
            type: 'timeline',
            title: 'The solving loop',
            steps: [
              { label: 'Understand', icon: '🧐' },
              { label: 'Examples', icon: '✍️' },
              { label: 'Brute force', icon: '🔨' },
              { label: 'Spot the waste', icon: '🔍' },
              { label: 'Optimize', icon: '⚡' },
              { label: 'Dry run, test', icon: '✅' },
            ],
            active: 3,
          },
        },
        {
          say: 'Votes come in: two, two, one, one, one, two, two. Two got four of seven votes, more than half.',
          emphasis: ['half'],
          sfx: 'pop',
          scene: {
            type: 'array',
            title: 'Votes for class president',
            cells: votes,
            found: [0, 1, 5, 6],
            vars: { winner: 2, votes: '4 of 7' },
            caption: 'more than half is promised',
          },
        },
        {
          say: 'Brute force counts each vote from scratch, again and again. That is O of n squared.',
          speak: 'Brute force counts each vote from scratch, again and again. That is oh of n squared.',
          emphasis: ['scratch', 'squared'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'pseudo',
            file: 'Brute force',
            code: `function majorityElement(nums):
    for each candidate in nums:
        count ← 0
        for each x in nums:
            if x = candidate:
                count ← count + 1
        if count > n / 2:
            return candidate`,
            highlight: [[2, 4]],
            note: { line: 4, text: 'recounts the same value', tone: 'warn' },
          },
        },
        {
          say: 'Sorting or a map would work, but we only have two numbers. So let the votes cancel out.',
          emphasis: ['cancel'],
          sfx: 'ding',
          scene: { type: 'title', kicker: 'The insight', title: 'Votes *cancel* out', emoji: '💡', style: 'slam', sub: 'the winner has more than everyone else combined' },
        },
        {
          say: 'The first two becomes the candidate. Another two matches, so the count goes up to two.',
          emphasis: ['candidate', 'up'],
          scene: {
            type: 'array',
            title: 'Cancel out',
            cells: votes,
            pointers: { i: 1 },
            active: [1],
            done: [0],
            vars: { cand: 2, count: 2 },
            caption: 'same vote: count up',
          },
        },
        {
          say: 'A one is a different vote. It cancels one of the twos, so the count goes down.',
          emphasis: ['cancels', 'down'],
          scene: {
            type: 'array',
            title: 'Cancel out',
            cells: votes,
            pointers: { i: 2 },
            active: [2],
            done: [0, 1],
            vars: { cand: 2, count: 1 },
            caption: 'different vote: count down',
          },
        },
        {
          say: 'Another one cancels the last two. Everything so far has paired off, and the count is zero.',
          emphasis: ['zero'],
          scene: {
            type: 'array',
            title: 'Cancel out',
            cells: votes,
            pointers: { i: 3 },
            active: [3],
            done: [0, 1, 2],
            vars: { cand: 2, count: 0 },
            caption: 'four votes, all paired off',
          },
        },
        {
          say: 'The count is zero, so this one becomes the new candidate.',
          emphasis: ['new'],
          scene: {
            type: 'array',
            title: 'Cancel out',
            cells: votes,
            pointers: { i: 4 },
            active: [4],
            done: [0, 1, 2, 3],
            vars: { cand: 1, count: 1 },
            caption: 'count at zero: pick a new one',
          },
        },
        {
          say: 'A two cancels it, and the count is back to zero.',
          emphasis: ['zero'],
          scene: {
            type: 'array',
            title: 'Cancel out',
            cells: votes,
            pointers: { i: 5 },
            active: [5],
            done: [0, 1, 2, 3, 4],
            vars: { cand: 1, count: 0 },
            caption: 'different vote: count down',
          },
        },
        {
          say: 'The last two takes over and nobody is left to cancel it. The winner is two.',
          emphasis: ['winner'],
          sfx: 'success',
          scene: {
            type: 'array',
            title: 'Cancel out',
            cells: votes,
            pointers: { i: 6 },
            found: [6],
            done: [0, 1, 2, 3, 4, 5],
            vars: { cand: 2, count: 1 },
            caption: 'the winner is left standing',
          },
        },
        {
          say: 'In JavaScript it is one loop and two variables. O of n time, and almost no memory.',
          speak: 'In JavaScript it is one loop and two variables. Oh of n time, and almost no memory.',
          emphasis: ['two', 'memory'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'majority.js',
            code: `function majorityElement(nums) {
  let candidate = null;
  let count = 0;
  for (const x of nums) {
    if (count === 0) candidate = x;
    count += x === candidate ? 1 : -1;
  }
  return candidate;
}`,
            highlight: [[5, 6]],
            note: { line: 6, text: 'O(n) time, O(1) space', tone: 'good' },
          },
        },
        {
          say: 'The trap: voting always names someone. On one, two, three it picks three, with just one vote. It needs the promise.',
          emphasis: ['promised'],
          sfx: 'error',
          scene: {
            type: 'array',
            title: 'No promise, no winner',
            cells: [1, 2, 3],
            pointers: { i: 2 },
            active: [2],
            done: [0, 1],
            vars: { cand: 3, count: 1 },
            caption: '3 got one vote out of three',
          },
        },
        {
          say: 'Quick check. Your brute force is correct, but too slow for the limits. What is the next step of the loop?',
          sfx: 'riser',
          scene: {
            type: 'quiz',
            question: 'Brute force works, but it is too slow. Next step?',
            options: ['Code it anyway', 'Spot the waste', 'Check edge cases', 'Look up the answer'],
            answer: 1,
          },
        },
        {
          say: 'Spot the waste. The work the brute force repeats points straight at the faster idea.',
          emphasis: ['waste'],
          sfx: 'ding',
          scene: {
            type: 'quiz',
            question: 'Brute force works, but it is too slow. Next step?',
            options: ['Code it anyway', 'Spot the waste', 'Check edge cases', 'Look up the answer'],
            answer: 1,
            reveal: true,
            explain: 'Its repeated work is the map to a faster idea.',
          },
        },
        {
          say: 'Remember this. Run the same loop every time, and read every promise. Now tap solve it and try it yourself.',
          emphasis: ['loop', 'promise'],
          sfx: 'success',
          scene: {
            type: 'outro',
            points: ['Same loop, every problem', 'Brute force shows the *waste*', 'Read every *promise*'],
            tagline: 'Now go solve it.',
          },
        },
      ],
    },
    {
      id: 'dsa-thinking-js-toolkit',
      title: 'JavaScript toolkit and traps',
      link: { label: 'Solve it', href: '/dsa#/m/thinking/js-toolkit/thinking-height-checker' },
      beats: [
        {
          say: 'The kid who ran nine seconds came last. JavaScript did that.',
          emphasis: ['last'],
          scene: { type: 'title', kicker: 'JS toolkit · Lesson 5', title: 'The leaderboard that *lied*', emoji: '🏅', style: 'slam' },
        },
        {
          say: 'Race times: twenty five, nine and ten seconds. Sort them, and nine should come first.',
          emphasis: ['nine', 'first'],
          sfx: 'pop',
          scene: {
            type: 'array',
            title: 'Race times, in seconds',
            cells: [25, 9, 10],
            active: [1],
            vars: { fastest: 9 },
            caption: 'the fastest kid should be first',
          },
        },
        {
          say: 'But times dot sort gave ten, twenty five, nine. It sorted the numbers like words.',
          emphasis: ['words'],
          sfx: 'error',
          scene: {
            type: 'array',
            title: 'Race times, in seconds',
            cells: [10, 25, 9],
            active: [2],
            vars: { fastest: 9 },
            caption: 'sort() compared them as text',
          },
        },
        {
          say: 'Same bug in a real problem: count kids in the wrong spot for a photo. This line has two bugs.',
          emphasis: ['two', 'bugs'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'First try',
            code: `function heightChecker(h) {
  const sorted = h.sort();
  let wrong = 0;
  for (let i = 0; i < h.length; i++)
    if (h[i] !== sorted[i]) wrong++;
  return wrong;
}`,
            errors: [2],
            note: { line: 2, text: 'sorts as text, in place', tone: 'bad' },
          },
        },
        {
          say: 'Sort compares as text. And it sorts the input itself, so both names hold one array, and every spot matches.',
          emphasis: ['text', 'same'],
          sfx: 'click',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'First try',
            code: `function heightChecker(h) {
  const sorted = h.sort();
  let wrong = 0;
  for (let i = 0; i < h.length; i++)
    if (h[i] !== sorted[i]) wrong++;
  return wrong;
}`,
            errors: [5],
            note: { line: 5, text: 'one array: always 0 wrong', tone: 'bad' },
          },
        },
        {
          say: 'The fix: copy first, then pass a compare function. A minus b sorts small to big.',
          emphasis: ['copy', 'compare'],
          sfx: 'ding',
          scene: { type: 'title', kicker: 'The insight', title: 'Copy, then sort *by number*', emoji: '💡', style: 'slam' },
        },
        {
          say: 'The sorted copy goes under the line. Spots zero and one match.',
          emphasis: ['copy'],
          sfx: 'swipe',
          scene: {
            type: 'grid',
            title: 'Who is in the wrong spot?',
            rowLabels: ['height', 'sorted'],
            colLabels: ['0', '1', '2', '3', '4', '5'],
            cells: [heights, sortedHeights],
            active: [[0, 1], [1, 1]],
            done: [[0, 0], [1, 0]],
            vars: { wrong: 0 },
            caption: 'compare each spot, top and bottom',
          },
        },
        {
          say: 'At spot two, four is not one. That kid is in the wrong spot.',
          emphasis: ['wrong'],
          scene: {
            type: 'grid',
            title: 'Who is in the wrong spot?',
            rowLabels: ['height', 'sorted'],
            colLabels: ['0', '1', '2', '3', '4', '5'],
            cells: [heights, sortedHeights],
            active: [[0, 2], [1, 2]],
            done: [[0, 0], [1, 0], [0, 1], [1, 1]],
            vars: { wrong: 1 },
            caption: '4 is where 1 belongs',
          },
        },
        {
          say: 'Spot three matches. At spot four, one sits where three belongs. That makes two.',
          emphasis: ['two'],
          scene: {
            type: 'grid',
            title: 'Who is in the wrong spot?',
            rowLabels: ['height', 'sorted'],
            colLabels: ['0', '1', '2', '3', '4', '5'],
            cells: [heights, sortedHeights],
            active: [[0, 4], [1, 4]],
            done: [[0, 0], [1, 0], [0, 1], [1, 1], [0, 3], [1, 3]],
            vars: { wrong: 2 },
            caption: '1 is where 3 belongs',
          },
        },
        {
          say: 'Spot five is off too. Three kids are standing in the wrong spot.',
          emphasis: ['three'],
          sfx: 'success',
          scene: {
            type: 'grid',
            title: 'Who is in the wrong spot?',
            rowLabels: ['height', 'sorted'],
            colLabels: ['0', '1', '2', '3', '4', '5'],
            cells: [heights, sortedHeights],
            done: [[0, 0], [1, 0], [0, 1], [1, 1], [0, 3], [1, 3]],
            found: [[0, 2], [1, 2], [0, 4], [1, 4], [0, 5], [1, 5]],
            vars: { wrong: 3 },
            caption: 'three spots differ',
          },
        },
        {
          say: 'In JavaScript, spread makes the copy, and a minus b sorts by number. Sorting makes it O of n log n.',
          speak: 'In JavaScript, spread makes the copy, and a minus b sorts by number. Sorting makes it oh of n log n.',
          emphasis: ['copy', 'number'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'heightChecker.js',
            code: `function heightChecker(h) {
  const sorted =
    [...h].sort((a, b) => a - b);
  let wrong = 0;
  for (let i = 0; i < h.length; i++)
    if (h[i] !== sorted[i]) wrong++;
  return wrong;
}`,
            added: [[2, 3]],
            note: { line: 3, text: 'copy, then sort: O(n log n)', tone: 'good' },
          },
        },
        {
          say: 'Know what your tools cost. The end of an array is cheap, but shift, includes and slice walk every item.',
          emphasis: ['cheap', 'every'],
          scene: {
            type: 'list',
            title: 'What JS really costs',
            items: [
              { text: '*push*, *pop*: O(1)', icon: '⚡' },
              { text: '*shift*, *includes*: O(n)', icon: '🐢' },
              { text: '*slice*, spread: O(n)', icon: '📋' },
              { text: '*Set.has*, *Map.get*: O(1)', icon: '⚡' },
            ],
            active: 1,
          },
        },
        {
          say: 'The trap: fill with an empty array puts the same array in every slot. Push once, and all three change.',
          emphasis: ['same', 'all'],
          sfx: 'error',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'trap.js',
            code: `const grid = new Array(3).fill([]);
grid[0].push(5);
console.log(grid);`,
            errors: [1],
            note: { line: 3, text: '[[5], [5], [5]]: one shared array', tone: 'bad' },
          },
        },
        {
          say: 'Quick check. You sort ten, nine and one with no compare function. What do you get?',
          sfx: 'riser',
          scene: {
            type: 'quiz',
            question: 'What does [10,9,1].sort() return?',
            options: ['[1, 9, 10]', '[1, 10, 9]', '[10, 9, 1]', '[9, 10, 1]'],
            answer: 1,
          },
        },
        {
          say: 'One, ten, nine. As text, one comes before ten, and ten comes before nine.',
          emphasis: ['text'],
          sfx: 'ding',
          scene: {
            type: 'quiz',
            question: 'What does [10,9,1].sort() return?',
            options: ['[1, 9, 10]', '[1, 10, 9]', '[10, 9, 1]', '[9, 10, 1]'],
            answer: 1,
            reveal: true,
            explain: 'As text, "1" < "10" < "9". Sort with a - b.',
          },
        },
        {
          say: 'Remember this. Sort numbers with a compare function, and copy first. Now tap solve it and try it yourself.',
          emphasis: ['compare', 'copy'],
          sfx: 'success',
          scene: {
            type: 'outro',
            points: ['Sort numbers with *a - b*', '*Copy* first, then sort', '*fill([])* shares one array'],
            tagline: 'Now go solve it.',
          },
        },
      ],
    },
  ],
};
