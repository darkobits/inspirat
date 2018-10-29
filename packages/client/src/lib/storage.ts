import localforage from 'localforage';


const storage = localforage.createInstance({
  driver: localforage.LOCALSTORAGE,
  name: 'inspirat',
  version: 1,
  description: 'Inspirat'
});


export default storage;
