#!/usr/bin/env node

import path from 'path';

import env from '@darkobits/env';
import { readDotenvUp } from '@darkobits/tsx/lib/utils';
import publishExtension from './publish-extension';


async function main() {
  readDotenvUp(__dirname);

  try {
    await publishExtension({
      extensionId: env<string>('CHROME_WEBSTORE_EXTENSION_ID'),
      publishRoot: path.resolve(__dirname, '..', 'dist'),
      requireGitBranch: 'master',
      requireGitTagPattern: 'semver',
      requireCleanWorkingDirectory: true,
      syncManifestVersion: 'pkgJson',
      auth: {
        clientId: env<string>('CHROME_WEBSTORE_CLIENT_ID'),
        clientSecret: env<string>('CHROME_WEBSTORE_CLIENT_SECRET'),
        refreshToken: env<string>('CHROME_WEBSTORE_REFRESH_TOKEN')
      }
    });
  } catch {
    process.exit(1);
  }
}


export default main();
