<script setup lang="ts">
import type { TripEvent, GlobalParticipant, TransportParticipant } from '~/types/event';

const { event, globalParticipants } = defineProps<{
  event: TripEvent;
  globalParticipants: GlobalParticipant[];
}>();

const { time, progress, beers } = useCountdown(event.start, event.deadline);

const transportParticipants = computed<TransportParticipant[]>(() =>
  event.participants
    .filter((id) => globalParticipants.find((p) => p.id === id)?.active !== false)
    .map((id) => {
      const found = globalParticipants.find((p) => p.id === id);
      return {
        id,
        name: found?.name ?? id,
        avatar: found?.avatar ?? `/avatars/${id}.png`,
        quote: found?.quote ?? '',
      };
    }),
);
</script>

<template>
  <div class="event-page">
    <PublicBackdrop :image="event.visuals.background || '/assets/back.png'" />
    <header class="event-header">
      <MainTitle :message="event.title" />
      <BeerProgress :beers="beers" />
    </header>
    <EventCountdown :time="time" />
    <JourneyRoad
      class="event-journey"
      :progress="progress"
      :deadline="event.deadline"
      :goal-image="event.visuals.goal || '/assets/goal.png'"
      :participants="transportParticipants"
    />
  </div>
</template>

<style scoped>
.event-page {
  display: flex;
  flex-direction: column;
  gap: 32px;
  max-width: 1280px;
  min-height: 100vh;
  margin: 0 auto;
  padding: 56px 72px 40px;
  box-sizing: border-box;
  font-family: var(--public-font-body);
  color: var(--public-ink);
}

.event-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 32px;
}

/* Push the road to the bottom of the screen. */
.event-journey {
  margin-top: auto;
}

@media (max-width: 760px) {
  .event-page {
    gap: 22px;
    padding: 40px 16px 28px;
  }

  .event-header {
    flex-direction: column;
    align-items: stretch;
    gap: 22px;
  }
}
</style>
