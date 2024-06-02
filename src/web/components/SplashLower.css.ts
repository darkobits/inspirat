import { style } from '@vanilla-extract/css';


export default {
  splashLower: style({
    display: 'flex',
    justifyContent: 'space-between',
    transition: 'opacity 1.2s ease-in',
    /* Force the element to the flex-end of its parent. */
    marginTop: 'auto',
    width: '100%',
    zIndex: 1
  }),
  imageLocation: style({
    display: 'none',
    '@media': {
      '(min-width: 300px)': {
        display: 'block'
      }
    }
  }),
  imageAttribution: style({
    marginLeft: 'auto'
  }),
  bottomGradient: style({
    backgroundImage: 'linear-gradient(to top, rgba(0, 0, 0, 0.5) 0%, transparent 100%)',
    bottom: '0px',
    height: '128px',
    left: '0px',
    position: 'fixed',
    right: '0px',
    width: '100%'
  })
};
