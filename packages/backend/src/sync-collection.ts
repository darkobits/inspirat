import env from '@darkobits/env';
import { InspiratPhotoCollection, InspiratPhotoResource } from 'inspirat-types';
import pQueue from 'p-queue';
import pSeries from 'p-series';
import prettyMs from 'pretty-ms';
import * as R from 'ramda';

import {
  AWSLambdaMiddleware,
  AWSLambdaHandlerFactory
} from 'lib/aws-lambda';
import { getJSON, putJSON } from 'lib/aws-s3';
import chalk from 'lib/chalk';
import getPalette from 'lib/get-palette';
import { getPhotoIdsForCollection, getPhoto } from 'lib/unsplash';


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


const asyncTaskQueue = new pQueue({ concurrency: 10 });


/**
 * Provided a photo ID, computes its dominant colors and returns an Inspirat
 * photo resource object.
 */
async function computeInspiratPhotoData(unsplashPhotoId: string): Promise<InspiratPhotoResource> {
  // Fetch the photo from Unsplash.
  const unsplashPhotoResource = await getPhoto(unsplashPhotoId);

  // Extract selected paths from the photo.
  const inspiratPhotoResource = R.reduce((photoPartial, curPath) => {
    return R.assocPath(curPath, R.path(curPath, unsplashPhotoResource), photoPartial);
  }, {} as InspiratPhotoResource, PHOTO_RESOURCE_PATHS);

  // Compute the photo's dominant colors.
  inspiratPhotoResource.palette = await getPalette(unsplashPhotoResource.urls.regular);

  return inspiratPhotoResource;
}


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
  const startTime = Date.now();

  const stage = env<string>('STAGE', true);
  const bucket = `inspirat-${stage}`;
  const key = 'photoCollection';

  let totalPhotos = 0;
  let totalAdditions = 0;
  let totalDeletions = 0;

  let inspiratPhotoCollections: Array<InspiratPhotoCollection>;

  try {
    inspiratPhotoCollections = await getJSON<Array<InspiratPhotoCollection>>({ bucket, key }) ?? [];
    console.log(`[sync-collections] Inspirat data contains ${chalk.green(inspiratPhotoCollections.length)} collections.`);
  } catch (err) {
    console.error(`[sync-collections] Error fetching existing collections: ${err.message}`);
    inspiratPhotoCollections = [];
  }

  const COLLECTION_IDS = [
    // Primary
    '2742109',
    // Spring
    '81172058',
    // Summer
    '25786504',
    // Autumn
    '3340319',
    // Winter
    '64480821'
  ];


  /**
   * Map our list of collection IDs into a list of Inspirat photo collection
   * objects. This process will conserve existing photos, handle new photos, and
   * ensure deleted photos are removed.
   */
  const body = await pSeries(R.map(collectionId => async () => {
    const inspiratCollection = R.find(R.propEq('id', collectionId), inspiratPhotoCollections);

    if (inspiratCollection) {
      console.log(`[sync-collections] Processing collection ${chalk.blue(collectionId)} (${chalk.green(inspiratCollection.photos.length)} existing photos)...`);
    } else {
      console.log(`[sync-collections] Processing ${chalk.bold('new')} collection ${chalk.green(collectionId)}...`);
    }

    const unsplashCollectionIds = await getPhotoIdsForCollection(collectionId);
    console.log(`[sync-collections] Unsplash collection contains ${chalk.green(unsplashCollectionIds.length)} photos.`);

    // Compute a list of all photo IDs found in the Unsplash collection that are
    // not in the current collection.
    const photoIdsToAdd = R.differenceWith(
      (id, photo) => id === photo.id,
      unsplashCollectionIds,
      inspiratCollection?.photos ?? []
    );

    const photosToAdd = await asyncTaskQueue.addAll(photoIdsToAdd.map(photoId => async () => {
      console.log(`[sync-collections] Computing data for new photo ${chalk.green(photoId)}.`);
      return computeInspiratPhotoData(photoId);
    }));

    // Filter the existing list of photos based on whether its ID appears in the
    // Unsplash collection. This ensures that if a photo is deleted from an
    // Unsplash collection, it will be removed here as well.
    const photosToKeep = R.filter(
      photo => R.includes(photo.id, unsplashCollectionIds),
      inspiratCollection?.photos ?? []
    );

    const numDeletedPhotos = inspiratCollection ? inspiratCollection.photos.length - unsplashCollectionIds.length : 0;
    const photos = R.sortBy(R.prop('id'), R.concat(photosToAdd, photosToKeep));

    console.log([
      `[sync-collections] ${chalk.green(photoIdsToAdd.length)} photos added, `,
      `${chalk.yellow(numDeletedPhotos)} photos removed.`
    ].join(''));

    totalPhotos += photos.length;
    totalAdditions += photoIdsToAdd.length;
    totalDeletions += numDeletedPhotos;

    return { id: collectionId, photos };
  }, COLLECTION_IDS));


  // ----- [4] Upload Collection to S3 -----------------------------------------

  await putJSON({ bucket, key, body });
  console.log(`[sync-collections] S3 bucket ${chalk.blue(`${bucket}/${key}`)} updated.`);

  console.log(`[sync-collections] Totals: ${chalk.green(totalAdditions)} additions, ${chalk.yellow(totalDeletions)} deletions, ${chalk.bold(totalPhotos)} photos across all collections.`);

  const runTime = Date.now() - startTime;
  console.log(`[sync-collections] Done in ${prettyMs(runTime)}`);
};


export default AWSLambdaHandlerFactory({ handler });
