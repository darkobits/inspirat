import { nr } from '@darkobits/ts';

import type { CommandOptions } from '@darkobits/nr';


// TODO: Create a "serverless" template repo for boilerplate.
export default nr(({ command, script }) => {
  const cmdOpts: CommandOptions = {
    env: {
      // See: ~/.aws/credentials
      AWS_PROFILE: 'inspirat'
    },
    stdio: 'inherit'
  };

  script('build', command('sst', {
    args: ['build', cmdOpts]
  }), {
    group: 'Build',
    description: 'Build the app and synthesize stacks using Serverless Stack.',
    timing: true
  });

  script('api.start', command('sst', {
    args: ['dev', cmdOpts]
  }), {
    group: 'Development',
    description: 'Start a Live Lambda development environment using SST.'
  });

  script('web.start', command('sst', {
    args: ['bind', 'vite', { ...cmdOpts, site: true }]
  }), {
    group: 'Development',
    description: 'Start a local Vite development server using SST.'
  });

  script('web.preview', command('sst', {
    args: ['bind', 'vite', 'preview', { ...cmdOpts, site: true }]
  }), {
    group: 'Development',
    description: 'Start a local Vite preview server using SST.'
  });
});
