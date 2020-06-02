module.exports = {
  extends: [
    require.resolve('@darkobits/ts-unified/dist/config/eslint-react')
  ],
  parserOptions: {
    project: `${__dirname}/tsconfig.json`
  },
  rules: {
    // Rationale: This project uses prop-spreading.
    'react/jsx-props-no-spreading': 'off',
    // Rationale: This project logs to the browser's console for various
    // debugging purposes.
    'no-console': 'off',
    // Rationale: This rule has a very aggressive regular expression to test
    // whether a function is a React hook[1] that winds up matching
    // useAsyncEffect. The rule then throws a false positive because the
    // function passed to useAsyncEffect is async. Consider re-enabling it if a
    // future version is more configurable.
    'react-hooks/exhaustive-deps': 'off',
    '@typescript-eslint/indent': ['error', 2, {
      SwitchCase: 1
    }],
    '@typescript-eslint/restrict-template-expressions': 'off'
  }
};
