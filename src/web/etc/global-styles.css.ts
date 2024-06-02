import { globalStyle } from '@vanilla-extract/css';

const FONT_FAMILY_PLAIN = '-apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif';
const FONT_FAMILY_FANCY = `"Josefin Sans", ${FONT_FAMILY_PLAIN} !important`;
const FONT_FAMILY_SANS_SERIF = `"Raleway", ${FONT_FAMILY_PLAIN} !important`;

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
  backgroundColor: 'rgb(42, 42, 42)',
  fontFamily: FONT_FAMILY_SANS_SERIF,
  height: '100%',
  letterSpacing: '0.04em',
  lineHeight: '1.8em',
  margin: 0,
  padding: 0,
  width: '100%'
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
  backgroundColor: 'rgb(42, 42, 42)',
  height: '100%'
});
