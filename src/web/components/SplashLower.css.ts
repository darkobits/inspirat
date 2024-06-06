import { style } from '@vanilla-extract/css';

export default {
  splashLower: style({
    position: 'fixed',
    inset: 0,
    display: 'flex',
    justifyContent: 'space-between',
    transition: 'opacity 1.2s ease-in',
    width: '100%',
    padding: '10px 18px',
    zIndex: 1,
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
      height: '128px',
      backgroundImage: 'linear-gradient(to top, rgba(0, 0, 0, 0.42) 0%, transparent 100%)',
      zIndex: 0
    }
  }),
  imageLocation: style({
    display: 'none',
    '@media': {
      '(min-width: 900px)': {
        display: 'block'
      }
    }
  }),
  imageAttribution: style({
    marginLeft: 'auto'
  })
};
