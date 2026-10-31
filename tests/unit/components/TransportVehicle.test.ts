import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import TransportVehicle from '~/components/TransportVehicle.vue';
import type { TransportParticipant } from '~/types/event';

const NuxtImg = {
  template: '<img :src="src" :alt="alt" />',
  props: ['src', 'alt'],
};

const participants: TransportParticipant[] = [
  { id: 'alice', name: 'Alice', avatar: '/avatars/alice.png', quote: 'Hello world!' },
  { id: 'bob', name: 'Bob', avatar: '/avatars/bob.png', quote: 'Bonjour!' },
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

  it('places the bus and the bubble at the given position', () => {
    const wrapper = mountVehicle({ position: 50 });
    expect(wrapper.find('.vehicle').attributes('style')).toContain('--position: 50%');
  });

  it('defaults position to 0 when not provided', () => {
    const wrapper = mountVehicle();
    expect(wrapper.find('.vehicle').attributes('style')).toContain('--position: 0%');
  });

  it('shows the avatar of the participant who speaks', () => {
    const wrapper = mountVehicle();
    expect(wrapper.find('.speech-bubble img').attributes('src')).toBe('/avatars/alice.png');
  });

  it('names the participant who speaks, shown when hovering the avatar', () => {
    const wrapper = mountVehicle();
    expect(wrapper.find('.speech-bubble img').attributes('alt')).toBe('Alice');
    expect(wrapper.find('.avatar-name').text()).toBe('Alice');
  });

  it('rotates to the next participant after 3 seconds', async () => {
    const wrapper = mountVehicle();
    expect(wrapper.text()).toContain('Hello world!');
    await vi.advanceTimersByTimeAsync(3_001);
    expect(wrapper.text()).toContain('Bonjour!');
  });

  it('holds the speech bubble while hovered', async () => {
    const wrapper = mountVehicle();
    await wrapper.find('.speech-bubble').trigger('mouseenter');
    await vi.advanceTimersByTimeAsync(6_001);
    expect(wrapper.text()).toContain('Hello world!');
    await wrapper.find('.speech-bubble').trigger('mouseleave');
    await vi.advanceTimersByTimeAsync(3_001);
    expect(wrapper.text()).toContain('Bonjour!');
  });

  it('honks when the bus is clicked, then stops', async () => {
    const wrapper = mountVehicle();
    await wrapper.find('button.bus').trigger('click');
    await vi.advanceTimersByTimeAsync(20);
    expect(wrapper.find('.honk').text()).toBe('Pouet !');
    await vi.advanceTimersByTimeAsync(1_000);
    expect(wrapper.find('.honk').exists()).toBe(false);
  });

  it('wraps back to the first participant after cycling through all', async () => {
    const wrapper = mountVehicle();
    // 2 participants → advance 2 × 3s to return to first
    await vi.advanceTimersByTimeAsync(6_001);
    expect(wrapper.text()).toContain('Hello world!');
  });
});
