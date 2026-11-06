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

export const flashOfferSchema = z.object({
  title: z.string().trim().min(2).max(80),
  description: z.string().trim().max(300).optional(),
  ritualId: z.string().min(1).optional(),
  discountPercent: z.number().int().min(1).max(90),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  code: z.string().trim().max(24).optional(),
}).refine((v) => new Date(v.endsAt) > new Date(v.startsAt), { message: 'La fin doit suivre le début', path: ['endsAt'] });
export type FlashOfferInput = z.infer<typeof flashOfferSchema>;

export const CHAT_MAX_MESSAGES = 12;
export const CHAT_MAX_CHARS = 500;
export const chatRequestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string().trim().min(1).max(CHAT_MAX_CHARS),
  })).min(1).max(CHAT_MAX_MESSAGES),
}).refine((v) => v.messages[v.messages.length - 1]?.role === 'user', { message: 'Le dernier message doit venir du client' });
export type ChatRequest = z.infer<typeof chatRequestSchema>;
