import localforage from 'localforage';
import React from 'react';


type LocalForage = ReturnType<typeof localforage['createInstance']>;
type UseStorageItem<T = any> = [T, React.Dispatch<React.SetStateAction<T>>];


const instances = new Map<string, LocalForage>();


/**
 * Provided a key, returns a tuple value and setter function that will sync the
 * provided value to Local Storage.
 */
function useStorageItem<T = any>(namespace: string, key: string): UseStorageItem<T | undefined>;
function useStorageItem<T = any>(namespace: string, key: string, initialValue: T): UseStorageItem<T>;
function useStorageItem<T = any>(namespace: string, key: string, initialValue?: T) {
  const [localValue, setLocalValue] = React.useState<T | undefined>();
  const [storage, setStorage] = React.useState<LocalForage>();


  /**
   * Updates the tracked value locally and in storage.
   */
  const setValue: React.Dispatch<React.SetStateAction<T>> = React.useCallback(value => {
    if (!storage) return;

    void storage.setItem(key, value);
    setLocalValue(value as T);
  }, [key, storage]);


  /**
   * Initialize storage instance.
   */
  React.useEffect(() => {
    if (!instances.has(namespace)) {
      instances.set(namespace, localforage.createInstance({
        driver: localforage.LOCALSTORAGE,
        name: namespace,
        version: 1
      }));
    }

    setStorage(instances.get(namespace));
  }, [namespace, setStorage]);


  /**
   * Sync value from storage to local state.
   */
  React.useEffect(() => {
    if (!storage) return;

    void storage?.getItem<T>(key).then(valueFromStorage => {
    // If we got a value back from storage, set the local value accordingly.
      if (valueFromStorage !== null) {
        setLocalValue(valueFromStorage);
        return;
      }

      // If storage was empty and an initial value was provided, set it locally
      // and in storage.
      if (initialValue !== undefined) {
        setValue(initialValue);
        return;
      }
    });
  }, [
    initialValue,
    key,
    setValue,
    storage
  ]);


  return [localValue, setValue];
}


export function withNamespace(namespace: string) {
  function boundUseStorageItem<T = any>(key: string): UseStorageItem<T | undefined>;
  function boundUseStorageItem<T = any>(key: string, initialValue: T): UseStorageItem<T>;
  // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
  function boundUseStorageItem<T = any>(key: string, initialValue?: T) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useStorageItem(namespace, key, initialValue);
  }

  return boundUseStorageItem;
}


export default withNamespace;
