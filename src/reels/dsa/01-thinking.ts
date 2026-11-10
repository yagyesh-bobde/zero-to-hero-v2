import type { Series } from '../types';

// /dsa/reels module 1. One reel per lesson of src/dsa/modules/01-thinking*.ts, in lesson order.
// Brief: src/reels/dsa/README.md. Rules: src/reels/AUTHORING.md.

const prices = [7, 1, 5, 3, 6, 4];

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
  ],
};
