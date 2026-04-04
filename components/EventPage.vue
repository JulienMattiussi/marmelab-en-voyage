<script setup lang="ts">
import type { Event, GlobalParticipant, BusParticipant } from '~/types/event';

type Props = {
  event: Event;
  globalParticipants: GlobalParticipant[];
};

const { event, globalParticipants } = defineProps<Props>();

const busParticipants = computed<BusParticipant[]>(() =>
  event.participants.map((id) => {
    const global = globalParticipants.find((gp) => gp.id === id);
    return {
      id,
      avatar: global?.avatar ?? `/avatars/${id}.png`,
      quote: global?.quote ?? '',
    };
  })
);
</script>

<template>
  <div>
    <NuxtImg class="back" alt="Background" :src="event.visuals.background" />
    <div class="content">
      <NuxtImg alt="Marmelab logo" class="logo" src="/assets/logo-green.png" />
      <MainTitle :message="event.title" class="title" />
      <CountDown
        :start="event.start"
        :deadline="event.deadline"
        :goal-image="event.visuals.goal"
        :participants="busParticipants"
      />
    </div>
  </div>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  padding-top: 60px;
}

@media (max-width: 1250px) {
  #app {
    padding-top: 10px;
  }
}

.back {
  width: calc(100% - 60px);
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
    width: unset;
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

#greenframe_embedable_score_page {
  position: absolute;
  bottom: 10px;
  right: 40px;
}
</style>
