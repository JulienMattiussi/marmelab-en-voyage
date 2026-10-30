import type { H3Event } from 'h3';
import { writeEvent } from './events';
import { getStorage } from './storage';
import { renderOgImage, absoluteUrl } from './ogImage';
import { formatRendezVous } from '~/utils/date';
import type { TripEvent } from '~/types/event';

/**
 * Saves an event after drawing its link-preview image, so social platforms get a ready-made file.
 * The image is stored next to the event visuals (removed with them on delete). A drawing failure
 * never blocks the save: the page then falls back to the destination image.
 */
export const writeEventWithPreview = async (event: H3Event, data: TripEvent): Promise<TripEvent> => {
  let saved = data;
  try {
    const { origin } = getRequestURL(event);
    const png = await renderOgImage({
      label: data.name,
      title: data.title || data.name,
      pill: formatRendezVous(data.deadline),
      background: absoluteUrl(data.visuals.background || '/assets/back.png', origin),
      goal: absoluteUrl(data.visuals.goal || '/assets/goal.png', origin),
      bus: absoluteUrl('/assets/bus.png', origin),
    });
    const storage = await getStorage();
    const url = await storage.putAsset(`events/${data.slug}/og.png`, png, 'image/png');
    // A new URL on each save, so platforms that already cached the preview fetch the new one.
    saved = { ...data, ogImage: `${url}?v=${Date.now()}` };
  } catch (e) {
    console.error(`Preview image of "${data.slug}" not generated`, e);
  }
  await writeEvent(data.slug, saved);
  return saved;
};
