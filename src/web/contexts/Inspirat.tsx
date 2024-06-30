import { addDays, format } from 'date-fns';
import * as Jotai from 'jotai';
import ms from 'ms';
import pQueue from 'p-queue';
import * as R from 'ramda';
import React from 'react';
import useAsyncEffect from 'use-async-effect';

import { atoms } from 'web/atoms/inspirat';
import {
  BACKGROUND_ANIMATION_INITIAL_SCALE,
  BACKGROUND_RULE_OVERRIDES,
  TIMELINE_WINDOW_DAYS
} from 'web/etc/constants';
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

const preloadQueue = new pQueue({
  concurrency: 2,
  intervalCap: 2,
  interval: ms('1 second'),
  carryoverConcurrencyCount: true
});

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

    const { imgixParams } = BACKGROUND_RULE_OVERRIDES[photo.id] ?? {};

    // This is where IMGIX configuration for low and high quality versions of
    // photos is defined.
    return buildPhotoUrlSrcSet(photo.urls.full, {
      fm: 'jpg',
      q: 70,
      w: Math.round(window.screen.width * 0.64),
      // h: Math.round(window.screen.height / 2)
      // Adds a color overlay. Can be useful for debugging.
      // blend: 'FA653D',
      // blendMode: 'overlay'
      ...imgixParams
    }, {
      fm: 'jpg',
      q: 98,
      w: Math.round(window.screen.width * BACKGROUND_ANIMATION_INITIAL_SCALE),
      h: Math.round(window.screen.height * BACKGROUND_ANIMATION_INITIAL_SCALE),
      ...imgixParams
    });
  }, []);

  /**
   * [Callback] Provided a string representing a date in the format
   * "yyyy-MM-dd", populates the photo timeline for the indicated date and an
   * interval of +/- 5 days.
   */
  const updatePhotoTimeline = React.useCallback(async (date: Date, overwrite = false) => {
    const photosToAdd: Record<string, string> = {};

    for (const curOffset of R.range(TIMELINE_WINDOW_DAYS[0], TIMELINE_WINDOW_DAYS[1] + 1)) {
      const dateWithCurOffset = addDays(date, curOffset);
      // Compute the key used in the photo timeline object for the current date.
      const timelineKey = format(dateWithCurOffset, 'yyyy-MM-dd');

      if (!photoTimeline || !Reflect.has(photoTimeline, timelineKey) || overwrite) {
        const { id } = await getCurrentPhotoFromCollection({ date: dateWithCurOffset });
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

    // Pre-load past and future photos in dev mode. Otherwise, only pre-load
    // future photos.
    const offsets = import.meta.env.DEV
      ? R.range(TIMELINE_WINDOW_DAYS[0], TIMELINE_WINDOW_DAYS[1] + 1)
      : R.range(0, TIMELINE_WINDOW_DAYS[1] + 1);

    // N.B. The leading 0 ensures we always preload the photo for the current
    // day first. The duplicated 0 from R.range will be a no-op.
    for (const curOffset of offsets) {
      const dateFromCurOffset = format(addDays(date, curOffset), 'yyyy-MM-dd');
      const photoIdFromTimeline = Reflect.get(photoTimeline, dateFromCurOffset);

      if (Reflect.has(photoTimeline, dateFromCurOffset)) {
        const photoFromTimeline = await getPhotoFromCollection(photoIdFromTimeline);
        if (!photoFromTimeline) return;
        const { lowQuality, highQuality } = buildPhotoUrls(photoFromTimeline);

        // This will compute a priority such that offset 0 will have a priority
        // of Infinity, and other offsets will have a decreasing priority based
        // on their distance from 0. In other words, photos will be loaded based
        // on their proximity to today.
        const priority = Math.round(Math.abs(1 / curOffset) * 100);

        void preloadQueue.add(() => {
          return preloadImage(lowQuality);
        }, { priority });

        void preloadQueue.add(() => {
          return preloadImage(highQuality);
        }, { priority });
      }
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
      // Return here. Because `updatePhotoTimeline` triggers an update of
      // `photoTimeline`, causing this effect to run again with a fresh value.
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
  }, [currentDate, photoTimeline, shouldResetPhoto]);

  /**
   * [Effect] Sets up event listeners which update isLoading based on the state
   * of the queue.
   */
  React.useEffect(() => {
    const onActive = () => setIsLoadingPhotos(true);
    const onIdle = () => setIsLoadingPhotos(false);
    preloadQueue.on('active', onActive);
    preloadQueue.on('idle', onIdle);

    return () => {
      preloadQueue.off('active', onActive);
      preloadQueue.off('idle', onIdle);
    };
  }, []);

  /**
   * [Effect] Initializes debug data.
   */
  useAsyncEffect(async isMounted => {
    const photos = await getPhotoCollections();
    if (!isMounted()) return;
    const numPhotos = photos.collections.reduce((total, collection) => total + collection.photos.length, 0);
    setNumPhotos(numPhotos);
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
