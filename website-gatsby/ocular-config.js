const resolve = require('path').resolve;

const DOCS = require('../docs/table-of-contents.json');
const DEPENDENCIES = require('./package.json').dependencies;
// eslint-disable-next-line import/no-extraneous-dependencies
const ALIASES = require('ocular-dev-tools/config/ocular.config')({
  root: resolve(__dirname, '../..')
}).aliases;

// When duplicating example dependencies in website, autogenerate
// aliases to ensure the website version is picked up
// NOTE: module dependencies are automatically injected
// TODO - should this be automatically done by ocular-gatsby?
const dependencyAliases = {};
for (const dependency in DEPENDENCIES) {
  dependencyAliases[dependency] = `${__dirname}/node_modules/${dependency}`;
}

module.exports = {
  logLevel: 3, // Adjusts amount of debug information from ocular-gatsby

  DOC_FOLDER: `${__dirname}/../docs/`,
  ROOT_FOLDER: `${__dirname}/../`,
  DIR_NAME: `${__dirname}`,

  DOCS,

  // TODO/ib - from ocular, deduplicate with above settings
  PROJECT_TYPE: 'github',

  PROJECT_NAME: 'deck.gl',
  PROJECT_ORG: 'uber',
  PROJECT_URL: 'https://github.com/uber/deck.gl',
  PROJECT_DESC: 'A WebGL-powered framework for visual exploratory analysis of large datasets.',
  PATH_PREFIX: '/',

  FOOTER_LOGO: '',

  GA_TRACKING: null,

  // For showing star counts and contributors.
  // Should be like btoa('YourUsername:YourKey') and should be readonly.
  GITHUB_KEY: null,

  HOME_PATH: '/',

  HOME_HEADING: 'A WebGL-powered framework for visual exploratory analysis of large datasets.',

  HOME_RIGHT: null,

  HOME_BULLETS: [
    {
      text: '',
      desc: '',
      img: 'images/icon-high-precision.svg'
    },
    {
      text: 'High-Precision Computations in the GPU',
      desc: 'Using polynomial expansions of geospatial projections, \
and through emulation of 64 bit floating point computations in the GPU, \
deck.gl renders datasets with unparalleled accuracy and performance.',
      img: 'images/icon-high-precision.svg'
    },
    {
      text: 'A Layered Approach to Data Visualization',
      desc: 'deck.gl allows complex visualizations to be constructed by \
composing existing layers, and makes it easy to package and \
share new visualizations as reusable layers. We already offer \
a catalog of proven layers and we have many more in the works.',
      img: 'images/icon-layers.svg'
    },
    {
      text: 'Rich Base Map Support',
      desc: 'Geospatial visualizations can use vector tile layers to render maps, \
or use Mapbox GL or Google Maps as base maps with automatically synchronized camera systems. \
When used with Mapbox GL it automatically coordinates with the Mapbox perspective camera system \
and the mapbox custom layer API to provide compelling 3D visualizations on top of your \
Mapbox base maps.',
      img: 'images/icon-layers.svg'
    },
    {
      text: 'Deep React Integration',
      desc: 'The optional React integration provides highly performant WebGL rendering \
under React\'s functional programming paradigm.',
      img: 'images/icon-react.svg'
    },
  ],

  PROJECTS: [],

  ADDITIONAL_LINKS: [],

  EXAMPLES: [
    // {
    //   title: 'Point Clouds & Meshes',
    //   image: 'images/example-pointcloud.png',
    //   componentUrl: resolve(__dirname, './examples/pointcloud/app.js'),
    //   path: 'examples/pointcloud'
    // },
    // {
    //   title: '3D Tiles',
    //   image: 'images/example-gltf.jpg',
    //   componentUrl: resolve(__dirname, './examples/3d-tiles/app.js'),
    //   path: 'examples/3d-tiles'
    // },
    // {
    //   title: 'GLTF',
    //   image: 'images/example-gltf.jpg',
    //   componentUrl: resolve(__dirname, './templates/example-gltf.jsx'),
    //   path: 'examples/gltf'
    // }
  ],

  // Avoids duplicate conflicting inputs when importing from examples folders
  // Ocular adds this to gatsby's webpack config
  webpack: {
    resolve: {
      // modules: [resolve(__dirname, './node_modules')],
      alias: Object.assign({}, ALIASES, dependencyAliases, {
        //   '@luma.gl/addons': `${__dirname}/node_modules/@luma.gl/addons/src`,
        //   '@luma.gl/core': `${__dirname}/node_modules/@luma.gl/core/src`,
        //   '@luma.gl/constants': `${__dirname}/node_modules/@luma.gl/constants/src`,
        //   '@luma.gl/webgl': `${__dirname}/node_modules/@luma.gl/webgl/src`,
        //   '@deck.gl/core': `${__dirname}/node_modules/@deck.gl/core/src`,
        //   '@deck.gl/layers': `${__dirname}/node_modules/@deck.gl/layers/src`,
        //   '@deck.gl/react': `${__dirname}/node_modules/@deck.gl/react/src`
      })
    }
  }
};
