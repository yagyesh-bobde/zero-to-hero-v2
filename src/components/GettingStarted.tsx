import { ArrowRight, Code2 } from 'lucide-react';
export default function GettingStarted() {
  return (
    <section className="getting-started">
      <div className="section-heading">
        <div>
          <span className="eyebrow">YOUR FIRST FIVE MINUTES</span>
          <h2>A little groundwork goes a long way.</h2>
        </div>
      </div>
      <p>Start with these four ideas. You can revisit the glossary whenever a new term appears.</p>
      <div className="getting-started-grid">
        <div>
          <span>01</span>
          <h3>Read the Python</h3>
          <p>
            <code>x = 2</code> gives a number a name. <code>x ** 2</code> squares it. A function
            starts with <code>def</code>, and indented lines belong to it. <code>return</code> sends
            its result back.
          </p>
        </div>
        <div>
          <span>02</span>
          <h3>Think in lists</h3>
          <p>
            <code>[2, -1]</code> is a list of two inputs. Indexing starts at zero, so{' '}
            <code>inputs[0]</code> is the first one. <code>zip(inputs, weights)</code> pairs them
            up; a loop visits each pair.
          </p>
        </div>
        <div>
          <span>03</span>
          <h3>Read the shapes</h3>
          <p>
            A tensor is a grid of numbers. <code>(B, T, C)</code> means batch size, time positions,
            and feature channels. A matrix with shape <code>(2, 3)</code> has two rows and three
            columns.
          </p>
        </div>
        <div>
          <span>04</span>
          <h3>Follow one small change</h3>
          <p>
            A model makes a guess. The loss scores the mistake. A gradient tells us how a tiny
            change to a weight affects that score. Training takes many small steps toward better
            guesses.
          </p>
        </div>
      </div>
      <a className="secondary-button" href="#/playground/python">
        <Code2 size={15} />
        Run your first Python snippet
        <ArrowRight size={14} />
      </a>
    </section>
  );
}
