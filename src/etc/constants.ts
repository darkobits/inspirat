/**
 * Netlify path where lambda functions are hosted.
 */
export const API_PREFIX = process.env.API_PREFIX;


/**
 * How long image collection data may persist in the cache before it must be
 * updated.
 */
export const CACHE_TTL = '1 minute';


/**
 * Drop/text shadow used in various places.
 */
export const shadow = `0px 1px 5px rgba(0, 0, 0, 0.1)`;


/**
 * Map of Unsplash photo IDs to background-position values.
 */
export const BACKGROUND_POSITION_OVERRIDES: any = {
  '-N_UwPdUs7E': 'center top',
  '0NhhIdDUcqw': 'center 20%',
  '1HkVV14d8Bg': 'right center',
  '3TmLV0fLzfU': 'center 20%',
  'FxU8KV7psMY': 'center top',
  'o8Utw2ETExA': 'right center',
  'pZXg_ObLOM4': 'center top',
  'Zm2n2O7Fph4': 'center 75%',
  'LgCj9qcrfhI': 'center top'
};
