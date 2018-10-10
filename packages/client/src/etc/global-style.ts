import {injectGlobal} from 'emotion';
import {buildFontFamilyString} from 'lib/typography';


export default () => injectGlobal`
  * {
    box-sizing: border-box;
    color: white;
    font-family: ${buildFontFamilyString('Josefin Sans')};
    font-weight: 300;
    font-size: 16px;
  }

  a {
    text-decoration: none;
  }

  html,
  body,
  #root {
    background-color: rgb(42, 42, 42);
    height: 100%;
    margin: 0;
    overflow: hidden;
    padding: 0;
    width: 100%;
  }
`;
