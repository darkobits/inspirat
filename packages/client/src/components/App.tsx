import {hot} from 'react-hot-loader/root';
import React from 'react';

import Introduction from 'components/Introduction';
import Settings from 'components/Settings';
import Splash from 'components/Splash';
import { Provider as PhotoContextProvider } from 'contexts/photo';
import { isChromeExtension, onClickAndHold } from 'lib/utils';


const App: React.FunctionComponent = () => {
  const [showSettings, setShowSettings] = React.useState(false);

  const handleShowSettings = React.useCallback(() => {
    setShowSettings(true);
  }, []);

  const handleHideSettings = React.useCallback(() => {
    setShowSettings(false);
  }, []);

  return (
    <PhotoContextProvider>
      {isChromeExtension && <Introduction />}
      <Settings
        show={showSettings}
        onClose={handleHideSettings}
      />
      <Splash
        onMouseDown={onClickAndHold(750, handleShowSettings)}
      />
    </PhotoContextProvider>
  );
};


export default hot(App);
