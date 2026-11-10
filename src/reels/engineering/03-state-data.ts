import type { Series } from '../types';

/* ── Server state vs client state ─────────────────────────────── */

const effectFetch = `function Profile({ id }) {
  const [user, setUser] =
    useState(null);
  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    getUser(id).then((u) => {
      setUser(u);
      setLoading(false);
    });
  }, [id]);
}`;

const withQuery = `function Profile({ id }) {
  const { data, isPending } =
    useQuery({
      queryKey: ['user', id],
      queryFn: () => getUser(id),
    });
}`;

const fourGaps = (active: number) => ({
  type: 'list' as const,
  title: 'What the effect skips',
  items: [
    { text: 'Caching', icon: '🗃️', sub: 'refetch on every mount' },
    { text: 'Deduping', icon: '👯', sub: 'two screens, two requests' },
    { text: 'Staleness', icon: '⏳', sub: 'when is it out of date?' },
    { text: 'Retries', icon: '🔁', sub: 'flaky network, blank screen' },
  ],
  active,
});

const textQuiz = {
  type: 'quiz' as const,
  question: 'The text in a search box. Server state or client state?',
  options: ['Server state', 'Client state'],
  answer: 1,
};

/* ── Optimistic updates ───────────────────────────────────────── */

const onMutate = `useMutation({
  mutationFn: likePost,
  onMutate: async () => {
    await qc.cancelQueries({
      queryKey: key,
    });
    const prev = qc.getQueryData(key);
    qc.setQueryData(key, addLike);
    return { prev };
  },
});`;

const onError = `useMutation({
  mutationFn: likePost,
  onMutate: …,
  onError: (err, vars, ctx) => {
    qc.setQueryData(key, ctx.prev);
  },
  onSettled: () => {
    qc.invalidateQueries({
      queryKey: key,
    });
  },
});`;

const feed = (likes: 'guess' | 'failed' | 'rolled') => ({
  type: 'phone' as const,
  os: 'ios' as const,
  tap: likes === 'guess' ? { x: 0.2, y: 0.3 } : undefined,
  screen: {
    kind: 'app' as const,
    title: 'Feed',
    icon: '📰',
    items: [
      {
        id: 'post',
        label: 'Ana: we ship Friday 🚀',
        icon: likes === 'rolled' ? '🤍' : '❤️',
        sub: likes === 'rolled' ? '42 likes' : '43 likes',
        tone: likes === 'guess' ? ('good' as const) : likes === 'failed' ? ('bad' as const) : undefined,
      },
      { id: 'p2', label: 'Sam: new office dog', icon: '🤍', sub: '12 likes' },
      { id: 'p3', label: 'Lee: lunch at noon?', icon: '🤍', sub: '3 likes' },
    ],
    toast: likes === 'guess' ? 'Saving…' : likes === 'failed' ? '❌ Server said 500' : "Couldn't like. Try again.",
  },
  caption: likes === 'guess' ? 'no spinner, no wait' : likes === 'failed' ? 'the guess was wrong' : 'back to the truth',
});

/* ── Stale-while-revalidate ───────────────────────────────────── */

const inboxQuery = `useQuery({
  queryKey: ['inbox'],
  queryFn: getInbox,
  staleTime: 60_000,
});`;

const sendMail = `async function send(mail) {
  await postMail(mail);
  qc.invalidateQueries({
    queryKey: ['inbox'],
  });
}`;

const focusQuiz = {
  type: 'quiz' as const,
  question: 'Your data is stale. You switch back to the tab. What happens?',
  options: ['Spinner until it reloads', 'Old data now, refetch quietly'],
  answer: 1,
};

/* ── Race conditions ──────────────────────────────────────────── */

const racySearch = `function Search({ query }) {
  const [results, setResults] =
    useState([]);

  useEffect(() => {
    fetch(\`/search?q=\${query}\`)
      .then((r) => r.json())
      .then(setResults);
  }, [query]);
}`;

const abortSearch = `useEffect(() => {
  const ctrl = new AbortController();
  fetch(\`/search?q=\${query}\`, {
    signal: ctrl.signal,
  })
    .then((r) => r.json())
    .then(setResults)
    .catch((e) => {
      if (e.name !== 'AbortError')
        setError(e);
    });
  return () => ctrl.abort();
}, [query]);`;

export const series: Series = {
  id: 'eng-state-data',
  title: 'State & data fetching',
  emoji: '🗂️',
  color: '#34d399',
  order: 3,
  blurb: 'Server state, caches, optimistic UI and the races hiding in your fetches.',
  reels: [
    {
      id: 'data-server-vs-client-state',
      title: 'Server state vs client state',
      beats: [
        {
          say: "The data from your API isn't really your state. Here's why.",
          scene: {
            type: 'title',
            kicker: 'State & data',
            title: "Your API data isn't *your* state",
            emoji: '🗂️',
            style: 'slam',
          },
          sfx: 'whoosh',
          emphasis: ["isn't", 'state'],
        },
        {
          say: 'Most apps start like this. An effect fetches the user, and useState holds the data and a loading flag.',
          speak: 'Most apps start like this. An effect fetches the user, and use state holds the data and a loading flag.',
          scene: { type: 'code', lang: 'tsx', file: 'Profile.tsx', code: effectFetch, highlight: [[7, 12]] },
          sfx: 'type',
          emphasis: ['effect', 'loading'],
        },
        {
          say: 'But that user lives on a server. Other people can change it, and your copy goes out of date silently.',
          scene: {
            type: 'compare',
            title: 'Two kinds of state',
            left: { title: 'Client state', verdict: 'neutral', icon: '🎛️', items: ['Is the modal open?', 'Text in a form', 'Only you change it'] },
            right: { title: 'Server state', verdict: 'neutral', icon: '☁️', items: ['A user, a cart, a feed', 'Others change it', 'Goes out of date'] },
          },
          sfx: 'swipe',
          emphasis: ['server', 'silently'],
        },
        {
          say: 'So the hand-rolled effect misses the hard parts. Caching, deduping, knowing when data is stale, and retries.',
          scene: fourGaps(0),
          sfx: 'pop',
          emphasis: ['hard', 'stale'],
        },
        {
          say: 'TanStack Query adds one shared cache. Two components ask for the same key, and only one request goes out.',
          speak: 'Tan-Stack Query adds one shared cache. Two components ask for the same key, and only one request goes out.',
          scene: {
            type: 'diagram',
            title: 'One cache, many readers',
            cols: 3,
            rows: 4,
            nodes: [
              { id: 'header', label: 'Header', icon: '🧢', sub: 'needs user 7', x: 0, y: 0 },
              { id: 'profile', label: 'Profile', icon: '👤', sub: 'needs user 7', x: 2, y: 0 },
              { id: 'cache', label: 'Query cache', icon: '🗃️', sub: "['user', 7]", x: 1, y: 1.5, active: true },
              { id: 'api', label: 'API', icon: '🌐', sub: '1 request', x: 1, y: 3, tone: 'info' },
            ],
            edges: [
              { from: 'header', to: 'cache' },
              { from: 'profile', to: 'cache' },
              { from: 'cache', to: 'api', active: true },
            ],
            packets: [{ from: 'cache', to: 'api', label: 'GET', tone: 'accent' }],
            caption: 'same key, one request',
          },
          sfx: 'swipe',
          emphasis: ['shared', 'one'],
        },
        {
          say: 'Your code shrinks to this. The query key names the data, and the query function knows how to fetch it.',
          scene: {
            type: 'code',
            lang: 'tsx',
            file: 'Profile.tsx',
            code: withQuery,
            highlight: [4],
            note: { line: 4, text: 'the address in the cache', tone: 'accent' },
          },
          sfx: 'type',
          emphasis: ['key', 'fetch'],
        },
        {
          say: 'By default, cached data counts as stale right away. It refetches quietly on mount, window focus, or reconnect.',
          scene: {
            type: 'timeline',
            title: 'Life of a query',
            steps: [
              { label: 'Fetch', sub: 'first mount', icon: '📡' },
              { label: 'Fresh', sub: 'for staleTime (0)', icon: '🟢' },
              { label: 'Stale', sub: 'still shown', icon: '🟡', tone: 'accent' },
              { label: 'Refetch', sub: 'focus, mount, reconnect', icon: '🔄' },
            ],
            active: 2,
          },
          sfx: 'swipe',
          emphasis: ['stale', 'quietly'],
        },
        {
          say: 'Quick check. The text in a search box. Server state, or client state?',
          scene: textQuiz,
          sfx: 'riser',
          emphasis: ['search'],
        },
        {
          say: 'Client state. You own it, nobody else changes it, and it never goes stale.',
          scene: { ...textQuiz, reveal: true, explain: 'Only you change it, so plain useState is the right home.' },
          sfx: 'ding',
          emphasis: ['own', 'never'],
        },
        {
          say: "Remember this. Server state is a cache of someone else's data. Use a tool built for caches.",
          scene: {
            type: 'outro',
            points: ['Client state: you *own* it', 'Server state: a *cache* of remote data', 'Name it with a key, let the tool refetch'],
            tagline: "Cache it. Don't own it.",
          },
          sfx: 'success',
          emphasis: ['cache', 'tool'],
        },
      ],
    },
    {
      id: 'data-optimistic-rollback',
      title: 'Optimistic updates with rollback',
      beats: [
        {
          say: 'The fastest apps update the screen before the server even answers.',
          scene: {
            type: 'title',
            kicker: 'Optimistic UI',
            title: 'Update first. *Ask* later.',
            emoji: '⚡',
            style: 'stack',
          },
          sfx: 'whoosh',
          emphasis: ['before', 'answers'],
        },
        {
          say: 'You tap like. The heart fills and the count jumps to 43, while the request is still in flight.',
          scene: feed('guess'),
          sfx: 'pop',
          emphasis: ['43', 'flight'],
        },
        {
          say: 'With TanStack Query, onMutate runs first. It saves a snapshot of the cache, then writes your guess into it.',
          speak: 'With Tan-Stack Query, on mutate runs first. It saves a snapshot of the cache, then writes your guess into it.',
          scene: {
            type: 'code',
            lang: 'ts',
            file: 'useLike.ts',
            code: onMutate,
            highlight: [[7, 8]],
            note: { line: 8, text: 'the cache now says 43', tone: 'accent' },
          },
          sfx: 'type',
          emphasis: ['snapshot', 'guess'],
        },
        {
          say: "Before that, it cancels any refetch in flight, so an old response can't land on top of your guess.",
          scene: {
            type: 'code',
            lang: 'ts',
            file: 'useLike.ts',
            code: onMutate,
            highlight: [[4, 6]],
            note: { line: 6, text: 'no stale refetch can win', tone: 'warn' },
          },
          sfx: 'click',
          emphasis: ['cancels', 'old'],
        },
        {
          say: "Now the server says no. Maybe you're offline, or the post was deleted.",
          scene: feed('failed'),
          sfx: 'error',
          emphasis: ['no', 'offline'],
        },
        {
          say: 'So onError puts the snapshot back. The heart empties, and the count drops to 42.',
          speak: 'So on error puts the snapshot back. The heart empties, and the count drops to 42.',
          scene: {
            type: 'code',
            lang: 'ts',
            file: 'useLike.ts',
            code: onError,
            highlight: [[4, 6]],
            note: { line: 6, text: 'snapshot goes back in', tone: 'bad' },
          },
          sfx: 'type',
          emphasis: ['snapshot', 'back'],
        },
        {
          say: 'Tell the user too. A silent rollback just looks like a bug.',
          scene: feed('rolled'),
          sfx: 'swipe',
          emphasis: ['silent', 'bug'],
        },
        {
          say: "Win or lose, onSettled refetches from the server. The server's answer always gets the last word.",
          speak: "Win or lose, on settled refetches from the server. The server's answer always gets the last word.",
          scene: {
            type: 'diagram',
            title: 'Guess, then confirm',
            cols: 3,
            rows: 4,
            nodes: [
              { id: 'ui', label: 'Screen', icon: '📱', sub: 'shows the cache', x: 0, y: 0 },
              { id: 'cache', label: 'Cache', icon: '🗃️', sub: 'guess: 43', x: 2, y: 0, tone: 'warn' },
              { id: 'server', label: 'Server', icon: '🌐', sub: 'the real count', x: 1, y: 3, active: true },
            ],
            edges: [
              { from: 'cache', to: 'ui', label: 'instant' },
              { from: 'ui', to: 'server', dashed: true },
              { from: 'server', to: 'cache', label: 'refetch', active: true },
            ],
            packets: [{ from: 'server', to: 'cache', label: 'truth', tone: 'good' }],
            caption: 'the server has the last word',
          },
          sfx: 'swipe',
          emphasis: ['refetches', 'last'],
        },
        {
          say: 'Go optimistic when failure is rare and easy to undo. For payments, wait for the server.',
          scene: {
            type: 'compare',
            title: 'When to guess',
            left: { title: 'Optimistic', verdict: 'ok', icon: '⚡', items: ['Likes, toggles, reorders', 'Rarely fails', 'Easy to undo'] },
            right: { title: 'Wait', verdict: 'bad', icon: '⏳', items: ['Payments', 'Taken usernames', 'Hard to undo'] },
          },
          sfx: 'swipe',
          emphasis: ['rare', 'payments'],
        },
        {
          say: 'Remember this. Snapshot first, show the guess, and keep the snapshot until the server agrees.',
          scene: {
            type: 'outro',
            points: ['Cancel refetches, then *snapshot*', 'Roll back in onError', 'Always refetch when it settles'],
            tagline: 'Guess fast. Undo honestly.',
          },
          sfx: 'success',
          emphasis: ['snapshot', 'agrees'],
        },
      ],
    },
    {
      id: 'data-stale-while-revalidate',
      title: 'Stale-while-revalidate',
      beats: [
        {
          say: 'Showing old data on purpose makes your app feel faster. Here is how.',
          scene: {
            type: 'title',
            kicker: 'Caching',
            title: 'Old data is a *feature*',
            emoji: '🥖',
            style: 'slam',
          },
          sfx: 'whoosh',
          emphasis: ['old', 'faster'],
        },
        {
          say: "You open your inbox. Yesterday's emails show instantly from the cache, while a fresh copy loads behind them.",
          scene: {
            type: 'phone',
            os: 'android',
            screen: {
              kind: 'app',
              title: 'Inbox',
              icon: '📥',
              items: [
                { id: 'm1', label: 'Your order shipped', icon: '📦', sub: 'yesterday' },
                { id: 'm2', label: 'Standup notes', icon: '📝', sub: 'yesterday' },
                { id: 'm3', label: 'Lunch on Friday?', icon: '🍜', sub: 'yesterday' },
              ],
              loading: true,
            },
            caption: 'cached rows now, fresh rows soon',
          },
          sfx: 'pop',
          emphasis: ['instantly', 'fresh'],
        },
        {
          say: 'The idea comes from an HTTP cache header. Fresh for 60 seconds, then stale but usable for five more minutes.',
          speak: 'The idea comes from an H T T P cache header. Fresh for 60 seconds, then stale but usable for five more minutes.',
          scene: {
            type: 'terminal',
            title: 'Response headers',
            lines: [
              { cmd: 'curl -I https://api.app/inbox' },
              { out: 'HTTP/2 200' },
              { out: 'cache-control: max-age=60,', tone: 'good' },
              { out: '  stale-while-revalidate=300', tone: 'accent' },
            ],
          },
          sfx: 'type',
          emphasis: ['header', 'stale'],
        },
        {
          say: 'Inside that window, you get the cached copy right now, and the refresh happens in the background.',
          scene: {
            type: 'timeline',
            title: 'One cached response',
            steps: [
              { label: 'Fresh', sub: 'first 60s: cache only', icon: '🟢', tone: 'good' },
              { label: 'Stale', sub: 'next 5 min: cache + refetch', icon: '🟡', tone: 'accent' },
              { label: 'Expired', sub: 'after: wait for network', icon: '🔴', tone: 'bad' },
            ],
            active: 1,
          },
          sfx: 'swipe',
          emphasis: ['now', 'background'],
        },
        {
          say: 'TanStack Query does the same in your app. staleTime says how long data counts as fresh.',
          speak: 'Tan-Stack Query does the same in your app. Stale time says how long data counts as fresh.',
          scene: {
            type: 'code',
            lang: 'ts',
            file: 'inbox.ts',
            code: inboxQuery,
            highlight: [4],
            note: { line: 4, text: 'fresh for one minute', tone: 'accent' },
          },
          sfx: 'type',
          emphasis: ['same', 'fresh'],
        },
        {
          say: "But some changes can't wait. After you send an email, mark the inbox stale yourself.",
          scene: {
            type: 'code',
            lang: 'ts',
            file: 'send.ts',
            code: sendMail,
            added: [[3, 5]],
            note: { line: 5, text: 'stale now, refetch now', tone: 'good' },
          },
          sfx: 'type',
          emphasis: ["can't", 'yourself'],
        },
        {
          say: 'Invalidation matches by key prefix. One call refreshes every inbox query, and leaves settings alone.',
          scene: {
            type: 'tree',
            title: 'invalidate inbox',
            root: {
              id: 'cache',
              label: 'Query cache',
              dim: true,
              children: [
                {
                  id: 'inbox',
                  label: 'inbox',
                  active: true,
                  dirty: true,
                  children: [
                    { id: 'unread', label: 'unread', active: true, dirty: true },
                    { id: 'thread', label: 'thread 42', active: true, dirty: true },
                  ],
                },
                { id: 'settings', label: 'settings', dim: true },
              ],
            },
            caption: 'matched by key prefix',
          },
          sfx: 'pop',
          emphasis: ['prefix', 'settings'],
        },
        {
          say: 'Quick check. Your data is stale, and you switch back to the tab. What happens?',
          scene: focusQuiz,
          sfx: 'riser',
          emphasis: ['stale', 'tab'],
        },
        {
          say: 'You see the old data instantly. A refetch runs quietly, and the screen updates when it lands.',
          scene: { ...focusQuiz, reveal: true, explain: 'Stale data still shows. Window focus starts a background refetch.' },
          sfx: 'ding',
          emphasis: ['instantly', 'quietly'],
        },
        {
          say: 'Remember this. Stale data is fine to show. Refresh it quietly, and invalidate when you know it changed.',
          scene: {
            type: 'outro',
            points: ['Show the cache *instantly*', 'Refetch in the background', 'Invalidate after you write'],
            tagline: 'Fast first. Fresh soon.',
          },
          sfx: 'success',
          emphasis: ['quietly', 'invalidate'],
        },
      ],
    },
    {
      id: 'data-fetch-race-conditions',
      title: 'Race conditions in fetching',
      beats: [
        {
          say: 'Type fast, and your search can show the wrong results.',
          scene: {
            type: 'title',
            kicker: 'Data fetching',
            title: 'Type fast, get the *wrong* results',
            emoji: '🏁',
            style: 'glitch',
          },
          sfx: 'whoosh',
          emphasis: ['fast', 'wrong'],
        },
        {
          say: 'Here is a classic search effect. Every keystroke sends a fetch, and every response sets the results.',
          scene: {
            type: 'code',
            lang: 'tsx',
            file: 'Search.tsx',
            code: racySearch,
            errors: [8],
            note: { line: 8, text: 'whoever lands last wins', tone: 'bad' },
          },
          sfx: 'type',
          emphasis: ['every', 'response'],
        },
        {
          say: 'You type re, then react. The second request comes back first. Then the slow one lands and overwrites it.',
          speak: 'You type ree, then react. The second request comes back first. Then the slow one lands and overwrites it.',
          scene: {
            type: 'timeline',
            title: 'Two keystrokes',
            steps: [
              { label: 'Send "re"', sub: 'slow: 900 ms', icon: '🐢' },
              { label: 'Send "react"', sub: 'fast: 200 ms', icon: '🐇' },
              { label: '"react" lands', sub: 'correct results', icon: '✅', tone: 'good' },
              { label: '"re" lands', sub: 'overwrites them', icon: '💥', tone: 'bad' },
            ],
            active: 3,
          },
          sfx: 'swipe',
          emphasis: ['first', 'overwrites'],
        },
        {
          say: "Now the box says react, but the list shows results for re. Nothing crashed. It's just wrong.",
          speak: "Now the box says react, but the list shows results for ree. Nothing crashed. It's just wrong.",
          scene: {
            type: 'phone',
            os: 'ios',
            screen: {
              kind: 'app',
              title: 'Search',
              icon: '🔎',
              items: [
                { id: 'q', label: 'Query', value: 'react' },
                { id: 'r1', label: 'Regex basics', icon: '📄', tone: 'bad' },
                { id: 'r2', label: 'REST API guide', icon: '📄', tone: 'bad' },
                { id: 'r3', label: 'Retro games', icon: '📄', tone: 'bad' },
              ],
            },
            caption: 'results for "re", not "react"',
          },
          sfx: 'error',
          emphasis: ['wrong'],
        },
        {
          say: 'The fix is an AbortController. Each effect run makes one, and hands its signal to fetch.',
          speak: 'The fix is an abort controller. Each effect run makes one, and hands its signal to fetch.',
          scene: {
            type: 'code',
            lang: 'tsx',
            file: 'Search.tsx',
            code: abortSearch,
            added: [2, 4],
            note: { line: 4, text: 'fetch listens to this', tone: 'good' },
          },
          sfx: 'type',
          emphasis: ['signal'],
        },
        {
          say: 'When the query changes, React runs the cleanup first and aborts the old request. That fetch rejects with an AbortError.',
          speak: 'When the query changes, React runs the cleanup first and aborts the old request. That fetch rejects with an abort error.',
          scene: {
            type: 'code',
            lang: 'tsx',
            file: 'Search.tsx',
            code: abortSearch,
            highlight: [12],
            note: { line: 12, text: 'the old request dies here', tone: 'accent' },
          },
          sfx: 'click',
          emphasis: ['cleanup', 'aborts'],
        },
        {
          say: 'So the slow request never lands. Only the latest one can set the results.',
          scene: {
            type: 'diagram',
            title: 'Only the latest lands',
            cols: 3,
            rows: 4,
            nodes: [
              { id: 'old', label: 'fetch "re"', icon: '🐢', sub: 'aborted', x: 0, y: 0, tone: 'bad', dim: true },
              { id: 'new', label: 'fetch "react"', icon: '🐇', sub: 'latest', x: 2, y: 0, active: true },
              { id: 'state', label: 'Results', icon: '📋', sub: 'setResults', x: 1, y: 3, tone: 'good' },
            ],
            edges: [
              { from: 'old', to: 'state', dashed: true, tone: 'bad' },
              { from: 'new', to: 'state', active: true },
            ],
            packets: [{ from: 'new', to: 'state', label: 'react', tone: 'good' }],
            caption: 'aborted requests never set state',
          },
          sfx: 'swipe',
          emphasis: ['never', 'latest'],
        },
        {
          say: "An ignore flag also drops the stale result. But abort goes further, and stops the download you don't need.",
          scene: {
            type: 'compare',
            title: 'Two ways to fix it',
            left: { title: 'ignore flag', verdict: 'neutral', items: ['Drops stale results', 'Request keeps going'] },
            right: { title: 'abort()', verdict: 'ok', items: ['Drops stale results', 'Cancels the request'] },
          },
          sfx: 'swipe',
          emphasis: ['ignore', 'abort'],
        },
        {
          say: 'Remember this. Responses can arrive in any order. Abort the old request in cleanup, so only the latest one wins.',
          scene: {
            type: 'outro',
            points: ['Responses arrive in *any* order', 'Abort the old one in cleanup', 'Skip AbortError, handle the rest'],
            tagline: 'Latest request wins.',
          },
          sfx: 'success',
          emphasis: ['order', 'latest'],
        },
      ],
    },
  ],
};
