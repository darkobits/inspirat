import { AxiosRequestConfig, AxiosInstance } from 'axios';
import parseLinkHeader from 'parse-link-header';


/**
 * Provided a URL for an API that returns "link" headers containing pagination
 * hints, fetches all pages and returns the results.
 */
export async function getAllPages(instance: AxiosInstance, options: AxiosRequestConfig): Promise<Array<any>> {
  const page = await instance.request(options);

  // Response has no pagination information; return data.
  if (!page.headers.link) {
    return page.data;
  }

  const parsedLinkHeader = parseLinkHeader(page.headers.link);

  if (!parsedLinkHeader) {
    throw new Error('Response contained a "link" header, but it was not parsable.');
  }

  // Last page has been reached.
  if (!parsedLinkHeader.next) {
    return page.data;
  }

  // Otherwise, if additional pages are available, make the next request using
  // the same request configuration provided.
  return page.data.concat(await getAllPages(instance, {
    ...options,
    url: parsedLinkHeader.next.url
  }));
}


/**
 * Returns true if any element in the provided array is an instance of Error.
 */
export function containsErrors(arr: Array<any>): boolean {
  return Boolean(arr.find(item => item instanceof Error));
}
