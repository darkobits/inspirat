#!/usr/bin/env node

/**
 * ===== Chrome Extension Publisher ============================================
 *
 * This script automates the process of publishing new versions of an extension
 * to the Chrome Web Store.
 *
 * If all of the following criteria are met:
 * 1. The current Git branch is the configured publish branch.
 * 2. A single Git tag points to the current Git commit.
 * 3. The Git tag is a valid semantic version.
 * 4. The "version" field in the extension's manifest.json matches the Git tag.
 *
 * Then the following actions will be performed:
 * 1. Create a ZIP archive containing the contents of the publish root.
 * 2. Upload the archive to the Chrome Web Store.
 * 3. Publish the uploaded archive as a new version of the extension.
 *
 * Notes:
 *
 * Travis will build the project twice when a tag is present; once for the tag
 * and once for the branch.
 *
 * In the job for the tag, env-ci will report that the branch name is the same
 * as the tag name.
 *
 * In the job for the branch, env-ci will report the correct branch name, but no
 * tag. This is technically because Travis doesn't populate the TAG environment
 * variable on branch jobs.
 *
 * As such, we never wind up publishing from a tag's job and are unable to
 * use env-ci to determine what (if any) tags point to the current commit in
 * branch jobs. Therefore, we use a custom function in this script to compute
 * tags.
 *
 * See Also:
 *
 * - https://circleci.com/blog/continuously-deploy-a-chrome-extension/
 */
import os from 'os';
import path from 'path';

import env from '@darkobits/env';
import createLogger from '@darkobits/log';
import bytes from 'bytes';
// @ts-ignore (No type definitions exist for this module.)
import chromeWebstoreUpload from 'chrome-webstore-upload';
import envCi from 'env-ci';
import fs from 'fs-extra';
import semver from 'semver';

import {
  getTagsAtHead,
  readExtensionManifest,
  zipFolder
} from './common';
import {
  ChromeWebstoreUploadResult,
  PublishExtensionOptions
} from './types';


const log = createLogger({heading: 'publish-extension'});


/**
 * Provided a PublishExtensionOptions, archives, uploads, and publishes a
 * Chrome Extension and returns a Promise that resolves when the operation is
 * complete.
 */
async function publishExtension(options: PublishExtensionOptions) {
  // ----- [1] Verify Publish Root & Manifest ----------------------------------

  const { publishRoot } = options;

  try {
    await fs.access(publishRoot);
  } catch  {
    throw new Error(`extension artifacts not present at ${log.chalk.green(publishRoot)}`);
  }

  const { manifest, path: manifestPath } = await readExtensionManifest(publishRoot);
  log.info(`Determining publish eligibility for Chrome extension ${log.chalk.bold(manifest.name)}.`);
  log.silly(`Extension manifest path: ${log.chalk.green(manifestPath)}.`);


  // ----- [2] Compute Git Branch & Tags ---------------------------------------

  const { branch } = envCi();
  log.info(`Git branch: ${branch}`);

  const tags = await getTagsAtHead();
  log.info(`Git tag(s): ${tags.join(', ')}`);


  // ----- [3] Determine Publish Eligibility -----------------------------------

  const shouldPublishResult = await options.shouldPublish({branch, manifest, semver, tags});

  // Not publishing with a reason provided.
  if (typeof shouldPublishResult === 'string') {
    log.warn(`Skipping publish of extension ${log.chalk.bold(manifest.name)}; ${shouldPublishResult}`);
    return;
  }

  // Not publishing without a reason provided.
  if (shouldPublishResult === false || shouldPublishResult === undefined) {
    log.warn(`Skipping publish of extension ${log.chalk.bold(manifest.name)}.`);
    return;
  }

  log.info(`Preparing to publish ${log.chalk.bold(manifest.name)} ${log.chalk.green(`v${manifest.version}`)}.`);


  // ----- [4] Validate Web Store Credentials ----------------------------------

  const {extensionId, clientId, clientSecret, refreshToken} = options;

  if (!extensionId) {
    throw new Error('extension ID not set');
  }

  if (!clientId) {
    throw new Error('client ID not set');
  }

  if (!clientSecret) {
    throw new Error('client secret not set');
  }

  if (!refreshToken) {
    throw new Error('refresh token not set');
  }


  // ----- [5] Compress Artifacts ----------------------------------------------

  const artifactPath = await zipFolder(publishRoot);
  const artifactSize = bytes((await fs.stat(artifactPath)).size);
  log.info(`Creating artifact from ${log.chalk.green(publishRoot)} ${log.chalk.dim(`(${artifactSize})`)}.`);


  // ----- [6] Upload Artifacts ------------------------------------------------

  const webStore = chromeWebstoreUpload({
    extensionId,
    clientId,
    clientSecret,
    refreshToken
  });

  const artifactStream = fs.createReadStream(artifactPath);
  const uploadResult: ChromeWebstoreUploadResult = await webStore.uploadExisting(artifactStream);

  if (uploadResult.uploadState === 'FAILURE' && uploadResult.itemError) {
    log.silly('Artifact upload failed:', uploadResult);

    throw new Error([
      'Artifact upload failed:',
      ...uploadResult.itemError.map(error => `- ${error.error_detail}`)
    ].join(os.EOL));
  }

  log.info('Uploaded artifact.');


  // ----- [7] Publish Extension & Clean Up ------------------------------------

  log.info('Publishing extension.');
  await webStore.publish();

  log.verbose('Cleaning up.');
  await fs.unlink(artifactPath);

  log.info(`Successfully published ${log.chalk.bold(manifest.name)} ${log.chalk.green(`v${manifest.version}`)} ${log.chalk.dim(`(${artifactSize})`)}.`);
}


/**
 * NOTE: This function should be factored-out of this module in a future update,
 * as its primary role is to gather configuration specific to this project and
 * invoke `publishExtension`.
 */
async function main() {
  try {
    const envInfo: any = envCi();

    // log.verbose(envCi());

    log.info(`Detected environment ${envInfo.name}.`);

    await publishExtension({
      publishRoot: path.resolve(__dirname, '..', 'dist'),
      extensionId: env<string>('CHROME_WEBSTORE_EXTENSION_ID'),
      clientId: env<string>('CHROME_WEBSTORE_CLIENT_ID'),
      clientSecret: env<string>('CHROME_WEBSTORE_CLIENT_SECRET'),
      refreshToken: env<string>('CHROME_WEBSTORE_REFRESH_TOKEN'),
      shouldPublish: ({branch, tags, semver, manifest}) => {
        if (branch !== 'master') {
          return 'not on "master"';
        }

        if (tags.length === 0) {
          return 'no Git tags at current commit';
        }

        if (typeof manifest.version !== 'string') {
          return `expected type of manifest version to be "string", got "${typeof manifest.version}`;
        }

        if (!semver.valid(manifest.version)) {
          return `manifest version ${log.chalk.green(manifest.version)} is not a valid semantic version`;
        }

        // Attempt to find a Git tag that is a valid semantic version that
        // matches the extension's current manifest version.
        const tag = tags.find(curTag => semver.valid(curTag) && semver.eq(curTag, manifest.version));

        if (!tag) {
          return `no Git tags match the current manifest version "${manifest.version}"`;
        }

        return true;
      }
    });
  } catch (err) {
    log.error(`Skipping extension publish; ${err.message}.`);
    log.verbose(err.stack);

    if (err.isNonCritical) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  }
}


export default main();
