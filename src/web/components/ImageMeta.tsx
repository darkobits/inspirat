import cx from 'classnames';

import { ElementProps } from 'web/etc/types';

import classes from './ImageMeta.css';

export function ImageMeta(props: ElementProps<HTMLDivElement>) {
  return (
    <div
      className={cx(classes.imageMeta, props.className)}
      style={{
        // textShadow: '0px 0px 1ipx rgba(0, 0, 0, 1)'
        ...props.style
      }}
    >
      {props.children}
    </div>
  );
}
