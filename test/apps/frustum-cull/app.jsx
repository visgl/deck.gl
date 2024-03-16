/* global window */
import React, {Component} from 'react';
import {createRoot} from 'react-dom/client';
import {Map} from 'react-map-gl/maplibre';
import DeckGL, {MapView, SimpleMeshLayer, LineLayer, WebMercatorViewport} from 'deck.gl';

import {SphereGeometry} from '@luma.gl/engine';

import {getCulling, getFrustumBounds} from './frustum-utils';

const INITIAL_VIEW_STATE = {
  main: {
    width: window.innerWidth,
    height: window.innerHeight,
    latitude: 51.47,
    longitude: 0.45,
    zoom: 8,
    pitch: 30,
    bearing: 45
  },
  minimap: {
    latitude: 51.47,
    longitude: 0.45,
    zoom: 4
  }
};

const MINIMAP_STYLE = {
  width: '100%',
  height: '100%',
  background: '#444',
  position: 'relative',
  zIndex: -1
};

const LABEL_STYLE = {
  position: 'absolute',
  right: '10px',
  top: '10px',
  padding: '10px',
  background: 'white',
  border: '1px solid black'
};

const POSITIONS = [[0.45, 51.47, 10000]];
const MESH = new SphereGeometry({radius: 5000});
const VIEWS = [
  new MapView({id: 'main', controller: true}),
  new MapView({id: 'minimap', clear: true, x: 20, y: 20, width: '20%', height: '20%'})
];

class Root extends Component {
  constructor(props) {
    super(props);
    this.deckRef = React.createRef();
    this.state = {
      viewState: INITIAL_VIEW_STATE
    };

    this._onViewStateChange = this._onViewStateChange.bind(this);
  }

  _onViewStateChange({viewState}) {
    this.setState({
      viewState: {...INITIAL_VIEW_STATE, main: viewState}
    });
  }

  render() {
    const {viewState} = this.state;
    const viewport = new WebMercatorViewport(viewState.main);
    const outDir = getCulling(viewport, POSITIONS[0]);

    const frustomBounds = getFrustumBounds(viewport);
    const cullStatus = outDir ? `OUT (${outDir})` : 'IN';

    const layers = [
      new SimpleMeshLayer({
        id: 'mesh',
        data: POSITIONS,
        mesh: MESH,
        getPosition: p => p,
        getColor: [255, 0, 0]
      }),
      new LineLayer({
        id: 'frustum',
        data: frustomBounds,
        getSourcePosition: d => d.source,
        getTargetPosition: d => d.target,
        getColor: d => d.color,
        getWidth: 2
      })
    ];

    return (
      <DeckGL
        views={VIEWS}
        viewState={viewState}
        layers={layers}
        ref={this.deckRef}
        onViewStateChange={this._onViewStateChange}
      >
        <MapView id="main">
          <Map
            key="map"
            mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json"
          />
        </MapView>
        <MapView id="minimap">
          <div style={MINIMAP_STYLE} />
        </MapView>
        <div style={LABEL_STYLE}>Culling Status: {cullStatus}</div>
      </DeckGL>
    );
  }
}

/* global document */
const container = document.body.appendChild(document.createElement('div'));
createRoot(container).render(<Root />);
