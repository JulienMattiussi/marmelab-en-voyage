<script setup lang="ts">
import { DRINK_COUNT } from '~/utils/countdownMath';
import { DRINK_PANEL, glassLevel } from '~/utils/drinks';

const { drinks = 0 } = defineProps<{
  /** Number of glasses full so far (0–DRINK_COUNT) */
  drinks?: number;
}>();
</script>

<template>
  <div class="drink-row sticker" :aria-label="`${drinks} verres sur ${DRINK_COUNT}`" role="img">
    <DrinkGlass
      v-for="slot in DRINK_COUNT"
      :key="slot"
      class="drink-slot"
      :kind="DRINK_PANEL[(slot - 1) % DRINK_PANEL.length]!"
      :level="glassLevel(slot, drinks)"
      :pouring="slot === drinks + 1"
      :style="{ '--drip-delay': `${-slot * 1.3}s` }"
    />
  </div>
</template>

<style scoped>
.drink-row {
  display: flex;
  justify-content: center;
  gap: 4px;
  padding: 6px 12px;
}

.drink-slot {
  width: 44px;
  height: 44px;
}

@media (max-width: 760px) {
  .drink-row {
    gap: 1px;
    padding: 4px 8px;
  }

  .drink-slot {
    width: 32px;
    height: 32px;
  }
}
</style>
