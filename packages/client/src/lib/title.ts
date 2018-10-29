/**
 * Returns the document title to use based on the current hostname.
 */
export default function setTitle() {
  if (location.hostname.includes('frontlawn.net')) {
    document.title = 'Front Lawn';
  } else {
    document.title = 'New Tab';
  }
}
