import env from '@darkobits/env';
import { RemovalPolicy } from 'aws-cdk-lib';
import {
  Api,
  Bucket,
  Cron,
  Function,
  type StackContext
} from 'sst/constructs';

export function ApiStack({ app, stack }: StackContext) {
  const { stage, local } = app;

  // ----- Bucket ------------------------------------------------------------

  const bucket = new Bucket(stack, 'bucket', {
    cdk: {
      bucket: {
        // Allows deletion of the bucket if it is not empty by automatically
        // deleting all objects in the bucket.
        autoDeleteObjects: true,
        removalPolicy: RemovalPolicy.DESTROY,
        publicReadAccess: true,
        cors: [{
          allowedMethods: ['GET' as any],
          allowedOrigins: ['*']
        }]
      }
    }
  });

  stack.addOutputs({ 'bucket': bucket.bucketName });

  // ----- Function: Sync Collections ------------------------------------------

  const syncCollections = new Function(stack, 'fn-sync-collections', {
    runtime: 'nodejs20.x',
    handler: 'src/functions/sync-collection.handler',
    timeout: 300,
    environment: {
      STAGE: stage,
      BUCKET_NAME: bucket.bucketName,
      // Note: These will be loaded from .env for local development and from
      // CI settings in Seed for deployments.
      UNSPLASH_ACCESS_KEY: env<string>('UNSPLASH_ACCESS_KEY', true),
      UNSPLASH_SECRET_KEY: env<string>('UNSPLASH_SECRET_KEY', true)
    },
    // TODO: Try to use more granular permissions here.
    bind: [bucket],
    // Try to keep our AWS bill down by reducing the volume of logs we keep in
    // CloudWatch.
    logRetention: local ? 'one_day' : 'one_week'
  });

  // ----- Production Cron: Sync Collections -----------------------------------

  new Cron(stack, 'cron-sync-collection', {
    schedule: 'rate(1 hour)',
    job: syncCollections
  });

  // ----- Non-Production Endpoint: Sync Collections ---------------------------

  if (stage !== 'production') {
    const api = new Api(stack, 'api-sync-collections', {
      routes: {
        'GET /sync-collections': syncCollections
      },
      cors: {
        allowHeaders: ['*'],
        allowMethods: ['ANY'],
        allowOrigins: ['*'],
        exposeHeaders: [
          'x-api-version',
          'x-request-id',
          'x-stage'
        ],
        maxAge: '1 minute'
      }
    });

    stack.addOutputs({ 'sync-collections-endpoint': `${api.url}/sync-collections` });
  }

  return { bucket };
}
