import path from 'path';
import { createRequire } from 'module';


const require = createRequire(import.meta.url);


export default ({
  createBabelNodeCommand,
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


  createScript('publish', {
    group: 'Build',
    description: 'Publish the Inspirat client to the Chrome Web Store.',
    run: [
      createCommand('publish', ['babel-node', [
        // '--loader',
        // 'ts-node/esm',
        '--extensions=".ts,.js"',
        '--',
        'publish-bin.ts'
      ]], {
        execaOptions: {
          cwd: path.resolve('scripts')
        }
      })
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
        execaOptions: { cwd: CLIENT_ROOT }
      })
    ]
  });


  // ----- Release -------------------------------------------------------------

  createScript('release.local', {
    group: 'Release',
    description: 'Run a local release',
    run: [
      createCommand('semantic-release', ['dotenv', ['--', 'semantic-release', '--no-ci']])
    ]
  })

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
