import { assignInlineVars } from '@vanilla-extract/dynamic';
import cx from 'classnames';
import { rgba } from 'polished';
import React from 'react';

// import { useInspirat } from 'hooks/use-inspirat';
import { compositeTextShadow } from 'lib/typography';

import classes, { vars } from './ImageMeta.css';


/**
 * Provided a color, returns a composite text-shadow property descriptor that
 * renders a black shadow followed by a larger shadow in the provided color.
 */
const textShadow = (color: string) => compositeTextShadow([
  [0, 0, 2, rgba(0, 0, 0, 1)],
  [0, 0, 8, rgba(color, 0.3)]
]);


export interface ImageMetaProps extends React.PropsWithChildren {
  className?: string;
}

/**
 * Note: `shadowColor` prop and `currentPhoto` do not seem to be used here.
 */
export const ImageMeta = (props: ImageMetaProps) => {
  // const { currentPhoto } = useInspirat();

  return (
    <div
      className={cx(classes.imageMeta, props.className)}
      style={assignInlineVars({
        [vars.textShadow]: textShadow('black')
      })}
    >
      {props.children}
    </div>
  );
};
