const path = require('path');

module.exports = {
  plugins: [
    require('postcss-inline-svg')({
      paths: [path.join(__dirname, 'src')]
    }),
    require('autoprefixer')({
      overrideBrowserslist: ['last 2 versions', 'not dead', 'not op_mini all'],
      ignoreUnknownVersions: true
    })
  ]
};
