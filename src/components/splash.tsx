import mousetrap from 'mousetrap';
import {invert} from 'polished';
import {css} from 'react-emotion';
import React from 'react';

import PhotoContext from 'components/photo-context';
import SplashMid from 'components/splash-mid';
import SplashLower from 'components/splash-lower';
import {BACKGROUND_POSITION_OVERRIDES} from 'etc/constants';
import {LooseObject, UnsplashPhotoResource} from 'etc/types';
import {getImages, preloadImage} from 'lib/images';
import queryString from 'lib/query';
import {getIndexForDayOfYear, modIndex} from 'lib/utils';


// ----- Styles ----------------------------------------------------------------

const className = ({backgroundImage, backgroundPosition}: LooseObject) => css`
  background-attachment: fixed;
  background-image: url(${backgroundImage});
  background-position: ${backgroundPosition || 'center center'};
  background-size: cover;
  height: 100%;
  width: 100%;
`;

const splashMaskClassName = css`
  background-color: rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: space-between;
  padding: 14px 18px;
  width: 100%;
`;

const swatchClassName = ({color}: {color: string}) => css`
  // background-color: ${invert(color)};
  background-color: ${color};
  position: absolute;
  width: 50px;
  height: 50px;
  top: 0;
  right: 0;
`;


// ----- Component -------------------------------------------------------------

export interface SplashState {
  images: Array<UnsplashPhotoResource>;
  index: number;
  showSwatch: boolean;
}


export default class Splash extends React.Component<{}, SplashState> {
  state = {
    images: [] as Array<UnsplashPhotoResource>,
    index: 0,
    showSwatch: false
  };


  /**
   * In development, allows the left/right arrow keys to switch between images
   * in the collection.
   */
  private enableKeyboardShortcuts() {
    if (process.env.NODE_ENV === 'development') {
      mousetrap.bind('left', () => {
        this.setState(prevState => ({index: modIndex(prevState.index - 1, this.state.images)}));
      });

      mousetrap.bind('right', () => {
        this.setState(prevState => ({index: modIndex(prevState.index + 1, this.state.images)}));
      });

      console.debug('[Development] Keyboard shortcuts registered.');
    }
  }


  /**
   * Pre-loads the next photo in the collection. In development, additionally
   * pre-loads the previous photo in the collection.
   */
  private async preloadNeighboringPhotos() {
    const nextPhoto = this.state.images[modIndex(this.state.index + 1, this.state.images)];

    const promises = [preloadImage(nextPhoto.urls.full)];

    if (process.env.NODE_ENV === 'development') {
      const prevPhoto = this.state.images[modIndex(this.state.index - 1, this.state.images)];
      promises.push(preloadImage(prevPhoto.urls.full));
    }

    return Promise.all(promises);
  }


  /**
   * Bind the left/right arrow keys to handlers that will cycle through images.
   */
  async componentDidMount() {
    try {
      const images = await getImages();
      const index = getIndexForDayOfYear(images);

      this.setState(prevState => ({...prevState, images, index}));
      this.enableKeyboardShortcuts();

      if (process.env.NODE_ENV === 'development') {
        console.debug('[Splash] Got images:', images);
      }
    } catch (err) {
      console.error('[Splash] Error:', err.message);
    }
  }


  /**
   * Whenever the component updates, preload the adjacent photos in the
   * collection.
   */
  async componentDidUpdate() {
    if (process.env.NODE_ENV === 'development') {
      console.debug('[Splash] Preloading photos.');
    }

    await this.preloadNeighboringPhotos();

    if (process.env.NODE_ENV === 'development') {
      console.debug('[Splash] Finished preloading photos.');
    }
  }


  /**
   * Renders the component.
   */
  render() {
    // Use modIndex() here because the current index might be out-of-bounds if
    // navigating between images in development.
    const photo = this.state.images[this.state.index];

    // If in development, enable the swatch when ?swatch=true is in the query.
    const showSwatch = process.env.NODE_ENV === 'development' && queryString().swatch;

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

    const backgroundImage = photo.urls.full;
    const backgroundPosition = BACKGROUND_POSITION_OVERRIDES[photo.id];
    const color = photo.color;

    return (
      <PhotoContext.Provider value={photo}>
        {showSwatch ? <div className={swatchClassName({color})}></div> : null}
        <div className={className({backgroundImage, backgroundPosition})}>
          <div className={splashMaskClassName}>
            <SplashMid></SplashMid>
            <SplashLower />
          </div>
        </div>
      </PhotoContext.Provider>
    );
  }
}
