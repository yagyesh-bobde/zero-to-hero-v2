import type { Lesson } from '../types';
import { palindromeProblems } from './17-dp-2d.palindromes-problems';

export const lesson: Lesson = {
  id: 'palindromes',
  title: 'Palindromes: DP on a piece of a string',
  summary: 'dp[i][j] = the answer for the substring from i to j. Fill short pieces first, or expand around centers.',
  minutes: 22,
  blocks: [
    {
      kind: 'callout',
      tone: 'story',
      title: 'Mirror spots in DNA',
      text: 'Biologists hunt for stretches of DNA that read the same from both ends, because a strand can fold back onto itself there, like a hairpin. A gene file can be millions of letters long, so "check every stretch" is far too slow. The same question, *longest piece that reads the same both ways*, is a classic interview problem.',
    },
    {
      kind: 'text',
      text: 'The problem: in `"babad"`, find the longest **substring** (one unbroken piece) that is a palindrome. Both `"bab"` and `"aba"` have length 3; we return the one that starts first, `"bab"`.',
    },
    {
      kind: 'text',
      text: 'This time the two indexes are **both in the same string**: `i` is where the piece starts and `j` is where it ends. The state `(i, j)` means "the piece `s[i..j]`". In the earlier lessons the two numbers came from two different things (row and column, two strings). Here they are the two ends of one thing. This is called **interval DP**.',
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Brute force: check every piece',
      code: `function isPal(i, j):                      // is s[i..j] a palindrome?
    if i ≥ j:
        return true                           // 0 or 1 letters
    return s[i] = s[j] and isPal(i + 1, j - 1)

function longestPalindrome(s):
    best ← first letter of s
    for i from 0 to n - 1:
        for j from i to n - 1:
            if isPal(i, j) and j - i + 1 > length of best:
                best ← s[i..j]
    return best                               // O(n³): n² pieces × n checks`,
    },
    {
      kind: 'text',
      text: '**Spot the waste.** To check `"abcba"`, `isPal` checks the outer `a`s and then `"bcb"`. But we already checked `"bcb"` earlier as its own piece! Every piece re-checks all the pieces inside it. With a table, each piece costs **one** comparison plus one lookup.',
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'A piece depends on the piece inside it',
      text: '`s[i..j]` is a palindrome exactly when its two **ends match** and the **inside** `s[i + 1..j - 1]` is a palindrome. The inside is 2 letters shorter. So fill the table **by length**: all pieces of length 1, then length 2, then 3, and so on. When you reach a piece, its inside is always ready.',
    },
    {
      kind: 'table',
      title: 'The DP recipe for this problem',
      head: ['Part', 'For this problem'],
      rows: [
        ['State', '`isPal[i][j]` = is the piece from `i` to `j` a palindrome?'],
        ['Choice', 'No real choice here: check the two ends, then trust the inside'],
        ['Recurrence', '`isPal[i][j] = (s[i] = s[j]) and (j - i < 2 or isPal[i + 1][j - 1])`'],
        ['Base case', 'Length 1 is always true; length 2 is true when the two letters match'],
        ['Answer', 'The longest `(i, j)` with `isPal[i][j]` true, earliest `i` on ties'],
      ],
    },
    {
      kind: 'trace',
      title: 'Filling by length for "babad"',
      columns: ['length', 'piece (i..j)', 'ends match?', 'inside a palindrome?', 'isPal'],
      rows: [
        [1, 'every single letter', '-', '-', 'true'],
        [2, 'ba, ab, ba, ad', 'no', '-', 'false'],
        [3, '"bab" (0..2)', 'b = b', '"a" yes', 'true'],
        [3, '"aba" (1..3)', 'a = a', '"b" yes', 'true'],
        [3, '"bad" (2..4)', 'b ≠ d', '-', 'false'],
        [4, '"baba" (0..3)', 'b ≠ a', '-', 'false'],
        [4, '"abad" (1..4)', 'a ≠ d', '-', 'false'],
        [5, '"babad" (0..4)', 'b ≠ d', '-', 'false'],
      ],
      note: 'The longest true piece is length 3. The first one found at that length is `(0, 2)` = **"bab"**.',
    },
    {
      kind: 'trace',
      title: 'The finished isPal table (T = palindrome)',
      columns: ['start i', 'j=0 b', 'j=1 a', 'j=2 b', 'j=3 a', 'j=4 d'],
      rows: [
        ['0 b', 'T', 'F', 'T', 'F', 'F'],
        ['1 a', '·', 'T', 'F', 'T', 'F'],
        ['2 b', '·', '·', 'T', 'F', 'F'],
        ['3 a', '·', '·', '·', 'T', 'F'],
        ['4 d', '·', '·', '·', '·', 'T'],
      ],
      note: 'Only the top-right half is used, because a piece must end at or after where it starts. Each cell reads the cell one step **down and to the left** (the inside).',
    },
    {
      kind: 'code',
      lang: 'js',
      title: 'The interval table in JavaScript',
      code: `function longestPalindrome(s) {
  const n = s.length;
  const isPal = Array.from({ length: n }, () => new Array(n).fill(false));
  let start = 0, bestLen = 1;
  for (let len = 1; len <= n; len++) {          // short pieces first
    for (let i = 0; i + len - 1 < n; i++) {
      const j = i + len - 1;
      isPal[i][j] = s[i] === s[j] && (len <= 2 || isPal[i + 1][j - 1]);
      if (isPal[i][j] && len > bestLen) { start = i; bestLen = len; }
    }
  }
  return s.slice(start, start + bestLen);
}`,
    },
    {
      kind: 'text',
      text: '**A second way: expand around the center.** Look at the table again: every palindrome is built from a smaller one with the same middle. So instead of a table, stand on each possible middle and grow outwards while the two ends match. A middle can be a letter (odd length, like `"bab"`) or the gap between two letters (even length, like `"bb"`). That is `2n - 1` middles.',
    },
    {
      kind: 'steps',
      title: 'Expanding around centers in "babad"',
      frames: [
        { cells: ['b', 'a', 'b', 'a', 'd'], pointers: { lo: 0, hi: 0 }, found: [0], vars: { best: '"b"' }, note: 'Center 0: just "b". Growing would step off the left edge. Best so far: "b".' },
        { cells: ['b', 'a', 'b', 'a', 'd'], pointers: { lo: 1, hi: 1 }, active: [1], vars: { best: '"b"' }, note: 'Center 1: start with the single letter "a".' },
        { cells: ['b', 'a', 'b', 'a', 'd'], pointers: { lo: 0, hi: 2 }, active: [0, 2], found: [1], vars: { best: '"b"' }, note: 'Grow: `s[0] = s[2] = b`. "bab" is a palindrome.' },
        { cells: ['b', 'a', 'b', 'a', 'd'], pointers: { hi: 3 }, found: [0, 1, 2], vars: { best: '"bab"' }, note: '`lo` would be -1, so stop. "bab" (length 3) is the new best.' },
        { cells: ['b', 'a', 'b', 'a', 'd'], pointers: { lo: 1, hi: 2 }, active: [1, 2], vars: { best: '"bab"' }, note: 'Gap after index 1: `a ≠ b`, so no even palindrome here.' },
        { cells: ['b', 'a', 'b', 'a', 'd'], pointers: { lo: 1, hi: 3 }, active: [1, 3], found: [2], vars: { best: '"bab"' }, note: 'Center 2: "b", grow to `s[1] = s[3] = a`: "aba".' },
        { cells: ['b', 'a', 'b', 'a', 'd'], pointers: { lo: 0, hi: 4 }, active: [0, 4], done: [1, 2, 3], vars: { best: '"bab"' }, note: '`b ≠ d`, stop. "aba" is also length 3, not **longer**, so we keep "bab".' },
        { cells: ['b', 'a', 'b', 'a', 'd'], found: [0, 1, 2], vars: { best: '"bab"' }, note: 'The other centers only give single letters. Answer: **"bab"**, with no table at all.' },
      ],
    },
    {
      kind: 'compare',
      title: 'Longest palindromic substring',
      rows: [
        { approach: 'Check every piece', time: 'O(n³)', space: 'O(1)', note: 'Each check re-does all the work inside.' },
        { approach: 'Interval table isPal[i][j]', time: 'O(n²)', space: 'O(n²)', note: 'Teaches the pattern; needed when you must count or reuse pieces later.' },
        { approach: 'Expand around centers', time: 'O(n²)', space: 'O(1)', note: 'Simplest to write for this exact problem. Same idea as the table, walked in a different order.' },
      ],
    },
    {
      kind: 'text',
      text: '**Subsequence version (letters may be skipped).** For the longest palindromic *subsequence*, the cell becomes a number: `dp[i][j]` = longest palindrome you can keep inside `s[i..j]`. Ends match → keep both: `2 + dp[i + 1][j - 1]`. Ends differ → one end must go: `max(dp[i + 1][j], dp[i][j - 1])`. That is the LCS choice from lesson 2, applied to the two ends of one string.',
    },
    {
      kind: 'callout',
      tone: 'trap',
      title: 'Fill order: the inside must be ready',
      text: '`dp[i][j]` reads `dp[i + 1][...]`, a row **below** it. If you loop `i` from 0 upwards, that row is still empty and you get wrong answers with no error. Either loop by length (short to long) or loop `i` from `n - 1` **down** to 0 with `j` going up from `i + 1`. Also, do not mix up substring (one unbroken piece) and subsequence (letters may be skipped): they use different recurrences.',
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Pattern: interval DP template',
      code: `// Signals: "substring" / "subsequence" of ONE string, palindromes,
// answer for a piece s[i..j] built from smaller pieces inside it.
dp ← n × n grid
for i from 0 to n - 1:
    dp[i][i] ← answer for one letter
for i from n - 1 down to 0:               // rows below are ready
    for j from i + 1 to n - 1:
        if s[i] = s[j]:
            dp[i][j] ← use the inside dp[i + 1][j - 1]
        else:
            dp[i][j] ← best of dp[i + 1][j] and dp[i][j - 1]
return dp[0][n - 1]`,
    },
  ],
  problems: palindromeProblems,
  quiz: [
    {
      prompt: 'Which cell does `isPal[i][j]` need to be filled already?',
      options: ['`isPal[i - 1][j + 1]`', '`isPal[i + 1][j - 1]`, the piece inside', '`isPal[0][n - 1]`', '`isPal[i][j + 1]`'],
      answer: 1,
      explanation: 'A piece is a palindrome when its ends match and the piece inside (one shorter on each side) is a palindrome.',
    },
    {
      prompt: 'Why do we try **gaps** between letters as centers too?',
      options: [
        'To make the code faster',
        'Even-length palindromes like "abba" have no middle letter, only a middle gap',
        'To handle empty strings',
        'Gaps are not needed',
      ],
      answer: 1,
      explanation: 'With only letter centers you would miss every even-length palindrome.',
    },
    {
      prompt: 'For the longest palindromic **subsequence**, the ends of `s[i..j]` differ. What is `dp[i][j]`?',
      options: [
        '`0`',
        '`2 + dp[i + 1][j - 1]`',
        '`max(dp[i + 1][j], dp[i][j - 1])`',
        '`dp[i + 1][j - 1]`',
      ],
      answer: 2,
      explanation: 'The two ends cannot both be the outer letters, so drop one of them and keep the better result.',
    },
  ],
  takeaways: [
    'Interval DP: `dp[i][j]` = answer for the piece from `i` to `j`, built from the piece inside it.',
    'Fill by length, or loop `i` from the end backwards, so smaller pieces are ready first.',
    'For palindromic substrings, expanding around all `2n - 1` centers gives the same `O(n²)` with `O(1)` space.',
  ],
};
