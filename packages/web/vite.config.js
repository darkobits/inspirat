import path from 'path';

import { dirname } from '@darkobits/fd-name';
import { vite } from '@darkobits/tsx';
import { faviconsPlugin } from '@darkobits/vite-plugin-favicons';
// import { visualizer } from 'rollup-plugin-visualizer';
import { VitePluginFonts } from 'vite-plugin-fonts'


export default vite(({ config, pkg, manualChunks }) => {
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
    developerName: pkg.json.author?.name,
    developerURL: pkg.json.homepage,
    icons: {
      favicons: {
        source: path.resolve(dirname(), 'assets', 'favicon.png')
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
  }))

  // config.build.rollupOptions.plugins.push(visualizer({
  //   open: true,
  //   template: 'sunburst'
  // }));
});
