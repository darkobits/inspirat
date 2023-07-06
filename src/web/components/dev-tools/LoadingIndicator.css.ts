import { style, createVar, keyframes, globalStyle } from '@vanilla-extract/css';


export const vars = {
  loadingIndicator: {
    height: createVar(),
    width: createVar(),
    backgroundColor: createVar(),
    svg: {
      color: createVar()
    }
  }
};

const classes = {
  loadingIndicator: style({
    alignItems: 'center',
    backgroundColor: vars.loadingIndicator.backgroundColor,
    borderRadius: '4px',
    boxShadow: '0px 0px 4px rgba(0, 0, 0, 0.16)',
    display: 'flex',
    height: vars.loadingIndicator.height,
    justifyContent: 'center',
    transition: 'background-color 1s ease',
    width: vars.loadingIndicator.width
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
  transition: 'color 1s ease',
  color: vars.loadingIndicator.svg.color
});


export default classes;
