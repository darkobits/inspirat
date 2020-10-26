module.exports = {
  extends: '@darkobits/ts-unified/dist/config/babel',
  presets: [
    ['@babel/preset-typescript', { onlyRemoveTypeImports: true }],
    'linaria/babel'
  ],
  plugins: [
    'react-hot-loader/babel'
  ]
};
