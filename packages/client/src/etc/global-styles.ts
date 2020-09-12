import 'animate.css/animate.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import {css} from 'linaria';

import 'assets/fonts/gotham';
import 'assets/fonts/josefin-sans';


export default css`
  :global() {
    *, *:before, *:after {
      box-sizing: border-box;
      font-family: inherit;
      font-size: inherit;
      font-weight: inherit;
      text-rendering: optimizeLegibility;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    html, body {
      font-family: Gotham, -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif;
      height: 100%;
      margin: 0;
      padding: 0;
      width: 100%;
    }

    a {
      color: var(--light);
      text-shadow: 0px 0px 4px rgba(255, 255, 255, 0.2);
      text-decoration: none;
      transition: all 0.15s ease-in-out;

      &:hover {
        color: var(--light);
        text-decoration: none;
        text-shadow: 0px 0px 4px rgba(255, 255, 255, 1);
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

    #root {
      background-color: rgb(42, 42, 42);
      height: 100%;
    }
  }
`;
