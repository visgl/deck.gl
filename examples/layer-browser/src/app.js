/* global window, document */

import {
  // COORDINATE_SYSTEM,
  WebMercatorViewport,
  FirstPersonViewport,
  MapState,
  // FirstPersonState,
  experimental
} from 'deck.gl';

 // deck.gl react components
import DeckGL, {ViewportController} from 'deck.gl';

const {
  ReflectionEffect
} = experimental;

import React, {PureComponent} from 'react';
import ReactDOM from 'react-dom';
import autobind from 'react-autobind';

import {StaticMap} from 'react-map-gl';
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
        pitch: 0,
        bearing: 0
      },
      activeExamples: {
        ScatterplotLayer: true
      },
      settings: {
        multiview: false,
        useDevicePixelRatio: true,
        pickingRadius: 0,
        drawPickingColors: false,

        separation: 0
        // the rotation controls works only for layers in
        // meter offset projection mode. They are commented out
        // here since layer browser currently only have one layer
        // in this mode, and that layer's data is rotation symmetrical
        // rotationZ: 0,
        // rotationX: 0

        // immutable: false,
        // Effects are experimental for now. Will be enabled in the future
        // effects: false,

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

  _onQueryVisibleObjects() {
    const {width, height} = this.state;
    const infos = this.refs.deckgl.queryVisibleObjects({x: 0, y: 0, width, height});
    console.log(infos); // eslint-disable-line
    this.setState({queriedItems: infos});
  }

  _renderExampleLayer(example, settings, index) {
    const {layer: Layer, props, getData, getUpdateTriggers} = example;

    const layerProps = Object.assign({}, props, settings);

    if (getData) {
      Object.assign(layerProps, {data: getData()});
    }

    if (getUpdateTriggers) {
      Object.assign(layerProps, {updateTriggers: getUpdateTriggers(settings)});
    }

    Object.assign(layerProps, {
      modelMatrix: this._getModelMatrix(index, layerProps.coordinateSystem)
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

  _getModelMatrix(index, coordinateSystem) {
    // the rotation controls works only for layers in
    // meter offset projection mode. They are commented out
    // here since layer browser currently only have one layer
    // in this mode.
    const {settings: {separation}} = this.state;
    const modelMatrix = new Matrix4().translate([0, 0, 1000 * index * separation]);

    // if (coordinateSystem === COORDINATE_SYSTEM.METER_OFFSETS) {
    //   const {settings: {rotationZ, rotationX}} = this.state;
    //   modelMatrix.rotateZ(index * rotationZ * Math.PI);
    //   modelMatrix.rotateX(index * rotationX * Math.PI);
    // }

    return modelMatrix;
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

  _getViewports() {
    const {width, height, mapViewState, settings: {multiview}} = this.state;
    return [
      new WebMercatorViewport({
        id: 'basemap', ...mapViewState,
        width,
        height: multiview ? height / 2 : height,
        y: multiview ? height / 2 : 0
      }),
      multiview && new FirstPersonViewport({
        ...mapViewState,
        width,
        height: multiview ? height / 2 : height,
        position: [0, 0, 50]
      })
    ];
  }

  _renderMap() {
    const {width, height, mapViewState, settings} = this.state;
    const {effects, pickingRadius, drawPickingColors, useDevicePixelRatio} = settings;

    const viewports = this._getViewports();

    return (
      <div style={{backgroundColor: '#eeeeee'}}>
        <ViewportController
          viewportState={MapState}
          {...mapViewState}
          width={width}
          height={height}
          onViewportChange={this._onViewportChange} >

          <DeckGL
            ref="deckgl"
            id="default-deckgl-overlay"
            width={width}
            height={height}
            viewports={viewports}
            layers={this._renderExamples()}
            effects={effects ? this._effects : []}
            useDefaultGLSettings
            pickingRadius={pickingRadius}
            onLayerHover={this._onHover}
            onLayerClick={this._onClick}
            initWebGLParameters

            useDevicePixelRatio={useDevicePixelRatio}

            debug={false}
            drawPickingColors={drawPickingColors}
          >
            <FPSStats isActive/>

            <StaticMap
              viewportId="basemap"
              {...mapViewState}
              mapboxApiAccessToken={MapboxAccessToken || 'no_token'}
              width={width}
              height={height}
              onViewportChange={this._onViewportChange}/>

          </DeckGL>

        </ViewportController>
      </div>
    );
  }

  render() {
    const {settings, activeExamples, hoveredItem, clickedItem, queriedItems} = this.state;

    return (
      <div>
        {this._renderMap()}
        {!MapboxAccessToken && this._renderNoTokenWarning()}
        <div id="control-panel">
          <div style={{textAlign: 'center', padding: '5px 0 5px'}}>
            <button onClick={this._onQueryVisibleObjects}>
              <b>Query Visble Objects</b>
            </button>
          </div>
          <LayerControls
            title="Common Settings"
            settings={settings}
            onChange={this._onUpdateContainerSettings}/>
          <LayerSelector
            activeExamples={activeExamples}
            examples={LAYER_CATEGORIES}
            onToggleLayer={this._onToggleLayer}
            onUpdateLayer={this._onUpdateLayerSettings} />
        </div>
        <LayerInfo
          ref="infoPanel"
          hovered={hoveredItem}
          clicked={clickedItem}
          queried={queriedItems} />
      </div>
    );
  }
}

// ---- Main ---- //

const container = document.createElement('div');
document.body.appendChild(container);

ReactDOM.render(<App />, container);
