import ms from 'ms';

import type { Color } from 'etc/types';
import type { BackgroundImageOverrides } from 'web/etc/types';

const VITE_TITLE = import.meta.env.VITE_TITLE as string | undefined;
const VITE_BUCKET_URL = import.meta.env.VITE_BUCKET_URL as string | undefined;

/**
 * Document title to use.
 */
export const TITLE = VITE_TITLE;
if (!TITLE) throw new Error('TITLE is not set.');

/**
 * AWS S3 Bucket URL.
 */
export const BUCKET_URL = VITE_BUCKET_URL as string;
if (!BUCKET_URL) throw new Error('BUCKET_URL is not set.');

// ----- Backgrounds -----------------------------------------------------------

/**
 * Duration of the opacity transition when the background image changes. This
 * should be a valid CSS transition-duration value.
 *
 * N.B. This value is shared between various components to coordinate
 * animations.
 */
export const BACKGROUND_TRANSITION_DURATION = import.meta.env.NODE_ENV === 'production'
  ? '5s'
  : '720ms';

/**
 * Transition timing function used when the background image changes. This must
 * be a valid CSS transition-timing-function value.
 *
 * N.B. This value is shared between various components to coordinate
 * animations.
 */
export const BACKGROUND_TRANSITION_FUNCTION = import.meta.env.NODE_ENV === 'production'
  ? 'ease-in-out'
  : 'ease-in-out';

/**
 * Duration for the custom animation applied to a background image when it comes
 * into view.
 */
export const BACKGROUND_ANIMATION_DURATION = ms('100s');

/**
 * Adjusts the initial scale for the background zoom-out animation. Also passed
 * to IMGIX to control the size to render full-quality images at.
 *
 * Should be a value greater than 1.
 */
export const BACKGROUND_ANIMATION_INITIAL_SCALE = 1.5 as const;

/**
 * How long image collection data may persist in the cache before it must be
 * updated.
 */
export const CACHE_TTL = ms('1 day');

/**
 * Storage key used to cache the photo collection.
 */
export const COLLECTION_CACHE_KEY = 'photoCollections';

/**
 * Storage key used for the current photo.
 */
export const CURRENT_PHOTO_CACHE_KEY = 'currentPhoto';

/**
 * Default font family string to use.
 */
export const DEFAULT_FONTS = [
  '-apple-system',
  'BlinkMacSystemFont',
  '"Segoe UI"',
  'Helvetica',
  'Arial',
  'sans-serif'
];

/**
 * Image quality to use for full-quality images.
 */
export const QUALITY_FULL = 100 as const;

/**
 * Image quality to use for low-quality image previews.
 */
export const QUALITY_LQIP = 50 as const;

/**
 * When using weighted categories, this is the weight that will be assigned to
 * photos not belonging to any weighted categories.
 */
export const PHOTO_DEFAULT_WEIGHT = 0.5 as const;

// ----- Dev Tools -------------------------------------------------------------

/**
 * Basis for computing various attributes of the Source and Swatch components.
 */
export const BASIS = '34px';
export const BLACK: Color  = {r: 0, g: 0, b: 0};
export const WHITE: Color = {r: 255, g: 255, b: 255};

/**
 * After the mouse leaves the DevTools container, it will wait this amount of
 * time and then hide itself.
 */
export const DEVTOOLS_MOUSE_LEAVE_TIMEOUT = ms('4 seconds');

// ----- Image Tuning Overrides ------------------------------------------------

/**
 * Map of Unsplash photo IDs to various CSS overrides for that image.
 */
export const BACKGROUND_RULE_OVERRIDES: {[key: string]: BackgroundImageOverrides} = {
  'sMQiL_2v4vs': { backdrop: { backgroundOpacity: 0.4, blurRadius: '0.5px' } },
  'iqeG5xA96M4': { backdrop: { backgroundOpacity: 0.3, blurRadius: '0.5px' } },
  '-6jxbP3-N1I': { backdrop: { backgroundOpacity: 0.3, blurRadius: '1px' } },
  'C8Z5DvtWQMw': { backdrop: { backgroundOpacity: 0.3, blurRadius: '0.5px' } },
  'HUiNRjXr-bQ': { backdrop: { blurRadius: '4px' } },
  'YHdztOlV9bc': { backdrop: { backgroundOpacity: 0.3 } },
  '_QoAuZGAoPY': { backdrop: { backgroundOpacity: 0.5 } },
  'iciBcD8NOeA': { backgroundPosition: 'center top' },
  'q-fr4QsIyic': { backgroundPosition: 'center top' },
  'U7gbwg2fjCs': { backgroundPosition: 'center bottom' },
  '9h2CRu-lqyw': { backgroundPosition: 'center bottom' },
  'IdYeC0NqNls': { backgroundPosition: 'bottom center' },
  'Do6yoytec5E': { backgroundPosition: 'center top' },
  'bDVnmzmW4a0': { backgroundPosition: 'center bottom' },
  '85f8mC4SRzk': { backgroundPosition: 'center 15%' },
  'pn2aVMO0lvE': { backgroundPosition: 'center bottom' },
  '47HoSotxeRQ': { backgroundPosition: 'center bottom' },
  'u0cSubf5F-E': { backgroundPosition: 'center top' },
  '-N_UwPdUs7E': { backgroundPosition: 'center top' },
  '1HkVV14d8Bg': { backgroundPosition: 'right center' },
  '3TmLV0fLzfU': { backgroundPosition: 'center 20%' },
  'FxU8KV7psMY': { backgroundPosition: 'center top' },
  'o8Utw2ETExA': { backgroundPosition: 'right center' },
  'pZXg_ObLOM4': { backgroundPosition: 'center top' },
  'Zm2n2O7Fph4': { backgroundPosition: 'center 75%' },
  'LgCj9qcrfhI': { backgroundPosition: 'center top' },
  'vpHCfunwDrQ': { backgroundPosition: 'center top' },
  'c4XoMGxfsVU': { backgroundPosition: 'center top' },
  'r7GOO6M2TmU': { backgroundPosition: 'center 20%' },
  '9qvZSH_NOQs': { backgroundPosition: 'center top' },
  'kZ1zThg6G40': {
    backgroundPosition: 'center top',
    transform: 'scale(1.2) translateY(8.3333333%)'
  },
  '_WuPjE-MPHo': {
    backgroundPosition: 'center top',
    transform: 'scale(1.1)'
  },
  'qpemSW6_1Z0': {
    backgroundPosition: 'center top',
    transform: 'scale(1.2) translateY(8.3333333%)'
  },
  'aO1jND20GHA': { backgroundPosition: 'center bottom' },
  'Fkwj-xk6yck': { transform: 'rotate(-1.4deg) scale(1.05)' },
  'yz_blCQ-OiQ': { transform: 'rotate(-0.95deg) scale(1.1)' }
};
