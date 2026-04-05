<script setup lang="ts">
import type { TripEvent, GlobalParticipant, TransportParticipant } from '~/types/event';

const { event, globalParticipants } = defineProps<{
  event: TripEvent;
  globalParticipants: GlobalParticipant[];
}>();

const transportParticipants = computed<TransportParticipant[]>(() =>
  event.participants
    .filter((id) => globalParticipants.find((p) => p.id === id)?.active !== false)
    .map((id) => {
      const found = globalParticipants.find((p) => p.id === id);
      return {
        id,
        avatar: found?.avatar ?? `/avatars/${id}.png`,
        quote: found?.quote ?? '',
      };
    }),
);
</script>

<template>
  <div>
    <NuxtImg class="back" alt="Background" :src="event.visuals.background || '/assets/back.png'" />
    <div class="content">
      <NuxtImg alt="Marmelab logo" class="logo" src="/assets/logo-green.png" />
      <MainTitle :message="event.title" class="title" />
      <EventCountdown
        :start="event.start"
        :deadline="event.deadline"
        :goal-image="event.visuals.goal || '/assets/goal.png'"
        :participants="transportParticipants"
      />
    </div>
  </div>
</template>

<style scoped>
.back {
  margin: 30px;
  position: absolute;
  top: 0;
  left: 0;
  filter: contrast(40%) blur(5px) brightness(1.5);
  width: calc(100vw - 60px);
  height: calc(100vh - 60px);
}

@media (max-width: 1250px) {
  .back {
    margin: -10px;
    height: calc(100% + 20px);
    width: 113vw;
    height: 110vh;
  }
}

.content {
  position: relative;
}

.content > .logo,
.content > .title {
  display: flex;
  margin: auto;
}
</style>
