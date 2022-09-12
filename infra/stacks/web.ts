import path from 'path';

import env from '@darkobits/env';
import * as sst from '@serverless-stack/resources';
import * as cdk from 'aws-cdk-lib';
import { Mutable } from 'inspirat-common/types';

import type ApiStack from 'stacks/api';


const WEB_PATH = path.resolve('packages/web');


export default class WebStack extends sst.Stack {
  constructor(app: sst.App, id: string, props: sst.StackProps, api: ApiStack) {
    super(app, id, props);

    const { stage, local } = app;


    // ----- Front-End ---------------------------------------------------------

    const webOptions: Mutable<sst.ViteStaticSiteProps> = {
      path: WEB_PATH,
      buildCommand: 'vite build --emptyOutDir',
      buildOutput: 'dist',
      typesPath: path.resolve(WEB_PATH, 'src', 'sst-env.d.ts'),
      environment: {
        VITE_TITLE: env('VITE_TITLE') ?? 'Inspirat',
        VITE_STAGE: stage,
        VITE_BUCKET_URL: api.bucket.cdk.bucket.virtualHostedUrlForObject('photoCollections'),
        SYNC_COLLECTION_URL: api.api?.url ?? ''
      },
      cdk: {
        bucket: {
          // Allows deletion of the bucket if it is not empty by automatically
          // deleting all objects in the bucket.
          autoDeleteObjects: true,
          removalPolicy: cdk.RemovalPolicy.DESTROY
        }
      }
    };

    if (stage === 'production') {
      webOptions.customDomain = {
        // Note: This will look up a Hosted Zone of the same name.
        domainName: 'inspir.at',
        domainAlias: 'www.inspir.at'
      };
    }

    const web = new sst.StaticSite(this, 'web', webOptions);

    if (!local) {
      this.addOutputs({ 'Web': web.url });
    }
  }
}
