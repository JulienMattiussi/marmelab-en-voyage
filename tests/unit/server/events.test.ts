import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { StorageDriver } from '~/server/utils/storage/types';
import type { TripEvent, GlobalParticipant } from '~/types/event';

// vi.hoisted runs before imports — lets us share mockStorage with the vi.mock factory below.
const mockStorage = vi.hoisted(
  (): StorageDriver => ({
    readJSON: vi.fn(),
    writeJSON: vi.fn(),
    listJSONKeys: vi.fn(),
    deleteJSON: vi.fn(),
    putAsset: vi.fn(),
    deleteAssetsByPrefix: vi.fn(),
  }),
);

vi.mock('~/server/utils/storage/index', () => ({
  getStorage: vi.fn().mockResolvedValue(mockStorage),
  setStorageDriver: vi.fn(),
  resetStorageDriver: vi.fn(),
}));

// eslint-disable-next-line import/first
import { readEvent, writeEvent, listEvents, readParticipants } from '~/server/utils/events';

const mockEvent: TripEvent = {
  slug: 'test-event',
  name: 'Test Event',
  published: true,
  title: 'Test title',
  start: '2025-01-01T00:00:00.000Z',
  deadline: '2025-06-01T00:00:00.000Z',
  visuals: { background: '/bg.png', goal: '/goal.png' },
  participants: ['alice'],
};

const mockParticipant: GlobalParticipant = {
  id: 'alice',
  name: 'Alice',
  avatar: '/avatars/alice.png',
  quote: 'Hello!',
  active: true,
};

beforeEach(() => vi.clearAllMocks());

describe('readEvent', () => {
  it('returns null when the file does not exist', async () => {
    vi.mocked(mockStorage.readJSON).mockResolvedValue(null);
    expect(await readEvent('unknown')).toBeNull();
  });

  it('parses and returns the event when the file exists', async () => {
    vi.mocked(mockStorage.readJSON).mockResolvedValue(JSON.stringify(mockEvent));
    expect(await readEvent('test-event')).toEqual(mockEvent);
  });
});

describe('writeEvent', () => {
  it('serialises the event to JSON and writes it', async () => {
    vi.mocked(mockStorage.writeJSON).mockResolvedValue(undefined);
    await writeEvent('test-event', mockEvent);
    expect(vi.mocked(mockStorage.writeJSON)).toHaveBeenCalledOnce();
    const [, content] = vi.mocked(mockStorage.writeJSON).mock.calls[0];
    expect(JSON.parse(content)).toEqual(mockEvent);
  });
});

describe('listEvents', () => {
  it('returns an empty array when there are no events', async () => {
    vi.mocked(mockStorage.listJSONKeys).mockResolvedValue([]);
    expect(await listEvents()).toEqual([]);
  });

  it('returns parsed events', async () => {
    vi.mocked(mockStorage.listJSONKeys).mockResolvedValue(['events/test-event.json']);
    vi.mocked(mockStorage.readJSON).mockResolvedValue(JSON.stringify(mockEvent));
    const events = await listEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toEqual(mockEvent);
  });
});

describe('readParticipants', () => {
  it('returns an empty array when there are no participants', async () => {
    vi.mocked(mockStorage.readJSON).mockResolvedValue(null);
    expect(await readParticipants()).toEqual([]);
  });

  it('parses and returns the participants list', async () => {
    vi.mocked(mockStorage.readJSON).mockResolvedValue(JSON.stringify([mockParticipant]));
    expect(await readParticipants()).toEqual([mockParticipant]);
  });
});
