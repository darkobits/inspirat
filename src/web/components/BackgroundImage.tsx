/* eslint-disable react/jsx-props-no-spreading */
// import { assignInlineVars } from '@vanilla-extract/dynamic';
import React from 'react';
import useAsyncEffect from 'use-async-effect';

import classes from './BackgroundImage.css';

import type { BackgroundImageOverrides, ElementProps, PhotoUrls } from 'web/etc/types';


/**
 * Set to a truthy value to debug the blur backdrop element.
 *
 * TODO: This needs to be re-implemented in a way that vanilla-extract supports.
 * We can't seem to use the inline style prop to define the ::after
 * pseudo-element, but we also cannot pass props to static vanilla-extract
 * styles. Consider avoiding the ::after approach and using an empty div.
 */
const DEBUG_BLUR = 0;


// ----- Background Image Wrapper ----------------------------------------------

/**
 * Props for the BackgroundImage component.
 */
interface BackgroundImageWrapperProps extends ElementProps<HTMLDivElement> {
  backgroundImage?: string | void | undefined;
  overrides: BackgroundImageOverrides;
}


const BackgroundImageWrapper = (props: BackgroundImageWrapperProps) => {
  const { backgroundImage, overrides = {}, style, ...restProps } = props;

  return (
    <div
      className={classes.backgroundImageWrapper}
      style={{
        backdropFilter: DEBUG_BLUR ? 'none' : `blur(${overrides.backdrop?.blurRadius ?? '0px'})`,
        backgroundColor: DEBUG_BLUR ? 'rgba(255, 0, 0, 0.5)' : `rgba(0, 0, 0, ${overrides.backdrop?.backgroundOpacity ?? 0.2})`,
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
        backgroundPosition: overrides.backgroundPosition ?? 'center center',
        opacity: backgroundImage ? overrides.opacity ?? 1 : 0,
        transitionDuration: overrides.transitionDuration ?? 'initial',
        transitionTimingFunction: overrides.transitionTimingFunction ?? 'initial',
        transform: overrides.transform ?? 'initial',
        ...style
      }}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...restProps}
    />
  );
};


// ----- Background Image ------------------------------------------------------


export interface BackgroundImageProps extends ElementProps<HTMLDivElement> {
  photoUrls: PhotoUrls | void;
  overrides: BackgroundImageOverrides;
}


const BackgroundImage = ({ photoUrls, overrides, ...restProps }: BackgroundImageProps) => {
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
    <BackgroundImageWrapper backgroundImage={lqipUrl} overrides={overrides} {...restProps} />
    <BackgroundImageWrapper backgroundImage={fullUrl} overrides={overrides} {...restProps} />
  </>);
};


export default BackgroundImage;
