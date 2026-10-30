import { describe, it, expect } from 'vitest';
import { formatRendezVous } from '~/utils/date';

describe('formatRendezVous', () => {
  it('shows a date typed in the admin as its wall time', () => {
    expect(formatRendezVous('2026-11-26T09:00')).toBe('RDV jeudi 26 novembre, 9 h');
  });

  it('shows minutes when they are not zero', () => {
    expect(formatRendezVous('2026-11-26T17:30')).toBe('RDV jeudi 26 novembre, 17 h 30');
  });

  it('shows a date stored in UTC in Paris time', () => {
    expect(formatRendezVous('2025-05-21T15:00:00.000Z')).toBe('RDV mercredi 21 mai, 17 h');
  });

  it('returns an empty string for an invalid date', () => {
    expect(formatRendezVous('')).toBe('');
  });
});
