import type { Lesson } from '../types';

// Lesson 1: fixed-size windows (643, 1456, 1343, 1052).

const maxAverageCode = `function findMaxAverage(nums, k) {
  let sum = 0;
  for (let i = 0; i < k; i++) sum += nums[i]; // first window
  let best = sum;
  for (let right = k; right < nums.length; right++) {
    sum += nums[right];     // item coming in
    sum -= nums[right - k]; // item going out
    best = Math.max(best, sum);
  }
  return best / k;
}`;

const maxAveragePseudo = `function findMaxAverage(nums, k):
    sum ← 0
    for i from 0 to k - 1:              // build the first window
        sum ← sum + nums[i]
    best ← sum
    for right from k to n - 1:          // slide one step at a time
        sum ← sum + nums[right]         // item coming in
        sum ← sum - nums[right - k]     // item going out
        best ← max(best, sum)
    return best / k`;

const maxVowelsCode = `function maxVowels(s, k) {
  const vowels = new Set(['a', 'e', 'i', 'o', 'u']);
  let count = 0;
  let best = 0;
  for (let right = 0; right < s.length; right++) {
    if (vowels.has(s[right])) count++;
    if (right >= k && vowels.has(s[right - k])) count--;
    if (right >= k - 1) best = Math.max(best, count);
  }
  return best;
}`;

const thresholdCode = `function numOfSubarrays(arr, k, threshold) {
  const need = k * threshold; // compare sums, not averages
  let sum = 0;
  let count = 0;
  for (let right = 0; right < arr.length; right++) {
    sum += arr[right];
    if (right >= k) sum -= arr[right - k];
    if (right >= k - 1 && sum >= need) count++;
  }
  return count;
}`;

const grumpyCode = `function maxSatisfied(customers, grumpy, minutes) {
  let base = 0; // happy no matter what
  for (let i = 0; i < customers.length; i++) {
    if (grumpy[i] === 0) base += customers[i];
  }
  let extra = 0; // customers rescued by the current calm window
  let bestExtra = 0;
  for (let right = 0; right < customers.length; right++) {
    if (grumpy[right] === 1) extra += customers[right];
    const out = right - minutes;
    if (out >= 0 && grumpy[out] === 1) extra -= customers[out];
    bestExtra = Math.max(bestExtra, extra);
  }
  return base + bestExtra;
}`;

export const fixedWindowLesson: Lesson = {
  id: 'fixed-window',
  title: 'Fixed-size windows',
  summary: 'Slide a window of exactly k items: add the one coming in, drop the one going out.',
  minutes: 18,
  blocks: [
    {
      kind: 'callout',
      tone: 'story',
      title: 'The best 4-day stretch',
      text: "A streaming service logs **net new subscribers** each day: sign-ups minus cancels. A bad day can be negative. Marketing asks: which 4 days in a row had the best average? They want to copy whatever they did that week. The log has 365 numbers, and next year they will ask for 7-day and 30-day stretches too.",
    },
    {
      kind: 'text',
      text: 'Here is a small version. Daily numbers: `[1, 12, -5, -6, 50, 3]`, and `k = 4`. Find the highest average of any **4 days in a row**. A run of neighbors with no gaps is called a **subarray**. A **window** is just the subarray you are looking at right now. Here there are 3 windows of size 4, with sums 2, 51 and 42. The answer is `51 / 4 = 12.75`.',
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Brute force: add up every window from scratch',
      code: `function findMaxAverage(nums, k):
    best ← -infinity
    for start from 0 to n - k:
        sum ← 0
        for i from start to start + k - 1:
            sum ← sum + nums[i]
        best ← max(best, sum)
    return best / k`,
    },
    {
      kind: 'text',
      text: 'This works. But there are about `n` windows and each one costs `k` additions, so it is **O(n·k)**. With 100,000 days and `k = 50,000` that is billions of additions.',
    },
    {
      kind: 'text',
      text: '**Spot the waste.** Look at two neighbor windows: `[1, 12, -5, -6]` and `[12, -5, -6, 50]`. They share `12, -5, -6`. You add those three numbers again for no reason. Between the two windows only two things changed: `1` left and `50` came in.',
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'Slide, do not rebuild',
      text: "**new sum = old sum + item coming in − item going out.** One addition and one subtraction per step, no matter how big `k` is. It is like the two pointers from module 3, but both ends move the same way and stay exactly `k` apart.",
    },
    {
      kind: 'steps',
      title: 'Sliding a window of 4',
      frames: [
        {
          cells: [1, 12, -5, -6, 50, 3],
          pointers: { L: 0, R: 3 },
          active: [0, 1, 2, 3],
          vars: { sum: 2, best: 2 },
          note: 'Build the first window the slow way, once: `1 + 12 - 5 - 6 = 2`.',
        },
        {
          cells: [1, 12, -5, -6, 50, 3],
          pointers: { L: 1, R: 4 },
          active: [1, 2, 3, 4],
          done: [0],
          vars: { sum: 51, best: 51 },
          note: 'Slide: `50` comes in, `1` goes out. `2 + 50 - 1 = 51`. New best.',
        },
        {
          cells: [1, 12, -5, -6, 50, 3],
          pointers: { L: 2, R: 5 },
          active: [2, 3, 4, 5],
          done: [0, 1],
          vars: { sum: 42, best: 51 },
          note: 'Slide: `3` comes in, `12` goes out. `51 + 3 - 12 = 42`. Not better.',
        },
        {
          cells: [1, 12, -5, -6, 50, 3],
          found: [1, 2, 3, 4],
          vars: { best: 51, answer: '51 / 4 = 12.75' },
          note: 'R hit the end. Divide the best sum by `k` once, at the very end.',
        },
      ],
    },
    { kind: 'code', lang: 'pseudo', title: 'Sliding window', code: maxAveragePseudo },
    { kind: 'code', lang: 'js', title: 'JavaScript', code: maxAverageCode },
    {
      kind: 'compare',
      title: 'Max average of k in a row',
      rows: [
        { approach: 'Brute force', time: 'O(n·k)', space: 'O(1)', note: 'Re-adds the shared items of every window.' },
        { approach: 'Prefix sums (module 2)', time: 'O(n)', space: 'O(n)', note: 'Any window sum is `pre[r+1] - pre[l]`. Fast, but needs an extra array.' },
        { approach: 'Sliding window', time: 'O(n)', space: 'O(1)', note: 'One add and one subtract per step. Nothing stored.' },
      ],
    },
    {
      kind: 'list',
      items: [
        '**Signals:** “exactly `k` in a row”, “every subarray of length `k`”, “any `k` consecutive days / letters / minutes”.',
        '**What you keep:** whatever you need to know about the window. A sum, a count of vowels, a count of each letter.',
        '**The rule:** after adding index `right`, the item that falls out is `right - k`.',
      ],
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Template: fixed window of size k',
      code: `state ← empty                          // a sum, a count, a map...
for right from 0 to n - 1:
    add nums[right] to state           // item coming in
    if right ≥ k:                      // window now has k + 1 items
        remove nums[right - k] from state
    if right ≥ k - 1:                  // window has exactly k items
        update answer from state`,
    },
    {
      kind: 'callout',
      tone: 'trap',
      title: 'Two classic slips',
      text: "The item leaving is `nums[right - k]`, not `nums[right - k + 1]` (that one is still inside). And start `best` from the **first window**, not from `0`. If every number is negative, `0` would beat every real window and you would return an answer that does not exist.",
    },
  ],
  problems: [
    {
      id: 'sliding-window-max-average-subarray',
      title: 'Best stretch of k days',
      difficulty: 'easy',
      leetcode: 643,
      pattern: 'Sliding window (fixed)',
      statement: "A streaming service gives you `nums`, the net new subscribers for each day (it can be negative), and a number `k`. Return the **highest average** of any `k` days in a row.",
      examples: [
        { input: 'nums = [1, 12, -5, -6, 50, 3], k = 4', output: '12.75', explain: 'Days 2 to 5 sum to `51`, and `51 / 4 = 12.75`.' },
        { input: 'nums = [5], k = 1', output: '5' },
      ],
      constraints: ['1 ≤ k ≤ n ≤ 10⁵', '-10⁴ ≤ nums[i] ≤ 10⁴'],
      hints: [
        'Two neighbor windows share `k - 1` days. What changes between them?',
        'Keep a running sum of the current window instead of re-adding it.',
        'Add `nums[right]`, subtract `nums[right - k]`. Track the best sum and divide by `k` only at the end.',
      ],
      approaches: [
        {
          name: 'Brute force',
          idea: 'Try every start and add up the next `k` numbers. Correct, but every window re-adds `k - 1` numbers the last window already added.',
          time: 'O(n·k)',
          space: 'O(1)',
        },
        {
          name: 'Sliding sum',
          idea: 'Keep one running sum. Each step one day enters and one leaves, so the new sum is old sum + new − old. Comparing sums is the same as comparing averages, because every window has the same size.',
          pseudo: maxAveragePseudo,
          code: maxAverageCode,
          time: 'O(n)',
          space: 'O(1)',
        },
      ],
      fn: 'findMaxAverage',
      starter: `function findMaxAverage(nums, k) {
  // Slide a window of size k and keep the best sum.
  return 0;
}`,
      solution: maxAverageCode,
      compare: 'float',
      tests: [
        { name: 'example', args: [[1, 12, -5, -6, 50, 3], 4], expected: 12.75 },
        { name: 'one day', args: [[5], 1], expected: 5 },
        { name: 'all negative', args: [[-1, -2, -3, -4], 2], expected: -1.5 },
        { name: 'k equals n', args: [[3, 3, 4], 3], expected: 10 / 3 },
        { name: 'best at the end', args: [[0, 1, 1, 3, 3], 4], expected: 2 },
        { name: 'best at the start', args: [[9, 9, 1, 1, 1], 2], expected: 9 },
        { name: 'k = 1 picks the max', args: [[4, -2, 7, 1], 1], expected: 7 },
        { name: 'all zeros', args: [[0, 0, 0], 2], expected: 0 },
      ],
      takeaway: 'Same-size windows: compare sums, divide once at the end.',
    },
    {
      id: 'sliding-window-max-vowels',
      title: 'Most vowels in k letters',
      difficulty: 'medium',
      leetcode: 1456,
      pattern: 'Sliding window (fixed)',
      statement: "A karaoke app highlights the part of a lyric that singers hold the longest, and long notes land on vowels. Given a lowercase string `s` and a number `k`, return the **largest number of vowels** (`a e i o u`) in any `k` letters in a row.",
      examples: [
        { input: 's = "abciiidef", k = 3', output: '3', explain: '`"iii"` has 3 vowels.' },
        { input: 's = "leetcode", k = 3', output: '2', explain: '`"lee"`, `"eet"` and `"ode"` each have 2.' },
        { input: 's = "rhythm", k = 2', output: '0' },
      ],
      constraints: ['1 ≤ k ≤ s.length ≤ 10⁵', 's has lowercase English letters only'],
      hints: [
        'The window always has exactly `k` letters. What number describes it?',
        'Keep a count of vowels in the window.',
        'When `s[right]` comes in, add 1 if it is a vowel. When `s[right - k]` leaves, subtract 1 if it is a vowel.',
      ],
      approaches: [
        {
          name: 'Brute force',
          idea: 'For each start, count the vowels in the next `k` letters. Recounts almost the same letters every time.',
          time: 'O(n·k)',
          space: 'O(1)',
        },
        {
          name: 'Sliding count',
          idea: 'Keep the vowel count of the window. Each step changes it by at most 1 in, 1 out, so updating is O(1).',
          pseudo: `function maxVowels(s, k):
    count ← 0
    best ← 0
    for right from 0 to n - 1:
        if s[right] is a vowel: count ← count + 1
        if right ≥ k and s[right - k] is a vowel:
            count ← count - 1
        if right ≥ k - 1: best ← max(best, count)
    return best`,
          code: maxVowelsCode,
          time: 'O(n)',
          space: 'O(1)',
        },
      ],
      fn: 'maxVowels',
      starter: `function maxVowels(s, k) {
  // Count vowels in a window of k letters as it slides.
  return 0;
}`,
      solution: maxVowelsCode,
      tests: [
        { name: 'example', args: ['abciiidef', 3], expected: 3 },
        { name: 'all vowels', args: ['aeiou', 2], expected: 2 },
        { name: 'leetcode', args: ['leetcode', 3], expected: 2 },
        { name: 'no vowels', args: ['rhythm', 2], expected: 0 },
        { name: 'single letter', args: ['a', 1], expected: 1 },
        { name: 'k equals length', args: ['bcdaeb', 6], expected: 2 },
        { name: 'best at the end', args: ['xyzaaa', 2], expected: 2 },
        { name: 'vowels at both ends', args: ['aabbbaa', 3], expected: 2 },
      ],
      takeaway: 'The window state can be a simple count. Update it with what enters and what leaves.',
    },
    {
      id: 'sliding-window-threshold-subarrays',
      title: 'Strong-week badges',
      difficulty: 'medium',
      leetcode: 1343,
      pattern: 'Sliding window (fixed)',
      statement: "A fitness tracker gives a badge for every stretch of `k` days in a row whose **average** step count is **at least** `threshold`. Given the daily steps `arr`, return how many badges you earned. Overlapping stretches each count.",
      examples: [
        { input: 'arr = [2, 2, 2, 2, 5, 5, 5, 8], k = 3, threshold = 4', output: '3', explain: '`[2,5,5]`, `[5,5,5]` and `[5,5,8]` average 4, 5 and 6.' },
        { input: 'arr = [1, 1, 1], k = 1, threshold = 2', output: '0' },
      ],
      constraints: ['1 ≤ k ≤ arr.length ≤ 10⁵', '1 ≤ arr[i] ≤ 10⁴', '0 ≤ threshold ≤ 10⁴'],
      hints: [
        'Every window has the same size `k`. Can you avoid dividing?',
        '`sum / k ≥ threshold` is the same as `sum ≥ k * threshold`.',
        'Slide a running sum and count the windows where `sum ≥ k * threshold`.',
      ],
      approaches: [
        {
          name: 'Brute force',
          idea: 'For each start, add `k` numbers and check the average. Re-adds the overlap every time.',
          time: 'O(n·k)',
          space: 'O(1)',
        },
        {
          name: 'Sliding sum, no division',
          idea: 'Turn the average test into a sum test once: `sum ≥ k * threshold`. Then it is the plain fixed-window template with a counter. No floats, no rounding worries.',
          pseudo: `function numOfSubarrays(arr, k, threshold):
    need ← k * threshold
    sum ← 0
    count ← 0
    for right from 0 to n - 1:
        sum ← sum + arr[right]
        if right ≥ k: sum ← sum - arr[right - k]
        if right ≥ k - 1 and sum ≥ need:
            count ← count + 1
    return count`,
          code: thresholdCode,
          time: 'O(n)',
          space: 'O(1)',
        },
      ],
      fn: 'numOfSubarrays',
      starter: `function numOfSubarrays(arr, k, threshold) {
  // Count windows of size k whose average is at least threshold.
  return 0;
}`,
      solution: thresholdCode,
      tests: [
        { name: 'example', args: [[2, 2, 2, 2, 5, 5, 5, 8], 3, 4], expected: 3 },
        { name: 'primes', args: [[11, 13, 17, 23, 29, 31, 7, 5, 2, 3], 3, 5], expected: 6 },
        { name: 'none pass', args: [[1, 1, 1], 1, 2], expected: 0 },
        { name: 'one element, equal', args: [[5], 1, 5], expected: 1 },
        { name: 'k equals n', args: [[4, 4, 4, 4], 4, 4], expected: 1 },
        { name: 'rising', args: [[1, 2, 3, 4, 5], 2, 3], expected: 2 },
        { name: 'exactly on the line', args: [[10, 0, 10, 0], 2, 5], expected: 3 },
        { name: 'threshold 0', args: [[1, 2, 3], 2, 0], expected: 2 },
      ],
      takeaway: 'Turn “average ≥ t” into “sum ≥ k·t” and the floats disappear.',
    },
    {
      id: 'sliding-window-grumpy-bookstore',
      title: 'The grumpy café owner',
      difficulty: 'medium',
      leetcode: 1052,
      pattern: 'Sliding window (fixed)',
      statement: "A café is open for `n` minutes. `customers[i]` people walk in at minute `i`. When the owner is grumpy (`grumpy[i] = 1`), those customers leave unhappy; otherwise they are happy. The owner can stay calm on purpose **once**, for exactly `minutes` minutes in a row. Return the **most happy customers** possible.",
      examples: [
        {
          input: 'customers = [1, 0, 1, 2, 1, 1, 7, 5], grumpy = [0, 1, 0, 1, 0, 1, 0, 1], minutes = 3',
          output: '16',
          explain: 'Calm during the last 3 minutes. `1 + 1 + 1 + 1 + 7 + 5 = 16`.',
        },
        { input: 'customers = [1], grumpy = [0], minutes = 1', output: '1' },
      ],
      constraints: ['1 ≤ minutes ≤ n ≤ 2·10⁴', '0 ≤ customers[i] ≤ 1000', 'grumpy[i] is 0 or 1'],
      hints: [
        'Some customers are happy no matter what. Count them first.',
        'The calm window only changes the grumpy minutes inside it.',
        'Slide a window of size `minutes` that sums `customers[i]` only where `grumpy[i] = 1`. Answer = always-happy + best window.',
      ],
      approaches: [
        {
          name: 'Try every calm window',
          idea: 'For each start, pretend the owner is calm there and recount every happy customer in the whole day. Correct, but it recounts the full day each time.',
          time: 'O(n·minutes) to O(n²)',
          space: 'O(1)',
        },
        {
          name: 'Base + sliding extra',
          idea: 'Split the answer in two. The **base** (non-grumpy minutes) never changes. The **extra** is how many grumpy-minute customers the calm window rescues, which is a fixed-window sum. Maximize the extra.',
          pseudo: `function maxSatisfied(customers, grumpy, minutes):
    base ← sum of customers[i] where grumpy[i] = 0
    extra ← 0
    bestExtra ← 0
    for right from 0 to n - 1:
        if grumpy[right] = 1: extra ← extra + customers[right]
        out ← right - minutes
        if out ≥ 0 and grumpy[out] = 1:
            extra ← extra - customers[out]
        bestExtra ← max(bestExtra, extra)
    return base + bestExtra`,
          code: grumpyCode,
          time: 'O(n)',
          space: 'O(1)',
        },
      ],
      fn: 'maxSatisfied',
      starter: `function maxSatisfied(customers, grumpy, minutes) {
  // Always-happy customers + the best calm window.
  return 0;
}`,
      solution: grumpyCode,
      tests: [
        { name: 'example', args: [[1, 0, 1, 2, 1, 1, 7, 5], [0, 1, 0, 1, 0, 1, 0, 1], 3], expected: 16 },
        { name: 'one minute', args: [[1], [0], 1], expected: 1 },
        { name: 'calm covers all grumpy', args: [[4, 10, 10], [1, 1, 0], 2], expected: 24 },
        { name: 'pick the bigger grumpy minute', args: [[2, 6, 6, 9], [0, 0, 1, 1], 1], expected: 17 },
        { name: 'always grumpy, full window', args: [[5, 5, 5], [1, 1, 1], 3], expected: 15 },
        { name: 'never grumpy', args: [[3, 1, 4], [0, 0, 0], 1], expected: 8 },
        { name: 'always grumpy, part window', args: [[1, 2, 3, 4, 5], [1, 1, 1, 1, 1], 2], expected: 9 },
        { name: 'empty minutes', args: [[0, 0, 3, 0], [1, 1, 1, 1], 1], expected: 3 },
      ],
      takeaway: 'Split the answer into a fixed part and a window part, then slide only the window part.',
    },
  ],
  quiz: [
    {
      prompt: 'A window of size `k` just took in `nums[right]`. Which item leaves?',
      options: ['`nums[right - k + 1]`', '`nums[right - k]`', '`nums[right - 1]`', '`nums[k]`'],
      answer: 1,
      explanation: 'After adding `right`, the window should cover `right - k + 1 .. right`. So `right - k` is the one that just fell off the left.',
    },
    {
      prompt: 'Why is the sliding sum O(n) even when `k` is huge?',
      options: [
        'Because it skips half the windows',
        'Because each step does one add and one subtract, no matter how big `k` is',
        'Because it sorts the array first',
        'It is not O(n); it is O(n·k)',
      ],
      answer: 1,
      explanation: 'The window size never shows up in the per-step work. Each of the `n` steps is constant work.',
    },
    {
      prompt: 'All numbers are negative. What goes wrong if you start `best` at `0`?',
      options: [
        'Nothing, 0 is a safe start',
        'The loop never runs',
        'You return 0, which is bigger than every real window',
        'You get a division by zero',
      ],
      answer: 2,
      explanation: 'No real window can reach 0, so `best` never changes. Start from the first window instead.',
    },
  ],
  takeaways: [
    'Neighbor windows share `k - 1` items. Update the window, never rebuild it.',
    'The item that leaves after adding `right` is `right - k`.',
    'Keep any state you need (sum, count, map) and update it with what enters and what leaves.',
  ],
};
