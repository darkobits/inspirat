import path from 'path';
import getPort from 'get-port';
import readPkgUp from 'read-pkg-up';
import webpack from 'webpack';
// @ts-ignore
import FaviconsWebpackPlugin from 'favicons-webpack-plugin';
import FriendlyErrorsWebpackPlugin from 'friendly-errors-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';


export default async (env: string, argv: any): Promise<webpack.Configuration> => { // tslint:disable-line no-unused
  const config: webpack.Configuration = {};
  config.module = {rules: []};
  config.plugins = [];

  const {pkg, path: pkgPath} = await readPkgUp();
  const pkgRoot = path.parse(pkgPath).dir;


  // ----- Entry / Output ------------------------------------------------------

  config.entry = {
    app: path.resolve(pkgRoot, 'src', 'index.tsx')
  };

  config.output = {
    path: path.resolve(pkgRoot, 'dist'),
    filename: argv.mode === 'production' ? '[name]-[chunkhash].js' : '[name].js',
    chunkFilename: '[name]-[chunkhash].js'
  };


  // ----- Loaders -------------------------------------------------------------

  // TSLint (Development only).
  if (argv.mode === 'development') {
    config.module.rules.push({
      test: /\.(ts|tsx)$/,
      exclude: /node_modules/,
      enforce: 'pre',
      loader: 'tslint-loader',
      options: {
        configFile: path.resolve(pkgRoot, 'tslint.json'),
        tsConfigFile: path.resolve(pkgRoot, 'tsconfig.json')
      }
    });
  }

  // TypeScript & JavaScript files.
  config.module.rules.push({
    test: /\.(ts|tsx|js|jsx)$/,
    loader: 'babel-loader',
    exclude: /node_modules/,
    options: {
      plugins: [
        argv.mode === 'development' && 'react-hot-loader/babel'
      ].filter(Boolean),
      cacheDirectory: true
    }
  });

  // Stylesheets.
  config.module.rules.push({
    test: /\.css$/,
    loaders: ['style-loader', 'css-loader']
  });

  // Images.
  config.module.rules.push({
    test: /\.(png|jpg|gif|svg)$/,
    loader: 'url-loader',
    options: {
      limit: 10000,
      name: 'assets/[name].[hash].[ext]'
    }
  });

  // Text.
  config.module.rules.push({
    test: /\.txt$/,
    loader: 'raw-loader'
  });

  // Fonts.
  config.module.rules.push({
    test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
    loader: 'url-loader',
    options: {
      limit: 10000
    }
  });


  // ----- Module Resolution ---------------------------------------------------

  config.resolve = {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json']
  };


  // ----- Plugins -------------------------------------------------------------

  config.plugins.push(new webpack.NamedModulesPlugin());

  config.plugins.push(new webpack.DefinePlugin({
    'process.env.__PKG_NAME__': `"${pkg.name}"`,
    'process.env.__PKG_VERSION__': `"${pkg.version}"`
  }));

  config.plugins.push(new HtmlWebpackPlugin({
    filename: 'index.html',
    template: path.resolve(pkgRoot, 'src', 'index.html'),
    inject: true
  }));

  if (argv.mode === 'development') {
    config.plugins.push(new webpack.HotModuleReplacementPlugin());
    config.plugins.push(new FriendlyErrorsWebpackPlugin());
  }

  if (argv.mode === 'production') {
    config.plugins.push(new webpack.LoaderOptionsPlugin({
      minimize: true
    }));

    config.plugins.push(new FaviconsWebpackPlugin({
      logo: path.resolve(pkgRoot, 'src', 'assets', 'favicon.png'),
      persistentCache: true,
      inject: true,
      title: 'Frontlawn Netwerks'
    }));
  }


  // ----- Dev Server ----------------------------------------------------------

  if (argv.mode === 'development') {
    const port = await getPort({port: 8080}); // tslint:disable-line await-promise

    config.devServer = {
      bonjour: true,
      historyApiFallback: true,
      disableHostCheck: true,
      host: '0.0.0.0',
      hot: true,
      inline: true,
      overlay: true,
      quiet: true,
      port
    };
  }


  // ----- Misc ----------------------------------------------------------------

  config.mode = argv.mode === 'development' ? 'development' : 'production';

  config.node = {
    setImmediate: false,
    dgram: 'empty',
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    child_process: 'empty'
  };

  config.devtool = argv.mode === 'development' ? '#eval-source-map' : '#source-map';

  config.optimization = {
    minimize: argv.mode === 'production',
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendor',
          chunks: 'all',
          minChunks: 1
        },
        data: {
          test: /src\/data.*.txt$/,
          name: 'data',
          chunks: 'all',
          minChunks: 1
        }
      }
    }
  };


  return config;
};
