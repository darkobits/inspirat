import { style } from '@vanilla-extract/css';

import { BASIS } from 'web/etc/constants';

export const PROGRESS_BAR_HEIGHT = '4px';

export default {
  devToolsContainer: style({
    position: 'fixed',
    top: PROGRESS_BAR_HEIGHT,
    left: 0,
    right: 0,
    transition: 'opacity 2s ease-in-out'
  }),
  devToolsWrapper: style({
    display: 'flex',
    flexDirection: 'column',
    gap: `calc(${BASIS} * 0.24)`,
    padding: `calc(${BASIS} * 0.24)`
  }),
  devToolsRow: style({
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: `calc(${BASIS} * 0.24)`
  })
};
