const PRE_MATCH_REGEX = /(GeoJson|3D|API|DeckGL|JSON)/g;

function getDocUrl(filename) {
  // DOCS_DIR specified in webpack config file
  // eslint-disable-next-line no-undef
  return `${DOCS_DIR}/docs/${filename}`;
}

function getCodeUrl(pathname) {
  return `https://github.com/uber/deck.gl/tree/master/${pathname}`;
}

// mapping from file path in source to generated page url
export const markdownFiles = {};

function generatePath(tree, parentPath = '', depth = 0) {
  if (Array.isArray(tree)) {
    tree.forEach(branch => generatePath(branch, parentPath, depth));
    return tree;
  }

  tree.depth = depth;
  if (tree.name) {
    // pre-match GeoJson|3D|API|DeckGL|JSON
    // use `#` to take up pre-matched' space
    // then replace `#` with pre-match results
    const matches = tree.name.match(PRE_MATCH_REGEX);
    tree.path = tree.name
      .replace(PRE_MATCH_REGEX, '#')
      .match(/(#|[A-Z]*[a-z'0-9\.]+|\d+)/g)
      .join('-')
      .replace('#', _ => matches.shift())
      .toLowerCase()
      .replace(/[^\w-]/g, '');
  }
  if (tree.children) {
    generatePath(tree.children, `${parentPath}/${tree.path}`, depth + 1);
  }
  if (typeof tree.content === 'string') {
    const i = tree.content.indexOf('docs/');
    if (i >= 0) {
      markdownFiles[tree.content.slice(i)] = `${parentPath}/${tree.path}`;
    }
  }

  return tree;
}

export const examplePages = generatePath([
  {
    name: 'Overview',
    content: 'markdown/examples.md'
  },
  {
    name: 'Core Layers',
    expanded: true,
    children: [
      {
        name: 'LineLayer',
        content: {
          demo: 'LineDemo',
          code: getCodeUrl('examples/website/line')
        }
      },
      {
        name: 'HexagonLayer',
        content: {
          demo: 'HexagonDemo',
          code: getCodeUrl('examples/website/3d-heatmap')
        }
      },
      {
        name: 'IconLayer',
        content: {
          demo: 'IconDemo',
          code: getCodeUrl('examples/website/icon')
        }
      },
      {
        name: 'GeoJsonLayer (Polygons)',
        content: {
          demo: 'GeoJsonDemo',
          code: getCodeUrl('examples/website/geojson')
        }
      },
      {
        name: 'GeoJsonLayer (Paths)',
        content: {
          demo: 'HighwayDemo',
          code: getCodeUrl('examples/website/highway')
        }
      },
      {
        name: 'ScreenGridLayer',
        content: {
          demo: 'ScreenGridDemo',
          code: getCodeUrl('examples/website/screen-grid')
        }
      },
      {
        name: 'ArcLayer',
        content: {
          demo: 'ArcDemo',
          code: getCodeUrl('examples/website/arc')
        }
      },
      {
        name: 'ScatterplotLayer',
        content: {
          demo: 'ScatterplotDemo',
          code: getCodeUrl('examples/website/scatterplot')
        }
      },
      {
        name: 'PointCloudLayer',
        content: {
          demo: 'PointCloudDemo',
          code: getCodeUrl('examples/website/point-cloud')
        }
      },
      {
        name: 'TextLayer',
        content: {
          demo: 'TextDemo',
          code: getCodeUrl('examples/website/tagmap')
        }
      },
      {
        name: 'TileLayer',
        content: {
          demo: 'MapTileDemo',
          code: getCodeUrl('examples/website/map-tile')
        }
      },
      {
        name: 'TripsLayer',
        content: {
          demo: 'TripsDemo',
          code: getCodeUrl('examples/website/trips')
        }
      },
      {
        name: 'HeatmapLayer',
        content: {
          demo: 'HeatmapDemo',
          code: getCodeUrl('examples/website/heatmap')
        }
      },
      {
        name: 'Tile3DLayer',
        content: {
          demo: 'Tiles3DDemo',
          code: getCodeUrl('examples/website/3d-tiles')
        }
      }
    ]
  },
  {
    name: 'Custom Layers',
    expanded: true,
    children: [
      {
        name: 'Brushing Layer',
        content: {
          demo: 'BrushingDemo',
          code: getCodeUrl('examples/website/brushing')
        }
      },
      {
        name: 'Data Filter',
        content: {
          demo: 'DataFilterDemo',
          code: getCodeUrl('examples/website/data-filter')
        }
      },
      {
        name: '3D Surface Explorer',
        content: {
          demo: 'PlotDemo',
          code: getCodeUrl('examples/website/plot')
        }
      }
    ]
  },
  {
    name: 'Declarative Layers',
    expanded: true,
    children: [
      {
        name: 'Playground',
        external: 'http://deck.gl/playground'
      }
    ]
  }
]);

export const showcasePages = generatePath([
  {
    name: 'Overview',
    content: 'markdown/showcase.md'
  },
  {
    name: 'Isochronic Map',
    external: 'http://pessimistress.github.io/isochronic-map/'
  },
  {
    name: 'Simulating the 2016 Primary',
    external: 'http://mcvs.thesunstirade.com/'
  },
  {
    name: 'The Bad Bet',
    external:
      'https://features.propublica.org/the-bad-bet/how-illinois-bet-on-video-gambling-and-lost/'
  },
  {
    name: 'SandDance',
    external: 'https://microsoft.github.io/SandDance/'
  },
  {
    name: 'Autonomy Visualization System',
    external: 'http://avs.auto'
  },
  {
    name: 'Escape',
    external: 'https://greatescape.co'
  },
  {
    name: 'BusRouter SG',
    external: 'https://busrouter.sg/visualization/'
  },
  {
    name: 'FlightMapper',
    external: 'https://flightmapper.io/'
  },
  {
    name: 'Kepler.gl',
    external: 'https://kepler.gl/'
  },
  {
    name: 'Wind Map',
    external: 'http://uber.github.io/deck.gl/examples/wind'
  },
  {
    name: 'Ascii Video Player',
    external: 'http://pessimistress.github.io/ascii/'
  },
  {
    name: 'Minecraft Chunk Viewer',
    external: 'http://pessimistress.github.io/minecraft/'
  }
]);

export const docPages = generatePath([
  {
    name: 'Overview',
    children: [
      {
        name: 'Introduction',
        content: getDocUrl('README.md')
      },
      {
        // eslint-disable-next-line
        name: "What's New",
        content: getDocUrl('whats-new.md')
      },
      {
        name: 'Upgrade Guide',
        content: getDocUrl('upgrade-guide.md')
      },
      {
        name: 'Roadmap',
        content: getDocUrl('roadmap.md')
      },
      {
        name: 'Contributing',
        content: getDocUrl('contributing.md')
      },
      {
        name: 'Frequently Asked Questions',
        content: getDocUrl('faq.md')
      }
    ]
  },
  {
    name: 'Getting Started',
    children: [
      {
        name: 'Installation',
        content: getDocUrl('get-started/getting-started.md')
      },
      {
        name: 'Using Standalone',
        content: getDocUrl('get-started/using-standalone.md')
      },
      {
        name: 'Using With React',
        content: getDocUrl('get-started/using-with-react.md')
      },
      {
        name: 'Using With A Base Map',
        content: getDocUrl('get-started/using-with-map.md')
      },
      {
        name: 'Learning Resources',
        content: getDocUrl('get-started/learning-resources.md')
      }
    ]
  },
  {
    name: 'Developer Guide',
    children: [
      {
        name: 'Using Layers',
        content: getDocUrl('developer-guide/using-layers.md')
      },
      {
        name: 'Adding Interactivity',
        content: getDocUrl('developer-guide/interactivity.md')
      },
      {
        name: 'Coordinate Systems',
        content: getDocUrl('developer-guide/coordinate-systems.md')
      },
      {
        name: 'Views and Projections',
        content: getDocUrl('developer-guide/views.md')
      },
      {
        name: 'Using Lighting ',
        content: getDocUrl('developer-guide/using-lighting.md')
      },
      {
        name: 'Performance Optimization',
        content: getDocUrl('developer-guide/performance.md')
      },
      {
        name: 'About 64 bit Layers',
        content: getDocUrl('developer-guide/64-bits.md')
      },
      {
        name: 'Tips and Tricks',
        content: getDocUrl('developer-guide/tips-and-tricks.md')
      },
      {
        name: 'Building Apps',
        content: getDocUrl('developer-guide/building-apps.md')
      },
      {
        name: 'Debugging',
        content: getDocUrl('developer-guide/debugging.md')
      },
      {
        name: 'Testing',
        content: getDocUrl('developer-guide/testing.md')
      },
      {
        name: 'Writing Custom Layers',
        children: [
          {
            name: 'Writing Your Own Layer',
            content: getDocUrl('developer-guide/custom-layers/README.md')
          },
          {
            name: 'Layer Lifecycle',
            content: getDocUrl('developer-guide/custom-layers/layer-lifecycle.md')
          },
          {
            name: 'Picking',
            content: getDocUrl('developer-guide/custom-layers/picking.md')
          },
          {
            name: 'Composite Layers',
            content: getDocUrl('developer-guide/custom-layers/composite-layers.md')
          },
          {
            name: 'Subclassed Layers',
            content: getDocUrl('developer-guide/custom-layers/subclassed-layers.md')
          },
          {
            name: 'Layer Extensions',
            content: getDocUrl('developer-guide/custom-layers/layer-extensions.md')
          },
          {
            name: 'Primitive Layers',
            content: getDocUrl('developer-guide/custom-layers/primitive-layers.md')
          },
          {
            name: 'Layer Prop Types',
            content: getDocUrl('developer-guide/custom-layers/prop-types.md')
          },
          {
            name: 'Attribute Management',
            content: getDocUrl('developer-guide/custom-layers/attribute-management.md')
          },
          {
            name: 'Writing Shaders',
            content: getDocUrl('developer-guide/custom-layers/writing-shaders.md')
          }
        ]
      }
    ]
  },
  {
    name: 'deck.gl API Reference',
    children: [
      {
        name: 'AttributeManager',
        tag: 'advanced',
        content: getDocUrl('api-reference/attribute-manager.md')
      },
      {
        name: 'Deck',
        content: getDocUrl('api-reference/deck.md')
      },
      {
        name: 'Layers',
        children: [
          {
            name: 'Overview',
            content: getDocUrl('layers/README.md')
          },
          {
            name: 'Layer',
            content: getDocUrl('api-reference/layer.md')
          },
          {
            name: 'CompositeLayer',
            content: getDocUrl('api-reference/composite-layer.md')
          },
          {
            name: 'ArcLayer',
            content: getDocUrl('layers/arc-layer.md')
          },
          {
            name: 'BitmapLayer',
            content: getDocUrl('layers/bitmap-layer.md')
          },
          {
            name: 'ColumnLayer',
            content: getDocUrl('layers/column-layer.md')
          },
          {
            name: 'ContourLayer',
            content: getDocUrl('layers/contour-layer.md')
          },
          {
            name: 'GeoJsonLayer',
            content: getDocUrl('layers/geojson-layer.md')
          },
          {
            name: 'HeatmapLayer',
            content: getDocUrl('layers/heatmap-layer.md')
          },
          {
            name: 'IconLayer',
            content: getDocUrl('layers/icon-layer.md')
          },
          {
            name: 'LineLayer',
            content: getDocUrl('layers/line-layer.md')
          },
          {
            name: 'PathLayer',
            content: getDocUrl('layers/path-layer.md')
          },
          {
            name: 'PointCloudLayer',
            content: getDocUrl('layers/point-cloud-layer.md')
          },
          {
            name: 'PolygonLayer',
            content: getDocUrl('layers/polygon-layer.md')
          },
          {
            name: 'SolidPolygonLayer',
            content: getDocUrl('layers/solid-polygon-layer.md')
          },
          {
            name: 'ScatterplotLayer',
            content: getDocUrl('layers/scatterplot-layer.md')
          },
          {
            name: 'TextLayer',
            content: getDocUrl('layers/text-layer.md')
          },
          {
            name: 'GPUGridLayer',
            tag: 'advanced',
            content: getDocUrl('layers/gpu-grid-layer.md')
          },
          {
            name: 'GreatCircleLayer',
            content: getDocUrl('layers/great-circle-layer.md')
          },
          {
            name: 'CPUGridLayer',
            tag: 'advanced',
            content: getDocUrl('layers/cpu-grid-layer.md')
          },
          {
            name: 'GridCellLayer',
            content: getDocUrl('layers/grid-cell-layer.md')
          },
          {
            name: 'HexagonLayer',
            content: getDocUrl('layers/hexagon-layer.md')
          },
          {
            name: 'H3ClusterLayer',
            content: getDocUrl('layers/h3-cluster-layer.md')
          },
          {
            name: 'H3HexagonLayer',
            content: getDocUrl('layers/h3-hexagon-layer.md')
          },
          {
            name: 'GridLayer',
            content: getDocUrl('layers/grid-layer.md')
          },
          {
            name: 'S2Layer',
            content: getDocUrl('layers/s2-layer.md')
          },
          {
            name: 'ScenegraphLayer',
            content: getDocUrl('layers/scenegraph-layer.md')
          },
          {
            name: 'ScreenGridLayer',
            content: getDocUrl('layers/screen-grid-layer.md')
          },
          {
            name: 'SimpleMeshLayer',
            content: getDocUrl('layers/simple-mesh-layer.md')
          },
          {
            name: 'TileLayer',
            content: getDocUrl('layers/tile-layer.md')
          },
          {
            name: 'Tile3DLayer',
            content: getDocUrl('layers/tile-3d-layer.md')
          },
          {
            name: 'TripsLayer',
            content: getDocUrl('layers/trips-layer.md')
          }
        ]
      },
      {
        name: 'Scripting Interface',
        children: [
          {
            name: 'DeckGL',
            content: getDocUrl('api-reference/standalone/deckgl.md')
          }
        ]
      },
      {
        name: 'Shader Modules',
        children: [
          {
            name: 'project',
            content: getDocUrl('shader-modules/project.md')
          },
          {
            name: 'project32',
            content: getDocUrl('shader-modules/project32.md')
          },
          {
            name: 'project64',
            content: getDocUrl('shader-modules/project64.md')
          }
        ]
      },
      {
        name: 'Viewports',
        children: [
          {
            name: 'Viewport',
            content: getDocUrl('api-reference/viewport.md')
          },
          {
            name: 'WebMercatorViewport',
            content: getDocUrl('api-reference/web-mercator-viewport.md')
          }
        ]
      },
      {
        name: 'Views',
        children: [
          {
            name: 'View',
            content: getDocUrl('api-reference/view.md')
          },
          {
            name: 'MapView',
            content: getDocUrl('api-reference/map-view.md')
          },
          {
            name: 'FirstPersonView',
            content: getDocUrl('api-reference/first-person-view.md')
          },
          {
            name: 'OrthographicView',
            content: getDocUrl('api-reference/orthographic-view.md')
          },
          {
            name: 'OrbitView',
            content: getDocUrl('api-reference/orbit-view.md')
          },
          {
            name: 'View State Transitions',
            content: getDocUrl('api-reference/view-state-transitions.md')
          }
        ]
      },
      {
        name: 'Controllers',
        children: [
          {
            name: 'Controller',
            content: getDocUrl('api-reference/controller.md')
          },
          {
            name: 'MapController',
            content: getDocUrl('api-reference/map-controller.md')
          }
        ]
      },
      {
        name: 'Effects',
        children: [
          {
            name: 'LightingEffect',
            content: getDocUrl('effects/lighting-effect.md')
          },
          {
            name: 'PostProcessEffect',
            content: getDocUrl('effects/post-process-effect.md')
          }
        ]
      },
      {
        name: 'Lights',
        children: [
          {
            name: 'AmbientLight',
            content: getDocUrl('api-reference/lights/ambient-light.md')
          },
          {
            name: 'PointLight',
            content: getDocUrl('api-reference/lights/point-light.md')
          },
          {
            name: 'DirectionalLight',
            content: getDocUrl('api-reference/lights/directional-light.md')
          },
          {
            name: 'CameraLight',
            content: getDocUrl('api-reference/lights/camera-light.md')
          },
          {
            name: 'SunLight',
            content: getDocUrl('api-reference/lights/sun-light.md')
          }
        ]
      }
    ]
  },
  {
    name: 'Submodule API Reference',
    children: [
      {
        name: '@deck.gl/extensions',
        children: [
          {
            name: 'Overview',
            content: getDocUrl('api-reference/extensions/overview.md')
          },
          {
            name: 'BrushingExtension',
            content: getDocUrl('api-reference/extensions/brushing-extension.md')
          },
          {
            name: 'DataFilterExtension',
            content: getDocUrl('api-reference/extensions/data-filter-extension.md')
          },
          {
            name: 'Fp64Extension',
            content: getDocUrl('api-reference/extensions/fp64-extension.md')
          },
          {
            name: 'PathStyleExtension',
            content: getDocUrl('api-reference/extensions/path-style-extension.md')
          }
        ]
      },
      {
        name: '@deck.gl/google-maps',
        children: [
          {
            name: 'Overview',
            content: getDocUrl('api-reference/google-maps/overview.md')
          },
          {
            name: 'GoogleMapsOverlay',
            content: getDocUrl('api-reference/google-maps/google-maps-overlay.md')
          }
        ]
      },
      {
        name: '@deck.gl/json',
        children: [
          {
            name: 'Overview',
            content: getDocUrl('api-reference/json/overview.md')
          },
          {
            name: 'JSONConverter',
            content: getDocUrl('api-reference/json/json-converter.md')
          }
        ]
      },
      {
        name: '@deck.gl/mapbox',
        children: [
          {
            name: 'Overview',
            content: getDocUrl('api-reference/mapbox/overview.md')
          },
          {
            name: 'MapboxLayer',
            content: getDocUrl('api-reference/mapbox/mapbox-layer.md')
          }
        ]
      },
      {
        name: '@deck.gl/react',
        children: [
          {
            name: 'DeckGL',
            content: getDocUrl('api-reference/react/deckgl.md')
          }
        ]
      },
      {
        name: '@deck.gl/test-utils',
        children: [
          {
            name: 'Overview',
            content: getDocUrl('api-reference/test-utils/overview.md')
          },
          {
            name: 'generateLayerTests',
            content: getDocUrl('api-reference/test-utils/generate-layer-tests.md')
          },
          {
            name: 'testLayer',
            content: getDocUrl('api-reference/test-utils/test-layer.md')
          },
          {
            name: 'SnapshotTestRunner',
            content: getDocUrl('api-reference/test-utils/snapshot-test-runner.md')
          }
        ]
      }
    ]
  }
]);
