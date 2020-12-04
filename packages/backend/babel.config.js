module.exports = {
  extends: require('@darkobits/ts').babel,
  presets: [
    ['@babel/preset-typescript', {
      onlyRemoveTypeImports: true
    }]
  ]
};
