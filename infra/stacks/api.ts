import env from '@darkobits/env';
import * as sst from '@serverless-stack/resources';
import * as cdk from 'aws-cdk-lib';


export default class ApiStack extends sst.Stack {
  public readonly api: sst.Api | undefined;
  public readonly bucket: sst.Bucket;
  public readonly functions: Record<string, sst.Function> = {};

  constructor(app: sst.App, id: string, props?: sst.StackProps) {
    super(app, id, props);

    const { stage, local } = app;


    // ----- Bucket ------------------------------------------------------------

    this.bucket = new sst.Bucket(this, 's3:inspirat', {
      s3Bucket: {
        // Allows deletion of the bucket if it is not empty by automatically
        // deleting all objects in the bucket.
        autoDeleteObjects: true,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
        publicReadAccess: true,
        cors: [{
          allowedMethods: ['GET' as any],
          allowedOrigins: ['*']
        }],
      }
    });

    this.addOutputs({ 'Bucket': this.bucket.bucketName });


    // ----- Function: Sync Collection -----------------------------------------

    this.functions.syncCollection = new sst.Function(this, 'fn:sync-collection', {
      runtime: 'nodejs14.x',
      handler: 'backend/src/sync-collection.handler',
      timeout: 300,
      environment: {
        STAGE: stage,
        BUCKET_NAME: this.bucket.bucketName,
        // Note: These will be loaded from .env for local development and from
        // CI settings in Seed for deployments.
        UNSPLASH_ACCESS_KEY: env<string>('UNSPLASH_ACCESS_KEY', true),
        UNSPLASH_SECRET_KEY: env<string>('UNSPLASH_SECRET_KEY', true)
      },
      // TODO: Try to use more granular permissions here.
      permissions: [this.bucket],
      // Try to keep our AWS bill down by reducing the volume of logs we keep in
      // CloudWatch.
      logRetention: local
        ? cdk.aws_logs.RetentionDays.ONE_DAY
        : cdk.aws_logs.RetentionDays.ONE_WEEK
    });


    // ----- Cron Job (Production Only) ----------------------------------------

    // Note: sync-collection is only run automatically in production.
    if (!local) {
      new sst.Cron(this, 'cron:inspirat', {
        schedule: 'rate(1 hour)',
        job: this.functions.syncCollection
      });
    }


    // ----- API Endpoint (Local Development Only) -----------------------------

    // Note: sync-collection is only reachable via HTTP for local development.
    if (local) {
      this.api = new sst.Api(this, 'api:sync-collection', {
        routes: {
          'GET /': this.functions.syncCollection
        }
      });

      this.addOutputs({ 'Sync Collections': this.api.url });
    }
  }
}