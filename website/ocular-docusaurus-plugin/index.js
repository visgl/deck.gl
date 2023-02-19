const util = require('util');
const path = require('path');

/* Print full webpack error;
   edit node_modules/react-dev-utils/formatWebpackMessages.js

  ```
  } else if ('message' in message) {
    return message.message; 
  ```
*/

module.exports = function(context, opts = {
  resolve: {modules: [], alias: {}},
  debug: false,
  module: {},
  plugins: []
}) {
  return {
    name: 'ocular-docusaurus-plugin',
    configureWebpack(_config, isServer, utils) {
      const {resolve, debug, module, plugins} = opts;

      // Custom merging
      if (resolve) {
        if (resolve.modules) {
          _config.resolve.modules = resolve.modules;
        }
        Object.assign(_config.resolve.alias, resolve.alias);
      }

      // Uncomment to inspect config
      // console.log(util.inspect(_config.module, {depth: null}));

      // Symlink docs crash otherwise, see https://github.com/facebook/docusaurus/issues/6257
      _config.resolve.symlinks = false;

      if (isServer) {
        return {
          devtool: debug ? 'eval' : false,
          module,
          plugins,
          node: {__dirname: true}
        }
      }
      return {module, plugins};
    },
  };
}