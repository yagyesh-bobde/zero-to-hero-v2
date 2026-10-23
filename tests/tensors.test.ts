import { describe, it, expect } from 'vitest';
import { denseClassifier } from '../src/lib/tensors';
describe('Interactive tensor backpropagation', () => {
  const X = [
      [1, -0.5],
      [0.2, 1.5],
    ],
    W = [
      [0.3, -0.4, 0.6],
      [-0.2, 0.5, 0.1],
    ],
    b = [0.1, -0.1, 0],
    targets = [2, 0];
  it('normalizes probabilities and conserves the per-row logit gradient', () => {
    const r = denseClassifier(X, W, b, targets);
    for (const row of r.probs) expect(row.reduce((a, v) => a + v, 0)).toBeCloseTo(1, 12);
    for (const row of r.dLogits) expect(row.reduce((a, v) => a + v, 0)).toBeCloseTo(0, 12);
  });
  it('matches central differences for every weight, input, and broadcasted bias', () => {
    const out = denseClassifier(X, W, b, targets),
      h = 1e-5;
    for (const [matrix, grad] of [
      [W, out.dW],
      [X, out.dX],
    ]) {
      for (let i = 0; i < matrix.length; i++)
        for (let j = 0; j < matrix[i].length; j++) {
          const upper = matrix.map((r) => [...r]),
            lower = matrix.map((r) => [...r]);
          upper[i][j] += h;
          lower[i][j] -= h;
          const numeric =
            matrix === W
              ? (denseClassifier(X, upper, b, targets).loss -
                  denseClassifier(X, lower, b, targets).loss) /
                (2 * h)
              : (denseClassifier(upper, W, b, targets).loss -
                  denseClassifier(lower, W, b, targets).loss) /
                (2 * h);
          expect(grad[i][j]).toBeCloseTo(numeric, 8);
        }
    }
    for (let c = 0; c < b.length; c++) {
      const upper = [...b],
        lower = [...b];
      upper[c] += h;
      lower[c] -= h;
      expect(out.db[c]).toBeCloseTo(
        (denseClassifier(X, W, upper, targets).loss - denseClassifier(X, W, lower, targets).loss) /
          (2 * h),
        8,
      );
    }
  });
  it('keeps loss and softmax finite for large finite logits', () => {
    const r = denseClassifier(
      [[1000, 1000]],
      [
        [100, -100, 0],
        [100, -100, 0],
      ],
      [0, 0, 0],
      [1],
    );
    expect(Number.isFinite(r.loss)).toBe(true);
    expect(r.probs.flat().every(Number.isFinite)).toBe(true);
    expect(r.loss).toBeCloseTo(400000);
  });
});
