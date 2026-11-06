import { Fragment } from 'react';
import type { ReactNode } from 'react';
import { lineSet } from '../timeline';
import type { CodeLang, CodeScene, TerminalScene } from '../types';
import { SceneTitle, toneClass, useTyping } from './shared';

const KEYWORDS = new Set(
  `const let var function return if else for while do switch case break continue new class extends
  import export from default async await try catch finally throw typeof instanceof in of this super
  null undefined true false void interface type enum implements public private protected static
  readonly fun val override suspend object companion when is as package lateinit init data sealed
  func struct let guard self Self nil some any protocol extension weak strong lazy mutating
  final abstract synchronized boolean int long float double char String def end do require
  @interface @implementation @property @end nonatomic YES NO include namespace auto`.split(/\s+/),
);

const TOKEN =
  /(\/\/.*$|#(?![\w-]*\()(?=\s|$).*$|\/\*.*?\*\/)|('(?:[^'\\]|\\.)*'?|"(?:[^"\\]|\\.)*"?|`(?:[^`\\]|\\.)*`?)|(\b\d[\d_.]*\b)|(<\/?[A-Za-z][\w.-]*|\/?>)|(@?[A-Za-z_$][\w$]*)(?=\s*\()|(@?[A-Za-z_$][\w$]*)/gm;

function highlightLine(line: string, lang: CodeLang): ReactNode[] {
  if (lang === 'text') return [line];
  const out: ReactNode[] = [];
  let last = 0;
  const hashComments = lang === 'bash' || lang === 'ruby';
  for (const m of line.matchAll(TOKEN)) {
    const i = m.index ?? 0;
    if (i > last) out.push(line.slice(last, i));
    const [text, comment, str, num, tag, call, word] = m;
    let cls = '';
    if (comment) cls = comment.startsWith('#') && !hashComments ? '' : 'tk-comment';
    else if (str) cls = 'tk-string';
    else if (num) cls = 'tk-number';
    else if (tag) cls = lang === 'tsx' || lang === 'xml' || lang === 'js' ? 'tk-tag' : '';
    else if (call) cls = KEYWORDS.has(call) ? 'tk-keyword' : 'tk-call';
    else if (word)
      cls = KEYWORDS.has(word) ? 'tk-keyword' : /^[A-Z]/.test(word) ? 'tk-type' : '';
    out.push(
      cls ? (
        <span key={i} className={cls}>
          {text}
        </span>
      ) : (
        text
      ),
    );
    last = i + text.length;
  }
  if (last < line.length) out.push(line.slice(last));
  return out;
}

export function Code({ scene, playing }: { scene: CodeScene; playing: boolean }) {
  const lang = scene.lang ?? 'tsx';
  const code = scene.code.replace(/\n+$/, '');
  const typed = useTyping(code, playing, Math.max(70, code.length / 1.4));
  const visible = code.slice(0, typed);
  const lines = code.split('\n');
  const highlight = lineSet(scene.highlight);
  const errors = lineSet(scene.errors);
  const added = lineSet(scene.added);
  const marked = highlight.size + errors.size + added.size > 0;
  const focus = scene.focus ?? marked;
  const done = typed >= code.length;
  // Shrink the font so the longest line fits (mono glyphs are 0.6em wide; ~76cqw of room).
  const longest = Math.max(...lines.map((line) => line.length), 1);
  const fontSize = `${Math.min(3.6, 76 / (longest * 0.6)).toFixed(2)}cqw`;
  let offset = 0;
  return (
    <div className="scene-code">
      <div className="code-window">
        <div className="code-chrome">
          <span className="dot" />
          <span className="dot" />
          <span className="dot" />
          {scene.file && <span className="code-file">{scene.file}</span>}
          <span className="code-lang">{lang}</span>
        </div>
        <div className="code-body" style={{ fontSize }}>
          {lines.map((line, index) => {
            const n = index + 1;
            const start = offset;
            offset += line.length + 1;
            const shown = visible.length > start ? visible.slice(start, start + line.length) : '';
            const cursor = !done && visible.length >= start && visible.length <= start + line.length;
            const mark = errors.has(n)
              ? 'is-error'
              : added.has(n)
                ? 'is-added'
                : highlight.has(n)
                  ? 'is-hl'
                  : focus
                    ? 'is-dim'
                    : '';
            const note = done && scene.note?.line === n ? scene.note : undefined;
            return (
              <Fragment key={index}>
                <div className={`code-line ${done ? mark : ''}`}>
                  <span className="code-gutter">{n}</span>
                  <span className="code-text">
                    {highlightLine(shown, lang)}
                    {cursor && <span className="code-cursor" />}
                  </span>
                </div>
                <div className={`code-note-row ${note ? 'is-open' : ''}`}>
                  <div>
                    {note && (
                      <span className={`code-note ${toneClass(note.tone, 'accent')}`} key={note.text}>
                        {note.text}
                      </span>
                    )}
                  </div>
                </div>
              </Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function TypedCommand({ text, playing }: { text: string; playing: boolean }) {
  const typed = useTyping(text, playing, 26);
  return (
    <>
      {text.slice(0, typed)}
      {typed < text.length && <span className="code-cursor" />}
    </>
  );
}

export function Terminal({ scene, playing }: { scene: TerminalScene; playing: boolean }) {
  return (
    <div className="scene-terminal">
      <SceneTitle>{scene.title}</SceneTitle>
      <div className="term-window">
        <div className="code-chrome">
          <span className="dot" />
          <span className="dot" />
          <span className="dot" />
          <span className="code-file">terminal</span>
        </div>
        <div className="term-body">
          {scene.lines.map((line, i) => (
            <div key={`${i}:${line.cmd ?? ''}:${line.out ?? ''}`} className={`term-line ${toneClass(line.tone)}`}>
              {line.cmd !== undefined && (
                <div className="term-cmd">
                  <span className="term-prompt">$</span>
                  <TypedCommand text={line.cmd} playing={playing} />
                </div>
              )}
              {line.out && (
                <pre className="term-out" style={{ animationDelay: line.cmd ? `${line.cmd.length / 26 + 0.15}s` : '0s' }}>
                  {line.out}
                </pre>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
