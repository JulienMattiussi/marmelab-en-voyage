import { vi } from 'vitest';
import {
  ref,
  computed,
  reactive,
  watch,
  watchEffect,
  onMounted,
  onUnmounted,
  onBeforeUnmount,
  nextTick,
} from 'vue';

// Expose Vue composables as globals to mirror Nuxt's auto-import behaviour.
vi.stubGlobal('ref', ref);
vi.stubGlobal('computed', computed);
vi.stubGlobal('reactive', reactive);
vi.stubGlobal('watch', watch);
vi.stubGlobal('watchEffect', watchEffect);
vi.stubGlobal('onMounted', onMounted);
vi.stubGlobal('onUnmounted', onUnmounted);
vi.stubGlobal('onBeforeUnmount', onBeforeUnmount);
vi.stubGlobal('nextTick', nextTick);

// Mock Nuxt-specific globals.
vi.stubGlobal('useState', (_key: string, init: () => unknown) => ref(init()));
vi.stubGlobal('defineShortcuts', vi.fn());
vi.stubGlobal('definePageMeta', vi.fn());
vi.stubGlobal('useRoute', vi.fn(() => ({ params: {}, query: {} })));
vi.stubGlobal('useRouter', vi.fn(() => ({ push: vi.fn() })));
vi.stubGlobal('useFetch', vi.fn(() => ({ data: ref(null), error: ref(null), refresh: vi.fn() })));
vi.stubGlobal('$fetch', vi.fn());
vi.stubGlobal('createError', vi.fn((opts: { statusCode: number; message: string }) => new Error(opts.message)));
