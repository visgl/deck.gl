/* eslint-disable max-len */
/* global document, fetch, window */
import React, {Component} from 'react';
import {render} from 'react-dom';
import MapGL from 'react-map-gl';
import DeckGL, {MapView, TextLayer} from 'deck.gl';
import TagmapLayer from './tagmap-layer';

// Set your mapbox token here
const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line
// sample data
const DATA_URL = 'https://rivulet-zhang.github.io/dataRepo/tagmap/hashtags100k.json';
// mapbox style file path
const MAPBOX_STYLE =
  'https://rivulet-zhang.github.io/dataRepo/mapbox/style/map-style-dark-v9-no-labels.json';

const DEFAULT_COLOR = [29, 145, 192];

const INITIAL_VIEW_STATE = {
  latitude: 39.1,
  longitude: -94.57,
  zoom: 3.8,
  maxZoom: 16,
  pitch: 0,
  bearing: 0
};

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      viewState: INITIAL_VIEW_STATE
    };
    // set data in component state
    this._loadData();
  }

  componentDidMount() {
    window.addEventListener('resize', this._resize.bind(this));
    this._resize();
  }

  _resize() {
    const viewState = Object.assign(this.state.viewState, {
      width: window.innerWidth,
      height: window.innerHeight
    });
    this._onViewStateChange({viewState});
  }

  _onViewStateChange({viewState}) {
    this.setState({
      viewState: {...this.state.viewState, ...viewState}
    });
  }

  _loadData() {
    // remove high-frequency terms
    const excludeList = new Set(['#hiring', '#job', '#jobs', '#careerarc', '#career', '#photo']);

    fetch(DATA_URL)
      .then(resp => resp.json())
      .then(data => this.setState({data: data.filter(d => !excludeList.has(d.label))}));
  }

  render() {
    const {
      data = DATA_URL,
      cluster = true,
      fontSize = 32,

      onViewStateChange = this._onViewStateChange.bind(this),
      viewState = this.state.viewState,

      mapboxApiAccessToken = MAPBOX_TOKEN,
      mapStyle = MAPBOX_STYLE
    } = this.props;

    const layer = cluster
      ? new TagmapLayer({
          id: 'twitter-topics-tagmap',
          data,
          getLabel: x => x.label,
          getPosition: x => x.coordinates,
          minFontSize: 14,
          maxFontSize: fontSize * 2 - 14
        })
      : new TextLayer({
          id: 'twitter-topics-raw',
          data,
          getText: d => d.label,
          getPosition: x => x.coordinates,
          getColor: d => DEFAULT_COLOR,
          getSize: d => 20,
          sizeScale: fontSize / 20
        });

    return (
      <MapGL
        {...viewState}
        reuseMap
        onViewportChange={viewport => onViewStateChange({viewState: viewport})}
        mapboxApiAccessToken={mapboxApiAccessToken}
        mapStyle={mapStyle}
        preventStyleDiffing={true}
      >

        <DeckGL
          layers={[layer]}
          views={new MapView({id: 'map'})}
          viewState={viewState}
          />;

      </MapGL>
    );
  }
}

// NOTE: EXPORTS FOR DECK.GL WEBSITE DEMO LAUNCHER - CAN BE REMOVED IN APPS
export {App, INITIAL_VIEW_STATE};

if (!window.demoLauncherActive) {
  render(<App />, document.body.appendChild(document.createElement('div')));
}
