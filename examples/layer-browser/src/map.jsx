// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* global window */

import React, {PureComponent} from 'react';
import {Map, useControl} from 'react-map-gl/maplibre';
import {MapboxOverlay} from '@deck.gl/mapbox';
import autobind from 'react-autobind';

import {DeckGL} from '@deck.gl/react';
import {COORDINATE_SYSTEM, View} from '@deck.gl/core';

import LayerInfo from './components/layer-info';
import {RenderMetrics} from './render-metrics';

import 'maplibre-gl/dist/maplibre-gl.css';

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

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

const ViewportLabel = props => <div style={VIEW_LABEL_STYLES}>{props.children}</div>;

function DeckGLOverlay(props) {
  const overlay = useControl(() => new MapboxOverlay(props));
  overlay.setProps(props);
  return null;
}

export default class DeckMap extends PureComponent {
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
      settings: {pickingRadius, drawPickingColors, useDevicePixels, interleaved}
    } = this.props;

    return (
      <div style={{backgroundColor: '#eeeeee', height: '100vh', width: '100vw'}}>
        <div style={{position: 'absolute', top: '10px', left: '100px', zIndex: 999}}>
          <RenderMetrics metrics={this.state.metrics} />
        </div>
        <Map
          key={`map-${interleaved}`}
          mapStyle={MAP_STYLE}
          initialViewState={INITIAL_VIEW_STATES.basemap}
        >
          <DeckGLOverlay
            layers={layers.map(l => l.clone({beforeId: 'watername_ocean'}))}
            initialViewState={INITIAL_VIEW_STATES}
            layerFilter={this._layerFilter}
            {...(!interleaved && {views})}
            effects={effects}
            pickingRadius={pickingRadius}
            onHover={this._onHover}
            onClick={this._onClick}
            useDevicePixels={useDevicePixels}
            debug={true}
            drawPickingColors={drawPickingColors}
            _onMetrics={this._onMetrics}
            interleaved={interleaved}
          />
          <LayerInfo hovered={hoveredItem} clicked={clickedItem} queried={queriedItems} />
        </Map>
      </div>
    );
  }
}
