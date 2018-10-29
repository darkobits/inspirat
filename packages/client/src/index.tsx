import '@babel/polyfill';
import React from 'react';
import ReactDOM from 'react-dom';

import Splash from 'components/splash';
import globalStyles from 'etc/global-style';
import printReadme from 'lib/readme';
import setTitle from 'lib/title';

// Global init.
setTitle();
globalStyles();
printReadme();

ReactDOM.render(<Splash />, document.getElementById('root'));
