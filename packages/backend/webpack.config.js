const path = require('path');
const readPkgUp = require('read-pkg-up');
const webpack = require('webpack');
const serverlessWebpack = require('serverless-webpack');


module.exports = (async () => {
  const {pkg} = await readPkgUp(__dirname);

  const config = {entry: {}};

  Object.keys(serverlessWebpack.lib.entries).forEach(key => {
    config.entry[key] = [path.resolve('src', 'etc', 'source-map-install.js'), serverlessWebpack.lib.entries[key]];
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
      'process.env.PACKAGE_VERSION': JSON.stringify(pkg.version)
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
