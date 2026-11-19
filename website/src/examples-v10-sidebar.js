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

/** Adds a porting status without changing the example's title or position. */
function withStatus(id, status) {
  return {type: 'doc', id, className: `example-sidebar-${status}`};
}

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
        withStatus('arc-layer', 'started'),
        'bitmap-layer',
        'contour-layer',
        'geojson-layer-polygons',
        'geojson-layer-paths',
        withStatus('global-grids', 'ready'),
        withStatus('grid-layer', 'started'),
        'heatmap-layer',
        withStatus('hexagon-layer', 'ready'),
        withStatus('icon-layer', 'started'),
        withStatus('line-layer', 'ready'),
        withStatus('point-cloud-layer', 'ready'),
        withStatus('scatterplot-layer', 'ready'),
        withStatus('scenegraph-layer', 'started'),
        'screen-grid-layer',
        // 'simple-mesh-layer',
        'terrain-layer',
        withStatus('text-layer', 'started'),
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
        withStatus('shared-tile-2d-layer', 'experimental'),
        ...v10Sections.map(({label, examples}) => ({
          type: 'category',
          label,
          items: examples.map(({id}) => withStatus(`v10/${id}`, 'experimental'))
        }))
      ]
    },
    {
      type: 'category',
      label: 'Integrations',
      items: ['arcgis', 'carto', 'google-3d-tiles', 'google-maps', withStatus('mapbox', 'ready'), withStatus('maplibre', 'started')]
    },
    {
      type: 'category',
      label: 'Views',
      items: [withStatus('multi-view', 'started'), withStatus('globe-view', 'started'), 'plot', 'orthographic-view']
    },
    {
      type: 'category',
      label: 'Extensions',
      items: [
        'brushing-extension',
        'collision-filter-extension',
        withStatus('data-filter-extension', 'started'),
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
