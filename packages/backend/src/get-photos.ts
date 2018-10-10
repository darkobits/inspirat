// @ts-ignore
import DynamoDBFactory from '@awspilot/dynamodb';
import {APIGatewayEvent} from 'aws-lambda';
import * as R from 'ramda';

import {AWSLambdaFunction, setCorsHeaders, setVersionHeader} from 'lib/aws-helpers';


// ----- Get Photos ------------------------------------------------------------




/**
 * This function returns all "full" photo records from the database.
 */
export default AWSLambdaFunction<APIGatewayEvent>({
  pre: [setCorsHeaders, setVersionHeader],
  async handler(res/* , event, context */) {
    const db = new DynamoDBFactory();
    const table = db.table(`inspirat-${process.env.STAGE}`);
    const photos = await table.having('hasFullResults').eq(true).scan();

    // Return only the information we need in the client.
    res.body = photos.map((photo: any) => {
      return {
        id: R.path(['id'], photo),
        urls: {
          full: R.path(['urls', 'full'], photo),
        },
        location: {
          title: R.path(['location', 'title'], photo)
        },
        user: {
          name: R.path(['user', 'name'], photo)
        },
        color: R.path(['color'], photo)
      };
    });
  }
});
