import type React from 'react';

import { InspiratPhotoResource, InspiratPhotoCollection } from 'etc/types';


export interface LooseObject {
  [index: string]: any;
}


export type GenericFunction<T = void> = (...args: Array<any>) => T;


/**
 * Returns the React props for the provided element
 */
export type ElementProps<T extends HTMLElement = HTMLElement> = React.DetailedHTMLProps<React.HTMLAttributes<T>, T>;


/**
 * Used for tuning the display of an individual image. Each prop maps to a CSS
 * rule in the BackgroundImage component.
 */
export interface BackgroundImageOverrides {
  imgixParams?: Record<string, any>;
  styleOverrides?: React.CSSProperties;
}


// ----- Photo & Storage Resources ---------------------------------------------

export interface AnnotatedPhotoCollection extends InspiratPhotoCollection {
  weight: {
    name: string;
    value?: number;
  };
}

/**
 * Shape of the object used to cache the photo collection.
 */
export interface PhotoCollectionStorageItem {
  // photos: Array<InspiratPhotoResource>;
  collections: Array<AnnotatedPhotoCollection>;
  updatedAt: number;
}


/**
 * @deprecated
 *
 * Shape of the object used to cache the current photo.
 */
export interface CurrentPhotoStorageItem {
  photo: InspiratPhotoResource;
  expires: number;
}


export interface TouchEvent {
  detail: {
    x: number;
    y: number;
    directions: {
      touch: boolean;
      top: boolean;
      left: boolean;
      bottom: boolean;
      right: boolean;
    };
  };
}
