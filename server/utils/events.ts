import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';
import type { Event, GlobalParticipant } from '~/types/event';

const eventsDir = () => join(process.cwd(), 'content', 'events');
const participantsPath = () => join(process.cwd(), 'content', 'participants.json');

export const readEvent = (slug: string): Event | null => {
  const path = join(eventsDir(), `${slug}.json`);
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, 'utf-8')) as Event;
};

export const writeEvent = (slug: string, data: Event): void => {
  const path = join(eventsDir(), `${slug}.json`);
  writeFileSync(path, JSON.stringify(data, null, 2), 'utf-8');
};

export const listEvents = (): Event[] => {
  const dir = eventsDir();
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => JSON.parse(readFileSync(join(dir, f), 'utf-8')) as Event);
};

export const readParticipants = (): GlobalParticipant[] => {
  const path = participantsPath();
  if (!existsSync(path)) return [];
  return JSON.parse(readFileSync(path, 'utf-8')) as GlobalParticipant[];
};

export const writeParticipants = (data: GlobalParticipant[]): void => {
  writeFileSync(participantsPath(), JSON.stringify(data, null, 2), 'utf-8');
};
