#!/usr/bin/env node

import path from 'path';

import env from '@darkobits/env';
import { dirname } from '@darkobits/fd-name';
import { readDotenvUp } from '@darkobits/tsx/lib/utils';
import publishExtension from './publish-extension';


async function main() {
  readDotenvUp(dirname());

  try {
    await publishExtension({
      extensionId: env<string>('CHROME_WEBSTORE_EXTENSION_ID'),
      publishRoot: path.resolve(dirname() as string, '..', 'dist'),
      requireGitBranch: 'master',
      requireGitTagPattern: 'semver',
      requireCleanWorkingDirectory: true,
      syncManifestVersion: 'pkgJson',
      auth: {
        clientId: env<string>('CHROME_WEBSTORE_CLIENT_ID', true),
        clientSecret: env<string>('CHROME_WEBSTORE_CLIENT_SECRET', true),
        refreshToken: env<string>('CHROME_WEBSTORE_REFRESH_TOKEN', true)
      }
    });
  } catch {
    process.exit(1);
  }
}


export default main();
