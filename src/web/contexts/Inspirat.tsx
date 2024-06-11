/* eslint-disable no-confusing-arrow */
import Cron from '@darkobits/cron';
import * as Jotai from 'jotai';
import ms from 'ms';
import React from 'react';
import useAsyncEffect from 'use-async-effect';

import { atoms } from 'web/atoms/inspirat';
import { BACKGROUND_ANIMATION_INITIAL_SCALE } from 'web/etc/constants';
import { Logger } from 'web/lib/log';
import {
  getPhotoCollections,
  getCurrentPhotoFromCollection,
  getCurrentPhotoFromStorage
} from 'web/lib/photos';
import { getPeriodDescriptor } from 'web/lib/time';
import {
  buildPhotoUrlSrcSet,
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
  setDayOffset: (offset: number | ((prev: number) => number)) => void;

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

const InspiratContext = React.createContext<InspiratContextValue>({
  name: localStorage.getItem('inspirat/name') ?? '',
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
  const [name, setName] = Jotai.useAtom(atoms.name);
  const [showDevTools] = Jotai.useAtom(atoms.showDevTools);
  const [dayOffset, setDayOffset] = Jotai.useAtom(atoms.dayOffset);
  const [hasSeenIntroduction, setHasSeenIntroduction] = Jotai.useAtom(atoms.hasSeenIntroduction);

  const [currentPhoto, setCurrentPhoto] = React.useState<InspiratPhotoResource>();
  const [shouldResetPhoto, resetPhoto] = React.useState(0);
  const [numPhotos, setNumPhotos] = React.useState(0);
  const [period, setPeriod] = React.useState(getPeriodDescriptor());
  const [isLoadingPhotos, setIsLoadingPhotos] = React.useState(false);

  // ----- Callbacks -----------------------------------------------------------

  const buildPhotoUrls = React.useCallback((photo: InspiratPhotoResource) => {
    if (!photo?.urls) throw new Error('[buildPhotoUrls] Got invalid input.', { cause: photo });

    // This is where IMGIX configuration for low and high quality versions of
    // photos is defined.
    return buildPhotoUrlSrcSet(photo.urls.full, {
      // fm: 'webp',
      fm: 'jpg',
      q: 70,
      w: Math.round(window.screen.width * 0.64)
      // h: Math.round(window.screen.height / 2)
      // Adds a color overlay. Can be useful for debugging.
      // blend: 'FA653D',
      // blendMode: 'overlay'
    }, {
      fm: 'jpg',
      q: 98,
      w: Math.round(window.screen.width * BACKGROUND_ANIMATION_INITIAL_SCALE),
      h: Math.round(window.screen.height * BACKGROUND_ANIMATION_INITIAL_SCALE)
    });
  }, []);

  // ----- Effects -------------------------------------------------------------

  /**
   * [Effect] Selects the next photo to use based on whether we are in DevTools
   * and allowing browsing, or not.
   */
  useAsyncEffect(async isMounted => {
    // log.debug('[Context] Random season:', getRandomWeightedSeason());

    // If dev tools are open, the current photo should be pulled from the photo
    // collection using the current offset. If not, use the 'currentPhoto' cache
    // item to ensure the photo does not change throughout the day if the photo
    // collection is updated.
    const nextPhoto = showDevTools
      ? await getCurrentPhotoFromCollection({ offset: dayOffset })
      : await getCurrentPhotoFromStorage({ name });

    if (!isMounted()) return;

    // ifDebug(() => {
    //   if (!window.debug) window.debug = {};
    //   window.debug.currentPhoto = nextPhoto;
    // });

    setCurrentPhoto(nextPhoto);
  }, [dayOffset, name, showDevTools]);

  /**
   * [Effect] Responsible for ensuring the photo changes at midnight.
   */
  React.useEffect(() => {
    const photoUpdateCron = Cron('0 0 * * *', () => {
      log.info('Updating photos on cron.');
      setDayOffset(prev => prev + 1);
    });

    void photoUpdateCron.start();

    return () => {
      void photoUpdateCron.suspend();
    };
  }, [setDayOffset, dayOffset]);

  /**
   * [Effect] Periodically checks if we are waiting for any photos to load.
   */
  React.useEffect(() => {
    const intervalHandle = setInterval(() => {
      setIsLoadingPhotos(preloadImage.isLoadingImages());
    }, 1000);
    return () => clearInterval(intervalHandle);
  }, []);

  /**
   * [Effect] Initializes debug data.
   */
  useAsyncEffect(async isMounted => {
    const photos = await getPhotoCollections();

    if (!isMounted()) return;

    const numPhotos = photos.collections.reduce((total, collection) => total + collection.photos.length, 0);
    setNumPhotos(numPhotos);

    // ifDebug(() => {
    //   if (!window.debug) window.debug = {};
    //   window.debug.photos = photos;
    //   window.debug.numPhotos = numPhotos;
    // });
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
