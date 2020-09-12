import {hot} from 'react-hot-loader/root';
import React from 'react';

import Introduction from 'components/Introduction';
import Settings from 'components/Settings';
import Splash from 'components/Splash';
import { Provider as PhotoContextProvider } from 'contexts/photo';

type GenericFunction = (...args: Array<any>) => any;

const onClickAndHold = (threshold: number, cb: GenericFunction) => (e: React.MouseEvent) => {
  // This was not a primary click, bail.
  if (e.button !== 0 || e.ctrlKey) {
    return;
  }

  const target = e.currentTarget;

  if (target) {
    const timeoutHandle = setTimeout(() => cb(target), threshold);

    const onMouseUp = () => {
      clearTimeout(timeoutHandle);
      target.removeEventListener('mouseup', onMouseUp);
    };

    target.addEventListener('mouseup', onMouseUp);
  }
};

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
      <Introduction />
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
