import {styled} from 'linaria/react';
import {rgba} from 'polished';
import * as R from 'ramda';
import React from 'react';

import PhotoContext from 'contexts/photo';
import {getPeriodDescriptor} from 'lib/time';
import {compositeTextShadow} from 'lib/typography';


// ----- Styles ----------------------------------------------------------------

export interface StyledSplashMidProps {
  color: string;
  opacity: number;
}

/**
 * Returns a compound text-shadow string based on the swatch color for the
 * current photo.
 */
const textShadow = (color: string) => compositeTextShadow([
  [0, 0, 2, rgba(0, 0, 0, 1)],
  [0, 0, 32, rgba(color, 0.3)],
  [0, 0, 96, rgba(color, 0.6)]
]);

const SplashMidEl = styled.div<StyledSplashMidProps>`
  align-items: center;
  display: flex;
  flex-grow: 1;
  font-size: 28px;
  font-weight: 300;
  justify-content: center;
  letter-spacing: 1.5px;
  margin-bottom: 8px;
  padding-bottom: 1.2em;
  text-shadow: ${props => textShadow(props.color)};
  user-select: none;
  z-index: 1;

  opacity: ${R.prop('opacity')};
  transition: opacity 1.2s ease-in 0.4s;

  * {
    font-size: inherit;
    font-weight: inherit;
  }

  @media(min-width: 520px) {
    font-size: 38px;
  }

  @media(min-width: 640px) {
    font-size: 52px;
  }

  @media(min-width: 760px) {
    font-size: 64px;
  }

  @media(min-width: 860px) {
    font-size: 72px;
  }

  @media(min-width: 940px) {
    font-size: 80px;
  }

  @media(min-width: 1120px) {
    font-size: 96px;
  }
`;


// ----- Splash Mid ------------------------------------------------------------

const SplashMid: React.FunctionComponent = () => {
  const {currentPhoto, name} = React.useContext(PhotoContext);

  return (
    <SplashMidEl color={currentPhoto?.color ?? 'black'} opacity={currentPhoto ? 1 : 0}>
      {`Good ${getPeriodDescriptor()}${name ? `, ${name}` : ''}.`}
    </SplashMidEl>
  );
};


export default SplashMid;
