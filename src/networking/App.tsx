import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowDownToLine,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Bookmark,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Code2,
  FileText,
  FlaskConical,
  Github,
  Layers,
  LayoutDashboard,
  ListTree,
  Moon,
  NotebookPen,
  PanelLeftClose,
  PanelLeftOpen,
  Radio,
  Search,
  ShieldCheck,
  Sun,
  X,
} from 'lucide-react';
import { chapters, lessons, totalMinutes, researchDate, checklist } from './curriculum';
import { sourceById, sources, accessLimitations } from './sources';
import { downloadFile, readProgress, writeProgress, NETWORK_THEME_KEY } from './storage';
import type { LabKind, Progress, Section } from './types';
import Lab, { labMeta, RequestJourney } from './Labs';
import Workshop from './Workshop';
import { NotebookTools, Review } from './Extras';

type Page = 'overview' | 'path' | 'playground' | 'notebook' | 'sources' | 'lesson' | 'review';
const pageLabels: Record<Page, string> = {
  review: 'Review & assessment',
  overview: 'Overview',
  path: 'Learning path',
  playground: 'Playground',
  notebook: 'My notebook',
  sources: 'Sources & field guide',
  lesson: 'Learning path',
};
const navigation = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'path', label: 'Learning path', icon: ListTree },
  { id: 'playground', label: 'Playground', icon: FlaskConical },
  { id: 'review', label: 'Review & assessment', icon: CheckCircle2 },
  { id: 'notebook', label: 'My notebook', icon: NotebookPen },
  { id: 'sources', label: 'Sources & field guide', icon: BookOpen },
] as const;
function routeFromHash() {
  const [page = 'overview', id = ''] = location.hash.replace(/^#\/?/, '').split('/');
  return { page: page || 'overview', id };
}
function go(page: Page, id?: string) {
  location.hash = `/${page}${id ? '/' + id : ''}`;
}
function Inline({ text }: { text: string }) {
  return (
    <>
      {text
        .split(/(`[^`]+`|\*\*[^*]+\*\*)/g)
        .map((s, i) =>
          s.startsWith('`') ? (
            <code key={i}>{s.slice(1, -1)}</code>
          ) : s.startsWith('**') ? (
            <strong key={i}>{s.slice(2, -2)}</strong>
          ) : (
            s
          ),
        )}
    </>
  );
}
function ArticleSection({ section }: { section: Section }) {
  return (
    <section className="net-article-section">
      <h2>{section.title}</h2>
      {section.blocks.map((block, i) =>
        block.kind === 'paragraph' ? (
          <p key={i}>
            <Inline text={block.text} />
          </p>
        ) : block.kind === 'code' ? (
          <div key={i} className="net-code-block">
            <div className="net-code-bar">
              <span>{block.language || 'Reference example'}</span>
            </div>
            <pre>
              <code>{block.value}</code>
            </pre>
          </div>
        ) : block.ordered ? (
          <ol key={i}>
            {block.items.map((item, j) => (
              <li key={j}>
                <Inline text={item} />
              </li>
            ))}
          </ol>
        ) : (
          <ul key={i}>
            {block.items.map((item, j) => (
              <li key={j}>
                <Inline text={item} />
              </li>
            ))}
          </ul>
        ),
      )}
    </section>
  );
}
function SourceLink({ id }: { id: string }) {
  const source = sourceById(id);
  return (
    <a href={source.url} target="_blank" rel="noreferrer">
      {source.title}
      <ArrowUpRight size={13} />
    </a>
  );
}
const chapterIcons = [Layers, Code2, ListTree, Radio, ShieldCheck, CheckCircle2];

export default function App() {
  const [route, setRoute] = useState(routeFromHash);
  const [progress, setProgress] = useState<Progress>(readProgress);
  const [theme, setTheme] = useState(() =>
    document.documentElement.dataset.networkTheme === 'light' ? 'light' : 'dark',
  );
  const [collapsed, setCollapsed] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [expanded, setExpanded] = useState<string[]>(['foundations']);
  const [search, setSearch] = useState(false);
  const [saved, setSaved] = useState(true);
  const [lab, setLab] = useState<LabKind>('http');
  const mainRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);
  const current = lessons.find((l) => l.id === route.id);
  const completed = lessons.filter((l) => progress.completed.includes(l.id)).length;
  const percent = Math.round((completed / lessons.length) * 100);
  const next =
    lessons.find((l) => l.id === progress.lastLesson && !progress.completed.includes(l.id)) ||
    lessons.find((l) => !progress.completed.includes(l.id)) ||
    lessons[0];
  const update = useCallback((fn: (p: Progress) => Progress) => setProgress(fn), []);
  const onCode = useCallback(
    (id: string, code: string) =>
      update((p) => ({
        ...p,
        code: { ...p.code, [id]: code },
        passed: p.passed.filter((x) => x !== id),
      })),
    [update],
  );
  const onPass = useCallback(
    (id: string) =>
      update((p) => (p.passed.includes(id) ? p : { ...p, passed: [...p.passed, id] })),
    [update],
  );
  const workshopProps = { progress, onCode, onPass, update };
  useEffect(() => {
    if (search) setMobile(false);
  }, [search]);
  const overlayOpen = mobile || search;
  useEffect(() => {
    if (!overlayOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [overlayOpen]);
  useEffect(() => {
    const handler = () => {
      setRoute(routeFromHash());
      setMobile(false);
      setSearch(false);
      window.scrollTo({ top: 0, behavior: 'instant' });
      mainRef.current?.focus({ preventScroll: true });
    };
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);
  useEffect(() => {
    setSaved(writeProgress(progress));
  }, [progress]);
  useEffect(() => {
    document.documentElement.dataset.networkTheme = theme;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', theme === 'dark' ? '#141416' : '#faf9f6');
    try {
      localStorage.setItem(NETWORK_THEME_KEY, theme);
    } catch {}
  }, [theme]);
  useEffect(() => {
    const label =
      route.page === 'lesson' && current
        ? current.title
        : pageLabels[route.page as Page] || 'Not found';
    document.title = `${label} · React Native Networking — Zero to Hero`;
    if (route.page === 'lesson' && current) {
      update((p) => (p.lastLesson === current.id ? p : { ...p, lastLesson: current.id }));
      setExpanded((e) => (e.includes(current.chapter.id) ? e : [...e, current.chapter.id]));
    }
  }, [route.page, current, update]);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSearch(false);
        setMobile(false);
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearch((s) => !s);
      }
      if (
        (e.metaKey || e.ctrlKey) &&
        e.key.toLowerCase() === 'b' &&
        !['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)
      ) {
        e.preventDefault();
        if (matchMedia('(max-width: 820px)').matches) setMobile((v) => !v);
        else setCollapsed((c) => !c);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);
  useEffect(() => {
    if (!mobile) return;
    drawerRef.current?.querySelector<HTMLButtonElement>('button')?.focus();
    const trap = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !drawerRef.current) return;
      const nodes = Array.from(
        drawerRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'),
      ).filter((el) => el.getClientRects().length);
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener('keydown', trap);
    return () => {
      document.removeEventListener('keydown', trap);
      if (!document.querySelector('.net-search-dialog')) menuRef.current?.focus();
    };
  }, [mobile]);
  const toggleSidebar = () =>
    matchMedia('(max-width: 820px)').matches ? setMobile((v) => !v) : setCollapsed((v) => !v);
  const openLab = (kind: LabKind) => {
    setLab(kind);
    if (route.page !== 'playground') go('playground');
    else window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  return (
    <div
      className={`net-app ${collapsed ? 'net-sidebar-collapsed' : ''} ${mobile ? 'net-mobile-open' : ''}`}
    >
      <a
        className="net-skip"
        href="#net-main"
        onClick={(e) => {
          e.preventDefault();
          mainRef.current?.focus();
        }}
      >
        Skip to content
      </a>
      {mobile && (
        <button
          className="net-backdrop"
          aria-label="Close navigation"
          onClick={() => setMobile(false)}
        />
      )}
      <aside
        ref={drawerRef}
        className="net-sidebar"
        aria-label="Course navigation"
        {...(mobile ? { role: 'dialog', 'aria-modal': true } : {})}
      >
        <div className="net-sidebar-brand">
          <a href="/" aria-label="Zero to Hero, neural networks course">
            <span className="net-brand-mark">✳</span>
            <span>
              zero <span className="net-brand-to">to</span> hero
              <span className="net-brand-period">.</span>
            </span>
          </a>
          <button
            className="net-mobile-close net-icon-button"
            aria-label="Close navigation"
            onClick={() => setMobile(false)}
          >
            <X size={18} />
          </button>
        </div>
        <div className="net-course-identity">
          <span className="net-course-icon">
            <Radio size={19} />
          </span>
          <div>
            <strong>React Native Networking</strong>
            <span>A course from the inside out</span>
          </div>
          <span className="net-new-pill">NEW</span>
        </div>
        <button className="net-sidebar-search" onClick={() => setSearch(true)}>
          <Search size={15} />
          <span>Find a lesson…</span>
          <kbd>⌘ K</kbd>
        </button>
        <div className="net-sidebar-scroll">
          <nav className="net-nav">
            {navigation.map((n) => (
              <a
                key={n.id}
                href={`#/${n.id}`}
                className={
                  route.page === n.id || (n.id === 'path' && route.page === 'lesson')
                    ? 'is-active'
                    : ''
                }
                aria-current={route.page === n.id ? 'page' : undefined}
              >
                <n.icon size={17} />
                <span>{n.label}</span>
                {n.id === 'playground' && <span className="net-nav-count">9</span>}
              </a>
            ))}
          </nav>
          <div className="net-sidebar-section">
            <span>The learning path</span>
            <span>06</span>
          </div>
          <div className="net-chapter-nav">
            {chapters.map((chapter, i) => {
              const isExpanded = expanded.includes(chapter.id);
              const count = chapter.lessons.filter((l) => progress.completed.includes(l.id)).length;
              return (
                <div key={chapter.id}>
                  <button
                    className={`net-chapter-toggle ${current?.chapter.id === chapter.id && route.page === 'lesson' ? 'is-current' : ''}`}
                    aria-expanded={isExpanded}
                    onClick={() =>
                      setExpanded((e) =>
                        e.includes(chapter.id)
                          ? e.filter((x) => x !== chapter.id)
                          : [...e, chapter.id],
                      )
                    }
                  >
                    <span className="net-chapter-number">{String(i + 1).padStart(2, '0')}</span>
                    <span>{chapter.title}</span>
                    {count === chapter.lessons.length ? (
                      <CheckCircle2 size={14} />
                    ) : (
                      <ChevronRight className={isExpanded ? 'is-open' : ''} size={14} />
                    )}
                  </button>
                  {isExpanded && (
                    <div className="net-lesson-nav">
                      {chapter.lessons.map((lesson, j) => (
                        <a
                          key={lesson.id}
                          href={`#/lesson/${lesson.id}`}
                          className={
                            route.page === 'lesson' && route.id === lesson.id ? 'is-active' : ''
                          }
                          aria-current={
                            route.page === 'lesson' && route.id === lesson.id ? 'page' : undefined
                          }
                        >
                          <span>
                            {progress.completed.includes(lesson.id) ? (
                              <Check size={12} />
                            ) : (
                              `${i + 1}.${j + 1}`
                            )}
                          </span>
                          <span>{lesson.title}</span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <div className="net-sidebar-bottom">
          <div className="net-progress-label">
            <span>Your progress</span>
            <strong>
              {completed}
              <span> / {lessons.length}</span>
            </strong>
          </div>
          <div
            className="net-progress-track"
            role="progressbar"
            aria-label="Course progress"
            aria-valuenow={percent}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <span style={{ width: `${percent}%` }} />
          </div>
          <span className="net-local-note">Saved on this device · separate course</span>
          <a className="net-back-course" href="/">
            <ArrowLeft size={13} />
            Neural networks course
            <ArrowUpRight size={13} />
          </a>
        </div>
      </aside>
      <div className="net-workspace">
        <header className="net-topbar">
          <div>
            <button
              ref={menuRef}
              className="net-icon-button"
              aria-label={
                mobile ? 'Close navigation' : collapsed ? 'Show navigation' : 'Toggle navigation'
              }
              aria-expanded={mobile || !collapsed}
              onClick={toggleSidebar}
            >
              {collapsed ? <PanelLeftOpen size={19} /> : <PanelLeftClose size={19} />}
            </button>
            <span className="net-topbar-crumb">
              Courses <ChevronRight size={13} />
              <strong>React Native Networking</strong>
            </span>
          </div>
          <div>
            <span className="net-topbar-page">{pageLabels[route.page as Page] || 'Not found'}</span>
            <button
              className="net-icon-button"
              aria-label="Search course"
              onClick={() => setSearch(true)}
            >
              <Search size={18} />
            </button>
            <button
              className="net-icon-button"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
              onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <a
              className="net-icon-button"
              aria-label="View source on GitHub"
              href="https://github.com/yagyesh-bobde/zero-to-hero-v2"
              target="_blank"
              rel="noreferrer"
            >
              <Github size={18} />
            </a>
          </div>
        </header>
        {!saved && (
          <div role="alert" className="net-storage-error">
            Progress could not be saved. Keep this tab open and export a backup from the notebook.
            An unreadable saved record is preserved there for recovery.
          </div>
        )}
        <main id="net-main" ref={mainRef} tabIndex={-1} className="net-main">
          {route.page === 'overview' ? (
            <Overview
              progress={progress}
              nextId={next.id}
              completed={completed}
              openLab={openLab}
            />
          ) : route.page === 'path' ? (
            <LearningPath progress={progress} />
          ) : route.page === 'lesson' && current ? (
            <LessonPage
              key={current.id}
              lesson={current}
              progress={progress}
              update={update}
              workshopProps={workshopProps}
            />
          ) : route.page === 'playground' ? (
            <div className="net-page">
              <PageIntro
                eyebrow="LEARN BY CHANGING THINGS"
                title="Your networking playground."
                description="Change a retry policy, crash an outbox, race a token refresh, or inspect a trace. Predict the outcome and compare it with the evidence."
              />
              <div className="net-lab-tabs" role="group" aria-label="Choose an interactive lab">
                {(Object.keys(labMeta) as LabKind[]).map((kind) => {
                  const Icon = labMeta[kind].icon;
                  return (
                    <button
                      key={kind}
                      className={lab === kind ? 'is-active' : ''}
                      aria-pressed={lab === kind}
                      onClick={() => setLab(kind)}
                    >
                      <Icon size={16} />
                      {labMeta[kind].title}
                    </button>
                  );
                })}
              </div>
              <Lab key={lab} kind={lab} {...workshopProps} />
              <p className="net-footnote">
                Local teaching models with explicit assumptions. Coding exercises run plain
                JavaScript in a disposable worker; native and server behavior require real
                integration checks.
              </p>
            </div>
          ) : route.page === 'review' ? (
            <Review progress={progress} update={update} />
          ) : route.page === 'notebook' ? (
            <Notebook progress={progress} update={update} />
          ) : route.page === 'sources' ? (
            <Resources progress={progress} />
          ) : (
            <div className="net-page">
              <PageIntro
                eyebrow="THIS PAGE ISN’T HERE"
                title="Let’s get you back on the path."
                description="That lesson or page doesn’t exist in this course."
              />
              <button className="net-btn net-btn-primary" onClick={() => go('path')}>
                Open the learning path
                <ArrowRight size={16} />
              </button>
            </div>
          )}
        </main>
        <footer className="net-footer">
          <span>
            Made for understanding. Built by{' '}
            <a href="https://github.com/yagyesh-bobde" target="_blank" rel="noreferrer">
              Yagyesh Bobde
            </a>
            .
          </span>
          <span>
            Independent learning companion ·{' '}
            <a href="#/sources">
              Source notes & attribution
              <ArrowUpRight size={12} />
            </a>
          </span>
        </footer>
      </div>
      {search && <SearchDialog close={() => setSearch(false)} />}
    </div>
  );
}
function PageIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="net-page-intro">
      <span className="net-kicker">
        <span className="net-live-dot" />
        {eyebrow}
      </span>
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  );
}
function Overview({
  progress,
  nextId,
  completed,
  openLab,
}: {
  progress: Progress;
  nextId: string;
  completed: number;
  openLab: (kind: LabKind) => void;
}) {
  const next = lessons.find((l) => l.id === nextId)!;
  return (
    <div className="net-overview">
      <section className="net-hero">
        <div className="net-hero-copy">
          <span className="net-kicker">
            <span className="net-live-dot" />
            REACT NATIVE · PRODUCTION NETWORKING
          </span>
          <h1>
            Make a request.
            <br />
            <em>
              Understand
              <br className="net-hero-break" /> every outcome.
            </em>
          </h1>
          <p>
            A tap becomes a request. A request becomes a result.
            <br className="net-wide-break" /> What happens when the connection breaks?
          </p>
          <p className="net-hero-secondary">
            Learn networking from the beginning: HTTP, native transport, authentication, caching,
            offline writes, observability, and production recovery. Follow the operation end to end.
          </p>
          <div className="net-hero-actions">
            <a className="net-btn net-btn-primary" href={`#/lesson/${nextId}`}>
              {completed === lessons.length
                ? 'Revisit the course'
                : progress.lastLesson
                  ? 'Continue learning'
                  : 'Start learning'}
              <ArrowRight size={17} />
            </a>
            <button className="net-btn net-btn-ghost" onClick={() => openLab('http')}>
              Try a lab
              <FlaskConical size={16} />
            </button>
          </div>
          <div className="net-start-hint">
            <span>{progress.lastLesson ? 'PICK UP AT' : 'START HERE'}</span>
            <span>
              {next.chapterIndex + 1}.{next.lessonIndex + 1} <span>·</span> {next.title}
            </span>
          </div>
          <div className="net-hero-stats">
            <div>
              <strong>06</strong>
              <span>Chapters</span>
            </div>
            <div>
              <strong>28</strong>
              <span>Small lessons</span>
            </div>
            <div>
              <strong>09</strong>
              <span>Interactive labs</span>
            </div>
          </div>
        </div>
        <div className="net-hero-visual">
          <div className="net-hero-visual-top">
            <span>
              <Radio size={13} />
              THE REQUEST, END TO END
            </span>
            <span className="net-live-dot" />
          </div>
          <RequestJourney />
        </div>
      </section>
      <div className="net-proof-strip">
        <span>
          <GitSourceIcon />
          36 official primary references
        </span>
        <span>
          <Code2 size={15} />6 runnable coding exercises
        </span>
        <span>
          <CheckCircle2 size={15} />
          100 quiz & assessment questions
        </span>
        <span>
          <Clock3 size={15} />~{Math.round(totalMinutes / 60)} hours · self-paced
        </span>
      </div>
      <section className="net-home-path">
        <div className="net-section-top">
          <div>
            <span className="net-kicker">A CLEAR PATH THROUGH THE SYSTEM</span>
            <h2>From “what is networking?” to “I can trace it.”</h2>
            <p>
              Six chapters. One connected mental model. Take them in order or jump into the handoff
              you want to understand.
            </p>
          </div>
          <a className="net-text-button" href="#/path">
            See all lessons
            <ArrowRight size={15} />
          </a>
        </div>
        <div className="net-chapter-cards">
          {chapters.map((chapter, i) => {
            const Icon = chapterIcons[i];
            const done = chapter.lessons.filter((l) => progress.completed.includes(l.id)).length;
            return (
              <a
                key={chapter.id}
                className="net-chapter-card"
                href={`#/lesson/${chapter.lessons[0].id}`}
              >
                <div className="net-card-top">
                  <span className="net-mono">0{i + 1}</span>
                  <Icon size={20} />
                </div>
                <h3>{chapter.title}</h3>
                <p>{chapter.description}</p>
                <div className="net-card-bottom">
                  <span>
                    {done
                      ? `${done}/${chapter.lessons.length} completed`
                      : `${chapter.lessons.length} lessons`}
                    <i /> {chapter.lessons.reduce((n, l) => n + l.minutes, 0)} min
                  </span>
                  <ArrowUpRight size={17} />
                </div>
              </a>
            );
          })}
        </div>
      </section>
      <section className="net-home-labs">
        <div>
          <span className="net-kicker">LESS PASSIVE READING. MORE “OH, I GET IT.”</span>
          <h2>
            Change one thing.
            <br />
            See why it matters.
          </h2>
          <p>
            Lose an acknowledgement after an order commits. Switch accounts with a shared cache key.
            Let a refresh complete after logout. See which safeguards change the outcome.
          </p>
          <button className="net-text-button" onClick={() => openLab('trace')}>
            Open the control room
            <ArrowRight size={15} />
          </button>
        </div>
        <div className="net-mini-labs">
          {(['retry', 'auth', 'trace'] as LabKind[]).map((kind) => {
            const Icon = labMeta[kind].icon;
            return (
              <button key={kind} onClick={() => openLab(kind)}>
                <span className="net-mini-lab-icon">
                  <Icon size={21} />
                </span>
                <span>
                  <strong>{labMeta[kind].title}</strong>
                  <small>{labMeta[kind].subtitle}</small>
                </span>
                <ArrowUpRight size={17} />
              </button>
            );
          })}
        </div>
      </section>
      <div className="net-prereq">
        <div>
          <BookOpen size={20} />
          <span>
            <strong>Bring a little React. We’ll build the rest.</strong>
            <p>
              Basic React Native and JavaScript help. You can complete every browser activity
              without an account, a native build, or an API key. The capstone then guides
              real-device verification.
            </p>
          </span>
        </div>
        <a href="#/sources">
          About the sources
          <ArrowUpRight size={14} />
        </a>
      </div>
    </div>
  );
}
function GitSourceIcon() {
  return <Github size={15} />;
}
function LearningPath({ progress }: { progress: Progress }) {
  return (
    <div className="net-page">
      <PageIntro
        eyebrow="THE LEARNING PATH"
        title="Every handoff, explained."
        description="Understand the mechanism, change it in a lab, then check your mental model. Finish all three checks and the linked exercise, where present, to complete a lesson."
      />
      <div className="net-path-list">
        {chapters.map((chapter, i) => (
          <section key={chapter.id} className="net-path-chapter">
            <div className="net-path-chapter-title">
              <span>0{i + 1}</span>
              <div>
                <h2>{chapter.title}</h2>
                <p>{chapter.description}</p>
              </div>
              <span className="net-path-count">
                {chapter.lessons.filter((l) => progress.completed.includes(l.id)).length}/
                {chapter.lessons.length}
              </span>
            </div>
            <div>
              {chapter.lessons.map((lesson, j) => (
                <a className="net-path-lesson" key={lesson.id} href={`#/lesson/${lesson.id}`}>
                  <span
                    className={`net-lesson-circle ${progress.completed.includes(lesson.id) ? 'is-complete' : ''}`}
                  >
                    {progress.completed.includes(lesson.id) ? (
                      <Check size={15} />
                    ) : (
                      `${i + 1}.${j + 1}`
                    )}
                  </span>
                  <div>
                    <h3>{lesson.title}</h3>
                    <p>{lesson.description}</p>
                  </div>
                  <span className="net-path-minutes">
                    {lesson.challenge && <Code2 size={14} />}
                    <Clock3 size={13} />
                    {lesson.minutes} min
                  </span>
                  <ArrowRight size={16} />
                </a>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
function LessonPage({
  lesson,
  progress,
  update,
  workshopProps,
}: {
  lesson: (typeof lessons)[number];
  progress: Progress;
  update: (fn: (p: Progress) => Progress) => void;
  workshopProps: {
    progress: Progress;
    onCode: (id: string, code: string) => void;
    onPass: (id: string) => void;
    update: (fn: (p: Progress) => Progress) => void;
  };
}) {
  const [tab, setTab] = useState('understand');
  const [noteOpen, setNoteOpen] = useState(false);
  const noteId = `net-note-${lesson.id}`;
  const index = lessons.findIndex((l) => l.id === lesson.id);
  const previous = lessons[index - 1];
  const next = lessons[index + 1];
  const quizPassed = lesson.questions.every(
    (q, i) => progress.answers[`${lesson.id}/${i}`] === q.answer,
  );
  const codePassed = !lesson.challenge || progress.passed.includes(lesson.challenge);
  const done = progress.completed.includes(lesson.id);
  const refs = [
    { id: 'understand', label: 'Understand', icon: BookOpen },
    { id: 'explore', label: 'Explore', icon: FlaskConical },
    ...(lesson.challenge ? [{ id: 'build', label: 'Build it', icon: Code2 }] : []),
    { id: 'check', label: 'Check in', icon: CheckCircle2 },
  ];
  return (
    <article className="net-lesson-page">
      <div className="net-lesson-breadcrumb">
        <a href="#/path">Learning path</a>
        <ChevronRight size={13} />
        <span>
          {String(lesson.chapterIndex + 1).padStart(2, '0')} · {lesson.chapter.title}
        </span>
      </div>
      <div className="net-lesson-header">
        <div className="net-lesson-meta">
          <span className="net-kicker">
            LESSON {lesson.chapterIndex + 1}.{lesson.lessonIndex + 1}
          </span>
          <span>
            <Clock3 size={13} />
            {lesson.minutes} min
          </span>
          {done && (
            <span className="net-complete-label">
              <CheckCircle2 size={14} />
              Completed
            </span>
          )}
        </div>
        <button
          className="net-text-button net-bookmark-toggle"
          aria-pressed={progress.bookmarks.includes(lesson.id)}
          onClick={() =>
            update((p) => ({
              ...p,
              bookmarks: p.bookmarks.includes(lesson.id)
                ? p.bookmarks.filter((x) => x !== lesson.id)
                : [...p.bookmarks, lesson.id],
            }))
          }
        >
          <Bookmark size={15} />
          {progress.bookmarks.includes(lesson.id) ? 'Bookmarked' : 'Bookmark lesson'}
        </button>
        <h1>{lesson.title}</h1>
        <p>{lesson.description}</p>
      </div>
      <div className="net-lesson-toolbar">
        <div className="net-lesson-tabs" role="tablist" aria-label="Lesson activities">
          {refs.map((t) => (
            <button
              key={t.id}
              role="tab"
              id={`net-tab-${t.id}`}
              aria-controls={`net-panel-${t.id}`}
              aria-selected={tab === t.id}
              tabIndex={tab === t.id ? 0 : -1}
              className={tab === t.id ? 'is-active' : ''}
              onClick={() => setTab(t.id)}
              onKeyDown={(event) => {
                if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
                event.preventDefault();
                const position = refs.findIndex((item) => item.id === t.id);
                const nextPosition =
                  event.key === 'Home'
                    ? 0
                    : event.key === 'End'
                      ? refs.length - 1
                      : (position + (event.key === 'ArrowRight' ? 1 : -1) + refs.length) %
                        refs.length;
                setTab(refs[nextPosition].id);
                document.getElementById(`net-tab-${refs[nextPosition].id}`)?.focus();
              }}
            >
              <t.icon size={15} />
              {t.label}
            </button>
          ))}
        </div>
        <button
          className={`net-icon-button ${noteOpen ? 'is-active' : ''}`}
          aria-label="Toggle lesson notes"
          aria-expanded={noteOpen}
          aria-controls={noteId}
          onClick={() => setNoteOpen((v) => !v)}
        >
          <NotebookPen size={18} />
        </button>
      </div>
      {noteOpen && (
        <div id={noteId} className="net-lesson-note">
          <label htmlFor="net-lesson-notes">
            <NotebookPen size={16} />
            Your explanation, in your words
          </label>
          <textarea
            id="net-lesson-notes"
            maxLength={20000}
            placeholder="What clicked? What would you explain differently?"
            value={progress.notes[lesson.id] || ''}
            onChange={(e) =>
              update((p) => ({ ...p, notes: { ...p.notes, [lesson.id]: e.target.value } }))
            }
          />
          <span>
            Saved locally as you type · <a href="#/notebook">Open notebook</a>
          </span>
        </div>
      )}
      <div
        role="tabpanel"
        id={`net-panel-${tab}`}
        aria-labelledby={`net-tab-${tab}`}
        className="net-lesson-content"
      >
        {tab === 'understand' ? (
          <>
            <div className="net-lesson-map">
              <span className="net-kicker">IN THIS LESSON</span>
              {lesson.sections.map((s, i) => (
                <a
                  key={s.title}
                  href={`#net-section-${i}`}
                  onClick={(e) => {
                    e.preventDefault();
                    document
                      .getElementById(`net-section-${i}`)
                      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                >
                  <span>0{i + 1}</span>
                  {s.title}
                  <ArrowDownToLine size={12} />
                </a>
              ))}
            </div>
            <div className="net-callout">
              <div>
                <strong>By the end, you can</strong>
                <ul>
                  {lesson.objectives.map((o) => (
                    <li key={o}>{o}</li>
                  ))}
                </ul>
              </div>
            </div>
            {lesson.sections.map((s, i) => (
              <div id={`net-section-${i}`} key={s.title}>
                <ArticleSection section={s} />
              </div>
            ))}
            <div className="net-takeaway">
              <span>
                <Layers size={17} />
                Take this with you
              </span>
              <p>{lesson.takeaway}</p>
            </div>
            <div className="net-lesson-sources">
              <span className="net-kicker">GO TO THE SOURCE</span>
              {lesson.sources.map((id) => (
                <SourceLink key={id} id={id} />
              ))}
            </div>
            <button
              className="net-btn net-btn-primary"
              onClick={() => {
                setTab('explore');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              Explore the mechanism
              <FlaskConical size={16} />
            </button>
          </>
        ) : tab === 'explore' ? (
          <>
            <div className="net-activity-intro">
              <h2>{labMeta[lesson.lab].title}</h2>
              <p>
                {labMeta[lesson.lab].subtitle} These local models help you reason about the
                implementation; source notes identify simplifications.
              </p>
            </div>
            <Lab
              key={lesson.lab}
              kind={lesson.lab}
              {...workshopProps}
              challengeId={lesson.challenge}
            />
            <button
              className="net-btn net-btn-primary"
              onClick={() => {
                setTab(lesson.challenge ? 'build' : 'check');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              {lesson.challenge ? 'Build the rule' : 'Check your understanding'}
              <ArrowRight size={16} />
            </button>
          </>
        ) : tab === 'build' ? (
          <>
            <Workshop {...workshopProps} challengeId={lesson.challenge} />
            <button className="net-btn net-btn-primary" onClick={() => setTab('check')}>
              Check your understanding
              <ArrowRight size={16} />
            </button>
          </>
        ) : (
          <>
            <div className="net-activity-intro">
              <span className="net-kicker">MAKE IT YOURS</span>
              <h2>Check your mental model.</h2>
              <p>
                Choose an answer, read the reasoning, and try again if you need to. All three checks
                {lesson.challenge ? ' and the coding exercise' : ''} count toward completion.
              </p>
            </div>
            {lesson.questions.map((question, i) => {
              const answer = progress.answers[`${lesson.id}/${i}`];
              const answered = answer !== undefined;
              const correct = answer === question.answer;
              return (
                <section className="net-quiz" key={question.prompt}>
                  <span className="net-kicker">CHECK 0{i + 1}</span>
                  <h3>{question.prompt}</h3>
                  <div role="group" aria-label={question.prompt}>
                    {question.options.map((option, j) => (
                      <button
                        key={option}
                        className={`net-quiz-option ${answer === j ? (correct ? 'is-correct' : 'is-wrong') : ''}`}
                        aria-pressed={answer === j}
                        onClick={() =>
                          update((p) => ({
                            ...p,
                            answers: { ...p.answers, [`${lesson.id}/${i}`]: j },
                          }))
                        }
                      >
                        <span>{String.fromCharCode(65 + j)}</span>
                        <span>{option}</span>
                        {answer === j && (correct ? <CheckCircle2 size={17} /> : <X size={17} />)}
                      </button>
                    ))}
                  </div>
                  {answered && (
                    <div
                      aria-live="polite"
                      className={`net-quiz-feedback ${correct ? 'is-correct' : 'is-wrong'}`}
                    >
                      <strong>{correct ? 'That’s it.' : 'Try another answer.'}</strong>
                      <p>{question.explanation}</p>
                    </div>
                  )}
                </section>
              );
            })}
            <div className="net-completion">
              <div>
                <h3>
                  {done
                    ? 'Lesson completed.'
                    : quizPassed && codePassed
                      ? 'Ready to move on.'
                      : 'Make the checks click.'}
                </h3>
                <p>
                  {done
                    ? 'Your progress is saved on this device.'
                    : !codePassed
                      ? 'Pass the coding exercise in Build it, then complete all three knowledge checks.'
                      : 'Answer all three checks correctly to complete this lesson.'}
                </p>
              </div>
              <button
                className="net-btn net-btn-primary"
                disabled={(!quizPassed || !codePassed) && !done}
                onClick={() => {
                  if (!done)
                    update((p) => ({ ...p, completed: [...new Set([...p.completed, lesson.id])] }));
                  if (done) next ? go('lesson', next.id) : go('path');
                }}
              >
                <CheckCircle2 size={16} />
                {done ? (next ? 'Next lesson' : 'Back to learning path') : 'Complete lesson'}
              </button>
            </div>
            {!codePassed && (
              <button className="net-text-button" onClick={() => setTab('build')}>
                Open the coding exercise
                <Code2 size={15} />
              </button>
            )}
          </>
        )}
      </div>
      <div className="net-lesson-pagination">
        {previous ? (
          <a href={`#/lesson/${previous.id}`}>
            <ArrowLeft size={16} />
            <span>
              <small>Previous lesson</small>
              {previous.title}
            </span>
          </a>
        ) : (
          <span />
        )}
        {next ? (
          <a href={`#/lesson/${next.id}`}>
            <span>
              <small>Up next</small>
              {next.title}
            </span>
            <ArrowRight size={16} />
          </a>
        ) : (
          <a href="#/path">
            <span>
              <small>You reached the final lesson</small>Back to the learning path
            </span>
            <CheckCircle2 size={16} />
          </a>
        )}
      </div>
    </article>
  );
}
function notebookMarkdown(progress: Progress) {
  return (
    '# My React Native Networking notebook\n\n' +
    lessons
      .filter((l) => progress.notes[l.id]?.trim())
      .map(
        (l) =>
          `## ${l.chapterIndex + 1}.${l.lessonIndex + 1} ${l.title}\n\n${progress.notes[l.id]}\n\nSource lesson: https://zero-to-hero-v2.vercel.app/react-native-networking#/lesson/${l.id}`,
      )
      .join('\n\n---\n\n') +
    '\n\n## Production evidence checklist\n\n' +
    checklist
      .map(
        ([category, text], i) =>
          `- [${progress.checklist.includes(String(i)) ? 'x' : ' '}] ${category}: ${text}`,
      )
      .join('\n') +
    '\n\n## Incident notebook\n\n' +
    Object.entries(progress.journal)
      .map(([k, v]) => `### ${k}\n\n${v}`)
      .join('\n\n')
  );
}
function Notebook({
  progress,
  update,
}: {
  progress: Progress;
  update: (fn: (p: Progress) => Progress) => void;
}) {
  const [selected, setSelected] = useState(
    progress.lastLesson && lessons.some((l) => l.id === progress.lastLesson)
      ? progress.lastLesson
      : lessons[0].id,
  );
  const lesson = lessons.find((l) => l.id === selected)!;
  const noted = lessons.filter((l) => progress.notes[l.id]?.trim());
  return (
    <div className="net-page">
      <PageIntro
        eyebrow="THINK IT THROUGH, IN YOUR WORDS"
        title="Your networking field notes."
        description="Write an explanation you could give to a teammate. Notes and progress stay in this browser, in a separate store from the neural networks course."
      />
      <div className="net-notebook-actions">
        <span>
          {noted.length} lesson{noted.length === 1 ? '' : 's'} with notes
        </span>
        <button
          className="net-btn net-btn-small"
          onClick={() =>
            downloadFile('react-native-net-notes.md', notebookMarkdown(progress), 'text/markdown')
          }
        >
          <ArrowDownToLine size={15} />
          Export notes
        </button>
        <button
          className="net-btn net-btn-small"
          onClick={() =>
            downloadFile(
              'react-native-net-progress.json',
              JSON.stringify({ ...progress, exportedAt: new Date().toISOString() }, null, 2),
              'application/json',
            )
          }
        >
          <ArrowDownToLine size={15} />
          Backup progress
        </button>
      </div>
      <div className="net-notebook-grid">
        <div className="net-notebook-lessons">
          {chapters.map((c, i) => (
            <div key={c.id}>
              <span className="net-kicker">
                0{i + 1} · {c.title}
              </span>
              {c.lessons.map((l) => (
                <button
                  key={l.id}
                  className={selected === l.id ? 'is-active' : ''}
                  onClick={() => setSelected(l.id)}
                >
                  <span>{l.title}</span>
                  {progress.notes[l.id]?.trim() && <span className="net-note-dot" />}
                </button>
              ))}
            </div>
          ))}
        </div>
        <div className="net-notebook-editor">
          <div>
            <span className="net-kicker">
              LESSON {lesson.chapterIndex + 1}.{lesson.lessonIndex + 1}
            </span>
            <a href={`#/lesson/${lesson.id}`} aria-label={`Open lesson: ${lesson.title}`}>
              <ArrowUpRight size={16} />
            </a>
          </div>
          <h2>{lesson.title}</h2>
          <label className="net-sr" htmlFor="net-notebook-text">
            Notes for {lesson.title}
          </label>
          <textarea
            id="net-notebook-text"
            maxLength={20000}
            placeholder={
              'Try explaining the mechanism without looking at the lesson.\n\nWhat are the inputs? What makes it safe? Where can it fail?'
            }
            value={progress.notes[lesson.id] || ''}
            onChange={(e) =>
              update((p) => ({ ...p, notes: { ...p.notes, [lesson.id]: e.target.value } }))
            }
          />
          <div className="net-notebook-editor-bottom">
            <span>Saved locally as you type</span>
            <span>
              {(progress.notes[lesson.id] || '').trim().split(/\s+/).filter(Boolean).length} words
            </span>
          </div>
        </div>
      </div>
      <NotebookTools progress={progress} update={update} />
    </div>
  );
}
function studyGuide() {
  return (
    '# React Native Networking · Zero to Hero\n\nResearch snapshot: ' +
    researchDate +
    '\n\n' +
    chapters
      .map(
        (c, i) =>
          `# ${i + 1}. ${c.title}\n\n${c.description}\n\n${c.lessons.map((l) => `## ${l.title}\n\n${l.description}\n\n${l.markdown}\n\nPractice: ${l.takeaway}\n\nSources:\n${l.sources.map((id) => '- ' + sourceById(id).title + ': ' + sourceById(id).url).join('\n')}`).join('\n\n---\n\n')}`,
      )
      .join('\n\n')
  );
}
function Resources({ progress }: { progress: Progress }) {
  return (
    <div className="net-page">
      <PageIntro
        eyebrow="FOLLOW THE EVIDENCE"
        title="Built on primary sources."
        description={`${sources.length} readable official references, retrieved ${researchDate}. Each lesson links to the documentation behind it.`}
      />
      <div className="net-resource-banner">
        <div>
          <FileText size={25} />
          <span>
            <h2>Take the whole field guide with you.</h2>
            <p>All 28 lessons, reference code, exercises, and citations in a Markdown document.</p>
          </span>
        </div>
        <button
          className="net-btn net-btn-primary"
          onClick={() =>
            downloadFile('react-native-networking-guide.md', studyGuide(), 'text/markdown')
          }
        >
          <ArrowDownToLine size={16} />
          Download guide
        </button>
      </div>
      <div className="net-source-intro">
        <h2>How this course was researched</h2>
        <p>
          Read official React Native, React, Apple, Android, Expo, TanStack Query, MSW,
          OpenTelemetry, Sentry, GraphQL, MDN, and HTTP/OAuth/W3C specifications. Readable
          retrievals, the source manifest, and research findings are retained in
          research/react-native-networking. Lessons are an authored synthesis of those references.
        </p>
        <p>
          Timings, SLO targets, incidents, and lab outputs are controlled teaching examples. They do
          not measure your actual API, native runtime, or monitoring deployment. Verify platform and
          library behavior against your installed versions and release builds.
        </p>
        <h2>Version-sensitive findings</h2>
        <ul>
          <li>
            React Native DevTools Network/Performance panels are documented from 0.83; coverage
            depends on transport and Expo integration.
          </li>
          <li>
            The retrieved MSW native guide uses @msw/react-native; older msw/native examples are
            obsolete.
          </li>
          <li>
            TanStack Query examples target v5. Check persistence, defaults, and native integration
            against the installed version.
          </li>
          <li>
            OpenTelemetry Node/browser JavaScript documentation does not establish React Native
            support.
          </li>
          <li>
            W3C Trace Context and Sentry propagation headers require compatible integrations; verify
            actual parentage end to end.
          </li>
          <li>
            Background schedules and transfers depend on OS, target SDK, framework version, and
            build configuration.
          </li>
        </ul>
        <h2>Your work stays local</h2>
        <p>
          Networking has its own route, stylesheet, theme, and progress record. There is no account
          or cloud synchronization. Export JSON from the notebook and review an import preview to
          transfer progress. The standalone HTML download has a separate progress store; import its
          backup to migrate your work here.
        </p>
        <p>
          Companion courses: <a href="/">Andrej Karpathy’s neural networks</a> ·{' '}
          <a href="/react-native-ota/">React Native OTA</a>.
        </p>
      </div>
      <h2 className="net-source-heading">Primary sources</h2>
      <div className="net-source-list">
        {sources.map((s, i) => (
          <a key={s.id} href={s.url} target="_blank" rel="noreferrer">
            <span className="net-source-number">{String(i + 1).padStart(2, '0')}</span>
            <div>
              <span className="net-kicker">{s.kind}</span>
              <h3>{s.title}</h3>
              <p>{s.detail}</p>
            </div>
            <ArrowUpRight size={18} />
          </a>
        ))}
      </div>
      <details className="net-extra-card">
        <summary>Access limitations and superseded retrievals</summary>
        <ul>
          {accessLimitations.map((s) => (
            <li key={s.id}>
              {s.title}:{' '}
              {s.ok
                ? 'Returned a JavaScript shell; the corresponding Markdown article was retrieved instead.'
                : (s.error || 'Not retrieved') + '. Not used as evidence.'}
            </li>
          ))}
        </ul>
      </details>
      <div className="net-attribution">
        <h2>Credit & scope</h2>
        <p>
          Specifications, library documentation, and platform guides belong to their respective
          authors. The lesson prose, examples, and models are educational synthesis. The course
          follows Zero to Hero’s React Native OTA learning format and is separate from Andrej
          Karpathy’s material.
        </p>
        <p>
          The capstone asks you to verify actual server contracts, native release behavior, security
          boundaries, and telemetry. A completed browser course is evidence of study, not
          certification of an app.
        </p>
      </div>
      <button
        className="net-btn"
        onClick={() =>
          downloadFile(
            'react-native-networking-progress.json',
            JSON.stringify({ ...progress, exportedAt: new Date().toISOString() }, null, 2),
            'application/json',
          )
        }
      >
        <ArrowDownToLine size={16} />
        Export your progress
      </button>
    </div>
  );
}
function SearchDialog({ close }: { close: () => void }) {
  const [query, setQuery] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const results = useMemo(() => {
    const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
    return (
      terms.length
        ? lessons.filter((l) =>
            terms.every((t) =>
              `${l.title} ${l.description} ${l.chapter.title} ${l.sections.map((s) => s.title + ' ' + s.body.join(' ')).join(' ')}`
                .toLowerCase()
                .includes(t),
            ),
          )
        : lessons.slice(0, 6)
    ).slice(0, 10);
  }, [query]);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement;
    const focusFrame = requestAnimationFrame(() => input.current?.focus());
    const trap = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !ref.current) return;
      const nodes = Array.from(ref.current.querySelectorAll<HTMLElement>('input, button, a[href]'));
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener('keydown', trap);
    return () => {
      cancelAnimationFrame(focusFrame);
      document.removeEventListener('keydown', trap);
      if (previous?.isConnected) previous.focus();
    };
  }, []);
  return (
    <div className="net-search-overlay" onClick={close}>
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label="Search React Native Networking"
        className="net-search-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="net-search-input">
          <Search size={21} />
          <input
            ref={input}
            aria-label="Search lessons"
            placeholder="Search concepts, code, or lessons…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && results[0]) {
                close();
                go('lesson', results[0].id);
              }
            }}
          />
          <button className="net-icon-button" aria-label="Close search" onClick={close}>
            <X size={17} />
          </button>
        </div>
        <div className="net-search-results">
          <span className="net-kicker">
            {query.trim()
              ? `${results.length} matching lesson${results.length === 1 ? '' : 's'}`
              : 'START EXPLORING'}
          </span>
          {results.length ? (
            results.map((l) => (
              <a key={l.id} href={`#/lesson/${l.id}`} onClick={close}>
                <span className="net-search-result-icon">
                  <FileText size={17} />
                </span>
                <span>
                  <small>
                    {l.chapterIndex + 1}.{l.lessonIndex + 1} · {l.chapter.title}
                  </small>
                  <strong>{l.title}</strong>
                  <span>{l.description}</span>
                </span>
                <ArrowRight size={15} />
              </a>
            ))
          ) : (
            <p>No lessons found. Try “retry”, “offline”, “PKCE”, or “trace”.</p>
          )}
        </div>
        <div className="net-search-footer">
          <span>
            <kbd>Enter</kbd> open first result
          </span>
          <span>
            <kbd>Esc</kbd> close
          </span>
        </div>
      </div>
    </div>
  );
}
