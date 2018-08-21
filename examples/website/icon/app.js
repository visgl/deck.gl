import React, {Component} from 'react';
import {render} from 'react-dom';
import {StaticMap} from 'react-map-gl';
import DeckGL, {IconLayer} from 'deck.gl';

import IconClusterLayer from './icon-cluster-layer';

// Set your mapbox token here
const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line

// Source data CSV
const DATA_URL =
  'https://raw.githubusercontent.com/uber-common/deck.gl-data/master/examples/icon/meteorites.json'; // eslint-disable-line

export const INITIAL_VIEW_STATE = {
  longitude: -35,
  latitude: 36.7,
  zoom: 1.8,
  maxZoom: 20,
  pitch: 0,
  bearing: 0
};

const stopPropagation = evt => evt.stopPropagation();

/* eslint-disable react/no-deprecated */
export class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      x: 0,
      y: 0,
      hoveredItems: null,
      expanded: false
    };
    this._onHover = this._onHover.bind(this);
    this._onClick = this._onClick.bind(this);
    this._closePopup = this._closePopup.bind(this);
    this._renderhoveredItems = this._renderhoveredItems.bind(this);
  }

  _onHover(info) {
    if (this.state.expanded) {
      return;
    }

    const {x, y, object} = info;
    const z = info.layer.state.z;
    const {showCluster = true} = this.props;

    let hoveredItems = null;

    if (object) {
      if (showCluster) {
        hoveredItems = object.zoomLevels[z].points.sort((m1, m2) => m1.year - m2.year);
      } else {
        hoveredItems = [object];
      }
    }

    this.setState({x, y, hoveredItems, expanded: false});
  }

  _onClick() {
    this.setState({expanded: true});
  }

  _onPopupLoad(ref) {
    if (ref) {
      // React events are triggered after native events
      ref.addEventListener('wheel', stopPropagation);
    }
  }

  _closePopup() {
    this.setState({expanded: false, hoveredItems: null});
  }

  _renderhoveredItems() {
    const {x, y, hoveredItems, expanded} = this.state;

    if (!hoveredItems) {
      return null;
    }

    if (expanded) {
      return (
        <div
          className="tooltip interactive"
          ref={this._onPopupLoad}
          style={{left: x, top: y}}
          onMouseLeave={this._closePopup}
        >
          {hoveredItems.map(({name, year, mass, class: meteorClass}) => {
            return (
              <div key={name}>
                <h5>{name}</h5>
                <div>Year: {year || 'unknown'}</div>
                <div>Class: {meteorClass}</div>
                <div>Mass: {mass}g</div>
              </div>
            );
          })}
        </div>
      );
    }

    return (
      <div className="tooltip" style={{left: x, top: y}}>
        {hoveredItems.slice(0, 20).map(({name, year}) => (
          <div key={name}>
            <h5>
              {name} {year ? `(${year})` : ''}
            </h5>
          </div>
        ))}
      </div>
    );
  }

  _renderLayers() {
    const {
      data = DATA_URL,
      iconMapping = 'data/location-icon-mapping.json',
      iconAtlas = 'data/location-icon-atlas.png',
      showCluster = true,
      viewState
    } = this.props;

    const layerProps = {
      data,
      pickable: true,
      wrapLongitude: true,
      getPosition: d => d.coordinates,
      iconAtlas,
      iconMapping,
      onHover: this._onHover,
      onClick: this._onClick,
      sizeScale: 60
    };

    const size = viewState ? Math.min(Math.pow(1.5, viewState.zoom - 10), 1) : 0.1;

    const layer = showCluster
      ? new IconClusterLayer({...layerProps, id: 'icon-cluster'})
      : new IconLayer({
          ...layerProps,
          id: 'icon',
          getIcon: d => 'marker',
          getSize: size
        });

    return [layer];
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
            mapStyle="mapbox://styles/mapbox/dark-v9"
            preventStyleDiffing={true}
            mapboxApiAccessToken={MAPBOX_TOKEN}
          />
        )}

        {this._renderhoveredItems}
      </DeckGL>
    );
  }
}

export function renderToDOM(container) {
  render(<App />, container);
}
