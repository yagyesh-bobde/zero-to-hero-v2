import type { Problem } from '../types';

const lcs: Problem = {
  id: 'dp-2d-lcs',
  title: 'Longest Common Subsequence',
  difficulty: 'medium',
  leetcode: 1143,
  pattern: 'Two-string DP',
  statement:
    'Two friends each wrote down the songs they heard on a road trip, as a string of letters (one letter per song). Some songs are missing from each list, but the order is right. Find the length of the longest sequence of songs that appears in **both** lists in the same order. The songs do not have to be next to each other (this is a *subsequence*: delete some letters, keep the rest in order).',
  examples: [
    { input: 'text1 = "abcde", text2 = "ace"', output: '3', explain: '"ace" appears in both, in order.' },
    { input: 'text1 = "abc", text2 = "def"', output: '0', explain: 'No letter in common.' },
  ],
  constraints: ['1 ≤ text1.length, text2.length ≤ 1000', 'lowercase letters only'],
  hints: [
    'Compare the **last** letters of the two prefixes you are looking at.',
    'If they match, that letter can end the common subsequence: `1 + lcs(i - 1, j - 1)`.',
    'If not, one of the two letters is not used. Drop one or the other and keep the better: `max(lcs(i - 1, j), lcs(i, j - 1))`.',
    'Make the table `(m + 1) × (n + 1)` so row 0 and column 0 mean "empty prefix" and are all 0.',
  ],
  approaches: [
    {
      name: 'Plain recursion',
      idea: 'Compare the last letters. Match: take it and shrink both. No match: try dropping a letter from either side and keep the better. Correct, but the same `(i, j)` pairs come up again and again.',
      time: 'O(2^(m+n))',
      space: 'O(m + n)',
    },
    {
      name: 'Table over prefixes',
      idea: '`dp[i][j]` = the LCS of the first `i` letters of `text1` and the first `j` letters of `text2`. Each cell looks at its diagonal (both letters used), the cell above, or the cell to the left, all filled earlier.',
      pseudo: `function longestCommonSubsequence(a, b):
    m ← length of a, n ← length of b
    dp ← (m + 1) × (n + 1) grid of zeros     // row 0 / col 0 = empty prefix
    for i from 1 to m:
        for j from 1 to n:
            if a[i - 1] = b[j - 1]:
                dp[i][j] ← dp[i - 1][j - 1] + 1          // diagonal + 1
            else:
                dp[i][j] ← max(dp[i - 1][j], dp[i][j - 1])  // up or left
    return dp[m][n]`,
      code: `function longestCommonSubsequence(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1] + 1
        : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp[m][n];
}`,
      time: 'O(m × n)',
      space: 'O(m × n), or O(n) with two rows',
    },
  ],
  fn: 'longestCommonSubsequence',
  starter: `function longestCommonSubsequence(text1, text2) {
  // length of the longest common subsequence
  return 0;
}`,
  solution: `function longestCommonSubsequence(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1] + 1
        : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp[m][n];
}`,
  tests: [
    { name: 'lesson example', args: ['abcde', 'ace'], expected: 3 },
    { name: 'identical', args: ['abc', 'abc'], expected: 3 },
    { name: 'nothing shared', args: ['abc', 'def'], expected: 0 },
    { name: 'one letter each', args: ['a', 'a'], expected: 1 },
    { name: 'repeated letters', args: ['aaaa', 'aa'], expected: 2 },
    { name: 'one letter shared', args: ['bsbininm', 'jmjkbkjkv'], expected: 1 },
    { name: 'scattered matches', args: ['oxcpqrsvwf', 'shmtulqrypy'], expected: 2 },
    { name: 'order matters', args: ['ezupkr', 'ubmrapg'], expected: 2 },
    { name: 'one inside the other', args: ['abcba', 'abcbcba'], expected: 5 },
  ],
  takeaway: 'Two strings → `dp[i][j]` over prefixes. Match: diagonal + 1. No match: best of up and left.',
};

const editDistance: Problem = {
  id: 'dp-2d-edit-distance',
  title: 'Edit Distance',
  difficulty: 'medium',
  leetcode: 72,
  pattern: 'Two-string DP',
  statement:
    'A spell checker wants to know how far a typed word is from a real word. One **edit** is: insert one letter, delete one letter, or replace one letter with another. Return the smallest number of edits that turns `word1` into `word2`.',
  examples: [
    { input: 'word1 = "horse", word2 = "ros"', output: '3', explain: 'horse → rorse (replace h with r) → rose (delete r) → ros (delete e).' },
    { input: 'word1 = "intention", word2 = "execution"', output: '5' },
  ],
  constraints: ['0 ≤ word1.length, word2.length ≤ 500', 'lowercase letters'],
  hints: [
    'Let `dp[i][j]` = edits to turn the first `i` letters of `word1` into the first `j` letters of `word2`.',
    'Base cases: turning `i` letters into the empty string takes `i` deletes; turning empty into `j` letters takes `j` inserts.',
    'If the last letters match, no edit is needed for them: `dp[i - 1][j - 1]`.',
    'Otherwise `1 + min(delete = up, insert = left, replace = diagonal)`.',
  ],
  approaches: [
    {
      name: 'Plain recursion',
      idea: 'Look at the last letters. Equal: skip both. Different: try all three edits and keep the cheapest. Correct but exponential, because the same pair of prefixes is reached by many edit orders.',
      time: 'O(3^(m+n))',
      space: 'O(m + n)',
    },
    {
      name: 'Table over prefixes (two rows)',
      idea: 'Each cell needs only up, left and diagonal, so keep the previous row and the current row. Delete uses the cell above, insert uses the cell to the left, replace uses the diagonal.',
      pseudo: `function minDistance(a, b):
    m ← length of a, n ← length of b
    prev ← [0, 1, 2, ..., n]          // empty a → first j letters of b: j inserts
    for i from 1 to m:
        cur ← array of n + 1 numbers
        cur[0] ← i                     // first i letters → empty: i deletes
        for j from 1 to n:
            if a[i - 1] = b[j - 1]:
                cur[j] ← prev[j - 1]                    // free: letters match
            else:
                cur[j] ← 1 + min(prev[j],        // delete  (up)
                                 cur[j - 1],     // insert  (left)
                                 prev[j - 1])    // replace (diagonal)
        prev ← cur
    return prev[n]`,
      code: `function minDistance(a, b) {
  const m = a.length, n = b.length;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const cur = new Array(n + 1);
    cur[0] = i;
    for (let j = 1; j <= n; j++) {
      cur[j] = a[i - 1] === b[j - 1]
        ? prev[j - 1]
        : 1 + Math.min(prev[j], cur[j - 1], prev[j - 1]);
    }
    prev = cur;
  }
  return prev[n];
}`,
      time: 'O(m × n)',
      space: 'O(n)',
    },
  ],
  fn: 'minDistance',
  starter: `function minDistance(word1, word2) {
  // fewest inserts / deletes / replaces to turn word1 into word2
  return 0;
}`,
  solution: `function minDistance(a, b) {
  const m = a.length, n = b.length;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const cur = new Array(n + 1);
    cur[0] = i;
    for (let j = 1; j <= n; j++) {
      cur[j] = a[i - 1] === b[j - 1]
        ? prev[j - 1]
        : 1 + Math.min(prev[j], cur[j - 1], prev[j - 1]);
    }
    prev = cur;
  }
  return prev[n];
}`,
  tests: [
    { name: 'horse → ros', args: ['horse', 'ros'], expected: 3 },
    { name: 'intention → execution', args: ['intention', 'execution'], expected: 5 },
    { name: 'kitten → sitting', args: ['kitten', 'sitting'], expected: 3 },
    { name: 'from empty', args: ['', 'abc'], expected: 3 },
    { name: 'to empty', args: ['abc', ''], expected: 3 },
    { name: 'both empty', args: ['', ''], expected: 0 },
    { name: 'already equal', args: ['same', 'same'], expected: 0 },
    { name: 'one replace', args: ['a', 'b'], expected: 1 },
    { name: 'swapped letters', args: ['ab', 'ba'], expected: 2 },
  ],
  takeaway: 'Edit distance = LCS table with three moves: up = delete, left = insert, diagonal = replace (or free on a match).',
};

const deleteOperation: Problem = {
  id: 'dp-2d-delete-two-strings',
  title: 'Delete Operation for Two Strings',
  difficulty: 'medium',
  leetcode: 583,
  pattern: 'Two-string DP',
  statement:
    'Two players typed usernames that should match. In one step you may delete **one letter from either word**. Return the fewest steps that make the two words exactly equal.',
  examples: [
    { input: 'word1 = "sea", word2 = "eat"', output: '2', explain: 'Delete "s" from "sea" and "t" from "eat": both become "ea".' },
    { input: 'word1 = "leetcode", word2 = "etco"', output: '4' },
  ],
  constraints: ['1 ≤ word1.length, word2.length ≤ 500', 'lowercase letters'],
  hints: [
    'After deleting, what is left in both words? A string that is a subsequence of both.',
    'To delete as little as possible, keep as much as possible: keep the **longest common subsequence**.',
    'Answer = `m + n - 2 × LCS`.',
  ],
  approaches: [
    {
      name: 'Edit-distance style table',
      idea: '`dp[i][j]` = deletes to make the two prefixes equal. Match: diagonal. No match: `1 + min(up, left)` (delete from one word or the other). Works, but there is a shortcut.',
      time: 'O(m × n)',
      space: 'O(m × n)',
    },
    {
      name: 'LCS, then subtract',
      idea: 'Whatever survives is a common subsequence. Keeping the longest one means deleting the fewest letters. Every letter not in the LCS gets deleted from its word: `m - LCS` from one and `n - LCS` from the other.',
      pseudo: `function minDeletions(a, b):
    m ← length of a, n ← length of b
    prev ← array of n + 1 zeros
    for i from 1 to m:
        cur ← array of n + 1 zeros
        for j from 1 to n:
            if a[i - 1] = b[j - 1]:
                cur[j] ← prev[j - 1] + 1
            else:
                cur[j] ← max(prev[j], cur[j - 1])
        prev ← cur
    return m + n - 2 × prev[n]`,
      code: `function minDeletions(a, b) {
  const m = a.length, n = b.length;
  let prev = new Array(n + 1).fill(0);
  for (let i = 1; i <= m; i++) {
    const cur = new Array(n + 1).fill(0);
    for (let j = 1; j <= n; j++) {
      cur[j] = a[i - 1] === b[j - 1] ? prev[j - 1] + 1 : Math.max(prev[j], cur[j - 1]);
    }
    prev = cur;
  }
  return m + n - 2 * prev[n];
}`,
      time: 'O(m × n)',
      space: 'O(n)',
    },
  ],
  fn: 'minDeletions',
  starter: `function minDeletions(word1, word2) {
  // fewest single-letter deletes (from either word) to make them equal
  return 0;
}`,
  solution: `function minDeletions(a, b) {
  const m = a.length, n = b.length;
  let prev = new Array(n + 1).fill(0);
  for (let i = 1; i <= m; i++) {
    const cur = new Array(n + 1).fill(0);
    for (let j = 1; j <= n; j++) {
      cur[j] = a[i - 1] === b[j - 1] ? prev[j - 1] + 1 : Math.max(prev[j], cur[j - 1]);
    }
    prev = cur;
  }
  return m + n - 2 * prev[n];
}`,
  tests: [
    { name: 'sea / eat', args: ['sea', 'eat'], expected: 2 },
    { name: 'leetcode / etco', args: ['leetcode', 'etco'], expected: 4 },
    { name: 'already equal', args: ['a', 'a'], expected: 0 },
    { name: 'nothing shared', args: ['abc', 'def'], expected: 6 },
    { name: 'park / spake', args: ['park', 'spake'], expected: 3 },
    { name: 'one extra letter', args: ['a', 'ab'], expected: 1 },
  ],
  takeaway: 'Many two-string problems are LCS in disguise. Ask: "what survives in both?"',
};

const interleave: Problem = {
  id: 'dp-2d-interleaving-string',
  title: 'Interleaving String',
  difficulty: 'medium',
  leetcode: 97,
  pattern: 'Two-string DP',
  statement:
    'Two people type into the same group chat at the same time, and the server merges their letters into one stream. Each person\'s letters stay in their own order, but the two can be mixed in any way. Given `s1`, `s2` and the merged `s3`, return `true` if `s3` could be a merge of `s1` and `s2` like that.',
  examples: [
    { input: 's1 = "aabcc", s2 = "dbbca", s3 = "aadbbcbcac"', output: 'true' },
    { input: 's1 = "aabcc", s2 = "dbbca", s3 = "aadbbbaccc"', output: 'false' },
    { input: 's1 = "", s2 = "", s3 = ""', output: 'true' },
  ],
  constraints: ['0 ≤ s1.length, s2.length ≤ 100', 's3.length ≤ 200'],
  hints: [
    'If the lengths do not add up, the answer is `false` right away.',
    'Once you have used `i` letters of `s1` and `j` letters of `s2`, you have built exactly the first `i + j` letters of `s3`. So the state is `(i, j)`.',
    '`dp[i][j]` is true if you can arrive by taking `s1[i - 1]` from `dp[i - 1][j]`, or by taking `s2[j - 1]` from `dp[i][j - 1]`. Either one must match `s3[i + j - 1]`.',
    '`dp[0][0] = true`. The answer is `dp[m][n]`.',
  ],
  approaches: [
    {
      name: 'Recursion',
      idea: 'At each step, if the next letter of `s3` matches the next letter of `s1`, try taking it; if it matches `s2`, try that too. When both match, the tree branches, and the same `(i, j)` is reached many times.',
      time: 'O(2^(m+n))',
      space: 'O(m + n)',
    },
    {
      name: 'Boolean table, one row',
      idea: 'A grid walk: moving down takes a letter from `s1`, moving right takes one from `s2`. A cell is reachable if the cell above is reachable and its letter matches, or the cell to the left is and its letter matches. One row is enough.',
      pseudo: `function isInterleave(s1, s2, s3):
    m ← length of s1, n ← length of s2
    if m + n ≠ length of s3:
        return false
    row ← array of n + 1 values, all false
    for i from 0 to m:
        for j from 0 to n:
            if i = 0 and j = 0:
                row[j] ← true
            else:
                fromUp ← i > 0 and row[j] and s1[i - 1] = s3[i + j - 1]
                fromLeft ← j > 0 and row[j - 1] and s2[j - 1] = s3[i + j - 1]
                row[j] ← fromUp or fromLeft
    return row[n]`,
      code: `function isInterleave(s1, s2, s3) {
  const m = s1.length, n = s2.length;
  if (m + n !== s3.length) return false;
  const row = new Array(n + 1).fill(false);
  for (let i = 0; i <= m; i++) {
    for (let j = 0; j <= n; j++) {
      if (i === 0 && j === 0) { row[j] = true; continue; }
      const k = i + j - 1;
      const fromUp = i > 0 && row[j] && s1[i - 1] === s3[k];
      const fromLeft = j > 0 && row[j - 1] && s2[j - 1] === s3[k];
      row[j] = fromUp || fromLeft;
    }
  }
  return row[n];
}`,
      time: 'O(m × n)',
      space: 'O(n)',
    },
  ],
  fn: 'isInterleave',
  starter: `function isInterleave(s1, s2, s3) {
  // can s3 be made by merging s1 and s2, keeping each one's order?
  return false;
}`,
  solution: `function isInterleave(s1, s2, s3) {
  const m = s1.length, n = s2.length;
  if (m + n !== s3.length) return false;
  const row = new Array(n + 1).fill(false);
  for (let i = 0; i <= m; i++) {
    for (let j = 0; j <= n; j++) {
      if (i === 0 && j === 0) { row[j] = true; continue; }
      const k = i + j - 1;
      const fromUp = i > 0 && row[j] && s1[i - 1] === s3[k];
      const fromLeft = j > 0 && row[j - 1] && s2[j - 1] === s3[k];
      row[j] = fromUp || fromLeft;
    }
  }
  return row[n];
}`,
  tests: [
    { name: 'valid merge', args: ['aabcc', 'dbbca', 'aadbbcbcac'], expected: true },
    { name: 'invalid merge', args: ['aabcc', 'dbbca', 'aadbbbaccc'], expected: false },
    { name: 'all empty', args: ['', '', ''], expected: true },
    { name: 'second empty', args: ['a', '', 'a'], expected: true },
    { name: 'simple merge', args: ['a', 'b', 'ab'], expected: true },
    { name: 'length mismatch', args: ['a', 'b', 'aab'], expected: false },
    { name: 'same letters both sides', args: ['ab', 'ab', 'abab'], expected: true },
    { name: 'zipper', args: ['abc', 'xyz', 'axbycz'], expected: true },
    { name: 'order broken', args: ['abc', 'xyz', 'abzxyc'], expected: false },
    { name: 'wrong letter', args: ['', 'b', 'a'], expected: false },
  ],
  takeaway: 'When "how much of each string have I used" tells you everything, `(i, j)` is the state.',
};

export const twoStringProblems: Problem[] = [lcs, editDistance, deleteOperation, interleave];
