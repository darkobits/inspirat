/* eslint-disable react/jsx-props-no-spreading */
import sleep from '@darkobits/sleep';
import React from 'react';
import useAsyncEffect from 'use-async-effect';

import InspiratContext from 'web/contexts/Inspirat';
import {
  BACKGROUND_ANIMATION_INITIAL_SCALE,
  BACKGROUND_TRANSITION_DURATION,
  BACKGROUND_TRANSITION_FUNCTION,
  BACKGROUND_RULE_OVERRIDES
} from 'web/etc/constants';
import { Logger } from 'web/lib/log';
import { preloadImage } from 'web/lib/utils';

import classes, { keyframes } from './BackgroundImage.css';

import type { InspiratPhotoResource } from 'etc/types';
import type { BackgroundImageOverrides, ElementProps } from 'web/etc/types';

const log = new Logger({ prefix: '🌅 •' });

/**
 * Set to a truthy value to debug the blur backdrop element.
 *
 * TODO: This needs to be re-implemented in a way that vanilla-extract supports.
 * We can't seem to use the inline style prop to define the ::after
 * pseudo-element, but we also cannot pass props to static vanilla-extract
 * styles. Consider avoiding the ::after approach and using an empty div.
 */
const DEBUG_BLUR = 0;

export interface BackgroundImageProps extends ElementProps<HTMLDivElement> {
  photo: InspiratPhotoResource | void;
  isActive: boolean;
}

/**
 * TODO:
 * - Deprecate background-position override (won't work with <img>).
 */
export default function BackgroundImage(props: BackgroundImageProps) {
  const { id, children, style, isActive, photo, ...restProps } = props;
  const { buildPhotoUrls } = React.useContext(InspiratContext);

  const [styleOverrides, setStyleOverrides] = React.useState<BackgroundImageOverrides>({});
  const [animationName, setAnimationName] = React.useState('none');
  const [lowQualityUrl, setLowQualityUrl] = React.useState<string | void>();
  const [fullQualityUrl, setFullQualityUrl] = React.useState<string | void>();
  const [anyImageReady, setAnyImageReady] = React.useState(false);

  /**
   * [Effect] When the photo changes, computes new low quality and full-quality
   * URLs, preloads those resources, and set our `anyImagesReady` flag to true
   * when the first image finishes loading.
   */
  useAsyncEffect(async isMounted => {
    if (!photo) {
      setAnyImageReady(false);
      setLowQualityUrl();
      setFullQualityUrl();
      setAnimationName('none');
      setStyleOverrides({});
      return;
    }

    const photoUrls = buildPhotoUrls(photo);
    setStyleOverrides(BACKGROUND_RULE_OVERRIDES[photo.id] ?? {});

    // Preload images for each of our URLs and set the URL on internal state
    // when each becomes ready.
    await Promise.race([
      preloadImage(photoUrls.lowQuality).then(() => sleep(0)).then(() => {
        if (!isMounted()) return;
        log.debug(`${id}: Low quality image ready for ${photo.id}.`);
        setLowQualityUrl(photoUrls.lowQuality);

      }),
      preloadImage(photoUrls.highQuality).then(() => sleep(10)).then(() => {
        if (!isMounted()) return;
        log.debug(`${id}: High quality image ready for ${photo.id}.`);
        setFullQualityUrl(photoUrls.highQuality);
      })
    ]);

    if (!isMounted()) return;
    setAnyImageReady(true);
    setAnimationName(keyframes.zoomOut);
  }, () => {
    // DO NOT CLEAR THIS, IT RESETS PHOTO ZOOM AT THE START OF A TRANSITION.
    // setAnimationName('none');
  }, [photo?.id]);

  /**
   * [Memo] Compute the `srcset` attribute to apply to our image when URLs
   * change.
   */
  const srcSet = React.useMemo(() => {
    if (lowQualityUrl && fullQualityUrl) return [
      `${lowQualityUrl} ${Math.round(window.screen.width / 2)}w`,
      `${fullQualityUrl} ${Math.round(window.screen.width * 2 * BACKGROUND_ANIMATION_INITIAL_SCALE)}w`
    ].join(', ');
  }, [lowQualityUrl, fullQualityUrl]);

  // NOTE: An intermediate wrapper is required for custom transform overrides
  // because we can't apply transforms to the root element (this would affect
  // children) and the animation applied to images uses `transform`.
  return (
    <div
      id={id}
      data-testid="BackgroundImage"
      className={classes.backgroundImageWrapper}
      style={{
        // Apply "backdrop" style overrides.
        backgroundColor: DEBUG_BLUR ? 'rgba(255, 0, 0, 0.5)' : `rgba(0, 0, 0, ${styleOverrides.backdrop?.backgroundOpacity ?? 0.2})`,
        backdropFilter: DEBUG_BLUR ? 'none' : `blur(${styleOverrides.backdrop?.blurRadius ?? '0px'})`,
        // Apply opacity transition.
        transitionProperty: 'opacity',
        transitionDuration: BACKGROUND_TRANSITION_DURATION,
        transitionTimingFunction: BACKGROUND_TRANSITION_FUNCTION,
        opacity: isActive && anyImageReady ? 1 : 0,
        pointerEvents: isActive ? 'inherit' : 'none',
        ...style
      }}
      {...restProps}
    >
      <div
        data-testid="transform-wrapper"
        style={{
          width: '100%',
          height: '100%',
          transform: styleOverrides.transform
        }}
      >
        <img
          alt="background"
          srcSet={srcSet}
          src={lowQualityUrl ?? fullQualityUrl ?? undefined}
          // sizes="100vw"
          className={classes.backgroundImage}
          style={{ animationName }}
        />
      </div>
      {children}
    </div>
  );
}
