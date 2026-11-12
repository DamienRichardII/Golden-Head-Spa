import { describe, expect, it } from 'vitest';
import { adminBookingSchema, blockedSlotSchema, bookingSchema, chatRequestSchema, journalPostSchema, flashOfferSchema, giftCardPurchaseSchema, signUpSchema } from './index';

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
  it('refuse une offre flash qui finit avant de commencer', () => {
    const r = flashOfferSchema.safeParse({ title: 'Flash', discountPercent: 20, startsAt: '2026-11-10T10:00:00Z', endsAt: '2026-11-09T10:00:00Z' });
    expect(r.success).toBe(false);
  });
  it('refuse un chat dont le dernier message est de l\'assistant', () => {
    expect(chatRequestSchema.safeParse({ messages: [{ role: 'assistant', content: 'Bonjour' }] }).success).toBe(false);
    expect(chatRequestSchema.safeParse({ messages: [{ role: 'user', content: 'Bonjour' }] }).success).toBe(true);
  });

  it('journal : un article exige un titre, une phrase non', () => {
    expect(journalPostSchema.safeParse({ kind: 'article', body: 'Respirer profondément.' }).success).toBe(false);
    expect(journalPostSchema.safeParse({ kind: 'article', title: 'Respirer', body: 'Respirer profondément.' }).success).toBe(true);
    expect(journalPostSchema.safeParse({ kind: 'phrase', body: 'Offrez-vous une pause.' }).success).toBe(true);
    expect(journalPostSchema.safeParse({ kind: 'phrase', body: 'x' }).success).toBe(false);
  });

  it('agenda : rendez-vous manuel (email facultatif) et blocage de créneau', () => {
    const ok = { serviceSlug: 'decouverte', day: '2026-12-01', time: '10:30', name: 'Lea Dupont', phone: '06 12 34 56 78' };
    expect(adminBookingSchema.safeParse(ok).success).toBe(true);
    expect(adminBookingSchema.safeParse({ ...ok, email: '' }).success).toBe(true);
    expect(adminBookingSchema.safeParse({ ...ok, email: 'pas-un-email' }).success).toBe(false);
    expect(adminBookingSchema.safeParse({ ...ok, time: '25:00' }).success).toBe(false);
    expect(adminBookingSchema.safeParse({ ...ok, day: '01/12/2026' }).success).toBe(false);
    expect(blockedSlotSchema.safeParse({ day: '2026-12-01', start: '12:00', end: '13:30' }).success).toBe(true);
    expect(blockedSlotSchema.safeParse({ day: '2026-12-01', start: '13:30', end: '12:00' }).success).toBe(false);
  });
});
