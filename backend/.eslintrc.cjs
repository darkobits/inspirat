const { dirname } = require('@darkobits/fd-name');

module.exports = {
  extends: 'plugin:@darkobits/ts',
  parserOptions: {
    project: `${dirname()}/tsconfig.json`
  },
  rules: {
    // ESLint uses Babel to resolve modules, while Vite uses TypeScript's path
    // mapping. The former cannot be easily configured to resolve files in the
    // "common" folder, so ignore it.
    'import/no-unresolved': ['error', {
      ignore: [
        '^common',
        // No idea why this isn't resolving.
        '^p-queue$'
      ]
    }],
    'import/order': ['error', {
      pathGroups: [{
        pattern: '^common',
        group: 'internal'
      }]
    }],
    // Rationale: This project logs to the console for various debugging
    // purposes.
    // Gets confused by Ramda.
    'unicorn/no-array-method-this-argument': 'off',
    'unicorn/prefer-spread': 'off'
  }
};
