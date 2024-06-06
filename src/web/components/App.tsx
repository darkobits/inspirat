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
          onMouseDown={onClickAndHold(250, () => {
            clearSelections();
            setShowSettings(true);
          })}
        />
        <DevTools />
        <Introduction />
      </InspiratProvider>
    </React.StrictMode>
  );
}
