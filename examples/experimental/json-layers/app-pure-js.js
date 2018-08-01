// TODO - add alias for graph.gl: import {JSONDeck} from 'graph.gl';
import {JSONDeck} from '@deck.gl/experimental-layers';
import mapboxgl from 'mapbox-gl';

import {JSON_TEMPLATES, LAYER_CATALOG} from './constants';
const INITIAL_JSON = Object.values(JSON_TEMPLATES)[0];

import ACE from 'ace-builds';
console.log(`ACE editor: v${ACE.version}`); // eslint-disable-line

export const deckgl = new JSONDeck({
  canvas: 'deck-canvas',
  mapContainer: 'map',
  mapboxgl,
  layerCatalog: LAYER_CATALOG,
  json: INITIAL_JSON
});

//
// trigger extension
// ace.require("ace/ext/language_tools");
// this.editor = ACE.edit('editor');
// this.editor.session.setMode('ace/mode/json');
// this.editor.setTheme('ace/theme/tomorrow');
//

//
// enable autocompletion and snippets
// this.editor.setOptions({
//   // enableSnippets: true,
//   enableBasicAutocompletion: true,
//   enableLiveAutocompletion: false
// });
//
