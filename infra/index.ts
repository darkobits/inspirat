import * as sst from '@serverless-stack/resources';

import ApiStack from 'stacks/api';
import WebStack from 'stacks/web';

import { gitShaShort, username, withDynamicStage } from 'utils';


/**
 * Configures the default stack that will be deployed.
 *
 * See: https://docs.serverless-stack.com/installation#infrastructure
 */
export default withDynamicStage((app: sst.App) => {
  const api = new ApiStack(app, 'api', {
    description: app.local
      ? `Development Inspirat API stack for ${username()}.`
      : `Inspirat ${app.stage} API stack.`,
    tags: {
      'sst:stack': 'api',
      'sst:git': gitShaShort()
    }
  });

  new WebStack(app, 'web', {
    description: app.local
      ? `Development Inspirat Web stack for ${username()}.`
      : `Inspirat ${app.stage} Web stack.`,
    tags: {
      'sst:stack': 'web',
      'sst:git': gitShaShort()
    }
  }, api);
});



/**
 * Configures the DebugStack that will be deployed along with the default stacks
 * (above) when `sst start` is used.
 *
 * See: https://docs.serverless-stack.com/constructs/DebugApp
 */
export const debugApp = withDynamicStage((app: sst.DebugApp) => {
  // We want to include an ID unique to the current machine/user here to ensure
  // there are no conflicts when multiple users are managing debug stacks at the
  // same time.
  new sst.DebugStack(app, 'debug', {
    description: `Debug stack for ${username()}.`,
    tags: { 'sst:stack': 'debug' }
  });
});
