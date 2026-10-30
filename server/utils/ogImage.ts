import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { OG_IMAGE_WIDTH, OG_IMAGE_HEIGHT } from '~/utils/constants';

// Satori renders plain style objects, not CSS: these mirror the --public-* variables of theme.css.
const INK = '#1b1b1b';
const PAPER = '#ffffff';
const SKY = '#d6ebff';
const SUN = '#ffd23f';
const ROAD = '#3a3a3a';
const VEIL_OPACITY = 0.55;

type Style = Record<string, string | number>;
type Node = { type: string; props: { style?: Style; src?: string; children?: Child | Child[] } };
type Child = Node | string;

// Minimal element factory: Satori takes React-like { type, props } objects, no JSX needed.
const h = (type: string, style: Style, ...children: Child[]): Node => ({
  type,
  props: { style: { display: 'flex', ...style }, children },
});

const img = (src: string, style: Style): Node => ({ type: 'img', props: { src, style } });

let fontsPromise: Promise<{ name: string; data: ArrayBuffer; weight: 500 | 700 | 800 }[]> | undefined;

// TTF files bundled in server/assets/fonts (Satori does not read WOFF2).
const loadFonts = () => {
  fontsPromise ??= (async () => {
    const storage = useStorage('assets:server');
    const read = async (file: string) => {
      const raw = await storage.getItemRaw<Buffer | Uint8Array>(`fonts/${file}`);
      if (!raw) throw new Error(`Missing font ${file}`);
      const bytes = new Uint8Array(raw);
      return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
    };
    return [
      { name: 'Bricolage Grotesque', data: await read('BricolageGrotesque-ExtraBold.ttf'), weight: 800 as const },
      { name: 'DM Sans', data: await read('DMSans-Medium.ttf'), weight: 500 as const },
      { name: 'DM Sans', data: await read('DMSans-Bold.ttf'), weight: 700 as const },
    ];
  })();
  return fontsPromise;
};

const sticker = (text: string, background: string, fontSize: number): Node =>
  h('div', {
    alignSelf: 'flex-start',
    padding: '8px 22px',
    fontFamily: 'DM Sans',
    fontWeight: 700,
    fontSize,
    background,
    border: `3px solid ${INK}`,
    borderRadius: 999,
    boxShadow: `5px 5px 0 ${INK}`,
  }, text);

const road = (busImage: string, goalImage: string): Node =>
  h('div', { position: 'absolute', left: 64, right: 64, bottom: 56, height: 190 },
    h('div', {
      position: 'absolute', left: 0, right: 0, bottom: 0, height: 56,
      alignItems: 'center', justifyContent: 'space-between', padding: '0 22px',
      background: ROAD, border: `4px solid ${INK}`, borderRadius: 14,
    }, ...Array.from({ length: 22 }, () => h('div', { width: 22, height: 5, background: SUN }))),
    img(busImage, { position: 'absolute', left: 300, bottom: 22, width: 220, height: 118 }),
    img(goalImage, { position: 'absolute', right: -16, bottom: 34, width: 190, height: 190, objectFit: 'contain' }),
  );

type OgCard = {
  /** Small sticker above the title (event name, or nothing on the home page). */
  label?: string;
  title: string;
  /** Yellow pill under the title, e.g. "RDV jeudi 26 novembre, 9 h". */
  pill?: string;
  background: string;
  goal: string;
  bus: string;
};

/** Link-preview card (PNG) in the style of the public pages: backdrop, big title, RDV pill, the bus on its road. */
export const renderOgImage = async (card: OgCard): Promise<Buffer> => {
  const { label, title, pill } = card;
  const [background, goal, bus] = await Promise.all([
    toDataUri(card.background),
    toDataUri(card.goal),
    toDataUri(card.bus),
  ]);

  const tree = h('div', { width: '100%', height: '100%', position: 'relative', background: SKY, color: INK },
    img(background, { position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', objectFit: 'cover' }),
    h('div', { position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', background: SKY, opacity: VEIL_OPACITY }),
    h('div', { position: 'absolute', left: 64, top: 56, right: 64, flexDirection: 'column', gap: 26 },
      ...(label ? [sticker(label, PAPER, 26)] : []),
      h('div', {
        fontFamily: 'Bricolage Grotesque', fontWeight: 800, fontSize: 92, lineHeight: 0.95,
        letterSpacing: '-0.03em', maxWidth: 1000,
      }, title),
      ...(pill ? [sticker(pill, SUN, 34)] : []),
    ),
    road(bus, goal),
  );

  // Satori lays the card out as SVG, resvg turns it into a PNG.
  const svg = await satori(tree as never, { width: OG_IMAGE_WIDTH, height: OG_IMAGE_HEIGHT, fonts: await loadFonts() });
  return new Resvg(svg, { fitTo: { mode: 'width', value: OG_IMAGE_WIDTH } }).render().asPng();
};

/** Absolute URL for an image: it is downloaded by the server, so site paths need the site origin. */
export const absoluteUrl = (src: string, origin: string) => (src.startsWith('http') ? src : `${origin}${src}`);

// Images are handed to Satori as data URIs: it refuses to download from some addresses
// (localhost in dev), and this way a missing image fails here with a clear message.
const toDataUri = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) throw createError({ statusCode: 502, message: `Image unavailable: ${url}` });
  const type = response.headers.get('content-type') ?? 'image/png';
  const base64 = Buffer.from(await response.arrayBuffer()).toString('base64');
  return `data:${type};base64,${base64}`;
};
