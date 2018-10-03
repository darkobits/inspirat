import ms from 'ms';
import queryString from 'query-string';

import {CACHE_TTL} from 'etc/constants';
import {LooseObject, UnsplashPhotoResource} from 'etc/types';
import client from 'lib/client';
import storage from 'lib/storage';
import {greaterOf} from 'lib/utils';


interface CollectionCache {
  images: Array<UnsplashPhotoResource>;
  updatedAt: number;
}


/**
 * Returns an array of all images in the Front Lawn collection. The response
 * will be persisted to local storage to improve load times and asynchronously
 * updated in the background.
 *
 * See: lambda/images.ts.
 */
export async function getImages() {
  // Sub-routine that fetches up-to-date image collection data, immediately
  // resolves with it, then caches it to local storage.
  const fetchAndUpdateCollection = async () => {
    const res = await client.get('/images');

    if (process.env.NODE_ENV === 'development') {
      console.debug(`[getImages] Returning ${res.data.length} images.`);
    }

    storage.setItem('imageCollection', {images: res.data, updatedAt: Date.now()}); // tslint:disable-line no-floating-promises
    return res.data;
  };

  const storageKeys = await storage.keys();

  // If the cache is empty, fetch collection data and cache it.
  if (!storageKeys.includes('imageCollection')) {
    if (process.env.NODE_ENV === 'development') {
      console.debug('[getImages] Cache empty.');
    }

    return fetchAndUpdateCollection();
  }

  // Otherwise, get data from the cache.
  const cachedImages = await storage.getItem<CollectionCache>('imageCollection');

  // Then, if the data is stale, update it.
  if ((Date.now() - cachedImages.updatedAt) >= ms(CACHE_TTL)) {
    fetchAndUpdateCollection(); // tslint:disable-line no-floating-promises
  }

  // Immediately resolve with cached data.
  return cachedImages.images;
}


/**
 * Returns the current viewport width or viewport height, whichever is greater,
 * adjusted for the device's pixel ratio. At a pixel ratio of 1 or 2, the
 * dimension is returned as-is. For each pixel ratio above 2, the dimension is
 * increased by 50%.
 */
export function getScreenSize() {
  // window.devicePixelRatio;
  return greaterOf(window.screen.availWidth, window.screen.availHeight);
}


/**
 * Unsplash uses Imgix for dynamic image processing. These parameters ensure we
 * fetch an image that is appropriately sized for the current viewport.
 *
 * See: https://docs.imgix.com/apis/url
 */
export function buildOptions(overrides?: LooseObject): string {
  const params = {
    // Sets several baseline parameters.
    auto: 'format',
    // Fit the image to the provided width/height without cropping and while
    // maintaining its aspect ratio.
    fit: 'max',
    // Image width.
    w: getScreenSize(),
    // Image height.
    h: getScreenSize(),
    // Image quality.
    q: 80,
    // Apply any provided overrides.
    ...overrides
  };

  return queryString.stringify(params);
}


/**
 * Provided a base URL for an Unsplash image, returns a URL with Imgix query
 * params added.
 */
export function getFullImageUrl(baseUrl: string, options?: LooseObject) {
  return `${baseUrl}?${buildOptions(options)}`;
}


/**
 * Asynchronously pre-loads the image at the provided URL and returns a promise
 * that resolves when the image has finished loading.
 */
export async function preloadImage(imgUrl: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      resolve();
    };

    img.onerror = event => {
      reject(event);
    };

    img.src = imgUrl;
  });
}
