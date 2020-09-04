import {hot} from 'react-hot-loader/root';
import React from 'react';

import Splash from 'components/Splash';
import Settings from 'components/Settings';
import { Provider as PhotoContextProvider } from 'contexts/photo';

type GenericFunction = (...args: Array<any>) => any;

const onClickAndHold = (threshold: number, cb: GenericFunction) => (e: React.MouseEvent) => {
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

  const handleClickAndHold = React.useCallback(() => {
    setShowSettings(true);
  }, []);

  return (
    <PhotoContextProvider>
      <Settings
        show={showSettings}
        onClose={() => setShowSettings(false)}
      />
      <Splash
        onMouseDown={onClickAndHold(750, handleClickAndHold)}
      />
    </PhotoContextProvider>
  );
};


export default hot(App);
