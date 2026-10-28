<script setup lang="ts">
import type { TripEvent, GlobalParticipant } from '~/types/event';

const route = useRoute();
const slug = route.params.slug as string;

const [{ data: event, error }, { data: globalParticipants, error: participantsError }] = await Promise.all([
  useFetch<TripEvent>(`/api/events/${slug}`),
  useFetch<GlobalParticipant[]>('/api/participants'),
]);

// Only a missing event is a 404: a storage failure must not look like a deleted event.
const fetchError = error.value ?? participantsError.value;
if (fetchError) {
  throw createError(
    fetchError.statusCode === 404
      ? { statusCode: 404, message: `Event "${slug}" not found` }
      : { statusCode: fetchError.statusCode ?? 500, message: loadErrorMessage(fetchError) },
  );
}

useShareMeta({
  title: () => event.value?.name ?? '',
  description: () => event.value?.title ?? '',
  image: () => event.value?.visuals.goal || event.value?.visuals.background || '/assets/goal.png',
  path: `/${slug}`,
});
</script>

<template>
  <EventPage
    v-if="event && globalParticipants"
    :event="event"
    :global-participants="globalParticipants"
  />
</template>
