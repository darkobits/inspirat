import { assignInlineVars } from '@vanilla-extract/dynamic';
import React from 'react';
import useAsyncEffect from 'use-async-effect';

import classes, { vars } from './BackgroundImage.css';

import type { BackgroundImageOverrides, ElementProps, PhotoUrls } from 'web/etc/types';


/**
 * Set to a truthy value to debug the blur backdrop element.
 *
 * TODO: This needs to be re-implemented in a way that vanilla-extract supports.
 * We can't seem to use the inline style prop to define the ::after
 * pseudo-element, but we also cannot pass props to static vanilla-extract
 * styles. Consider avoiding the ::after approach and using an empty div.
 */
const DEBUG_BLUR = 1;


// ----- Background Image Wrapper ----------------------------------------------

/**
 * Props for the BackgroundImage component.
 */
interface BackgroundImageWrapperProps extends BackgroundImageOverrides {
  backgroundImage?: string | void | undefined;
}


const BackgroundImageWrapper = (props: BackgroundImageWrapperProps) => {
  const { backgroundImage, ...restProps } = props;

  return (
    <div
      className={classes.backgroundImageWrapper}
      style={assignInlineVars({
        [vars.backgroundImageWrapper.backdropFilter]: DEBUG_BLUR
          ? 'none'
          : `blur(${props.backdrop?.blurRadius ?? '0px'})`,
        [vars.backgroundImageWrapper.backgroundColor]: DEBUG_BLUR
          ? 'rgba(255, 0, 0, 0.5)'
          : `rgba(0, 0, 0, ${props.backdrop?.backgroundOpacity ?? 0.2})`,
        [vars.backgroundImageWrapper.backgroundImage]: backgroundImage ? `url(${backgroundImage})` : 'none',
        [vars.backgroundImageWrapper.backgroundPosition]: props.backgroundPosition ?? 'center center',
        /**
         * If we don't have a background-image prop, use a default opacity of 0.
         * Otherwise, if we have an explicit opacity prop, use it. Otherwise,
         * use an opacity of 1.
         */
        [vars.backgroundImageWrapper.opacity]: backgroundImage
          ? String(props.opacity) || '1'
          : '0',
        [vars.backgroundImageWrapper.transitionDuration]: props.transitionDuration ?? 'initial',
        [vars.backgroundImageWrapper.transitionTimingFunction]: props.transitionTimingFunction ?? 'initial',
        [vars.backgroundImageWrapper.transform]: props.transform ?? 'initial'
      })}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...restProps}
    />
  );
};


// ----- Background Image ------------------------------------------------------


export interface Props extends ElementProps<HTMLDivElement> {
  photoUrls: PhotoUrls | void;
}


const BackgroundImage = ({ photoUrls }: Props) => {
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
    <BackgroundImageWrapper backgroundImage={lqipUrl} />
    <BackgroundImageWrapper backgroundImage={fullUrl} />
  </>);
};


export default BackgroundImage;
