module.exports = {
  extends: [
    'stylelint-config-recommended',
    'linaria/stylelint-config'
  ],
  rules: {
    'selector-pseudo-class-no-unknown': [true, {
      // Allow the :global() selector used by Linaria to apply global styles.
      ignorePseudoClasses: ['global']
    }]
  }
};
