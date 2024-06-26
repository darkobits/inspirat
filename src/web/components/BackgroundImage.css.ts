import { style, keyframes as defineKeyframes } from '@vanilla-extract/css';

import {
  BACKGROUND_ANIMATION_DURATION,
  BACKGROUND_ANIMATION_INITIAL_SCALE,
  BACKGROUND_TRANSITION_DURATION,
  BACKGROUND_TRANSITION_FUNCTION
} from 'web/etc/constants';

export const keyframes = {
  zoomOut: defineKeyframes({
    '0%': {
      transform: `scale(${BACKGROUND_ANIMATION_INITIAL_SCALE})`
    },
    '100%': {
      transform: 'scale(1)'
    }
  })
};

export default {
  /**
   * Renders a full-screen background image
   */
  backgroundImageWrapper: style({
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    display: 'flex',
    flexDirection: 'column',
    transitionProperty: 'opacity',
    userSelect: 'none',
    zIndex: 0,
    transitionDuration: BACKGROUND_TRANSITION_DURATION,
    transitionTimingFunction: BACKGROUND_TRANSITION_FUNCTION
  }),
  backgroundImage: style({
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    userSelect: 'none',
    transitionProperty: 'opacity',
    animationTimingFunction: 'linear',
    animationDuration: `${BACKGROUND_ANIMATION_DURATION / 1000}s`
  })
};
