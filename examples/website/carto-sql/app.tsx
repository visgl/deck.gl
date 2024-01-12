import React, {useMemo, useState, useCallback} from 'react';
import {createRoot} from 'react-dom/client';
import {Map} from 'react-map-gl';
import maplibregl from 'maplibre-gl';
import DeckGL from '@deck.gl/react';
import {LinearInterpolator} from '@deck.gl/core';
import {colorBins, VectorTileLayer, vectorQuerySource} from '@deck.gl/carto';

const INITIAL_VIEW_STATE = {
  latitude: 40.7368521,
  longitude: -73.9936065,
  zoom: 11,
  pitch: 60,
  bearing: 0
};

const globalOptions = {
  accessToken:
    'eyJhbGciOiJIUzI1NiJ9.eyJhIjoiYWNfN3hoZnd5bWwiLCJqdGkiOiJiMGY0ZjVkZSJ9.DaQK48iBPzXtvmAUuCwESXvY_3eGz5J5Qx6Tg2Id-nM',

  connectionName: 'bigquery'
};
const transitionInterpolator = new LinearInterpolator();

export default function App({
  mrliIndex = 'txn_amt',
  industry = 'ret',
  mapStyle = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
}) {
  const [viewState, updateViewState] = useState(INITIAL_VIEW_STATE);

  const rotateCamera = useCallback(() => {
    updateViewState(v => ({
      ...v,
      bearing: v.bearing + 15,
      transitionDuration: 30000,
      transitionInterpolator,
      onTransitionEnd: rotateCamera
    }));
  }, []);

  const getIndex = f => (f.properties[mrliIndex] ? parseFloat(f.properties[mrliIndex]) : 0);

  const data = vectorQuerySource({
    ...globalOptions,
    sqlQuery: `SELECT * FROM cartobq.public_account.mastercard_geoinsights_jan where industry = @industry`,
    queryParameters: {industry}
  });

  const layers = [
    new VectorTileLayer({
      id: 'carto-layer',
      data,
      getFillColor: colorBins({
        attr: getIndex,
        domain: [25, 50, 100, 300, 500, 1000],
        colors: 'PinkYl'
      }),
      getLineColor: [0, 0, 0, 0],
      pickable: true,
      filled: true,
      extruded: true,
      wireframe: true,
      getElevation: getIndex,
      transitions: {
        getElevation: {duration: 1000, enter: () => [0]},
        getFillColor: {duration: 1000}
      },
      updateTriggers: {
        getElevation: [mrliIndex],
        getFillColor: [mrliIndex]
      },
      loadOptions: {
        // TODO use workers once v9.alpha packages available
        worker: true
      }
    })
  ];

  const getTooltip = ({object}) => {
    if (!object) return false;
    const index = getIndex(object);
    return `Index: ${index.toFixed(2)}`;
  };

  return (
    <DeckGL
      controller={true}
      viewState={viewState}
      layers={layers}
      getTooltip={getTooltip}
      onLoad={rotateCamera}
      onViewStateChange={v => updateViewState(v.viewState)}
    >
      <Map reuseMaps mapLib={maplibregl} mapStyle={mapStyle} preventStyleDiffing={true} />
    </DeckGL>
  );
}

export function renderToDOM(container) {
  createRoot(container).render(<App />);
}
