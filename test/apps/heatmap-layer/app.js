/* global document window */
/* eslint-disable no-console */
import React, {PureComponent} from 'react';
import {render} from 'react-dom';
import {StaticMap} from 'react-map-gl';
import DeckGL from 'deck.gl';
import {HeatmapLayer} from '@deck.gl/aggregation-layers';
import {default as earthquakes} from './data/earthquakes.json';

// Set your mapbox token here
const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line

const INITIAL_VIEW_STATE = {
  bearing: 0,
  pitch: 0,
  longitude: -122.45,
  latitude: 37.78,
  zoom: 1.5,
  minZoom: 1.5,
  maxZoom: 15,
  height: window.innerHeight,
  width: window.innerWidth
};

const MAP_STYLE = 'mapbox://styles/mapbox/dark-v9';
const colorRange = [
  [33, 102, 172, 0],
  [103, 169, 207],
  [209, 229, 240],
  [253, 219, 199],
  [239, 138, 98],
  [178, 24, 43]
];
class Root extends PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <DeckGL
          initialViewState={INITIAL_VIEW_STATE}
          controller={true}
          layers={[
            new HeatmapLayer({
              data: earthquakes,
              id: 'heatmp-layer-eq',
              opacity: 1,
              pickable: false,
              getPosition: d => d.geometry.coordinates,
              colorRange,
              enhanceFactor: 100
            })
          ]}
        >
          <StaticMap
            reuseMaps
            mapStyle={MAP_STYLE}
            preventStyleDiffing={true}
            mapboxApiAccessToken={MAPBOX_TOKEN}
          />
        </DeckGL>
      </div>
    );
  }
}

render(<Root />, document.body.appendChild(document.createElement('div')));
