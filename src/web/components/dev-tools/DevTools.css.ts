import { style } from '@vanilla-extract/css';

import {
  BASIS,
  BACKGROUND_TRANSITION_DURATION,
  BACKGROUND_TRANSITION_FUNCTION
} from 'web/etc/constants';

export const PROGRESS_BAR_HEIGHT = '4px';

export default {
  devToolsContainer: style({
    position: 'fixed',
    top: PROGRESS_BAR_HEIGHT,
    left: 0,
    right: 0,
    transition: 'opacity 2s ease-in-out',
    '::before': {
      content: ' ',
      position: 'absolute',
      inset: 0,
      display: 'block',
      height: '42px',
      background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.24) 0%, transparent 100%)',
      zIndex: -1
    }
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
  }),
  date: style({
    display: 'flex',
    gap: '6px',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'nowrap',

    // Dimensions
    minHeight: BASIS,
    minWidth: '5.6rem',
    paddingLeft: '0.42em',
    paddingRight: '0.72em',

    // Borders
    borderStyle: 'solid',
    borderWidth: '1px',
    borderRadius: '4px',

    // Typography
    fontSize: '1rem',
    fontWeight: 300,
    textShadow: '0px 0px 6px rgba(0, 0, 0, 0.42)',
    whiteSpace: 'nowrap',

    backdropFilter: 'blur(12px)',
    userSelect: 'none',

    // Transitions
    transitionProperty: 'background-color, border-color, color, opacity',
    transitionTimingFunction: BACKGROUND_TRANSITION_FUNCTION,
    transitionDuration: BACKGROUND_TRANSITION_DURATION
  })
};
