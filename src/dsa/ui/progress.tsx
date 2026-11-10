import { createContext, useContext } from 'react';
import { emptyProgress, type Progress } from '../storage';

export interface ProgressApi {
  progress: Progress;
  update: (fn: (p: Progress) => Progress) => void;
}

export const ProgressContext = createContext<ProgressApi>({ progress: emptyProgress(), update: () => {} });
export const useProgress = () => useContext(ProgressContext);

const toggle = (list: string[], id: string, on: boolean) =>
  on ? (list.includes(id) ? list : [...list, id]) : list.filter((x) => x !== id);

export const setLessonDone = (key: string, on: boolean) => (p: Progress): Progress => ({ ...p, lessons: toggle(p.lessons, key, on) });
export const markSolved = (id: string) => (p: Progress): Progress =>
  p.solved.includes(id) ? p : { ...p, solved: [...p.solved, id] };
export const saveCode = (id: string, code: string | null) => (p: Progress): Progress => {
  const next = { ...p.code };
  if (code === null) delete next[id];
  else next[id] = code;
  return { ...p, code: next };
};
export const answerQuiz = (key: string, choice: number | null) => (p: Progress): Progress => {
  const next = { ...p.quiz };
  if (choice === null) delete next[key];
  else next[key] = choice;
  return { ...p, quiz: next };
};
