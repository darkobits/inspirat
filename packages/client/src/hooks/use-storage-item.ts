import React from 'react';
import useAsyncEffect from 'use-async-effect';

import storage from 'lib/storage';

/**
 * @private
 *
 * Value we compare to to determine if a storage value is pending sync.
 */
const PENDING = Symbol('PENDING');


/**
 * Returns true if the provided value is pending.
 */
export function isPending(value: any) {
  return value === PENDING;
}


type HookReturnValue<T = any> = [
  T,
  React.Dispatch<React.SetStateAction<T>>
];

/**
 * Provided a key, returns a tuple value and setter function that will sync the
 * provided value to Local Storage.
 *
 * TODO: Make own package.
 */
function useStorageItem<T = any>(key: string): HookReturnValue<T | typeof PENDING | undefined>;
function useStorageItem<T = any>(key: string, initialValue: T): HookReturnValue<T | typeof PENDING>;
function useStorageItem<T = any>(key: string, initialValue?: T) {
  const [localValue, setLocalValue] = React.useState<T | typeof PENDING | undefined>(PENDING);

  const setValue: React.Dispatch<React.SetStateAction<T>> = value => {
    void storage.setItem(key, value);
    setLocalValue(value as T);
  };

  useAsyncEffect(async () => {
    const valueFromStorage = await storage.getItem<T>(key);

    if (valueFromStorage !== null) {
      setLocalValue(valueFromStorage);
    } else if (initialValue !== undefined) {
      setValue(initialValue);
    }

  }, [setLocalValue]);

  return [localValue, setValue];
}


export default useStorageItem;
