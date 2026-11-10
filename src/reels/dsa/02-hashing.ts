import type { Series } from '../types';

// /dsa/reels module 2. One reel per lesson of src/dsa/modules/02-hashing*.ts, in lesson order.
// Brief: src/reels/dsa/README.md. Rules: src/reels/AUTHORING.md.

const prices = [4, 9, 1, 6, 5];
const words = ['eat', 'tea', 'tan', 'ate', 'nat', 'bat'];
const days = [100, 4, 200, 1, 3, 2];
const hours = [2, 5, 1, 4, 3];
const ledger = [1, 2, 1, -1, 2];

export const series: Series = {
  id: 'dsa-hashing',
  title: 'Hash maps, sets & prefix sums',
  emoji: '🗂️',
  color: '#a78bfa',
  order: 2,
  blurb: 'Trade memory for speed: counting, complements, grouping and running sums.',
  reels: [
    // ─── Lesson 1: lookup and complements ───────────────────────────────────────────
    {
      id: 'dsa-hashing-lookup-complements',
      title: 'Lookup and complements',
      link: { label: 'Solve it', href: '/dsa#/m/hashing/lookup-complements/hashing-two-sum' },
      beats: [
        {
          say: 'A gift card worth fourteen. Which two items cost exactly that?',
          emphasis: ['exactly'],
          scene: { type: 'title', kicker: 'Hash maps · Lesson 1', title: 'Spend the gift card *exactly*', emoji: '🎁', style: 'slam' },
        },
        {
          say: 'Five prices on the shelf. Nine plus five makes fourteen, so return indexes one and four.',
          emphasis: ['fourteen'],
          sfx: 'pop',
          scene: {
            type: 'array',
            title: 'Prices, target 14',
            cells: prices,
            pointers: { i: 1, j: 4 },
            found: [1, 4],
            vars: { pair: '9 + 5 = 14' },
            caption: 'return the two indexes',
          },
        },
        {
          say: 'A new cashier tries every pair. For each item, check every item after it.',
          emphasis: ['every', 'pair'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'pseudo',
            file: 'Brute force',
            code: `function twoSum(nums, target):
    for i from 0 to n - 1:
        for j from i + 1 to n - 1:
            if nums[i] + nums[j] = target:
                return [i, j]
    return []`,
            highlight: [[2, 3]],
            note: { line: 3, text: 'a loop inside a loop', tone: 'warn' },
          },
        },
        {
          say: 'It’s O of n squared. A hundred thousand prices means five billion checks.',
          speak: 'It’s oh of n squared. A hundred thousand prices means five billion checks.',
          emphasis: ['squared', 'billion'],
          sfx: 'error',
          scene: {
            type: 'stat',
            value: '5B',
            label: 'checks for *100,000* prices',
            sub: 'O(n²): every pair, one by one',
            tone: 'bad',
          },
        },
        {
          say: 'Standing on five, you need a nine. You walked past it already, then forgot.',
          emphasis: ['forgot'],
          scene: {
            type: 'array',
            title: 'Spot the waste',
            cells: prices,
            pointers: { i: 4 },
            active: [4],
            reads: [0, 1, 2, 3],
            caption: 'the 9 was already seen, then lost',
          },
        },
        {
          say: 'So remember each price in a hash map. Asking the map takes one step.',
          emphasis: ['hash', 'map', 'one'],
          sfx: 'ding',
          scene: {
            type: 'title',
            kicker: 'The insight',
            title: 'Remember, then *look up*',
            emoji: '💡',
            style: 'slam',
            sub: 'a hash map finds a key in about one step',
          },
        },
        {
          say: 'At four, you need ten. The map is empty, so just store four.',
          emphasis: ['ten', 'store'],
          scene: {
            type: 'array',
            title: 'One pass, target 14',
            cells: prices,
            pointers: { i: 0 },
            active: [0],
            vars: { need: '14 - 4 = 10', seen: '{ }' },
          },
        },
        {
          say: 'At nine, you need five. Not there yet, so store nine too.',
          emphasis: ['five'],
          scene: {
            type: 'array',
            title: 'One pass, target 14',
            cells: prices,
            pointers: { i: 1 },
            active: [1],
            done: [0],
            vars: { need: '14 - 9 = 5', seen: '{4}' },
          },
        },
        {
          say: 'One needs thirteen, and six needs eight. Neither is there, so store them both.',
          emphasis: ['thirteen', 'eight'],
          scene: {
            type: 'array',
            title: 'One pass, target 14',
            cells: prices,
            pointers: { i: 3 },
            active: [3],
            done: [0, 1, 2],
            vars: { need: '14 - 6 = 8', seen: '{4,9,1}' },
          },
        },
        {
          say: 'At five, you need nine, and the map says nine is at index one. Done in one pass.',
          emphasis: ['nine', 'one', 'pass'],
          sfx: 'success',
          scene: {
            type: 'array',
            title: 'One pass, target 14',
            cells: prices,
            pointers: { i: 4 },
            found: [1, 4],
            done: [0, 2, 3],
            vars: { need: '14 - 5 = 9', seen: '{4,9,1,6}' },
          },
        },
        {
          say: 'In JavaScript, ask the map first, then store the number. One loop, so it’s O of n.',
          speak: 'In JavaScript, ask the map first, then store the number. One loop, so it’s oh of n.',
          emphasis: ['first', 'store'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'twoSum.js',
            code: `function twoSum(nums, target) {
  const seen = new Map(); // x → index
  const n = nums.length;
  for (let i = 0; i < n; i++) {
    const need = target - nums[i];
    if (seen.has(need)) {
      return [seen.get(need), i];
    }
    seen.set(nums[i], i);
  }
  return [];
}`,
            highlight: [[6, 7]],
            note: { line: 7, text: 'one lookup per item: O(n)', tone: 'good' },
          },
        },
        {
          say: 'Reach for this when the answer is a pair, and each item needs its partner.',
          emphasis: ['pair', 'partner'],
          scene: {
            type: 'list',
            title: 'Reach for this when…',
            items: [
              { text: 'The answer is a *pair*', icon: '👯' },
              { text: 'You need the *partner* of x', icon: '🔍' },
              { text: 'Brute force loops over pairs', icon: '🔁' },
            ],
            active: 1,
          },
        },
        {
          say: 'The trap is index zero. Zero counts as false, so an if skips that partner. Ask has instead.',
          emphasis: ['zero', 'has'],
          sfx: 'error',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'trap.js',
            code: `for (let i = 0; i < n; i++) {
  const need = target - nums[i];
  const j = seen.get(need);
  if (j) return [j, i];
  seen.set(nums[i], i);
}`,
            errors: [4],
            note: { line: 4, text: 'index 0 is falsy: skipped!', tone: 'bad' },
          },
        },
        {
          say: 'Quick check. You store seven first, then look for seven. What goes wrong?',
          sfx: 'riser',
          scene: {
            type: 'quiz',
            question: 'nums=[7], target=14. You store 7 first, then check. Result?',
            options: ['Nothing goes wrong', '7 pairs with itself', 'The loop gets slower'],
            answer: 1,
          },
        },
        {
          say: 'Seven finds itself, since it’s already in the map. Check first, then store.',
          emphasis: ['itself', 'check', 'first'],
          sfx: 'ding',
          scene: {
            type: 'quiz',
            question: 'nums=[7], target=14. You store 7 first, then check. Result?',
            options: ['Nothing goes wrong', '7 pairs with itself', 'The loop gets slower'],
            answer: 1,
            reveal: true,
            explain: 'The map already holds 7 when you look for 7. Check, then store.',
          },
        },
        {
          say: 'Remember this. Look up the partner, then store yourself. Now tap solve it.',
          emphasis: ['partner', 'store'],
          sfx: 'success',
          scene: {
            type: 'outro',
            points: ['A map lookup is about *one step*', 'Ask for the *partner*, then store', 'Check with *has*, not get'],
            tagline: 'Now go solve it.',
          },
        },
      ],
    },

    // ─── Lesson 2: counting with a frequency map ────────────────────────────────────
    {
      id: 'dsa-hashing-counting',
      title: 'Counting with a frequency map',
      link: { label: 'Solve it', href: '/dsa#/m/hashing/counting/hashing-valid-anagram' },
      beats: [
        {
          say: 'Your tiles spell listen. Your friend plays silent. Fair move?',
          emphasis: ['listen', 'silent'],
          scene: { type: 'title', kicker: 'Hash maps · Lesson 2', title: 'Same tiles, *new* word?', emoji: '🔤', style: 'slam' },
        },
        {
          say: 'Tool and loot use the same letters, just moved around. They’re anagrams.',
          emphasis: ['anagrams'],
          sfx: 'pop',
          scene: {
            type: 'grid',
            title: 'Anagrams',
            rowLabels: ['tool', 'loot'],
            cells: [
              ['t', 'o', 'o', 'l'],
              ['l', 'o', 'o', 't'],
            ],
            found: [
              [1, 0],
              [1, 1],
              [1, 2],
              [1, 3],
            ],
            caption: 'same letters, same counts, new order',
          },
        },
        {
          say: 'The easy way crosses letters off a list. But every cross-off searches the whole list.',
          emphasis: ['searches'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'pseudo',
            file: 'Brute force',
            code: `function isAnagram(s, t):
    if length of s ≠ length of t:
        return false
    left ← list of the letters of t
    for each ch in s:
        if ch not in left:
            return false
        remove one ch from left
    return true`,
            highlight: [[6, 8]],
            note: { line: 8, text: 'each search is O(n)', tone: 'warn' },
          },
        },
        {
          say: 'A search inside a loop is O of n squared. A hundred thousand letters means billions of steps.',
          speak: 'A search inside a loop is oh of n squared. A hundred thousand letters means billions of steps.',
          emphasis: ['squared', 'billions'],
          sfx: 'error',
          scene: {
            type: 'stat',
            value: '5B',
            label: 'steps for *100,000* letters',
            sub: 'O(n²): every letter searches the list',
            tone: 'bad',
          },
        },
        {
          say: 'Search and sort both care where letters sit. We only need how many.',
          emphasis: ['where', 'how', 'many'],
          scene: {
            type: 'compare',
            title: 'Spot the waste',
            left: { title: 'Search, sort', verdict: 'bad', items: ['Cares where letters sit', 'Slow: O(n²)'] },
            right: { title: 'Count', verdict: 'ok', items: ['Cares how many', 'Fast: O(n)'] },
          },
        },
        {
          say: 'So count each letter in a map. Add one for tool, take one away for loot.',
          emphasis: ['count'],
          sfx: 'ding',
          scene: {
            type: 'title',
            kicker: 'The insight',
            title: 'Count, *don’t* search',
            emoji: '💡',
            style: 'slam',
            sub: 'every count ends at zero means anagrams',
          },
        },
        {
          say: 'First, count tool. That is one t, two o’s and one l.',
          speak: 'First, count tool. That is one tee, two ohs and one ell.',
          emphasis: ['count'],
          scene: {
            type: 'grid',
            title: 'Count up, then down',
            rowLabels: ['tool', 'loot'],
            cells: [
              ['t', 'o', 'o', 'l'],
              ['l', 'o', 'o', 't'],
            ],
            active: [
              [0, 0],
              [0, 1],
              [0, 2],
              [0, 3],
            ],
            vars: { t: 1, o: 2, l: 1 },
          },
        },
        {
          say: 'Now walk loot. The l takes the count of l down to zero.',
          speak: 'Now walk loot. The ell takes the count of ell down to zero.',
          emphasis: ['zero'],
          scene: {
            type: 'grid',
            title: 'Count up, then down',
            rowLabels: ['tool', 'loot'],
            cells: [
              ['t', 'o', 'o', 'l'],
              ['l', 'o', 'o', 't'],
            ],
            active: [[1, 0]],
            done: [
              [0, 0],
              [0, 1],
              [0, 2],
              [0, 3],
            ],
            vars: { t: 1, o: 2, l: 0 },
          },
        },
        {
          say: 'Next, both o’s bring the o count down to zero. Still nothing below zero.',
          speak: 'Next, both ohs bring the oh count down to zero. Still nothing below zero.',
          emphasis: ['below'],
          scene: {
            type: 'grid',
            title: 'Count up, then down',
            rowLabels: ['tool', 'loot'],
            cells: [
              ['t', 'o', 'o', 'l'],
              ['l', 'o', 'o', 't'],
            ],
            active: [[1, 2]],
            done: [
              [0, 0],
              [0, 1],
              [0, 2],
              [0, 3],
              [1, 0],
              [1, 1],
            ],
            vars: { t: 1, o: 0, l: 0 },
          },
        },
        {
          say: 'Last, t drops to zero. Every count hit zero, so: anagrams!',
          speak: 'Last, tee drops to zero. Every count hit zero, so: anagrams!',
          emphasis: ['every', 'anagrams'],
          sfx: 'success',
          scene: {
            type: 'grid',
            title: 'Count up, then down',
            rowLabels: ['tool', 'loot'],
            cells: [
              ['t', 'o', 'o', 'l'],
              ['l', 'o', 'o', 't'],
            ],
            found: [
              [1, 0],
              [1, 1],
              [1, 2],
              [1, 3],
            ],
            done: [
              [0, 0],
              [0, 1],
              [0, 2],
              [0, 3],
            ],
            vars: { t: 0, o: 0, l: 0 },
          },
        },
        {
          say: 'In JavaScript, count up for s, then down for t. Two loops in a row are still O of n.',
          speak: 'In JavaScript, count up for s, then down for tee. Two loops in a row are still oh of n.',
          emphasis: ['up', 'down'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'isAnagram.js',
            code: `function isAnagram(s, t) {
  if (s.length !== t.length)
    return false;
  const c = new Map(); // ch → count
  for (const ch of s)
    c.set(ch, (c.get(ch) ?? 0) + 1);
  for (const ch of t) {
    const left = (c.get(ch) ?? 0) - 1;
    if (left < 0) return false;
    c.set(ch, left);
  }
  return true;
}`,
            highlight: [[8, 9]],
            note: { line: 9, text: 'two passes, still O(n)', tone: 'good' },
          },
        },
        {
          say: 'Reach for a count when order does not matter, only how many of each.',
          emphasis: ['order', 'many'],
          scene: {
            type: 'list',
            title: 'Reach for this when…',
            items: [
              { text: 'Anagram, *same letters*', icon: '🔤' },
              { text: 'Most or least *frequent*', icon: '🏆' },
              { text: 'Only *amounts* matter', icon: '⚖️' },
            ],
            active: 2,
          },
        },
        {
          say: 'The trap is a plain object. Adding one to a missing key gives NaN, not one.',
          speak: 'The trap is a plain object. Adding one to a missing key gives nan, not one.',
          emphasis: ['missing'],
          sfx: 'error',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'trap.js',
            code: `const count = {};
for (const x of nums) {
  count[x]++;
}
// fix: (m.get(x) ?? 0) + 1`,
            errors: [3],
            note: { line: 3, text: 'undefined + 1 is NaN', tone: 'bad' },
          },
        },
        {
          say: 'Quick check. Counting t down, a letter hits minus one. What does that tell you?',
          speak: 'Quick check. Counting tee down, a letter hits minus one. What does that tell you?',
          sfx: 'riser',
          scene: {
            type: 'quiz',
            question: 'Counting t down, a letter’s count hits -1. What does it mean?',
            options: ['Nothing yet, keep going', 't has too many of it', 'They are anagrams'],
            answer: 1,
          },
        },
        {
          say: 'It means t has an extra copy of that letter. Return false right away.',
          speak: 'It means tee has an extra copy of that letter. Return false right away.',
          emphasis: ['false'],
          sfx: 'ding',
          scene: {
            type: 'quiz',
            question: 'Counting t down, a letter’s count hits -1. What does it mean?',
            options: ['Nothing yet, keep going', 't has too many of it', 'They are anagrams'],
            answer: 1,
            reveal: true,
            explain: 't used a letter s ran out of. Not anagrams: return false.',
          },
        },
        {
          say: 'Remember this. If only amounts matter, count instead of searching. Now tap solve it.',
          emphasis: ['amounts', 'count'],
          sfx: 'success',
          scene: {
            type: 'outro',
            points: ['Only amounts matter? *Count* them', 'Count, then compare: still *O(n)*', 'Missing keys start at *0*'],
            tagline: 'Now go solve it.',
          },
        },
      ],
    },

    // ─── Lesson 3: grouping by a key ────────────────────────────────────────────────
    {
      id: 'dsa-hashing-grouping',
      title: 'Grouping by a key',
      link: { label: 'Solve it', href: '/dsa#/m/hashing/grouping/hashing-group-anagrams' },
      beats: [
        {
          say: 'Eat, tea and ate. How does an app know they are family?',
          emphasis: ['family'],
          scene: { type: 'title', kicker: 'Hash maps · Lesson 3', title: 'Sort words into *families*', emoji: '🧩', style: 'slam' },
        },
        {
          say: 'Six words. Eat, tea and ate use the same letters, so they share one group.',
          emphasis: ['same', 'letters'],
          sfx: 'pop',
          scene: {
            type: 'array',
            title: 'Group the anagrams',
            cells: words,
            found: [0, 1, 3],
            vars: { groups: 3 },
            caption: 'tan and nat are one more, bat is alone',
          },
        },
        {
          say: 'The easy way checks each new word against every group so far.',
          emphasis: ['every', 'group'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'pseudo',
            file: 'Brute force',
            code: `function groupAnagrams(words):
    groups ← empty list
    for each w in words:
        for each g in groups:
            if isAnagram(w, g[0]):
                add w to g
                stop
        if w was not added:
            add [w] to groups
    return groups`,
            highlight: [[4, 5]],
            note: { line: 5, text: 'compare with every group', tone: 'warn' },
          },
        },
        {
          say: 'Ate gets compared with eat, then tan, again and again. It’s O of n squared.',
          speak: 'Ate gets compared with eat, then tan, again and again. It’s oh of n squared.',
          emphasis: ['again', 'squared'],
          scene: {
            type: 'array',
            title: 'Spot the waste',
            cells: words,
            pointers: { w: 3 },
            active: [3],
            reads: [0, 2],
            caption: 'is it like that one? asked over and over',
          },
        },
        {
          say: 'What if each word could name its own family? Sort its letters, and that is the key.',
          emphasis: ['key'],
          sfx: 'ding',
          scene: {
            type: 'title',
            kicker: 'The insight',
            title: 'Give each word a *key*',
            emoji: '🔑',
            style: 'slam',
            sub: 'eat, tea and ate all sort to aet',
          },
        },
        {
          say: 'Eat becomes the key A E T. It’s new, so it starts a group.',
          speak: 'Eat becomes the key ay ee tee. It’s new, so it starts a group.',
          emphasis: ['new', 'key'],
          scene: {
            type: 'array',
            title: 'Key = sorted letters',
            cells: words,
            pointers: { w: 0 },
            active: [0],
            vars: { aet: 'eat' },
            caption: 'eat → aet: a new group',
          },
        },
        {
          say: 'Tea has the same key, so it joins that group.',
          emphasis: ['same'],
          scene: {
            type: 'array',
            title: 'Key = sorted letters',
            cells: words,
            pointers: { w: 1 },
            active: [1],
            done: [0],
            vars: { aet: 'eat tea' },
            caption: 'tea → aet: join the group',
          },
        },
        {
          say: 'Tan becomes the key A N T. Also new, so a new group.',
          speak: 'Tan becomes the key ay en tee. Also new, so a new group.',
          emphasis: ['new'],
          scene: {
            type: 'array',
            title: 'Key = sorted letters',
            cells: words,
            pointers: { w: 2 },
            active: [2],
            done: [0, 1],
            vars: { aet: 'eat tea', ant: 'tan' },
            caption: 'tan → ant: a new group',
          },
        },
        {
          say: 'Ate lands right in the first group. It never compared itself with another word.',
          emphasis: ['never'],
          scene: {
            type: 'array',
            title: 'Key = sorted letters',
            cells: words,
            pointers: { w: 3 },
            active: [3],
            done: [0, 1, 2],
            vars: { aet: 'eat tea ate', ant: 'tan' },
            caption: 'ate → aet: no comparing at all',
          },
        },
        {
          say: 'Nat joins tan, and bat starts its own group. The map’s groups are the answer.',
          emphasis: ['answer'],
          sfx: 'success',
          scene: {
            type: 'array',
            title: 'Key = sorted letters',
            cells: words,
            pointers: { w: 5 },
            found: [0, 1, 2, 3, 4, 5],
            vars: { aet: 'eat tea ate', ant: 'tan nat', abt: 'bat' },
            caption: 'one pass, one key per word',
          },
        },
        {
          say: 'In JavaScript, make the key, then add the word to its group.',
          emphasis: ['key'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'groupAnagrams.js',
            code: `function groupAnagrams(words) {
  const groups = new Map();
  for (const w of words) {
    const k = [...w].sort().join('');
    if (!groups.has(k)) {
      groups.set(k, []);
    }
    groups.get(k).push(w);
  }
  return [...groups.values()];
}`,
            highlight: [4],
            note: { line: 4, text: 'one key per word, no comparing', tone: 'good' },
          },
        },
        {
          say: 'Reach for this when the problem says group, or items that are the same in some way.',
          emphasis: ['group', 'same'],
          scene: {
            type: 'list',
            title: 'Reach for this when…',
            items: [
              { text: '*Group* or bucket the items', icon: '🗂️' },
              { text: 'Same pattern, same shape', icon: '🧬' },
              { text: 'The skill is picking the *key*', icon: '🔑' },
            ],
            active: 0,
          },
        },
        {
          say: 'The trap: array keys never match. Each word makes a brand new array. Join it into a string.',
          emphasis: ['never', 'match', 'string'],
          sfx: 'error',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'trap.js',
            code: `const key = [...w].sort();
if (!groups.has(key)) {
  groups.set(key, []);
}`,
            errors: [2],
            note: { line: 2, text: 'a new array: never found', tone: 'bad' },
          },
        },
        {
          say: 'Quick check. Which of these keys groups anagrams correctly?',
          sfx: 'riser',
          scene: {
            type: 'quiz',
            question: 'Which key groups anagrams correctly?',
            options: ['The word’s length', 'Its first letter', 'Sorted letters, as a string', 'Sorted letters, as an array'],
            answer: 2,
          },
        },
        {
          say: 'Sorted letters, as a string. Length and first letter mix families, and an array never matches.',
          emphasis: ['string'],
          sfx: 'ding',
          scene: {
            type: 'quiz',
            question: 'Which key groups anagrams correctly?',
            options: ['The word’s length', 'Its first letter', 'Sorted letters, as a string', 'Sorted letters, as an array'],
            answer: 2,
            reveal: true,
            explain: 'Length and first letter mix families. Arrays never match as keys.',
          },
        },
        {
          say: 'Remember this. Give every item a key, and let the map collect each group. Now tap solve it.',
          emphasis: ['key', 'group'],
          sfx: 'success',
          scene: {
            type: 'outro',
            points: ['Pick a *key*, the map groups', 'Same family means same key', 'Keys are *strings*, never arrays'],
            tagline: 'Now go solve it.',
          },
        },
      ],
    },

    // ─── Lesson 4: sets for existence ───────────────────────────────────────────────
    {
      id: 'dsa-hashing-sets',
      title: 'Sets for existence',
      link: { label: 'Solve it', href: '/dsa#/m/hashing/sets/hashing-longest-consecutive' },
      beats: [
        {
          say: 'Your workout days, all jumbled up. What’s your longest streak?',
          emphasis: ['longest', 'streak'],
          scene: { type: 'title', kicker: 'Hash maps · Lesson 4', title: 'Find the *longest* streak', emoji: '🔥', style: 'slam' },
        },
        {
          say: 'Days one, two, three and four are back to back. So the longest streak is four.',
          emphasis: ['four'],
          sfx: 'pop',
          scene: {
            type: 'array',
            title: 'Workout days',
            cells: days,
            found: [3, 5, 4, 1],
            vars: { streak: '1 2 3 4', best: 4 },
            caption: 'random order, and no sorting allowed',
          },
        },
        {
          say: 'The easy way counts up from every day. Each lookup scans the whole array.',
          emphasis: ['scans'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'pseudo',
            file: 'Brute force',
            code: `function longestStreak(nums):
    best ← 0
    for each x in nums:
        length ← 1
        while x + length is in nums:
            length ← length + 1
        best ← max(best, length)
    return best`,
            highlight: [5],
            note: { line: 5, text: 'scans the whole array', tone: 'warn' },
          },
        },
        {
          say: 'A set makes lookups fast. But from two, you walk three and four again.',
          emphasis: ['again'],
          scene: {
            type: 'array',
            title: 'Spot the waste',
            cells: days,
            pointers: { x: 5 },
            active: [5],
            reads: [4, 1],
            caption: 'from 2, the walk 3, 4 happens again',
          },
        },
        {
          say: 'A day starts a streak only when the day before is missing. Count from there.',
          emphasis: ['starts', 'missing'],
          sfx: 'ding',
          scene: {
            type: 'title',
            kicker: 'The insight',
            title: 'Only start at the *start*',
            emoji: '💡',
            style: 'slam',
            sub: 'x starts a streak when x - 1 is not in the set',
          },
        },
        {
          say: 'A hundred has no ninety-nine, so it’s a start. But no hundred and one, so length one.',
          emphasis: ['start'],
          scene: {
            type: 'array',
            title: 'Walk the set',
            cells: days,
            pointers: { x: 0 },
            active: [0],
            vars: { 'x - 1': '99: no', walk: '100', best: 1 },
          },
        },
        {
          say: 'Four has a three before it. It’s in the middle of a streak, so skip it.',
          emphasis: ['skip'],
          scene: {
            type: 'array',
            title: 'Walk the set',
            cells: days,
            pointers: { x: 1 },
            active: [1],
            done: [0],
            vars: { 'x - 1': '3: yes', walk: 'skip', best: 1 },
          },
        },
        {
          say: 'Two hundred is a start, but it’s all alone. Length one again.',
          emphasis: ['alone'],
          scene: {
            type: 'array',
            title: 'Walk the set',
            cells: days,
            pointers: { x: 2 },
            active: [2],
            done: [0, 1],
            vars: { 'x - 1': '199: no', walk: '200', best: 1 },
          },
        },
        {
          say: 'One has no zero before it. So walk up through two, three and four. A streak of four!',
          emphasis: ['four'],
          sfx: 'pop',
          scene: {
            type: 'array',
            title: 'Walk the set',
            cells: days,
            pointers: { x: 3 },
            active: [3],
            reads: [5, 4, 1],
            done: [0, 2],
            vars: { 'x - 1': '0: no', walk: '1 2 3 4', best: 4 },
          },
        },
        {
          say: 'Three and two both have a day before them, so skip. Each day was walked at most once.',
          emphasis: ['once'],
          sfx: 'success',
          scene: {
            type: 'array',
            title: 'Walk the set',
            cells: days,
            pointers: { x: 5 },
            found: [3, 5, 4, 1],
            done: [0, 2],
            vars: { 'x - 1': '1: yes', walk: 'skip', best: 4 },
          },
        },
        {
          say: 'In JavaScript, skip days that aren’t a start. Every day gets walked once. That’s O of n.',
          speak: 'In JavaScript, skip days that aren’t a start. Every day gets walked once. That’s oh of n.',
          emphasis: ['skip', 'once'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'longestStreak.js',
            code: `function longestConsecutive(nums) {
  const days = new Set(nums);
  let best = 0;
  for (const x of days) {
    if (days.has(x - 1)) continue;
    let len = 1;
    while (days.has(x + len)) len++;
    best = Math.max(best, len);
  }
  return best;
}`,
            highlight: [5],
            note: { line: 5, text: 'not a start: skip. O(n) total', tone: 'good' },
          },
        },
        {
          say: 'Reach for a set when all you need is yes or no. Have I seen it?',
          emphasis: ['yes', 'no'],
          scene: {
            type: 'list',
            title: 'Reach for this when…',
            items: [
              { text: 'Duplicate, unique, *seen it*', icon: '👀' },
              { text: 'Is the *neighbour* there?', icon: '↔️' },
              { text: 'Need yes or no, not a value', icon: '✅' },
            ],
            active: 2,
          },
        },
        {
          say: 'The trap: loop over nums, and every copy of one walks the whole streak again. Loop over the set.',
          emphasis: ['copy', 'set'],
          sfx: 'error',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'trap.js',
            code: `// nums = [1, 1, 1, 2, 3, ...]
for (const x of nums) {
  if (days.has(x - 1)) continue;
  // walk up the streak...
}`,
            errors: [2],
            note: { line: 2, text: 'each copy of 1 walks again', tone: 'bad' },
          },
        },
        {
          say: 'Quick check. When should you start counting up from x?',
          sfx: 'riser',
          scene: {
            type: 'quiz',
            question: 'When do you start counting up from x?',
            options: ['Always', 'When x + 1 is in the set', 'When x - 1 is not in the set'],
            answer: 2,
          },
        },
        {
          say: 'Only when x minus one is missing. Otherwise x is in the middle, and the start counts it.',
          emphasis: ['missing', 'middle'],
          sfx: 'ding',
          scene: {
            type: 'quiz',
            question: 'When do you start counting up from x?',
            options: ['Always', 'When x + 1 is in the set', 'When x - 1 is not in the set'],
            answer: 2,
            reveal: true,
            explain: 'If x - 1 is there, x is mid-streak. Its start will count it.',
          },
        },
        {
          say: 'Remember this. A set answers in one step, so only count from a streak’s start. Now tap solve it.',
          emphasis: ['set', 'start'],
          sfx: 'success',
          scene: {
            type: 'outro',
            points: ['A *Set* answers “seen it?” fast', 'Only count from a streak’s *start*', 'Loop over the set, not the array'],
            tagline: 'Now go solve it.',
          },
        },
      ],
    },

    // ─── Lesson 5: prefix sums ──────────────────────────────────────────────────────
    {
      id: 'dsa-hashing-prefix-sums',
      title: 'Prefix sums',
      link: { label: 'Solve it', href: '/dsa#/m/hashing/prefix-sums/hashing-range-sum-query' },
      beats: [
        {
          say: 'Pick any hours in your step app. It sums them instantly. How?',
          emphasis: ['instantly'],
          scene: { type: 'title', kicker: 'Hash maps · Lesson 5', title: 'Sum any range *instantly*', emoji: '👟', style: 'slam' },
        },
        {
          say: 'Steps per hour, in hundreds. Hours one to three hold five, one and four. That’s ten.',
          emphasis: ['ten'],
          sfx: 'pop',
          scene: {
            type: 'array',
            title: 'Steps per hour',
            cells: hours,
            pointers: { L: 1, R: 3 },
            window: [1, 3],
            found: [1, 2, 3],
            vars: { sum: '5 + 1 + 4 = 10' },
          },
        },
        {
          say: 'The easy way adds up the range from scratch, for every single question.',
          emphasis: ['scratch', 'every'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'pseudo',
            file: 'Brute force',
            code: `function rangeSums(nums, queries):
    answers ← empty list
    for each (left, right) in queries:
        total ← 0
        for i from left to right:
            total ← total + nums[i]
        append total to answers
    return answers`,
            highlight: [[5, 6]],
            note: { line: 6, text: 're-adds the range every time', tone: 'warn' },
          },
        },
        {
          say: 'Ten thousand of each? That’s a hundred million additions.',
          emphasis: ['hundred', 'million'],
          sfx: 'error',
          scene: {
            type: 'stat',
            value: '100M',
            label: 'additions for *10,000* questions',
            sub: 'over 10,000 hours: O(q · n)',
            tone: 'bad',
          },
        },
        {
          say: 'Hours one to three, then hours zero to four. Both add five, one and four again.',
          emphasis: ['again'],
          scene: {
            type: 'array',
            title: 'Spot the waste',
            cells: hours,
            pointers: { L: 0, R: 4 },
            window: [0, 4],
            reads: [1, 2, 3],
            caption: '5 + 1 + 4, added all over again',
          },
        },
        {
          say: 'So add up once, from the left, and save the running total at each step.',
          emphasis: ['once', 'running'],
          sfx: 'ding',
          scene: {
            type: 'title',
            kicker: 'The insight',
            title: 'Save the *running total*',
            emoji: '💡',
            style: 'slam',
            sub: 'pre[i] is the sum of the first i numbers',
          },
        },
        {
          say: 'Pre gets one extra slot. Pre of zero is zero, the sum of no numbers at all.',
          emphasis: ['extra', 'zero'],
          scene: {
            type: 'array',
            title: 'Build pre from 2, 5, 1, 4, 3',
            cells: [0, '', '', '', '', ''],
            pointers: { i: 0 },
            active: [0],
            vars: { step: 'pre[0] = 0' },
          },
        },
        {
          say: 'Each slot is the slot before, plus one more number. Zero plus two, then two plus five.',
          emphasis: ['before'],
          scene: {
            type: 'array',
            title: 'Build pre from 2, 5, 1, 4, 3',
            cells: [0, 2, 7, '', '', ''],
            pointers: { i: 2 },
            active: [2],
            reads: [1],
            vars: { step: '2 + 5 = 7' },
          },
        },
        {
          say: 'Keep going to the end: eight, twelve, fifteen. One pass, done only once.',
          emphasis: ['once'],
          scene: {
            type: 'array',
            title: 'Build pre from 2, 5, 1, 4, 3',
            cells: [0, 2, 7, 8, 12, 15],
            pointers: { i: 5 },
            active: [5],
            reads: [4],
            vars: { step: '12 + 3 = 15' },
          },
        },
        {
          say: 'Hours one to three? That’s pre of four, minus pre of one. Twelve minus two is ten.',
          emphasis: ['minus', 'ten'],
          sfx: 'success',
          scene: {
            type: 'array',
            title: 'Build pre from 2, 5, 1, 4, 3',
            cells: [0, 2, 7, 8, 12, 15],
            pointers: { l: 1, 'r+1': 4 },
            found: [1, 4],
            vars: { step: '12 - 2 = 10' },
          },
        },
        {
          say: 'In JavaScript, build pre once. Then every question is one subtraction.',
          emphasis: ['once', 'subtraction'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'rangeSums.js',
            code: `function rangeSums(nums, queries) {
  const n = nums.length;
  const pre = Array(n + 1).fill(0);
  for (let i = 0; i < n; i++) {
    pre[i + 1] = pre[i] + nums[i];
  }
  return queries.map(([l, r]) =>
    pre[r + 1] - pre[l]);
}`,
            highlight: [8],
            note: { line: 8, text: 'O(1) per question: O(n + q)', tone: 'good' },
          },
        },
        {
          say: 'Reach for this to sum ranges, when the array never changes.',
          emphasis: ['ranges', 'never'],
          scene: {
            type: 'list',
            title: 'Reach for this when…',
            items: [
              { text: 'Sum of a *range* or subarray', icon: '📏' },
              { text: 'Many questions, *fixed* array', icon: '🔒' },
              { text: 'Left side versus right side', icon: '⚖️' },
            ],
            active: 1,
          },
        },
        {
          say: 'The trap: skip the zero slot, and a range from zero reads pre of minus one. That’s NaN.',
          speak: 'The trap: skip the zero slot, and a range from zero reads pre of minus one. That’s nan.',
          emphasis: ['zero', 'slot'],
          sfx: 'error',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'trap.js',
            code: `// no leading 0 slot:
sum = pre[r] - pre[l - 1];`,
            errors: [2],
            note: { line: 2, text: 'l = 0 reads pre[-1]: NaN', tone: 'bad' },
          },
        },
        {
          say: 'Quick check. Using pre, what’s the sum from index two to four?',
          sfx: 'riser',
          scene: {
            type: 'quiz',
            question: 'pre is [0,2,7,8,12,15]. What is the sum of nums[2..4]?',
            options: ['pre[4] - pre[2] = 5', 'pre[5] - pre[2] = 8', 'pre[5] - pre[1] = 13'],
            answer: 1,
          },
        },
        {
          say: 'Take pre of five, minus pre of two. Fifteen minus seven is eight.',
          emphasis: ['eight'],
          sfx: 'ding',
          scene: {
            type: 'quiz',
            question: 'pre is [0,2,7,8,12,15]. What is the sum of nums[2..4]?',
            options: ['pre[4] - pre[2] = 5', 'pre[5] - pre[2] = 8', 'pre[5] - pre[1] = 13'],
            answer: 1,
            reveal: true,
            explain: 'pre[right + 1] - pre[left] = 15 - 7 = 8, which is 1 + 4 + 3.',
          },
        },
        {
          say: 'Remember this. Build the running totals once, and any range is one subtraction. Now tap solve it.',
          emphasis: ['once', 'subtraction'],
          sfx: 'success',
          scene: {
            type: 'outro',
            points: ['Build running totals *once*', 'Range = pre[r + 1] - pre[l]', 'A leading *0* saves the edge case'],
            tagline: 'Now go solve it.',
          },
        },
      ],
    },

    // ─── Lesson 6: prefix sums + hash map ───────────────────────────────────────────
    {
      id: 'dsa-hashing-prefix-sum-hash-map',
      title: 'Prefix sums + hash map',
      link: { label: 'Solve it', href: '/dsa#/m/hashing/prefix-sum-hash-map/hashing-subarray-sum-k' },
      beats: [
        {
          say: 'Which runs of days moved your balance by exactly three?',
          emphasis: ['exactly', 'three'],
          scene: { type: 'title', kicker: 'Hash maps · Lesson 6', title: 'Stretches that add up to *k*', emoji: '🏦', style: 'slam' },
        },
        {
          say: 'Five days of deposits and withdrawals, and k is three. Three stretches add up to exactly three.',
          emphasis: ['three'],
          sfx: 'pop',
          scene: {
            type: 'array',
            title: 'Daily changes, k = 3',
            cells: ledger,
            window: [0, 3],
            found: [0, 1, 2, 3],
            vars: { count: 3 },
            caption: '[1, 2], [2, 1] and [1, 2, 1, -1]',
          },
        },
        {
          say: 'The easy way tries every start and every end. It’s O of n squared.',
          speak: 'The easy way tries every start and every end. It’s oh of n squared.',
          emphasis: ['start', 'end', 'squared'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'pseudo',
            file: 'Brute force',
            code: `function subarraySum(nums, k):
    count ← 0
    for i from 0 to n - 1:
        total ← 0
        for j from i to n - 1:
            total ← total + nums[j]
            if total = k:
                count ← count + 1
    return count`,
            highlight: [3, 5],
            note: { line: 5, text: 'every start, every end', tone: 'warn' },
          },
        },
        {
          say: 'At each end, you only need to know how many starts work. But it tries them all.',
          emphasis: ['starts', 'all'],
          scene: {
            type: 'array',
            title: 'Spot the waste',
            cells: ledger,
            pointers: { j: 3 },
            active: [3],
            reads: [0, 1, 2],
            caption: 'which starts make the sum 3?',
          },
        },
        {
          say: 'A stretch ending today adds to three when an earlier running total is three lower.',
          emphasis: ['earlier', 'lower'],
          sfx: 'ding',
          scene: {
            type: 'title',
            kicker: 'The insight',
            title: 'Flip the *question*',
            emoji: '💡',
            style: 'slam',
            sub: 'look up earlier totals equal to total - k',
          },
        },
        {
          say: 'Seed the map with zero, the total before day one. Day one makes one. No match.',
          emphasis: ['zero', 'one'],
          scene: {
            type: 'grid',
            title: 'Running totals, k = 3',
            rowLabels: ['day', 'sum'],
            cells: [
              ['', 1, '', '', '', ''],
              [0, 1, '', '', '', ''],
            ],
            active: [[1, 1]],
            vars: { need: '1 - 3 = -2', count: 0 },
            caption: 'every total goes into the map',
          },
        },
        {
          say: 'Day two makes three. We need zero, and the seed is zero. That’s the stretch one, two.',
          emphasis: ['seed'],
          sfx: 'pop',
          scene: {
            type: 'grid',
            title: 'Running totals, k = 3',
            rowLabels: ['day', 'sum'],
            cells: [
              ['', 1, 2, '', '', ''],
              [0, 1, 3, '', '', ''],
            ],
            active: [[1, 2]],
            found: [[1, 0]],
            vars: { need: '3 - 3 = 0', count: 1 },
            caption: 'the stretch [1, 2]',
          },
        },
        {
          say: 'Day three makes four. We need one, and it’s in the map. That’s the stretch two, one.',
          emphasis: ['one'],
          sfx: 'pop',
          scene: {
            type: 'grid',
            title: 'Running totals, k = 3',
            rowLabels: ['day', 'sum'],
            cells: [
              ['', 1, 2, 1, '', ''],
              [0, 1, 3, 4, '', ''],
            ],
            active: [[1, 3]],
            found: [[1, 1]],
            vars: { need: '4 - 3 = 1', count: 2 },
            caption: 'the stretch [2, 1]',
          },
        },
        {
          say: 'Day four drops back to three. We need zero again: the first four days. Count three.',
          emphasis: ['again'],
          sfx: 'pop',
          scene: {
            type: 'grid',
            title: 'Running totals, k = 3',
            rowLabels: ['day', 'sum'],
            cells: [
              ['', 1, 2, 1, -1, ''],
              [0, 1, 3, 4, 3, ''],
            ],
            active: [[1, 4]],
            found: [[1, 0]],
            vars: { need: '3 - 3 = 0', count: 3 },
            caption: 'the stretch [1, 2, 1, -1]',
          },
        },
        {
          say: 'Day five makes five. We need two, and there is none. The answer is three, in one pass.',
          emphasis: ['three', 'one', 'pass'],
          sfx: 'success',
          scene: {
            type: 'grid',
            title: 'Running totals, k = 3',
            rowLabels: ['day', 'sum'],
            cells: [
              ['', 1, 2, 1, -1, 2],
              [0, 1, 3, 4, 3, 5],
            ],
            active: [[1, 5]],
            vars: { need: '5 - 3 = 2', count: 3 },
            caption: 'no 2 in the map: count stays 3',
          },
        },
        {
          say: 'In JavaScript, look up total minus k first, then record the total. One loop, so O of n.',
          speak: 'In JavaScript, look up total minus k first, then record the total. One loop, so oh of n.',
          emphasis: ['first', 'record'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'subarraySum.js',
            code: `function subarraySum(nums, k) {
  const seen = new Map([[0, 1]]);
  let total = 0, count = 0;
  for (const x of nums) {
    total += x;
    count += seen.get(total - k) ?? 0;
    const c = seen.get(total) ?? 0;
    seen.set(total, c + 1);
  }
  return count;
}`,
            highlight: [6],
            note: { line: 6, text: 'look up before you record', tone: 'good' },
          },
        },
        {
          say: 'Reach for this when you count subarrays with a sum, especially when numbers can be negative.',
          emphasis: ['count', 'negative'],
          scene: {
            type: 'list',
            title: 'Reach for this when…',
            items: [
              { text: '*Count* subarrays with sum k', icon: '🔢' },
              { text: 'Numbers can be *negative*', icon: '➖' },
              { text: 'Longest run with a balance', icon: '⚖️' },
            ],
            active: 1,
          },
        },
        {
          say: 'The trap: forget the zero seed, and stretches that start on day one vanish. You get one, not three.',
          emphasis: ['seed', 'vanish'],
          sfx: 'error',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'trap.js',
            code: `const seen = new Map();
// [1, 2, 1, -1, 2], k = 3
// count is 1, not 3`,
            errors: [1],
            note: { line: 1, text: 'needs [[0, 1]]: the empty start', tone: 'bad' },
          },
        },
        {
          say: 'Quick check. Why can’t a sliding window solve this when numbers can be negative?',
          sfx: 'riser',
          scene: {
            type: 'quiz',
            question: 'Why can’t a sliding window count these stretches?',
            options: ['It is too slow', 'Growing it can lower the sum', 'It needs a sorted array'],
            answer: 1,
          },
        },
        {
          say: 'With negatives, a bigger window can shrink the sum. You can’t tell which way to move.',
          emphasis: ['shrink'],
          sfx: 'ding',
          scene: {
            type: 'quiz',
            question: 'Why can’t a sliding window count these stretches?',
            options: ['It is too slow', 'Growing it can lower the sum', 'It needs a sorted array'],
            answer: 1,
            reveal: true,
            explain: 'Windows need bigger window, bigger sum. Negatives break that.',
          },
        },
        {
          say: 'Remember this. Every stretch is a difference of two totals. Look one up in a map. Now tap solve it.',
          emphasis: ['difference', 'map'],
          sfx: 'success',
          scene: {
            type: 'outro',
            points: ['Stretch = total now - total *before*', 'Seed the map with *{0: 1}*', 'Look up first, then record'],
            tagline: 'Now go solve it.',
          },
        },
      ],
    },
  ],
};
