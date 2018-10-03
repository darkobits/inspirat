import '@babel/polyfill';
import {Context} from 'aws-lambda';
import axios from 'axios';
import parseLinkHeader from 'parse-link-header';
import {buildResponse} from 'lib/utils';


/**
 * Unsplash ID of our collection.
 */
const COLLECTION_ID = '2742109';


/**
 * Maximum page size allowed by Unsplash.
 */
const MAX_PAGE_SIZE = 30;


/**
 * Axios client with our client token bound to it.
 */
const client = axios.create({
  headers: {
    'Accept-Version': 'v1',
    'Authorization': `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`
  }
});


/**
 * Provided a URL for an API that returns "link" headers containing pagination
 * hints, fetches all pages and returns the results.
 */
async function getAllPages(url: string): Promise<Array<any>> {
  const page = await client({
    method: 'GET',
    url,
    headers: {
      'Accept-Version': 'v1',
      'Authorization': `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`
    },
    params: {
      per_page: MAX_PAGE_SIZE
    }
  });

  // Response has no pagination information; return data.
  if (!page.headers.link) {
    return page.data;
  }

  const parsedLinkHeader = parseLinkHeader(page.headers.link);

  if (!parsedLinkHeader) {
    throw new Error('Response contained a "link" header, but it was not parseable.');
  }

  // Last page has been reached.
  if (!parsedLinkHeader.next) {
    return page.data;
  }

  // Additional pages are available.
  return page.data.concat(await getAllPages(parsedLinkHeader.next.url));
}


/**
 * Fetches all images in the Front Lawn collection on Unsplash.
 */
export async function handler(event: any, context: Context) { // tslint:disable-line no-unused
  try {
    const collection = await getAllPages(`https://api.unsplash.com/collections/${COLLECTION_ID}/photos`);

    if (!collection.length) {
      return buildResponse({statusCode: 500, body: 'The collection does not contain any photos.'});
    }

    const photosInCollection = await Promise.all(collection.map(async (photo: any) => {
      const res = await client.get(`https://api.unsplash.com/photos/${photo.id}`);
      return res.data;
    }));

    return buildResponse({body: photosInCollection});
  } catch (err) {
    return buildResponse(err);
  }
}
