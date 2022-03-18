// require('debug').enable('semantic-release:*');

const env = require('@darkobits/env');
const GOOGLE_EXTENSION_ID = env('GOOGLE_EXTENSION_ID', true);

module.exports = {
  branches: [
    { name: 'master', channel: 'latest' },
    { name: 'develop', channel: 'beta' }
  ],
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    // '@semantic-release/npm',
    // '@semantic-release/github',
    ['semantic-release-chrome', {
      distFolder: 'chrome',
      asset: 'inspirat.zip',
      extensionId: GOOGLE_EXTENSION_ID,
      target: 'trustedTesters'
    }]
  ],
  // verifyConditions: ['semantic-release-chrome'],
  // prepare: [{
  //   path: 'semantic-release-chrome',
  //   distFolder: 'web/dist',
  //   // manifestPath: 'web/public/manifest.json',
  //   asset: 'inspirat.zip'
  // }],
  // publish: [{
  //   path: 'semantic-release-chrome',
  //   asset: 'inspirat.zip',
  //   extensionId: GOOGLE_EXTENSION_ID,
  //   target: 'trustedTesters'
  // }],
  // dryRun: true
}
