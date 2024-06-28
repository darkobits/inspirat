import { globalStyle, style, keyframes as defineKeyframes } from '@vanilla-extract/css';

import { FontDisplayVariable, FontText } from 'web/etc/fonts.css';

export const FONT_FALLBACKS = '-apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif';
export const FONT_FAMILY_FANCY = `"Josefin Sans", ${FontDisplayVariable}, ${FONT_FALLBACKS}`;
export const FONT_FAMILY_DISPLAY = `${FontDisplayVariable}, ${FONT_FALLBACKS}`;
export const FONT_FAMILY_SANS = `${FontText}, ${FONT_FALLBACKS}`;

// ----- Shared Global Classes -------------------------------------------------

export const keyframes = {
  blurIn: defineKeyframes({
    '0%': {
      filter: 'blur(12px)',
      opacity: 0
    },
    '100%': {
      filter: 'blur(0px)',
      opacity: 1
    }
  }),
  blurOut: defineKeyframes({
    '0%': {
      filter: 'blur(0px)',
      opacity: 1
    },
    '100%': {
      filter: 'blur(12px)',
      opacity: 0
    }
  })

};

/**
 * CSS classes that define their own keyframes and provide additional
 * animation configuration.
 */
export const animations = {
  spin: style({
    animationName: defineKeyframes({
      from: {
        transform: 'rotate(0deg)'
      },
      to: {
        transform: 'rotate(360deg)'
      }
    }),
    animationDuration: '1.2s',
    animationIterationCount: 'infinite',
    animationTimingFunction: 'cubic-bezier(.6,-0.3,.3,1.3)'
  })
};

/**
 * Applies enough padding for an element to ensure its content is rendered in
 * the safe area.
 */
globalStyle('.safe-padding', {
  paddingTop: 'env(safe-area-inset-top, 0px)',
  paddingBottom: 'env(safe-area-inset-bottom, 0px)',
  paddingLeft: 'env(safe-area-inset-left, 0px)',
  paddingRight: 'env(safe-area-inset-right, 0px)'
});

/**
 * Applies enough margin to an element to ensure it is rendered in the safe
 * area.
 */
globalStyle('.safe-margins', {
  marginTop: 'env(safe-area-inset-top, 0px)',
  marginBottom: 'env(safe-area-inset-bottom, 0px)',
  marginLeft: 'env(safe-area-inset-left, 0px)',
  marginRight: 'env(safe-area-inset-right, 0px)'
});

// ----- Global Style ----------------------------------------------------------

globalStyle('*, *:before, *:after', {
  overscrollBehavior: 'none'
});

globalStyle(':root', {
  vars: {
    '--font-family-display': FONT_FAMILY_DISPLAY,
    '--font-family-fancy': FONT_FAMILY_FANCY,
    '--font-family-sans': FONT_FAMILY_SANS
  },
  height: '100%'
});

globalStyle('body', {
  backgroundColor: 'var(--color-slate-950)',
  height: '100%'
});

globalStyle('a, a:hover', {
  color: 'inherit',
  textDecoration: 'none'
});

globalStyle('#root', {
  position: 'fixed',
  height: '100%',
  width: '100%',
  display: 'flex',
  flexDirection: 'column'
});

globalStyle('vite-plugin-checker-error-overlay', {
  display: 'none'
});
