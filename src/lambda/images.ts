import '@babel/polyfill';
import {Context} from 'aws-lambda';
import axios from 'axios';
import {buildResponse} from 'lib/utils';


/**
 * Axios client bound to the Unsplash API.
 */
const client = axios.create({
  method: 'GET',
  baseURL: 'https://api.unsplash.com',
  headers: {
    'Accept-Version': 'v1',
    'Authorization': `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`
  }
});


/**
 * Fetches all images in the Front Lawn collection on Unsplash.
 */
export async function handler(event: any, context: Context) { // tslint:disable-line no-unused
  try {
    const collection = await client.get('collections/2742109/photos');

    if (!collection.data.length) {
      return buildResponse({statusCode: 500, body: 'The collection does not contain any photos.'});
    }

    const photosInCollection = await Promise.all(collection.data.map(async (photo: any) => {
      const res = await client.get(`photos/${photo.id}`);
      return res.data;
    }));

    return buildResponse({body: photosInCollection});
  } catch (err) {
    return buildResponse(err);
  }
}
