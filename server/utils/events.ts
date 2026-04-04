import { readFileSync, writeFileSync, existsSync, readdirSync } from '~/server/utils/fs';
import { join } from 'node:path';
import type { TripEvent, GlobalParticipant } from '~/types/event';

const eventsDir = () => join(process.cwd(), 'content', 'events');
const participantsPath = () => join(process.cwd(), 'content', 'participants.json');

const normalizeEvent = (raw: TripEvent): TripEvent => ({
  ...raw,
  // Participants may be stored as legacy objects { id, quote } — normalize to string IDs.
  participants: raw.participants.map((p) => (typeof p === 'string' ? p : (p as { id: string }).id)),
});

export const readEvent = (slug: string): TripEvent | null => {
  const path = join(eventsDir(), `${slug}.json`);
  if (!existsSync(path)) return null;
  return normalizeEvent(JSON.parse(readFileSync(path, 'utf-8')) as TripEvent);
};

export const writeEvent = (slug: string, data: TripEvent): void => {
  writeFileSync(join(eventsDir(), `${slug}.json`), JSON.stringify(data, null, 2), 'utf-8');
};

export const listEvents = (): TripEvent[] => {
  const dir = eventsDir();
  if (!existsSync(dir)) return [];
  return (readdirSync(dir) as string[])
    .filter((f) => f.endsWith('.json'))
    .map((f) => normalizeEvent(JSON.parse(readFileSync(join(dir, f), 'utf-8')) as TripEvent));
};

export const readParticipants = (): GlobalParticipant[] => {
  const path = participantsPath();
  if (!existsSync(path)) return [];
  return JSON.parse(readFileSync(path, 'utf-8')) as GlobalParticipant[];
};

export const writeParticipants = (data: GlobalParticipant[]): void => {
  writeFileSync(participantsPath(), JSON.stringify(data, null, 2), 'utf-8');
};
