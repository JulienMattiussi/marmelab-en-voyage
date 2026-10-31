import {
  computeProgress,
  splitDuration,
  beerCount,
  isArrivalDay,
  type TimeComponents,
} from '~/utils/countdownMath';

type CountdownState = {
  /** Remaining time broken into human-readable parts. */
  time: ComputedRef<TimeComponents>;
  /** Journey progress 0–100. */
  progress: ComputedRef<number>;
  /** Beers consumed so far (0–BEER_COUNT). */
  beers: ComputedRef<number>;
  /** Rendez-vous time passed, same day: the page celebrates. */
  arrived: ComputedRef<boolean>;
};

export const useCountdown = (start: string, deadline: string): CountdownState => {
  const startMs = Date.parse(start);
  const deadlineMs = Date.parse(deadline);

  // Single reactive clock — all derived values update together.
  const now = ref(Date.now());
  const remaining = computed(() => deadlineMs - now.value);
  const progress = computed(() => computeProgress(startMs, deadlineMs, now.value));
  const time = computed(() => splitDuration(Math.max(0, remaining.value)));
  const beers = computed(() => beerCount(progress.value));
  // Browser only: the server's clock and time zone may differ, and the page would flicker on hydration.
  const mounted = ref(false);
  const arrived = computed(() => mounted.value && isArrivalDay(deadlineMs, now.value));

  let timer: ReturnType<typeof setTimeout>;

  // Keeps ticking through the arrival day, so the celebration ends at midnight.
  const tick = () => {
    now.value = Date.now();
    if (remaining.value > 0 || arrived.value) timer = setTimeout(tick, 1_000);
  };

  onMounted(() => {
    mounted.value = true;
    tick();
  });
  onUnmounted(() => clearTimeout(timer));

  return { time, progress, beers, arrived };
};
