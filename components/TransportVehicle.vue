<script setup lang="ts">
import type { TransportParticipant } from '~/types/event';

const { position = 0, participants } = defineProps<{
  /** Current position along the road, 0–100 */
  position?: number;
  participants: TransportParticipant[];
}>();

const currentIndex = ref(0);
let timer: ReturnType<typeof setTimeout>;

const rotateSpeechBubble = () => {
  timer = setTimeout(() => {
    currentIndex.value = (currentIndex.value + 1) % participants.length;
    rotateSpeechBubble();
  }, 3_000);
};

onMounted(rotateSpeechBubble);
onUnmounted(() => clearTimeout(timer));
</script>

<template>
  <div class="vehicle" :style="`margin-left: calc(${position}% - 100px);`">
    <NuxtImg alt="Transport" src="/assets/bus.png" />
    <div
      v-for="(participant, index) in participants"
      :key="participant.id"
      v-show="index === currentIndex"
      class="speech-bubble"
    >
      <NuxtImg
        class="avatar"
        :alt="participant.id"
        :src="participant.avatar"
        preload
      />
      <span>{{ participant.quote }}</span>
    </div>
  </div>
</template>

<style scoped>
.vehicle {
  z-index: 100;
  position: absolute;
  margin-top: 0;
  height: 100px;
  width: 200px;
}

@media (max-width: 1250px) {
  .vehicle {
    margin-top: 50px;
    width: 100px;
  }
}

.vehicle > img {
  width: 100%;
  animation: oscillating 0.5s infinite;
}

@keyframes oscillating {
  0%   { transform: rotate(3deg); }
  25%  { transform: rotate(0deg); }
  50%  { transform: rotate(-3deg); }
  75%  { transform: rotate(0deg); }
  100% { transform: rotate(3deg); }
}

.speech-bubble {
  background-color: white;
  border-radius: 20px;
  padding: 10px;
  font-weight: bold;
  width: 240px;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  display: flex;
}

.speech-bubble > span {
  min-width: 55%;
}

.speech-bubble::before {
  content: "\A";
  border-style: solid;
  border-width: 0 10px 15px 10px;
  border-color: transparent transparent white transparent;
  position: absolute;
  left: 125px;
  top: 100px;
}

@media (max-width: 1250px) {
  .speech-bubble::before {
    left: 50px;
    top: 50px;
  }
}

.avatar {
  width: 50%;
  margin-bottom: -30px;
  border-radius: 50px;
  clip-path: polygon(100% 0%, 100% 70%, 0% 70%, 0% 0%);
  animation: oscillating 0.5s infinite;
}
</style>
