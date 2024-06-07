import { globalStyle } from '@vanilla-extract/css';

export const FONT_FAMILY_PLAIN = '-apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif';
export const FONT_FAMILY_FANCY = `"Josefin Sans", ${FONT_FAMILY_PLAIN}`;
export const FONT_FAMILY_SANS_SERIF = `"Raleway", ${FONT_FAMILY_PLAIN}`;

// ----- Shared Global Classes -------------------------------------------------

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
  boxSizing: 'border-box',
  fontFamily: 'inherit',
  fontSize: 'inherit',
  fontWeight: 'inherit',
  letterSpacing: 'inherit',
  lineHeight: 'inherit',
  textRendering: 'optimizeLegibility',
  WebkitFontSmoothing: 'antialiased',
  MozOsxFontSmoothing: 'grayscale'
});

globalStyle('html, body', {
  display: 'flex',
  flexDirection: 'column',
  // backgroundColor: 'rgb(42, 42, 42)',
  backgroundColor: 'rgb(12, 12, 12)',
  fontFamily: FONT_FAMILY_SANS_SERIF,
  // height: '100vh',
  letterSpacing: '0.04em',
  lineHeight: '1.8em',
  margin: 0,
  padding: 0,
  height: '100vh',
  width: '100vw',
  userSelect: 'none',
  position: 'relative'
});

globalStyle('a, a:hover', {
  color: 'inherit',
  textDecoration: 'none'
});

// Gotham requires some slight padding tweaks to achieve vertical centering in
// inputs.
globalStyle('input.form-control', {
  padding: '0.375rem 0.7rem 0.4rem 0.7rem'
});

globalStyle('input.form-control.form-control-lg', {
  padding: '0.5rem 0.8rem 0.6rem 0.8rem'
});

globalStyle('h1, h2, h3, h4, h5, h6', {
  fontFamily: FONT_FAMILY_FANCY,
  lineHeight: '1em'
});

globalStyle('.text-plain', {
  fontFamily: FONT_FAMILY_PLAIN
});

globalStyle('.text-fancy', {
  fontFamily: FONT_FAMILY_FANCY
});

globalStyle('#root', {
  // backgroundColor: 'rgb(42, 42, 42)',
  border: '1px solid red',
  flexGrow: 1
});

globalStyle('vite-plugin-checker-error-overlay', {
  display: 'none'
});
