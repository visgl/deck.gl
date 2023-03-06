import React from 'react';
import {useState, useMemo, useCallback} from 'react';

import {createRoot} from 'react-dom/client';

import DeckGL from '@deck.gl/react';
import {
  COORDINATE_SYSTEM,
  _GlobeView as GlobeView,
  LightingEffect,
  AmbientLight,
  _SunLight as SunLight
} from '@deck.gl/core';
import {GeoJsonLayer} from '@deck.gl/layers';
import {SimpleMeshLayer} from '@deck.gl/mesh-layers';

import {SphereGeometry} from '@luma.gl/core';
import {load} from '@loaders.gl/core';
import {CSVLoader} from '@loaders.gl/csv';

import AnimatedArcLayer from './animated-arc-group-layer';
import RangeInput from './range-input';

// Data source
const DATA_URL = 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/globe';

const INITIAL_VIEW_STATE = {
  longitude: 0,
  latitude: 20,
  zoom: 0
};

const TIME_WINDOW = 900; // 15 minutes
const EARTH_RADIUS_METERS = 6.3e6;
const SEC_PER_DAY = 60 * 60 * 24;

const ambientLight = new AmbientLight({
  color: [255, 255, 255],
  intensity: 0.5
});
const sunLight = new SunLight({
  color: [255, 255, 255],
  intensity: 2.0,
  timestamp: 0
});
// create lighting effect with light sources
const lightingEffect = new LightingEffect({ambientLight, sunLight});

/* eslint-disable react/no-deprecated */
export default function App({data}) {
  const [currentTime, setCurrentTime] = useState(0);

  const timeRange = [currentTime, currentTime + TIME_WINDOW];

  const formatLabel = useCallback(t => getDate(data, t).toUTCString(), [data]);

  if (data) {
    sunLight.timestamp = getDate(data, currentTime).getTime();
  }

  const backgroundLayers = useMemo(
    () => [
      new SimpleMeshLayer({
        id: 'earth-sphere',
        data: [0],
        mesh: new SphereGeometry({radius: EARTH_RADIUS_METERS, nlat: 18, nlong: 36}),
        coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
        getPosition: [0, 0, 0],
        getColor: [255, 255, 255]
      }),
      new GeoJsonLayer({
        id: 'earth-land',
        data: 'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_land.geojson',
        // Styles
        stroked: false,
        filled: true,
        opacity: 0.1,
        getFillColor: [30, 80, 120]
      })
    ],
    []
  );

  const dataLayers =
    data &&
    data.map(
      ({date, flights}) =>
        new AnimatedArcLayer({
          id: `flights-${date}`,
          data: flights,
          getSourcePosition: d => [d.lon1, d.lat1, d.alt1],
          getTargetPosition: d => [d.lon2, d.lat2, d.alt2],
          getSourceTimestamp: d => d.time1,
          getTargetTimestamp: d => d.time2,
          getHeight: 0.5,
          getWidth: 1,
          timeRange,
          getSourceColor: [255, 0, 128],
          getTargetColor: [0, 128, 255]
        })
    );

  return (
    <>
      <DeckGL
        views={new GlobeView()}
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
        effects={[lightingEffect]}
        layers={[backgroundLayers, dataLayers]}
      />
      {data && (
        <RangeInput
          min={0}
          max={data.length * SEC_PER_DAY}
          value={currentTime}
          animationSpeed={TIME_WINDOW * 0.2}
          formatLabel={formatLabel}
          onChange={setCurrentTime}
        />
      )}
    </>
  );
}

function getDate(data, t) {
  const index = Math.min(data.length - 1, Math.floor(t / SEC_PER_DAY));
  const date = data[index].date;
  const timestamp = new Date(`${date}T00:00:00Z`).getTime() + (t % SEC_PER_DAY) * 1000;
  return new Date(timestamp);
}

export function renderToDOM(container) {
  const root = createRoot(container);
  root.render(<App />);

  async function loadData(dates) {
    const data = [];
    for (const date of dates) {
      const url = `${DATA_URL}/${date}.csv`;
      const flights = await load(url, CSVLoader, {csv: {skipEmptyLines: true}});

      // Join flight data from multiple dates into one continuous animation
      const offset = SEC_PER_DAY * data.length;
      for (const f of flights) {
        f.time1 += offset;
        f.time2 += offset;
      }
      data.push({flights, date});
      root.render(<App data={data} />);
    }
  }

  loadData([
    '2020-01-14',
    '2020-02-11',
    '2020-03-10',
    '2020-04-14',
    '2020-05-12',
    '2020-06-09',
    '2020-07-14',
    '2020-08-11',
    '2020-09-08',
    '2020-10-13',
    '2020-11-10',
    '2020-12-08'
  ]);
}
