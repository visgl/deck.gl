/* global document */
/* eslint-disable no-console */
import React, {useState} from 'react';
import {render} from 'react-dom';
import {StaticMap} from 'react-map-gl';
import {BASEMAP} from '@deck.gl/carto';
import DeckGL from '@deck.gl/react';
import {QuadkeyLayer} from '@deck.gl/geo-layers';

const INITIAL_VIEW_STATE = {longitude: -73.95643, latitude: 40.8039, zoom: 4};
function Root() {
  const quadkeyLayer = new QuadkeyLayer({
    id: 'carto',
    data: 'data/0231.json',
    getQuadkey: d => d.spatial_index,

    // Styling
    getFillColor: d => [(d.value - 12) * 25, d.value * 8, 79],
    getElevation: d => d.value - 12,
    extruded: true,

    elevationScale: 10000
  });

  return (
    <>
      <DeckGL initialViewState={INITIAL_VIEW_STATE} controller={true} layers={[quadkeyLayer]}>
        <StaticMap mapStyle={BASEMAP.VOYAGER_NOLABELS} />
      </DeckGL>
    </>
  );
}

render(<Root />, document.body.appendChild(document.createElement('div')));
