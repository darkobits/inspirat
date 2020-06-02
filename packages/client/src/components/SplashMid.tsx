import {styled} from 'linaria/react';
import {rgba} from 'polished';
import React from 'react';
import useAsyncEffect from 'use-async-effect';

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
  opacity: ${props => props.opacity || 1};
  padding-bottom: 1.2em;
  text-shadow: ${props => textShadow(props.color)};
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

const SplashMid: React.FunctionComponent = () => {
  const {currentPhoto} = React.useContext(PhotoContext);
  const [name, setName] = React.useState('');

  // [Effect] Attach 'setName' to Window
  React.useEffect(() => {
    Object.defineProperty(window, 'setName', {
      value: (newName: string) => {
        void storage.setItem('name', newName);
        setName(newName);
      }
    });

    return () => {
      Reflect.deleteProperty(window, 'setName');
    };
  }, []);


  // [Async Effect] Get user's name from local storage and update greeting.
  useAsyncEffect(async isMounted => {
    const nameFromStorage = await storage.getItem<string>('name');

    if (isMounted() && nameFromStorage) {
      setName(nameFromStorage);
    }
  }, []);


  return (
    <StyledSplashMid
      color={currentPhoto?.color ?? 'black'}
      opacity={currentPhoto ? 1 : 0}
    >
      {`Good ${getPeriodDescriptor()}${name ? `, ${name}` : ''}.`}
    </StyledSplashMid>
  );
};


export default SplashMid;
