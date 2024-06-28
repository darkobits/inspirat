import { atom } from 'jotai';
import queryString, { type ParseOptions } from 'query-string';


export function serializeToBase64(value: any): string {
  try {
    return btoa(JSON.stringify(value));
  } catch (err: any) {
    console.error(value, typeof value);
    throw new Error(`[atomFromQueryParam] Error serializing the above value: ${err.message}`, { cause: err });
  }
}


export function deserializeFromBase64(value: string): any {
  try {
    const first = atob(value);
    console.log('first pass', first);
    return JSON.parse(atob(value));
  } catch (err: any) {
    console.error(value, typeof value);
    throw new Error(`[atomFromQueryParam] Error de-serializing the above value: ${err.message}`, { cause: err });
  }
}


export interface AtomFromQueryParamsOptions<T> {
  /**
   * Optional function to parse the string value from the URL before returning
   * it to consumers of the atom.
   *
   * @default JSON.parse
   */
  deserialize?: (value: string | Array<string | null> | null) => T;

  /**
   * Optional function for format the atom value into a string before updating
   * the URL.
   *
   * @default JSON.stringify
   */
  serialize?: (value: T) => string;

  /**
   * Optional options to forward to query-string.
   */
  parseOptions?: ParseOptions;
}

const defaultParseOptions: ParseOptions = {
  parseBooleans: true,
  parseNumbers: true,
  parseFragmentIdentifier: true,
  sort: false
};

export type Setter<T> = (value: T) => void;

/**
 * Creates a Jotai atom whose value is backed by a URL query parameter. Accepts
 * optional functions to serialize and de-serialize the value.
 */
export function atomWithQueryParam<T>(queryParam: string, initialValue: T, options?: AtomFromQueryParamsOptions<T>) {
  const {
    deserialize,
    serialize,
    parseOptions
  } = options ?? {};

  const getInitialValue = (): T => {
    // const queryParams = new URLSearchParams(window.location.search);
    // const rawValue = queryParams.get(queryParam);
    const parsedQueryParams = queryString.parse(window.location.search, {
      ...defaultParseOptions,
      ...parseOptions
    });

    return Reflect.has(parsedQueryParams, queryParam)
      ? typeof deserialize === 'function'
        ? deserialize(Reflect.get(parsedQueryParams, queryParam))
        : Reflect.get(parsedQueryParams, queryParam) as T
      : initialValue;
  };

  const queryAtom = atom<T, [T | Setter<T>], void>(
    getInitialValue(),
    // Setter function for the atom.
    (get, set, newValueOrFn) => {
      const newValue = typeof newValueOrFn === 'function'
      // @ts-expect-error - This type is, in fact, callable.
      ? newValueOrFn(get(queryAtom))
      : newValueOrFn;

      set(queryAtom, newValue);

      const formattedValue = typeof serialize === 'function'
      ? serialize(newValue)
      : newValue;

      const queryParams = new URLSearchParams(window.location.search);
      queryParams.set(queryParam, formattedValue);

      // @ts-expect-error This call is fine.
      history.replaceState(null, null, `?${queryParams.toString()}`);
    }
  );

  return queryAtom;
}
