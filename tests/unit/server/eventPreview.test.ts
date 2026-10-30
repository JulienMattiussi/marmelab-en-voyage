import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { TripEvent } from '~/types/event';

const mocks = vi.hoisted(() => ({
  renderOgImage: vi.fn(),
  putAsset: vi.fn(),
  writeEvent: vi.fn(),
}));

vi.mock('~/server/utils/ogImage', () => ({
  renderOgImage: mocks.renderOgImage,
  absoluteUrl: (src: string, origin: string) => (src.startsWith('http') ? src : `${origin}${src}`),
}));
vi.mock('~/server/utils/storage', () => ({
  getStorage: vi.fn().mockResolvedValue({ putAsset: mocks.putAsset }),
}));
vi.mock('~/server/utils/events', () => ({ writeEvent: mocks.writeEvent }));

vi.stubGlobal('getRequestURL', () => new URL('https://example.com/api/events'));

// eslint-disable-next-line import/first
import { writeEventWithPreview } from '~/server/utils/eventPreview';

const tripEvent: TripEvent = {
  slug: 'hiver-2026',
  name: 'Hiver 2026',
  published: true,
  title: 'Happy Christmas Marmelab',
  start: '2026-10-28T08:22',
  deadline: '2026-11-26T09:00',
  visuals: { background: '', goal: 'https://blob.example/goal.png' },
  participants: [],
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

describe('writeEventWithPreview', () => {
  it('draws the preview card from the event and stores it next to the visuals', async () => {
    mocks.renderOgImage.mockResolvedValue(Buffer.from('png'));
    mocks.putAsset.mockResolvedValue('https://blob.example/events/hiver-2026/og.png');

    const saved = await writeEventWithPreview({} as never, tripEvent);

    expect(mocks.renderOgImage).toHaveBeenCalledWith({
      label: 'Hiver 2026',
      title: 'Happy Christmas Marmelab',
      pill: 'RDV jeudi 26 novembre, 9 h',
      background: 'https://example.com/assets/back.png',
      goal: 'https://blob.example/goal.png',
      bus: 'https://example.com/assets/bus.png',
    });
    expect(mocks.putAsset).toHaveBeenCalledWith('events/hiver-2026/og.png', expect.any(Buffer), 'image/png');
    expect(saved.ogImage).toMatch(/^https:\/\/blob\.example\/events\/hiver-2026\/og\.png\?v=\d+$/);
    expect(mocks.writeEvent).toHaveBeenCalledWith('hiver-2026', saved);
  });

  it('still saves the event when the preview cannot be drawn', async () => {
    mocks.renderOgImage.mockRejectedValue(new Error('Image unavailable'));

    const saved = await writeEventWithPreview({} as never, tripEvent);

    expect(saved).toEqual(tripEvent);
    expect(mocks.writeEvent).toHaveBeenCalledWith('hiver-2026', tripEvent);
  });
});
