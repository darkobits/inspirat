/* eslint-disable react/jsx-props-no-spreading */
import { darken, readableColor } from 'polished';
import React from 'react';
import { Overlay, Tooltip } from 'react-bootstrap';
import { twMerge } from 'tailwind-merge';
import { v4 as uuid } from 'uuid';

import { Color } from 'etc/types';
import { WHITE, BLACK } from 'web/etc/constants';
import { rgba } from 'web/lib/utils';

import classes from './Swatch.css';

export type SwatchProps = {
  color: Color;
} & Omit<JSX.IntrinsicElements['div'], 'color'>;

/**
 * Renders a div whose background color is the provided color and whose text
 * color will be a 'readable' color according to Polished.
 */
export const Swatch = ({ color, children, className, style, ...props }: SwatchProps) => {
  const [tooltipId] = React.useState(uuid());
  const tooltipTarget = React.useRef(null);
  const [showTooltip, setShowTooltip] = React.useState(false);

  return (
    <div
      className={twMerge(
        'flex items-center justify-center shrink-0',
        'rounded cursor-crosshair',
        classes.swatch,
        className
      )}
      style={{
        backgroundColor: rgba(color ?? WHITE),
        border: `1px solid ${darken(0.2, rgba(color ?? BLACK, 0.42))}`,
        color: readableColor(rgba(color ?? WHITE)),
        ...style
      }}
      ref={tooltipTarget}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      {...props}
    >
      <Overlay
        target={tooltipTarget.current}
        show={showTooltip}
        placement="bottom"
        flip
      >
        {overlayProps => (
          <Tooltip
            id={tooltipId}
            className="
              text-slate-100 text-sm font-mono font-thin bg-slate-950/90
              py-1 px-2 rounded-md
            "
            {...overlayProps as any}
          >
            {children}
          </Tooltip>
        )}
      </Overlay>
    </div>
  );
};
