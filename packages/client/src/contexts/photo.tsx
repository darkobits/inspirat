import mousetrap from 'mousetrap';
import React, {
  createContext,
  PropsWithChildren,
  useEffect,
  useReducer,
  useState
} from 'react';
import useAsyncEffect from 'use-async-effect';

import {UnsplashPhotoResource} from 'etc/types';
import {
  getFullImageUrl,
  getPhotos,
  getPhotoForDay,
  getPhotoForDayCached,
  preloadImage
} from 'lib/photos';
import queryString from 'lib/query';
import {ifDev} from 'lib/utils';


/**
 * Shape of the object provided by this Context.
 */
export interface PhotoProviderContext {
  /**
   * Tracks the current day offset (starts at 0) when in development mode.
   */
  dayOffset: number;

  /**
   * The photo resource that should be used based on the current day offset.
   */
  currentPhoto: UnsplashPhotoResource | undefined;

  /**
   * The total number of photos in the collection.
   */
  numPhotos: number;

  /**
   * Whether or not we are in "dev mode".
   */
  showDevTools: boolean;

  /**
   * Allows other components to set the day offset to a value by using the
   * 'increment' or 'decrement' actions.
   */
  setDayOffset(action: 'increment' | 'decrement'): void;

  /**
   * Allows other components to set the current photo, overriding the photo that
   * would be displayed based on the current day offset.
   */
  setCurrentPhoto(photo: UnsplashPhotoResource | undefined): void;

  /**
   * Resets the current photo to the photo that should be displayed based on the
   * current day offset.
   */
  resetPhoto(): void;
}


const Context = createContext<PhotoProviderContext>({} as any);


export const Provider = (props: PropsWithChildren<React.ReactNode>) => {
  const [currentPhotoFromState, setCurrentPhoto] = useState<UnsplashPhotoResource>();
  const [shouldResetPhoto, resetPhoto] = useState(0);
  const [numPhotos, setNumPhotos] = useState(0);
  const [showDevTools, setShowDevTools] = useState(false);


  // ----- [Reducer] Increment/Decrement Photo Index ---------------------------

  const [dayOffset, setDayOffset] = useReducer((state: number, action: 'increment' | 'decrement') => {
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

  useEffect(() => ifDev(() => setShowDevTools(Object.keys(queryString()).includes('dev'))), []);


  // ----- [Effect] Create Key-Bindings ----------------------------------------

  useEffect(() => ifDev(() => {
    if (!showDevTools) {
      return;
    }

    mousetrap.bind('left', () => {
      setDayOffset('decrement');
    });

    mousetrap.bind('right', () => {
      setDayOffset('increment');
    });

    console.debug('[Development] Keyboard shortcuts registered.');

    return () => {
      mousetrap.unbind('left');
      mousetrap.unbind('right');
    };
  }), [
    // Run this effect whenever showDevTools changes.
    showDevTools
  ]);


  // ----- [Async Effect] Determine Size of Photo Collection -------------------

  useAsyncEffect(async () => {
    const photos = await getPhotos();
    setNumPhotos(photos.length);
  }, []);


  // ----- [Async Effect] Pre-Fetch Photos -------------------------------------

  useAsyncEffect(async () => {
    const photoFetchPromises: Array<Promise<any>> = [];

    // Get data about the photo for the current day.
    const currentPhoto = showDevTools ? await getPhotoForDay({offset: dayOffset}) : await getPhotoForDayCached();

    // Start pre-loading the photo.
    const currentPhotoFetchPromise = preloadImage(getFullImageUrl(currentPhoto.urls.full));

    photoFetchPromises.push(currentPhotoFetchPromise);

    // [Development] Log Current Photo Information
    ifDev(() => {
      console.groupCollapsed(`[Splash] Current photo ID: "${currentPhoto.id}"`);
      console.debug(currentPhoto);
      console.groupEnd();
    });

    // Pre-Load Next Photo
    const nextPhoto = await getPhotoForDay({offset: dayOffset + 1});
    const nextPhotoFetchPromise = preloadImage(getFullImageUrl(nextPhoto.urls.full));
    photoFetchPromises.push(nextPhotoFetchPromise);

    // [Development] Pre-Load Previous Photo
    ifDev(async () => {
      const prevPhoto = await getPhotoForDay({offset: dayOffset - 1});
      const prevPhotoFetchPromise = preloadImage(getFullImageUrl(prevPhoto.urls.full));
      photoFetchPromises.push(prevPhotoFetchPromise);
    });

    // If there is no current photo, or if the current photo does not match
    // the one in the component's state, update state.
    if (!currentPhotoFromState || currentPhoto.id !== currentPhotoFromState.id) {
      // Wait for the photo to download.
      await currentPhotoFetchPromise;

      // Then, set the photo data. Because the image is already cached, it
      // will appear immediately.
      setCurrentPhoto(currentPhoto);
    }

    ifDev(async () => {
      await Promise.all(photoFetchPromises);
      console.debug('[PhotosProvider] Finished downloading adjacent photos.');
    });
  }, [
    // Re-run this effect when the day offset changes (ie: via the setDayOffset
    // function we export in our context).
    dayOffset,
    // Re-run this effect whenever the value of shouldResetPhoto changes (ie:
    // when resetPhot() is called).
    shouldResetPhoto,
    // Re-run this effect when the status of development mode changes.
    showDevTools
  ]);


  // ----- Context API ---------------------------------------------------------

  const contextApi = {
    dayOffset,
    setDayOffset,
    showDevTools,
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
