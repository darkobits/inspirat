import env from '@darkobits/env';
import { APIGatewayEvent } from 'aws-lambda';
import AWS from 'aws-sdk';
import * as R from 'ramda';

import {
  AWSLambdaHandlerFactory,
  setCorsHeaders,
  setVersionHeader
} from 'lib/aws-lambda';
import { UnsplashCollectionPhotoResource } from './etc/types';


const paths = [
  ['id'],
  ['color'],
  ['blur_hash'],
  ['links', 'html'],
  ['location', 'title'],
  ['urls', 'full'],
  ['user', 'links', 'html'],
  ['user', 'name']
];

// https://hnxuk9tl80.execute-api.us-west-1.amazonaws.com/dev/photos

// ----- Get Photos ------------------------------------------------------------

/**
 * This function returns all "full" photo records from the database.
 *
 * This is the only function exposed to the public via API Gateway.
 */
export default AWSLambdaHandlerFactory<APIGatewayEvent>({
  pre: [setCorsHeaders, setVersionHeader],
  handler: async res => {
    const stage = env<string>('STAGE', true);
    const s3Client = new AWS.S3();
    const bucketName = `inspirat-${stage}`;
    const key = 'photoCollection';

    const photosResponse = await s3Client.getObject({
      Bucket: bucketName,
      Key: key,
      ResponseContentType: 'application/json'
    }).promise();

    if (!photosResponse.Body) {
      res.body = { message: 'Unknown error.' };
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    const parsedResponse: Array<UnsplashCollectionPhotoResource> = JSON.parse(photosResponse.Body.toString('utf8'));

    const mappedPhotoCollection = R.map(photo => {
      return R.reduce((photoPartial, curPath) => {
        return R.assocPath(curPath, R.path(curPath, photo), photoPartial);
      }, {}, paths);
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    }, parsedResponse);

    res.body = mappedPhotoCollection;
  }
});
