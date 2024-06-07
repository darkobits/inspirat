import { style } from '@vanilla-extract/css';

import { FONT_FAMILY_FANCY } from 'web/etc/global-styles.css';

const classes = {
  greetingWrapper: style({
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    userSelect: 'none',
    padding: '10px 18px',
    // Needed in Mobile Safari or the greeting will not be visible.
    position: 'relative', zIndex: 1
  }),
  greeting: style({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    height: 'min-content',
    textAlign: 'center',
    paddingTop: '38px',
    paddingLeft: '42px',
    paddingRight: '42px',
    paddingBottom: '24px',
    marginBottom: '42px',
    fontFamily: FONT_FAMILY_FANCY,
    fontSize: 'clamp(1.5rem, 0.8308rem + 4.3077vw, 6rem)',
    lineHeight: '1.2em',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderRadius: '24px',
    backgroundColor: 'rgba(80, 80, 80, 0.12)',
    backdropFilter: 'blur(12px)',
    boxShadow: '0px 0px 24px rgba(0, 0, 0, 0.12)'
  })
};

export default classes;
