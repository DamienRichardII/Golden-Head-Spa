const expo = require('eslint-config-expo/flat');
module.exports = [
  ...expo,
  { ignores: ['dist/*', '.expo/*'] },
  // Texte français : les apostrophes droites sont voulues dans les écrans React Native.
  { rules: { 'react/no-unescaped-entities': 'off' } },
];
