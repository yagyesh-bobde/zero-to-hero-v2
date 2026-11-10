import type { Lesson } from '../types';

// Lesson 3: window + frequency map (567, 438, 424).

const inclusionPseudo = `function checkInclusion(p, s):
    need ← count of each letter in p     // missing letters read as 0
    missing ← length of p
    m ← length of p
    for right from 0 to n - 1:
        c ← s[right]                       // letter coming in
        if need[c] > 0: missing ← missing - 1
        need[c] ← need[c] - 1
        if right ≥ m:                      // window has m + 1 letters
            out ← s[right - m]             // letter going out
            need[out] ← need[out] + 1
            if need[out] > 0: missing ← missing + 1
        if missing = 0: return true
    return false`;

const inclusionCode = `function checkInclusion(p, s) {
  const need = new Map();
  for (const c of p) need.set(c, (need.get(c) ?? 0) + 1);
  let missing = p.length;
  const m = p.length;
  for (let right = 0; right < s.length; right++) {
    const c = s[right];
    if ((need.get(c) ?? 0) > 0) missing--;
    need.set(c, (need.get(c) ?? 0) - 1);
    if (right >= m) {
      const out = s[right - m];
      need.set(out, need.get(out) + 1);
      if (need.get(out) > 0) missing++;
    }
    if (missing === 0) return true;
  }
  return false;
}`;

const anagramsCode = `function findAnagrams(s, p) {
  const need = new Map();
  for (const c of p) need.set(c, (need.get(c) ?? 0) + 1);
  let missing = p.length;
  const m = p.length;
  const starts = [];
  for (let right = 0; right < s.length; right++) {
    const c = s[right];
    if ((need.get(c) ?? 0) > 0) missing--;
    need.set(c, (need.get(c) ?? 0) - 1);
    if (right >= m) {
      const out = s[right - m];
      need.set(out, need.get(out) + 1);
      if (need.get(out) > 0) missing++;
    }
    if (missing === 0) starts.push(right - m + 1);
  }
  return starts;
}`;

const replacementCode = `function characterReplacement(s, k) {
  const count = new Map();
  let left = 0;
  let maxCount = 0; // most common letter count seen in a window
  let best = 0;
  for (let right = 0; right < s.length; right++) {
    const c = s[right];
    count.set(c, (count.get(c) ?? 0) + 1);
    maxCount = Math.max(maxCount, count.get(c));
    while (right - left + 1 - maxCount > k) {
      count.set(s[left], count.get(s[left]) - 1); // too many to fix
      left++;
    }
    best = Math.max(best, right - left + 1);
  }
  return best;
}`;

export const frequencyWindowLesson: Lesson = {
  id: 'window-frequency-map',
  title: 'Windows with a frequency map',
  summary: 'Track how many of each letter the window holds, and how many are still missing.',
  minutes: 22,
  blocks: [
    {
      kind: 'callout',
      tone: 'story',
      title: 'Find the gene marker',
      text: "A biology lab scans a long DNA strand for a short marker. The catch: the marker's letters can show up **in any order**, as long as the counts match. `CAT`, `TCA` and `ACT` all count. Plagiarism checkers and word-game solvers ask the same question: does this text contain some rearrangement of my pattern?",
    },
    {
      kind: 'text',
      text: 'Small version: pattern `"CAT"`, strand `"GAGTCAG"`. Is there a stretch of 3 letters that uses exactly one `C`, one `A` and one `T`? Yes: `"TCA"` starts at index 3. A rearrangement of a word is called an **anagram** (or a **permutation** of it).',
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Brute force: sort every window',
      code: `function checkInclusion(p, s):
    key ← sort the letters of p
    m ← length of p
    for start from 0 to n - m:
        window ← s from start, length m
        if sort the letters of window = key:
            return true
    return false`,
    },
    {
      kind: 'text',
      text: 'That is **O(n · m log m)**: every window gets copied and sorted. Counting letters instead of sorting gets it to O(n·m). **Spot the waste.** The windows `"AGT"` and `"GTC"` share `GT`. Counting them again is the same waste as lesson 1, just with letters instead of numbers.',
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'A fixed window whose state is a count map',
      text: "Keep `need`: how many more of each letter the window still needs. Also keep one number, `missing`: the total letters still needed. A letter coming in that was needed lowers `missing`. A letter going out that becomes needed again raises it. When `missing` is `0`, the window is an anagram. Each slide is O(1).",
    },
    {
      kind: 'steps',
      title: 'Looking for any order of CAT',
      frames: [
        {
          cells: ['G', 'A', 'G', 'T', 'C', 'A', 'G'],
          vars: { need: 'C:1 A:1 T:1', missing: 3 },
          note: 'Count the pattern first. Three letters missing.',
        },
        {
          cells: ['G', 'A', 'G', 'T', 'C', 'A', 'G'],
          pointers: { L: 0, R: 2 },
          active: [0, 1, 2],
          vars: { need: 'C:1 A:0 T:1', missing: 2 },
          note: 'First window `GAG`. Only `A` was needed, so `missing` drops to 2. The `G`s are extras.',
        },
        {
          cells: ['G', 'A', 'G', 'T', 'C', 'A', 'G'],
          pointers: { L: 1, R: 3 },
          active: [1, 2, 3],
          done: [0],
          vars: { need: 'C:1 A:0 T:0', missing: 1 },
          note: '`T` comes in and was needed: `missing` 1. `G` goes out, it was an extra: no change.',
        },
        {
          cells: ['G', 'A', 'G', 'T', 'C', 'A', 'G'],
          pointers: { L: 2, R: 4 },
          active: [2, 3, 4],
          done: [0, 1],
          vars: { need: 'C:0 A:1 T:0', missing: 1 },
          note: '`C` comes in: `missing` 0 for a moment. But `A` goes out and is needed again: back to 1.',
        },
        {
          cells: ['G', 'A', 'G', 'T', 'C', 'A', 'G'],
          pointers: { L: 3, R: 5 },
          found: [3, 4, 5],
          done: [0, 1, 2],
          vars: { need: 'C:0 A:0 T:0', missing: 0 },
          note: '`A` comes in: `missing` 0. `G` goes out, an extra. `TCA` is an anagram of `CAT`. Return true.',
        },
      ],
    },
    { kind: 'code', lang: 'pseudo', title: 'Fixed window + need map', code: inclusionPseudo },
    { kind: 'code', lang: 'js', title: 'JavaScript', code: inclusionCode },
    {
      kind: 'compare',
      title: 'Does s contain an anagram of p?',
      rows: [
        { approach: 'Sort every window', time: 'O(n · m log m)', space: 'O(m)', note: 'Copies and sorts each window from scratch.' },
        { approach: 'Count every window', time: 'O(n · m)', space: 'O(alphabet)', note: 'No sorting, still recounts the overlap.' },
        { approach: 'Sliding need map', time: 'O(n + m)', space: 'O(alphabet)', note: 'One letter in, one letter out, one counter checked.' },
      ],
    },
    {
      kind: 'callout',
      tone: 'tip',
      title: 'Counts work for variable windows too',
      text: "A frequency map can also decide when a **variable** window is broken. Example (LeetCode 424): you may change up to `k` letters to make one long run of the same letter. A window can be fixed if `window length - count of its most common letter ≤ k`, because everything that is not the most common letter needs changing. Grow right, shrink while that rule fails.",
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Template: window + frequency map',
      code: `need ← counts of the pattern
missing ← length of the pattern
for right from 0 to n - 1:
    c ← s[right]                      // take c in
    if need[c] > 0: missing ← missing - 1
    need[c] ← need[c] - 1
    if the window is too long:        // give s[left] back
        need[s[left]] ← need[s[left]] + 1
        if need[s[left]] > 0: missing ← missing + 1
        left ← left + 1
    if missing = 0: record this window`,
    },
    {
      kind: 'callout',
      tone: 'trap',
      title: 'Check and update in the right order',
      text: "Letter coming in: check `need[c] > 0` **before** lowering it. Letter going out: raise it **first**, then check `need[c] > 0`. Swap the order and an extra copy (a second `A` when you only need one) gets counted as useful. In JavaScript, `map.get(c)` is `undefined` for letters not in the pattern, so write `map.get(c) ?? 0`.",
    },
  ],
  problems: [
    {
      id: 'sliding-window-permutation-in-string',
      title: 'Find the scrambled marker',
      difficulty: 'medium',
      leetcode: 567,
      pattern: 'Sliding window + frequency map',
      statement: "Given a short pattern `p` and a long strand `s`, return `true` if some stretch of `s` uses exactly the letters of `p` (same counts, any order). Otherwise return `false`.",
      examples: [
        { input: 'p = "ab", s = "eidbaooo"', output: 'true', explain: '`"ba"` starts at index 3.' },
        { input: 'p = "ab", s = "eidboaoo"', output: 'false' },
        { input: 'p = "CAT", s = "GAGTCAG"', output: 'true', explain: '`"TCA"`.' },
      ],
      constraints: ['1 ≤ p.length, s.length ≤ 10⁴', 'letters only'],
      hints: [
        'Any matching stretch has exactly `p.length` letters. So the window has a fixed size.',
        'Two strings are anagrams when every letter count matches.',
        'Keep a `need` map and a `missing` counter. Slide: one letter in, one out. Return true when `missing` hits 0.',
      ],
      approaches: [
        {
          name: 'Sort every window',
          idea: 'Anagrams look the same once sorted. Sort `p` once, then sort each window of the same length and compare. Simple but slow.',
          time: 'O(n · m log m)',
          space: 'O(m)',
        },
        {
          name: 'Compare count arrays',
          idea: 'Slide a 26-letter count array and compare it to the pattern counts after each step. Each compare is 26 checks, so this is fine for lowercase letters.',
          time: 'O(26 · n)',
          space: 'O(26)',
        },
        {
          name: 'Need map + missing counter',
          idea: 'Instead of comparing whole maps, track one number: how many pattern letters the window still lacks. It changes by at most 1 per letter in or out, and `0` means a match. Works for any alphabet.',
          pseudo: inclusionPseudo,
          code: inclusionCode,
          time: 'O(n + m)',
          space: 'O(alphabet)',
        },
      ],
      fn: 'checkInclusion',
      starter: `function checkInclusion(p, s) {
  // Slide a window of p.length letters and track letter counts.
  return false;
}`,
      solution: inclusionCode,
      tests: [
        { name: 'example', args: ['ab', 'eidbaooo'], expected: true },
        { name: 'letters split up', args: ['ab', 'eidboaoo'], expected: false },
        { name: 'DNA', args: ['CAT', 'GAGTCAG'], expected: true },
        { name: 'pattern longer than text', args: ['abc', 'ab'], expected: false },
        { name: 'same single letter', args: ['a', 'a'], expected: true },
        { name: 'repeated letter in pattern', args: ['aab', 'baab'], expected: true },
        { name: 'match at the end', args: ['adc', 'dcda'], expected: true },
        { name: 'right letters, wrong counts', args: ['hello', 'ooolleoooleh'], expected: false },
        { name: 'whole text reversed', args: ['xyz', 'zyx'], expected: true },
      ],
      takeaway: 'Anagram check = equal counts. Slide the counts, do not rebuild them.',
    },
    {
      id: 'sliding-window-find-all-anagrams',
      title: 'Every scrambled copy',
      difficulty: 'medium',
      leetcode: 438,
      pattern: 'Sliding window + frequency map',
      statement: "A spam filter looks for a banned word even when the spammer scrambles its letters. Given text `s` and the banned word `p`, return the **start index of every anagram** of `p` in `s`, in increasing order.",
      examples: [
        { input: 's = "cbaebabacd", p = "abc"', output: '[0, 6]', explain: '`"cba"` at 0 and `"bac"` at 6.' },
        { input: 's = "abab", p = "ab"', output: '[0, 1, 2]', explain: 'Windows may overlap.' },
      ],
      constraints: ['1 ≤ s.length, p.length ≤ 3·10⁴', 'lowercase letters'],
      hints: [
        'This is the previous problem, but you keep going after a match.',
        'Every window has length `p.length`. When `missing` is 0, the window starts at `right - p.length + 1`.',
        'Because `right` only grows, the starts come out already sorted.',
      ],
      approaches: [
        {
          name: 'Check every window',
          idea: 'For each start, count the letters of the next `m` characters and compare with `p`. Recounts the overlap each time.',
          time: 'O(n · m)',
          space: 'O(alphabet)',
        },
        {
          name: 'Sliding need map',
          idea: 'Same as the permutation check, but push the start index instead of returning. Each slide is O(1), and indexes are added left to right, so the list is sorted for free.',
          pseudo: `function findAnagrams(s, p):
    need ← count of each letter in p
    missing ← length of p
    m ← length of p
    starts ← empty list
    for right from 0 to n - 1:
        c ← s[right]
        if need[c] > 0: missing ← missing - 1
        need[c] ← need[c] - 1
        if right ≥ m:
            out ← s[right - m]
            need[out] ← need[out] + 1
            if need[out] > 0: missing ← missing + 1
        if missing = 0: append right - m + 1 to starts
    return starts`,
          code: anagramsCode,
          time: 'O(n + m)',
          space: 'O(alphabet)',
        },
      ],
      fn: 'findAnagrams',
      starter: `function findAnagrams(s, p) {
  // Collect the start of every window that is an anagram of p.
  return [];
}`,
      solution: anagramsCode,
      tests: [
        { name: 'example', args: ['cbaebabacd', 'abc'], expected: [0, 6] },
        { name: 'overlapping', args: ['abab', 'ab'], expected: [0, 1, 2] },
        { name: 'pattern longer', args: ['a', 'ab'], expected: [] },
        { name: 'every position', args: ['aaaa', 'a'], expected: [0, 1, 2, 3] },
        { name: 'no match', args: ['abc', 'd'], expected: [] },
        { name: 'double letter', args: ['baa', 'aa'], expected: [1] },
        { name: 'every other start', args: ['ababababab', 'aab'], expected: [0, 2, 4, 6] },
        { name: 'whole string', args: ['listen', 'silent'], expected: [0] },
      ],
      takeaway: 'Find-all is find-one that keeps going.',
    },
    {
      id: 'sliding-window-character-replacement',
      title: 'Fix up to k letters',
      difficulty: 'medium',
      leetcode: 424,
      pattern: 'Sliding window + frequency map (variable)',
      statement: "A DNA reader sometimes misreads letters. You may **change up to `k` letters** of `s` to any other uppercase letter. Return the length of the **longest run of one repeated letter** you can make.",
      examples: [
        { input: 's = "ABAB", k = 2', output: '4', explain: 'Change both `A`s to `B` (or both `B`s to `A`).' },
        { input: 's = "AABABBA", k = 1', output: '4', explain: 'Change the `A` at index 3: `"AABBBBA"` has `BBBB`.' },
      ],
      constraints: ['1 ≤ s.length ≤ 10⁵', 'uppercase letters only', '0 ≤ k ≤ s.length'],
      hints: [
        'In a window, which letters would you keep, and which would you change?',
        'Keep the most common letter. You need to change `length - maxCount` letters.',
        'Longest window where `length - maxCount ≤ k`. Keep a letter count map and shrink while the rule fails.',
        '`maxCount` never has to go down: a smaller one can never produce a longer answer.',
      ],
      approaches: [
        {
          name: 'Brute force',
          idea: 'For every substring, count its letters and check `length - maxCount ≤ k`. Correct but there are about n² substrings.',
          time: 'O(n²)',
          space: 'O(26)',
        },
        {
          name: 'One window per letter',
          idea: 'For each letter `A` to `Z`, find the longest window with at most `k` letters that are not that letter (like the “at most one zero” window in lesson 2). 26 easy passes.',
          time: 'O(26 · n)',
          space: 'O(1)',
        },
        {
          name: 'One window + maxCount',
          idea: 'Keep letter counts and `maxCount`, the biggest count seen. Shrink while `length - maxCount > k`. When a letter leaves, `maxCount` may be a bit too high, but that is safe: the answer only grows when some letter reaches a new, higher count.',
          pseudo: `function characterReplacement(s, k):
    count ← empty map                  // letter → count in window
    left ← 0
    maxCount ← 0
    best ← 0
    for right from 0 to n - 1:
        count[s[right]] ← count[s[right]] + 1
        maxCount ← max(maxCount, count[s[right]])
        while (right - left + 1) - maxCount > k:
            count[s[left]] ← count[s[left]] - 1
            left ← left + 1
        best ← max(best, right - left + 1)
    return best`,
          code: replacementCode,
          time: 'O(n)',
          space: 'O(26)',
        },
      ],
      fn: 'characterReplacement',
      starter: `function characterReplacement(s, k) {
  // Longest window where (length - most common count) <= k.
  return 0;
}`,
      solution: replacementCode,
      tests: [
        { name: 'example', args: ['ABAB', 2], expected: 4 },
        { name: 'one change', args: ['AABABBA', 1], expected: 4 },
        { name: 'already uniform', args: ['AAAA', 0], expected: 4 },
        { name: 'no changes allowed', args: ['ABCD', 0], expected: 1 },
        { name: 'single letter', args: ['A', 0], expected: 1 },
        { name: 'k covers everything', args: ['ABCDE', 10], expected: 5 },
        { name: 'two options tie', args: ['AABBBCC', 2], expected: 5 },
        { name: 'k = 0 longest run', args: ['ABBB', 0], expected: 3 },
        { name: 'fix both ends', args: ['BAAAB', 2], expected: 5 },
      ],
      takeaway: 'Window is fixable when `length - mostCommon ≤ k`.',
    },
  ],
  quiz: [
    {
      prompt: 'Pattern `"AB"`, `need = {A:0, B:1}`, `missing = 1`. Another `A` comes in. What happens?',
      options: [
        '`missing` becomes 0',
        '`need[A]` becomes -1 and `missing` stays 1',
        '`missing` becomes 2',
        'The window is a match',
      ],
      answer: 1,
      explanation: '`need[A]` was already 0, so this `A` is an extra. It goes negative and `missing` does not change.',
    },
    {
      prompt: 'Why use a `missing` counter instead of comparing two count maps after every slide?',
      options: [
        'Comparing maps gives wrong answers',
        'One number tells you “match or not” in O(1), for any alphabet size',
        'Maps cannot hold letters',
        'It uses less code',
      ],
      answer: 1,
      explanation: 'Comparing maps is correct, but it costs the alphabet size each step. The counter changes by at most 1 per letter.',
    },
    {
      prompt: 'In LeetCode 424, a window `"AABAB"` with `k = 1`. Is it fixable?',
      options: ['Yes, change one letter', 'No: length 5, most common 3, needs 2 changes', 'Yes, it is already uniform', 'Only if `k = 0`'],
      answer: 1,
      explanation: '`A` appears 3 times. The other 2 letters must change, and `2 > 1`.',
    },
  ],
  takeaways: [
    '“Anagram” or “any order” means compare letter counts, not letters.',
    '`need` map + `missing` counter tells you “match” in O(1) per slide.',
    'A count map can also judge a variable window: shrink while the rule fails.',
  ],
};
