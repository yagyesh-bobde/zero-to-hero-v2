import { Check, RotateCcw, X } from 'lucide-react';
import type { Question } from '../types';
import { Rich } from './Rich';
import { answerQuiz, useProgress } from './progress';

export default function Quiz({ questions, keyPrefix }: { questions: Question[]; keyPrefix: string }) {
  const { progress, update } = useProgress();
  const answers = questions.map((_, i) => progress.quiz[`${keyPrefix}/${i}`]);
  const answered = answers.filter((a) => a !== undefined).length;
  const right = questions.filter((q, i) => answers[i] === q.answer).length;
  return (
    <div className="dsa-quiz">
      {questions.map((q, qi) => {
        const chosen = answers[qi];
        const done = chosen !== undefined;
        const correct = chosen === q.answer;
        return (
          <fieldset key={qi} className="dsa-question">
            <legend>
              <span className="dsa-question-n">{qi + 1}</span>
              <span>
                <Rich text={q.prompt} />
              </span>
            </legend>
            <div className="dsa-options">
              {q.options.map((opt, oi) => {
                const state = !done ? '' : oi === q.answer ? 'is-right' : oi === chosen ? 'is-wrong' : 'is-dim';
                return (
                  <button
                    key={oi}
                    type="button"
                    className={`dsa-option ${state}`}
                    aria-pressed={chosen === oi}
                    disabled={done}
                    onClick={() => update(answerQuiz(`${keyPrefix}/${qi}`, oi))}
                  >
                    <span className="dsa-option-key" aria-hidden="true">
                      {state === 'is-right' ? <Check size={14} /> : state === 'is-wrong' ? <X size={14} /> : String.fromCharCode(65 + oi)}
                    </span>
                    <span>
                      <Rich text={opt} />
                    </span>
                  </button>
                );
              })}
            </div>
            {done && (
              <div className={`dsa-explain ${correct ? 'is-right' : 'is-wrong'}`} role="status">
                <strong>{correct ? 'Correct.' : 'Not quite.'}</strong>{' '}
                <Rich text={q.explanation} />
                {!correct && (
                  <button type="button" className="dsa-link-btn" onClick={() => update(answerQuiz(`${keyPrefix}/${qi}`, null))}>
                    <RotateCcw size={13} /> Try again
                  </button>
                )}
              </div>
            )}
          </fieldset>
        );
      })}
      {answered === questions.length && questions.length > 0 && (
        <p className="dsa-quiz-score">
          You got <strong>{right}</strong> of {questions.length} right.
          {right < questions.length && ' Reread the part you missed, then try again.'}
        </p>
      )}
    </div>
  );
}
