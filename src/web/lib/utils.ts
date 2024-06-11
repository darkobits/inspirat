/* eslint-disable unicorn/consistent-destructuring */
import type React from 'react';

import pRetry from 'p-retry';
import { rgba as polishedRgba, parseToRgb } from 'polished';
import queryString from 'query-string';
import * as R from 'ramda';
import urlParseLax from 'url-parse-lax';

import { QUALITY_LQIP, QUALITY_FULL } from 'web/etc/constants';

import type { Color, InspiratPhotoResource } from 'etc/types';
import type { TouchEvent, GenericFunction, LooseObject } from 'web/etc/types';

/**
 * Determines if the provided value is a TouchEvent.
 */
export function isTouchEvent(e: any): e is TouchEvent {
  return e?.detail?.directions;
}


/**
 * Provided an Inspirat color object or a color string and an optional alpha
 * value, returns a hex color string.
 *
 * This is used in lieu of rgba() from Polished to avoid having to perform an
 * additional conversion from Inspirat color objects to Polished color objects
 * while also accepting color strings in one code path.
 */
export function rgba(arg0: Color | string, explicitAlpha?: number) {
  if (typeof arg0 === 'string') {
    const { red, green, blue } = parseToRgb(arg0);
    return polishedRgba(red, green, blue, explicitAlpha ?? 1);
  }

  return polishedRgba({
    red: arg0.r,
    green: arg0.g,
    blue: arg0.b,
    alpha: explicitAlpha ?? 1
  });
}


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
  return input.split(' ').map(word => `${word.slice(0, 1).toUpperCase()}${word.slice(1)}`).join(' ');
}


/**
 * @private
 *
 * Tracks debug callbacks provided to ifDebug.
 */
const debugFns: Array<any> = [];


/**
 * Provided a string or a function, returns a string used as a de-duplication
 * key.
 */
function computeDebugKey(value: string | GenericFunction) {
  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'function') {
    return value.toString();
  }

  throw new Error(`[computeDebugKey] Expected first argument to be of type "string" or "function", got "${typeof value}".`);
}


/**
 * Optional options object accepted by ifDebug.
 */
export interface IfDebugOptions {
  once?: boolean | string;
}


/**
 * Executes the provided function if in local development or if the 'debug'
 * query string param has been set.
 */
export function ifDebug(cb: GenericFunction, options?: IfDebugOptions) {
  const hasDebugParam = Object.keys(queryString.parse(location.search)).includes('debug');

  if (!import.meta.env.DEV && !hasDebugParam)  {
    return;
  }

  if (options?.once) {
    const key = options.once === true ? computeDebugKey(cb) : computeDebugKey(options.once);

    if (R.includes(key, debugFns)) {
      return;
    }

    debugFns.push(key);
  }

  cb();
}


/**
 * Returns true if we are running as a Chrome extension.
 */
export function isChromeExtension() {
  if (import.meta.env.DEV) {
    return true;
  }

  return window.location.href.startsWith('chrome-extension://');
}


/**
 * Provided an interval and a callback, returns a React `onClick` handler that,
 * when invoked, will wait `interval` milliseconds and then invoke `callback` if
 * no 'mouseup' event was received in the interim.
 */
export function onClickAndHold<E extends React.SyntheticEvent>(interval: number, cb: (e: E) => void) {
  const isMouseEvent = (event: any): event is React.MouseEvent => Reflect.has(event, 'button');

  const handler: React.EventHandler<E> = event => {
    const { currentTarget } = event;

    // Target is falsy; bail.
    if (!currentTarget) return;

    // This was not a primary click; bail.
    if (isMouseEvent(event) && (event.button !== 0 || event.ctrlKey || event.altKey || event.shiftKey)) return;

    // Set a timer that will invoke `cb` when it expires.
    const timeoutHandle = setTimeout(() => cb(event), interval);

    // Clear the above timeout if a move/drag/scroll event is detected.
    ['mouseup', 'mousemove', 'touchend', 'touchcancel', 'touchmove', 'scroll'].forEach(event => {
      const cancelHandler = () => {
        clearTimeout(timeoutHandle);
        currentTarget.removeEventListener(event, cancelHandler);
      };

      currentTarget.addEventListener(event, cancelHandler, { passive: true });
    });
  };

  return handler;
}

type PreloadImageCacheValue = {
  promise: Promise<string | ErrorEvent>;
  state: 'LOADING' | 'SUCCESS' | 'ERROR';
};

const preloadImageCache = new Map<string, PreloadImageCacheValue>();


/**
 * Asynchronously pre-loads the image at the provided URL and returns a promise
 * that resolves when the image has finished loading.
 */
export async function preloadImage(imgUrl: string) {
  if (!preloadImageCache.has(imgUrl)) {
    const imagePromise = pRetry(() => {
      return new Promise<string | ErrorEvent>((resolve, reject) => {
        const img = new Image();

        img.addEventListener('load', () => {
          preloadImageCache.set(imgUrl, { promise: imagePromise, state: 'SUCCESS' });
          resolve(imgUrl);
          img.remove();
        });

        img.addEventListener('error', event => {
          preloadImageCache.set(imgUrl, { promise: imagePromise, state: 'ERROR' });
          const message = event.error?.message ?? 'Unknown Error';
          reject(new Error(`[preloadImage] Failed to load image: ${message}`, { cause: event.error }));
        });

        // N.B. Setting this property will cause the browser to fetch the image.
        img.src = imgUrl;
      });
    }, { retries: 2 });

    preloadImageCache.set(imgUrl, { promise: imagePromise, state: 'LOADING' });
  }

  return preloadImageCache.get(imgUrl)?.promise;
}

/**
 * Predicate which returns `true` immediately if there are any images that are
 * currently preloading.
 */
preloadImage.isLoadingImages = () => {
  const states = [...preloadImageCache.values()].map(cacheValue => cacheValue.state);
  return states.includes('LOADING');
};

/**
 * Used by DevTools to transform a URL pasted into the URL input into a sparse
 * InspiratPhotoResource.
 */
export function mockPhotoResourceFromUrl(url: string) {
  const imgId = url.startsWith('https://unsplash.com/photos/')
    ? url.replace('https://unsplash.com/photos/', '')
    : undefined;

  if (!imgId) return;

  const width = window.innerWidth * window.devicePixelRatio;
  const height = window.innerHeight * window.devicePixelRatio;

  const newUrl = new URL(`https://source.unsplash.com/${imgId}/${width}x${height}`);

  return {
    id: imgId,
    urls: {
      full: newUrl.href
    }
  } as InspiratPhotoResource;
}


/**
 * @private
 *
 * Unsplash uses Imgix for dynamic image processing. These parameters ensure we
 * fetch an image that is appropriately sized for the current viewport.
 *
 * See: https://docs.imgix.com/apis/url
 */
function buildImgixOptions(base?: Record<string, any>, overrides?: LooseObject): string {
  const dpr = window.devicePixelRatio;

  const params = {
    ...base,
    fm: 'jpeg',
    // Sets several baseline parameters.
    // auto: 'format',
    // Fit the image to the provided width/height without cropping and while
    // maintaining its aspect ratio.
    fit: 'clip',
    // Do not crop images.
    crop: undefined,
    // Desired maximum image width.
    w: '1.0',
    // Desired maximum image height.
    h: '1.0',
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
  const { protocol, host, pathname, query } = urlParseLax(baseUrl);

  const parsedQuery = query
    ? typeof query === 'string' ? queryString.parse(query) : query
    : {};
  const updatedQuery = buildImgixOptions(parsedQuery, options);
  return `${protocol}//${host}${pathname}?${updatedQuery}`;
}


/**
 * Provided a single photo URL, returns an object containing a URL for a
 * low-quality image preview and the full-quality URL.
 */
export function buildPhotoUrlSrcSet(url: string, lqOptions ={}, fullOptions = {}) {
  return {
    lowQuality: updateImgixQueryParams(url, {
      q: QUALITY_LQIP,
      ...lqOptions
    }),
    highQuality: updateImgixQueryParams(url, {
      q: QUALITY_FULL,
      ...fullOptions
    })
  };
}


/**
 * Type used by `filterFalsy` to type-narrow arrays.
 */
export type WithoutFalsy<T> = T extends Array<infer U>
  ? Array<U extends (null | false | true |undefined | void | never)
    ? never : U
  > : T;


/**
 * Provided an array, returns a new array with all falsy values removed.
 *
 * TODO: Not used here, consider making own package.
 */
export function filterFalsy<T extends Array<any>>(arr: T) {
  return arr.filter(value => {
    return ![null, false, undefined, Number.NaN].includes(value);
  }) as WithoutFalsy<T>;
}


/**
 * [Hack] Programmatically clears any text/elements the user has selected by
 * adding and removing an invisible input
 */
export function clearSelections() {
  const selectionSmasher = document.createElement('input');
  selectionSmasher.setAttribute('type', 'text');
  document.querySelector('body')?.append(selectionSmasher);
  selectionSmasher.focus();
  selectionSmasher.blur();
  selectionSmasher.remove();
}
