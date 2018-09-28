import React from 'react';
import {hot} from 'react-hot-loader';
import Splash from 'components/splash';


const App = () => {
  return (
    <Splash
      href="https://images.unsplash.com/photo-1508550536558-5e8d33eb9a82?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=951db2a13920bd9932d773deaacbe7c3&auto=format&fit=crop&w=3588&q=80"
      location="Sekinchan, Malaysia"
      author="Fauzan Saari"
      authorHref="https://unsplash.com/photos/pZXg_ObLOM4"
    />
  );
};


export default hot(module)(App);
