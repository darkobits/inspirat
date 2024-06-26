import path from 'path';

import { vite } from '@darkobits/tsx';
import { faviconsPlugin } from '@darkobits/vite-plugin-favicons';
import tailwindCssPlugin from '@tailwindcss/vite';
// import devcert from 'devcert';
import { visualizer } from 'rollup-plugin-visualizer';
import { VitePWA } from 'vite-plugin-pwa';

/**
 * N.B. This _must_ match infra/WebStack.ts.
 */
const WEB_PATH = path.join('src', 'web');


export default vite.react(({ config, packageJson, root, ms, manualChunks }) => {
  config.root= WEB_PATH;

  manualChunks([{
    name: 'react',
    vendor: true,
    include: [
      '@restart/',
      'object-assign/',
      'react-bootstrap',
      'react-dom',
      'react',
      'scheduler',
      'use-async-effect'
    ]
  }, {
    name: 'chance',
    vendor: true,
    include: [
      'chance'
    ]
  }, {
    name: 'storage',
    vendor: true,
    include: [
      'localforage'
    ]
  }, {
    name: 'vendor',
    include: [
      'node_modules',
      '~icons'
    ]
  }]);

  config.plugins.push(tailwindCssPlugin());

  config.plugins.push(faviconsPlugin({
    appName: 'Inspirat',
    appDescription: packageJson.description,
    version: packageJson.version,
    developerName: packageJson.author?.name as string,
    developerURL: packageJson.homepage as string,
    icons: {
      favicons: {
        source: path.resolve(root, 'assets', 'favicon.png')
      }
    }
  }));

  // PWA support.
  config.plugins.push(VitePWA({
    // TODO: Fix this typing in tsx.
    outDir: config.build.outDir as string,
    filename: 'service-worker.js',
    manifest: {
      name: 'Inspirat',
      description: packageJson.description,
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
        '**/node_modules/**/*',
        '**/apple-touch-*',
        '**/android-chrome-*',
        '**/firefox_app_*',
        '**/favicon-*'
      ],
      cacheId: packageJson.name,
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
