import { styled } from '@linaria/react';
import React from 'react';
import { Color, InspiratPhotoResource } from 'common/types';

import { WHITE, BLACK } from 'etc/constants';
import { ElementProps } from 'etc/types';
import { rgba } from 'lib/utils';


// ----- Progress Indicator ----------------------------------------------------


/**
 * Progress bar that resides at the top of the screen and reflects the current
 * position in the photo collection.
 */
const StyledProgress = styled.div<{ fgColor: Color; bgColor: Color; progress: number }>`
  background-color: ${({ bgColor }) => rgba(bgColor)};
  border-left-color: ${({ fgColor }) => rgba(fgColor)};
  border-left-style: solid;
  border-left-width: ${({ progress }) => (progress || 0) * 100}vw;
  height: 4px;
  left: 0;
  position: absolute;
  right: 0;
  top: 0;
  transition: border-left-width 0.2s ease-in, height 0.2s linear;

  &:hover {
    cursor: pointer;
    height: 10px;
  }
`;


interface Props extends ElementProps {
  photo: InspiratPhotoResource | undefined;
  progress: number;
  onProgressChange?: (progress: number) => void;
}


/**
 * TODO: Implement dynamically-positioned tooltip that reads 152/255 where the
 * numerator is the photo the user would navigate to if they clicked on the
 * progress bar and the denominator is the total number of photos in the
 * collection.
 */
export const Progress = ({ photo, progress, onProgressChange, children }: Props) => {
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
    <StyledProgress
      fgColor={fgColor}
      bgColor={bgColor}
      progress={progress}
      onClick={handleClick}
      ref={target}
    >
      {children}
    </StyledProgress>
  );
};
