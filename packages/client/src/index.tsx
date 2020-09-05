import 'etc/global-styles';

import React from 'react';
import ReactDOM from 'react-dom';

import App from 'components/App';
import setTitle from 'lib/title';

// Global init.
setTitle();

ReactDOM.render(<App />, document.querySelector('#root'));
