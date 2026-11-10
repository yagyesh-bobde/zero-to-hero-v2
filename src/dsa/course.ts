// Course registry. Only the orchestrator edits this file.
import type { Lesson, Module, PartId, Problem } from './types';
import m01 from './modules/01-thinking';
import m02 from './modules/02-hashing';
import m03 from './modules/03-two-pointers';
import m04 from './modules/04-sliding-window';
import m05 from './modules/05-binary-search';
import m06 from './modules/06-stacks-queues';
import m07 from './modules/07-linked-lists';
import m08 from './modules/08-recursion';
import m09 from './modules/09-backtracking';
import m10 from './modules/10-trees';
import m11 from './modules/11-bst-tries';
import m12 from './modules/12-heaps';
import m13 from './modules/13-graphs';
import m14 from './modules/14-advanced-graphs';
import m15 from './modules/15-greedy-intervals';
import m16 from './modules/16-dp-1d';
import m17 from './modules/17-dp-2d';
import m18 from './modules/18-bits-math';
import m19 from './modules/19-pattern-mastery';

export const modules: Module[] = [m01, m02, m03, m04, m05, m06, m07, m08, m09, m10, m11, m12, m13, m14, m15, m16, m17, m18, m19];

export const parts: { id: PartId; title: string; blurb: string }[] = [
  { id: 'foundations', title: 'Foundations', blurb: 'The habits and the one data structure behind half of all fast solutions.' },
  { id: 'linear', title: 'Linear patterns', blurb: 'Arrays, strings and lists: the patterns most interview problems are built on.' },
  { id: 'recursion', title: 'Recursion & search', blurb: 'Break problems into smaller copies of themselves, then search every option smartly.' },
  { id: 'nonlinear', title: 'Trees & graphs', blurb: 'Data with branches and connections: traverse, order and connect it.' },
  { id: 'optimization', title: 'Optimization', blurb: 'Find the best answer: greedy choices and dynamic programming.' },
  { id: 'mastery', title: 'Mastery', blurb: 'Bit tricks, then mixed practice until spotting the pattern is automatic.' },
];

export interface ProblemRef {
  problem: Problem;
  lesson: Lesson;
  module: Module;
}

export const problemIndex: Map<string, ProblemRef> = new Map(
  modules.flatMap((module) =>
    module.lessons.flatMap((lesson) =>
      lesson.problems.map((problem): [string, ProblemRef] => [problem.id, { problem, lesson, module }]),
    ),
  ),
);

export const allProblems: ProblemRef[] = [...problemIndex.values()];
