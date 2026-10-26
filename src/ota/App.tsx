import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
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
  ExternalLink,
  FileText,
  FlaskConical,
  Github,
  Layers,
  LayoutDashboard,
  ListTree,
  Menu,
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
import { chapters, lessons, totalMinutes } from './curriculum';
import { challenges } from './challenges';
import { sourceById, sources, snapshots } from './sources';
import { downloadFile, readProgress, writeProgress } from './storage';
import type { LabKind, Lesson, Progress, Section } from './types';
import Lab, { labMeta, LifecycleLab } from './Labs';
import Workshop from './Workshop';

type Page = 'overview' | 'path' | 'playground' | 'notebook' | 'sources' | 'lesson';
const pageLabels: Record<Page, string> = {
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
    <section className="ota-article-section">
      <h2>{section.title}</h2>
      {section.body.map((p, i) => (
        <p key={i}>
          <Inline text={p} />
        </p>
      ))}
      {section.bullets && (
        <ul>
          {section.bullets.map((p) => (
            <li key={p}>
              <Inline text={p} />
            </li>
          ))}
        </ul>
      )}
      {section.code && (
        <div className="ota-code-block">
          <div className="ota-code-bar">
            <span>{section.code.label}</span>
          </div>
          <pre>
            <code>{section.code.value}</code>
          </pre>
        </div>
      )}
      {section.callout && (
        <div className="ota-callout">
          <InfoMark />
          <p>{section.callout}</p>
        </div>
      )}
    </section>
  );
}
function InfoMark() {
  return (
    <span className="ota-info-mark" aria-hidden="true">
      i
    </span>
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
    document.documentElement.dataset.otaTheme === 'light' ? 'light' : 'dark',
  );
  const [collapsed, setCollapsed] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [expanded, setExpanded] = useState<string[]>(['foundations']);
  const [search, setSearch] = useState(false);
  const [saved, setSaved] = useState(true);
  const [lab, setLab] = useState<LabKind>('lifecycle');
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
  const workshopProps = { progress, onCode, onPass };
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
    document.documentElement.dataset.otaTheme = theme;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', theme === 'dark' ? '#141416' : '#faf9f6');
    try {
      localStorage.setItem('rn-ota-theme-v1', theme);
    } catch {}
  }, [theme]);
  useEffect(() => {
    const label =
      route.page === 'lesson' && current
        ? current.title
        : pageLabels[route.page as Page] || 'Not found';
    document.title = `${label} · React Native OTA — Zero to Hero`;
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
      if (!document.querySelector('.ota-search-dialog')) menuRef.current?.focus();
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
      className={`ota-app ${collapsed ? 'ota-sidebar-collapsed' : ''} ${mobile ? 'ota-mobile-open' : ''}`}
    >
      <a
        className="ota-skip"
        href="#ota-main"
        onClick={(e) => {
          e.preventDefault();
          mainRef.current?.focus();
        }}
      >
        Skip to content
      </a>
      {mobile && (
        <button
          className="ota-backdrop"
          aria-label="Close navigation"
          onClick={() => setMobile(false)}
        />
      )}
      <aside
        ref={drawerRef}
        className="ota-sidebar"
        aria-label="Course navigation"
        {...(mobile ? { role: 'dialog', 'aria-modal': true } : {})}
      >
        <div className="ota-sidebar-brand">
          <a href="/" aria-label="Zero to Hero, neural networks course">
            <span className="ota-brand-mark">✳</span>
            <span>
              zero <span className="ota-brand-to">to</span> hero
              <span className="ota-brand-period">.</span>
            </span>
          </a>
          <button
            className="ota-mobile-close ota-icon-button"
            aria-label="Close navigation"
            onClick={() => setMobile(false)}
          >
            <X size={18} />
          </button>
        </div>
        <div className="ota-course-identity">
          <span className="ota-course-icon">
            <Radio size={19} />
          </span>
          <div>
            <strong>React Native OTA</strong>
            <span>A course from the inside out</span>
          </div>
          <span className="ota-new-pill">NEW</span>
        </div>
        <button className="ota-sidebar-search" onClick={() => setSearch(true)}>
          <Search size={15} />
          <span>Find a lesson…</span>
          <kbd>⌘ K</kbd>
        </button>
        <div className="ota-sidebar-scroll">
          <nav className="ota-nav">
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
                {n.id === 'playground' && <span className="ota-nav-count">7</span>}
              </a>
            ))}
          </nav>
          <div className="ota-sidebar-section">
            <span>The learning path</span>
            <span>06</span>
          </div>
          <div className="ota-chapter-nav">
            {chapters.map((chapter, i) => {
              const isExpanded = expanded.includes(chapter.id);
              const count = chapter.lessons.filter((l) => progress.completed.includes(l.id)).length;
              return (
                <div key={chapter.id}>
                  <button
                    className={`ota-chapter-toggle ${current?.chapter.id === chapter.id && route.page === 'lesson' ? 'is-current' : ''}`}
                    aria-expanded={isExpanded}
                    onClick={() =>
                      setExpanded((e) =>
                        e.includes(chapter.id)
                          ? e.filter((x) => x !== chapter.id)
                          : [...e, chapter.id],
                      )
                    }
                  >
                    <span className="ota-chapter-number">{String(i + 1).padStart(2, '0')}</span>
                    <span>{chapter.title}</span>
                    {count === chapter.lessons.length ? (
                      <CheckCircle2 size={14} />
                    ) : (
                      <ChevronRight className={isExpanded ? 'is-open' : ''} size={14} />
                    )}
                  </button>
                  {isExpanded && (
                    <div className="ota-lesson-nav">
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
        <div className="ota-sidebar-bottom">
          <div className="ota-progress-label">
            <span>Your progress</span>
            <strong>
              {completed}
              <span> / {lessons.length}</span>
            </strong>
          </div>
          <div
            className="ota-progress-track"
            role="progressbar"
            aria-label="Course progress"
            aria-valuenow={percent}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <span style={{ width: `${percent}%` }} />
          </div>
          <span className="ota-local-note">Saved on this device · separate course</span>
          <a className="ota-back-course" href="/">
            <ArrowLeft size={13} />
            Neural networks course
            <ArrowUpRight size={13} />
          </a>
        </div>
      </aside>
      <div className="ota-workspace">
        <header className="ota-topbar">
          <div>
            <button
              ref={menuRef}
              className="ota-icon-button"
              aria-label={
                mobile ? 'Close navigation' : collapsed ? 'Show navigation' : 'Toggle navigation'
              }
              aria-expanded={mobile || !collapsed}
              onClick={toggleSidebar}
            >
              {collapsed ? <PanelLeftOpen size={19} /> : <PanelLeftClose size={19} />}
            </button>
            <span className="ota-topbar-crumb">
              Courses <ChevronRight size={13} />
              <strong>React Native OTA</strong>
            </span>
          </div>
          <div>
            <span className="ota-topbar-page">{pageLabels[route.page as Page] || 'Not found'}</span>
            <button
              className="ota-icon-button"
              aria-label="Search course"
              onClick={() => setSearch(true)}
            >
              <Search size={18} />
            </button>
            <button
              className="ota-icon-button"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
              onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <a
              className="ota-icon-button"
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
          <div role="alert" className="ota-storage-error">
            Browser storage is unavailable. Keep this tab open and export your notes or progress
            before leaving.
          </div>
        )}
        <main id="ota-main" ref={mainRef} tabIndex={-1} className="ota-main">
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
            <div className="ota-page">
              <PageIntro
                eyebrow="LEARN BY CHANGING THINGS"
                title="Your OTA playground."
                description="Follow a release, change a base, miss a rollout, or break a download. Each experiment makes a different handoff visible."
              />
              <div className="ota-lab-tabs" role="group" aria-label="Choose an interactive lab">
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
              <p className="ota-footnote">
                Local learning models. No requests to Zepto or AWS. Source-backed behavior is
                distinguished from simplified teaching examples.
              </p>
            </div>
          ) : route.page === 'notebook' ? (
            <Notebook progress={progress} update={update} />
          ) : route.page === 'sources' ? (
            <Resources progress={progress} />
          ) : (
            <div className="ota-page">
              <PageIntro
                eyebrow="THIS PAGE ISN’T HERE"
                title="Let’s get you back on the path."
                description="That lesson or page doesn’t exist in this course."
              />
              <button className="ota-btn ota-btn-primary" onClick={() => go('path')}>
                Open the learning path
                <ArrowRight size={16} />
              </button>
            </div>
          )}
        </main>
        <footer className="ota-footer">
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
    <div className="ota-page-intro">
      <span className="ota-kicker">
        <span className="ota-live-dot" />
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
    <div className="ota-overview">
      <section className="ota-hero">
        <div className="ota-hero-copy">
          <span className="ota-kicker">
            <span className="ota-live-dot" />
            REACT NATIVE · OVER-THE-AIR UPDATES
          </span>
          <h1>
            Ship a change.
            <br />
            <em>
              Understand
              <br className="ota-hero-break" /> every byte.
            </em>
          </h1>
          <p>
            A fix leaves your laptop. A phone runs new code.
            <br className="ota-wide-break" /> What actually happens in between?
          </p>
          <p className="ota-hero-secondary">
            Go from the first principles of OTA to the internals of Zepto’s Delta. Follow the code,
            move the bytes, and build the rules that make an update safe.
          </p>
          <div className="ota-hero-actions">
            <a className="ota-btn ota-btn-primary" href={`#/lesson/${nextId}`}>
              {completed === lessons.length
                ? 'Revisit the course'
                : progress.lastLesson
                  ? 'Continue learning'
                  : 'Start learning'}
              <ArrowRight size={17} />
            </a>
            <button className="ota-btn ota-btn-ghost" onClick={() => openLab('patch')}>
              Try a lab
              <FlaskConical size={16} />
            </button>
          </div>
          <div className="ota-start-hint">
            <span>{progress.lastLesson ? 'PICK UP AT' : 'START HERE'}</span>
            <span>
              {next.chapterIndex + 1}.{next.lessonIndex + 1} <span>·</span> {next.title}
            </span>
          </div>
          <div className="ota-hero-stats">
            <div>
              <strong>06</strong>
              <span>Chapters</span>
            </div>
            <div>
              <strong>24</strong>
              <span>Small lessons</span>
            </div>
            <div>
              <strong>07</strong>
              <span>Interactive labs</span>
            </div>
          </div>
        </div>
        <div className="ota-hero-visual">
          <div className="ota-hero-visual-top">
            <span>
              <Radio size={13} />
              THE UPDATE, UNPACKED
            </span>
            <span className="ota-live-dot" />
          </div>
          <LifecycleLab compact />
        </div>
      </section>
      <div className="ota-proof-strip">
        <span>
          <GitSourceIcon />
          Grounded in Zepto’s public code
        </span>
        <span>
          <Code2 size={15} />6 runnable coding exercises
        </span>
        <span>
          <CheckCircle2 size={15} />
          48 knowledge checks
        </span>
        <span>
          <Clock3 size={15} />~{Math.round(totalMinutes / 60)} hours · self-paced
        </span>
      </div>
      <section className="ota-home-path">
        <div className="ota-section-top">
          <div>
            <span className="ota-kicker">A CLEAR PATH THROUGH THE SYSTEM</span>
            <h2>From “what is OTA?” to “I can trace it.”</h2>
            <p>
              Six chapters. One connected mental model. Take them in order or jump into the handoff
              you want to understand.
            </p>
          </div>
          <a className="ota-text-button" href="#/path">
            See all lessons
            <ArrowRight size={15} />
          </a>
        </div>
        <div className="ota-chapter-cards">
          {chapters.map((chapter, i) => {
            const Icon = chapterIcons[i];
            const done = chapter.lessons.filter((l) => progress.completed.includes(l.id)).length;
            return (
              <a
                key={chapter.id}
                className="ota-chapter-card"
                href={`#/lesson/${chapter.lessons[0].id}`}
              >
                <div className="ota-card-top">
                  <span className="ota-mono">0{i + 1}</span>
                  <Icon size={20} />
                </div>
                <h3>{chapter.title}</h3>
                <p>{chapter.description}</p>
                <div className="ota-card-bottom">
                  <span>
                    {done ? `${done}/4 completed` : '4 lessons'}
                    <i /> {chapter.lessons.reduce((n, l) => n + l.minutes, 0)} min
                  </span>
                  <ArrowUpRight size={17} />
                </div>
              </a>
            );
          })}
        </div>
      </section>
      <section className="ota-home-labs">
        <div>
          <span className="ota-kicker">LESS PASSIVE READING. MORE “OH, I GET IT.”</span>
          <h2>
            Change one thing.
            <br />
            See why it matters.
          </h2>
          <p>
            Apply a patch to the wrong base. Put a device outside a rollout. Disable the bundle it’s
            running. The useful lessons are in the consequences.
          </p>
          <button className="ota-text-button" onClick={() => openLab('rollout')}>
            Open the control room
            <ArrowRight size={15} />
          </button>
        </div>
        <div className="ota-mini-labs">
          {(['patch', 'rollout', 'failure'] as LabKind[]).map((kind) => {
            const Icon = labMeta[kind].icon;
            return (
              <button key={kind} onClick={() => openLab(kind)}>
                <span className="ota-mini-lab-icon">
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
      <div className="ota-prereq">
        <div>
          <BookOpen size={20} />
          <span>
            <strong>Bring a little React. We’ll build the rest.</strong>
            <p>
              Basic React Native and JavaScript help. You can complete every browser activity
              without an AWS account, a native build, or an API key.
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
    <div className="ota-page">
      <PageIntro
        eyebrow="THE LEARNING PATH"
        title="Every handoff, explained."
        description="Understand the mechanism, change it in a lab, then check your mental model. Finish both checks and the linked exercise, where present, to complete a lesson."
      />
      <div className="ota-path-list">
        {chapters.map((chapter, i) => (
          <section key={chapter.id} className="ota-path-chapter">
            <div className="ota-path-chapter-title">
              <span>0{i + 1}</span>
              <div>
                <h2>{chapter.title}</h2>
                <p>{chapter.description}</p>
              </div>
              <span className="ota-path-count">
                {chapter.lessons.filter((l) => progress.completed.includes(l.id)).length}/4
              </span>
            </div>
            <div>
              {chapter.lessons.map((lesson, j) => (
                <a className="ota-path-lesson" key={lesson.id} href={`#/lesson/${lesson.id}`}>
                  <span
                    className={`ota-lesson-circle ${progress.completed.includes(lesson.id) ? 'is-complete' : ''}`}
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
                  <span className="ota-path-minutes">
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
  };
}) {
  const [tab, setTab] = useState('understand');
  const [noteOpen, setNoteOpen] = useState(false);
  const noteId = `ota-note-${lesson.id}`;
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
    <article className="ota-lesson-page">
      <div className="ota-lesson-breadcrumb">
        <a href="#/path">Learning path</a>
        <ChevronRight size={13} />
        <span>
          {String(lesson.chapterIndex + 1).padStart(2, '0')} · {lesson.chapter.title}
        </span>
      </div>
      <div className="ota-lesson-header">
        <div className="ota-lesson-meta">
          <span className="ota-kicker">
            LESSON {lesson.chapterIndex + 1}.{lesson.lessonIndex + 1}
          </span>
          <span>
            <Clock3 size={13} />
            {lesson.minutes} min
          </span>
          {done && (
            <span className="ota-complete-label">
              <CheckCircle2 size={14} />
              Completed
            </span>
          )}
        </div>
        <h1>{lesson.title}</h1>
        <p>{lesson.description}</p>
      </div>
      <div className="ota-lesson-toolbar">
        <div className="ota-lesson-tabs" role="tablist" aria-label="Lesson activities">
          {refs.map((t) => (
            <button
              key={t.id}
              role="tab"
              id={`ota-tab-${t.id}`}
              aria-controls={`ota-panel-${t.id}`}
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
                document.getElementById(`ota-tab-${refs[nextPosition].id}`)?.focus();
              }}
            >
              <t.icon size={15} />
              {t.label}
            </button>
          ))}
        </div>
        <button
          className={`ota-icon-button ${noteOpen ? 'is-active' : ''}`}
          aria-label="Toggle lesson notes"
          aria-expanded={noteOpen}
          aria-controls={noteId}
          onClick={() => setNoteOpen((v) => !v)}
        >
          <NotebookPen size={18} />
        </button>
      </div>
      {noteOpen && (
        <div id={noteId} className="ota-lesson-note">
          <label htmlFor="ota-lesson-notes">
            <NotebookPen size={16} />
            Your explanation, in your words
          </label>
          <textarea
            id="ota-lesson-notes"
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
        id={`ota-panel-${tab}`}
        aria-labelledby={`ota-tab-${tab}`}
        className="ota-lesson-content"
      >
        {tab === 'understand' ? (
          <>
            <div className="ota-lesson-map">
              <span className="ota-kicker">IN THIS LESSON</span>
              {lesson.sections.map((s, i) => (
                <a
                  key={s.title}
                  href={`#ota-section-${i}`}
                  onClick={(e) => {
                    e.preventDefault();
                    document
                      .getElementById(`ota-section-${i}`)
                      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                >
                  <span>0{i + 1}</span>
                  {s.title}
                  <ArrowDownToLine size={12} />
                </a>
              ))}
            </div>
            {lesson.sections.map((s, i) => (
              <div id={`ota-section-${i}`} key={s.title}>
                <ArticleSection section={s} />
              </div>
            ))}
            <div className="ota-takeaway">
              <span>
                <Layers size={17} />
                Take this with you
              </span>
              <p>{lesson.takeaway}</p>
            </div>
            <div className="ota-lesson-sources">
              <span className="ota-kicker">GO TO THE SOURCE</span>
              {lesson.sources.map((id) => (
                <SourceLink key={id} id={id} />
              ))}
            </div>
            <button
              className="ota-btn ota-btn-primary"
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
            <div className="ota-activity-intro">
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
              className="ota-btn ota-btn-primary"
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
            <button className="ota-btn ota-btn-primary" onClick={() => setTab('check')}>
              Check your understanding
              <ArrowRight size={16} />
            </button>
          </>
        ) : (
          <>
            <div className="ota-activity-intro">
              <span className="ota-kicker">MAKE IT YOURS</span>
              <h2>Check your mental model.</h2>
              <p>
                Choose an answer, read the reasoning, and try again if you need to. Both checks
                {lesson.challenge ? ' and the coding exercise' : ''} count toward completion.
              </p>
            </div>
            {lesson.questions.map((question, i) => {
              const answer = progress.answers[`${lesson.id}/${i}`];
              const answered = answer !== undefined;
              const correct = answer === question.answer;
              return (
                <section className="ota-quiz" key={question.prompt}>
                  <span className="ota-kicker">CHECK 0{i + 1}</span>
                  <h3>{question.prompt}</h3>
                  <div role="group" aria-label={question.prompt}>
                    {question.options.map((option, j) => (
                      <button
                        key={option}
                        className={`ota-quiz-option ${answer === j ? (correct ? 'is-correct' : 'is-wrong') : ''}`}
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
                      className={`ota-quiz-feedback ${correct ? 'is-correct' : 'is-wrong'}`}
                    >
                      <strong>{correct ? 'That’s it.' : 'Try another answer.'}</strong>
                      <p>
                        {correct
                          ? question.explanation
                          : 'Revisit the boundary or handoff involved. The explanation will appear when you find the right answer.'}
                      </p>
                    </div>
                  )}
                </section>
              );
            })}
            <div className="ota-completion">
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
                      ? 'Pass the coding exercise in Build it, then complete both knowledge checks.'
                      : 'Answer both checks correctly to complete this lesson.'}
                </p>
              </div>
              <button
                className="ota-btn ota-btn-primary"
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
              <button className="ota-text-button" onClick={() => setTab('build')}>
                Open the coding exercise
                <Code2 size={15} />
              </button>
            )}
          </>
        )}
      </div>
      <div className="ota-lesson-pagination">
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
    '# My React Native OTA notebook\n\n' +
    lessons
      .filter((l) => progress.notes[l.id]?.trim())
      .map(
        (l) =>
          `## ${l.chapterIndex + 1}.${l.lessonIndex + 1} ${l.title}\n\n${progress.notes[l.id]}\n\nSource lesson: https://zero-to-hero-v2.vercel.app/react-native-ota#/lesson/${l.id}`,
      )
      .join('\n\n---\n\n')
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
    <div className="ota-page">
      <PageIntro
        eyebrow="THINK IT THROUGH, IN YOUR WORDS"
        title="Your OTA field notes."
        description="Write an explanation you could give to a teammate. Notes and progress stay in this browser, in a separate store from the neural networks course."
      />
      <div className="ota-notebook-actions">
        <span>
          {noted.length} lesson{noted.length === 1 ? '' : 's'} with notes
        </span>
        <button
          className="ota-btn ota-btn-small"
          onClick={() =>
            downloadFile('react-native-ota-notes.md', notebookMarkdown(progress), 'text/markdown')
          }
        >
          <ArrowDownToLine size={15} />
          Export notes
        </button>
        <button
          className="ota-btn ota-btn-small"
          onClick={() =>
            downloadFile(
              'react-native-ota-progress.json',
              JSON.stringify(
                { version: 1, exportedAt: new Date().toISOString(), ...progress },
                null,
                2,
              ),
              'application/json',
            )
          }
        >
          <ArrowDownToLine size={15} />
          Backup progress
        </button>
      </div>
      <div className="ota-notebook-grid">
        <div className="ota-notebook-lessons">
          {chapters.map((c, i) => (
            <div key={c.id}>
              <span className="ota-kicker">
                0{i + 1} · {c.title}
              </span>
              {c.lessons.map((l) => (
                <button
                  key={l.id}
                  className={selected === l.id ? 'is-active' : ''}
                  onClick={() => setSelected(l.id)}
                >
                  <span>{l.title}</span>
                  {progress.notes[l.id]?.trim() && <span className="ota-note-dot" />}
                </button>
              ))}
            </div>
          ))}
        </div>
        <div className="ota-notebook-editor">
          <div>
            <span className="ota-kicker">
              LESSON {lesson.chapterIndex + 1}.{lesson.lessonIndex + 1}
            </span>
            <a href={`#/lesson/${lesson.id}`} aria-label={`Open lesson: ${lesson.title}`}>
              <ArrowUpRight size={16} />
            </a>
          </div>
          <h2>{lesson.title}</h2>
          <label className="ota-sr" htmlFor="ota-notebook-text">
            Notes for {lesson.title}
          </label>
          <textarea
            id="ota-notebook-text"
            placeholder={
              'Try explaining the mechanism without looking at the lesson.\n\nWhat are the inputs? What makes it safe? Where can it fail?'
            }
            value={progress.notes[lesson.id] || ''}
            onChange={(e) =>
              update((p) => ({ ...p, notes: { ...p.notes, [lesson.id]: e.target.value } }))
            }
          />
          <div className="ota-notebook-editor-bottom">
            <span>Saved locally as you type</span>
            <span>
              {(progress.notes[lesson.id] || '').trim().split(/\s+/).filter(Boolean).length} words
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
function studyGuide() {
  return (
    '# React Native OTA · Zero to Hero\n\nAn independent learning companion to Zepto’s public Delta implementation.\n\n' +
    chapters
      .map(
        (c, i) =>
          `# ${i + 1}. ${c.title}\n\n${c.lessons.map((l) => `## ${l.title}\n\n${l.description}\n\n${l.sections.map((s) => `### ${s.title}\n\n${s.body.join('\n\n')}${s.code ? '\n\n```\n' + s.code.value + '\n```' : ''}${s.callout ? '\n\n> ' + s.callout : ''}`).join('\n\n')}\n\nTakeaway: ${l.takeaway}\n\nSources:\n${l.sources.map((id) => '- ' + sourceById(id).title + ': ' + sourceById(id).url).join('\n')}`).join('\n\n---\n\n')}`,
      )
      .join('\n\n') +
    '\n\n# Pinned source snapshots\n' +
    snapshots.map((s) => `${s.repo}: ${s.sha}`).join('\n')
  );
}
function Resources({ progress }: { progress: Progress }) {
  return (
    <div className="ota-page">
      <PageIntro
        eyebrow="FOLLOW THE EVIDENCE"
        title="Read the code behind the course."
        description="Implementation lessons cite immutable repository snapshots. The teaching models make simplifications explicit, and recommendations are kept distinct from verified SDK behavior."
      />
      <div className="ota-resource-banner">
        <div>
          <FileText size={25} />
          <span>
            <h2>Take the whole field guide with you.</h2>
            <p>
              All 24 lessons, code snippets, key takeaways, and source links in a single Markdown
              document.
            </p>
          </span>
        </div>
        <button
          className="ota-btn ota-btn-primary"
          onClick={() =>
            downloadFile('react-native-ota-field-guide.md', studyGuide(), 'text/markdown')
          }
        >
          <ArrowDownToLine size={16} />
          Download guide
        </button>
      </div>
      <div className="ota-source-intro">
        <h2>A note on accuracy</h2>
        <p>
          This is original educational material, independent of Zepto and its authors. It explains
          the public SDK, CLI, and server as reviewed on October 26, 2026. It does not claim access
          to Zepto’s production infrastructure, benchmarks, or internal decisions. The supplied blog
          article is linked as context; its host restricted retrieval, so technical claims cite the
          repositories directly.
        </p>
        <p>
          The COPY/ADD patch lab is an original text model, while Delta uses binary bsdiff/bspatch.
          The rollout lab mirrors the inspected check predicates with illustrative devices and
          placeholder URLs. Security and app-health recommendations are identified as
          recommendations.
        </p>
        <p>
          The original neural networks course remains at <a href="/">the home page</a>. This course
          uses its own entry point, styles, theme preference, and progress key. No account or cloud
          sync; clearing browser storage clears local notes and progress. Export a backup to keep a
          copy; backup import is not implemented.
        </p>
      </div>
      <div className="ota-snapshot-list">
        {snapshots.map((s) => (
          <a
            key={s.repo}
            href={`https://github.com/zepto-labs/${s.repo}/tree/${s.sha}`}
            target="_blank"
            rel="noreferrer"
          >
            <Github size={16} />
            <strong>{s.repo}</strong>
            <code>{s.sha.slice(0, 12)}</code>
            <ArrowUpRight size={14} />
          </a>
        ))}
      </div>
      <h2 className="ota-source-heading">Primary sources</h2>
      <div className="ota-source-list">
        {sources.map((s, i) => (
          <a href={s.url} key={s.id} target="_blank" rel="noreferrer">
            <span className="ota-source-number">{String(i + 1).padStart(2, '0')}</span>
            <div>
              <span className="ota-kicker">{s.kind}</span>
              <h3>{s.title}</h3>
              <p>{s.detail}</p>
            </div>
            <ArrowUpRight size={18} />
          </a>
        ))}
      </div>
      <div className="ota-attribution">
        <h2>Credit where it belongs.</h2>
        <p>
          Zepto Labs created Delta. The public repositories credit Kushagra Gupta, Amit Mundra,
          Zubin Paul, and Saiyam Arora, with special thanks to Nikhil Mittal. Their source code
          makes this implementation study possible.
        </p>
        <p>
          This module’s lesson prose, interface, exercises, and teaching graphics are independently
          written. The learning format takes inspiration from the existing Zero to Hero companion.
          React Native OTA is separate from Andrej Karpathy’s neural networks course and is not
          presented as his material.
        </p>
      </div>
      <button
        className="ota-btn"
        onClick={() =>
          downloadFile(
            'react-native-ota-progress.json',
            JSON.stringify(
              { version: 1, exportedAt: new Date().toISOString(), ...progress },
              null,
              2,
            ),
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
    <div className="ota-search-overlay" onClick={close}>
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label="Search React Native OTA"
        className="ota-search-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="ota-search-input">
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
          <button className="ota-icon-button" aria-label="Close search" onClick={close}>
            <X size={17} />
          </button>
        </div>
        <div className="ota-search-results">
          <span className="ota-kicker">
            {query.trim()
              ? `${results.length} matching lesson${results.length === 1 ? '' : 's'}`
              : 'START EXPLORING'}
          </span>
          {results.length ? (
            results.map((l) => (
              <a key={l.id} href={`#/lesson/${l.id}`} onClick={close}>
                <span className="ota-search-result-icon">
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
            <p>No lessons found. Try “rollback”, “Hermes”, “assets”, or “bucket”.</p>
          )}
        </div>
        <div className="ota-search-footer">
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
