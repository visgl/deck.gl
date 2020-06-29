const {resolve} = require('path');

const ROOT_DIR = resolve('..');

module.exports = {
  plugins: [
    {
      resolve: `gatsby-theme-ocular`,
      options: {
        logLevel: 1, // Adjusts amount of debug information from ocular-gatsby

        // Folders
        DIR_NAME: __dirname,
        ROOT_FOLDER: ROOT_DIR,

        DOCS: require('../docs/table-of-contents.json'),
        DOC_FOLDERS: [
          resolve(ROOT_DIR, 'docs'),
          resolve(ROOT_DIR, 'modules')
        ],
        SOURCE: [
          resolve('./static'),
          resolve('./src')
        ],

        PROJECT_TYPE: 'github',

        PROJECT_NAME: 'deck.gl',
        PROJECT_ORG: 'visgl',
        PROJECT_ORG_LOGO: 'images/visgl-logo.png',
        PROJECT_URL: 'https://deck.gl/',
        PROJECT_DESC: 'WebGL-powered visualization framework for large-scale datasets',
        PROJECT_IMAGE: 'images/trips-layer-unfurl-4.0.jpg',

        // This is only activated in staging, with `gatsby build --prefix-paths`
        PATH_PREFIX: '/deck.gl',

        THEME_OVERRIDES: require('./src/theme.json'),

        HOME_PATH: '/',
        LINK_TO_GET_STARTED: '/docs',
        PAGES: [
          {
            path: '/',
            componentUrl: resolve('./src/index.js'),
            content: ''
          },
          {
            title: 'Showcase',
            path: '/showcase',
            componentUrl: resolve('./src/showcase.js'),
          }
        ],

        PROJECTS: [
          {name: 'deck.gl', url: 'https://deck.gl'},
          {name: 'luma.gl', url: 'https://luma.gl'},
          {name: 'loaders.gl', url: 'https://loaders.gl'},
          {name: 'react-map-gl', url: 'https://visgl.github.io/react-map-gl'}
        ],

        ADDITIONAL_LINKS: [
          {name: 'Showcase', href: '/showcase', index: 2},
          {name: 'Blog', href: 'http://medium.com/vis-gl', index: 4}
        ],

        STYLESHEETS: ['/styles.css'],

        EXAMPLES: require('./examples.js'),

        GA_TRACKING_ID: 'UA-74374017-2',

        // For showing star counts and contributors.
        // Should be like btoa('YourUsername:YourKey') and should be readonly.
        GITHUB_KEY: null
      }
    },
    `gatsby-plugin-no-sourcemaps`
  ]
};
