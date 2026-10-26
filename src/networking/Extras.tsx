import { useState } from 'react';
import { ArrowDownToLine, ArrowRight, Bookmark, CheckCircle2, Upload } from 'lucide-react';
import { checklist, examQuestions, glossary, lessons } from './curriculum';
import {
  downloadFile,
  emptyProgress,
  parseProgress,
  recoveryRecord,
  replaceProgress,
} from './storage';
import type { Progress } from './types';
export type Update = (fn: (p: Progress) => Progress) => void;
export function NotebookTools({ progress, update }: { progress: Progress; update: Update }) {
  const [pending, setPending] = useState<Progress | null>(null),
    [message, setMessage] = useState(''),
    [reset, setReset] = useState(false);
  const apply = (next: Progress) => {
    if (!replaceProgress(next)) {
      setMessage('Storage could not be written. Export your current work and try again.');
      return;
    }
    update(() => next);
    setPending(null);
    setReset(false);
    setMessage('Networking progress saved.');
  };
  return (
    <div className="net-notebook-tools">
      <section className="net-extra-card">
        <h2>Keep a portable copy.</h2>
        <p>
          Progress belongs to this browser and origin. Export a JSON backup to move devices. The
          HTML download contains the course; the backup contains your work.
        </p>
        <label className="net-btn net-btn-small net-file-button">
          <Upload size={15} />
          Import a progress backup
          <input
            type="file"
            accept=".json,application/json"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              e.target.value = '';
              if (!file) return;
              try {
                if (file.size > 2_000_000) throw Error('Choose a backup smaller than 2 MB.');
                const next = parseProgress(JSON.parse(await file.text()));
                setPending(next);
                setMessage('');
              } catch (error) {
                setPending(null);
                setMessage(error instanceof Error ? error.message : 'Could not read this backup.');
              }
            }}
          />
        </label>
        <a
          className="net-btn net-btn-small"
          href="/react-native-networking/fieldguide.html"
          download
        >
          <ArrowDownToLine size={15} />
          Save standalone course HTML
        </a>
        {recoveryRecord() !== null && (
          <div className="net-callout">
            <p>
              The saved record could not be read. Automatic writes are paused to preserve it.
              Download its exact contents before importing a valid backup or deliberately resetting
              networking progress.
            </p>
            <button
              className="net-btn net-btn-small"
              onClick={() => downloadFile('networking-unreadable-record.txt', recoveryRecord()!)}
            >
              Download original saved record
            </button>
          </div>
        )}
        {pending && (
          <div className="net-import-preview">
            <h3>Review this backup</h3>
            <p>
              {pending.completed.length} completed lessons · {Object.keys(pending.notes).length}{' '}
              notes · {Object.keys(pending.answers).length} quiz answers. Import replaces the
              current networking record. Older standalone backups migrate into this format; new
              coding exercises still need completing.
            </p>
            <button
              className="net-btn net-btn-primary net-btn-small"
              onClick={() => apply(pending)}
            >
              Replace networking progress
            </button>{' '}
            <button className="net-btn net-btn-small" onClick={() => setPending(null)}>
              Cancel import
            </button>
          </div>
        )}
        <p role="status">{message}</p>
      </section>
      <section className="net-extra-card">
        <h2>
          <Bookmark size={19} /> Bookmarked lessons
        </h2>
        {progress.bookmarks.length ? (
          progress.bookmarks.map((id) => {
            const l = lessons.find((l) => l.id === id);
            return (
              l && (
                <a key={id} className="net-bookmark-link" href={`#/lesson/${id}`}>
                  {l.title}
                  <ArrowRight size={14} />
                </a>
              )
            );
          })
        ) : (
          <p>Use the bookmark button in a lesson to keep it here.</p>
        )}
      </section>
      <section className="net-extra-card">
        <h2>
          Production evidence checklist{' '}
          <small>
            {progress.checklist.length}/{checklist.length}
          </small>
        </h2>
        <p>
          Tick only after verifying the behavior in your own app. These are your evidence records,
          separate from course completion.
        </p>
        <div className="net-evidence-list">
          {checklist.map(([category, text], i) => (
            <label key={i}>
              <input
                type="checkbox"
                checked={progress.checklist.includes(String(i))}
                onChange={(e) =>
                  update((p) => ({
                    ...p,
                    checklist: e.target.checked
                      ? [...new Set([...p.checklist, String(i)])]
                      : p.checklist.filter((x) => x !== String(i)),
                  }))
                }
              />
              <span>
                <strong>{category}</strong>
                {text}
              </span>
            </label>
          ))}
        </div>
      </section>
      <section className="net-extra-card">
        <h2>Incident notebook</h2>
        <p>
          Separate observations from hypotheses. Keep credentials and personal data out of examples.
        </p>
        <div className="net-journal">
          {[
            [
              'symptom',
              '1. Symptom and impact',
              'What did users see? Which build, device, network, and time window?',
            ],
            [
              'hypotheses',
              '2. Hypotheses and disconfirming tests',
              'What observation would rule each possible cause out?',
            ],
            [
              'evidence',
              '3. Observations and evidence',
              'Sanitized request/trace IDs, timing boundaries, reproducible steps, and facts.',
            ],
            [
              'resolution',
              '4. Mitigation, cause, and follow-up',
              'What restored outcomes? What evidence supports the cause? Who owns prevention?',
            ],
          ].map(([key, label, placeholder]) => (
            <label key={key}>
              {label}
              <textarea
                maxLength={20000}
                placeholder={placeholder}
                value={progress.journal[key] || ''}
                onChange={(e) =>
                  update((p) => ({ ...p, journal: { ...p.journal, [key]: e.target.value } }))
                }
              />
            </label>
          ))}
        </div>
      </section>
      <details className="net-extra-card">
        <summary>Reset networking progress</summary>
        <p>
          Export a backup first if you want a copy. This resets networking lessons, notes, coding
          work, labs, assessment, and checklist.
        </p>
        {reset ? (
          <>
            <button className="net-btn net-btn-small" onClick={() => apply(emptyProgress())}>
              Delete networking progress
            </button>{' '}
            <button className="net-btn net-btn-small" onClick={() => setReset(false)}>
              Keep my data
            </button>
          </>
        ) : (
          <button className="net-btn net-btn-small" onClick={() => setReset(true)}>
            Review reset…
          </button>
        )}
      </details>
    </div>
  );
}
export function Review({ progress, update }: { progress: Progress; update: Update }) {
  const [filter, setFilter] = useState(''),
    [card, setCard] = useState(0),
    [flipped, setFlipped] = useState(false);
  const terms = Object.entries(glossary).filter(([k, v]) =>
    (k + ' ' + v).toLowerCase().includes(filter.toLowerCase()),
  );
  const current = terms[card % Math.max(terms.length, 1)];
  const mistakes = lessons.flatMap((l) =>
    l.questions.flatMap((q, i) =>
      progress.answers[`${l.id}/${i}`] !== undefined &&
      progress.answers[`${l.id}/${i}`] !== q.answer
        ? [{ l, q }]
        : [],
    ),
  );
  const score = examQuestions.filter((q) => progress.exam.answers[q.id] === q.answer).length,
    answered = examQuestions.filter((q) => progress.exam.answers[q.id] !== undefined).length;
  return (
    <div className="net-page">
      <div className="net-page-intro">
        <span className="net-kicker">RETRIEVE · REASON · REVISIT</span>
        <h1>Make the reasoning stick.</h1>
        <p>
          Review mistakes, practice the vocabulary, and test your understanding in 16 production
          scenarios. All selections save as you go.
        </p>
      </div>
      <section className="net-extra-card">
        <h2>Mistake review</h2>
        {mistakes.length ? (
          mistakes.map(({ l, q }) => (
            <div className="net-review-mistake" key={q.id}>
              <a href={`#/lesson/${l.id}`}>{l.title}</a>
              <h3>{q.prompt}</h3>
              <p>{q.explanation}</p>
            </div>
          ))
        ) : (
          <p>
            No incorrect selected lesson answers to review. Lesson checks include explanations to
            help you reason through each choice.
          </p>
        )}
      </section>
      <section className="net-extra-card">
        <h2>
          Vocabulary & flashcards <small>{Object.keys(glossary).length} terms</small>
        </h2>
        <label className="net-model-control">
          <span>Find a concept</span>
          <input
            type="search"
            value={filter}
            placeholder="Search terms and definitions…"
            onChange={(e) => {
              setFilter(e.target.value);
              setCard(0);
              setFlipped(false);
            }}
          />
        </label>
        {current ? (
          <>
            <button
              className="net-flashcard"
              aria-label={flipped ? 'Hide flashcard definition' : 'Reveal flashcard definition'}
              aria-pressed={flipped}
              onClick={() => setFlipped((v) => !v)}
            >
              <small>
                {(card % terms.length) + 1} / {terms.length} · click to{' '}
                {flipped ? 'hide' : 'reveal'}
              </small>
              <strong>{current[0]}</strong>
              {flipped && <span>{current[1]}</span>}
            </button>
            <button
              className="net-text-button"
              onClick={() => {
                setCard((c) => c + 1);
                setFlipped(false);
              }}
            >
              Next concept <ArrowRight size={15} />
            </button>
            <details>
              <summary>Browse matching definitions</summary>
              <dl>
                {terms.map(([term, definition]) => (
                  <div className="net-definition" key={term}>
                    <dt>{term}</dt>
                    <dd>{definition}</dd>
                  </div>
                ))}
              </dl>
            </details>
          </>
        ) : (
          <p>No matching concepts.</p>
        )}
      </section>
      <section className="net-extra-card">
        <span className="net-kicker">FINAL KNOWLEDGE CHECKPOINT</span>
        <h2>Reason through the failures.</h2>
        <p>
          16 scenarios · target 13/16 · best submitted score {progress.exam.bestScore}/16. This
          assessment checks understanding; real-device capstone evidence verifies implementation.
        </p>
        {progress.exam.submitted && (
          <div className="net-callout">
            <CheckCircle2 size={18} />
            <p>
              <strong>
                {score}/16 · {score >= 13 ? 'Checkpoint passed' : 'Keep practicing'}
              </strong>
              <br />
              Read the explanations and revisit the relevant lesson. Your best submitted score is
              saved.
            </p>
          </div>
        )}
        {examQuestions.map((q, i) => (
          <section className="net-quiz" key={q.id}>
            <span className="net-kicker">SCENARIO {String(i + 1).padStart(2, '0')}</span>
            <h3>{q.prompt}</h3>
            <div role="group" aria-label={q.prompt}>
              {q.options.map((option, j) => (
                <button
                  key={j}
                  disabled={progress.exam.submitted}
                  aria-pressed={progress.exam.answers[q.id] === j}
                  className={`net-quiz-option ${progress.exam.answers[q.id] === j ? (progress.exam.submitted ? (j === q.answer ? 'is-correct' : 'is-wrong') : 'is-selected') : ''}`}
                  onClick={() =>
                    update((p) => ({
                      ...p,
                      exam: { ...p.exam, answers: { ...p.exam.answers, [q.id]: j } },
                    }))
                  }
                >
                  <span>{String.fromCharCode(65 + j)}</span>
                  <span>{option}</span>
                </button>
              ))}
            </div>
            {progress.exam.submitted && (
              <div
                className={`net-quiz-feedback ${progress.exam.answers[q.id] === q.answer ? 'is-correct' : 'is-wrong'}`}
              >
                <strong>Answer {String.fromCharCode(65 + q.answer)}</strong>
                <p>{q.explanation}</p>
              </div>
            )}
          </section>
        ))}
        {progress.exam.submitted ? (
          <button
            className="net-btn"
            onClick={() =>
              update((p) => ({ ...p, exam: { ...p.exam, answers: {}, submitted: false } }))
            }
          >
            Retake assessment
          </button>
        ) : (
          <button
            className="net-btn net-btn-primary"
            disabled={answered < examQuestions.length}
            onClick={() =>
              update((p) => ({
                ...p,
                exam: { ...p.exam, submitted: true, bestScore: Math.max(p.exam.bestScore, score) },
              }))
            }
          >
            Check all 16 answers · {answered}/16 selected
          </button>
        )}
      </section>
    </div>
  );
}
