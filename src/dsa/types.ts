// The content contract for the /dsa course. Modules are plain data (src/dsa/modules/*.ts);
// the UI in src/dsa/ renders them. This file is FROZEN: content authors must not edit it.
// See src/dsa/AUTHORING.md for how to use every field.

/** Inline text supports **bold**, *italic* and `code`. Nothing else (no links, no HTML). */
export type Rich = string;

/** One frame of an animated array walkthrough. The UI shows one frame at a time with Prev/Next. */
export interface ArrayFrame {
  /** The cells to draw, left to right. Use '' for an empty slot. */
  cells: (string | number)[];
  /** Named pointers drawn under a cell, e.g. { L: 0, R: 5 } or { i: 2 }. Out-of-range = hidden. */
  pointers?: Record<string, number>;
  /** Cell indexes to highlight (the cells the algorithm is looking at right now). */
  active?: number[];
  /** Cell indexes that are finished / ruled out (drawn faded). */
  done?: number[];
  /** Cell indexes to mark as the answer / a match (drawn in the success color). */
  found?: number[];
  /** Optional side state shown under the array, e.g. { sum: 9, best: 12, seen: '{2:0, 7:1}' }. */
  vars?: Record<string, string | number>;
  /** One sentence explaining this step. */
  note: Rich;
}

export type Block =
  /** A paragraph. */
  | { kind: 'text'; text: Rich }
  /** A bullet or numbered list. */
  | { kind: 'list'; items: Rich[]; ordered?: boolean }
  /** Code. 'pseudo' = course pseudocode (see AUTHORING.md), 'js' = runnable-style JavaScript. */
  | { kind: 'code'; lang: 'pseudo' | 'js'; code: string; title?: string }
  /** A highlighted aside. story = real-world hook, insight = the "aha", tip = practical advice, trap = common bug. */
  | { kind: 'callout'; tone: 'story' | 'insight' | 'tip' | 'trap'; title?: string; text: Rich }
  /** Step-through animation over an array / string. 3-12 frames. */
  | { kind: 'steps'; title: string; frames: ArrayFrame[] }
  /** A dry-run table: each row is one step of a loop / recursion. */
  | { kind: 'trace'; title: string; columns: string[]; rows: (string | number)[][]; note?: Rich }
  /** Monospace drawing for trees, graphs, grids, recursion trees, memory layouts. Keep lines <= 56 chars. */
  | { kind: 'diagram'; title?: string; art: string; caption?: Rich }
  /** Side-by-side approaches with their cost, e.g. brute force vs hash map. */
  | {
      kind: 'compare';
      title?: string;
      rows: { approach: string; time: string; space: string; note: Rich }[];
    }
  /** A generic small table (cheat sheets, "constraint -> target complexity", etc.). */
  | { kind: 'table'; title?: string; head: string[]; rows: Rich[][] };

export type Difficulty = 'easy' | 'medium' | 'hard';

/** One way to solve a problem. List approaches from naive to best. */
export interface Approach {
  /** e.g. "Brute force", "Sort + two pointers", "Hash map (one pass)". */
  name: string;
  /** The idea in 1-3 sentences, in plain words. Explain WHY it works. */
  idea: Rich;
  /** Pseudocode (course conventions). Required on the best approach. */
  pseudo?: string;
  /** JavaScript. Optional for non-final approaches. */
  code?: string;
  time: string; // e.g. 'O(n²)'
  space: string; // e.g. 'O(1)'
}

/**
 * How the runner turns test args/results into real objects.
 * 'list' = array <-> singly linked list of ListNode { val, next }.
 * 'tree' = LeetCode level-order array (null for missing) <-> TreeNode { val, left, right }.
 * 'raw'  = passed through unchanged (default).
 */
export type Shape = 'raw' | 'list' | 'tree';

/**
 * How a result is compared with `expected`.
 * 'exact'     = deep equal (default).
 * 'unordered' = outer array order does not matter.
 * 'nested'    = outer AND inner array order do not matter (subsets, groups, combinations).
 * 'float'     = numbers equal within 1e-5.
 */
export type Compare = 'exact' | 'unordered' | 'nested' | 'float';

export interface TestCase {
  args: unknown[];
  expected: unknown;
  /** Short label shown in results, e.g. 'empty array', 'all negatives'. */
  name?: string;
}

export interface Problem {
  /** Globally unique, kebab-case, prefixed with the module id, e.g. 'hashing-two-sum'. */
  id: string;
  title: string;
  difficulty: Difficulty;
  /** The LeetCode problem number this mirrors, if any (we write our own statement). */
  leetcode?: number;
  /** Pattern name shown as a tag, e.g. 'Sliding window (variable)'. */
  pattern: string;
  /** The task in your own words. Can include a tiny story. */
  statement: Rich;
  examples: { input: string; output: string; explain?: Rich }[];
  /** Optional constraints, e.g. ['1 ≤ n ≤ 10⁵', 'values fit in 32-bit int']. */
  constraints?: string[];
  /** 2-4 progressive hints: nudge first, near-giveaway last. */
  hints: Rich[];
  /** Naive -> optimal. At least 2 for medium/hard. */
  approaches: Approach[];
  /** Name of the function the learner writes. */
  fn: string;
  /** Starter code: signature + empty body + a comment. Must define `fn`. */
  starter: string;
  /** Reference solution. Must define `fn` and pass every test. */
  solution: string;
  /** 4-10 tests including edge cases. Args are JSON-safe values. */
  tests: TestCase[];
  /** Shapes of each argument (by index) and of the result. Omit for all-raw. */
  shapes?: { args?: Shape[]; result?: Shape };
  compare?: Compare;
  /** One-line lesson to remember after solving. */
  takeaway?: Rich;
}

export interface Question {
  prompt: Rich;
  options: Rich[];
  /** Index into options. */
  answer: number;
  explanation: Rich;
}

export interface Lesson {
  /** Unique within the module, kebab-case. */
  id: string;
  title: string;
  /** One line shown in the sidebar and lesson header. */
  summary: string;
  minutes: number;
  /** Teaching content, in order. Start with a problem/story, end with the pattern + template. */
  blocks: Block[];
  /** Problems for this lesson, in order. The first one is usually the worked example. */
  problems: Problem[];
  /** 2-4 check-your-understanding questions. */
  quiz: Question[];
  /** 2-4 short bullets to remember. */
  takeaways: Rich[];
}

/** A pattern card for the module cheat sheet and the course-wide pattern finder. */
export interface PatternCard {
  name: string;
  /** "Reach for this when..." signals in the problem statement. */
  signals: Rich[];
  /** Pseudocode template. */
  template: string;
  /** Problem ids (from any module) that use this pattern. */
  examples: string[];
}

/** Extra LeetCode practice, solved on leetcode.com. */
export interface PracticeLink {
  title: string;
  leetcode: number;
  difficulty: Difficulty;
  /** A one-line nudge, never the full answer. */
  hint: Rich;
}

export type PartId = 'foundations' | 'linear' | 'recursion' | 'nonlinear' | 'optimization' | 'mastery';

export interface Module {
  /** Kebab-case, matches the file name after the number, e.g. 'two-pointers'. */
  id: string;
  /** 1-based position in the course. */
  number: number;
  part: PartId;
  title: string;
  /** One line, shown on the roadmap. */
  tagline: string;
  /** true while the module is still being written: the UI shows it as "coming soon". */
  draft: boolean;
  /** Why this module matters + what you will be able to solve after it (2-4 sentences). */
  intro: Rich;
  lessons: Lesson[];
  patterns: PatternCard[];
  practice: PracticeLink[];
}
