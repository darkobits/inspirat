import { style, createVar } from '@vanilla-extract/css';

export const vars = {
  backgroundColor: createVar(),
  border: createVar(),
  color: createVar(),
  height: createVar()
};

export default {
  swatch: style({
    alignItems: 'center',
    backgroundColor: vars.backgroundColor,
    borderRadius: '4px',
    border: vars.border,
    color: vars.color,
    display: 'flex',
    fontSize: '12px',
    height: vars.height,
    justifyContent: 'center',
    textTransform: 'capitalize',
    width: '32px'
  })
};
