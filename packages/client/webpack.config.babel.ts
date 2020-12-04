import path from 'path';

import env from '@darkobits/env';
import { webpack } from '@darkobits/tsx';
import { gitDescribe, readDotenvUp } from '@darkobits/tsx/lib/utils';
import { EnvironmentPlugin } from 'webpack';

import CopyWebpackPlugin from 'copy-webpack-plugin';
import FaviconsWebpackPlugin from 'favicons-webpack-plugin';


// ----- Client Webpack Configuration ------------------------------------------

export default webpack(({ config, isProduction, pkgRoot, bytes }) => {
  // Load .env file(s).
  readDotenvUp(pkgRoot);

  config.plugins.push(new EnvironmentPlugin({
    GIT_VERSION: gitDescribe(),
    // Note: This will be loaded by dotenv in development and should be present
    // in CI for production builds. Either way, env() will throw if it is not
    // set.
    BUCKET_URL: env('BUCKET_URL', true)
  }));

  if (isProduction) {
    // Copy our Chrome Extension manifest and icon assets into the output
    // directory.
    config.plugins.push(new CopyWebpackPlugin({
      patterns: [
        path.resolve(pkgRoot, 'src', 'manifest.json'),
        path.resolve(pkgRoot, 'assets', 'favicon-16.png'),
        path.resolve(pkgRoot, 'assets', 'favicon-48.png'),
        path.resolve(pkgRoot, 'assets', 'favicon-128.png')
      ]
    }));

    config.plugins.push(new FaviconsWebpackPlugin({
      logo: path.resolve(pkgRoot, 'assets', 'favicon.png'),
      inject: true,
      favicons: {
        icons: {
          android: false,
          coast: false,
          yandex: false
        }
      }
    }));
  }

  config.performance = {
    maxAssetSize: bytes('550kb'),
    maxEntrypointSize: bytes('1MB')
  };

  // TODO: This was causing odd bundle output/sizing issues after migrating to
  // 'tsx'.
  // config.optimization = {
  //   splitChunks: {
  //     cacheGroups: {
  //       vendor: {
  //         test: /[/\\]node_modules[/\\]/,
  //         name: 'vendor',
  //         chunks: 'all',
  //         minChunks: 1
  //       },
  //       data: {
  //         test: /src\/data.+txt$/,
  //         name: 'data',
  //         chunks: 'all',
  //         minChunks: 1
  //       }
  //     }
  //   }
  // };
});
