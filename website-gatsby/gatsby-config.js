const {resolve} = require('path');

module.exports = {
  plugins: [
    {
      resolve: `gatsby-theme-ocular`,
      options: {
        logLevel: 1, // Adjusts amount of debug information from ocular-gatsby

        // Folders
        DIR_NAME: __dirname,
        ROOT_FOLDER: `${__dirname}/../`,

        DOCS: require('../docs/table-of-contents.json'),
        DOC_FOLDERS: [
          `${__dirname}/../docs/`,
          `${__dirname}/../modules/`
        ],
        SOURCE: [
          `${__dirname}/static`,
          `${__dirname}/src`
        ],

        PROJECT_TYPE: 'github',

        PROJECT_NAME: 'deck.gl',
        PROJECT_ORG: 'visgl',
        PROJECT_ORG_LOGO: 'images/visgl-logo.png',
        PROJECT_URL: 'https://github.com/visgl/deck.gl',
        PROJECT_DESC: 'WebGL-powered visualization framework for large-scale datasets',
        PATH_PREFIX: '/',

        GA_TRACKING: null,

        // For showing star counts and contributors.
        // Should be like btoa('YourUsername:YourKey') and should be readonly.
        GITHUB_KEY: null,

        HOME_PATH: '/',
        LINK_TO_GET_STARTED: '/docs',
        INDEX_PAGE_URL: resolve(__dirname, './src/index.jsx'),

        PROJECTS: [
          {name: 'deck.gl', url: 'https://deck.gl'},
          {name: 'luma.gl', url: 'https://luma.gl'},
          {name: 'loaders.gl', url: 'https://loaders.gl'},
          {name: 'react-map-gl', url: 'https://visgl.github.io/react-map-gl'}
        ],

        ADDITIONAL_LINKS: [{name: 'Blog', href: 'http://medium.com/vis-gl', index: 3}],

        STYLESHEETS: [''],

        EXAMPLES: require('./examples.js').standaloneExamples,

        GA_TRACKING: null,

        // For showing star counts and contributors.
        // Should be like btoa('YourUsername:YourKey') and should be readonly.
        GITHUB_KEY: null
      }
    },
    {resolve: 'gatsby-plugin-no-sourcemaps'}
  ]
};
