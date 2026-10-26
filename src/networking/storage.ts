import type { Progress } from './types';
import { examQuestions, lessons, checklist } from './curriculum';
import { challenges } from './challenges';
export const NETWORK_STORAGE_KEY = 'rn-networking-learning-v1';
export const NETWORK_THEME_KEY = 'rn-networking-theme-v1';
export const emptyProgress = (): Progress => ({
  version: 1,
  course: 'react-native-networking',
  completed: [],
  answers: {},
  notes: {},
  code: {},
  passed: [],
  lastLesson: null,
  bookmarks: [],
  labs: [],
  labState: {},
  labSeen: {},
  checklist: [],
  journal: {},
  exam: { answers: {}, submitted: false, bestScore: 0 },
});
const record = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === 'object' && !Array.isArray(v);
const textMap = (v: unknown): Record<string, string> => {
  if (v === undefined) return {};
  if (!record(v) || Object.values(v).some((x) => typeof x !== 'string' || x.length > 20000))
    throw Error('A text record has an invalid type or exceeds 20,000 characters.');
  return Object.fromEntries(Object.entries(v)) as Record<string, string>;
};
const strings = (v: unknown): string[] => {
  if (v === undefined) return [];
  if (!Array.isArray(v) || v.some((x) => typeof x !== 'string'))
    throw Error('An activity list is invalid.');
  return [...new Set(v)] as string[];
};
const simulationIds = ['http', 'retry', 'cache', 'auth', 'outbox', 'trace', 'metrics', 'diagnosis'];
let unreadable: string | null = null;
export function recoveryRecord() {
  return unreadable;
}
export function parseProgress(value: unknown): Progress {
  if (!record(value)) throw Error('Expected a networking progress object.');
  if (value.app === 'rn-network-fieldguide' && value.version === 1) return migrateStandalone(value);
  if (value.course !== 'react-native-networking' || value.version !== 1)
    throw Error(
      'Choose a version 1 React Native Networking backup. Other courses are not imported.',
    );
  const p = emptyProgress();
  const ids = new Set(lessons.map((l) => l.id));
  for (const field of ['answers', 'labState', 'labSeen', 'exam'] as const)
    if (value[field] !== undefined && !record(value[field]))
      throw Error(`Invalid ${field} record.`);
  for (const field of ['completed', 'bookmarks'] as const)
    p[field] = strings(value[field]).filter((id) => ids.has(id));
  p.passed = strings(value.passed).filter((id) => challenges.some((c) => c.id === id));
  p.labs = strings(value.labs).filter((id) => simulationIds.includes(id));
  p.notes = Object.fromEntries(Object.entries(textMap(value.notes)).filter(([id]) => ids.has(id)));
  p.code = Object.fromEntries(
    Object.entries(textMap(value.code)).filter(([id]) => challenges.some((c) => c.id === id)),
  );
  p.journal = Object.fromEntries(
    Object.entries(textMap(value.journal)).filter(([id]) =>
      ['symptom', 'hypotheses', 'evidence', 'resolution'].includes(id),
    ),
  );
  p.checklist = strings(value.checklist).filter((id) => checklist.some((_, i) => String(i) === id));
  if (record(value.answers))
    for (const l of lessons)
      l.questions.forEach((q, i) => {
        const key = `${l.id}/${i}`,
          n = value.answers && record(value.answers) ? value.answers[key] : undefined;
        if (n !== undefined) {
          if (!Number.isInteger(n) || Number(n) < 0 || Number(n) >= q.options.length)
            throw Error('A quiz answer is invalid.');
          p.answers[key] = Number(n);
        }
      });
  p.lastLesson =
    typeof value.lastLesson === 'string' && ids.has(value.lastLesson) ? value.lastLesson : null;
  if (record(value.labState))
    for (const [id, c] of Object.entries(value.labState))
      if (simulationIds.includes(id) && record(c))
        p.labState[id] = Object.fromEntries(
          Object.entries(c).filter(
            ([, v]) =>
              typeof v === 'boolean' ||
              typeof v === 'string' ||
              (typeof v === 'number' && Number.isFinite(v)),
          ),
        ) as Record<string, string | number | boolean>;
  if (record(value.labSeen))
    for (const [id, seen] of Object.entries(value.labSeen))
      if (simulationIds.includes(id)) p.labSeen[id] = strings(seen);
  if (record(value.exam)) {
    const e = value.exam;
    p.exam.bestScore = Math.max(
      0,
      Math.min(examQuestions.length, Number.isInteger(e.bestScore) ? Number(e.bestScore) : 0),
    );
    if (record(e.answers))
      for (const q of examQuestions) {
        const n = e.answers[q.id];
        if (Number.isInteger(n) && Number(n) >= 0 && Number(n) < q.options.length)
          p.exam.answers[q.id] = Number(n);
      }
    p.exam.submitted =
      e.submitted === true && examQuestions.every((q) => p.exam.answers[q.id] !== undefined);
    if (p.exam.submitted)
      p.exam.bestScore = Math.max(
        p.exam.bestScore,
        examQuestions.filter((q) => p.exam.answers[q.id] === q.answer).length,
      );
  }
  return p;
}
function migrateStandalone(v: Record<string, unknown>): Progress {
  const p = emptyProgress();
  const trueKeys = (x: unknown) => {
    if (x !== undefined && !record(x)) throw Error('Invalid standalone activity record.');
    return Object.entries(record(x) ? x : {})
      .filter(([, v]) => v === true)
      .map(([k]) => k);
  };
  p.notes = textMap(v.notes);
  p.bookmarks = trueKeys(v.bookmarks);
  p.labs = trueKeys(v.labs);
  p.checklist = trueKeys(v.checklist);
  p.journal = textMap(v.journal);
  if (typeof v.lastLesson === 'string' && lessons.some((l) => l.id === v.lastLesson))
    p.lastLesson = v.lastLesson;
  for (const l of lessons) {
    l.questions.forEach((q, i) => {
      const a = record(v.answers) ? v.answers[q.id] : null;
      if (
        record(a) &&
        Number.isInteger(a.choice) &&
        Number(a.choice) >= 0 &&
        Number(a.choice) < q.options.length
      )
        p.answers[`${l.id}/${i}`] = Number(a.choice);
    });
    if (
      record(v.read) &&
      v.read[l.id] === true &&
      l.questions.every((q, i) => p.answers[`${l.id}/${i}`] === q.answer) &&
      !l.challenge
    )
      p.completed.push(l.id);
  }
  if (record(v.exam)) {
    p.exam.bestScore = Number.isInteger(v.exam.bestScore)
      ? Math.min(16, Math.max(0, Number(v.exam.bestScore)))
      : 0;
    if (record(v.exam.responses))
      for (const q of examQuestions) {
        const a = v.exam.responses[q.id];
        if (Number.isInteger(a) && Number(a) >= 0 && Number(a) < q.options.length)
          p.exam.answers[q.id] = Number(a);
      }
    p.exam.submitted = examQuestions.every((q) => p.exam.answers[q.id] !== undefined);
  }
  return parseProgress(p);
}
export function readProgress(): Progress {
  unreadable = null;
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(NETWORK_STORAGE_KEY);
    return raw ? parseProgress(JSON.parse(raw)) : emptyProgress();
  } catch {
    unreadable = raw;
    return emptyProgress();
  }
}
export function writeProgress(p: Progress) {
  if (unreadable !== null) return false;
  try {
    localStorage.setItem(NETWORK_STORAGE_KEY, JSON.stringify(p));
    return true;
  } catch {
    return false;
  }
}
export function replaceProgress(p: Progress) {
  const previous = unreadable;
  unreadable = null;
  if (!writeProgress(p)) {
    unreadable = previous;
    return false;
  }
  return true;
}
export function downloadFile(name: string, content: string, type = 'text/plain') {
  const url = URL.createObjectURL(new Blob([content], { type })),
    a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
