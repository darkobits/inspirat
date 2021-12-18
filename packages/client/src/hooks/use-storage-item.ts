import React from 'react';
import useAsyncEffect from 'use-async-effect';

import storage from 'lib/storage';


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
function useStorageItem<T = any>(key: string): HookReturnValue<T | undefined>;
function useStorageItem<T = any>(key: string, initialValue: T): HookReturnValue<T>;
function useStorageItem<T = any>(key: string, initialValue?: T) {
  const [localValue, setLocalValue] = React.useState<T | undefined>(initialValue as T);

  const setValue: React.Dispatch<React.SetStateAction<T>> = value => {
    void storage.setItem(key, value);
    setLocalValue(value as T);
  };

  useAsyncEffect(async isMounted => {
    const valueFromStorage = await storage.getItem<T>(key);

    if (valueFromStorage === null) {
      void storage.setItem(key, initialValue);
    }

    if (isMounted() && valueFromStorage !== null) {
      setLocalValue(valueFromStorage);
    }
  }, []);

  return [localValue, setValue];
}


export default useStorageItem;
