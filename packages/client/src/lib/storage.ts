import localforage from 'localforage';


const storage = localforage.createInstance({
  driver      : localforage.LOCALSTORAGE,
  name        : 'frontlawn.net',
  version     : 1,
  // storeName   : 'frontlawn_net',
  description : 'Front Lawn Netwerks'
});


export default storage;
