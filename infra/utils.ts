import os from 'os';

import * as sst from '@serverless-stack/resources';
import execa from 'execa';
import { machineIdSync } from 'node-machine-id';


/**
 * Returns the current active username on the local machine.
 */
export function username() {
  return os.userInfo().username;
}


/**
 * Returns the username plus a 7-character unique machine identifier.
 */
export function uid() {
  return `${username()}-${machineIdSync().slice(0, 7)}`;
}


/**
 * Returns a 7-character short SHA for the current Git commit.
 */
export function gitShaShort() {
  const result = execa.sync('git', ['rev-parse', '--short', 'HEAD']);
  return result.stdout.trim();
}


/**
 * Wraps an SST app callback, modifying the `stage` of the provided app.
 */
 export function withDynamicStage(callback: (app: sst.App) => void) {
  return (app: sst.App) => {
    // DebugStacks will not have a `local` property, but they are only ever
    // used locally. Other stacks will have a `local` property set to `true`
    // when developing locally.
    if (!Reflect.has(app, 'local') || app.local) {
      // @ts-expect-error
      app.stage = `local-${uid()}`;
    }

    callback(app);
  };
}
