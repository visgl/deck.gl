/* eslint-disable max-statements */
import React, {useState} from 'react';
import {render} from 'react-dom';
import DeckGL from '@deck.gl/react';

import TerrainLayer from './terrain-layer/terrain-layer';
import {getSurface} from './surface';
import {getViewState} from './locations';

// Set your mapbox token here
const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line

const INITIAL_VIEW_STATE = {
  latitude: 46.24,
  longitude: -122.18,
  zoom: 11.5,
  bearing: 140,
  pitch: 60
};
// Constants
const TERRAIN_RGB = 'https://api.mapbox.com/v4/mapbox.terrain-rgb';

function getTerrain(tile) {
  if (tile) {
    const {x, y, z} = tile;
    return `${TERRAIN_RGB}/${z}/${x}/${y}.png?access_token=${MAPBOX_TOKEN}`;
  }
  return `${TERRAIN_RGB}/{z}/{x}/{y}.png?access_token=${MAPBOX_TOKEN}`;
}

const SurfaceDropdown = ({surface, setSurface}) => {
  return (
    <select value={surface} onChange={e => setSurface(e.currentTarget.value)}>
      <option value="none">None</option>
      <option value="sectional">FAA Sectional</option>
      <option value="satellite">Satellite</option>
      <option value="street">OSM Street</option>
    </select>
  );
};

const LocationDropdown = ({location, setLocation}) => {
  return (
    <select value={location} onChange={e => setLocation(e.currentTarget.value)}>
      <option value="helens">St Helens</option>
      <option value="dallas">Dallas</option>
      <option value="la">Los Angeles</option>
      <option value="melbourne">Melbourne</option>
      <option value="nyc">New York City</option>
      <option value="sf">San Francisco</option>
    </select>
  );
};

const WireframeCheckbox = ({wireframe, setWireframe}) => {
  return (
    <div>
      <input
        type="checkbox"
        name="wireframe"
        checked={wireframe}
        onChange={e => {
          setWireframe(!wireframe);
        }}
      />
      <label htmlFor="wireframe">Wireframe</label>
    </div>
  );
};

const App = () => {
  const [surface, setSurface] = useState('satellite');
  const [location, setLocation] = useState('helens');
  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);
  const [wireframe, setWireframe] = useState(false);

  const setLocationProp = l => {
    const vs = getViewState(l);
    setLocation(l);
    setViewState(vs);
  };

  // https://docs.mapbox.com/help/troubleshooting/access-elevation-data/#mapbox-terrain-rgb
  // Note - the elevation rendered by this example is greatly exagerated!
  const elevationDecoder = {
    rScaler: 6553.6,
    gScaler: 25.6,
    bScaler: 0.1,
    offset: -10000
  };

  const layer = new TerrainLayer({
    id: 'loader',
    minZoom: 0,
    maxZoom: 23,
    strategy: 'no-overlap',
    elevationDecoder,
    terrainImage: getTerrain(),
    surfaceImage: getSurface(surface),
    wireframe,
    color: [255, 255, 255]
  });

  const setSurfaceProp = val => {
    setSurface(val);
    layer.setState({
      tileset: null
    });
  };

  const setWireframeProp = wf => {
    setWireframe(wf);
    if (wf) {
      setSurfaceProp('none');
    } else {
      setSurfaceProp('satellite');
    }
  };

  return (
    <div>
      <DeckGL initialViewState={viewState} controller={true} layers={[layer]} />
      <div
        style={{
          position: 'absolute'
        }}
      >
        <SurfaceDropdown surface={surface} setSurface={setSurfaceProp} />
        <LocationDropdown location={location} setLocation={setLocationProp} />
        <WireframeCheckbox wireframe={wireframe} setWireframe={setWireframeProp} />
      </div>
    </div>
  );
};

export function renderToDOM(container) {
  render(<App />, container);
}
