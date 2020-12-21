import path from 'path';
import os from 'os';

import LogFactory from '@darkobits/log';
import archiver from 'archiver';
import execa from 'execa';
import fs from 'fs-extra';
import globby from 'globby';
import tempy from 'tempy';


import { ChromeExtensionManifestV2 } from './types';


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
 * Returns the current Git branch name.
 */
export async function getBranchName() {
  const { stdout } = await execa('git', ['rev-parse', '--abbrev-ref', 'HEAD']);
  return stdout;
}


/**
 * Returns an array of all Git tags that point to the current HEAD.
 */
export async function getTagsAtHead() {
  const { stdout } = await execa('git', ['tag', '--points-at', 'HEAD']);
  return stdout.split(os.EOL).filter(Boolean);
}


/**
 * Returns a Promise that resolves with `true` if the Git index is clean, or
 * `false` otherwise.
 */
export async function isWorkingDirectoryClean() {
  const { stdout } = await execa('git', ['status', '--short']);
  return stdout.trim().length === 0;
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


/**
 * Tests whether the provided string is a valid Chrome Extension version
 * identifier.
 *
 * See: https://developer.chrome.com/extensions/manifest/version
 */
export function isValidChromeExtensionVersion(versionStr: string) {
  return /^\d+(\.\d+)?(\.\d+)?(\.\d+)?$/.test(versionStr);
}


/**
 * Provided two arrays, returns a new array by matching equally-positioned
 * elements from each.
 */
export function zip(a: Array<any>, b: Array<any>) {
  const acc = [];

  for (let i = 0, l = Math.max(a.length, b.length); i < l; i++) {
    acc.push(a[i]);
    acc.push(b[i]);
  }

  return acc;
}


/**
 * Template literal tag that converts a multi-line string to a single line
 * string. Any sequence of more than 1 white-space character will be replaced
 * with a single space.
 *
 * To force a newline in the resulting string, use the token '%n'.
 */
export function toSingle(strings: TemplateStringsArray, ...values: Array<any>) {
  return zip([...strings], values).join('').replace(/\s+/g, ' ').trim().replace(/%n/g, os.EOL);
}
