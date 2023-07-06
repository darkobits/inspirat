import { assignInlineVars } from '@vanilla-extract/dynamic';
import { InspiratPhotoResource } from 'etc/types';
import { darken, desaturate, lighten } from 'polished';
import React from 'react';

import { BASIS, WHITE, BLACK } from 'web/etc/constants';
import { rgba } from 'web/lib/utils';

import classes, { vars } from './Source.css';


// ----- Image Source ----------------------------------------------------------

interface SourceProps extends React.PropsWithChildren<any> {
  photo: InspiratPhotoResource | undefined;
}

/**
 * Image override component.
 */
export const Source = ({ photo, children }: SourceProps) => {
  const fgColor = photo?.palette?.lightMuted ?? WHITE;
  const bgColor = photo?.palette?.darkVibrant ?? BLACK;

  return (
    <div
      className={classes.source}
      style={{
        height: BASIS,
        ...assignInlineVars({
          [vars.input.backgroundColor]: darken(0.2, rgba(bgColor, 0.7)),
          [vars.input.borderColor]: desaturate(0.6, rgba(fgColor, 0.4)),
          [vars.input.boxShadow]: `0px 0px 2px 1px ${rgba(bgColor, 0.16)}`,
          [vars.input.color]: desaturate(0, lighten(0.16, rgba(fgColor))),
          [vars.input.height]: BASIS,
          [vars.input.lineHeight]: BASIS,
          [vars.input.focus.boxShadow]: `0px 0px 1px 1px ${rgba(bgColor, 0.32)}`,
          [vars.input.focus.backgroundColor]: darken(0.2, rgba(bgColor, 0.8)),
          [vars.input.focus.borderColor]: desaturate(0.6, rgba(fgColor, 0.6)),
          [vars.input.placeholder.color]: rgba(fgColor, 0.64),
          [vars.input.selection.backgroundColor]: darken(0.05, rgba(bgColor, 0.5))
        })
      }}
    >
      {children}
    </div>
  );
};
