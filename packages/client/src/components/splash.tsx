import mousetrap from 'mousetrap';
import {mix, rgba} from 'polished';
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
import R from 'lib/ramda';


// ----- Styled Elements -------------------------------------------------------

export interface StyledSplashProps {
  backgroundImage: string;
  maskColor: string;
  backgroundPosition?: string;
  maskAmount?: string;
  transform?: string;
}

const StyledSplash = styled.div<StyledSplashProps>`
  align-items: center;
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: center;
  padding: 14px 18px;
  width: 100%;

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
    transform: ${R.propOr('initial', 'transfor')};
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
    dayOffset: 0,
    showSwatch: false
  };


  /**
   * In development, allows the left/right arrow keys to switch between photos
   * in the collection.
   */
  private enableKeyboardShortcuts() {
    if (process.env.NODE_ENV === 'development') {
      mousetrap.bind('left', () => {
        this.setState(prevState => ({dayOffset: prevState.dayOffset - 1}), async () => {
          return this.setCurrentPhoto();
        });
      });

      mousetrap.bind('right', () => {
        this.setState(prevState => ({dayOffset: prevState.dayOffset + 1}), async () => {
          return this.setCurrentPhoto();
        });
      });

      console.debug('[Development] Keyboard shortcuts registered.');
    }
  }


  /**
   * Pre-loads the current and next photo in the collection. In development,
   * additionally pre-loads the previous photo in the collection.
   *
   * The need to "preload" the current photo may seem redundant, however, the
   * browser will only fetch it once, and by using this technique, we can use
   * the Image's 'load' event (via preloadImage) to get notified when the image
   * has finished loading so we can emit the 'photoReady' event.
   */
  private async preloadPhotos() {
    const currentPhoto = await getPhotoForDay();
    const nextPhoto = await getPhotoForDay({offset: this.state.dayOffset + 1});

    const promises = [
      preloadImage(getFullImageUrl(nextPhoto.urls.full)),
      preloadImage(getFullImageUrl(currentPhoto.urls.full)).then(async () => events.emit('photoReady'))
    ];

    if (process.env.NODE_ENV === 'development') {
      const prevPhoto = await getPhotoForDay({offset: this.state.dayOffset - 1});
      promises.push(preloadImage(getFullImageUrl(prevPhoto.urls.full)));
    }

    return Promise.all(promises);
  }


  /**
   * Sets the components' state's currentPhoto property. If in development, uses
   * getPhotoForDay or the 'src' query string param. In production, uses
   * getCurrentPhoto.
   */
  private async setCurrentPhoto(): Promise<void> {
    let currentPhoto: any;

    if (process.env.NODE_ENV === 'development') {
      if (queryString().src) {
        currentPhoto = {
          id: 'SRC',
          color: 'black',
          urls: {
            full: String(queryString().src)
          }
        };
      } else {
        currentPhoto = await getPhotoForDay({offset: this.state.dayOffset});
      }
    } else {
      currentPhoto = await getCurrentPhoto();
    }

    this.setState(prevState => ({...prevState, currentPhoto}));
  }


  /**
   * - Loads photo collection data.
   * - Determines current photo to display.
   * - Enables development keyboard shortcuts.
   */
  async componentDidMount() {
    try {
      this.enableKeyboardShortcuts();
      await this.setCurrentPhoto();
    } catch (err) {
      console.error('[Splash] Error:', err.message);
    }
  }


  /**
   * Pre-load the adjacent photos in the collection.
   */
  async componentDidUpdate() {
    if (process.env.NODE_ENV === 'development') {
      console.debug('[Splash] Preloading photos.');
    }

    await this.preloadPhotos();

    if (process.env.NODE_ENV === 'development') {
      console.debug('[Splash] Finished preloading photos.');
    }
  }


  /**
   * Renders the component.
   */
  render() {
    // Use modIndex() here because the current index might be out-of-bounds if
    // navigating between photos in development.
    const photo = this.state.currentPhoto;

    // If in development, enable the swatch when "swatch=true" is in the query.
    const showSwatch = process.env.NODE_ENV === 'development' && queryString().swatch === 'true';

    // If the photo collection hasnt loaded yet, return an empty div.
    if (!photo) {
      return <div></div>;
    }

    // In development, log information about the current photo.
    if (process.env.NODE_ENV === 'development') {
      console.groupCollapsed(`[Splash] Current photo ID: "${photo.id}"`);
      console.debug(photo);
      console.groupEnd();
    }

    const backgroundImage = getFullImageUrl(photo.urls.full);
    const color = photo.color;

    // Load any CSS overrides for the current photo.
    const PhotoOverrides = (BACKGROUND_RULE_OVERRIDES[photo.id] || {});

    return (
      <PhotoContext.Provider value={photo}>
        {showSwatch ? <Swatch color={color} /> : null}
        <StyledSplash backgroundImage={backgroundImage} maskColor={photo.color} {...PhotoOverrides}>
          <SplashMid />
          <SplashLower />
        </StyledSplash>
      </PhotoContext.Provider>
    );
  }
}
