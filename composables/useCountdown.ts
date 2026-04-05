import {
  computeProgress,
  splitDuration,
  beerCount,
  type TimeComponents,
} from '~/utils/countdownMath';

type CountdownState = {
  /** Remaining time broken into human-readable parts. */
  time: ComputedRef<TimeComponents>;
  /** Journey progress 0–100. */
  progress: ComputedRef<number>;
  /** Beers consumed so far (0–BEER_COUNT). */
  beers: ComputedRef<number>;
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

  let timer: ReturnType<typeof setTimeout>;

  const tick = () => {
    now.value = Date.now();
    if (remaining.value > 0) timer = setTimeout(tick, 1_000);
  };

  onMounted(tick);
  onUnmounted(() => clearTimeout(timer));

  return { time, progress, beers };
};
