/* eslint-disable max-statements */
import React, { useState } from 'react';
import { render } from 'react-dom';
import DeckGL from '@deck.gl/react';
import { WebMercatorViewport, COORDINATE_SYSTEM } from '@deck.gl/core';
import { load } from '@loaders.gl/core';
import { TileLayer } from '@deck.gl/geo-layers';

import TerrainLayer from './terrain-layer/terrain-layer';
import { getSurface } from './surface';
import { getViewState } from './locations';

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

const getTerrainData = ({x, y, z}) => {
  const terrainTile = `${TERRAIN_RGB}/${z}/${x}/${y}.pngraw?access_token=${MAPBOX_TOKEN}`;
  // Some tiles over the ocean may not exist
  // eslint-disable-next-line handle-callback-err
  return load(terrainTile).catch(err => null);
};

const SurfaceDropdown = ({surface, setSurface}) => {
  return (
    <select
    value={surface}
    onChange={e => setSurface(e.currentTarget.value)}
    >
      <option value="none">None</option>
      <option value="sectional">
        FAA Sectional
      </option>
      <option value="satellite">Satellite</option>
      <option value="street">OSM Street</option>
    </select>
  )
}

const LocationDropdown = ({location, setLocation}) => {
  return (
    <select
    value={location}
    onChange={e => setLocation(e.currentTarget.value)}
    >
      <option value="helens">St Helens</option>
      <option value="dallas">Dallas</option>
      <option value="la">Los Angeles</option>
      <option value="melbourne">
        Melbourne
      </option>
      <option value="nyc">New York City</option>
      <option value="sf">San Francisco</option>
    </select>
  )
}

const WireframeCheckbox = ({wireframe, setWireframe}) => {
  return (
    <div>
      <input type="checkbox" name="wireframe" checked={wireframe} onChange={e => {
      setWireframe(!wireframe)
    }}/>
      <label htmlFor="wireframe">Wireframe</label>
    </div>
  )
}

const App = () => {
  const [surface, setSurface] = useState('satellite');
  const [location, setLocation] = useState('helens');
  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);
  const [wireframe, setWireframe] = useState(false);

  const setLocationProp = (l) => {
    const vs = getViewState(l)
    setLocation(l)
    setViewState(vs)
  }

  const renderSubLayers = props => {
    const {bbox, z} = props.tile;

    const viewport = new WebMercatorViewport({
      longitude: (bbox.west + bbox.east) / 2,
      latitude: (bbox.north + bbox.south) / 2,
      zoom: z
    });
    const bottomLeft = viewport.projectFlat([bbox.west, bbox.south]);
    const topRight = viewport.projectFlat([bbox.east, bbox.north]);

    return new TerrainLayer({
      id: props.id,
      wireframe,
      coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
      bounds: [bottomLeft[0], bottomLeft[1], topRight[0], topRight[1]],
      surfaceImage: getSurface(props.tile, surface),
      terrainImage: props.data,
      // https://docs.mapbox.com/help/troubleshooting/access-elevation-data/#mapbox-terrain-rgb
      // Note - the elevation rendered by this example is greatly exagerated!
      getElevation: (r, g, b) => (r * 65536 + g * 256 + b) / 10 - 10000
    // getElevation: (r, g, b) => -10000 + ((r * 65536 + g * 256 + b) * 0.1)
    });
  };

  const layer = new TileLayer({
    id: 'loader',
    minZoom: 0,
    maxZoom: 23,
    strategy: 'no-overlap',
    getTileData: getTerrainData,
    renderSubLayers
  });

  const setSurfaceProp = (val) => {
    setSurface(val)
    layer.setState({
      tileset: null
    });
  }

  const setWireframeProp = (wf) => {
    setWireframe(wf)
    if (wf) {
      setSurfaceProp('none')
    } else {
      setSurfaceProp('satellite')
    }
  }

  return (
    <div>
      <DeckGL viewState={viewState} controller={true} layers={[layer]} onViewStateChange={(e) => setViewState(e.viewState)} />
      <div style={{
      position: 'absolute'
    }}>
        <SurfaceDropdown surface={surface} setSurface={setSurfaceProp}/>
        <LocationDropdown location={location} setLocation={setLocationProp}/>
        <WireframeCheckbox wireframe={wireframe} setWireframe={setWireframeProp}/>
      </div>
    </div>
    );
}

export function renderToDOM(container) {
  render(<App />, container);
}
