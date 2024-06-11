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

export default {
  config: () => {
    const config: ConfigOptions = {
      name: 'inspirat',
      region: 'us-west-1'
    };

    if (!IS_CI) {
      config.stage = getLocalStageName();
    }

    return config;
  },
  stacks: app => {
    app.stack(ApiStack);
    app.stack(WebStack);
    Tags.of(app).add('version', gitDescribe());
  }
} satisfies SSTConfig;
