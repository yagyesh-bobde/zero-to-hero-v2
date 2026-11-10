import type { Series } from '../types';

// /dsa/reels module 3. One reel per lesson of src/dsa/modules/03-two-pointers*.ts, in lesson order.
// Brief: src/reels/dsa/README.md. Rules: src/reels/AUTHORING.md.

const prices = [2, 7, 11, 15, 24, 31, 40];
const songs = [1, 1, 2, 3, 3, 3, 4];
const topSpot = ['T', 'o', 'p', '␣', 's', 'p', 'o', 't', '!'];
const laundry = [2, 0, 2, 1, 1, 0];
const sortedLaundry = [0, 0, 1, 1, 2, 2];
const ledger = [-1, 0, 1, 2, -1, -4];
const sortedLedger = [-4, -1, -1, 0, 1, 2];

export const series: Series = {
  id: 'dsa-two-pointers',
  title: 'Two pointers',
  emoji: '👉',
  color: '#22d3ee',
  order: 3,
  blurb: 'Walk an array from both ends (or at two speeds) to kill the nested loop.',
  reels: [
    // ── Lesson 1: opposite ends ─────────────────────────────────────────────
    {
      id: 'dsa-two-pointers-opposite-ends',
      title: 'Opposite ends on sorted data',
      link: { label: 'Solve it', href: '/dsa#/m/two-pointers/opposite-ends/two-pointers-two-sum-sorted' },
      beats: [
        {
          say: 'A thirty-five dollar gift card. Which two games use every cent?',
          emphasis: ['every', 'cent'],
          scene: { type: 'title', kicker: 'Two pointers · Lesson 1', title: 'Spend the card *exactly*', emoji: '🎮', style: 'slam' },
        },
        {
          say: 'The prices are sorted, cheapest first. Eleven plus twenty-four is exactly thirty-five. That is our pair.',
          emphasis: ['sorted', 'exactly'],
          sfx: 'pop',
          scene: {
            type: 'array',
            title: 'Game prices, sorted',
            cells: prices,
            pointers: { L: 2, R: 4 },
            found: [2, 4],
            vars: { sum: 35, card: 35 },
            caption: 'two games, every cent spent',
          },
        },
        {
          say: 'The easy way tries every pair. Pick one game, then try every game after it.',
          emphasis: ['every', 'pair'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'pseudo',
            file: 'Brute force',
            code: `function twoSumSorted(a, target):
    for i from 0 to n - 2:
        for j from i + 1 to n - 1:
            if a[i] + a[j] = target:
                return [i, j]
    return []`,
            highlight: [[2, 3]],
            note: { line: 3, text: 'a loop inside a loop', tone: 'warn' },
          },
        },
        {
          say: 'That is O of n squared. A store with a hundred thousand games means five billion checks.',
          speak: 'That is oh of n squared. A store with a hundred thousand games means five billion checks.',
          emphasis: ['squared', 'billion'],
          sfx: 'error',
          scene: {
            type: 'stat',
            value: '5B',
            label: 'checks for *100,000* games',
            sub: 'O(n²): almost all of them useless',
            tone: 'bad',
          },
        },
        {
          say: 'Two plus forty is forty-two, too much. Forty fails with every game, but brute force still tries them all.',
          emphasis: ['fails', 'still'],
          scene: {
            type: 'array',
            title: 'Spot the waste',
            cells: prices,
            pointers: { L: 0, R: 6 },
            active: [6],
            reads: [1, 2, 3, 4, 5],
            caption: 'one check rules out a whole row',
          },
        },
        {
          say: 'So every check throws one end away for good. Too big, drop the right. Too small, drop the left.',
          emphasis: ['big', 'small'],
          sfx: 'ding',
          scene: { type: 'title', kicker: 'The insight', title: 'Each check drops *one* end', emoji: '💡', style: 'slam' },
        },
        {
          say: 'Left pointer on the cheapest, right on the priciest. Two plus forty is forty-two, too big.',
          emphasis: ['cheapest', 'priciest'],
          scene: {
            type: 'array',
            title: 'Two pointers, target 35',
            cells: prices,
            pointers: { L: 0, R: 6 },
            active: [0, 6],
            vars: { sum: 42, target: 35 },
            caption: 'too big: drop 40, R moves left',
          },
        },
        {
          say: 'Two plus thirty-one is thirty-three, too small. Even the priciest game cannot save two, so L moves right.',
          emphasis: ['small', 'priciest'],
          scene: {
            type: 'array',
            title: 'Two pointers, target 35',
            cells: prices,
            pointers: { L: 0, R: 5 },
            active: [0, 5],
            done: [6],
            vars: { sum: 33, target: 35 },
            caption: 'too small: drop 2, L moves right',
          },
        },
        {
          say: 'Seven plus thirty-one is thirty-eight. Too big, so thirty-one goes and R steps left.',
          emphasis: ['big'],
          scene: {
            type: 'array',
            title: 'Two pointers, target 35',
            cells: prices,
            pointers: { L: 1, R: 5 },
            active: [1, 5],
            done: [0, 6],
            vars: { sum: 38, target: 35 },
            caption: 'too big: drop 31',
          },
        },
        {
          say: 'Seven plus twenty-four is thirty-one. Too small, so seven goes and L steps right.',
          emphasis: ['small'],
          scene: {
            type: 'array',
            title: 'Two pointers, target 35',
            cells: prices,
            pointers: { L: 1, R: 4 },
            active: [1, 4],
            done: [0, 5, 6],
            vars: { sum: 31, target: 35 },
            caption: 'too small: drop 7',
          },
        },
        {
          say: 'Eleven plus twenty-four is thirty-five. Found it in five checks, not twenty-one.',
          emphasis: ['five', 'checks'],
          sfx: 'success',
          scene: {
            type: 'array',
            title: 'Two pointers, target 35',
            cells: prices,
            pointers: { L: 2, R: 4 },
            found: [2, 4],
            done: [0, 1, 5, 6],
            vars: { sum: 35, target: 35 },
            caption: 'found in 5 checks, not 21',
          },
        },
        {
          say: 'In JavaScript, it is one loop. Each step drops one end, so it is O of n, with no extra memory.',
          speak: 'In JavaScript, it is one loop. Each step drops one end, so it is oh of n, with no extra memory.',
          emphasis: ['one', 'end'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'twoSumSorted.js',
            code: `function twoSumSorted(a, target) {
  let L = 0;
  let R = a.length - 1;
  while (L < R) {
    const sum = a[L] + a[R];
    if (sum === target) return [L, R];
    if (sum > target) R--;
    else L++;
  }
  return [];
}`,
            highlight: [[7, 8]],
            note: { line: 8, text: 'one end gone per step: O(n)', tone: 'good' },
          },
        },
        {
          say: 'The trap is looping while L is less than or equal to R. When they meet, one game counts twice.',
          emphasis: ['equal', 'twice'],
          sfx: 'error',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'trap.js',
            code: `// a = [1, 5, 8], target = 10
while (L <= R) {
  const sum = a[L] + a[R];
  if (sum === target) return [L, R];
}`,
            errors: [2],
            note: { line: 2, text: 'L = R: 5 + 5 counts as a pair', tone: 'bad' },
          },
        },
        {
          say: 'Quick check. Target eighteen, L on three, R on twenty. The sum is twenty-three. What moves?',
          emphasis: ['moves'],
          sfx: 'riser',
          scene: {
            type: 'quiz',
            question: 'Target 18. L is on 3, R is on 20, so the sum is 23. What moves?',
            options: ['L moves right', 'R moves left', 'Both move', 'Stop, no answer'],
            answer: 1,
          },
        },
        {
          say: 'R moves left. Twenty is too big even with the smallest number, so it can never be in the answer.',
          emphasis: ['never'],
          sfx: 'ding',
          scene: {
            type: 'quiz',
            question: 'Target 18. L is on 3, R is on 20, so the sum is 23. What moves?',
            options: ['L moves right', 'R moves left', 'Both move', 'Stop, no answer'],
            answer: 1,
            reveal: true,
            explain: '23 is too big. 20 fails even with 3, so drop it.',
          },
        },
        {
          say: 'Remember this. Sorted pairs start at both ends, and every check drops one end. Now tap solve it and try it yourself.',
          emphasis: ['both', 'ends'],
          sfx: 'success',
          scene: {
            type: 'outro',
            points: ['Sorted pairs: start at *both ends*', 'Too big, drop R. Too small, drop L', 'Loop while *L < R*'],
            tagline: 'Now go solve it.',
          },
        },
      ],
    },

    // ── Lesson 2: read/write pointer ─────────────────────────────────────────
    {
      id: 'dsa-two-pointers-read-write',
      title: 'Read/write pointer (in place)',
      link: { label: 'Solve it', href: '/dsa#/m/two-pointers/read-write/two-pointers-remove-duplicates' },
      beats: [
        {
          say: 'Repeated songs, a cheap phone, and no room for a copy. Now what?',
          emphasis: ['copy'],
          scene: { type: 'title', kicker: 'Two pointers · Lesson 2', title: 'Clean it *in place*', emoji: '🎵', style: 'slam' },
        },
        {
          say: 'The song IDs are sorted, so repeats sit side by side. Keep each one once, packed at the front.',
          speak: 'The song I Ds are sorted, so repeats sit side by side. Keep each one once, packed at the front.',
          emphasis: ['once', 'front'],
          sfx: 'pop',
          scene: {
            type: 'array',
            title: 'Sorted song IDs',
            cells: songs,
            found: [0, 2, 3, 6],
            vars: { keep: '1, 2, 3, 4', k: 4 },
            caption: 'no second array allowed',
          },
        },
        {
          say: 'The easy way deletes each repeat by shifting everything after it left. That is O of n squared.',
          speak: 'The easy way deletes each repeat by shifting everything after it left. That is oh of n squared.',
          emphasis: ['shifting', 'squared'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'pseudo',
            file: 'Brute force',
            code: `function removeDuplicates(a):
    size ← n
    i ← 1
    while i < size:
        if a[i] = a[i - 1]:
            for j from i to size - 2:
                a[j] ← a[j + 1]
            size ← size - 1
        else:
            i ← i + 1
    return size`,
            highlight: [[6, 7]],
            note: { line: 7, text: 'O(n²): shifts the whole tail', tone: 'warn' },
          },
        },
        {
          say: 'Look at the four. It shifts left once for every repeat before it. That is three moves for one song.',
          emphasis: ['four', 'three'],
          scene: {
            type: 'array',
            title: 'Spot the waste',
            cells: songs,
            active: [6],
            reads: [3],
            caption: '4 shifts once per repeat before it',
          },
        },
        {
          say: 'Use two pointers going the same way. Read visits every cell, and write marks where the next keeper goes.',
          emphasis: ['read', 'write'],
          sfx: 'ding',
          scene: { type: 'title', kicker: 'The insight', title: 'One reads, one *writes*', emoji: '💡', style: 'slam' },
        },
        {
          say: 'The first song always stays. Read finds another one, the same as the last keeper, so skip it.',
          emphasis: ['skip'],
          scene: {
            type: 'array',
            title: 'Read and write',
            cells: songs,
            pointers: { write: 1, read: 1 },
            active: [1],
            found: [0],
            vars: { kept: 1 },
            caption: 'a repeat: write waits',
          },
        },
        {
          say: 'Two is new. Copy it to the write spot, then write steps forward.',
          emphasis: ['new', 'copy'],
          scene: {
            type: 'array',
            title: 'Read and write',
            cells: [1, 2, 2, 3, 3, 3, 4],
            pointers: { write: 2, read: 2 },
            active: [2],
            found: [0, 1],
            vars: { kept: 2 },
            caption: 'new: copy 2 into a[1]',
          },
        },
        {
          say: 'Three is new too. Copy it into slot two, and write moves on again.',
          emphasis: ['new'],
          scene: {
            type: 'array',
            title: 'Read and write',
            cells: [1, 2, 3, 3, 3, 3, 4],
            pointers: { write: 3, read: 3 },
            active: [3],
            found: [0, 1, 2],
            vars: { kept: 3 },
            caption: 'new: copy 3 into a[2]',
          },
        },
        {
          say: 'The next two threes are repeats. Write waits, while read keeps going.',
          emphasis: ['waits', 'going'],
          scene: {
            type: 'array',
            title: 'Read and write',
            cells: [1, 2, 3, 3, 3, 3, 4],
            pointers: { write: 3, read: 5 },
            active: [5],
            found: [0, 1, 2],
            vars: { kept: 3 },
            caption: 'repeats: read moves, write waits',
          },
        },
        {
          say: 'Four is new. It jumps straight to slot three in a single move.',
          emphasis: ['single', 'move'],
          scene: {
            type: 'array',
            title: 'Read and write',
            cells: [1, 2, 3, 4, 3, 3, 4],
            pointers: { write: 4, read: 6 },
            active: [6],
            found: [0, 1, 2, 3],
            vars: { kept: 4 },
            caption: 'new: copy 4 into a[3]',
          },
        },
        {
          say: 'Read is done. Write is four, so the answer is the first four cells. The rest is leftover junk.',
          emphasis: ['four', 'junk'],
          sfx: 'success',
          scene: {
            type: 'array',
            title: 'Read and write',
            cells: [1, 2, 3, 4, 3, 3, 4],
            pointers: { write: 4, read: 7 },
            found: [0, 1, 2, 3],
            done: [4, 5, 6],
            vars: { kept: 4 },
            caption: 'k = write = 4',
          },
        },
        {
          say: 'In JavaScript, copy only when the value differs from the last keeper. Each value moves once, so it is O of n.',
          speak: 'In JavaScript, copy only when the value differs from the last keeper. Each value moves once, so it is oh of n.',
          emphasis: ['once'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'removeDuplicates.js',
            code: `function removeDuplicates(a) {
  if (a.length === 0) return 0;
  let w = 1; // write spot
  for (let r = 1; r < a.length; r++) {
    if (a[r] !== a[w - 1]) {
      a[w] = a[r];
      w++;
    }
  }
  return w;
}`,
            highlight: [[5, 6]],
            note: { line: 6, text: 'each value moves once: O(n)', tone: 'good' },
          },
        },
        {
          say: 'The trap: compare with what you kept. To keep two of each, the cell two back may already be overwritten.',
          emphasis: ['kept', 'overwritten'],
          sfx: 'error',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'keepTwo.js',
            code: `let w = 2;
for (let r = 2; r < a.length; r++) {
  if (a[r] !== a[r - 2]) {
    a[w] = a[r];
    w++;
  }
}`,
            errors: [3],
            note: { line: 3, text: 'a[r - 2] may be overwritten', tone: 'bad' },
          },
        },
        {
          say: 'Quick check. You remove repeats from two, two, three, three, three, five. What is k?',
          emphasis: ['k'],
          sfx: 'riser',
          scene: {
            type: 'quiz',
            question: 'Remove repeats from [2, 2, 3, 3, 3, 5]. What is k?',
            options: ['k = 3', 'k = 2', 'k = 5', 'k = 6'],
            answer: 0,
          },
        },
        {
          say: 'It is three. Each value stays once, so two, three and five fill the front.',
          emphasis: ['three'],
          sfx: 'ding',
          scene: {
            type: 'quiz',
            question: 'Remove repeats from [2, 2, 3, 3, 3, 5]. What is k?',
            options: ['k = 3', 'k = 2', 'k = 5', 'k = 6'],
            answer: 0,
            reveal: true,
            explain: 'Keepers 2, 3, 5 fill the front. write ends at 3.',
          },
        },
        {
          say: 'Remember this. Read scans everything, write marks the end of the finished part. Now tap solve it and try it yourself.',
          emphasis: ['read', 'write'],
          sfx: 'success',
          scene: {
            type: 'outro',
            points: ['*read* scans, *write* keeps', 'Change only the keep rule', 'Compare with what you *kept*'],
            tagline: 'Now go solve it.',
          },
        },
      ],
    },

    // ── Lesson 3: palindromes ────────────────────────────────────────────────
    {
      id: 'dsa-two-pointers-palindromes',
      title: 'Palindromes',
      link: { label: 'Solve it', href: '/dsa#/m/two-pointers/palindromes/two-pointers-valid-palindrome' },
      beats: [
        {
          say: 'Was it a car or a cat I saw? Now read it backwards.',
          emphasis: ['backwards'],
          scene: { type: 'title', kicker: 'Two pointers · Lesson 3', title: 'Same *both ways*?', emoji: '🪞', style: 'slam' },
        },
        {
          say: 'Ignore spaces and marks, and treat big and small letters the same. Then top spot reads the same both ways.',
          emphasis: ['ignore', 'same'],
          sfx: 'pop',
          scene: {
            type: 'array',
            title: 'Is "Top spot!" a palindrome?',
            cells: topSpot,
            found: [0, 1, 2, 4, 5, 6, 7],
            done: [3, 8],
            vars: { clean: 'topspot' },
            caption: 'skip spaces, marks and case',
          },
        },
        {
          say: 'The easy way builds a clean copy, then a reversed copy, and compares the two.',
          emphasis: ['copy'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'pseudo',
            file: 'Brute force',
            code: `function isPalindrome(s):
    clean ← empty string
    for each ch in s:
        if ch is a letter or digit:
            append lowercase(ch) to clean
    return clean = reverse(clean)`,
            highlight: [6],
            note: { line: 6, text: 'two extra copies: O(n) memory', tone: 'warn' },
          },
        },
        {
          say: 'But you never needed a copy. The first letter just has to match the last, and both are already here.',
          emphasis: ['never', 'already'],
          scene: {
            type: 'array',
            title: 'Spot the waste',
            cells: topSpot,
            active: [0],
            reads: [7],
            caption: 'every pair is already in the text',
          },
        },
        {
          say: 'Put one pointer at each end. Skip what does not count, compare, and step inward.',
          emphasis: ['skip', 'inward'],
          sfx: 'ding',
          scene: { type: 'title', kicker: 'The insight', title: 'Walk *inward* from both ends', emoji: '💡', style: 'slam' },
        },
        {
          say: 'R starts on the exclamation mark. It is not a letter, so R skips one step left.',
          emphasis: ['skips'],
          scene: {
            type: 'array',
            title: 'Checking "Top spot!"',
            cells: topSpot,
            pointers: { L: 0, R: 8 },
            vars: { left: 'T', right: '!' },
            active: [8],
            caption: 'not a letter: skip it',
          },
        },
        {
          say: 'Big T and small t match once you lowercase them. Both pointers step inward.',
          emphasis: ['match'],
          scene: {
            type: 'array',
            title: 'Checking "Top spot!"',
            cells: topSpot,
            pointers: { L: 0, R: 7 },
            vars: { left: 'T', right: 't' },
            active: [0, 7],
            done: [8],
            caption: 'T and t match',
          },
        },
        {
          say: 'The o on the left matches the o on the right, so both step in again.',
          emphasis: ['matches'],
          scene: {
            type: 'array',
            title: 'Checking "Top spot!"',
            cells: topSpot,
            pointers: { L: 1, R: 6 },
            vars: { left: 'o', right: 'o' },
            active: [1, 6],
            done: [0, 7, 8],
            caption: 'o and o match',
          },
        },
        {
          say: 'The p and the p match too. Still a palindrome so far.',
          emphasis: ['so', 'far'],
          scene: {
            type: 'array',
            title: 'Checking "Top spot!"',
            cells: topSpot,
            pointers: { L: 2, R: 5 },
            vars: { left: 'p', right: 'p' },
            active: [2, 5],
            done: [0, 1, 6, 7, 8],
            caption: 'p and p match',
          },
        },
        {
          say: 'Now L lands on a space. It does not count, so L skips one step right.',
          emphasis: ['space'],
          scene: {
            type: 'array',
            title: 'Checking "Top spot!"',
            cells: topSpot,
            pointers: { L: 3, R: 4 },
            vars: { left: '␣', right: 's' },
            active: [3],
            done: [0, 1, 2, 5, 6, 7, 8],
            caption: 'a space: skip it',
          },
        },
        {
          say: 'The pointers meet on the s. A middle letter always matches itself, so it is a palindrome.',
          emphasis: ['meet', 'palindrome'],
          sfx: 'success',
          scene: {
            type: 'array',
            title: 'Checking "Top spot!"',
            cells: topSpot,
            pointers: { L: 4, R: 4 },
            vars: { left: 's', right: 's' },
            found: [0, 1, 2, 4, 5, 6, 7],
            done: [3, 8],
            caption: 'they meet: a palindrome!',
          },
        },
        {
          say: 'In JavaScript, skip the junk, compare, then step in. It is O of n time, with no extra copy.',
          speak: 'In JavaScript, skip the junk, compare, then step in. It is oh of n time, with no extra copy.',
          emphasis: ['compare'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'isPalindrome.js',
            code: `function isPalindrome(s) {
  s = s.toLowerCase();
  const ok = c => /[a-z0-9]/.test(c);
  let L = 0;
  let R = s.length - 1;
  while (L < R) {
    if (!ok(s[L])) { L++; continue; }
    if (!ok(s[R])) { R--; continue; }
    if (s[L] !== s[R]) return false;
    L++;
    R--;
  }
  return true;
}`,
            highlight: [9],
            note: { line: 9, text: 'O(n) time, O(1) memory', tone: 'good' },
          },
        },
        {
          say: 'The trap: a skip loop needs the guard too. On a string of pure junk, L walks right off the end.',
          emphasis: ['guard', 'junk'],
          sfx: 'error',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'trap.js',
            code: `// s = ".,!?" has no letters at all
while (!ok(s[L])) L++;
while (L < R && !ok(s[L])) L++;`,
            errors: [2],
            added: [3],
            note: { line: 3, text: 'guard every skip with L < R', tone: 'good' },
          },
        },
        {
          say: 'Quick check. You test race a car from both ends. Where does it stop?',
          emphasis: ['stop'],
          sfx: 'riser',
          scene: {
            type: 'quiz',
            question: 'You check "race a car" from both ends. Where does it stop?',
            options: ['At e vs a', 'At the first space', 'It never stops early', 'At c vs c'],
            answer: 0,
          },
        },
        {
          say: 'At e versus a. The first three pairs match, then e and a do not, so it is not a palindrome.',
          emphasis: ['not'],
          sfx: 'ding',
          scene: {
            type: 'quiz',
            question: 'You check "race a car" from both ends. Where does it stop?',
            options: ['At e vs a', 'At the first space', 'It never stops early', 'At c vs c'],
            answer: 0,
            reveal: true,
            explain: 'Clean: raceacar. r=r, a=a, c=c, then e≠a: false.',
          },
        },
        {
          say: 'Remember this. Compare the outside pair, step inward, and skip what does not count. Now tap solve it and try it yourself.',
          emphasis: ['outside', 'inward'],
          sfx: 'success',
          scene: {
            type: 'outro',
            points: ['Compare the *outside* pair', 'Step inward, no reversed copy', 'Guard every skip with *L < R*'],
            tagline: 'Now go solve it.',
          },
        },
      ],
    },

    // ── Lesson 4: partitioning (Dutch flag) ──────────────────────────────────
    {
      id: 'dsa-two-pointers-partitioning',
      title: 'Partitioning (Dutch flag)',
      link: { label: 'Solve it', href: '/dsa#/m/two-pointers/partitioning/two-pointers-sort-colors' },
      beats: [
        {
          say: 'Whites, colors and darks. Can you sort the laundry in one pass?',
          emphasis: ['one', 'pass'],
          scene: { type: 'title', kicker: 'Two pointers · Lesson 4', title: 'Sort laundry in *one pass*', emoji: '🧺', style: 'slam' },
        },
        {
          say: 'Zero is white, one is color, two is dark. Put the zeros first, then ones, then twos, in place.',
          emphasis: ['first', 'place'],
          sfx: 'pop',
          scene: {
            type: 'array',
            title: 'Laundry: 0, 1 or 2',
            cells: laundry,
            vars: { goal: '0s, 1s, 2s' },
            caption: '0 white · 1 color · 2 dark',
          },
        },
        {
          say: 'The easy way counts the zeros, ones and twos, then writes the whole array again.',
          emphasis: ['counts', 'again'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'pseudo',
            file: 'Count + rewrite',
            code: `function sortColors(a):
    count ← [0, 0, 0]
    for each x in a:
        count[x] ← count[x] + 1
    i ← 0
    for color from 0 to 2:
        repeat count[color] times:
            a[i] ← color
            i ← i + 1`,
            highlight: [8],
            note: { line: 8, text: 'rewrites values, in two passes', tone: 'warn' },
          },
        },
        {
          say: 'But real items carry data, like a support ticket. You cannot just write a zero, you have to move the ticket.',
          emphasis: ['move'],
          scene: {
            type: 'compare',
            title: 'Spot the waste',
            left: { title: 'Count + rewrite', verdict: 'bad', items: ['Two passes', 'Writes new values', 'Loses the ticket'] },
            right: { title: 'Swap in place', verdict: 'ok', items: ['One pass', 'Moves real items', 'Keeps the data'] },
          },
        },
        {
          say: 'Keep zeros at the front and twos at the back. Three pointers mark the borders.',
          emphasis: ['front', 'back'],
          sfx: 'ding',
          scene: { type: 'title', kicker: 'The insight', title: 'Three zones, *swaps* only', emoji: '💡', style: 'slam' },
        },
        {
          say: 'Low and mid start on the left, high on the right. The band is still unchecked. Mid sees a two.',
          emphasis: ['unchecked'],
          scene: {
            type: 'array',
            title: 'Dutch flag, one pass',
            cells: laundry,
            pointers: { low: 0, mid: 0, high: 5 },
            vars: { 'a[mid]': 2, todo: 6 },
            window: [0, 5],
            active: [0],
            caption: 'a 2 belongs at the back',
          },
        },
        {
          say: 'Swap it with high, and high steps left. Mid stays put, because the zero it got back is not checked yet.',
          emphasis: ['stays'],
          scene: {
            type: 'array',
            title: 'Dutch flag, one pass',
            cells: [0, 0, 2, 1, 1, 2],
            pointers: { low: 0, mid: 0, high: 4 },
            vars: { 'a[mid]': 0, todo: 5 },
            window: [0, 4],
            active: [0],
            done: [5],
            caption: 'mid stays: new item unchecked',
          },
        },
        {
          say: 'Now come two zeros. Each one swaps to low, and low and mid both step right.',
          emphasis: ['low'],
          scene: {
            type: 'array',
            title: 'Dutch flag, one pass',
            cells: [0, 0, 2, 1, 1, 2],
            pointers: { low: 2, mid: 2, high: 4 },
            vars: { 'a[mid]': 2, todo: 3 },
            window: [2, 4],
            active: [2],
            done: [0, 1, 5],
            caption: 'a 0 goes to low: both move',
          },
        },
        {
          say: 'Mid sees a two again. Swap it with high, high steps left, and a one comes back.',
          emphasis: ['two', 'high'],
          scene: {
            type: 'array',
            title: 'Dutch flag, one pass',
            cells: sortedLaundry,
            pointers: { low: 2, mid: 2, high: 3 },
            vars: { 'a[mid]': 1, todo: 2 },
            window: [2, 3],
            active: [2],
            done: [0, 1, 4, 5],
            caption: 'a 1 came back to mid',
          },
        },
        {
          say: 'A one already sits in the middle zone. Mid just steps right.',
          emphasis: ['middle'],
          scene: {
            type: 'array',
            title: 'Dutch flag, one pass',
            cells: sortedLaundry,
            pointers: { low: 2, mid: 3, high: 3 },
            vars: { 'a[mid]': 1, todo: 1 },
            window: [3, 3],
            active: [3],
            done: [0, 1, 2, 4, 5],
            caption: 'a 1 stays: only mid moves',
          },
        },
        {
          say: 'Another one, so mid steps past high. Nothing is left to check. Sorted in one pass, with swaps only.',
          emphasis: ['one', 'pass'],
          sfx: 'success',
          scene: {
            type: 'array',
            title: 'Dutch flag, one pass',
            cells: sortedLaundry,
            pointers: { low: 2, mid: 4, high: 3 },
            vars: { 'a[mid]': '–', todo: 0 },
            window: [4, 3],
            found: [0, 1, 2, 3, 4, 5],
            caption: 'mid passed high: done!',
          },
        },
        {
          say: 'In JavaScript, a zero swaps to low and a two swaps to high. One pass, so it is O of n.',
          speak: 'In JavaScript, a zero swaps to low and a two swaps to high. One pass, so it is oh of n.',
          emphasis: ['low', 'high'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'sortColors.js',
            code: `function sortColors(a) {
  const swap = (i, j) =>
    ([a[i], a[j]] = [a[j], a[i]]);
  let low = 0, mid = 0;
  let high = a.length - 1;
  while (mid <= high) {
    if (a[mid] === 0) {
      swap(low, mid); low++; mid++;
    } else if (a[mid] === 2) {
      swap(mid, high); high--;
    } else mid++;
  }
  return a;
}`,
            highlight: [10],
            note: { line: 10, text: 'mid waits. One pass: O(n)', tone: 'good' },
          },
        },
        {
          say: 'The trap is moving mid after a swap with high. The new item never gets checked, and a zero gets stuck.',
          emphasis: ['never', 'stuck'],
          sfx: 'error',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'trap.js',
            code: `} else if (a[mid] === 2) {
  swap(mid, high);
  high--;
  mid++;
}`,
            errors: [4],
            note: { line: 4, text: '[1, 2, 0] ends as [1, 0, 2]', tone: 'bad' },
          },
        },
        {
          say: 'Quick check. Which loop condition is right for the Dutch flag?',
          emphasis: ['condition'],
          sfx: 'riser',
          scene: {
            type: 'quiz',
            question: 'Which loop condition is right for the Dutch flag?',
            options: ['while mid ≤ high', 'while mid < high', 'while low < high', 'while low ≤ mid'],
            answer: 0,
          },
        },
        {
          say: 'Mid less than or equal to high. When they are equal, one item is still unchecked.',
          emphasis: ['equal', 'unchecked'],
          sfx: 'ding',
          scene: {
            type: 'quiz',
            question: 'Which loop condition is right for the Dutch flag?',
            options: ['while mid ≤ high', 'while mid < high', 'while low < high', 'while low ≤ mid'],
            answer: 0,
            reveal: true,
            explain: 'mid = high still points at one unchecked item.',
          },
        },
        {
          say: 'Remember this. Zeros swap to low, twos swap to high, and ones just move mid. Now tap solve it and try it yourself.',
          emphasis: ['low', 'high'],
          sfx: 'success',
          scene: {
            type: 'outro',
            points: ['0 swaps to *low*, 2 swaps to *high*', 'After a swap with high, mid waits', 'Loop while *mid ≤ high*'],
            tagline: 'Now go solve it.',
          },
        },
      ],
    },

    // ── Lesson 5: 3Sum & k-sum ───────────────────────────────────────────────
    {
      id: 'dsa-two-pointers-k-sum',
      title: '3Sum & k-sum',
      link: { label: 'Solve it', href: '/dsa#/m/two-pointers/k-sum/two-pointers-three-sum' },
      beats: [
        {
          say: 'Three bank charges that add up to zero. Was someone billed twice?',
          emphasis: ['zero', 'twice'],
          scene: { type: 'title', kicker: 'Two pointers · Lesson 5', title: 'Find triples that *cancel*', emoji: '🧾', style: 'slam' },
        },
        {
          say: 'Find every triple that adds up to zero, each listed once. Here there are two of them.',
          emphasis: ['once', 'two'],
          sfx: 'pop',
          scene: {
            type: 'array',
            title: 'Triples that sum to 0',
            cells: ledger,
            found: [0, 1, 2],
            vars: { first: '-1, 0, 1', second: '-1, -1, 2' },
            caption: 'two -1s, but each triple once',
          },
        },
        {
          say: 'The easy way tries every triple with three loops, and a set throws out the repeats.',
          emphasis: ['three', 'loops'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'pseudo',
            file: 'Brute force',
            code: `function threeSum(a):
    found ← empty set
    for i from 0 to n - 3:
        for j from i + 1 to n - 2:
            for k from j + 1 to n - 1:
                if a[i] + a[j] + a[k] = 0:
                    add sorted triple to found
    return found as a list`,
            highlight: [[3, 5]],
            note: { line: 5, text: 'three loops deep', tone: 'warn' },
          },
        },
        {
          say: 'Three loops is O of n cubed. Three thousand lines means four and a half billion triples.',
          speak: 'Three loops is oh of n cubed. Three thousand lines means four and a half billion triples.',
          emphasis: ['cubed', 'billion'],
          sfx: 'error',
          scene: {
            type: 'stat',
            value: '4.5B',
            label: 'triples for *3,000* lines',
            sub: 'O(n³): three loops inside each other',
            tone: 'bad',
          },
        },
        {
          say: 'Fix one number, like minus one. Now you only need a pair that adds up to one. That is the gift card problem!',
          emphasis: ['pair', 'gift'],
          scene: {
            type: 'array',
            title: 'Spot the waste',
            cells: ledger,
            pointers: { i: 0 },
            active: [0],
            reads: [1, 2, 3, 4, 5],
            caption: 'fix -1: find a pair that sums to 1',
          },
        },
        {
          say: 'So sort first. Fix one number, then let two pointers find its pairs in one sweep.',
          emphasis: ['sort', 'sweep'],
          sfx: 'ding',
          scene: { type: 'title', kicker: 'The insight', title: 'Sort, fix one, *sweep*', emoji: '💡', style: 'slam' },
        },
        {
          say: 'Fix minus four. L walks right, but every sum is too small. Even one plus two only reaches minus one.',
          emphasis: ['small'],
          scene: {
            type: 'array',
            title: 'Sort, fix i, sweep',
            cells: sortedLedger,
            pointers: { i: 0, L: 4, R: 5 },
            active: [0],
            done: [1, 2, 3],
            vars: { sum: -1, found: 0 },
            caption: 'too small every time: no triple',
          },
        },
        {
          say: 'Now fix minus one. Minus one, minus one and two make zero. That is our first triple!',
          emphasis: ['first'],
          scene: {
            type: 'array',
            title: 'Sort, fix i, sweep',
            cells: sortedLedger,
            pointers: { i: 1, L: 2, R: 5 },
            found: [1, 2, 5],
            done: [0],
            vars: { sum: 0, found: 1 },
            caption: 'hit: [-1, -1, 2]',
          },
        },
        {
          say: 'Move both pointers in. Minus one, zero and one make zero too. That is triple number two.',
          emphasis: ['two'],
          scene: {
            type: 'array',
            title: 'Sort, fix i, sweep',
            cells: sortedLedger,
            pointers: { i: 1, L: 3, R: 4 },
            found: [1, 3, 4],
            done: [0],
            vars: { sum: 0, found: 2 },
            caption: 'hit: [-1, 0, 1]',
          },
        },
        {
          say: 'Next, i lands on another minus one. It matches the number before it, so skip it, or a triple repeats.',
          emphasis: ['skip'],
          scene: {
            type: 'array',
            title: 'Sort, fix i, sweep',
            cells: sortedLedger,
            pointers: { i: 2, L: 6, R: 6 },
            active: [2],
            reads: [1],
            done: [0],
            vars: { sum: '–', found: 2 },
            caption: 'same as the one before: skip',
          },
        },
        {
          say: 'Fix zero. Zero, one and two make three, too big. R steps left and meets L. Two triples, done.',
          emphasis: ['big', 'done'],
          sfx: 'success',
          scene: {
            type: 'array',
            title: 'Sort, fix i, sweep',
            cells: sortedLedger,
            pointers: { i: 3, L: 4, R: 5 },
            active: [3],
            done: [0, 1, 2],
            vars: { sum: 3, found: 2 },
            caption: 'too big: R moves, sweep ends',
          },
        },
        {
          say: 'In JavaScript, sort, then run one sweep for each i. n sweeps of n steps is O of n squared.',
          speak: 'In JavaScript, sort, then run one sweep for each i. n sweeps of n steps is oh of n squared.',
          emphasis: ['sweep', 'squared'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'threeSum.js',
            code: `a.sort((x, y) => x - y);
const n = a.length, out = [];
for (let i = 0; i < n - 2; i++) {
  if (a[i] === a[i - 1]) continue;
  let L = i + 1, R = n - 1;
  while (L < R) {
    const s = a[i] + a[L] + a[R];
    if (s < 0) { L++; continue; }
    if (s > 0) { R--; continue; }
    out.push([a[i], a[L], a[R]]);
    L++; R--;
    while (a[L] === a[L - 1]) L++;
  }
}`,
            highlight: [[8, 9]],
            note: { line: 9, text: 'n sweeps of n steps: O(n²)', tone: 'good' },
          },
        },
        {
          say: 'The trap: skip repeats by looking back. Looking ahead skips the first minus one, and a triple is lost.',
          emphasis: ['back', 'lost'],
          sfx: 'error',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'trap.js',
            code: `// sorted a = [-1, -1, 2]
if (a[i] === a[i + 1]) continue;
if (a[i] === a[i - 1]) continue;`,
            errors: [2],
            added: [3],
            note: { line: 3, text: 'look back: [-1, -1, 2] is kept', tone: 'good' },
          },
        },
        {
          say: 'Quick check. For four sum, you fix two numbers, then sweep. How fast is that?',
          emphasis: ['two'],
          sfx: 'riser',
          scene: {
            type: 'quiz',
            question: '4Sum: sort, fix two numbers, then one sweep. How fast?',
            options: ['O(n³)', 'O(n²)', 'O(n⁴)', 'O(n log n)'],
            answer: 0,
          },
        },
        {
          say: 'It is O of n cubed. Two loops fix two numbers, and each one gets a sweep. Each extra number adds a loop.',
          speak: 'It is oh of n cubed. Two loops fix two numbers, and each one gets a sweep. Each extra number adds a loop.',
          emphasis: ['cubed', 'loop'],
          sfx: 'ding',
          scene: {
            type: 'quiz',
            question: '4Sum: sort, fix two numbers, then one sweep. How fast?',
            options: ['O(n³)', 'O(n²)', 'O(n⁴)', 'O(n log n)'],
            answer: 0,
            reveal: true,
            explain: 'n² pairs of fixed numbers, each with an O(n) sweep.',
          },
        },
        {
          say: 'Remember this. Sort, fix one number, and sweep the rest with two pointers. Now tap solve it and try it yourself.',
          emphasis: ['sort', 'sweep'],
          sfx: 'success',
          scene: {
            type: 'outro',
            points: ['Sort, fix one, *sweep* the rest', 'Skip repeats by looking *back*', 'Each extra number adds a loop'],
            tagline: 'Now go solve it.',
          },
        },
      ],
    },
  ],
};
