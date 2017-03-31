function getDocUrl(filename) {
  return `docs/${filename}`;
}
function getCodeUrl(pathname) {
  return `https://github.com/uber/deck.gl/tree/master/${pathname}`;
}

// mapping from file path in source to generated page url
export const markdownFiles = {};

function generatePath(tree, parentPath = '') {
  if (Array.isArray(tree)) {
    tree.forEach(branch => generatePath(branch, parentPath));
  }
  if (tree.name) {
    tree.path = tree.name.match(/(GeoJson|3D|([A-Z]|^)[a-z]+|\d+)/g).join('-').toLowerCase();
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
    name: 'LineLayer',
    content: {
      demo: 'LineDemo',
      code: getCodeUrl('examples/line')
    }
  },
  {
    name: '3D Heatmap',
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
    name: '3D Surface Explorer',
    content: {
      demo: 'PlotDemo',
      code: getCodeUrl('examples/plot')
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
    name: 'Trip Routes',
    content: {
      demo: 'TripsDemo',
      code: getCodeUrl('examples/trips')
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
        name: 'Getting Started',
        content: getDocUrl('getting-started.md')
      },
      {
        name: 'Using With React',
        content: getDocUrl('using-with-react.md')
      },
      {
        name: 'Using With Mapbox GL',
        content: getDocUrl('using-with-mapbox-gl.md')
      },
      {
        name: 'Upgrade Guide',
        content: getDocUrl('upgrade-guide.md')
      }
    ]
  },
  {
    name: 'About Layers',
    children: [
      {
        name: 'Overview',
        content: getDocUrl('layers/README.md')
      },
      {
        name: 'Using Layers',
        content: getDocUrl('using-layers.md')
      },
      {
        name: '64 bit Layers',
        content: getDocUrl('64-bits.md')
      },
      {
        name: 'Coordinate Systems',
        content: getDocUrl('coordinate-systems.md')
      },
      {
        name: 'Viewports',
        content: getDocUrl('viewports.md')
      },
      {
        name: 'Interactivity',
        content: getDocUrl('interactivity.md')
      }
    ]
  },
  {
    name: 'Core Layers',
    children: [
      {
        name: 'ScatterplotLayer',
        content: getDocUrl('layers/scatterplot-layer.md')
      },
      {
        name: 'ArcLayer',
        content: getDocUrl('layers/arc-layer.md')
      },
      {
        name: 'LineLayer',
        content: getDocUrl('layers/line-layer.md')
      },
      {
        name: 'GeoJsonLayer',
        content: getDocUrl('layers/geojson-layer.md')
      },
      {
        name: 'PathLayer',
        content: getDocUrl('layers/path-layer.md')
      },
      {
        name: 'PolygonLayer',
        content: getDocUrl('layers/polygon-layer.md')
      },
      {
        name: 'IconLayer',
        content: getDocUrl('layers/icon-layer.md')
      },
      {
        name: 'PointCloudLayer',
        content: getDocUrl('layers/point-cloud-layer.md')
      },
      {
        name: 'ScreenGridLayer',
        content: getDocUrl('layers/screen-grid-layer.md')
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
        name: 'HexagonLayer',
        content: getDocUrl('layers/hexagon-layer.md')
      },
      {
        name: 'HexagonCellLayer',
        content: getDocUrl('layers/hexagon-cell-layer.md')
      },
      {
        name: 'ChoroplethLayer (DEPRECATED)',
        content: getDocUrl('layers/deprecated/choropleth-layer.md')
      },
      {
        name: 'ChoroplethLayer64 (DEPRECATED)',
        content: getDocUrl('layers/deprecated/choropleth-layer-64.md')
      },
      {
        name: 'ExtrudedChoroplethLayer64 (DEPRECATED)',
        content: getDocUrl('layers/deprecated/extruded-choropleth-layer.md')
      }
    ]
  },
  {
    name: 'Custom Layers',
    children: [
      {
        name: 'Overview',
        content: getDocUrl('writing-layers/overview.md')
      },
      {
        name: 'Composite Layers',
        content: getDocUrl('writing-layers/composite-layers.md')
      },
      {
        name: 'Subclassed Layers',
        content: getDocUrl('writing-layers/subclassed-layers.md')
      },
      {
        name: 'From Ground Up',
        content: getDocUrl('writing-layers/new-layers.md')
      },
      {
        name: 'Layer Lifecycle',
        content: getDocUrl('writing-layers/layer-lifecycle.md')
      },
      {
        name: 'Attribute Management',
        content: getDocUrl('writing-layers/attribute-management.md')
      },
      {
        name: 'Writing Shaders',
        content: getDocUrl('writing-layers/writing-shaders.md')
      },
      {
        name: 'Picking',
        content: getDocUrl('writing-layers/picking.md')
      }
    ]
  },
  {
    name: 'Advanced Topics',
    children: [
      {
        name: 'Performance',
        content: getDocUrl('advanced/performance.md')
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
    name: 'API Reference',
    children: [
      {
        name: 'Layer Base Class',
        content: getDocUrl('api-reference/base-layer.md')
      },
      {
        name: 'AttributeManager',
        content: getDocUrl('api-reference/attribute-manager.md')
      },
      {
        name: 'Viewport',
        content: getDocUrl('api-reference/viewport.md')
      },
      {
        name: 'PerspectiveViewport',
        content: getDocUrl('api-reference/perspective-viewport.md')
      },
      {
        name: 'OrthographicViewport',
        content: getDocUrl('api-reference/orthographic-viewport.md')
      },
      {
        name: 'WebMercatorViewport',
        content: getDocUrl('api-reference/web-mercator-viewport.md')
      }
    ]
  }]);
