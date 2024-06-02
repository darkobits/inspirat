import { style, globalStyle } from '@vanilla-extract/css';

const classes = {
  greetingWrapper: style({
    color: 'white',
    // opacity: vars.greetingWrapper.opacity,
    fontFamily: '"Josefin Sans", -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif',
    fontSize: 'clamp(1.8rem, 0.8308rem + 4.3077vw, 6rem)',
    lineHeight: '1.2em',
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 200,
    height: '100%',
    // marginBottom: '128px',
    marginBottom: '32px',
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
    alignItems: 'center',
    display: 'flex',
    height: 'min-content',
    justifyContent: 'center',
    position: 'absolute',
    width: 'max-content',
    zIndex: 0,
    mixBlendMode: 'plus-lighter',
    backdropFilter: 'blur(16px)',
    boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.12)',
    borderRadius: '1rem',
    paddingTop: '32px',
    paddingLeft: '32px',
    paddingRight: '32px',
    paddingBottom: '12px'
    // border: '1px solid red'
    // background: `radial-gradient(
    //   circle at center,
    //   transparent 0%,
    //   rgba(0, 0, 0, 1) 100%
    // );`
    /* mix-blend-mode: color-burn; */
  }),
  greetingForeground: style({
    borderRadius: '1rem',
    borderWidth: '1px',
    borderStyle: 'solid',
    alignItems: 'center',
    paddingTop: '32px',
    paddingLeft: '32px',
    paddingRight: '32px',
    paddingBottom: '12px',
    color: 'inherit',
    display: 'flex',
    height: 'min-content',
    justifyContent: 'center',
    position: 'absolute',
    width: 'max-content',
    // textShadow: '0px 0px 2px rgba(0, 0, 0, 0.8)',
    zIndex: 1
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
