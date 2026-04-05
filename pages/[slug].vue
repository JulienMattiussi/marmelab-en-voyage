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

const { origin } = useRequestURL();

const ogImage = computed(() => {
  const src = event.value?.visuals.goal || event.value?.visuals.background || '/assets/goal.png';
  return src.startsWith('http') ? src : `${origin}${src}`;
});

useSeoMeta({
  title: () => event.value?.name ?? '',
  ogTitle: () => event.value?.name ?? '',
  ogDescription: () => event.value?.title ?? '',
  ogImage,
  ogUrl: `${origin}/${slug}`,
  ogType: 'website',
  twitterCard: 'summary_large_image',
});
</script>

<template>
  <EventPage
    v-if="event && globalParticipants"
    :event="event"
    :global-participants="globalParticipants"
  />
</template>
