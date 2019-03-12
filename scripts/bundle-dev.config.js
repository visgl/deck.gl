const config = module.require('./bundle.config');

// Set development mode (no minification)
config.mode = 'development';

// Remove .min from the name
config.output.filename = 'dist.js';

// Disable transpilation
config.module.rules = [];

console.log(JSON.stringify(config, null, 2))

module.exports = config;
