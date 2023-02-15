import React, {useState, useCallback} from 'react';
import {createRoot} from 'react-dom/client';
import {Map} from 'react-map-gl';
import maplibregl from 'maplibre-gl';
import DeckGL from '@deck.gl/react';
import {LinearInterpolator} from '@deck.gl/core';
import {CartoLayer, setDefaultCredentials, API_VERSIONS, MAP_TYPES} from '@deck.gl/carto';

const INITIAL_VIEW_STATE = {
  latitude: 40.7368521,
  longitude: -73.9936065,
  zoom: 11,
  pitch: 60,
  bearing: 0
};

// Colors for the breaks of the polygon layer
const POLYGON_COLORS = {
  COLOR_1: [225, 83, 131],
  COLOR_2: [241, 109, 122],
  COLOR_3: [250, 138, 118],
  COLOR_4: [255, 166, 121],
  COLOR_5: [255, 194, 133],
  COLOR_6: [255, 221, 154],
  OTHER: [254, 246, 181]
};

setDefaultCredentials({
  apiVersion: API_VERSIONS.V2,
  username: 'public',
  apiKey: 'SdBjYyF8NhILWw7kU0n2NQ'
});

const transitionInterpolator = new LinearInterpolator();

export default function App({
  mrliIndex = 'txn_amt',
  industry = 'ret',
  week = ['2020-01-01', '2020-01-05'],
  mapStyle = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
}) {
  const [viewState, updateViewState] = useState(INITIAL_VIEW_STATE);

  const rotateCamera = useCallback(() => {
    updateViewState(v => ({
      ...v,
      bearing: v.bearing + 0.5,
      transitionDuration: 1000,
      transitionInterpolator,
      onTransitionEnd: rotateCamera
    }));
  }, []);

  const SQL = `SELECT the_geom_webmercator, avg(${mrliIndex}) as index
            FROM mrli_ny_jan WHERE industry ='${industry}' AND timeinstant BETWEEN '${week[0]}' AND '${week[1]}'
            GROUP BY the_geom_webmercator`;

  const layers = [
    new CartoLayer({
      id: 'carto-layer',
      type: MAP_TYPES.QUERY,
      data: SQL,
      getFillColor: object => {
        if (object.properties.index > 1000) {
          return POLYGON_COLORS.COLOR_1;
        } else if (object.properties.index > 500) {
          return POLYGON_COLORS.COLOR_2;
        } else if (object.properties.index > 300) {
          return POLYGON_COLORS.COLOR_3;
        } else if (object.properties.index > 100) {
          return POLYGON_COLORS.COLOR_4;
        } else if (object.properties.index > 50) {
          return POLYGON_COLORS.COLOR_5;
        } else if (object.properties.index > 25) {
          return POLYGON_COLORS.COLOR_6;
        }
        return POLYGON_COLORS.OTHER;
      },
      getLineColor: [0, 0, 0, 0],
      lineWidthMinPixels: 0,
      pickable: true,
      filled: true,
      extruded: true,
      wireframe: true,
      getElevation: f => {
        return f.properties.index ? f.properties.index : 0;
      },
      transitions: {
        getElevation: {
          duration: 1000,
          enter: () => [0]
        }
      }
    })
  ];

  const getTooltip = ({object}) => {
    if (!object) return false;
    const {index} = object.properties;

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
