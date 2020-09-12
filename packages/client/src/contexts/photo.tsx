import mousetrap from 'mousetrap';
import React from 'react';
import useAsyncEffect from 'use-async-effect';

import {UnsplashPhotoResource} from 'etc/types';
import useQuery from 'hooks/use-query';
import useStorageItem from 'hooks/use-storage-item';
import {
  getFullImageUrl,
  getPhotos,
  getPhotoForDay,
  getPhotoForDayCached,
  preloadImage
} from 'lib/photos';
import {ifDev} from 'lib/utils';


/**
 * Shape of the object provided by this Context.
 */
export interface PhotoProviderContext {
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
  setCurrentPhoto: (photo: UnsplashPhotoResource | undefined) => void;

  /**
   * Resets the current photo to the photo that should be displayed based on the
   * current day offset.
   */
  resetPhoto: () => void;
}


const Context = React.createContext<PhotoProviderContext>({} as any);


export const Provider = (props: React.PropsWithChildren<React.ReactNode>) => {
  const [currentPhotoFromState, setCurrentPhoto] = React.useState<UnsplashPhotoResource>();
  const [shouldResetPhoto, resetPhoto] = React.useState(0);
  const [numPhotos, setNumPhotos] = React.useState(0);
  const [showDevTools, setShowDevTools] = React.useState(false);
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

  React.useEffect(() => ifDev(() => setShowDevTools(Object.keys(query).includes('dev'))), []);


  // ----- [Effect] Create Dev Tools Key-Bindings ------------------------------

  // TODO: Move to DevTools component.
  React.useEffect(() => ifDev(() => {
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
  }), [showDevTools]);


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
