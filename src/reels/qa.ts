// Deterministic QA mode, used only by scripts/reels-qa.mjs:
//   /react-native-reels?qa&beat=2&t=1200#/reel/<id>
// Jumps straight to a beat, freezes the clock and every animation `t` ms into
// it, mutes audio and exposes `window.__reelsQA`. Never active for normal users.

export interface QaPosition {
  beat: number;
  /** Milliseconds into the beat. */
  t: number;
}

export interface QaApi {
  ready: boolean;
  beat: number;
  t: number;
  /** Move to another beat/time; resolves once the frame is frozen and fonts are loaded. */
  seek: (beat: number, t: number) => Promise<void>;
}

declare global {
  interface Window {
    __reelsQA?: QaApi;
  }
}

const params = typeof window === 'undefined' ? null : new URLSearchParams(window.location.search);

export const QA = params?.has('qa') ?? false;

export const qaInitial = (): QaPosition => ({
  beat: Math.max(0, Number(params?.get('beat')) || 0),
  t: Math.max(0, Number(params?.get('t')) || 0),
});

export const qaApi = (): QaApi =>
  (window.__reelsQA ??= { ready: false, beat: 0, t: 0, seek: () => Promise.resolve() });

/** Reel-clock time (ms) at which each animation started; new ones start at the current beat. */
const started = new WeakMap<Animation, number>();

/** Pause every animation under `root` and seek it to reel time `beatStart + t` (ms). */
export function freezeAnimations(root: Element, beatStart: number, t: number) {
  for (const animation of root.getAnimations({ subtree: true })) {
    let start = started.get(animation);
    if (start === undefined) {
      start = beatStart;
      started.set(animation, start);
    }
    animation.pause();
    animation.currentTime = Math.max(0, beatStart + t - start);
  }
}
