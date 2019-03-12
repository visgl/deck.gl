const config = module.require('./bundle-config');

// Set development mode (no minification)
config.mode = 'development';

// Disable transpilation
config.module.rules = [];

module.exports = config;
