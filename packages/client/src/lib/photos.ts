import { differenceInMinutes } from 'date-fns';
import ms from 'ms';
import * as R from 'ramda';
// @ts-ignore
import shuffleSeed from 'shuffle-seed';

import {
  CACHE_TTL,
  COLLECTION_CACHE_KEY,
  CURRENT_PHOTO_CACHE_KEY
} from 'etc/constants';
import {
  CurrentPhotoStorageItem,
  PhotoCollectionStorageItem,
  UnsplashPhotoResource
} from 'etc/types';
import client from 'lib/client';
import storage from 'lib/storage';
import { now, midnight, daysSinceEpoch } from 'lib/time';
import { ifDebug, modIndex } from 'lib/utils';


/**
 * Returns an array of all images in the Inspirat collection. The response will
 * be persisted to local storage to improve load times and is asynchronously
 * updated in the background.
 */
export async function getPhotos(): Promise<Array<UnsplashPhotoResource>> {
  // Sub-routine that fetches up-to-date image collection data, immediately
  // resolves with it, then caches it to local storage.
  const fetchAndUpdateCollection = async (): Promise<PhotoCollectionStorageItem | null> => {
    try {
      const photos = (await client.get('/photos')).data;

      ifDebug(() => console.debug(`[getImages] Fetched ${photos.length} images.`));

      const cacheData: PhotoCollectionStorageItem = {photos, updatedAt: now()};

      // Return photos immediately and update storage in the background.
      void storage.setItem(COLLECTION_CACHE_KEY, cacheData);

      return cacheData;
    } catch (err) {
      console.error('[getPhotos] Error fetching photo collection:', err.message);
      return null;
    }
  };

  let photoCache = await storage.getItem<PhotoCollectionStorageItem>(COLLECTION_CACHE_KEY);

  // If the cache is empty, fetch photos from Unsplash and cache them.
  if (!photoCache) {
    ifDebug(() => console.debug('[getImages] Cache is empty. Fetching collection.'));
    // eslint-disable-next-line require-atomic-updates
    photoCache = await fetchAndUpdateCollection();
  } else if (now() - photoCache.updatedAt >= ms(CACHE_TTL)) {
    // If the cached collection is stale, re-fetch it.
    ifDebug(() => console.warn(`[getImages] Cache is stale, re-fetching. (${ms(now() - (photoCache?.updatedAt ?? 0), {long: true})} out of date.).`));
    // eslint-disable-next-line require-atomic-updates
    photoCache = await fetchAndUpdateCollection();
  }

  // If photoCache is still null at this point, we had no cached data and the
  // fetch attempt failed.
  if (!photoCache) {
    throw new Error('[getPhotos] Photo collection cache was empty and an error occurred while trying to fetch it.');
  }

  // Get the current 'name' from storage.
  const name = await storage.getItem<string>('name');

  // First sort photos by their ID to ensure consistent initial ordering. Then,
  // use the user's 'name' to deterministically shuffle the collection.
  return shuffleSeed.shuffle(R.sortBy(R.prop('id'), photoCache.photos), name);
}


/**
 * Returns the photo for the current day (since the Unix epoch) from the photo
 * collection.
 *
 * Note: This function uses the current value of the cached photo collection as
 * its source of truth. Therefore, this function may return different results on
 * the same day if the collection is updated between calls. To
 *
 * Multiple calls to this function on the same day may return different results
 * as the cached photo collection is updated in the background. To retrieve a
 * consistent photo for the current day regardless of the state of the photo
 * collection, use getCurrentPhoto below.
 *
 * If a day argument is provided, will return the photo for the provided day.
 */
export async function getCurrentPhotoFromCollection({offset = 0} = {}): Promise<UnsplashPhotoResource> {
  const day = daysSinceEpoch() + offset;
  const photos = await getPhotos();

  // Using the number of days since the Unix epoch, use modIndex to
  // calculate the index in the photo collection to use for the indicated day.
  return photos[modIndex(day, photos)];
}


/**
 * Returns the photo for the current day. If a photo has not been set for the
 * current day, this function will look-up the photo for the current day, then
 * persist it to Local Storage. Subsequent calls to this function on the same
 * day will then use the value from storage rather than re-computing the current
 * photo against the photo collection. This ensures that if the photo collection
 * is updated in the background between calls to this function, the value it
 * returns will not change.
 */
export async function getCurrentPhotoFromCache(): Promise<UnsplashPhotoResource> {
  const currentPhoto = await storage.getItem<CurrentPhotoStorageItem>(CURRENT_PHOTO_CACHE_KEY);

  if (currentPhoto) {
    if (currentPhoto.expires > now()) {
      const exp = differenceInMinutes(new Date(currentPhoto.expires), now());
      const hoursRemaining = Math.floor(exp / 60);
      const minutesRemaining = exp % 60;

      ifDebug(() => console.debug(`[getCurrentPhotoFromCache] Current photo expires in ${hoursRemaining}h ${minutesRemaining}m.`));

      return currentPhoto.photo;
    }

    ifDebug(() => console.debug('[getCurrentPhotoFromCache] Cached photo was expired.'));
  } else {
    ifDebug(() => console.debug('[getCurrentPhotoFromCache] Cache did not contain a photo.'));
  }

  // Cache did not exist or was expired.
  const photo = await getCurrentPhotoFromCollection();

  // Don't wait for this promise; return immediately and cache the photo
  // asynchronously.
  void storage.setItem(CURRENT_PHOTO_CACHE_KEY, {photo, expires: midnight()});

  return photo;
}
