import ms from 'ms';
import prettyMs from 'pretty-ms';
import React from 'react';
import useAsyncEffect from 'use-async-effect';

import { BACKGROUND_ANIMATION_INITIAL_SCALE } from 'web/etc/constants';
import useQuery from 'web/hooks/use-query';
import withNamespace from 'web/hooks/use-storage-item';
import { Logger } from 'web/lib/log';
import {
  getPhotoCollections,
  getCurrentPhotoFromCollection,
  getCurrentPhotoFromStorage
} from 'web/lib/photos';
import {
  getPeriodDescriptor,
  midnight,
  now
} from 'web/lib/time';
import {
  buildPhotoUrlSrcSet,
  ifDebug,
  preloadImage
} from 'web/lib/utils';

import type { InspiratPhotoResource } from 'etc/types';

const log = new Logger({ prefix: '🌅 •' });

/**
 * Shape of the object provided by this hook.
 */
export interface InspiratContextValue {
  /**
   * Current name that the user has set, persisted in local storage.
   */
  name: string | undefined;

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

  /**
   * Provided a photo, builds a custom URL using configured IMGIX settings and
   * returns URLs for a low-quality version of the image and a high-quality
   * version of the image.
   */
  buildPhotoUrls: (photo: InspiratPhotoResource) => ReturnType<typeof buildPhotoUrlSrcSet>;
}

const useStorageItem = withNamespace('inspirat');

const InspiratContext = React.createContext<InspiratContextValue>({
  name: '',
  setName: () => {/* Empty function. */},

  currentPhoto: undefined,
  setCurrentPhoto: () => {/* Empty function. */},

  dayOffset: 0,
  setDayOffset: () => {/* Empty function. */},

  hasSeenIntroduction: undefined,
  setHasSeenIntroduction: () => {/* Empty function. */},

  showDevTools: false,
  period: '',
  numPhotos: 0,
  isLoadingPhotos: false,
  resetPhoto: () => {/* Empty function. */},
  buildPhotoUrls: () => ({
    lowQuality: '',
    highQuality: ''
  })
});

export function InspiratProvider(props: React.PropsWithChildren) {
  const [name, setName] = useStorageItem<string>('name');
  const [hasSeenIntroduction, setHasSeenIntroduction] = useStorageItem<boolean | undefined>('hasSeenIntroduction', false);

  const [currentPhoto, setCurrentPhoto] = React.useState<InspiratPhotoResource>();
  const [shouldResetPhoto, resetPhoto] = React.useState(0);
  const [numPhotos, setNumPhotos] = React.useState(0);
  const [showDevTools, setShowDevTools] = React.useState(false);
  const [period, setPeriod] = React.useState(getPeriodDescriptor());
  const [isLoadingPhotos, setIsLoadingPhotos] = React.useState(false);
  const query = useQuery();

  // ----- [Reducer] Increment/Decrement/Set Photo Index -----------------------

  const [dayOffsetFromStorage, setDayOffsetInStorage] = useStorageItem<number>('dayOffset', 0);

  /**
   * Day offset is 0 by default and is used exclusively by DevTools to move
   * forward/backward through the photo collection. An explicit offset is also
   * set when clicking on the progress bar.
   */
  const [dayOffset, setDayOffset] = React.useReducer((state: number, action: 'increment' | 'decrement' | number) => {
    if (typeof action === 'number') {
      setDayOffsetInStorage(action);
      return action;
    }

    switch (action) {
      case 'increment':
        setDayOffsetInStorage(state + 1);
        return state + 1;
      case 'decrement':
        setDayOffsetInStorage(state - 1);
        return state - 1;
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }, 0);

  /**
   * [Effect] Synchronizes in-memory state from storage state, if it exists.
   */
  React.useEffect(() => {
    if (!dayOffsetFromStorage) return;
    if (dayOffset !== dayOffsetFromStorage) setDayOffset(dayOffsetFromStorage);
  }, [dayOffset, dayOffsetFromStorage]);

  // ----- [Callbacks] ---------------------------------------------------------

  const buildPhotoUrls = React.useCallback((photo: InspiratPhotoResource) => {
    if (!photo?.urls) throw new Error('[buildPhotoUrls] Got invalid input.', { cause: photo });

    // This is where IMGIX configuration for low and high quality versions of
    // photos is defined.
    return buildPhotoUrlSrcSet(photo.urls.full, {
      // blend: 'FA653D80',
      // blendMode: 'overlay'
    }, {
      w: window.screen.width * 2 * BACKGROUND_ANIMATION_INITIAL_SCALE,
      h: window.screen.height * 2 * BACKGROUND_ANIMATION_INITIAL_SCALE
    });
  }, []);

  /**
   * [Callback] Updates photos according to the current day offset if dev tools
   * are being used, or the current cached photo otherwise.
   */
  const updatePhotos = React.useCallback(async () => {
    // If dev tools are open, the current photo should be pulled from the photo
    // collection using the current offset. If not, use the 'currentPhoto' cache
    // item to ensure the photo does not change throughout the day if the photo
    // collection is updated.
    const nextPhoto = showDevTools
      ? await getCurrentPhotoFromCollection({ offset: dayOffset })
      : await getCurrentPhotoFromStorage();

    ifDebug(() => {
      if (!window.debug) window.debug = {};
      window.debug.currentPhoto = nextPhoto;
    });

    // TODO: May need to check for isMounted here.
    setCurrentPhoto(nextPhoto);
  }, [showDevTools, dayOffset]);


  /**
   * [Callback] Updates photos, then sets a timeout that will trigger another
   * update at midnight.
   */
  const updatePhotosWithTimer = React.useCallback(() => {
    void updatePhotos();

    const timeToUpdate = midnight() - now();

    ifDebug(() => {
      log.debug(`Current photo will update in ${prettyMs(timeToUpdate)}.`);

      if (!window.debug) window.debug = {};
      Reflect.defineProperty(window.debug, 'expiresIn', {
        get: () => prettyMs(midnight() - now())
      });
    }, { once: true });

    const timeoutHandle = setTimeout(() => {
      ifDebug(() => log.debug('Updating photo.'));
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
    return () => clearTimeout(timeoutHandle);
  }, [dayOffset, shouldResetPhoto, showDevTools, updatePhotosWithTimer]);

  /**
   * [Effect] Periodically checks if we are waiting for any photos to load.
   */
  React.useEffect(() => {
    const intervalHandle = setInterval(() => {
      setIsLoadingPhotos(preloadImage.isLoadingImages());
    }, 100);
    return () => clearInterval(intervalHandle);
  }, []);

  /**
   * [Effect] Updates photo URLs when the current photo is changed.
   */
  React.useEffect(() => {
    if (!currentPhoto) return;
    setCurrentPhoto(currentPhoto);
  }, [currentPhoto]);

  /**
   * [Effect] When the `devtools` query param is present, enables dev tools.
   */
  React.useEffect(() => {
    if (Object.keys(query).includes('devtools')) {
      window.debug = window.debug || {};
      setShowDevTools(true);
    }
  }, [query]);

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

  return (
    <InspiratContext.Provider
      value={{
        name,
        setName,

        currentPhoto: currentPhoto,
        setCurrentPhoto,

        dayOffset,
        setDayOffset,

        hasSeenIntroduction,
        setHasSeenIntroduction,

        // TODO: This breaks if we don't use a one-off wrapper here. Figure out
        // why.
        showDevTools,
        period,
        numPhotos,
        isLoadingPhotos,
        resetPhoto: () => {
          resetPhoto(shouldResetPhoto + 1);
        },
        buildPhotoUrls
      }}
    >
      {props.children}
    </InspiratContext.Provider>
  );
}

export default InspiratContext;
