import queryString from 'query-string';
import * as R from 'ramda';
// @ts-ignore
import urlParseLax from 'url-parse-lax';

import { GenericFunction, LooseObject } from 'etc/types';


/**
 * Provided an integer and an array or a length param, returns an index in that
 * array computed by dividing the integer by the length of the array and using
 * the remainder as the result. This allows a counter to start at 0 and increase
 * indefinitely, looping over the array as it does.
 */
export function modIndex(num: number, arrOrLength: Array<any> | number): number {
  const length = Array.isArray(arrOrLength) ? arrOrLength.length : arrOrLength;
  const index = num % length;
  return index < 0 ? index + length : index;
}


/**
 * Provided a string, returns a new string with each word capitalized.
 */
export function capitalizeWords(input: string): string {
  return input.split(' ').map(word => `${word.slice(0, 1).toUpperCase()}${word.slice(1).toLowerCase()}`).join(' ');
}


/**
 * Tracks debug callbacks provided to ifDebug.
 */
const debugOnceStatements: Array<string | Array<any>> = [];


/**
 * @private
 *
 * Invokes the provided callback and, if it makes any calls to console.debug,
 * will only log the debug statement if it has not already been seen. If key is
 * of type string, it will be used to make this determination. Otherwise, the
 * arguments provided to console.debug will be used.
 */
function debugOnce(key: boolean | string, cb: GenericFunction) {
  const origDebug = console.debug;

  console.debug = (...args: Array<any>) => {
    const id = typeof key === 'string' ? key : args;

    if (!R.includes(id, debugOnceStatements)) {
      Reflect.apply(origDebug, console, args);
      debugOnceStatements.push(id);
    }
  };

  cb();

  console.debug = origDebug;
}


/**
 * Optional options object accepted by ifDebug.
 */
export interface IfDebugOptions {
  once?: boolean | string;
}


/**
 * Executes the provided function if NODE_ENV is 'development' or if the 'debug'
 * query string param has been set.
 */
export function ifDebug(cb: GenericFunction, options?: IfDebugOptions) {
  if (process.env.NODE_ENV === 'development' || queryString.parse(location.search).debug === 'true')  {
    if (options?.once) {
      debugOnce(options.once, cb);
    } else {
      cb();
    }
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

    ['mouseup', 'mousemove'].forEach(event => {
      const handler = () => {
        clearTimeout(timeoutHandle);
        target.removeEventListener(event, handler);
      };

      target.addEventListener(event, handler);
    });
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
  const w = window.screen.width;
  const h = window.screen.height;
  const dpr = window.devicePixelRatio;

  const params = {
    ...base,
    fm: 'png',
    // Sets several baseline parameters.
    auto: 'format',
    // Fit the image to the provided width/height without cropping and while
    // maintaining its aspect ratio.
    fit: 'max',
    // Do not crop images.
    crop: undefined,
    // Desired maximum image width.
    w,
    // Desired maximum image height.
    h,
    // Set device pixel ratio.
    dpr,
    // Image quality.
    q: 100,
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
