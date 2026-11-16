import { describe, expect, it } from 'vitest';
import { discountForVisit, loyaltyFor, loyaltyLabel, phoneKey, type HistoryRow } from './loyalty';

const row = (d: string, phone = '06 12 34 56 78', email: string | null = null): HistoryRow => ({ starts_at: `${d}T10:00:00Z`, customer_phone: phone, customer_email: email });

describe('programme fidélité', () => {
  it('applique les paliers 3e/4e/5e', () => {
    expect([1, 2, 3, 4, 5, 9].map(discountForVisit)).toEqual([0, 0, 10, 15, 20, 20]);
  });
  it('reconnaît une cliente par téléphone, quelle que soit la forme', () => {
    expect(phoneKey('+33 6 12 34 56 78')).toBe(phoneKey('0612345678'));
    expect(phoneKey('12')).toBe('');
  });
  it('numérote d’après les rendez-vous confirmés antérieurs', () => {
    const h = [row('2026-01-10'), row('2026-02-10', '+33612345678'), row('2026-01-15', '0699999999')];
    expect(loyaltyFor(row('2026-03-10'), h)).toEqual({ visit: 3, percent: 10 });
    expect(loyaltyFor(row('2026-01-10'), h)).toEqual({ visit: 1, percent: 0 });
  });
  it('rapproche aussi par e-mail et ignore les homonymes sans identifiant commun', () => {
    const h = [row('2026-01-10', '0600000001', 'A@x.fr'), row('2026-02-10', '0600000002', 'a@x.fr')];
    expect(loyaltyFor(row('2026-03-10', '0600000003', 'a@x.fr'), h).visit).toBe(3);
    expect(loyaltyFor(row('2026-03-10', '0600000004', 'b@x.fr'), h).visit).toBe(1);
  });
  it('affiche un libellé seulement quand une remise s’applique', () => {
    expect(loyaltyLabel({ visit: 2, percent: 0 })).toBeUndefined();
    expect(loyaltyLabel({ visit: 4, percent: 15 })).toBe('Fidélité : rendez-vous n°4 → −15 %');
  });
});
