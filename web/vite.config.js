import path from 'path';

import { dirname } from '@darkobits/fd-name';
import { vite } from '@darkobits/tsx';
import { generateManualChunksMap } from '@darkobits/tsx/lib/utils.js';
import faviconsPlugin from '@darkobits/vite-plugin-favicons';
// import { visualizer } from 'rollup-plugin-visualizer';


export default vite(({ config, pkg }) => {
  config.build.rollupOptions.output.manualChunks = generateManualChunksMap([{
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
    developerName: pkg.json.author?.name,
    developerURL: pkg.json.homepage,
    icons: {
      favicons: {
        source: path.resolve(dirname(), 'assets', 'favicon.png')
      }
    }
  }));

  // config.build.rollupOptions.plugins.push(visualizer({
  //   open: true,
  //   template: 'sunburst'
  // }));
});
