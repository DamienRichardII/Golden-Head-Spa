import { bookingSchema, type BookingInput } from '@ghs/validation';
import { supabase } from './supabase';
import { getJson, setJson } from './storage';

export type BookingErrorCode = 'slot_unavailable' | 'too_many_bookings' | 'service_not_found' | 'invalid' | 'network';

export class BookingError extends Error {
  constructor(public code: BookingErrorCode) { super(code); }
}

export interface BookingConfirmation {
  id: string;
  reference: string;
  cancelToken: string;
  startsAt: string;
  endsAt: string;
  serviceSlug: string;
}

const CONFIRMATION_KEY = 'ghs_last_booking';
const TZ = 'Europe/Paris';

/** Jours proposés à la réservation, à partir d'aujourd'hui (date AAAA-MM-JJ, heure de Paris). */
export function nextDays(count: number, from = new Date()): string[] {
  const fmt = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' });
  return Array.from({ length: count }, (_, i) => fmt.format(new Date(from.getTime() + i * 86_400_000)));
}

export const formatDayLabel = (day: string) =>
  new Intl.DateTimeFormat('fr-FR', { timeZone: TZ, weekday: 'short', day: 'numeric', month: 'short' }).format(new Date(`${day}T12:00:00Z`));
export const formatTime = (iso: string) =>
  new Intl.DateTimeFormat('fr-FR', { timeZone: TZ, hour: '2-digit', minute: '2-digit' }).format(new Date(iso)).replace(':', 'h');
export const formatLongDate = (iso: string) =>
  new Intl.DateTimeFormat('fr-FR', { timeZone: TZ, weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(iso));

export async function fetchSlots(serviceSlug: string, day: string): Promise<string[]> {
  if (!supabase) throw new BookingError('network');
  const { data, error } = await supabase.rpc('get_available_slots', { p_service_slug: serviceSlug, p_date: day });
  if (error) throw new BookingError('network');
  return ((data ?? []) as { slot_start: string }[]).map((r) => r.slot_start);
}

export async function createBooking(input: BookingInput): Promise<BookingConfirmation> {
  if (!supabase) throw new BookingError('network');
  const parsed = bookingSchema.safeParse(input);
  if (!parsed.success) throw new BookingError('invalid');
  const v = parsed.data;
  const { data, error } = await supabase.rpc('create_booking', {
    p_service_slug: v.serviceSlug, p_starts_at: v.startsAt, p_name: v.name, p_email: v.email, p_phone: v.phone, p_notes: v.notes ?? null,
  });
  if (error) {
    const msg = error.message ?? '';
    if (msg.includes('slot_unavailable')) throw new BookingError('slot_unavailable');
    if (msg.includes('too_many_bookings')) throw new BookingError('too_many_bookings');
    if (msg.includes('service_not_found')) throw new BookingError('service_not_found');
    throw new BookingError(error.code === '23514' ? 'invalid' : 'network');
  }
  const row = (Array.isArray(data) ? data[0] : data) as
    { booking_id: string; booking_ref: string; booking_cancel_token: string; booking_starts_at: string; booking_ends_at: string } | undefined;
  if (!row) throw new BookingError('network');
  const confirmation: BookingConfirmation = {
    id: row.booking_id, reference: row.booking_ref, cancelToken: row.booking_cancel_token,
    startsAt: row.booking_starts_at, endsAt: row.booking_ends_at, serviceSlug: v.serviceSlug,
  };
  await setJson(CONFIRMATION_KEY, confirmation);
  return confirmation;
}

/** Retourne true si annulée ; false si hors délai ou déjà annulée. */
export async function cancelBooking(c: Pick<BookingConfirmation, 'id' | 'cancelToken'>): Promise<boolean> {
  if (!supabase) throw new BookingError('network');
  const { data, error } = await supabase.rpc('cancel_booking', { p_booking_id: c.id, p_cancel_token: c.cancelToken });
  if (error) throw new BookingError('network');
  if (data === true) await setJson(CONFIRMATION_KEY, null);
  return data === true;
}

export const getLastBooking = () => getJson<BookingConfirmation>(CONFIRMATION_KEY);
