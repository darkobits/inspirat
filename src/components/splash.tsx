import mousetrap from 'mousetrap';
import {css} from 'react-emotion';
import React from 'react';

import PhotoContext from 'components/photo-context';
import SplashMid from 'components/splash-mid';
import SplashLower from 'components/splash-lower';
import {LooseObject, UnsplashPhotoResource} from 'etc/types';
import {getImages} from 'lib/images';
import {getIndexForDayOfYear, modIndex} from 'lib/utils';


// ----- Styles ----------------------------------------------------------------

const className = ({backgroundImage, backgroundPosition}: LooseObject) => css`
  background-attachment: fixed;
  background-image: url(${backgroundImage});
  background-position: ${backgroundPosition || 'center center'};
  background-size: cover;
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: space-between;
  padding: 14px 18px;
  width: 100%;
`;


// ----- Component -------------------------------------------------------------

export interface SplashState {
  images: Array<UnsplashPhotoResource>;
  index: number;
}


export default class Splash extends React.Component<{}, SplashState> {
  state = {images: [], index: 0};


  /**
   * In development, allows the left/right arrow keys to switch between images
   * in the collection.
   */
  private enableKeyboardShortcuts() {
    if (process.env.NODE_ENV === 'development') {
      mousetrap.bind('left', () => {
        this.setState(prevState => ({index: prevState.index - 1}));
      });

      mousetrap.bind('right', () => {
        this.setState(prevState => ({index: prevState.index + 1}));
      });

      console.debug('[Development] Keyboard shortcuts registered.');
    }
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
   * Renders the component.
   */
  render() {
    const photo = modIndex<UnsplashPhotoResource>(this.state.index, this.state.images);

    if (!photo) {
      return <div></div>;
    }

    if (process.env.NODE_ENV === 'development') {
      console.groupCollapsed(`[Splash] Current photo ID: "${photo.id}"`);
      console.debug(photo);
      console.groupEnd();
    }

    const backgroundImage = photo.urls.full;

    return (
      <PhotoContext.Provider value={photo}>
        <div className={className({backgroundImage/* , backgroundPosition */})}>
          <SplashMid></SplashMid>
          <SplashLower />
        </div>
      </PhotoContext.Provider>
    );
  }
}
