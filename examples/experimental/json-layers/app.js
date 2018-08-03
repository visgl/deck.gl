import React, {Component} from 'react';
import {render} from 'react-dom';

import {JSONDeck} from '@deck.gl/json';

import AceEditor from 'react-ace';
import 'brace/mode/json';
import 'brace/theme/github';

import {JSON_TEMPLATES, LAYER_CATALOG} from './constants';
const INITIAL_JSON = Object.values(JSON_TEMPLATES)[0];

export default class Root extends Component {
  constructor(props) {
    super(props);
    this._onTemplateChange = this._onTemplateChange.bind(this);
    this._onEditorChange = this._onEditorChange.bind(this);
  }

  componentDidMount() {
    const json = INITIAL_JSON;

    this.jsonDeck = new JSONDeck({
      canvas: 'deck-canvas',
      layerCatalog: LAYER_CATALOG,
      json
    });

    this._setEditorText(json);
  }

  componentWillUnmount() {
    if (this.jsonDeck) {
      this.jsonDeck.finalize();
      this.jsonDeck = null;
    }
  }

  _setEditorText(json) {
    if (this.ace) {
      // Pretty print JSON with tab size 2
      const text = JSON.stringify(json, null, 2);
      this.ace.editor.setValue(text);
    }
  }

  _renderJsonSelector() {
    return (
      <select name="JSON templates" onChange={this._onTemplateChange}>
        {Object.entries(JSON_TEMPLATES).map(([key, value]) => (
          <option key={key} value={key}>
            {key}
          </option>
        ))}
      </select>
    );
  }

  _onTemplateChange(event) {
    const value = event && event.target && event.target.value;
    const json = JSON_TEMPLATES[value];
    if (json) {
      // NOTE: setting value triggers onEditorChange, which calls this.jsonDeck.setProps({json});
      this._setEditorText(json);
    }
  }

  _onEditorChange(text, event) {
    let json = null;
    // Parse JSON, while capturing and ignoring exceptions
    try {
      json = text && JSON.parse(text);
    } catch (error) {
      // ignore error
    }
    if (json) {
      this.jsonDeck.setProps({json});
    }
  }

  render() {
    return (
      <div>
        <div>
          <div style={{position: 'absolute', width: '100%', height: '100%', margin: 0}}>
            <div
              id="map"
              style={{position: 'absolute', width: '100%', height: '100%', margin: 0}}
            />
            <canvas
              id="deck-canvas"
              style={{position: 'absolute', width: '100%', height: '100%', margin: 0}}
            />
          </div>
          <div style={{position: 'absolute', top: '5%', width: '40%', left: '55%', margin: 0}}>
            {this._renderJsonSelector()}
            <AceEditor
              mode="json"
              theme="github"
              onChange={this._onEditorChange}
              name="UNIQUE_ID_OF_DIV"
              editorProps={{$blockScrolling: true}}
              ref={instance => {
                this.ace = instance;
              }} // Let's put things into scope
            />
          </div>
        </div>
      </div>
    );
  }
}

/* global document */
render(<Root />, document.body.appendChild(document.createElement('div')));
