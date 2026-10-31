import { getStorage } from './storage';
import type { ReadOptions } from './storage/types';
import { EVENT_THEME_LABELS } from '~/utils/constants';
import type { TripEvent, GlobalParticipant, EventTheme } from '~/types/event';

const normalizeEvent = (raw: TripEvent): TripEvent => ({
  ...raw,
  // Participants may be stored as legacy objects { id, quote } — normalize to string IDs.
  participants: raw.participants.map((p) => (typeof p === 'string' ? p : (p as { id: string }).id)),
});

/** Keeps a known theme; anything else (the editor sends '' for "no theme") removes it. */
export const withTheme = (data: TripEvent, theme: unknown): TripEvent => {
  const { theme: _, ...rest } = data;
  return typeof theme === 'string' && theme in EVENT_THEME_LABELS ? { ...rest, theme: theme as EventTheme } : rest;
};

export const readEvent = async (slug: string, options?: ReadOptions): Promise<TripEvent | null> => {
  const storage = await getStorage();
  const content = await storage.readJSON(`events/${slug}.json`, options);
  if (!content) return null;
  return normalizeEvent(JSON.parse(content) as TripEvent);
};

/** Raw write of the event file. API routes use writeEventWithPreview (eventPreview.ts), which also refreshes the link preview. */
export const writeEvent = async (slug: string, data: TripEvent): Promise<void> => {
  const storage = await getStorage();
  await storage.writeJSON(`events/${slug}.json`, JSON.stringify(data, null, 2));
};

export const listEvents = async (options?: ReadOptions): Promise<TripEvent[]> => {
  const storage = await getStorage();
  const keys = await storage.listJSONKeys('events');
  const contents = await Promise.all(keys.map((key) => storage.readJSON(key, options)));
  return contents
    .filter((c): c is string => c !== null)
    .map((c) => normalizeEvent(JSON.parse(c) as TripEvent));
};

export const deleteEvent = async (slug: string): Promise<void> => {
  const storage = await getStorage();
  await storage.deleteJSON(`events/${slug}.json`);
  await storage.deleteAssetsByPrefix(`events/${slug}`);
};

export const readParticipants = async (options?: ReadOptions): Promise<GlobalParticipant[]> => {
  const storage = await getStorage();
  const content = await storage.readJSON('participants.json', options);
  if (!content) return [];
  return JSON.parse(content) as GlobalParticipant[];
};

export const writeParticipants = async (data: GlobalParticipant[]): Promise<void> => {
  const storage = await getStorage();
  await storage.writeJSON('participants.json', JSON.stringify(data, null, 2));
};
