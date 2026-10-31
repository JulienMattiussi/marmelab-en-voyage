import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import DrinkProgress from '~/components/DrinkProgress.vue';
import DrinkGlass from '~/components/DrinkGlass.vue';
import DrinkBottle from '~/components/DrinkBottle.vue';
import { DRINK_COUNT } from '~/utils/countdownMath';
import { DRINK_PANEL, glassLevel } from '~/utils/drinks';

const mountDrinkProgress = (drinks: number) =>
  mount(DrinkProgress, { props: { drinks }, global: { components: { DrinkGlass, DrinkBottle } } });

describe('DrinkProgress', () => {
  it(`draws ${DRINK_COUNT} glasses, of every kind`, () => {
    const glasses = mountDrinkProgress(0).findAll('svg');
    expect(glasses).toHaveLength(DRINK_COUNT);
    for (const kind of new Set(DRINK_PANEL)) {
      expect(glasses.some((g) => g.classes(`drink--${kind}`))).toBe(true);
    }
  });

  it('shows the full glasses', () => {
    const glasses = mountDrinkProgress(3).findAll('svg');
    expect(glasses.map((g) => g.classes('drink--full'))).toEqual([true, true, true, false, false, false, false, false, false]);
  });

  it('pours into the glass being filled only, with the bottle of its drink', () => {
    const glasses = mountDrinkProgress(3).findAll('svg');
    expect(glasses.map((g) => g.find('.bottle').exists())).toEqual([false, false, false, true, false, false, false, false, false]);
    expect(glasses[3]!.find('.bottle').classes()).toContain(`bottle--${DRINK_PANEL[3]}`);
  });

  it('says how many glasses are full', () => {
    expect(mountDrinkProgress(3).attributes('aria-label')).toBe(`3 verres sur ${DRINK_COUNT}`);
  });
});

describe('glassLevel', () => {
  it('fills the glasses already reached, pours the next two, leaves the others empty', () => {
    expect([1, 2, 3, 4, 5, 6].map((slot) => glassLevel(slot, 2))).toEqual([1, 1, 0.75, 0.25, 0, 0]);
  });
});
