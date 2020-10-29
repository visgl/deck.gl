import React, {useState} from 'react';
import {render} from 'react-dom';
import DeckGL from '@deck.gl/react';
import {MapView} from '@deck.gl/core';

import {StaticMap} from 'react-map-gl';

import H3GridLayer from './h3-grid-layer';
import {getMinZoom} from './h3-utils';

const CONTROL_PANEL_STYLE = {
  position: 'fixed',
  top: 20,
  left: 20,
  padding: 20,
  fontSize: 13,
  background: '#fff'
};

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json';
// `repeat` will draw multiple copies of the map at low zoom leveles
const MAP_VIEW = new MapView({repeat: true});
// hexagon per tile at minZoom
const MAX_HEX_COUNT = 1000;

const INITIAL_VIEW_STATE = {
  longitude: 0,
  latitude: 0,
  zoom: 2
};

export default function App() {
  const [initialViewState, setInitialViewState] = useState(INITIAL_VIEW_STATE);
  const [resolution, setResolution] = useState(1);
  const [currentViewState] = useState({...INITIAL_VIEW_STATE});

  const onViewStateChange = ({viewState}) => {
    // Just save a copy of the viewState, no need to trigger rerender
    Object.assign(currentViewState, viewState);
  };

  const onResolutionChange = evt => {
    const newResolution = Number(evt.target.value);
    const minZoom = getMinZoom(newResolution, MAX_HEX_COUNT);

    setResolution(newResolution);
    setInitialViewState({
      ...currentViewState,
      zoom: Math.max(currentViewState.zoom, minZoom),
      minZoom
    });
  };

  const layer = new H3GridLayer({
    resolution,
    maxHexCount: MAX_HEX_COUNT,
    filled: true,
    extruded: false,
    stroked: true,
    lineWidthUnits: 'pixels',
    getLineWidth: 2,
    getFillColor: [0, 0, 0, 1],
    pickable: true,
    autoHighlight: true
  });

  return (
    <>
      <DeckGL
        initialViewState={initialViewState}
        controller={true}
        views={MAP_VIEW}
        layers={[layer]}
        onViewStateChange={onViewStateChange}
        getTooltip={info => info.object}
      >
        <StaticMap mapStyle={MAP_STYLE} />
      </DeckGL>
      <div style={CONTROL_PANEL_STYLE}>
        <div>Resolution: {resolution}</div>
        <input
          type="range"
          min="0"
          max="15"
          step="1"
          value={resolution}
          onInput={onResolutionChange}
        />
      </div>
    </>
  );
}

/* global document */
document.body.style.overflow = 'hidden';
render(<App />, document.body.appendChild(document.createElement('div')));
