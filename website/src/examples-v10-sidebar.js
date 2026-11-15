// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
const v10Sections = require('./examples-v10/v10/examples.json');

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
        {type: 'doc', id: 'arc-layer', className: 'example-sidebar-arrow'},
        'bitmap-layer',
        'contour-layer',
        'geojson-layer-polygons',
        'geojson-layer-paths',
        'global-grids',
        {type: 'doc', id: 'grid-layer', className: 'example-sidebar-arrow'},
        'heatmap-layer',
        {type: 'doc', id: 'hexagon-layer', className: 'example-sidebar-arrow'},
        'icon-layer',
        {type: 'doc', id: 'line-layer', className: 'example-sidebar-arrow'},
        {type: 'doc', id: 'point-cloud-layer', className: 'example-sidebar-arrow'},
        {type: 'doc', id: 'scatterplot-layer', className: 'example-sidebar-arrow'},
        'scenegraph-layer',
        'screen-grid-layer',
        // 'simple-mesh-layer',
        'terrain-layer',
        'text-layer',
        'text-layer-clipping',
        'tile-layer',
        'tile-layer-non-geospatial',
        'tile-3d-layer',
        'trips-layer',
        'wms-layer'
      ]
    },
    {
      type: 'category',
      label: 'Proposals',
      items: [
        'shared-tile-2d-layer',
        ...v10Sections.map(({label, examples}) => ({
          type: 'category',
          label,
          items: examples.map(({id}) => `v10/${id}`)
        }))
      ]
    },
    {
      type: 'category',
      label: 'Integrations',
      items: ['arcgis', 'carto', 'google-3d-tiles', 'google-maps', 'mapbox', 'maplibre']
    },
    {
      type: 'category',
      label: 'Views',
      items: ['multi-view', 'globe-view', 'plot', 'orthographic-view']
    },
    {
      type: 'category',
      label: 'Extensions',
      items: [
        'brushing-extension',
        'collision-filter-extension',
        'data-filter-extension',
        'mask-extension',
        'path-style-extension',
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
          href: `/playground`
        },
        {
          type: 'link',
          label: 'pydeck',
          href: `/pydeck`
        }
      ]
    }
  ]
};

module.exports = sidebars;
