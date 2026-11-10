import type { Module } from '../types';
import { lessonsPart1 } from './09-backtracking.lessons-1';
import { lessonsPart2 } from './09-backtracking.lessons-2';
import { lessonsPart3 } from './09-backtracking.lessons-3';

const mod: Module = {
  id: "backtracking",
  number: 9,
  part: "recursion",
  title: "Backtracking",
  tagline: "Choose, explore, un-choose: subsets, permutations, and search with pruning.",
  draft: false,
  intro:
    "Backtracking is how a program tries every option without getting lost: build an answer one choice at a time, and undo the last choice when it leads nowhere. It powers Sudoku solvers, word-search games and every 'list all the ways' question. You'll learn one template, **choose → explore → un-choose**, and bend it into subsets, combinations, permutations, string cuts, grid search and N-Queens. After this module, 'return all possible ...' questions stop being scary.",
  lessons: [...lessonsPart1, ...lessonsPart2, ...lessonsPart3],
  patterns: [
    {
      name: 'Subsets & combinations (start index)',
      signals: [
        "'all subsets', 'all combinations', 'choose k', 'groups that add up to target'",
        'Order inside an answer does not matter: `[1,2]` is the same as `[2,1]`',
        'Small n (≤ 20) and the output is a list of groups',
      ],
      template: `sort nums                               // only for pruning / duplicates
function go(start, total):
    if path is a full answer:           // subsets: save at every node
        append a copy of path to result
        return
    for i from start to n - 1:
        if i > start and nums[i] = nums[i - 1]: continue   // duplicates
        if total + nums[i] > target: break                 // sorted prune
        push nums[i] onto path
        go(i + 1, total + nums[i])      // go(i, ...) if reuse is allowed
        pop from path`,
      examples: [
        'backtracking-subsets',
        'backtracking-subset-xor-total',
        'backtracking-combinations',
        'backtracking-combination-sum',
        'backtracking-combination-sum-ii',
        'backtracking-subsets-ii',
      ],
    },
    {
      name: 'Permutations (used array)',
      signals: [
        "'all orderings', 'arrangements', 'line-ups', 'sequences'",
        'Order matters: `[1,2]` and `[2,1]` are different answers',
        'Very small n (≤ 10)',
      ],
      template: `sort nums                               // only if values repeat
function go():
    if length of path = n:
        append a copy of path to result
        return
    for i from 0 to n - 1:
        if used[i]: continue
        if i > 0 and nums[i] = nums[i - 1] and not used[i - 1]: continue
        if nums[i] breaks a rule at this position: continue   // prune
        used[i] ← true
        push nums[i] onto path
        go()
        pop from path
        used[i] ← false`,
      examples: ['backtracking-permutations', 'backtracking-permutations-ii', 'backtracking-beautiful-arrangement'],
    },
    {
      name: 'Choices per position (strings and cuts)',
      signals: [
        'Build a string one character at a time, with options per position',
        "Split a string into valid pieces: 'partition', 'restore', 'segment into'",
        'Each step decides a character or a piece, not an item from a pool',
      ],
      template: `function go(i):                         // i = next position in s
    if i = n:
        save a copy of path (or path joined)
        return
    for each option at position i:      // a letter, or a piece s[i..end]
        if option is not valid: continue   // check BEFORE going deeper
        push option onto path
        go(i + length of option)
        pop from path`,
      examples: [
        'backtracking-letter-case',
        'backtracking-phone-letters',
        'backtracking-palindrome-partition',
        'backtracking-restore-ip',
      ],
    },
    {
      name: 'Board search with pruning',
      signals: [
        'Find a word or path in a grid where a cell is used once per path',
        "Place items on a board with no conflicts (queens, Sudoku digits)",
        "'Can it be split / arranged?' with small n: fail fast and stop at the first success",
      ],
      template: `function place(step):
    if every item is placed: record the answer; return
    for each option for this step:
        if not canPlace(option): continue     // O(1) with sets / counters
        mark option                           // choose
        place(step + 1)                       // explore
        unmark option                         // un-choose (restore!)`,
      examples: ['backtracking-word-search', 'backtracking-max-gold', 'backtracking-n-queens', 'backtracking-matchsticks'],
    },
  ],
  practice: [
    { title: 'Combination Sum III', leetcode: 216, difficulty: 'medium', hint: 'Pick from 1-9 with a start index. Stop when the path has k numbers or the sum passes n.' },
    { title: 'Binary Watch', leetcode: 401, difficulty: 'easy', hint: 'Choose which of the 10 lights are on (a combination), then throw out times like 12:00 or 7:60.' },
    { title: 'Letter Tile Possibilities', leetcode: 1079, difficulty: 'medium', hint: 'Permutations with repeated letters, but count at every node, not only at full length.' },
    { title: 'Partition to K Equal Sum Subsets', leetcode: 698, difficulty: 'medium', hint: 'Matchsticks with k buckets instead of 4: same quick checks, biggest first, skip equally full buckets.' },
    { title: 'Maximum Length of a Concatenated String with Unique Characters', leetcode: 1239, difficulty: 'medium', hint: 'Take or skip each word. Skip a word at once if it repeats a letter or clashes with letters already taken.' },
    { title: 'Split a String Into the Max Number of Unique Substrings', leetcode: 1593, difficulty: 'medium', hint: 'Cut the string like palindrome partitioning, but a piece is valid if it is not already in a set of used pieces.' },
    { title: 'The k-th Lexicographical String of All Happy Strings of Length n', leetcode: 1415, difficulty: 'medium', hint: "Build strings in alphabetical order from 'a', 'b', 'c', never repeating the last letter. Stop at the k-th." },
    { title: 'N-Queens II', leetcode: 52, difficulty: 'hard', hint: 'The same search as N-Queens, but return a count instead of drawing boards.' },
    { title: 'Sudoku Solver', leetcode: 37, difficulty: 'hard', hint: 'Fill empty cells one at a time. Keep sets for each row, column and 3 × 3 box so every check is O(1).' },
    { title: 'Unique Paths III', leetcode: 980, difficulty: 'hard', hint: 'Grid backtracking that counts paths stepping on every empty square once: track how many squares are left.' },
  ],
};

export default mod;
