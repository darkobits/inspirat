// @ts-ignore
import DynamoDBFactory from '@awspilot/dynamodb';
import * as R from 'ramda';

import {UnsplashCollectionPhotoResource} from 'etc/types';
import {AWSLambdaFunction} from 'lib/aws-helpers';
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
export default AWSLambdaFunction({
  async handler(res/* , event, context */) {
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

    console.log(`[syncCollection] Collection has ${chalk.green(unsplashPhotoCollection.length.toString())} photos.`);

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

      console.log(`[syncCollection] Added partial record for photo ${chalk.green(photo.id)}.`);
      return true;
    }));

    const numInsertions = R.filter<boolean>(R.identity, results).length;

    console.log(`[syncCollection] Added ${chalk.green(numInsertions.toString())} photos.`);

    res.body = `Added ${numInsertions} photos.`;
    return;
  }
});
