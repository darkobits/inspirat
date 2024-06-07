import LocalForage from 'localforage';

type LocalForageOptions = Parameters<typeof LocalForage['createInstance']>[0];

const defaultOptions: LocalForageOptions = {
  driver: LocalForage.LOCALSTORAGE,
  name: 'inspirat',
  version: 1,
  description: 'Inspirat'
};

const storage = LocalForage.createInstance(defaultOptions);

const originalCreateInstance = storage.createInstance.bind(storage);

storage.createInstance = (options: LocalForageOptions) => {
  return Reflect.apply(originalCreateInstance, storage, [{
    ...defaultOptions,
    ...options
  }]);
};

export default storage;
