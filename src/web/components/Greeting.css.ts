import { style, globalStyle } from '@vanilla-extract/css';

const borderRadius = '24px';
const paddingTop = '32px';
const paddingLeft = '32px';
const paddingBottom = '12px';
const paddingRight = '32px';

const classes = {
  greetingWrapper: style({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    // opacity: vars.greetingWrapper.opacity,
    fontFamily: '"Josefin Sans", -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif',
    fontSize: 'clamp(1.8rem, 0.8308rem + 4.3077vw, 6rem)',
    lineHeight: '1.2em',
    textAlign: 'center',
    height: '100%',
    // marginBottom: '128px',
    marginBottom: '64px',
    pointerEvents: 'none',
    position: 'relative',
    userSelect: 'none',
    width: '100%',
    transitionProperty: 'opacity',
    transitionDuration: '1.2s',
    transitionTimingFunction: 'ease-in-out',
    transitionDelay: '0s'
  }),
  greetingBackground: style({
    position: 'absolute',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: 'min-content',
    width: 'max-content',
    zIndex: 0,
    mixBlendMode: 'plus-lighter',
    backdropFilter: 'blur(12px)',
    boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.12)',
    borderRadius,
    paddingTop,
    paddingLeft,
    paddingRight,
    paddingBottom
  }),
  greetingForeground: style({
    position: 'absolute',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: '1px',
    borderStyle: 'solid',
    height: 'min-content',
    width: 'max-content',
    zIndex: 1,
    borderRadius,
    paddingTop,
    paddingLeft,
    paddingRight,
    paddingBottom
  })
};

globalStyle(`${classes.greetingWrapper} *`, {
  fontFamily: 'inherit',
  fontSize: 'inherit',
  fontWeight: 500,
  letterSpacing: 'inherit',
  lineHeight: 'inherit',
  pointerEvents: 'inherit'
});

export default classes;
