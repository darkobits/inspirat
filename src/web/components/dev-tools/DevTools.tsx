import mousetrap from 'mousetrap';
import React from 'react';

import { LoadingIndicator } from 'web/components/dev-tools/LoadingIndicator';
import { Palette } from 'web/components/dev-tools/Palette';
import { Progress } from 'web/components/dev-tools/Progress';
import { Source } from 'web/components/dev-tools/Source';
import { useInspirat } from 'web/hooks/use-inspirat';
import { modIndex, mockPhotoResourceFromUrl } from 'web/lib/utils';

import classes from './DevTools.css';


/**
 * TODO: Showing the dev tools currently changes the photo shown. Should use the
 * photo that would be shown if dev tools were hidden.
 */
export const DevTools = () => {
  const {
    dayOffset,
    showDevTools,
    isLoadingPhotos,
    currentPhoto,
    setCurrentPhoto,
    setDayOffset,
    resetPhoto,
    numPhotos
  } = useInspirat();

  /*
   * [Effect] Dev Tools initialization.
   */
  React.useEffect(() => {
    if (!showDevTools) {
      return;
    }

    mousetrap.bind('left', () => {
      setDayOffset('decrement');
    });

    mousetrap.bind('right', () => {
      setDayOffset('increment');
    });

    return () => {
      mousetrap.unbind('left');
      mousetrap.unbind('right');
    };
  }, [setDayOffset, showDevTools]);


  /**
   * [Callback] Immediately select the contents of the image source field when
   * the element is focused.
   */
  const handleImgIdFocus: React.FocusEventHandler<HTMLInputElement> = React.useCallback(e => {
    e.currentTarget.select();
  }, []);


  /**
   * [Callback] Handle updates to the image source field.
   *
   * Note: This uses the Unsplash Source API, which redirects to a photo URL
   * with various Imgix query parameters applied. This API lets the user control
   * image dimensions by passing an additional path parameter in the format
   * /<width>x<height>. Rather than implement logic to follow these redirects
   * then run URLs through existing logic to rewrite Imgix params, we will just
   * pass the browser's current width and height using the Source API parameter
   * format.
   */
  const onImgIdChange: React.ChangeEventHandler<HTMLInputElement> = React.useCallback(e => {
    try {
      const value = e.currentTarget.value;

      if (!value) {
        resetPhoto();
        return;
      }

      const mockPhotoResource = mockPhotoResourceFromUrl(value);

      if (!mockPhotoResource) {
        console.error('NO MOCK RESOURCE FOR YOU');
        resetPhoto();
        return;
      }

      setCurrentPhoto(mockPhotoResource);
    } catch (err) {
      console.error('WTF', err);
      resetPhoto();
    }
  }, [
    resetPhoto,
    setCurrentPhoto
  ]);


  /**
   * [Callback] Explicitly sets the day offset when we get a progress update
   * from the progress bar.
   */
  const handleProgressChange = React.useCallback((newProgress: number) => {
    setDayOffset(Math.floor(numPhotos * newProgress));
  }, [numPhotos, setDayOffset]);


  if (!showDevTools) {
    return null;
  }


  const progress = modIndex(dayOffset, numPhotos) / numPhotos;


  return (
    <div className={classes.devTools}>
      <Progress
        progress={progress}
        photo={currentPhoto}
        onProgressChange={handleProgressChange}
      />
      <Source photo={currentPhoto}>
        <input
          type="text"
          onChange={onImgIdChange}
          onFocus={handleImgIdFocus}
          placeholder="https://unsplash.com/photos/:id"
          spellCheck={false}
          autoCorrect="false"
          autoComplete="false"
        />
      </Source>
      <LoadingIndicator photo={currentPhoto} isLoading={isLoadingPhotos} />
      <Palette photo={currentPhoto} />
    </div>
  );
};
