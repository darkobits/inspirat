module.exports = {
  extends: require('@darkobits/ts').eslint,
  parserOptions: {
    project: `${__dirname}/tsconfig.json`
  },
  rules: {
    // Rationale: This project logs to the console for various debugging
    // purposes.
    'no-console': 'off'
  }
};
