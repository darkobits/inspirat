// @ts-ignore
import DynamoDBFactory from '@awspilot/dynamodb';
import env from '@darkobits/env';
import {APIGatewayEvent} from 'aws-lambda';
import * as R from 'ramda';

import {UnsplashCollectionPhotoResource} from 'etc/types';
import {AWSLambdaFunction, setCorsHeaders, setVersionHeader} from 'lib/aws-lambda';


// ----- Get Photos ------------------------------------------------------------

/**
 * This function returns all "full" photo records from the database.
 *
 * This is the only function exposed to the public via API Gateway.
 */
export default AWSLambdaFunction<APIGatewayEvent>({
  pre: [setCorsHeaders, setVersionHeader],
  async handler(res) {
    const table = new DynamoDBFactory().table(`inspirat-${env('STAGE', true)}`);
    const photos = await table.scan();

    // Return only the information we need in the client.
    res.body = photos.map((photo: UnsplashCollectionPhotoResource) => {
      return {
        id: R.path(['id'], photo),
        urls: {
          full: R.path(['urls', 'full'], photo)
        },
        location: {
          title: R.path(['location', 'title'], photo)
        },
        links: {
          html: R.path(['links', 'html'], photo)
        },
        user: {
          name: R.path(['user', 'name'], photo),
          links: {
            html: R.path(['user', 'links', 'html'], photo)
          }
        },
        color: R.path(['color'], photo)
      };
    });
  }
});
