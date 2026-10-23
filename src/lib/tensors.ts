export type Matrix = number[][];
export interface DenseResult {
  logits: Matrix;
  probs: Matrix;
  loss: number;
  dLogits: Matrix;
  dW: Matrix;
  dX: Matrix;
  db: number[];
}
/** One batched dense classifier, with manual reverse-mode gradients. Loss is the batch mean. */
export function denseClassifier(X: Matrix, W: Matrix, b: number[], targets: number[]): DenseResult {
  const B = X.length,
    D = W.length,
    C = b.length;
  const logits = X.map((row) =>
    b.map((bias, c) => bias + row.reduce((s, x, d) => s + x * W[d][c], 0)),
  );
  const probs = logits.map((row) => {
    const max = Math.max(...row);
    const ex = row.map((x) => Math.exp(x - max));
    const sum = ex.reduce((s, x) => s + x, 0);
    return ex.map((x) => x / sum);
  });
  const loss =
    logits.reduce((s, row, i) => {
      const max = Math.max(...row);
      return s + max + Math.log(row.reduce((n, x) => n + Math.exp(x - max), 0)) - row[targets[i]];
    }, 0) / B;
  const dLogits = probs.map((row, i) => row.map((p, c) => (p - (c === targets[i] ? 1 : 0)) / B));
  const dW = Array.from({ length: D }, (_, d) =>
    Array.from({ length: C }, (_, c) => X.reduce((s, row, i) => s + row[d] * dLogits[i][c], 0)),
  );
  const dX = X.map((_, i) => W.map((row) => row.reduce((s, w, c) => s + dLogits[i][c] * w, 0)));
  const db = b.map((_, c) => dLogits.reduce((s, row) => s + row[c], 0));
  return { logits, probs, loss, dLogits, dW, dX, db };
}
