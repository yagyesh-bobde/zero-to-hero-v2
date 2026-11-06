import { Fragment, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { sound } from '../sfx';
import type { Tone } from '../types';

export const toneClass = (tone: Tone | undefined, fallback: Tone | '' = '') =>
  tone || fallback ? `tone-${tone ?? fallback}` : '';

/** "Use *this* word" → accent-coloured <em>. */
export function stars(text: string): ReactNode {
  return text.split(/(\*[^*]+\*)/g).map((part, i) =>
    part.startsWith('*') && part.endsWith('*') && part.length > 2 ? (
      <em key={i}>{part.slice(1, -1)}</em>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
}

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/**
 * Types `target` out character by character. When the target changes, the shared
 * prefix stays put and only the new tail is typed. Pauses with playback.
 */
export function useTyping(target: string, playing: boolean, charsPerSecond = 90, ticks = true) {
  const [typed, setTyped] = useState(() => (prefersReducedMotion() ? target.length : 0));
  const previous = useRef(target);
  useEffect(() => {
    const old = previous.current;
    previous.current = target;
    if (old !== target) {
      let common = 0;
      while (common < old.length && common < target.length && old[common] === target[common])
        common++;
      setTyped((n) => Math.min(n, common));
    }
  }, [target]);
  useEffect(() => {
    if (!playing || typed >= target.length) return;
    if (prefersReducedMotion()) {
      setTyped(target.length);
      return;
    }
    let frame = 0;
    let last = performance.now();
    let carry = 0;
    const step = (now: number) => {
      carry += ((now - last) / 1000) * charsPerSecond;
      last = now;
      const add = Math.floor(carry);
      if (add > 0) {
        carry -= add;
        if (ticks) sound.tick();
        setTyped((n) => Math.min(target.length, n + add));
      }
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [playing, typed >= target.length, target, charsPerSecond, ticks]);
  return Math.min(typed, target.length);
}

/** Counts a number up from 0 when `value` changes. */
export function useCountUp(value: number, decimals: number, ms = 1100) {
  const [shown, setShown] = useState(() => (prefersReducedMotion() ? value : 0));
  const from = useRef(0);
  useEffect(() => {
    if (prefersReducedMotion()) {
      setShown(value);
      return;
    }
    const start = performance.now();
    const origin = from.current;
    let frame = 0;
    const step = (now: number) => {
      const p = Math.min(1, (now - start) / ms);
      const eased = 1 - (1 - p) ** 4;
      const v = origin + (value - origin) * eased;
      setShown(v);
      if (p < 1) frame = requestAnimationFrame(step);
      else from.current = value;
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [value, ms]);
  return shown.toFixed(decimals);
}

export function SceneTitle({ children }: { children?: string }) {
  if (!children) return null;
  return (
    <h2 className="scene-title" key={children}>
      {stars(children)}
    </h2>
  );
}
