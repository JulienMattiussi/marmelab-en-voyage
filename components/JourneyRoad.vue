<script setup lang="ts">
import type { TransportParticipant } from '~/types/event';

const { progress, deadline, goalImage, participants } = defineProps<{
  /** Journey progress 0–100 */
  progress: number;
  deadline: string;
  goalImage: string;
  participants: TransportParticipant[];
}>();

const rendezVous = computed(() => formatRendezVous(deadline));
</script>

<template>
  <div class="journey">
    <div class="road-area">
      <div class="lane">
        <TransportVehicle :position="progress" :participants="participants" />
      </div>
      <NuxtImg class="goal" alt="Destination" :src="goalImage" />
      <div class="road" aria-hidden="true">
        <span class="road-line" />
      </div>
    </div>
    <p v-if="rendezVous" class="rendez-vous">{{ rendezVous }}</p>
  </div>
</template>

<style scoped>
.road-area {
  position: relative;
  /* Room for the speech bubble (avatar shown down to the waist) above the bus. */
  padding-top: 240px;
}

/* The stretch the bus travels: its bottom is the road surface. */
.lane {
  position: absolute;
  left: 90px;
  right: 170px;
  bottom: 14px;
  z-index: 1;
}

.goal {
  position: absolute;
  /* In front of what a theme lays along the road (snowbank, flowers). */
  z-index: 1;
  right: -16px;
  bottom: 30px;
  width: 140px;
  height: 140px;
  object-fit: contain;
}

.road {
  display: flex;
  align-items: center;
  height: 44px;
  padding: 0 16px;
  box-sizing: border-box;
  background: var(--public-road);
  border: var(--public-border-thick);
  border-radius: var(--radius-lg);
}

.road-line {
  flex: 1;
  border-top: 4px dashed var(--public-sun);
}

.rendez-vous {
  margin: 12px 0 0;
  font-size: 0.875rem;
  font-weight: 700;
  text-align: right;
}

@media (max-width: 760px) {
  .road-area {
    padding-top: 170px;
  }

  .lane {
    left: 52px;
    right: 90px;
    bottom: 10px;
  }

  .goal {
    right: -8px;
    bottom: 22px;
    width: 84px;
    height: 84px;
  }

  .road {
    height: 34px;
    padding: 0 10px;
  }

  .road-line {
    border-top-width: 3px;
  }

  .rendez-vous {
    font-size: 0.8125rem;
  }
}
</style>
