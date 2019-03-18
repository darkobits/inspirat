import styled from '@emotion/styled';
import mousetrap from 'mousetrap';
import {mix, rgba} from 'polished';
import * as R from 'ramda';
import React, {FunctionComponent, useContext, useEffect} from 'react';
import {hot} from 'react-hot-loader';

import PhotoContext from 'contexts/photo';
import SplashMid from 'components/splash-mid';
import SplashLower from 'components/splash-lower';
import {BACKGROUND_RULE_OVERRIDES} from 'etc/constants';
import {UnsplashPhotoResource} from 'etc/types';
import {getFullImageUrl} from 'lib/photos';
import queryString from 'lib/query';


// ----- Styles ----------------------------------------------------------------

export interface SplashElProps {
  backgroundImage: string;
  maskColor: string;
  backgroundPosition?: string;
  maskAmount?: string;
  opacity: string | number;
  transform?: string;
}

const SplashEl = styled.div<SplashElProps>`
  align-items: center;
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: center;
  padding: 14px 18px;
  opacity: ${R.propOr('1', 'opacity')};
  width: 100%;
  transition: all 0.4s ease-in;

  &::before {
    background-attachment: fixed;
    background-image: url(${R.prop<string, string>('backgroundImage')});
    background-position: ${R.propOr('center center', 'backgroundPosition')};
    background-repeat: no-repeat;
    background-size: cover;
    bottom: 0;
    content: ' ';
    display: block;
    left: 0;
    position: absolute;
    right: 0;
    top: 0;
    transform: ${R.propOr('initial', 'transform')};
    z-index: 0;
  }

  &::after {
    background-color: ${props => rgba(mix(0.5, props.maskColor, 'black'), Number(props.maskAmount || 0.2))};
    bottom: 0;
    content: ' ';
    display: block;
    left: 0;
    mix-blend-mode: darken;
    position: absolute;
    right: 0;
    top: 0;
    transform: ${R.propOr('initial', 'transform')};
    z-index: 0;
  }
`;

interface SwatchProps {
  color: string;
}

const Swatch = styled.div<SwatchProps>`
  background-color: ${props => props.color};
  border-radius: 26px;
  position: absolute;
  width: 26px;
  height: 26px;
  top: 4px;
  right: 4px;
  z-index: 1;
`;

const Source = styled.div`
  font-size: 15px;
  height: calc(1em + 8px);
  left: 4px;
  position: absolute;
  top: 4px;
  width: calc(100% - 26px - 14px);
  z-index: 1;

  input {
    background: rgba(255, 255, 255, 0.5);
    border-radius: calc(1em + 8px);
    border: none;
    color: rgba(0, 0, 0, 0.6);
    font-family: sans-serif;
    font-size: inherit;
    font-weight: 500;
    height: calc(1em + 12px);
    letter-spacing: 0.2px;
    padding: 6px 10px 6px 14px;
    width: 100%;

    &:focus {
      outline: none;
    }
  }
`;


// ----- Component -------------------------------------------------------------

const Splash: FunctionComponent = () => {
  const {currentPhoto, resetPhoto, setCurrentPhoto, setDayOffset} = useContext(PhotoContext);

  // [Effect] Create Key-Bindings
  if (process.env.NODE_ENV === 'development') {
    useEffect(() => {
      mousetrap.bind('left', () => {
        setDayOffset('decrement');
      });

      mousetrap.bind('right', () => {
        setDayOffset('increment');
      });

      console.debug('[Development] Keyboard shortcuts registered.');

      return () => {
        mousetrap.unbind('left');
        mousetrap.unbind('right');
      };
    }, [
      // Only run this effect once, when the component mounts.
    ]);
  }

  const showSwatch = process.env.NODE_ENV === 'development' && queryString().swatch === 'true';
  const showSrc = process.env.NODE_ENV === 'development' && queryString().src === 'true';

  const currentPhotoUrl = currentPhoto ? getFullImageUrl(currentPhoto.urls.full) : '';
  const color = R.propOr<string, UnsplashPhotoResource | undefined, string>('black', 'color', currentPhoto);
  const opacity = currentPhoto ? 1 : 0;
  const overrides = currentPhoto ? (BACKGROUND_RULE_OVERRIDES[currentPhoto.id]) : {};

  const onSrcChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const url = new URL(event.target.value);
      setCurrentPhoto({urls: {full: url.href}} as any);
    } catch {
      resetPhoto();
    }
  };

  return (
    <SplashEl backgroundImage={currentPhotoUrl} maskColor={color} opacity={opacity} {...overrides}>
      {showSrc ? <Source>
        <input type="text" onChange={onSrcChange} />
      </Source> : undefined}
      {showSwatch ? <Swatch color={color} /> : undefined}
      <SplashMid />
      <SplashLower />
    </SplashEl>
  );
};


export default hot(module)(Splash);
