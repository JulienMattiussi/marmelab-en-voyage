import { describe, it, expect } from 'vitest';
import { loadErrorMessage } from '~/utils/error';

describe('loadErrorMessage', () => {
  it('returns an empty string when every fetch succeeded', () => {
    expect(loadErrorMessage(null, undefined)).toBe('');
  });

  it('returns the server message of the first failed fetch', () => {
    expect(loadErrorMessage(null, { data: { message: 'Stockage indisponible' } })).toBe('Stockage indisponible');
  });

  it('falls back to a generic message', () => {
    expect(loadErrorMessage(new Error('boom'))).toBe('Impossible de charger les données');
  });
});
