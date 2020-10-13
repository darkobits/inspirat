import { GenericFunction } from 'etc/types';


/**
 * Returns the greater of the two values provided.
 */
export function greaterOf(a: number, b: number): number {
  return a >= b ? a : b;
}


/**
 * Provided any integer and an array, returns the index in that array computed
 * by diving the number by the length of the array and using the remainder as
 * the index.
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
 * Executes the provided function if NODE_ENV is 'development';
 */
export function ifDev(cb: (...args: Array<any>) => any): any {
  if (process.env.NODE_ENV === 'development') {
    return cb();
  }
}


/**
 * Returns true if we are running as a Chrome extension.
 */
export function isChromeExtension() {
  if (process.env.NODE_ENV === 'development') {
    console.debug('[isChromeExtension] true (dev)');
    return true;
  }

  const res = window.location.href.startsWith('chrome-extension://');
  console.debug('[isChromeExtension]', res);
  return res;
}


/**
 * Provided a "hold" threshold and a callback, returns a click handler that,
 * when invoked, will call the provided callback if the mouse is not released
 * before the "hold" threshold is reached.
 */
export function onClickAndHold(threshold: number, cb: GenericFunction) {
  return (e: React.MouseEvent) => {
    // This was not a primary click, bail.
    if (e.button !== 0 || e.ctrlKey) {
      return;
    }

    const target = e.currentTarget;

    if (target) {
      const timeoutHandle = setTimeout(() => cb(target), threshold);

      const onMouseUp = () => {
        clearTimeout(timeoutHandle);
        target.removeEventListener('mouseup', onMouseUp);
      };

      target.addEventListener('mouseup', onMouseUp);
    }
  };
}
