import mousetrap from 'mousetrap';
import {mix, rgba} from 'polished';
import * as R from 'ramda';
import styled from 'react-emotion';
import React from 'react';

import PhotoContext from 'contexts/photo';
import SplashMid from 'components/splash-mid';
import SplashLower from 'components/splash-lower';
import {BACKGROUND_RULE_OVERRIDES} from 'etc/constants';
import {UnsplashPhotoResource} from 'etc/types';
import events from 'lib/events';
import {getFullImageUrl, getCurrentPhoto, getPhotoForDay, preloadImage} from 'lib/photos';
import queryString from 'lib/query';


// ----- Styled Elements -------------------------------------------------------

export interface StyledSplashProps {
  backgroundImage: string;
  maskColor: string;
  backgroundPosition?: string;
  maskAmount?: string;
  opacity: string;
  transform?: string;
}

const StyledSplash = styled.div<StyledSplashProps>`
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
  background-color: ${({color}) => color};
  position: absolute;
  width: 50px;
  height: 50px;
  top: 0;
  right: 0;
  z-index: 1;
`;


// ----- Component -------------------------------------------------------------

export interface SplashState {
  currentPhoto?: UnsplashPhotoResource;
  dayOffset: number;
  showSwatch: boolean;
}


export default class Splash extends React.Component<{}, SplashState> {
  state: SplashState = {
    // currentPhoto: null,
    dayOffset: 0,
    showSwatch: false,
  };


  /**
   * In development, allows the left/right arrow keys to switch between photos
   * in the collection.
   */
  private enableKeyboardShortcuts() {
    if (process.env.NODE_ENV === 'development') {
      mousetrap.bind('left', () => {
        this.setState(prevState => ({dayOffset: prevState.dayOffset - 1}), async () => {
          return this.preparePhotos();
        });
      });

      mousetrap.bind('right', () => {
        this.setState(prevState => ({dayOffset: prevState.dayOffset + 1}), async () => {
          return this.preparePhotos();
        });
      });

      console.debug('[Development] Keyboard shortcuts registered.');
    }
  }


  /**
   * Loads the current photo, pre-loads the next photo, and updates the
   * component's state.
   *
   * Additionally emits the 'photoReady' event when the current photo has
   * finished loading.
   */
  async preparePhotos() {
    const photoPromises = [];

    const currentPhoto = process.env.NODE_ENV === 'development' ? await getPhotoForDay({offset: this.state.dayOffset}) : await getCurrentPhoto();
    const currentPhotoUrl = getFullImageUrl(currentPhoto.urls.full);

    const currentPhotoPromise = preloadImage(currentPhotoUrl).then(() => {
      events.emit('photoReady'); // tslint:disable-line no-floating-promises
    });

    photoPromises.push(currentPhotoPromise);

    // In development, log information about the current photo.
    if (process.env.NODE_ENV === 'development') {
      console.groupCollapsed(`[Splash] Current photo ID: "${currentPhoto.id}"`);
      console.debug(currentPhoto);
      console.groupEnd();
    }

    const nextPhoto = await getPhotoForDay({offset: this.state.dayOffset + 1});
    const nextPhotoUrl = getFullImageUrl(nextPhoto.urls.full);
    const nextPhotoPromise = preloadImage(nextPhotoUrl);
    photoPromises.push(nextPhotoPromise);

    // In development, also pre-load the previous photo.
    if (process.env.NODE_ENV === 'development') {
      const prevPhoto = await getPhotoForDay({offset: this.state.dayOffset - 1});
      const prevPhotoUrl = getFullImageUrl(prevPhoto.urls.full);
      const prevPhotoPromise = preloadImage(prevPhotoUrl);
      photoPromises.push(prevPhotoPromise);
    }

    // If there is no current photo, or if the current photo does not match the
    // one in the component's state, update state.
    if (!this.state.currentPhoto || currentPhoto.id !== this.state.currentPhoto.id) {
      await currentPhotoPromise;
      this.setState(prevState => ({...prevState, currentPhoto}));
    }

    await Promise.all(photoPromises);

    if (process.env.NODE_ENV === 'development') {
      console.debug('[Splash] All photos loaded.');
    }
  }


  // ----- React Lifecycles ----------------------------------------------------

  async componentDidMount() {
    try {
      const showSwatch = process.env.NODE_ENV === 'development' && queryString().swatch === 'true';

      this.enableKeyboardShortcuts();
      this.setState(prevState => ({...prevState, showSwatch}));
      this.preparePhotos(); // tslint:disable-line no-floating-promises
    } catch (err) {
      console.error('[Splash] Error:', err.message);
    }
  }


  /**
   * Renders the component.
   */
  render() {
    // Use modIndex() here because the current index might be out-of-bounds if
    // navigating between photos in development.
    const currentPhoto = this.state.currentPhoto;

    const currentPhotoUrl = currentPhoto ? getFullImageUrl(currentPhoto.urls.full) : '';
    const color = R.propOr<string, UnsplashPhotoResource | undefined, string>('black', 'color', currentPhoto);
    const opacity = currentPhoto ? '1' : '0';
    const overrides = currentPhoto ? (BACKGROUND_RULE_OVERRIDES[currentPhoto.id]) : {};

    return (
      <PhotoContext.Provider value={currentPhoto || null}>
        {this.state.showSwatch ? <Swatch color={color} /> : null}
        <StyledSplash backgroundImage={currentPhotoUrl}
          maskColor={color}
          opacity={opacity}
          {...overrides}
        >
          <SplashMid />
          <SplashLower />
        </StyledSplash>
      </PhotoContext.Provider>
    );
  }
}
