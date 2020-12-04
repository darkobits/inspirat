import { webpackServerless } from '@darkobits/tsx';
import { gitDescribe } from '@darkobits/tsx/lib/utils';

import { EnvironmentPlugin } from 'webpack';


const config = webpackServerless(({ config }) => {
  config.plugins.push(new EnvironmentPlugin({
    GIT_VERSION: gitDescribe(),
    BUILD_TIMESTAMP: new Date().toISOString()
  }));
});


module.exports = config({}, {});
