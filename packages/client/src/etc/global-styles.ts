import 'animate.css/animate.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import { css } from '@linaria/core';

const FONT_FAMILY_PLAIN = '-apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif';
const FONT_FAMILY_FANCY = `"Josefin Sans", ${FONT_FAMILY_PLAIN} !important`;
const FONT_FAMILY_SANS_SERIF = `"Raleway", ${FONT_FAMILY_PLAIN} !important`;


export default css`
  @import url('https://fonts.googleapis.com/css2?family=Josefin+Sans:wght@100;200;300&family=Raleway:wght@200;300;400&display=swap');

  :global() {
    *, *:before, *:after {
      box-sizing: border-box;
      font-family: inherit;
      font-size: inherit;
      font-weight: inherit;
      letter-spacing: inherit;
      line-height: inherit;
      text-rendering: optimizeLegibility;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    html, body {
      font-family: ${FONT_FAMILY_SANS_SERIF};
      height: 100%;
      letter-spacing: 0.04em;
      line-height: 1.8em;
      margin: 0;
      padding: 0;
      width: 100%;
    }

    a {
      color: inherit;
      text-decoration: none;

      &:hover {
        color: inherit;
        text-decoration: none;
      }
    }

    /* Gotham requires some slight padding tweaks to achieve vertical centering in inputs. */
    input {
      &.form-control {
        padding: 0.375rem 0.7rem 0.4rem 0.7rem;
      }

      &.form-control.form-control-lg {
        padding: 0.5rem 0.8rem 0.6rem 0.8rem;
      }
    }

    h1, h2, h3, h4, h5, h6 {
      font-family: ${FONT_FAMILY_FANCY};
      line-height: 1em;
    }

    .text-plain {
      font-family: ${FONT_FAMILY_PLAIN};
    }

    .text-fancy {
      font-family: ${FONT_FAMILY_FANCY};
    }

    #root {
      background-color: rgb(42, 42, 42);
      height: 100%;
    }
  } // End :global()
`;
