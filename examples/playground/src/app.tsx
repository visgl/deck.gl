// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React, {Component, Fragment} from 'react';
import {createRoot} from 'react-dom/client';
import AutoSizer from 'react-virtualized-auto-sizer';
import {Map} from 'react-map-gl/maplibre';
import DeckWithMapLibre from './deck-with-maplibre';
import DeckWithGoogleMaps from './deck-with-google-maps';

import {FlyToInterpolator} from '@deck.gl/core';
import {JSONConverter, JSONConfiguration, _shallowEqualObjects} from '@deck.gl/json';
import JSON_CONVERTER_CONFIGURATION from './configuration';

import Editor from '@monaco-editor/react';

import JSON_TEMPLATES from '../json-examples';

const INITIAL_TEMPLATE = Object.keys(JSON_TEMPLATES)[0];

// Set your mapbox token here
const GOOGLE_MAPS_TOKEN = process.env.GoogleMapsAPIKey; // eslint-disable-line

function isFunctionObject(value) {
  return typeof value === 'object' && '@@function' in value;
}

function addUpdateTriggersForAccessors(json) {
  if (!json || !json.layers) return;

  for (const layer of json.layers) {
    const updateTriggers = {};
    for (const [key, value] of Object.entries(layer)) {
      if ((key.startsWith('get') && typeof value === 'string') || isFunctionObject(value)) {
        // it's an accessor and it's a string
        // we add the value of the accesor to update trigger to refresh when it changes
        updateTriggers[key] = value;
      }
    }
    if (Object.keys(updateTriggers).length) {
      layer.updateTriggers = updateTriggers;
    }
  }
}

export default class App extends Component {
  jsonConverter: JSONConverter;

  state = {
    // editor
    text: '',
    // deck.gl JSON Props
    jsonProps: {} as Record<string, unknown>,
    initialViewState: null as Record<string, any> | null
  };

  constructor(props) {
    super(props);

    // Configure and create the JSON converter instance
    const configuration = new JSONConfiguration(JSON_CONVERTER_CONFIGURATION);
    this.jsonConverter = new JSONConverter({configuration});
  }

  componentDidMount() {
    this._setTemplate(INITIAL_TEMPLATE);
  }

  // Updates deck.gl JSON props
  // Called on init, when template is changed, or user types
  _setTemplate(value) {
    const json = JSON_TEMPLATES[value];
    if (json) {
      // Triggers an editor change, which updates the JSON
      this._setEditorText(json);
      this._setJSON(json);
    }
  }

  _setJSON(json) {
    addUpdateTriggersForAccessors(json);
    const jsonProps = this.jsonConverter.convert(json);
    this._updateViewState(jsonProps);
    this.setState({jsonProps});
  }

  // Handle `json.initialViewState`
  // If we receive new JSON we need to decide if we should update current view state
  // Current heuristic is to compare with last `initialViewState` and only update if changed
  _updateViewState(json) {
    const initialViewState = json.initialViewState || json.viewState;
    if (initialViewState) {
      const updateViewState =
        !this.state.initialViewState ||
        !_shallowEqualObjects(initialViewState, this.state.initialViewState);

      if (updateViewState) {
        this.setState({
          initialViewState: {
            ...initialViewState,
            // Tells deck.gl to animate the camera move to the new tileset
            transitionDuration: 4000,
            transitionInterpolator: new FlyToInterpolator()
          }
        });
      }
    }
    return json;
  }

  // Updates pretty printed text in editor.
  // Called on init, when template is changed, or user types
  _setEditorText(json) {
    // Pretty print JSON with tab size 2
    const text = typeof json !== 'string' ? JSON.stringify(json, null, 2) : json;
    // console.log('setting text', text)
    this.setState({
      text
    });
  }

  _onTemplateChange(event) {
    const value = event && event.target && event.target.value;
    this._setTemplate(value);
  }

  _onEditorChange(value) {
    const text = value;
    let json = null;
    // Parse JSON, while capturing and ignoring exceptions
    try {
      json = text && JSON.parse(text);
    } catch (error) {
      // ignore error, user is editing and not yet correct JSON
    }
    this._setEditorText(text);
    this._setJSON(json);
  }

  _renderJsonSelector() {
    return (
      <select name="JSON templates" onChange={event => this._onTemplateChange(event)}>
        {Object.entries(JSON_TEMPLATES).map(([key]) => (
          <option key={key} value={key}>
            {key}
          </option>
        ))}
      </select>
    );
  }

  render() {
    const {jsonProps, initialViewState} = this.state;

    let deckMap;
    if (jsonProps.google === true) {
      deckMap = (
        <DeckWithGoogleMaps
          initialViewState={initialViewState}
          id="json-deck"
          {...jsonProps}
          googleMapsToken={GOOGLE_MAPS_TOKEN}
        />
      );
    } else {
      deckMap = (
        <DeckWithMapLibre
          id="json-deck"
          {...jsonProps}
          initialViewState={initialViewState}
          Map={Map}
        />
      );
    }

    return (
      <Fragment>
        {/* Left Pane: Monaco Editor and Template Selector */}
        <div id="left-pane">
          {this._renderJsonSelector()}

          <div id="editor">
            <AutoSizer>
              {({width, height}) => (
                <Editor
                  width={`${width}px`}
                  height={`${height}px`}
                  defaultLanguage="json"
                  theme="light"
                  value={this.state.text}
                  onChange={value => this._onEditorChange(value)}
                  options={{scrollBeyondLastLine: false}}
                />
              )}
            </AutoSizer>
          </div>
        </div>

        {/* Right Pane: DeckGL */}
        <div id="right-pane">{deckMap}</div>
      </Fragment>
    );
  }
}

export function renderToDOM(container) {
  createRoot(container).render(<App />);
}
