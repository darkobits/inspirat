module.exports = require('@darkobits/ts-unified/dist/config/babel')({
  presets: [
    '@babel/preset-react',
    ['@emotion/babel-preset-css-prop', {
      autoLabel: true
    }]
  ]
});
