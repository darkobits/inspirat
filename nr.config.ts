import path from 'path';

import LogFactory from '@darkobits/log';
import { nr } from '@darkobits/tsx';
import { EXTENSIONS } from '@darkobits/ts/etc/constants';

import type { CommandOptions } from '@darkobits/nr';


const log = LogFactory({ heading: 'nr' });


export default nr(({ command, script, task }) => {
  const cmdOpts: CommandOptions = {
    execaOptions: {
      env: {
        AWS_PROFILE: 'inspirat'
      },
      stdio: 'inherit'
    }
  };


  // ----- Lint ----------------------------------------------------------------

  const eslintFlags = {
    ext: EXTENSIONS.join(','),
    format: 'codeframe'
  };


  script('lint', {
    group: 'Lint',
    description: 'Lint the project.',
    run: [
      task('lint-web-notice', () => console.log(log.chalk.bgMagenta(' ESLint '), 'Linting Web...')),
      command('lint-web', ['eslint', ['./packages/web'], eslintFlags]),
      task('lint-backend-notice', () => console.log(log.chalk.bgMagenta(' ESLint '), 'Linting Backend...')),
      command('lint-backend', ['eslint', ['./packages/backend'], eslintFlags]),
      task('lint-infra-notice', () => console.log(log.chalk.bgMagenta(' ESLint '), 'Linting Infra...')),
      command('lint-infra', ['eslint', ['./infra'], eslintFlags])
    ]
  });

  // command('eslint.fix', ['eslint', [lintRoot], { ...eslintFlags, fix: true }]);


  // ----- Build ---------------------------------------------------------------

  script('build', {
    group: 'Build',
    description: 'Build the app and synthesize stacks.',
    run: [
      command('sst', ['sst', ['build']], cmdOpts)
    ]
  });


  // ----- Develop -------------------------------------------------------------

  const CLIENT_ROOT = path.resolve('packages', 'web');

  script('backend.start', {
    group: 'Development',
    description: 'Start a live development environment using Serverless Stack.',
    run: [
      command('sst', ['sst', ['start']], cmdOpts)
    ]
  });

  script('web.start', {
    group: 'Development',
    description: 'Start the Vite development server.',
    run: [
      command('sst-env', ['sst-env', ['--', 'vite']], {
        execaOptions: { cwd: CLIENT_ROOT }
      })
    ]
  });


  // ----- Release -------------------------------------------------------------

  script('release.local', {
    group: 'Release',
    description: 'Run a local release of the Chrome extension.',
    run: [
      command('semantic-release-local', ['dotenv', ['--', 'semantic-release', '--no-ci']])
    ]
  });


  // ----- Housekeeping --------------------------------------------------------

  script('remove', {
    group: 'Housekeeping',
    description: 'Remove all stacks and resources from AWS.',
    run: [
      command('sst', ['sst', ['remove']], cmdOpts)
    ]
  });

  script('console', {
    group: 'Housekeeping',
    description: 'Start a debug session.',
    run: [
      command('sst', ['sst', ['console']], cmdOpts)
    ]
  });
});
