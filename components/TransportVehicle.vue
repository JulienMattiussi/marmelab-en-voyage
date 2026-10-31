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

// Hovering the bubble holds it, to leave time to read the quote and the name.
const pauseSpeechBubble = () => clearTimeout(timer);

// Clicking the bus honks: a "Pouet !" and a little jump. A new click restarts both.
const honking = ref(false);
let honkTimer: ReturnType<typeof setTimeout>;

const honk = () => {
  clearTimeout(honkTimer);
  honking.value = false;
  requestAnimationFrame(() => {
    honking.value = true;
    honkTimer = setTimeout(() => { honking.value = false; }, 900);
  });
};

onMounted(rotateSpeechBubble);
onUnmounted(() => {
  clearTimeout(timer);
  clearTimeout(honkTimer);
});
</script>

<!--
  Laid out in a "lane" (the parent): its bottom is the road surface, its width the stretch
  the bus travels. The bus sits at --position; the bubble slides by about the same percentage
  of its own width, so it stays inside the lane and its tail (a child) ends right above the bus.
-->
<template>
  <div class="vehicle" :style="{ '--position': `${position}%` }">
    <div
      v-for="(participant, index) in participants"
      v-show="index === currentIndex"
      :key="participant.id"
      class="speech-bubble sticker"
      @mouseenter="pauseSpeechBubble"
      @mouseleave="rotateSpeechBubble"
    >
      <span class="avatar-hover">
        <span class="avatar-frame">
          <NuxtImg class="avatar" :alt="participant.name" :src="participant.avatar" preload />
        </span>
        <span class="avatar-name pill">{{ participant.name }}</span>
      </span>
      <span class="quote">{{ participant.quote }}</span>
      <svg class="bubble-tail" viewBox="0 0 24 22" aria-hidden="true">
        <path class="bubble-tail-fill" d="M1 0 H23 V2 L12 20 L1 2 Z" />
        <path class="bubble-tail-outline" d="M1 2 L12 20 L23 2" />
      </svg>
    </div>
    <button type="button" :class="['bus', { 'bus--honking': honking }]" aria-label="Klaxonner" @click="honk">
      <span class="exhaust" aria-hidden="true">
        <span v-for="puff in 3" :key="puff" class="puff" />
      </span>
      <!-- Rocks on the road, with what a theme loads on the roof (::before, see event-themes.css). -->
      <span class="bus-body">
        <NuxtImg class="bus-image" alt="" src="/assets/bus.png" />
      </span>
    </button>
    <span v-if="honking" class="honk pill" aria-hidden="true">Pouet !</span>
  </div>
</template>

<style scoped>
.vehicle {
  --bus-width: 160px;
  --bus-height: 86px;
  /* bus.png has a transparent strip under the wheels */
  --bus-gap: 13px;
  --tail-bottom: 77px;
  --avatar-size: 130px;
  /* Shown down to the waist. */
  --avatar-visible-height: 113px;
  position: absolute;
  inset: 0;
}

.bus {
  position: absolute;
  left: var(--position);
  bottom: calc(-1 * var(--bus-gap));
  width: var(--bus-width);
  height: var(--bus-height);
  padding: 0;
  background: none;
  border: none;
  cursor: pointer;
  /* `translate` for the position, `transform` for the jump: they add up. */
  translate: -50% 0;
}

.bus:focus-visible {
  outline: var(--public-border);
  outline-offset: 4px;
  border-radius: var(--public-radius);
}

.bus-body {
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
  animation: oscillating 0.5s infinite;
}

.bus-image {
  display: block;
  width: 100%;
  height: 100%;
}

.bus--honking {
  animation: jump 0.5s ease-out;
}

@keyframes jump {
  0%, 100% { transform: translateY(0); }
  35%      { transform: translateY(-22px) rotate(-4deg); }
  70%      { transform: translateY(0) rotate(2deg); }
}

.honk {
  position: absolute;
  left: calc(var(--position) + var(--bus-width) / 2);
  bottom: calc(var(--bus-height) - var(--bus-gap));
  padding: 2px 10px;
  font-family: var(--public-font-display);
  font-size: 1rem;
  white-space: nowrap;
  rotate: 8deg;
  animation: honk-pop 0.9s ease-out forwards;
}

@keyframes honk-pop {
  0%   { opacity: 0; scale: 0.4; }
  20%  { opacity: 1; scale: 1.1; }
  80%  { opacity: 1; scale: 1; }
  100% { opacity: 0; scale: 1; }
}

/* Little smoke puffs out of the exhaust, at the back of the bus (it drives to the right). */
.exhaust {
  position: absolute;
  left: 12%;
  bottom: 30%;
}

.puff {
  position: absolute;
  width: 14px;
  height: 14px;
  background: var(--public-paper);
  border: var(--public-border);
  border-radius: 50%;
  opacity: 0;
  animation: puff 1.5s ease-out infinite;
}

.puff:nth-child(2) { animation-delay: 0.5s; }
.puff:nth-child(3) { animation-delay: 1s; }

@keyframes puff {
  0%   { opacity: 0; translate: 0 0; scale: 0.4; }
  15%  { opacity: 0.9; }
  100% { opacity: 0; translate: -34px -18px; scale: 1.3; }
}

@keyframes oscillating {
  0%   { rotate: 3deg; }
  25%  { rotate: 0deg; }
  50%  { rotate: -3deg; }
  75%  { rotate: 0deg; }
  100% { rotate: 3deg; }
}

.speech-bubble {
  position: absolute;
  left: var(--position);
  /* The tail tip (16px below the bubble) lands at --tail-bottom, just above the bus. */
  bottom: calc(var(--tail-bottom) + 16px);
  display: flex;
  align-items: center;
  gap: 6px;
  width: max-content;
  max-width: min(520px, 100%);
  padding: 2px 18px 2px 2px;
  box-sizing: border-box;
  font-size: 1.1rem;
  font-weight: 700;
  line-height: 1.25;
  text-align: left;
  /* Where the tail joins, as a share of the bubble width: kept away from the rounded corners. */
  --anchor: clamp(12%, var(--position), 88%);
  transform: translateX(calc(-1 * var(--anchor))) rotate(-2deg);
  /* Tilt around the point where the tail joins, so they stay attached wherever the bus is. */
  transform-origin: var(--anchor) 100%;
}

/* Holds the name pill outside the frame, which clips the avatar. */
.avatar-hover {
  position: relative;
  flex: none;
}

.avatar-name {
  position: absolute;
  bottom: calc(100% + 6px);
  left: 50%;
  translate: -50% 0;
  padding: 2px 10px;
  font-size: 0.8rem;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.15s;
}

.avatar-hover:hover .avatar-name {
  opacity: 1;
}

/*
  Full-body cartoon avatars: show them down to the waist. Full width, since the PNGs have a
  transparent background and hair or accessories can reach the sides.
*/
.avatar-frame {
  flex: none;
  display: flex;
  height: var(--avatar-visible-height);
  overflow: hidden;
}

.avatar {
  flex: none;
  width: var(--avatar-size);
  height: var(--avatar-size);
  max-width: none;
}

/*
  Child of the bubble, so it tilts with it. Its paper fill starts 2px above the bottom border
  and covers it entirely where they join (no antialiased hairline left), and it casts the same
  hard shadow as the bubble: together they read as one sticker.
*/
.bubble-tail {
  position: absolute;
  left: var(--anchor);
  top: calc(100% - 2px);
  width: 24px;
  height: 22px;
  overflow: visible;
  transform: translateX(-50%);
  filter: drop-shadow(var(--public-shadow));
}

.bubble-tail-fill {
  fill: var(--public-paper);
}

.bubble-tail-outline {
  fill: none;
  stroke: var(--public-ink);
  stroke-width: 2;
  stroke-linejoin: round;
}

@media (max-width: 760px) {
  .vehicle {
    --bus-width: 104px;
    --bus-height: 56px;
    --bus-gap: 8px;
    --tail-bottom: 52px;
    --avatar-size: 84px;
    --avatar-visible-height: 72px;
  }

  .speech-bubble {
    font-size: 0.875rem;
    padding-right: 16px;
    transform: translateX(calc(-1 * var(--anchor)));
  }
}

@media (prefers-reduced-motion: reduce) {
  .bus-body,
  .bus--honking,
  .puff {
    animation: none;
  }
}
</style>
