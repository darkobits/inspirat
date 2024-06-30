import cx from 'classnames';
import {
  addDays,
  differenceInDays,
  format,
  isBefore,
  addYears,
  differenceInYears,
  startOfToday,
  setYear,
  getYear
} from 'date-fns';
import mousetrap from 'mousetrap';
import ms from 'ms';
import { desaturate, lighten, darken } from 'polished';
import React from 'react';
import { Helmet } from 'react-helmet';
import { BsArrowRepeat, BsCircle, BsArrowRight, BsArrowLeft } from 'react-icons/bs';
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
import { getPhotoFromCollection } from 'web/lib/photos';
import { isUrl, mockPhotoResourceFromUrl, isTouchEvent, rgba } from 'web/lib/utils';

import classes, { PROGRESS_BAR_HEIGHT } from './DevTools.css';

/**
 * @private
 *
 * Tracks the amount of time elapsed since the mouse last left our container
 * element.
 */
let mouseLeaveTimeout: NodeJS.Timeout;

/**
 * How long to throttle (ignore) keyboard or swipe events that change the date.
 * Set to the transition time plus a small buffer.
 */
const THROTTLE_TIME = ms(BACKGROUND_TRANSITION_DURATION) + ms('250ms');

export function DevTools() {
  const {
    showDevTools,
    currentDate,
    setCurrentDate,
    currentPhoto,
    setCurrentPhoto,
    resetPhoto,
    isLoadingPhotos
  } = React.useContext(InspiratContext);
  const [show, setShow] = React.useState(true);
  const [customSource, setCustomSource] = React.useState<string | void>('');
  const [hoverDate, setHoverDate] = React.useState('');

  /**
   * [Callback] Moves the date backwards by 1 day. If the new date would be
   * before the current date, 1 year is added to it.
   */
  const retardDate = React.useCallback(() => {
    setCurrentDate(currentDate => {
      const newDate = addDays(currentDate, -1);
      return isBefore(newDate, startOfToday())
        ? addYears(startOfToday(), 1)
        : newDate;
    });
  }, []);

  /**
   * [Callback] Moves the date forward by 1 day. If the new date would be more
   * than 1 year after the current date, 1 year is subtracted from it.
   */
  const advanceDate = React.useCallback(() => {
    setCurrentDate(currentDate => {
      const newDate = addDays(currentDate, 1);
      return differenceInYears(addDays(newDate, + 1), startOfToday())
        ? setYear(newDate, getYear(new Date()))
        : newDate;
    });
  }, []);

  /**
   * [Callback] Immediately select the contents of the image source field when
   * the element is focused.
   */
  const handleSourceFocus: React.FocusEventHandler<HTMLInputElement> = React.useCallback(e => {
    e.currentTarget.select();
  }, []);

  /**
   * [Callback] Explicitly sets the day offset when we get a progress update
   * from the progress bar.
   */
  const handleProgressChange = React.useCallback((newProgress: number) => {
    setCurrentDate(() => addDays(startOfToday(), Math.round(newProgress * 365)));
  }, []);


  /**
   * [Callback] Explicitly sets the day offset when we get a progress update
   * from the progress bar.
   */
  const handleProgressHover = React.useCallback((newProgress: number) => {
    setHoverDate(format(addDays(startOfToday(), Math.round(newProgress * 365)), 'MMMM dd'));
  }, []);

  /*
   * [Effect] Initialize DevTools mouse/key/gesture bindings.
   */
  React.useEffect(() => {
    if (!showDevTools) return;

    const swipeListener = SwipeListener(document);

    mousetrap.bind('left', throttle(THROTTLE_TIME, () => {
      retardDate();
      setCustomSource();
    }, { noLeading: false }));


    mousetrap.bind('right', throttle(THROTTLE_TIME, () => {
      advanceDate();
      setCustomSource();
    }, { noLeading: false }));

    document.addEventListener('swipe', throttle(THROTTLE_TIME, event => {
      if (!isTouchEvent(event)) return;

      if (event.detail.directions.right) {
        advanceDate();
        setCustomSource();
      } else if (event.detail.directions.left) {
        retardDate();
        setCustomSource();
      }
    }));

    mouseLeaveTimeout = setTimeout(() => {
      setShow(false);
    }, DEVTOOLS_MOUSE_LEAVE_TIMEOUT);

    return () => {
      clearTimeout(mouseLeaveTimeout);
      mousetrap.unbind('left');
      mousetrap.unbind('right');
      swipeListener.off();
    };
  }, [showDevTools]);

  /**
   * [Effect] Parses custom image source values and updates the current photo.
   */
  useAsyncEffect(async isMounted => {
    if (!customSource) {
      resetPhoto();
      return;
    }

    if (isUrl(customSource)) {
      // This will remove any query parameters, update the input field, and cause
      // the effect to run again. The resulting effect is that of a "clean paste"
      // into the DevTools URL bar.
      if (customSource.includes('?')) {
        const sourceWithoutQuery = customSource.slice(0, customSource.lastIndexOf('?'));
        setCustomSource(sourceWithoutQuery);
        return;
      }

      const mockPhotoResource = await mockPhotoResourceFromUrl(customSource);
      if (!mockPhotoResource || !isMounted()) return;
      setCurrentPhoto(mockPhotoResource);
    } else {
      // Assume the value entered is a photo ID and try to load it explicitly.
      const photoResource = await getPhotoFromCollection(customSource);
      if (!photoResource || !isMounted()) return;
      setCurrentPhoto(photoResource);
    }
  }, [customSource]);


  if (!showDevTools) return null;

  // The current state of the progress bar should represent the distance between
  // todays date and 1 year in the future.
  const progress = Math.abs(differenceInDays(currentDate, startOfToday())) / 365;

  return (
    <>
      <Helmet>
        <title>{TITLE} {import.meta.env.GIT_DESC}</title>
      </Helmet>
      <div
        data-testid="DevTools"
        className={cx(classes.devToolsContainer, 'safe-padding')}
        // style={{ opacity: show ? 1 : 0 }}
      >
        {/* Progress Bar (Fixed Position) */}
        <ProgressBar
          progress={progress}
          onProgressChange={handleProgressChange}
          onProgressHover={handleProgressHover}
          style={{
            height: PROGRESS_BAR_HEIGHT,
            boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.12)'
          }}
        >
          <span style={{ whiteSpace: 'nowrap' }}>{hoverDate}</span>
        </ProgressBar>

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
            <div
              className={classes.arrowIndicator}
              style={{ color: lighten(0.24, desaturate(0, rgba(currentPhoto?.palette?.muted ?? 'white'))) }}
            >
              <BsArrowLeft style={{ filter: 'drop-shadow(0px 0px 2px rgba(0, 0, 0, 0.8))' }} />
            </div>

            <Source
              className={cx(
                'animate__animated',
                show || customSource ? 'animate__fadeInDown' : 'animate__fadeOutUp'
              )}
              photo={currentPhoto}
              style={{ animationDuration: show || customSource ? '420ms' : '2400ms' }}
            >
              <input
                type="text"
                onChange={e => setCustomSource(e.target.value)}
                value={customSource ?? ''}
                onFocus={handleSourceFocus}
                placeholder="https://unsplash.com/photos/:id"
                spellCheck={false}
                autoCorrect="false"
                autoComplete="false"
                disabled={!show}
                style={{
                  fontFamily: 'monospace',
                  fontSize: '0.8rem',
                  height: '100%',
                  transitionProperty: 'color, background-color, border-color, opacity',
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

            {/* Date & Loading Indicator */}
            <div
              className={classes.date}
              style={{
                color: lighten(0.24, desaturate(0, rgba(currentPhoto?.palette?.muted ?? 'white'))),
                backgroundColor: desaturate(0, rgba(currentPhoto?.palette?.darkMuted ?? 'black', 0.8)),
                borderColor: darken(0.12, rgba(currentPhoto?.palette?.darkMuted ?? 'gray', 0.72))
              }}
            >
              <BsArrowRepeat
                className={animations.spin}
                style={{
                  position: 'absolute',
                  top: '0.66em',
                  left: '0.5em',
                  width: '1.2em',
                  height: '1.2em',
                  opacity: isLoadingPhotos ? 1 : 0,
                  // opacity: 1,
                  transition: 'opacity 640ms ease-in'
                }}
              />

              <BsCircle
                style={{
                  position: 'absolute',
                  top: '0.76em',
                  left: '0.46em',
                  width: '0.94em',
                  height: '0.94em',
                  strokeWidth: '0.42px',
                  marginLeft: '2px',
                  marginBottom: '0.5px',
                  opacity: isLoadingPhotos ? 0 : 1,
                  // opacity: 1,
                  // color: 'red',
                  transition: 'opacity 640ms ease-in'
                }}
              />

              <span
                style={{ minWidth: '3em', textAlign: 'right' }}
              >
                {format(currentDate, 'MMM dd')}
              </span>
            </div>

            <div
              className={classes.arrowIndicator}
              style={{ color: lighten(0.24, desaturate(0, rgba(currentPhoto?.palette?.muted ?? 'white'))) }}
            >
              <BsArrowRight style={{ filter: 'drop-shadow(0px 0px 2px rgba(0, 0, 0, 0.8))' }} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
//
