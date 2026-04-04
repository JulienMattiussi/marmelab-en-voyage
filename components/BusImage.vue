<script setup lang="ts">
import type { BusParticipant } from '~/types/event';

type Props = {
  currentPosition?: number;
  participants: BusParticipant[];
};

const { currentPosition = 0, participants } = defineProps<Props>();

const choice = ref(0);

const changingAvatar = () => {
  choice.value = choice.value >= participants.length - 1 ? 0 : choice.value + 1;
  setTimeout(changingAvatar, 3000);
};

changingAvatar();
</script>

<template>
  <div class="bus" :style="`margin-left: calc(${currentPosition}% - 100px);`">
    <NuxtImg alt="Bus" src="/assets/bus.png" />
    <div
      v-for="index in participants.length"
      :key="index"
      class="people"
      :style="`display: ${index - 1 === choice ? 'flex' : 'none'};`"
    >
      <NuxtImg
        class="avatar"
        :alt="participants[index - 1].id"
        :src="participants[index - 1].avatar"
        preload
      />
      <span>{{ participants[index - 1].quote }}</span>
    </div>
  </div>
</template>

<style scoped>
.bus {
  z-index: 100;
  position: absolute;
  margin-top: 0px;
  height: 100px;
  width: 200px;
}

@media (max-width: 1250px) {
  .bus {
    margin-top: 50px;
    width: 100px;
  }
}

.bus > img {
  width: 100%;
  animation-iteration-count: infinite;
  animation-duration: 0.5s;
  animation-name: oscillating;
}

@keyframes oscillating {
  0% {
    transform: rotate(3deg);
  }
  25% {
    transform: rotate(0deg);
  }
  50% {
    transform: rotate(-3deg);
  }
  75% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(3deg);
  }
}

.bus > .people {
  display: flex;
}

.bus:hover > .people {
  display: flex;
}

.people {
  background-color: white;
  border-radius: 20px;
  padding: 10px;
  font-weight: bold;
  width: 240px;
  margin-left: 0px;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

.people > span {
  min-width: 55%;
}

.people::before {
  content: "\A";
  border-style: solid;
  border-width: 0px 10px 15px 10px;
  border-color: transparent transparent white transparent;
  position: absolute;
  left: 125px;
  top: 100px;
}

@media (max-width: 1250px) {
  .people::before {
    left: 50px;
    top: 50px;
  }
}

.avatar {
  width: 50%;
  margin-bottom: -30px;
  border-radius: 50px;
  clip-path: polygon(100% 0%, 100% 70%, 0% 70%, 0% 0%);
  animation-iteration-count: infinite;
  animation-duration: 0.5s;
  animation-name: oscillating;
}
</style>
