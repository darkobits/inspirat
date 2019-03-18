/**
 * Sets the document's title based on the domain/context the application is
 * running in.
 */
export default function setTitle() {
  document.title = location.hostname.includes('frontlawn.net') ? 'Front Lawn' : 'New Tab';
}
