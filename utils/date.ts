const HAS_ZONE = /([zZ]|[+-]\d{2}:?\d{2})$/;

/**
 * Formats the trip date as shown everywhere (page, home cards, link previews):
 * "RDV jeudi 26 novembre, 9 h" or "RDV mercredi 21 mai, 17 h 30".
 *
 * Dates typed in the admin ("2026-11-26T09:00") carry no time zone and are the wall time
 * of the trip: they are shown as is, whatever the time zone of the server or the browser,
 * so SSR and hydration agree. Older dates stored with a zone ("…Z") are shown in Paris time.
 */
export const formatRendezVous = (value: string): string => {
  const hasZone = HAS_ZONE.test(value);
  const date = new Date(hasZone ? value : `${value}Z`);
  if (Number.isNaN(date.getTime())) return '';

  const timeZone = hasZone ? 'Europe/Paris' : 'UTC';
  const day = new Intl.DateTimeFormat('fr-FR', { timeZone, weekday: 'long', day: 'numeric', month: 'long' }).format(date);
  const parts = new Intl.DateTimeFormat('fr-FR', { timeZone, hour: 'numeric', minute: '2-digit', hourCycle: 'h23' })
    .formatToParts(date);
  const hour = Number(parts.find((p) => p.type === 'hour')?.value);
  const minute = parts.find((p) => p.type === 'minute')?.value ?? '00';

  return `RDV ${day}, ${hour} h${minute === '00' ? '' : ` ${minute}`}`;
};
