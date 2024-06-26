import { assignInlineVars } from '@vanilla-extract/dynamic';
import cx from 'classnames';
import { darken, desaturate, lighten } from 'polished';

import { BASIS, WHITE, BLACK } from 'web/etc/constants';
import { rgba } from 'web/lib/utils';

import classes, { vars } from './Source.css';

import type { InspiratPhotoResource } from 'etc/types';
import type { ElementProps } from 'web/etc/types';

interface SourceProps extends ElementProps<HTMLDivElement> {
  photo: InspiratPhotoResource | undefined;
}

/**
 * Image override component.
 */
export function Source({ photo, children, className, style }: SourceProps) {
  const fgColor = photo?.palette?.lightVibrant ?? WHITE;
  const bgColor = photo?.palette?.darkVibrant ?? BLACK;

  return (
    <div
      className={cx(classes.source, className)}
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
          [vars.input.placeholder.color]: rgba(fgColor, 0.32),
          [vars.input.selection.backgroundColor]: darken(0.05, rgba(bgColor, 0.5))
        }),
        ...style
      }}
    >
      {children}
    </div>
  );
}
