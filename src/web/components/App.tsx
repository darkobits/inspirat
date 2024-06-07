import ms from 'ms';
import React from 'react';
import { Helmet } from 'react-helmet';

import { Introduction } from 'web/components/Introduction';
import { Settings } from 'web/components/Settings';
import { Splash } from 'web/components/Splash';
import { DevTools } from 'web/components/dev-tools/DevTools';
import { InspiratProvider } from 'web/contexts/Inspirat';
import { TITLE } from 'web/etc/constants';
import { onClickAndHold, clearSelections } from 'web/lib/utils';

export default function App() {
  const [showSettings, setShowSettings] = React.useState(false);

  const handleClickOrTap = React.useCallback(onClickAndHold(ms('1s'), () => {
    clearSelections();
    setShowSettings(true);
  }), []);

  return (
    <React.StrictMode>
      <InspiratProvider>
        <Helmet>
          <title>{TITLE}</title>
        </Helmet>
        <Settings
          show={showSettings}
          onClose={() => setShowSettings(false)}
        />
        <Splash
          onMouseDown={handleClickOrTap}
          onTouchStart={handleClickOrTap}
        />
        <DevTools />
        <Introduction />
      </InspiratProvider>
    </React.StrictMode>
  );
}
