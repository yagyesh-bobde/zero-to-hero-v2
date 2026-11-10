// Placeholder. The UI shell thread replaces this file (see src/dsa/AUTHORING.md § Ownership).
import { modules, parts } from './course';

export default function App() {
  return (
    <main style={{ fontFamily: 'Inter, sans-serif', maxWidth: 720, margin: '0 auto', padding: '32px 16px', color: '#f0efed', background: '#141416', minHeight: '100vh' }}>
      <h1>DSA — Zero to Hero</h1>
      <p>The course is being built right now. Roadmap:</p>
      {parts.map((part) => (
        <section key={part.id}>
          <h2>{part.title}</h2>
          <ol>
            {modules
              .filter((m) => m.part === part.id)
              .map((m) => (
                <li key={m.id} value={m.number}>
                  <strong>{m.title}</strong> — {m.tagline} {m.draft ? '(coming soon)' : ''}
                </li>
              ))}
          </ol>
        </section>
      ))}
    </main>
  );
}
