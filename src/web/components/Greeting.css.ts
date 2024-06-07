import { style } from '@vanilla-extract/css';

import { FONT_FAMILY_FANCY } from 'web/etc/global-styles.css';

export default {
  greeting: style({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    height: 'min-content',
    minWidth: 'min-content',
    flexShrink: 1,
    textAlign: 'center',
    paddingTop: '0.5em',
    paddingLeft: '0.72em',
    paddingRight: '0.72em',
    paddingBottom: '0.4em',
    fontFamily: FONT_FAMILY_FANCY,
    fontSize: 'clamp(1.5rem, 0.8308rem + 4.3077vw, 6rem)',
    lineHeight: '1.24em',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderRadius: '0.42em',
    backgroundColor: 'rgba(80, 80, 80, 0.12)',
    backdropFilter: 'blur(12px)',
    boxShadow: '0px 0px 24px rgba(0, 0, 0, 0.12)',
    userSelect: 'none',
    // Needed in Mobile Safari or the greeting will not be visible.
    position: 'relative', zIndex: 1
  })
};
