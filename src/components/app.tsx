import {DateTime} from 'luxon';
import React from 'react';
import {hot} from 'react-hot-loader';

import images from 'etc/images';
import Splash from 'components/splash';

const App = () => {
  // Get the current day of the year. (0 - 364)
  const today = DateTime.local().ordinal;

  // Cycle through images each day based on the current day of year.
  const {href, location, author, authorHref} = images[today % images.length];

  return (
    <Splash
      href={href}
      location={location}
      author={author}
      authorHref={authorHref}
    />
  );
};


export default hot(module)(App);
