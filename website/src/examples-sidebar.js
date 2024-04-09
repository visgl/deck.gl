/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
const sidebars = {
  examplesSidebar: [
    {
      type: 'doc',
      label: 'Overview',
      id: 'index'
    },
    {
      type: 'category',
      label: 'Layers',
      items: [
        'arc-layer',
        'contour-layer',
        'geojson-layer-polygons',
        'geojson-layer-paths',
        'heatmap-layer',
        'hexagon-layer',
        'icon-layer',
        'line-layer',
        'point-cloud-layer',
        'scatterplot-layer',
        'scenegraph-layer',
        'screen-grid-layer',
        'terrain-layer',
        'text-layer',
        'tile-layer',
        'tile-layer-non-geospatial',
        'tile-3d-layer',
        'trips-layer',
        'wms-layer'
      ]
    },
    {
      type: 'category',
      label: 'Integrations',
      items: ['arcgis', 'carto', 'google-3d-tiles', 'google-maps', 'mapbox', 'maptiler']
    },
    {
      type: 'category',
      label: 'Views',
      items: ['multi-view', 'globe-view', 'plot', 'orthographic-view', 'first-person-view']
    },
    {
      type: 'category',
      label: 'Extensions',
      items: [
        'brushing-extension',
        'collision-filter-extension',
        'data-filter-extension',
        'mask-extension',
        'terrain-extension'
      ]
    },
    {
      type: 'category',
      label: 'Declarative',
      items: [
        {
          type: 'link',
          label: 'Playground',
          href: `playground`
        }
      ]
    }
  ]
};

module.exports = sidebars;
