import { InspiratPhotoResource } from 'inspirat-types';
import ms from 'ms';
import prettyMs from 'pretty-ms';
import * as R from 'ramda';
import React from 'react';
import { singletonHook } from 'react-singleton-hook';
import useAsyncEffect from 'use-async-effect';

import { PhotoUrls } from 'etc/types';
import useQuery from 'hooks/use-query';
import withNamespace from 'hooks/use-storage-item';
import {
  getPhotoCollections,
  getCurrentPhotoFromCollection,
  getCurrentPhotoFromCache
} from 'lib/photos';
import {
  getPeriodDescriptor,
  midnight,
  now
} from 'lib/time';
import {
  buildPhotoUrlSrcSet,
  ifDebug,
  preloadImage
} from 'lib/utils';


/**
 * Shape of the object provided by this hook.
 */
export interface InspiratHook {
  /**
   * Whether the user has seen the introduction modal.
   */
  hasSeenIntroduction: boolean | undefined;

  /**
   * Sets the above flag.
   */
  setHasSeenIntroduction: (value: boolean) => void;

  /**
   * Tracks the current day offset (starts at 0) when in development mode.
   */
  dayOffset: number;

  /**
   * The photo resource that should be used based on the current day offset.
   */
  currentPhoto: InspiratPhotoResource | undefined;

  /**
   * Array containing the source set of URLs for the current photo.
   */
  currentPhotoUrls: PhotoUrls | undefined;

  /**
   * The total number of photos in the collection.
   */
  numPhotos: number;

  /**
   * Whether or not we are in "dev mode".
   */
  showDevTools: boolean;

  /**
   * Whether we are pre-loading photos in the background.
   */
  isLoadingPhotos: boolean;

  /**
   * Current name that the user has set, persisted in local storage.
   */
  name: string | undefined;

  /**
   * Sets the user's name.
   */
  setName: (value: string) => void;

  /**
   * Current period of the day ('morning', 'afternoon', 'evening').
   */
  period: string;

  /**
   * Allows other components to set the day offset to a value by using the
   * 'increment' or 'decrement' actions.
   */
  setDayOffset: (action: 'increment' | 'decrement' | number) => void;

  /**
   * Allows other components to set the current photo, overriding the photo that
   * would be displayed based on the current day offset.
   */
  setCurrentPhoto: (photo: InspiratPhotoResource | undefined) => void;

  /**
   * Resets the current photo to the photo that should be displayed based on the
   * current day offset.
   */
  resetPhoto: () => void;
}


/**
 * @private
 *
 * Tracks URLs of previously pre-loaded photos.
 */
const preloadedPhotos = new Set<string>();


const useStorageItem = withNamespace('inspirat');


const initialValue = {} as InspiratHook;


export const useInspirat = singletonHook(initialValue, () => {
  const [hasSeenIntroduction, setHasSeenIntroduction] = useStorageItem<boolean | undefined>('hasSeenIntroduction', false);
  const [currentPhotoFromState, setCurrentPhoto] = React.useState<InspiratPhotoResource>();
  const [currentPhotoUrls, setCurrentPhotoUrls] = React.useState<PhotoUrls>();
  const [shouldResetPhoto, resetPhoto] = React.useState(0);
  const [numPhotos, setNumPhotos] = React.useState(0);
  const [showDevTools, setShowDevTools] = React.useState(false);
  const [isLoadingPhotos, setIsLoadingPhotos] = React.useState(false);
  const [name, setName] = useStorageItem<string>('name');
  const [period, setPeriod] = React.useState(getPeriodDescriptor());
  const query = useQuery();


  // ----- [Reducer] Increment/Decrement/Set Photo Index -----------------------

  /**
   * Day offset is 0 by default and is used exclusively by DevTools to move
   * forward/backward through the photo collection. An explicit offset is also
   * set when clicking on the progress bar.
   */
  const [dayOffset, setDayOffset] = React.useReducer((state: number, action: 'increment' | 'decrement' | number) => {
    if (typeof action === 'number') {
      return action;
    }

    switch (action) {
      case 'increment':
        return state + 1;
      case 'decrement':
        return state - 1;
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }, 0);


  // ----- [Callbacks] ---------------------------------------------------------


  /**
   * [Callback] Provided a photo resource, computes the URL source set to use,
   * pre-loads those resources, and resolves when the first URL in the set has
   * finished loading.
   */
  const preloadPhotoUrls = React.useCallback(async (photoResource: InspiratPhotoResource) => {
    const urls = buildPhotoUrlSrcSet(photoResource.urls.full);

    const photoUrls: PhotoUrls = R.mapObjIndexed(async (url, key) => {
      if (!preloadedPhotos.has(url)) {
        if (key === 'full') {
          await new Promise<void>(resolve => {
            setTimeout(() => {
              resolve();
            }, 0);
          });
        }

        await preloadImage(url);
        preloadedPhotos.add(url);
      }

      return url;
    }, urls);

    // Wait for the first image in the source set to finish pre-loading, then
    // update URLs.
    await Promise.race(Object.values(photoUrls));

    return photoUrls;
  }, []);


  /**
   * [Callback] Updates photos according to the current day offset if dev tools
   * are being used, or the current cached photo otherwise.
   */
  const updatePhotos = React.useCallback(async () => {
    setIsLoadingPhotos(true);

    // If dev tools are open, the current photo should be pulled from the photo
    // collection using the current offset. If not, use the 'currentPhoto' cache
    // item to ensure the photo does not change throughout the day if the photo
    // collection is updated.
    const currentPhoto = showDevTools
      ? await getCurrentPhotoFromCollection({offset: dayOffset})
      : await getCurrentPhotoFromCache();

    ifDebug(() => {
      if (!window.debug) window.debug = {};
      window.debug.currentPhoto = currentPhoto;
    });

    const currentPhotoPromise = preloadPhotoUrls(currentPhoto).then(urls => {
      setCurrentPhoto(currentPhoto);
      setCurrentPhotoUrls(urls);
    });

    const prevPhotoPromise = showDevTools
      ? getCurrentPhotoFromCollection({offset: dayOffset - 1 }).then(preloadPhotoUrls)
      : false;

    const nextPhotoPromise = showDevTools
      ? getCurrentPhotoFromCollection({offset: dayOffset + 1 }).then(preloadPhotoUrls)
      : false;

    await Promise.all([
      currentPhotoPromise,
      prevPhotoPromise,
      nextPhotoPromise
    ] as Array<Promise<any>>);

    setIsLoadingPhotos(false);
  }, [
    dayOffset,
    showDevTools,
    setCurrentPhoto
  ]);


  /**
   * [Callback] Updates photos, then sets a timeout that will trigger another
   * update at midnight.
   */
  const updatePhotosWithTimer = React.useCallback(() => {
    void updatePhotos();

    const timeToUpdate = midnight() - now();

    ifDebug(() => {
      console.debug(`[setPhotoUpdateTimer] Current photo will update in ${prettyMs(timeToUpdate)}.`);

      if (!window.debug) window.debug = {};
      Reflect.defineProperty(window.debug, 'expiresIn', {
        get: () => prettyMs(midnight() - now())
      });
    }, { once: true });

    const timeoutHandle = setTimeout(() => {
      ifDebug(() => console.debug('[setPhotoUpdateTimer] Updating photo.'));
      updatePhotosWithTimer();
    }, timeToUpdate);

    return timeoutHandle;
  }, [
    updatePhotos
  ]);


  // ----- Effects -------------------------------------------------------------

  /**
   * [Effect] Initiates the photo update routine.
   */
  React.useEffect(() => {
    const timeoutHandle = updatePhotosWithTimer();

    return () => {
      clearTimeout(timeoutHandle);
    };
  }, [
    dayOffset,
    shouldResetPhoto,
    showDevTools
  ]);


  /**
   * [Effect] Updates photo URLs when the current photo is changed.
   */
  React.useEffect(() => {
    if (!currentPhotoFromState) return;
    void preloadPhotoUrls(currentPhotoFromState).then(urls => {
      setCurrentPhotoUrls(urls);
    });
  }, [currentPhotoFromState]);


  /**
   * [Effect] When the `devtools` query param is present, enables dev tools.
   */
  React.useEffect(() => {
    if (Object.keys(query).includes('devtools')) {
      window.debug = window.debug || {};
      setShowDevTools(true);
    }
  }, []);


  /**
   * [Effect] Initializes debug data.
   */
  useAsyncEffect(async isMounted => {
    const photos = await getPhotoCollections();

    if (!isMounted()) return;

    setNumPhotos(photos.length);

    ifDebug(() => {
      if (!window.debug) window.debug = {};
      window.debug.photos = photos;
      window.debug.numPhotos = photos.length;
    });
  }, []);


  /**
   * [Effect] Update period.
   */
  React.useEffect(() => {
    const interval = setInterval(() => {
      setPeriod(getPeriodDescriptor());
    }, ms('30 seconds'));

    return () => clearInterval(interval);
  }, []);


  // ----- Hook API ------------------------------------------------------------

  return {
    hasSeenIntroduction,
    setHasSeenIntroduction,
    dayOffset,
    // TODO: This breaks if we don't use a one-off wrapper here. Figure out why.
    setDayOffset: (offset: 'increment' | 'decrement' | number) => {
      setDayOffset(offset);
    },
    showDevTools,
    isLoadingPhotos,
    name,
    setName,
    period,
    currentPhoto: currentPhotoFromState,
    currentPhotoUrls,
    setCurrentPhoto,
    resetPhoto: () => {
      resetPhoto(shouldResetPhoto + 1);
    },
    numPhotos
  };
});
