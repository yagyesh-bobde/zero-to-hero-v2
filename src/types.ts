export type View = 'overview' | 'curriculum' | 'playground' | 'notes' | 'resources';
export type LabKind =
  | 'gradient'
  | 'bigram'
  | 'mlp'
  | 'normalization'
  | 'backprop'
  | 'tensor'
  | 'wavenet'
  | 'attention'
  | 'tokenizer';
export interface QuizQuestion {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
}
export interface Challenge {
  title: string;
  instructions: string;
  starter: string;
  solution: string;
  tests: string;
  hint: string;
}
export interface Lesson {
  id: string;
  title: string;
  minutes: number;
  summary: string;
  sections: { title: string; body: string; formula?: string }[];
  keyTakeaways: string[];
  quiz: QuizQuestion[];
  challenge: Challenge;
  lab: LabKind;
}
export interface CourseModule {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  description: string;
  duration: string;
  videoId: string;
  sourceTitle: string;
  topics: string[];
  project: string;
  lessons: Lesson[];
}
export interface Progress {
  completed: string[];
  quizAnswers: Record<string, number>;
  code: Record<string, string>;
  codePassed: string[];
  notes: Record<string, string>;
  lastLesson: string | null;
  activeDays: string[];
  startedAt: string;
}
