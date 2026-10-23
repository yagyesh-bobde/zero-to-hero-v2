import { Fragment } from 'react';
export function InlineText({ text }: { text: string }) {
  return (
    <>
      {text
        .split(/(`[^`]+`|\*\*[^*]+\*\*)/g)
        .map((part, i) =>
          part.startsWith('`') ? (
            <code key={i}>{part.slice(1, -1)}</code>
          ) : part.startsWith('**') ? (
            <strong key={i}>{part.slice(2, -2)}</strong>
          ) : (
            <Fragment key={i}>{part}</Fragment>
          ),
        )}
    </>
  );
}
export default function RichText({ text }: { text: string }) {
  return (
    <>
      {text.split(/(```[\s\S]*?```)/g).map((block, i) =>
        block.startsWith('```') ? (
          <pre className="article-code" key={i}>
            <code>{block.replace(/^```\w*\n?/, '').replace(/```$/, '')}</code>
          </pre>
        ) : (
          block
            .split(/\n\n+/)
            .filter(Boolean)
            .map((p, j) =>
              p.split('\n').every((line) => /^[-•] /.test(line)) ? (
                <ul key={i + '-' + j}>
                  {p.split('\n').map((line, k) => (
                    <li key={k}>
                      <InlineText text={line.replace(/^[-•] /, '')} />
                    </li>
                  ))}
                </ul>
              ) : (
                <p key={i + '-' + j}>
                  <InlineText text={p} />
                </p>
              ),
            )
        ),
      )}
    </>
  );
}
