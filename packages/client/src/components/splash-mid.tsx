import {styled} from 'linaria/react';
import {rgba} from 'polished';
import * as R from 'ramda';
import React, {FunctionComponent, useContext, useEffect, useState} from 'react';

import PhotoContext from 'contexts/photo';
import {getPeriodDescriptor} from 'lib/time';
import storage from 'lib/storage';
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

const StyledSplashMid = styled.div<StyledSplashMidProps>`
  align-items: center;
  display: flex;
  flex-grow: 1;
  font-size: 28px;
  font-weight: 300;
  justify-content: center;
  letter-spacing: 1.5px;
  margin-bottom: 8px;
  opacity: ${R.propOr(1, 'opacity')};
  padding-bottom: 1.2em;
  text-shadow: ${R.pipe(R.prop('color'), textShadow)};
  transition: opacity 1.2s ease-in 0.6s;
  user-select: none;
  z-index: 1;

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


// ----- Component -------------------------------------------------------------

const SplashMid: FunctionComponent = () => {
  const {currentPhoto} = useContext(PhotoContext);
  const [name, setName] = useState('');

  /**
   * Asynchronously fetches the user's name from local storage and set it using
   * setName.
   */
  const getNameFromStorage = async () => {
    const nameFromStorage = await storage.getItem<string>('name');

    if (nameFromStorage) {
      setName(nameFromStorage);
    }
  };


  // [Effect] Attach 'setName' to Window
  useEffect(() => {
    Object.defineProperty(window, 'setName', {
      value: (newName: string) => {
        storage.setItem('name', newName); // tslint:disable-line no-floating-promises
        setName(newName);
      }
    });

    return () => {
      Reflect.deleteProperty(window, 'setName');
    };
  }, []);


  // [Effect] Asynchronously Get Name From Storage.
  useEffect(() => {
    getNameFromStorage(); // tslint:disable-line no-floating-promises
  }, []);


  return (
    <StyledSplashMid color={R.pathOr('black', ['color'], currentPhoto)} opacity={currentPhoto ? 1 : 0}>
      {`Good ${getPeriodDescriptor()}${name ? `, ${name}` : ''}.`}
    </StyledSplashMid>
  );
};


export default SplashMid;
