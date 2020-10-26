const npsUtils = require('nps-utils');

const runIn = package => `lerna exec --scope="*${package}*" --`;


// ----- Main Scripts ----------------------------------------------------------

const scripts = {};


// ----- Backend Scripts -------------------------------------------------------

const lintBackendCommand = `${runIn('backend')} unified.eslint src`;
const typeCheckBackendCommand = `${runIn('backend')} unified.ttsc --pretty --noEmit`;
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
  typeCheck: {
    description: 'Type-checks the backend package',
    script: typeCheckBackendCommand
  },
  build: {
    description: 'Builds  the backend package.',
    script: buildBackendCommand
  },
  prepare: {
    description: 'Prepares the backend package for development or deployment.',
    script: buildBackendCommand
  },
  deploy: {
    default: {
      description: 'Deploy the backend package to the dev environment.',
      script: `${runIn('backend')} serverless deploy`,
    },
    prod: {
      description: 'Deploy the backend package to the production environment.',
      script: `${runIn('backend')} serverless deploy --stage prod`
    }
  }
};


// ----- Client Scripts ----------------------------------------------------

const lintClientCommand = `${runIn('client')} unified.eslint src`;
const lintClientStylesCommand = `${runIn('client')} stylelint src/**/*.{ts,tsx,js,jsx,css}`;
const typeCheckClientCommand = `${runIn('client')} unified.ttsc --pretty --noEmit`;
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
  typeCheck: {
    description: 'Type-checks the client package',
    script: typeCheckClientCommand
  },
  build: {
    description: 'Builds the client package',
    script: buildClientCommand,
  },
  prepare: {
    description: 'Prepares the client package for development or deployment.',
    script: buildClientCommand
  },
  publish: {
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

scripts.typeCheck = {
  description: 'Type-check all packages.',
  script: npsUtils.concurrent({
    backend: scripts.backend.typeCheck.script,
    client: scripts.client.typeCheck.script
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

module.exports = {scripts};
