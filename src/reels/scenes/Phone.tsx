import { useLayoutEffect, useRef } from 'react';
import type { CSSProperties, RefObject } from 'react';
import type { PhoneItem, PhoneNotice, PhoneScene, PhoneScreen } from '../types';
import { prefersReducedMotion, toneClass } from './shared';

/** FLIP: rows that keep their id glide from their old position to the new one. */
function useFlip(container: RefObject<HTMLElement | null>, signature: string) {
  const rects = useRef(new Map<string, number>());
  useLayoutEffect(() => {
    const el = container.current;
    if (!el) return;
    const rows = Array.from(el.querySelectorAll<HTMLElement>('[data-flip]'));
    const next = new Map<string, number>();
    for (const row of rows) {
      const id = row.dataset.flip ?? '';
      const top = row.offsetTop;
      next.set(id, top);
      const before = rects.current.get(id);
      if (before !== undefined && before !== top && !prefersReducedMotion())
        row.animate([{ transform: `translateY(${before - top}px)` }, { transform: 'none' }], {
          duration: 520,
          easing: 'cubic-bezier(.2,.9,.25,1.15)',
        });
    }
    rects.current = next;
  }, [signature, container]);
}

const DEFAULT_APPS = [
  { icon: '💬', label: 'Messages' },
  { icon: '📷', label: 'Camera' },
  { icon: '🗺️', label: 'Maps' },
  { icon: '🎵', label: 'Music' },
  { icon: '⚙️', label: 'Settings' },
  { icon: '📅', label: 'Calendar' },
  { icon: '🛒', label: 'Shop' },
  { icon: '🌤️', label: 'Weather' },
];

function AppScreen({ screen }: { screen: Extract<PhoneScreen, { kind: 'app' }> }) {
  const list = useRef<HTMLDivElement>(null);
  const items = screen.items ?? [];
  useFlip(list, items.map((item) => item.id ?? item.label).join('|'));
  return (
    <div className="ph-app">
      <div className="ph-appbar">
        {screen.icon && <span className="ph-appicon">{screen.icon}</span>}
        <strong key={screen.title}>{screen.title}</strong>
      </div>
      {screen.body && <p className="ph-body" key={screen.body}>{screen.body}</p>}
      <div className="ph-list" ref={list}>
        {items.map((item, i) => (
          <Row key={item.id ?? item.label} item={item} index={i} />
        ))}
      </div>
      {screen.button && <button className="ph-button" tabIndex={-1} type="button">{screen.button}</button>}
      {screen.loading && <div className="ph-spinner" />}
      {screen.toast && <div className="ph-toast" key={screen.toast}>{screen.toast}</div>}
    </div>
  );
}

function Row({ item, index }: { item: PhoneItem; index: number }) {
  return (
    <div className={`ph-row ${toneClass(item.tone)}`} data-flip={item.id ?? item.label} style={{ '--i': index } as CSSProperties}>
      {item.checked !== undefined && <span className={`ph-check ${item.checked ? 'is-on' : ''}`} />}
      {item.icon && <span className="ph-row-icon">{item.icon}</span>}
      <div className="ph-row-text">
        <span className="ph-row-label" key={item.label}>{item.label}</span>
        {item.sub && <span className="ph-row-sub">{item.sub}</span>}
      </div>
      {item.value !== undefined && (
        <span className={`ph-input ${item.value ? '' : 'is-empty'}`} key={`v:${item.value}`}>
          {item.value || 'note…'}
        </span>
      )}
    </div>
  );
}

function Notice({ notice, i = 0 }: { notice: PhoneNotice; i?: number }) {
  return (
    <div className="ph-notice" style={{ '--i': i } as CSSProperties}>
      <span className="ph-notice-icon">{notice.icon ?? '🔔'}</span>
      <div>
        <div className="ph-notice-app">{notice.app} · now</div>
        <strong>{notice.title}</strong>
        {notice.body && <p>{notice.body}</p>}
      </div>
    </div>
  );
}

function Home({ apps = DEFAULT_APPS, highlight }: { apps?: { icon: string; label: string }[]; highlight?: string }) {
  return (
    <div className="ph-home">
      <div className="ph-grid">
        {apps.map((app, i) => (
          <div key={app.label} className={`ph-home-app ${highlight === app.label ? 'is-hl' : ''}`} style={{ '--i': i } as CSSProperties}>
            <span>{app.icon}</span>
            <small>{app.label}</small>
          </div>
        ))}
      </div>
      <div className="ph-dock">
        {['📞', '🧭', '✉️', '🎧'].map((icon) => (
          <span key={icon}>{icon}</span>
        ))}
      </div>
    </div>
  );
}

function Lock({ time = '9:41', notices = [] }: { time?: string; notices?: PhoneNotice[] }) {
  return (
    <div className="ph-lock">
      <div className="ph-lock-date">Thursday, 5 November</div>
      <div className="ph-lock-time">{time}</div>
      <div className="ph-lock-stack">
        {notices.map((notice, i) => (
          <Notice key={`${notice.app}:${notice.title}`} notice={notice} i={i} />
        ))}
      </div>
    </div>
  );
}

function FakeApp() {
  return (
    <div className="ph-app ph-fake">
      <div className="ph-appbar">
        <span className="ph-appicon">📱</span>
        <strong>Your app</strong>
      </div>
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="ph-skeleton" />
      ))}
    </div>
  );
}

function Behind({ kind }: { kind?: 'home' | 'lock' | 'app' }) {
  if (kind === 'lock') return <Lock />;
  if (kind === 'app') return <FakeApp />;
  return <Home />;
}

function Screen({ screen }: { screen: PhoneScreen }) {
  switch (screen.kind) {
    case 'app':
      return <AppScreen screen={screen} />;
    case 'home':
      return <Home apps={screen.apps} highlight={screen.highlight} />;
    case 'lock':
      return <Lock time={screen.time} notices={screen.notices} />;
    case 'notification':
      return (
        <>
          <Behind kind={screen.behind} />
          <div className="ph-banner" key={screen.notice.title}>
            <Notice notice={screen.notice} />
          </div>
        </>
      );
    case 'bubble':
      return (
        <>
          <Behind kind={screen.behind ?? 'app'} />
          <div className="ph-bubble">
            <span className="ph-bubble-head">{screen.icon ?? '💬'}</span>
            {screen.text && <span className="ph-bubble-text" key={screen.text}>{screen.text}</span>}
          </div>
        </>
      );
    case 'permission':
      return (
        <>
          <FakeApp />
          <div className="ph-scrim" />
          <div className="ph-dialog">
            <span className="ph-dialog-icon">{screen.icon ?? '🔐'}</span>
            <p>
              <strong>{screen.app}</strong> {screen.text}
            </p>
            <div className="ph-dialog-actions">
              <span className={screen.choice === 'allow' ? 'is-chosen' : ''}>{screen.allow ?? 'Allow'}</span>
              <span className={screen.choice === 'deny' ? 'is-chosen is-deny' : ''}>{screen.deny ?? 'Don’t allow'}</span>
            </div>
          </div>
        </>
      );
    case 'killed':
      return (
        <div className="ph-killed">
          <div className="ph-recents-card">
            <span>{screen.icon ?? '📱'}</span>
            <strong>{screen.app}</strong>
          </div>
          <div className="ph-killed-label">
            <span>✕</span> {screen.reason ?? 'Process killed'}
          </div>
        </div>
      );
    case 'crash':
      return (
        <>
          <FakeApp />
          <div className="ph-scrim" />
          <div className="ph-dialog ph-crash">
            <span className="ph-dialog-icon">💥</span>
            <p>
              <strong>{screen.app} keeps stopping</strong>
              {screen.message && <code>{screen.message}</code>}
            </p>
            <div className="ph-dialog-actions">
              <span>App info</span>
              <span>Close app</span>
            </div>
          </div>
        </>
      );
    case 'splash':
      return (
        <div className="ph-splash">
          <span>{screen.icon ?? '🚀'}</span>
          <strong>{screen.app}</strong>
        </div>
      );
  }
}

export function Phone({ scene }: { scene: PhoneScene }) {
  const os = scene.os ?? 'ios';
  const tap = scene.tap;
  return (
    <div className="scene-phone">
      <div className={`phone phone-${os}`}>
        <div className="phone-screen">
          <div className="phone-status">
            <span>9:41</span>
            <span className="phone-notch" />
            <span>▮▮▮ ◔</span>
          </div>
          <div className="phone-content" key={scene.screen.kind}>
            <Screen screen={scene.screen} />
          </div>
          {tap && (
            <span
              className="phone-tap"
              key={`${tap.x}:${tap.y}:${JSON.stringify(scene.screen).length}`}
              style={{ left: `${tap.x * 100}%`, top: `${tap.y * 100}%` }}
            />
          )}
        </div>
      </div>
      {scene.caption && <p className="scene-caption phone-caption" key={scene.caption}>{scene.caption}</p>}
    </div>
  );
}
