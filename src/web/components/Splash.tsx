/* eslint-disable react/jsx-props-no-spreading */
import ms from 'ms';
import React from 'react';

import BackgroundImage from 'web/components/BackgroundImage';
import Greeting from 'web/components/Greeting';
import SplashLower from 'web/components/SplashLower';
import {
  BACKGROUND_RULE_OVERRIDES,
  BACKGROUND_TRANSITION_DURATION,
  BACKGROUND_TRANSITION_FUNCTION
} from 'web/etc/constants';
import { BackgroundImageOverrides, PhotoUrls } from 'web/etc/types';
import { useInspirat } from 'web/hooks/use-inspirat';

import classes from './Splash.css';


// ----- Splash ----------------------------------------------------------------

export interface SplashProps {
  onMouseDown?: React.EventHandler<React.MouseEvent>;
}


/**
 * TODO: Deprecate usage of maskColor and maskAmount overrides. Use photo
 * palette with a box-shadow around text instead.
 */
export const Splash = ({ onMouseDown }: SplashProps) => {
  const [aPhotoUrls, setAPhotoUrls] = React.useState<PhotoUrls | void>();
  const [bPhotoUrls, setBPhotoUrls] = React.useState<PhotoUrls | void>();
  const [aPhotoOverrides, setAPhotoOverrides] = React.useState<BackgroundImageOverrides>({});
  const [bPhotoOverrides, setBPhotoOverrides] = React.useState<BackgroundImageOverrides>({});
  const [transitionDuration, setTransitionDuration] = React.useState(BACKGROUND_TRANSITION_DURATION);
  const { currentPhoto, currentPhotoUrls } = useInspirat();
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
    if (!currentPhotoUrls) return;

    const activeElement = turnCount % 2 === 0 ? 'A' : 'B';
    const newPhotoOverrides = currentPhoto ? BACKGROUND_RULE_OVERRIDES[currentPhoto.id] : {};

    if (activeElement === 'A') {
      setAPhotoUrls(currentPhotoUrls);
      setAPhotoOverrides(newPhotoOverrides);
    } else {
      setBPhotoUrls(currentPhotoUrls);
      setBPhotoOverrides(newPhotoOverrides);
    }

    // To ensure the first photo always appears immediately, but that subsequent
    // transitions run at the configured transition speed, we set the initial
    // transition duration to '0s' (see above). We then do a check here to see
    // if this is the first image being shown, and if so, run a timer that
    // expires after the _target_ transition time, then updates the component's
    // transition time to the target time.
    if (!aPhotoUrls && !bPhotoUrls) {
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
        setBPhotoUrls();
        setBPhotoOverrides({});
      } else {
        setAPhotoUrls();
        setAPhotoOverrides({});
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
    >
      <BackgroundImage
        id="A"
        photoUrls={aPhotoUrls}
        overrides={aPhotoOverrides}
        style={{
          opacity: activeElement === 'A' ? 1 : 0,
          transitionProperty: 'opacity',
          transitionDuration,
          transitionTimingFunction: BACKGROUND_TRANSITION_FUNCTION
        }}
      />
      <BackgroundImage
        id="B"
        photoUrls={bPhotoUrls}
        overrides={bPhotoOverrides}
        style={{
          opacity: activeElement === 'B' ? 1 : 0,
          transitionProperty: 'opacity',
          transitionDuration,
          transitionTimingFunction: BACKGROUND_TRANSITION_FUNCTION
        }}
      />
      <Greeting />
      <SplashLower />
    </div>
  );
};
