import cx from 'classnames';
import mousetrap from 'mousetrap';
import ms from 'ms';
import React from 'react';
// @ts-expect-error - This package has no type definitions.
import SwipeListener from 'swipe-listener';
import { throttle } from 'throttle-debounce';

import { LoadingIndicator } from 'web/components/dev-tools/LoadingIndicator';
import { Palette } from 'web/components/dev-tools/Palette';
import { ProgressBar } from 'web/components/dev-tools/Progress';
import { Source } from 'web/components/dev-tools/Source';
import InspiratContext from 'web/contexts/Inspirat';
import {
  DEVTOOLS_MOUSE_LEAVE_TIMEOUT,
  BACKGROUND_TRANSITION_DURATION,
  BACKGROUND_TRANSITION_FUNCTION
} from 'web/etc/constants';
import { getCurrentPhotoFromCollection } from 'web/lib/photos';
import { modIndex, mockPhotoResourceFromUrl, preloadImage, isTouchEvent } from 'web/lib/utils';

import classes, { PROGRESS_BAR_HEIGHT } from './DevTools.css';

/**
 * @private
 *
 * Tracks the amount of time elapsed since the mouse last left our container
 * element.
 */
let mouseLeaveTimeout: NodeJS.Timeout;

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
    currentPhotoPreloaded,
    setCurrentPhoto,
    setDayOffset,
    resetPhoto,
    numPhotos,
    buildPhotoUrls
  } = React.useContext(InspiratContext);
  const [show, setShow] = React.useState(true);

  /*
   * [Effect] Initialize DevTools mouse/key/gesture bindings.
   */
  React.useEffect(() => {
    if (!showDevTools) return;

    mousetrap.bind('left', throttle(ms(BACKGROUND_TRANSITION_DURATION) * 1.5, () => {
      if (!currentPhotoPreloaded) return;
      setDayOffset('decrement');
    }, { noLeading: false }));

    mousetrap.bind('right', throttle(ms(BACKGROUND_TRANSITION_DURATION) * 1.5, () => {
      if (!currentPhotoPreloaded) return;
      setDayOffset('increment');
    }, { noLeading: false }));

    const swipeListener = SwipeListener(document);

    document.addEventListener('swipe', event => {
      if (!currentPhotoPreloaded) return;
      if (isTouchEvent(event)) {
        if (event.detail.directions.left) {
          setDayOffset('increment');
        } else if (event.detail.directions.right) {
          setDayOffset('decrement');
        }
      }
    });

    mouseLeaveTimeout = setTimeout(() => {
      setShow(false);
    }, DEVTOOLS_MOUSE_LEAVE_TIMEOUT);

    return () => {
      clearTimeout(mouseLeaveTimeout);
      mousetrap.unbind('left');
      mousetrap.unbind('right');
      swipeListener.off();
    };
  }, [showDevTools, currentPhotoPreloaded]);

  /**
   * [Effect] If DevTools are active, when `dayOffset` changes, pre-load images
   * for the previous and next photo based on day offset.
   */
  React.useEffect(() => {
    if (!showDevTools) return;

    void Promise.all([
      getCurrentPhotoFromCollection({ offset: dayOffset + 1 }).then(photo => {
        if (!photo) return;
        const { lowQuality, highQuality } = buildPhotoUrls(photo);
        return Promise.all([preloadImage(lowQuality), preloadImage(highQuality)]);
      }),
      getCurrentPhotoFromCollection({ offset: dayOffset - 1 }).then(photo => {
        if (!photo) return;
        const { lowQuality, highQuality } = buildPhotoUrls(photo);
        return Promise.all([preloadImage(lowQuality), preloadImage(highQuality)]);
      })
    ]);
  }, [showDevTools, dayOffset]);


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
        resetPhoto();
        return;
      }

      setCurrentPhoto(mockPhotoResource);
    } catch {
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

  if (!showDevTools) return null;

  const progress = modIndex(dayOffset, numPhotos) / numPhotos;

  return (
    <div
      data-testid="DevTools"
      className={cx(classes.devToolsContainer, 'safe-padding')}
      style={{ opacity: show ? 1 : 0 }}
    >
      {/* Progress Bar (Fixed Position) */}
      <ProgressBar
        progress={progress}
        onProgressChange={handleProgressChange}
        style={{ height: PROGRESS_BAR_HEIGHT }}
      />

      {/* DevTools */}
      <div
        className={classes.devToolsWrapper}
        onMouseEnter={() => {
          clearTimeout(mouseLeaveTimeout);
          setShow(true);
        }}
        onMouseLeave={() => {
          mouseLeaveTimeout = setTimeout(() => {
            setShow(false);
          }, DEVTOOLS_MOUSE_LEAVE_TIMEOUT);
        }}
      >
        {/* Address Bar & Loading Indicator */}
        <div className={classes.devToolsRow}>
          <Source photo={currentPhoto}>
            <input
              type="text"
              onChange={onImgIdChange}
              onFocus={handleImgIdFocus}
              placeholder="https://unsplash.com/photos/:id"
              spellCheck={false}
              autoCorrect="false"
              autoComplete="false"
              style={{
                height: '100%',
                transitionProperty: 'color, background-color, border-color',
                transitionTimingFunction: BACKGROUND_TRANSITION_FUNCTION,
                transitionDuration: BACKGROUND_TRANSITION_DURATION
              }}
            />
          </Source>
          <LoadingIndicator
            photo={currentPhoto}
            isLoading={isLoadingPhotos}
            style={{
              transitionProperty: 'color, background-color, border-color',
              transitionTimingFunction: BACKGROUND_TRANSITION_FUNCTION,
              transitionDuration: BACKGROUND_TRANSITION_DURATION
            }}
          />
        </div>

        {/* Palette */}
        <div className={classes.devToolsRow}>
          <Palette
            photo={currentPhoto}
            swatchProps={{
              style: {
                transitionProperty: 'color, background-color, border-color',
                transitionTimingFunction: BACKGROUND_TRANSITION_FUNCTION,
                transitionDuration: BACKGROUND_TRANSITION_DURATION
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};
