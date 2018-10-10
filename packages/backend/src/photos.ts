// @ts-ignore
import DynamoDBFactory from '@awspilot/dynamodb';
import {APIGatewayEvent} from 'aws-lambda';
import axios from 'axios';
import * as R from 'ramda';

import {UnsplashCollectionPhotoResource} from 'etc/types';
import {AWSLambdaFunction, AWSLambdaFunctionResponse} from 'lib/aws-helpers';
import chalk from 'lib/chalk';
import {getAllPages, isEmptyObject} from 'lib/utils';


// ----- Sync Collection -------------------------------------------------------

/**
 * This function queries the /collections API with our collection ID, which
 * will give us a list of all photos in our collection on Unsplash. This API is
 * paginated (with a max page size of 30) so any collection of non-trivial size
 * will require several API requests.
 *
 * Additionally, the /collections API doesn't return all the information we need
 * about photos (see next function below) so we only store the photo's 'id' in
 * the database. In a subsequent function call, we update the incomplete record
 * with a response from the /photos API.
 */
const syncCollection = AWSLambdaFunction({
  async handler(res, event, context) { // tslint:disable-line no-unused
    /**
     * Maximum page size allowed by Unsplash.
     */
    const MAX_PAGE_SIZE = 30;

    // Get all images in our collection from Unsplash.
    const unsplashPhotoCollection: Array<UnsplashCollectionPhotoResource> = await getAllPages({
      method: 'GET',
      url: `https://api.unsplash.com/collections/${process.env.UNSPLASH_COLLECTION_ID}/photos`,
      headers: {
        'Accept-Version': 'v1',
        'Authorization': `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`
      },
      params: {
        per_page: MAX_PAGE_SIZE
      }
    });

    if (!unsplashPhotoCollection.length) {
      console.warn('[syncCollection] Unsplash did not return any photos.');

      res.body = 'Unsplash did not return any photos.';
      return;
    }

    console.log(`[syncCollection] Collection has ${unsplashPhotoCollection.length} photos.`);

    const db = new DynamoDBFactory();
    const table = db.table(`inspirat-${process.env.STAGE}`);

    const results = await Promise.all(unsplashPhotoCollection.map(async (photo: any) => {
      const existingItem = await table.where('id').eq(photo.id).consistent_read().get();

      // We will get back a value like {} if the table doesn't have a record.
      // So, if we get a non-empty object, break.
      if (!isEmptyObject(existingItem)) {
        return false;
      }

      // Insert a partial record for the photo.
      await table.insert({id: photo.id, hasFullResults: false});

      console.log(`[syncCollection] Added partial record for photo "${photo.id}".`);
      return true;
    }));

    const numInsertions = R.filter<boolean>(R.identity, results).length;

    console.log(`[syncCollection] Added ${numInsertions} photos.`);

    res.body = `Added ${numInsertions} photos.`;
    return;
  }
});


// ----- Update Records --------------------------------------------------------

/**
 * This function scans our DynamoDB table, filters on records that are marked as
 * partial, then queries the Unsplash Photo API to convert the record to a full
 * photo record.
 *
 * During this process, it continuously checks our Unsplash rate limit and, if
 * the rate limit is hit, the process will abort.
 *
 * This function is scheduled to run periodically, ensuring that "eventually",
 * all partial records are updated to full records.
 *
 * -----------------------------------------------------------------------------
 *
 * Why do we need to store 'partial' records at all? Why not just store the
 * results we get from hitting the /collections API as photo records directly?
 *
 * Unsplash does not return a photo's "location" metadata in the /collections
 * API. Sadly, this is the only field we need that we don't get from that
 * endpoint. Because of this, we need to make an additional API request for
 * each photo in our collection in order to get all the information we need.
 *
 * Due to Unsplash's rate limits, we have to make these requests strategically.
 * Therefore, we track which records in the database are "partial" vs. "full"
 * and only hit the /photos endpoint for partial records.
 */
const updateRecords = AWSLambdaFunction({
  async handler(res, event, context) { // tslint:disable-line no-unused
    const db = new DynamoDBFactory();
    const table = db.table(`inspirat-${process.env.STAGE}`);
    const partialRecords = await table.having('hasFullResults').eq(false).scan();

    if (!partialRecords || partialRecords.length === 0) {
      res.body = 'No partial records needed updating.';
      return;
    }

    console.log(`[updateRecords] ${chalk.green(String(partialRecords.length))} records need updating.`);

    const results = await partialRecords.reduce<Promise<any>>(async (accumulatorPromise: any, curRecord: any) => {
      const accumulator = await accumulatorPromise;

      if (!accumulator.remainingRequests) {
        accumulator.items.push({id: curRecord.id, result: 'Rate limit reached.'});

        return accumulator;
      }

      let photoRes: any;

      try {
        photoRes = await axios({
          method: 'GET',
          url: `https://api.unsplash.com/photos/${curRecord.id}`,
          headers: {
            'Accept-Version': 'v1',
            'Authorization': `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`
          }
        });

        console.log(`[updateRecords] Received data for photo ${curRecord.id} from Unsplash.`);
      } catch (err) {
        // Rate limit had already been reached before this function was invoked.
        if (err.response && err.response.status === 403) {
          console.error(`[updateRecords] Unable to update photo ${curRecord.id}; rate limit reached.`);

          accumulator.remainingRequests = 0;
          accumulator.items.push({id: curRecord.id, result: 'Rate limit reached.'});
          return accumulator;
        }

        throw err;
      }

      accumulator.remainingRequests = Number(photoRes.headers['x-ratelimit-remaining']);

      const photo = photoRes.data;

      await table.where('id').eq(photo.id).update({
        ...R.omit(['id'], photo),
        hasFullResults: true
      });

      console.log(`[updateRecords] Record ${curRecord.id} updated in database.`);

      accumulator.items.push({id: photo.id, result: 'Item updated.'});

      return accumulator;
    }, Promise.resolve({
      message: 'OK',
      remainingRequests: 1,
      items: []
    }));

    res.body = {
      message: 'OK',
      results
    };
  }
});


// ----- Get Photos ------------------------------------------------------------

/**
 * Middleware that sets appropriate CORS headers on the provided response.
 */
function setCorsHeaders(res: AWSLambdaFunctionResponse) {
  res.headers['Access-Control-Allow-Origin'] = '*';
  res.headers['Access-Control-Allow-Credentials'] = 'true';
}


/**
 * This function returns all "full" photo records from the database.
 */
const getPhotos = AWSLambdaFunction<APIGatewayEvent>({
  pre: [setCorsHeaders],
  async handler(res, event, context) { // tslint:disable-line no-unused
    const db = new DynamoDBFactory();
    const table = db.table(`inspirat-${process.env.STAGE}`);
    const photos = await table.having('hasFullResults').eq(true).scan();

    // Return only the information we need in the client.
    res.body = photos.map((photo: any) => {
      return {
        id: R.path(['id'], photo),
        urls: {
          full: R.path(['urls', 'full'], photo),
        },
        location: {
          title: R.path(['location', 'title'], photo)
        },
        user: {
          name: R.path(['user', 'name'], photo)
        },
        color: R.path(['color'], photo)
      };
    });
  }
});


export {
  syncCollection,
  updateRecords,
  getPhotos
};
