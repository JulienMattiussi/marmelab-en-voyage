import type { MaybeRefOrGetter } from 'vue';

type ShareMeta = {
  title: MaybeRefOrGetter<string>;
  description: MaybeRefOrGetter<string>;
  // Absolute URL, or a path relative to the site root.
  image: MaybeRefOrGetter<string>;
  path: string;
};

// Open Graph and Twitter tags for link previews (Slack, LinkedIn, WhatsApp...).
export const useShareMeta = ({ title, description, image, path }: ShareMeta) => {
  const { origin } = useRequestURL();
  const absoluteImage = computed(() => {
    const src = toValue(image);
    return src.startsWith('http') ? src : `${origin}${src}`;
  });

  useSeoMeta({
    title,
    description,
    ogTitle: title,
    ogDescription: description,
    ogImage: absoluteImage,
    ogImageAlt: title,
    ogUrl: `${origin}${path}`,
    ogType: 'website',
    ogSiteName: SITE_NAME,
    ogLocale: 'fr_FR',
    twitterCard: 'summary_large_image',
    twitterTitle: title,
    twitterDescription: description,
    twitterImage: absoluteImage,
  });
};
