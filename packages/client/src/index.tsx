import 'bootstrap/dist/css/bootstrap.min.css';

import React from 'react';
import ReactDOM from 'react-dom';

import App from 'components/App';
import 'etc/global-styles';
import printReadme from 'etc/print-readme';
import setTitle from 'lib/title';


// Global init.
setTitle();
printReadme();


ReactDOM.render(<App />, document.querySelector('#root'));
