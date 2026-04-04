export const BEER_COUNT = 9;

/**
 * Returns how far through the event we are, as a 0–100 percentage.
 */
export const computeProgress = (
  startMs: number,
  deadlineMs: number,
  nowMs: number,
): number => {
  const total = deadlineMs - startMs;
  if (total <= 0) return 0;
  const remaining = deadlineMs - nowMs;
  if (remaining >= total) return 0;
  if (remaining <= 0) return 100;
  return 100 - Math.floor((remaining / total) * 100);
};

export type TimeComponents = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

/**
 * Splits a millisecond duration into days / hours / minutes / seconds.
 * Negative input is treated as 0.
 */
export const splitDuration = (ms: number): TimeComponents => {
  const abs = Math.max(0, ms);
  return {
    days: Math.floor(abs / 86_400_000),
    hours: Math.floor((abs % 86_400_000) / 3_600_000),
    minutes: Math.floor((abs % 3_600_000) / 60_000),
    seconds: Math.floor((abs % 60_000) / 1_000),
  };
};

/** How many beers have been "consumed" based on progress (0–BEER_COUNT). */
export const beerCount = (progress: number): number =>
  Math.floor((progress / 100) * BEER_COUNT);

/** Pads a time unit to at least 2 digits: 5 → "05", 12 → "12". */
export const padTime = (value: number): string =>
  String(value).padStart(2, '0');
