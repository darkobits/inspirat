// Enable debugging.
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
    // We do not need to release to NPM or GitHub.
    // '@semantic-release/npm',
    // '@semantic-release/github',
    ['semantic-release-chrome', {
      distFolder: 'chrome',
      asset: 'inspirat.zip',
      extensionId: GOOGLE_EXTENSION_ID,
      target: 'trustedTesters'
    }]
  ]
}
