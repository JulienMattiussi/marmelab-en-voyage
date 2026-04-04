import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import TransportVehicle from '~/components/TransportVehicle.vue';
import type { TransportParticipant } from '~/types/event';

const NuxtImg = {
  template: '<img :src="src" :alt="alt" />',
  props: ['src', 'alt'],
};

const participants: TransportParticipant[] = [
  { id: 'alice', avatar: '/avatars/alice.png', quote: 'Hello world!' },
  { id: 'bob', avatar: '/avatars/bob.png', quote: 'Bonjour!' },
];

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

const mountVehicle = (props = {}) =>
  mount(TransportVehicle, {
    props: { participants, ...props },
    global: { stubs: { NuxtImg } },
    attachTo: document.body,
  });

describe('TransportVehicle', () => {
  it('renders the first participant quote initially', () => {
    const wrapper = mountVehicle();
    expect(wrapper.text()).toContain('Hello world!');
  });

  it('applies the correct position via margin-left style', () => {
    const wrapper = mountVehicle({ position: 50 });
    expect(wrapper.find('.vehicle').attributes('style')).toContain('calc(50% - 100px)');
  });

  it('defaults position to 0 when not provided', () => {
    const wrapper = mountVehicle();
    expect(wrapper.find('.vehicle').attributes('style')).toContain('calc(0% - 100px)');
  });

  it('rotates to the next participant after 3 seconds', async () => {
    const wrapper = mountVehicle();
    expect(wrapper.text()).toContain('Hello world!');
    await vi.advanceTimersByTimeAsync(3_001);
    expect(wrapper.text()).toContain('Bonjour!');
  });

  it('wraps back to the first participant after cycling through all', async () => {
    const wrapper = mountVehicle();
    // 2 participants → advance 2 × 3s to return to first
    await vi.advanceTimersByTimeAsync(6_001);
    expect(wrapper.text()).toContain('Hello world!');
  });
});
