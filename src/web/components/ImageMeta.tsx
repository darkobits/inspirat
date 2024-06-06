import cx from 'classnames';
import React from 'react';

import classes from './ImageMeta.css';

export interface ImageMetaProps extends React.PropsWithChildren {
  className?: string;
}

export const ImageMeta = (props: ImageMetaProps) => {
  return (
    <div
      className={cx(classes.imageMeta, props.className)}
      style={{
        // textShadow: '0px 0px 1ipx rgba(0, 0, 0, 1)'
      }}
    >
      {props.children}
    </div>
  );
};
