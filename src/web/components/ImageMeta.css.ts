import { style, createVar, globalStyle } from '@vanilla-extract/css';


export const vars = {
  textShadow: createVar()
};

const classes = {
  imageMeta: style({
    color: 'rgba(255, 255, 255, 0.96)',
    display: 'flex',
    fontFamily: '"Josefin Sans", -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif',
    fontSize: '16px',
    fontWeight: 300,
    letterSpacing: '0em',
    minHeight: '1em',
    textShadow: vars.textShadow,
    userSelect: 'none'
  })
};

globalStyle(`${classes.imageMeta} a`, {
  color: 'inherit',
  transition: 'all 0.25s ease-in-out'
});

globalStyle(`${classes.imageMeta} a:hover`, {
  textShadow: '0px 0px 4px rgba(255, 255, 255, 0.32)'
});


export default classes;
