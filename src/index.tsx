import '@babel/polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import globalStyles from 'etc/global-style';
import App from 'components/app';


globalStyles();
ReactDOM.render(<App />, document.getElementById('root'));
