import '@babel/polyfill';
import React from 'react';
// @ts-ignore
import ReactDOM from '@hot-loader/react-dom';

import Splash from 'components/splash';
import {Provider as TestContextProvider} from 'contexts/photo';
import globalStyles from 'etc/global-style';
import printReadme from 'lib/readme';
import setTitle from 'lib/title';


// Global init.
setTitle();
globalStyles();
printReadme();


// tslint:disable-next-line no-var-requires
ReactDOM.render(<TestContextProvider><Splash /></TestContextProvider>, document.getElementById('root'));
