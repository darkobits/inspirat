import { render } from '@darkobits/tsx/lib/runtime';
import 'animate.css/animate.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import App from 'web/components/App';
import 'web/etc/global-styles.css';
import 'web/etc/service-worker';
import log from 'web/lib/log';

render('#root', <App />);
log.debug('🔖 •', import.meta.env.GIT_DESC);
