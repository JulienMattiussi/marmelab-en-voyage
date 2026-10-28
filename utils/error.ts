export const extractErrorMessage = (e: unknown, fallback = 'Erreur'): string =>
  (e as { data?: { message?: string } }).data?.message ?? fallback;

// Message for the first failed useFetch among several, or '' when all succeeded.
export const loadErrorMessage = (...errors: unknown[]): string => {
  const error = errors.find(Boolean);
  return error ? extractErrorMessage(error, 'Impossible de charger les données') : '';
};
