<script setup lang="ts">
import { padTime } from '~/utils/countdownMath';
import type { TransportParticipant } from '~/types/event';

const { start, deadline, goalImage, participants } = defineProps<{
  start: string;
  deadline: string;
  goalImage: string;
  participants: TransportParticipant[];
}>();

const { time, progress, beers } = useCountdown(start, deadline);

const reached = computed(() => ({
  days: time.value.days === 0,
  hours: time.value.days === 0 && time.value.hours === 0,
  minutes: time.value.days === 0 && time.value.hours === 0 && time.value.minutes === 0,
  seconds: time.value.days === 0 && time.value.hours === 0 && time.value.minutes === 0 && time.value.seconds === 0,
}));
</script>

<template>
  <div class="countdown-wrapper">
    <div class="countdown">
      <BeerProgress :beers="beers" />
      <h3>Temps restant avant la fiesta :</h3>
      <table>
        <tbody>
          <tr class="numbers">
            <td class="spacer" />
            <td :class="{ reached: reached.days }" class="days">{{ time.days }}</td>
            <td :class="{ reached: reached.hours }">{{ time.hours }}</td>
            <td :class="{ reached: reached.minutes }">{{ padTime(time.minutes) }}</td>
            <td :class="{ reached: reached.seconds }">{{ padTime(time.seconds) }}</td>
            <td class="spacer" />
          </tr>
          <tr class="labels">
            <td class="spacer" />
            <td>jour{{ time.days > 1 ? 's' : '' }}</td>
            <td>heure{{ time.hours > 1 ? 's' : '' }}</td>
            <td>minute{{ time.minutes > 1 ? 's' : '' }}</td>
            <td>seconde{{ time.seconds > 1 ? 's' : '' }}</td>
            <td class="spacer" />
          </tr>
          <tr>
            <td class="road-cell" colspan="6">
              <TransportVehicle :position="progress" :participants="participants" class="vehicle" />
              <NuxtImg class="road" alt="Road" src="/assets/road.jpg" />
              <NuxtImg class="goal" alt="Destination" :src="goalImage" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.countdown-wrapper {
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

.road-cell {
  position: relative;
}

img.road {
  margin-top: 50px;
  height: 50px;
  width: 100%;
}

.vehicle {
  left: 0;
}

@media (max-width: 1250px) {
  .vehicle {
    left: 50px;
  }

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

.spacer {
  width: 100px;
}

@media (max-width: 1250px) {
  .spacer {
    width: 0;
  }
}
</style>
