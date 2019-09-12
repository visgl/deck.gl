const getBabelConfig = require('ocular-dev-tools/config/babel.config');

module.exports = api => {
  const config = getBabelConfig(api);

  config.plugins = config.plugins || [];
  config.plugins.push([
    'babel-plugin-inline-import',
    {
      extensions: ['.worker.js']
    }
  ]);

  // https://babeljs.io/docs/en/options#overrides
  const overrides = config.overrides || [];
  // TEST to prevent compilation of already transpiled files
  // These files should be copied without any modification
  overrides.push({
    test: /min.js|transpiled.js/,
    compact: false,
    sourceMaps: false
  });
  // Default babel config (env, plugin) only apply to the rest of the files
  overrides.push(
    Object.assign(
      {
        exclude: /min.js|transpiled.js/
      },
      config
    )
  );

  return {
    ignore: ['**/*.worker.js'],
    overrides
  };
};
