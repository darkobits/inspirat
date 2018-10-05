export default function setTitle() {
  if (location.hostname.includes('frontlawn.net')) {
    document.title = 'Front Lawn';
  } else {
    document.title = 'Inspirat';
  }
}
