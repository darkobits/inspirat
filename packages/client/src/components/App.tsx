import React from 'react';

import DevTools from 'components/DevTools';
import Introduction from 'components/Introduction';
import Settings from 'components/Settings';
import Splash from 'components/Splash';
import { Provider as InspiratContextProvider } from 'contexts/Inspirat';
import { onClickAndHold } from 'lib/utils';


const App: React.FunctionComponent = () => {
  const [showSettings, setShowSettings] = React.useState(false);

  return (
    <InspiratContextProvider>
      <DevTools />
      <Introduction />
      <Settings
        show={showSettings}
        onClose={() => setShowSettings(false)}
      />
      <Splash
        onMouseDown={onClickAndHold(750, () => setShowSettings(true))}
      />
    </InspiratContextProvider>
  );
};


export default App;
