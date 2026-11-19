import { supabase } from './supabase';

export interface Review { id: string; author_name: string; rating: number; comment: string; approved_at: string | null }
export type ReviewErrorCode = 'not_eligible' | 'already_reviewed' | 'invalid' | 'network';

/** Avis validés, du plus récent au plus ancien (la base ne renvoie jamais les avis en attente). Vide si le service n'est pas configuré. */
export async function fetchReviews(limit = 50): Promise<Review[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.from('reviews').select('id,author_name,rating,comment,approved_at')
    .order('approved_at', { ascending: false }).limit(limit);
  if (error) throw new Error('reviews_unavailable');
  return (data ?? []) as Review[];
}

export function summarize(reviews: readonly Pick<Review, 'rating'>[]): { average: number; count: number } {
  if (reviews.length === 0) return { average: 0, count: 0 };
  const sum = reviews.reduce((t, r) => t + r.rating, 0);
  return { average: Math.round((sum / reviews.length) * 10) / 10, count: reviews.length };
}

/** Dépose un avis (en attente de validation). Le prénom affiché est tiré de la réservation côté base. */
export async function submitReview(input: { bookingId: string; cancelToken: string; rating: number; comment: string }): Promise<void> {
  if (!supabase) throw Object.assign(new Error('network'), { code: 'network' as ReviewErrorCode });
  const { error } = await supabase.rpc('submit_review', { p_booking_id: input.bookingId, p_cancel_token: input.cancelToken, p_rating: input.rating, p_comment: input.comment.trim() });
  if (!error) return;
  const m = error.message ?? '';
  const code: ReviewErrorCode = m.includes('not_eligible') ? 'not_eligible' : m.includes('already_reviewed') ? 'already_reviewed' : error.code === '23514' ? 'invalid' : 'network';
  throw Object.assign(new Error(code), { code });
}

export const validComment = (c: string) => c.trim().length >= 3 && c.trim().length <= 1000;
