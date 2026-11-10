import type { Lesson } from '../types';

// Lesson 4: minimum window that covers a set of counts (76, 1234).

const minWindowPseudo = `function minWindow(s, t):
    need ← count of each letter in t
    missing ← length of t
    left ← 0
    bestStart ← 0
    bestLen ← infinity
    for right from 0 to n - 1:
        c ← s[right]                          // grow
        if need[c] > 0: missing ← missing - 1
        need[c] ← need[c] - 1
        while missing = 0:                    // covers t: shrink
            if right - left + 1 < bestLen:
                bestStart ← left
                bestLen ← right - left + 1
            out ← s[left]
            need[out] ← need[out] + 1
            if need[out] > 0: missing ← missing + 1
            left ← left + 1
    if bestLen = infinity: return ""
    return s from bestStart, length bestLen`;

const minWindowCode = `function minWindow(s, t) {
  const need = new Map();
  for (const c of t) need.set(c, (need.get(c) ?? 0) + 1);
  let missing = t.length;
  let left = 0;
  let bestStart = 0;
  let bestLen = Infinity;
  for (let right = 0; right < s.length; right++) {
    const c = s[right];
    if ((need.get(c) ?? 0) > 0) missing--;
    need.set(c, (need.get(c) ?? 0) - 1);
    while (missing === 0) {
      if (right - left + 1 < bestLen) {
        bestStart = left;
        bestLen = right - left + 1;
      }
      const out = s[left];
      need.set(out, need.get(out) + 1);
      if (need.get(out) > 0) missing++;
      left++;
    }
  }
  return bestLen === Infinity ? '' : s.slice(bestStart, bestStart + bestLen);
}`;

const balancedCode = `function balancedString(s) {
  const quota = s.length / 4;
  const count = { Q: 0, W: 0, E: 0, R: 0 };
  for (const c of s) count[c]++;
  const outsideOk = () =>
    count.Q <= quota && count.W <= quota && count.E <= quota && count.R <= quota;
  if (outsideOk()) return 0; // already balanced
  let left = 0;
  let best = s.length;
  for (let right = 0; right < s.length; right++) {
    count[s[right]]--; // s[right] moves into the window
    while (left <= right && outsideOk()) {
      best = Math.min(best, right - left + 1);
      count[s[left]]++; // s[left] moves back outside
      left++;
    }
  }
  return best;
}`;

export const minimumWindowLesson: Lesson = {
  id: 'minimum-window',
  title: 'Minimum window: the classic hard one',
  summary: 'Combine grow/shrink with a need map to find the shortest stretch that covers everything.',
  minutes: 24,
  blocks: [
    {
      kind: 'callout',
      tone: 'story',
      title: 'The search snippet',
      text: "Search for `cheap flights paris` and the result shows a short snippet from each page: the **smallest piece of text that contains all your words**. A long page might mention them hundreds of times. The engine needs the tightest stretch that covers every word at least once.",
    },
    {
      kind: 'text',
      text: 'Letter version (LeetCode 76): text `s = "ADOBECODEBANC"` and `t = "ABC"`. Find the **shortest** stretch of `s` that contains every letter of `t`, counting repeats (if `t = "AAB"`, you need two `A`s). The answer is `"BANC"`. If nothing covers `t`, return `""`. If two shortest stretches tie, return the **leftmost**.',
    },
    {
      kind: 'callout',
      tone: 'tip',
      title: 'Stretch problem',
      text: 'This one is labelled **hard** on LeetCode. It is hard because it combines two ideas, not because it needs a new one. You already know both: the **shortest** grow/shrink window from lesson 2, and the `need` map + `missing` counter from lesson 3.',
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Brute force: every start, grow until covered',
      code: `function minWindow(s, t):
    best ← ""
    for start from 0 to n - 1:
        counts ← empty map
        for end from start to n - 1:
            add s[end] to counts
            if counts has every letter of t (with repeats):
                if best = "" or end - start + 1 < length of best:
                    best ← s from start to end
                stop this inner loop
    return best`,
    },
    {
      kind: 'text',
      text: 'Each start rescans to the right, and each check looks at all letters of `t`: about **O(n² · m)**. **Spot the waste.** From start `0`, `"ADOBEC"` already covers `ABC`. Any window that starts at 0 and ends later is longer, so stop there. Then, instead of restarting from start 1, just **drop the first letter** and see if the window still covers.',
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'Lesson 2 + lesson 3',
      text: "Use the **shortest-window** loop: grow right until the window is valid, then shrink left while it stays valid, recording each valid length. Use **`missing = 0`** as the meaning of “valid”. Record the start and length of the best window, not the string itself.",
    },
    {
      kind: 'steps',
      title: 'Shortest window of ADOBECODEBANC covering ABC',
      frames: [
        {
          cells: ['A', 'D', 'O', 'B', 'E', 'C', 'O', 'D', 'E', 'B', 'A', 'N', 'C'],
          pointers: { L: 0, R: 5 },
          active: [0, 1, 2, 3, 4, 5],
          vars: { missing: 0, best: 'ADOBEC (6)' },
          note: 'Grow until `missing` is 0. At `C` the window `ADOBEC` covers A, B, C. Best so far: 6.',
        },
        {
          cells: ['A', 'D', 'O', 'B', 'E', 'C', 'O', 'D', 'E', 'B', 'A', 'N', 'C'],
          pointers: { L: 1, R: 5 },
          active: [1, 2, 3, 4, 5],
          done: [0],
          vars: { missing: 1, best: 'ADOBEC (6)' },
          note: 'Shrink: drop `A`. Now an `A` is missing. Stop shrinking, grow again.',
        },
        {
          cells: ['A', 'D', 'O', 'B', 'E', 'C', 'O', 'D', 'E', 'B', 'A', 'N', 'C'],
          pointers: { L: 1, R: 10 },
          active: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
          done: [0],
          vars: { missing: 0, best: 'ADOBEC (6)' },
          note: 'Grow to the next `A` at index 10. Covered again, but length 10.',
        },
        {
          cells: ['A', 'D', 'O', 'B', 'E', 'C', 'O', 'D', 'E', 'B', 'A', 'N', 'C'],
          pointers: { L: 5, R: 10 },
          active: [5, 6, 7, 8, 9, 10],
          done: [0, 1, 2, 3, 4],
          vars: { missing: 0, best: 'ADOBEC (6)' },
          note: 'Shrink: drop `D`, `O`, `B`, `E`. Still covered (there is another `B` at 9). `CODEBA` is 6, a tie, so keep the leftmost.',
        },
        {
          cells: ['A', 'D', 'O', 'B', 'E', 'C', 'O', 'D', 'E', 'B', 'A', 'N', 'C'],
          pointers: { L: 6, R: 10 },
          active: [6, 7, 8, 9, 10],
          done: [0, 1, 2, 3, 4, 5],
          vars: { missing: 1, best: 'ADOBEC (6)' },
          note: 'Drop `C`: now a `C` is missing. Grow again.',
        },
        {
          cells: ['A', 'D', 'O', 'B', 'E', 'C', 'O', 'D', 'E', 'B', 'A', 'N', 'C'],
          pointers: { L: 6, R: 12 },
          active: [6, 7, 8, 9, 10, 11, 12],
          done: [0, 1, 2, 3, 4, 5],
          vars: { missing: 0, best: 'ADOBEC (6)' },
          note: 'Grow past `N` to `C` at index 12. Covered, length 7.',
        },
        {
          cells: ['A', 'D', 'O', 'B', 'E', 'C', 'O', 'D', 'E', 'B', 'A', 'N', 'C'],
          pointers: { L: 9, R: 12 },
          active: [9, 10, 11, 12],
          done: [0, 1, 2, 3, 4, 5, 6, 7, 8],
          vars: { missing: 0, best: 'BANC (4)' },
          note: 'Shrink: drop `O`, `D`, `E`. `BANC` is length 4. New best.',
        },
        {
          cells: ['A', 'D', 'O', 'B', 'E', 'C', 'O', 'D', 'E', 'B', 'A', 'N', 'C'],
          found: [9, 10, 11, 12],
          vars: { missing: 1, best: 'BANC (4)' },
          note: 'Dropping `B` breaks it, and R is at the end. Answer: `"BANC"`.',
        },
      ],
    },
    { kind: 'code', lang: 'pseudo', title: 'Minimum window', code: minWindowPseudo },
    { kind: 'code', lang: 'js', title: 'JavaScript', code: minWindowCode },
    {
      kind: 'compare',
      title: 'Minimum window substring',
      rows: [
        { approach: 'Every substring + check', time: 'O(n² · m)', space: 'O(alphabet)', note: 'Checks about n² windows.' },
        { approach: 'Every start, grow until covered', time: 'O(n²)', space: 'O(alphabet)', note: 'Restarts the right edge for every start.' },
        { approach: 'Grow / shrink + need map', time: 'O(n + m)', space: 'O(alphabet)', note: 'Each letter enters once and leaves once.' },
      ],
    },
    {
      kind: 'list',
      items: [
        '**Signals:** “smallest / shortest substring that **contains all** of …”, “covers every …”, “includes each … at least once”.',
        '**Valid** means the window has enough of everything. Use counts, because repeats matter.',
        '**Shortest** means record while shrinking, like lesson 2.',
      ],
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Template: shortest window that covers',
      code: `need ← what the window must contain
left ← 0
for right from 0 to n - 1:
    take s[right] into the window
    while the window covers need:
        record (left, right) if it is shorter
        give s[left] back
        left ← left + 1
return the shortest recorded window`,
    },
    {
      kind: 'callout',
      tone: 'trap',
      title: 'Ties, repeats and slicing',
      text: "Use `<`, not `≤`, when you record a window, or you will replace the leftmost answer with a later tie. Use counts, not a set: `t = \"AA\"` needs **two** `A`s. And store `bestStart` and `bestLen`; calling `slice` on every improvement costs O(n) each time.",
    },
  ],
  problems: [
    {
      id: 'sliding-window-min-window-substring',
      title: 'Smallest snippet with every letter',
      difficulty: 'hard',
      leetcode: 76,
      pattern: 'Sliding window + frequency map (shortest)',
      statement: "**Stretch problem.** Given text `s` and a word `t`, return the **shortest** stretch of `s` that contains every letter of `t`, counting repeats. If several shortest stretches tie, return the **leftmost** one. If no stretch works, return `\"\"`.",
      examples: [
        { input: 's = "ADOBECODEBANC", t = "ABC"', output: '"BANC"' },
        { input: 's = "a", t = "aa"', output: '""', explain: '`t` needs two `a`s, `s` has only one.' },
        { input: 's = "baab", t = "ab"', output: '"ba"', explain: '`"ba"` and `"ab"` both have length 2. Return the leftmost.' },
      ],
      constraints: ['1 ≤ s.length, t.length ≤ 10⁵', 'upper and lowercase letters'],
      hints: [
        'Valid means the window has at least as many of each letter as `t`. You want the shortest valid window.',
        'Use lesson 3’s `need` map and `missing` counter to know when the window is valid in O(1).',
        'Grow right. While `missing = 0`, record the window if it is strictly shorter, then drop `s[left]` and move `left`.',
      ],
      approaches: [
        {
          name: 'Brute force',
          idea: 'For every start, grow the end until the window covers `t`, then stop (longer ends are worse). Each start rescans to the right.',
          time: 'O(n²)',
          space: 'O(alphabet)',
        },
        {
          name: 'Grow / shrink + need map',
          idea: 'Grow until `missing = 0`, then shrink while it stays 0, recording each window. Every letter enters the window once and leaves once, so the work is linear. Strict `<` keeps the leftmost of tied windows.',
          pseudo: minWindowPseudo,
          code: minWindowCode,
          time: 'O(n + m)',
          space: 'O(alphabet)',
        },
      ],
      fn: 'minWindow',
      starter: `function minWindow(s, t) {
  // Shortest window of s that covers every letter of t.
  return '';
}`,
      solution: minWindowCode,
      tests: [
        { name: 'example', args: ['ADOBECODEBANC', 'ABC'], expected: 'BANC' },
        { name: 'one letter', args: ['a', 'a'], expected: 'a' },
        { name: 'not enough copies', args: ['a', 'aa'], expected: '' },
        { name: 'single letter inside', args: ['ab', 'b'], expected: 'b' },
        { name: 'needs every copy', args: ['aa', 'aa'], expected: 'aa' },
        { name: 'letter missing', args: ['abc', 'd'], expected: '' },
        { name: 'leftmost tie', args: ['baab', 'ab'], expected: 'ba' },
        { name: 'repeats in t', args: ['acbbaca', 'aba'], expected: 'baca' },
        { name: 'long text', args: ['cabwefgewcwaefgcf', 'cae'], expected: 'cwae' },
        { name: 'case matters', args: ['aAbB', 'AB'], expected: 'AbB' },
      ],
      takeaway: 'Minimum window = shortest grow/shrink loop + need map with a missing counter.',
    },
    {
      id: 'sliding-window-balanced-string',
      title: 'Rebalance the servers',
      difficulty: 'medium',
      leetcode: 1234,
      pattern: 'Sliding window (shortest, look outside)',
      statement: "Four servers `Q`, `W`, `E`, `R` share the load. The string `s` lists which server took each request, and its length is a multiple of 4. The load is **balanced** when each server took exactly `n / 4` requests. You may reassign **one block of requests in a row** to any servers you like. Return the length of the **shortest block** that makes it balanced (`0` if it already is).",
      examples: [
        { input: 's = "QWER"', output: '0' },
        { input: 's = "QQWE"', output: '1', explain: 'Change one `Q` to `R`.' },
        { input: 's = "QQQW"', output: '2', explain: 'Change `QQ` to `ER`.' },
      ],
      constraints: ['4 ≤ n ≤ 10⁵', 'n is a multiple of 4', 's has only Q, W, E, R'],
      hints: [
        'You can change the block to anything. So what really matters is what is **outside** the block.',
        'The block works if, outside it, no server has more than `n / 4`. The block then fills in the rest.',
        'Count all letters. Moving a letter into the window lowers its outside count. Find the shortest window where every outside count is ≤ `n / 4`.',
      ],
      approaches: [
        {
          name: 'Brute force',
          idea: 'Try every block, count the letters outside it, and check that none is over `n / 4`. About n² blocks.',
          time: 'O(n²)',
          space: 'O(1)',
        },
        {
          name: 'Shortest window, judged from outside',
          idea: 'Start with counts of the whole string (everything is outside). Growing the window takes letters out of the outside counts. When all outside counts are ≤ `n / 4`, the window is valid: shrink it while it stays valid. Positive counts only move one way, so grow/shrink works.',
          pseudo: `function balancedString(s):
    quota ← n / 4
    count ← count of each letter in s     // outside the window
    if every count ≤ quota: return 0
    left ← 0
    best ← n
    for right from 0 to n - 1:
        count[s[right]] ← count[s[right]] - 1
        while left ≤ right and every count ≤ quota:
            best ← min(best, right - left + 1)
            count[s[left]] ← count[s[left]] + 1
            left ← left + 1
    return best`,
          code: balancedCode,
          time: 'O(n)',
          space: 'O(1)',
        },
      ],
      fn: 'balancedString',
      starter: `function balancedString(s) {
  // Shortest window such that the letters outside it are all <= n / 4.
  return 0;
}`,
      solution: balancedCode,
      tests: [
        { name: 'already balanced', args: ['QWER'], expected: 0 },
        { name: 'one extra', args: ['QQWE'], expected: 1 },
        { name: 'two extra', args: ['QQQW'], expected: 2 },
        { name: 'all the same', args: ['QQQQ'], expected: 3 },
        { name: 'mixed', args: ['WQWRQQQW'], expected: 3 },
        { name: 'balanced, longer', args: ['QQQQWWWWEEEERRRR'], expected: 0 },
        { name: 'extras at the end', args: ['QWERQQQQ'], expected: 3 },
        { name: 'long', args: ['WWEQERQWQWWRWWERQWEQ'], expected: 4 },
      ],
      takeaway: 'If the window can become anything, judge it by what is left outside.',
    },
  ],
  quiz: [
    {
      prompt: 'In minimum window, when do you record a candidate answer?',
      options: [
        'After the shrink loop',
        'Inside the shrink loop, while `missing = 0`',
        'Only when `right` reaches the end',
        'Whenever a letter of `t` comes in',
      ],
      answer: 1,
      explanation: 'It is a **shortest** window problem. Every valid window you see while shrinking is a candidate.',
    },
    {
      prompt: 'Two windows tie for shortest. You want the leftmost. Which comparison do you use?',
      options: ['`length ≤ bestLen`', '`length < bestLen`', '`length = bestLen`', 'It does not matter'],
      answer: 1,
      explanation: 'The left one is found first. With `<`, a later tie never replaces it.',
    },
    {
      prompt: '`t = "AAB"`. Why can a set of letters not replace the `need` map?',
      options: [
        'Sets are slower',
        'A set forgets that you need **two** `A`s',
        'Sets cannot hold uppercase letters',
        'A set would work fine',
      ],
      answer: 1,
      explanation: 'A set only knows “has A”. The window `"AB"` would wrongly look complete.',
    },
  ],
  takeaways: [
    'Hard problems are often two easy ideas glued together.',
    '“Shortest substring that contains all of …” is a grow/shrink window with a need map.',
    'Record start and length with a strict `<` to get the leftmost shortest answer.',
  ],
};
