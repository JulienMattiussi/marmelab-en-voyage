import type { MaybeRefOrGetter } from 'vue';

type ShareMeta = {
  title: MaybeRefOrGetter<string>;
  description: MaybeRefOrGetter<string>;
  // Absolute URL, or a path relative to the site root.
  image: MaybeRefOrGetter<string>;
  // True when the image is a preview card of OG_IMAGE_WIDTH×OG_IMAGE_HEIGHT (generated on save, or the home one):
  // declaring its size lets platforms show a large preview right away.
  isPreviewCard: MaybeRefOrGetter<boolean>;
  path: string;
};

// Open Graph and Twitter tags for link previews (Slack, LinkedIn, WhatsApp...).
export const useShareMeta = ({ title, description, image, isPreviewCard, path }: ShareMeta) => {
  const { origin } = useRequestURL();
  const absoluteImage = computed(() => {
    const src = toValue(image);
    return src.startsWith('http') ? src : `${origin}${src}`;
  });
  const cardSize = (size: number) => () => (toValue(isPreviewCard) ? size : undefined);

  useSeoMeta({
    title,
    description,
    ogTitle: title,
    ogDescription: description,
    ogImage: absoluteImage,
    ogImageWidth: cardSize(OG_IMAGE_WIDTH),
    ogImageHeight: cardSize(OG_IMAGE_HEIGHT),
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
