import https from 'https';

import env from '@darkobits/env';
import axios, { AxiosRequestConfig } from 'axios';
import parseLinkHeader from 'parse-link-header';
import * as R from 'ramda';

import type {
  UnsplashCollectionPhotoResource,
  UnsplashCollection
} from 'common/types';


/**
 * @private
 *
 * Maximum page size allowed by Unsplash.
 */
const MAX_PAGE_SIZE = 30;


/**
 * @private
 *
 * Create an HTTPS Agent that uses Keep Alive.
 */
const httpsAgent = new https.Agent({ keepAlive: true });


/**
 * Axios instance bound to Unsplash using our credentials.
 */
const client = axios.create({
  baseURL: 'https://api.unsplash.com/',
  headers: {
    'Accept-Version': 'v1',
    'Authorization': `Client-ID ${env<string>('UNSPLASH_ACCESS_KEY', true)}`
  },
  httpsAgent
});


/**
 * @private
 *
 * Provided a URL for an API that returns "link" headers containing pagination
 * hints, fetches all pages and returns the results.
 */
async function getAllPages<T = any>(options: AxiosRequestConfig): Promise<Array<T>> {
  const page = await client.request(options);

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
  const nextPage = await getAllPages({
    ...options,
    url: parsedLinkHeader.next.url
  });

  return [...page.data, ...nextPage];
}


/**
 * Provided a collection ID, returns metadata about the collection.
 */
export async function getCollection(collectionId: string) {
  const res = await client.request<UnsplashCollection>({
    method: 'GET',
    url: `/collections/${collectionId}`
  });

  return res.data;
}


/**
 * Provided an Unsplash photo collection ID, returns a list of IDs for all
 * photos in the collection.
 */
export async function getPhotoIdsForCollection(collectionId: string) {
  const unsplashCollectionPhotos = await getAllPages<UnsplashCollectionPhotoResource>({
    method: 'GET',
    url: `/collections/${collectionId}/photos`,
    params: { per_page: MAX_PAGE_SIZE }
  });

  return R.map(R.prop('id'), unsplashCollectionPhotos);
}


/**
 * Provided a photo ID, returns a photo resource.
 */
export async function getPhoto(photoId: string) {
  const { data: unsplashPhotoResource } = await client.request<UnsplashCollectionPhotoResource>({
    method: 'GET',
    url: `/photos/${photoId}`
  });

  return unsplashPhotoResource;
}


export default client;
