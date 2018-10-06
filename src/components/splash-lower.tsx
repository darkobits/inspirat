import {css} from 'react-emotion';
import React from 'react';

import ImageLocation from 'components/image-location';
import ImageAttribution from 'components/image-attribution';


// ----- Styles ----------------------------------------------------------------

const className = css`
  display: flex;
  justify-content: space-between;
  width: 100%;
  z-index: 1;
`;


// ----- Component -------------------------------------------------------------

const SplashLower: React.SFC = () => {
  return (
    <div className={className}>
      <ImageLocation />
      <ImageAttribution />
    </div>
  );
};


export default SplashLower;
