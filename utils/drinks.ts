export type DrinkKind = 'beer' | 'cocktail' | 'cola' | 'syrup' | 'wine' | 'champagne';

/** The glasses of the progress row, left to right: a mixed round, champagne for the arrival. */
export const DRINK_PANEL: DrinkKind[] = ['beer', 'cola', 'cocktail', 'syrup', 'wine', 'beer', 'cola', 'cocktail', 'champagne'];

/**
 * How full the glass in a slot is (1-based), once `drinks` glasses are full: the next one is
 * being poured (3/4), the one after just started (1/4), the others wait empty.
 */
export const glassLevel = (slot: number, drinks: number): number => {
  if (slot <= drinks) return 1;
  if (slot === drinks + 1) return 0.75;
  if (slot === drinks + 2) return 0.25;
  return 0;
};
