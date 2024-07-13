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
    backgroundColor: vars.backgroundColor,
    width: BASIS,
    height: BASIS,
    border: vars.border,
    color: vars.color
  })
};
