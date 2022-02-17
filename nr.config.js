import path from 'path';
import { nr } from '@darkobits/ts';
import { dirname } from '@darkobits/fd-name';


export default nr(({
  createCommand,
  createBabelNodeCommand,
  createScript,
  isCI
}) => {
  const BACKEND_CWD = path.resolve(dirname(), 'packages', 'backend');
  const CLIENT_CWD = path.resolve(dirname(), 'packages', 'client');


  // ----- Backend Scripts -----------------------------------------------------

  createBabelNodeCommand('backend-deploy-dev', ['serverless', ['deploy']], {
    execaOptions: { cwd: BACKEND_CWD }
  });

  createBabelNodeCommand('backend-deploy-prod', ['serverless', ['deploy'], { stage: 'prod' }], {
    execaOptions: { cwd: BACKEND_CWD }
  });

  createBabelNodeCommand('backend-build', ['serverless', ['package']], {
    execaOptions: { cwd: BACKEND_CWD }
  });

  createBabelNodeCommand('backend-invoke-dev', ['serverless', ['invoke'], {
    function: 'sync-collection',
    stage: 'dev'
  }], {
    execaOptions: { cwd: BACKEND_CWD }
  });

  createScript('backend.build', {
    group: 'Backend',
    description: 'Build the backend app.',
    run: [
      'cmd:backend-build'
    ]
  });

  createScript('backend.deploy.dev', {
    group: 'Backend',
    description: 'Deploy the backend to the development environment.',
    run: [
      'cmd:backend-deploy-dev'
    ]
  });

  createScript('backend.deploy.prod', {
    group: 'Backend',
    description: 'Deploy the backend to the production environment.',
    run: [
      'cmd:backend-deploy-prod'
    ]
  });

  createScript('backend.invoke.dev', {
    group: 'Backend',
    description: 'Invoke the backend sync function in the "dev" environment.',
    run: [
      'cmd:backend-invoke-dev'
    ]
  });


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
});
