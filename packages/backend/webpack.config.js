const path = require('path');
const readPkgUp = require('read-pkg-up');
const webpack = require('webpack');
const serverlessWebpack = require('serverless-webpack');


module.exports = (async () => {
  const pkgInfo = await readPkgUp(__dirname);

  if (!pkgInfo) {
    throw new Error('Unable to read package.json.');
  }

  const config = {entry: {}};

  Object.keys(serverlessWebpack.lib.entries).forEach(key => {
    config.entry[key] = [path.resolve('etc', 'source-map-install.js'), serverlessWebpack.lib.entries[key]];
  });

  config.target = 'node';

  config.output = {
    libraryTarget: 'commonjs',
    path: path.join(__dirname, '.webpack'),
    filename: '[name].js'
  };

  config.module = {
    rules: [{
      test: /\.(ts|tsx|js|jsx)$/,
      exclude: /node_modules/,
      use: [
        {loader: 'babel-loader'}
      ]
    }]
  };

  config.plugins = [
    new webpack.DefinePlugin({
      'process.env.PACKAGE_VERSION': JSON.stringify(pkgInfo.package.version),
      'process.env.PACKAGE_BUILD_TIMESTAMP': JSON.stringify(new Date().toISOString())
    })
  ];

  config.resolve = {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json']
  };

  config.mode = serverlessWebpack.lib.webpack.isLocal ? 'development' : 'production';

  config.devtool = 'inline-source-map';

  config.stats = 'minimal';

  return config;
})();
