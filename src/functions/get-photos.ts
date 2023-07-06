import env from '@darkobits/env';
import { InspiratPhotoResource } from 'etc/types';

import {
  AWSLambdaMiddleware,
  AWSLambdaHandlerFactory
} from 'functions/lib/aws-lambda';
import {
  setCorsHeaders,
  setVersionHeader
} from 'functions/lib/aws-lambda/middleware';
import { getJSON } from 'functions/lib/aws-s3';

// eslint-disable-next-line import/no-unresolved
import type { APIGatewayEvent } from 'aws-lambda';


// ----- Get Photos ------------------------------------------------------------

/**
 * Returns a JSON array of all photos from S3.
 *
 * N.B. This not in use at the moment as clients now fetch directly from S3.
 * Keeping it in place in the event we need to perform any server-side
 * transforms in the future, though this is not likely.
 */
const handler: AWSLambdaMiddleware = async ({ response }) => {
  const stage = env<string>('STAGE', true);
  const bucket = `inspirat-${stage}`;
  const key = 'photoCollections';

  const photoCollections = await getJSON<Array<InspiratPhotoResource>>({ bucket, key });

  if (!photoCollections) {
    response.statusCode = 500;
    response.body = { message: 'Response from S3 did not contain any photos.' };
    return;
  }

  response.body = photoCollections;
};


export default AWSLambdaHandlerFactory<APIGatewayEvent>({
  pre: [
    setCorsHeaders,
    setVersionHeader
  ],
  handler
});
