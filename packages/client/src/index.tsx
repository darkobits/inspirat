import React from 'react';
import ReactDOM from 'react-dom';

import App from 'components/App';
import 'etc/global-styles';
import printReadme from 'lib/readme';
import setTitle from 'lib/title';


// Global init.
setTitle();
printReadme();


ReactDOM.render(<App />, document.querySelector('#root'));
