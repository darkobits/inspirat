import { InspiratPhotoResource } from 'inspirat-types';


export interface LooseObject {
  [index: string]: any;
}


export type GenericFunction = (...args: Array<any>) => any;


/**
 * Used for tuning the display of an individual image. Each prop maps to a CSS
 * rule in the BackgroundImage component.
 */
export interface BackgroundImageOverrides {
  backgroundPosition?: string;
  transform?: string;
  opacity?: number;
  transitionDuration?: string;
  transitionTimingFunction?: string;
  // backdropBlurRadius?: string;
  // backdropBlur?: string;
  backdrop?: {
    /**
     * Must be a valid CSS length.
     */
    blurRadius?: string;

    /**
     * The alpha value applied to the black ellipse in the image backdrop.
     */
    backgroundOpacity?: number;
  };
}


// ----- Photo & Storage Resources ---------------------------------------------

/**
 * Shape of the object used to cache the photo collection.
 */
export interface PhotoCollectionStorageItem {
  photos: Array<InspiratPhotoResource>;
  updatedAt: number;
}


/**
 * Shape of the object used to cache the current photo.
 */
export interface CurrentPhotoStorageItem {
  photo: InspiratPhotoResource;
  expires: number;
}
