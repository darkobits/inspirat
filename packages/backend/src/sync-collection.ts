import env from '@darkobits/env';
import LogFactory from '@darkobits/log';
import pQueue from 'p-queue';
import pRetry from 'p-retry';
import pSeries from 'p-series';
import prettyMs from 'pretty-ms';
import * as R from 'ramda';
import { InspiratPhotoCollection, InspiratPhotoResource } from 'inspirat-common/types';

import { AWSLambdaMiddleware, AWSLambdaHandlerFactory } from 'lib/aws-lambda';
import { getJSON, putJSON } from 'lib/aws-s3';
import getPalette from 'lib/get-palette';
import {
  getPhotoIdsForCollection,
  getPhoto,
  getCollection
} from 'lib/unsplash';


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

const log = LogFactory({ heading: 'sync-collections' });

const asyncTaskQueue = new pQueue({ concurrency: 4 });


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
const handlerImpl: AWSLambdaMiddleware = async () => {
  const startTime = Date.now();

  const STAGE = env('STAGE', true);
  log.info(log.prefix('stage'), log.chalk.green(STAGE));

  const BUCKET_NAME = env<string>('BUCKET_NAME', true);
  log.info(log.prefix('bucket'), log.chalk.green(BUCKET_NAME));

  const key = 'photoCollections';

  let totalPhotos = 0;
  let totalAdditions = 0;
  let totalDeletions = 0;

  let inspiratPhotoCollections: Array<InspiratPhotoCollection>;

  try {
    inspiratPhotoCollections = await getJSON<Array<InspiratPhotoCollection>>({
      bucket: BUCKET_NAME,
      key
    }) ?? [];

    log.info(log.prefix('S3'), `Found ${log.chalk.green(inspiratPhotoCollections.length)} collections.`);
  } catch (err: any) {
    log.error(log.prefix('S3'), `Error fetching collections from S3: ${err.message}`);
    inspiratPhotoCollections = [];
  }

  /**
   * Map our list of collection IDs into a list of Inspirat photo collection
   * objects. This process will conserve existing photos, handle new photos, and
   * ensure deleted photos are removed.
   */
  const body = await pSeries(R.map(collectionId => async () => {
    const inspiratCollection = R.find(R.propEq('id', collectionId), inspiratPhotoCollections);

    const [collectionMeta, collectionPhotoIds] = await Promise.all([
      getCollection(collectionId),
      getPhotoIdsForCollection(collectionId)
    ]);

    if (inspiratCollection) {
      log.info(`Processing collection ${log.chalk.bold(collectionMeta.title)} (${log.chalk.green(inspiratCollection.photos.length)} synced photos)...`);
    } else {
      log.info(`Processing ${log.chalk.bold('new')} collection ${log.chalk.bold(collectionMeta.title)}...`);
    }

    log.info(`├─ Collection contains ${log.chalk.yellow(collectionPhotoIds.length)} photos on Unsplash.`);

    // Compute a list of all photo IDs found in the Unsplash collection that are
    // not in the current collection.
    const photoIdsToAdd = R.differenceWith(
      (id, photo) => id === photo.id,
      collectionPhotoIds,
      inspiratCollection?.photos ?? []
    );

    const photosToAdd = R.reject(R.isNil, await asyncTaskQueue.addAll(photoIdsToAdd.map(photoId => async () => {
      log.info(`├─ Computing data for new photo ${log.chalk.green(photoId)}.`);

      try {
        return await pRetry(async () => computeInspiratPhotoData(photoId), {
          retries: 4,
          onFailedAttempt: error => {
            log.error(
              '├─ ',
              log.chalk.red(
                `Attempt ${error.attemptNumber} failed to compute data for photo ${log.chalk.green(photoId)}.`,
                `Retries remaining: ${log.chalk.yellow(error.retriesLeft)}`
              )
            );
          }
        });
      } catch (err) {
        log.error(
          '├─ ',
          log.chalk.red(`Unable to add photo ${log.chalk.green(photoId)}`, err)
        );
      }
    })));

    // Filter the existing list of photos based on whether its ID appears in the
    // Unsplash collection. This ensures that if a photo is deleted from an
    // Unsplash collection, it will be removed here as well.
    const photosToKeep = R.filter(
      photo => R.includes(photo.id, collectionPhotoIds),
      inspiratCollection?.photos ?? []
    );

    const numDeletedPhotos = inspiratCollection ? inspiratCollection.photos.length - collectionPhotoIds.length : 0;
    const photos = R.sortBy(R.prop('id'), R.concat(photosToAdd, photosToKeep));

    log.info([
      `└─ ${log.chalk.green(photoIdsToAdd.length)} photos added, `,
      `${log.chalk.yellow(numDeletedPhotos)} photos removed.`
    ].join(''));

    totalPhotos += photos.length;
    totalAdditions += photoIdsToAdd.length;
    totalDeletions += numDeletedPhotos;

    log.info('');

    return {
      id: collectionId,
      title: collectionMeta.title,
      photos
    } as InspiratPhotoCollection;
  }, COLLECTION_IDS));


  // ----- [4] Upload Collection to S3 -----------------------------------------

  await putJSON({
    bucket: BUCKET_NAME,
    key,
    body
  });

  log.info(`S3 bucket ${log.chalk.blue(`${BUCKET_NAME}/${key}`)} updated.`);

  log.info(`Totals: ${log.chalk.green(totalAdditions)} additions, ${log.chalk.yellow(totalDeletions)} deletions, ${log.chalk.bold(totalPhotos)} photos across all collections.`);

  const runTime = Date.now() - startTime;
  log.info(`Done in ${log.chalk.yellow(prettyMs(runTime))}`);
};


export const handler = AWSLambdaHandlerFactory({
  handler: handlerImpl
});
