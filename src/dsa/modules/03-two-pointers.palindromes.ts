import type { Lesson } from '../types';

// Lesson 3 of module 3: palindromes with pointers moving inward.
export const palindromes: Lesson = {
  id: 'palindromes',
  title: 'Palindromes',
  summary: 'Compare the outside pair, step inward, skip what does not count.',
  minutes: 18,
  blocks: [
    {
      kind: 'callout',
      tone: 'story',
      title: 'Bonus points for a palindrome',
      text: "A word-game app gives bonus points for palindrome phrases: text that reads the same forwards and backwards. Players type messy things like `Was it a car or a cat I saw?` The rules: ignore spaces and punctuation, and treat `W` and `w` as the same letter.",
    },
    {
      kind: 'text',
      text: "**The problem.** Given a string `s`, keep only letters and digits, lowercase them, and check if the result reads the same both ways. `Was it a car or a cat I saw?` becomes `wasitacaroracatisaw`, which is a palindrome. `race a car` becomes `raceacar`, which is not.",
    },
    {
      kind: 'text',
      text: "**Brute force first.** Build the cleaned string, build its reverse, and compare them.",
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Brute force: clean, reverse, compare',
      code: `function isPalindrome(s):
    clean ← empty string
    for each ch in s:
        if ch is a letter or digit:
            append lowercase(ch) to clean
    return clean = reverse(clean)`,
    },
    {
      kind: 'text',
      text: "This is correct and **O(n)** time, honestly fine for a word game. But it makes two extra copies of the text (**O(n)** memory), and it reverses the whole string even when the very first and last letters already differ. Interviewers will ask for O(1) memory.",
    },
    {
      kind: 'text',
      text: "**Spot the waste.** You never needed the reversed copy. A palindrome check is just: first letter matches last, second matches second-to-last, and so on. Both letters of every pair are already in `s`. You only need to skip the characters that don't count.",
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'Walk inward from both ends',
      text: "Put `L` at the start and `R` at the end. Slide each one past characters that don't count. Compare the lowercase versions. Match: both step inward. Mismatch: stop, it's not a palindrome. When the pointers meet, every pair matched, so it is one.",
    },
    {
      kind: 'steps',
      title: 'Checking "Top spot!"',
      frames: [
        {
          cells: ['T', 'o', 'p', '␣', 's', 'p', 'o', 't', '!'],
          pointers: { L: 0, R: 8 },
          active: [8],
          note: "`R` is on `!`, which doesn't count. Skip it: `R` moves to 7.",
        },
        {
          cells: ['T', 'o', 'p', '␣', 's', 'p', 'o', 't', '!'],
          pointers: { L: 0, R: 7 },
          active: [0, 7],
          done: [8],
          note: "`T` and `t` match once lowercased. Both step inward.",
        },
        {
          cells: ['T', 'o', 'p', '␣', 's', 'p', 'o', 't', '!'],
          pointers: { L: 1, R: 6 },
          active: [1, 6],
          done: [0, 7, 8],
          note: "`o` = `o`. Step inward.",
        },
        {
          cells: ['T', 'o', 'p', '␣', 's', 'p', 'o', 't', '!'],
          pointers: { L: 2, R: 5 },
          active: [2, 5],
          done: [0, 1, 6, 7, 8],
          note: "`p` = `p`. Step inward.",
        },
        {
          cells: ['T', 'o', 'p', '␣', 's', 'p', 'o', 't', '!'],
          pointers: { L: 3, R: 4 },
          active: [3],
          done: [0, 1, 2, 5, 6, 7, 8],
          note: "`L` is on a space. Skip it: `L` moves to 4.",
        },
        {
          cells: ['T', 'o', 'p', '␣', 's', 'p', 'o', 't', '!'],
          pointers: { L: 4, R: 4 },
          found: [0, 1, 2, 4, 5, 6, 7],
          done: [3, 8],
          note: "`L` and `R` meet on `s`. A middle letter always matches itself, so `Top spot!` is a palindrome.",
        },
      ],
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Two pointers',
      code: `function isPalindrome(s):
    L ← 0
    R ← length of s - 1
    while L < R:
        if s[L] is not a letter or digit:
            L ← L + 1
        else if s[R] is not a letter or digit:
            R ← R - 1
        else:
            if lowercase(s[L]) ≠ lowercase(s[R]):
                return false
            L ← L + 1
            R ← R - 1
    return true`,
    },
    {
      kind: 'code',
      lang: 'js',
      code: `function isPalindrome(s) {
  const counts = (ch) => /[a-z0-9]/i.test(ch);
  let left = 0;
  let right = s.length - 1;
  while (left < right) {
    if (!counts(s[left])) left++;
    else if (!counts(s[right])) right--;
    else {
      if (s[left].toLowerCase() !== s[right].toLowerCase()) return false;
      left++;
      right--;
    }
  }
  return true;
}`,
    },
    {
      kind: 'text',
      text: "**Twist: one mistake allowed.** A spell-checker might ask: is this word *one deletion* away from a palindrome? Run the same walk. At the first mismatch you have exactly two choices: drop the left letter or drop the right one. Check whether either leftover middle part is a plain palindrome. You branch only once, so it stays O(n).",
    },
    {
      kind: 'diagram',
      title: 'One deletion allowed: "abccbxa"',
      art: `index:  0 1 2 3 4 5 6
s:      a b c c b x a
        L           R    a = a, step in
          L       R      b ≠ x, mismatch!

Option 1, drop b: s[2..5] = c c b x   palindrome? no
Option 2, drop x: s[1..4] = b c c b   palindrome? yes
One option works, so the answer is true.`,
      caption: "After the first mismatch, no more deletions are allowed, so each option is a normal palindrome check.",
    },
    {
      kind: 'compare',
      title: 'Palindrome checks',
      rows: [
        { approach: 'Clean + reverse + compare', time: 'O(n)', space: 'O(n)', note: 'Easy to write. Two extra copies of the text.' },
        { approach: 'Two pointers inward', time: 'O(n)', space: 'O(1)', note: 'Skips junk in place, stops at the first mismatch.' },
        {
          approach: 'One deletion: try deleting each char',
          time: 'O(n²)',
          space: 'O(n)',
          note: 'n deletions, each followed by an O(n) check.',
        },
        {
          approach: 'One deletion: two pointers + one branch',
          time: 'O(n)',
          space: 'O(1)',
          note: 'Branch only at the first mismatch, then two plain checks.',
        },
      ],
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Template: inward check',
      code: `L ← 0
R ← n - 1
while L < R:
    if s[L] doesn't count: L ← L + 1
    else if s[R] doesn't count: R ← R - 1
    else if s[L] ≠ s[R]:
        handle the mismatch (return false, or branch once)
    else:
        L ← L + 1
        R ← R - 1
return true`,
    },
    {
      kind: 'callout',
      tone: 'tip',
      title: 'Not this lesson',
      text: "Finding the **longest** palindrome inside a string (LeetCode 5) or counting all palindromic substrings (LeetCode 647) needs a different idea. Module 17 covers them.",
    },
    {
      kind: 'callout',
      tone: 'trap',
      title: 'Skip loops must stop at the middle too',
      text: "If you write the skipping as its own inner loop, give it the guard too: `while L < R and s[L] doesn't count`. Without `L < R`, a string of pure junk like `.,!?` walks `L` right off the end. And in the one-deletion version, never branch again inside the branch: after the first mismatch, the leftover must be a plain palindrome.",
    },
  ],
  problems: [
    {
      id: 'two-pointers-valid-palindrome',
      title: 'Valid Palindrome',
      difficulty: 'easy',
      leetcode: 125,
      pattern: 'Two pointers (opposite ends)',
      statement:
        "The word-game check. Given a string `s`, ignore every character that is not a letter or a digit, and treat uppercase and lowercase as the same. Return `true` if what's left reads the same forwards and backwards. An empty result counts as a palindrome. Use O(1) extra memory.",
      examples: [
        { input: 's = "Was it a car or a cat I saw?"', output: 'true' },
        { input: 's = "race a car"', output: 'false', explain: '"raceacar" reversed is "racaecar".' },
        { input: 's = " "', output: 'true', explain: 'Nothing is left, and empty text is a palindrome.' },
      ],
      constraints: ['1 ≤ s.length ≤ 2 · 10⁵', 's has printable ASCII characters'],
      hints: [
        "You don't need a cleaned copy. Compare characters straight from `s`.",
        "Use `left` at the start and `right` at the end. What should happen when one of them sits on a space or a comma?",
        "Skip non-letters/digits on each side, then compare `toLowerCase()` versions. Mismatch: return false. Match: move both inward.",
      ],
      approaches: [
        {
          name: 'Clean, reverse, compare',
          idea: "Build a lowercase string of only letters and digits, then compare it with its reverse. Correct, but it stores two extra copies.",
          time: 'O(n)',
          space: 'O(n)',
        },
        {
          name: 'Two pointers, skipping junk',
          idea: "A palindrome means every outside pair matches. Check the pairs straight from `s`, stepping past characters that don't count. The first mismatch proves it's not a palindrome.",
          pseudo: `function isPalindrome(s):
    L ← 0
    R ← length of s - 1
    while L < R:
        if s[L] is not a letter or digit:
            L ← L + 1
        else if s[R] is not a letter or digit:
            R ← R - 1
        else:
            if lowercase(s[L]) ≠ lowercase(s[R]):
                return false
            L ← L + 1
            R ← R - 1
    return true`,
          code: `function isPalindrome(s) {
  const counts = (ch) => /[a-z0-9]/i.test(ch);
  let left = 0;
  let right = s.length - 1;
  while (left < right) {
    if (!counts(s[left])) left++;
    else if (!counts(s[right])) right--;
    else {
      if (s[left].toLowerCase() !== s[right].toLowerCase()) return false;
      left++;
      right--;
    }
  }
  return true;
}`,
          time: 'O(n)',
          space: 'O(1)',
        },
      ],
      fn: 'isPalindrome',
      starter: `function isPalindrome(s) {
  // ignore non-letters/digits and case; does s read the same both ways?
  return false;
}`,
      solution: `function isPalindrome(s) {
  const counts = (ch) => /[a-z0-9]/i.test(ch);
  let left = 0;
  let right = s.length - 1;
  while (left < right) {
    if (!counts(s[left])) left++;
    else if (!counts(s[right])) right--;
    else {
      if (s[left].toLowerCase() !== s[right].toLowerCase()) return false;
      left++;
      right--;
    }
  }
  return true;
}`,
      tests: [
        { name: 'messy phrase', args: ['Was it a car or a cat I saw?'], expected: true },
        { name: 'not a palindrome', args: ['race a car'], expected: false },
        { name: 'only a space', args: [' '], expected: true },
        { name: 'digit vs letter', args: ['0P'], expected: false },
        { name: 'underscore is junk', args: ['ab_a'], expected: true },
        { name: 'apostrophe and comma', args: ["Madam, I'm Adam"], expected: true },
        { name: 'only punctuation', args: ['.,!?'], expected: true },
        { name: 'digits', args: ['12321'], expected: true },
      ],
      takeaway: "A palindrome check needs no copy: compare outside pairs and walk inward.",
    },
    {
      id: 'two-pointers-valid-palindrome-ii',
      title: 'Palindrome With One Deletion',
      difficulty: 'easy',
      leetcode: 680,
      pattern: 'Two pointers (opposite ends)',
      statement:
        "A spell-checker wants to know if a word is *almost* a palindrome. Given a lowercase string `s`, return `true` if it is a palindrome already, or becomes one after deleting **at most one** character.",
      examples: [
        { input: 's = "aba"', output: 'true' },
        { input: 's = "abca"', output: 'true', explain: 'Delete "b" or "c".' },
        { input: 's = "abc"', output: 'false' },
      ],
      constraints: ['1 ≤ s.length ≤ 10⁵', 's has lowercase English letters only'],
      hints: [
        "Run the normal inward check until the first mismatch.",
        "At the mismatch, the deleted letter must be either `s[L]` or `s[R]`. Deleting anything else leaves the same broken pair.",
        "Return `isPal(L + 1, R) or isPal(L, R - 1)`, where `isPal` is a plain two-pointer check on that range.",
      ],
      approaches: [
        {
          name: 'Try deleting every character',
          idea: "For each index, remove that character and check if the rest is a palindrome (plus check the original). Correct, but that is n checks of O(n) each.",
          time: 'O(n²)',
          space: 'O(n)',
        },
        {
          name: 'Two pointers + one branch',
          idea: "Everything outside the first mismatch already matches, so the only useful deletion is one of the two mismatched letters. Try both: each is a plain palindrome check on the middle part. You branch once, so it's still linear.",
          pseudo: `function validPalindrome(s):
    L ← 0
    R ← length of s - 1
    while L < R:
        if s[L] ≠ s[R]:
            return isPal(s, L + 1, R) or isPal(s, L, R - 1)
        L ← L + 1
        R ← R - 1
    return true

function isPal(s, L, R):        // plain check on s[L..R]
    while L < R:
        if s[L] ≠ s[R]: return false
        L ← L + 1
        R ← R - 1
    return true`,
          code: `function validPalindrome(s) {
  const isPal = (left, right) => {
    while (left < right) {
      if (s[left] !== s[right]) return false;
      left++;
      right--;
    }
    return true;
  };
  let left = 0;
  let right = s.length - 1;
  while (left < right) {
    if (s[left] !== s[right]) {
      return isPal(left + 1, right) || isPal(left, right - 1);
    }
    left++;
    right--;
  }
  return true;
}`,
          time: 'O(n)',
          space: 'O(1)',
        },
      ],
      fn: 'validPalindrome',
      starter: `function validPalindrome(s) {
  // can s become a palindrome by deleting at most one character?
  return false;
}`,
      solution: `function validPalindrome(s) {
  const isPal = (left, right) => {
    while (left < right) {
      if (s[left] !== s[right]) return false;
      left++;
      right--;
    }
    return true;
  };
  let left = 0;
  let right = s.length - 1;
  while (left < right) {
    if (s[left] !== s[right]) {
      return isPal(left + 1, right) || isPal(left, right - 1);
    }
    left++;
    right--;
  }
  return true;
}`,
      tests: [
        { name: 'already a palindrome', args: ['aba'], expected: true },
        { name: 'delete inside', args: ['abca'], expected: true },
        { name: 'impossible', args: ['abc'], expected: false },
        { name: 'delete the first char', args: ['deeee'], expected: true },
        { name: 'second option works', args: ['abccbxa'], expected: true },
        { name: 'single char', args: ['a'], expected: true },
        { name: 'two different', args: ['ab'], expected: true },
        { name: 'mismatch in the middle', args: ['abcdba'], expected: true },
        { name: 'long, one deletion', args: ['ebcbbececabbacecbbcbe'], expected: true },
        { name: 'both options fail', args: ['abdca'], expected: false },
      ],
      takeaway: "At the first mismatch the fix must involve one of the two mismatched letters, so try both once.",
    },
    {
      id: 'two-pointers-delete-similar-ends',
      title: 'Trim Matching Ends',
      difficulty: 'medium',
      leetcode: 1750,
      pattern: 'Two pointers (opposite ends)',
      statement:
        "A string `s` made of `a`, `b` and `c` is a stack of colored tiles. One move: if the first and last tiles have the **same** letter, remove the whole run of that letter from the front **and** the whole run of it from the back (the two runs must not overlap). Repeat as long as you can. Return the length of what's left.",
      examples: [
        { input: 's = "ca"', output: '2', explain: 'The ends differ, so nothing can be removed.' },
        {
          input: 's = "cabaabac"',
          output: '0',
          explain: 'Remove c..c → "abaaba", a..a → "baab", b..b → "aa", a..a → "".',
        },
        { input: 's = "aabccabba"', output: '3', explain: 'Remove "aa".."a" → "bccabb", then "b".."bb" → "cca".' },
      ],
      constraints: ['1 ≤ s.length ≤ 10⁵', "s has only the letters 'a', 'b' and 'c'"],
      hints: [
        "Actually building shorter strings each time is slow. Can two indexes stand in for the current string?",
        "Keep `left` and `right`. While `s[left] === s[right]`, remember that letter, then move `left` forward past all copies of it and `right` backward past all copies of it.",
        "Stop when the ends differ or the pointers cross. The answer is `right - left + 1`. Careful with the middle: in `aba` the lone `b` must stay.",
      ],
      approaches: [
        {
          name: 'Simulate with new strings',
          idea: "Each move, slice off the front run and back run to build a new, shorter string. It follows the rules exactly, but every slice copies the string, so long inputs cost O(n²).",
          time: 'O(n²)',
          space: 'O(n)',
        },
        {
          name: 'Two pointers as the current string',
          idea: "The string left over is always one block `s[left..right]`, so two indexes are enough to describe it. Each move just slides `left` and `right` inward past the matching runs. Each index only moves inward, so the total work is O(n).",
          pseudo: `function minimumLength(s):
    L ← 0
    R ← length of s - 1
    while L < R and s[L] = s[R]:
        ch ← s[L]
        while L ≤ R and s[L] = ch:
            L ← L + 1
        while R ≥ L and s[R] = ch:
            R ← R - 1
    return R - L + 1`,
          code: `function minimumLength(s) {
  let left = 0;
  let right = s.length - 1;
  while (left < right && s[left] === s[right]) {
    const ch = s[left];
    while (left <= right && s[left] === ch) left++;
    while (right >= left && s[right] === ch) right--;
  }
  return right - left + 1;
}`,
          time: 'O(n)',
          space: 'O(1)',
        },
      ],
      fn: 'minimumLength',
      starter: `function minimumLength(s) {
  // keep removing matching end runs; return the length left
  return s.length;
}`,
      solution: `function minimumLength(s) {
  let left = 0;
  let right = s.length - 1;
  while (left < right && s[left] === s[right]) {
    const ch = s[left];
    while (left <= right && s[left] === ch) left++;
    while (right >= left && s[right] === ch) right--;
  }
  return right - left + 1;
}`,
      tests: [
        { name: 'ends differ', args: ['ca'], expected: 2 },
        { name: 'removes everything', args: ['cabaabac'], expected: 0 },
        { name: 'stops with 3 left', args: ['aabccabba'], expected: 3 },
        { name: 'single char', args: ['a'], expected: 1 },
        { name: 'all the same', args: ['aaa'], expected: 0 },
        { name: 'lone middle stays', args: ['aba'], expected: 1 },
        { name: 'two rounds to empty', args: ['abba'], expected: 0 },
        { name: 'long runs', args: ['bbbbbbbbbbbbbbbbbbbbbbbbbbbabbbbbbbbbbbbbbbccbcbcbccbbabbb'], expected: 1 },
      ],
      takeaway: "When work only shrinks a string from its ends, two indexes can replace all the copying.",
    },
  ],
  quiz: [
    {
      prompt: "Checking `race a car` with two pointers, where does the check stop?",
      options: ['At `e` vs `a`, a mismatch', 'At the first space', 'It never stops early', 'At `c` vs `c`'],
      answer: 0,
      explanation: "Cleaned it is `raceacar`. Pairs: r/r, a/a, c/c, then e/a. That mismatch ends it with false.",
    },
    {
      prompt: 'Palindrome With One Deletion: at the first mismatch, what do you do?',
      options: [
        'Try dropping the left letter or the right letter, then do a plain check on the rest',
        'Return false right away',
        'Skip both letters and keep going',
        'Delete the letter that appears less often',
      ],
      answer: 0,
      explanation: "Only one of the two mismatched letters can be the extra one. Try both, each with a normal palindrome check.",
    },
    {
      prompt: 'Why is `while L < R` enough, without checking the middle letter of an odd-length string?',
      options: [
        'A single middle letter always matches itself',
        'Odd-length strings are never palindromes',
        'The middle letter is always junk',
        'JavaScript skips the middle automatically',
      ],
      answer: 0,
      explanation: "When `L = R` both point at the same letter, so there is nothing to compare.",
    },
  ],
  takeaways: [
    "Check a palindrome by comparing outside pairs and stepping inward. No reversed copy needed.",
    "Skip characters that don't count with the same pointers, and guard every skip with `L < R`.",
    "One deletion allowed: branch once at the first mismatch, then run plain checks.",
  ],
};
