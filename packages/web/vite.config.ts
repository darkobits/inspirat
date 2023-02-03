import path from 'path';

import { vite } from '@darkobits/tsx';
import { faviconsPlugin } from '@darkobits/vite-plugin-favicons';
import { visualizer } from 'rollup-plugin-visualizer';
import { VitePluginFonts } from 'vite-plugin-fonts'
import { VitePWA } from 'vite-plugin-pwa';


export default vite(({ config, pkg, ms, manualChunks, mode }) => {
  manualChunks([{
    name: 'react',
    include: [
      'node_modules/object-assign/',
      'node_modules/scheduler/',
      'node_modules/react/',
      'node_modules/react-dom/'
    ]
  }, {
    name: 'chance',
    include: [
      'node_modules/chance'
    ]
  }, {
    name: 'storage',
    include: [
      'node_modules/localforage'
    ]
  }, {
    name: 'vendor',
    include: [
      'node_modules',
      '~icons'
    ]
  }]);

  // Disable asset-inlining. This is required because Chrome extensions need to
  // have a manifest.json in their root.
  config.build.assetsInlineLimit = 0;

  config.plugins.push(faviconsPlugin({
    appName: 'Inspirat',
    appDescription: pkg.json.description,
    version: pkg.json.version,
    developerName: pkg.json.author?.name as string,
    developerURL: pkg.json.homepage as string,
    icons: {
      favicons: {
        source: path.resolve(pkg.rootDir, 'assets', 'favicon.png')
      }
    }
  }));

  // Loads Google fonts.
  config.plugins.push(VitePluginFonts({
    google: {
      preconnect: true,
      display: 'swap',
      // https://fonts.googleapis.com/css2?family=Josefin+Sans:wght@100;200;300&family=Raleway:wght@200;300;400&display=swap
      families: [{
        name: 'Josefin Sans',
        styles: 'wght@100;200;300'
      }, {
        name: 'Raleway',
        styles: 'wght@200;300;400',
      }]
    }
  }));

  // PWA support.
  config.plugins.push(VitePWA({
    // TODO: Fix this typing in tsx.
    outDir: config.build.outDir as string,
    filename: 'service-worker.js',
    manifest: {
      name: 'Inspirat',
      description: pkg.json.description,
      display: 'standalone',
      background_color: '#000',
      theme_color: '#000'
    },
    injectRegister: null,
    workbox: {
      globPatterns: [
        '**'
      ],
      globIgnores: [
        '**\/node_modules\/**\/*',
        '**\/apple-touch-*',
        '**\/android-chrome-*',
        '**\/firefox_app_*',
        '**\/favicon-*'
      ],
      cacheId: pkg.json.name,
      runtimeCaching: [{
        // The StaleWhileRevalidate strategy tells Workbox to serve the cached
        // asset while it tries to fetch a newer version.
        handler: 'StaleWhileRevalidate',
        urlPattern: new RegExp(`(${[
          // To allow Workbox to cache requests from Google Fonts, we must use a
          // pattern that matches the start of the URL.
          '^https://fonts.googleapis.com',
          // Match any other requests.
          '.*'
        ].join('|')})`, 'g'),
        options: {
          // If a network request fails, allow Workbox to replay the request
          // when connectivity has been restored.
          backgroundSync: {
            name: 'background-sync-queue',
            options: {
              maxRetentionTime: ms('20 seconds')
            }
          }
        }
      }]
    }
  }));

  config.plugins.push(visualizer({
    emitFile: true,
    filename: 'build-stats.html',
    template: 'sunburst',
    gzipSize: true
  }));
});
