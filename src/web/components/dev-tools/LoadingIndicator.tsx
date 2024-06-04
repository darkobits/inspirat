import { BsArrowRepeat, BsCheck } from 'react-icons/bs';

import { InspiratPhotoResource } from 'etc/types';
import { BASIS, BLACK, WHITE } from 'web/etc/constants';
import { rgba } from 'web/lib/utils';


import classes from './LoadingIndicator.css';


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
      style={{
        height: BASIS,
        width: BASIS,
        backgroundColor: rgba(bgColor ?? BLACK),
        color: rgba(fgColor ?? WHITE)
      }}
    >
      {isLoading ? <BsArrowRepeat className={classes.spin} /> : <BsCheck />}
    </div>
  );
};
