import type { Serverless } from 'serverless/aws';


const serverlessConfiguration: Serverless = {
  org: 'darkobits',
  app: 'inspirat',
  service: 'inspirat',
  useDotenv: true,
  custom: {
    stage: '${opt:stage,"dev"}'
  },
  plugins: [
    'serverless-bundle',
  ],
  package: {
    individually: true,
    excludeDevDependencies: true
  },
  provider: {
    name: 'aws',
    region: 'us-west-1',
    runtime: 'nodejs14.x',
    lambdaHashingVersion: 20201221,
    stage: '${self:custom.stage}',
    environment: {
      STAGE: '${self:custom.stage}'
    },
    iamRoleStatements: [{
      Effect: 'Allow',
      Action: ['s3:*'],
      Resource: 'arn:aws:s3:::inspirat-${self:custom.stage}/*'
    }],
    apiGateway: {
      shouldStartNameWithService: true
    }
  },
  resources: {
    Resources: {
      // S3 Bucket
      InspiratBucket: {
        Type: 'AWS::S3::Bucket',
        Properties: {
          BucketName: 'inspirat-${self:custom.stage}'
        }
      }
    }
  },
  functions: {
    'sync-collection': {
      handler: 'src/sync-collection.default',
      // Execute this function every hour.
      events: [{
        schedule: {
          name: 'sync-collection-${self:custom.stage}',
          description: 'Sync collection from Unsplash.',
          rate: 'rate(1 hour)'
        }
      }],
      environment: {
        UNSPLASH_ACCESS_KEY: '${env:UNSPLASH_ACCESS_KEY}'
      },
      timeout: 300 // (5 minutes)
    }
  }
}


module.exports = serverlessConfiguration;
