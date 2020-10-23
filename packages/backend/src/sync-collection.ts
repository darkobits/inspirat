import env from '@darkobits/env';
import AWS from 'aws-sdk';
import pQueue from 'p-queue';
import * as R from 'ramda';

import { UnsplashCollectionPhotoResource } from 'etc/types';
import { AWSHandler, AWSLambdaHandlerFactory } from 'lib/aws-lambda';
import chalk from 'lib/chalk';
import unsplashClient from 'lib/unsplash-client';
import { getAllPages } from 'lib/utils';


/**
 * Paths in each photo object that are used by Inspirat.
 */
const PHOTO_RESOURCE_PATHS = [
  ['id'],
  ['color'],
  ['blur_hash'],
  ['links', 'html'],
  ['location', 'title'],
  ['urls', 'full'],
  ['user', 'links', 'html'],
  ['user', 'name']
];


/**
 * Maximum page size allowed by Unsplash.
 */
const MAX_PAGE_SIZE = 30;


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
const handler: AWSHandler = async () => {
  const stage = env<string>('STAGE', true);


  // ----- [1] Get Unsplash Collection -----------------------------------------

  const collectionId = env<string>('UNSPLASH_COLLECTION_ID', true);
  const accessKey = env<string>('UNSPLASH_ACCESS_KEY', true);

  const unsplashPhotoCollection: Array<UnsplashCollectionPhotoResource> = await getAllPages(unsplashClient, {
    method: 'GET',
    url: `/collections/${collectionId}/photos`,
    params: { per_page: MAX_PAGE_SIZE }
  });

  // Collection is empty or some other error occurred.
  if (unsplashPhotoCollection.length === 0) {
    console.log('[sync-collection] Unsplash did not return any photos.');
    return;
  }

  console.log(`[sync-collection] Collection has ${chalk.green(unsplashPhotoCollection.length)} photos.`);


  // ----- [2] Get Full Photo Resources ----------------------------------------

  const queue = new pQueue({concurrency: 6});

  /**
   * The photo objects returned from the /collections endpoint do not contain
   * the full set of properties that a photo object from the /photos endpoint
   * does. Unfortunately, we need some of these properties, so we must make a
   * separate request to /photos for each photo in our response from
   * /collections.
   */
  const photoResources = await queue.addAll(R.map(photo => async () => {
    const { data } = await unsplashClient.request<UnsplashCollectionPhotoResource>({
      method: 'GET',
      url: `/photos/${photo.id}`,
      headers: {
        'Accept-Version': 'v1',
        'Authorization': `Client-ID ${accessKey}`
      }
    });

    return data;
  }, unsplashPhotoCollection));


  // ----- [3] Map Photo Resources ---------------------------------------------

  /**
   * Now, map each photo resource using the above 'paths' so that we only store
   * the properties we need.
   */
  const mappedPhotoResources = R.map(photo => {
    return R.reduce((photoPartial, curPath) => {
      return R.assocPath(curPath, R.path(curPath, photo), photoPartial);
    }, {}, PHOTO_RESOURCE_PATHS);
  }, photoResources);


  // ----- [4] Upload Collection to S3 -----------------------------------------

  const s3Client = new AWS.S3();
  const bucketName = `inspirat-${stage}`;
  const key = 'photoCollection';

  await s3Client.putObject({
    Bucket: bucketName,
    Key: key,
    ContentType: 'application/json',
    Body: JSON.stringify(mappedPhotoResources)
  }).promise();

  console.log(`[sync-collection] S3 bucket ${chalk.green(`${bucketName}/${key}`)} updated with ${chalk.green(photoResources.length)} items.`);
};


export default AWSLambdaHandlerFactory({ handler });
