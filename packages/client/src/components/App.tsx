import {hot} from 'react-hot-loader/root';
import React from 'react';

import Splash from 'components/Splash';
import {Provider as PhotoContextProvider} from 'contexts/photo';


const App: React.FunctionComponent = () => {
  return (
    <PhotoContextProvider>
      <Splash />
    </PhotoContextProvider>
  );
};


export default hot(App);
