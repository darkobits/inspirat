import { styled } from '@linaria/react';

import { BackgroundImageOverrides } from 'etc/types';


// ----- Props -----------------------------------------------------------------

/**
 * Props for the BackgroundImage component.
 */
interface BackgroundImageProps extends BackgroundImageOverrides {
  backgroundImage: string | undefined;
}


// ----- Background Image ------------------------------------------------------

/**
 * Set to a truthy value to debug the blur backdrop element.
 */
const DEBUG_BLUR = 0;


/**
 * Renders a full-screen background image
 */
const BackgroundImage = styled.div<BackgroundImageProps>`
  /**
    * We can't use an outer url() here due to an idiosyncrasy in how Linaria
    * handles quotes in url() expressions.
    *
    * See: https://github.com/callstack/linaria/issues/368
    */
  background-image: ${props => (props.backgroundImage ? `url(${props.backgroundImage})` : 'none')};
  background-position: ${props => props.backgroundPosition ?? 'center center'};
  background-attachment: fixed;
  background-repeat: no-repeat;
  background-size: cover;

  /**
   * If we don't have a background-image prop, use a default opacity of 0.
   * Otherwise, if we have an explicit opacity prop, use it. Otherwise, use an
   * opacity of 1.
   */
  opacity: ${props => (props.backgroundImage ? props.opacity ?? 1 : 0)};
  transition-duration: ${props => props.transitionDuration ?? 'initial'};
  transition-timing-function: ${props => props.transitionTimingFunction ?? 'initial'};
  transition-property: opacity;

  bottom: 0;
  display: block;
  left: 0;
  pointer-events: none;
  position: fixed;
  right: 0;
  top: 0;
  transform: ${props => props.transform ?? 'initial'};
  z-index: 0;

  &::after {
    content: ' ';
    width: 100%;
    height: 48em;
    position: absolute;
    top: calc(50vh - 24em - 64px);
    left: 0;
    right: 0;
    bottom: 0;
    /* background-color: ${!DEBUG_BLUR ? 'none' : 'rgba(255, 0, 0, 1)'}; */
    background-color: ${props => (DEBUG_BLUR ? 'rgba(255, 0, 0, 1)' : `rgba(0, 0, 0, ${props.backdrop?.backgroundOpacity ?? 0.2})`)};
    backdrop-filter: ${props => (DEBUG_BLUR ? 'none' : `blur(${props.backdrop?.blurRadius ?? '0px'})`)};
    mask-image: radial-gradient(ellipse at center, black 20%, transparent 70%);
    mask-size: contain;
    mask-repeat: no-repeat;
  }
`;


export default BackgroundImage;
