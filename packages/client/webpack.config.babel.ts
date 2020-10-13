import path from 'path';

import getPort from 'get-port';
import readPkgUp from 'read-pkg-up';
import webpack from 'webpack';

import CopyWebpackPlugin from 'copy-webpack-plugin';
import FaviconsWebpackPlugin from 'favicons-webpack-plugin';
import FriendlyErrorsWebpackPlugin from 'friendly-errors-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';


export default async (env: string, argv: any): Promise<webpack.Configuration> => {
  const config: webpack.Configuration = {};
  config.module = {rules: []};
  config.plugins = [];

  const pkgInfo = await readPkgUp();

  if (!pkgInfo) {
    throw new Error('Unable to read package.json.');
  }

  const pkgRoot = path.dirname(pkgInfo.path);

  const PROD_API_URL = 'https://aws.frontlawn.net/inspirat';
  const DEV_API_URL = 'https://aws.frontlawn.net/inspirat-dev';


  // ----- Entry / Output ------------------------------------------------------

  config.entry = {
    app: [
      argv.mode === 'development' ? 'react-hot-loader/patch' : '',
      path.resolve(pkgRoot, 'src', 'index.tsx')
    ].filter(Boolean)
  };

  config.output = {
    path: path.resolve(pkgRoot, 'dist'),
    filename: argv.mode === 'production' ? '[name]-[chunkhash].js' : '[name].js',
    chunkFilename: '[name]-[chunkhash].js'
  };


  // ----- Loaders -------------------------------------------------------------

  // ESLint
  config.module.rules.push({
    test: /\.(ts|tsx)$/,
    exclude: /node_modules/,
    enforce: 'pre',
    use: [{
      loader: 'eslint-loader',
      options: {
        emitErrors: true,
        emitWarning: true,
        failOnError: argv.mode === 'production'
      }
    }]
  });

  // TypeScript & JavaScript files.
  config.module.rules.push({
    test: /\.(ts|tsx|js|jsx)$/,
    exclude: /node_modules/,
    use: [{
      loader: 'babel-loader',
      options: {
        cacheDirectory: true
      }
    }, {
      loader: 'linaria/loader',
      options: {
        sourceMap: true
      }
    }]
  });

  // Stylesheets.
  config.module.rules.push({
    test: /\.css$/,
    use: [{
      loader: MiniCssExtractPlugin.loader,
      options: {
        hmr: process.env.NODE_ENV !== 'production'
      }
    }, {
      loader: 'css-loader',
      options: {
        modules: false,
        sourceMap: true
      }
    }]
  });

  // Images.
  config.module.rules.push({
    test: /\.(png|jpg|gif|svg)$/,
    use: [{
      loader: 'url-loader',
      options: {
        limit: 10000,
        name: 'assets/[name].[hash].[ext]'
      }
    }]
  });

  // Text.
  config.module.rules.push({
    test: /\.txt$/,
    use: [{
      loader: 'raw-loader'
    }]
  });

  // Fonts.
  config.module.rules.push({
    test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
    use: [{
      loader: 'file-loader'
    }]
  });


  // ----- Module Resolution ---------------------------------------------------

  config.resolve = {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json']
  };


  // ----- Plugins -------------------------------------------------------------

  config.plugins.push(new webpack.NamedModulesPlugin());

  config.plugins.push(new webpack.DefinePlugin({
    'process.env.API_URL': JSON.stringify(argv.mode === 'development' ? DEV_API_URL : PROD_API_URL),
    'process.env.PACKAGE_VERSION': JSON.stringify(pkgInfo.packageJson.version)
  }));

  config.plugins.push(new HtmlWebpackPlugin({
    filename: 'index.html',
    template: path.resolve(pkgRoot, 'src', 'index.html'),
    inject: true,
    data: {
      title: process.env.DOCUMENT_TITLE ?? 'New Tab'
    }
  }));

  if (argv.mode === 'development') {
    config.plugins.push(new MiniCssExtractPlugin({filename: 'styles.css'}));
    config.plugins.push(new FriendlyErrorsWebpackPlugin());
  }

  if (argv.mode === 'production') {
    config.plugins.push(new MiniCssExtractPlugin({filename: 'styles-[contenthash].css'}));

    config.plugins.push(new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(pkgRoot, 'src', 'manifest.json'),
          transform: (contents: Buffer) => {
            const manifest = JSON.parse(contents.toString());
            manifest.version = pkgInfo.packageJson.version;
            return JSON.stringify(manifest, undefined, 2);
          }
        },
        path.resolve(pkgRoot, 'assets', 'favicon-16.png'),
        path.resolve(pkgRoot, 'assets', 'favicon-48.png'),
        path.resolve(pkgRoot, 'assets', 'favicon-128.png')
      ]
    }));

    config.plugins.push(new webpack.LoaderOptionsPlugin({
      minimize: true
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


  // ----- Dev Server ----------------------------------------------------------

  if (argv.mode === 'development') {
    const port = await getPort({port: 8080});

    config.devServer = {
      historyApiFallback: true,
      disableHostCheck: true,
      host: '0.0.0.0',
      inline: true,
      hot: true,
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
          test: /[/\\]node_modules[/\\]/,
          name: 'vendor',
          chunks: 'all',
          minChunks: 1
        },
        data: {
          test: /src\/data.+txt$/,
          name: 'data',
          chunks: 'all',
          minChunks: 1
        }
      }
    }
  };

  config.stats = 'minimal';


  return config;
};
