import { style, globalStyle } from '@vanilla-extract/css';

const classes = {
  imageMeta: style({
    display: 'flex',

    color: 'inherit',

    // 0.72rem @ 400px wide -> 1rem @ 1200px wide
    // See: https://www.marcbacon.com/tools/clamp-calculator/
    fontSize: 'clamp(0.72rem, 0.58rem + 0.56vw, 1rem)',

    // fontSize: 'clamp(0.76rem, 0.4400rem + 1.2444vw, 1rem)',

    fontWeight: 200,
    letterSpacing: '0.042em',
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
  textShadow: '0px 0px 1px rgba(0, 0, 0, 1)'
});

globalStyle(`${classes.imageMeta} *:hover`, {
  textShadow: '0px 0px 4px rgba(255, 255, 255, 0.32)'
});


export default classes;
