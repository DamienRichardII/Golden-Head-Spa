/** Utilitaires de l'agenda d'administration. Tout est exprimé en heure de Paris, quel que soit le fuseau de l'appareil. */
const TZ = 'Europe/Paris';

const dayFmt = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' });
const hmFmt = new Intl.DateTimeFormat('en-GB', { timeZone: TZ, hourCycle: 'h23', hour: '2-digit', minute: '2-digit' });
const fullFmt = new Intl.DateTimeFormat('en-US', { timeZone: TZ, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });

/** Date (AAAA-MM-JJ) à Paris d'un instant ISO. */
export const parisDay = (iso: string | Date) => dayFmt.format(typeof iso === 'string' ? new Date(iso) : iso);
export const todayParis = () => parisDay(new Date());

/** Minutes écoulées depuis minuit, à Paris. */
export function parisMinutes(iso: string): number {
  const [h = 0, m = 0] = hmFmt.format(new Date(iso)).split(':').map(Number);
  return h * 60 + m;
}
export const parisHM = (iso: string) => hmFmt.format(new Date(iso));

function parisOffsetMs(utcMs: number): number {
  const parts = fullFmt.formatToParts(new Date(utcMs));
  const g = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  return Date.UTC(g('year'), g('month') - 1, g('day'), g('hour'), g('minute'), g('second')) - utcMs;
}

/** Instant ISO (UTC) correspondant à « jour + heure » saisis à Paris. Gère l'heure d'été / d'hiver. */
export function parisToIso(day: string, hm: string): string {
  const [y = 1970, mo = 1, d = 1] = day.split('-').map(Number);
  const [h = 0, mi = 0] = hm.split(':').map(Number);
  const guess = Date.UTC(y, mo - 1, d, h, mi);
  let t = guess - parisOffsetMs(guess);
  const off2 = parisOffsetMs(t);
  if (guess - off2 !== t) t = guess - off2;
  return new Date(t).toISOString();
}

export function addDays(day: string, n: number): string {
  const d = new Date(`${day}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/** Les 7 jours de la semaine (lundi → dimanche) qui contient `day`. */
export function weekOf(day: string): string[] {
  const dow = new Date(`${day}T12:00:00Z`).getUTCDay();
  const monday = addDays(day, dow === 0 ? -6 : 1 - dow);
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
}

export const dayLabel = (day: string, opts: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric', month: 'short' }) =>
  new Intl.DateTimeFormat('fr-FR', { timeZone: 'UTC', ...opts }).format(new Date(`${day}T12:00:00Z`));

/** Arrondit une heure « HH:MM » à la demi-heure inférieure. */
export const floorHalfHour = (min: number) => Math.floor(min / 30) * 30;
export const minutesToHM = (min: number) => `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;

/** Position verticale d'un bloc dans la grille d'un jour (px). Les blocs hors plage sont ramenés dans la grille. */
export function blockLayout(startIso: string, endIso: string, gridStartMin: number, gridEndMin: number, pxPerMin: number) {
  const s = Math.max(parisMinutes(startIso), gridStartMin);
  const e = Math.min(parisMinutes(endIso) || 24 * 60, gridEndMin);
  return { top: (s - gridStartMin) * pxPerMin, height: Math.max((e - s) * pxPerMin, 18) };
}
