import { describe, expect, it } from 'vitest';
import { addDays, blockLayout, floorHalfHour, minutesToHM, parisDay, parisMinutes, parisToIso, weekOf } from './agenda';

describe('agenda', () => {
  it('convertit une heure de Paris en instant UTC (été et hiver)', () => {
    expect(parisToIso('2026-07-15', '10:30')).toBe('2026-07-15T08:30:00.000Z');
    expect(parisToIso('2026-12-15', '10:30')).toBe('2026-12-15T09:30:00.000Z');
  });
  it('gère les changements d\'heure', () => {
    expect(parisToIso('2026-03-29', '10:30')).toBe('2026-03-29T08:30:00.000Z');
    expect(parisToIso('2026-03-28', '10:30')).toBe('2026-03-28T09:30:00.000Z');
    expect(parisToIso('2026-10-25', '10:30')).toBe('2026-10-25T09:30:00.000Z');
  });
  it('relit l\'heure et le jour de Paris', () => {
    expect(parisMinutes('2026-07-15T08:30:00.000Z')).toBe(10 * 60 + 30);
    expect(parisDay('2026-12-31T23:30:00.000Z')).toBe('2027-01-01');
  });
  it('calcule la semaine du lundi au dimanche', () => {
    expect(weekOf('2026-11-12')).toEqual(['2026-11-09', '2026-11-10', '2026-11-11', '2026-11-12', '2026-11-13', '2026-11-14', '2026-11-15']);
    expect(weekOf('2026-11-15')[0]).toBe('2026-11-09');
    expect(weekOf('2026-11-09')[6]).toBe('2026-11-15');
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
  });
  it('place un bloc dans la grille', () => {
    const l = blockLayout('2026-12-15T09:30:00.000Z', '2026-12-15T10:20:00.000Z', 10 * 60, 19 * 60, 1);
    expect(l).toEqual({ top: 30, height: 50 });
    expect(floorHalfHour(10 * 60 + 47)).toBe(10 * 60 + 30);
    expect(minutesToHM(18 * 60 + 30)).toBe('18:30');
  });
});
