import path from 'path';

import execa from 'execa';
import fs from 'fs-extra';
import readPkgUp from 'read-pkg-up';


/**
 * Provided absolute paths to source and destination JSON files, writes the
 * "version" property from the source file to the destination file. Returns a
 * Promise that resolves with the version used.
 */
async function synchronizeVersions(fromFile: string, toFile: string): Promise<string> {
  const fromJson = await fs.readJson(fromFile);

  if (!fromJson.version) {
    throw new Error('Source file does not have a "version" property.');
  }

  const toJson = await fs.readJson(toFile);
  toJson.version = fromJson.version;
  await fs.writeJson(toFile, toJson, {spaces: 2});

  return fromJson.version;
}


async function main() {
  try {
    const pkgInfo = await readPkgUp({cwd: __dirname});

    if (!pkgInfo) {
      throw new Error('Unable to locate package.json.');
    }

    const fromFile = pkgInfo.path;
    const toFile = path.resolve(path.dirname(fromFile), 'src', 'manifest.json');

    const version = await synchronizeVersions(fromFile, toFile);

    // Add the file to the Git index so that during "bump" commands, this change
    // is not left out of the commit.
    await execa('git', ['add', toFile]);

    console.log(`Version in ${path.basename(toFile)} updated to ${version}.`);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}


export default main();
