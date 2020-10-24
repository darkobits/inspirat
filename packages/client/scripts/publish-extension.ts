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

import createLogger from '@darkobits/log';
import bytes from 'bytes';
// @ts-ignore (No type definitions exist for this module.)
import chromeWebstoreUpload from 'chrome-webstore-upload';
import envCi from 'env-ci';
import fs from 'fs-extra';
import ow from 'ow';
import readPkgUp from 'read-pkg-up';
import semver from 'semver';

import {
  getBranchName,
  getTagsAtHead,
  isValidChromeExtensionVersion,
  isWorkingDirectoryClean,
  readExtensionManifest,
  toSingle,
  zipFolder
} from './common';
import {
  ChromeWebstoreUploadResult,
  PublishExtensionOptions
} from './types';


const log = createLogger({heading: 'pubby'});

let logMessages: Array<() => void> = [];

function prependLogMessage(cb: () => void) {
  logMessages.unshift(cb);
}

function appendLogMessage(cb: () => void) {
  logMessages.push(cb);
}

function writeLogMessages() {
  logMessages.forEach(cb => cb());
  logMessages = [];
}


/**
 * Provided a PublishExtensionOptions, archives, uploads, and publishes a
 * Chrome Extension and returns a Promise that resolves when the operation is
 * complete.
 *
 * TODO: Move all checks for environment variables to AFTER we have determined
 * release eligibility, as they might not be exposed on non-release branches.
 */
async function publishExtension(options: PublishExtensionOptions) {
  // ----- [1] Validate Options (Partial) --------------------------------------

  /**
   * Validate only those options we need in order to determine release
   * eligibility. We will validate remaining options after determining
   * eligibility because it is likely that several of the more sensitive options
   * are provided as environment variables and, depending on how the user has
   * configured their CI system, may only be exposed to eligible branches.
   * Therefore, on non-eligible branches, those options would be undefined, and
   * validating them too early would cause us to throw an error and fail the
   * build inadvertently.
   */
  const preEligibilityOptionsValidators = {
    requireGitBranch: ow.optional.any(ow.string, ow.regExp),
    requireGitTagPattern: ow.optional.any(ow.string.equals('semver'), ow.regExp),
    requireCleanWorkingDirectory: ow.optional.boolean,
    dryRun: ow.optional.boolean
  };

  ow(options, ow.object.partialShape(preEligibilityOptionsValidators));


  // ----- [1] Ensure Clean Working Directory ----------------------------------

  if (options.requireCleanWorkingDirectory) {
    if (await isWorkingDirectoryClean()) {
      appendLogMessage(() => log.verbose('- Working directory is clean.'));
    } else {
      throw new Error('Working directory is not clean.');
    }
  }


  // ----- [2] Determine Branch Eligibility ------------------------------------

  /**
   * Many CI systems will clone repositories in a way that prevents us from
   * determining the current branch name using Git. They do, however, provide
   * an environment variable containing the current branch name. So, when
   * in a CI environment, prefer reading from the environment variable.
   */
  const { isCi, branch: branchFromCi } = envCi();
  const branch = isCi && branchFromCi ? branchFromCi : await getBranchName();

  if (options.requireGitBranch) {
    let isEligibleBranch: boolean;

    if (typeof options.requireGitBranch === 'string') {
      isEligibleBranch = branch === options.requireGitBranch;
    } else {
      isEligibleBranch = options.requireGitBranch.test(branch);
    }

    if (!isEligibleBranch) {
      appendLogMessage(() => log.info(toSingle`
        ${log.chalk.yellow.bold('Skipping publish:')} Branch ${log.chalk.bold(branch)} is not
        eligible for publishing.
      `));

      return;
    }

    if (typeof options.requireGitBranch === 'string') {
      appendLogMessage(() => log.verbose(`- On release branch ${log.chalk.bold(branch)}.`));
    } else {
      appendLogMessage(() => log.verbose(toSingle`
        - Branch ${log.chalk.bold(branch)} satisfies pattern
          ${log.chalk.blue(options.requireGitBranch)}.
      `));
    }
  }


  // ----- [3] Determine Tag Eligibility ---------------------------------------

  let tag = '';

  if (options.requireGitTagPattern) {
    const gitTags = await getTagsAtHead();

    const eligibleTag = gitTags.find(curTag => {
      if (options.requireGitTagPattern === 'semver') {
        return semver.valid(curTag) && curTag;
      }

      return options.requireGitTagPattern?.test(curTag);
    });

    if (!eligibleTag) {
      appendLogMessage(() => log.info(toSingle`
        - ${log.chalk.yellow.bold('Skipping publish:')} No eligible tags point to the current commit.
      `));

      return;
    }

    tag = eligibleTag;
    appendLogMessage(() => log.verbose(`- Using tag ${log.chalk.green(tag)}.`));
  }


  // ----- [4] Validate Options ------------------------------------------------

  /**
   * Now that we know we are on an eligible branch, validate the remainder of
   * our options. We re-validate all options here so that we can use
   * `exactShape`, which will catch additional (re: potentially misspelled)
   * keys.
   */
  const postEligibilityOptionsValidators = {
    extensionId: ow.string,
    publishRoot: ow.string,
    syncManifestVersion: ow.optional.any(ow.string.equals('pkgJson'), ow.string.equals('gitTag')),
    auth: {
      clientId: ow.string,
      clientSecret: ow.string,
      refreshToken: ow.string
    }
  };

  ow(options, ow.object.exactShape({
    ...preEligibilityOptionsValidators,
    ...postEligibilityOptionsValidators
  }));


  // ----- [5] Verify Publish Root ---------------------------------------------

  // Ensure the publish root can be read-from.
  try {
    await fs.access(options.publishRoot);
  } catch  {
    throw new Error(`Unable to read from publish root ${log.chalk.green(options.publishRoot)}.`);
  }

  // Ensure directory is not empty.
  const files = await fs.readdir(options.publishRoot);

  if (files.length === 0) {
    throw new Error(`Found empty directory at publish root: ${log.chalk.green(options.publishRoot)}.`);
  }

  appendLogMessage(() => log.verbose(`- Publishing from ${log.chalk.green(options.publishRoot)}.`));


  // ----- [6] Read Manifest & Sync Manifest Version ---------------------------

  const { manifest, path: manifestPath } = await readExtensionManifest(options.publishRoot);

  if (options.syncManifestVersion === 'pkgJson') {
    const pkgInfo = await readPkgUp({ cwd: options.publishRoot });

    if (!pkgInfo) {
      throw new Error(toSingle`
        Option ${log.chalk.bold('syncManifestVersion')} is set to "pkgJson", but no package.json
        was found.
      `);
    }

    if (!pkgInfo.packageJson.version) {
      throw new Error(`
        Option ${log.chalk.bold('syncManifestVersion')} is set to "pkgJson", but package.json does not
        contain a "version" field.
      `);
    }

    // Versions in package.json are assumed to be valid semver strings, but if
    // they contain things like pre-release identifiers, they are not valid
    // Chrome Extension versions.
    if (!isValidChromeExtensionVersion(pkgInfo.packageJson.version)) {
      throw new Error(toSingle`
        Manifest version cannot be synchronized from package.json version
        ${log.chalk.green(pkgInfo.packageJson.version)} because it is not a valid Chrome Extension
        version identifier.%n
        For more information see: https://developer.chrome.com/extensions/manifest/version
      `);
    }

    manifest.version = pkgInfo.packageJson.version;
    await fs.writeJson(manifestPath, manifest);

    appendLogMessage(() => log.info(toSingle`
      - Manifest version synchronized from package.json version
        ${log.chalk.green(pkgInfo.packageJson.version)}.
    `));
  } else if (options.syncManifestVersion === 'gitTag') {
    if (!options.requireGitTagPattern) {
      throw new Error(toSingle`
        Option ${log.chalk.bold('requireGitTagPattern')} must be set when option
        ${log.chalk.bold('syncManifestVersion')} is set to "gitTag".
      `);
    }

    // If the user configured requireGitTagPattern to expect a semver tag, use
    // semver.valid here to strip any leading 'v' (or other prefixes) from the
    // tag, as these will result in an invalid version identifier.
    const strippedTag = options.requireGitTagPattern === 'semver' ? semver.valid(tag) as string : tag;

    // Stripped tags that are valid semver strings may still be invalid Chrome
    // Extension versions if they contain things like pre-release identifiers.
    if (!isValidChromeExtensionVersion(strippedTag)) {
      throw new Error(toSingle`
        Manifest version cannot be synchronized from Git tag ${log.chalk.green(tag)} because it is not a
        valid Chrome Extension version identifier.%n
        For more information, see: https://developer.chrome.com/extensions/manifest/version
      `);
    }

    manifest.version = strippedTag;
    await fs.writeJson(manifestPath, manifest);

    appendLogMessage(() => log.info(toSingle`
      - Manifest version synchronized to ${log.chalk.green(strippedTag)} from Git tag
        ${log.chalk.green(tag)}.
    `));
  }


  // ----- [7] Create Archive --------------------------------------------------

  const archivePath = await zipFolder(options.publishRoot);
  const archiveSize = bytes((await fs.stat(archivePath)).size);

  appendLogMessage(() => log.verbose(`- Archive path: ${log.chalk.green(archivePath)}`));
  appendLogMessage(() => log.info(toSingle`
    - Created bundle from ${log.chalk.green(options.publishRoot)} ${log.chalk.dim(`(${archiveSize})`)}.
  `));


  // Drain the list of log messages for all local checks / tasks before we start
  // to mutate remote resources.
  prependLogMessage(() => log.info(`Publishing Chrome extension ${log.chalk.bold(manifest.name)}.`));
  writeLogMessages();

  // ----- [8] Upload Artifacts ------------------------------------------------

  const { extensionId, auth: { clientId, clientSecret, refreshToken } } = options;

  const webStore = chromeWebstoreUpload({
    extensionId,
    clientId,
    clientSecret,
    refreshToken
  });

  if (!options.dryRun) {
    const artifactStream = fs.createReadStream(archivePath);
    const uploadResult: ChromeWebstoreUploadResult = await webStore.uploadExisting(artifactStream);

    if (uploadResult.uploadState === 'FAILURE' && uploadResult.itemError) {
      throw new Error(`
        Artifact upload failed:%n
        ${uploadResult.itemError.map(error => `- ${error.error_detail}`).join('%n')}
      `);
    }
  } else {
    appendLogMessage(() => log.info(log.chalk.gray(toSingle`
      - Option ${log.chalk.bold('dryRun')} is set, skipping bundle upload.
    `)));
  }


  // ----- [9] Publish Extension & Clean Up ------------------------------------

  if (!options.dryRun) {
    await webStore.publish();
  } else {
    appendLogMessage(() => log.info(log.chalk.gray(toSingle`
      - Option ${log.chalk.bold('dryRun')} is set, skipping extension publish.
    `)));
  }

  await fs.unlink(archivePath);

  if (!options.dryRun) {
    appendLogMessage(() => log.info(toSingle`
      - Successfully published ${log.chalk.bold(manifest.name)}
        ${log.chalk.green(`v${manifest.version}`)} ${log.chalk.dim(`(${archiveSize})`)}.
    `));
  } else {
    appendLogMessage(() => log.info(toSingle`
      - Successfully completed dry run for ${log.chalk.bold(manifest.name)}
        ${log.chalk.green(`v${manifest.version}`)}.
    `));
  }
}


export default async function publishExtensionRunner(options: PublishExtensionOptions) {
  try {
    const timer = log.createTimer();
    await publishExtension(options);
    writeLogMessages();
    log.info(`Done in ${timer}.`);
  } catch (err) {
    log.error(err.message);
    // Remove all lines that are in the error's message from the error's stack.
    log.verbose(err.stack.split(os.EOL).slice(err.message.split(os.EOL).length).join(os.EOL));
    throw err;
  }
}
