/* global fetch */
import React, {Component} from 'react';
import {render} from 'react-dom';
import {StaticMap} from 'react-map-gl';
import DeckGL from 'deck.gl';
import ArcBrushingLayer from './arc-brushing-layer/arc-brushing-layer';
import ScatterplotBrushingLayer from './scatterplot-brushing-layer/scatterplot-brushing-layer';
import {scaleLinear} from 'd3-scale';

// Set your mapbox token here
const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line

const TOOLTIP_STYLE = {
  position: 'absolute',
  padding: '4px',
  background: 'rgba(0, 0, 0, 0.8)',
  color: '#fff',
  maxWidth: '300px',
  fontSize: '10px',
  zIndex: 9,
  pointerEvents: 'none'
};

// Source data GeoJSON
const DATA_URL =
  'https://raw.githubusercontent.com/uber-common/deck.gl-data/master/examples/arc/counties.json'; // eslint-disable-line

export const inFlowColors = [[35, 181, 184]];
export const outFlowColors = [[166, 3, 3]];

// migrate out
const SOURCE_COLOR = [166, 3, 3];
// migrate in
const TARGET_COLOR = [35, 181, 184];

export const INITIAL_VIEW_STATE = {
  longitude: -100,
  latitude: 40.7,
  zoom: 3,
  maxZoom: 15,
  pitch: 0,
  bearing: 0
};

/* eslint-disable react/no-deprecated */
export class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      arcs: [],
      targets: [],
      sources: [],
      mousePosition: null,
      ...this._getLayerData(props)
    };
    this._onMouseMove = this._onMouseMove.bind(this);
    this._onMouseLeave = this._onMouseLeave.bind(this);
    this._onHover = this._onHover.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.data !== this.props.data) {
      this.setState({
        ...this._getLayerData(nextProps)
      });
    }
  }

  _onMouseMove(evt) {
    if (evt.nativeEvent) {
      this.setState({mousePosition: [evt.nativeEvent.offsetX, evt.nativeEvent.offsetY]});
    }
  }

  _onMouseLeave() {
    this.setState({mousePosition: null});
  }

  _onHover({x, y, object}) {
    this.setState({x, y, hoveredObject: object});
  }

  _getLayerData({data}) {
    if (!data) {
      return null;
    }
    const arcs = [];
    const targets = [];
    const sources = [];
    const pairs = {};

    data.forEach((county, i) => {
      const {flows, centroid: targetCentroid} = county.properties;
      const value = {gain: 0, loss: 0};

      Object.keys(flows).forEach(toId => {
        value[flows[toId] > 0 ? 'gain' : 'loss'] += flows[toId];

        // if number too small, ignore it
        if (Math.abs(flows[toId]) < 50) {
          return;
        }
        const pairKey = [i, Number(toId)].sort((a, b) => a - b).join('-');
        const sourceCentroid = data[toId].properties.centroid;
        const gain = Math.sign(flows[toId]);

        // add point at arc source
        sources.push({
          position: sourceCentroid,
          target: targetCentroid,
          name: data[toId].properties.name,
          radius: 3,
          gain: -gain
        });

        // eliminate duplicates arcs
        if (pairs[pairKey]) {
          return;
        }

        pairs[pairKey] = true;

        arcs.push({
          target: gain > 0 ? targetCentroid : sourceCentroid,
          source: gain > 0 ? sourceCentroid : targetCentroid,
          value: flows[toId]
        });
      });

      // add point at arc target
      targets.push({
        ...value,
        position: [targetCentroid[0], targetCentroid[1], 10],
        net: value.gain + value.loss,
        name: county.properties.name
      });
    });

    // sort targets by radius large -> small
    targets.sort((a, b) => Math.abs(b.net) - Math.abs(a.net));
    const sizeScale = scaleLinear()
      .domain([0, Math.abs(targets[0].net)])
      .range([36, 400]);

    targets.forEach(pt => {
      pt.radius = Math.sqrt(sizeScale(Math.abs(pt.net)));
    });

    return {arcs, targets, sources};
  }

  _renderTooltip() {
    const {x, y, hoveredObject} = this.state;

    if (!hoveredObject) {
      return null;
    }

    return (
      <div style={{...TOOLTIP_STYLE, left: x, top: y}}>
        <div>{hoveredObject.name}</div>
        <div>{`Net gain: ${hoveredObject.net}`}</div>
      </div>
    );
  }

  _renderLayers() {
    const {
      enableBrushing = true,
      brushRadius = 100000,
      strokeWidth = 2,
      opacity = 0.7
    } = this.props;

    const {arcs, targets, sources, mousePosition} = this.state;

    const isMouseover = mousePosition !== null;
    const startBrushing = Boolean(isMouseover && enableBrushing);

    if (!arcs || !targets) {
      return null;
    }

    return [
      new ScatterplotBrushingLayer({
        id: 'sources',
        data: sources,
        brushRadius,
        brushTarget: true,
        mousePosition,
        opacity: 1,
        enableBrushing: startBrushing,
        pickable: false,
        // only show source points when brushing
        radiusScale: startBrushing ? 3000 : 0,
        getColor: d => (d.gain > 0 ? TARGET_COLOR : SOURCE_COLOR),
        getTargetPosition: d => [d.position[0], d.position[1], 0]
      }),
      new ScatterplotBrushingLayer({
        id: 'targets-ring',
        data: targets,
        brushRadius,
        mousePosition,
        strokeWidth: 2,
        outline: true,
        opacity: 1,
        enableBrushing: startBrushing,
        // only show rings when brushing
        radiusScale: startBrushing ? 4000 : 0,
        getColor: d => (d.net > 0 ? TARGET_COLOR : SOURCE_COLOR)
      }),
      new ScatterplotBrushingLayer({
        id: 'targets',
        data: targets,
        brushRadius,
        mousePosition,
        opacity: 1,
        enableBrushing: startBrushing,
        pickable: true,
        radiusScale: 3000,
        onHover: this._onHover,
        getColor: d => (d.net > 0 ? TARGET_COLOR : SOURCE_COLOR)
      }),
      new ArcBrushingLayer({
        id: 'arc',
        data: arcs,
        getStrokeWidth: strokeWidth,
        opacity,
        brushRadius,
        enableBrushing: startBrushing,
        mousePosition,
        getSourcePosition: d => d.source,
        getTargetPosition: d => d.target,
        getSourceColor: SOURCE_COLOR,
        getTargetColor: TARGET_COLOR
      })
    ];
  }

  render() {
    const {viewState, controller = true, baseMap = true} = this.props;

    return (
      <div onMouseMove={this._onMouseMove} onMouseLeave={this._onMouseLeave}>
        {this._renderTooltip()}

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
      </div>
    );
  }
}

export function renderToDOM(container) {
  render(<App />, container);

  fetch(DATA_URL)
    .then(response => response.json())
    .then(({features}) => {
      render(<App data={features} />, container);
    });
}
