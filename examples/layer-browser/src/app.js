/* global window */

// deck.gl ES6 components
import {
  COORDINATE_SYSTEM,
  View,
  MapView,
  FirstPersonView,
  OrbitView,
  MapController
} from '@deck.gl/core';
import {_OrbitController as OrbitController} from '@deck.gl/core';

// deck.gl react components
import DeckGL from '@deck.gl/react';

import React, {PureComponent} from 'react';
import autobind from 'react-autobind';

import {StaticMap, _MapContext as MapContext, NavigationControl} from 'react-map-gl';

import {Matrix4} from 'math.gl';

import LayerInfo from './components/layer-info';
import LayerSelector from './components/layer-selector';
import LayerControls from './components/layer-controls';

import LAYER_CATEGORIES from './examples';

/* eslint-disable no-process-env */
const MapboxAccessToken =
  process.env.MapboxAccessToken || // eslint-disable-line
  'Set MapboxAccessToken environment variable or put your token here.';

const VIEW_LABEL_STYLES = {
  zIndex: 10,
  // position: 'relative',
  padding: 5,
  margin: 20,
  fontSize: 12,
  backgroundColor: '#282727',
  color: '#FFFFFF'
};

const NAVIGATION_CONTROL_STYLES = {
  margin: 10,
  position: 'absolute',
  zIndex: 1
};

const ViewportLabel = props => (
  <div style={{position: 'absolute'}}>
    <div style={{...VIEW_LABEL_STYLES, display: ''}}>{props.children}</div>
  </div>
);

// ---- View ---- //
export default class App extends PureComponent {
  constructor(props) {
    super(props);
    autobind(this);

    this.state = props.state || {
      mapViewState: {
        latitude: 37.751537058389985,
        longitude: -122.42694203247012,
        zoom: 11.5,
        pitch: 0,
        bearing: 0
      },
      orbitViewState: {
        lookAt: [0, 0, 0],
        distance: 3,
        rotationX: -30,
        rotationOrbit: 30,
        orbitAxis: 'Y',
        fov: 50,
        minDistance: 1,
        maxDistance: 20
      },
      activeExamples: {
        ScatterplotLayer: true
      },
      settings: {
        orthographic: false,
        multiview: false,
        infovis: false,
        useDevicePixels: true,
        pickingRadius: 0,
        drawPickingColors: false,

        // Model matrix manipulation
        separation: 0,
        rotationZ: 0,
        rotationX: 0

        // immutable: false,
        // Effects are experimental for now. Will be enabled in the future
        // effects: false,
      },
      hoveredItem: null,
      clickedItem: null,
      queriedItems: null,

      enableDepthPickOnClick: false
    };
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState !== this.state) {
      this.props.onStateChange(this.state);
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this._onResize);
  }

  _getSize() {
    return {width: window.innerWidth, height: window.innerHeight};
  }

  _onViewStateChange({viewState}) {
    if (viewState.pitch > 60) {
      viewState.pitch = 60;
    }
    this.setState({mapViewState: viewState});
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
  }

  _onHover(info) {
    this.setState({hoveredItem: info});
  }

  _onClick(info) {
    if (this.state.enableDepthPickOnClick && info) {
      this._multiDepthPick(info.x, info.y);
    } else {
      console.log('onClick', info); // eslint-disable-line
      this.setState({clickedItem: info});
    }
  }

  _onPickObjects() {
    const {width, height} = this._getSize();
    const infos = this.refs.deckgl.pickObjects({x: 0, y: 0, width, height});
    console.log(infos); // eslint-disable-line
    this.setState({queriedItems: infos});
  }

  _multiDepthPick(x, y) {
    const infos = this.refs.deckgl.pickMultipleObjects({x, y});
    console.log(infos); // eslint-disable-line
    this.setState({queriedItems: infos});
  }

  _renderExampleLayer(example, settings, index) {
    const {layer: Layer, props, getData, initialize, isInitialized} = example;

    if (getData && !props.data) {
      props.data = getData();
    }

    if (initialize && !isInitialized) {
      initialize();
      example.isInitialized = true;
    }

    const layerProps = Object.assign({}, props, settings);
    Object.assign(layerProps, {
      modelMatrix: this._getModelMatrix(index, layerProps.coordinateSystem)
    });

    return new Layer(layerProps);
  }

  // Flatten layer props
  _getLayerSettings(props) {
    const settings = {};
    for (const key in props) {
      settings[key] = props[key];
    }
    return settings;
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
            activeExamples[exampleName] = this._getLayerSettings(layer.props);
          }

          layers.push(layer);
        }
      }
    }
    return layers;
  }
  /* eslint-enable max-depth */

  _getModelMatrix(index, coordinateSystem) {
    const {
      settings: {separation}
    } = this.state;
    const modelMatrix = new Matrix4().translate([0, 0, 5 * index * separation]);

    switch (coordinateSystem) {
      case COORDINATE_SYSTEM.METER_OFFSETS:
      case COORDINATE_SYSTEM.IDENTITY:
        const {
          settings: {rotationZ, rotationX}
        } = this.state;
        modelMatrix.rotateZ(index * rotationZ * Math.PI);
        modelMatrix.rotateX(index * rotationX * Math.PI);
        break;
      default:
      // Rotations don't work well for layers in lng lat coordinates
      // since the origin is far away.
      // We could rotate around current view point...
    }

    return modelMatrix;
  }

  _getViews() {
    const {
      settings: {infovis, multiview, orthographic}
    } = this.state;

    if (infovis) {
      return new OrbitView({
        id: 'infovis',
        controller: OrbitController
      });
    }

    if (multiview) {
      return [
        new FirstPersonView({id: 'first-person', height: '50%'}),
        new MapView({
          id: 'basemap',
          controller: MapController,
          y: '50%',
          height: '50%',
          orthographic
        })
      ];
    }
    return new MapView({id: 'basemap', controller: MapController, orthographic});
  }

  // Only show infovis layers in infovis mode and vice versa
  _layerFilter({layer}) {
    const {settings} = this.state;
    const isIdentity = layer.props.coordinateSystem === COORDINATE_SYSTEM.IDENTITY;
    return settings.infovis ? isIdentity : !isIdentity;
  }

  _renderMap() {
    const {orbitViewState, mapViewState, settings} = this.state;
    const {infovis, effects, pickingRadius, drawPickingColors, useDevicePixels} = settings;

    const views = this._getViews();

    return (
      <div style={{backgroundColor: '#eeeeee'}}>
        <DeckGL
          ref="deckgl"
          id="default-deckgl-overlay"
          layers={this._renderExamples()}
          layerFilter={this._layerFilter}
          views={views}
          viewState={infovis ? orbitViewState : {...mapViewState, position: [0, 0, 50]}}
          onViewStateChange={this._onViewStateChange}
          effects={effects ? this._effects : []}
          pickingRadius={pickingRadius}
          onHover={this._onHover}
          onClick={this._onClick}
          useDevicePixels={useDevicePixels}
          debug={true}
          drawPickingColors={drawPickingColors}
          ContextProvider={MapContext.Provider}
        >
          <View id="basemap">
            <StaticMap
              key="map"
              mapStyle="mapbox://styles/mapbox/light-v9"
              mapboxApiAccessToken={MapboxAccessToken || 'no_token'}
            />
            <ViewportLabel key="label">Map View</ViewportLabel>
          </View>

          <View id="first-person">
            <ViewportLabel>First Person View</ViewportLabel>
          </View>

          <View id="infovis">
            <ViewportLabel>Orbit View (PlotLayer only, No Navigation)</ViewportLabel>
          </View>

          <div style={NAVIGATION_CONTROL_STYLES}>
            <NavigationControl onViewStateChange={this._onViewStateChange} />
          </div>
        </DeckGL>
      </div>
    );
  }

  render() {
    const {settings, activeExamples, hoveredItem, clickedItem, queriedItems} = this.state;

    return (
      <div>
        {this._renderMap()}
        <div id="control-panel">
          <div style={{textAlign: 'center', padding: '5px 0 5px'}}>
            <button onClick={this._onPickObjects}>
              <b>Pick Objects</b>
            </button>
            <button
              onClick={() =>
                this.setState({enableDepthPickOnClick: !this.state.enableDepthPickOnClick})
              }
            >
              <b>Multi Depth Pick ({this.state.enableDepthPickOnClick ? 'ON' : 'OFF'})</b>
            </button>
          </div>
          <LayerControls
            title="Common Settings"
            settings={settings}
            onChange={this._onUpdateContainerSettings}
          />
          <LayerSelector
            activeExamples={activeExamples}
            examples={LAYER_CATEGORIES}
            onToggleLayer={this._onToggleLayer}
            onUpdateLayer={this._onUpdateLayerSettings}
          />
        </div>
        <LayerInfo
          ref="infoPanel"
          hovered={hoveredItem}
          clicked={clickedItem}
          queried={queriedItems}
        />
      </div>
    );
  }
}
