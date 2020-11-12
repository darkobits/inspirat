/* eslint-disable require-atomic-updates */
import path from 'path';

import env from '@darkobits/env';
import bytes from 'bytes';
import getPort from 'get-port';
import webpack from 'webpack';

import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import FaviconsWebpackPlugin from 'favicons-webpack-plugin';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import FriendlyErrorsWebpackPlugin from 'friendly-errors-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import StyleLintWebpackPlugin from 'stylelint-webpack-plugin';

import configWrapper from './scripts/webpack-utils';


// ----- Client Webpack Configuration ------------------------------------------

export default configWrapper(async ({ config, pkg, ifProd, ifDev, mode, gitDesc }) => {
  // ----- Entry / Output ------------------------------------------------------

  config.entry = {
    app: [
      ifDev('react-hot-loader/patch', ''),
      path.resolve(pkg.root, 'src', 'index.tsx')
    ].filter(Boolean)
  };

  config.output = {
    path: path.resolve(pkg.root, 'dist'),
    filename: ifProd('[name]-[chunkhash].js', '[name].js'),
    chunkFilename: '[name]-[chunkhash].js'
  };


  // ----- Loaders -------------------------------------------------------------

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
      loader: MiniCssExtractPlugin.loader
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
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    alias: {
      // Use the @hot-loader variant of react-dom in development to avoid this
      // issue: https://github.com/gatsbyjs/gatsby/issues/11934#issuecomment-469046186
      'react-dom': ifProd('react-dom', '@hot-loader/react-dom')
    }
  };


  // ----- Plugins -------------------------------------------------------------

  config.plugins.push(new webpack.LoaderOptionsPlugin({ minimize: ifProd() }));

  config.plugins.push(new MiniCssExtractPlugin({
    filename: ifDev('styles.css', 'styles-[contenthash].css')
  }));

  config.plugins.push(new StyleLintWebpackPlugin({
    files: '**/src/**/*.{ts,tsx,js,jsx,css}',
    lintDirtyModulesOnly: ifDev(),
    emitWarning: true,
    failOnWarning: ifProd(),
    emitError: true,
    failOnError: ifProd()
  }));

  config.plugins.push(new webpack.EnvironmentPlugin({
    GIT_VERSION: gitDesc,
    // Note: This will be loaded by dotenv in development and should be present
    // in CI for production builds. Either way, env() will throw if it is not
    // set.
    BUCKET_URL: JSON.stringify(env('BUCKET_URL', true))
  }));

  config.plugins.push(new HtmlWebpackPlugin({
    filename: 'index.html',
    template: path.resolve(pkg.root, 'src', 'index.html'),
    inject: true,
    data: {
      title: process.env.DOCUMENT_TITLE ?? 'New Tab'
    }
  }));

  if (ifDev()) {
    config.plugins.push(new FriendlyErrorsWebpackPlugin());
    config.plugins.push(new webpack.HotModuleReplacementPlugin());
  }

  if (ifProd()) {
    config.plugins.push(new CleanWebpackPlugin());

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

    // Copy our Chrome Extension manifest and icon assets into the output
    // directory.
    config.plugins.push(new CopyWebpackPlugin({
      patterns: [
        path.resolve(pkg.root, 'src', 'manifest.json'),
        path.resolve(pkg.root, 'assets', 'favicon-16.png'),
        path.resolve(pkg.root, 'assets', 'favicon-48.png'),
        path.resolve(pkg.root, 'assets', 'favicon-128.png')
      ]
    }));

    config.plugins.push(new FaviconsWebpackPlugin({
      logo: path.resolve(pkg.root, 'assets', 'favicon.png'),
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

  if (ifDev()) {
    const port = await getPort({port: 8080});

    config.devServer = {
      clientLogLevel: 'warn',
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

  config.stats = 'minimal';

  config.devtool = ifDev('#inline-source-map', undefined);

  config.performance = {
    maxAssetSize: bytes('300kb'),
    maxEntrypointSize: bytes('600kb')
  };

  config.node = {
    setImmediate: false,
    dgram: 'empty',
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    child_process: 'empty'
  };

  config.optimization = {
    minimize: mode === 'production',
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


  return config;
});
