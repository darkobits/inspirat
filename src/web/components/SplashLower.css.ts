import { style } from '@vanilla-extract/css';

import {
  BACKGROUND_TRANSITION_DURATION,
  BACKGROUND_TRANSITION_FUNCTION
} from 'web/etc/constants';

export default {
  splashLower: style({
    position: 'absolute',
    inset: 0,

    display: 'flex',
    justifyContent: 'space-between',

    // Animations.
    animationDuration: `calc(${BACKGROUND_TRANSITION_DURATION} * 0.8)`,
    animationTimingFunction: BACKGROUND_TRANSITION_FUNCTION,

    // Transitions.
    transitionProperty: 'opacity',
    transitionTimingFunction: BACKGROUND_TRANSITION_FUNCTION,
    transitionDuration: BACKGROUND_TRANSITION_DURATION,

    width: '100%', height: '100%', zIndex: 1,

    /**
      * This adds a subtle gradient at the bottom of the screen that provides
      * some additional contrast behind the image metadata elements to improve
      * readability.
      */
    '::before': {
      position: 'absolute',
      content: ' ',
      display: 'block',
      bottom: 0,
      left: 0,
      right: 0,
      height: '4rem',
      backgroundImage: 'linear-gradient(to top, rgba(0, 0, 0, 0.24) 0%, transparent 100%)',
      zIndex: 0
    }
  }),
  imageLocation: style({
    padding: '8px 12px',
    opacity: 0.72,
    fontSize: '0.8em',
    textShadow: '0px 0px 4px rgba(0, 0, 0, 0.8)',
    display: 'none',
    '@media': {
      '(pointer: coarse) and (orientation: landscape)': {
        padding: 0
      },
      '(min-width: 900px)': {
        display: 'block'
      }
    }
  }),
  imageAttribution: style({
    padding: '8px 12px',
    opacity: 0.72,
    textShadow: '0px 0px 4px rgba(0, 0, 0, 0.8)',
    fontSize: '0.8em',
    marginLeft: 'auto',
    '@media': {
      '(pointer: coarse) and (orientation: landscape)': {
        padding: 0
      }
    }
  })
};
