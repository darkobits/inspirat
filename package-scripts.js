const npsUtils = require('nps-utils');

const runIn = package => `lerna exec --scope="*${package}*" --`;


// ----- Backend Scripts -------------------------------------------------------

const lintBackend = `unified.tslint --project ./packages/backend/tsconfig.json  --format codeFrame`;
const buildBackend = `${runIn('backend')} serverless webpack`;

const backend = {
  checkDeps: 'npm-check --skip-unused ./packages/backend || true',
  build: npsUtils.series(lintBackend, buildBackend),
  prepare: npsUtils.series(lintBackend, buildBackend),
  deploy: {
    dev: npsUtils.series(buildBackend, `${runIn('backend')} serverless deploy`),
    prod: npsUtils.series(buildBackend, `${runIn('backend')} serverless deploy --stage prod`)
  }
};


// ----- Client Scripts --------------------------------------------------------

const lintClient = `unified.tslint --project ./packages/client/tsconfig.json  --format codeFrame`;
const buildClient = `${runIn('client')} webpack --mode=production`;

const client = {
  checkDeps: 'npm-check --skip-unused ./packages/client || true',
  build: npsUtils.series(lintClient, buildClient),
  prepare: npsUtils.series(lintClient, buildClient),
  start: `${runIn('client')} webpack-dev-server --mode=development`
};


// ----- Main Scripts ----------------------------------------------------------

module.exports = {
  scripts: {
    checkDeps: {
      description: 'Check for outdated dependencies in all packages.',
      script: npsUtils.series(
        client.checkDeps,
        backend.checkDeps,
        'npm-check --skip-unused'
      )
    },
    clean: {
      description: 'Remove installed dependencies.',
      script: 'lerna clean --yes && unified.del node_modules'
    },
    start: {
      description: 'Start a Webpack development server for the client.',
      script: client.start
    },
    build: {
      description: 'Build all packages.',
      script: npsUtils.concurrent({
        backend: backend.build,
        client: client.build
      })
    },
    deploy: {
      default: {
        description: 'Deploy the backend to the development stage.',
        script: backend.deploy.dev
      },
      production: {
        description: 'Deploy the backend to the production stage.',
        script: backend.deploy.prod
      }
    },
    prepare: {
      script: `lerna bootstrap && ${npsUtils.concurrent({
        backend: backend.prepare,
        client: client.prepare
      })}`
    }
  }
};
