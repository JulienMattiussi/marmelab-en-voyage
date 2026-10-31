import {
  computeProgress,
  splitDuration,
  drinkCount,
  isArrivalDay,
  type TimeComponents,
} from '~/utils/countdownMath';

type CountdownState = {
  /** Remaining time broken into human-readable parts. */
  time: ComputedRef<TimeComponents>;
  /** Journey progress 0–100. */
  progress: ComputedRef<number>;
  /** Glasses full so far (0–DRINK_COUNT). */
  drinks: ComputedRef<number>;
  /** Rendez-vous time passed, same day: the page celebrates. */
  arrived: ComputedRef<boolean>;
  /**
   * False until the browser has its own clock. The server's clock and time zone may differ, and Vue
   * doesn't fix classes and styles that differ at hydration: key what depends on progress on it.
   */
  live: Ref<boolean>;
};

export const useCountdown = (start: string, deadline: string): CountdownState => {
  const startMs = Date.parse(start);
  const deadlineMs = Date.parse(deadline);

  // Single reactive clock — all derived values update together.
  const now = ref(Date.now());
  const remaining = computed(() => deadlineMs - now.value);
  const progress = computed(() => computeProgress(startMs, deadlineMs, now.value));
  const time = computed(() => splitDuration(Math.max(0, remaining.value)));
  const drinks = computed(() => drinkCount(progress.value));
  const live = ref(false);
  const arrived = computed(() => live.value && isArrivalDay(deadlineMs, now.value));

  let timer: ReturnType<typeof setTimeout>;

  // Keeps ticking through the arrival day, so the celebration ends at midnight.
  const tick = () => {
    now.value = Date.now();
    if (remaining.value > 0 || arrived.value) timer = setTimeout(tick, 1_000);
  };

  onMounted(() => {
    live.value = true;
    tick();
  });
  onUnmounted(() => clearTimeout(timer));

  return { time, progress, drinks, arrived, live };
};
