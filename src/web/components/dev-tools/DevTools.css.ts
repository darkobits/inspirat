import { style } from '@vanilla-extract/css';

import { BASIS } from 'web/etc/constants';

export const PROGRESS_BAR_HEIGHT = '4px';

const classes = {
  devToolsWrapper: style({
    position: 'fixed',
    right: 0,
    top: PROGRESS_BAR_HEIGHT,
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: `calc(${BASIS} * 0.32)`,
    padding: `calc(${BASIS} * 0.32)`
  }),
  devToolsRow: style({
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: `calc(${BASIS} * 0.32)`
  })
};

export default classes;
