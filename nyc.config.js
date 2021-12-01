// luma.gl, MIT license
module.exports = {
  extends: '@istanbuljs/nyc-config-typescript',
  all: 'true',
  sourceMap: false,
  instrument: true,
  extensions: ['.ts'],
  include: ['modules/**/src'],
  exclude: ['modules/test-utils/']
};
