import React from 'react';
import useAsyncEffect from 'use-async-effect';

import storage from 'lib/storage';


/**
 * Provided a key, returns a tuple value and setter function that will sync the
 * provided value to Local Storage.
 */
export default function useStorageItem<T = any>(key: string): [T | undefined, (value: T) => void] {
  const [localValue, setLocalValue] = React.useState<T>();

  const setValue = (value: T) => {
    void storage.setItem(key, value);
    setLocalValue(value);
  };

  useAsyncEffect(async isMounted => {
    const valueFromStorage = await storage.getItem<T>(key);

    if (isMounted() && valueFromStorage !== null) {
      setLocalValue(valueFromStorage);
    }
  }, []);

  return [localValue, setValue];
}
