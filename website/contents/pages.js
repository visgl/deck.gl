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
    tree.path = tree.name
      .match(/(GeoJson|3D|API|DeckGL|JSON|[A-Z]?[a-z'0-9\.]+|\d+)/g)
      .join('-')
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
          demo: 'HeatmapDemo',
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
          code: getCodeUrl('examples/website/point-cloud-laz')
        }
      },
      {
        name: 'TextLayer',
        content: {
          demo: 'TextDemo',
          code: getCodeUrl('examples/website/tagmap')
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
        name: 'Trip Routes',
        content: {
          demo: 'TripsDemo',
          code: getCodeUrl('examples/website/trips')
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
  }
]);

export const showcasePages = generatePath([
  {
    name: 'Overview',
    content: 'markdown/showcase.md'
  },
  {
    name: 'Autonomous Visualization System',
    external: 'http://streetscape.gl'
  },
  {
    name: 'FlightMapper',
    external: 'https://flightmapper.io/'
  },
  {
    name: 'Kepler.gl',
    external: 'https://uber.github.io/kepler.gl/'
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
        name: 'Using With Mapbox GL',
        content: getDocUrl('get-started/using-with-mapbox-gl.md')
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
        content: getDocUrl('get-started/using-layers.md')
      },
      {
        name: 'Adding Interactivity',
        content: getDocUrl('get-started/interactivity.md')
      },
      {
        name: 'About View States',
        content: getDocUrl('developer-guide/view-state.md')
      },
      {
        name: 'Using Views',
        content: getDocUrl('developer-guide/views.md')
      },
      {
        name: 'Coordinate Systems',
        content: getDocUrl('developer-guide/coordinate-systems.md')
      },
      {
        name: 'Viewports and Projections',
        content: getDocUrl('developer-guide/viewports.md')
      },
      {
        name: 'Optimizing Updates',
        content: getDocUrl('developer-guide/updates.md')
      },
      {
        name: 'Performance Notes',
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
        name: 'JSON',
        children: [
          {
            name: 'Using the JSON API',
            content: getDocUrl('developer-guide/json/using-json-api.md')
          },
          {
            name: 'Configuring the JSON API',
            content: getDocUrl('developer-guide/json/configuring-json-layers.md')
          }
        ]
      },
      {
        name: 'Testing',
        children: [
          {
            name: 'Overview',
            content: getDocUrl('developer-guide/testing/README.md')
          },
          {
            name: 'Testing',
            content: getDocUrl('developer-guide/testing/testing.md')
          },
          {
            name: 'Using with Unit Test Frameworks',
            content: getDocUrl('developer-guide/testing/using-with-unit-test-frameworks.md')
          }
        ]
      },
      {
        name: 'Writing Custom Layers',
        children: [
          {
            name: 'Writing Your Own Layer',
            content: getDocUrl('developer-guide/custom-layers.md')
          },
          {
            name: 'Layer Lifecycle',
            content: getDocUrl('developer-guide/layer-lifecycle.md')
          },
          {
            name: 'Picking',
            content: getDocUrl('developer-guide/picking.md')
          },
          {
            name: 'Composite Layers',
            content: getDocUrl('developer-guide/composite-layers.md')
          },
          {
            name: 'Subclassed Layers',
            content: getDocUrl('developer-guide/subclassed-layers.md')
          },
          {
            name: 'Primitive Layers',
            content: getDocUrl('developer-guide/primitive-layers.md')
          },
          {
            name: 'Layer Prop Types',
            content: getDocUrl('developer-guide/prop-types.md')
          },
          {
            name: 'Attribute Management',
            content: getDocUrl('developer-guide/attribute-management.md')
          },
          {
            name: 'Writing Shaders',
            content: getDocUrl('developer-guide/writing-shaders.md')
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
            name: 'GridLayer',
            content: getDocUrl('layers/grid-layer.md')
          },
          {
            name: 'GridCellLayer',
            content: getDocUrl('layers/grid-cell-layer.md')
          },
          {
            name: 'H3HexagonLayer',
            content: getDocUrl('layers/h3-hexagon-layer.md')
          },
          {
            name: 'H3ClusterLayer',
            content: getDocUrl('layers/h3-cluster-layer.md')
          },
          {
            name: 'HexagonLayer',
            content: getDocUrl('layers/hexagon-layer.md')
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
            name: 'S2Layer',
            content: getDocUrl('layers/s2-layer.md')
          },
          {
            name: 'ScatterplotLayer',
            content: getDocUrl('layers/scatterplot-layer.md')
          },
          {
            name: 'ScreenGridLayer',
            content: getDocUrl('layers/screen-grid-layer.md')
          },
          {
            name: 'TextLayer',
            content: getDocUrl('layers/text-layer.md')
          },
          {
            name: 'TileLayer',
            content: getDocUrl('layers/tile-layer.md')
          },
          {
            name: 'TripsLayer',
            content: getDocUrl('layers/trips-layer.md')
          },
          {
            name: 'H3 Layers',
            children: [
              {
                name: 'H3HexagonLayer (Experimental)',
                content: getDocUrl('layers/h3-layers/h3-hexagon-layer.md')
              },
              {
                name: 'H3OutlineLayer (Experimental)',
                content: getDocUrl('layers/h3-layers/h3-outline-layer.md')
              },
              {
                name: 'H3RingLayer (Experimental)',
                content: getDocUrl('layers/h3-layers/h3-ring-layer.md')
              }
            ]
          }
        ]
      },
      {
        name: 'React',
        children: [
          {
            name: 'DeckGL',
            content: getDocUrl('api-reference/react/deckgl.md')
          }
        ]
      },
      {
        name: 'Standalone',
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
          },
          {
            name: 'lighting',
            content: getDocUrl('shader-modules/lighting.md')
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
            name: 'ThirdPersonView',
            content: getDocUrl('api-reference/third-person-view.md')
          },
          {
            name: 'OrthographicView',
            content: getDocUrl('api-reference/orthographic-view.md')
          },
          {
            name: 'PerspectiveView',
            content: getDocUrl('api-reference/perspective-view.md')
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
          }
        ]
      }
    ]
  },
  {
    name: 'JSON API Reference (Experimental)',
    children: [
      {
        name: 'JSONDeck (Experimental)',
        content: getDocUrl('api-reference/json/json-deck.md')
      },
      {
        name: 'JSONLayer (Experimental)',
        content: getDocUrl('api-reference/json/json-layer.md')
      }
    ]
  },
  {
    name: 'Mapbox API Reference (Experimental)',
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
    name: 'test-utils API Reference',
    children: [
      {
        name: 'generateLayerTests',
        content: getDocUrl('api-reference/test-utils/generate-layer-test.md')
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
]);
