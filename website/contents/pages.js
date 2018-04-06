function getDocUrl(filename) {
  return `https://raw.githubusercontent.com/uber/deck.gl/master/docs/${filename}`;
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
    tree.path = tree.name.match(/(GeoJson|3D|API|([A-Z]|^)[a-z'0-9]+|\d+)/g)
      .join('-').toLowerCase().replace(/[^\w-]/g, '');
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
          code: getCodeUrl('examples/line')
        }
      },
      {
        name: 'HexagonLayer',
        content: {
          demo: 'HeatmapDemo',
          code: getCodeUrl('examples/3d-heatmap')
        }
      },
      {
        name: 'IconLayer',
        content: {
          demo: 'IconDemo',
          code: getCodeUrl('examples/icon')
        }
      },
      {
        name: 'GeoJsonLayer',
        content: {
          demo: 'GeoJsonDemo',
          code: getCodeUrl('examples/geojson')
        }
      },
      {
        name: 'ScreenGridLayer',
        content: {
          demo: 'ScreenGridDemo',
          code: getCodeUrl('examples/screen-grid')
        }
      },
      {
        name: 'ArcLayer',
        content: {
          demo: 'ArcDemo',
          code: getCodeUrl('examples/arc')
        }
      },
      {
        name: 'ScatterplotLayer',
        content: {
          demo: 'ScatterplotDemo',
          code: getCodeUrl('examples/scatterplot')
        }
      },
      {
        name: 'TextLayer',
        content: {
          demo: 'TextDemo',
          code: getCodeUrl('examples/text-layer')
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
          code: getCodeUrl('examples/brushing')
        }
      },
      {
        name: 'Trip Routes',
        content: {
          demo: 'TripsDemo',
          code: getCodeUrl('examples/trips')
        }
      },
      {
        name: 'Wind Map',
        external: 'http://uber.github.io/deck.gl/examples/wind'
      }
    ]
  },
  {
    name: 'Beyond Maps',
    expanded: true,
    children: [
      {
        name: '3D Surface Explorer',
        content: {
          demo: 'PlotDemo',
          code: getCodeUrl('examples/plot')
        }
      },
      {
        name: '3D Indoor Scan',
        external: 'http://uber.github.io/deck.gl/examples/point-cloud-laz'
      },
      {
        name: '3D Model (Point Cloud)',
        external: 'http://uber.github.io/deck.gl/examples/point-cloud-ply'
      }
    ]
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
        name: 'What\'s New',
        content: getDocUrl('whats-new.md')
      },
      {
        name: 'Upgrade Guide',
        content: getDocUrl('upgrade-guide.md')
      },
      {
        name: 'Roadmap',
        content: getDocUrl('roadmap.md')
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
        content: getDocUrl('advanced/using-standalone.md')
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
        name: 'Vis Academy',
        content: getDocUrl('get-started/vis-academy.md')
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
        name: 'Using Views',
        content: getDocUrl('advanced/views.md')
      },
      {
        name: 'Coordinate Systems',
        content: getDocUrl('advanced/coordinate-systems.md')
      },
      {
        name: 'Viewports and Projections',
        content: getDocUrl('advanced/viewports.md')
      },
      {
        name: 'Optimizing Updates',
        content: getDocUrl('advanced/updates.md')
      },
      {
        name: 'Performance Notes',
        content: getDocUrl('advanced/performance.md')
      },
      {
        name: 'About 64 bit Layers',
        content: getDocUrl('advanced/64-bits.md')
      },
      {
        name: 'Tips and Tricks',
        content: getDocUrl('advanced/tips-and-tricks.md')
      },
      {
        name: 'Building Apps',
        content: getDocUrl('developer-guide/building-apps.md')
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
            content: getDocUrl('advanced/custom-layers.md')
          },
          {
            name: 'Layer Lifecycle',
            content: getDocUrl('advanced/layer-lifecycle.md')
          },
          {
            name: 'Picking',
            content: getDocUrl('advanced/picking.md')
          },
          {
            name: 'Composite Layers',
            content: getDocUrl('advanced/composite-layers.md')
          },
          {
            name: 'Subclassed Layers',
            content: getDocUrl('advanced/subclassed-layers.md')
          },
          {
            name: 'Primitive Layers',
            content: getDocUrl('advanced/primitive-layers.md')
          },
          {
            name: 'Attribute Management',
            content: getDocUrl('advanced/attribute-management.md')
          },
          {
            name: 'Writing Shaders',
            content: getDocUrl('advanced/writing-shaders.md')
          }
        ]
      }
    ]
  },
  {
    name: 'deck.gl API',
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
            name: 'GeoJsonLayer',
            content: getDocUrl('layers/geojson-layer.md')
          },
          {
            name: 'GridLayer',
            content: getDocUrl('layers/grid-layer.md')
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
            name: 'ScatterplotLayer',
            content: getDocUrl('layers/scatterplot-layer.md')
          },
          {
            name: 'ScreenGridLayer',
            content: getDocUrl('layers/screen-grid-layer.md')
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
          // Custom viewports will be deprecated and this was never documented before, so skip
          // {
          //   name: 'FirstPersonViewport',
          //   tag: 'experimental',
          //   content: getDocUrl('api-reference/first-person-viewport.md')
          // },
          {
            name: 'OrthographicViewport',
            content: getDocUrl('api-reference/orthographic-viewport.md')
          },
          {
            name: 'PerspectiveViewport',
            content: getDocUrl('api-reference/perspective-viewport.md')
          },
          // Custom viewports will be deprecated and this was never documented before, so skip
          // {
          //   name: 'ThirdPersonViewport',
          //   tag: 'experimental',
          //   content: getDocUrl('api-reference/third-person-viewport.md')
          // },
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
          }
        ]
      },
      {
        name: 'Controllers',
        children: [
          {
            name: 'MapController',
            content: getDocUrl('api-reference/map-controller.md')
          }
        ]
      }
    ]
  },
  {
    name: 'deck.gl-test-utils API',
    children: [
      {
        name: 'testLayer',
        content: getDocUrl('api-reference/test-utils/test-layer.md')
      },
      {
        name: 'SceneRenderer',
        content: getDocUrl('api-reference/test-utils/scene-renderer.md')
      },
      {
        name: 'TestRenderer',
        content: getDocUrl('api-reference/test-utils/test-renderer.md')
      }
    ]
  }
]);
