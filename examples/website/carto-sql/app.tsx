import React, {useMemo, useState, useCallback} from 'react';
import {createRoot} from 'react-dom/client';
import {Map} from 'react-map-gl';
import maplibregl from 'maplibre-gl';
import DeckGL from '@deck.gl/react';
import {LinearInterpolator} from '@deck.gl/core';
import {colorBins, H3TileLayer, h3QuerySource} from '@deck.gl/carto';

const INITIAL_VIEW_STATE = {
  latitude: 35.7368521,
  longitude: -85.9936065,
  zoom: 5,
  pitch: 60,
  bearing: -60
};

const globalOptions = {
  accessToken:
    'eyJhbGciOiJIUzI1NiJ9.eyJhIjoiYWNfbHFlM3p3Z3UiLCJqdGkiOiI0YTA5YjlmMSJ9.SQlcn7UucERdnq9O6ELm_Wi02dyRIJ_2KSTEnlXFjIc',

  connectionName: 'carto_dw'
};
const transitionInterpolator = new LinearInterpolator();

export default function App({
  urbanity = 'any',
  tourism = 0,
  mapStyle = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
}) {
  const [viewState, updateViewState] = useState(INITIAL_VIEW_STATE);

  const rotateCamera = useCallback(() => {
    updateViewState(v => ({
      ...v,
      bearing: v.bearing + 30,
      transitionDuration: 30000,
      transitionInterpolator,
      onTransitionEnd: rotateCamera
    }));
  }, []);

  const data = h3QuerySource({
    ...globalOptions,
    sqlQuery: `
      SELECT h3, population, urbanity 
      FROM carto-demo-data.demo_tables.derived_spatialfeatures_usa_h3res8_v1_yearly_v2 
      WHERE 
        (@urbanity = 'any' OR urbanity = @urbanity)
        AND tourism >= @tourism`,
    aggregationExp: `SUM(population) as pop`,
    aggregationResLevel: 5,
    queryParameters: {urbanity, tourism}
  });

  const layers = [
    new H3TileLayer({
      id: 'carto-layer',
      data,
      // @ts-ignore
      getFillColor: colorBins({
        attr: 'pop',
        domain: [0, 10, 100, 1000, 10000, 50000, 100000],
        colors: 'PinkYl'
      }),
      pickable: true,
      filled: true,
      extruded: true,
      getElevation: (d) => {
        return d.properties.pop / 2
      },
      // transitions: {
      //   getElevation: {duration: 1000, enter: () => [0]},
      //   getFillColor: {duration: 1000}
      // },
      loadOptions: {
        // TODO use workers once v9.alpha packages available
        worker: true
      }
    })
  ];

  const getTooltip = ({object}) => {
    if (!object) return false;
    const population = object.properties.pop;
    return `Population: ${population}`;
  };

  return (
    <DeckGL
      controller={true}
      viewState={viewState}
      layers={layers}
      // @ts-ignore
      getTooltip={getTooltip}
      onLoad={rotateCamera}
      // @ts-ignore
      onViewStateChange={v => updateViewState(v.viewState)}
    >
      
      <Map 
        reuseMaps 
        // @ts-ignore
        mapLib={maplibregl} 
        mapStyle={mapStyle} 
        preventStyleDiffing={true} />
    </DeckGL>
  );
}

export function renderToDOM(container) {
  createRoot(container).render(<App />);
}
