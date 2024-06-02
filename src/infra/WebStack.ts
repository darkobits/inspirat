import path from 'node:path';

import env from '@darkobits/env';
import { RemovalPolicy } from 'aws-cdk-lib';
import {
  StaticSite,
  use,
  type StackContext,
  type StaticSiteProps
} from 'sst/constructs';

import { ApiStack } from 'infra/ApiStack';

/**
 * N.B. SST will merge all stack-related configuration files into a single
 * temporary file at the project root. Thus, when resolving paths, we should do
 * so relative to the project root.
 */
const WEB_PATH = path.join('src', 'web');

// ----- Front-End -------------------------------------------------------------

export function WebStack({ app, stack }: StackContext) {
  const { stage, name } = app;
  const { bucket } = use(ApiStack);

  const staticSiteOptions: StaticSiteProps = {
    buildCommand: `vite build --config=vite.config.ts --emptyOutDir ${WEB_PATH}`,
    buildOutput: 'dist',
    vite: {
      types: path.join(WEB_PATH, 'sst-env.d.ts')
    },
    environment: {
      VITE_TITLE: env('VITE_TITLE') ?? 'Inspirat',
      VITE_STAGE: stage,
      VITE_BUCKET_URL: bucket.cdk.bucket.virtualHostedUrlForObject('photoCollections')
    },
    assets: {
      fileOptions: [{
        files: '*.html',
        cacheControl: 'max-age=0,no-cache,no-store,must-revalidate'
      }, {
        // Cache JavaScript and CSS forever; file names will change when their
        // contents change.
        files: ['*.js', '*.css'],
        cacheControl: 'max-age=31536000,public,immutable'
      }]
    },
    cdk: {
      bucket: {
        // Allows deletion of the bucket if it is not empty by automatically
        // deleting all objects in the bucket.
        autoDeleteObjects: true,
        removalPolicy: RemovalPolicy.DESTROY
      }
    },
    // Speeds up the deploy process for non-production stages.
    // See: https://docs.sst.dev/constructs/StaticSite#waitforinvalidation
    // waitForInvalidation: stage === 'production'
    waitForInvalidation: false
  };

  if (stage === 'production') {
    staticSiteOptions.customDomain = {
      // Note: This will look up a Hosted Zone of the same name.
      domainName: 'inspir.at',
      domainAlias: 'www.inspir.at'
    };
  }

  const web = new StaticSite(stack, `${name}-web`, staticSiteOptions);

  stack.addOutputs({ 'Web': web.url });
}
