import cx from 'classnames';
import { darken, readableColor } from 'polished';
import React from 'react';
import { Overlay, Tooltip } from 'react-bootstrap';
import { v4 as uuid } from 'uuid';

import { Color } from 'etc/types';
import { BASIS, WHITE, BLACK } from 'web/etc/constants';
import { rgba } from 'web/lib/utils';

import classes from './Swatch.css';


interface SwatchProps extends React.PropsWithChildren<any> {
  color?: Color;
}

/**
 * Renders a div whose background color is the provided color and whose text
 * color will be a 'readable' color according to Polished.
 */
export const Swatch = ({ color, children, className, ...props }: SwatchProps) => {
  const [tooltipId] = React.useState(uuid());
  const tooltipTarget = React.useRef(null);
  const [showTooltip, setShowTooltip] = React.useState(false);

  return (
    <div
      className={cx(classes.swatch, className)}
      style={{
        height: BASIS,
        width: BASIS,
        backgroundColor: rgba(color ?? WHITE),
        border: `1px solid ${darken(0.2, rgba(color ?? BLACK, 0.42))}`,
        color: readableColor(rgba(color ?? WHITE))
      }}
      ref={tooltipTarget}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props}
    >
      <Overlay
        target={tooltipTarget.current}
        show={showTooltip}
        placement="auto"
        flip
      >
        {overlayProps => (
          // eslint-disable-next-line react/jsx-props-no-spreading
          <Tooltip id={tooltipId} {...overlayProps as any}>
            {children}
          </Tooltip>
        )}
      </Overlay>
    </div>
  );
};
