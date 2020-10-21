import env from '@darkobits/env';
import AWS from 'aws-sdk';
// import * as R from 'ramda';

import { UnsplashCollectionPhotoResource } from 'etc/types';
// import { getQueueHandle } from 'lib/aws-helpers';
import { AWSLambdaHandlerFactory } from 'lib/aws-lambda';
import chalk from 'lib/chalk';
import { getAllPages } from 'lib/utils';


// ----- Sync Collection -------------------------------------------------------

/**
 * This function queries the /collections API with our Unsplash collection ID,
 * which will give us a list of all photos in our collection on Unsplash. This
 * API is paginated (with a max page size of 30) so any collection of
 * non-trivial size will require several API requests.
 *
 * Additionally, the /collections API doesn't return all the information we need
 * about photos (see next function below) so we only store the photo's 'id' in
 * the database. In a subsequent function call, we update the incomplete record
 * with a response from the /photos API.
 */
export default AWSLambdaHandlerFactory({
  handler: async res => {
    const stage = env<string>('STAGE', true);

    /**
     * Maximum page size allowed by Unsplash.
     */
    const MAX_PAGE_SIZE = 30;


    // ----- [1] Get Unsplash Collection ---------------------------------------

    const collectionId = env<string>('UNSPLASH_COLLECTION_ID', true);
    const accessKey = env<string>('UNSPLASH_ACCESS_KEY', true);

    const unsplashPhotoCollection: Array<UnsplashCollectionPhotoResource> = await getAllPages({
      method: 'GET',
      url: `https://api.unsplash.com/collections/${collectionId}/photos`,
      headers: {
        'Accept-Version': 'v1',
        'Authorization': `Client-ID ${accessKey}`
      },
      params: {
        per_page: MAX_PAGE_SIZE
      }
    });

    // Collection is empty or some other error occurred.
    if (unsplashPhotoCollection.length === 0) {
      console.warn('[sync-collection] Unsplash did not return any photos.');

      res.body = {
        message: 'Unsplash did not return any photos.'
      };

      return;
    }

    console.log(`[sync-collection] Collection has ${chalk.green(unsplashPhotoCollection.length.toString())} photos.`);


    // ----- [2] Upload Collection to S3 ---------------------------------------

    const s3Client = new AWS.S3();
    const bucketName = `inspirat-${stage}`;
    const key = 'photoCollection';

    await s3Client.putObject({
      Bucket: bucketName,
      Key: key,
      ContentType: 'application/json',
      Body: JSON.stringify(unsplashPhotoCollection)
    }).promise();

    console.log(`[sync-collection] Updated S3 object ${bucketName}/${key}.`);

    res.body = {
      message: 'Done.'
    };
  }
});
