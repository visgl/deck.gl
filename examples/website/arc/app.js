/* global document, fetch, window */
import React, {Component} from 'react';
import {render} from 'react-dom';
import {StaticMap} from 'react-map-gl';
import DeckGL, {GeoJsonLayer, ArcLayer} from 'deck.gl';
import {scaleQuantile} from 'd3-scale';

// Set your mapbox token here
const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line

// Source data GeoJSON
const DATA_URL =
  'https://raw.githubusercontent.com/uber-common/deck.gl-data/master/examples/arc/counties.json'; // eslint-disable-line

const inFlowColors = [
  [255, 255, 204],
  [199, 233, 180],
  [127, 205, 187],
  [65, 182, 196],
  [29, 145, 192],
  [34, 94, 168],
  [12, 44, 132]
];

const outFlowColors = [
  [255, 255, 178],
  [254, 217, 118],
  [254, 178, 76],
  [253, 141, 60],
  [252, 78, 42],
  [227, 26, 28],
  [177, 0, 38]
];

const INITIAL_VIEW_STATE = {
  longitude: -100,
  latitude: 40.7,
  zoom: 3,
  maxZoom: 15,
  pitch: 30,
  bearing: 30
};

/* eslint-disable react/no-deprecated */
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      arcs: null,
      selectedCounty: null
    };

    this._recalculateArcs(this.props.data, this.props.selectedFeature);
  }

  componentWillReceiveProps(nextProps) {
    const arcsChanged =
      nextProps.data !== this.props.data ||
      nextProps.selectedFeature !== this.props.selectedFeature;
    if (arcsChanged) {
      this._recalculateArcs(nextProps.data, nextProps.selectedFeature);
    }
  }

  _onHover(info) {
    // Hovered over a county
  }

  _onClick(info) {
    // Clicked a county
    const selectedCounty = info.object;
    this.setState({selectedCounty});
    this._recalculateArcs(this.props.data, selectedCounty);
  }

  _recalculateArcs(data, selectedFeature) {
    if (!selectedFeature) {
      return;
    }

    const {flows, centroid} = selectedFeature.properties;

    const arcs = Object.keys(flows).map(toId => {
      const f = data[toId];
      return {
        source: centroid,
        target: f.properties.centroid,
        value: flows[toId]
      };
    });

    const scale = scaleQuantile()
      .domain(arcs.map(a => Math.abs(a.value)))
      .range(inFlowColors.map((c, i) => i));

    arcs.forEach(a => {
      a.gain = Math.sign(a.value);
      a.quantile = scale(Math.abs(a.value));
    });

    this.setState({arcs});
  }

  _renderLayers() {
    const {
      data,
      strokeWidth = 2,
      onHover = this._onHover.bind(this),
      onClick = this._onClick.bind(this)
    } = this.props;

    return [
      new GeoJsonLayer({
        id: 'geojson',
        data,
        stroked: false,
        filled: true,
        getFillColor: [0, 0, 0, 0],
        onHover,
        onClick,
        pickable: Boolean(onHover || onClick)
      }),
      new ArcLayer({
        id: 'arc',
        data: this.state.arcs,
        getSourcePosition: d => d.source,
        getTargetPosition: d => d.target,
        getSourceColor: d => (d.gain > 0 ? inFlowColors : outFlowColors)[d.quantile],
        getTargetColor: d => (d.gain > 0 ? outFlowColors : inFlowColors)[d.quantile],
        strokeWidth
      })
    ];
  }

  render() {
    const {viewState, controller = true, baseMap = true} = this.props;

    return (
      <DeckGL
        layers={this._renderLayers()}
        initialViewState={INITIAL_VIEW_STATE}
        viewState={viewState}
        controller={controller}
      >
        {baseMap && (
          <StaticMap
            reuseMaps
            mapStyle="mapbox://styles/mapbox/light-v9"
            preventStyleDiffing={true}
            mapboxApiAccessToken={MAPBOX_TOKEN}
          />
        )}
      </DeckGL>
    );
  }
}

// NOTE: EXPORTS FOR DECK.GL WEBSITE DEMO LAUNCHER - CAN BE REMOVED IN APPS
export {App, INITIAL_VIEW_STATE};
export {inFlowColors, outFlowColors};

if (!window.demoLauncherActive) {
  const container = document.body.appendChild(document.createElement('div'));
  render(<App />, container);

  fetch(DATA_URL)
    .then(response => response.json())
    .then(({features}) => {
      const selectedFeature = features.find(f => f.properties.name === 'Los Angeles, CA');
      render(<App data={features} selectedFeature={selectedFeature} />, container);
    });
}
