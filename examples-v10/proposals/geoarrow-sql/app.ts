// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {OrthographicView} from '@deck.gl/core';
import {GeoArrowLayer} from '@deck.gl/proposals/layers';
import {load} from '@loaders.gl/core';
import {GeoJSONLoader} from '@loaders.gl/tables/geojson';
import {POSTGIS_SPATIAL_FUNCTIONS} from '@math.gl/geospatial/st-functions';
import {ArrowDeck} from '../arrow-deck';
import {getDeckExampleProps, resolveDeckExampleDeviceType} from '../deck-example-device';

const [data, deviceType] = await Promise.all([
  load(new URL('./footprint.geojson', import.meta.url).href, GeoJSONLoader, {
    geoarrow: {encodingPreference: 'optimized'}
  }),
  resolveDeckExampleDeviceType(new URLSearchParams(location.search).get('backend'))
]);

const select = document.querySelector<HTMLSelectElement>('#function')!;
const expression = document.querySelector<HTMLOutputElement>('#expression')!;
const deck = new ArrowDeck<OrthographicView>({
  ...getDeckExampleProps({deviceType}),
  parent: document.querySelector<HTMLDivElement>('#map')!,
  views: new OrthographicView(),
  initialViewState: {target: [0, 0, 0], zoom: 2.5},
  getTooltip: ({object}) => object?.name
});

const original = new GeoArrowLayer({
  id: 'footprint',
  data,
  getFillColor: [60, 100, 140, 150],
  pickable: true
});

function updateGeometry() {
  const sql = `${select.value}(geometry)`;
  expression.value = `getGeometry: {sql: '${sql}'}`;
  deck.setProps({
    layers: [
      original,
      new GeoArrowLayer({
        id: 'derived-geometry',
        data,
        sqlFunctions: POSTGIS_SPATIAL_FUNCTIONS,
        getGeometry: {sql},
        getFillColor: [236, 95, 55, 170],
        getRadius: 7,
        pickable: true
      })
    ]
  });
}

select.addEventListener('change', updateGeometry);
updateGeometry();
