require('@babel/polyfill');
require('@babel/register')({extensions: ['.js', '.jsx', '.ts', '.tsx']});
module.exports = require('./config/webpack.config.ts').default;
