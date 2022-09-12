import { InspiratPhotoResource } from 'inspirat-common/types';
import React from 'react';

import { WHITE, BLACK } from 'etc/constants';
import { ElementProps } from 'etc/types';
import { rgba } from 'lib/utils';

import classes from './Progress.css';


// ----- Progress Indicator ----------------------------------------------------

export interface ProgressProps extends ElementProps<HTMLDivElement> {
  photo: InspiratPhotoResource | undefined;
  progress: number;
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
export const Progress = ({ photo, progress, onProgressChange, children }: ProgressProps) => {
  const fgColor = photo?.palette?.muted ?? WHITE;
  const bgColor = photo?.palette?.darkMuted ?? BLACK;
  const target = React.useRef(null);

  /**
   * [Callback] Invoke user-provided progress callback when the progress bar is
   * clicked.
   */
  const handleClick: React.EventHandler<React.MouseEvent<HTMLDivElement>> = React.useCallback(e => {
    const { left, right } = e.currentTarget.getBoundingClientRect();
    const { clientX } = e;
    const userProgress = (clientX - left) / (right - left);

    if (onProgressChange) {
      onProgressChange(userProgress);
    }
  }, [onProgressChange]);


  return (
    <div
      role="button"
      className={classes.progress}
      style={{
        backgroundColor: rgba(bgColor),
        borderLeftColor: rgba(fgColor),
        borderLeftWidth: `${(progress || 0) * 100}vw`
      }}
      onClick={handleClick}
      ref={target}
    >
      {children}
    </div>
  );
};
