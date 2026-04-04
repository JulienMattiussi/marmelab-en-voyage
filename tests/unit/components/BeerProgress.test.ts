import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import BeerProgress from '~/components/BeerProgress.vue';
import { BEER_COUNT } from '~/utils/countdownMath';

// Stub NuxtImg so we can inspect the src attributes without a Nuxt runtime.
const NuxtImg = {
  template: '<img :src="src" :alt="alt" />',
  props: ['src', 'alt'],
};

const mountBeerProgress = (beers: number) =>
  mount(BeerProgress, {
    props: { beers },
    global: { stubs: { NuxtImg } },
  });

describe('BeerProgress', () => {
  it(`renders exactly ${BEER_COUNT} beer slots`, () => {
    const wrapper = mountBeerProgress(0);
    expect(wrapper.findAll('img')).toHaveLength(BEER_COUNT);
  });

  it('shows beer.gif for each consumed beer', () => {
    const wrapper = mountBeerProgress(3);
    const imgs = wrapper.findAll('img');
    for (let i = 0; i < 3; i++) {
      expect(imgs[i].attributes('src')).toContain('beer.gif');
    }
  });

  it('shows beer_last.png for the next beer after consumed ones', () => {
    const wrapper = mountBeerProgress(3);
    const imgs = wrapper.findAll('img');
    expect(imgs[3].attributes('src')).toContain('beer_last');
  });

  it('shows beer_prelast.png for the beer two steps ahead', () => {
    const wrapper = mountBeerProgress(3);
    const imgs = wrapper.findAll('img');
    expect(imgs[4].attributes('src')).toContain('beer_prelast');
  });

  it('shows beer.png for future unconsumed beers', () => {
    const wrapper = mountBeerProgress(0);
    const imgs = wrapper.findAll('img');
    // Slot 1 is "last", slot 2 is "prelast", rest are static
    expect(imgs[2].attributes('src')).toContain('beer.png');
  });

  it('shows all beers as consumed when beers equals BEER_COUNT', () => {
    const wrapper = mountBeerProgress(BEER_COUNT);
    const imgs = wrapper.findAll('img');
    for (let i = 0; i < BEER_COUNT; i++) {
      expect(imgs[i].attributes('src')).toContain('beer.gif');
    }
  });
});
