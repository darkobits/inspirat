/* eslint-disable react/jsx-props-no-spreading */
import sleep from '@darkobits/sleep';
import ms from 'ms';
import React from 'react';
import useAsyncEffect from 'use-async-effect';

import InspiratContext from 'web/contexts/Inspirat';
import {
  BACKGROUND_ANIMATION_INITIAL_SCALE,
  BACKGROUND_RULE_OVERRIDES,
  BACKGROUND_TRANSITION_DURATION
} from 'web/etc/constants';
import { Logger } from 'web/lib/log';
import { preloadImage } from 'web/lib/utils';

import classes, { keyframes } from './BackgroundImage.css';

import type { InspiratPhotoResource } from 'etc/types';
import type { ElementProps } from 'web/etc/types';

const log = new Logger({ prefix: '🌅 •' });

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

  const [styleOverrides, setStyleOverrides] = React.useState<React.CSSProperties>({});
  const [animationName, setAnimationName] = React.useState('none');
  const [lowQualityUrl, setLowQualityUrl] = React.useState<string | void>();
  const [fullQualityUrl, setFullQualityUrl] = React.useState<string | void>();
  const [anyImageReady, setAnyImageReady] = React.useState(false);

  /**
   * [Effect] When the photo changes, computes new low quality and full-quality
   * URLs, preloads those resources, and sets our `anyImagesReady` flag to true
   * when the first image finishes loading.
   */
  useAsyncEffect(async isMounted => {
    if (!photo) return;

    if (!isActive) {
      setTimeout(() => {
        if (!isMounted) return;
        setAnyImageReady(false);
        setLowQualityUrl();
        setFullQualityUrl();
        setAnimationName('none');
        setStyleOverrides({});
      }, ms(BACKGROUND_TRANSITION_DURATION));

      return;
    }

    const photoUrls = buildPhotoUrls(photo);
    setStyleOverrides(BACKGROUND_RULE_OVERRIDES[photo.id]?.styleOverrides ?? {});

    // Preload images for each of our URLs and set the URL on internal state
    // when each becomes ready.
    await Promise.race([
      preloadImage(photoUrls.lowQuality).then(() => sleep(0)).then(() => {
        if (!isMounted()) return;
        log.silly(`${id}: Low quality image ready for ${photo.id}.`);
        setLowQualityUrl(photoUrls.lowQuality);
        setAnyImageReady(true);
        setAnimationName(keyframes.zoomOut);
      }),
      preloadImage(photoUrls.highQuality).then(() => sleep(10)).then(() => {
        if (!isMounted()) return;
        log.silly(`${id}: High quality image ready for ${photo.id}.`);
        setFullQualityUrl(photoUrls.highQuality);
        setAnyImageReady(true);
        setAnimationName(keyframes.zoomOut);
      })
    ]);

    // if (!isMounted()) return;
    // setAnyImageReady(true);
    // setAnimationName(keyframes.zoomOut);
  }, [photo?.id, isActive]);

  /**
   * [Memo] Compute the `srcset` attribute to apply to our image when URLs
   * change.
   */
  const { srcSet, sizes } = React.useMemo(() => {
    const sizeSm = Math.round(window.screen.width * 0.64);
    const sizeLg = Math.round(window.screen.width * BACKGROUND_ANIMATION_INITIAL_SCALE);

    if (lowQualityUrl && fullQualityUrl) return {
      srcSet: [`${lowQualityUrl} ${sizeSm}w`, `${fullQualityUrl} ${sizeLg}w`].join(', '),
      sizes: [`${sizeSm}px`, `${sizeLg}px`].join(', ')
    };

    return {};
  }, [lowQualityUrl, fullQualityUrl]);

  const { transform, ...restStyleOverrides } = styleOverrides;

  // NOTE: An intermediate wrapper is required for custom transform overrides
  // because we can't apply transforms to the root element (this would affect
  // children) and the animation applied to images uses `transform`.
  return (
    <div
      id={id}
      data-is-active={isActive}
      className={classes.backgroundImageWrapper}
      style={{
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
          transform
        }}
      >
        <img
          alt="BackgroundImage"
          className={classes.backgroundImage}
          src={fullQualityUrl ?? lowQualityUrl ?? ''}
          srcSet={srcSet}
          sizes={sizes}
          style={{
            animationName,
            ...restStyleOverrides
          }}
        />
      </div>
      {children}
    </div>
  );
}
