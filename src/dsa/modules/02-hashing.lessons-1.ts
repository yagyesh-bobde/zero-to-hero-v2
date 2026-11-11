import type { Lesson } from '../types';

// Module 2, lessons 1-2: lookup & complements, counting.

export const lookupLesson: Lesson = {
  id: 'lookup-complements',
  title: 'Lookup and complements',
  summary: 'Find a missing partner by remembering earlier numbers and their positions.',
  minutes: 20,
  blocks: [
    {
      kind: 'callout',
      tone: 'story',
      title: 'Spend the gift card',
      text: 'You have 14 to spend on two items. Their prices are 4, 9, 1, 6, and 5. Which two prices use the whole gift card?',
    },
    {
      kind: 'text',
      text: '**Two Sum.** Return the positions of the two items. A position is called an **index**; counting starts at 0. In `[4, 9, 1, 6, 5]`, 9 is at index 1 and 5 is at index 4. Since `9 + 5 = 14`, return `[1, 4]`.',
    },
    {
      kind: 'callout',
      tone: 'tip',
      title: 'Read the plan',
      text: 'From module 1: pseudocode is a plain code plan. `←` stores, `=` means equal, `≠` means not equal, and loop endpoints are included. `n` is the input length. **Brute force** means trying every possible answer. Here, try each pair of different positions.',
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
      text: 'With `[4, 9, 5]`, you try `4 + 9`, `4 + 5`, then `9 + 5`. It works. A longer list means many more pairs. From module 1: time counts work, and space counts extra storage. O(n) work grows with the input length; O(n²) grows like the number of pairs.',
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'Ask for one exact partner',
      text: 'At 5, you need `14 - 5 = 9`. You already passed 9. We will remember earlier prices so you can ask for 9 directly, instead of trying every pair. The missing partner is called the **complement**.',
    },
    {
      kind: 'table',
      title: 'A hash map is a table you can ask by key',
      head: ['Key: what you ask for', 'Value: what it remembers'],
      rows: [
        ['4', 'index 0'],
        ['9', 'index 1'],
      ],
    },
    {
      kind: 'text',
      text: 'A **hash map** stores pairs of a **key** and a **value**. The key is the label you search for; the value is the information saved under it. Here the key is a price and the value is its index. Asking for the saved information is a **lookup**. We write `9 → 1` to mean “price 9 was at index 1”.',
    },
    {
      kind: 'table',
      title: 'JavaScript gives you Map',
      head: ['Code', 'Meaning'],
      rows: [
        ['`const map = new Map()`', 'Make an empty map.'],
        ['`map.set(9, 1)`', 'Save value 1 under key 9.'],
        ['`map.has(9)`', 'Ask whether key 9 is present: true or false.'],
        [
          '`map.get(9)`',
          'Read its saved value: 1. A missing key gives undefined (no saved value).',
        ],
        ['`map.set(4, 0)`', 'Save index 0 under price 4.'],
        [
          '`map.has(4)`',
          'True even though its saved index is 0. JavaScript treats 0 as false in an if condition, so use has to test presence.',
        ],
      ],
    },
    {
      kind: 'text',
      text: 'Think of the map as choosing a storage spot from the key, rather than checking every entry. **O(1) on average** means a lookup usually needs about the same amount of work as the map grows. It does not promise exactly one machine step. Saving a key has the same average cost.',
    },
    {
      kind: 'diagram',
      title: 'Ask about earlier prices before saving',
      art: [
        'Take the next price',
        '        |',
        '        v',
        'Find partner = target - price',
        '        |',
        '        v',
        'Is partner in the map?',
        '  | yes                 | no',
        '  v                     v',
        'Return both indexes   Save price -> index',
        '                        |',
        '                        v',
        '                      Try the next price',
      ].join('\n'),
      caption: 'The map holds earlier prices, so one item cannot match itself.',
    },
    {
      kind: 'text',
      text: 'Use `[4, 9, 1, 6, 5]` with target 14; watch each missing partner and the map after each save.',
    },
    {
      kind: 'steps',
      title: 'Find 9 and 5 in [4, 9, 1, 6, 5]',
      frames: [
        {
          cells: [4, 9, 1, 6, 5],
          pointers: {
            index: 0,
          },
          active: [0],
          vars: {
            partner: '14 - 4 = 10',
            map: '4 -> 0',
          },
          note: '10 is missing from the empty map, so save price 4 at index 0.',
        },
        {
          cells: [4, 9, 1, 6, 5],
          pointers: {
            index: 1,
          },
          active: [1],
          done: [0],
          vars: {
            partner: '14 - 9 = 5',
            map: '4 -> 0, 9 -> 1',
          },
          note: '5 has not appeared yet, so save price 9 at index 1.',
        },
        {
          cells: [4, 9, 1, 6, 5],
          pointers: {
            index: 2,
          },
          active: [2],
          done: [0, 1],
          vars: {
            partner: '14 - 1 = 13',
            map: '4 -> 0, 9 -> 1, 1 -> 2',
          },
          note: '13 has not appeared yet, so save price 1 at index 2.',
        },
        {
          cells: [4, 9, 1, 6, 5],
          pointers: {
            index: 3,
          },
          active: [3],
          done: [0, 1, 2],
          vars: {
            partner: '14 - 6 = 8',
            map: '4 -> 0, 9 -> 1, 1 -> 2, 6 -> 3',
          },
          note: '8 has not appeared yet, so save price 6 at index 3.',
        },
        {
          cells: [4, 9, 1, 6, 5],
          pointers: {
            index: 4,
          },
          active: [4],
          done: [0, 2, 3],
          found: [1, 4],
          vars: {
            partner: '14 - 5 = 9',
            map: '4 -> 0, 9 -> 1, 1 -> 2, 6 -> 3',
            answer: '[1, 4]: 9 + 5 = 14',
          },
          note: '9 is saved at index 1, so return [1, 4] without saving 5.',
        },
      ],
    },
    {
      kind: 'text',
      text: 'Remembering earlier prices found the missing partner without trying all earlier pairs again.',
    },
    {
      kind: 'text',
      text: 'Use `[7, 2, 7]` with target 14; watch why the first 7 must wait for a different item with price 7.',
    },
    {
      kind: 'steps',
      title: 'Two copies of 7 are two different items',
      frames: [
        {
          cells: [7, 2, 7],
          pointers: { index: 0 },
          active: [0],
          vars: { partner: '14 - 7 = 7', map: 'empty' },
          note: 'The map is empty, so the first 7 has no earlier partner.',
        },
        {
          cells: [7, 2, 7],
          pointers: { index: 0 },
          active: [0],
          vars: { partner: 7, map: '7 -> 0' },
          note: 'Save 7 at index 0 after checking, so it cannot pair with itself.',
        },
        {
          cells: [7, 2, 7],
          pointers: { index: 1 },
          active: [1],
          done: [0],
          vars: { partner: '14 - 2 = 12', map: '7 -> 0, 2 -> 1' },
          note: '12 is missing, so save price 2 at index 1.',
        },
        {
          cells: [7, 2, 7],
          pointers: { index: 2 },
          active: [2],
          done: [1],
          found: [0, 2],
          vars: { partner: '14 - 7 = 7', map: '7 -> 0, 2 -> 1', answer: '[0, 2]' },
          note: 'The saved 7 belongs to index 0, so these two different items make 14.',
        },
      ],
    },
    {
      kind: 'text',
      text: 'Checking before saving allows equal prices at different indexes while preventing an item from matching itself.',
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'One pass with a map',
      code: `function twoSum(nums, target):
    map ← empty map                   // price → index
    for index from 0 to n - 1:
        partner ← target - nums[index]
        if partner in map:
            return [map[partner], index]
        map[nums[index]] ← index      // save AFTER checking
    return []`,
    },
    {
      kind: 'code',
      lang: 'js',
      code: `function twoSum(nums, target) {
  const map = new Map(); // price -> index
  for (let index = 0; index < nums.length; index++) {
    const partner = target - nums[index];
    if (map.has(partner)) return [map.get(partner), index];
    map.set(nums[index], index);
  }
  return [];
}`,
    },
    {
      kind: 'callout',
      tone: 'tip',
      title: 'Read the cost comparison',
      text: 'Sorting puts numbers in order; it usually costs O(n log n), between one walk and all-pairs work. Two pointers means searching with two positions; module 3 teaches it. In the space column, O(1) means storage stays fixed as n grows, while O(n) allows storage that grows with n.',
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
      text: '**Pattern: complement lookup.** When you need two items to make a target, calculate the missing partner. Ask about earlier items, then remember the current one.',
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Template: find a partner',
      code: `map ← empty map                   // number → its index
for index from 0 to n - 1:
    partner ← target - items[index]
    if partner in map:
        return [map[partner], index]
    map[items[index]] ← index`,
    },
    {
      kind: 'callout',
      tone: 'trap',
      title: 'Index 0 still counts',
      text: 'The second dry run uses a partner at index 0. Use `map.has(partner)` to check for it; `if (map.get(partner))` would treat that saved 0 as false and miss the pair.',
    },
    {
      kind: 'callout',
      tone: 'tip',
      title: 'When you need the number of pairs',
      text: 'For `[2, 2, 5]` and target 7, the 5 makes two pairs. Store `2 → 2`: the number 2 has appeared twice. This number of appearances is its **count**, also called its **frequency**.',
    },
    {
      kind: 'callout',
      tone: 'tip',
      title: 'Increase a count that might be missing',
      text: 'Increase it with `count.set(x, (count.get(x) ?? 0) + 1)`. The `?? 0` means “use 0 if this key is missing”. In pseudocode, `count[x] or 0` means the same thing.',
    },
  ],
  problems: [
    {
      id: 'hashing-two-sum',
      title: 'Two Sum',
      difficulty: 'easy',
      leetcode: 1,
      pattern: 'Complement lookup',
      statement:
        'You have a gift card worth `target` and item prices in `nums`. Return the indexes of two different items whose prices add to target, with the smaller index first. Indexes start at 0. Exactly one pair works.',
      examples: [
        { input: 'nums = [4, 9, 1, 6, 5], target = 14', output: '[1, 4]', explain: '9 + 5 = 14.' },
        {
          input: 'nums = [3, 3], target = 6',
          output: '[0, 1]',
          explain: 'Two different items can have the same price.',
        },
      ],
      constraints: ['2 ≤ n ≤ 10⁴', '-10⁹ ≤ nums[i], target ≤ 10⁹', 'exactly one answer exists'],
      hints: [
        'Try one price: if the target is 14 and the price is 5, what other price would you need?',
        'Remember earlier prices and their indexes in a map.',
        'For each index i, look for `target - nums[i]` before saving `nums[i] → i`. Use has so a saved index 0 is not missed.',
      ],
      approaches: [
        {
          name: 'Brute force',
          idea: 'Try each pair of different indexes. For [4, 9, 5], that checks 4 + 9, 4 + 5, and 9 + 5, so no pair is missed.',
          time: 'O(n²)',
          space: 'O(1)',
        },
        {
          name: 'Hash map, one pass',
          idea: 'At price 5 with target 14, you need 9. A map of earlier price → index tells you where 9 appeared; checking before saving prevents an item from matching itself.',
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
      takeaway: 'Find the missing price, ask the map for its index, then save the current price.',
    },
    {
      id: 'hashing-song-pairs',
      title: 'Songs that end on the minute',
      difficulty: 'medium',
      leetcode: 1010,
      pattern: 'Complement lookup (counting)',
      statement:
        'A DJ plays two songs back to back. Their lengths in seconds are in `time`. Count pairs of different positions whose combined length is a whole number of minutes: 60, 120, 180 seconds, and so on. Count each pair once, with the earlier song first.',
      examples: [
        {
          input: 'time = [30, 20, 150, 100, 40]',
          output: '3',
          explain: '(30, 150), (20, 100) and (20, 40) total 180, 120 and 60 seconds.',
        },
        { input: 'time = [60, 60, 60]', output: '3', explain: 'Every pair totals 120 seconds.' },
      ],
      constraints: ['1 ≤ n ≤ 6 × 10⁴', '1 ≤ time[i] ≤ 500'],
      hints: [
        '150 seconds is 2 full minutes with 30 seconds left over. This leftover is the remainder: `150 % 60 = 30`. Only leftovers matter for completing a minute.',
        'A remainder of 20 needs 40. A remainder of 0 needs 0. Remember how many earlier songs had each remainder; a count is a number of appearances.',
        'For [20, 20, 40]: save count 1 for remainder 20, then raise it to 2. At 40 you need 20, so add 2 pairs.',
        'For each song, let `r = t % 60` and `need = (60 - r) % 60`. Add the earlier count for need, then increase the count for r. The extra % makes r = 0 need 0, not 60. Pseudocode uses mod for %.',
      ],
      approaches: [
        {
          name: 'Check every pair',
          idea: 'Try every pair and add their lengths. A remainder of 0 after dividing that total by 60 means it fills whole minutes.',
          time: 'O(n²)',
          space: 'O(1)',
        },
        {
          name: 'Count remainders',
          idea: 'At 40 seconds left over, each earlier song with 20 seconds left over makes a pair. Save remainder → count so you can add every match without trying earlier songs one by one; at most 60 remainders need storage.',
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
      takeaway: 'Count earlier leftover-second values that complete a whole minute.',
    },
    {
      id: 'hashing-pairs-diff-k',
      title: 'Pairs with difference k',
      difficulty: 'easy',
      leetcode: 2006,
      pattern: 'Complement lookup (counting)',
      statement:
        'A shop lists prices in `nums`. Count pairs of different positions whose prices are exactly `k` apart, ignoring which price is larger. Count each position pair once. For `[1, 2, 2, 1]` and k = 1, each of the two 1s pairs with each of the two 2s: 4 pairs.',
      examples: [
        {
          input: 'nums = [1, 2, 2, 1], k = 1',
          output: '4',
          explain: 'Each 1 pairs with each 2: 2 × 2 = 4 pairs.',
        },
        {
          input: 'nums = [3, 2, 1, 5, 4], k = 2',
          output: '3',
          explain: '(3, 1), (3, 5) and (2, 4).',
        },
      ],
      constraints: ['1 ≤ n ≤ 10⁵', '-100 ≤ nums[i] ≤ 100', '1 ≤ k ≤ 99'],
      hints: [
        'At price 5 with k = 2, a partner could cost 3 or 7.',
        'Remember the number of earlier appearances of each price. These are counts, not indexes.',
        'For [1, 1, 2] with k = 1, the last 2 has two earlier partners of price 1. Add 2, not just 1.',
        'For each x, add the earlier counts of x - k and x + k, treating a missing count as 0. Then increase the count of x.',
      ],
      approaches: [
        {
          name: 'Check every pair',
          idea: 'Try every pair of different positions. `Math.abs(a - b)` is the distance between the prices without a minus sign; count the pair when that distance is k.',
          time: 'O(n²)',
          space: 'O(1)',
        },
        {
          name: 'Count map, one pass',
          idea: 'At x = 5 and k = 2, only 3 and 7 can match. Add how many earlier copies of each you saved, then save x; every pair is counted when you reach its later position.',
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
      takeaway:
        'A price k away can be smaller or larger: count earlier copies of both possibilities.',
    },
  ],
  quiz: [
    {
      prompt: 'After `seen.set(9, 1)`, what do the key 9 and value 1 mean?',
      options: ['Price 9 was at index 1.', 'Price 1 was at index 9.', 'There are nine items.'],
      answer: 0,
      explanation:
        'The key is the price you can ask for. Its saved value tells you where that price appeared.',
    },
    {
      prompt: 'You reach 5 and the target is 14. Which earlier number do you look for?',
      options: ['14', '9', '5'],
      answer: 1,
      explanation: '14 - 5 = 9. That is the missing partner, or complement.',
    },
    {
      prompt: 'Why should Two Sum check the map before saving the current price?',
      options: [
        'To avoid pairing an item with itself.',
        'To keep prices sorted.',
        'To remove repeated prices.',
      ],
      answer: 0,
      explanation:
        'For a price of 7 and target 14, the match must be another item, not the current one.',
    },
  ],
  takeaways: [
    'A map saves information under a key: here, price → index.',
    'Calculate the missing partner, look it up, then save the current item.',
    'Use `has` to test whether a key is present. Index 0 is a valid saved answer.',
  ],
};

export const countingLesson: Lesson = {
  id: 'counting',
  title: 'Counting with a frequency map',
  summary: 'Count how many times each item appears, then use those counts.',
  minutes: 20,
  blocks: [
    {
      kind: 'callout',
      tone: 'story',
      title: 'Check the word tiles',
      text: 'You hold the tiles T, O, O, L. Your friend plays LOOT. Can they make that word using exactly your tiles?',
    },
    {
      kind: 'text',
      text: 'Both words have 1 T, 2 Os, and 1 L. So the answer is true. Words with the same letters and the same number of each letter are **anagrams**. Their letter order may differ. `tool` and `loot` qualify; `tool` and `toll` do not.',
    },
    {
      kind: 'text',
      text: 'Start by crossing off one matching tile for each letter. The plan below searches for a letter, then removes one copy. From module 1: pseudocode is a plain code plan. `←` stores, `=` means equal, `≠` means not equal, and loop endpoints are included. `n` is the input length.',
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
      text: 'For each O, you search through the remaining tiles again. We will replace those searches with a count for each letter. From module 1: time counts work, and space counts extra storage. O(n) work grows with the input length; O(n²) grows like the number of pairs.',
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'A map of letters to counts',
      text: 'A **frequency map** saves how many times each item appears. Here the **key** is a letter and the **value** is the number of its tiles still available. Start with an empty map called `count`. Count each letter of `s`, then use one saved tile for each letter of `t`. A missing letter starts at 0.',
    },
    {
      kind: 'diagram',
      title: 'Count the tiles, then use them',
      art: [
        'Count each letter of the first word',
        '        |',
        '        v',
        'Take the next letter of the second word',
        '        |',
        '        v',
        'Try one fewer saved copy of that letter',
        '        |',
        '        v',
        'Would the count be below 0?',
        '  | yes                 | no',
        '  v                     v',
        'Return false          Save the smaller count',
        '                        |',
        '                        v',
        '                      Next letter, or true if finished',
      ].join('\n'),
      caption: 'Check equal word lengths first; then any shortage means the words do not match.',
    },
    {
      kind: 'text',
      text: "Use `s = 'tool'` and `t = 'loot'`; watch counts rise while the cells show s, then fall while they show t.",
    },
    {
      kind: 'steps',
      title: 'Count tool, then use its tiles for loot',
      frames: [
        {
          cells: ['t', 'o', 'o', 'l'],
          active: [0],
          vars: { word: 's = tool', letter: 't', count: 't -> 1' },
          note: 'Save one t because the first word provides a t tile.',
        },
        {
          cells: ['t', 'o', 'o', 'l'],
          active: [1],
          done: [0],
          vars: { word: 's = tool', letter: 'o', count: 't -> 1, o -> 1' },
          note: 'Add o with count 1 because this is its first tile.',
        },
        {
          cells: ['t', 'o', 'o', 'l'],
          active: [2],
          done: [0, 1],
          vars: { word: 's = tool', letter: 'o', count: 't -> 1, o -> 2' },
          note: 'Raise o from 1 to 2 because this is a second o tile.',
        },
        {
          cells: ['t', 'o', 'o', 'l'],
          active: [3],
          done: [0, 1, 2],
          vars: { word: 's = tool', letter: 'l', count: 't -> 1, o -> 2, l -> 1' },
          note: 'Add one l tile, completing the supply for the second word.',
        },
        {
          cells: ['l', 'o', 'o', 't'],
          active: [0],
          vars: { word: 't = loot', letter: 'l', left: '1 - 1 = 0', count: 't -> 1, o -> 2, l -> 0' },
          note: 'Switch to loot and use its l, leaving 0 l tiles without a shortage.',
        },
        {
          cells: ['l', 'o', 'o', 't'],
          active: [1],
          done: [0],
          vars: { word: 't = loot', letter: 'o', left: '2 - 1 = 1', count: 't -> 1, o -> 1, l -> 0' },
          note: 'Use one o tile, leaving another for the next o.',
        },
        {
          cells: ['l', 'o', 'o', 't'],
          active: [2],
          done: [0, 1],
          vars: { word: 't = loot', letter: 'o', left: '1 - 1 = 0', count: 't -> 1, o -> 0, l -> 0' },
          note: 'Use the last o tile because this is the second o in loot.',
        },
        {
          cells: ['l', 'o', 'o', 't'],
          active: [3],
          done: [0, 1, 2],
          vars: { word: 't = loot', letter: 't', left: '1 - 1 = 0', count: 't -> 0, o -> 0, l -> 0' },
          note: 'Use the t tile, leaving every letter with count 0.',
        },
        {
          cells: ['l', 'o', 'o', 't'],
          found: [0, 1, 2, 3],
          vars: { word: 't = loot', count: 't -> 0, o -> 0, l -> 0', answer: 'true' },
          note: 'Return true because the equal-length words used every tile without a shortage.',
        },
      ],
    },
    {
      kind: 'text',
      text: 'Counting tiles let a different letter order use exactly the same supply: the words are anagrams.',
    },
    {
      kind: 'text',
      text: "Use `s = 'abb'` and `t = 'aab'`; watch the second a run out even though both words contain only a and b.",
    },
    {
      kind: 'steps',
      title: 'Same letters, different counts: abb and aab',
      frames: [
        {
          cells: ['a', 'b', 'b'],
          active: [0],
          vars: { word: 's = abb', letter: 'a', count: 'a -> 1' },
          note: 'Save one a tile because abb provides an a at its start.',
        },
        {
          cells: ['a', 'b', 'b'],
          active: [1],
          done: [0],
          vars: { word: 's = abb', letter: 'b', count: 'a -> 1, b -> 1' },
          note: 'Add b with count 1 because this is its first tile.',
        },
        {
          cells: ['a', 'b', 'b'],
          active: [2],
          done: [0, 1],
          vars: { word: 's = abb', letter: 'b', count: 'a -> 1, b -> 2' },
          note: 'Raise b to 2 because abb supplies a second b tile.',
        },
        {
          cells: ['a', 'a', 'b'],
          active: [0],
          vars: { word: 't = aab', letter: 'a', left: '1 - 1 = 0', count: 'a -> 0, b -> 2' },
          note: 'Switch to aab and use its first a, leaving no a tiles.',
        },
        {
          cells: ['a', 'a', 'b'],
          active: [1],
          done: [0],
          vars: { word: 't = aab', letter: 'a', left: '0 - 1 = -1', count: 'a -> 0, b -> 2', answer: 'false' },
          note: 'The second a would need a missing tile, so return false before saving -1.',
        },
      ],
    },
    {
      kind: 'text',
      text: 'Matching letter names is not enough: the map must provide enough copies of every letter.',
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Count letters, then check for a shortage',
      code: `function isAnagram(s, t):
    if length of s ≠ length of t:
        return false
    count ← empty map                   // letter → available tiles
    for each letter in s:
        count[letter] ← (count[letter] or 0) + 1
    for each letter in t:
        left ← (count[letter] or 0) - 1
        if left < 0:
            return false                // not enough tiles
        count[letter] ← left
    return true`,
    },
    {
      kind: 'code',
      lang: 'js',
      code: `function isAnagram(s, t) {
  if (s.length !== t.length) return false;
  const count = new Map();
  for (const letter of s) count.set(letter, (count.get(letter) ?? 0) + 1);
  for (const letter of t) {
    const left = (count.get(letter) ?? 0) - 1;
    if (left < 0) return false;
    count.set(letter, left);
  }
  return true;
}`,
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
      text: '**Another use: your most played songs.** In `[1, 1, 1, 2, 2, 3]`, song 1 has 3 plays, song 2 has 2, and song 3 has 1. “Top k” means the k items with the largest counts. For `k = 2`, return `[1, 2]`. You can sort the song ids by their counts, largest first.',
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'Give each possible count its own list',
      text: 'We will avoid sorting by putting ids into lists labeled by play count. Each list is a **bucket**: just a container for items with something in common. With 6 plays, no song can have more than 6 plays, so buckets 0 through 6 cover every possible count.',
    },
    {
      kind: 'list',
      items: [
        'Count the plays: `1 → 3`, `2 → 2`, `3 → 1`.',
        'Create 7 separate empty lists, labeled 0 through 6. Put id 1 in bucket 3, id 2 in bucket 2, and id 3 in bucket 1.',
        'Read from bucket 6 down. Buckets 6, 5, and 4 are empty. Take 1 from bucket 3, then 2 from bucket 2. Stop after 2 ids. This is called **bucket sort**: arrange items by numbered containers.',
      ],
      ordered: true,
    },
    {
      kind: 'text',
      text: '**Pattern: count, then answer.** Use a frequency map for “same letters”, “appears once”, or “most common”. Two walks through n items still take O(n) work: one walk counts, and another uses the counts.',
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
      title: 'Start missing counts at zero',
      text: 'A new map does not know that a missing letter has count 0. `count.get(letter)` returns `undefined`, meaning no value is saved. Use `(count.get(letter) ?? 0) + 1`.',
    },
    {
      kind: 'callout',
      tone: 'trap',
      title: 'Give each bucket its own list',
      text: 'For buckets, `Array.from({ length: n + 1 }, () => [])` creates a separate list for each count; `.fill([])` would reuse one list.',
    },
  ],
  problems: [
    {
      id: 'hashing-valid-anagram',
      title: 'Valid Anagram',
      difficulty: 'easy',
      leetcode: 242,
      pattern: 'Frequency map',
      statement:
        'Return true if `t` uses exactly the same letters as `s`, with the same number of each letter. Order may differ. Such words are called anagrams. For `tool` and `loot`, each has 1 t, 2 Os, and 1 l, so return true.',
      examples: [
        {
          input: "s = 'tool', t = 'loot'",
          output: 'true',
          explain: 'Both words have t:1, o:2, l:1.',
        },
        {
          input: "s = 'tool', t = 'toll'",
          output: 'false',
          explain: 'The first word has two Os and one L; the second has one O and two Ls.',
        },
      ],
      constraints: ['0 ≤ s.length, t.length ≤ 5 × 10⁴', 'lowercase English letters'],
      hints: [
        'Compare the word lengths. Different numbers of letters cannot use exactly the same tiles.',
        'How many copies of each letter does the first word provide?',
        'Save those counts. Subtract 1 for each letter of t. A missing letter starts at count 0; any count below 0 means false. With equal lengths, finishing without a negative means true.',
      ],
      approaches: [
        {
          name: 'Sort and compare',
          idea: 'Put each word’s letters in alphabetical order and compare the resulting strings. Words with exactly the same letter counts give the same sorted string.',
          time: 'O(n log n)',
          space: 'O(n)',
        },
        {
          name: 'Frequency map',
          idea: 'Count the tiles provided by s, then use one tile for each letter of t. If lengths match and no letter runs out, t has used exactly the available tiles.',
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
      statement:
        'A chat app highlights the first letter in a username that appears only once. Return its index, counting from 0. Return -1 if none qualifies. For `aab`, a appears twice and b once, so return index 2.',
      examples: [
        {
          input: "s = 'aab'",
          output: '2',
          explain: 'The two As are at indexes 0 and 1. B at index 2 appears once.',
        },
        {
          input: "s = 'abca'",
          output: '1',
          explain: 'A repeats later. B at index 1 is the first letter with count 1.',
        },
        {
          input: "s = 'aabb'",
          output: '-1',
          explain: 'Both letters repeat.',
        },
      ],
      constraints: ['1 ≤ s.length ≤ 10⁵', 'lowercase English letters'],
      hints: [
        'In `abca`, you cannot know the first a repeats until you reach the end.',
        'Count every letter first, then walk the original string again.',
        'Return the first index whose letter has count 1. If you finish without finding one, return -1.',
      ],
      approaches: [
        {
          name: 'Check each letter against all others',
          idea: 'For each letter position, search every other position in the string for another copy of that letter. The first position with no other copy is the answer.',
          time: 'O(n²)',
          space: 'O(1)',
        },
        {
          name: 'Count, then scan',
          idea: 'First save each letter’s final count. Then read the original string from left to right and return the first index with count 1; this preserves the required order.',
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
      takeaway: 'Two passes are fine: count everything first, then answer in the original order.',
    },
    {
      id: 'hashing-top-k-frequent',
      title: 'Top k frequent elements',
      difficulty: 'medium',
      leetcode: 347,
      pattern: 'Frequency map + bucket sort',
      statement:
        'A music app records one song id per play in `nums`. Return the `k` different ids with the largest play counts, in any order. For `[1, 1, 1, 2, 2, 3]` and k = 2, counts are 1:3, 2:2, 3:1, so return [1, 2]. Ties never leave a choice about which ids belong in the answer.',
      examples: [
        {
          input: 'nums = [1, 1, 1, 2, 2, 3], k = 2',
          output: '[1, 2]',
          explain: 'Id 1 has 3 plays and id 2 has 2; both beat id 3 with 1 play.',
        },
        {
          input: 'nums = [4, 4, -1, -1, -1, 2], k = 1',
          output: '[-1]',
          explain: 'Id -1 has 3 plays, more than any other id.',
        },
      ],
      constraints: [
        '1 ≤ n ≤ 10⁵',
        'k is between 1 and the number of distinct ids',
        'the answer is unique',
      ],
      hints: [
        'Count how many times each song id appears.',
        'You could sort ids by play count. To avoid sorting, notice that no count can exceed the number of plays.',
        'A bucket is a list for one count. For counts 1:3, 2:2, 3:1, put id 1 in bucket 3, id 2 in bucket 2, and id 3 in bucket 1.',
        'Create n + 1 separate buckets. Read from bucket n down to 1 and collect ids until you have k. Skip empty buckets.',
      ],
      approaches: [
        {
          name: 'Count, then sort by count',
          idea: 'Count each id’s plays, sort the saved ids from largest count to smallest, and take k. This gives the most played ids directly.',
          time: 'O(n log n)',
          space: 'O(n)',
        },
        {
          name: 'Count, then a heap of size k',
          idea: 'A heap is a tool that quickly exposes the smallest saved score; module 12 explains how it works. You can keep the k largest play counts by discarding a smaller one when a better one arrives.',
          time: 'O(n log k)',
          space: 'O(n)',
        },
        {
          name: 'Count + bucket sort',
          idea: 'With 6 plays, a count must be between 1 and 6. Put each id in the list for its count, then read those lists from highest count to lowest until you have k ids.',
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
      takeaway: 'Bucket c holds the ids played c times; read larger counts first.',
    },
  ],
  quiz: [
    {
      prompt:
        '`tool` provides two Os. After using both, a third O takes the count to -1. What does that tell you?',
      options: [
        'The words are anagrams.',
        'The second word needs too many Os.',
        'You should sort the letters.',
      ],
      answer: 1,
      explanation: 'A negative count means you have run out of that letter.',
    },
    {
      prompt: 'Song 7 played three times. Where does its id go in the bucket method?',
      options: ['Put 3 in bucket 7.', 'Put 7 in bucket 3.', 'Put 7 in every bucket.'],
      answer: 1,
      explanation: 'The bucket label is the count. Its contents are the song ids with that count.',
    },
    {
      prompt: 'Why count the whole username before finding its first letter that appears once?',
      options: [
        'A later letter might repeat an earlier one.',
        'Maps only work after sorting.',
        'The last letter is always unique.',
      ],
      answer: 0,
      explanation: 'In `abca`, the first a looks unique until you reach the last a.',
    },
  ],
  takeaways: [
    'Frequency means number of appearances. Store item → count.',
    'Count everything before answering questions that depend on the final counts.',
    'For top k, a bucket labeled c holds the items that appear c times.',
  ],
};
