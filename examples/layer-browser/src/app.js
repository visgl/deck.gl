/* global window, document */
import DeckGL, {experimental} from 'deck.gl';
const {ReflectionEffect} = experimental;

import React, {PureComponent} from 'react';
import ReactDOM from 'react-dom';
import autobind from 'react-autobind';
import MapboxGLMap from 'react-map-gl';
import {FPSStats} from 'react-stats';

import {Matrix4} from 'luma.gl';

import LayerInfo from './components/layer-info';
import LayerSelector from './components/layer-selector';
import LayerControls from './components/layer-controls';

import LAYER_CATEGORIES from './examples';
import {setImmutableDataSamples} from './immutable-data-samples';

/* eslint-disable no-process-env */
const MapboxAccessToken = process.env.MapboxAccessToken || // eslint-disable-line
  'Set MapboxAccessToken environment variable or put your token here.';

// ---- View ---- //
class App extends PureComponent {
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
      activeExamples: {
        ScatterplotLayer: true
      },
      settings: {
        // immutable: false,
        // Effects are experimental for now. Will be enabled in the future
        // effects: false,
        separation: 0,
        pickingRadius: 0
        // the rotation controls works only for layers in
        // meter offset projection mode. They are commented out
        // here since layer browser currently only have one layer
        // in this mode.
        // rotationZ: 0,
        // rotationX: 0
      },
      hoveredItem: null,
      clickedItem: null,
      queriedItems: null
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

  _onViewportChange(mapViewState) {
    if (mapViewState.pitch > 60) {
      mapViewState.pitch = 60;
    }
    this.setState({mapViewState});
  }

  _onToggleLayer(exampleName, example) {
    const activeExamples = {...this.state.activeExamples};
    activeExamples[exampleName] = !activeExamples[exampleName];
    this.setState({activeExamples});
  }

  _onUpdateLayerSettings(exampleName, settings) {
    const activeExamples = {...this.state.activeExamples};
    activeExamples[exampleName] = {
      ...activeExamples[exampleName],
      ...settings
    };
    this.setState({activeExamples});
  }

  _onWebGLInitialized(gl) {
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
  }

  _onUpdateContainerSettings(settings) {
    this.setState({settings});
    setImmutableDataSamples(settings.immutable);
  }

  _onHover(info) {
    this.setState({hoveredItem: info});
  }

  _onClick(info) {
    this.setState({clickedItem: info});
  }

  _onQueryObjects() {
    const {width, height} = this.state;
    const infos = this.refs.deckgl.queryObjects({x: 0, y: 0, width, height});
    console.log(infos); // eslint-disable-line
    this.setState({queriedItems: infos});
  }

  _renderExampleLayer(example, settings, index) {
    const {layer: Layer, props, getData} = example;
    const layerProps = Object.assign({}, props, settings);

    if (getData) {
      Object.assign(layerProps, {data: getData()});
    }

    Object.assign(layerProps, {
      modelMatrix: this._getModelMatrix(index, layerProps.projectionMode === 2)
    });

    return new Layer(layerProps);
  }

  /* eslint-disable max-depth */
  _renderExamples() {
    let index = 1;
    const layers = [];
    const {activeExamples} = this.state;

    for (const categoryName of Object.keys(LAYER_CATEGORIES)) {
      for (const exampleName of Object.keys(LAYER_CATEGORIES[categoryName])) {

        const settings = activeExamples[exampleName];
        // An example is a function that returns a DeckGL layer instance
        if (settings) {
          const example = LAYER_CATEGORIES[categoryName][exampleName];
          const layer = this._renderExampleLayer(example, settings, index++);

          if (typeof settings !== 'object') {
            activeExamples[exampleName] = layer.props;
          }

          layers.push(layer);
        }
      }
    }
    return layers;
  }
  /* eslint-enable max-depth */

  _getModelMatrix(index, offsetMode) {
    // the rotation controls works only for layers in
    // meter offset projection mode. They are commented out
    // here since layer browser currently only have one layer
    // in this mode.

    // const {settings: {separation, rotationZ, rotationX}} = this.state;
    const {settings: {separation}} = this.state;
    // const {mapViewState: {longitude, latitude}} = this.props;
    // const modelMatrix = new Matrix4().fromTranslation([0, 0, 1000 * index * separation]);

    const modelMatrix = new Matrix4()
      .fromTranslation([0, 0, 1000 * index * separation]);

    // if (offsetMode) {
    //   modelMatrix.rotateZ(index * rotationZ * Math.PI);
    //   modelMatrix.rotateX(index * rotationX * Math.PI);
    // }

    return modelMatrix;
  }

  _renderMap() {
    const {width, height, mapViewState, settings: {effects, pickingRadius}} = this.state;
    return (
      <MapboxGLMap
        mapboxApiAccessToken={MapboxAccessToken || 'no_token'}
        width={width} height={height}
        { ...mapViewState }
        onViewportChange={this._onViewportChange}>

        <DeckGL ref="deckgl"
          debug
          id="default-deckgl-overlay"
          width={width} height={height}
          {...mapViewState}
          pickingRadius={pickingRadius}
          onWebGLInitialized={ this._onWebGLInitialized }
          onLayerHover={ this._onHover }
          onLayerClick={ this._onClick }
          layers={this._renderExamples()}
          effects={effects ? this._effects : []}
        />

        <FPSStats isActive/>
      </MapboxGLMap>
    );
  }

  _renderNoTokenWarning() {
    /* eslint-disable max-len */
    return (
      <div id="no-token-warning">
        <h3>No Mapbox access token found.</h3>
        Read <a href="http://uber.github.io/deck.gl/#/documentation/overview/getting-started#note-on-map-tokens-">"Note on Map Tokens"</a> for information on setting up your basemap.
      </div>
    );
    /* eslint-disable max-len */
  }

  render() {
    const {settings, activeExamples, hoveredItem, clickedItem, queriedItems} = this.state;

    return (
      <div>
        { this._renderMap() }
        { !MapboxAccessToken && this._renderNoTokenWarning() }
        <div id="control-panel">
          <button onClick={this._onQueryObjects}>Query Objects</button>
          <LayerControls
            title="Composite Settings"
            settings={settings}
            onChange={this._onUpdateContainerSettings}/>
          <LayerSelector
            activeExamples={activeExamples}
            examples={LAYER_CATEGORIES}
            onToggleLayer={this._onToggleLayer}
            onUpdateLayer={this._onUpdateLayerSettings} />
        </div>
        <LayerInfo ref="infoPanel" hovered={hoveredItem} clicked={clickedItem} queried={queriedItems} />
      </div>
    );
  }
}

// ---- Main ---- //

const container = document.createElement('div');
document.body.appendChild(container);

ReactDOM.render(<App />, container);
