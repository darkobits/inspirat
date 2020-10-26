import env from '@darkobits/env';
import { APIGatewayEvent } from 'aws-lambda';

import { InspiratPhotoResource } from 'etc/types';
import {
  AWSLambdaMiddleware,
  AWSLambdaHandlerFactory
} from 'lib/aws-lambda';
import {
  setCorsHeaders,
  setVersionHeader
} from 'lib/aws-lambda/middleware';
import { getJSON } from 'lib/aws-s3';


// ----- Get Photos ------------------------------------------------------------

/**
 * Returns a JSON array of all photos from S3.
 */
const handler: AWSLambdaMiddleware = async ({ response }) => {
  const stage = env<string>('STAGE', true);
  const bucket = `inspirat-${stage}`;
  const key = 'photoCollection';

  const photoCollection = await getJSON<Array<InspiratPhotoResource>>({ bucket, key });

  if (!photoCollection) {
    response.statusCode = 500;
    response.body = { message: 'Response from S3 did not contain any photos.' };
    return;
  }

  response.body = photoCollection;
};


export default AWSLambdaHandlerFactory<APIGatewayEvent>({
  pre: [
    setCorsHeaders,
    setVersionHeader
  ],
  handler
});
