import path from 'path';


export default ({
  createCommand,
  createNodeCommand,
  createScript
}) => {
  const cmdOpts = {
    execaOptions: {
      env: {
        AWS_PROFILE: 'inspirat'
      },
      stdio: 'inherit'
    }
  };


  // ----- Build ---------------------------------------------------------------

  createScript('build', {
    group: 'Build',
    description: 'Build the app and synthesize stacks.',
    run: [
      createCommand('sst', ['sst', ['build']], cmdOpts)
    ]
  });


  // ----- Develop -------------------------------------------------------------

  const CLIENT_ROOT = path.resolve('web');

  createScript('backend.start', {
    group: 'Development',
    description: 'Start a live development environment using Serverless Stack.',
    run: [
      createCommand('sst', ['sst', ['start']], cmdOpts)
    ]
  });

  createScript('web.start', {
    group: 'Development',
    description: 'Start the Vite development server.',
    run: [
      createNodeCommand('wait', [path.resolve('./scripts/wait-for-stack.js')]),
      createNodeCommand('sst-env', ['sst-env', ['--', 'vite']], {
        execaOptions: {
          cwd: CLIENT_ROOT,
          env: {
            TSX_ROOT: CLIENT_ROOT
          }
        }
      })
    ]
  });


  // ----- Housekeeping --------------------------------------------------------

  createScript('deps.check', {
    group: 'Housekeeping',
    description: 'Check for newer versions of installed dependencies.',
    run: [
      createCommand('npm-check-updates', ['npm-check-updates'], {
        execaOptions: { stdio: 'inherit' }
      })
    ]
  });

  createScript('remove', {
    group: 'Housekeeping',
    description: 'Remove all stacks and resources from AWS.',
    run: [
      createCommand('sst', ['sst', ['remove']], cmdOpts)
    ]
  });

  createScript('console', {
    group: 'Housekeeping',
    description: 'Start a debug session.',
    run: [
      createCommand('sst', ['sst', ['console']], cmdOpts)
    ]
  });
};
