import React from 'react';
import { render } from '@darkobits/tsx/lib/runtime';

import App from 'components/App';

import 'animate.css/animate.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'etc/global-styles.css';
import 'etc/service-worker';

render('#root', <App />);
console.debug(`Version ${import.meta.env.GIT_DESC}.`);
