import { style, createVar } from '@vanilla-extract/css';

import { BACKGROUND_TRANSITION_DURATION, BACKGROUND_TRANSITION_FUNCTION } from 'web/etc/constants';

export const vars = {
  progressBarBackgroundColor: createVar(),
  progressBarForegroundColor: createVar()
};

export default {
  progress: style({
    appearance: 'none',
    position: 'fixed',
    left: 0,
    right: 0,
    top: 0,
    width: '100%',
    height: '100%',
    ':hover': {
      cursor: 'pointer',
      height: '6px !important'
    },
    '::-webkit-progress-bar': {
      backgroundColor: vars.progressBarBackgroundColor,
      transitionProperty: 'background-color',
      transitionDuration: BACKGROUND_TRANSITION_DURATION,
      transitionTimingFunction: BACKGROUND_TRANSITION_FUNCTION
    },
    '::-webkit-progress-value': {
      backgroundColor: vars.progressBarForegroundColor,
      transitionProperty: 'background-color',
      transitionDuration: BACKGROUND_TRANSITION_DURATION,
      transitionTimingFunction: BACKGROUND_TRANSITION_FUNCTION
    }
  })
};
