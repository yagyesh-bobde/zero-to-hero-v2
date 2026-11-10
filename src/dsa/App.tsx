import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { ChevronRight, Menu, Moon, Sun, X } from 'lucide-react';
import { applyTheme, loadProgress, loadTheme, saveProgress, type Progress, type Theme } from './storage';
import { findModule } from './ui/data';
import Home from './ui/Home';
import LessonPage from './ui/LessonPage';
import ModulePage from './ui/ModulePage';
import PatternsPage from './ui/PatternsPage';
import ProblemsPage from './ui/ProblemsPage';
import { ProgressContext } from './ui/progress';
import { moduleHref, parseHash, SAMPLE_ID, type Route } from './ui/route';
import Sidebar from './ui/Sidebar';

const readRoute = () => parseHash(window.location.hash);

function useHashRoute() {
  const [route, setRoute] = useState<Route>(readRoute);
  useEffect(() => {
    const onHash = () => setRoute(readRoute());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  return route;
}

function NotFound({ what }: { what: string }) {
  return (
    <div className="dsa-page">
      <div className="dsa-empty is-page">
        <span className="dsa-eyebrow">Not found</span>
        <h1>{what}</h1>
        <p>It may still be being written, or the link is old.</p>
        <a className="dsa-btn is-primary" href="#/">
          Back to the roadmap
        </a>
      </div>
    </div>
  );
}

export default function App() {
  const route = useHashRoute();
  const [progress, setProgress] = useState<Progress>(loadProgress);
  const [saved, setSaved] = useState(true);
  const [theme, setTheme] = useState<Theme>(loadTheme);
  const [drawer, setDrawer] = useState(false);
  const mainRef = useRef<HTMLElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLButtonElement>(null);
  const first = useRef(true);

  const update = useCallback((fn: (p: Progress) => Progress) => setProgress(fn), []);
  const api = useMemo(() => ({ progress, update }), [progress, update]);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setSaved(saveProgress(progress));
  }, [progress]);

  useEffect(() => applyTheme(theme), [theme]);

  const module = route.page === 'module' || route.page === 'lesson' ? findModule(route.module) : undefined;
  const lesson = route.page === 'lesson' && module ? module.lessons.find((l) => l.id === route.lesson) : undefined;
  const routeKey = route.page === 'lesson' ? `${route.module}/${route.lesson}` : route.page === 'module' ? `m/${route.module}` : route.page;

  // Scroll to top and close the drawer on every page change (problem deep links scroll themselves).
  useEffect(() => {
    setDrawer(false);
    window.scrollTo({ top: 0, behavior: 'instant' });
    mainRef.current?.focus({ preventScroll: true });
  }, [routeKey]);

  // Remember the last lesson opened (sample lessons don't count).
  useEffect(() => {
    if (!module || !lesson || module.id === SAMPLE_ID) return;
    update((p) => (p.last?.module === module.id && p.last.lesson === lesson.id ? p : { ...p, last: { module: module.id, lesson: lesson.id } }));
  }, [module, lesson, update]);

  useEffect(() => {
    const name =
      route.page === 'lesson' && lesson ? lesson.title : route.page === 'module' && module ? module.title : route.page === 'problems' ? 'All problems' : route.page === 'patterns' ? 'Pattern finder' : '';
    document.title = name ? `${name} · DSA — Zero to Hero` : 'DSA — Zero to Hero';
  }, [route.page, lesson, module]);

  // Drawer: lock page scroll, close on Escape, keep focus inside.
  useEffect(() => {
    if (!drawer) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    drawerRef.current?.querySelector<HTMLElement>('button, a')?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDrawer(false);
        menuRef.current?.focus();
      }
      if (e.key === 'Tab' && drawerRef.current) {
        const items = [...drawerRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')];
        const firstEl = items[0];
        const lastEl = items[items.length - 1];
        if (e.shiftKey && document.activeElement === firstEl) {
          e.preventDefault();
          lastEl?.focus();
        } else if (!e.shiftKey && document.activeElement === lastEl) {
          e.preventDefault();
          firstEl?.focus();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [drawer]);

  let page: ReactNode;
  if (route.page === 'home') page = <Home />;
  else if (route.page === 'problems') page = <ProblemsPage />;
  else if (route.page === 'patterns') page = <PatternsPage />;
  else if (route.page === 'module') page = module ? <ModulePage module={module} /> : <NotFound what="This module isn't here yet." />;
  else if (route.page === 'lesson')
    page = module && lesson ? <LessonPage key={routeKey} module={module} lesson={lesson} problem={route.problem} /> : <NotFound what="This lesson isn't here yet." />;
  else page = <NotFound what="This page doesn't exist." />;

  const crumb =
    route.page === 'lesson' && module && lesson
      ? { href: moduleHref(module.id), parent: module.id === SAMPLE_ID ? 'Sample' : `Module ${module.number}`, here: `Lesson ${module.lessons.indexOf(lesson) + 1}` }
      : route.page === 'module' && module
        ? { href: '#/', parent: 'Roadmap', here: module.id === SAMPLE_ID ? 'Sample' : `Module ${module.number}` }
        : route.page === 'problems'
          ? { href: '#/', parent: 'Roadmap', here: 'All problems' }
          : route.page === 'patterns'
            ? { href: '#/', parent: 'Roadmap', here: 'Pattern finder' }
            : null;

  return (
    <ProgressContext.Provider value={api}>
      <div className="dsa-app">
        <a className="dsa-skip" href="#dsa-main" onClick={(e) => (e.preventDefault(), mainRef.current?.focus())}>
          Skip to content
        </a>
        <aside className="dsa-sidebar">
          <Sidebar route={route} />
        </aside>
        {drawer && (
          <div className="dsa-drawer" role="dialog" aria-modal="true" aria-label="Course navigation">
            <button type="button" className="dsa-drawer-scrim" aria-label="Close navigation" tabIndex={-1} onClick={() => setDrawer(false)} />
            <div className="dsa-drawer-panel" ref={drawerRef}>
              <button
                type="button"
                className="dsa-icon-btn dsa-drawer-close"
                aria-label="Close navigation"
                onClick={() => {
                  setDrawer(false);
                  menuRef.current?.focus();
                }}
              >
                <X size={19} />
              </button>
              <Sidebar route={route} />
            </div>
          </div>
        )}
        <div className="dsa-workspace">
          <header className="dsa-topbar">
            <button ref={menuRef} type="button" className="dsa-icon-btn dsa-menu-btn" aria-label="Open course navigation" aria-expanded={drawer} onClick={() => setDrawer(true)}>
              <Menu size={20} />
            </button>
            <a className="dsa-topbar-brand" href="#/">
              DSA
            </a>
            {crumb && (
              <span className="dsa-crumb">
                <a href={crumb.href}>{crumb.parent}</a>
                <ChevronRight size={13} aria-hidden="true" />
                <span aria-current="page">{crumb.here}</span>
              </span>
            )}
            <span className="dsa-topbar-space" />
            <a className="dsa-topbar-link" href="#/problems" aria-current={route.page === 'problems' ? 'page' : undefined}>
              Problems
            </a>
            <a className="dsa-topbar-link" href="#/patterns" aria-current={route.page === 'patterns' ? 'page' : undefined}>
              Patterns
            </a>
            <button
              type="button"
              className="dsa-icon-btn"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
              onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </header>
          {!saved && (
            <div className="dsa-banner" role="alert">
              Your browser is blocking storage, so progress will be lost when you close this tab.
            </div>
          )}
          <main id="dsa-main" ref={mainRef} tabIndex={-1} className="dsa-main">
            {page}
          </main>
        </div>
      </div>
    </ProgressContext.Provider>
  );
}
