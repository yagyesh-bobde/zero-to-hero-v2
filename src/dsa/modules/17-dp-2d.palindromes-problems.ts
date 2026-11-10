import type { Problem } from '../types';

const longestPalSubstring: Problem = {
  id: 'dp-2d-longest-palindromic-substring',
  title: 'Longest Palindromic Substring',
  difficulty: 'medium',
  leetcode: 5,
  pattern: 'Interval DP on substrings',
  statement:
    'A DNA lab looks for stretches of a sequence that read the same forwards and backwards (a *palindrome*), because those spots fold in special ways. Given a string `s`, return its longest substring that is a palindrome. A substring is one unbroken piece. If several are equally long, return the one that **starts first**.',
  examples: [
    { input: 's = "babad"', output: '"bab"', explain: '"aba" is just as long, but "bab" starts earlier.' },
    { input: 's = "cbbd"', output: '"bb"' },
  ],
  constraints: ['1 ≤ s.length ≤ 1000', 'letters and digits'],
  hints: [
    'Checking every substring from scratch costs `O(n³)`. What do you learn about "abcba" from knowing "bcb" is a palindrome?',
    '`s[i..j]` is a palindrome when `s[i] = s[j]` **and** the inside `s[i + 1..j - 1]` is a palindrome (or is 0 or 1 letters long).',
    'Fill a table by substring length: all length 1, then length 2, then 3...',
    'Or skip the table: every palindrome has a center. Try all `2n - 1` centers (a letter or a gap) and grow outwards while the ends match.',
  ],
  approaches: [
    {
      name: 'Check every substring',
      idea: 'There are about `n² / 2` substrings, and checking one takes up to `n` steps. Simple, but slow for 1000 letters.',
      time: 'O(n³)',
      space: 'O(1)',
    },
    {
      name: 'Interval table isPal[i][j]',
      idea: 'A substring is a palindrome if its two ends match and the part inside is a palindrome. The inside is shorter, so fill the table from short substrings to long ones and each check is one step.',
      time: 'O(n²)',
      space: 'O(n²)',
    },
    {
      name: 'Expand around each center',
      idea: 'A palindrome mirrors around its middle. Pick each middle (a letter for odd lengths, a gap between two letters for even lengths) and grow outwards while the two ends match. Same time as the table, but no table at all.',
      pseudo: `function longestPalindrome(s):
    start ← 0, bestLen ← 1
    for c from 0 to n - 1:
        for each (lo, hi) in [(c, c), (c, c + 1)]:   // odd middle, even middle
            while lo ≥ 0 and hi < n and s[lo] = s[hi]:
                lo ← lo - 1
                hi ← hi + 1
            len ← hi - lo - 1                        // we went one step too far
            if len > bestLen:                        // strictly longer keeps the first
                start ← lo + 1
                bestLen ← len
    return s from start, length bestLen`,
      code: `function longestPalindrome(s) {
  let start = 0, bestLen = 1;
  const grow = (lo, hi) => {
    while (lo >= 0 && hi < s.length && s[lo] === s[hi]) { lo--; hi++; }
    const len = hi - lo - 1;
    if (len > bestLen) { start = lo + 1; bestLen = len; }
  };
  for (let c = 0; c < s.length; c++) {
    grow(c, c);       // odd length, middle letter c
    grow(c, c + 1);   // even length, middle gap after c
  }
  return s.slice(start, start + bestLen);
}`,
      time: 'O(n²)',
      space: 'O(1)',
    },
  ],
  fn: 'longestPalindrome',
  starter: `function longestPalindrome(s) {
  // longest palindromic substring (earliest one on ties)
  return '';
}`,
  solution: `function longestPalindrome(s) {
  let start = 0, bestLen = 1;
  const grow = (lo, hi) => {
    while (lo >= 0 && hi < s.length && s[lo] === s[hi]) { lo--; hi++; }
    const len = hi - lo - 1;
    if (len > bestLen) { start = lo + 1; bestLen = len; }
  };
  for (let c = 0; c < s.length; c++) {
    grow(c, c);
    grow(c, c + 1);
  }
  return s.slice(start, start + bestLen);
}`,
  tests: [
    { name: 'tie: earliest wins', args: ['babad'], expected: 'bab' },
    { name: 'even length', args: ['cbbd'], expected: 'bb' },
    { name: 'one letter', args: ['a'], expected: 'a' },
    { name: 'no repeats', args: ['ac'], expected: 'a' },
    { name: 'whole string', args: ['racecar'], expected: 'racecar' },
    { name: 'hidden in the middle', args: ['forgeeksskeegfor'], expected: 'geeksskeeg' },
    { name: 'all the same', args: ['aaaa'], expected: 'aaaa' },
    { name: 'four different letters', args: ['abcd'], expected: 'a' },
    { name: 'false lead', args: ['abacdfgdcaba'], expected: 'aba' },
  ],
  takeaway: 'Palindromes grow from the middle: either fill `isPal[i][j]` by length or expand around every center.',
};

const countPal: Problem = {
  id: 'dp-2d-palindromic-substrings',
  title: 'Palindromic Substrings',
  difficulty: 'medium',
  leetcode: 647,
  pattern: 'Interval DP on substrings',
  statement:
    'Count how many substrings of `s` are palindromes. Substrings at different positions count separately, even if they have the same letters.',
  examples: [
    { input: 's = "abc"', output: '3', explain: '"a", "b", "c".' },
    { input: 's = "aaa"', output: '6', explain: 'Three "a", two "aa", one "aaa".' },
  ],
  constraints: ['1 ≤ s.length ≤ 1000'],
  hints: [
    'This is the previous problem, but you count instead of keeping the longest.',
    'Every palindrome has exactly one center. Count how far you can grow from each one.',
    'Each successful step outwards from a center is one more palindrome.',
  ],
  approaches: [
    {
      name: 'Interval table',
      idea: 'Fill `isPal[i][j]` by length exactly like before, and add 1 for each true cell.',
      time: 'O(n²)',
      space: 'O(n²)',
    },
    {
      name: 'Expand around centers, counting',
      idea: 'From every center (letter or gap), grow outwards while the ends match. Each match is a new palindrome with that center, and no palindrome is counted twice because each has one center.',
      pseudo: `function countSubstrings(s):
    count ← 0
    for c from 0 to n - 1:
        for each (lo, hi) in [(c, c), (c, c + 1)]:
            while lo ≥ 0 and hi < n and s[lo] = s[hi]:
                count ← count + 1
                lo ← lo - 1
                hi ← hi + 1
    return count`,
      code: `function countSubstrings(s) {
  let count = 0;
  const grow = (lo, hi) => {
    while (lo >= 0 && hi < s.length && s[lo] === s[hi]) { count++; lo--; hi++; }
  };
  for (let c = 0; c < s.length; c++) {
    grow(c, c);
    grow(c, c + 1);
  }
  return count;
}`,
      time: 'O(n²)',
      space: 'O(1)',
    },
  ],
  fn: 'countSubstrings',
  starter: `function countSubstrings(s) {
  // how many substrings are palindromes?
  return 0;
}`,
  solution: `function countSubstrings(s) {
  let count = 0;
  const grow = (lo, hi) => {
    while (lo >= 0 && hi < s.length && s[lo] === s[hi]) { count++; lo--; hi++; }
  };
  for (let c = 0; c < s.length; c++) {
    grow(c, c);
    grow(c, c + 1);
  }
  return count;
}`,
  tests: [
    { name: 'all different', args: ['abc'], expected: 3 },
    { name: 'all same', args: ['aaa'], expected: 6 },
    { name: 'one letter', args: ['a'], expected: 1 },
    { name: 'even palindrome', args: ['abba'], expected: 6 },
    { name: 'racecar', args: ['racecar'], expected: 10 },
    { name: 'nested', args: ['aabaa'], expected: 9 },
    { name: 'four different', args: ['abcd'], expected: 4 },
  ],
  takeaway: 'Each palindrome has one center, so "grow from every center" counts each exactly once.',
};

const lpsSubseq: Problem = {
  id: 'dp-2d-longest-palindromic-subsequence',
  title: 'Longest Palindromic Subsequence',
  difficulty: 'medium',
  leetcode: 516,
  pattern: 'Interval DP on substrings',
  statement:
    'Now the letters may be **skipped**. Delete any letters you like (keeping the order of the rest) so that what is left is a palindrome. Return the length of the longest palindrome you can get this way.',
  examples: [
    { input: 's = "bbbab"', output: '4', explain: 'Delete the "a": "bbbb".' },
    { input: 's = "cbbd"', output: '2', explain: '"bb".' },
  ],
  constraints: ['1 ≤ s.length ≤ 1000'],
  hints: [
    'Let `dp[i][j]` be the answer for the piece `s[i..j]`. Look at its two end letters.',
    'If `s[i] = s[j]`, both ends can be the outer letters of the palindrome: `2 + dp[i + 1][j - 1]`.',
    'If not, one end must go: `max(dp[i + 1][j], dp[i][j - 1])`. A single letter is 1.',
    'Fill `i` from `n - 1` down to 0, and `j` from `i + 1` up to `n - 1`, so the shorter pieces are ready.',
  ],
  approaches: [
    {
      name: 'Plain recursion on (i, j)',
      idea: 'Compare the two ends. Match: keep both and go inside. No match: drop the left end or the right end and keep the better. Exponential without a memo.',
      time: 'O(2^n)',
      space: 'O(n)',
    },
    {
      name: 'Interval table',
      idea: 'It is the LCS idea, but on two ends of the same string. Every cell needs only cells for shorter pieces (below and to the left), so fill rows from the bottom up.',
      pseudo: `function longestPalindromeSubseq(s):
    dp ← n × n grid of zeros
    for i from n - 1 down to 0:
        dp[i][i] ← 1                         // one letter
        for j from i + 1 to n - 1:
            if s[i] = s[j]:
                dp[i][j] ← 2 + dp[i + 1][j - 1]
            else:
                dp[i][j] ← max(dp[i + 1][j], dp[i][j - 1])
    return dp[0][n - 1]`,
      code: `function longestPalindromeSubseq(s) {
  const n = s.length;
  const dp = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    dp[i][i] = 1;
    for (let j = i + 1; j < n; j++) {
      dp[i][j] = s[i] === s[j]
        ? 2 + dp[i + 1][j - 1]
        : Math.max(dp[i + 1][j], dp[i][j - 1]);
    }
  }
  return dp[0][n - 1];
}`,
      time: 'O(n²)',
      space: 'O(n²)',
    },
  ],
  fn: 'longestPalindromeSubseq',
  starter: `function longestPalindromeSubseq(s) {
  // length of the longest palindromic subsequence
  return 0;
}`,
  solution: `function longestPalindromeSubseq(s) {
  const n = s.length;
  const dp = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    dp[i][i] = 1;
    for (let j = i + 1; j < n; j++) {
      dp[i][j] = s[i] === s[j]
        ? 2 + dp[i + 1][j - 1]
        : Math.max(dp[i + 1][j], dp[i][j - 1]);
    }
  }
  return dp[0][n - 1];
}`,
  tests: [
    { name: 'skip one letter', args: ['bbbab'], expected: 4 },
    { name: 'cbbd', args: ['cbbd'], expected: 2 },
    { name: 'one letter', args: ['a'], expected: 1 },
    { name: 'all different', args: ['abcde'], expected: 1 },
    { name: 'skip in the middle', args: ['agbdba'], expected: 5 },
    { name: 'character', args: ['character'], expected: 5 },
    { name: 'all same', args: ['aaaa'], expected: 4 },
    { name: 'already a palindrome', args: ['racecar'], expected: 7 },
  ],
  takeaway: 'Subsequence version: ends match → `2 + inside`, else drop one end. Same interval table.',
};

const minInsertions: Problem = {
  id: 'dp-2d-min-insertions-palindrome',
  title: 'Minimum Insertions to Make a Palindrome (stretch)',
  difficulty: 'hard',
  leetcode: 1312,
  pattern: 'Interval DP on substrings',
  statement:
    '**Stretch problem.** A shop wants its name to read the same both ways on a spinning sign. You may insert letters anywhere in the name. Return the fewest insertions that turn `s` into a palindrome.',
  examples: [
    { input: 's = "zzazz"', output: '0', explain: 'Already a palindrome.' },
    { input: 's = "mbadm"', output: '2', explain: 'For example "mbdadbm".' },
    { input: 's = "leetcode"', output: '5' },
  ],
  constraints: ['1 ≤ s.length ≤ 500'],
  hints: [
    'Let `dp[i][j]` be the fewest insertions for the piece `s[i..j]`.',
    'If the ends match, they already mirror each other: `dp[i + 1][j - 1]`.',
    'If not, add a copy of one end on the other side: `1 + min(dp[i + 1][j], dp[i][j - 1])`.',
    'Shortcut: the letters you keep form the longest palindromic subsequence. Every other letter needs a partner, so the answer is `n - LPS`.',
  ],
  approaches: [
    {
      name: 'Interval table on insertions',
      idea: 'Look at the two ends of each piece. Matching ends cost nothing. Otherwise insert a partner for one end and solve the rest. Fill by shorter pieces first.',
      time: 'O(n²)',
      space: 'O(n²)',
    },
    {
      name: 'n minus the longest palindromic subsequence',
      idea: 'Keep the longest palindromic subsequence as the "spine". Each of the other letters needs one inserted twin on the mirror side, and you can always place them. So the answer is `n - LPS`. Compute LPS with one row.',
      pseudo: `function minInsertions(s):
    // dp[j] holds the LPS of s[i..j] for the current i
    dp ← array of n zeros
    for i from n - 1 down to 0:
        prevDiag ← 0                      // dp[i + 1][j - 1] from the row below
        dp[i] ← 1
        for j from i + 1 to n - 1:
            saved ← dp[j]                 // this is dp[i + 1][j] (row below)
            if s[i] = s[j]:
                dp[j] ← 2 + prevDiag
            else:
                dp[j] ← max(dp[j], dp[j - 1])
            prevDiag ← saved
    return n - dp[n - 1]`,
      code: `function minInsertions(s) {
  const n = s.length;
  const dp = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    let prevDiag = 0;
    dp[i] = 1;
    for (let j = i + 1; j < n; j++) {
      const saved = dp[j];
      dp[j] = s[i] === s[j] ? 2 + prevDiag : Math.max(dp[j], dp[j - 1]);
      prevDiag = saved;
    }
  }
  return n - dp[n - 1];
}`,
      time: 'O(n²)',
      space: 'O(n)',
    },
  ],
  fn: 'minInsertions',
  starter: `function minInsertions(s) {
  // fewest letters to insert so s reads the same both ways
  return 0;
}`,
  solution: `function minInsertions(s) {
  const n = s.length;
  const dp = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    let prevDiag = 0;
    dp[i] = 1;
    for (let j = i + 1; j < n; j++) {
      const saved = dp[j];
      dp[j] = s[i] === s[j] ? 2 + prevDiag : Math.max(dp[j], dp[j - 1]);
      prevDiag = saved;
    }
  }
  return n - dp[n - 1];
}`,
  tests: [
    { name: 'already a palindrome', args: ['zzazz'], expected: 0 },
    { name: 'mbadm', args: ['mbadm'], expected: 2 },
    { name: 'leetcode', args: ['leetcode'], expected: 5 },
    { name: 'one letter', args: ['a'], expected: 0 },
    { name: 'two different', args: ['ab'], expected: 1 },
    { name: 'three different', args: ['abc'], expected: 2 },
    { name: 'one missing twin', args: ['abca'], expected: 1 },
    { name: 'race', args: ['race'], expected: 3 },
  ],
  takeaway: 'Fewest insertions = letters outside the longest palindromic subsequence: `n - LPS`.',
};

export const palindromeProblems: Problem[] = [longestPalSubstring, countPal, lpsSubseq, minInsertions];
