import { render } from '@darkobits/tsx/lib/runtime';
import 'animate.css/animate.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import App from 'web/components/App';
import 'web/etc/global-styles.css';
import 'web/etc/service-worker';

render('#root', <App />);
console.debug(`Version ${import.meta.env.GIT_DESC}.`);
