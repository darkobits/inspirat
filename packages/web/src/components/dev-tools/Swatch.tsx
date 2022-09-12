import { assignInlineVars } from '@vanilla-extract/dynamic';
import { Color } from 'inspirat-common/types';
import { darken, readableColor } from 'polished';
import React from 'react';
import { Overlay, Tooltip } from 'react-bootstrap';
import { v4 as uuid } from 'uuid';

import { BASIS, WHITE, BLACK } from 'etc/constants';
import { rgba } from 'lib/utils';

import classes, { vars } from './Swatch.css';


interface SwatchProps extends React.PropsWithChildren<any> {
  color?: Color;
}

/**
 * Renders a div whose background color is the provided color and whose text
 * color will be a 'readable' color according to Polished.
 */
export const Swatch = ({ color, children, ...props }: SwatchProps) => {
  const [tooltipId] = React.useState(uuid());
  const tooltipTarget = React.useRef(null);
  const [showTooltip, setShowTooltip] = React.useState(false);

  return (
    <div
      className={classes.swatch}
      style={assignInlineVars({
        [vars.backgroundColor]: rgba(color ?? WHITE),
        [vars.border]: `1px solid ${darken(0.2, rgba(color ?? BLACK, 0.42))}`,
        [vars.color]: readableColor(rgba(color ?? WHITE)),
        [vars.height]: BASIS
      })}
      ref={tooltipTarget}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      {...props}
    >
      <Overlay
        target={tooltipTarget.current}
        show={showTooltip}
        placement="auto"
        flip
      >
        {overlayProps => (
          <Tooltip id={tooltipId} {...overlayProps as any}>
            {children}
          </Tooltip>
        )}
      </Overlay>
    </div>
  );
};
