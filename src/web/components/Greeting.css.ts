import { style } from '@vanilla-extract/css';

import { FONT_FAMILY_FANCY } from 'web/etc/global-styles.css';

export default {
  greeting: style({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    flexShrink: 1,

    height: 'min-content',
    minWidth: 'min-content',

    paddingTop: '0.6em',
    paddingLeft: '0.7em',
    paddingRight: '0.7em',
    paddingBottom: '0.4em',

    fontFamily: FONT_FAMILY_FANCY,

    // 2rem @ 400px wide -> 4rem @ 1200px wide
    // See: https://www.marcbacon.com/tools/clamp-calculator/
    fontSize: 'clamp(2rem, 1rem + 4vw, 4rem)',
    lineHeight: '1.24em',
    textAlign: 'center',

    borderWidth: '1px',
    borderStyle: 'solid',
    borderRadius: '0.42em',

    // Adds additional contrast to text.
    backgroundColor: 'rgba(0, 0, 0, 0.12)',

    backdropFilter: 'blur(10px)',
    boxShadow: '0px 0px 12px rgba(0, 0, 0, 0.12)',
    userSelect: 'none',

    // Most of the time, these margins will not be used. But on a very narrow
    // viewport, it will prevent the greeting container from touching the edges
    // of the screen as long as
    marginLeft: '0.64rem',
    marginRight: '0.64rem',

    // Shifts the greeting upwards a bit, but we don't want to do this in mobile
    // landscape, where vertical space is limited.
    marginBottom: '42px',
    '@media': { '(pointer: coarse) and (orientation: landscape)': { marginBottom: 0 } },

    // Needed in Mobile Safari or the greeting will not be visible.
    position: 'relative', zIndex: 1
  })
};
