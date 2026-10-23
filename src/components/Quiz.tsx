import { Check, X, ArrowRight, CircleHelp } from 'lucide-react';
import { useState } from 'react';
import type { QuizQuestion } from '../types';
export default function Quiz({
  questions,
  lessonId,
  answers,
  onAnswer,
}: {
  questions: QuizQuestion[];
  lessonId: string;
  answers: Record<string, number>;
  onAnswer: (key: string, value: number) => void;
}) {
  const [selected, setSelected] = useState<Record<number, number>>({});
  return (
    <div className="quiz-section">
      <div className="section-overline">
        <CircleHelp size={17} />
        <span>CHECK YOUR UNDERSTANDING</span>
      </div>
      <h2>A small check. A stronger foundation.</h2>
      <p className="section-description">
        Take a moment to reason it through. Every attempt helps you learn.
      </p>
      {questions.map((q, i) => {
        const key = lessonId + ':' + i;
        const saved = answers[key];
        const answered = saved !== undefined;
        const correct = saved === q.answer;
        const choice = selected[i] ?? saved;
        return (
          <div key={i} className="quiz-card">
            <div className="quiz-count">
              QUESTION {String(i + 1).padStart(2, '0')}{' '}
              <span>OF {String(questions.length).padStart(2, '0')}</span>
            </div>
            <h3>{q.question}</h3>
            <div className="quiz-options" role="radiogroup" aria-label={q.question}>
              {q.options.map((o, j) => (
                <button
                  role="radio"
                  aria-checked={choice === j}
                  key={j}
                  className={
                    'quiz-option ' +
                    (choice === j ? 'selected ' : '') +
                    (answered && j === saved ? (correct ? 'correct' : 'incorrect') : '')
                  }
                  onClick={() => setSelected({ ...selected, [i]: j })}
                >
                  <span className="option-letter">{String.fromCharCode(65 + j)}</span>
                  <span>{o}</span>
                  {answered && j === saved && (correct ? <Check size={17} /> : <X size={17} />)}
                </button>
              ))}
            </div>
            {answered && (
              <div
                className={'quiz-feedback ' + (correct ? 'correct-feedback' : 'incorrect-feedback')}
                role="status"
              >
                <strong>{correct ? 'You’ve got it.' : 'A useful moment to pause.'}</strong>
                <p>{q.explanation}</p>
              </div>
            )}
            <button
              className="small-button"
              disabled={choice === undefined || (answered && choice === saved)}
              onClick={() => onAnswer(key, choice!)}
            >
              {answered ? (correct ? 'Answer checked' : 'Check again') : 'Check answer'}
              <ArrowRight size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
