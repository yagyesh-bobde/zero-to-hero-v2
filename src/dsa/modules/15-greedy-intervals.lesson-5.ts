import type { Lesson } from '../types';

const partitionPseudo = `function partitionLabels(s):
    last ← empty map
    for i from 0 to n - 1:
        last[s[i]] ← i                   // later spots overwrite earlier
    sizes ← empty list
    start ← 0
    end ← 0
    for i from 0 to n - 1:
        end ← max(end, last[s[i]])
        if i = end:                      // nothing here appears later
            append end - start + 1 to sizes
            start ← i + 1
    return sizes`;

const partitionCode = `function partitionLabels(s) {
  const last = {};
  for (let i = 0; i < s.length; i++) last[s[i]] = i;
  const sizes = [];
  let start = 0;
  let end = 0;
  for (let i = 0; i < s.length; i++) {
    end = Math.max(end, last[s[i]]);
    if (i === end) {
      sizes.push(end - start + 1);
      start = i + 1;
    }
  }
  return sizes;
}`;

const straightsCode = `function isNStraightHand(hand, groupSize) {
  if (hand.length % groupSize !== 0) return false;
  const count = new Map();
  for (const card of hand) count.set(card, (count.get(card) || 0) + 1);
  const values = [...count.keys()].sort((a, b) => a - b);
  for (const x of values) {
    const need = count.get(x); // runs that must start at x
    if (need === 0) continue;
    for (let v = x; v < x + groupSize; v++) {
      const have = count.get(v) || 0;
      if (have < need) return false;
      count.set(v, have - need);
    }
  }
  return true;
}`;

const tripletsCode = `function mergeTriplets(triplets, target) {
  const best = [0, 0, 0];
  for (const t of triplets) {
    if (t[0] <= target[0] && t[1] <= target[1] && t[2] <= target[2]) {
      for (let k = 0; k < 3; k++) best[k] = Math.max(best[k], t[k]);
    }
  }
  return best[0] === target[0] && best[1] === target[1] && best[2] === target[2];
}`;

const parensCode = `function checkValidString(s) {
  let lo = 0; // fewest open brackets possible
  let hi = 0; // most open brackets possible
  for (const ch of s) {
    if (ch === '(') {
      lo++;
      hi++;
    } else if (ch === ')') {
      lo--;
      hi--;
    } else {
      lo--; // read * as ')'
      hi++; // read * as '('
    }
    if (hi < 0) return false;
    lo = Math.max(lo, 0);
  }
  return lo === 0;
}`;

const word = 'abcabddefe'.split('');

const lesson: Lesson = {
  id: 'partition-and-grouping',
  title: 'Partition and grouping',
  summary: 'Cut as early as you safely can, and let the smallest item decide its own group.',
  minutes: 22,
  blocks: [
    {
      kind: 'callout',
      tone: 'story',
      title: 'Packing a shelf into boxes',
      text: 'Movers pack a long shelf of items, left to right, into boxes. Every item has a label, and all items with the same label must end up in the same box. Smaller boxes are easier to carry, so they want as many boxes as possible. Where do they cut? Splitting a long video into chapters so each topic sits in one chapter is the same puzzle.',
    },
    {
      kind: 'text',
      text: '**The problem.** A string `s` of lowercase letters. Cut it into as many parts as possible so that each letter shows up in only one part. Return the sizes of the parts. `s = "abcabddefe"` → `[5, 2, 3]`, from `"abcab" | "dd" | "efe"`.',
    },
    {
      kind: 'text',
      text: '**Brute force first.** Walk along the string. At each spot, ask: does any letter in the current part show up again further right? If not, cut here.',
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Brute force: rescan the rest',
      code: `function partitionLabels(s):
    sizes ← empty list
    start ← 0
    for i from 0 to n - 1:
        if no letter in s[start..i] appears in s[i+1..n-1]:
            append i - start + 1 to sizes
            start ← i + 1
    return sizes`,
    },
    {
      kind: 'text',
      text: '**Spot the waste.** Every check rescans the rest of the string: O(n²). But the only thing you ever need to know about a letter is *where it shows up for the last time*. That never changes. Work it out once, up front.',
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'Stretch to the farthest last spot, cut when you get there',
      text: 'First record `last[c]`, the last index of each letter. Walk left to right and keep `end` = the farthest `last` of any letter in the current part. When `i` reaches `end`, nothing in this part shows up later: cut. This is the farthest-reach idea from lesson 2 again. Why is it safe? You can\'t cut before `end` (some letter reaches it), and cutting the moment you can leaves the most string for more parts.',
    },
    {
      kind: 'steps',
      title: 'Partition "abcabddefe"',
      frames: [
        {
          cells: word,
          pointers: { i: 0 },
          active: [0],
          vars: { last: 'a3 b4 c2 d6 e9 f8', end: 3, sizes: '[]' },
          note: 'Last spots are worked out first. `a` last shows up at 3, so this part must reach at least index 3. end = 3.',
        },
        {
          cells: word,
          pointers: { i: 1 },
          active: [1],
          vars: { last: 'a3 b4 c2 d6 e9 f8', end: 4, sizes: '[]' },
          note: '`b` last shows up at 4. The part must stretch: end = 4.',
        },
        {
          cells: word,
          pointers: { i: 3 },
          active: [2, 3],
          vars: { last: 'a3 b4 c2 d6 e9 f8', end: 4, sizes: '[]' },
          note: '`c` (last at 2) and `a` (last at 3) are both inside. end stays 4.',
        },
        {
          cells: word,
          pointers: { i: 4 },
          found: [0, 1, 2, 3, 4],
          vars: { last: 'a3 b4 c2 d6 e9 f8', end: 4, sizes: '[5]' },
          note: '`i = 4 = end`. No letter of "abcab" shows up later. Cut: size 5.',
        },
        {
          cells: word,
          pointers: { i: 5 },
          active: [5],
          done: [0, 1, 2, 3, 4],
          vars: { last: 'a3 b4 c2 d6 e9 f8', end: 6, sizes: '[5]' },
          note: 'New part starts at 5. `d` last shows up at 6. end = 6.',
        },
        {
          cells: word,
          pointers: { i: 6 },
          found: [5, 6],
          done: [0, 1, 2, 3, 4],
          vars: { last: 'a3 b4 c2 d6 e9 f8', end: 6, sizes: '[5, 2]' },
          note: '`i = 6 = end`. Cut: size 2.',
        },
        {
          cells: word,
          pointers: { i: 7 },
          active: [7],
          done: [0, 1, 2, 3, 4, 5, 6],
          vars: { last: 'a3 b4 c2 d6 e9 f8', end: 9, sizes: '[5, 2]' },
          note: '`e` last shows up at 9, the very end. end = 9.',
        },
        {
          cells: word,
          pointers: { i: 8 },
          active: [8],
          done: [0, 1, 2, 3, 4, 5, 6],
          vars: { last: 'a3 b4 c2 d6 e9 f8', end: 9, sizes: '[5, 2]' },
          note: '`f` (last at 8) is inside. end stays 9.',
        },
        {
          cells: word,
          pointers: { i: 9 },
          found: [7, 8, 9],
          done: [0, 1, 2, 3, 4, 5, 6],
          vars: { last: 'a3 b4 c2 d6 e9 f8', end: 9, sizes: '[5, 2, 3]' },
          note: '`i = 9 = end`. Cut: size 3. Answer: **[5, 2, 3]**.',
        },
      ],
    },
    { kind: 'code', lang: 'pseudo', title: 'Partition Labels', code: partitionPseudo },
    { kind: 'code', lang: 'js', title: 'Partition Labels in JavaScript', code: partitionCode },
    {
      kind: 'compare',
      title: 'Partition a string of n letters',
      rows: [
        { approach: 'Rescan the rest at each spot', time: 'O(n²)', space: 'O(1)', note: 'Looks at the same letters again and again.' },
        { approach: 'Last index + farthest reach', time: 'O(n)', space: 'O(1)', note: 'Two passes. The map holds at most 26 letters.' },
      ],
    },
    {
      kind: 'text',
      text: '**Grouping: let the smallest decide.** A second greedy shape. You hold cards and must split them all into runs of `k` numbers in a row, like `2, 3, 4`. Look at the smallest card left. Nothing smaller exists, so it can\'t be the middle or the end of a run. It **must start** one. Build that run, then repeat. There is no choice to get wrong.',
    },
    {
      kind: 'diagram',
      title: 'Hand of Straights, k = 3',
      art: `hand:    1 2 3 6 2 3 4 7 8
sorted:  1 2 2 3 3 4 6 7 8

smallest 1 starts:  1 2 3    left: 2 3 4 6 7 8
smallest 2 starts:  2 3 4    left: 6 7 8
smallest 6 starts:  6 7 8    left: (nothing)
every run worked -> true`,
      caption: 'If a run ever needs a card you don\'t have, the answer is false. The smallest card had no other option.',
    },
    { kind: 'text', text: '**The pattern.** Reach for these when you see:' },
    {
      kind: 'list',
      items: [
        'Cut a sequence into the **most** pieces under a "must stay together" rule: track the farthest point the current piece is forced to reach.',
        'Split items into groups or runs: the smallest item has only one possible role, so give it that role.',
        'Combining only ever takes a `max` (or `min`): throw out every item that overshoots, then use all the rest (Merge Triplets).',
      ],
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Templates: cut early, smallest decides',
      code: `// cut as early as you can
end ← 0
for i from 0 to n - 1:
    end ← max(end, farthest point item i forces)
    if i = end:
        close the current piece here

// smallest decides
while items remain:
    x ← smallest item left
    build the only group x can belong to, or fail`,
    },
    {
      kind: 'callout',
      tone: 'trap',
      title: 'Map keys are not sorted',
      text: 'In Hand of Straights you count cards in a `Map`, then walk the card values from small to big. A `Map` gives keys back in the order you *added* them, not sorted. And `[...count.keys()].sort()` puts 10 before 9 (text order). Write `.sort((a, b) => a - b)`. Also check `hand.length % groupSize === 0` first; if not, return `false` right away.',
    },
  ],
  problems: [
    {
      id: 'greedy-intervals-partition-labels',
      title: 'Partition Labels',
      difficulty: 'medium',
      leetcode: 763,
      pattern: 'Farthest reach (cut early)',
      statement:
        'Cut the string `s` into as many parts as possible so that each letter appears in only one part. Joined back in order, the parts must give `s`. Return the sizes of the parts, left to right.',
      examples: [
        { input: 's = "abcabddefe"', output: '[5, 2, 3]', explain: '"abcab" | "dd" | "efe"' },
        { input: 's = "ababcbacadefegdehijhklij"', output: '[9, 7, 8]' },
        { input: 's = "eccbbbbdec"', output: '[10]', explain: '`e` appears at both ends, so it is one part.' },
      ],
      constraints: ['1 ≤ s.length ≤ 500', 's has only lowercase English letters'],
      hints: [
        'For each letter, only one fact matters: where does it appear for the last time?',
        'Once a part contains letter `c`, the part can\'t end before `last[c]`.',
        'Walk left to right with `end = max(end, last[s[i]])`. When `i === end`, cut.',
      ],
      approaches: [
        {
          name: 'Rescan the rest',
          idea: 'At each spot, check whether any letter of the current part appears again to the right. Cut when none does. Correct, but each check scans the rest of the string.',
          time: 'O(n²)',
          space: 'O(1)',
        },
        {
          name: 'Last index + farthest reach (greedy)',
          idea: 'Record each letter\'s last index once. A part must stretch to the farthest last index of any letter inside it. The moment `i` reaches that point, cutting is safe, and cutting as early as possible leaves the most room for more parts.',
          pseudo: partitionPseudo,
          code: partitionCode,
          time: 'O(n)',
          space: 'O(1) (at most 26 letters)',
        },
      ],
      fn: 'partitionLabels',
      starter: `function partitionLabels(s) {
  // Return the sizes of the parts, left to right.
  return [];
}`,
      solution: partitionCode,
      tests: [
        { name: 'example', args: ['abcabddefe'], expected: [5, 2, 3] },
        { name: 'longer example', args: ['ababcbacadefegdehijhklij'], expected: [9, 7, 8] },
        { name: 'one big part', args: ['eccbbbbdec'], expected: [10] },
        { name: 'one letter', args: ['a'], expected: [1] },
        { name: 'all different', args: ['abc'], expected: [1, 1, 1] },
        { name: 'all the same', args: ['aaaa'], expected: [4] },
        { name: 'mirror', args: ['abba'], expected: [4] },
        { name: 'single then rest', args: ['caedbdedda'], expected: [1, 9] },
      ],
      takeaway: 'Stretch the part to the farthest place it is forced to reach, and cut the moment you get there.',
    },
    {
      id: 'greedy-intervals-hand-of-straights',
      title: 'Hand of Straights',
      difficulty: 'medium',
      leetcode: 846,
      pattern: 'Smallest decides',
      statement:
        'In a card game you win if you can split your whole hand into groups of exactly `groupSize` cards, where each group is a run of numbers in a row, like `[4, 5, 6]`. Every card must be used once. Return `true` if you can.',
      examples: [
        { input: 'hand = [1, 2, 3, 6, 2, 3, 4, 7, 8], groupSize = 3', output: 'true', explain: '[1, 2, 3], [2, 3, 4], [6, 7, 8]' },
        { input: 'hand = [1, 2, 3, 4, 5], groupSize = 4', output: 'false', explain: '5 cards can\'t split into groups of 4.' },
      ],
      constraints: ['1 ≤ hand.length ≤ 10⁴', '0 ≤ hand[i] ≤ 10⁹', '1 ≤ groupSize ≤ hand.length'],
      hints: [
        'Look at the smallest card. Which position can it take in a run?',
        'Only the first. So the run `x, x + 1, ..., x + groupSize − 1` must exist.',
        'Count cards in a map. Walk values from small to big. If `x` still has `c` copies, `c` runs start at `x`: take `c` copies of each of the next values, or fail.',
      ],
      approaches: [
        {
          name: 'Sort, remove runs one by one',
          idea: 'Sort the hand. Take the smallest card, then find and remove `x + 1`, `x + 2`, ... from the array. Repeat until empty. Correct, but each removal searches and shifts the array.',
          time: 'O(n²)',
          space: 'O(n)',
        },
        {
          name: 'Counts + smallest first (greedy)',
          idea: 'The smallest card left can only start a run, so that run is forced. With counts, you can start every run at `x` at once: subtract `count[x]` from each of the next `groupSize − 1` values.',
          pseudo: `function isNStraightHand(hand, groupSize):
    if n mod groupSize ≠ 0:
        return false
    count ← map of card → how many
    for each x in the keys of count, smallest first:
        need ← count[x]                 // runs that must start at x
        if need = 0:
            skip to the next x
        for v from x to x + groupSize - 1:
            if count[v] < need:         // missing (0 if absent)
                return false
            count[v] ← count[v] - need
    return true`,
          code: straightsCode,
          time: 'O(n log n)',
          space: 'O(n)',
        },
      ],
      fn: 'isNStraightHand',
      starter: `function isNStraightHand(hand, groupSize) {
  // Return true if the hand splits into runs of groupSize.
  return false;
}`,
      solution: straightsCode,
      tests: [
        { name: 'example', args: [[1, 2, 3, 6, 2, 3, 4, 7, 8], 3], expected: true },
        { name: 'wrong size', args: [[1, 2, 3, 4, 5], 4], expected: false },
        { name: 'one card', args: [[1], 1], expected: true },
        { name: 'doubles', args: [[1, 1, 2, 2, 3, 3], 3], expected: true },
        { name: 'missing middle card', args: [[1, 2, 4, 5, 6, 7], 3], expected: false },
        { name: 'gaps everywhere', args: [[8, 10, 12], 3], expected: false },
        { name: 'double digits (sort trap)', args: [[10, 11, 12, 9, 10, 11], 3], expected: true },
        { name: 'group of one', args: [[5, 1], 1], expected: true },
      ],
      takeaway: 'If the smallest item has only one possible role, there is no choice to get wrong.',
    },
    {
      id: 'greedy-intervals-merge-triplets',
      title: 'Brew the Exact Potion',
      difficulty: 'medium',
      leetcode: 1899,
      pattern: 'Greedy filter',
      statement:
        'Each potion has three stats `[power, speed, luck]`. Merging two potions makes one whose stats are the **max** of the two, stat by stat: `[2, 5, 3]` and `[1, 7, 5]` make `[2, 7, 5]`. You may merge any of the potions in `triplets`, as many times as you like. Return `true` if you can end up with a potion exactly equal to `target`.',
      examples: [
        { input: 'triplets = [[2, 5, 3], [1, 8, 4], [1, 7, 5]], target = [2, 7, 5]', output: 'true', explain: 'Merge [2, 5, 3] with [1, 7, 5]. Never touch [1, 8, 4]: its speed 8 is too high.' },
        { input: 'triplets = [[3, 4, 5], [4, 5, 6]], target = [3, 2, 5]', output: 'false' },
      ],
      constraints: ['1 ≤ triplets.length ≤ 10⁵', '1 ≤ every stat ≤ 1000'],
      hints: [
        'Merging can only make stats bigger. What about a potion with any stat above the target?',
        'It can never be used. It would push that stat past the target forever. Throw it away.',
        'Every other potion is safe: it never overshoots. Merge all the safe ones and check whether you hit each target stat.',
      ],
      approaches: [
        {
          name: 'Try every subset',
          idea: 'Merge every possible group of potions and see if any equals the target. Correct, but 2ⁿ groups.',
          time: 'O(2ⁿ · n)',
          space: 'O(n)',
        },
        {
          name: 'Drop overshooters, merge the rest (greedy)',
          idea: 'A potion that beats the target in any stat ruins that stat for good, so skip it. A safe potion never hurts: merging it can only bring stats closer to the target. So merge every safe potion and compare.',
          pseudo: `function mergeTriplets(triplets, target):
    best ← [0, 0, 0]
    for each t in triplets:
        if t[0] ≤ target[0] and t[1] ≤ target[1] and t[2] ≤ target[2]:
            for k from 0 to 2:
                best[k] ← max(best[k], t[k])
    return best = target`,
          code: tripletsCode,
          time: 'O(n)',
          space: 'O(1)',
        },
      ],
      fn: 'mergeTriplets',
      starter: `function mergeTriplets(triplets, target) {
  // Return true if some merge equals target.
  return false;
}`,
      solution: tripletsCode,
      tests: [
        { name: 'example', args: [[[2, 5, 3], [1, 8, 4], [1, 7, 5]], [2, 7, 5]], expected: true },
        { name: 'every potion overshoots', args: [[[3, 4, 5], [4, 5, 6]], [3, 2, 5]], expected: false },
        { name: 'needs three potions', args: [[[2, 5, 3], [2, 3, 4], [1, 2, 5], [5, 2, 3]], [5, 5, 5]], expected: true },
        { name: 'one potion, exact', args: [[[1, 1, 1]], [1, 1, 1]], expected: true },
        { name: 'one stat never reached', args: [[[1, 2, 3]], [1, 2, 4]], expected: false },
        { name: 'needed potion overshoots', args: [[[5, 1, 1], [1, 5, 1], [1, 1, 6]], [5, 5, 5]], expected: false },
        { name: 'one stat each', args: [[[5, 1, 1], [1, 5, 1], [1, 1, 5]], [5, 5, 5]], expected: true },
      ],
      takeaway: 'When combining only ever grows things, drop every item that overshoots and use all the rest.',
    },
    {
      id: 'greedy-intervals-valid-parenthesis-string',
      title: 'Smudged Brackets',
      difficulty: 'medium',
      leetcode: 678,
      pattern: 'Greedy range [lo, hi]',
      statement:
        'An old scanned page has a line of brackets, but some characters were smudged into `*`. Each `*` could have been `(`, `)` or nothing. Return `true` if some way of reading the `*`s makes the brackets valid: every `(` is closed by a later `)`, and no `)` comes before its `(`.',
      examples: [
        { input: 's = "(*)"', output: 'true' },
        { input: 's = "(*))"', output: 'true', explain: 'Read the * as (.' },
        { input: 's = "())*"', output: 'false', explain: 'The second ) has nothing to close, and the * comes too late to help.' },
      ],
      constraints: ['0 ≤ s.length ≤ 100', 's has only (, ) and *'],
      hints: [
        'Without `*`, you would track `open` = how many `(` are waiting. It must never go below 0 and must end at 0.',
        'With `*`, `open` is not one number any more. It is a range of possible values. Track the smallest and the largest.',
        '`(`: both go up. `)`: both go down. `*`: `lo` goes down (read it as `)`), `hi` goes up (read it as `(`).',
        'If `hi < 0`, there are too many `)`: false. Never let `lo` drop below 0. At the end, it is valid if `lo === 0`.',
      ],
      approaches: [
        {
          name: 'Try every reading',
          idea: 'Replace each `*` with `(`, `)` or nothing in every possible way, and check each string. Correct, but 3 choices per star.',
          time: 'O(3^k · n)',
          space: 'O(n)',
        },
        {
          name: 'Two stacks',
          idea: 'Push indexes of `(` and of `*` on two stacks. A `)` pops a `(` if there is one, else a `*`. At the end, every leftover `(` needs a leftover `*` that comes after it. Correct and linear, but more to write.',
          time: 'O(n)',
          space: 'O(n)',
        },
        {
          name: 'Track the range of open brackets (greedy)',
          idea: 'Keep `lo` and `hi`, the fewest and most `(` that could be open right now. If even `hi` drops below 0, no reading works. If `lo` drops below 0, that reading used a `*` as `)` it didn\'t need, so read that `*` as nothing instead: clamp `lo` to 0. At the end, 0 open must be possible.',
          pseudo: `function checkValidString(s):
    lo ← 0                       // fewest open brackets possible
    hi ← 0                       // most open brackets possible
    for each ch in s:
        if ch = '(':
            lo ← lo + 1
            hi ← hi + 1
        else if ch = ')':
            lo ← lo - 1
            hi ← hi - 1
        else:                    // '*'
            lo ← lo - 1          // read it as ')'
            hi ← hi + 1          // read it as '('
        if hi < 0:
            return false         // too many ')', whatever the stars are
        lo ← max(lo, 0)
    return lo = 0`,
          code: parensCode,
          time: 'O(n)',
          space: 'O(1)',
        },
      ],
      fn: 'checkValidString',
      starter: `function checkValidString(s) {
  // Return true if some reading of the stars is valid.
  return false;
}`,
      solution: parensCode,
      tests: [
        { name: 'simple pair', args: ['()'], expected: true },
        { name: 'star as nothing', args: ['(*)'], expected: true },
        { name: 'star as (', args: ['(*))'], expected: true },
        { name: 'empty', args: [''], expected: true },
        { name: 'wrong order', args: [')('], expected: false },
        { name: 'lone star', args: ['*'], expected: true },
        { name: 'too many open', args: ['(((**'], expected: false },
        { name: 'star as )', args: ['((*)'], expected: true },
        { name: 'star before )', args: ['*)'], expected: true },
        { name: 'one open', args: ['('], expected: false },
        { name: 'star too late', args: ['())*'], expected: false },
      ],
      takeaway: 'A range `[lo, hi]` can stand in for many possible choices at once.',
    },
  ],
  quiz: [
    {
      prompt: 'Partition Labels on `"abab"`. What comes back?',
      options: ['[2, 2]', '[4]', '[1, 1, 1, 1]', '[3, 1]'],
      answer: 1,
      explanation: '`a` last appears at 2 and `b` at 3, so the first part must reach index 3. One part of size 4.',
    },
    {
      prompt: 'Hand of Straights, `[1, 2, 3, 3, 4, 5]`, groupSize 3. The smallest card is 1. What must happen?',
      options: ['1 can go in any run', '1 must start the run 1, 2, 3', '1 must end a run', 'Skip the 1'],
      answer: 1,
      explanation: 'Nothing is smaller than 1, so it can only be first. After 1, 2, 3 you are left with 3, 4, 5, which works too.',
    },
    {
      prompt: 'Smudged Brackets: after some characters, `lo = 0` and `hi = 2`. What does that mean?',
      options: [
        'The string is already invalid',
        'Depending on how you read the stars, between 0 and 2 brackets are open',
        'Exactly 2 brackets are open',
        'There are 2 stars so far',
      ],
      answer: 1,
      explanation: '`lo` and `hi` are the edges of every possible count of open brackets.',
    },
    {
      prompt: 'Merge Triplets, target `[5, 5, 5]`. Can the potion `[6, 1, 1]` ever help?',
      options: ['Yes, it adds power', 'No: merging takes the max, so power would be stuck at 6 or more'],
      answer: 1,
      explanation: 'Stats never go down when you merge. One overshoot ruins that stat for good.',
    },
  ],
  takeaways: [
    'Partition = farthest reach with cuts: stretch `end` to each letter\'s last spot, cut when `i === end`.',
    'When the smallest item has only one possible role, give it that role. No choice means no risk.',
    'If combining only ever grows things (max), drop every item that overshoots and use all the rest.',
    'A range `[lo, hi]` can track many possibilities at once (Smudged Brackets).',
  ],
};

export default lesson;
