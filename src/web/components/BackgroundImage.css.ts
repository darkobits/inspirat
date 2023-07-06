import { style, createVar } from '@vanilla-extract/css';


export const vars = {
  backgroundImageWrapper: {
    backdropFilter: createVar(),
    backgroundColor: createVar(),
    backgroundImage: createVar(),
    backgroundPosition: createVar(),
    opacity: createVar(),
    transitionDuration: createVar(),
    transitionTimingFunction: createVar(),
    transform: createVar()
  }
};

export default {
  /**
   * Renders a full-screen background image
   */
  backgroundImageWrapper: style({
    backgroundAttachment: 'fixed',
    backgroundImage: vars.backgroundImageWrapper.backgroundImage,
    backgroundPosition: vars.backgroundImageWrapper.backgroundPosition,
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    bottom: 0,
    display: 'block',
    left: 0,
    opacity: vars.backgroundImageWrapper.opacity,
    pointerEvents: 'none',
    position: 'fixed',
    right: 0,
    top: 0,
    transform: vars.backgroundImageWrapper.transform,
    transitionDuration: vars.backgroundImageWrapper.transitionDuration,
    transitionProperty: 'opacity',
    transitionTimingFunction: vars.backgroundImageWrapper.transitionTimingFunction,
    zIndex: 0

    // TODO: This isn't working, fix later.
    // '::after': {
    //   content: ' ',
    //   backdropFilter: vars.backgroundImageWrapper.backdropFilter,
    //   backgroundColor: vars.backgroundImageWrapper.backgroundColor,
    //   bottom: 0,
    //   height: '48em',
    //   left: 0,
    //   maskImage:
    //     'radial-gradient(ellipse at center, black 20%, transparent 70%)',
    //   maskRepeat: 'no-repeat',
    //   maskSize: 'contain',
    //   position: 'absolute',
    //   right: 0,
    //   top: 'calc(50vh - 24em - 64px)',
    //   // top: 0,
    //   width: '100%'
    // }
  })
};
