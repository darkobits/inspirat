import React from 'react';
import {UnsplashPhotoResource} from 'etc/types';


/**
 * Tracks the current photo being displayed.
 *
 * Producer: <Splash>
 * Consumers: <ImageMeta>, <SplashLower>
 */
export default React.createContext<UnsplashPhotoResource | undefined>(undefined);
