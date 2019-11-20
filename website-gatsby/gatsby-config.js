// eslint-disable-next-line import/no-extraneous-dependencies
const {getGatsbyConfig} = require('ocular-gatsby/api');

const config = require('./ocular-config');

const gatsbyConfig = getGatsbyConfig(config);
gatsbyConfig.plugins.push('gatsby-plugin-sass');

module.exports = gatsbyConfig;
