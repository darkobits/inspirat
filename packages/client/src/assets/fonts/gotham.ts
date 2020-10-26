import { css } from 'linaria';


export default css`
  @font-face {
    font-family: 'Gotham';
    font-style: normal;
    font-weight: 800;
    src: url('./gotham-black.woff2') format('woff2'), url('./gotham-black.woff') format('woff');
  }

  @font-face {
    font-family: 'Gotham';
    font-style: normal;
    font-weight: 700;
    src: url('./gotham-bold.woff2') format('woff2'), url('./gotham-bold.woff') format('woff');
  }

  @font-face {
    font-family: 'Gotham';
    font-style: normal;
    font-weight: 400;
    src: url('./gotham-light.woff2') format('woff2'), url('./gotham-light.woff') format('woff');
  }

  @font-face {
    font-family: 'Gotham';
    font-style: normal;
    font-weight: 200;
    src: url('./gotham-extra-light.woff2') format('woff2'), url('./gotham-extra-light.woff') format('woff');
  }

  @font-face {
    font-family: 'Gotham';
    font-style: normal;
    font-weight: 100;
    src: url('./gotham-thin.woff2') format('woff2'), url('./gotham-thin.woff') format('woff');
  }
`;
