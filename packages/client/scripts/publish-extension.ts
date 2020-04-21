import os from 'os';
import path from 'path';

import LogFactory from '@darkobits/log';
import archiver from 'archiver';
// @ts-ignore
import chromeWebstoreUpload from 'chrome-webstore-upload';
import execa from 'execa';
import fs from 'fs-extra';
import semver from 'semver';
import tempy from 'tempy';


const log = LogFactory({heading: 'extension-publish'});


/**
 * Returns an array of all Git tags that point to the current HEAD.
 */
async function getTagsAtHead() {
  const result = await execa('git', ['tag', '--points-at', 'HEAD']);
  return result.stdout.split(os.EOL).filter(Boolean);
}


/**
 * Returns the name of the current Git branch.
 */
async function getCurrentBranch() {
  const result = await execa('git', ['rev-parse', '--abbrev-ref', 'HEAD']);
  return result.stdout;
}


/**
 * Provided a path to a folder, creates a zip archive of its contents in a
 * temporary folder and resolves with the path to the archive.
 */
async function zipFolder(folderPath: string) {
  return new Promise<string>((resolve, reject) => {
    const archive = archiver('zip');
    const outputPath = tempy.file({extension: 'zip'});
    const outputHandle = fs.createWriteStream(outputPath);

    outputHandle.on('close', () => {
      resolve(outputPath);
    });

    archive.on('warning', err => {
      reject(err);
    });

    archive.on('error', err => {
      reject(err);
    });

    archive.pipe(outputHandle);
    archive.glob('**', {cwd: folderPath});
    archive.finalize(); // tslint:disable-line no-floating-promises
  });
}


/**
 * Shape of the object we get back from chrome-webstore-upload requests.
 */
interface ChromeWebstoreUploadResult {
  kind: string;
  id: string;
  uploadState: string;
  itemError?: Array<{
    error_code: string;
    error_detail: string;
  }>;
}


/**
 * Shape of the object accepted by publishExtension.
 */
interface PublishExtensionOptions {
  branch: string;
  extensionId?: string;
  clientId?: string;
  clientSecret?: string;
  refreshToken?: string;
}


/**
 * Provided a PublishExtensionOptions, archives, uploads, and publishes a
 * Chrome Extension and returns a Promise that resolves when the operation is
 * complete.
 */
async function publishExtension(options: PublishExtensionOptions) {
  // ----- [1] Determine Release Eligibility -----------------------------------

  const {branch} = options;

  const [tags, currentBranch] = await Promise.all([getTagsAtHead(), getCurrentBranch()]);
  log.verbose(`On branch ${log.chalk.yellow(currentBranch)}.`);

  if (currentBranch !== branch) {
    log.warn(`Skipping extension publish; not on branch ${log.chalk.yellow(branch)}.`);
    return;
  }

  if (tags.length === 0) {
    log.warn('Skipping extension publish; no Git tags at current commit.');
    return;
  }

  if (tags.length > 1) {
    log.warn(`Skipping extension publish; multiple Git tags at current commit: ${tags.join(', ')}`);
    return;
  }

  const tagVersion = tags[0];

  if (!semver.valid(tagVersion)) {
    throw new Error(`Skipping extension publish; Git tag ${log.chalk.green(tagVersion)} is not valid semver.`);
  }


  // ----- [2] Validate Credentials --------------------------------------------

  const {extensionId, clientId, clientSecret, refreshToken} = options;

  if (!extensionId) {
    throw new Error('Skipping extension publish; extension ID not set.');
  }

  if (!clientId) {
    throw new Error('Skipping extension publish; client ID not set.');
  }

  if (!clientSecret) {
    throw new Error('Skipping extension publish; client secret not set.');
  }

  if (!refreshToken) {
    throw new Error('Skipping extension publish; refresh token not set.');
  }


  // ----- [2] Compress Artifacts ----------------------------------------------

  const distPath = path.resolve(__dirname, '..', 'dist');

  try {
    await fs.access(distPath);
  } catch (err) {
    throw new Error(`Skipping release; extension artifacts not present at ${log.chalk.green(path.relative(__dirname, distPath))}.`);
  }

  const archivePath = await zipFolder(distPath);
  log.verbose(`Archive created at ${log.chalk.green(archivePath)}.`);


  // ----- [3] Upload Archive --------------------------------------------------

  log.info('Uploading archive.');

  const webStore = chromeWebstoreUpload({
    extensionId,
    clientId,
    clientSecret,
    refreshToken
  });

  const result: ChromeWebstoreUploadResult = await webStore.uploadExisting(fs.createReadStream(archivePath));

  log.verbose('Upload result:', result);

  if (result.uploadState === 'FAILURE' && result.itemError) {
    const message = [
      'Archive upload failed:',
      ...result.itemError.map(error => `- ${error.error_detail}`)
    ].join(os.EOL);

    throw new Error(message);
  }


  // ----- [5] Publish Archive -------------------------------------------------

  log.info('Publishing uploaded archive.');

  // await webStore.publish();

  log.info(`Successfully published extension version ${log.chalk.yellow(tagVersion)}.`);
}


async function main() {
  try {
    await publishExtension({
      branch: 'master',
      extensionId: process.env.CHROME_WEBSTORE_EXTENSION_ID,
      clientId: process.env.CHROME_WEBSTORE_CLIENT_ID,
      clientSecret: process.env.CHROME_WEBSTORE_CLIENT_SECRET,
      refreshToken: process.env.CHROME_WEBSTORE_REFRESH_TOKEN
    });
  } catch (err) {
    log.error(err.message);
    process.exit(1);
  }
}


export default main();
