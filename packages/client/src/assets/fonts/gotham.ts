import { css } from 'linaria';

import gothamBlackWoff from './gotham-black.woff';
import gothamBlackWoff2 from './gotham-black.woff2';
import gothamBoldWoff from './gotham-bold.woff';
import gothamBoldWoff2 from './gotham-bold.woff2';
import gothamLightWoff from './gotham-light.woff';
import gothamLightWoff2 from './gotham-light.woff2';
import gothamThinWoff from './gotham-thin.woff';
import gothamThinWoff2 from './gotham-thin.woff2';
import gothamExtraLightWoff from './gotham-extra-light.woff';
import gothamExtraLightWoff2 from './gotham-extra-light.woff2';

export default css`
  @font-face {
    font-family: 'Gotham';
    font-style: normal;
    font-weight: 800;
    src: url(${gothamBlackWoff2}) format('woff2'), url(${gothamBlackWoff}) format('woff');
  }

  @font-face {
    font-family: 'Gotham';
    font-style: normal;
    font-weight: 700;
    src: url(${gothamBoldWoff2}) format('woff2'), url(${gothamBoldWoff}) format('woff');
  }

  @font-face {
    font-family: 'Gotham';
    font-style: normal;
    font-weight: 400;
    src: url(${gothamLightWoff2}) format('woff2'), url(${gothamLightWoff}) format('woff');
  }

  @font-face {
    font-family: 'Gotham';
    font-style: normal;
    font-weight: 200;
    src: url(${gothamExtraLightWoff2}) format('woff2'), url(${gothamExtraLightWoff}) format('woff');
  }

  @font-face {
    font-family: 'Gotham';
    font-style: normal;
    font-weight: 100;
    src: url(${gothamThinWoff2}) format('woff2'), url(${gothamThinWoff}) format('woff');
  }
`;
