import { ArrowDownToLine, ArrowUpRight, Code2, FolderCode } from 'lucide-react';
import { modules } from '../data/course';
export default function Projects() {
  return (
    <section className="projects-section">
      <div className="section-heading">
        <div>
          <span className="eyebrow">PUT THE PIECES TOGETHER</span>
          <h2>Eight chapters. Eight working projects.</h2>
        </div>
        <a className="secondary-button" href="/projects/zero-to-hero-projects.zip" download>
          <ArrowDownToLine size={15} />
          Download all projects
        </a>
      </div>
      <p className="projects-description">
        Go from individual exercises to complete implementations. Each project includes a tiny
        dataset, training or evaluation, and comments that connect the code to the concepts.
      </p>
      <div className="projects-grid">
        {modules.map((m) => (
          <a key={m.id} href={'/projects/' + m.id + '.py'} download>
            <Code2 size={18} />
            <div>
              <strong>{m.id}.py</strong>
              <span>
                {['micrograd', 'bigram', 'tokenizer'].includes(m.id)
                  ? 'Pure Python · no dependencies'
                  : 'PyTorch · run locally'}
              </span>
            </div>
            <ArrowDownToLine size={14} />
          </a>
        ))}
      </div>
      <a className="project-readme" href="/projects/README.md" target="_blank" rel="noreferrer">
        <FolderCode size={15} />
        Setup instructions & project guide
        <ArrowUpRight size={13} />
      </a>
      <p className="projects-footnote">
        The full PyTorch projects run on your computer. The browser exercises above use Python’s
        standard library to keep each idea small and inspectable.
      </p>
    </section>
  );
}
