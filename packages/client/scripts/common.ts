import path from 'path';
import os from 'os';

import LogFactory from '@darkobits/log';
import archiver from 'archiver';
import execa from 'execa';
import fs from 'fs-extra';
import globby from 'globby';
import tempy from 'tempy';


import {ChromeExtensionManifestV2} from './types';


const log = LogFactory();


/**
 * Return value of `readExtensionManifest`.
 */
export interface ReadExtensionManifestResult {
  path: string;
  manifest: ChromeExtensionManifestV2;
}


/**
 * Provided a path to an extension's root directory, returns a Promise that
 * resolves with the path to the extension's manifest.
 *
 * If no manifest is found, rejects with an error. If multiple manifests are
 * found, rejects with an error.
 */
export async function readExtensionManifest(extensionRoot: string): Promise<ReadExtensionManifestResult> {
  const results = await globby(`${path.resolve(extensionRoot)}${path.sep}**${path.sep}manifest.json`);

  if (results.length === 0) {
    throw new Error(`No manifest.json found in ${log.chalk.green(extensionRoot)}.`);
  }

  if (results.length > 1) {
    const message = [
      `Multiple manifest.json files found in ${log.chalk.green(extensionRoot)}:`,
      ...results.map((result: string) => `- ${log.chalk.green(path.relative(extensionRoot, result))}`)
    ].join(os.EOL);

    throw new Error(message);
  }

  return {
    path: results[0],
    manifest: require(results[0])
  };
}


/**
 * Returns an array of all Git tags that point to the current HEAD.
 */
export async function getTagsAtHead() {
  const result = await execa('git', ['tag', '--points-at', 'HEAD']);
  return result.stdout.split(os.EOL).filter(Boolean);
}


/**
 * Provided a path to a folder, creates a zip archive of its contents in a
 * temporary folder and returns a Promise that resolves with the path to the
 * archive.
 */
export async function zipFolder(folderPath: string) {
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
    void archive.finalize();
  });
}
