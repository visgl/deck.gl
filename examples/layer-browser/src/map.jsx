/* global window */

import React, {PureComponent} from 'react';
import {StaticMap, _MapContext as MapContext, NavigationControl} from 'react-map-gl';
import autobind from 'react-autobind';

import DeckGL from '@deck.gl/react';
import {COORDINATE_SYSTEM, View} from '@deck.gl/core';

import LayerInfo from './components/layer-info';
import {RenderMetrics} from './render-metrics';

const NAVIGATION_CONTROL_STYLES = {
  margin: 10,
  position: 'absolute'
};

const VIEW_LABEL_STYLES = {
  padding: 5,
  margin: 20,
  fontSize: 12,
  backgroundColor: '#282727',
  color: '#FFFFFF',
  position: 'absolute'
};

const INITIAL_VIEW_STATES = {
  basemap: {
    latitude: 37.752,
    longitude: -122.427,
    zoom: 11.5,
    pitch: 0,
    bearing: 0
  },
  infovis: {
    target: [0, 0, 0],
    zoom: 3,
    rotationX: -30,
    rotationOrbit: 30,
    orbitAxis: 'Y'
  }
};

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json';

const ViewportLabel = props => <div style={VIEW_LABEL_STYLES}>{props.children}</div>;

export default class Map extends PureComponent {
  constructor(props) {
    super(props);
    autobind(this);

    this.state = {
      hoveredItem: null,
      clickedItem: null,
      queriedItems: null,

      enableDepthPickOnClick: false,
      metrics: null
    };

    this.deckRef = React.createRef();
    this.cameraShakeHandle = null;
  }

  componentDidMount() {
    this.cameraShakeHandle = window.requestAnimationFrame(this._cameraShake);
  }

  componentWillUnmount() {
    window.cancelAnimationFrame(this.cameraShakeHandle);
  }

  pickObjects(opts) {
    if (this.deckRef.current) {
      const infos = this.deckRef.current.pickObjects(opts);
      console.log(infos); // eslint-disable-line
      this.setState({queriedItems: infos});
    }
  }

  pickMultipleObjects(opts) {
    if (this.deckRef.current) {
      const infos = this.deckRef.current.pickMultipleObjects(opts);
      console.log(infos); // eslint-disable-line
      this.setState({queriedItems: infos});
    }
  }

  _cameraShake() {
    this.cameraShakeHandle = window.requestAnimationFrame(this._cameraShake);
    if (this.deckRef.current && this.props.shakeCamera) {
      const deck = this.deckRef.current.deck;
      const viewState = deck.viewManager.getViewState();
      deck.setProps({
        viewState: Object.assign({}, viewState, {
          latitude: viewState.latitude + (Math.random() * 0.0002 - 0.0001),
          longitude: viewState.longitude + (Math.random() * 0.0002 - 0.0001)
        })
      });
    }
  }

  _onMetrics(metrics) {
    this.setState({metrics: Object.assign({}, metrics)});
  }

  _onHover(info) {
    this.setState({hoveredItem: info});
  }

  _onClick(info) {
    if (this.props.onClick) {
      this.props.onClick(info);
    } else {
      console.log('onClick', info); // eslint-disable-line
      this.setState({clickedItem: info});
    }
  }

  // Only show infovis layers in infovis mode and vice versa
  _layerFilter({layer, renderPass}) {
    const {settings} = this.props;
    const isIdentity = layer.props.coordinateSystem === COORDINATE_SYSTEM.CARTESIAN;
    return settings.infovis ? isIdentity : !isIdentity;
  }

  render() {
    const {hoveredItem, clickedItem, queriedItems} = this.state;
    const {
      layers,
      views,
      effects,
      settings: {pickingRadius, drawPickingColors, useDevicePixels}
    } = this.props;

    return (
      <div style={{backgroundColor: '#eeeeee'}}>
        <div style={{position: 'absolute', top: '10px', left: '100px', zIndex: 999}}>
          <RenderMetrics metrics={this.state.metrics} />
        </div>
        <DeckGL
          ref={this.deckRef}
          id="default-deckgl-overlay"
          layers={layers}
          layerFilter={this._layerFilter}
          views={views}
          initialViewState={INITIAL_VIEW_STATES}
          effects={effects}
          pickingRadius={pickingRadius}
          onHover={this._onHover}
          onClick={this._onClick}
          useDevicePixels={useDevicePixels}
          debug={true}
          drawPickingColors={drawPickingColors}
          ContextProvider={MapContext.Provider}
          _onMetrics={this._onMetrics}
        >
          <View id="basemap">
            <StaticMap key="map" mapStyle={MAP_STYLE} />
            <ViewportLabel key="label">Map View</ViewportLabel>
          </View>

          <View id="first-person">
            <ViewportLabel>First Person View</ViewportLabel>
          </View>

          <View id="infovis">
            <ViewportLabel>Orbit View (PlotLayer only, No Navigation)</ViewportLabel>
          </View>

          <div style={NAVIGATION_CONTROL_STYLES}>
            <NavigationControl />
          </div>

          <LayerInfo hovered={hoveredItem} clicked={clickedItem} queried={queriedItems} />
        </DeckGL>
      </div>
    );
  }
}
