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


/**
 * Basis for computing various attributes of the Source and Swatch components.
 */
const BASIS = '28px';


/**
 * Swatch component that resides at the top of the screen in development mode
 * when the "dev=true" query param is present.
 */
interface SwatchProps {
  color: string;
}

const Swatch = styled.div<SwatchProps>`
  background-color: ${props => props.color};
  border-radius: ${BASIS};
  box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.15);
  position: absolute;
  width: ${BASIS};
  height: ${BASIS};
  top: 8px;
  right: 4px;
  z-index: 1;
`;


/**
 * Image source input that resides at the top of the screen in development mode
 * when the "dev=true" query param is present.
 */
const Source = styled.div`
  height: ${BASIS};
  left: 4px;
  position: absolute;
  top: 8px;
  width: calc(100% - ${BASIS} - 14px);
  z-index: 2;

  input {
    background: rgba(255, 255, 255, 0.5);
    border-radius: ${BASIS};
    border: none;
    box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.15);
    color: rgba(0, 0, 0, 0.6);
    font-family: sans-serif;
    font-size: 15px;
    font-size: inherit;
    font-weight: 500;
    height: ${BASIS};
    letter-spacing: 0.3px;
    line-height: ${BASIS};
    padding: 0px 10px 0px 14px;
    width: 100%;

    &:focus {
      outline: none;
    }

    &::selection {
      background-color: rgba(255, 255, 255, 0.5);
    }
  }
`;


/**
 * Progress bar that resides at the top of the screen in development mode when
 * the "dev=true" query parameter is present.
 */
const Progress = styled.div<{progress: number; color: string}>`
  border-left-color: ${props => rgba(props.color || 'white', 1)};
  border-left-style: solid;
  border-left-width: ${props => (props.progress || 0) * 100}vw;
  height: 2px;
  left: 0;
  position: absolute;
  right: 0;
  top: 0;
  transition: border-left-width 0.2s ease-in;
`;


// ----- Component -------------------------------------------------------------

const Splash: FunctionComponent = () => {
  const {
    dayOffset,
    setDayOffset,
    currentPhoto,
    setCurrentPhoto,
    resetPhoto,
    numPhotos
  } = useContext(PhotoContext);

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

  const showDevTools = process.env.NODE_ENV === 'development' && queryString().dev === 'true';

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
      {showDevTools ? <>
        <Progress progress={((dayOffset % numPhotos) || 0) / numPhotos} color={color} />
        <Source><input type="text" onChange={onSrcChange} /></Source>
        <Swatch color={color} />
      </> : undefined}
      <SplashMid />
      <SplashLower />
    </SplashEl>
  );
};


export default hot(module)(Splash);
