import { styled } from '@linaria/react';
import React from 'react';
import useAsyncEffect from 'use-async-effect';

import { BackgroundImageOverrides, ElementProps, PhotoUrls } from 'etc/types';


// ----- Props -----------------------------------------------------------------

/**
 * Props for the BackgroundImage component.
 */
interface BackgroundImageWrapperProps extends BackgroundImageOverrides {
  backgroundImage?: string | void | undefined;
}


// ----- Background Image ------------------------------------------------------

/**
 * Set to a truthy value to debug the blur backdrop element.
 */
const DEBUG_BLUR = 0;


/**
 * Renders a full-screen background image
 */
const BackgroundImageWrapper = styled.div<BackgroundImageWrapperProps>`
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
    backdrop-filter: ${props => (DEBUG_BLUR ? 'none' : `blur(${props.backdrop?.blurRadius ?? '0px'})`)};
    background-color: ${props => (DEBUG_BLUR ? 'rgba(255, 0, 0, 1)' : `rgba(0, 0, 0, ${props.backdrop?.backgroundOpacity ?? 0.2})`)};
    bottom: 0;
    height: 48em;
    left: 0;
    mask-image: radial-gradient(ellipse at center, black 20%, transparent 70%);
    mask-repeat: no-repeat;
    mask-size: contain;
    position: absolute;
    right: 0;
    top: calc(50vh - 24em - 64px);
    width: 100%;
  }
`;

export interface Props extends ElementProps<HTMLDivElement> {
  photoUrls: PhotoUrls | void;
}


const BackgroundImage = ({ photoUrls, ...rest }: Props) => {
  const [lqipUrl, setLqipUrl] = React.useState<string | void>();
  const [fullUrl, setFullUrl] = React.useState<string | void>();

  useAsyncEffect(isMounted => {
    if (!photoUrls) {
      setLqipUrl();
      setFullUrl();
      return;
    }

    const { lqip, full } = photoUrls;

    void lqip.then(url => {
      if (!isMounted()) return;
      setLqipUrl(url);
    });

    void full.then(url => {
      if (!isMounted()) return;
      setFullUrl(url);
    });
  }, [photoUrls]);

  return (<>
    <BackgroundImageWrapper backgroundImage={lqipUrl} {...rest} />
    <BackgroundImageWrapper backgroundImage={fullUrl} {...rest} />
  </>);
};


export default BackgroundImage;
