// @ts-ignore
import DynamoDBFactory from '@awspilot/dynamodb';
import env from '@darkobits/env';
import * as R from 'ramda';

import {UnsplashCollectionPhotoResource} from 'etc/types';
import {getQueueHandle} from 'lib/aws-helpers';
import {AWSLambdaFunction} from 'lib/aws-lambda';
import chalk from 'lib/chalk';
import {getAllPages, isEmptyObject} from 'lib/utils';


// ----- Sync Collection -------------------------------------------------------

/**
 * This function queries the /collections API with our Unsplashcollection ID,
 * which will give us a list of all photos in our collection on Unsplash. This
 * API is paginated (with a max page size of 30) so any collection of
 * non-trivial size will require several API requests.
 *
 * Additionally, the /collections API doesn't return all the information we need
 * about photos (see next function below) so we only store the photo's 'id' in
 * the database. In a subsequent function call, we update the incomplete record
 * with a response from the /photos API.
 */
export default AWSLambdaFunction({
  async handler(res) {
    /**
     * Maximum page size allowed by Unsplash.
     */
    const MAX_PAGE_SIZE = 30;


    // ----- [1] Get Unsplash Collection ---------------------------------------

    const unsplashPhotoCollection: Array<UnsplashCollectionPhotoResource> = await getAllPages({
      method: 'GET',
      url: `https://api.unsplash.com/collections/${env('UNSPLASH_COLLECTION_ID', true)}/photos`,
      headers: {
        'Accept-Version': 'v1',
        'Authorization': `Client-ID ${env('UNSPLASH_ACCESS_KEY', true)}`
      },
      params: {
        per_page: MAX_PAGE_SIZE
      }
    });

    if (!unsplashPhotoCollection.length) {
      console.warn('[syncCollection] Unsplash did not return any photos.');

      res.body = {
        message: 'Unsplash did not return any photos.'
      };

      return;
    }

    console.log(`[sync-collection] Collection has ${chalk.green(unsplashPhotoCollection.length.toString())} photos.`);


    // ----- [2] Create Resource Handles ---------------------------------------

    const table = new DynamoDBFactory().table(`inspirat-${env('STAGE', true)}`);
    const queueHandle = await getQueueHandle(`inspirat-${env('STAGE', true)}`);


    // ----- [3] Handle Additions ----------------------------------------------

    const additionResults = await Promise.all(unsplashPhotoCollection.map(async (photo: any) => {
      // Determine if the photo already exists in the database.
      const existingItem = await table.where('id').eq(photo.id).consistent_read().get();

      // We will get back a value like {} if the table doesn't have a record.
      // So, if we get a non-empty object, break.
      if (!isEmptyObject(existingItem)) {
        return false;
      }

      // Post a message to our queue indicating that a new photo needs to be
      // added to the database.
      await queueHandle.sendMessage({
        // @ts-ignore
        MessageBody: JSON.stringify({
          id: photo.id
        })
      }).promise();

      console.log(`[syncCollection] Message posted for ${chalk.green(photo.id)}.`);

      return true;
    }));

    const numAdditions = R.filter<boolean>(R.identity, additionResults).length;

    console.log(`[sync-collection] Added ${chalk.green(numAdditions.toString())} photos.`);


    // ----- [4] Handle Deletions ----------------------------------------------

    const allExistingItems: Array<any> = await table.consistent_read().scan();

    const deletionResults = await Promise.all(allExistingItems.map(async (photo: any) => {
      // Determine if the record from the database exists in our collection from
      // Unsplash.
      const itemInUnsplashCollection = R.find(R.propEq('id', photo.id), unsplashPhotoCollection);

      // If not, remove it from the database.
      if (!itemInUnsplashCollection) {
        await table.where('id').eq(photo.id).delete();
        return true;
      }

      return false;
    }));

    const numDeletions = R.filter<boolean>(R.identity, deletionResults).length;

    console.log(`[sync-collection] Deleted ${chalk.green(numDeletions.toString())} photos.`);

    res.body = {
      added: numAdditions,
      deleted: numDeletions
    };
  }
});
