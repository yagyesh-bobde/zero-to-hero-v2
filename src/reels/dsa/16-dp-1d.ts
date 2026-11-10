import type { Series } from '../types';

// /dsa/reels module 16. One reel per lesson of src/dsa/modules/16-dp-1d*.ts, in lesson order.
// Brief: src/reels/dsa/README.md. Rules: src/reels/AUTHORING.md.

const houses = [2, 7, 9, 3, 1];
// The lesson uses 101; 99 keeps every dp value the same and fits an 8-cell strip.
const scores = [10, 9, 2, 5, 3, 7, 99, 18];
const days = [-2, 1, -3, 4, -1, 2, 1, -5, 4];

export const series: Series = {
  id: 'dsa-dp-1d',
  title: 'Dynamic programming I',
  emoji: '🧮',
  color: '#f472b6',
  order: 16,
  blurb: 'From recursion to memo to table: 1D states and decisions.',
  reels: [
    // ─── Lesson 1: recursion → memo → table ───────────────────────────────
    {
      id: 'dsa-dp-1d-recursion-to-table',
      title: 'Recursion → memo → table',
      link: { label: 'Solve it', href: '/dsa#/m/dp-1d/recursion-to-table/dp-1d-climbing-stairs' },
      beats: [
        {
          say: 'The elevator is broken. How many ways can you climb the stairs?',
          emphasis: ['ways'],
          scene: { type: 'title', kicker: 'DP · Lesson 1', title: 'How many *ways* up?', emoji: '🪜', style: 'slam' },
        },
        {
          say: 'Each move climbs one or two stairs. For four stairs, there are five different ways.',
          emphasis: ['five'],
          sfx: 'pop',
          scene: {
            type: 'list',
            title: 'Four stairs, five ways',
            numbered: true,
            items: ['1 + 1 + 1 + 1', '1 + 1 + 2', '1 + 2 + 1', '2 + 1 + 1', '2 + 2'],
          },
        },
        {
          say: 'Think about your last move. You came from one stair below, or from two below. So add those.',
          emphasis: ['last', 'add'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'pseudo',
            file: 'Plain recursion',
            code: `function ways(n):
    if n ≤ 1:
        return 1
    return ways(n - 1) + ways(n - 2)`,
            highlight: [4],
            note: { line: 4, text: 'one step or two steps back', tone: 'info' },
          },
        },
        {
          say: 'But look at the calls. Ways of three gets solved twice, from scratch, with the same answer.',
          emphasis: ['twice'],
          scene: {
            type: 'tree',
            title: 'Every call ways(5) makes',
            caption: 'same question, solved again',
            root: {
              id: 'w5',
              label: 'ways(5)',
              children: [
                {
                  id: 'w4',
                  label: 'ways(4)',
                  children: [
                    { id: 'w3a', label: 'ways(3)', active: true },
                    { id: 'w2a', label: 'ways(2)', dim: true },
                  ],
                },
                {
                  id: 'w3b',
                  label: 'ways(3)',
                  active: true,
                  children: [
                    { id: 'w2b', label: 'ways(2)', dim: true },
                    { id: 'w1', label: 'ways(1)', dim: true },
                  ],
                },
              ],
            },
          },
        },
        {
          say: 'For forty stairs, that is over three hundred million calls. That is O of two to the n.',
          speak: 'For forty stairs, that is over three hundred million calls. That is oh of two to the n.',
          emphasis: ['million'],
          sfx: 'error',
          scene: {
            type: 'stat',
            value: '331M',
            label: 'calls for just *40* stairs',
            sub: 'O(2ⁿ): it re-solves the same stairs',
            tone: 'bad',
          },
        },
        {
          say: 'Same question, same answer. So write each answer down once, and never solve it twice.',
          emphasis: ['once', 'twice'],
          sfx: 'ding',
          scene: { type: 'title', kicker: 'The insight', title: 'Write each answer *down*', emoji: '💡', style: 'slam', sub: 'a memo, then a table' },
        },
        {
          say: 'Make a table, one cell per stair. Stair zero and stair one each have one way.',
          emphasis: ['table'],
          scene: {
            type: 'array',
            title: 'dp[i] = ways to stand on i',
            cells: [1, 1, '', '', '', '', ''],
            pointers: { i: 1 },
            active: [0, 1],
            vars: { 'dp[i]': 'base case' },
            caption: 'each cell adds the two before it',
          },
        },
        {
          say: 'Stair two reads the two cells before it. One plus one is two.',
          emphasis: ['two'],
          scene: {
            type: 'array',
            title: 'dp[i] = ways to stand on i',
            cells: [1, 1, 2, '', '', '', ''],
            pointers: { i: 2 },
            active: [2],
            reads: [0, 1],
            vars: { 'dp[i]': '1 + 1 = 2' },
            caption: 'each cell adds the two before it',
          },
        },
        {
          say: 'Stair three is one plus two, which makes three.',
          emphasis: ['three'],
          scene: {
            type: 'array',
            title: 'dp[i] = ways to stand on i',
            cells: [1, 1, 2, 3, '', '', ''],
            pointers: { i: 3 },
            active: [3],
            reads: [1, 2],
            done: [0],
            vars: { 'dp[i]': '1 + 2 = 3' },
            caption: 'each cell adds the two before it',
          },
        },
        {
          say: 'Stair four is two plus three, so five. That matches our five ways.',
          emphasis: ['five'],
          scene: {
            type: 'array',
            title: 'dp[i] = ways to stand on i',
            cells: [1, 1, 2, 3, 5, '', ''],
            pointers: { i: 4 },
            active: [4],
            reads: [2, 3],
            done: [0, 1],
            vars: { 'dp[i]': '2 + 3 = 5' },
            caption: 'each cell adds the two before it',
          },
        },
        {
          say: 'Keep going: eight, then thirteen. Each cell is one addition, with no repeats.',
          emphasis: ['thirteen', 'one'],
          sfx: 'success',
          scene: {
            type: 'array',
            title: 'dp[i] = ways to stand on i',
            cells: [1, 1, 2, 3, 5, 8, 13],
            pointers: { i: 6 },
            found: [6],
            reads: [4, 5],
            done: [0, 1, 2, 3],
            vars: { 'dp[i]': '5 + 8 = 13' },
            caption: 'each cell adds the two before it',
          },
        },
        {
          say: 'Each cell only looks two back, so two variables are enough. That is O of n time.',
          speak: 'Each cell only looks two back, so two variables are enough. That is oh of n time.',
          emphasis: ['two', 'variables'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'climbStairs.js',
            code: `function climbStairs(n) {
  let a = 1; // dp[i - 2]
  let b = 1; // dp[i - 1]
  for (let i = 2; i <= n; i++) {
    [a, b] = [b, a + b];
  }
  return b;
}`,
            highlight: [5],
            note: { line: 5, text: 'O(n) time, O(1) memory', tone: 'good' },
          },
        },
        {
          say: 'The trap: zero stairs has one way, not zero. You are already there. Start at zero and every sum breaks.',
          emphasis: ['one', 'zero'],
          sfx: 'error',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'trap.js',
            code: `dp[0] = 0; // "no ways"?
dp[1] = 1;
dp[2] = dp[1] + dp[0];
// gives 1, but it is 2`,
            errors: [1],
            note: { line: 1, text: 'dp[0] = 1: do nothing', tone: 'bad' },
          },
        },
        {
          say: 'Quick check. Why is plain recursion so slow for forty stairs?',
          sfx: 'riser',
          scene: {
            type: 'quiz',
            question: 'Why is plain recursion slow for ways(40)?',
            options: ['Adding big numbers is slow', 'It re-solves the same questions', 'Loops are always faster', 'It needs sorted input'],
            answer: 1,
          },
        },
        {
          say: 'There are only forty one different questions, but it asks them millions of times.',
          emphasis: ['millions'],
          sfx: 'ding',
          scene: {
            type: 'quiz',
            question: 'Why is plain recursion slow for ways(40)?',
            options: ['Adding big numbers is slow', 'It re-solves the same questions', 'Loops are always faster', 'It needs sorted input'],
            answer: 1,
            reveal: true,
            explain: '41 questions, asked millions of times. A table asks each once.',
          },
        },
        {
          say: 'Remember this. Split by the last move, write answers down, and fill small to big. Now tap solve it.',
          emphasis: ['last', 'small'],
          sfx: 'success',
          scene: {
            type: 'outro',
            points: ['Split by the *last move*', 'Never solve a question *twice*', 'Recursion → memo → *table*'],
            tagline: 'Now go solve it.',
          },
        },
      ],
    },

    // ─── Lesson 2: rob or skip ────────────────────────────────────────────
    {
      id: 'dsa-dp-1d-rob-or-skip',
      title: 'Decision DP: rob or skip',
      link: { label: 'Solve it', href: '/dsa#/m/dp-1d/rob-or-skip/dp-1d-house-robber' },
      beats: [
        {
          say: 'Never rob two houses side by side. What is the most cash you can take?',
          emphasis: ['two', 'most'],
          scene: { type: 'title', kicker: 'DP · Lesson 2', title: 'Never rob *two* neighbours', emoji: '🏠', style: 'slam' },
        },
        {
          say: 'Five houses hold two, seven, nine, three and one. The best plan is two, nine and one, for twelve.',
          emphasis: ['twelve'],
          sfx: 'pop',
          scene: {
            type: 'array',
            title: 'Cash in each house',
            cells: houses,
            found: [0, 2, 4],
            vars: { total: 12 },
            caption: 'linked alarms: no two side by side',
          },
        },
        {
          say: 'The brute force tries both choices at every house: skip it, or rob it and lose its neighbour.',
          emphasis: ['skip', 'rob'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'pseudo',
            file: 'Brute force',
            code: `function best(i):
    if i < 0:
        return 0
    skip ← best(i - 1)
    take ← best(i - 2) + nums[i]
    return max(skip, take)`,
            highlight: [[4, 5]],
            note: { line: 5, text: 'two calls at every house', tone: 'warn' },
          },
        },
        {
          say: 'That is the same tree as the stairs. Thirty houses means millions of calls, O of two to the n.',
          speak: 'That is the same tree as the stairs. Thirty houses means millions of calls, oh of two to the n.',
          emphasis: ['millions'],
          sfx: 'error',
          scene: {
            type: 'stat',
            value: '2.7M',
            label: 'calls for *30* houses',
            sub: 'O(2ⁿ): same repeated tree',
            tone: 'bad',
          },
        },
        {
          say: 'Look only at the last house. Skip it, or rob it plus the best from two houses back.',
          emphasis: ['last', 'two'],
          sfx: 'ding',
          scene: { type: 'title', kicker: 'The insight', title: 'Skip it, or rob it', emoji: '💡', style: 'slam', sub: 'take the bigger of the two' },
        },
        {
          say: 'Under each house, write the best cash so far. With one house, you rob it for two.',
          emphasis: ['best'],
          scene: {
            type: 'grid',
            title: 'Best cash so far',
            colLabels: ['0', '1', '2', '3', '4'],
            rowLabels: ['cash', 'best'],
            cells: [houses, [2, '', '', '', '']],
            active: [[1, 0]],
            reads: [[0, 0]],
            vars: { skip: 0, rob: 2 },
          },
        },
        {
          say: 'House seven: skip it and keep two, or rob it for seven. Seven wins.',
          emphasis: ['seven'],
          scene: {
            type: 'grid',
            title: 'Best cash so far',
            colLabels: ['0', '1', '2', '3', '4'],
            rowLabels: ['cash', 'best'],
            cells: [houses, [2, 7, '', '', '']],
            active: [[1, 1]],
            reads: [[1, 0], [0, 1]],
            vars: { skip: 2, rob: 7 },
          },
        },
        {
          say: 'House nine: rob it on top of the two from before. Eleven beats seven.',
          emphasis: ['eleven'],
          scene: {
            type: 'grid',
            title: 'Best cash so far',
            colLabels: ['0', '1', '2', '3', '4'],
            rowLabels: ['cash', 'best'],
            cells: [houses, [2, 7, 11, '', '']],
            active: [[1, 2]],
            reads: [[1, 0], [0, 2]],
            vars: { skip: 7, rob: '2 + 9 = 11' },
          },
        },
        {
          say: 'House three: robbing gives only ten, but skipping keeps eleven. So skip it.',
          emphasis: ['skip'],
          scene: {
            type: 'grid',
            title: 'Best cash so far',
            colLabels: ['0', '1', '2', '3', '4'],
            rowLabels: ['cash', 'best'],
            cells: [houses, [2, 7, 11, 11, '']],
            active: [[1, 3]],
            reads: [[1, 2]],
            vars: { skip: 11, rob: '7 + 3 = 10' },
          },
        },
        {
          say: 'Last house: eleven plus one is twelve. That is the answer, in one pass.',
          emphasis: ['twelve'],
          sfx: 'success',
          scene: {
            type: 'grid',
            title: 'Best cash so far',
            colLabels: ['0', '1', '2', '3', '4'],
            rowLabels: ['cash', 'best'],
            cells: [houses, [2, 7, 11, 11, 12]],
            found: [[1, 4]],
            reads: [[1, 2], [0, 4]],
            vars: { skip: 11, rob: '11 + 1 = 12' },
          },
        },
        {
          say: 'In JavaScript, keep just the last two bests. Rob or skip is one line, and it is O of n.',
          speak: 'In JavaScript, keep just the last two bests. Rob or skip is one line, and it is oh of n.',
          emphasis: ['one', 'line'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'rob.js',
            code: `function rob(nums) {
  let a = 0; // two back
  let b = 0; // one back
  for (const x of nums) {
    [a, b] = [b, Math.max(b, a + x)];
  }
  return b;
}`,
            highlight: [5],
            note: { line: 5, text: 'skip (b) or rob (a + x)', tone: 'good' },
          },
        },
        {
          say: 'Reach for this when taking one item blocks its neighbours, and you want the biggest total.',
          emphasis: ['blocks', 'biggest'],
          scene: {
            type: 'list',
            title: 'Reach for this when…',
            items: [
              { text: 'Taking one *blocks* its neighbour', icon: '🚫' },
              { text: 'You want the *max* total', icon: '🏆' },
              { text: 'Each item is take or skip', icon: '🔀' },
            ],
            active: 0,
          },
        },
        {
          say: 'The trap: just rob every other house. Here that gets three, but the two ends give four.',
          emphasis: ['every', 'other'],
          sfx: 'error',
          scene: {
            type: 'array',
            title: 'Every other house? No.',
            cells: [2, 1, 1, 2],
            found: [0, 3],
            done: [1, 2],
            vars: { alt: 3, best: 4 },
            caption: 'a fixed rule cannot weigh choices',
          },
        },
        {
          say: 'Quick check. Houses three, four, three. Grab the biggest first, or find the real best?',
          sfx: 'riser',
          scene: {
            type: 'quiz',
            question: 'Houses [3, 4, 3]. Grabbing the biggest gives? The real best?',
            options: ['4 and 4', '4 and 6', '6 and 6', '3 and 6'],
            answer: 1,
          },
        },
        {
          say: 'Grabbing four bans both threes. Skip it, and three plus three makes six.',
          emphasis: ['six'],
          sfx: 'ding',
          scene: {
            type: 'quiz',
            question: 'Houses [3, 4, 3]. Grabbing the biggest gives? The real best?',
            options: ['4 and 4', '4 and 6', '6 and 6', '3 and 6'],
            answer: 1,
            reveal: true,
            explain: 'Taking 4 bans both 3s. Skipping it gives 3 + 3 = 6.',
          },
        },
        {
          say: 'Remember this. At each item, skip it or take it, and keep the bigger. Now tap solve it and rob that street.',
          emphasis: ['skip', 'take'],
          sfx: 'success',
          scene: {
            type: 'outro',
            points: ['Skip it, or *take it*', 'Taking bans the *neighbour*', 'Keep the bigger, one pass'],
            tagline: 'Now go solve it.',
          },
        },
      ],
    },

    // ─── Lesson 3: counting ways ──────────────────────────────────────────
    {
      id: 'dsa-dp-1d-counting-ways',
      title: 'Counting ways',
      link: { label: 'Solve it', href: '/dsa#/m/dp-1d/counting-ways/dp-1d-decode-ways' },
      beats: [
        {
          say: 'A secret code lost its spaces. How many ways can you read it?',
          emphasis: ['spaces'],
          scene: { type: 'title', kicker: 'DP · Lesson 3', title: 'How many ways to read *226*?', emoji: '🔐', style: 'slam' },
        },
        {
          say: 'A is one, B is two, all the way to Z at twenty six. So two two six reads three ways.',
          emphasis: ['three'],
          sfx: 'pop',
          scene: {
            type: 'list',
            title: 'A = 1, B = 2 … Z = 26',
            numbered: true,
            items: [
              { text: '2 · 2 · 6 → *BBF*' },
              { text: '22 · 6 → *VF*' },
              { text: '2 · 26 → *BZ*' },
            ],
          },
        },
        {
          say: 'Every reading ends with a last piece, one digit or two. Count each case, and add them.',
          emphasis: ['last', 'add'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'pseudo',
            file: 'Last piece',
            code: `function count(i):
    if i = 0:
        return 1
    total ← 0
    if last 1 digit is 1 to 9:
        total ← total + count(i - 1)
    if last 2 digits are 10 to 26:
        total ← total + count(i - 2)
    return total`,
            highlight: [[5, 8]],
            note: { line: 8, text: 'the same calls repeat', tone: 'warn' },
          },
        },
        {
          say: 'Thirty ones in a row have over a million readings. You could never list them, but you can count them.',
          emphasis: ['million', 'count'],
          sfx: 'error',
          scene: {
            type: 'stat',
            value: '1.3M',
            label: 'readings of *30* ones',
            sub: 'listing is hopeless, counting is easy',
            tone: 'warn',
          },
        },
        {
          say: 'Each reading has exactly one last piece, so the cases never overlap. That means you can just add.',
          emphasis: ['overlap', 'add'],
          sfx: 'ding',
          scene: { type: 'title', kicker: 'The insight', title: 'Counting? *Add* the cases', emoji: '💡', style: 'slam', sub: 'never max, always plus' },
        },
        {
          say: 'Cell i counts the readings of the first i digits. The empty start has one reading: read nothing.',
          emphasis: ['one'],
          scene: {
            type: 'grid',
            title: 'Readings so far',
            colLabels: ['0', '1', '2', '3'],
            rowLabels: ['digit', 'ways'],
            cells: [['', '2', '2', '6'], [1, '', '', '']],
            active: [[1, 0]],
            vars: { one: '—', two: '—' },
          },
        },
        {
          say: 'Add a two. It works alone as B, so it copies the one reading before it.',
          emphasis: ['alone'],
          scene: {
            type: 'grid',
            title: 'Readings so far',
            colLabels: ['0', '1', '2', '3'],
            rowLabels: ['digit', 'ways'],
            cells: [['', '2', '2', '6'], [1, 1, '', '']],
            active: [[1, 1]],
            reads: [[1, 0]],
            vars: { one: '"2" +1', two: '—' },
          },
        },
        {
          say: 'Another two. Alone, it adds one. Glued as twenty two, it adds one more. That makes two.',
          emphasis: ['twenty', 'two'],
          scene: {
            type: 'grid',
            title: 'Readings so far',
            colLabels: ['0', '1', '2', '3'],
            rowLabels: ['digit', 'ways'],
            cells: [['', '2', '2', '6'], [1, 1, 2, '']],
            active: [[1, 2]],
            reads: [[1, 1], [1, 0]],
            vars: { one: '"2" +1', two: '"22" +1' },
          },
        },
        {
          say: 'The six alone adds two. Glued as twenty six, it adds one. Three readings in total.',
          emphasis: ['three'],
          sfx: 'success',
          scene: {
            type: 'grid',
            title: 'Readings so far',
            colLabels: ['0', '1', '2', '3'],
            rowLabels: ['digit', 'ways'],
            cells: [['', '2', '2', '6'], [1, 1, 2, 3]],
            found: [[1, 3]],
            reads: [[1, 2], [1, 1]],
            vars: { one: '"6" +2', two: '"26" +1' },
          },
        },
        {
          say: 'In JavaScript, two checks add two cells. One loop, so it is O of n.',
          speak: 'In JavaScript, two checks add two cells. One loop, so it is oh of n.',
          emphasis: ['two', 'checks'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'numDecodings.js',
            code: `const dp = new Array(n + 1).fill(0);
dp[0] = 1;
for (let i = 1; i <= n; i++) {
  const one = +s[i - 1];
  const two = +s.slice(i - 2, i);
  if (one >= 1) dp[i] += dp[i - 1];
  if (two >= 10 && two <= 26)
    dp[i] += dp[i - 2];
}
return dp[n];`,
            highlight: [[6, 8]],
            note: { line: 8, text: 'add both cases: O(n)', tone: 'good' },
          },
        },
        {
          say: 'Reach for this when it asks how many ways, and every answer splits by its last step.',
          emphasis: ['how', 'many'],
          scene: {
            type: 'list',
            title: 'Reach for this when…',
            items: [
              { text: 'It asks *how many* ways', icon: '🔢' },
              { text: 'Split by the *last* step', icon: '✂️' },
              { text: 'It says modulo 1e9+7', icon: '🧮' },
            ],
            active: 1,
          },
        },
        {
          say: 'The trap is zero. A zero alone is no letter, and nothing may start with zero. Test the zeros first.',
          emphasis: ['zero'],
          sfx: 'error',
          scene: {
            type: 'compare',
            title: 'Test the zeros',
            left: { title: 'Forgot zeros', verdict: 'bad', items: ['"06" gives 1', '"10" gives 2'] },
            right: { title: 'Checks zeros', verdict: 'ok', items: ['"06" gives 0', '"10" gives 1'] },
          },
        },
        {
          say: 'Quick check. Why does a counting DP add the cases, instead of taking the max?',
          sfx: 'riser',
          scene: {
            type: 'quiz',
            question: 'Counting DP: why add the cases, not max?',
            options: ['Max is slower', 'Each way fits exactly one case', 'Counts are always positive', 'The table is 1D'],
            answer: 1,
          },
        },
        {
          say: 'Every way has exactly one last piece, so it lands in one case. The total is the sum.',
          emphasis: ['one', 'sum'],
          sfx: 'ding',
          scene: {
            type: 'quiz',
            question: 'Counting DP: why add the cases, not max?',
            options: ['Max is slower', 'Each way fits exactly one case', 'Counts are always positive', 'The table is 1D'],
            answer: 1,
            reveal: true,
            explain: 'No overlap between cases, so total = sum of the groups.',
          },
        },
        {
          say: 'Remember this. Split by the last piece, add the counts, and start with one way to do nothing. Now tap solve it.',
          emphasis: ['add', 'nothing'],
          sfx: 'success',
          scene: {
            type: 'outro',
            points: ['Split by the *last piece*', 'Counting means *add*', 'dp[0] = 1: do nothing'],
            tagline: 'Now go solve it.',
          },
        },
      ],
    },

    // ─── Lesson 4: unbounded choices (coin change) ────────────────────────
    {
      id: 'dsa-dp-1d-unbounded-choices',
      title: 'Unbounded choices: coin change',
      link: { label: 'Solve it', href: '/dsa#/m/dp-1d/unbounded-choices/dp-1d-coin-change' },
      beats: [
        {
          say: 'Pay six cents with the fewest coins. The obvious way gets it wrong.',
          emphasis: ['fewest', 'wrong'],
          scene: { type: 'title', kicker: 'DP · Lesson 4', title: 'Biggest coin first? *Wrong*', emoji: '🪙', style: 'slam' },
        },
        {
          say: 'Coins are one, three and four. Biggest first gives four, one, one. But three plus three is just two coins.',
          emphasis: ['two', 'coins'],
          sfx: 'pop',
          scene: {
            type: 'compare',
            title: 'Coins 1, 3, 4. Pay 6.',
            left: { title: 'Biggest first', verdict: 'bad', items: ['4 + 1 + 1', '3 coins'] },
            right: { title: 'Fewest', verdict: 'ok', items: ['3 + 3', '2 coins'] },
          },
        },
        {
          say: 'The best answer has a last coin. Try each coin as the last one, and solve what is left.',
          emphasis: ['last', 'left'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'pseudo',
            file: 'Brute force',
            code: `function fewest(a):
    if a = 0:
        return 0
    best ← ∞
    for each c in coins:
        if c ≤ a:
            try ← fewest(a - c) + 1
            best ← min(best, try)
    return best`,
            highlight: [[7, 8]],
            note: { line: 8, text: 'same amounts, solved again', tone: 'warn' },
          },
        },
        {
          say: 'A coin never runs out, so after one coin you face the same question with less money. Only seven questions exist.',
          emphasis: ['same', 'seven'],
          sfx: 'ding',
          scene: { type: 'title', kicker: 'The insight', title: 'The state is the *amount left*', emoji: '💡', style: 'slam', sub: 'amounts 0 to 6: seven cells' },
        },
        {
          say: 'Zero cents needs zero coins. Every other amount starts at infinity, which means not possible yet.',
          emphasis: ['infinity'],
          scene: {
            type: 'array',
            title: 'dp[a] = fewest coins',
            cells: [0, '∞', '∞', '∞', '∞', '∞', '∞'],
            active: [0],
            vars: { 'last 1': '—', 'last 3': '—', 'last 4': '—' },
          },
        },
        {
          say: 'One and two cents can only use ones. That is one coin, then two coins.',
          emphasis: ['ones'],
          scene: {
            type: 'array',
            title: 'dp[a] = fewest coins',
            cells: [0, 1, 2, '∞', '∞', '∞', '∞'],
            active: [2],
            reads: [1],
            vars: { 'last 1': 2, 'last 3': '—', 'last 4': '—' },
          },
        },
        {
          say: 'Three cents: three ones would be three coins, but a single three is one coin.',
          emphasis: ['single'],
          scene: {
            type: 'array',
            title: 'dp[a] = fewest coins',
            cells: [0, 1, 2, 1, '∞', '∞', '∞'],
            active: [3],
            reads: [2, 0],
            vars: { 'last 1': 3, 'last 3': 1, 'last 4': '—' },
          },
        },
        {
          say: 'Four cents is a single four. Five cents is four plus one, so two coins.',
          emphasis: ['four', 'two'],
          scene: {
            type: 'array',
            title: 'dp[a] = fewest coins',
            cells: [0, 1, 2, 1, 1, 2, '∞'],
            active: [5],
            reads: [4, 2, 1],
            vars: { 'last 1': 2, 'last 3': 3, 'last 4': 2 },
          },
        },
        {
          say: 'Six cents: last coin three, on top of the one coin for three. Two coins, and greedy said three.',
          emphasis: ['two', 'coins'],
          sfx: 'success',
          scene: {
            type: 'array',
            title: 'dp[a] = fewest coins',
            cells: [0, 1, 2, 1, 1, 2, 2],
            found: [6],
            reads: [3],
            vars: { 'last 1': 3, 'last 3': 2, 'last 4': 3 },
          },
        },
        {
          say: 'In JavaScript, every amount tries every coin. That is O of amount times coins.',
          speak: 'In JavaScript, every amount tries every coin. That is oh of amount times coins.',
          emphasis: ['every', 'coin'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'coinChange.js',
            code: `const dp = new Array(amount + 1);
dp.fill(Infinity);
dp[0] = 0;
for (let a = 1; a <= amount; a++) {
  for (const c of coins) {
    if (c > a) continue;
    const use = dp[a - c] + 1;
    dp[a] = Math.min(dp[a], use);
  }
}
return dp[amount] === Infinity
  ? -1 : dp[amount];`,
            highlight: [[7, 8]],
            note: { line: 8, text: 'O(amount × coins)', tone: 'good' },
          },
        },
        {
          say: 'Reach for this when you hit a target with options you can reuse, and greedy fails a small case.',
          emphasis: ['reuse', 'greedy'],
          scene: {
            type: 'list',
            title: 'Reach for this when…',
            items: [
              { text: 'You must hit an exact *target*', icon: '🎯' },
              { text: 'Options can be *reused*', icon: '♻️' },
              { text: 'Greedy fails a small case', icon: '🙅' },
            ],
            active: 1,
          },
        },
        {
          say: 'The trap: start the table at zero, and every min stays zero. Start at infinity, and turn it into minus one at the end.',
          speak: 'The trap: start the table at zero, and every min stays zero. Start at infinity, and turn it into minus one at the end.',
          emphasis: ['zero', 'infinity'],
          sfx: 'error',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'trap.js',
            code: `const dp = new Array(amount + 1)
  .fill(0);
// Math.min(0, anything) is 0
// so every answer comes out 0`,
            errors: [2],
            note: { line: 2, text: 'fill with Infinity', tone: 'bad' },
          },
        },
        {
          say: 'Quick check. You want the fewest perfect squares that add to twelve. What are the coins?',
          sfx: 'riser',
          scene: {
            type: 'quiz',
            question: 'Fewest squares that add to 12: the coins?',
            options: ['1, 2, 3', '1, 4, 9', '2, 4, 6, 8', 'Just 12'],
            answer: 1,
          },
        },
        {
          say: 'The squares are the coins. Four plus four plus four is twelve, so three coins.',
          emphasis: ['squares', 'coins'],
          sfx: 'ding',
          scene: {
            type: 'quiz',
            question: 'Fewest squares that add to 12: the coins?',
            options: ['1, 2, 3', '1, 4, 9', '2, 4, 6, 8', 'Just 12'],
            answer: 1,
            reveal: true,
            explain: 'Squares are the coins: 4 + 4 + 4 = 12.',
          },
        },
        {
          say: 'Remember this. The state is the amount left, and every coin stays available. Now tap solve it.',
          emphasis: ['amount', 'left'],
          sfx: 'success',
          scene: {
            type: 'outro',
            points: ['The state is *amount left*', 'Try every *last coin*', 'Min tables start at *∞*'],
            tagline: 'Now go solve it.',
          },
        },
      ],
    },

    // ─── Lesson 5: subsequences, LIS ──────────────────────────────────────
    {
      id: 'dsa-dp-1d-subsequences-lis',
      title: 'Subsequences: LIS',
      link: { label: 'Solve it', href: '/dsa#/m/dp-1d/subsequences-lis/dp-1d-lis' },
      beats: [
        {
          say: 'You can skip your bad days. How long is your best rising streak?',
          emphasis: ['rising'],
          scene: { type: 'title', kicker: 'DP · Lesson 5', title: 'Your longest *rising* streak', emoji: '📈', style: 'slam' },
        },
        {
          say: 'Here are eight game scores. Keep them in order, skip any you like. Two, three, seven, eighteen keeps rising: length four.',
          emphasis: ['four'],
          sfx: 'pop',
          scene: {
            type: 'array',
            title: 'Game scores, in order',
            cells: scores,
            found: [2, 4, 5, 7],
            vars: { length: 4 },
            caption: 'skip any days, keep the order',
          },
        },
        {
          say: 'Brute force checks every choice of days. With fifty scores, that is about a thousand trillion lists.',
          emphasis: ['every', 'trillion'],
          sfx: 'error',
          scene: {
            type: 'stat',
            value: '10¹⁵',
            label: 'subsequences of *50* scores',
            sub: 'every day in or out: O(2ⁿ)',
            tone: 'bad',
          },
        },
        {
          say: 'To add a score, you must know the last one you picked. So ask: what is the longest run ending right here?',
          emphasis: ['ending', 'here'],
          sfx: 'ding',
          scene: { type: 'title', kicker: 'The insight', title: 'Ask what *ends* here', emoji: '💡', style: 'slam', sub: 'dp[i] = longest run ending at i' },
        },
        {
          say: 'Ten, nine and two have nothing smaller before them. Each one alone is a run of one.',
          emphasis: ['alone'],
          scene: {
            type: 'grid',
            title: 'Longest run ending here',
            colLabels: ['0', '1', '2', '3', '4', '5', '6', '7'],
            rowLabels: ['score', 'dp'],
            cells: [scores, [1, 1, 1, '', '', '', '', '']],
            active: [[1, 2]],
            vars: { follows: 'none', 'dp[i]': 1 },
          },
        },
        {
          say: 'Five can follow two, so its run is one more than two’s. That makes two.',
          speak: 'Five can follow two, so its run is one more than twos. That makes two.',
          emphasis: ['follow'],
          scene: {
            type: 'grid',
            title: 'Longest run ending here',
            colLabels: ['0', '1', '2', '3', '4', '5', '6', '7'],
            rowLabels: ['score', 'dp'],
            cells: [scores, [1, 1, 1, 2, '', '', '', '']],
            active: [[1, 3]],
            reads: [[1, 2]],
            vars: { follows: '2', 'dp[i]': '1 + 1 = 2' },
          },
        },
        {
          say: 'Three can also follow two. Another run of two.',
          emphasis: ['three'],
          scene: {
            type: 'grid',
            title: 'Longest run ending here',
            colLabels: ['0', '1', '2', '3', '4', '5', '6', '7'],
            rowLabels: ['score', 'dp'],
            cells: [scores, [1, 1, 1, 2, 2, '', '', '']],
            active: [[1, 4]],
            reads: [[1, 2]],
            vars: { follows: '2', 'dp[i]': '1 + 1 = 2' },
          },
        },
        {
          say: 'Seven can follow two, five or three. The best of those is two, so seven gets three.',
          emphasis: ['best', 'three'],
          scene: {
            type: 'grid',
            title: 'Longest run ending here',
            colLabels: ['0', '1', '2', '3', '4', '5', '6', '7'],
            rowLabels: ['score', 'dp'],
            cells: [scores, [1, 1, 1, 2, 2, 3, '', '']],
            active: [[1, 5]],
            reads: [[1, 2], [1, 3], [1, 4]],
            vars: { follows: '2, 5, 3', 'dp[i]': '2 + 1 = 3' },
          },
        },
        {
          say: 'Ninety nine can follow anything. The best before it is seven, so it gets four.',
          emphasis: ['four'],
          scene: {
            type: 'grid',
            title: 'Longest run ending here',
            colLabels: ['0', '1', '2', '3', '4', '5', '6', '7'],
            rowLabels: ['score', 'dp'],
            cells: [scores, [1, 1, 1, 2, 2, 3, 4, '']],
            active: [[1, 6]],
            reads: [[1, 5]],
            vars: { follows: 'all', 'dp[i]': '3 + 1 = 4' },
          },
        },
        {
          say: 'Eighteen follows seven, so it also gets four. The answer is the biggest cell: four.',
          emphasis: ['biggest'],
          sfx: 'success',
          scene: {
            type: 'grid',
            title: 'Longest run ending here',
            colLabels: ['0', '1', '2', '3', '4', '5', '6', '7'],
            rowLabels: ['score', 'dp'],
            cells: [scores, [1, 1, 1, 2, 2, 3, 4, 4]],
            found: [[0, 2], [0, 4], [0, 5], [0, 7]],
            reads: [[1, 5]],
            vars: { follows: 'all but 99', 'dp[i]': '3 + 1 = 4' },
          },
        },
        {
          say: 'In JavaScript, each score looks back at every earlier one. That is O of n squared.',
          speak: 'In JavaScript, each score looks back at every earlier one. That is oh of n squared.',
          emphasis: ['every', 'earlier'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'lengthOfLIS.js',
            code: `const dp = new Array(n).fill(1);
for (let i = 0; i < n; i++) {
  for (let j = 0; j < i; j++) {
    if (nums[j] < nums[i]) {
      const ext = dp[j] + 1;
      dp[i] = Math.max(dp[i], ext);
    }
  }
}
return Math.max(...dp);`,
            highlight: [[4, 6]],
            note: { line: 6, text: 'O(n²): extend a smaller one', tone: 'good' },
          },
        },
        {
          say: 'Reach for this when your next pick depends on the last one, like a chain that must keep rising.',
          emphasis: ['last', 'one'],
          scene: {
            type: 'list',
            title: 'Reach for this when…',
            items: [
              { text: 'Next pick depends on the *last*', icon: '🔗' },
              { text: 'Keep order, skip any', icon: '⏭️' },
              { text: '*Longest* chain or rising run', icon: '📈' },
            ],
            active: 0,
          },
        },
        {
          say: 'The trap: the answer is the biggest cell, not the last one. The best run can end anywhere.',
          emphasis: ['biggest', 'anywhere'],
          sfx: 'error',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'trap.js',
            code: `// nums [1, 2, 0], dp [1, 2, 1]
return dp[n - 1]; // 1, wrong
return Math.max(...dp); // 2`,
            errors: [2],
            note: { line: 2, text: 'best run 1, 2 ends at index 1', tone: 'bad' },
          },
        },
        {
          say: 'Quick check. Why does each cell mean the run ending here, not the best of the first i scores?',
          sfx: 'riser',
          scene: {
            type: 'quiz',
            question: 'Why is dp[i] the run ending at i, not the best of the first i?',
            options: ['It uses less memory', 'You need the last value picked', 'Runs must end at the end', 'It makes it O(n)'],
            answer: 1,
          },
        },
        {
          say: 'To add a score, you need the last value in the run. Ending at i tells you exactly what it is.',
          emphasis: ['last', 'value'],
          sfx: 'ding',
          scene: {
            type: 'quiz',
            question: 'Why is dp[i] the run ending at i, not the best of the first i?',
            options: ['It uses less memory', 'You need the last value picked', 'Runs must end at the end', 'It makes it O(n)'],
            answer: 1,
            reveal: true,
            explain: 'Ending at i means the last value is nums[i].',
          },
        },
        {
          say: 'Remember this. Ask what is best ending here, then take the biggest cell. Now tap solve it.',
          emphasis: ['ending', 'biggest'],
          sfx: 'success',
          scene: {
            type: 'outro',
            points: ['Keep the order, *skip* any', 'dp[i] = best *ending at i*', 'Answer = the *biggest* cell'],
            tagline: 'Now go solve it.',
          },
        },
      ],
    },

    // ─── Lesson 6: Kadane ─────────────────────────────────────────────────
    {
      id: 'dsa-dp-1d-kadane',
      title: 'Kadane: best subarray ending here',
      link: { label: 'Solve it', href: '/dsa#/m/dp-1d/kadane/dp-1d-max-subarray' },
      beats: [
        {
          say: 'Followers go up and down every day. Which stretch of days was best?',
          emphasis: ['best'],
          scene: { type: 'title', kicker: 'DP · Lesson 6', title: 'Find your *best* stretch', emoji: '📊', style: 'slam' },
        },
        {
          say: 'Here are nine days of gains and losses. The best unbroken run is four, minus one, two and one. That adds to six.',
          emphasis: ['six'],
          sfx: 'pop',
          scene: {
            type: 'array',
            title: 'Follower change per day',
            cells: days,
            window: [3, 6],
            found: [3, 4, 5, 6],
            vars: { sum: 6 },
            caption: 'one unbroken run of days',
          },
        },
        {
          say: 'Brute force tries every start day, and every end day after it. That is a loop inside a loop.',
          emphasis: ['every', 'start'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'pseudo',
            file: 'Brute force',
            code: `function maxSubArray(nums):
    best ← -∞
    for start from 0 to n - 1:
        sum ← 0
        for end from start to n - 1:
            sum ← sum + nums[end]
            best ← max(best, sum)
    return best`,
            highlight: [[3, 5]],
            note: { line: 5, text: 'a loop inside a loop', tone: 'warn' },
          },
        },
        {
          say: 'For a hundred thousand days, that is five billion sums. O of n squared.',
          speak: 'For a hundred thousand days, that is five billion sums. Oh of n squared.',
          emphasis: ['billion'],
          sfx: 'error',
          scene: {
            type: 'stat',
            value: '5B',
            label: 'sums for *100,000* days',
            sub: 'O(n²): every start, every end',
            tone: 'bad',
          },
        },
        {
          say: 'At each day, ask one thing. Extend the run behind you, or restart right here?',
          emphasis: ['extend', 'restart'],
          sfx: 'ding',
          scene: { type: 'title', kicker: 'The insight', title: 'Extend, or *restart*?', emoji: '💡', style: 'slam', sub: 'a negative run only drags you down' },
        },
        {
          say: 'Day zero is minus two. On day one, extending gives minus one, restarting gives one. Restart.',
          emphasis: ['restart'],
          scene: {
            type: 'array',
            title: 'One pass: cur and best',
            cells: days,
            pointers: { i: 1 },
            window: [1, 1],
            active: [1],
            done: [0],
            vars: { cur: 1, best: 1 },
          },
        },
        {
          say: 'Day two: one minus three is minus two. That still beats restarting at minus three.',
          emphasis: ['beats'],
          scene: {
            type: 'array',
            title: 'One pass: cur and best',
            cells: days,
            pointers: { i: 2 },
            window: [1, 2],
            active: [2],
            done: [0],
            vars: { cur: -2, best: 1 },
          },
        },
        {
          say: 'Day three: the run behind is negative, so drop it and restart at four. A new best.',
          emphasis: ['negative', 'four'],
          scene: {
            type: 'array',
            title: 'One pass: cur and best',
            cells: days,
            pointers: { i: 3 },
            window: [3, 3],
            active: [3],
            done: [0, 1, 2],
            vars: { cur: 4, best: 4 },
          },
        },
        {
          say: 'Day four dips to three. That is still positive, so keep the run going.',
          emphasis: ['positive'],
          scene: {
            type: 'array',
            title: 'One pass: cur and best',
            cells: days,
            pointers: { i: 4 },
            window: [3, 4],
            active: [4],
            done: [0, 1, 2],
            vars: { cur: 3, best: 4 },
          },
        },
        {
          say: 'Add two, then one. The run reaches six, a new best.',
          emphasis: ['six'],
          scene: {
            type: 'array',
            title: 'One pass: cur and best',
            cells: days,
            pointers: { i: 6 },
            window: [3, 6],
            active: [6],
            done: [0, 1, 2],
            vars: { cur: 6, best: 6 },
          },
        },
        {
          say: 'The last two days never beat six. The answer is six, found in one pass.',
          emphasis: ['one', 'pass'],
          sfx: 'success',
          scene: {
            type: 'array',
            title: 'One pass: cur and best',
            cells: days,
            pointers: { i: 8 },
            window: [3, 6],
            found: [3, 4, 5, 6],
            done: [0, 1, 2, 7, 8],
            vars: { cur: 5, best: 6 },
          },
        },
        {
          say: 'In JavaScript, it is two numbers and one line of choice. That is O of n.',
          speak: 'In JavaScript, it is two numbers and one line of choice. That is oh of n.',
          emphasis: ['two', 'numbers'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'maxSubArray.js',
            code: `function maxSubArray(nums) {
  let cur = nums[0];
  let best = nums[0];
  for (const x of nums.slice(1)) {
    cur = Math.max(x, cur + x);
    best = Math.max(best, cur);
  }
  return best;
}`,
            highlight: [5],
            note: { line: 5, text: 'restart or extend: O(n)', tone: 'good' },
          },
        },
        {
          say: 'The trap: start at zero, and all negative days return zero. That is an empty run, which is not allowed.',
          emphasis: ['zero', 'empty'],
          sfx: 'error',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'trap.js',
            code: `let cur = 0, best = 0;
// [-3, -1, -2] gives 0
// fix: start at nums[0]`,
            errors: [1],
            note: { line: 1, text: 'should return -1', tone: 'bad' },
          },
        },
        {
          say: 'Quick check. In Kadane, when does the run restart at the current day?',
          sfx: 'riser',
          scene: {
            type: 'quiz',
            question: 'In Kadane, when does the run restart at nums[i]?',
            options: ['When nums[i] is negative', 'When the run behind is negative', 'Whenever best changes', 'Never'],
            answer: 1,
          },
        },
        {
          say: 'It restarts when the run behind you is negative, because that only drags today down.',
          emphasis: ['negative'],
          sfx: 'ding',
          scene: {
            type: 'quiz',
            question: 'In Kadane, when does the run restart at nums[i]?',
            options: ['When nums[i] is negative', 'When the run behind is negative', 'Whenever best changes', 'Never'],
            answer: 1,
            reveal: true,
            explain: 'max(x, cur + x) picks x exactly when cur < 0.',
          },
        },
        {
          say: 'Remember this. Extend the run or restart, and keep the best you have seen. Now tap solve it.',
          emphasis: ['restart', 'best'],
          sfx: 'success',
          scene: {
            type: 'outro',
            points: ['Extend, or *restart* here', 'Keep the *best* so far', 'Start at nums[0], not 0'],
            tagline: 'Now go solve it.',
          },
        },
      ],
    },
  ],
};
