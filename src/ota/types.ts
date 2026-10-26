export type LabKind =
  'boundary' | 'lifecycle' | 'patch' | 'architecture' | 'rollout' | 'failure' | 'workshop';
export interface Section {
  title: string;
  body: string[];
  bullets?: string[];
  code?: { label: string; value: string };
  callout?: string;
}
export interface Question {
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
}
export interface Chapter {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
}
export interface Progress {
  completed: string[];
  answers: Record<string, number>;
  notes: Record<string, string>;
  code: Record<string, string>;
  passed: string[];
  lastLesson: string | null;
}
