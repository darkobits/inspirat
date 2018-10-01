import queryString from 'query-string';

import {LooseObject, UnsplashPhotoResource} from 'etc/types';
import client from 'lib/client';
import {greaterOf} from 'lib/utils';


/**
 * Returns an array of all images in the Front Lawn collection.
 *
 * See: lambda/images.ts.
 */
export async function getImages(): Promise<Array<UnsplashPhotoResource>> {
  const res = await client.get('/images');
  return res.data as Array<UnsplashPhotoResource>;
}


/**
 * Returns the current viewport width or viewport height, whichever is greater,
 * adjusted for the device's pixel ratio. At a pixel ratio of 1 or 2, the
 * dimension is returned as-is. For each pixel ratio above 2, the dimension is
 * increased by 50%.
 */
export function getScreenSize() {
  // window.devicePixelRatio;
  return greaterOf(window.screen.availWidth, window.screen.availHeight);
}


/**
 * Unsplash uses Imgix for dynamic image processing. These parameters ensure we
 * fetch an image that is appropriately sized for the current viewport.
 *
 * See: https://docs.imgix.com/apis/url
 */
export function buildOptions(overrides?: LooseObject): string {
  const params = {
    // Sets several baseline parameters.
    auto: 'format',
    // Fit the image to the provided width/height without cropping and while
    // maintaining its aspect ratio.
    fit: 'max',
    // Image width.
    w: getScreenSize(),
    // Image height.
    h: getScreenSize(),
    // Image quality.
    q: 80,
    // Apply any provided overrides.
    ...overrides
  };

  return queryString.stringify(params);
}


/**
 * Provided a base URL for an Unsplash image, returns a URL with Imgix query
 * params added.
 */
export function getFullImageUrl(baseUrl: string, options?: LooseObject) {
  return `${baseUrl}?${buildOptions(options)}`;
}


/**
 * Asynchronously pre-loads the image at the provided URL.
 */
// export async function preloadImage(imgUrl: string): Promise<void> {
//   return new Promise<void>((resolve, reject) => {
//     const img = new Image();

//     img.onload = () => {
//       resolve();
//     };

//     img.onerror = event => {
//       reject(event);
//     };

//     img.src = imgUrl;
//   });
// }
