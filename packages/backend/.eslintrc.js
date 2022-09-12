const { dirname } = require('@darkobits/fd-name');

module.exports = {
  extends: 'plugin:@darkobits/ts',
  parserOptions: {
    project: `${dirname()}/tsconfig.json`
  },
  rules: {
    'import/no-unresolved': 'off',
    'import/order': ['error', {
      pathGroups: [{
        pattern: '^common',
        group: 'internal'
      }]
    }],
    // Rationale: This project logs to the console for various debugging
    // purposes.
    'no-console': 'off',
    // Gets confused by Ramda.
    'unicorn/no-array-method-this-argument': 'off',
    'unicorn/prefer-spread': 'off'
  }
};
