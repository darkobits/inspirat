// @ts-ignore
import DynamoDBFactory from '@awspilot/dynamodb';
import axios from 'axios';
import * as R from 'ramda';

import {AWSLambdaFunction} from 'lib/aws-helpers';
import chalk from 'lib/chalk';


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
export default AWSLambdaFunction({
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
