import { describe, expect, it } from 'vitest';
import { giftCardPurchaseSchema, signUpSchema } from './index';

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
});
