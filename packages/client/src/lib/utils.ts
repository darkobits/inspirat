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
