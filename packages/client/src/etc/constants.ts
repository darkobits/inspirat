import ms from 'ms';
import { BackgroundImageOverrides } from 'etc/types';


/**
 * AWS S3 Bucket URL.
 */
export const BUCKET_URL = process.env.BUCKET_URL;


// Ensures that the above is set, as we don't make a request on every page load,
// so if this were broken, we may not find out immediately.
if (!BUCKET_URL) {
  throw new Error('BUCKET_URL is not set.');
}


/**
 * Duration of the opacity transition when the background image changes. This
 * should be a valid CSS transition-duration value.
 *
 * N.B. This value is shared between various components to coordinate
 * animations.
 */
export const BACKGROUND_TRANSITION_DURATION = process.env.NODE_ENV === 'production'
  ? '5s'
  : '0.25s';


/**
 * Transition timing function used when the background image changes. This must
 * be a valid CSS transition-timing-function value.
 *
 * N.B. This value is shared between various components to coordinate
 * animations.
 */
export const BACKGROUND_TRANSITION_FUNCTION = process.env.NODE_ENV === 'production'
  ? 'ease-in'
  : 'linear';


/**
 * How long image collection data may persist in the cache before it must be
 * updated. (1 day)
 */
export const CACHE_TTL = ms('1 day');


/**
 * Storage key used to cache the photo collection.
 */
export const COLLECTION_CACHE_KEY = 'photoCollection';


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
  '0NhhIdDUcqw': { backgroundPosition: 'center 20%' },
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
  }
};
