<script setup lang="ts">
import type { TripEvent, GlobalParticipant } from '~/types/event';

const route = useRoute();
const slug = route.params.slug as string;

const [{ data: event, error }, { data: globalParticipants }] = await Promise.all([
  useFetch<TripEvent>(`/api/events/${slug}`),
  useFetch<GlobalParticipant[]>('/api/participants'),
]);

if (error.value) {
  throw createError({ statusCode: 404, message: `Event "${slug}" not found` });
}
</script>

<template>
  <EventPage
    v-if="event && globalParticipants"
    :event="event"
    :global-participants="globalParticipants"
  />
</template>
