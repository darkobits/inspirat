const path = require('path');
const serverlessWebpack = require('serverless-webpack');


const config = {
  entry: {},
  target: 'node',
  output: {
    libraryTarget: 'commonjs',
    path: path.join(__dirname, '.webpack'),
    filename: '[name].js',
  },
  module: {
    rules: []
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
  },
  mode: serverlessWebpack.lib.webpack.isLocal ? 'development' : 'production',
  devtool: 'inline-source-map',
};


Object.keys(serverlessWebpack.lib.entries).forEach(key => {
  config.entry[key] = [path.resolve('src', 'etc', 'source-map-install.js'), serverlessWebpack.lib.entries[key]];
});


config.module.rules.push({
  test: /\.(ts|tsx|js|jsx)$/,
  exclude: /node_modules/,
  use: [
    {loader: 'babel-loader'}
  ]
});


module.exports = config;
