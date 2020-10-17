import queryString from 'query-string';
// @ts-ignore
import urlParseLax from 'url-parse-lax';

import { GenericFunction, LooseObject } from 'etc/types';


/**
 * Returns the greater of the two values provided.
 */
export function greaterOf(a: number, b: number): number {
  return a >= b ? a : b;
}


/**
 * Provided an integer and an array, returns the index in that array computed
 * by dividing the integer by the length of the array and using the remainder as
 * the index. This allows a counter to start at 0 and increase indefinitely,
 * looping over the array as it does.
 */
export function modIndex(num: number, arr: Array<any>): number {
  const index = num % arr.length;
  return index < 0 ? index + arr.length : index;
}


/**
 * Provided a string, returns a new string with each word capitalized.
 */
export function capitalizeWords(input: string): string {
  return input.split(' ').map(word => `${word.slice(0, 1).toUpperCase()}${word.slice(1).toLowerCase()}`).join(' ');
}


/**
 * Executes the provided function if NODE_ENV is 'development' or if the 'debug'
 * query string param has been set.
 */
export function ifDebug(cb: (...args: Array<any>) => any): any {
  if (process.env.NODE_ENV === 'development' || queryString.parse(location.search).debug === 'true')  {
    return cb();
  }
}


/**
 * Returns true if we are running as a Chrome extension.
 */
export function isChromeExtension() {
  if (process.env.NODE_ENV === 'development') {
    return true;
  }

  return window.location.href.startsWith('chrome-extension://');
}


/**
 * Provided an interval and a callback, returns a React `onClick` handler that,
 * when invoked, will wait `interval` milliseconds and then invoke `callback` if
 * no 'mouseup' event was received in the interim.
 */
export function onClickAndHold(interval: number, cb: GenericFunction) {
  return (e: React.MouseEvent) => {
    const target = e.currentTarget;

    // This was not a primary click, or target is falsy; bail.
    if (e.button !== 0 || e.ctrlKey || !target) {
      return;
    }

    const timeoutHandle = setTimeout(() => cb(target), interval);

    const onMouseUp = () => {
      clearTimeout(timeoutHandle);
      target.removeEventListener('mouseup', onMouseUp);
    };

    target.addEventListener('mouseup', onMouseUp);
  };
}


/**
 * @private
 *
 * Unsplash uses Imgix for dynamic image processing. These parameters ensure we
 * fetch an image that is appropriately sized for the current viewport.
 *
 * See: https://docs.imgix.com/apis/url
 */
function buildImgixOptions(base?: LooseObject, overrides?: LooseObject): string {
  const screenDimension = greaterOf(window.screen.width, window.screen.height);

  const params = {
    ...base,
    // Sets several baseline parameters.
    auto: 'format',
    // Fit the image to the provided width/height without cropping and while
    // maintaining its aspect ratio.
    fit: 'max',
    // Image width.
    w: screenDimension,
    // Image height.
    h: screenDimension,
    // Image quality.
    q: 80,
    // Apply any provided overrides.
    ...overrides
  };

  return queryString.stringify(params);
}


/**
 * Provided a base URL for an Unsplash image, returns a URL with Imgix query
 * params optimized for the current viewport size and desired quality settings.
 */
export function updateImgixQueryParams(baseUrl: string, options?: LooseObject) {
  const {protocol, host, pathname, query} = urlParseLax(baseUrl);
  const parsedQuery = queryString.parse(query);
  const updatedQuery = buildImgixOptions(parsedQuery, options);
  return `${protocol}//${host}${pathname}?${updatedQuery}`;
}


/**
 * Asynchronously pre-loads the image at the provided URL and returns a promise
 * that resolves when the image has finished loading.
 */
export async function preloadImage(imgUrl: string) {
  return new Promise<void | ErrorEvent>((resolve, reject) => {
    const img = new Image();

    img.addEventListener('load', () => {
      resolve();
    });

    img.addEventListener('error', event => {
      reject(event);
    });

    // N.B. Setting this property will cause the browser to fetch the image.
    img.src = imgUrl;
  });
}
