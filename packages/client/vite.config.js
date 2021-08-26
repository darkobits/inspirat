import path from 'path';

import { vite } from '@darkobits/tsx';
import faviconsPlugin from '@darkobits/vite-plugin-favicons';

export default vite(({ config, pkg }) => {
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
        source: path.resolve(pkg.rootDir, 'assets', 'favicon.png')
      }
    }
  }));
});
