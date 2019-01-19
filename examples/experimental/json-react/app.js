/* global window */
import React, {Component} from 'react';
import {render} from 'react-dom';

import AceEditor from 'react-ace';
import 'brace/mode/json';
import 'brace/theme/github';

import {StaticMap} from 'react-map-gl';

import DeckGL from '@deck.gl/react';

import {_JSONConverter as JSONConverter} from '@deck.gl/json';

import JSON_CONFIGURATION from '../json-common/configuration';
import JSON_TEMPLATES from '../json-common/templates';
const INITIAL_JSON = Object.values(JSON_TEMPLATES)[0];

// Set your mapbox token here
const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line
const MAPBOX_STYLESHEET = `https://api.tiles.mapbox.com/mapbox-gl-js/v0.47.0/mapbox-gl.css`;

const STYLES = {
  LEFT_PANE: {
    position: 'absolute',
    top: '0%',
    left: '0%',
    width: '40%',
    height: '100%',
    margin: 0
  },
  RIGHT_PANE: {
    position: 'absolute',
    top: '0%',
    left: '40%',
    width: '60%',
    height: '100%',
    margin: 0
  }
};

export default class Root extends Component {
  constructor(props) {
    super(props);

    setStyleSheet(MAPBOX_STYLESHEET);

    this.deckProps = {};
    this.state = {
      // react-ace
      text: '',
      // deck.gl
      deckProps: {}
    };

    this._onTemplateChange = this._onTemplateChange.bind(this);
    this._onEditorChange = this._onEditorChange.bind(this);

    this.jsonConverter = new JSONConverter({configuration: JSON_CONFIGURATION});
  }

  componentDidMount() {
    this._setEditorText(INITIAL_JSON);
    this._setJSON(INITIAL_JSON);
  }

  _setJSON(json, updateEditor = true) {
    const deckProps = this.jsonConverter.convertJsonToDeckProps(json);

    this.deckProps = deckProps; // test

    this.setState({
      deckProps,
      viewState: deckProps.viewState
    });
  }

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
    const json = JSON_TEMPLATES[value];
    this._setEditorText(json);
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
    this._setJSON(json, false);
  }

  _onViewStateChange({viewState}) {
    this.setState({viewState});
  }

  _renderJsonSelector() {
    return (
      <select
        name="JSON templates"
        onChange={this._onTemplateChange}
        style={{
          margin: 0,
          width: '100%',
          padding: '5px 35px 5px 5px',
          fontSize: 16,
          border: '1px solid #ccc',
          height: 34,
          appearance: 'none'
        }}
      >
        {Object.entries(JSON_TEMPLATES).map(([key, value]) => (
          <option key={key} value={key}>
            {key}
          </option>
        ))}
      </select>
    );
  }

  render() {
    const {deckProps} = this.state;
    const viewState = this.state.viewState || this.deckProps.viewState;

    return (
      <div style={{width: '100%', height:'100%'}}>

        {/* Left Pane: Ace Editor and Template Selector */}
        <div id='left-pane' style={STYLES.LEFT_PANE}>

          {this._renderJsonSelector()}

          <AceEditor
            width="100%"
            height="100%"
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

        </div>

        {/* Right Pane: DeckGL */}
        <div id='right-pane' style={STYLES.RIGHT_PANE}>

          {Boolean(deckProps.map) && (
            <StaticMap
              reuseMap
              {...deckProps.map}
              {...viewState}
              viewState={viewState}
              viewport={viewState}
              width={window.innerWidth * 0.6}
              height={window.innerHeight}
              mapboxApiAccessToken={MAPBOX_TOKEN}
            />
          )}

          <DeckGL
            id="json-deck"
            {...deckProps}
            viewState={viewState}
            onViewStateChange={this._onViewStateChange.bind(this)}
          />
        </div>

      </div>
    );
  }
}

/* global document */
render(<Root />, document.body.appendChild(document.createElement('div')));

function setStyleSheet(url, keepMargin = false) {
  // Make sure we don't break under Node.js
  if (typeof document === 'undefined') {
    return;
  }

  if (!keepMargin) {
    document.body.style.margin = '0px';
  }
  /* global document */
  const styles = document.createElement('link');
  styles.type = 'text/css';
  styles.rel = 'stylesheet';
  styles.href = url;
  document.head.appendChild(styles);
}
