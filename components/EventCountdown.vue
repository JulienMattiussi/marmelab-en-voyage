<script setup lang="ts">
import { padTime, type TimeComponents } from '~/utils/countdownMath';

const { time } = defineProps<{
  /** Remaining time, from useCountdown. */
  time: TimeComponents;
}>();

const plural = (word: string, value: number) => (value > 1 ? `${word}s` : word);

// A unit is "reached" once it and every larger unit are down to zero: its tile turns green.
const tiles = computed(() => {
  const { days, hours, minutes, seconds } = time;
  return [
    { key: 'days', value: String(days), label: plural('jour', days), reached: days === 0 },
    { key: 'hours', value: padTime(hours), label: plural('heure', hours), reached: days + hours === 0 },
    { key: 'minutes', value: padTime(minutes), label: plural('minute', minutes), reached: days + hours + minutes === 0 },
    { key: 'seconds', value: padTime(seconds), label: plural('seconde', seconds), reached: days + hours + minutes + seconds === 0 },
  ];
});
</script>

<template>
  <div class="countdown" role="timer" aria-live="off">
    <div
      v-for="tile in tiles"
      :key="tile.key"
      :class="['tile', 'sticker', 'sticker--bold', `tile--${tile.key}`, { 'tile--reached': tile.reached }]"
    >
      <span class="tile-value">{{ tile.value }}</span>
      <span class="tile-label">{{ tile.label }}</span>
    </div>
  </div>
</template>

<style scoped>
.countdown {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 20px;
}

.tile {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 14px 22px;
}

.tile--days {
  background: var(--color-countdown-days);
}

.tile--reached {
  background: var(--color-countdown-reached);
}

.tile-value {
  font-family: var(--public-font-display);
  font-size: 4.5rem;
  font-weight: 800;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.tile-label {
  font-size: 1rem;
  font-weight: 700;
}

@media (max-width: 760px) {
  .countdown {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
  }

  .tile {
    padding: 10px 16px;
    box-shadow: var(--public-shadow);
  }

  .tile-value {
    font-size: 3.25rem;
  }

  .tile-label {
    font-size: 0.875rem;
  }
}
</style>
