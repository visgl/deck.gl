/* global fetch, window, document */
import 'babel-polyfill';

import {ReflectionEffect} from 'deck.gl/experimental';
import DeckGL, {autobind} from 'deck.gl/react';

// import {Matrix4} from 'luma.gl';
import {mat4} from 'gl-matrix';

import React from 'react';
import ReactDOM from 'react-dom';
import MapboxGLMap from 'react-map-gl';
import {FPSStats} from 'react-stats';

import LayerInfo from './layer-info';
import LayerSelector from './layer-selector';
import LayerControls from './layer-controls';
import LAYER_CATEGORIES, {DEFAULT_ACTIVE_LAYERS} from './layer-examples';

import assert from 'assert';
assert(window.fetch, 'fetch API not supported by browser');

/* eslint-disable no-process-env */
const MAPBOX_ACCESS_TOKEN = process.env.MAPBOX_ACCESS_TOKEN || // eslint-disable-line
  'Set MAPBOX_ACCESS_TOKEN environment variable or put your token here.';

// ---- View ---- //
class App extends React.Component {
  constructor(props) {
    super(props);
    autobind(this);

    this.state = {
      mapViewState: {
        latitude: 37.751537058389985,
        longitude: -122.42694203247012,
        zoom: 11.5,
        pitch: 30,
        bearing: 0
      },
      activeExamples: DEFAULT_ACTIVE_LAYERS,
      hoveredItem: null,
      clickedItem: null,
      settings: {
        separation: 0,
        rotation: 0
      }
    };

    this._effects = [new ReflectionEffect()];
  }

  componentWillMount() {
    this._onResize();
    window.addEventListener('resize', this._onResize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this._onResize);
  }

  _onResize() {
    this.setState({width: window.innerWidth, height: window.innerHeight});
  }

  _onViewportChanged(mapViewState) {
    if (mapViewState.pitch > 60) {
      mapViewState.pitch = 60;
    }
    this.setState({mapViewState});
  }

  _onItemHovered(info) {
    this.setState({hoveredItem: info});
  }

  _onItemClicked(info) {
    this.setState({clickedItem: info});
  }

  _onToggleLayer(exampleName) {
    const {activeExamples} = this.state;
    activeExamples[exampleName] = !activeExamples[exampleName];
    this.setState({activeExamples});
  }

  _onWebGLInitialized(gl) {
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
  }

  _onSettingsChange(settings) {
    this.setState({settings});
  }

  _renderExamples() {
    let index = 0;
    const layers = [];
    for (const categoryName of Object.keys(LAYER_CATEGORIES)) {
      for (const exampleName of Object.keys(LAYER_CATEGORIES[categoryName])) {

        // An example is a function that returns a DeckGL layer instance
        if (this.state.activeExamples[exampleName]) {
          const example = LAYER_CATEGORIES[categoryName][exampleName];

          const layerProps = {
            ...this.state,
            modelMatrix: this._getModelMatrix(index++),
            onHovered: this._onItemHovered,
            onClicked: this._onItemClicked
          };

          layers.push(example(layerProps));
        }
      }
    }
    return layers;
  }

  _getModelMatrix(index) {
    const {settings: {separation, rotation}} = this.state;
    // const {mapViewState: {longitude, latitude}} = this.props;
    // const modelMatrix = new Matrix4().fromTranslation([0, 0, 1000 * index * separation]);
    const modelMatrix =
      mat4.fromTranslation(mat4.create(), [0, 0, 300 * index * separation, 0]);
    // mat4.translate(modelMatrix, modelMatrix, [-longitude, -latitude, 0]);
    mat4.rotateZ(modelMatrix, modelMatrix, index * rotation * Math.PI / 10000);
    // mat4.translate(modelMatrix, modelMatrix, [longitude, latitude, 0]);
    return modelMatrix;
  }

  _renderOverlay() {
    const {width, height, mapViewState} = this.state;

    return (
      <DeckGL
        id="default-deckgl-overlay"
        width={width}
        height={height}
        debug
        {...mapViewState}
        onWebGLInitialized={ this._onWebGLInitialized }
        layers={this._renderExamples()}
        effects={this._effects}
      />
    );
  }

  _renderMap() {
    const {width, height, mapViewState} = this.state;
    return (
      <MapboxGLMap
        mapboxApiAccessToken={MAPBOX_ACCESS_TOKEN}
        width={width}
        height={height}
        perspectiveEnabled
        { ...mapViewState }
        onChangeViewport={this._onViewportChanged}>
        { this._renderOverlay() }
        <FPSStats isActive/>
      </MapboxGLMap>
    );
  }

  render() {
    const {settings, hoveredItem, clickedItem} = this.state;

    return (
      <div>
        { this._renderMap() }
        <div id="control-panel">
          <LayerSelector { ...this.state }
            examples={LAYER_CATEGORIES}
            onChange={this._onToggleLayer}/>
          <LayerControls
            settings={settings}
            onSettingsChange={this._onSettingsChange}/>
        </div>
        <LayerInfo hoveredItem={hoveredItem} clickedItem={clickedItem} />
      </div>
    );
  }
}

// ---- Main ---- //

const container = document.createElement('div');
document.body.appendChild(container);

ReactDOM.render(<App />, container);
