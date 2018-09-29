import {injectGlobal} from 'emotion';


export default () => injectGlobal`
  * {
    box-sizing: border-box;
    color: white;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
    font-weight: 200;
    font-size: 14px;
  }

  a {
    text-decoration: none;
  }

  html,
  body,
  #root {
    background-color: rgb(5, 5, 5);
    height: 100%;
    margin: 0;
    padding: 0;
    width: 100%;
  }
`;
