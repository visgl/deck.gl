/* global fetch, setTimeout, clearTimeout */
import React, {useEffect, useState} from 'react';
import {render} from 'react-dom';

import {StaticMap} from 'react-map-gl';
import DeckGL from '@deck.gl/react';
import {ScenegraphLayer} from '@deck.gl/mesh-layers';

// Data provided by the OpenSky Network, http://www.opensky-network.org
const DATA_URL = 'https://opensky-network.org/api/states/all';
const MODEL_URL =
  'https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/scenegraph-layer/airplane.glb';
const REFRESH_TIME = 30000;

const ANIMATIONS = {
  '*': {speed: 1}
};

const INITIAL_VIEW_STATE = {
  latitude: 39.1,
  longitude: -94.57,
  zoom: 3.8,
  maxZoom: 16,
  pitch: 0,
  bearing: 0
};

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json';

const DATA_INDEX = {
  UNIQUE_ID: 0,
  CALL_SIGN: 1,
  ORIGIN_COUNTRY: 2,
  LONGITUDE: 5,
  LATITUDE: 6,
  BARO_ALTITUDE: 7,
  VELOCITY: 9,
  TRUE_TRACK: 10,
  VERTICAL_RATE: 11,
  GEO_ALTITUDE: 13,
  POSITION_SOURCE: 16
};

function verticalRateToAngle(object) {
  // Return: -90 looking up, +90 looking down
  const verticalRate = object[DATA_INDEX.VERTICAL_RATE] || 0;
  const velocity = object[DATA_INDEX.VELOCITY] || 0;
  return (-Math.atan2(verticalRate, velocity) * 180) / Math.PI;
}

function getTooltip({object}) {
  return (
    object &&
    `\
    Call Sign: ${object[DATA_INDEX.CALL_SIGN] || ''}
    Country: ${object[DATA_INDEX.ORIGIN_COUNTRY] || ''}
    Vertical Rate: ${object[DATA_INDEX.VERTICAL_RATE] || 0} m/s
    Velocity: ${object[DATA_INDEX.VELOCITY] || 0} m/s
    Direction: ${object[DATA_INDEX.TRUE_TRACK] || 0}`
  );
}

export default function App({sizeScale = 25, onDataLoad, mapStyle = MAP_STYLE}) {
  const [data, setData] = useState(null);
  const [timer, setTimer] = useState({});

  useEffect(
    () => {
      fetch(DATA_URL)
        .then(resp => resp.json())
        .then(resp => {
          if (resp && resp.states && timer.id !== null) {
            // In order to keep the animation smooth we need to always return the same
            // objects in the exact same order. This function will discard new objects
            // and only update existing ones.
            let sortedData = resp.states;
            if (data) {
              const dataAsObj = {};
              sortedData.forEach(entry => (dataAsObj[entry[DATA_INDEX.UNIQUE_ID]] = entry));
              sortedData = data.map(entry => dataAsObj[entry[DATA_INDEX.UNIQUE_ID]] || entry);
            }

            setData(sortedData);

            if (onDataLoad) {
              onDataLoad(sortedData.length);
            }
          }
        })
        .finally(() => {
          timer.nextTimeoutId = setTimeout(() => setTimer({id: timer.nextTimeoutId}), REFRESH_TIME);
        });

      return () => {
        clearTimeout(timer.nextTimeoutId);
        timer.id = null;
      };
    },
    [timer]
  );

  const layer =
    data &&
    new ScenegraphLayer({
      id: 'scenegraph-layer',
      data,
      pickable: true,
      sizeScale,
      scenegraph: MODEL_URL,
      _animations: ANIMATIONS,
      sizeMinPixels: 0.1,
      sizeMaxPixels: 1.5,
      getPosition: d => [
        d[DATA_INDEX.LONGITUDE] || 0,
        d[DATA_INDEX.LATITUDE] || 0,
        d[DATA_INDEX.GEO_ALTITUDE] || 0
      ],
      getOrientation: d => [verticalRateToAngle(d), -d[DATA_INDEX.TRUE_TRACK] || 0, 90],
      transitions: {
        getPosition: REFRESH_TIME * 0.9
      }
    });

  return (
    <DeckGL
      layers={[layer]}
      initialViewState={INITIAL_VIEW_STATE}
      controller={true}
      getTooltip={getTooltip}
    >
      <StaticMap reuseMaps mapStyle={mapStyle} preventStyleDiffing={true} />
    </DeckGL>
  );
}

export function renderToDOM(container) {
  render(<App />, container);
}
