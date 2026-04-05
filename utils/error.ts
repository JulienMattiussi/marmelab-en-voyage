export const extractErrorMessage = (e: unknown, fallback = 'Erreur'): string =>
  (e as { data?: { message?: string } }).data?.message ?? fallback;
