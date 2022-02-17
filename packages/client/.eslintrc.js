module.exports = {
  extends: [
    'plugin:@darkobits/tsx'
  ],
  parserOptions: {
    // TODO: findTsConfig should search upwards from the directory of the config
    // file.
    project: `${__dirname}/tsconfig.json`
  },
  rules: {
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
    'react/display-name': 'off'
  },
  ignorePatterns: ['scripts/**']
};
