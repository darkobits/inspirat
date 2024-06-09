import { atom } from 'jotai';

export interface AtomFromQueryParamsOptions<T> {
  initialValue: T;
  parseValue?: (value: any) => T;
}

/**
 * Creates a Jotai atom whose value is backed by a URL query parameter.
 */
export function atomFromQueryParam<T>(queryParam: string, options?: AtomFromQueryParamsOptions<T>) {
  type Setter = (prev: T) => T;

  const {
    initialValue,
    parseValue
  } = options ?? {} as AtomFromQueryParamsOptions<T>;

  let finalInitialValue;

  const queryParams = new URLSearchParams(window.location.search);
  const rawValue = queryParams.get(queryParam);

  if (rawValue) {
    try {
      finalInitialValue = parseValue ? parseValue(rawValue as T) : JSON.parse(rawValue);
    } catch {
      finalInitialValue = rawValue;
    }
  } else {
    finalInitialValue = initialValue;
  }

  const queryAtom = atom<T, [T | Setter], void>(
    finalInitialValue,
    (get, set, newValueOrFn) => {
      const queryParams = new URLSearchParams(window.location.search);
      const rawValue = queryParams.get(queryParam);

      const newValue = typeof newValueOrFn === 'function'
        // @ts-expect-error This is fine.
        ? newValueOrFn(rawValue)
        : newValueOrFn;

      set(queryAtom, newValue);
      queryParams.set(queryParam, newValue);

      // @ts-expect-error This call is fine.
      history.replaceState(null, null, `?${queryParams.toString()}`);
    }
  );

  return queryAtom;
}
