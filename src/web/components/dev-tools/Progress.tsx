/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { assignInlineVars } from '@vanilla-extract/dynamic';
import React from 'react';

import InspiratContext from 'web/contexts/Inspirat';
import { WHITE, BLACK } from 'web/etc/constants';
import { rgba } from 'web/lib/utils';

import classes, { vars } from './Progress.css';

import type { ElementProps } from 'web/etc/types';

export interface ProgressBarProps extends ElementProps<HTMLProgressElement> {
  /**
   * Should be a number between 0 and 1 indicating how full the progress bar
   * should be.
  */
  progress: number;
  /**
   * Callback fired when the user clicks the progress bar. Reports the user's
   * X coordinate within the element from 0 to 1.
   */
  onProgressChange?: (progress: number) => void;
}


/**
 * Progress bar that resides at the top of the screen and reflects the current
 * position in the photo collection.
 *
 * TODO: Implement dynamically-positioned tooltip that reads 152/255 where the
 * numerator is the photo the user would navigate to if they clicked on the
 * progress bar and the denominator is the total number of photos in the
 * collection.
 */
export function ProgressBar(props: ProgressBarProps) {
  const { progress, onProgressChange, children, style, ...restProps } = props;
  const { currentPhoto } = React.useContext(InspiratContext);
  const target = React.useRef(null);

  const fgColor = currentPhoto?.palette?.muted ?? WHITE;
  const bgColor = currentPhoto?.palette?.darkMuted ?? BLACK;

  /**
   * [Callback] Invoke user-provided progress callback when the progress bar is
   * clicked.
   */
  const handleClick: React.EventHandler<React.MouseEvent<HTMLProgressElement>> = React.useCallback(e => {
    const { left, right } = e.currentTarget.getBoundingClientRect();
    const { clientX } = e;
    const userProgress = (clientX - left) / (right - left);

    if (onProgressChange) {
      onProgressChange(userProgress);
    }
  }, [onProgressChange]);


  return (
    <progress
      className={classes.progress}
      style={{
        // width: '100%',
        flexGrow: 1,
        ...assignInlineVars({
          [vars.progressBarBackgroundColor]: rgba(bgColor),
          [vars.progressBarForegroundColor]: rgba(fgColor)
        }),
        ...style
      }}
      value={progress || 0}
      max={1}
      onClick={handleClick}
      ref={target}
      {...restProps}
    >
      {children}
    </progress>
  );
}
