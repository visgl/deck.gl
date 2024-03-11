import React, {useState} from 'react';
import {scaleLinear} from 'd3-scale';
import {createRoot} from 'react-dom/client';
import DeckGL from '@deck.gl/react';
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

const colorScale = scaleLinear().clamp(true).domain([0, 50, 100, 200, 300]).range(COLORS);

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
  'https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/google-3d-tiles/buildings.geojson';

function getTooltip({object}) {
  return (
    object && {
      html: `\
    <div><b>Distance to nearest tree</b></div>
    <div>${object.properties.distance_to_nearest_tree}</div>
    `
    }
  );
}

export default function App({data = TILESET_URL, distance = 0, opacity = 0.2}) {
  const [credits, setCredits] = useState('');

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
          });
          setCredits([...uniqueCredits].join('; '));
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
      getFillColor: ({properties}) => colorScale(properties.distance_to_nearest_tree),
      opacity,
      getFilterValue: f => f.properties.distance_to_nearest_tree,
      filterRange: [distance, 500],
      pickable: true
    })
  ];

  return (
    <div>
      <DeckGL
        style={{backgroundColor: '#061714'}}
        initialViewState={INITIAL_VIEW_STATE}
        controller={{touchRotate: true, inertia: 250}}
        layers={layers}
        getTooltip={getTooltip}
      />
      <div
        style={{position: 'absolute', left: '8px', bottom: '4px', color: 'white', fontSize: '10px'}}
      >
        {credits}
      </div>
    </div>
  );
}

export function renderToDOM(container) {
  createRoot(container).render(<App />);
}
