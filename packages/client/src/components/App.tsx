import React from 'react';
import { Helmet } from 'react-helmet';

import Introduction from 'components/Introduction';
import Settings from 'components/Settings';
import Splash from 'components/Splash';
import { DevTools } from 'components/dev-tools/DevTools';
import { TITLE } from 'etc/constants';
import { onClickAndHold } from 'lib/utils';


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
      onMouseDown={onClickAndHold(750, () => setShowSettings(true))}
    />
  </>);
};


export default App;
