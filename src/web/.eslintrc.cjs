/* eslint-disable no-undef */

const path = require('path');

module.exports = {
  extends: 'plugin:@darkobits/tsx',
  parserOptions: {
    project: path.resolve(__dirname, '..', '..', 'tsconfig.json')
  },
  rules: {
    'unicorn/no-null': 'off'
  }
};
