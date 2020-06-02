// @ts-ignore
import DynamoDBFactory from '@awspilot/dynamodb';
import env from '@darkobits/env';
import {APIGatewayEvent} from 'aws-lambda';
import * as R from 'ramda';

import {LooseObject} from 'etc/types';
import {AWSLambdaHandlerFactory, setCorsHeaders, setVersionHeader} from 'lib/aws-lambda';


/**
 * Provided a list of paths, a source object, and a destination object, returns
 * a new object built by cloning the destination object and then assigning each
 * path from the source object to the destination object. If a destination
 * object is omitted, an empty object is used.
 */
const assocAllPaths = R.curry((paths: Array<Array<string>>, srcObj: LooseObject, destObj: LooseObject = {}) => {
  return R.reduce((accumulator, curPath) => {
    return R.assocPath(curPath, R.path(curPath, srcObj), accumulator);
  }, destObj, paths);
});


/**
 * Provided an Unsplash photo resource, returns a partial photo resource with
 * only those fields used by the Inspirat client.
 */
const assocPhotoPaths = assocAllPaths([
  ['id'],
  ['color'],
  ['links', 'html'],
  ['location', 'title'],
  ['urls', 'full'],
  ['user', 'links', 'html'],
  ['user', 'name']
]);


// ----- Get Photos ------------------------------------------------------------

/**
 * This function returns all "full" photo records from the database.
 *
 * This is the only function exposed to the public via API Gateway.
 */
export default AWSLambdaHandlerFactory<APIGatewayEvent>({
  pre: [setCorsHeaders, setVersionHeader],
  handler: async res => {
    const table = new DynamoDBFactory().table(`inspirat-${env('STAGE', true)}`);
    const photos = await table.scan();
    res.body = photos.map(assocPhotoPaths);
  }
});
