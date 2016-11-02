function getGithubUrl(filename) {
  return `https://raw.githubusercontent.com/uber/deck.gl/dev/docs/${filename}`
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
    name: 'Master List',
    content: 'docs/examples.md'
  },
  {
    name: 'ScatterplotLayer',
    content: {
      demo: 'ScatterplotDemo',
      code: 'docs/scatterplot.md'
    }
  },
  {
    name: 'ArcLayer',
    content: {
      demo: 'ArcDemo',
      code: 'docs/arc.md'
    }
  },
  {
    name: 'ChoroplethLayer',
    content: {
      demo: 'ChoroplethDemo',
      code: 'docs/choropleth.md'
    }
  },
  {
    name: 'ScreenGridLayer',
    content: {
      demo: 'GridDemo',
      code: 'docs/grid.md'
    }
  },
  {
    name: 'Trip Routes',
    content: {
      demo: 'HeroDemo',
      code: 'docs/trips.md'
    }
  }
]);

export const docPages = generatePath([
  {
    name: 'Overview',
    children: [
      {
        name: 'Introduction',
        content: getGithubUrl('introduction.md')
      },
      {
        name: 'Getting Started',
        content: getGithubUrl('getting-started.md')
      },
      {
        name: 'Using Layers',
        content: getGithubUrl('using-layers.md')
      }
    ]
  },
  {
    name: 'Usage',
    children: [
      {
        name: 'Using With React',
        content: getGithubUrl('using-with-react.md')
      },
      {
        name: 'Using With Mapbox GL',
        content: getGithubUrl('using-with-mapbox-gl.md')
      },
      {
        name: 'Using Standalone',
        content: getGithubUrl('using-standalone.md')
      },
      {
        name: 'Tips and Tricks',
        content: getGithubUrl('tips-and-tricks.md')
      }
    ]
  },
  {
    name: 'Creating Custom Layers',
    children: [
      {
        name: 'Custom Layers',
        content: getGithubUrl('custom-layers.md')
      },
      {
        name: 'Layer Lifecycle',
        content: getGithubUrl('layer-lifecycle.md')
      },
      {
        name: 'Attribute Management',
        content: getGithubUrl('attribute-management.md')
      }
      // WIP
      // {
      //   name: 'Writing Shaders',
      //   content: getGithubUrl('writing-shaders.md')
      // }
    ]
  },
  {
    name: 'Advanced Topics',
    children: [
      {
        name: 'Coordinate Systems',
        content: getGithubUrl('coordinate-systems.md')
      },
      {
        name: 'Performance',
        content: getGithubUrl('performance.md')
      },
      {
        name: '64 bit Layers',
        content: getGithubUrl('64-bits.md')
      }
    ]
  }
  // WIP
  // {
  //   name: 'Release History',
  //   children: [
  //     {
  //       name: 'Release History',
  //       content: getGithubUrl('release-history.md')
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
        content: getGithubUrl('layers/layer-catalog.md')
      }
    ]
  },
  {
    name: 'Base Layer',
    children: [
      {
        name: 'Layer',
        content: getGithubUrl('layers/base-layer.md')
      }
    ]
  },
  {
    name: 'Core Layers',
    children: [
      {
        name: 'ArcLayer',
        content: getGithubUrl('layers/arc-layer.md')
      },
      {
        name: 'ChoroplethLayer',
        content: getGithubUrl('layers/choropleth-layer.md')
      },
      {
        name: 'LineLayer',
        content: getGithubUrl('layers/line-layer.md')
      },
      {
        name: 'ScatterplotLayer',
        content: getGithubUrl('layers/scatterplot-layer.md')
      },
      {
        name: 'ScreenGridLayer',
        content: getGithubUrl('layers/screen-grid-layer.md')
      }
    ]
  },
  {
    name: '64bit Layers',
    children: [
      {
        name: 'ArcLayer64',
        content: getGithubUrl('layers/arc-layer-64.md')
      },
      {
        name: 'ChoroplethLayer64',
        content: getGithubUrl('layers/choropleth-layer-64.md')
      },
      {
        name: 'LineLayer64',
        content: getGithubUrl('layers/line-layer-64.md')
      },
      {
        name: 'ScatterplotLayer64',
        content: getGithubUrl('layers/scatterplot-layer-64.md')
      }
    ]
  },
  {
    name: 'Sample Layers',
    children: [
      {
        name: 'ExtrudedChoroplethLayer',
        content: getGithubUrl('layers/extruded-choropleth-layer.md')
      }
    ]
  }
]);
