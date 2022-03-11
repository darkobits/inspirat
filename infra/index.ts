import os from 'os';
import * as sst from '@serverless-stack/resources';
import execa from 'execa';
import { machineIdSync } from 'node-machine-id';

import ApiStack from 'stacks/api';
import WebStack from 'stacks/web';

const USERNAME = os.userInfo().username;
const UID = `${USERNAME}-${machineIdSync().slice(0, 7)}`;


function gitShaShort() {
  const result = execa.sync('git', ['rev-parse', '--short', 'HEAD']);
  return result.stdout.trim();
}


/**
 * Wraps an SST app callback, modifying the `stage` of the provided app.
 */
function withDynamicStage(callback: (app: sst.App) => void) {
  return (app: sst.App) => {
    if (app.local || app.stage.startsWith('local') || app.stage === app.name) {
      // @ts-expect-error
      app.stage = `local-${UID}`;
      // @ts-expect-error
      app.local = true;
    }

    callback(app);
  }
}


/**
 * Configures the default stack that will be deployed.
 *
 * See: https://docs.serverless-stack.com/installation#infrastructure
 */
export default withDynamicStage((app: sst.App) => {
  const api = new ApiStack(app, 'api', {
    description: app.local
      ? `Development Inspirat API stack for ${USERNAME}.`
      : `Inspirat ${app.stage} API stack.`,
    tags: {
      'sst:stack': 'api',
      'sst:git': gitShaShort()
    }
  });

  new WebStack(app, 'web', {
    description: app.local
      ? `Development Inspirat Web stack for ${USERNAME}.`
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
    description: `Debug stack for ${USERNAME}.`,
    tags: { 'sst:stack': 'debug' }
  });
});
