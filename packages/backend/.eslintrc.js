module.exports = {
  extends: [
    require.resolve('@darkobits/ts-unified/dist/config/eslint')
  ],
  parserOptions: {
    project: `${__dirname}/tsconfig.json`
  },
  rules: {
    // Rationale: This project logs to the browser's console for various
    // debugging purposes.
    'no-console': 'off'
  }
};
