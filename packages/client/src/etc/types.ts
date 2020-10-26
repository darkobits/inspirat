import { InspiratPhotoResource } from 'inspirat-types';


export interface LooseObject {
  [index: string]: any;
}


export type GenericFunction = (...args: Array<any>) => any;


/**
 * Shape of the background image overrides object defined in etc/constants.
 * Informed by the props of the Splash component.
 */
export interface BackgroundImageOverrides {
  [index: string]: {
    /**
     * Adjust the color of the mask overlay applied to all images.
     *
     * Default: 'black';
     */
    maskColor?: string;

    /**
     * CSS background-position property to use for the image.
     *
     * Default: 'center center'
     */
    backgroundPosition?: string;

    /**
     * Adjust the opacity of the mask overlay applied on top of all images.
     *
     * Default: 0.2
     */
    maskAmount?: string;

    /**
     * Apply a CSS transform to the image.
     *
     * Default: none
     */
    transform?: string;
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
