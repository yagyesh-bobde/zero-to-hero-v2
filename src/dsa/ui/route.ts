// Hash routes, so /dsa needs no server rewrites beyond its entry.
//   #/                          home
//   #/m/<module>                module
//   #/m/<module>/<lesson>       lesson   (+ ?p=<problem> or /<problem> to open a problem)
//   #/problems  #/patterns      course-wide pages
//   #/dev/sample                hidden sample module for checking the renderer

export type Route =
  | { page: 'home' }
  | { page: 'module'; module: string }
  | { page: 'lesson'; module: string; lesson: string; problem?: string }
  | { page: 'problems' }
  | { page: 'patterns' }
  | { page: 'not-found' };

export const SAMPLE_ID = 'sample';

const decode = (s: string) => {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
};

export function parseHash(hash: string): Route {
  const raw = hash.replace(/^#/, '');
  const [path, query = ''] = raw.split('?');
  const parts = path.split('/').filter(Boolean).map(decode);
  const p = new URLSearchParams(query).get('p') || undefined;
  if (parts.length === 0) return { page: 'home' };
  const [head, a, b, c] = parts;
  if (head === 'problems' && parts.length === 1) return { page: 'problems' };
  if (head === 'patterns' && parts.length === 1) return { page: 'patterns' };
  if (head === 'dev' && a === SAMPLE_ID && parts.length === 2) return { page: 'module', module: SAMPLE_ID };
  if (head === 'm' && a) {
    if (parts.length === 2) return { page: 'module', module: a };
    if (parts.length <= 4 && b) {
      const problem = c || p;
      return problem ? { page: 'lesson', module: a, lesson: b, problem } : { page: 'lesson', module: a, lesson: b };
    }
  }
  return { page: 'not-found' };
}

export function href(route: Route): string {
  switch (route.page) {
    case 'home':
      return '#/';
    case 'module':
      return route.module === SAMPLE_ID ? '#/dev/sample' : `#/m/${encodeURIComponent(route.module)}`;
    case 'lesson': {
      const base = `#/m/${encodeURIComponent(route.module)}/${encodeURIComponent(route.lesson)}`;
      return route.problem ? `${base}/${encodeURIComponent(route.problem)}` : base;
    }
    case 'problems':
      return '#/problems';
    case 'patterns':
      return '#/patterns';
    default:
      return '#/';
  }
}

export const moduleHref = (module: string) => href({ page: 'module', module });
export const lessonHref = (module: string, lesson: string, problem?: string) =>
  href({ page: 'lesson', module, lesson, problem });
export const leetcodeHref = (n: number) => `https://leetcode.com/problemset/?search=${n}`;
