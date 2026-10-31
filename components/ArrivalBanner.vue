<template>
  <div class="arrival">
    <p class="arrival-banner sticker sticker--bold">On y est&nbsp;!</p>
    <FallingParticles kind="confetti" :count="80" />
  </div>
</template>

<style scoped>
/* Takes the place of the countdown tiles, about the same height. */
.arrival-banner {
  margin: 0;
  padding: 18px 28px;
  font-family: var(--public-font-display);
  font-size: 5.5rem;
  font-weight: 800;
  line-height: 1;
  text-align: center;
  background: var(--color-countdown-reached);
  animation: bounce-in 0.8s ease-out;
}

@keyframes bounce-in {
  0%   { scale: 0.3; opacity: 0; }
  60%  { scale: 1.06; opacity: 1; }
  100% { scale: 1; }
}

@media (max-width: 760px) {
  .arrival-banner {
    font-size: 3.25rem;
    padding: 14px 18px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .arrival-banner {
    animation: none;
  }
}
</style>
