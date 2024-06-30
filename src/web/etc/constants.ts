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
export const BACKGROUND_ANIMATION_DURATION = ms('120s');

/**
 * Adjusts the initial scale for the background zoom-out animation. Also passed
 * to IMGIX to control the size to render full-quality images at.
 *
 * Should be a value greater than 1.
 */
export const BACKGROUND_ANIMATION_INITIAL_SCALE = 1.5 as const;

// ----- Photos ----------------------------------------------------------------

/**
 * How many days to look back/forward from the current day to pre-populate
 * timeline entries and pre-load photos for those entries.
 */
export const TIMELINE_WINDOW_DAYS = [-10, 10] as const;

/**
 * How long photo collection data may persist in the cache it is considered
 * stale.
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
 * JPEG quality to use for full-quality images.
 */
export const QUALITY_FULL = 100 as const;

/**
 * JPEG quality to use for low-quality image previews.
 */
export const QUALITY_LQIP = 50 as const;

/**
 * When using weighted categories, this is the weight that will be assigned to
 * photos not belonging to any weighted categories. In most cases, this will be
 * applied to photos in the "default" collection.
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
  'iciBcD8NOeA': { styleOverrides: { backgroundPosition: 'center top' }},
  'q-fr4QsIyic': { styleOverrides: { backgroundPosition: 'center top' }},
  'U7gbwg2fjCs': { styleOverrides: { backgroundPosition: 'center bottom' }},
  '9h2CRu-lqyw': { styleOverrides: { backgroundPosition: 'center bottom' }},
  'IdYeC0NqNls': { styleOverrides: { backgroundPosition: 'bottom center' }},
  'Do6yoytec5E': { styleOverrides: { backgroundPosition: 'center top' }},
  'bDVnmzmW4a0': { styleOverrides: { backgroundPosition: 'center bottom' }},
  '85f8mC4SRzk': { styleOverrides: { backgroundPosition: 'center 15%' }},
  'pn2aVMO0lvE': { styleOverrides: { backgroundPosition: 'center bottom' }},
  '47HoSotxeRQ': { styleOverrides: { backgroundPosition: 'center bottom' }},
  'u0cSubf5F-E': { styleOverrides: { backgroundPosition: 'center top' }},
  '-N_UwPdUs7E': { styleOverrides: { backgroundPosition: 'center top' }},
  '1HkVV14d8Bg': { styleOverrides: { backgroundPosition: 'right center' }},
  '3TmLV0fLzfU': { styleOverrides: { backgroundPosition: 'center 20%' }},
  'FxU8KV7psMY': { styleOverrides: { backgroundPosition: 'center top' }},
  'o8Utw2ETExA': { styleOverrides: { backgroundPosition: 'right center' }},
  'pZXg_ObLOM4': { styleOverrides: { backgroundPosition: 'center top' }},
  'Zm2n2O7Fph4': { styleOverrides: { backgroundPosition: 'center 75%' }},
  'LgCj9qcrfhI': { styleOverrides: { backgroundPosition: 'center top' }},
  'vpHCfunwDrQ': { styleOverrides: { backgroundPosition: 'center top' }},
  'c4XoMGxfsVU': { styleOverrides: { backgroundPosition: 'center top' }},
  'r7GOO6M2TmU': { styleOverrides: { backgroundPosition: 'center 20%' }},
  '9qvZSH_NOQs': { styleOverrides: { backgroundPosition: 'center top' }},
  'aO1jND20GHA': { styleOverrides: { backgroundPosition: 'center bottom' }},
  'Fkwj-xk6yck': { styleOverrides: { transform: 'rotate(-1.4deg) scale(1.05)' }},
  'yz_blCQ-OiQ': { styleOverrides: { transform: 'rotate(-0.95deg) scale(1.1)' }},
  'kZ1zThg6G40': {
    styleOverrides: {
      backgroundPosition: 'center top',
      transform: 'scale(1.2) translateY(8.3333333%)'
    }
  },
  '_WuPjE-MPHo': {
    styleOverrides: {
      backgroundPosition: 'center top',
      transform: 'scale(1.1)'
    }
  },
  'qpemSW6_1Z0': {
    styleOverrides: {
      backgroundPosition: 'center top',
      transform: 'scale(1.2) translateY(8.3333333%)'
    }
  },
  'tA90pRfL2gM': { imgixParams: { orient: '90' }  },
  'RBpUVzCP3ws': { styleOverrides: { objectPosition: 'center bottom' }}
};
