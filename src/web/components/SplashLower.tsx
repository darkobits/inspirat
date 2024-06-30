/* eslint-disable react/jsx-props-no-spreading */
import cx from 'classnames';
import * as emoji from 'node-emoji';
import { desaturate, lighten } from 'polished';
import React from 'react';

import { ImageMeta } from 'web/components/ImageMeta';
import { keyframes } from 'web/etc/global-styles.css';
import useQuery from 'web/hooks/use-query';
import { capitalizeWords, rgba } from 'web/lib/utils';

import classes from './SplashLower.css';

import type { InspiratPhotoResource } from 'etc/types';
import type { ElementProps } from 'web/etc/types';

export interface SplashLowerProps extends ElementProps<HTMLDivElement> {
  photo: InspiratPhotoResource | void;
  isActive: boolean;
}

export default function SplashLower(props: SplashLowerProps) {
  const { photo, isActive, className, style, ...restProps } = props;
  const [ready, setReady] = React.useState(false);
  const query = useQuery();

  /**
   * [Effect] Sets `ready` state to `true` once, when the first photo is ready.
   */
  React.useEffect(() => {
    if (!photo?.id) return;
    const timeout = setTimeout(() => setReady(true), 120);
    return () => clearTimeout(timeout);
  }, [photo?.id]);

  // If we have a `meta=false` query param, hide image metadata.
  if (query?.meta === 'false') return null;

  // Location.
  const location = photo?.location?.name && emoji.strip(capitalizeWords(photo.location.name))
    // Remove 5-digit ZIP codes.
    .replaceAll(/(\s?\d{5}\s?)/gi, '')
    // Fix this semi-common issue in image locations:
    // "USA, United States" => "United States"
    .replaceAll(/usa,?\s*united\s*states/gi, 'United States');

  // Attribution.
  const user = photo?.user?.name && emoji.strip(capitalizeWords(photo.user.name));
  const userHref = photo?.user?.links?.html;
  const photoHref = photo?.links?.html;

  const attribution = user && (
    <span>
      <a href={photoHref} target="_blank" rel="noopener noreferrer">Photo</a> by{' '}
      <a href={userHref} target="_blank" rel="noopener noreferrer">{user}</a>
    </span>
  );

  return (
    <div
      data-testid="SplashLower"
      className={cx(classes.splashLower, className, 'safe-padding')}
      style={{
        animationName: !ready
          ? 'none'
          : isActive
            ? keyframes.blurIn
            : keyframes.blurOut,
        opacity: ready ? 1 : 0,
        color: lighten(0.2, desaturate(0.24, rgba(photo?.palette?.lightVibrant ?? 'white', 1))),
        ...style
      }}
      {...restProps}
    >
      <ImageMeta className={classes.imageLocation}>{location}</ImageMeta>
      <ImageMeta className={classes.imageAttribution}>{attribution}</ImageMeta>
    </div>
  );
}
