import ms from 'ms';
import React from 'react';

import BackgroundImage from 'web/components/BackgroundImage';
import Greeting from 'web/components/Greeting';
import SplashLower from 'web/components/SplashLower';
import InspiratContext from 'web/contexts/Inspirat';
import { BACKGROUND_TRANSITION_DURATION } from 'web/etc/constants';

import classes from './Splash.css';

import type { InspiratPhotoResource } from 'etc/types';

export interface SplashProps {
  onMouseDown?: React.EventHandler<React.MouseEvent | React.TouchEvent>;
}

/**
 * TODO: Deprecate usage of maskColor and maskAmount overrides. Use photo
 * palette with a box-shadow around text instead.
 */
export function Splash({ onMouseDown }: SplashProps) {
  const { currentPhoto } = React.useContext(InspiratContext);

  const [aPhoto, setAPhoto] = React.useState<InspiratPhotoResource | void>();
  const [bPhoto, setBPhoto] = React.useState<InspiratPhotoResource | void>();
  const [transitionDuration, setTransitionDuration] = React.useState(BACKGROUND_TRANSITION_DURATION);
  const [turnCount, setTurnCount] = React.useState(0);

  const activeElement = turnCount % 2 === 0 ? 'A' : 'B';

  React.useEffect(() => {
    setTurnCount(prev => prev + 1);
  }, [currentPhoto?.id]);


  /**
   * [Effect] Handles changes to photo URLs.
   */
  React.useEffect(() => {
    if (!currentPhoto) return;

    const activeElement = turnCount % 2 === 0 ? 'A' : 'B';

    if (activeElement === 'A') {
      setAPhoto(currentPhoto);
    } else {
      setBPhoto(currentPhoto);
    }

    // TODO: Remove?
    // To ensure the first photo always appears immediately, but that subsequent
    // transitions run at the configured transition speed, we set the initial
    // transition duration to '0s' (see above). We then do a check here to see
    // if this is the first image being shown, and if so, run a timer that
    // expires after the _target_ transition time, then updates the component's
    // transition time to the target time.
    if (!aPhoto && !bPhoto) {
      setTimeout(() => {
        setTransitionDuration(BACKGROUND_TRANSITION_DURATION);
      }, ms(BACKGROUND_TRANSITION_DURATION));
    }

    // This timer clears the photo on the inactive backdrop once the transition
    // animation has completed. We always want it to run using the current
    // transition duration, and it is acceptable to allow the effect's cleanup
    // function to cancel it.
    const timeoutHandle = setTimeout(() => {
      if (activeElement === 'A') {
        setBPhoto();
      } else {
        setAPhoto();
      }
    }, ms(transitionDuration));

    return () => {
      clearTimeout(timeoutHandle);
    };
  }, [activeElement]);


  return (
    <div
      role="button"
      tabIndex={0}
      className={classes.splash}
      onMouseDown={onMouseDown}
      onTouchStart={onMouseDown}
      style={{
        border: '1px solid red'
      }}
    >
      <BackgroundImage
        id="A"
        photo={aPhoto}
        isActive={activeElement === 'A'}
      >
        <SplashLower photo={aPhoto} />
      </BackgroundImage>
      <BackgroundImage
        id="B"
        photo={bPhoto}
        isActive={activeElement === 'B'}
      >
        <SplashLower photo={bPhoto} />
      </BackgroundImage>
      <Greeting />
    </div>
  );
}
