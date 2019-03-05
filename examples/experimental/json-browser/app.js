// @noflow
/* prettier-ingore-start */
/* global window */
import React, {Component} from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';

import DeckGL from '@deck.gl/react';
import {_JSONConverter as JSONConverter} from '@deck.gl/json';

import {StaticMap} from 'react-map-gl';

import AceEditor from 'react-ace';
import 'brace/mode/json';
import 'brace/theme/github';

import JSON_CONFIGURATION from './config/configuration';
import JSON_TEMPLATES from './config/templates';

const INITIAL_JSON = Object.values(JSON_TEMPLATES)[0];

// Set your mapbox token here
const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line
const MAPBOX_STYLESHEET = `https://api.tiles.mapbox.com/mapbox-gl-js/v0.47.0/mapbox-gl.css`;

const STYLES = {
  CONTAINER: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'stretch',
  },

  LEFT_PANE: {
    flex: '0 1 40%',
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
  },

  LEFT_PANE_SELECTOR: {
    flex: '0 0 34px',

    margin: 0,
    padding: '5px 35px 5px 5px',
    fontSize: 16,
    border: '1px solid #ccc',
    appearance: 'none',
  },

  LEFT_PANE_TEXT: {
    flex: '0 1 100%',
  },

  RIGHT_PANE: {
    flex: '0 1 60%',
    margin: 0,
  },
};

// Helper function to set mapbox stylesheet (avoids need for index.html just to set styles)
function setStyleSheet(url) {
  /* global document */
  document.body.style.margin = '0px';
  const styles = document.createElement('link');
  styles.type = 'text/css';
  styles.rel = 'stylesheet';
  styles.href = url;
  document.head.appendChild(styles);
}

export default class App extends Component {
  constructor(props) {
    super(props);

    setStyleSheet(MAPBOX_STYLESHEET);

    this.state = {
      // react-ace
      text: '',
      // deck.gl JSON Props
      jsonProps: {},
      // NOTE: viewState is re-initialized from jsonProps when those change,
      // but can be updated independently by the user "panning".
      viewState: null,
    };

    // TODO/ib - could use arrow functions
    // keeping like this for now to allow this code to be copied back to deck.gl
    this._onTemplateChange = this._onTemplateChange.bind(this);
    this._onEditorChange = this._onEditorChange.bind(this);

    this.jsonConverter = new JSONConverter({configuration: JSON_CONFIGURATION});
  }

  componentDidMount() {
    this._setEditorText(INITIAL_JSON);
    this._setJSON(INITIAL_JSON);
  }

  // Updates deck.gl JSON props
  // Called on init, when template is changed, or user types
  _setJSON(json) {
    const jsonProps = this.jsonConverter.convertJsonToDeckProps(json);
    this.setState({
      jsonProps,
      viewState: jsonProps.viewState,
    });
  }

  // Updates pretty printed text in editor.
  // Called on init, when template is changed, or user types
  _setEditorText(json) {
    // Pretty print JSON with tab size 2
    const text =
      typeof json !== 'string' ? JSON.stringify(json, null, 2) : json;
    // console.log('setting text', text)
    this.setState({
      text,
    });
  }

  _onTemplateChange(event) {
    const value = event && event.target && event.target.value;
    const json = JSON_TEMPLATES[value];
    if (json) {
      // Triggers an editor change, which updates the JSON
      this._setEditorText(json);
    }
  }

  _onEditorChange(text, event) {
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

  _onViewStateChange({viewState}) {
    // TODO - It would be cool to update the viewState here!
    this.setState({viewState});
  }

  _renderJsonSelector() {
    return (
      <select
        name="JSON templates"
        onChange={this._onTemplateChange}
        style={STYLES.LEFT_PANE_SELECTOR}
      >
        {Object.entries(JSON_TEMPLATES).map(([key]) => (
          <option key={key} value={key}>
            {key}
          </option>
        ))}
      </select>
    );
  }

  render() {
    const {jsonProps} = this.state;
    const viewState = this.state.viewState;

    return (
      <div style={STYLES.CONTAINER}>
        {/* Left Pane: Ace Editor and Template Selector */}
        <div id="left-pane" style={STYLES.LEFT_PANE}>
          {this._renderJsonSelector()}

          <div style={STYLES.LEFT_PANE_TEXT}>
            <AutoSizer>
              {({width, height}) => (
                <AceEditor
                  width={`${width}px`}
                  height={`${height}px`}
                  mode="json"
                  theme="github"
                  onChange={this._onEditorChange}
                  name="AceEditorDiv"
                  editorProps={{$blockScrolling: true}}
                  ref={instance => {
                    this.ace = instance;
                  }}
                  value={this.state.text}
                />
              )}
            </AutoSizer>
          </div>
        </div>

        {/* Right Pane: DeckGL */}
        <div id="right-pane" style={STYLES.RIGHT_PANE}>
          {Boolean(jsonProps.map) && (
            // TODO/ib/ib - can't get autosizer to work with react-map-gl
            // upgrade to react-map-gl 4 which has built in autosizer
            <StaticMap
              reuseMap
              {...jsonProps.map}
              style={{}}
              {...viewState}
              viewState={viewState}
              viewport={viewState}
              width={window.innerWidth * 0.6}
              height={window.innerHeight}
              mapboxApiAccessToken={MAPBOX_TOKEN}
            />
          )}

          <AutoSizer>
            {() => (
              <DeckGL
                id="json-deck"
                {...jsonProps}
                viewState={viewState}
                onViewStateChange={this._onViewStateChange.bind(this)}
              />
            )}
          </AutoSizer>
        </div>
      </div>
    );
  }
}
