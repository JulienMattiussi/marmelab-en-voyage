<script setup lang="ts">
import BusImage from "./BusImage.vue";
import BeerImage from "./BeerImage.vue";
import type { BusParticipant } from '~/types/event';

type Props = {
  start: string;
  deadline: string;
  goalImage: string;
  participants: BusParticipant[];
};

const { start, deadline, goalImage, participants } = defineProps<Props>();

const timeRemaining = ref(Date.parse(deadline) - new Date().getTime());
const totalTime = Date.parse(deadline) - Date.parse(start);
const currentPosition = ref(0);
const currentBeer = ref(0);
const maxPosition = 100;

const seconds = () => Math.floor((timeRemaining.value / 1000) % 60);
const minutes = () => Math.floor((timeRemaining.value / 1000 / 60) % 60);
const hours = () => Math.floor((timeRemaining.value / (1000 * 60 * 60)) % 24);
const days = () => Math.floor(timeRemaining.value / (1000 * 60 * 60 * 24));

const formatTime = (value: number) => {
  if (value < 10) {
    return "0" + value;
  }
  return value;
};

const countdown = () => {
  timeRemaining.value = Date.parse(deadline) - new Date().getTime();
  if (timeRemaining.value > totalTime) {
    currentPosition.value = 0;
  } else {
    currentPosition.value =
      timeRemaining.value > totalTime
        ? 0
        : timeRemaining.value <= 0
        ? maxPosition
        : maxPosition -
          Math.floor((timeRemaining.value / totalTime) * maxPosition);
  }
  if (timeRemaining.value > 0) {
    setTimeout(countdown, 1000);
  } else {
    currentPosition.value = 0;
  }
  currentBeer.value = Math.floor((currentPosition.value / maxPosition) * 9);
};

countdown();
</script>

<template>
  <div class="main">
    <div class="countdown">
      <BeerImage :current-beer="currentBeer" />
      <h3 style="margin-left: 10px">Temps restant avant la fiesta :</h3>
      <table>
        <tbody>
          <tr class="numbers">
            <td class="table-margin"></td>
            <td :class="days() === 0 ? 'reached' : ''" class="days">
              {{ days() }}
            </td>
            <td :class="days() === 0 && hours() === 0 ? 'reached' : ''">
              {{ hours() }}
            </td>
            <td
              :class="
                days() === 0 && hours() === 0 && minutes() === 0
                  ? 'reached'
                  : ''
              "
            >
              {{ formatTime(minutes()) }}
            </td>
            <td
              :class="
                days() === 0 &&
                hours() === 0 &&
                minutes() === 0 &&
                seconds() === 0
                  ? 'reached'
                  : ''
              "
            >
              {{ formatTime(seconds()) }}
            </td>
            <td class="table-margin"></td>
          </tr>
          <tr class="labels">
            <td class="table-margin"></td>
            <td>jour{{ days() > 1 ? "s" : "" }}</td>
            <td>heure{{ hours() > 1 ? "s" : "" }}</td>
            <td>minute{{ minutes() > 1 ? "s" : "" }}</td>
            <td>seconde{{ seconds() > 1 ? "s" : "" }}</td>
            <td class="table-margin"></td>
          </tr>
          <tr>
            <td class="road-td" colspan="6">
              <BusImage :current-position="currentPosition" :participants="participants" class="bus" />
              <NuxtImg class="road" alt="Road" src="/assets/road.jpg" />
              <NuxtImg class="goal" alt="Goal" :src="goalImage" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.main {
  display: flex;
  justify-content: center;
  width: 100%;
  margin: 10px 0 0;
}

.countdown {
  display: flex;
  flex-direction: column;
  width: 700px;
}

.numbers {
  font-size: 60px;
  color: red;
  vertical-align: bottom;
}

.reached {
  color: green !important;
}

@media (max-width: 1250px) {
  .numbers {
    font-size: 45px;
  }
}

.labels {
  font-size: 20px;
}

.days {
  font-size: 100px;
  color: brown;
  vertical-align: bottom;
  line-height: 100px;
}

.road-td {
  position: relative;
}

img.road {
  margin-top: 50px;
  height: 50px;
  width: 100%;
}

.bus {
  left: 0;
}

@media (max-width: 1250px) {
  .bus {
    left: 50px;
  }
}

@media (max-width: 1250px) {
  img.road {
    margin-left: -10px;
    width: calc(100% + 20px);
  }
}

img.goal {
  height: 130px;
  margin-top: -5px;
  margin-left: -80px;
  position: absolute;
}

@media (max-width: 1250px) {
  img.goal {
    right: 0;
    margin-top: -110px;
    margin-left: unset;
    margin-right: -50px;
  }
}

.table-margin {
  width: 100px;
}

@media (max-width: 1250px) {
  .table-margin {
    width: 0px;
  }
}
</style>
