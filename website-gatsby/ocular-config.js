/* eslint-disable no-multi-str */
const resolve = require('path').resolve;

const DOCS = require('../docs/table-of-contents.json');
const DEPENDENCIES = require('./package.json').dependencies;
// eslint-disable-next-line import/no-extraneous-dependencies
const ALIASES = require('ocular-dev-tools/config/ocular.config')({
  root: resolve(__dirname, '..')
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
  PROJECT_URL: 'https://deck.gl',
  PROJECT_DESC: 'Large-scale WebGL-powered Data Visualization',
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
      text: 'A Layered Approach to Data Visualization',
      desc:
        'deck.gl allows complex visualizations to be constructed by \
composing existing layers, and makes it easy to package and \
share new visualizations as reusable layers. We already offer \
a catalog of proven layers and we have many more in the works.',
      img: 'images/icon-layers.svg'
    },
    {
      text: 'High-Precision Computations in the GPU',
      desc:
        'By emulating 64 bit floating point computations in the GPU, \
deck.gl renders datasets with unparalleled accuracy and performance.',
      img: 'images/icon-high-precision.svg'
    },
    {
      text: 'React and Mapbox GL Integrations',
      desc:
        'deck.gl is a great match with React, supporting efficient WebGL \
rendering under the Reactive programming paradigm. And when used with \
Mapbox GL it automatically coordinates with the Mapbox camera system \
to provide compelling 2D and 3D visualizations on top of your Mapbox \
based maps.',
      img: 'images/icon-react.svg'
    }
  ],

  PROJECTS: [
    {
      name: 'deck.gl',
      url: 'https://deck.gl'
    },
    {
      name: 'luma.gl',
      url: 'https://luma.gl'
    },
    {
      name: 'react-map-gl',
      url: 'https://uber.github.io/react-map-gl'
    },
    {
      name: 'react-vis',
      url: 'https://uber.github.io/react-vis'
    }
  ],

  ADDITIONAL_LINKS: [],

  LINK_TO_GET_STARTED: '/docs',

  INDEX_PAGE_URL: resolve(__dirname, './src/index.jsx'),

  EXAMPLES: [
    {
      title: 'LineLayer',
      path: 'examples/website/line',
      image: 'images/examples/demo-thumb-line.jpg',
      componentUrl: resolve(__dirname, './src/examples/example-line-layer.jsx')
    },
    {
      title: 'HexagonLayer',
      path: 'examples/website/3d-heatmap',
      image: 'images/examples/demo-thumb-hexagon.jpg',
      componentUrl: resolve(__dirname, './src/examples/example-hexagon-layer.jsx')
    },
    {
      title: 'IconLayer',
      path: 'examples/website/icon',
      image: 'images/examples/demo-thumb-icon.jpg',
      componentUrl: resolve(__dirname, './src/examples/example-icon-layer.jsx')
    },
    {
      title: 'GeoJsonLayer (Polygons)',
      path: 'examples/website/geojson',
      image: 'images/examples/demo-thumb-geojson.jpg',
      componentUrl: resolve(__dirname, './src/examples/example-geojson-layer.jsx')
    },
    {
      title: 'GeoJsonLayer (Paths)',
      path: 'examples/website/highway',
      image: 'images/examples/demo-thumb-highway.jpg',
      componentUrl: resolve(__dirname, './src/examples/example-highway-demo.jsx')
    },
    {
      title: 'ScreenGridLayer',
      path: 'examples/website/screengrid',
      image: 'images/examples/demo-thumb-screengrid.jpg',
      componentUrl: resolve(__dirname, './src/examples/example-screengrid-layer.jsx')
    },
    {
      title: 'ArcLayer',
      path: 'examples/website/arc',
      image: 'images/examples/demo-thumb-arc.jpg',
      componentUrl: resolve(__dirname, './src/examples/example-arc-layer.jsx')
    },
    {
      title: 'ScatterplotLayer',
      path: 'examples/website/scatterplot',
      image: 'images/examples/demo-thumb-scatterplot.jpg',
      componentUrl: resolve(__dirname, './src/examples/example-scatterplot-layer.jsx')
    },
    {
      title: 'PointCloudLayer',
      path: 'examples/website/pointcloud',
      image: 'images/examples/demo-thumb-point-cloud.jpg',
      componentUrl: resolve(__dirname, './src/examples/example-pointcloud-layer.jsx')
    },
    {
      title: 'TextLayer',
      path: 'examples/website/text-layer',
      image: 'images/examples/demo-thumb-text.jpg',
      componentUrl: resolve(__dirname, './src/examples/example-text-layer.jsx')
    },
    {
      title: 'TileLayer',
      path: 'examples/website/map-tile',
      image: 'images/examples/demo-thumb-tile.jpg',
      componentUrl: resolve(__dirname, './src/examples/example-tile-layer.jsx')
    },
    {
      title: 'TripsLayer',
      path: 'examples/website/trips',
      image: 'images/examples/demo-thumb-trip.jpg',
      componentUrl: resolve(__dirname, './src/examples/example-trips-layer.jsx')
    },
    {
      title: 'HeatmapLayer',
      path: 'examples/website/heatmap',
      image: 'images/examples/demo-thumb-heatmap.jpg',
      componentUrl: resolve(__dirname, './src/examples/example-heatmap-layer.jsx')
    },
    {
      title: 'Tile3DLayer',
      path: 'examples/website/3d-tiles',
      image: 'images/examples/demo-thumb-3d-tiles.jpg',
      componentUrl: resolve(__dirname, './src/examples/example-tile3d-layer.jsx')
    },
    {
      title: 'Brushing',
      path: 'examples/website/brushing',
      image: 'images/examples/demo-thumb-brushing.jpg',
      componentUrl: resolve(__dirname, './src/examples/example-brushing-demo.jsx')
    },
    {
      title: 'Data Filtering',
      path: 'examples/website/data-filter',
      image: 'images/examples/demo-thumb-data-filter.jpg',
      componentUrl: resolve(__dirname, './src/examples/example-data-filter-demo.jsx')
    },
    {
      title: '3D Surface Explorer',
      path: 'examples/website/plot',
      image: 'images/examples/demo-thumb-plot.jpg',
      componentUrl: resolve(__dirname, './src/examples/example-plot-demo.jsx')
    }
  ],

  // Avoids duplicate conflicting inputs when importing from examples folders
  // Ocular adds this to gatsby's webpack config
  webpack: {
    resolve: {
      alias: Object.assign({}, ALIASES, dependencyAliases)
    }
  }
};
/* eslint-enable no-multi-str */
