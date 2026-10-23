import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowDownToLine,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock3,
  Code2,
  Command,
  FileText,
  FlaskConical,
  Github,
  GraduationCap,
  LayoutDashboard,
  ListTree,
  Moon,
  NotebookPen,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Sparkles,
  Star,
  Sun,
  X,
} from 'lucide-react';
import type { CourseModule, LabKind, Lesson, Progress, View } from './types';
import { modules } from './data/course';
import { glossary } from './data/glossary';
import { exportProgress, readProgress, writeProgress } from './storage';
import CourseHome from './components/CourseHome';
import VisualLab from './components/VisualLab';
import CodeEditor from './components/CodeEditor';
import Quiz from './components/Quiz';
import RichText from './components/RichText';
import Projects from './components/Projects';
import GettingStarted from './components/GettingStarted';
import OriginalLecture from './components/OriginalLecture';

const lessons = modules.flatMap((m) => m.lessons.map((l) => ({ ...l, module: m })));
const navItems: { id: View; label: string; icon: typeof BookOpen }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'curriculum', label: 'Learning path', icon: ListTree },
  { id: 'playground', label: 'Playground', icon: FlaskConical },
  { id: 'notes', label: 'My notebook', icon: NotebookPen },
  { id: 'resources', label: 'Resources', icon: BookOpen },
];
const labNames: Record<LabKind, string> = {
  gradient: 'Gradient descent',
  bigram: 'The bigram machine',
  mlp: 'Inside an MLP',
  normalization: 'Healthy activations',
  backprop: 'The scalar graph',
  tensor: 'Tensor backpropagation',
  wavenet: 'The context tree',
  attention: 'Attention, visualized',
  tokenizer: 'The token workshop',
};
const labKinds: LabKind[] = [
  'gradient',
  'backprop',
  'bigram',
  'mlp',
  'normalization',
  'tensor',
  'wavenet',
  'attention',
  'tokenizer',
];
const labChapter: Record<LabKind, string> = {
  gradient: 'micrograd',
  backprop: 'micrograd',
  bigram: 'bigram',
  mlp: 'mlp',
  normalization: 'batchnorm',
  tensor: 'backprop',
  wavenet: 'wavenet',
  attention: 'gpt',
  tokenizer: 'tokenizer',
};
const chapterForLab = (kind: LabKind) => modules.find((m) => m.id === labChapter[kind])!;
function parseRoute() {
  const p = window.location.hash.replace(/^#\/?/, '').split('/');
  return { view: p[0] || 'overview', id: p[1] || null };
}
function navigate(view: string, id?: string) {
  window.location.hash = '/' + view + (id ? '/' + id : '');
}
function Wordmark() {
  return (
    <span className="wordmark">
      <span className="brand-symbol" aria-hidden="true">
        ✳
      </span>
      <span>
        zero <span className="brand-arrow">to</span> hero<span className="brand-period">.</span>
      </span>
    </span>
  );
}

function readLayoutPreference(key: string, fallback: boolean) {
  try {
    const value = localStorage.getItem(key);
    return value === null ? fallback : value === 'true';
  } catch {
    return fallback;
  }
}

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() =>
    document.documentElement.dataset.theme === 'light' ? 'light' : 'dark',
  );
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', theme === 'dark' ? '#111316' : '#f8f7f3');
    try {
      localStorage.setItem('zero-to-hero-theme', theme);
    } catch {
      // The theme still works when browser storage is unavailable.
    }
  }, [theme]);
  const [route, setRoute] = useState(parseRoute);
  const [progress, setProgress] = useState<Progress>(readProgress);
  const [mobile, setMobile] = useState(false);
  const sidebarToggle = useRef<HTMLButtonElement>(null);
  const sidebarClose = useRef<HTMLButtonElement>(null);
  const [isCompact, setIsCompact] = useState(() => window.matchMedia('(max-width: 760px)').matches);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() =>
    readLayoutPreference('zero-to-hero-sidebar-collapsed', false),
  );
  const [courseExpanded, setCourseExpanded] = useState(() =>
    readLayoutPreference('zero-to-hero-course-expanded', true),
  );
  const sidebarVisible = isCompact ? mobile : !sidebarCollapsed;
  const toggleSidebar = useCallback(() => {
    if (isCompact) setMobile((v) => !v);
    else {
      sidebarToggle.current?.focus();
      setSidebarCollapsed((v) => !v);
    }
  }, [isCompact]);
  useEffect(() => {
    if (!mobile) return;
    document.querySelector('.sidebar-scroll')?.scrollTo({ top: 0 });
    sidebarClose.current?.focus({ preventScroll: true });
    return () => sidebarToggle.current?.focus({ preventScroll: true });
  }, [mobile]);
  useEffect(() => {
    const query = window.matchMedia('(max-width: 760px)');
    const onChange = () => {
      setIsCompact(query.matches);
      setMobile(false);
    };
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem('zero-to-hero-sidebar-collapsed', String(sidebarCollapsed));
      localStorage.setItem('zero-to-hero-course-expanded', String(courseExpanded));
    } catch {
      // Layout controls also work without browser storage.
    }
  }, [sidebarCollapsed, courseExpanded]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [saveNoticeId, setSaveNoticeId] = useState(0);
  const initialProgress = useRef(progress);
  const current = lessons.find((l) => l.id === route.id);
  const view = (
    route.view === 'lesson'
      ? 'curriculum'
      : navItems.some((n) => n.id === route.view)
        ? route.view
        : 'overview'
  ) as View;
  const completedCount = lessons.filter((l) => progress.completed.includes(l.id)).length;
  const percentage = Math.round((completedCount / Math.max(1, lessons.length)) * 100);
  const update = (fn: (p: Progress) => Progress) => setProgress((p) => fn(p));
  useEffect(() => {
    const onHash = () => {
      setRoute(parseRoute());
      setMobile(false);
      window.scrollTo({ top: 0, behavior: 'instant' });
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  useEffect(() => {
    const saved = writeProgress(progress);
    setSaveError(!saved);
    if (!saved) {
      setSaveNoticeId(0);
      return;
    }
    // Loading existing progress isn't a new save. Group consecutive edits into one notice.
    if (progress === initialProgress.current) return;
    const notice = window.setTimeout(() => setSaveNoticeId((id) => id + 1), 450);
    return () => window.clearTimeout(notice);
  }, [progress]);
  useEffect(() => {
    if (!saveNoticeId) return;
    // Also dismiss when reduced-motion settings disable CSS animation events.
    const dismiss = window.setTimeout(
      () => setSaveNoticeId((id) => (id === saveNoticeId ? 0 : id)),
      2800,
    );
    return () => window.clearTimeout(dismiss);
  }, [saveNoticeId]);
  useEffect(() => {
    document.body.style.overflow = mobile ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobile]);
  useEffect(() => {
    if (route.view === 'lesson' && current) {
      const day = new Date().toLocaleDateString('en-CA');
      update((p) => ({
        ...p,
        lastLesson: current.id,
        activeDays: p.activeDays.includes(day) ? p.activeDays : [...p.activeDays, day],
      }));
    }
  }, [route.view, current?.id]);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
      const target = e.target;
      const editing =
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          !!target.closest('input, textarea, select, [contenteditable="true"]'));
      if ((e.metaKey || e.ctrlKey) && !e.altKey && e.key.toLowerCase() === 'b' && !editing) {
        e.preventDefault();
        if (!e.repeat) toggleSidebar();
      }
      if (e.key === 'Escape') setMobile(false);
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [toggleSidebar]);
  useEffect(() => {
    document.title =
      current && route.view === 'lesson'
        ? current.title + ' — Zero to Hero'
        : (navItems.find((n) => n.id === view)?.label || 'Learn') + ' — Zero to Hero';
  }, [view, current, route.view]);
  const openLesson = (_moduleId: string, id: string) => navigate('lesson', id);
  return (
    <div className={'app-shell' + (sidebarCollapsed ? ' app-shell--collapsed' : '')}>
      <a
        className="skip-link"
        href="#main-content"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById('main-content')?.focus();
        }}
      >
        Skip to content
      </a>
      {mobile && (
        <button
          className="sidebar-backdrop"
          onClick={() => setMobile(false)}
          aria-label="Close navigation"
        />
      )}
      <aside
        id="main-sidebar"
        className={'sidebar ' + (mobile ? 'sidebar-open' : '')}
        aria-label="Main navigation"
        inert={!sidebarVisible}
      >
        <div className="sidebar-heading">
          <div className="sidebar-brand-row">
            <a className="brand-link" href="#/overview" aria-label="Zero to Hero home">
              <Wordmark />
            </a>
            <button
              className="sidebar-close icon-button"
              ref={sidebarClose}
              aria-label="Close navigation"
              onClick={() => setMobile(false)}
            >
              <PanelLeftClose size={18} />
            </button>
          </div>
          <div className="course-edition">
            <span className="live-dot" />
            THE INTERACTIVE EDITION
          </div>
        </div>
        <div className="sidebar-scroll">
          <div className="nav-label">YOUR WORKSPACE</div>
          <nav aria-label="Workspace">
            {navItems.map(({ id, label, icon: Icon }) => (
              <a
                href={'#/' + id}
                key={id}
                className={'nav-item ' + (view === id ? 'active' : '')}
                aria-current={view === id ? 'page' : undefined}
              >
                <Icon size={18} strokeWidth={1.65} />
                <span>{label}</span>
                {id === 'playground' && <span className="nav-new">LAB</span>}
                {id === 'notes' && Object.values(progress.notes).some(Boolean) && (
                  <span className="nav-count">
                    {Object.values(progress.notes).filter((v) => v.trim()).length}
                  </span>
                )}
              </a>
            ))}
          </nav>
          <div className="sidebar-course">
            <button
              className="sidebar-course-toggle"
              aria-expanded={courseExpanded}
              aria-controls="sidebar-chapters"
              onClick={() => setCourseExpanded((v) => !v)}
            >
              <span>THE COURSE</span>
              <span className="sidebar-course-count">08</span>
              <ChevronDown size={14} className={courseExpanded ? '' : 'is-collapsed'} />
            </button>
            <div id="sidebar-chapters" hidden={!courseExpanded}>
              {modules.map((m) => (
                <a
                  className={
                    'chapter-shortcut ' +
                    (current?.module.id === m.id && route.view === 'lesson' ? 'current' : '')
                  }
                  href={'#/curriculum/' + m.id}
                  key={m.id}
                >
                  <span
                    className={
                      'chapter-dot ' +
                      (m.lessons.every((l) => progress.completed.includes(l.id)) ? 'done' : '')
                    }
                  >
                    {m.lessons.every((l) => progress.completed.includes(l.id)) ? (
                      <Check size={11} />
                    ) : (
                      String(m.number).padStart(2, '0')
                    )}
                  </span>
                  <span>{m.title}</span>
                </a>
              ))}
            </div>
          </div>
          <a
            className="source-credit"
            href="https://karpathy.ai/zero-to-hero.html"
            target="_blank"
            rel="noreferrer"
          >
            <div className="credit-avatar">AK</div>
            <div>
              <small>Inspired by</small>
              <span>Andrej Karpathy</span>
            </div>
            <ArrowUpRight size={13} />
          </a>
        </div>
        <div className="sidebar-bottom">
          <div className="sidebar-progress">
            <div>
              <span>Your progress</span>
              <strong>{percentage}%</strong>
            </div>
            <div
              className="progress-track"
              role="progressbar"
              aria-label="Course completion"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={percentage}
            >
              <span style={{ width: percentage + '%' }} />
            </div>
            <p>
              {completedCount} of {lessons.length} lessons completed
            </p>
          </div>
        </div>
      </aside>
      <div className="app-body" inert={mobile}>
        <header className="topbar">
          <div className="topbar-location">
            <button
              className="sidebar-toggle icon-button"
              ref={sidebarToggle}
              aria-label={sidebarVisible ? 'Hide sidebar' : 'Show sidebar'}
              aria-expanded={sidebarVisible}
              aria-controls="main-sidebar"
              aria-keyshortcuts="Meta+B Control+B"
              title={(sidebarVisible ? 'Hide sidebar' : 'Show sidebar') + ' (⌘B / Ctrl+B)'}
              onClick={toggleSidebar}
            >
              {sidebarVisible ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
            </button>
            <span className="breadcrumb-root">Your workspace</span>
            <ChevronRight size={13} />
            <span>
              {route.view === 'lesson'
                ? 'Learning path'
                : navItems.find((n) => n.id === view)?.label}
            </span>
            {route.view === 'lesson' && current && (
              <>
                <ChevronRight size={13} />
                <span className="breadcrumb-lesson">{current.module.title}</span>
              </>
            )}
          </div>
          <div className="topbar-actions">
            <button
              className="search-trigger"
              aria-label="Search lessons"
              onClick={() => setSearchOpen(true)}
            >
              <Search size={16} />
              <span>Search lessons</span>
              <kbd>⌘ K</kbd>
            </button>
            <a
              className="github-star"
              href="https://github.com/yagyesh-bobde/zero-to-hero-v2"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Star Zero to Hero on GitHub (opens in a new tab)"
              title="Star this project on GitHub"
            >
              <Github className="github-star__logo" size={18} aria-hidden="true" />
              <span>GitHub</span>
              <Star className="github-star__icon" size={16} aria-hidden="true" />
            </a>
            <button
              className="theme-toggle"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
              title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <span className="header-divider" />
            <a className="profile-avatar" href="#/notes" aria-label="Open your notebook">
              Y<span />
            </a>
          </div>
          {saveNoticeId > 0 && (
            <div
              key={saveNoticeId}
              className="save-confirmation"
              role="status"
              aria-live="polite"
              aria-atomic="true"
              onAnimationEnd={() => setSaveNoticeId((id) => (id === saveNoticeId ? 0 : id))}
            >
              <CheckCircle2 size={14} aria-hidden="true" />
              <span>Progress saved locally</span>
            </div>
          )}
        </header>
        {saveError && (
          <div className="save-error" role="alert">
            Your browser storage is full or unavailable. Export your progress to keep a copy.
            <button onClick={() => exportProgress(progress)}>Export progress</button>
          </div>
        )}
        <main id="main-content" tabIndex={-1}>
          {route.view === 'lesson' && current ? (
            <LessonPage key={current.id} lesson={current} progress={progress} update={update} />
          ) : route.view === 'lesson' ? (
            <div className="page-container">
              <h1>Let’s find your place.</h1>
              <p>That lesson isn’t in this course.</p>
              <button className="primary-button" onClick={() => navigate('curriculum')}>
                Explore the learning path
                <ArrowRight size={16} />
              </button>
            </div>
          ) : view === 'overview' ? (
            <CourseHome
              modules={modules}
              completedIds={progress.completed}
              savedLessonId={progress.lastLesson}
              onOpenLesson={openLesson}
              onOpenModule={(id) => navigate('curriculum', id)}
              onNavigate={(v) => navigate(v)}
            />
          ) : view === 'curriculum' ? (
            <Curriculum progress={progress} expandedId={route.id} />
          ) : view === 'playground' ? (
            <Playground
              progress={progress}
              update={update}
              initialMode={route.id === 'python' ? 'python' : 'visual'}
            />
          ) : view === 'notes' ? (
            <Notebook progress={progress} update={update} />
          ) : (
            <Resources focusLectures={route.id === 'lectures'} />
          )}
        </main>
        <footer className="app-footer">
          <span>Made for learning. One small step at a time.</span>
          <a href="https://karpathy.ai/zero-to-hero.html" target="_blank" rel="noreferrer">
            An independent companion to Zero to Hero
            <ArrowUpRight size={12} />
          </a>
        </footer>
      </div>
      {searchOpen && <SearchDialog onClose={() => setSearchOpen(false)} />}
    </div>
  );
}

function PageIntro({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="page-intro">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {children}
    </div>
  );
}
function Curriculum({ progress, expandedId }: { progress: Progress; expandedId: string | null }) {
  const [open, setOpen] = useState<string[]>(expandedId ? [expandedId] : [modules[0].id]);
  useEffect(() => {
    if (expandedId) {
      setOpen((o) => (o.includes(expandedId) ? o : [...o, expandedId]));
      requestAnimationFrame(() =>
        document
          .getElementById('chapter-' + expandedId)
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
      );
    }
  }, [expandedId]);
  const complete = lessons.filter((l) => progress.completed.includes(l.id)).length;
  return (
    <div className="page-container">
      <PageIntro
        eyebrow="THE LEARNING PATH"
        title="From the first derivative to GPT."
        description="Eight chapters. Every idea builds on the last. Go in order, or follow your curiosity."
      >
        <div className="intro-stat">
          <strong>
            {complete}
            <span> / {lessons.length}</span>
          </strong>
          <small>LESSONS COMPLETED</small>
        </div>
      </PageIntro>
      <div className="path-callout">
        <Sparkles size={18} />
        <p>
          <strong>No setup. No rush.</strong> Every lesson includes an explanation, a hands-on
          exercise, and a knowledge check. Basic Python helps; we’ll build the math together.
        </p>
      </div>
      <div className="curriculum-list">
        {modules.map((m) => {
          const done = m.lessons.filter((l) => progress.completed.includes(l.id)).length;
          return (
            <section
              className={'curriculum-module ' + (open.includes(m.id) ? 'expanded' : '')}
              key={m.id}
              id={'chapter-' + m.id}
            >
              <button
                className="curriculum-heading"
                aria-expanded={open.includes(m.id)}
                onClick={() =>
                  setOpen((o) => (o.includes(m.id) ? o.filter((i) => i !== m.id) : [...o, m.id]))
                }
              >
                <span className={'module-index ' + (done === m.lessons.length ? 'completed' : '')}>
                  {done === m.lessons.length ? (
                    <Check size={23} />
                  ) : (
                    String(m.number).padStart(2, '0')
                  )}
                </span>
                <div>
                  <span className="eyebrow">CHAPTER {String(m.number).padStart(2, '0')}</span>
                  <h2>{m.title}</h2>
                  <p>{m.subtitle}</p>
                </div>
                <span className="curriculum-meta">
                  {done} / {m.lessons.length} lessons
                  <ChevronDown size={18} />
                </span>
              </button>
              {open.includes(m.id) && (
                <div className="curriculum-content">
                  <div className="module-description">
                    <p>{m.description}</p>
                    <span>
                      <Code2 size={15} />
                      <strong>You’ll build:</strong> {m.project}
                    </span>
                  </div>
                  <OriginalLecture module={m} compact />
                  {m.lessons.map((l, i) => (
                    <a className="lesson-row" href={'#/lesson/' + l.id} key={l.id}>
                      <span
                        className={
                          'lesson-status ' +
                          (progress.completed.includes(l.id) ? 'is-complete' : '')
                        }
                      >
                        {progress.completed.includes(l.id) ? (
                          <Check size={15} />
                        ) : (
                          String(i + 1).padStart(2, '0')
                        )}
                      </span>
                      <div>
                        <h3>{l.title}</h3>
                        <p>{l.summary}</p>
                      </div>
                      <span className="lesson-row-time">
                        <Clock3 size={13} />
                        {l.minutes} min
                      </span>
                      <ArrowRight size={17} />
                    </a>
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>
      <div className="path-end">
        <GraduationCap size={30} />
        <h2>Understand the whole picture.</h2>
        <p>Finish with the tools to build, train, and reason about your own language models.</p>
      </div>
    </div>
  );
}

function LessonPage({
  lesson: l,
  progress,
  update,
}: {
  lesson: Lesson & { module: CourseModule };
  progress: Progress;
  update: (fn: (p: Progress) => Progress) => void;
}) {
  const [tab, setTab] = useState<'learn' | 'explore' | 'code' | 'quiz'>('learn');
  const [showNotes, setShowNotes] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const m = l.module;
  const index = lessons.findIndex((a) => a.id === l.id);
  const inModule = m.lessons.findIndex((a) => a.id === l.id);
  const allCorrect = l.quiz.every((q, i) => progress.quizAnswers[l.id + ':' + i] === q.answer);
  const codePassed = progress.codePassed.includes(l.id);
  const complete = progress.completed.includes(l.id);
  const next = lessons[index + 1];
  const allComplete = lessons.every((a) => progress.completed.includes(a.id));
  const setCode = (code: string) =>
    update((p) => ({
      ...p,
      code: { ...p.code, [l.id]: code },
      codePassed: p.codePassed.filter((id) => id !== l.id),
    }));
  const tabs = [
    { id: 'learn', label: 'Understand', icon: BookOpen },
    { id: 'explore', label: 'Explore', icon: FlaskConical },
    { id: 'code', label: 'Build it', icon: Code2 },
    { id: 'quiz', label: 'Check in', icon: CheckCircle2 },
  ] as const;
  const markComplete = () => {
    update((p) => ({
      ...p,
      completed: p.completed.includes(l.id) ? p.completed : [...p.completed, l.id],
    }));
    setCelebrate(true);
  };
  return (
    <div className="lesson-layout">
      <div className="lesson-main">
        <div className="lesson-topline">
          <a href={'#/curriculum/' + m.id}>
            <ArrowLeft size={14} />
            Back to learning path
          </a>
          <button
            className={'text-button ' + (showNotes ? 'accent-text' : '')}
            onClick={() => setShowNotes(!showNotes)}
          >
            <NotebookPen size={15} />
            {showNotes ? 'Hide notes' : 'Take a note'}
          </button>
        </div>
        <div className="lesson-chapter-label">
          <span className="eyebrow">
            CHAPTER {String(m.number).padStart(2, '0')} · {m.title.toUpperCase()}
          </span>
          <span>
            <Clock3 size={13} />
            {l.minutes} min
          </span>
        </div>
        <h1 className="lesson-title">{l.title}</h1>
        <p className="lesson-summary">{l.summary}</p>
        <OriginalLecture module={m} compact />
        <div className="lesson-tabs" role="tablist" aria-label="Lesson activities">
          {tabs.map(({ id, label, icon: Icon }, i) => (
            <button
              role="tab"
              aria-selected={tab === id}
              id={'tab-' + id}
              aria-controls="lesson-tab-panel"
              tabIndex={tab === id ? 0 : -1}
              key={id}
              onClick={() => setTab(id)}
              onKeyDown={(e) => {
                if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                  e.preventDefault();
                  const newId = tabs[(i + (e.key === 'ArrowRight' ? 1 : 3)) % 4].id;
                  setTab(newId);
                  document.getElementById('tab-' + newId)?.focus();
                }
              }}
              className={tab === id ? 'active' : ''}
            >
              <Icon size={16} />
              <span>{label}</span>
              {((id === 'code' && codePassed) || (id === 'quiz' && allCorrect)) && (
                <Check className="tab-check" size={12} />
              )}
            </button>
          ))}
        </div>
        <div
          id="lesson-tab-panel"
          role="tabpanel"
          aria-labelledby={'tab-' + tab}
          tabIndex={0}
          className="lesson-tab-content"
          key={tab}
        >
          {tab === 'learn' && (
            <article className="lesson-article">
              {l.sections.map((s, i) => (
                <section key={i}>
                  <h2>{s.title}</h2>
                  <RichText text={s.body} />
                  {s.formula && <div className="formula-block">{s.formula}</div>}
                </section>
              ))}
              <div className="takeaway-box">
                <span className="section-overline">
                  <Sparkles size={16} />
                  THE IDEAS TO TAKE WITH YOU
                </span>
                <ul>
                  {l.keyTakeaways.map((k) => (
                    <li key={k}>
                      <Check size={15} />
                      <span>{k}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="lesson-project-card">
                <Code2 size={21} />
                <div>
                  <strong>See how the pieces fit.</strong>
                  <p>
                    The complete {m.id}.py project ·{' '}
                    {['micrograd', 'bigram', 'tokenizer'].includes(m.id)
                      ? 'pure Python, also available in the sandbox'
                      : 'PyTorch, with setup instructions in Resources'}
                  </p>
                </div>
                <a className="text-button" href={'/projects/' + m.id + '.py'} download>
                  Download
                  <ArrowDownToLine size={14} />
                </a>
              </div>
              <button className="primary-button" onClick={() => setTab('explore')}>
                Now make it tangible
                <ArrowRight size={16} />
              </button>
            </article>
          )}
          {tab === 'explore' && (
            <>
              <VisualLab kind={l.lab} />
              <div className="lesson-step-footer">
                <p>Change one thing. Notice what follows.</p>
                <button className="primary-button" onClick={() => setTab('code')}>
                  Let’s write some code
                  <ArrowRight size={16} />
                </button>
              </div>
            </>
          )}
          {tab === 'code' && (
            <>
              <CodeEditor
                key={l.id}
                value={progress.code[l.id] ?? l.challenge.starter}
                onChange={setCode}
                challenge={l.challenge}
                passed={codePassed}
                onPass={() =>
                  update((p) => ({
                    ...p,
                    codePassed: p.codePassed.includes(l.id)
                      ? p.codePassed
                      : [...p.codePassed, l.id],
                  }))
                }
              />
              <div className="lesson-step-footer">
                <p>
                  {codePassed
                    ? 'Your code works. Can you explain why?'
                    : 'Experiment, make mistakes, and try again.'}
                </p>
                <button className="primary-button" onClick={() => setTab('quiz')}>
                  Check your understanding
                  <ArrowRight size={16} />
                </button>
              </div>
            </>
          )}
          {tab === 'quiz' && (
            <>
              <Quiz
                key={l.id}
                questions={l.quiz}
                lessonId={l.id}
                answers={progress.quizAnswers}
                onAnswer={(key, v) =>
                  update((p) => ({ ...p, quizAnswers: { ...p.quizAnswers, [key]: v } }))
                }
              />
              <div className="complete-panel">
                <div>
                  <strong>
                    {complete
                      ? 'A step worth taking.'
                      : allCorrect && codePassed
                        ? 'You’re ready for the next step.'
                        : 'Bring it all together.'}
                  </strong>
                  <p>
                    {complete
                      ? 'You’ve completed this lesson. Revisit any idea whenever you like.'
                      : `Finish ${!codePassed ? 'the coding exercise' : ''}${!codePassed && !allCorrect ? ' and ' : ''}${!allCorrect ? 'both knowledge checks' : ''} to complete this lesson.`}
                  </p>
                </div>
                {!complete ? (
                  <button
                    className="primary-button"
                    disabled={!allCorrect || !codePassed}
                    onClick={markComplete}
                  >
                    Complete lesson
                    <Check size={16} />
                  </button>
                ) : (
                  <button
                    className="primary-button"
                    onClick={() => (next ? navigate('lesson', next.id) : navigate('curriculum'))}
                  >
                    {next ? 'Next lesson' : 'View your journey'}
                    <ArrowRight size={16} />
                  </button>
                )}
              </div>
            </>
          )}
        </div>
        <div className="lesson-bottom-nav">
          {index > 0 ? (
            <a href={'#/lesson/' + lessons[index - 1].id}>
              <ArrowLeft size={15} />
              <span>
                <small>PREVIOUS</small>
                {lessons[index - 1].title}
              </span>
            </a>
          ) : (
            <span />
          )}
          {next ? (
            <a href={'#/lesson/' + next.id}>
              <span>
                <small>UP NEXT</small>
                {next.title}
              </span>
              <ArrowRight size={15} />
            </a>
          ) : (
            <a href="#/curriculum">
              Back to your journey
              <ArrowRight size={15} />
            </a>
          )}
        </div>
      </div>
      <aside className="lesson-rail">
        <div className="rail-heading">
          <span className="eyebrow">IN THIS CHAPTER</span>
          <span>
            {inModule + 1} / {m.lessons.length}
          </span>
        </div>
        <h3>{m.title}</h3>
        <div className="rail-lesson-list">
          {m.lessons.map((s, i) => (
            <a href={'#/lesson/' + s.id} key={s.id} className={s.id === l.id ? 'active' : ''}>
              <span className={progress.completed.includes(s.id) ? 'done' : ''}>
                {progress.completed.includes(s.id) ? <Check size={12} /> : i + 1}
              </span>
              {s.title}
            </a>
          ))}
        </div>
        <div className="rail-source">
          <BookOpen size={20} />
          <h4>Go to the source.</h4>
          <p>Another perspective can make an idea click.</p>
          <a href={'https://www.youtube.com/watch?v=' + m.videoId} target="_blank" rel="noreferrer">
            Watch Karpathy’s lecture
            <ArrowUpRight size={13} />
          </a>
        </div>
        <button className="rail-notes-button" onClick={() => setShowNotes(!showNotes)}>
          <NotebookPen size={16} />
          Your notes{progress.notes[l.id]?.trim() && <span className="live-dot" />}
          <ChevronRight size={14} />
        </button>
      </aside>
      {showNotes && (
        <div className="note-drawer">
          <div>
            <h3>Your thinking space.</h3>
            <button
              className="icon-button"
              onClick={() => setShowNotes(false)}
              aria-label="Close notes"
            >
              <X size={18} />
            </button>
          </div>
          <p>A question, an intuition, a connection. Make it yours.</p>
          <textarea
            aria-label="Lesson notes"
            placeholder="What clicked? What are you still wondering about?"
            value={progress.notes[l.id] || ''}
            onChange={(e) =>
              update((p) => ({ ...p, notes: { ...p.notes, [l.id]: e.target.value } }))
            }
          />
          <span>
            <span className="live-dot" />
            Saved automatically on this device
          </span>
          <a href="#/notes">
            Open your notebook
            <ArrowUpRight size={13} />
          </a>
        </div>
      )}
      {celebrate && (
        <CompletionModal onClose={() => setCelebrate(false)}>
          <div className="completion-card">
            <button
              className="icon-button completion-close"
              aria-label="Close completion message"
              onClick={() => setCelebrate(false)}
              autoFocus
            >
              <X size={19} />
            </button>
            <div className="completion-mark">
              <Check size={32} />
            </div>
            <span className="eyebrow">
              {allComplete ? 'LOOK HOW FAR YOU’VE COME' : 'ONE MORE CONNECTION MADE'}
            </span>
            <h2 id="completion-title">
              {allComplete ? 'From zero to hero.' : 'That’s how understanding grows.'}
            </h2>
            <p>
              {allComplete
                ? 'You’ve worked through every chapter. Keep experimenting, revisiting, and building models of your own.'
                : `You’ve completed “${l.title}”. Take a breath, then keep building.`}
            </p>
            <button
              className="primary-button"
              onClick={() => {
                setCelebrate(false);
                next ? navigate('lesson', next.id) : navigate('curriculum');
              }}
            >
              {next ? 'Continue learning' : 'See your completed path'}
              <ArrowRight size={16} />
            </button>
            <button className="text-button" onClick={() => setCelebrate(false)}>
              Stay with this idea a little longer
            </button>
          </div>
        </CompletionModal>
      )}
    </div>
  );
}

function CompletionModal({
  onClose,
  children,
}: {
  onClose: () => void;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const instance = ref.current;
    const previousFocus = document.activeElement;
    instance?.showModal();
    return () => {
      instance?.close();
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus();
    };
  }, []);
  return (
    <dialog
      className="completion-dialog"
      ref={ref}
      aria-labelledby="completion-title"
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {children}
    </dialog>
  );
}

function Playground({
  progress,
  update,
  initialMode,
}: {
  progress: Progress;
  update: (fn: (p: Progress) => Progress) => void;
  initialMode: 'visual' | 'python';
}) {
  const [mode, setMode] = useState<'visual' | 'python'>(initialMode);
  useEffect(() => setMode(initialMode), [initialMode]);
  const [kind, setKind] = useState<LabKind>('gradient');
  const [preset, setPreset] = useState('');
  const [presetLoading, setPresetLoading] = useState(false);
  const [presetError, setPresetError] = useState('');
  const initial =
    '# A tiny neuron. Change the inputs and see what happens.\nimport math\n\ndef neuron(inputs, weights, bias):\n    total = sum(x * w for x, w in zip(inputs, weights)) + bias\n    return math.tanh(total)\n\noutput = neuron([2.0, -1.0], [0.5, 0.3], 0.1)\nprint(f"Neuron output: {output:.4f}")\n';
  const loadPreset = async (id: string) => {
    setPreset(id);
    setPresetError('');
    if (id === 'neuron') {
      update((p) => ({ ...p, code: { ...p.code, sandbox: initial } }));
      return;
    }
    setPresetLoading(true);
    try {
      const response = await fetch('/projects/' + id + '.py');
      if (!response.ok) throw new Error('Could not load this project.');
      const code = await response.text();
      if (code.trimStart().startsWith('<')) throw new Error('Could not load this project.');
      const args = id === 'micrograd' ? "['micrograd.py', '--steps', '12']" : "['" + id + ".py']";
      update((p) => ({
        ...p,
        code: { ...p.code, sandbox: 'import sys\nsys.argv = ' + args + '\n\n' + code },
      }));
    } catch {
      setPresetError('Could not load the project. Check your connection and try again.');
    } finally {
      setPresetLoading(false);
    }
  };
  return (
    <div className="page-container">
      <PageIntro
        eyebrow="THE PLAYGROUND"
        title="What happens if…"
        description="Pull a lever. Follow a gradient. Break something, then understand it. This space is yours."
      />
      <div className="segmented-control">
        <button className={mode === 'visual' ? 'active' : ''} onClick={() => setMode('visual')}>
          <FlaskConical size={16} />
          Visual experiments<span>{String(labKinds.length).padStart(2, '0')}</span>
        </button>
        <button className={mode === 'python' ? 'active' : ''} onClick={() => setMode('python')}>
          <Code2 size={16} />
          Python sandbox
        </button>
      </div>
      {mode === 'visual' ? (
        <div className="playground-layout">
          <div className="lab-picker" role="tablist" aria-label="Visual experiments">
            {labKinds.map((k, i) => (
              <button
                role="tab"
                aria-selected={kind === k}
                aria-controls="playground-panel"
                key={k}
                className={kind === k ? 'active' : ''}
                onClick={() => setKind(k)}
              >
                <span>{String(i + 1).padStart(2, '0')}</span>
                <div>
                  {labNames[k]}
                  <small>{chapterForLab(k).title}</small>
                </div>
                <ChevronRight size={14} />
              </button>
            ))}
          </div>
          <div className="playground-main" id="playground-panel">
            <VisualLab key={kind} kind={kind} />
            <a
              className="playground-lesson-link"
              href={'#/lesson/' + chapterForLab(kind).lessons[0].id}
            >
              <BookOpen size={15} />
              Explore the chapter behind this experiment
              <ArrowRight size={15} />
            </a>
          </div>
        </div>
      ) : (
        <div className="sandbox-panel">
          <div className="sandbox-intro">
            <div>
              <h2>A blank page for your ideas.</h2>
              <p>Real Python 3, with the standard library. No account or installation needed.</p>
            </div>
            <span className="tag">BROWSER RUNTIME</span>
          </div>
          <div className="sandbox-presets">
            <label htmlFor="sandbox-preset">Start with an example</label>
            <select
              id="sandbox-preset"
              value={preset}
              disabled={presetLoading}
              onChange={(e) => loadPreset(e.target.value)}
            >
              <option value="" disabled>
                Choose a starting point…
              </option>
              <option value="neuron">A tiny neuron</option>
              <option value="micrograd">Full micrograd · 12 training steps</option>
              <option value="bigram">A complete bigram name generator</option>
              <option value="tokenizer">A complete BPE tokenizer</option>
            </select>
            {presetLoading && <span>Loading project…</span>}
            {presetError && <span role="alert">{presetError}</span>}
          </div>
          <CodeEditor
            key={preset}
            value={progress.code.sandbox ?? initial}
            onChange={(v) => update((p) => ({ ...p, code: { ...p.code, sandbox: v } }))}
            filename="playground.py"
          />
          <p className="runtime-note">
            The first run downloads Python from a CDN. Exercises use the standard library; PyTorch
            is explored conceptually and linked through the original notebooks.
          </p>
        </div>
      )}
    </div>
  );
}

function Notebook({
  progress,
  update,
}: {
  progress: Progress;
  update: (fn: (p: Progress) => Progress) => void;
}) {
  const [selected, setSelected] = useState(progress.lastLesson || lessons[0].id);
  const [filter, setFilter] = useState('');
  const chapterList = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const list = chapterList.current;
    const active = list?.querySelector<HTMLElement>('[aria-pressed="true"]');
    if (!list || !active) return;
    const container = list.getBoundingClientRect();
    const item = active.getBoundingClientRect();
    if (item.top < container.top || item.bottom > container.bottom) {
      list.scrollTop += item.top - container.top - (list.clientHeight - item.height) / 2;
    }
  }, [selected, filter]);
  const saved = lessons.filter((l) => progress.notes[l.id]?.trim());
  const filteredModules = modules
    .map((module) => ({
      ...module,
      lessons: module.lessons.filter((lesson) =>
        (lesson.title + ' ' + module.title).toLowerCase().includes(filter.trim().toLowerCase()),
      ),
    }))
    .filter((module) => module.lessons.length);
  const current = lessons.find((l) => l.id === selected) || lessons[0];
  const exportNotes = () => {
    if (!saved.length) return;
    const text =
      '# My Zero to Hero notebook\n\n' +
      saved
        .map((l) => '## ' + l.module.title + ' · ' + l.title + '\n\n' + progress.notes[l.id])
        .join('\n\n---\n\n');
    const url = URL.createObjectURL(new Blob([text], { type: 'text/markdown' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my-neural-network-notebook.md';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return (
    <div className="page-container notebook-page">
      <PageIntro
        eyebrow="YOUR PERSONAL NOTEBOOK"
        title="Make the ideas your own."
        description="Connections, questions, and those little aha moments. A place to keep your thinking."
      >
        <div className="notebook-export">
          <button
            className="notebook-export-button"
            onClick={exportNotes}
            disabled={!saved.length}
            aria-describedby="notes-export-hint"
          >
            <ArrowDownToLine size={16} aria-hidden="true" />
            Export notes
          </button>
          <span id="notes-export-hint">
            {saved.length
              ? `${saved.length} lesson${saved.length === 1 ? '' : 's'} · Markdown (.md)`
              : 'Add a note to enable export.'}
          </span>
        </div>
      </PageIntro>
      <div className="notebook-layout">
        <aside className="notebook-list">
          <div className="notebook-list-header">
            <label className="input-search">
              <Search size={16} aria-hidden="true" />
              <input
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Find a lesson…"
                aria-label="Filter notebook lessons"
              />
            </label>
            <p>
              {saved.length} lesson{saved.length === 1 ? '' : 's'} with notes
            </p>
          </div>
          <div className="notebook-chapters" ref={chapterList}>
            {filteredModules.map((module) => (
              <div className="notebook-chapter" key={module.id}>
                <h3>
                  {String(module.number).padStart(2, '0')} · {module.title}
                </h3>
                {module.lessons.map((lesson) => (
                  <button
                    key={lesson.id}
                    className={selected === lesson.id ? 'active' : ''}
                    aria-pressed={selected === lesson.id}
                    onClick={() => setSelected(lesson.id)}
                  >
                    <span>{lesson.title}</span>
                    {progress.notes[lesson.id]?.trim() && (
                      <FileText size={14} aria-label="Has notes" />
                    )}
                  </button>
                ))}
              </div>
            ))}
            {!filteredModules.length && (
              <p className="notebook-no-results">
                No lessons found. Try a different word or chapter name.
              </p>
            )}
          </div>
        </aside>
        <div className="notebook-editor">
          <div className="notebook-editor-heading">
            <span className="eyebrow">
              CHAPTER {String(current.module.number).padStart(2, '0')} ·{' '}
              {current.module.title.toUpperCase()}
            </span>
            <h2>{current.title}</h2>
            <a href={'#/lesson/' + current.id}>
              Open lesson
              <ArrowUpRight size={14} aria-hidden="true" />
            </a>
          </div>
          <label className="notebook-writing-label" htmlFor="lesson-notes">
            Your notes
          </label>
          <textarea
            id="lesson-notes"
            value={progress.notes[current.id] || ''}
            placeholder={
              'What clicked? What would you like to try next?\n\nWrite a thought, a question, or an idea in your own words…'
            }
            aria-label="Your notes for this lesson"
            onChange={(e) =>
              update((p) => ({ ...p, notes: { ...p.notes, [current.id]: e.target.value } }))
            }
          />
          <div className="notebook-status">
            <span>
              <span
                className={'live-dot' + (progress.notes[current.id]?.trim() ? '' : ' is-empty')}
              />
              {progress.notes[current.id]?.trim()
                ? 'Saved on this device'
                : 'Notes save automatically'}
            </span>
            <span>
              {(progress.notes[current.id] || '').trim().split(/\s+/).filter(Boolean).length} words
            </span>
          </div>
        </div>
      </div>
      <div className="export-progress-row">
        <div>
          <strong>Your progress belongs to you.</strong>
          <p>Keep a backup of your answers, code, notes, and completed lessons.</p>
        </div>
        <button className="secondary-button" onClick={() => exportProgress(progress)}>
          <ArrowDownToLine size={15} />
          Export all progress
        </button>
      </div>
    </div>
  );
}

function Resources({ focusLectures }: { focusLectures: boolean }) {
  const [query, setQuery] = useState('');
  useEffect(() => {
    if (focusLectures) document.getElementById('original-lectures')?.scrollIntoView();
  }, [focusLectures]);
  return (
    <div className="page-container">
      <PageIntro
        eyebrow="A LITTLE EXTRA CONTEXT"
        title="Good things to keep close."
        description="The original lectures, companion code, and a glossary for the ideas you’ll meet along the way."
      />
      <div className="resource-feature">
        <div className="resource-feature-icon">
          <GraduationCap size={30} strokeWidth={1.2} />
        </div>
        <div>
          <span className="eyebrow">THE FOUNDATION</span>
          <h2>Neural Networks: Zero to Hero</h2>
          <p>
            Andrej Karpathy’s original course builds neural networks from scratch, in code. This
            independent interactive companion follows all eight lectures listed on the course page
            and adds original explanations, small experiments, and Python practice.
          </p>
          <div className="resource-links">
            <a
              className="secondary-button"
              href="https://karpathy.ai/zero-to-hero.html"
              target="_blank"
              rel="noreferrer"
            >
              Original course
              <ArrowUpRight size={15} />
            </a>
            <a
              className="text-button"
              href="https://github.com/karpathy/nn-zero-to-hero"
              target="_blank"
              rel="noreferrer"
            >
              <Github size={15} />
              Code & notebooks
              <ArrowUpRight size={13} />
            </a>
          </div>
        </div>
      </div>
      <section
        className="original-lectures"
        id="original-lectures"
        aria-labelledby="original-lectures-title"
      >
        <div className="section-heading">
          <div>
            <span className="eyebrow">THE ORIGINALS · ALL EIGHT VIDEOS</span>
            <h2 id="original-lectures-title">Learn from the source.</h2>
          </div>
        </div>
        <p>
          Neural Networks: Zero to Hero was created and taught by Andrej Karpathy. Watch his
          original YouTube lectures below. This independent interactive companion builds on that
          teaching sequence with its own explanations, exercises, and visual labs.
        </p>
        <div className="original-lectures__grid">
          {modules.map((m) => (
            <OriginalLecture key={m.id} module={m} />
          ))}
        </div>
      </section>
      <GettingStarted />
      <Projects />
      <div className="resource-prerequisites">
        <div>
          <h3>Before you begin</h3>
          <p>
            Some Python familiarity is helpful: functions, lists, loops, and classes. We introduce
            the calculus as we go. You don’t need prior machine learning experience.
          </p>
        </div>
        <div>
          <h3>About the exercises</h3>
          <p>
            Browser exercises use small, standard-library Python implementations so the mechanics
            stay visible. For full PyTorch training runs, use the linked original notebooks.
          </p>
        </div>
      </div>
      <div className="section-heading glossary-heading">
        <div>
          <span className="eyebrow">THE GLOSSARY</span>
          <h2>Plain words for big ideas.</h2>
        </div>
        <label className="input-search">
          <Search size={15} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Find a concept…"
            aria-label="Search glossary"
          />
        </label>
      </div>
      <div className="glossary-grid">
        {glossary
          .filter(([word, def]) => (word + ' ' + def).toLowerCase().includes(query.toLowerCase()))
          .map(([word, def]) => (
            <div key={word}>
              <h3>{word}</h3>
              <p>{def}</p>
            </div>
          ))}
      </div>
      {!glossary.some(([w, d]) => (w + ' ' + d).toLowerCase().includes(query.toLowerCase())) && (
        <div className="empty-state">
          <Search size={25} />
          <h3>No matching concept yet.</h3>
          <p>Try a broader term, such as “gradient” or “token”.</p>
        </div>
      )}
    </div>
  );
}

function SearchDialog({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('');
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const instance = dialog.current;
    const previousFocus = document.activeElement;
    instance?.showModal();
    input.current?.focus();
    return () => {
      instance?.close();
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus();
    };
  }, []);
  const term = query.trim().toLowerCase();
  const matches = lessons
    .map((lesson) => ({
      lesson,
      score: !term
        ? 1
        : (lesson.title.toLowerCase().includes(term) ? 8 : 0) +
          (lesson.summary.toLowerCase().includes(term) ? 4 : 0) +
          (lesson.module.title.toLowerCase().includes(term) ? 2 : 0) +
          (lesson.module.topics.join(' ').toLowerCase().includes(term) ? 1 : 0) +
          (lesson.sections.some((s) => (s.title + ' ' + s.body).toLowerCase().includes(term))
            ? 0.5
            : 0),
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ lesson }) => lesson)
    .slice(0, 9);
  return (
    <dialog
      className="search-dialog"
      aria-label="Search the course"
      ref={dialog}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="search-dialog-input">
        <Search size={21} />
        <input
          ref={input}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="What would you like to understand?"
          aria-label="Search lessons"
        />
        <button onClick={onClose} className="search-escape" aria-label="Close search">
          esc
        </button>
      </div>
      <div className="search-results">
        <span className="eyebrow">{query ? 'MATCHING LESSONS' : 'A FEW PLACES TO START'}</span>
        {matches.map((l) => (
          <a key={l.id} href={'#/lesson/' + l.id} onClick={onClose}>
            <span className="search-result-icon">
              <BookOpen size={17} />
            </span>
            <div>
              <strong>{l.title}</strong>
              <p>
                {l.module.title} <span>·</span> {l.minutes} min
              </p>
            </div>
            <ArrowUpRight size={16} />
          </a>
        ))}
        {matches.length === 0 && (
          <div className="empty-state">
            <Search size={23} />
            <h3>No lessons found.</h3>
            <p>Try “attention”, “gradient”, or “token”.</p>
          </div>
        )}
      </div>
      <div className="search-dialog-footer">
        <span>
          <Command size={12} /> K to search from anywhere
        </span>
        <span>{lessons.length} lessons. One connected story.</span>
      </div>
    </dialog>
  );
}
