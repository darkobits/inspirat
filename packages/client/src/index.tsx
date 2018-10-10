import '@babel/polyfill';
import React from 'react';
import ReactDOM from 'react-dom';

import App from 'components/app';
import globalStyles from 'etc/global-style';
import printReadme from 'lib/readme';
import setTitle from 'lib/title';


setTitle();
globalStyles();
printReadme();

ReactDOM.render(<App />, document.getElementById('root'));
