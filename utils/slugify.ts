/**
 * Converts a string to a URL/ID-friendly slug.
 * @param text - Input string
 * @param separator - Character between words. Use '' for compact IDs, '-' for URLs.
 */
export const slugify = (text: string, separator = '-'): string =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, separator)
    .replace(new RegExp(`^\\${separator}|\\${separator}$`, 'g'), '');
