import axios from 'axios';
import Chance from 'chance';
import objectHash from 'object-hash';
import prettyMs from 'pretty-ms';
import * as R from 'ramda';

import {
  BUCKET_URL,
  CACHE_TTL,
  COLLECTION_CACHE_KEY,
  CURRENT_PHOTO_CACHE_KEY
} from 'web/etc/constants';
import PendingPromiseCache from 'web/lib/pending-promise-cache';
// import randomSeason from 'lib/seasons';
import storage from 'web/lib/storage';
import { now, midnight, daysSinceEpoch } from 'web/lib/time';
import { ifDebug, modIndex } from 'web/lib/utils';

import type { InspiratPhotoCollection, InspiratPhotoResource } from 'etc/types';
import type { CurrentPhotoStorageItem, PhotoCollectionStorageItem } from 'web/etc/types';


/**
 * @private
 *
 * Tracks calls to getPhotoCollection, ensuring promises are re-used when
 * multiple invocations occur before the first invocation finishes.
 */
const pendingPromiseCache = new PendingPromiseCache();


/**
 * @private
 *
 * Fetches image collection from Unsplash, immediately resolves with it, then
 * asynchronously caches it to local storage.
 */
async function fetchAndUpdateCollections(): Promise<PhotoCollectionStorageItem | null> {
  try {
    const photoCollections = (await axios.request<Array<InspiratPhotoCollection>>({
      method: 'GET',
      url: BUCKET_URL
    })).data;

    // Map over all photo collections and concat them into a single array.
    const photos = R.sortBy(R.prop('id'), R.chain(R.prop('photos'), photoCollections));

    ifDebug(() => {
      console.debug(`[fetchAndUpdateCollections] Fetched ${photos.length} photos.`);

      const uniqPhotos = R.uniqBy(R.prop('id'), photos);
      const dupePhotos = photos.length - uniqPhotos.length;

      if (dupePhotos) {
        console.warn(`[fetchAndUpdateCollections] Found ${dupePhotos} photos in multiple collections.`);
      }
    });

    const cacheData: PhotoCollectionStorageItem = {photos, updatedAt: now()};

    // Return photos immediately and update storage in the background.
    void storage.setItem(COLLECTION_CACHE_KEY, cacheData);

    return cacheData;
  } catch (err: any) {
    console.error('[fetchAndUpdateCollections] Error fetching photo collection:', err.message);
    return null;
  }
}


/**
 * Returns an array of all images in the Inspirat collection from local storage.
 *
 * Additionally checks if cached photo collection data has expired and performs
 * an update in the background if necessary.
 */
export async function getPhotoCollections() {
  return pendingPromiseCache.set('getPhotoCollection', async () => {
    let photoCache = await storage.getItem<PhotoCollectionStorageItem>(COLLECTION_CACHE_KEY);

    // If the cache is empty, fetch photos from Unsplash and cache them.
    if (!photoCache) {
      ifDebug(() => console.debug('[getPhotoCollections] Cache is empty. Fetching collection.'));
      // eslint-disable-next-line require-atomic-updates
      photoCache = await fetchAndUpdateCollections();
    } else if (now() - photoCache.updatedAt >= CACHE_TTL) {
      // If the cached collection is stale, re-fetch it.
      ifDebug(() => console.debug(`[getPhotoCollections] Cache is stale, re-fetching. (${prettyMs(now() - (photoCache?.updatedAt ?? 0), { verbose: true })} out of date.).`));
      // eslint-disable-next-line require-atomic-updates
      photoCache = await fetchAndUpdateCollections();
    } else {
      ifDebug(() => {
        const expiresIn = CACHE_TTL - (now() - (photoCache?.updatedAt ?? 0));
        console.debug(`[getPhotoCollections] Photo collection will be updated in ${prettyMs(expiresIn)}.`);
      }, { once: true });
    }

    // If photoCache is still null at this point, we had no cached data and
    // the fetch attempt failed.
    if (!photoCache) {
      throw new Error('[getPhotoCollections] Photo collection cache was empty and an error occurred while trying to fetch it.');
    }

    // Get the current 'name' from storage.
    const name = await storage.getItem<string>('name');

    // First sort photos by their ID to ensure consistent initial ordering.
    // Then, use the user's 'name' to deterministically shuffle the
    // collection.
    const chance = new Chance(name ?? '');
    const sortedCollection = chance.shuffle(R.sortBy(R.prop('id'), photoCache.photos));

    ifDebug(() => {
      const collectionHash = objectHash(photoCache?.photos ?? {});
      console.debug(`[getPhotoCollections] Collection hash, unsorted, using seed "${name}":`, collectionHash);
      const sortedCollectionHash = objectHash(sortedCollection);
      console.debug(`[getPhotoCollections] Collection hash, sorted, using seed "${name}":`, sortedCollectionHash);
    }, { once: true });

    return sortedCollection;
  });
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
export async function getCurrentPhotoFromCollection({ offset = 0 } = {}): Promise<InspiratPhotoResource> {
  const day = daysSinceEpoch() + offset;
  const photos = await getPhotoCollections();

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
export async function getCurrentPhotoFromStorage(): Promise<InspiratPhotoResource> {
  const currentPhoto = await storage.getItem<CurrentPhotoStorageItem>(CURRENT_PHOTO_CACHE_KEY);

  if (currentPhoto) {
    if (currentPhoto.expires > now()) {
      return currentPhoto.photo;
    }

    ifDebug(() => console.debug('[getCurrentPhotoFromStorage] Cached photo was expired.'));
  } else {
    ifDebug(() => console.debug('[getCurrentPhotoFromStorage] Cache did not contain a photo.'));
  }

  // Cache did not exist or was expired.
  const photo = await getCurrentPhotoFromCollection();

  // Don't wait for this promise; return immediately and cache the photo
  // asynchronously.
  void storage.setItem(CURRENT_PHOTO_CACHE_KEY, {photo, expires: midnight()});

  return photo;
}
