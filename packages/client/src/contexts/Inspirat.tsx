import { InspiratPhotoResource } from 'inspirat-types';
import prettyMs from 'pretty-ms';
import React from 'react';
import useAsyncEffect from 'use-async-effect';

import useQuery from 'hooks/use-query';
import useStorageItem from 'hooks/use-storage-item';
import {
  getPhotoCollections,
  getCurrentPhotoFromCollection,
  getCurrentPhotoFromCache
} from 'lib/photos';
import {
  midnight,
  now
} from 'lib/time';
import {
  ifDebug,
  preloadImage,
  updateImgixQueryParams
} from 'lib/utils';


/**
 * Shape of the object provided by this Context.
 */
export interface InspiratContext {
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
   * Current name that the user has set, persisted in local storage.
   */
  name?: string;

  /**
   * Sets the user's name.
   */
  setName: (value: string) => void;

  /**
   * Allows other components to set the day offset to a value by using the
   * 'increment' or 'decrement' actions.
   */
  setDayOffset: (action: 'increment' | 'decrement') => void;

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


const Context = React.createContext<InspiratContext>({} as any);


export const Provider = (props: React.PropsWithChildren<React.ReactNode>) => {
  const [currentPhotoFromState, setCurrentPhoto] = React.useState<InspiratPhotoResource>();
  const [shouldResetPhoto, resetPhoto] = React.useState(0);
  const [numPhotos, setNumPhotos] = React.useState(0);
  const [showDevTools, setShowDevTools] = React.useState(false);
  const [isLoadingPhotos, setIsLoadingPhotos] = React.useState(false);
  const [name, setName] = useStorageItem<string>('name');
  const [hasSeenIntroduction, setHasSeenIntroduction] = useStorageItem<boolean>('hasSeenIntroduction');
  const query = useQuery();


  // ----- [Reducer] Increment/Decrement Photo Index ---------------------------

  const [dayOffset, setDayOffset] = React.useReducer((state: number, action: 'increment' | 'decrement') => {
    switch (action) {
      case 'increment':
        return state + 1;
      case 'decrement':
        return state - 1;
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }, 0);


  // ----- [Effect] Determine Dev Tools Visibility -----------------------------

  React.useEffect(() => ifDebug(() => {
    console.debug('[Debug] Debug mode is enabled.');
    window.debug = window.debug || {};

    if (Object.keys(query).includes('devtools')) {
      setShowDevTools(true);
    }
  }), []);


  // ----- [Async Effect] Determine Size of Photo Collection -------------------

  useAsyncEffect(async () => {
    const photos = await getPhotoCollections();
    setNumPhotos(photos.length);

    ifDebug(() => {
      window.debug.photos = photos;
      window.debug.numPhotos = photos.length;
    });
  }, []);


  // ----- Pre-Fetch & Update Photos -------------------------------------------

  /**
   * If dev tools are open, pre-loads the previous photo for faster seeking.
   */
  const preloadPreviousPhoto = React.useCallback(async () => {
    if (showDevTools) {
      const prevPhoto = await getCurrentPhotoFromCollection({offset: dayOffset - 1});
      return preloadImage(updateImgixQueryParams(prevPhoto.urls.full));
    }
  }, [
    dayOffset,
    showDevTools
  ]);


  /**
   * Pre-loads the next/tomorrow's photo.
   */
  const preloadNextPhoto = React.useCallback(async () => {
    const nextPhoto = await getCurrentPhotoFromCollection({offset: dayOffset + 1});
    return preloadImage(updateImgixQueryParams(nextPhoto.urls.full));
  }, [
    dayOffset
  ]);


  /**
   * Provided a descriptor for the current photo, pre-loads the photo, then
   * sets the provided descriptor as the current photo.
   */
  const preloadAndSetCurrentPhoto = React.useCallback(async (photoResource: InspiratPhotoResource) => {
    await preloadImage(updateImgixQueryParams(photoResource.urls.full));
    setCurrentPhoto(photoResource);
  }, [
    currentPhotoFromState
  ]);


  /**
   * Updates photos.
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
      window.debug.currentPhoto = currentPhoto;
    });

    await Promise.all([
      preloadPreviousPhoto(),
      preloadNextPhoto(),
      preloadAndSetCurrentPhoto(currentPhoto)
    ]);

    setIsLoadingPhotos(false);
  }, [
    dayOffset,
    showDevTools
  ]);


  /**
   * Updates photos, then sets a timeout that will trigger another update at
   * midnight.
   */
  const updatePhotosWithTimer = React.useCallback(() => {
    void updatePhotos();

    const timeToUpdate = midnight() - now();

    ifDebug(() => {
      console.debug(`[setPhotoUpdateTimer] Current photo will update in ${prettyMs(timeToUpdate)}.`);

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


  /**
   * Initiates the photo update routine.
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


  // ----- Context API ---------------------------------------------------------

  const contextApi = {
    hasSeenIntroduction,
    setHasSeenIntroduction,
    dayOffset,
    setDayOffset,
    showDevTools,
    isLoadingPhotos,
    name,
    setName,
    currentPhoto: currentPhotoFromState,
    setCurrentPhoto,
    resetPhoto: () => {
      resetPhoto(shouldResetPhoto + 1);
    },
    numPhotos
  };

  return (
    <Context.Provider value={contextApi}>
      {props.children}
    </Context.Provider>
  );
};


export default Context;
