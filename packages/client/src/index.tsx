import React from 'react';
import ReactDOM from 'react-dom';

import Splash from 'components/splash';
import {Provider as PhotoContextProvider} from 'contexts/photo';
import 'etc/global-style.css';
import printReadme from 'lib/readme';
import setTitle from 'lib/title';


// Global init.
setTitle();
printReadme();


ReactDOM.render(<PhotoContextProvider><Splash /></PhotoContextProvider>, document.getElementById('root'));
