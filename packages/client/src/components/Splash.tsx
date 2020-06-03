import {styled} from 'linaria/react';
import {mix, rgba} from 'polished';
import React from 'react';

import PhotoContext from 'contexts/photo';
import DevTools from 'components/DevTools';
import SplashMid from 'components/SplashMid';
import SplashLower from 'components/SplashLower';
import {BACKGROUND_RULE_OVERRIDES} from 'etc/constants';
import {getFullImageUrl} from 'lib/photos';


// ----- Styles ----------------------------------------------------------------

export interface SplashElProps {
  backgroundImage: string;
  maskColor: string;
  backgroundPosition?: string;
  maskAmount?: string;
  opacity: string | number;
  transform?: string;
}

const SplashEl = styled.div<SplashElProps>`
  align-items: center;
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: center;
  padding: 14px 18px;
  opacity: ${props => props.opacity || 1};
  width: 100%;
  transition: opacity 0.4s ease-in;

  /**
   * This pseudo-element is where we will render the background image. We use
   * absolute positioning to create a full-screen canvas for the image.
   */
  &::before {
    background-attachment: fixed;
    /**
     * We can't use an outer url() here due to an idiosyncrasy in how Linaria
     * handles quotes in url() expressions.
     *
     * See: https://github.com/callstack/linaria/issues/368
     */
    background-image: ${props => props.backgroundImage && `url(${props.backgroundImage})`};
    background-position: ${props => props.backgroundPosition ?? 'center center'};
    background-repeat: no-repeat;
    background-size: cover;
    bottom: 0;
    content: ' ';
    display: block;
    left: 0;
    position: absolute;
    right: 0;
    top: 0;
    transform: ${props => props.transform ?? 'initial'};
    z-index: 0;
  }

  /**
   * This pseudo-element is where we will render an overlay that will sit on top
   * of the background image. The settings for this overlay vary from image to
   * image, and are defined in etc/constants.ts.
   */
  &::after {
    background-color: ${props => rgba(mix(0.5, props.maskColor, 'black'), Number(props.maskAmount ?? 0.2))};
    bottom: 0;
    content: ' ';
    display: block;
    left: 0;
    mix-blend-mode: darken;
    position: absolute;
    right: 0;
    top: 0;
    transform: ${props => props.transform ?? 'initial'};
    z-index: 0;
  }
`;


// ----- Component -------------------------------------------------------------

const Splash: React.FunctionComponent = () => {
  const {currentPhoto} = React.useContext(PhotoContext);
  const currentPhotoUrl = currentPhoto ? getFullImageUrl(currentPhoto.urls.full) : '';
  const color = currentPhoto?.color ?? 'black';
  const opacity = currentPhoto ? 1 : 0;
  const overrides = currentPhoto ? BACKGROUND_RULE_OVERRIDES[currentPhoto.id] : {};

  return (
    <SplashEl
      backgroundImage={currentPhotoUrl}
      maskColor={color}
      opacity={opacity}
      {...overrides}
    >
      <DevTools />
      <SplashMid />
      <SplashLower />
    </SplashEl>
  );
};


export default Splash;
