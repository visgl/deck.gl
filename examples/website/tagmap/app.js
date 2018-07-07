/* eslint-disable max-len */
import React, {Component} from 'react';
import {render} from 'react-dom';
import {StaticMap} from 'react-map-gl';
import DeckGL, {TextLayer} from 'deck.gl';
import TagmapLayer from './tagmap-layer';

// Set your mapbox token here
const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line
// sample data
const DATA_URL = 'https://rivulet-zhang.github.io/dataRepo/tagmap/hashtags10k.json';
// mapbox style file path
const MAPBOX_STYLE =
  'https://rivulet-zhang.github.io/dataRepo/mapbox/style/map-style-dark-v9-no-labels.json';

const DEFAULT_COLOR = [29, 145, 192];

export const INITIAL_VIEW_STATE = {
  latitude: 39.1,
  longitude: -94.57,
  zoom: 3.8,
  maxZoom: 16,
  pitch: 0,
  bearing: 0
};

export class App extends Component {
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
            mapStyle={MAPBOX_STYLE}
            preventStyleDiffing={true}
            mapboxApiAccessToken={MAPBOX_TOKEN}
          />
        )}
      </DeckGL>
    );
  }
}

export function renderToDOM(container) {
  render(<App />, container);
}
