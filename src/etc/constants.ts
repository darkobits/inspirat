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
