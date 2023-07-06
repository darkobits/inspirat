import React from 'react';
import { Helmet } from 'react-helmet';

import { Introduction } from 'web/components/Introduction';
import { Settings } from 'web/components/Settings';
import { Splash } from 'web/components/Splash';
import { DevTools } from 'web/components/dev-tools/DevTools';
import { TITLE } from 'web/etc/constants';
import { onClickAndHold } from 'web/lib/utils';


const App: React.FunctionComponent = () => {
  const [showSettings, setShowSettings] = React.useState(false);

  return (<>
    <Helmet>
      <title>{TITLE}</title>
    </Helmet>
    <DevTools />
    <Introduction />
    <Settings
      show={showSettings}
      onClose={() => setShowSettings(false)}
    />
    <Splash
      onMouseDown={onClickAndHold(320, () => setShowSettings(true))}
    />
  </>);
};


export default App;
