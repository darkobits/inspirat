import 'web/etc/tailwind.css';
import 'web/etc/service-worker';

import { render } from '@darkobits/tsx/lib/runtime';
import '@fontsource/josefin-sans/100.css';
import '@fontsource/josefin-sans/200.css';
import '@fontsource/josefin-sans/300.css';
import '@fontsource/josefin-sans/400.css';
import '@fontsource/josefin-sans/500.css';
import '@fontsource/josefin-sans/600.css';
import '@fontsource/josefin-sans/700.css';
import 'animate.css/animate.min.css';
import 'web/etc/global-styles.css';

import App from 'web/components/App';
import log from 'web/lib/log';

render('#root', <App />);
log.debug('🔖 •', import.meta.env.GIT_DESC);
