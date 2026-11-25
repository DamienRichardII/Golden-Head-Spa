import { describe, expect, it } from 'vitest';
import { EXTERNAL_REVIEWS, SOURCE_LABEL, starName } from './externalReviews';

describe('avis Google / Planity', () => {
  it('chaque avis a une source connue, une note de 1 à 5, un auteur abrégé et un texte', () => {
    expect(EXTERNAL_REVIEWS.length).toBeGreaterThan(0);
    for (const r of EXTERNAL_REVIEWS) {
      expect(Object.keys(SOURCE_LABEL)).toContain(r.source);
      expect(r.rating).toBeGreaterThanOrEqual(1);
      expect(r.rating).toBeLessThanOrEqual(5);
      if (r.source === 'google') expect(r.author).toMatch(/^\S+ \S\.$/);
      if (r.date) expect(r.date).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
      expect(r.text.trim().length).toBeGreaterThan(10);
    }
  });
  it('les avis des deux sources sont présents', () => {
    expect(EXTERNAL_REVIEWS.filter((r) => r.source === 'google')).toHaveLength(7);
    expect(EXTERNAL_REVIEWS.filter((r) => r.source === 'planity')).toHaveLength(10);
  });
  it('demi-étoiles : 4,7 donne 4 étoiles pleines et une demie', () => {
    expect([1, 2, 3, 4, 5].map((n) => starName(n, 4.7))).toEqual(['star', 'star', 'star', 'star', 'star-half']);
    expect([1, 2, 3, 4, 5].map((n) => starName(n, 5))).toEqual(['star', 'star', 'star', 'star', 'star']);
    expect(starName(1, 0.2)).toBe('star-outline');
  });
});
