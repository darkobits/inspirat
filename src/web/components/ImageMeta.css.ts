import { style, globalStyle } from '@vanilla-extract/css';

const classes = {
  imageMeta: style({
    color: 'rgba(255, 255, 255, 0.96)',
    display: 'flex',
    fontFamily: '"Josefin Sans", -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif',
    fontSize: 'clamp(0.76rem, 0.4400rem + 1.2444vw, 1rem)',
    fontWeight: 300,
    letterSpacing: '0em',
    minHeight: 'min-content',
    // Force the element to the flex-end of its parent.
    marginTop: 'auto',
    // So this sits on top of the gradient shadow created by SplashLower.
    zIndex: 1
  })
};

globalStyle(`${classes.imageMeta} *`, {
  color: 'inherit',
  transition: 'all 0.25s ease-in-out',
  textShadow: '0px 0px 1ipx rgba(0, 0, 0, 1)'
});

globalStyle(`${classes.imageMeta} *:hover`, {
  textShadow: '0px 0px 4px rgba(255, 255, 255, 0.32)'
});


export default classes;
