import React from 'react';
import {useState, useMemo, useCallback} from 'react';
import {createRoot} from 'react-dom/client';
import {Map} from 'react-map-gl';
import maplibregl from 'maplibre-gl';

import GL from '@luma.gl/constants';
import DeckGL from '@deck.gl/react';
import {GeoJsonLayer} from '@deck.gl/layers';
import {SimpleMeshLayer} from '@deck.gl/mesh-layers';
import {MaskExtension} from '@deck.gl/extensions';

import {SphereGeometry} from '@luma.gl/core';
import {load} from '@loaders.gl/core';
import {CSVLoader} from '@loaders.gl/csv';

import AnimatedArcLayer from './animated-arc-layer';
import {sliceData, getDate} from './slice-data';
import RangeInput from './range-input';

// Data source
const DATA_URL = 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/globe';
const INITIAL_VIEW_STATE = {longitude: -40, latitude: 40, zoom: 2, maxZoom: 6};
const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json';

const TIME_WINDOW = 3600; // 1 hour

/* eslint-disable react/no-deprecated */
export default function App({data, mapStyle = MAP_STYLE}) {
  const [currentTime, setCurrentTime] = useState(0);
  const [zoom, setZoom] = useState(INITIAL_VIEW_STATE.zoom);
  const onViewStateChange = useCallback(({viewState}) => {
    setZoom(viewState.zoom);
  }, []);

  const groups = useMemo(() => sliceData(data), [data]);

  const endTime = useMemo(() => {
    return groups.reduce((max, group) => Math.max(max, group.endTime), 0);
  }, [groups]);

  const maskRange = [currentTime, currentTime + TIME_WINDOW];
  const visRange = [currentTime + 0.8 * TIME_WINDOW, currentTime + TIME_WINDOW];

  const formatLabel = useCallback(
    t => {
      const date = getDate(data, t);
      return `${date.getHours()}:${(date.getMinutes() + '').padStart(2, '0')}`;
    },
    [data]
  );

  const YELLOW = [255, 232, 180];

  const highLightRadius = Math.max(2, Math.min(30, 2 ** zoom / 3));
  const backgroundLayers = useMemo(
    () => [
      new GeoJsonLayer({
        id: 'earth-land',
        data: 'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_land.geojson',
        // Styles
        stroked: false,
        filled: true,
        opacity: 0.1,
        getFillColor: [30, 80, 120]
      }),
      new GeoJsonLayer({
        id: 'points-small',
        data: 'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_10m_populated_places_simple.geojson',

        pointType: 'circle',
        pointRadiusUnits: 'pixels',
        getFillColor: YELLOW
      })
    ],
    []
  );

  const highlightLayer = new GeoJsonLayer({
    id: 'points',
    data: 'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_10m_populated_places_simple.geojson',

    pointType: 'circle',
    pointRadiusUnits: 'pixels',
    pointRadiusScale: highLightRadius,
    getLineColor: [...YELLOW, 90],
    getLineWidth: 3,
    lineWidthUnits: 'pixels',
    filled: false,
    stroked: true,

    extensions: [new MaskExtension()],
    maskId: 'mask-0'
  });

  const lineWidth = Math.max(1, Math.min(5, 2 ** zoom / 6));

  const dataLayers = groups.slice(0, 1).map((group, index) =>
    [true, false].map(masked => {
      const timeRange = masked ? maskRange : visRange;
      return new AnimatedArcLayer({
        id: masked ? `mask-${index}` : `flights-${index}`,
        data: group.flights,
        greatCircle: true,
        visible: group.startTime < timeRange[1] && group.endTime > timeRange[0],
        getSourcePosition: d => [d.lon1, d.lat1, d.alt1],
        getTargetPosition: d => [d.lon2, d.lat2, d.alt2],
        getSourceTimestamp: d => d.time1,
        getTargetTimestamp: d => d.time2,
        getHeight: 0,
        getWidth: 1,
        widthScale: masked ? 50000 : lineWidth,
        widthUnits: masked ? 'meters' : 'pixels',
        timeRange,
        getSourceColor: [255, 255, 255, 255],
        getTargetColor: [255, 255, 255, 255],
        operation: masked ? 'mask' : 'draw',

        parameters: masked
          ? {}
          : {
              depthTest: false,
              blendFunc: [GL.SRC_ALPHA, GL.DST_ALPHA],
              blendEquation: GL.FUNC_ADD
            }
      });
    })
  );

  return (
    <>
      <DeckGL
        initialViewState={INITIAL_VIEW_STATE}
        onViewStateChange={onViewStateChange}
        controller={true}
        layers={[dataLayers, highlightLayer, backgroundLayers]}
      >
        <Map reuseMaps mapLib={maplibregl} mapStyle={mapStyle} preventStyleDiffing={true} />
      </DeckGL>
      {endTime && (
        <RangeInput
          min={0}
          max={endTime}
          value={currentTime}
          animationSpeed={TIME_WINDOW * 0.001}
          formatLabel={formatLabel}
          onChange={setCurrentTime}
        />
      )}
    </>
  );
}

export function renderToDOM(container) {
  const root = createRoot(container);
  root.render(<App />);

  async function loadData(dates) {
    const data = [];
    for (const date of dates) {
      const url = `${DATA_URL}/${date}.csv`;
      const flights = await load(url, CSVLoader, {csv: {skipEmptyLines: true}});
      data.push({flights, date});
      root.render(<App data={data} />);
    }
  }

  loadData([
    '2020-01-14'
    // '2020-02-11',
    // '2020-03-10',
    // '2020-04-14',
    // '2020-05-12',
    // '2020-06-09',
    // '2020-07-14',
    // '2020-08-11',
    // '2020-09-08',
    // '2020-10-13',
    // '2020-11-10',
    // '2020-12-08'
  ]);
}
