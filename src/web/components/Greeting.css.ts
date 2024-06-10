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
    fontSize: 'clamp(1.5rem, 0.8308rem + 4.3077vw, 6rem)',
    lineHeight: '1.24em',
    textAlign: 'center',

    borderWidth: '1px',
    borderStyle: 'solid',
    borderRadius: '0.42em',

    // Adds additional contrast to text.
    backgroundColor: 'rgba(0, 0, 0, 0.12)',

    backdropFilter: 'blur(8px)',
    boxShadow: '0px 0px 12px rgba(0, 0, 0, 0.12)',
    userSelect: 'none',

    // Shifts the greeting upwards a bit, but we don't want to do this in mobile
    // landscape, where vertical space is limited.
    marginBottom: '42px',
    '@media': { '(pointer: coarse) and (orientation: landscape)': { marginBottom: 0 } },

    // Needed in Mobile Safari or the greeting will not be visible.
    position: 'relative', zIndex: 1
  })
};
