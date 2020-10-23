import env from '@darkobits/env';
import { APIGatewayEvent } from 'aws-lambda';
import AWS from 'aws-sdk';

import {
  AWSHandler,
  AWSLambdaHandlerFactory,
  setCorsHeaders,
  setVersionHeader
} from 'lib/aws-lambda';


// ----- Get Photos ------------------------------------------------------------

/**
 * This function returns all "full" photo records from the database.
 *
 * This is the only function exposed to the public via API Gateway.
 */
const handler: AWSHandler = async ({ response }) => {
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
    response.statusCode = 500;
    response.body = { message: 'Response from S3 did not contain a Body.' };
    return;
  }

  // eslint-disable-next-line @typescript-eslint/no-base-to-string
  response.body = photosResponse.Body.toString('utf8');
};


export default AWSLambdaHandlerFactory<APIGatewayEvent>({
  pre: [
    setCorsHeaders,
    setVersionHeader
  ],
  handler
});
