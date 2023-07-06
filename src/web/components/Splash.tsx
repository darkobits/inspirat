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
  const [transitionDuration, setTransitionDuration] = React.useState('0s');
  const { currentPhoto, currentPhotoUrls } = useInspirat();
  const [activeElement, toggleActiveElement] = React.useReducer((prev: string) => (prev === 'A' ? 'B' : 'A'), 'A');


  /**
   * [Effect] When the current photo changes, updates the background-image URL
   * of the inactive BackgroundImage component, toggles the active component,
   * then clears the URL of the new inactive component after the transition
   * duration has elapsed.
   *
   * N.B. This effect must not use activeElement in its dependency array or an
   * infinite loop will occur because this effect triggers an update to
   * activeElement.
   */
  React.useEffect(() => {
    if (!currentPhoto) return;

    const newPhotoOverrides = currentPhoto ? BACKGROUND_RULE_OVERRIDES[currentPhoto.id] : {};

    if (newPhotoOverrides) {
      if (activeElement === 'A') {
        setAPhotoOverrides(newPhotoOverrides);
      } else {
        setBPhotoOverrides(newPhotoOverrides);
      }
    }

    // Toggle active elements to trigger CSS opacity transition.
    toggleActiveElement();
  }, [currentPhoto]);


  /**
   * [Effect] Handles changes to photo URLs.
   */
  React.useEffect(() => {
    if (!currentPhotoUrls) return;

    if (activeElement === 'A') {
      setAPhotoUrls(currentPhotoUrls);
    } else {
      setBPhotoUrls(currentPhotoUrls);
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
      } else {
        setAPhotoUrls();
      }
    }, ms(transitionDuration));

    return () => {
      clearTimeout(timeoutHandle);
    };
  }, [
    aPhotoUrls,
    activeElement,
    bPhotoUrls,
    currentPhotoUrls,
    transitionDuration
  ]);


  return (
    <div
      className={classes.splash}
      onMouseDown={onMouseDown}
    >
      <BackgroundImage
        id="A"
        photoUrls={aPhotoUrls}
        opacity={activeElement === 'A' ? 1 : 0}
        transitionDuration={transitionDuration}
        transitionTimingFunction={BACKGROUND_TRANSITION_FUNCTION}
        {...aPhotoOverrides}
      />
      <BackgroundImage
        id="B"
        photoUrls={bPhotoUrls}
        opacity={activeElement === 'B' ? 1 : 0}
        transitionDuration={transitionDuration}
        transitionTimingFunction={BACKGROUND_TRANSITION_FUNCTION}
        {...bPhotoOverrides}
      />
      <Greeting />
      <SplashLower />
    </div>
  );
};
