import { useState } from 'react';
import { Search } from 'lucide-react';
import { coursePatterns } from './data';
import { plainText } from './inline';
import { PatternCardView } from './ModulePage';

const examples = ['sorted array', 'subarray sum', 'k most frequent', 'shortest path', 'all combinations', 'next greater'];

const stem = (w: string) => (w.length > 4 ? w.replace(/(ing|ed|es|s)$/, '') : w);

/**
 * Ranks pattern cards by how many query words appear in their name, signals or template.
 * Words are loosely stemmed ("sorted" matches "sort"). With 2+ words, a card may miss one.
 */
export function matchPatterns<T extends { card: { name: string; signals: string[]; template: string } }>(list: T[], query: string): T[] {
  const words = [...new Set(query.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 1).map(stem))];
  if (words.length === 0) return list;
  const need = words.length === 1 ? 1 : words.length - 1;
  return list
    .map((entry) => {
      const name = entry.card.name.toLowerCase();
      const signals = entry.card.signals.map(plainText).join(' ').toLowerCase();
      const hay = `${name} ${signals} ${entry.card.template.toLowerCase()}`;
      const hits = words.filter((w) => hay.includes(w)).length;
      const score = hits * 10 + words.filter((w) => name.includes(w)).length * 3 + words.filter((w) => signals.includes(w)).length * 2;
      return { entry, hits, score };
    })
    .filter((s) => s.hits >= need)
    .sort((a, b) => b.score - a.score)
    .map((s) => s.entry);
}

export default function PatternsPage() {
  const [query, setQuery] = useState('');
  const list = matchPatterns(coursePatterns, query);
  return (
    <div className="dsa-page is-wide">
      <header className="dsa-page-head">
        <span className="dsa-eyebrow">Pattern finder</span>
        <h1>Which pattern fits this problem?</h1>
        <p className="dsa-lede">Type the words you notice in a problem statement. The patterns whose signals match come first.</p>
      </header>
      {coursePatterns.length > 0 ? (
        <>
          <div className="dsa-finder">
            <label className="dsa-search is-lg">
              <Search size={18} aria-hidden="true" />
              <span className="dsa-sr">Describe the problem</span>
              <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="e.g. sorted array, target sum" />
            </label>
            <div className="dsa-finder-examples">
              <span>Try</span>
              {examples.map((ex) => (
                <button key={ex} type="button" className="dsa-chip-link" onClick={() => setQuery(ex)}>
                  {ex}
                </button>
              ))}
            </div>
          </div>
          <p className="dsa-count" aria-live="polite">
            {query.trim() ? `${list.length} of ${coursePatterns.length} patterns match` : `${coursePatterns.length} patterns`}
          </p>
          {list.length > 0 ? (
            <div className="dsa-pattern-list is-grid">
              {list.map(({ card, module }) => (
                <PatternCardView key={`${module.id}-${card.name}`} card={card} module={module} collapsible />
              ))}
            </div>
          ) : (
            <div className="dsa-empty">
              <strong>No pattern matches those words.</strong>
              <p>Describe what the input looks like (sorted, grid, string, intervals) or what you must find (shortest, all, count, max).</p>
            </div>
          )}
        </>
      ) : (
        <div className="dsa-empty">
          <strong>Patterns appear as modules are published.</strong>
          <p>Each module ends with pattern cards. They all collect here.</p>
        </div>
      )}
    </div>
  );
}
