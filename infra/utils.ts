import os from 'os';

import execa from 'execa';
import { machineIdSync } from 'node-machine-id';

import type { App } from '@serverless-stack/resources';


/**
 * TODO: Move this to its own package.
 */


/**
 * @private
 *
 * Returns the current active username on the local machine.
 */
function username() {
  return os.userInfo().username;
}


/**
 * @private
 *
 * Returns the username plus a 7-character unique machine identifier.
 */
function uid() {
  return `${username()}-${machineIdSync().slice(0, 7)}`;
}


/**
 * @private
 *
 * Returns a 7-character short SHA for the current Git commit.
 */
function gitShaShort() {
  const result = execa.sync('git', ['rev-parse', '--short', 'HEAD']);
  return result.stdout.trim();
}


export interface DynamicStageContext {
  /**
   * Reference to the SST app instance.
   */
  app: App;

  /**
   * Current username on the local host.
   */
  username: string;

  /**
   * Unique machine-specific ID used to set the stage name for the SST app.
   */
  uid: string;

  /**
   * String describing the current Git tag/commit.
   */
  gitShaShort: string;
}

/**
 * Wraps an SST app callback, modifying the `stage` of the provided app.
 */
 export function withUniqueLocalStage(callback: (context: DynamicStageContext) => void) {
  return (app: App) => {
    const localUid = uid();

    // DebugStacks will not have a `local` property, but they are only ever
    // used locally. Other stacks will have a `local` property set to `true`
    // when developing locally.
    if (!Reflect.has(app, 'local') || app.local) {
      Reflect.set(app, 'stage', `local-${localUid}`);
      console.log('SET STAGE TO', app.stage);
    }

    callback({
      app,
      username: username(),
      uid: localUid,
      gitShaShort: gitShaShort()
    });
  };
}
