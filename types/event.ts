export type GlobalParticipant = {
  id: string;
  name: string;
  avatar: string; // e.g. /avatars/adrieng.png
  quote: string;
  active: boolean;
};

export type EventVisuals = {
  background: string; // e.g. /assets/back.png or /events/slug/back.png
  goal: string;       // e.g. /assets/goal.png or /events/slug/goal.png
};

export type Event = {
  slug: string;
  name: string;
  published: boolean;
  title: string;
  start: string;    // ISO date string
  deadline: string; // ISO date string
  visuals: EventVisuals;
  participants: string[]; // participant IDs
};

// Merged type used by BusImage
export type BusParticipant = {
  id: string;
  avatar: string;
  quote: string;
};
