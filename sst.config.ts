import { getLocalStageName } from '@darkobits/serverless-kit';
import { gitDescribe } from '@darkobits/ts';
import { Tags } from 'aws-cdk-lib';
import IS_CI from 'is-ci';


import { ApiStack } from 'infra/ApiStack';
import { WebStack } from 'infra/WebStack';

import type { SSTConfig } from 'sst';


/**
 * We should be able to import this from 'sst', but TypeScript claims the export
 * doesn't exist.
 */
type ConfigOptions = Awaited<ReturnType<SSTConfig['config']>>;


const config: SSTConfig = {
  config: () => {
    const config: ConfigOptions = {
      name: 'inspirat',
      region: 'us-west-1'
    };

    // For local development, we need our profile and stage name to be passed-in
    // via CLI arguments.
    if (!IS_CI) {
      // Set in nr.config.ts.
      // config.stage = env<string>('SST_LOCAL_STAGE', true);
      config.stage = getLocalStageName();
    }

    return config;
  },
  stacks: app => {
    app.stack(ApiStack);
    app.stack(WebStack);
    // @ts-expect-error
    Tags.of(app).add('version', gitDescribe());
  }
};


export default config;
