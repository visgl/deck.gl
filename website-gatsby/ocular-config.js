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
      // eslint-disable-next-line
      desc: 'Using polynomial expansions of geospatial projections, \
and through emulation of 64 bit floating point computations in the GPU, \
deck.gl renders datasets with unparalleled accuracy and performance.',
      img: 'images/icon-high-precision.svg'
    },
    {
      text: 'A Layered Approach to Data Visualization',
      // eslint-disable-next-line
      desc: 'deck.gl allows complex visualizations to be constructed by \
composing existing layers, and makes it easy to package and \
share new visualizations as reusable layers. We already offer \
a catalog of proven layers and we have many more in the works.',
      img: 'images/icon-layers.svg'
    },
    {
      text: 'Rich Base Map Support',
      // eslint-disable-next-line
      desc: 'Geospatial visualizations can use vector tile layers to render maps, \
or use Mapbox GL or Google Maps as base maps with automatically synchronized camera systems. \
When used with Mapbox GL it automatically coordinates with the Mapbox perspective camera system \
and the mapbox custom layer API to provide compelling 3D visualizations on top of your \
Mapbox base maps.',
      img: 'images/icon-layers.svg'
    },
    {
      text: 'Deep React Integration',
      // eslint-disable-next-line
      desc: 'The optional React integration provides highly performant WebGL rendering \
under React\'s functional programming paradigm.',
      img: 'images/icon-react.svg'
    },
  ],

  PROJECTS: [],

  ADDITIONAL_LINKS: [],

  EXAMPLES: [
    {
      title: 'LineLayer',
      path: 'examples/line',
      image: 'images/examples/demo-thumb-line.jpg',
      componentUrl: resolve(__dirname, '../examples/website/line/app.js')
    },
    {
      title: 'HexagonLayer',
      path: 'examples/heatmap',
      image: 'images/examples/demo-thumb-heatmap.jpg',
      componentUrl: resolve(__dirname, '../examples/website/3d-heatmap/app.js')
    },
    {
      title: 'IconLayer',
      path: 'examples/icon',
      image: 'images/examples/demo-thumb-icon.jpg',
      componentUrl: resolve(__dirname, '../examples/website/icon/app.js')
    },
    {
      title: 'GeoJsonLayer (Polygons)',
      path: 'examples/geojson',
      image: 'images/examples/demo-thumb-geojson.jpg',
      componentUrl: resolve(__dirname, '../examples/website/geojson/app.js')
    },
    {
      title: 'GeoJsonLayer (Paths)',
      path: 'examples/highway',
      image: 'images/examples/demo-thumb-highway.jpg',
      componentUrl: resolve(__dirname, '../examples/website/highway/app.js')
    },
    {
      title: 'ScreenGridLayer',
      path: 'examples/screengrid',
      image: 'images/examples/demo-thumb-screengrid.jpg',
      componentUrl: resolve(__dirname, '../examples/website/screen-grid/app.js')
    },
    {
      title: 'ArcLayer',
      path: 'examples/arc',
      image: 'images/examples/demo-thumb-arc.jpg',
      componentUrl: resolve(__dirname, '../examples/website/arc/app.js')
    },
    {
      title: 'ScatterplotLayer',
      path: 'examples/scatterplot',
      image: 'images/examples/demo-thumb-scatterplot.jpg',
      componentUrl: resolve(__dirname, '../examples/website/scatterplot/app.js')
    },
    {
      title: 'PointCloudLayer',
      path: 'examples/pointcloud',
      image: 'images/examples/demo-thumb-point-cloud.jpg',
      componentUrl: resolve(__dirname, '../examples/website/point-cloud/app.js')
    },
    {
      title: 'TextLayer',
      path: 'examples/text',
      image: 'images/examples/demo-thumb-text.jpg',
      componentUrl: resolve(__dirname, '../examples/website/tagmap/app.js')
    },
    {
      title: 'TileLayer',
      path: 'examples/maptile',
      image: 'images/examples/demo-thumb-tile.jpg',
      componentUrl: resolve(__dirname, '../examples/website/map-tile/app.js')
    },
    {
      title: 'TripsLayer',
      path: 'examples/trips',
      image: 'images/examples/demo-thumb-trip.jpg',
      componentUrl: resolve(__dirname, '../examples/website/trips/app.js')
    },
    {
      title: 'Brushing Layer',
      path: 'examples/brushing',
      image: 'images/examples/demo-thumb-brushing.jpg',
      componentUrl: resolve(__dirname, '../examples/website/brushing/app.js')
    },
    {
      title: '3D Surface Explorer',
      path: 'examples/plot',
      image: 'images/examples/demo-thumb-plot.jpg',
      componentUrl: resolve(__dirname, '../examples/website/plot/app.js')
    }

    // {
    //   title: 'Point Clouds & Meshes',
    //   image: 'images/example-pointcloud.png',
    //   componentUrl: resolve(__dirname, './examples/pointcloud/app.js')
    //   path: 'examples/pointcloud'
    // },
    // {
    //   title: '3D Tiles',
    //   image: 'images/example-gltf.jpg',
    //   componentUrl: resolve(__dirname, './examples/3d-tiles/app.js')
    //   path: 'examples/3d-tiles'
    // },
    // {
    //   title: 'GLTF',
    //   image: 'images/example-gltf.jpg',
    //   componentUrl: resolve(__dirname, './templates/example-gltf.jsx')
    //   path: 'examples/gltf'
    // }
  ],

  // Avoids duplicate conflicting inputs when importing from examples folders
  // Ocular adds this to gatsby's webpack config
  webpack: {
    resolve: {
      alias: Object.assign({}, ALIASES, dependencyAliases)
    }
  }
};
