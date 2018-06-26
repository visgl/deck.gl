/* eslint-disable max-len */
/* global document, fetch, window */
import React, {Component} from 'react';
import {render} from 'react-dom';
import {StaticMap} from 'react-map-gl';
import DeckGL, {MapView, MapController, TextLayer} from 'deck.gl';
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

  _renderLayers() {
    const {data = DATA_URL, cluster = true, fontSize = 32} = this.props;

    return [
      cluster
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
          })
    ];
  }

  render() {
    const {
      onViewStateChange = this._onViewStateChange.bind(this),
      viewState = this.state.viewState
    } = this.props;

    return (
      <DeckGL
        layers={this._renderLayers()}
        views={new MapView({id: 'map'})}
        viewState={viewState}
        onViewStateChange={onViewStateChange}
        controller={MapController}
      >
        {!window.demoLauncherActive && (
          <StaticMap
            viewId="map"
            viewState={viewState}
            reuseMaps
            mapStyle={MAPBOX_STYLE}
            preventStyleDiffing={true}
            mapboxApiAccessToken={MAPBOX_TOKEN}
          />
        )}
      </DeckGL>
    );
  }
}

// NOTE: EXPORTS FOR DECK.GL WEBSITE DEMO LAUNCHER - CAN BE REMOVED IN APPS
export {App, INITIAL_VIEW_STATE};

if (!window.demoLauncherActive) {
  render(<App />, document.body.appendChild(document.createElement('div')));
}
