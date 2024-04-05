import React from 'react';
import {createRoot} from 'react-dom/client';

import DeckGL from '@deck.gl/react';
import {MapView} from '@deck.gl/core';
import {PMTLayer} from '@deck.gl/geo-layers';

const INITIAL_VIEW_STATE = {
  latitude: 47.65,
  longitude: 7,
  zoom: 4.5,
  maxZoom: 20,
  maxPitch: 89,
  bearing: 0
};

const COPYRIGHT_LICENSE_STYLE = {
  position: 'absolute',
  right: 0,
  bottom: 0,
  backgroundColor: 'hsla(0,0%,100%,.5)',
  padding: '0 5px',
  font: '12px/20px Helvetica Neue,Arial,Helvetica,sans-serif'
};

const LINK_STYLE = {
  textDecoration: 'none',
  color: 'rgba(0,0,0,.75)',
  cursor: 'grab'
};

/* global window */
const devicePixelRatio = (typeof window !== 'undefined' && window.devicePixelRatio) || 1;

function getTooltip({tile}) {
  if (tile) {
    const {x, y, z} = tile.index;
    return `tile: x: ${x}, y: ${y}, z: ${z}`;
  }
  return null;
}

export default function App({showBorder = false, onTilesLoad = null}) {
  const tileLayer = new PMTLayer({url: "https://r2-public.protomaps.com/protomaps-sample-datasets/protomaps-basemap-opensource-20230408.pmtiles"});

  return (
    <DeckGL
      layers={[tileLayer]}
      views={new MapView({repeat: true})}
      initialViewState={INITIAL_VIEW_STATE}
      controller={true}
      getTooltip={getTooltip}
    >
      <div style={COPYRIGHT_LICENSE_STYLE}>
        {'© '}
        <a style={LINK_STYLE} href="http://www.openstreetmap.org/copyright" target="blank">
          OpenStreetMap contributors
        </a>
      </div>
    </DeckGL>
  );
}

export function renderToDOM(container) {
  createRoot(container).render(<App />);
}
