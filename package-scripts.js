const npsUtils = require('nps-utils');

const runIn = package => `lerna exec --scope="*${package}*" --`;


// ----- Backend Scripts -------------------------------------------------------

const lintBackend = `${runIn('backend')} unified.eslint src`;
const buildBackend = `${runIn('backend')} serverless webpack`;

const backend = {
  checkDeps: 'npm-check --skip-unused ./packages/backend || true',
  lint: lintBackend,
  build: npsUtils.series(lintBackend, buildBackend),
  prepare: npsUtils.series(lintBackend, buildBackend),
  deploy: {
    dev: npsUtils.series(buildBackend, `${runIn('backend')} serverless deploy`),
    prod: npsUtils.series(buildBackend, `${runIn('backend')} serverless deploy --stage prod`)
  }
};


// ----- Client Scripts --------------------------------------------------------

const lintClient = `${runIn('client')} unified.eslint src`;
const buildClient = `${runIn('client')} "unified.del dist && webpack --mode=production"`;
const publishClient = `npx babel-node --extensions=.ts --config-file=./packages/client/babel.config.js ./packages/client/scripts/publish-extension.ts`

const client = {
  checkDeps: 'npm-check --skip-unused ./packages/client || true',
  lint: lintClient,
  build: npsUtils.series(lintClient, buildClient),
  prepare: npsUtils.series(lintClient, buildClient),
  publishClient,
  start: `${runIn('client')} webpack-dev-server --mode=development`
};


// ----- Main Scripts ----------------------------------------------------------

module.exports = {
  scripts: {
    'checkDeps': {
      description: 'Check for outdated dependencies in all packages.',
      script: npsUtils.series(
        client.checkDeps,
        backend.checkDeps,
        'npm-check --skip-unused || true'
      )
    },
    'lint': {
      description: 'Lint all packages.',
      script: npsUtils.series(backend.lint, client.lint)
    },
    'clean': {
      description: 'Remove installed dependencies.',
      script: 'lerna clean --yes && unified.del node_modules'
    },
    'start': {
      description: 'Start a Webpack development server for the client.',
      script: client.start
    },
    'build': {
      description: 'Build all packages.',
      script: npsUtils.concurrent({
        backend: backend.build,
        client: client.build
      })
    },
    'bump': {
      description: 'Bump package versions and generate a tagged commit.',
      script: 'lerna version'
    },
    'deploy': {
      default: {
        description: 'Deploy the backend to the development stage.',
        script: backend.deploy.dev
      },
      production: {
        description: 'Deploy the backend to the production stage.',
        script: backend.deploy.prod
      }
    },
    'publish-client': {
      description: 'Publish a new version of Inspirat to the Chrome Web Store.',
      script: client.publishClient
    },
    'prepare': {
      script: `lerna bootstrap && ${npsUtils.concurrent({
        backend: backend.prepare,
        client: client.prepare
      })}`
    }
  }
};
