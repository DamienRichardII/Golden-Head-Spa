import { z } from 'zod';

export const emailSchema = z.string().trim().toLowerCase().email('Email invalide');

export const signUpSchema = z.object({
  fullName: z.string().trim().min(2, 'Nom requis').max(80),
  email: emailSchema,
  password: z.string().min(10, '10 caractères minimum').max(128),
  marketingConsent: z.boolean().default(false),
  acceptTerms: z.literal(true, { error: 'Acceptation requise' }),
});

export const signInSchema = z.object({ email: emailSchema, password: z.string().min(1) });

export const giftCardPurchaseSchema = z.object({
  ritualId: z.string().min(1).optional(),
  amountEur: z.number().int().min(20).max(500),
  recipientName: z.string().trim().min(2).max(80),
  recipientEmail: emailSchema,
  message: z.string().trim().max(400).optional(),
}).refine((v) => v.ritualId || v.amountEur, { message: 'Rituel ou montant requis' });

export const corporateLeadSchema = z.object({
  company: z.string().trim().min(2).max(120),
  contactName: z.string().trim().min(2).max(80),
  email: emailSchema,
  teamSize: z.number().int().min(1).max(5000).optional(),
  message: z.string().trim().max(1000).optional(),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type GiftCardPurchaseInput = z.infer<typeof giftCardPurchaseSchema>;
export type CorporateLeadInput = z.infer<typeof corporateLeadSchema>;

export const bookingSchema = z.object({
  serviceSlug: z.string().min(1),
  startsAt: z.string().datetime({ offset: true }),
  name: z.string().trim().min(2, 'Nom requis').max(80),
  email: emailSchema,
  phone: z.string().trim().regex(/^[0-9+()\s.-]{6,20}$/, 'Téléphone invalide'),
  notes: z.string().trim().max(500).optional(),
});
export type BookingInput = z.infer<typeof bookingSchema>;
