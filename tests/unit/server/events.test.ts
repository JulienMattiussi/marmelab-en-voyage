import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { TripEvent, GlobalParticipant } from '~/types/event';

// vi.mock is hoisted before imports — it must be declared here.
vi.mock('~/server/utils/fs', () => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
  readdirSync: vi.fn(),
}));

// These imports resolve AFTER the mock is hoisted, so events.ts gets the mocked fs.
import { existsSync, readFileSync, writeFileSync, readdirSync } from '~/server/utils/fs';
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
  it('returns null when the file does not exist', () => {
    vi.mocked(existsSync).mockReturnValue(false);
    expect(readEvent('unknown')).toBeNull();
  });

  it('parses and returns the event when the file exists', () => {
    vi.mocked(existsSync).mockReturnValue(true);
    vi.mocked(readFileSync).mockReturnValue(JSON.stringify(mockEvent) as never);
    expect(readEvent('test-event')).toEqual(mockEvent);
  });
});

describe('writeEvent', () => {
  it('serialises the event to JSON and writes it to disk', () => {
    vi.mocked(writeFileSync).mockReturnValue(undefined);
    writeEvent('test-event', mockEvent);
    expect(vi.mocked(writeFileSync)).toHaveBeenCalledOnce();
    const [, content] = vi.mocked(writeFileSync).mock.calls[0];
    expect(JSON.parse(content as string)).toEqual(mockEvent);
  });
});

describe('listEvents', () => {
  it('returns an empty array when the events directory does not exist', () => {
    vi.mocked(existsSync).mockReturnValue(false);
    expect(listEvents()).toEqual([]);
  });

  it('returns parsed events, ignoring non-JSON files', () => {
    vi.mocked(existsSync).mockReturnValue(true);
    vi.mocked(readdirSync).mockReturnValue(
      ['test-event.json', 'readme.txt'] as unknown as ReturnType<typeof readdirSync>,
    );
    vi.mocked(readFileSync).mockReturnValue(JSON.stringify(mockEvent) as never);
    const events = listEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toEqual(mockEvent);
  });
});

describe('readParticipants', () => {
  it('returns an empty array when the file does not exist', () => {
    vi.mocked(existsSync).mockReturnValue(false);
    expect(readParticipants()).toEqual([]);
  });

  it('parses and returns the participants list', () => {
    vi.mocked(existsSync).mockReturnValue(true);
    vi.mocked(readFileSync).mockReturnValue(
      JSON.stringify([mockParticipant]) as never,
    );
    expect(readParticipants()).toEqual([mockParticipant]);
  });
});
