import {differenceInMinutes} from 'date-fns';
import ms from 'ms';
import queryString from 'query-string';
import * as R from 'ramda';
// @ts-ignore
import shuffleSeed from 'shuffle-seed';
// @ts-ignore
import urlParseLax from 'url-parse-lax';

import {CACHE_TTL} from 'etc/constants';
import {LooseObject, UnsplashPhotoResource} from 'etc/types';
import client from 'lib/client';
import storage from 'lib/storage';
import {midnight, now, daysSinceEpoch} from 'lib/time';
import {greaterOf, modIndex} from 'lib/utils';


/**
 * Storage key used to cache the photo collection.
 */
const COLLECTION_CACHE_KEY = 'photoCollection';


/**
 * Shape of the object used to cache the photo collection.
 */
interface PhotoCollectionStorageItem {
  photos: Array<UnsplashPhotoResource>;
  updatedAt: number;
}


/**
 * Returns an array of all images in the Inspirat collection. The response will
 * be persisted to local storage to improve load times and is asynchronously
 * updated in the background.
 */
export async function getPhotos(): Promise<Array<UnsplashPhotoResource>> {
  let photoCollection;

  // Sub-routine that fetches up-to-date image collection data, immediately
  // resolves with it, then caches it to local storage.
  const fetchAndUpdateCollection = async (): Promise<PhotoCollectionStorageItem> => {
    try {
      const photos = (await client.get('/photos')).data;

      if (process.env.NODE_ENV === 'development') {
        console.debug(`[getImages] Fetched ${photos.length} images.`);
      }

      const cacheData: PhotoCollectionStorageItem = {photos, updatedAt: now()};

      // Return photos immediately and update storage in the background.
      storage.setItem(COLLECTION_CACHE_KEY, cacheData); // tslint:disable-line no-floating-promises

      return cacheData;
    } catch (err) {
      console.error('Unable to fetch photos:', err.message);
      return {photos: [], updatedAt: -1};
    }
  };

  const storageKeys = await storage.keys();

  // If the cache is empty, fetch collection data and cache it.
  if (!storageKeys.includes(COLLECTION_CACHE_KEY)) {
    if (process.env.NODE_ENV === 'development') {
      console.debug('[getImages] Cache empty.');
    }

    photoCollection = (await fetchAndUpdateCollection()).photos;
  } else {
    // Otherwise, get data from the cache.
    const cachedData = await storage.getItem<PhotoCollectionStorageItem>(COLLECTION_CACHE_KEY);

    // Then, if the data is stale, update it.
    if ((now() - cachedData.updatedAt) >= ms(CACHE_TTL)) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[getImages] Cache is stale, fetching new data. (${ms(now() - cachedData.updatedAt, {long: true})} out of date.).`);
      }

      fetchAndUpdateCollection(); // tslint:disable-line no-floating-promises
    }

    // Immediately resolve with cached data.
    photoCollection = cachedData.photos;
  }

  // Get the current 'name' from storage.
  const name = await storage.getItem<string>('name');

  // First sort photos by their ID to ensure consistent initial ordering. Then,
  // use the 'name' to deterministically shuffle the collection.
  return shuffleSeed.shuffle(R.sortBy(R.prop<any, any>('id'), photoCollection), name);
}


/**
 * Storage key used for the current photo.
 */
const CURRENT_PHOTO_CACHE_KEY = 'currentPhoto';


/**
 * Shape of the object used to cache the current photo.
 */
export interface CurrentPhotoStorageItem {
  photo: UnsplashPhotoResource;
  expires: number;
}


/**
 * Returns the photo for the current day based on the current photo collection.
 * Multiple calls to this function on the same day may return different results
 * as the cached photo collection is updated. To retrieve a consistent photo
 * for the current day regardless of the state of the photo collection, use
 * getCurrentPhoto below.
 *
 * If a day argument is provided, will return the photo for the provided day.
 */
export async function getPhotoForDay({offset = 0} = {}): Promise<UnsplashPhotoResource> {
  const day = daysSinceEpoch() + offset;
  const photos = await getPhotos();

  // Using the number of days since the Unix epoch, use modIndex to
  // calculate the index in the photo collection to use for the indicated day.
  return photos[modIndex(day, photos)];
}


/**
 * Returns the photo for the current day. Will cache this result for the
 * remainder of the day to prevent photos changing when the collection is
 * updated.
 */
export async function getCurrentPhoto(): Promise<UnsplashPhotoResource> {
  const storageKeys = await storage.keys();

  if (storageKeys.includes(CURRENT_PHOTO_CACHE_KEY)) {
    const currentPhoto = await storage.getItem<CurrentPhotoStorageItem>(CURRENT_PHOTO_CACHE_KEY);

    if (currentPhoto.expires > now()) {
      const exp = differenceInMinutes(new Date(currentPhoto.expires), now());
      const hoursRemaining = Math.floor(exp / 60);
      const minutesRemaining = exp % 60;
      console.debug(`[getCurrentPhoto] Current photo expires in ${hoursRemaining} hours and ${minutesRemaining} minutes.`);

      return currentPhoto.photo;
    }

    console.debug('[getCurrentPhot] Cached photo was expired.');
  } else {
    console.debug('[getCurrentPhoto] Cache did not contain a photo.');
  }

  // Cache did not exist or was expired.
  const photo = await getPhotoForDay();

  // Don't wait for this promise; return immediately and cache the photo
  // asynchronously.
  storage.setItem(CURRENT_PHOTO_CACHE_KEY, {photo, expires: midnight()}); // tslint:disable-line no-floating-promises

  return photo;
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
export function buildOptions(base?: LooseObject, overrides?: LooseObject): string {
  const params = {
    ...base,
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
 * params added/modified.
 */
export function getFullImageUrl(baseUrl: string, options?: LooseObject) {
  const {protocol, host, pathname, query} = urlParseLax(baseUrl);
  const parsedQuery = queryString.parse(query);
  const updatedQuery = buildOptions(parsedQuery, options);
  return `${protocol}//${host}${pathname}?${updatedQuery}`;
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
