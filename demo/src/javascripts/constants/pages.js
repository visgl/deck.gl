function getDocUrl(filename) {
  return `docs/${filename}`;
}

function generatePath(tree) {
  if (Array.isArray(tree)) {
    tree.forEach(branch => generatePath(branch));
  }
  if (tree.children) {
    generatePath(tree.children);
  }
  if (tree.name) {
    tree.path = tree.name.match(/(([A-Z]|^)[a-z]+|\d+)/g).join('-').toLowerCase();
  }
  return tree;
}

export const examplePages = generatePath([
  {
    name: 'Overview',
    content: 'code-markdown/examples.md'
  },
  {
    name: 'ScatterplotLayer',
    content: {
      demo: 'ScatterplotDemo',
      code: 'code-markdown/scatterplot.md'
    }
  },
  {
    name: 'ArcLayer',
    content: {
      demo: 'ArcDemo',
      code: 'code-markdown/arc.md'
    }
  },
  {
    name: 'ChoroplethLayer',
    content: {
      demo: 'ChoroplethDemo',
      code: 'code-markdown/choropleth.md'
    }
  },
  {
    name: 'ScreenGridLayer',
    content: {
      demo: 'GridDemo',
      code: 'code-markdown/grid.md'
    }
  },
  {
    name: 'Trip Routes',
    content: {
      demo: 'HeroDemo',
      code: 'code-markdown/trips.md'
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
        name: 'Getting Started',
        content: getDocUrl('getting-started.md')
      },
      {
        name: 'What\'s New',
        content: getDocUrl('whats-new.md')
      }
    ]
  },
  {
    name: 'Usage',
    children: [
      {
        name: 'Using Layers',
        content: getDocUrl('using-layers.md')
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
        name: 'Using Standalone',
        content: getDocUrl('using-standalone.md')
      },
      {
        name: 'Tips and Tricks',
        content: getDocUrl('tips-and-tricks.md')
      }
    ]
  },
  {
    name: 'Creating Custom Layers',
    children: [
      {
        name: 'Custom Layers',
        content: getDocUrl('custom-layers.md')
      },
      {
        name: 'Layer Lifecycle',
        content: getDocUrl('layer-lifecycle.md')
      },
      {
        name: 'Attribute Management',
        content: getDocUrl('attribute-management.md')
      }
      // WIP
      // {
      //   name: 'Writing Shaders',
      //   content: getDocUrl('writing-shaders.md')
      // }
    ]
  },
  {
    name: 'Advanced Topics',
    children: [
      {
        name: 'Coordinate Systems',
        content: getDocUrl('coordinate-systems.md')
      },
      {
        name: 'Performance',
        content: getDocUrl('performance.md')
      },
      {
        name: '64 bit Layers',
        content: getDocUrl('64-bits.md')
      }
    ]
  }
  // WIP
  // {
  //   name: 'Release History',
  //   children: [
  //     {
  //       name: 'Release History',
  //       content: getDocUrl('release-history.md')
  //     }
  //   ]
  // }
]);

export const layerDocPages = generatePath([
  {
    name: 'Catalog',
    children: [
      {
        name: 'Overview',
        content: getDocUrl('layers/README.md')
      },
      {
        name: 'Layer Base Class',
        content: getDocUrl('layers/base-layer.md')
      }
    ]
  },
  {
    name: 'Core Layers',
    children: [
      {
        name: 'ArcLayer',
        content: getDocUrl('layers/arc-layer.md')
      },
      {
        name: 'ChoroplethLayer',
        content: getDocUrl('layers/choropleth-layer.md')
      },
      {
        name: 'LineLayer',
        content: getDocUrl('layers/line-layer.md')
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
    name: '64bit Layers',
    children: [
      {
        name: 'ArcLayer64',
        content: getDocUrl('layers/arc-layer-64.md')
      },
      {
        name: 'ChoroplethLayer64',
        content: getDocUrl('layers/choropleth-layer-64.md')
      },
      {
        name: 'LineLayer64',
        content: getDocUrl('layers/line-layer-64.md')
      },
      {
        name: 'ScatterplotLayer64',
        content: getDocUrl('layers/scatterplot-layer-64.md')
      }
    ]
  }
  // {
  //   name: 'Sample Layers',
  //   children: [
  //     {
  //       name: 'ExtrudedChoroplethLayer',
  //       content: getDocUrl('layers/extruded-choropleth-layer.md')
  //     }
  //   ]
  // }
]);
