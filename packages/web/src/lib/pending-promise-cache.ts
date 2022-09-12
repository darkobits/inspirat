/* eslint-disable @typescript-eslint/require-await, prefer-arrow/prefer-arrow-functions, max-len */


/**
 * Provides a way to re-use promises from promise-returning functions that may
 * be called multiple times before the promise from the first invocation
 * settles.
 *
 * TODO: Move to own package.
 */
export default class PendingPromiseCache<K extends string> {
  private readonly _map = new Map();


  /**
   * Returns true if the provided key exists in the cache.
   */
  has(key: K) {
    return this._map.has(key);
  }


  /**
   * Returns the value for the provided key from the cache.
   */
  async get<P = any>(key: K): Promise<P> {
    return this._map.get(key) as Promise<P>;
  }


  /**
   * Provided a key and a function that returns a promise, checks to see if the
   * key exists in the cache. If it does not, invokes the function and stores
   * the promise it returns at the provided key. If it does, the function is
   * never invoked.
   *
   * Then, returns the promise at the provided key. When the promise settles,
   * the key is removed from the cache.
   */
  async set<P = any>(key: K, taskFn: () => Promise<P>): Promise<P> {
    if (typeof taskFn !== 'function') {
      throw new TypeError('[PendingPromiseCache] Values must be Promise-returning functions.');
    }

    if (!this._map.has(key)) {
      const taskFnPromise = taskFn();

      if (typeof taskFnPromise.finally !== 'function') {
        throw new TypeError('[PendingPromiseCache] Value returned from function does not implement "finally".');
      }

      taskFnPromise.finally(() => {
        this._map.delete(key);
      });

      this._map.set(key, taskFnPromise);
    }

    return this._map.get(key);
  }
}
