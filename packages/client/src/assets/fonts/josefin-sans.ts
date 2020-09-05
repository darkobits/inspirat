import { css } from 'linaria';

import josefinSansBold from './josefin-sans-bold.woff';
import josefinSansBoldItalic from './josefin-sans-bold-italic.woff';
import josefinSansSemiBold from './josefin-sans-semi-bold.woff';
import josefinSansSemiBoldItalic from './josefin-sans-semi-bold-italic.woff';
import josefinSansRegular from './josefin-sans-regular.woff';
import josefinSansItalic from './josefin-sans-italic.woff';
import josefinSansLight from './josefin-sans-light.woff';
import josefinSansLightItalic from './josefin-sans-light-italic.woff';
import josefinSansThin from './josefin-sans-thin.woff';
import josefinSansThinItalic from './josefin-sans-thin-italic.woff';


export default css`
  @font-face {
    font-family: 'Josefin Sans';
    font-style: normal;
    font-weight: 700;
    font-display: block;
    src: url(${josefinSansBold}) format('woff');
  }

  @font-face {
    font-family: 'Josefin Sans';
    font-style: italic;
    font-weight: 700;
    font-display: block;
    src: url(${josefinSansBoldItalic}) format('woff');
  }

  @font-face {
    font-family: 'Josefin Sans';
    font-style: normal;
    font-weight: 600;
    font-display: block;
    src: url(${josefinSansSemiBold}) format('woff');
  }

  @font-face {
    font-family: 'Josefin Sans';
    font-style: italic;
    font-weight: 600;
    font-display: block;
    src: url(${josefinSansSemiBoldItalic}) format('woff');
  }

  @font-face {
    font-family: 'Josefin Sans';
    font-style: normal;
    font-weight: 400;
    font-display: block;
    src: url(${josefinSansRegular}) format('woff');
  }

  @font-face {
    font-family: 'Josefin Sans';
    font-style: italic;
    font-weight: 400;
    font-display: block;
    src: url(${josefinSansItalic}) format('woff');
  }

  @font-face {
    font-family: 'Josefin Sans';
    font-style: normal;
    font-weight: 300;
    font-display: block;
    src: url(${josefinSansLight}) format('woff');
  }

  @font-face {
    font-family: 'Josefin Sans';
    font-style: italic;
    font-weight: 300;
    font-display: block;
    src: url(${josefinSansLightItalic}) format('woff');
  }

  @font-face {
    font-family: 'Josefin Sans';
    font-style: normal;
    font-weight: 200;
    font-display: block;
    src: url(${josefinSansThin}) format('woff');
  }

  @font-face {
    font-family: 'Josefin Sans';
    font-style: italic;
    font-weight: 200;
    font-display: block;
    src: url(${josefinSansThinItalic}) format('woff');
  }
`;
