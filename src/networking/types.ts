export type LabKind =
  'http' | 'retry' | 'cache' | 'auth' | 'outbox' | 'trace' | 'metrics' | 'diagnosis' | 'workshop';
export type Block =
  | { kind: 'paragraph'; text: string }
  | { kind: 'list'; ordered: boolean; items: string[] }
  | { kind: 'code'; language: string; value: string };
export interface Section {
  title: string;
  body: string[];
  blocks: Block[];
}
export interface Question {
  id: string;
  prompt: string;
  options: string[];
  answer: number;
  explanation: string;
}
export interface Lesson {
  id: string;
  title: string;
  description: string;
  minutes: number;
  sections: Section[];
  lab: LabKind;
  takeaway: string;
  questions: Question[];
  sources: string[];
  challenge?: string;
  markdown: string;
  objectives: string[];
}
export interface Chapter {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
}
export interface Progress {
  version: 1;
  course: 'react-native-networking';
  completed: string[];
  answers: Record<string, number>;
  notes: Record<string, string>;
  code: Record<string, string>;
  passed: string[];
  lastLesson: string | null;
  bookmarks: string[];
  labs: string[];
  labState: Record<string, Record<string, string | number | boolean>>;
  labSeen: Record<string, string[]>;
  checklist: string[];
  journal: Record<string, string>;
  exam: { answers: Record<string, number>; submitted: boolean; bestScore: number };
}
