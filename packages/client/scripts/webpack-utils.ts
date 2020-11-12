import path from 'path';

import LogFactory from '@darkobits/log';
import dotenv from 'dotenv';
import execa from 'execa';
import findUp from 'find-up';
import IS_CI from 'is-ci';
import readPkgUp, { NormalizedPackageJson } from 'read-pkg-up';
import webpack from 'webpack';


const log = LogFactory({ heading: 'webpack-config' });

// ----- Utilities -------------------------------------------------------------

/**
 * @private
 *
 * Returns a short description of the current Git commit using 'git describe'.
 *
 * Example: "v0.12.7-17-g9d2f0dc"
 */
function gitDescribe() {
  const result = execa.sync('git', ['describe', '--tags']).stdout;
  log.info(log.prefix('gitDescribe'), `Current Git description: ${log.chalk.green(result)}`);
  return result;
}


/**
 * @private
 *
 * Searches for and loads the nearest .env file by crawling up the directory
 * tree starting at `cwd`, process.cwd() if none was provided.
 *
 * Note: IS_CI is used here to bail rather than argv.mode so that users can
 * run production builds locally for testing/debugging.
 */
function readDotenvUp(cwd?: string) {
  if (IS_CI) {
    log.warn(log.prefix('readDotenvUp'), 'Not loading .env because a CI environment has been detected.');
    return;
  }

  const envFilePath = findUp.sync('.env', { cwd });
  const result = dotenv.config({ path: envFilePath });

  if (result.error) {
    log.warn(log.prefix('readDotenvUp'), `Error loading .env file: ${result.error.message}`);
    return {};
  }

  log.verbose(log.prefix('readDotenvUp'), `Loaded ${log.chalk.yellow(Object.keys(result.parsed ?? {}).length)} variables from ${log.chalk.blue(envFilePath)}.`);

  return result.parsed;
}


export interface GetPackageInfoResult {
  json: NormalizedPackageJson;
  root: string;
}

/**
 * Searches for, loads, and normalizes the nearest package.json by crawling up
 * the directory tree starting at the provided cwd, or process.cwd() if none was
 * provided.
 */
export function getPackageInfo(cwd?: string): GetPackageInfoResult {
  const pkgInfo = readPkgUp.sync({ cwd });

  if (!pkgInfo) {
    throw new Error(`Unable to find a ${log.chalk.green('package.json')} at or above ${log.chalk.blue(process.cwd())}`);
  }

  log.verbose(log.prefix('getPackageInfo'), `Using ${log.chalk.green('package.json')} from ${log.chalk.blue(pkgInfo.path)}.`);

  return {
    json: pkgInfo.packageJson,
    root: path.dirname(pkgInfo.path)
  };
}


/**
 * Object passed to wrapped Webpack configuration functions.
 */
interface WebpackConfigurationFunctionOptions {
  /**
   * First argument passed to traditional Webpack configuration functions.
   */
  env: Parameters<webpack.ConfigurationFactory>[0];

  /**
   * Second argument passed to traditional Webpack configuration functions.
   */
  argv: Parameters<webpack.ConfigurationFactory>[1];

  /**
   * Result of running "git describe".
   */
  gitDesc: string;

  /**
  * Webpack configuration object with several data strictures pre-initialized as
  * a convenience so the user doesn't have to do things like:
  *
  * config.plugins = []
  * config.module = {rules: []};
  */
  config: webpack.Configuration & {
    plugins: Array<webpack.Plugin>;
    module: webpack.Module & {
      rules: Array<webpack.RuleSetRule>;
    };
  };

  /**
   * Normalized contents of the nearest package.json file. Useful for getting
   * version information or other metadata to use in a Webpack build.
   */
  pkg: {
    json: readPkgUp.NormalizedPackageJson;
    root: string;
  };

  /**
   * Equivalent to argv.mode, for convenience.
   */
  mode: webpack.Configuration['mode'];

  /**
   * Returns its first parameter (or `true`) if argv.mode === 'development', or
   * its second parameter (or `false`) otherwise.
   *
   * @example
   *
   * // Assuming argv.mode === 'development'
   * ifDev() //=> true
   * ifDev('foo', 'bar') //=> 'foo'
   * ifProd('foo') //=> false
   */
  ifDev(): boolean;
  ifDev<T = true>(ifTrue: T): T | false;
  ifDev<T = true, F = false>(ifTrue: T, ifFalse: F): T | F;

  /**
   * Returns its first parameter (or `true`) if argv.mode === 'production', or
   * its second parameter (or `false`) otherwise.
   *
   * // Assuming argv.mode === 'production'
   * ifProd() //=> true
   * ifProd('foo', 'bar') //=> 'foo'
   * ifDev('foo') //=> false
   */
  ifProd(): boolean;
  ifProd<T = true>(ifTrue: T): T | false;
  ifProd<T = true, F = false>(ifTrue: T, ifFalse: F): T | F;
}


/**
 * Function type expected by webpackConfigurationWrapper. Accepts an options
 * object rather than an argument list.
 *
 * Note: 'env' and 'argv', the 2 parameters typically passed to a Webpack
 * configuration function, are keys on this object.
 */
type WebpackConfigurationFunction = (options: WebpackConfigurationFunctionOptions) => Promise<webpack.Configuration> | webpack.Configuration;


/**
 * Higher-order function that accepts a Webpack configuration function and
 * returns a Webpack configuration function.
 *
 * The provided function diverges from a standard Webpack configuration function
 * insofar as it accepts a single context object rather than `env` and `argv`
 * params. These values are available as keys on the context object, however.
 *
 * This function is not designed to provide or set any default configuration
 * options, only to ease the process by providing a set of utilities. Most
 * notably:
 *
 * 1. Create a configuration object with empty data structures at paths like
 *    `plugins` and `module.rules`.
 * 2. Read and normalize the contents of the nearest package.json file.
 * 3. Load .env data into process.env. Protip: Use EnvironmentPlugin rather than
 *    DefinePlugin to trivially inject environment variables into a build.
 * 4. Provide a set of predicate functions for switching based on development or
 *    production builds.
 */
export default function webpackConfigurationWrapper(configFn: WebpackConfigurationFunction): webpack.ConfigurationFactory {
  return async (env, argv) => {
    const config: Readonly<WebpackConfigurationFunctionOptions['config']> = {
      mode: argv.mode,
      module: {
        rules: []
      },
      plugins: []
    };

    const pkg = getPackageInfo();

    readDotenvUp();

    const ifDev = (ifTrue?: any, ifFalse?: any): any => {
      if (argv.mode === 'development') {
        return typeof ifTrue === 'undefined' ? true : ifTrue;
      }

      return typeof ifFalse === 'undefined' ? false : ifFalse;
    };

    const ifProd = (ifTrue?: any, ifFalse?: any): any => {
      if (argv.mode === 'production') {
        return typeof ifTrue === 'undefined' ? true : ifTrue;
      }

      return typeof ifFalse === 'undefined' ? false : ifFalse;
    };

    const options: WebpackConfigurationFunctionOptions = {
      config,
      gitDesc: gitDescribe(),
      pkg,
      env,
      argv,
      mode: argv.mode,
      ifDev,
      ifProd
    };

    return configFn(options);
  };
}
