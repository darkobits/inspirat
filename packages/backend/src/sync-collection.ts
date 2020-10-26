import env from '@darkobits/env';
import pQueue from 'p-queue';
import * as R from 'ramda';

import {
  InspiratPhotoResource,
  UnsplashCollectionPhotoResource
} from 'etc/types';
import {
  AWSLambdaMiddleware,
  AWSLambdaHandlerFactory
} from 'lib/aws-lambda';
import { getJSON, putJSON } from 'lib/aws-s3';
import chalk from 'lib/chalk';
import getPalette from 'lib/get-palette';
import unsplashClient from 'lib/unsplash-client';
import { getAllPages } from 'lib/utils';


/**
 * Paths in each photo object that are used by Inspirat.
 */
const PHOTO_RESOURCE_PATHS = [
  ['id'],
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
const handler: AWSLambdaMiddleware = async () => {
  const stage = env<string>('STAGE', true);
  const bucket = `inspirat-${stage}`;
  const key = 'photoCollection';


  // ----- [1] Fetch Existing Photo Collection ---------------------------------

  const inspiratPhotoCollection = await getJSON<Array<InspiratPhotoResource>>({ bucket, key }) ?? [];
  console.log(`[sync-collection] Inspirat collection contains ${chalk.green(inspiratPhotoCollection.length)} photos.`);


  // ----- [2] Fetch Unsplash Photo Collection ---------------------------------

  const collectionId = env<string>('UNSPLASH_COLLECTION_ID', true);

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

  console.log(`[sync-collection] Unsplash collection has ${chalk.green(unsplashPhotoCollection.length)} photos.`);


  // ----- [3] Get Full Photo Resources ----------------------------------------

  const queue = new pQueue({concurrency: 32});

  /**
   * The photo objects returned from the /collections endpoint do not contain
   * the full set of properties that a photo object from the /photos endpoint
   * does. Unfortunately, we need some of these properties, so we must make a
   * separate request to /photos for each photo in our response from
   * /collections.
   */
  const inspiratPhotoResources = await queue.addAll(R.map(unsplashPhotoCollectionResource => async () => {
    // Determine if the photo already exists in the collection.
    const existingPhoto = R.find(R.propEq('id', unsplashPhotoCollectionResource.id), inspiratPhotoCollection);

    // If the photo is already in the collection, re-use existing photo data.
    // This will save us an additional Unsplash API request and the expensive
    // dominant color computation step.
    // Note: If the shape of photo objects ever changes, this check will need to
    // be temporarily disabled.
    if (existingPhoto) {
      console.log(`[sync-collection] Reusing data for existing photo ${chalk.green(unsplashPhotoCollectionResource.id)}.`);
      return existingPhoto;
    }

    console.log(`[sync-collection] Compiling new photo ${chalk.yellow(unsplashPhotoCollectionResource.id)}.`);

    // Otherwise, fetch the full photo resource from the Unsplash API.
    const { data: unsplashPhotoResource } = await unsplashClient.request<UnsplashCollectionPhotoResource>({
      method: 'GET',
      url: `/photos/${unsplashPhotoCollectionResource.id}`
    });

    // Extract selected paths from the photo resource.
    const inspiratPhotoResource = R.reduce((photoPartial, curPath) => {
      return R.assocPath(curPath, R.path(curPath, unsplashPhotoResource), photoPartial);
    }, {} as InspiratPhotoResource, PHOTO_RESOURCE_PATHS);

    // Compute dominant colors for the photo.
    inspiratPhotoResource.palette = await getPalette(unsplashPhotoResource.urls.regular);

    return inspiratPhotoResource;
  }, unsplashPhotoCollection));


  // ----- [4] Upload Collection to S3 -----------------------------------------

  await putJSON({ bucket, key, body: inspiratPhotoResources });
  console.log(`[sync-collection] S3 bucket ${chalk.green(`${bucket}/${key}`)} updated with ${chalk.green(inspiratPhotoResources.length)} items.`);
};


export default AWSLambdaHandlerFactory({ handler });
