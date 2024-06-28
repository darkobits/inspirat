/* eslint-disable no-confusing-arrow */
// import Cron from '@darkobits/cron';
import { addDays, format } from 'date-fns';
import * as Jotai from 'jotai';
import ms from 'ms';
import * as R from 'ramda';
import React from 'react';
import useAsyncEffect from 'use-async-effect';

import { atoms } from 'web/atoms/inspirat';
import { BACKGROUND_ANIMATION_INITIAL_SCALE } from 'web/etc/constants';
import { Logger } from 'web/lib/log';
import {
  getPhotoCollections,
  getPhotoFromCollection,
  getCurrentPhotoFromCollection
} from 'web/lib/photos';
import { getPeriodDescriptor } from 'web/lib/time';
import {
  buildPhotoUrlSrcSet,
  getFormattedDateWithDayOffset,
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
   * The current date in the format "yyyy-MM-dd". This can be manipulated using
   * the Dev Tools.
   */
  currentDate: Date;

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
   * Allows other components to set the date to a value.
   */
  setCurrentDate: (newDate: Date | ((prev: Date) => Date)) => void;

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

  currentDate: new Date(),
  setCurrentDate: () => new Date(),

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
  const [currentDate, setCurrentDate] = Jotai.useAtom(atoms.currentDate);
  const [hasSeenIntroduction, setHasSeenIntroduction] = Jotai.useAtom(atoms.hasSeenIntroduction);
  const [photoTimeline, setPhotoTimeline] = Jotai.useAtom(atoms.photoTimeline);

  const [currentPhoto, setCurrentPhoto] = React.useState<InspiratPhotoResource>();
  const [shouldResetPhoto, resetPhoto] = React.useState(0);
  const [numPhotos, setNumPhotos] = React.useState(0);
  const [period, setPeriod] = React.useState(getPeriodDescriptor());
  const [isLoadingPhotos, setIsLoadingPhotos] = React.useState(false);

  // ----- Callbacks -----------------------------------------------------------

  /**
   * [Callback] Provided a photo, returns an object containing URLs with IMGIX
   * query parameters configured to generate a low quality and high quality
   * version of the photo based on the user's screen dimensions and other
   * application settings.
   */
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

  /**
   * [Callback] Provided a string representing a date in the format
   * "yyyy-MM-dd", populates the photo timeline for the indicated date and an
   * interval of +/- 5 days.
   */
  const updatePhotoTimeline = React.useCallback(async (date: Date, overwrite = false) => {
    const photosToAdd: Record<string, string> = {};

    for (const curOffset of R.range(-5, 6)) {
      const dateWithCurOffset = addDays(date, curOffset);
      // Compute the key used in the photo timeline object for the current date.
      const timelineKey = format(dateWithCurOffset, 'yyyy-MM-dd');

      if (!photoTimeline || !Reflect.has(photoTimeline, timelineKey) || overwrite) {
        const { id } = await getCurrentPhotoFromCollection({ seed: name, date: dateWithCurOffset });
        photosToAdd[timelineKey] = id;
      }
    }

    const newTimeline = { ...photoTimeline, ...photosToAdd };
    setPhotoTimeline(newTimeline);
    log.debug(`Timeline has ${Object.keys(newTimeline).length} entries.`);
  }, [name, photoTimeline]);

  /**
   * [Callback] Provided a day offset (assumed to be from today) pre-loads any
   * images from the timeline in a +/- 3-day range from the offset.
   */
  const preloadPhotosFromTimeline = React.useCallback(async (date: Date) => {
    if (!photoTimeline) return;

    const urlsToPreload: Array<string> = [];

    for (const curOffset of [0, ...R.range(-3, 4)]) {
      const dateFromCurOffset = format(addDays(date, curOffset), 'yyyy-MM-dd');
      const photoIdFromTimeline = Reflect.get(photoTimeline, dateFromCurOffset);

      if (Reflect.has(photoTimeline, dateFromCurOffset)) {
        const photoFromTimeline = await getPhotoFromCollection(photoIdFromTimeline);
        if (!photoFromTimeline) return;

        const { lowQuality, highQuality } = buildPhotoUrls(photoFromTimeline);
        urlsToPreload.push(lowQuality);
        urlsToPreload.push(highQuality);
      }
    }

    const uniqueUrlsToPreload = new Set(urlsToPreload);

    // Note: It is safe to call `preloadImage` with URLs we have already
    // pre-loaded; it will no-op.
    if (uniqueUrlsToPreload.size > 0) {
      await Promise.all([...uniqueUrlsToPreload].map(url => preloadImage(url)));
    }
  }, [photoTimeline]);

  // ----- Effects -------------------------------------------------------------

  /**
   * [Effect] ...
   */
  useAsyncEffect(async isMounted => {
    if (!photoTimeline) {
      await updatePhotoTimeline(currentDate);
      return;
    }

    const timelineKey = getFormattedDateWithDayOffset({ date: currentDate });

    // If the timeline doesn't have a photo for the current day, update it.
    if (!Reflect.has(photoTimeline, timelineKey)) {
      await updatePhotoTimeline(currentDate);
      // Return here. The effect will run again because `updatePhotoTimeline`
      // will trigger an update of `photoTimeline`, causing this effect to run
      // again with a fresh value.
      return;
    }

    const photoIdFromTimeline = Reflect.get(photoTimeline, timelineKey);
    if (!photoIdFromTimeline) throw new Error(`[Inspirat] No entry in timeline for "${currentDate}"`);

    const photoFromTimeline = await getPhotoFromCollection(photoIdFromTimeline, currentDate);
    if (!isMounted()) return;

    // If we can't find a photo in our collections, this may mean that the photo
    // was removed from all collections after being added to the timeline. In
    // this case, perform another update to the timeline, but compute fresh
    // photos rather than only adding missing ones.
    if (!photoFromTimeline) {
      log.warn(`No photo in collections with ID ${photoIdFromTimeline}.`);
      await updatePhotoTimeline(currentDate, true);
      // Again, we can bail early and the above function call will trigger a
      // re-run of this effect with fresh data.
      return;
    }

    setCurrentPhoto(photoFromTimeline);
    void preloadPhotosFromTimeline(currentDate);
  }, [currentDate, photoTimeline]);

  /**
   * [Effect] Responsible for ensuring the photo changes at midnight.
   * SHOULD NOT BE NEEDED ANY MORE, CURRENT DATE IS ALWAYS KNOWNj
   * MAYBE ADD A CRON TO RE-GET THE CURRENT PHOTO FOR THE CURRENT DATE EVERY
   * SO OFTEN.
   */
  // React.useEffect(() => {
  //   const photoUpdateCron = Cron('0 0 * * *', () => {
  //     log.info('[Cron] Updating photo.');
  //     setDayOffset(prev => prev + 1);
  //   });

  //   void photoUpdateCron.start();

  //   return () => {
  //     void photoUpdateCron.suspend();
  //   };
  // }, [currentDate]);

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

        currentDate,
        setCurrentDate,

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
