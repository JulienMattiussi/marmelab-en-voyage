export type GlobalParticipant = {
  id: string;
  name: string;
  /** Public path to avatar image, e.g. /avatars/adrieng.png */
  avatar: string;
  quote: string;
  active: boolean;
  /** Link to the avatar's editable source (e.g. an sp-studio.de URL) */
  avatarSource?: string;
};

export type EventVisuals = {
  /** Public path to background image, e.g. /assets/back.png */
  background: string;
  /** Public path to destination image, e.g. /assets/goal.png */
  goal: string;
};

/** A marmelab trip event. Named TripEvent to avoid collision with the DOM Event type. */
export type TripEvent = {
  slug: string;
  name: string;
  published: boolean;
  /** Large heading shown on the event page */
  title: string;
  start: string;    // ISO date string
  deadline: string; // ISO date string
  visuals: EventVisuals;
  /** Ordered list of participant IDs for this event */
  participants: string[];
  /** Link-preview image (1200×630), regenerated on every save. Missing on events not saved since. */
  ogImage?: string;
};

/** A participant as needed by the transport vehicle component */
export type TransportParticipant = {
  id: string;
  name: string;
  avatar: string;
  quote: string;
};
