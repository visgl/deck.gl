/* eslint-disable max-len */
import React from 'react';
import {render} from 'react-dom';
import {StaticMap} from 'react-map-gl';
import DeckGL from '@deck.gl/react';
import {TextLayer} from '@deck.gl/layers';
import TagmapLayer from './tagmap-layer';

// sample data
const DATA_URL = 'https://rivulet-zhang.github.io/dataRepo/tagmap/hashtags10k.json';

const DEFAULT_COLOR = [29, 145, 192];

const INITIAL_VIEW_STATE = {
  latitude: 39.1,
  longitude: -94.57,
  zoom: 3.8,
  maxZoom: 16,
  pitch: 0,
  bearing: 0
};

const MAP_STYLE =
  'https://gist.githubusercontent.com/Josmorsot/36354c7fe0e847a559affde83ba36889/raw/6846e70b77c655f516965623d4620505491ad43e/dark-matter-no-labels.json';

export default function App({
  data = DATA_URL,
  cluster = true,
  fontSize = 32,
  mapStyle = MAP_STYLE
}) {
  const textLayer = cluster
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
    <DeckGL
      layers={[textLayer]}
      initialViewState={INITIAL_VIEW_STATE}
      controller={{dragRotate: false}}
    >
      <StaticMap reuseMaps mapStyle={mapStyle} preventStyleDiffing={true} />
    </DeckGL>
  );
}

export function renderToDOM(container) {
  render(<App />, container);
}
