/* eslint-disable react/jsx-props-no-spreading */
import cx from 'classnames';
import * as emoji from 'node-emoji';
import React from 'react';

import { ImageMeta } from 'web/components/ImageMeta';
import { keyframes } from 'web/etc/global-styles.css';
import useQuery from 'web/hooks/use-query';
import { capitalizeWords } from 'web/lib/utils';

import classes from './SplashLower.css';

import type { InspiratPhotoResource } from 'etc/types';
import type { ElementProps } from 'web/etc/types';

export interface SplashLowerProps extends ElementProps<HTMLDivElement> {
  photo: InspiratPhotoResource | void;
  isActive: boolean;
}

export default function SplashLower(props: SplashLowerProps) {
  const { id, photo, isActive, className, style, ...restProps } = props;
  const [ready, setReady] = React.useState(false);
  const query = useQuery();

  /**
   * [Effect] Flips our `ready` state to `true` once, when the first photo is
   * ready.
   */
  React.useEffect(() => {
    if (!photo?.id) return;
    const timeout = setTimeout(() => setReady(true), 200);
    return () => clearTimeout(timeout);
  }, [photo?.id]);

  // If we have a `meta=false` query param, hide image metadata.
  if (query?.meta === 'false') return null;

  // Location.
  const location = emoji.strip(capitalizeWords(photo?.location?.name ?? ''))
    // Remove 5-digit ZIP codes.
    .replaceAll(/(\s?\d{5}\s?)/gi, '')
    // Fix this semi-common issue in image locations:
    // "Usa, United States" => "United States"
    .replaceAll(/usa,?\s*united\s*states/gi, 'United States');
    // Replace strings like "Fl, Usa" with "FL, USA".
    // .replaceAll(/\w{2}, usa/gi, input => input.toUpperCase())
    // Replace any remaining words "Usa" with "USA".
    // .replaceAll(/\busa\b/gi, 'USA')
    // Replace words "Uk" with "UK".
    // .replaceAll(/\buk\b/gi, 'UK');

  // Attribution.
  const author = emoji.strip(capitalizeWords(photo?.user?.name ?? ''));
  const authorHref = photo?.user?.links?.html;
  const photoHref = photo?.links?.html;

  const attribution = author && (
    <span>
      <a href={photoHref} target="_blank" rel="noopener noreferrer">Photo</a> by{' '}
      <a href={authorHref} target="_blank" rel="noopener noreferrer">{author}</a>
    </span>
  );

  return (
    <div
      id={id}
      data-testid="SplashLower"
      className={cx(classes.splashLower, className, 'safe-padding')}
      style={{
        animationName: ready
          ? isActive
            ? keyframes.blurIn
            : keyframes.blurOut
          : 'none',
        // animationTimingFunction: 'cubic-bezier(0, 0.75, 0.25, 1)',
        opacity: ready ? 1 : 0,
        ...style
      }}
      {...restProps}
    >
      <ImageMeta className={classes.imageLocation}>
        {location}
      </ImageMeta>
      <ImageMeta
        className={classes.imageAttribution}
      >
        {attribution}
      </ImageMeta>
    </div>
  );
}
