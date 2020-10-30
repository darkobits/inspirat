import path from 'path';

import execa from 'execa';
import webpack from 'webpack';
import serverlessWebpack from 'serverless-webpack';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';


// ----- Backend Webpack Configuration -----------------------------------------

async function main(): Promise<webpack.Configuration> {
  const config: webpack.Configuration = {entry: {}};
  config.module = {rules: []};
  config.plugins = [];

  config.mode = serverlessWebpack.lib.webpack.isLocal ? 'development' : 'production';

  const gitVersion = (await execa('git', ['describe'])).stdout;


  // ----- Entry / Output ------------------------------------------------------

  // Use Serverless config to determine our entry-points.
  config.entry = serverlessWebpack.lib.entries;

  config.target = 'node';

  config.output = {
    libraryTarget: 'commonjs',
    path: path.join(__dirname, '.webpack'),
    filename: '[name].js'
  };


  // ----- Loaders -------------------------------------------------------------

  // TypeScript & JavaScript files.
  config.module.rules.push({
    test: /\.(ts|tsx|js|jsx)$/,
    exclude: /node_modules/,
    use: [
      {loader: 'babel-loader'}
    ]
  });


  // ----- Module Resolution ---------------------------------------------------

  config.resolve = {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json']
  };


  // ----- Plugins -------------------------------------------------------------

  config.plugins.push(new webpack.DefinePlugin({
    'process.env.GIT_VERSION': JSON.stringify(gitVersion),
    'process.env.BUILD_TIMESTAMP': JSON.stringify(new Date().toISOString())
  }));

  if (config.mode === 'production') {
    config.plugins.push(new ForkTsCheckerWebpackPlugin({
      eslint: {
        enabled: true,
        files: './src/**/*.{ts,tsx,js,jsx}'
      },
      typescript: {
        enabled: true,
        diagnosticOptions: {
          semantic: true,
          syntactic: true
        }
      }
    }));
  }


  // ----- Misc ----------------------------------------------------------------

  config.devtool = config.mode === 'development' ? '#inline-source-map' : undefined;

  config.stats = 'minimal';


  return config;
}


module.exports = main();
