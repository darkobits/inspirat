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
    runtime: 'nodejs18.x',
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

  if (stage === 'production') {
    new Cron(stack, 'cron-sync-collection', {
      schedule: 'rate(1 hour)',
      job: syncCollections
    });
  }


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

    stack.addOutputs({ 'sync-collections-endpoint': api.url });
  }

  // ----- X Backend Router ----------------------------------------------------

  // const router = new Function(stack, 'fn-router', {
  //   handler: 'src/functions/router.handler',
  //   runtime: 'nodejs16.x',
  //   timeout: 300,
  //   nodejs: {
  //     format: 'esm',
  //     sourcemap: true
  //   },
  //   environment: {
  //     GIT_VERSION: gitDescribe(),
  //     HTTP_BASIC_AUTH_REALM: name,
  //     POWERTOOLS_DEV: String(local),
  //     POWERTOOLS_SERVICE_NAME: name,
  //     STAGE: stage,
  //     TABLE_NAME: table.tableName
  //   },
  //   bind: [table, ...SECRETS],
  //   // Try to keep our AWS bill down by reducing the volume of logs we keep in
  //   // CloudWatch.
  //   logRetention: local ? 'one_day' : 'one_week'
  // });


  // ----- X API Endpoints -----------------------------------------------------

  // const api = new Api(stack, 'api', {
  //   routes: {
  //     'ANY /{proxy+}': router
  //   },
  //   cors: {
  //     allowHeaders: ['*'],
  //     allowMethods: ['ANY'],
  //     allowOrigins: ['*'],
  //     exposeHeaders: [
  //       'x-api-version',
  //       'x-request-id',
  //       'x-stage'
  //     ],
  //     maxAge: '1 minute'
  //   }
  // });

  // stack.addOutputs({ 'API': api.url });


  return { bucket };
}


// ------- OLD CONFIG ----------------------------------------------------------


// import env from '@darkobits/env';
// import * as sst from '@serverless-stack/resources';
// import * as cdk from 'aws-cdk-lib';


// export class ApiStack_DEPRECATED extends sst.Stack {
//   public readonly api: sst.Api | undefined;
//   public readonly bucket: sst.Bucket;
//   public readonly functions: Record<string, sst.Function> = {};

//   constructor(app: sst.App, id: string, props?: sst.StackProps) {
//     super(app, id, props);

//     const { stage, local } = app;


//     // ----- OK Bucket ---------------------------------------------------------

//     this.bucket = new sst.Bucket(this, 'bucket-inspirat', {
//       cdk: {
//         bucket: {
//           // Allows deletion of the bucket if it is not empty by automatically
//           // deleting all objects in the bucket.
//           autoDeleteObjects: true,
//           removalPolicy: cdk.RemovalPolicy.DESTROY,
//           publicReadAccess: true,
//           cors: [{
//             allowedMethods: ['GET' as any],
//             allowedOrigins: ['*']
//           }]
//         }
//       }
//     });

//     this.addOutputs({ 'Bucket': this.bucket.bucketName });


//     // ----- Function: Sync Collection -----------------------------------------

//     this.functions.syncCollection = new sst.Function(this, 'fn-sync-collection', {
//       runtime: 'nodejs16.x',
//       handler: 'packages/backend/src/sync-collection.handler',
//       timeout: 300,

//       environment: {
//         STAGE: stage,
//         BUCKET_NAME: this.bucket.bucketName,
//         // Note: These will be loaded from .env for local development and from
//         // CI settings in Seed for deployments.
//         UNSPLASH_ACCESS_KEY: env<string>('UNSPLASH_ACCESS_KEY', true),
//         UNSPLASH_SECRET_KEY: env<string>('UNSPLASH_SECRET_KEY', true)
//       },
//       // TODO: Try to use more granular permissions here.
//       bind: [this.bucket],
//       // Try to keep our AWS bill down by reducing the volume of logs we keep in
//       // CloudWatch.
//       logRetention: local ? 'one_day' : 'one_week'
//     });


//     // ----- Cron Job / API Endpoint -------------------------------------------

//     /**
//      * Production:
//      * - Run hourly.
//      *
//      * Development & Local:
//      * - Available as an HTTP endpoint for manual invocation.
//      */
//     if (stage === 'production') {
//       new sst.Cron(this, 'cron-inspirat', {
//         schedule: 'rate(1 hour)',
//         job: this.functions.syncCollection
//       });
//     } else {
//       this.api = new sst.Api(this, 'api-sync-collection', {
//         routes: {
//           'GET /': this.functions.syncCollection
//         }
//       });

//       this.addOutputs({ 'SyncCollectionsEndpoint': this.api.url });
//     }
//   }
// }
