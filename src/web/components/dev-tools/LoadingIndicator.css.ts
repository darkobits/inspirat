import { style, keyframes, globalStyle } from '@vanilla-extract/css';

const classes = {
  loadingIndicator: style({
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '4px',
    boxShadow: '0px 0px 4px rgba(0, 0, 0, 0.16)',
    transition: 'background-color 1s ease'
  }),
  spin: style({
    animationName: keyframes({
      from: {
        transform: 'rotate(0deg)'
      },
      to: {
        transform: 'rotate(360deg)'
      }
    }),
    animationDuration: '2s',
    animationIterationCount: 'infinite',
    animationTimingFunction: 'linear'
  })
};

globalStyle(`${classes.loadingIndicator} svg`, {
  filter: 'drop-shadow(0px 0px 4px rgba(0, 0, 0, 0.16))',
  transition: 'color 1s ease'
  // color: vars.loadingIndicator.svg.color
});


export default classes;
