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
    <NuxtImg class="bus" alt="Transport" src="/assets/bus.png" />
  </div>
</template>

<style scoped>
.vehicle {
  --bus-width: 160px;
  --bus-height: 86px;
  /* bus.png has a transparent strip under the wheels */
  --bus-gap: 13px;
  --tail-bottom: 77px;
  position: absolute;
  inset: 0;
}

.bus {
  position: absolute;
  left: var(--position);
  bottom: calc(-1 * var(--bus-gap));
  width: var(--bus-width);
  height: var(--bus-height);
  /* `translate` (not `transform`), so the rocking rotation stays around the bus centre. */
  translate: -50% 0;
  animation: oscillating 0.5s infinite;
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
  max-width: min(460px, 100%);
  padding: 2px 16px 2px 2px;
  box-sizing: border-box;
  font-size: 0.95rem;
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

/* Full-body cartoon avatars: show them down to the waist. */
.avatar-frame {
  flex: none;
  display: flex;
  justify-content: center;
  width: 56px;
  height: 82px;
  overflow: hidden;
}

.avatar {
  flex: none;
  width: 94px;
  height: 94px;
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
  }

  .speech-bubble {
    font-size: 0.875rem;
    transform: translateX(calc(-1 * var(--anchor)));
  }

  .avatar-frame {
    width: 50px;
    height: 72px;
  }

  .avatar {
    width: 84px;
    height: 84px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .bus {
    animation: none;
  }
}
</style>
