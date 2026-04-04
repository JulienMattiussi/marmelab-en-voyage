import { describe, it, expect } from 'vitest';
import {
  computeProgress,
  splitDuration,
  beerCount,
  padTime,
  BEER_COUNT,
} from '~/utils/countdownMath';

describe('computeProgress', () => {
  const start = 0;
  const deadline = 100_000; // 100 seconds

  it('returns 0 before the event starts', () => {
    expect(computeProgress(start, deadline, -10_000)).toBe(0);
  });

  it('returns 0 at the exact start time', () => {
    expect(computeProgress(start, deadline, 0)).toBe(0);
  });

  it('returns ~50 at the midpoint', () => {
    expect(computeProgress(start, deadline, 50_000)).toBe(50);
  });

  it('returns 100 at the deadline', () => {
    expect(computeProgress(start, deadline, 100_000)).toBe(100);
  });

  it('returns 100 after the deadline', () => {
    expect(computeProgress(start, deadline, 200_000)).toBe(100);
  });

  it('returns 0 when start equals deadline', () => {
    expect(computeProgress(100_000, 100_000, 100_000)).toBe(0);
  });
});

describe('splitDuration', () => {
  it('correctly splits exactly one day', () => {
    expect(splitDuration(86_400_000)).toEqual({ days: 1, hours: 0, minutes: 0, seconds: 0 });
  });

  it('correctly splits a mixed duration', () => {
    // 1d 1h 1m 1s = 90061000ms
    expect(splitDuration(90_061_000)).toEqual({ days: 1, hours: 1, minutes: 1, seconds: 1 });
  });

  it('returns all zeros for negative input', () => {
    expect(splitDuration(-1_000)).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  });

  it('returns all zeros for 0ms', () => {
    expect(splitDuration(0)).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  });

  it('correctly handles seconds only', () => {
    expect(splitDuration(45_000)).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 45 });
  });
});

describe('beerCount', () => {
  it('returns 0 at 0% progress', () => {
    expect(beerCount(0)).toBe(0);
  });

  it('returns BEER_COUNT at 100% progress', () => {
    expect(beerCount(100)).toBe(BEER_COUNT);
  });

  it('floors the result', () => {
    // 50% of 9 = 4.5, floored to 4
    expect(beerCount(50)).toBe(4);
  });

  it('never exceeds BEER_COUNT', () => {
    expect(beerCount(100)).toBeLessThanOrEqual(BEER_COUNT);
  });
});

describe('padTime', () => {
  it('pads single-digit numbers', () => {
    expect(padTime(0)).toBe('00');
    expect(padTime(5)).toBe('05');
    expect(padTime(9)).toBe('09');
  });

  it('does not pad two-digit numbers', () => {
    expect(padTime(10)).toBe('10');
    expect(padTime(59)).toBe('59');
  });
});
