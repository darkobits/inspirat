const { dirname } = require('@darkobits/fd-name');

module.exports = {
  extends: 'plugin:@darkobits/tsx',
  parserOptions: {
    project: `${dirname()}/tsconfig.json`
  },
  rules: {
    '@typescript-eslint/no-misused-promises': 'off',
    'import/no-unresolved': ['error', {
      ignore: ['^common']
    }],
    'import/order': ['error', {
      pathGroups: [{
        pattern: '^common',
        group: 'internal'
      }]
    }],
    // When using React.FunctionComponent<ComponentProps>, this rule claims that
    // ComponentProps is actually the default argument for that type, and tries
    // to remove it. This is incorrect and creates errors elsewhere.
    '@typescript-eslint/no-unnecessary-type-arguments': 'off',
    // Rationale: This project logs to the browser's console for various
    // debugging purposes.
    'no-console': 'off',
    // Rationale: This project uses prop-spreading.
    'react/jsx-props-no-spreading': 'off',
    // TODO: Update in eslint-plugin.
    'react/display-name': 'off',
    // Rationale: This project logs to the console for various debugging
    // purposes.
    // Gets confused by Ramda.
    'unicorn/no-array-method-this-argument': 'off',
    'unicorn/prefer-spread': 'off'
  },
  ignorePatterns: ['sst-env.d.ts']
};
