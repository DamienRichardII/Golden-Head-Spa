import { describe, expect, it } from 'vitest';
import { bookingSchema, giftCardPurchaseSchema, signUpSchema } from './index';

describe('validation', () => {
  it('rejette un mot de passe court', () => {
    const r = signUpSchema.safeParse({ fullName: 'Lea Dupont', email: 'a@b.fr', password: 'court', acceptTerms: true });
    expect(r.success).toBe(false);
  });
  it('accepte une carte cadeau valide', () => {
    const r = giftCardPurchaseSchema.safeParse({ amountEur: 80, recipientName: 'Lea', recipientEmail: 'lea@x.fr' });
    expect(r.success).toBe(true);
  });
  it('rejette un montant hors bornes', () => {
    const r = giftCardPurchaseSchema.safeParse({ amountEur: 5, recipientName: 'Lea', recipientEmail: 'lea@x.fr' });
    expect(r.success).toBe(false);
  });
  const booking = { serviceSlug: 'decouverte', startsAt: '2026-10-20T08:30:00.000Z', name: 'Lea Dupont', email: 'Lea@X.fr', phone: '06 12 34 56 78' };
  it('accepte une réservation valide et normalise l’email', () => {
    const r = bookingSchema.safeParse(booking);
    expect(r.success && r.data.email).toBe('lea@x.fr');
  });
  it('rejette un téléphone ou une date invalide', () => {
    expect(bookingSchema.safeParse({ ...booking, phone: 'abc' }).success).toBe(false);
    expect(bookingSchema.safeParse({ ...booking, startsAt: 'demain' }).success).toBe(false);
  });
});
