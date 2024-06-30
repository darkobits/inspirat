/* eslint-disable @typescript-eslint/require-await, prefer-arrow/prefer-arrow-functions, max-len */

export interface SetOptions {
  /**
   * Time (in milliseconds) that a resolved promise will remain in the cache
   * before being removed.
   */
  ttl?: number;
}

export interface CachedPromise<P = any> {
  promise: Promise<P>;
  expires: number;
}

/**
 * Provides a way to re-use promises from promise-returning functions that may
 * be called multiple times before the promise from the first invocation
 * settles.
 *
 * TODO: Move to own package.
 */
export default class PendingPromiseCache<K extends string> {
  readonly #map = new Map<string, CachedPromise>();


  #isExpired(value: CachedPromise) {
    return value.expires < Date.now();
  }

  /**
   * Returns true if the provided key exists in the cache.
   */
  has(key: K) {
    return this.#map.has(key);
  }


  /**
   * Returns the promise at the provided cache key.
   */
  async get<P = any>(key: K)  {
    const cachedPromise = this.#map.has(key) && this.#map.get(key);
    if (!cachedPromise) return;

    if (this.#isExpired(cachedPromise)) {
      this.#map.delete(key);
      return;
    }

    return cachedPromise.promise as Promise<P>;
  }


  /**
   * Provided a cache key and a promise-returning function, checks to see if
   * a promise exists at that key and is not expired. If so, returns the
   * existing promise. If not, the provided function is invoked and the promise
   * it returns is stored at the indicated key.
   *
   * By default, promises expire when they resolve. A longer TTL can be provided
   * using the `ttl` option.
   */
  async use<P = any>(key: K, taskFn: () => Promise<P>, options: SetOptions = {}): Promise<P> {
    if (typeof taskFn !== 'function') {
      throw new TypeError('[PendingPromiseCache] Values must be Promise-returning functions.');
    }

    const cachedPromise = this.#map.has(key) && this.#map.get(key);

    if (!cachedPromise || this.#isExpired(cachedPromise)) {
      const taskFnPromise = taskFn();

      if (typeof taskFnPromise.finally !== 'function') {
        throw new TypeError('[PendingPromiseCache] Value returned from function does not implement "finally".');
      }

      void taskFnPromise.finally(() => {
        this.#map.set(key, {
          promise: taskFnPromise,
          expires: Date.now() + (options.ttl ?? 0)
        });
      });

      this.#map.set(key, {
        promise: taskFnPromise,
        expires: Number.POSITIVE_INFINITY
      });
    }

    return this.#map.get(key)?.promise;
  }
}
