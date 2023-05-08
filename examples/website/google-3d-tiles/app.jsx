import React, {useCallback, useState} from 'react';
import {styled} from '@material-ui/core/styles';
import {createRoot} from 'react-dom/client';
import DeckGL from '@deck.gl/react';
import {LinearInterpolator} from '@deck.gl/core';
import {GeoJsonLayer} from '@deck.gl/layers';
import {Tile3DLayer} from '@deck.gl/geo-layers';
import {DataFilterExtension, _TerrainExtension as TerrainExtension} from '@deck.gl/extensions';

const GOOGLE_MAPS_API_KEY = process.env.GoogleMapsAPIKey; // eslint-disable-line
const TILESET_URL = 'https://tile.googleapis.com/v1/3dtiles/root.json';

export const COLORS = [
  [254, 235, 226],
  [251, 180, 185],
  [247, 104, 161],
  [197, 27, 138],
  [122, 1, 119]
];

const INITIAL_VIEW_STATE = {
  latitude: 50.089,
  longitude: 14.42,
  zoom: 16,
  minZoom: 14,
  maxZoom: 16.5,
  bearing: 90,
  pitch: 60
};

// FOR DEV ONLY, will upload to deck.gl-data as geojson
import BUILDING_DATA from './data/data.js';

const DataCredit = styled('div')({
  position: 'absolute',
  left: '8px',
  bottom: '4px',
  color: 'white',
  fontSize: '10px'
});

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
      onTilesetLoad: tileset3d => {
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
      loadOptions: {
        fetch: {headers: {'X-GOOG-API-KEY': GOOGLE_MAPS_API_KEY}}
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
        const d = properties.distance_to_nearest_tree;
        if (d < 50) return COLORS[0];
        else if (d < 100) return COLORS[1];
        else if (d < 200) return COLORS[2];
        else if (d < 300) return COLORS[3];
        return COLORS[4];
      },
      opacity,
      getFilterValue: f => f.properties.distance_to_nearest_tree,
      filterRange: [filter, 500]
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
