import React from 'react';
import {createRoot} from 'react-dom/client';
import {Map} from 'react-map-gl/maplibre';
import DeckGL from '@deck.gl/react';
import {LineLayer, ScatterplotLayer} from '@deck.gl/layers';

// Source data CSV
const DATA_URL = {
  AIRPORTS:
    'https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/line/airports.json', // eslint-disable-line
  FLIGHT_PATHS:
    'https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/line/heathrow-flights.json' // eslint-disable-line
};

const INITIAL_VIEW_STATE = {
  latitude: 47.65,
  longitude: 7,
  zoom: 4.5,
  maxZoom: 16,
  pitch: 50,
  bearing: 0
};

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json';

function getColor(d) {
  const z = d.start[2];
  const r = z / 10000;

  return [255 * (1 - r * 2), 128 * r, 255 * r, 255 * (1 - r)];
}

function getSize(type) {
  if (type.search('major') >= 0) {
    return 100;
  }
  if (type.search('small') >= 0) {
    return 30;
  }
  return 60;
}

function getTooltip({object}) {
  return (
    object &&
    `\
  ${object.country || object.abbrev || ''}
  ${object.name.indexOf('0x') >= 0 ? '' : object.name}`
  );
}

export default function App({
  airports = DATA_URL.AIRPORTS,
  flightPaths = DATA_URL.FLIGHT_PATHS,
  getWidth = 3,
  mapStyle = MAP_STYLE
}) {
  const layers = [
    new ScatterplotLayer({
      id: 'airports',
      data: airports,
      radiusScale: 20,
      getPosition: d => d.coordinates,
      getFillColor: [255, 140, 0],
      getRadius: d => getSize(d.type),
      pickable: true
    }),
    new LineLayer({
      id: 'flight-paths',
      data: flightPaths,
      opacity: 0.8,
      getSourcePosition: d => d.start,
      getTargetPosition: d => d.end,
      getColor,
      getWidth,
      pickable: true
    })
  ];

  return (
    <DeckGL
      layers={layers}
      initialViewState={INITIAL_VIEW_STATE}
      controller={true}
      pickingRadius={5}
      parameters={{
        blendColorOperation: 'add',
        blendColorSrcFactor: 'src-alpha',
        blendColorDstFactor: 'one',
        blendAlphaOperation: 'add',
        blendAlphaSrcFactor: 'one-minus-dst-alpha',
        blendAlphaDstFactor: 'one'
      }}
      getTooltip={getTooltip}
    >
      <Map reuseMaps mapStyle={mapStyle} />
    </DeckGL>
  );
}

export function renderToDOM(container) {
  createRoot(container).render(<App />);
}
