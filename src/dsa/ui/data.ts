// Read-only views over the course registry used by the UI.
import { modules, parts } from '../course';
import type { Lesson, Module, PatternCard, Problem } from '../types';
import type { Progress } from '../storage';
import sample from './sample';
import { SAMPLE_ID } from './route';

export { modules, parts };

export const liveModules = modules.filter((m) => !m.draft);

export const findModule = (id: string): Module | undefined =>
  id === SAMPLE_ID ? sample : modules.find((m) => m.id === id && !m.draft);

export interface LessonRef {
  module: Module;
  lesson: Lesson;
  /** 1-based position inside the module. */
  index: number;
}

const flatten = (list: Module[]): LessonRef[] =>
  list.flatMap((module) => module.lessons.map((lesson, i) => ({ module, lesson, index: i + 1 })));

export const courseLessons = flatten(liveModules);
const sampleLessons = flatten([sample]);

export const lessonKey = (moduleId: string, lessonId: string) => `${moduleId}/${lessonId}`;

/** Previous and next lesson in course order (the sample module only links within itself). */
export function neighbours(moduleId: string, lessonId: string) {
  const list = moduleId === SAMPLE_ID ? sampleLessons : courseLessons;
  const i = list.findIndex((r) => r.module.id === moduleId && r.lesson.id === lessonId);
  return { prev: i > 0 ? list[i - 1] : undefined, next: i >= 0 ? list[i + 1] : undefined };
}

export interface ProblemEntry {
  problem: Problem;
  lesson: Lesson;
  module: Module;
}

export const courseProblems: ProblemEntry[] = liveModules.flatMap((module) =>
  module.lessons.flatMap((lesson) => lesson.problems.map((problem) => ({ problem, lesson, module }))),
);

const problemById = new Map<string, ProblemEntry>(
  [...courseProblems, ...sample.lessons.flatMap((lesson) => lesson.problems.map((problem) => ({ problem, lesson, module: sample })))].map(
    (e) => [e.problem.id, e],
  ),
);
export const findProblem = (id: string) => problemById.get(id);

export interface PatternEntry {
  card: PatternCard;
  module: Module;
}
export const coursePatterns: PatternEntry[] = liveModules.flatMap((module) => module.patterns.map((card) => ({ card, module })));

export function moduleStats(module: Module, progress: Progress) {
  const lessons = module.lessons.length;
  const done = module.lessons.filter((l) => progress.lessons.includes(lessonKey(module.id, l.id))).length;
  const problems = module.lessons.reduce((n, l) => n + l.problems.length, 0);
  const solved = module.lessons.reduce((n, l) => n + l.problems.filter((p) => progress.solved.includes(p.id)).length, 0);
  return { lessons, done, problems, solved };
}

export function courseStats(progress: Progress) {
  const done = courseLessons.filter((r) => progress.lessons.includes(lessonKey(r.module.id, r.lesson.id))).length;
  const solved = courseProblems.filter((e) => progress.solved.includes(e.problem.id)).length;
  return { lessons: courseLessons.length, done, problems: courseProblems.length, solved };
}

/** Where "Continue" should take the learner. */
export function resumePoint(progress: Progress): LessonRef | undefined {
  const last = progress.last;
  if (last) {
    const ref = courseLessons.find((r) => r.module.id === last.module && r.lesson.id === last.lesson);
    if (ref) {
      if (!progress.lessons.includes(lessonKey(ref.module.id, ref.lesson.id))) return ref;
      const after = courseLessons.slice(courseLessons.indexOf(ref) + 1).find((r) => !progress.lessons.includes(lessonKey(r.module.id, r.lesson.id)));
      if (after) return after;
    }
  }
  return courseLessons.find((r) => !progress.lessons.includes(lessonKey(r.module.id, r.lesson.id))) ?? courseLessons[0];
}

export const partOf = (module: Module) => parts.find((p) => p.id === module.part);
