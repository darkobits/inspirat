import { assignInlineVars } from '@vanilla-extract/dynamic';
import { InspiratPhotoResource } from 'etc/types';
import { BsArrowRepeat, BsCheck } from 'react-icons/bs';

import { BASIS, BLACK, WHITE } from 'web/etc/constants';
import { rgba } from 'web/lib/utils';


import classes, { vars } from './LoadingIndicator.css';


export interface LoadingIndicatorProps {
  photo: InspiratPhotoResource | undefined;
  isLoading: boolean;
}


export const LoadingIndicator = ({ photo, isLoading }: LoadingIndicatorProps) => {
  const fgColor = photo?.palette?.lightVibrant ?? WHITE;
  const bgColor = photo?.palette?.darkMuted ?? BLACK;

  return (
    <div
      className={classes.loadingIndicator}
      style={assignInlineVars({
        [vars.loadingIndicator.height]: BASIS,
        [vars.loadingIndicator.width]: BASIS,
        [vars.loadingIndicator.backgroundColor]: rgba(bgColor ?? BLACK),
        [vars.loadingIndicator.svg.color]: rgba(fgColor ?? WHITE)
      })}
    >
      {isLoading ? <BsArrowRepeat className={classes.spin} /> : <BsCheck />}
    </div>
  );
};
