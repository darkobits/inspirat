import fs from 'fs';
import path from 'path';

import dotenv from 'dotenv';
import pkgDir from 'pkg-dir';
import yargs from 'yargs';

function requireNetlifyWebpack() {
  const netlifyDir = pkgDir.sync(require.resolve('netlify-lambda'));

  if (!netlifyDir) {
    throw new Error('Unable to resolve path to netlify.');
  }

  const netlifyWebpackDir = path.resolve(netlifyDir, 'node_modules', 'webpack');
  return require(netlifyWebpackDir);
}

const webpack = requireNetlifyWebpack();
const [command, dir] = yargs.argv._;
const config: any = {};


// ----- Entry / Output --------------------------------------------------------

config.entry = {};

const dirPath = path.join(process.cwd(), dir);

fs.readdirSync(dirPath).forEach(file => {
  if (file.match(/\.(ts|tsx|js|jsx)$/)) {
    const name = file.replace(/\.(ts|tsx|js|jsx)$/, '');

    // @ts-ignore
    Reflect.set(config.entry, name, `./${name}`);
  }
});


// ----- Loaders ---------------------------------------------------------------

config.module = {rules: []};

// TypeScript & JavaScript files.
config.module.rules.push({
  test: /\.(ts|tsx|js|jsx)$/,
  loader: 'babel-loader',
  exclude: /node_modules/,
  options: {
    cacheDirectory: true
  }
});


// ----- Module Resolution -----------------------------------------------------

config.resolve = {
  extensions: ['.ts', '.tsx', '.js', '.jsx', '.json']
};


// ----- Plugins ---------------------------------------------------------------

config.plugins = [];

if (command === 'serve') {
  const {UNSPLASH_ACCESS_KEY, UNSPLASH_SECRET_KEY} = dotenv.load().parsed as any;

  config.plugins.push(new webpack.DefinePlugin({
    'process.env.UNSPLASH_ACCESS_KEY': `"${UNSPLASH_ACCESS_KEY}"`,
    'process.env.UNSPLASH_SECRET_KEY': `"${UNSPLASH_SECRET_KEY}"`
  }));
}


// ----- Misc ------------------------------------------------------------------

config.devtool = command === 'serve' ? '#eval-source-map' : '#source-map';

config.devServer = {
  quiet: true
};


export default config;
