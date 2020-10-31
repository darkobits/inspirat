import { styled } from 'linaria/react';
import ms from 'ms';
import React from 'react';

import BackgroundImage from 'components/BackgroundImage';
import InspiratContext from 'contexts/Inspirat';
import Greeting from 'components/Greeting';
import SplashLower from 'components/SplashLower';
import {
  BACKGROUND_RULE_OVERRIDES,
  BACKGROUND_TRANSITION_DURATION,
  BACKGROUND_TRANSITION_FUNCTION
} from 'etc/constants';
import { BackgroundImageOverrides } from 'etc/types';
import { updateImgixQueryParams } from 'lib/utils';


// ----- Props -----------------------------------------------------------------

export interface SplashProps {
  onMouseDown?: React.EventHandler<React.MouseEvent>;
}


// ----- Styles ----------------------------------------------------------------

const SplashEl = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: center;
  padding: 14px 18px;
  width: 100%;
  transition: opacity 0.4s ease-in;
`;


// ----- Splash ----------------------------------------------------------------

/**
 * TODO: Deprecate usage of maskColor and maskAmount overrides. Use photo
 * palette with a box-shadow around text instead.
 */
const Splash: React.FunctionComponent<SplashProps> = ({ onMouseDown }) => {
  const [aPhotoUrl, setAPhotoUrl] = React.useState<string>('');
  const [bPhotoUrl, setBPhotoUrl] = React.useState<string>('');
  const [aPhotoOverrides, setAPhotoOverrides] = React.useState<BackgroundImageOverrides>({});
  const [bPhotoOverrides, setBPhotoOverrides] = React.useState<BackgroundImageOverrides>({});
  const [transitionDuration, setTransitionDuration] = React.useState('0s');
  const { currentPhoto } = React.useContext(InspiratContext);
  const [activeElement, toggleActiveElement] = React.useReducer((prev: string) => (prev === 'A' ? 'B' : 'A'), 'A');

  // This is used to delay showing the greeting until the photo has loaded.
  // const opacity = currentPhoto ? 1 : 0;


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
    if (!currentPhoto) {
      return;
    }

    const newPhotoUrl = currentPhoto ? updateImgixQueryParams(currentPhoto.urls.full) : '';
    const newPhotoOverrides = currentPhoto ? BACKGROUND_RULE_OVERRIDES[currentPhoto.id] : {};

    if (activeElement === 'A') {
      setBPhotoUrl(newPhotoUrl);
      setBPhotoOverrides(newPhotoOverrides);
    } else {
      setAPhotoUrl(newPhotoUrl);
      setAPhotoOverrides(newPhotoOverrides);
    }

    // Toggle active elements to trigger CSS opacity transition.
    toggleActiveElement();

    const timeoutHandle = setTimeout(() => {
      if (activeElement === 'A') {
        setAPhotoUrl('');
      } else {
        setBPhotoUrl('');
      }

      setTransitionDuration(BACKGROUND_TRANSITION_DURATION);
    }, ms(transitionDuration));

    return () => {
      clearTimeout(timeoutHandle);
    };
  }, [currentPhoto]);


  return (
    <SplashEl onMouseDown={onMouseDown}>
      <BackgroundImage
        id="A"
        backgroundImage={aPhotoUrl}
        opacity={activeElement === 'A' ? 1 : 0}
        transitionDuration={transitionDuration}
        transitionTimingFunction={BACKGROUND_TRANSITION_FUNCTION}
        {...aPhotoOverrides}
      />
      <BackgroundImage
        id="B"
        backgroundImage={bPhotoUrl}
        opacity={activeElement === 'B' ? 1 : 0}
        transitionDuration={transitionDuration}
        transitionTimingFunction={BACKGROUND_TRANSITION_FUNCTION}
        {...bPhotoOverrides}
      />
      <Greeting />
      <SplashLower />
    </SplashEl>
  );
};


export default Splash;
