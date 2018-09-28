require('@babel/polyfill');
require('@babel/register')({extensions: ['.js', '.jsx', '.ts', '.tsx']});
exports.default = require('./config/webpack.config.ts').default;
