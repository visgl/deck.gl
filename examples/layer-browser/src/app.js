/* global window, document */

// deck.gl ES6 components
import {COORDINATE_SYSTEM, WebMercatorViewport, experimental} from 'deck.gl';

const {MapState, OrbitState, FirstPersonViewport, OrbitViewport, ReflectionEffect} = experimental;

// deck.gl react components
import DeckGL from 'deck.gl';

import React, {PureComponent} from 'react';
import ReactDOM from 'react-dom';
import autobind from 'react-autobind';

import {StaticMap} from 'react-map-gl';
import FPSStats from 'react-stats-zavatta';

import {Matrix4} from 'math.gl';

import LayerInfo from './components/layer-info';
import LayerSelector from './components/layer-selector';
import LayerControls from './components/layer-controls';

import LAYER_CATEGORIES from './examples';
import {setImmutableDataSamples} from './immutable-data-samples';

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

const ViewportLabel = props => (
  <div style={{position: 'absolute'}}>
    <div style={{...VIEW_LABEL_STYLES, display: ''}}>{props.children}</div>
  </div>
);

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
        infovis: false,
        multiview: false,
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

  _onPickObjects() {
    const {width, height} = this.state;
    const infos = this.refs.deckgl.pickObjects({x: 0, y: 0, width, height});
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
    const {settings: {separation}} = this.state;
    const modelMatrix = new Matrix4().translate([0, 0, 1000 * index * separation]);

    switch (coordinateSystem) {
      case COORDINATE_SYSTEM.METER_OFFSETS:
      case COORDINATE_SYSTEM.IDENTITY:
        const {settings: {rotationZ, rotationX}} = this.state;
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

  _getViewports() {
    const {
      width,
      height,
      mapViewState,
      orbitViewState,
      settings: {infovis, multiview}
    } = this.state;

    if (infovis) {
      return [
        new OrbitViewport({
          id: 'infovis',
          ...orbitViewState,
          width,
          height
        })
      ];
    }

    return [
      new WebMercatorViewport({
        id: 'basemap',
        ...mapViewState,
        width,
        height: multiview ? height / 2 : height,
        y: multiview ? height / 2 : 0
      }),
      multiview &&
        new FirstPersonViewport({
          id: 'first-person',
          ...mapViewState,
          width,
          height: height / 2,
          position: [0, 0, 50]
        })
    ];
  }

  // Only show infovis layers in infovis mode and vice versa
  _layerFilter({layer}) {
    const {settings} = this.state;
    const isIdentity = layer.props.coordinateSystem === COORDINATE_SYSTEM.IDENTITY;
    return settings.infovis ? isIdentity : !isIdentity;
  }

  _renderMap() {
    const {width, height, orbitViewState, mapViewState, settings} = this.state;
    const {infovis, effects, pickingRadius, drawPickingColors, useDevicePixels} = settings;

    const viewports = this._getViewports();

    return (
      <div style={{backgroundColor: '#eeeeee'}}>
        <DeckGL
          viewportState={infovis ? OrbitState : MapState}
          {...(infovis ? orbitViewState : mapViewState)}
          onViewportChange={this._onViewportChange}
          ref="deckgl"
          id="default-deckgl-overlay"
          width={width}
          height={height}
          viewports={viewports}
          layers={this._renderExamples()}
          layerFilter={this._layerFilter}
          effects={effects ? this._effects : []}
          pickingRadius={pickingRadius}
          onLayerHover={this._onHover}
          onLayerClick={this._onClick}
          useDevicePixels={useDevicePixels}
          debug={false}
          drawPickingColors={drawPickingColors}
        >
          <FPSStats isActive />

          <StaticMap
            viewportId="basemap"
            {...mapViewState}
            mapboxApiAccessToken={MapboxAccessToken || 'no_token'}
            width={width}
            height={height}
            onViewportChange={this._onViewportChange}
          />

          <ViewportLabel viewportId="first-person">First Person View</ViewportLabel>

          <ViewportLabel viewportId="basemap">Map View</ViewportLabel>

          <ViewportLabel viewportId="infovis">
            Orbit View (PlotLayer only, No Navigation)
          </ViewportLabel>
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

// ---- Main ---- //

const container = document.createElement('div');
document.body.appendChild(container);
ReactDOM.render(<App />, container);
