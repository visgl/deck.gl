/* global window */

import React, {Component} from 'react';
import {render} from 'react-dom';
import DeckGL, {ScatterplotLayer} from 'deck.gl';
import {StaticMap} from 'react-map-gl';
import {RenderMetrics} from './render-metrics';

const NUM_LAYERS = 1000;
const POINTS_PER_LAYER = 100;
const SF_MIN = [-122.511289, 37.709481];
const SF_MAX = [-122.37646761, 37.806013];

function sfRandomPoints(numPoints, maxVal) {
  const points = new Array(numPoints);

  const lngMin = SF_MIN[0];
  const latMin = SF_MIN[1];
  const lngRange = SF_MAX[0] - SF_MIN[0];
  const latRange = SF_MAX[1] - SF_MIN[1];

  for (let i = 0; i < numPoints; ++i) {
    points[i] = {
      position: [lngMin + Math.random() * lngRange, latMin + Math.random() * latRange],
      value: Math.random() * maxVal
    };
  }

  return points;
}

class Root extends Component {
  constructor(props) {
    super(props);
    this.deckRef = React.createRef();

    this.state = {
      mapViewState: {
        latitude: 37.752,
        longitude: -122.427,
        zoom: 11.5,
        pitch: 0,
        bearing: 0
      },
      metrics: null
    };

    this.layers = new Array(NUM_LAYERS);

    this.cameraShakeHandle = null;
    this._cameraShake = this._cameraShake.bind(this);
    this._onMetrics = this._onMetrics.bind(this);

    this._initializeLayers();
  }

  componentDidMount() {
    this.cameraShakeHandle = window.requestAnimationFrame(this._cameraShake);
  }

  componentWillUnmount() {
    window.cancelAnimationFrame(this.cameraShakeHandle);
  }

  _initializeLayers() {
    for (let i = 0; i < NUM_LAYERS; ++i) {
      const r = Math.random() * 256;
      const g = Math.random() * 256;
      const b = Math.random() * 256;
      this.layers[i] = new ScatterplotLayer({
        data: sfRandomPoints(POINTS_PER_LAYER, 10),
        id: `scatterplotLayer${i}`,
        getPosition: d => d.position,
        getFillColor: [r, g, b],
        getRadius: d => d.value,
        opacity: 1,
        pickable: true,
        radiusScale: 30,
        radiusMinPixels: 1,
        radiusMaxPixels: 30
      });
    }
  }

  _cameraShake() {
    this.cameraShakeHandle = window.requestAnimationFrame(this._cameraShake);
    if (this.deckRef.current) {
      const deck = this.deckRef.current.deck;
      const viewState = deck.viewManager.getViewState();
      deck.setProps({
        viewState: Object.assign({}, viewState, {
          latitude: viewState.latitude + (Math.random() * 0.00002 - 0.00001),
          longitude: viewState.longitude + (Math.random() * 0.00002 - 0.00001)
        })
      });
    }
  }

  _onMetrics(metrics) {
    this.setState({metrics: Object.assign({}, metrics)});
  }

  render() {
    return (
      <div>
        <div style={{position: 'absolute', top: '10px', left: '100px', zIndex: 999}}>
          <div>
            Rendering {NUM_LAYERS * POINTS_PER_LAYER} points in {NUM_LAYERS} layers.
          </div>
          <RenderMetrics metrics={this.state.metrics} />
        </div>
        <DeckGL
          controller={true}
          viewState={this.state.mapViewState}
          ref={this.deckRef}
          layers={this.layers}
          _onMetrics={this._onMetrics}
        >
          <StaticMap key="map" mapStyle="mapbox://styles/mapbox/light-v9" />
        </DeckGL>
      </div>
    );
  }
}

/* global document */
render(<Root />, document.body.appendChild(document.createElement('div')));
