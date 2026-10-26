import content from './content.json';
import type { Block, Chapter, LabKind, Question, Section } from './types';
export const researchDate = content.updated;
export const glossary = content.glossary;
export const checklist = content.checklist;
export const examQuestions: Question[] = content.exam.map((q) => ({ ...q, explanation: q.why }));
export function parseSections(markdown: string): Section[] {
  const lines = markdown.split('\n');
  const sections: Section[] = [];
  let current: Section | undefined;
  let i = 0;
  const ensure = () =>
    current ||
    ((current = { title: 'Start here', body: [], blocks: [] }), sections.push(current), current);
  while (i < lines.length) {
    const text = lines[i].trim();
    if (!text) {
      i++;
      continue;
    }
    if (text.startsWith('## ')) {
      current = { title: text.slice(3), body: [], blocks: [] };
      sections.push(current);
      i++;
      continue;
    }
    if (text.startsWith('```')) {
      const language = text.slice(3),
        code: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) code.push(lines[i++]);
      i++;
      ensure().blocks.push({ kind: 'code', language, value: code.join('\n') });
      continue;
    }
    if (/^(- |\d+\. )/.test(text)) {
      const ordered = /^\d/.test(text),
        items: string[] = [];
      while (i < lines.length && /^(- |\d+\. )/.test(lines[i].trim()))
        items.push(lines[i++].trim().replace(/^(- |\d+\. )/, ''));
      const block: Block = { kind: 'list', ordered, items };
      ensure().blocks.push(block);
      ensure().body.push(...items);
      continue;
    }
    const parts = [text];
    i++;
    while (i < lines.length && lines[i].trim() && !/^(## |```|- |\d+\. )/.test(lines[i].trim()))
      parts.push(lines[i++].trim());
    const paragraph = parts.join(' ');
    ensure().body.push(paragraph);
    ensure().blocks.push({ kind: 'paragraph', text: paragraph });
  }
  return sections;
}
const chapterIds = [
  'foundations',
  'request-layer',
  'trust-resilience',
  'mobile-systems',
  'observability',
  'production',
];
const labForLesson: Record<string, LabKind> = {
  'mental-model': 'http',
  async: 'http',
  wire: 'trace',
  http: 'http',
  native: 'diagnosis',
  client: 'http',
  errors: 'http',
  query: 'cache',
  mutations: 'outbox',
  lists: 'cache',
  oauth: 'auth',
  sessions: 'auth',
  retry: 'retry',
  security: 'diagnosis',
  connectivity: 'cache',
  offline: 'outbox',
  background: 'outbox',
  files: 'outbox',
  realtime: 'trace',
  protocols: 'http',
  logs: 'diagnosis',
  metrics: 'metrics',
  traces: 'trace',
  debug: 'diagnosis',
  testing: 'diagnosis',
  performance: 'trace',
  release: 'cache',
  capstone: 'outbox',
};
const challengeForLesson: Record<string, string> = {
  http: 'classify-response',
  client: 'validate-product',
  retry: 'should-retry',
  offline: 'recover-outbox',
  metrics: 'metric-summary',
  release: 'supports-contract',
};
export const chapters: Chapter[] = content.stages.map((stage, index) => ({
  id: chapterIds[index],
  title: stage.name,
  description: stage.description,
  lessons: content.lessons
    .filter((l) => l.stage === index)
    .map((l) => ({
      id: l.id,
      title: l.title,
      description: l.subtitle,
      minutes: l.minutes,
      sections: parseSections(l.body),
      lab: labForLesson[l.id],
      takeaway: l.exercise,
      questions: l.questions.map((q) => ({ ...q, explanation: q.why })),
      sources: l.sources,
      challenge: challengeForLesson[l.id],
      markdown: l.body,
      objectives: l.objectives,
    })),
}));
export const lessons = chapters.flatMap((chapter, chapterIndex) =>
  chapter.lessons.map((lesson, lessonIndex) => ({ ...lesson, chapter, chapterIndex, lessonIndex })),
);
export const totalMinutes = lessons.reduce((sum, l) => sum + l.minutes, 0);
