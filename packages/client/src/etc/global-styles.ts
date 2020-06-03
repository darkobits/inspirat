import {css} from 'linaria';

import JosefinSansBold from 'assets/fonts/JosefinSans-Bold.woff';
import JosefinSansBoldItalic from 'assets/fonts/JosefinSans-BoldItalic.woff';
import JosefinSansSemiBold from 'assets/fonts/JosefinSans-SemiBold.woff';
import JosefinSansSemiBoldItalic from 'assets/fonts/JosefinSans-SemiBoldItalic.woff';
import JosefinSansRegular from 'assets/fonts/JosefinSans-Regular.woff';
import JosefinSansItalic from 'assets/fonts/JosefinSans-Italic.woff';
import JosefinSansLight from 'assets/fonts/JosefinSans-Light.woff';
import JosefinSansLightItalic from 'assets/fonts/JosefinSans-LightItalic.woff';
import JosefinSansThin from 'assets/fonts/JosefinSans-Thin.woff';
import JosefinSansThinItalic from 'assets/fonts/JosefinSans-ThinItalic.woff';


export default css`
  @font-face {
    font-family: 'Josefin Sans';
    font-style: normal;
    font-weight: 700;
    font-display: block;
    src: url('${JosefinSansBold}') format('woff');
  }

  @font-face {
    font-family: 'Josefin Sans';
    font-style: italic;
    font-weight: 700;
    font-display: block;
    src: url('${JosefinSansBoldItalic}') format('woff');
  }

  @font-face {
    font-family: 'Josefin Sans';
    font-style: normal;
    font-weight: 600;
    font-display: block;
    src: url('${JosefinSansSemiBold}') format('woff');
  }

  @font-face {
    font-family: 'Josefin Sans';
    font-style: italic;
    font-weight: 600;
    font-display: block;
    src: url('${JosefinSansSemiBoldItalic}') format('woff');
  }

  @font-face {
    font-family: 'Josefin Sans';
    font-style: normal;
    font-weight: 400;
    font-display: block;
    src: url('${JosefinSansRegular}') format('woff');
  }

  @font-face {
    font-family: 'Josefin Sans';
    font-style: italic;
    font-weight: 400;
    font-display: block;
    src: url('${JosefinSansItalic}') format('woff');
  }

  @font-face {
    font-family: 'Josefin Sans';
    font-style: normal;
    font-weight: 300;
    font-display: block;
    src: url('${JosefinSansLight}') format('woff');
  }

  @font-face {
    font-family: 'Josefin Sans';
    font-style: italic;
    font-weight: 300;
    font-display: block;
    src: url('${JosefinSansLightItalic}') format('woff');
  }

  @font-face {
    font-family: 'Josefin Sans';
    font-style: normal;
    font-weight: 200;
    font-display: block;
    src: url('${JosefinSansThin}') format('woff');
  }

  @font-face {
    font-family: 'Josefin Sans';
    font-style: italic;
    font-weight: 200;
    font-display: block;
    src: url('${JosefinSansThinItalic}') format('woff');
  }

  :global(html) {
    height: 100%;
    margin: 0;
    padding: 0;
    width: 100%;

    * {
      box-sizing: border-box;
      color: white;
      font-family: Josefin Sans, -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif;
      font-weight: 300;
      font-size: 16px;
    }

    body {
      height: 100%;
      margin: 0;
      padding: 0;
      width: 100%;
    }

    a {
      text-decoration: none;
    }

    #root {
      background-color: rgb(42, 42, 42);
      height: 100%;
    }
  }
`;
