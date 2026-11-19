import { describe, expect, it } from 'vitest';
import { summarize, validComment } from './reviews';

describe('avis', () => {
  it('calcule la moyenne arrondie à une décimale', () => {
    expect(summarize([{ rating: 5 }, { rating: 4 }, { rating: 5 }])).toEqual({ average: 4.7, count: 3 });
    expect(summarize([])).toEqual({ average: 0, count: 0 });
  });
  it('valide la longueur du commentaire', () => {
    expect(validComment('ok')).toBe(false);
    expect(validComment(' Très bien ')).toBe(true);
    expect(validComment('x'.repeat(1001))).toBe(false);
  });
});
