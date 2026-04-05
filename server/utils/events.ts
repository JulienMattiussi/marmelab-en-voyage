import { getStorage } from './storage';
import type { TripEvent, GlobalParticipant } from '~/types/event';

const normalizeEvent = (raw: TripEvent): TripEvent => ({
  ...raw,
  // Participants may be stored as legacy objects { id, quote } — normalize to string IDs.
  participants: raw.participants.map((p) => (typeof p === 'string' ? p : (p as { id: string }).id)),
});

export const readEvent = async (slug: string): Promise<TripEvent | null> => {
  const storage = await getStorage();
  const content = await storage.readJSON(`events/${slug}.json`);
  if (!content) return null;
  return normalizeEvent(JSON.parse(content) as TripEvent);
};

export const writeEvent = async (slug: string, data: TripEvent): Promise<void> => {
  const storage = await getStorage();
  await storage.writeJSON(`events/${slug}.json`, JSON.stringify(data, null, 2));
};

export const listEvents = async (): Promise<TripEvent[]> => {
  const storage = await getStorage();
  const keys = await storage.listJSONKeys('events');
  const contents = await Promise.all(keys.map((key) => storage.readJSON(key)));
  return contents
    .filter((c): c is string => c !== null)
    .map((c) => normalizeEvent(JSON.parse(c) as TripEvent));
};

export const deleteEvent = async (slug: string): Promise<void> => {
  const storage = await getStorage();
  await storage.deleteJSON(`events/${slug}.json`);
  await storage.deleteAssetsByPrefix(`events/${slug}`);
};

export const readParticipants = async (): Promise<GlobalParticipant[]> => {
  const storage = await getStorage();
  const content = await storage.readJSON('participants.json');
  if (!content) return [];
  return JSON.parse(content) as GlobalParticipant[];
};

export const writeParticipants = async (data: GlobalParticipant[]): Promise<void> => {
  const storage = await getStorage();
  await storage.writeJSON('participants.json', JSON.stringify(data, null, 2));
};
