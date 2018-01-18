function getDocUrl(filename) {
  return `docs/${filename}`;
}
function getCodeUrl(pathname) {
  return `https://github.com/uber/deck.gl/tree/5.0-release/${pathname}`;
}

// mapping from file path in source to generated page url
export const markdownFiles = {};

function generatePath(tree, parentPath = '') {
  if (Array.isArray(tree)) {
    tree.forEach(branch => generatePath(branch, parentPath));
  }
  if (tree.name) {
    tree.path = tree.name.match(/(GeoJson|3D|API|([A-Z]|^)[a-z'0-9]+|\d+)/g)
      .join('-').toLowerCase().replace(/[^\w-]/g, '');
  }
  if (tree.children) {
    generatePath(tree.children, `${parentPath}/${tree.path}`);
  }
  if (typeof tree.content === 'string') {
    markdownFiles[tree.content] = `${parentPath}/${tree.path}`;
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
        name: 'Using With React',
        content: getDocUrl('get-started/using-with-react.md')
      },
      {
        name: 'Using With Mapbox GL',
        content: getDocUrl('get-started/using-with-mapbox-gl.md')
      },
      {
        name: 'Using Layers',
        content: getDocUrl('get-started/using-layers.md')
      },
      {
        name: 'Adding Interactivity',
        content: getDocUrl('get-started/interactivity.md')
      }
    ]
  },
  {
    name: 'Custom Layers',
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
  },
  {
    name: 'Advanced Topics',
    children: [
      {
        name: 'Updates',
        content: getDocUrl('advanced/updates.md')
      },
      {
        name: 'Viewports',
        content: getDocUrl('advanced/viewports.md')
      },
      {
        name: 'Coordinate Systems',
        content: getDocUrl('advanced/coordinate-systems.md')
      },
      {
        name: 'Performance',
        content: getDocUrl('advanced/performance.md')
      },
      {
        name: '64 bit Layers',
        content: getDocUrl('advanced/64-bits.md')
      },
      {
        name: 'Using Standalone',
        content: getDocUrl('advanced/using-standalone.md')
      },
      {
        name: 'Tips and Tricks',
        content: getDocUrl('advanced/tips-and-tricks.md')
      }
    ]
  },
  {
    name: 'Layer Catalog',
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
    name: 'API Reference',
    children: [
      {
        name: 'AttributeManager (Advanced)',
        content: getDocUrl('api-reference/attribute-manager.md')
      },
      {
        name: 'LayerManager (Advanced)',
        content: getDocUrl('api-reference/layer-manager.md')
      },
      {
        name: 'Viewport',
        content: getDocUrl('api-reference/viewport.md')
      },
      {
        name: 'WebMercatorViewport',
        content: getDocUrl('api-reference/web-mercator-viewport.md')
      },
      {
        name: 'project (Shader Module)',
        content: getDocUrl('shader-modules/project.md')
      },
      {
        name: 'project64 (Shader Module)',
        content: getDocUrl('shader-modules/project64.md')
      },
      {
        name: 'lighting (Shader Module)',
        content: getDocUrl('shader-modules/lighting.md')
      }
    ]
  },
  {
    name: 'Javascript Reference',
    children: [
      {
        name: 'Controller',
        content: getDocUrl('api-reference/javascript/controller.md')
      }
    ]
  },
  {
    name: 'React Reference',
    children: [
      {
        name: 'DeckGL',
        content: getDocUrl('api-reference/react/deckgl.md')
      }
    ]
  },
  {
    name: 'API Reference (Experimental)',
    children: [
      {
        name: 'FirstPersonViewport',
        content: getDocUrl('api-reference/first-person-viewport.md')
      },
      {
        name: 'ThirdPersonViewport',
        content: getDocUrl('api-reference/third-person-viewport.md')
      }
    ]
  },
  {
    name: 'Test Utils Reference (Experimental)',
    children: [
      {
        name: 'Overview',
        content: getDocUrl('api-reference/test-utils/README.md')
      }
    ]
  }
]);
