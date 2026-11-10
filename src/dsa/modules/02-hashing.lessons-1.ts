import type { Lesson } from '../types';

// Module 2, lessons 1-2: lookup & complements, counting.

export const lookupLesson: Lesson = {
  id: 'lookup-complements',
  title: 'Lookup and complements',
  summary: 'Remember what you have seen, so "is the missing piece here?" costs one step.',
  minutes: 20,
  blocks: [
    {
      kind: 'callout',
      tone: 'story',
      title: 'The cashier and the gift card',
      text: "A customer has a gift card worth exactly 14 and wants to spend it on exactly two items. The shelf prices are 4, 9, 1, 6, 5. A new cashier tries every pair. An old cashier looks at each item and asks one question: *is the item that costs the rest on the shelf?* That one question is this whole lesson.",
    },
    {
      kind: 'text',
      text: "**The problem (Two Sum).** You get an array `nums` and a number `target`. Exactly one pair of different positions adds up to `target`. Return those two indexes. For `nums = [4, 9, 1, 6, 5]` and `target = 14`, the answer is `[1, 4]`, because `9 + 5 = 14`.",
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Brute force: try every pair',
      code: `function twoSum(nums, target):
    for i from 0 to n - 1:
        for j from i + 1 to n - 1:
            if nums[i] + nums[j] = target:
                return [i, j]
    return []`,
    },
    {
      kind: 'text',
      text: "This works, and for 5 items it is instant. But it checks about n²/2 pairs. With 100,000 prices that is 5 billion checks. **Spot the waste:** when you stand on `9`, you only need to know one thing: *have I already seen a 5?* The brute force answers that by walking the whole array again. You walked past the 5 already and forgot it.",
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'Remember, then look up',
      text: "Keep a **hash map** of everything you have walked past: value → index. At each number `x`, the partner you need is `target - x` (its **complement**, the piece that completes it). Asking a hash map 'do you have this key?' takes about one step, not n steps.",
    },
    {
      kind: 'diagram',
      title: 'What a hash map does under the hood',
      art: `  key "kiwi" --hash()--> 3

  index | what is stored there (a "bucket")
  ------+---------------------------------
    0   |
    1   | "fig" → 1
    2   |
    3   | "kiwi" → 9    "plum" → 4
    4   | "apple" → 3`,
      caption: "A hash map is an array of buckets. A **hash function** turns the key into a bucket number, so the map jumps straight to the right bucket instead of searching. Two keys can land in the same bucket (a **collision**, like kiwi and plum), but buckets stay tiny on average, so get, set and has cost **O(1) on average**.",
    },
    {
      kind: 'list',
      items: [
        "**`Map`** is the tool for DSA in JS: any key type, `map.get(k)`, `map.set(k, v)`, `map.has(k)`, `map.size`, and it remembers insertion order.",
        "**Plain objects** `{}` turn every key into a string: `obj[1]` and `obj['1']` are the same slot, and `Object.keys` hands you back strings. Fine for letters, risky for numbers.",
        "**`Set`** is a map with keys only: `set.add(x)`, `set.has(x)`. Use it when you only care *whether* you saw something.",
        "Numbers and strings are compared **by value**. Arrays and objects are compared **by reference**: `map.set([1, 2], 'a')` then `map.get([1, 2])` is `undefined`, because the second `[1, 2]` is a different array. Build a string key instead: `[1, 2].join(',')`.",
        "Counting idiom: `map.set(k, (map.get(k) ?? 0) + 1)`. The `?? 0` turns a missing key (`undefined`) into 0.",
      ],
    },
    {
      kind: 'steps',
      title: 'Two Sum with a map, target = 14',
      frames: [
        {
          cells: [4, 9, 1, 6, 5],
          pointers: { i: 0 },
          active: [0],
          vars: { need: '14 - 4 = 10', seen: '{}' },
          note: "At 4 we need 10. The map is empty, so no. Store 4 → 0.",
        },
        {
          cells: [4, 9, 1, 6, 5],
          pointers: { i: 1 },
          active: [1],
          done: [0],
          vars: { need: '14 - 9 = 5', seen: '{4:0}' },
          note: "At 9 we need 5. Not in the map. Store 9 → 1.",
        },
        {
          cells: [4, 9, 1, 6, 5],
          pointers: { i: 2 },
          active: [2],
          done: [0, 1],
          vars: { need: '14 - 1 = 13', seen: '{4:0, 9:1}' },
          note: "At 1 we need 13. No. Store 1 → 2.",
        },
        {
          cells: [4, 9, 1, 6, 5],
          pointers: { i: 3 },
          active: [3],
          done: [0, 1, 2],
          vars: { need: '14 - 6 = 8', seen: '{4:0, 9:1, 1:2}' },
          note: "At 6 we need 8. No. Store 6 → 3.",
        },
        {
          cells: [4, 9, 1, 6, 5],
          pointers: { i: 4 },
          active: [4],
          found: [1, 4],
          vars: { need: '14 - 5 = 9', seen: '{4:0, 9:1, 1:2, 6:3}' },
          note: "At 5 we need 9, and the map says 9 lives at index 1. Answer `[1, 4]`. One pass, one lookup per item.",
        },
      ],
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'One pass with a map',
      code: `function twoSum(nums, target):
    seen ← empty map                  // value → index
    for i from 0 to n - 1:
        need ← target - nums[i]
        if need in seen:
            return [seen[need], i]
        seen[nums[i]] ← i             // store AFTER checking
    return []`,
    },
    {
      kind: 'code',
      lang: 'js',
      code: `function twoSum(nums, target) {
  const seen = new Map(); // value -> index
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    if (seen.has(need)) return [seen.get(need), i];
    seen.set(nums[i], i);
  }
  return [];
}`,
    },
    {
      kind: 'compare',
      title: 'Two Sum, three ways',
      rows: [
        { approach: 'Try every pair', time: 'O(n²)', space: 'O(1)', note: 'Fine for n ≤ 1000, too slow at 10⁵.' },
        { approach: 'Sort, then two pointers', time: 'O(n log n)', space: 'O(n)', note: 'Works, but sorting scrambles indexes, so you must carry them along. Two pointers is module 3.' },
        { approach: 'Hash map, one pass', time: 'O(n)', space: 'O(n)', note: 'Trade memory for speed: n map entries buy you one-step lookups.' },
      ],
    },
    {
      kind: 'text',
      text: "**The pattern: complement lookup.** Reach for it when the problem says *pair*, *two items that add up / differ by / combine to* something, or *have I seen the partner of this before?* Walk once, ask the map for the partner, then store yourself.",
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Template: complement lookup',
      code: `seen ← empty map
for each x in items:
    partner ← whatever completes x       // target - x, x - k, (60 - x % 60) % 60 ...
    if partner in seen:
        use seen[partner]                 // found a pair, or add to a count
    record x in seen                      // index, or count + 1`,
    },
    {
      kind: 'callout',
      tone: 'trap',
      title: 'Two classic bugs',
      text: "**1. Store after you check.** If you store `x` first, then for `nums = [7]`, `target = 14` you find 7 'in the map' and pair the number with itself. **2. Index 0 is falsy.** `if (seen.get(need))` skips a partner that lives at index 0. Ask `seen.has(need)` instead.",
    },
  ],
  problems: [
    {
      id: 'hashing-two-sum',
      title: 'Two Sum',
      difficulty: 'easy',
      leetcode: 1,
      pattern: 'Complement lookup',
      statement: "A gift card is worth exactly `target`. Prices are in `nums`. Exactly one pair of **different** items costs exactly `target` in total. Return their indexes `[i, j]` with `i < j`.",
      examples: [
        { input: 'nums = [4, 9, 1, 6, 5], target = 14', output: '[1, 4]', explain: '9 + 5 = 14.' },
        { input: 'nums = [3, 3], target = 6', output: '[0, 1]', explain: 'Two different items can have the same price.' },
      ],
      constraints: ['2 ≤ n ≤ 10⁴', '-10⁹ ≤ nums[i], target ≤ 10⁹', 'exactly one answer exists'],
      hints: [
        "For a number `x`, which exact value would complete the pair?",
        "You need a fast way to ask 'have I already seen that value, and where?'",
        "Map value → index. At each `x`, look up `target - x` first, then store `x`.",
      ],
      approaches: [
        {
          name: 'Brute force',
          idea: 'Try every pair (i, j). It is correct because it checks every possibility, but it does about n²/2 checks.',
          time: 'O(n²)',
          space: 'O(1)',
        },
        {
          name: 'Hash map, one pass',
          idea: "The partner of `x` is always `target - x`. Keep a map of values you have passed, so the partner check is one lookup. Checking before storing means a number never pairs with itself.",
          pseudo: `function twoSum(nums, target):
    seen ← empty map            // value → index
    for i from 0 to n - 1:
        need ← target - nums[i]
        if need in seen:
            return [seen[need], i]
        seen[nums[i]] ← i
    return []`,
          code: `function twoSum(nums, target) {
  const seen = new Map();
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    if (seen.has(need)) return [seen.get(need), i];
    seen.set(nums[i], i);
  }
  return [];
}`,
          time: 'O(n)',
          space: 'O(n)',
        },
      ],
      fn: 'twoSum',
      starter: `function twoSum(nums, target) {
  // return [i, j] with nums[i] + nums[j] === target and i < j
  return [];
}`,
      solution: `function twoSum(nums, target) {
  const seen = new Map();
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    if (seen.has(need)) return [seen.get(need), i];
    seen.set(nums[i], i);
  }
  return [];
}`,
      tests: [
        { name: 'lesson example', args: [[4, 9, 1, 6, 5], 14], expected: [1, 4] },
        { name: 'first two', args: [[2, 7, 11, 15], 9], expected: [0, 1] },
        { name: 'same value twice', args: [[3, 3], 6], expected: [0, 1] },
        { name: 'do not pair with yourself', args: [[3, 2, 4], 6], expected: [1, 2] },
        { name: 'negatives', args: [[-3, 4, 3, 90], 0], expected: [0, 2] },
        { name: 'partner at index 0', args: [[0, 4, 3, 0], 0], expected: [0, 3] },
        { name: 'first and last', args: [[5, 1, 2, 8, 9, 20], 25], expected: [0, 5] },
        { name: 'big numbers', args: [[1000000000, -999999999, 7], 1], expected: [0, 1] },
      ],
      takeaway: "Pair problems become one pass when you store what you've seen and look up the complement.",
    },
    {
      id: 'hashing-song-pairs',
      title: 'Songs that end on the minute',
      difficulty: 'medium',
      leetcode: 1010,
      pattern: 'Complement lookup (counting)',
      statement: "A radio DJ wants to play two songs back to back so the pair ends exactly on a whole minute. `time[i]` is the length of song `i` in seconds. Count the pairs `i < j` where `time[i] + time[j]` is divisible by 60.",
      examples: [
        { input: 'time = [30, 20, 150, 100, 40]', output: '3', explain: '(30, 150), (20, 100) and (20, 40) total 180, 120 and 60 seconds.' },
        { input: 'time = [60, 60, 60]', output: '3', explain: 'Every pair totals 120 seconds.' },
      ],
      constraints: ['1 ≤ n ≤ 6 × 10⁴', '1 ≤ time[i] ≤ 500'],
      hints: [
        "Only the leftover seconds matter: 150 behaves exactly like 30. Look at `t % 60`.",
        "A song with remainder `r` pairs with any earlier song whose remainder completes it to 60.",
        "Keep a count of each remainder seen so far. For remainder `r` you need `(60 - r) % 60`. The extra `% 60` makes remainder 0 pair with 0, not 60.",
      ],
      approaches: [
        {
          name: 'Check every pair',
          idea: 'Test `(a + b) % 60 === 0` for every pair. Correct, but about n²/2 checks, which is 1.8 billion at n = 60,000.',
          time: 'O(n²)',
          space: 'O(1)',
        },
        {
          name: 'Count remainders',
          idea: "Two songs fit when their remainders add to 60 (or are both 0). So at each song, every earlier song with the matching remainder makes one new pair. A count per remainder gives you all of them in one lookup.",
          pseudo: `function numPairsDivisibleBy60(time):
    count ← empty map                // remainder → how many songs so far
    pairs ← 0
    for each t in time:
        r ← t mod 60
        need ← (60 - r) mod 60
        pairs ← pairs + (count[need] or 0)
        count[r] ← (count[r] or 0) + 1
    return pairs`,
          code: `function numPairsDivisibleBy60(time) {
  const count = new Map();
  let pairs = 0;
  for (const t of time) {
    const r = t % 60;
    const need = (60 - r) % 60;
    pairs += count.get(need) ?? 0;
    count.set(r, (count.get(r) ?? 0) + 1);
  }
  return pairs;
}`,
          time: 'O(n)',
          space: 'O(60) = O(1)',
        },
      ],
      fn: 'numPairsDivisibleBy60',
      starter: `function numPairsDivisibleBy60(time) {
  // count pairs i < j with (time[i] + time[j]) % 60 === 0
  return 0;
}`,
      solution: `function numPairsDivisibleBy60(time) {
  const count = new Map();
  let pairs = 0;
  for (const t of time) {
    const r = t % 60;
    const need = (60 - r) % 60;
    pairs += count.get(need) ?? 0;
    count.set(r, (count.get(r) ?? 0) + 1);
  }
  return pairs;
}`,
      tests: [
        { name: 'example', args: [[30, 20, 150, 100, 40]], expected: 3 },
        { name: 'all whole minutes', args: [[60, 60, 60]], expected: 3 },
        { name: 'one song', args: [[10]], expected: 0 },
        { name: 'all halves', args: [[30, 30, 30, 30]], expected: 6 },
        { name: 'two matches each way', args: [[45, 15, 75, 105]], expected: 4 },
        { name: 'no pairs', args: [[1, 2, 3, 4]], expected: 0 },
        { name: 'mixed', args: [[1, 59, 2, 58, 120]], expected: 2 },
        { name: 'remainder 0 with 0', args: [[60, 120, 180, 30]], expected: 3 },
      ],
      takeaway: "When only a remainder matters, count remainders: the 'complement' is (60 - r) % 60.",
    },
    {
      id: 'hashing-pairs-diff-k',
      title: 'Pairs with difference k',
      difficulty: 'easy',
      leetcode: 2006,
      pattern: 'Complement lookup (counting)',
      statement: "A shop keeps a list of prices `nums`. Count the pairs `i < j` where the two prices differ by exactly `k`, that is `|nums[i] - nums[j]| = k`. You solved this in module 1 with two loops, because `n` was tiny. Now do it in one pass, as if `n` were 10⁵.",
      examples: [
        { input: 'nums = [1, 2, 2, 1], k = 1', output: '4', explain: 'Each 1 pairs with each 2: 2 × 2 = 4 pairs.' },
        { input: 'nums = [3, 2, 1, 5, 4], k = 2', output: '3', explain: '(3, 1), (3, 5) and (2, 4).' },
      ],
      constraints: ['1 ≤ n ≤ 10⁵', '-100 ≤ nums[i] ≤ 100', '1 ≤ k ≤ 99'],
      hints: [
        "For a number `x`, which two values would be exactly `k` away?",
        "`x - k` and `x + k`. How many of each have you already seen?",
        "Keep a count map. At each `x` add `count[x - k] + count[x + k]`, then count `x`.",
      ],
      approaches: [
        {
          name: 'Check every pair',
          idea: 'Compare every pair with `Math.abs`. Correct and fine for n = 200.',
          time: 'O(n²)',
          space: 'O(1)',
        },
        {
          name: 'Count map, one pass',
          idea: "A partner of `x` is either `x - k` or `x + k`. Every earlier copy of those values forms one new pair, so add their counts. Since k ≥ 1, the two partners are different numbers and nothing is counted twice.",
          pseudo: `function countKDifference(nums, k):
    count ← empty map
    pairs ← 0
    for each x in nums:
        pairs ← pairs + (count[x - k] or 0) + (count[x + k] or 0)
        count[x] ← (count[x] or 0) + 1
    return pairs`,
          code: `function countKDifference(nums, k) {
  const count = new Map();
  let pairs = 0;
  for (const x of nums) {
    pairs += (count.get(x - k) ?? 0) + (count.get(x + k) ?? 0);
    count.set(x, (count.get(x) ?? 0) + 1);
  }
  return pairs;
}`,
          time: 'O(n)',
          space: 'O(n)',
        },
      ],
      fn: 'countKDifference',
      starter: `function countKDifference(nums, k) {
  // count pairs i < j with |nums[i] - nums[j]| === k
  return 0;
}`,
      solution: `function countKDifference(nums, k) {
  const count = new Map();
  let pairs = 0;
  for (const x of nums) {
    pairs += (count.get(x - k) ?? 0) + (count.get(x + k) ?? 0);
    count.set(x, (count.get(x) ?? 0) + 1);
  }
  return pairs;
}`,
      tests: [
        { name: 'example', args: [[1, 2, 2, 1], 1], expected: 4 },
        { name: 'no pairs', args: [[1, 3], 3], expected: 0 },
        { name: 'both directions', args: [[3, 2, 1, 5, 4], 2], expected: 3 },
        { name: 'one element', args: [[7], 1], expected: 0 },
        { name: 'all same', args: [[5, 5, 5], 1], expected: 0 },
        { name: 'chain', args: [[1, 1, 2, 2, 3], 1], expected: 6 },
        { name: 'negatives', args: [[-1, 1, -3], 2], expected: 2 },
      ],
      takeaway: "A pair can be 'above' or 'below' you: look up both x - k and x + k.",
    },
  ],
  quiz: [
    {
      prompt: "Why is `map.has(key)` about O(1) on average?",
      options: [
        'The map keeps its keys sorted and uses binary search.',
        'A hash function turns the key into a bucket number, and buckets hold very few keys on average.',
        'JavaScript caches the last key you asked for.',
      ],
      answer: 1,
      explanation: "The hash jumps straight to one bucket. Collisions happen, but buckets stay tiny, so the work does not grow with n on average.",
    },
    {
      prompt: "You run `const m = new Map(); m.set([1, 2], 'x');`. What is `m.get([1, 2])`?",
      options: ["'x'", 'undefined', 'It throws an error'],
      answer: 1,
      explanation: "Arrays are compared by reference. The second `[1, 2]` is a new array, so it is a different key. Use a string key like `'1,2'`.",
    },
    {
      prompt: "In Two Sum, what goes wrong if you store `nums[i]` in the map **before** checking for `target - nums[i]`?",
      options: [
        'Nothing, the order does not matter.',
        'A number can pair with itself, e.g. `[7]` with target 14.',
        'The loop becomes O(n²).',
      ],
      answer: 1,
      explanation: "The map would already hold 7 when you look for 7. Check first, then store.",
    },
  ],
  takeaways: [
    "A hash map gives about O(1) get/set/has, so it turns 'search the array again' into one lookup.",
    "Complement lookup: walk once, ask the map for the partner, then store yourself.",
    "In JS use `Map`/`Set`; build string keys for arrays; use `?? 0` and `has()` to dodge undefined and index 0.",
  ],
};

export const countingLesson: Lesson = {
  id: 'counting',
  title: 'Counting with a frequency map',
  summary: 'When only "how many of each" matters, count once and compare counts.',
  minutes: 20,
  blocks: [
    {
      kind: 'callout',
      tone: 'story',
      title: 'The word game check',
      text: "In a word game you hold the tiles `L I S T E N`. Your friend plays `SILENT` and says it uses exactly your tiles. The game has to check that fast, for millions of players. Order does not matter. Only *how many of each letter* matters.",
    },
    {
      kind: 'text',
      text: "**The problem (Valid Anagram).** Two strings `s` and `t` are **anagrams** if one is a rearrangement of the other: same letters, same number of each. `'listen'` and `'silent'` are anagrams. `'rat'` and `'car'` are not.",
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Brute force: cross letters off',
      code: `function isAnagram(s, t):
    if length of s ≠ length of t:
        return false
    remaining ← list of the letters of t
    for each ch in s:
        if ch not in remaining:
            return false
        remove one ch from remaining      // searching: O(n) each time
    return true`,
    },
    {
      kind: 'text',
      text: "It works, but each 'find and remove' scans the list, so it is O(n²). Sorting both strings and comparing is better, O(n log n). **Spot the waste:** both ideas care about *where* letters are, but the question only asks *how many*. Positions are noise.",
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'Count, do not search',
      text: "Build a **frequency map**: letter → how many times it appears. Add 1 for every letter of `s`, subtract 1 for every letter of `t`. If every count ends at 0, the strings are anagrams. If a count ever drops below 0, `t` used a letter `s` did not have.",
    },
    {
      kind: 'steps',
      title: "s = 'tool', t = 'loot'",
      frames: [
        {
          cells: ['l', 'o', 'o', 't'],
          vars: { count: '{t:1, o:2, l:1}' },
          note: "First pass over `s = 'tool'` builds the counts. Now walk `t`.",
        },
        {
          cells: ['l', 'o', 'o', 't'],
          pointers: { i: 0 },
          active: [0],
          vars: { count: '{t:1, o:2, l:0}' },
          note: "`l`: count goes 1 → 0. Still not negative, keep going.",
        },
        {
          cells: ['l', 'o', 'o', 't'],
          pointers: { i: 1 },
          active: [1],
          done: [0],
          vars: { count: '{t:1, o:1, l:0}' },
          note: "`o`: 2 → 1.",
        },
        {
          cells: ['l', 'o', 'o', 't'],
          pointers: { i: 2 },
          active: [2],
          done: [0, 1],
          vars: { count: '{t:1, o:0, l:0}' },
          note: "`o` again: 1 → 0.",
        },
        {
          cells: ['l', 'o', 'o', 't'],
          pointers: { i: 3 },
          active: [3],
          done: [0, 1, 2],
          vars: { count: '{t:0, o:0, l:0}' },
          note: "`t`: 1 → 0.",
        },
        {
          cells: ['l', 'o', 'o', 't'],
          found: [0, 1, 2, 3],
          vars: { count: '{t:0, o:0, l:0}', answer: 'true' },
          note: "Same length and no count went below 0, so every count is 0. Anagrams.",
        },
      ],
    },
    {
      kind: 'code',
      lang: 'pseudo',
      code: `function isAnagram(s, t):
    if length of s ≠ length of t:
        return false
    count ← empty map                   // letter → count
    for each ch in s:
        count[ch] ← (count[ch] or 0) + 1
    for each ch in t:
        count[ch] ← (count[ch] or 0) - 1
        if count[ch] < 0:
            return false                // t has an extra ch
    return true`,
    },
    {
      kind: 'code',
      lang: 'js',
      code: `function isAnagram(s, t) {
  if (s.length !== t.length) return false;
  const count = new Map();
  for (const ch of s) count.set(ch, (count.get(ch) ?? 0) + 1);
  for (const ch of t) {
    const left = (count.get(ch) ?? 0) - 1;
    if (left < 0) return false;
    count.set(ch, left);
  }
  return true;
}`,
    },
    {
      kind: 'callout',
      tone: 'tip',
      title: 'Only lowercase letters? Use an array',
      text: "If the input is only `a`-`z`, an array of 26 zeros is a tiny, fast frequency map: `count[ch.charCodeAt(0) - 97]++`. Same idea, no hashing.",
    },
    {
      kind: 'compare',
      title: 'Valid Anagram, three ways',
      rows: [
        { approach: 'Cross letters off', time: 'O(n²)', space: 'O(n)', note: 'Searches the list for every letter.' },
        { approach: 'Sort both, compare', time: 'O(n log n)', space: 'O(n)', note: 'Short to write: `[...s].sort().join(\'\')`. Good enough often.' },
        { approach: 'Frequency map', time: 'O(n)', space: 'O(1) for 26 letters', note: 'One pass each. The map never holds more than the alphabet.' },
      ],
    },
    {
      kind: 'text',
      text: "**Counts unlock 'top k' too.** Spotify Wrapped wants your 2 most played artists. Step 1 is the same frequency map. Step 2: you could sort the artists by count (O(n log n)), but there is a neater trick. A count can never be bigger than n, so make **buckets by count**: `bucket[c]` holds every value seen exactly `c` times. Then read buckets from the highest count down. That is **bucket sort**, and it is O(n). (A heap also works; heaps are module 12.)",
    },
    {
      kind: 'diagram',
      title: 'Top 2 of [1, 1, 1, 2, 2, 3, 4] with buckets',
      art: `counts:  1 → 3    2 → 2    3 → 1    4 → 1

bucket[count] = values seen that many times
  count 7 |
   ...    |
  count 3 | 1        <- read from the top down
  count 2 | 2
  count 1 | 3, 4
  count 0 |

take 1, then 2  →  k = 2 done: [1, 2]`,
      caption: "Buckets are indexed by count, from 0 to n. Walking them top-down lists values from most to least frequent, with no sorting.",
    },
    {
      kind: 'text',
      text: "**The pattern: frequency map.** Reach for it when the problem says *anagram*, *same letters*, *most / least frequent*, *appears more than*, *unique*, or when order inside the input does not matter, only amounts.",
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Template: count, then use the counts',
      code: `count ← empty map
for each x in items:
    count[x] ← (count[x] or 0) + 1
// now answer from count: compare maps, find count = 1,
// find the biggest counts with buckets, ...`,
    },
    {
      kind: 'callout',
      tone: 'trap',
      title: 'Counting traps in JS',
      text: "**1.** With a plain object, `count[x]++` on a missing key gives `NaN` (undefined + 1). Write `(count.get(x) ?? 0) + 1`. **2.** Object keys are strings: count numbers in `{}` and `Object.keys(count)` returns `'1'`, `'2'`, not `1`, `2`, so a 'top k' answer comes back as strings. A `Map` keeps the real numbers.",
    },
  ],
  problems: [
    {
      id: 'hashing-valid-anagram',
      title: 'Valid Anagram',
      difficulty: 'easy',
      leetcode: 242,
      pattern: 'Frequency map',
      statement: "A word game checks whether a played word uses exactly the player's tiles. Return `true` if `t` is a rearrangement of `s` (same letters, same counts), otherwise `false`.",
      examples: [
        { input: "s = 'listen', t = 'silent'", output: 'true' },
        { input: "s = 'rat', t = 'car'", output: 'false', explain: "`t` has a `c`, `s` has a `t`." },
      ],
      constraints: ['0 ≤ s.length, t.length ≤ 5 × 10⁴', 'lowercase English letters'],
      hints: [
        "Does the order of letters matter at all?",
        "If the lengths differ, you can stop right away.",
        "Count each letter of `s` up, each letter of `t` down. A count below zero means `false`.",
      ],
      approaches: [
        {
          name: 'Sort and compare',
          idea: 'Anagrams become the same string once their letters are sorted. Short, but sorting costs O(n log n).',
          time: 'O(n log n)',
          space: 'O(n)',
        },
        {
          name: 'Frequency map',
          idea: "Two strings are anagrams exactly when every letter has the same count in both. Count up for `s`, down for `t`; with equal lengths, no count going negative means they all end at zero.",
          pseudo: `function isAnagram(s, t):
    if length of s ≠ length of t:
        return false
    count ← empty map
    for each ch in s:
        count[ch] ← (count[ch] or 0) + 1
    for each ch in t:
        count[ch] ← (count[ch] or 0) - 1
        if count[ch] < 0:
            return false
    return true`,
          code: `function isAnagram(s, t) {
  if (s.length !== t.length) return false;
  const count = new Map();
  for (const ch of s) count.set(ch, (count.get(ch) ?? 0) + 1);
  for (const ch of t) {
    const left = (count.get(ch) ?? 0) - 1;
    if (left < 0) return false;
    count.set(ch, left);
  }
  return true;
}`,
          time: 'O(n)',
          space: 'O(1) (26 letters)',
        },
      ],
      fn: 'isAnagram',
      starter: `function isAnagram(s, t) {
  // true if t uses exactly the same letters as s
  return false;
}`,
      solution: `function isAnagram(s, t) {
  if (s.length !== t.length) return false;
  const count = new Map();
  for (const ch of s) count.set(ch, (count.get(ch) ?? 0) + 1);
  for (const ch of t) {
    const left = (count.get(ch) ?? 0) - 1;
    if (left < 0) return false;
    count.set(ch, left);
  }
  return true;
}`,
      tests: [
        { name: 'anagram', args: ['listen', 'silent'], expected: true },
        { name: 'different letters', args: ['rat', 'car'], expected: false },
        { name: 'different lengths', args: ['a', 'ab'], expected: false },
        { name: 'both empty', args: ['', ''], expected: true },
        { name: 'same letters, other counts', args: ['aab', 'abb'], expected: false },
        { name: 'single letter', args: ['a', 'a'], expected: true },
        { name: 'longer anagram', args: ['anagram', 'nagaram'], expected: true },
      ],
      takeaway: "If order doesn't matter, compare counts, not positions.",
    },
    {
      id: 'hashing-first-unique-char',
      title: 'First unique character',
      difficulty: 'easy',
      leetcode: 387,
      pattern: 'Frequency map',
      statement: "A chat app highlights the first letter in a username that appears only once. Return the index of the first character in `s` that does not repeat anywhere in `s`, or `-1` if every character repeats.",
      examples: [
        { input: "s = 'leetcode'", output: '0', explain: "`l` appears once." },
        { input: "s = 'loveleetcode'", output: '2', explain: "`l` and `o` repeat; `v` at index 2 does not." },
        { input: "s = 'aabb'", output: '-1' },
      ],
      constraints: ['1 ≤ s.length ≤ 10⁵', 'lowercase English letters'],
      hints: [
        "To know a letter is unique you must have seen the whole string. So one pass is not enough to decide early.",
        "Do two passes: the first one counts, the second one finds.",
        "In the second pass, return the first index whose letter has count 1.",
      ],
      approaches: [
        {
          name: 'Check each letter against all others',
          idea: 'For each position, scan the whole string for another copy. Correct, but O(n²).',
          time: 'O(n²)',
          space: 'O(1)',
        },
        {
          name: 'Count, then scan',
          idea: "After one counting pass you know every letter's total. A second pass in the original order finds the first letter whose total is 1, so 'first' is respected.",
          pseudo: `function firstUniqChar(s):
    count ← empty map
    for each ch in s:
        count[ch] ← (count[ch] or 0) + 1
    for i from 0 to n - 1:
        if count[s[i]] = 1:
            return i
    return -1`,
          code: `function firstUniqChar(s) {
  const count = new Map();
  for (const ch of s) count.set(ch, (count.get(ch) ?? 0) + 1);
  for (let i = 0; i < s.length; i++) {
    if (count.get(s[i]) === 1) return i;
  }
  return -1;
}`,
          time: 'O(n)',
          space: 'O(1) (26 letters)',
        },
      ],
      fn: 'firstUniqChar',
      starter: `function firstUniqChar(s) {
  // index of the first character that appears exactly once, or -1
  return -1;
}`,
      solution: `function firstUniqChar(s) {
  const count = new Map();
  for (const ch of s) count.set(ch, (count.get(ch) ?? 0) + 1);
  for (let i = 0; i < s.length; i++) {
    if (count.get(s[i]) === 1) return i;
  }
  return -1;
}`,
      tests: [
        { name: 'first letter', args: ['leetcode'], expected: 0 },
        { name: 'middle', args: ['loveleetcode'], expected: 2 },
        { name: 'none unique', args: ['aabb'], expected: -1 },
        { name: 'one letter', args: ['z'], expected: 0 },
        { name: 'last letter', args: ['aabbc'], expected: 4 },
        { name: 'all same', args: ['kkkk'], expected: -1 },
        { name: 'repeat comes later', args: ['abca'], expected: 1 },
      ],
      takeaway: "Two passes are fine: count everything first, then answer in the original order.",
    },
    {
      id: 'hashing-top-k-frequent',
      title: 'Top k frequent elements',
      difficulty: 'medium',
      leetcode: 347,
      pattern: 'Frequency map + bucket sort',
      statement: "A music app wants your `k` most played song ids for your year-in-review. `nums` is the play log (one id per play). Return the `k` ids played most often, in any order. The answer is guaranteed to be unique.",
      examples: [
        { input: 'nums = [1, 1, 1, 2, 2, 3], k = 2', output: '[1, 2]' },
        { input: 'nums = [4, 4, -1, -1, -1, 2], k = 1', output: '[-1]' },
      ],
      constraints: ['1 ≤ n ≤ 10⁵', 'k is between 1 and the number of distinct ids', 'the answer is unique'],
      hints: [
        "Step one is obvious: how many times was each id played?",
        "Sorting the ids by count works, but costs O(n log n). Can a count ever be bigger than n?",
        "Make `n + 1` buckets where `bucket[c]` lists the ids played exactly `c` times. Read buckets from `n` down to 1 until you have `k` ids.",
      ],
      approaches: [
        {
          name: 'Count, then sort by count',
          idea: 'Build the frequency map, sort its entries by count descending, take the first k. Correct and simple, but the sort costs O(n log n).',
          time: 'O(n log n)',
          space: 'O(n)',
        },
        {
          name: 'Count, then a heap of size k',
          idea: 'Keep only the k best so far in a min-heap: O(n log k). Covered in module 12.',
          time: 'O(n log k)',
          space: 'O(n)',
        },
        {
          name: 'Count + bucket sort',
          idea: "A count is always between 1 and n, so counts can be array indexes. Put each id into `bucket[count]`, then walk from the biggest count down: you meet ids from most to least played, with no sorting.",
          pseudo: `function topKFrequent(nums, k):
    count ← empty map
    for each x in nums:
        count[x] ← (count[x] or 0) + 1
    bucket ← list of n + 1 empty lists
    for each (x, c) in count:
        append x to bucket[c]
    result ← empty list
    for c from n down to 1:
        for each x in bucket[c]:
            append x to result
            if length of result = k:
                return result
    return result`,
          code: `function topKFrequent(nums, k) {
  const count = new Map();
  for (const x of nums) count.set(x, (count.get(x) ?? 0) + 1);
  const bucket = Array.from({ length: nums.length + 1 }, () => []);
  for (const [x, c] of count) bucket[c].push(x);
  const result = [];
  for (let c = nums.length; c >= 1; c--) {
    for (const x of bucket[c]) {
      result.push(x);
      if (result.length === k) return result;
    }
  }
  return result;
}`,
          time: 'O(n)',
          space: 'O(n)',
        },
      ],
      fn: 'topKFrequent',
      starter: `function topKFrequent(nums, k) {
  // return the k most frequent values, any order
  return [];
}`,
      solution: `function topKFrequent(nums, k) {
  const count = new Map();
  for (const x of nums) count.set(x, (count.get(x) ?? 0) + 1);
  const bucket = Array.from({ length: nums.length + 1 }, () => []);
  for (const [x, c] of count) bucket[c].push(x);
  const result = [];
  for (let c = nums.length; c >= 1; c--) {
    for (const x of bucket[c]) {
      result.push(x);
      if (result.length === k) return result;
    }
  }
  return result;
}`,
      tests: [
        { name: 'example', args: [[1, 1, 1, 2, 2, 3], 2], expected: [1, 2] },
        { name: 'single element', args: [[1], 1], expected: [1] },
        { name: 'negative id wins', args: [[4, 4, -1, -1, -1, 2], 1], expected: [-1] },
        { name: 'counts 4 and 3', args: [[5, 3, 5, 3, 5, 7, 3, 3], 2], expected: [3, 5] },
        { name: 'k = all distinct', args: [[1, 2, 3], 3], expected: [1, 2, 3] },
        { name: 'zero and negatives', args: [[0, 0, 0, -2, -2, 9], 2], expected: [0, -2] },
        { name: 'all the same', args: [[7, 7, 7, 7], 1], expected: [7] },
      ],
      compare: 'unordered',
      takeaway: "Counts live between 1 and n, so they can be bucket indexes: top-k without sorting.",
    },
  ],
  quiz: [
    {
      prompt: "Strings `s` and `t` have the same length. While counting `t` down, a count hits -1. What can you conclude?",
      options: [
        'Nothing yet, keep going.',
        '`t` has more of that letter than `s`, so they are not anagrams.',
        'They are anagrams.',
      ],
      answer: 1,
      explanation: "A negative count means `t` used a letter `s` did not have enough of. Stop and return false.",
    },
    {
      prompt: "In the bucket sort for top k, why can we use the count as an array index?",
      options: [
        'Counts are always between 1 and n, so an array of n + 1 buckets covers every possible count.',
        'Counts are always small numbers like 1, 2, 3.',
        'Because JavaScript arrays grow automatically.',
      ],
      answer: 0,
      explanation: "No value can appear more than n times, so `bucket[count]` always exists.",
    },
    {
      prompt: "You count numbers in a plain object `{}` and return `Object.keys(count)`. What is wrong?",
      options: ['Nothing.', 'The keys come back as strings like `\'3\'`, not numbers.', 'The keys come back sorted by count.'],
      answer: 1,
      explanation: "Plain object keys are always strings. Use a `Map` to keep real numbers.",
    },
  ],
  takeaways: [
    "When only amounts matter, a frequency map replaces searching and sorting.",
    "Two passes (count, then answer) are still O(n).",
    "Top k: count, then bucket by count and read from the top. O(n), no sort.",
  ],
};
