module.exports = {
  extends: 'plugin:@darkobits/ts',
  parserOptions: {
    project: `${__dirname}/tsconfig.json`
  },
  rules: {
    // Rationale: This project logs to the console for various debugging
    // purposes.
    'no-console': 'off',
    // Gets confused by Ramda.
    'unicorn/no-array-method-this-argument': 'off',
    'unicorn/prefer-spread': 'off'
  }
};
