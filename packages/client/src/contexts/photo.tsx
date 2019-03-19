import React, {createContext, PropsWithChildren, useEffect, useReducer, useState} from 'react';

import {UnsplashPhotoResource} from 'etc/types';
import {getFullImageUrl, getPhotos, getPhotoForDay, preloadImage} from 'lib/photos';


/**
 * Shape of the object provided by this Context.
 */
export interface PhotoProviderContext {
  /**
   * Tracks the current day offset (starts at 0) when in development mode.
   */
  dayOffset: number;

  /**
   * Allows other components to set the day offset to a value by using the
   * 'increment' or 'decrement' actions.
   */
  setDayOffset(action: string): void;

  /**
   * The photo resource that should be used based on the current day offset.
   */
  currentPhoto: UnsplashPhotoResource | undefined;

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

  /**
   * The total number of photos in the collection.
   */
  numPhotos: number;
}


const Context = createContext<PhotoProviderContext>({} as any);


export const Provider = (props: PropsWithChildren<{}>) => {
  const [currentPhotoFromState, setCurrentPhoto] = useState<UnsplashPhotoResource>();
  const [shouldResetPhoto, resetPhoto] = useState(0);
  const [numPhotos, setNumPhotos] = useState(0);

  // tslint:disable-next-line no-unnecessary-type-annotation
  const [dayOffset, setDayOffset] = useReducer((state: number, action: string) => {
    switch (action) {
      case 'increment':
        return state + 1;
      case 'decrement':
        return state - 1;
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }, 0);

  // [Effect] Determine Size of Photo Collection
  useEffect(() => {
    // tslint:disable-next-line no-floating-promises
    (async () => {
      setNumPhotos((await getPhotos()).length);
    })();
  }, [
    // Only run this effect when the Context loads for the first time.
  ]);

  // [Effect] Pre-Fetch Photos
  useEffect(() => {
    // tslint:disable-next-line no-floating-promises
    (async () => {
      const photoFetchPromises = [];

      // Get data about the photo for the current day.
      const currentPhoto = await getPhotoForDay({offset: dayOffset});

      // Start pre-loading the photo.
      const currentPhotoFetchPromise = preloadImage(getFullImageUrl(currentPhoto.urls.full));

      photoFetchPromises.push(currentPhotoFetchPromise);

      // [Development] Log Current Photo Information
      if (process.env.NODE_ENV === 'development') {
        console.groupCollapsed(`[Splash] Current photo ID: "${currentPhoto.id}"`);
        console.debug(currentPhoto);
        console.groupEnd();
      }

      // Pre-Load Next Photo
      const nextPhoto = await getPhotoForDay({offset: dayOffset + 1});
      const nextPhotoFetchPromise = preloadImage(getFullImageUrl(nextPhoto.urls.full));
      photoFetchPromises.push(nextPhotoFetchPromise);

      // [Development] Pre-Load Previous Photo
      if (process.env.NODE_ENV === 'development') {
        const prevPhoto = await getPhotoForDay({offset: dayOffset - 1});
        const prevPhotoFetchPromise = preloadImage(getFullImageUrl(prevPhoto.urls.full));
        photoFetchPromises.push(prevPhotoFetchPromise);
      }

      // If there is no current photo, or if the current photo does not match
      // the one in the component's state, update state.
      if (!currentPhotoFromState || currentPhoto.id !== currentPhotoFromState.id) {
        // Wait for the photo to download.
        await currentPhotoFetchPromise;

        // Then, set the photo data. Because the image is already cached, it
        // will appear immediately.
        setCurrentPhoto(currentPhoto);
      }

      if (process.env.NODE_ENV === 'development') {
        await Promise.all(photoFetchPromises);
        console.debug('[TestProvider] All photos loaded.');
      }
    })();
  }, [
    // Re-run this effect when the day offset changes (ie: via the setDayOffset
    // function we export in our context).
    dayOffset,
    shouldResetPhoto
  ]);

  return (
    <Context.Provider value={{
      dayOffset,
      setDayOffset,
      currentPhoto: currentPhotoFromState,
      setCurrentPhoto,
      resetPhoto() {
        resetPhoto(shouldResetPhoto + 1);
      },
      numPhotos
    }}>{props.children}</Context.Provider>
  );
};


export default Context;
