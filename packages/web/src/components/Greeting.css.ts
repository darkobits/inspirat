import { style, createVar, globalStyle } from '@vanilla-extract/css';


export const vars = {
  greetingWrapper: {
    // color: createVar(),
    opacity: createVar()
  },
  greetingBackground: {
    color: createVar(),
    filter: createVar(),
    textShadow: createVar()
  }
};

const classes = {
  greetingWrapper: style({
    color: 'white',
    opacity: vars.greetingWrapper.opacity,
    fontFamily: '"Josefin Sans", -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif',
    fontSize: '28px',
    fontWeight: 200,
    height: '100%',
    marginBottom: '128px',
    pointerEvents: 'none',
    position: 'relative',
    userSelect: 'none',
    width: '100%',
    transitionProperty: 'all',
    transitionDuration: '1.2s',
    transitionTimingFunction: 'ease-in-out',
    transitionDelay: '0s',

    '@media': {
      '(min-width: 520px)': {
        fontSize: '38px'
      },
      '(min-width: 640px)': {
        fontSize: '52px'
      },
      '(min-width: 760px)': {
        fontSize: '64px'
      },
      '(min-width: 860px)': {
        fontSize: '72px'
      },
      '(min-width: 940px)': {
        fontSize: '80px'
      },
      '(min-width: 1120px)': {
        fontSize: '96px'
      }
    }
  }),
  greetingBackground: style({
    alignItems: 'center',
    color: vars.greetingBackground.color,
    display: 'flex',
    filter: vars.greetingBackground.filter,
    height: '100%',
    justifyContent: 'center',
    position: 'absolute',
    textShadow: vars.greetingBackground.textShadow,
    width: '100%',
    zIndex: 0
    /* mix-blend-mode: color-burn; */
  }),
  greetingForeground: style({
    alignItems: 'center',
    color: 'inherit',
    display: 'flex',
    height: '100%',
    justifyContent: 'center',
    position: 'absolute',
    width: '100%',
    textShadow: '0px 0px 2px rgba(0, 0, 0, 0.8)',
    zIndex: 1
  })
};

globalStyle(`${classes.greetingWrapper} *`, {
  fontFamily: 'inherit',
  fontSize: 'inherit',
  fontWeight: 'inherit',
  letterSpacing: 'inherit',
  lineHeight: 'inherit',
  pointerEvents: 'inherit'
});


export default classes;
