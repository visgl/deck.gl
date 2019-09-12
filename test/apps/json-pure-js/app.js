/* global mapboxgl */
// import mapboxgl from 'mapbox-gl';

/* global ace */
// import ace from 'ace-builds';
// import 'ace-builds/webpack-resolver';

/* global window */
import {Deck} from '@deck.gl/core';
import {JSONConverter} from '@deck.gl/json';
// import positionChildrenUnderViews from './children';

import JSON_TEMPLATES from '../json-common/templates';
import JSON_CONFIGURATION from '../json-common/configuration';
const INITIAL_JSON = Object.values(JSON_TEMPLATES)[0];

mapboxgl.accessToken = mapboxgl.accessToken || process.env.MapboxAccessToken; // eslint-disable-line

console.log(`ace editor: v${ace.version}`); // eslint-disable-line
ace.require('ace/ext/language_tools');

// DECK

// Creating the deck object starts the application
let deck = null;
let editor = null;
let map = null;

const oldOnload = window.onload;

document.addEventListener('DOMContentLoaded', event => initializeApp());

function initializeApp() {
  // WORKAROUND: only one onload is fired, leaving other callers in limbo
  if (oldOnload) {
    oldOnload();
  }

  installStyleSheet(`https://api.tiles.mapbox.com/mapbox-gl-js/v${mapboxgl.version}/mapbox-gl.css`);

  // EDITOR

  editor = ace.edit('editor');
  editor.session.setMode('ace/mode/json');
  editor.setTheme('ace/theme/tomorrow');

  // enable autocompletion and snippets
  editor.setOptions({
    // enableSnippets: true,
    enableBasicAutocompletion: true,
    enableLiveAutocompletion: false
  });

  editor.on('change', _onEditorChange);

  // MAP

  map = new mapboxgl.Map({
    container: 'map',
    interactive: false,
    style: 'mapbox://styles/mapbox/light-v9'
  });

  // DROPDOWN

  const selectList = document.getElementById('templates');
  for (const template in JSON_TEMPLATES) {
    const option = document.createElement('option');
    option.value = template;
    option.text = template;
    selectList.appendChild(option);
  }
  selectList.onchange = _onTemplateChange;

  // DECK

  deck = new Deck({
    onViewStateChange: _onViewStateChange,
    canvas: 'deck-canvas'
  });

  // SET INITIAL TEMPLATE

  setJSON(INITIAL_JSON);
}

const jsonConverter = new JSONConverter({configuration: JSON_CONFIGURATION});

function setJSON(json, updateEditor = true) {
  const deckProps = jsonConverter.convert(json);
  deck.setProps(deckProps);
  setMapProps(deckProps);
  map._container.style.visibility = deckProps.map ? 'visible' : 'hidden';
  if (updateEditor) {
    setEditorText(json);
  }
}

function setEditorText(json) {
  // Pretty print JSON with tab size 2
  const text = JSON.stringify(json, null, 2);
  editor.setValue(text, 0);
}

function _onTemplateChange(event) {
  const value = event && event.target && event.target.value;
  const json = JSON_TEMPLATES[value];
  setJSON(json);
}

function _onEditorChange(event) {
  let json = null;
  // Parse JSON, while capturing and ignoring exceptions
  try {
    const text = editor.getValue();
    json = text && JSON.parse(text);
  } catch (error) {
    // ignore error
  }
  setJSON(json, false);
}

function _onViewStateChange({viewState}) {
  deck.setProps({viewState});
  setMapProps({viewState});
}

function setMapProps(props) {
  // Makes sure only geospatial (lng/lat) view states are set
  if ('viewState' in props && props.viewState.longitude && props.viewState.latitude) {
    const {viewState} = props;
    map.jumpTo({
      center: [viewState.longitude, viewState.latitude],
      zoom: viewState.zoom || 10,
      bearing: viewState.bearing || 0,
      pitch: viewState.pitch || 0
    });
  }

  if (props.map && 'style' in props.map) {
    if (props.map.style !== map.deckStyle) {
      map.setStyle(props.map.style);
      map.deckStyle = props.map.style;
    }
  }
}

// HELPERS

function installStyleSheet(url) {
  /* global document */
  const styles = document.createElement('link');
  styles.type = 'text/css';
  styles.rel = 'stylesheet';
  styles.href = url;
  document.head.appendChild(styles);

  document.body.style.margin = '0px';
}
