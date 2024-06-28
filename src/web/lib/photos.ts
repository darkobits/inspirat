import axios from 'axios';
import Chance from 'chance';
// import objectHash from 'object-hash';
import prettyMs from 'pretty-ms';
import * as R from 'ramda';

import { UNSPLASH_COLLECTIONS } from 'etc/constants';
import {
  BUCKET_URL,
  CACHE_TTL,
  COLLECTION_CACHE_KEY,
  PHOTO_DEFAULT_WEIGHT
} from 'web/etc/constants';
import { Logger } from 'web/lib/log';
import PendingPromiseCache from 'web/lib/pending-promise-cache';
import { computeSeasonWeights } from 'web/lib/seasons';
import storage from 'web/lib/storage';
import { now } from 'web/lib/time';
import { ifDebug } from 'web/lib/utils';

import type { InspiratPhotoCollection, InspiratPhotoResource } from 'etc/types';
import type { PhotoCollectionStorageItem } from 'web/etc/types';

const log = new Logger({ prefix: '🌅 •' });

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
    const photosFlat = R.sortBy(R.prop('id'), R.chain(R.prop('photos'), photoCollections));

    ifDebug(() => {
      log.debug(`Fetched ${photosFlat.length} photos.`);

      const uniqPhotos = R.uniqBy(R.prop('id'), photosFlat);
      const dupePhotos = photosFlat.length - uniqPhotos.length;

      if (dupePhotos) {
        log.warn(`Found ${dupePhotos} photos in multiple collections.`);
      }
    });

    const collectionIdsToName = R.invertObj(UNSPLASH_COLLECTIONS);

    const mappedCollections = R.map(photoCollection => {
      return {
        ...photoCollection,
        weight: {
          name: collectionIdsToName[photoCollection.id]
        }
      };
    }, photoCollections);

    const cacheData: PhotoCollectionStorageItem = {
      collections: mappedCollections,
      updatedAt: now()
    };

    // Return photos immediately and update storage in the background.
    void storage.setItem(COLLECTION_CACHE_KEY, cacheData);

    return cacheData;
  } catch (err: any) {
    log.error('Error fetching photo collection:', err.message);
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
      log.debug('Cache is empty. Fetching collection.');
      // eslint-disable-next-line require-atomic-updates
      photoCache = await fetchAndUpdateCollections();
    } else if (now() - photoCache.updatedAt >= CACHE_TTL) {
      // If the cached collection is stale, re-fetch it.
      log.debug(`Updating stale photo cache. (${prettyMs(now() - (photoCache?.updatedAt ?? 0), { verbose: true })} out of date.).`);
      // eslint-disable-next-line require-atomic-updates
      photoCache = await fetchAndUpdateCollections();
    } else {
      ifDebug(() => {
        const expiresIn = CACHE_TTL - (now() - (photoCache?.updatedAt ?? 0));
        log.debug(`Photo collection will be updated in ${prettyMs(expiresIn)}.`);
      }, { once: true });
    }

    // If photoCache is still null at this point, we had no cached data and
    // the fetch attempt failed.
    if (!photoCache) {
      throw new Error('[getPhotoCollections] Photo collection cache was empty and an error occurred while trying to update it.');
    }

    return photoCache;
  });
}

/**
 * @private
 *
 * Provided a day offset, returns a flat array of photo resources, each photo
 * annotated with a weight descriptor.
 */
async function getWeightedPhotos(date: Date) {
  const photos = await getPhotoCollections();

  const seasonWeights = computeSeasonWeights(date);

  const mappedCollections = photos.collections?.map(photoCollection => {
    if (photoCollection.weight) {
      const weightDescriptor = seasonWeights.find(weightDescriptor => weightDescriptor.name.toLowerCase() === photoCollection.weight.name.toLowerCase());

      photoCollection.weight.value = typeof weightDescriptor?.weight === 'number'
        ? weightDescriptor.weight
        : PHOTO_DEFAULT_WEIGHT;

      photoCollection.photos = photoCollection.photos?.map(photo => {
        // @ts-expect-error Type this correctly.
        photo.weight = photoCollection.weight;
        return photo as InspiratPhotoResource & { weight: { name: string; value: number } };
      });
    }

    return photoCollection;
  });

  return mappedCollections.flatMap(photoCollection => photoCollection.photos) as Array<InspiratPhotoResource & { weight: { name: string; value: number } }>;
}


const chanceInstances: Record<string, Chance.Chance> = {};

/**
 * Returns a photo selected at random from the current collection. Photos are
 * assigned weights based on the provided `offset` parameter. Additionally,
 * the random number generator may be seeded with a `seed` option.
 */
export async function getCurrentPhotoFromCollection({ seed = '', date = new Date() } = {}): Promise<InspiratPhotoResource> {
  const photos = await getWeightedPhotos(date);

  let chance: Chance.Chance;

  if (chanceInstances[seed]) {
    chance = chanceInstances[seed];
  } else {
    chance = new Chance(seed);
    chanceInstances[seed] = chance;
  }

  // Note: This no longer makes sense; may remove.
  // const shuffled = chance.shuffle(photos);

  const weights = R.map(R.pathOr(0, ['weight', 'value']), photos);
  const photo = chance.weighted(photos, weights);

  return photo;
}


/**
 * Provided a photo ID and optional day offset (for calculating weight) returns
 * an Annotated
 */
export async function getPhotoFromCollection(id: string, date = new Date()) {
  const photos = await getWeightedPhotos(date);
  return photos.find(curPhoto => curPhoto.id === id);
}
