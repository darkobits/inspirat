import { style, createVar } from '@vanilla-extract/css';

import { BASIS } from 'web/etc/constants';

export const vars = {
  backgroundColor: createVar(),
  border: createVar(),
  color: createVar(),
  height: createVar()
};

export default {
  swatch: style({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,

    width: BASIS,
    height: BASIS,

    backgroundColor: vars.backgroundColor,

    borderRadius: '4px',
    border: vars.border,

    color: vars.color,

    fontSize: '12px',
    textTransform: 'capitalize'
  })
};
