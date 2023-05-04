import React, {useCallback, useState} from 'react';
import styled from 'styled-components';
import {createRoot} from 'react-dom/client';
import DeckGL from '@deck.gl/react';
import {LinearInterpolator} from '@deck.gl/core';
import {GeoJsonLayer} from '@deck.gl/layers';
import {Tile3DLayer} from '@deck.gl/geo-layers';
import {DataFilterExtension, _TerrainExtension as TerrainExtension} from '@deck.gl/extensions';

const GOOGLE_MAPS_API_KEY = process.env.GoogleMapsAPIKey; // eslint-disable-line
const ROOT_TILE = 'CggzMDYwNDE2MxIFZWFydGgYsQciBmdyb3VuZDoFZ2VvaWRABg'; // Prague
const TILESET_URL = `https://www.googleapis.com/tile/v1/tiles3d/tilesets/${ROOT_TILE}.json?key=${GOOGLE_MAPS_API_KEY}`;

const INITIAL_VIEW_STATE = {
  latitude: 50.089,
  longitude: 14.42,
  zoom: 16,
  minZoom: 14,
  maxZoom: 16.5,
  bearing: 90,
  pitch: 60
};

const BUILDING_DATA =
  'https://raw.githubusercontent.com/visgl/deck.gl-data/alasarr/google-3d-tiles/examples/google-3d-tiles/buildings.geojson';

const DataCredit = styled.div`
  position: absolute;
  left: 8px;
  bottom: 4px;
  color: var(--ifm-color-white);
  font-size: 10px;
`;

const transitionInterpolator = new LinearInterpolator(['bearing', 'longitude', 'latitude']);

export default function App({data = TILESET_URL, filter = 0, opacity = 0.2}) {
  const [credits, setCredits] = useState('');
  const [initialViewState, setInitialViewState] = useState(INITIAL_VIEW_STATE);

  const orbit = useCallback(previousTransition => {
    setInitialViewState(viewState => {
      return {
        ...viewState,
        bearing: viewState.bearing + 30,
        transitionDuration: 10000,
        transitionInterpolator,
        onTransitionEnd: orbit
      };
    });
  }, []);

  const layers = [
    new Tile3DLayer({
      id: 'google-3d-tiles',
      data: TILESET_URL,
      // THE FOLLOWING FUNCTION WILL BE REMOVED IN THE NEXT RELEASE (next week)
      onTilesetLoad: tileset3d => {
        // Required until https://github.com/visgl/loaders.gl/pull/2252 resolved
        tileset3d._queryParams = {key: GOOGLE_MAPS_API_KEY};

        tileset3d.options.onTraversalComplete = selectedTiles => {
          const uniqueCredits = new Set();
          selectedTiles.forEach(tile => {
            const {copyright} = tile.content.gltf.asset;
            copyright.split(';').forEach(uniqueCredits.add, uniqueCredits);
            setCredits([...uniqueCredits].join('; '));
          });
          return selectedTiles;
        };
      },
      operation: 'terrain+draw'
    }),
    new GeoJsonLayer({
      id: 'buildings',
      data: BUILDING_DATA,
      extensions: [new DataFilterExtension({filterSize: 1}), new TerrainExtension()],
      stroked: false,
      filled: true,
      getFillColor: ({properties}) => {
        const {tpp} = properties;
        // quantiles break
        if (tpp < 0.6249) return [254, 246, 181];
        else if (tpp < 0.678) return [255, 194, 133];
        else if (tpp < 0.8594) return [250, 138, 118];
        return [225, 83, 131];
      },
      opacity,
      getFilterValue: f => f.properties.tpp,
      filterRange: [filter, 1]
    })
  ];

  return (
    <div>
      <DeckGL
        style={{backgroundColor: '#061714'}}
        initialViewState={initialViewState}
        onLoad={orbit}
        controller={{touchRotate: true, inertia: 250}}
        layers={layers}
      />
      <DataCredit>{credits}</DataCredit>
    </div>
  );
}

export function renderToDOM(container) {
  createRoot(container).render(<App />);
}
