import '@babel/polyfill';
import {Context} from 'aws-lambda';
import axios from 'axios';
import {buildResponse} from 'lib/utils';


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
 * Fetches all images in the Front Lawn collection on Unsplash.
 */
export async function handler(event: any, context: Context) { // tslint:disable-line no-unused
  try {
    const params = event.queryStringParameters;

    if (!params.id) {
      return buildResponse({
        statusCode: 400,
        body: 'Bad request.'
      });
    }

    const res = await client.get(`https://api.unsplash.com/photos/${params.id}/download`);

    console.log('Got response from Unsplash:', res.data);

    return buildResponse({body: 'OK'});
  } catch (err) {
    return buildResponse(err);
  }
}
