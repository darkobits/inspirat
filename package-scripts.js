const npsUtils = require('nps-utils');

const runIn = package => `lerna exec --scope="*${package}*" --`;


// ----- Main Scripts ----------------------------------------------------------

const scripts = {};


// ----- Backend Scripts -------------------------------------------------------

const lintBackendCommand = `${runIn('backend')} unified.eslint src`;
const buildBackendCommand = `${runIn('backend')} serverless webpack`;

scripts.backend = {
  checkDeps: {
    description: 'Checks for outdated dependencies in the backend package.',
    script: 'npm-check --skip-unused ./packages/backend || true'
  },
  lint: {
    description: 'Lints the backend package.',
    script: lintBackendCommand
  },
  build: {
    description: 'Creates a production build of the backend package.',
    script: npsUtils.series(lintBackendCommand, buildBackendCommand)
  },
  prepare: {
    description: 'Prepares the backend package for development or deployment.',
    script: npsUtils.series(lintBackendCommand, buildBackendCommand)
  },
  deploy: {
    default: {
      description: 'Deploy the backend package to the dev environment.',
      script: npsUtils.series(buildBackendCommand, `${runIn('backend')} serverless deploy`),
    },
    prod: {
      description: 'Deploy the backend package to the production environment.',
      script: npsUtils.series(buildBackendCommand, `${runIn('backend')} serverless deploy --stage prod`)
    }
  }
};


// ----- Client Scripts ----------------------------------------------------

const lintClientCommand = `${runIn('client')} unified.eslint src`;
const lintClientStylesCommand = `${runIn('client')} stylelint src/**/*.{ts,tsx,js,jsx,css}`;
const buildClientCommand = `${runIn('client')} "unified.del dist && webpack --mode=production"`;
const publishClientCommand = `npx babel-node --extensions=.ts --config-file=./packages/client/babel.config.js ./packages/client/scripts/publish-bin.ts`


scripts.client = {
  checkDeps: {
    description: 'Checks for outdated dependencies in the client package.',
    script: 'npm-check --skip-unused ./packages/client || true'
  },
  lint: {
    description: 'Lints the client package.',
    script: lintClientCommand,
    styles: {
      script: lintClientStylesCommand
    }
  },
  build: {
    description: 'Lints and builds the client package',
    script: npsUtils.series(lintClientCommand, buildClientCommand)
  },
  prepare: {
    description: 'Prepares the client package for development or building.',
    script: npsUtils.series(lintClientCommand, buildClientCommand)
  },
  publishClient: {
    description: 'Publish a new version of the client package to the Chrome Web Store.',
    script: publishClientCommand
  },
  start: {
    description: 'Start a Webpack development server for the client.',
    script: `${runIn('client')} webpack-dev-server --mode=development`
  }
};


// ----- Global Scripts ----------------------------------------------------

scripts.checkDeps = {
  description: 'Check for outdated dependencies in all packages.',
  script: npsUtils.series(
    scripts.client.checkDeps.script,
    scripts.backend.checkDeps.script,
    'npm-check --skip-unused || true'
  )
};

scripts.lint = {
  description: 'Lint all packages.',
  script: npsUtils.series(scripts.backend.lint.script, scripts.client.lint.script)
};

scripts.clean = {
  description: 'Remove installed dependencies.',
  script: 'lerna clean --yes && unified.del node_modules'
};

scripts.build = {
  description: 'Build all packages.',
  script: npsUtils.concurrent({
    backend: scripts.backend.build.script,
    client: scripts.client.build.script
  })
};

scripts.prepare = {
  description: 'Prepares all packages.',
  script: `lerna bootstrap && ${npsUtils.concurrent({
    backend: scripts.backend.prepare.script,
    client: scripts.client.prepare.script
  })}`
}

scripts.bump = {
  description: 'Bump package versions and generate a tagged commit.',
  script: 'lerna version'
};

// Hoisted scripts.
scripts.deploy = scripts.backend.deploy;
scripts.start = scripts.client.start;
scripts.publishClient = scripts.client.publishClient;


module.exports = {scripts};
