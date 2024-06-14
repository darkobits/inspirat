import cx from 'classnames';
import { format, addDays } from 'date-fns';
import mousetrap from 'mousetrap';
import ms from 'ms';
import { desaturate, lighten, darken } from 'polished';
import React from 'react';
import { Helmet } from 'react-helmet';
import { BsArrowRepeat, BsCircle } from 'react-icons/bs';
// @ts-expect-error - This package has no type definitions.
import SwipeListener from 'swipe-listener';
import { throttle } from 'throttle-debounce';
import { useAsyncEffect } from 'use-async-effect';

import { Palette } from 'web/components/dev-tools/Palette';
import { ProgressBar } from 'web/components/dev-tools/Progress';
import { Source } from 'web/components/dev-tools/Source';
import InspiratContext from 'web/contexts/Inspirat';
import {
  DEVTOOLS_MOUSE_LEAVE_TIMEOUT,
  BACKGROUND_TRANSITION_DURATION,
  BACKGROUND_TRANSITION_FUNCTION,
  TITLE
} from 'web/etc/constants';
import { animations } from 'web/etc/global-styles.css';
import { modIndex, mockPhotoResourceFromUrl, isTouchEvent, rgba } from 'web/lib/utils';

import classes, { PROGRESS_BAR_HEIGHT } from './DevTools.css';

/**
 * @private
 *
 * Tracks the amount of time elapsed since the mouse last left our container
 * element.
 */
let mouseLeaveTimeout: NodeJS.Timeout;

/**
 * How long to throttle (ignore) keyboard or swipe events that change the day
 * offset. Set to the transition time plus a small buffer.
 */
const THROTTLE_TIME = ms(BACKGROUND_TRANSITION_DURATION) + ms('250ms');

export function DevTools() {
  const {
    showDevTools,
    dayOffset,
    setDayOffset,
    currentPhoto,
    setCurrentPhoto,
    resetPhoto,
    isLoadingPhotos
  } = React.useContext(InspiratContext);
  const [show, setShow] = React.useState(true);
  const [customSource, setCustomSource] = React.useState<string | void>('');

  /*
   * [Effect] Initialize DevTools mouse/key/gesture bindings.
   */
  React.useEffect(() => {
    if (!showDevTools) return;

    const swipeListener = SwipeListener(document);

    mousetrap.bind('left', throttle(THROTTLE_TIME, () => {
      setDayOffset(prev => modIndex(Number(prev) - 1, 365));
      setCustomSource();
    }, { noLeading: false }));

    mousetrap.bind('right', throttle(THROTTLE_TIME, () => {
      setDayOffset(prev => modIndex(Number(prev) + 1, 365));
      setCustomSource();
    }, { noLeading: false }));

    document.addEventListener('swipe', throttle(THROTTLE_TIME, event => {
      if (!isTouchEvent(event)) return;

      if (event.detail.directions.right) {
        setDayOffset(prev => modIndex(Number(prev) + 1, 365));
        setCustomSource();
      } else if (event.detail.directions.left) {
        setDayOffset(prev => modIndex(Number(prev) - 1, 365));
        setCustomSource();
      }
    }));

    // mouseLeaveTimeout = setTimeout(() => {
    //   setShow(false);
    // }, DEVTOOLS_MOUSE_LEAVE_TIMEOUT);

    return () => {
      clearTimeout(mouseLeaveTimeout);
      mousetrap.unbind('left');
      mousetrap.unbind('right');
      swipeListener.off();
    };
  }, [showDevTools]);

  /**
   * [Callback] Immediately select the contents of the image source field when
   * the element is focused.
   */
  const handleSourceFocus: React.FocusEventHandler<HTMLInputElement> = React.useCallback(e => {
    e.currentTarget.select();
  }, []);

  /**
   * [Effect] Parses custom image source values and updates the current photo.
   */
  useAsyncEffect(async isMounted => {
    if (!customSource) {
      resetPhoto();
      return;
    }

    // This will remove any query parameters, update the input field, and cause
    // the effect to run again.
    if (customSource.includes('?')) {
      const sourceWithoutQuery = customSource.slice(0, customSource.lastIndexOf('?'));
      setCustomSource(sourceWithoutQuery);
      return;
    }

    const mockPhotoResource = await mockPhotoResourceFromUrl(customSource);
    if (!mockPhotoResource || !isMounted()) return;

    setCurrentPhoto(mockPhotoResource);
  }, [customSource]);


  /**
   * [Callback] Explicitly sets the day offset when we get a progress update
   * from the progress bar.
   */
  const handleProgressChange = React.useCallback((newProgress: number) => {
    setDayOffset(Math.floor(365 * newProgress));
  }, [setDayOffset]);

  if (!showDevTools) return null;

  const progress = dayOffset / 365;

  return (
    <>
      <Helmet>
        <title>{TITLE} {import.meta.env.GIT_DESC}</title>
      </Helmet>
      <div
        data-testid="DevTools"
        className={cx(classes.devToolsContainer, 'safe-padding')}
        style={{ opacity: show ? 1 : 0 }}
      >
        {/* Progress Bar (Fixed Position) */}
        <ProgressBar
          progress={progress}
          onProgressChange={handleProgressChange}
          style={{
            height: PROGRESS_BAR_HEIGHT,
            boxShadow: '0px 2px 1px rgba(0, 0, 0, 0.16)'
          }}
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
                onChange={e => setCustomSource(e.target.value)}
                value={customSource ?? ''}
                onFocus={handleSourceFocus}
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
            <div
              className={classes.date}
              style={{
                color: lighten(0.24, desaturate(0, rgba(currentPhoto?.palette?.muted ?? 'white'))),
                backgroundColor: desaturate(0, rgba(currentPhoto?.palette?.darkMuted ?? 'black', 0.8)),
                borderColor: darken(0.12, rgba(currentPhoto?.palette?.darkMuted ?? 'gray', 0.72))
              }}
            >
              {isLoadingPhotos ? (
                <BsArrowRepeat
                  className={animations.spin}
                  style={{
                    width: '1em',
                    height: '1em',
                    opacity: 0.72
                  }}
                />
              ) : (
                <BsCircle
                  style={{
                    width: '0.72em',
                    height: '0.72em',
                    strokeWidth: '0.42px',
                    marginLeft: '2px',
                    opacity: 0.72
                  }}
                />
              )}
              {format(addDays(new Date(), dayOffset), 'MMM dd')}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
