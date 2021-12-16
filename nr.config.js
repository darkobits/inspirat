import path from 'path';
import { nr } from '@darkobits/ts';
import { createBabelNodeCommand } from '@darkobits/ts/lib/utils';
import { dirname } from '@darkobits/fd-name';


export default nr(({ createCommand, createScript, isCI }) => {
  const BACKEND_CWD = path.resolve(dirname(), 'packages', 'backend');
  const CLIENT_CWD = path.resolve(dirname(), 'packages', 'client');


  // ----- Backend Scripts -----------------------------------------------------

  createBabelNodeCommand('backend-deploy-dev', ['serverless', ['deploy'], { stage: 'prod' }], {
    execaOptions: { cwd: BACKEND_CWD }
  });

  createBabelNodeCommand('backend-deploy-prod', ['serverless', ['deploy']], {
    execaOptions: { cwd: BACKEND_CWD }
  });

  createBabelNodeCommand('backend-build', ['serverless', ['package']], {
    execaOptions: { cwd: BACKEND_CWD }
  });

  createScript('backend.build', {
    group: 'Backend',
    description: 'Build the backend app.',
    run: [
      'cmd:backend-build'
    ]
  });

  createScript('backend.deploy', {
    group: 'Backend',
    description: 'Deploy the backend to the development environment.',
    run: [
      'cmd:backend-deploy-dev'
    ]
  });

  createScript('backend.deploy-prod', {
    group: 'Backend',
    description: 'Deploy the backend to the production environment.',
    run: [
      'cmd:backend-deploy-prod'
    ]
  });

  // scripts.backend = {
  //   deps: { check: `${runIn('backend')} nps deps.check` },
  //   ts: { check: `${runIn('backend')} nps ts.check` },
  //   lint: `${runIn('backend')} nps lint`,
  //   deploy: {
  //     script: `${runIn('backend')} serverless deploy`,
  //     prod: { script: `${runIn('backend')} serverless deploy --stage=prod` }
  //   }
  // };

  // At the moment, serverless is not playing nice with fork-ts-checker, which
  // is responsible for running ESLint and TSC in the Webpack build. As such,
  // temporarily explicitly lint and type-check the backend package as part of
  // the build step.
  // scripts.backend.build = npsUtils.series(
  //   `${runIn('backend')} serverless webpack`
  // );

  // scripts.backend.prepare = scripts.backend.build;


  // ----- Client Scripts ------------------------------------------------------

  createScript('client.build', {
    group: 'Client',
    description: 'Build the client app.',
    run: [
      createCommand('client-build', ['vite', ['build', '--emptyOutDir']], {
        execaOptions: { cwd: CLIENT_CWD }
      })
    ]
  });

  createScript('start', {
    group: 'Client',
    description: 'Start a Vite development server for the client app.',
    run: [
      createCommand('client-start', ['vite', ['serve']], {
        execaOptions: { cwd: CLIENT_CWD }
      })
    ]
  });

  // scripts.client = {
  //   deps: { check: `${runIn('client')} nps deps.check` },
  //   lint: `${runIn('client')} nps lint`,
  //   build: `${runIn('client')} webpack --mode=production`,
  //   start: `${runIn('client')} webpack-dev-server --mode=development`,
  //   publish: [
  //     'npx babel-node',
  //     '--extensions=.ts',
  //     `--config-file=${path.resolve(__dirname, 'packages', 'client', 'babel.config.js')}`,
  //     path.resolve(__dirname, 'packages', 'client', 'scripts', 'publish-bin.ts')
  //   ].join(' ')
  // };

  // N.B. This will provide linting and type-checking via Webpack.
  // scripts.client.prepare = scripts.client.build;


  // ----- Global Scripts ------------------------------------------------------

  createScript('build', {
    group: 'Build',
    description: 'Build the client & backend.',
    run: [
      ['client.build', 'backend.build']
    ]
  });

  createScript('prepare', {
    group: 'Lifecycles',
    description: 'Bootstrap dependencies and – if not in a CI environment – build the project.',
    run: [
      createCommand('lerna-bootstrap', ['lerna', ['bootstrap']], {
        execaOptions: { stdio: 'inherit' }
      }),
      !isCI && 'build'
    ].filter(Boolean)
  });

  createScript('clean', {
    group: 'Utility',
    description: 'Remove all node_modules folders.',
    run: [
      createCommand('lerna-clean', ['lerna', ['clean'], { yes: true }]),
      createCommand('del-root-node-modules', ['del', ['./node_modules']])
    ]
  });



  // scripts.clean = {
  //   // Removes node_modules in each package, then the root.
  //   script: npsUtils.series(
  //     `${runIn('backend')} unified.del node_modules`,
  //     `${runIn('client')} unified.del node_modules`,
  //     'lerna clean --yes && unified.del node_modules'
  //   ),
  //   // Removes lock files in each package.
  //   lockFiles: npsUtils.series(
  //     `${runIn('backend')} unified.del package-lock.json`,
  //     `${runIn('client')} unified.del package-lock.json`,
  //   )
  // };

  // Checks for outdated dependencies in each package, then the root. We use
  // 'checkAll' here because 'nps deps.check' is called from the context of
  // each package, and we don't want to overwrite that script.
  // scripts.deps = {
  //   checkAll: npsUtils.series(
  //     scripts.client.deps.check,
  //     scripts.backend.deps.check,
  //     'nps deps.check'
  //   ),
  //   updateAll: npsUtils.series(
  //     npsUtils.concurrent({
  //       backend: {
  //         script: `${runIn('backend')} npm update`,
  //         color: 'bgBlack.yellow'
  //       },
  //       client: {
  //         script: `${runIn('backend')} npm update`,
  //         color: 'bgBlack.green'
  //       }
  //     }),
  //     'npm update',
  //     'lerna bootstrap',
  //     scripts.clean.lockFiles
  //   )
  // };

  // Lints each package. We use 'lintAll' here so that we do not overwrite the
  // lint script from `ts`, which we invoke in client/backend lint scripts.
  // scripts.lintAll = npsUtils.series(
  //   scripts.backend.lint,
  //   scripts.client.lint
  // );

  // N.B. We don't care about overwriting the default 'bump' script, as we will
  // never use it.
  // scripts.bump = {
  //   script: 'lerna version',
  //   beta: { script: 'lerna version prerelease --preid=beta' }
  // }

  // N.B. We don't care about overwriting the default 'build' script, as we will
  // never use it.
  // scripts.build = {
  //   script: npsUtils.concurrent({
  //     backend: {
  //       script: scripts.backend.prepare,
  //       color: 'bgBlack.yellow'
  //     },
  //     client: {
  //       script: scripts.client.prepare,
  //       color: 'bgBlack.green'
  //     }
  //   })
  // };



  // Hoisted scripts.
  // scripts.deploy = 'nps backend.deploy';
  // scripts.start = 'nps client.start';

  // return {
  //   scripts
  // };
});
