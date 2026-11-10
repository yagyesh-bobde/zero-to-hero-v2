import type { Lesson } from '../types';
import { twoStringProblems } from './17-dp-2d.two-strings-problems';

export const lesson: Lesson = {
  id: 'two-strings',
  title: 'Two strings: LCS and edit distance',
  summary: 'One index per string. dp[i][j] answers the question for the first i and first j letters.',
  minutes: 25,
  blocks: [
    {
      kind: 'callout',
      tone: 'story',
      title: 'How git diff knows what changed',
      text: 'When you run `git diff`, git lines up the old file and the new file and finds the longest run of lines that stayed **in the same order**. Everything else is shown as added or removed. A spell checker does something close: "Did you mean *receive*?" picks the real word that needs the fewest letter edits. Both are two-string DP.',
    },
    {
      kind: 'text',
      text: 'The problem: given `"abcde"` and `"ace"`, find the length of their **longest common subsequence** (LCS). A subsequence is what is left after you delete some letters and keep the rest in order, like in the LIS lesson of module 16. Here `"ace"` is in both, so the answer is **3**.',
    },
    {
      kind: 'text',
      text: 'With two strings you need **one index per string**. Let `lcs(i, j)` be the answer for the first `i` letters of `a` and the first `j` letters of `b` (we call those *prefixes*). Then look only at the **last letter** of each prefix: `a[i - 1]` and `b[j - 1]`.',
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Brute force: recursion on two prefixes',
      code: `function lcs(i, j):                 // first i letters of a, first j of b
    if i = 0 or j = 0:
        return 0                      // an empty prefix shares nothing
    if a[i - 1] = b[j - 1]:
        return lcs(i - 1, j - 1) + 1  // last letters match: use them
    return max(lcs(i - 1, j),         // drop a's last letter
               lcs(i, j - 1))         // or drop b's last letter`,
    },
    {
      kind: 'text',
      text: '**Spot the waste.** When the letters do not match, the call splits in two, and both branches soon ask for the same pairs: `lcs(i - 1, j)` and `lcs(i, j - 1)` both call `lcs(i - 1, j - 1)`. But there are only `(m + 1) × (n + 1)` different pairs. A memo keyed by `"i,j"` fixes it, exactly like the grid. Then we turn it into a table.',
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'Compare the last letters, then move in the table',
      text: 'Letters **match** → take the **diagonal** (both prefixes shrink) and add 1. **No match** → take the bigger of **up** (drop a letter from `a`) and **left** (drop a letter from `b`). Add an extra row 0 and column 0 for "empty prefix", all zeros, so the base case lives inside the table.',
    },
    {
      kind: 'table',
      title: 'The DP recipe for this problem',
      head: ['Part', 'For this problem'],
      rows: [
        ['State', '`dp[i][j]` = LCS length of the first `i` letters of `a` and the first `j` letters of `b`'],
        ['Choice', 'Last letters match: use them. Otherwise: drop the last letter of `a` or of `b`'],
        ['Recurrence', 'match: `dp[i - 1][j - 1] + 1`, else `max(dp[i - 1][j], dp[i][j - 1])`'],
        ['Base case', 'Row 0 and column 0 are `0` (an empty prefix)'],
        ['Answer', '`dp[m][n]`, the bottom-right cell'],
      ],
    },
    {
      kind: 'trace',
      title: 'Filling the key cells for "abcde" vs "ace"',
      columns: ['cell (i, j)', 'letters', 'match?', 'options', 'dp[i][j]'],
      rows: [
        ['(1, 1)', 'a / a', 'yes', 'diag 0 + 1', 1],
        ['(1, 2)', 'a / c', 'no', 'up 0, left 1', 1],
        ['(2, 1)', 'b / a', 'no', 'up 1, left 0', 1],
        ['(2, 2)', 'b / c', 'no', 'up 1, left 1', 1],
        ['(3, 2)', 'c / c', 'yes', 'diag 1 + 1', 2],
        ['(3, 3)', 'c / e', 'no', 'up 1, left 2', 2],
        ['(4, 3)', 'd / e', 'no', 'up 2, left 2', 2],
        ['(5, 3)', 'e / e', 'yes', 'diag 2 + 1', 3],
      ],
      note: 'Row by row, left to right. "diag" is `dp[i - 1][j - 1]`, "up" is `dp[i - 1][j]`, "left" is `dp[i][j - 1]`.',
    },
    {
      kind: 'trace',
      title: 'The finished LCS table',
      columns: ['', '""', 'a', 'c', 'e'],
      rows: [
        ['""', 0, 0, 0, 0],
        ['a', 0, 1, 1, 1],
        ['b', 0, 1, 1, 1],
        ['c', 0, 1, 2, 2],
        ['d', 0, 1, 2, 2],
        ['e', 0, 1, 2, 3],
      ],
      note: 'Rows are prefixes of "abcde", columns are prefixes of "ace". The answer, **3**, is bottom-right.',
    },
    {
      kind: 'diagram',
      title: 'Reading the answer back: walk from bottom-right',
      art: `        ""  a   c   e
  ""    0   0   0   0
  a     0  [1]  1   1    a = a: take 'a', go ↖
  b     0  [1]  1   1    b ≠ a: up is bigger, go ↑
  c     0   1  [2]  2    c = c: take 'c', go ↖
  d     0   1  [2]  2    d ≠ c: up is bigger, go ↑
  e     0   1   2  [3]   e = e: take 'e', go ↖`,
      caption: 'Start at the answer. If the letters match, record the letter and move diagonally. If not, move toward the bigger neighbour (up or left). You collect "e", "c", "a"; reverse to get **"ace"**.',
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'LCS: the table',
      code: `function longestCommonSubsequence(a, b):
    m ← length of a, n ← length of b
    dp ← (m + 1) × (n + 1) grid of zeros
    for i from 1 to m:
        for j from 1 to n:
            if a[i - 1] = b[j - 1]:
                dp[i][j] ← dp[i - 1][j - 1] + 1
            else:
                dp[i][j] ← max(dp[i - 1][j], dp[i][j - 1])
    return dp[m][n]`,
    },
    {
      kind: 'code',
      lang: 'js',
      title: 'LCS in JavaScript',
      code: `function longestCommonSubsequence(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1] + 1                   // match: diagonal + 1
        : Math.max(dp[i - 1][j], dp[i][j - 1]);  // else: up or left
    }
  }
  return dp[m][n];
}`,
    },
    {
      kind: 'text',
      text: '**Same table, new question: edit distance.** How many single-letter edits (insert, delete, replace) turn `"horse"` into `"ros"`? Now `dp[i][j]` = edits to turn the first `i` letters of word1 into the first `j` letters of word2. The three edits are the three neighbours: **up = delete** a letter of word1, **left = insert** the letter of word2, **diagonal = replace** (or free when the letters already match).',
    },
    {
      kind: 'table',
      title: 'The DP recipe for edit distance',
      head: ['Part', 'For this problem'],
      rows: [
        ['State', '`dp[i][j]` = fewest edits to turn the first `i` letters of word1 into the first `j` letters of word2'],
        ['Choice', 'Letters match: free. Else delete (up), insert (left) or replace (diagonal)'],
        ['Recurrence', 'match: `dp[i - 1][j - 1]`, else `1 + min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])`'],
        ['Base case', '`dp[i][0] = i` (delete everything), `dp[0][j] = j` (insert everything)'],
        ['Answer', '`dp[m][n]`'],
      ],
    },
    {
      kind: 'trace',
      title: 'Edit distance table for "horse" → "ros"',
      columns: ['', '""', 'r', 'o', 's'],
      rows: [
        ['""', 0, 1, 2, 3],
        ['h', 1, 1, 2, 3],
        ['o', 2, 2, 1, 2],
        ['r', 3, 2, 2, 2],
        ['s', 4, 3, 3, 2],
        ['e', 5, 4, 4, 3],
      ],
      note: 'Example cell: `(o, o)` matches, so it copies the diagonal `dp[1][1] = 1`. Cell `(h, r)` does not match: `1 + min(up 1, left 1, diag 0) = 1` (replace h with r). Answer: **3**.',
    },
    {
      kind: 'compare',
      title: 'LCS, four ways',
      rows: [
        { approach: 'Plain recursion', time: 'O(2^(m+n))', space: 'O(m + n)', note: 'Every mismatch splits in two.' },
        { approach: 'Memo keyed by "i,j"', time: 'O(m × n)', space: 'O(m × n)', note: 'Each pair of prefixes solved once.' },
        { approach: '(m + 1) × (n + 1) table', time: 'O(m × n)', space: 'O(m × n)', note: 'Lets you read the subsequence back.' },
        { approach: 'Two rows', time: 'O(m × n)', space: 'O(n)', note: 'Keep `prev` and `cur`. You lose the read-back.' },
      ],
    },
    {
      kind: 'callout',
      tone: 'trap',
      title: 'The off-by-one that bites everyone',
      text: 'The table has `m + 1` rows, but the string has only `m` letters. Row `i` talks about the letter `a[i - 1]`, not `a[i]`. If you write `a[i] === b[j]` inside `for i from 1 to m`, you skip the first letter and read past the end. Also, a one-row LCS needs the old diagonal saved before you overwrite it; two rows (`prev`, `cur`) is easier to get right.',
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Pattern: two-string DP template',
      code: `// Signals: two strings (or arrays), "common", "edit",
// "transform one into the other", "can s3 be built from s1 and s2".
dp ← (m + 1) × (n + 1) grid
fill row 0 and column 0 (what does an empty prefix give?)
for i from 1 to m:
    for j from 1 to n:
        if a[i - 1] = b[j - 1]:
            dp[i][j] ← use the diagonal dp[i - 1][j - 1]
        else:
            dp[i][j] ← best of up, left (and maybe diagonal)
return dp[m][n]`,
    },
  ],
  problems: twoStringProblems,
  quiz: [
    {
      prompt: 'In the LCS table, the letters at `(i, j)` match. Which cell do you build on?',
      options: ['The cell above', 'The cell to the left', 'The diagonal `dp[i - 1][j - 1]`', 'Row 0'],
      answer: 2,
      explanation: 'A match uses both letters, so both prefixes shrink by one: the diagonal, plus 1.',
    },
    {
      prompt: 'In edit distance, which neighbour means **insert** a letter?',
      options: ['Up `dp[i - 1][j]`', 'Left `dp[i][j - 1]`', 'Diagonal `dp[i - 1][j - 1]`', 'None of them'],
      answer: 1,
      explanation: 'Inserting `b[j - 1]` covers one more letter of word2 without using any of word1, so `j` drops by one: the cell to the left.',
    },
    {
      prompt: 'Why does the table have an extra row and column?',
      options: [
        'To store the strings',
        'So row 0 / column 0 can stand for the empty prefix and hold the base cases',
        'JavaScript arrays start at 1',
        'To make the answer land at `dp[0][0]`',
      ],
      answer: 1,
      explanation: 'Row 0 means "no letters of a used yet". Putting base cases in the table means the loop needs no special cases.',
    },
  ],
  takeaways: [
    'Two strings → `dp[i][j]` over prefixes, with an extra empty row 0 and column 0.',
    'Look at the last letters: match → diagonal; no match → best of up / left (edit distance adds diagonal as "replace").',
    'Walk back from `dp[m][n]` to rebuild the actual subsequence or list of edits.',
  ],
};
