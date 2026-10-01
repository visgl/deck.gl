// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React, {useEffect, useRef, useState} from 'react';
import {createRoot} from 'react-dom/client';
import styled, {createGlobalStyle} from 'styled-components';
import AutoSizer from 'react-virtualized-auto-sizer';
import DeckWithMapLibre from './deck-with-maplibre';
import DeckWithGoogleMaps from './deck-with-google-maps';

import {FlyToInterpolator} from '@deck.gl/core';
import {JSONConverter, JSONConfiguration, _shallowEqualObjects} from '@deck.gl/json';
import JSON_CONVERTER_CONFIGURATION from './configuration';

import Editor, {type Monaco} from '@monaco-editor/react';

import JSON_TEMPLATES from '../json-examples';

const INITIAL_TEMPLATE = Object.keys(JSON_TEMPLATES)[0];

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    font-family: sans-serif;
    overflow: hidden;
  }

  #app {
    width: 100vw;
    height: 100vh;
  }
`;

const AppLayout = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  align-items: stretch;
`;

const LeftPane = styled.div`
  flex: 0 1 40%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

const TemplateSelect = styled.select`
  flex: 0 0 34px;
  padding: 5px 35px 5px 5px;
  font-size: 16px;
  border: 1px solid #ccc;
  appearance: none;
`;

const EditorPane = styled.div`
  flex: 0 1 100%;
`;

const RightPane = styled.div`
  flex: 0 1 60%;
  position: relative;
`;

// Set your mapbox token here
const GOOGLE_MAPS_TOKEN = process.env.GoogleMapsAPIKey; // eslint-disable-line
const EDITOR_PATH = 'file:///deck-playground.json';

function configureJsonSchema(monaco: Monaco, schemaUri: string, schema: unknown) {
  monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
    validate: true,
    schemas: [
      {
        uri: schemaUri,
        fileMatch: [EDITOR_PATH],
        schema
      }
    ]
  });
}

function isFunctionObject(value: any): boolean {
  return typeof value === 'object' && '@@function' in value;
}

function addUpdateTriggersForAccessors(json: any) {
  if (!json || !json.layers) return;

  for (const layer of json.layers) {
    const updateTriggers: Record<string, any> = {};
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

function getUpdatedViewState(json: any, previousViewState: any) {
  const initialViewState = json.initialViewState || json.viewState;
  if (!initialViewState) {
    return previousViewState;
  }

  const updateViewState =
    !previousViewState || !_shallowEqualObjects(initialViewState, previousViewState);

  if (!updateViewState) {
    return previousViewState;
  }

  return {
    ...initialViewState,
    // Tells deck.gl to animate the camera move to the new tileset
    transitionDuration: 4000,
    transitionInterpolator: new FlyToInterpolator()
  };
}

export type AppProps = {
  schemaUrl?: string;
};

export default function App({schemaUrl = '/schema.generated.json'}: AppProps) {
  const [text, setText] = useState('');
  const [jsonProps, setJsonProps] = useState<any>({});
  const [initialViewState, setInitialViewState] = useState<Record<string, any> | null>(null);
  const [schema, setSchema] = useState<unknown>(null);
  const [schemaReady, setSchemaReady] = useState(false);
  const jsonConverterRef = useRef<JSONConverter>(null);
  const schemaUriRef = useRef('');

  if (!jsonConverterRef.current) {
    const configuration = new JSONConfiguration(JSON_CONVERTER_CONFIGURATION);
    jsonConverterRef.current = new JSONConverter({configuration});
  }

  function setEditorText(json: any) {
    // Pretty print JSON with tab size 2
    const nextText = typeof json !== 'string' ? JSON.stringify(json, null, 2) : json;
    setText(nextText);
  }

  function setJSON(json: any) {
    addUpdateTriggersForAccessors(json);
    const nextJsonProps = jsonConverterRef.current!.convert(json);
    setInitialViewState(previousViewState => getUpdatedViewState(nextJsonProps, previousViewState));
    setJsonProps(nextJsonProps);
  }

  // Updates deck.gl JSON props
  // Called on init, when template is changed, or user types
  function setTemplate(value: string) {
    const json = JSON_TEMPLATES[value];
    if (json) {
      // Triggers an editor change, which updates the JSON
      setEditorText(json);
      setJSON(json);
    }
  }

  function onTemplateChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const value = event && event.target && event.target.value;
    setTemplate(value);
  }

  function onEditorChange(value: string | undefined) {
    const nextText = value;
    let json = null;
    // Parse JSON, while capturing and ignoring exceptions
    try {
      json = nextText && JSON.parse(nextText);
    } catch (error) {
      // ignore error, user is editing and not yet correct JSON
    }
    setEditorText(nextText);
    setJSON(json);
  }

  function onEditorWillMount(monaco: Monaco) {
    if (schema) {
      configureJsonSchema(monaco, schemaUriRef.current, schema);
    }
  }

  useEffect(() => {
    setTemplate(INITIAL_TEMPLATE);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const schemaUri = new URL(schemaUrl, window.location.href).toString();
    schemaUriRef.current = schemaUri;

    fetch(schemaUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to load schema from ${schemaUrl}: ${response.status}`);
        }
        return response.json();
      })
      .then(nextSchema => {
        if (!cancelled) {
          setSchema(nextSchema);
          setSchemaReady(true);
        }
      })
      .catch(error => {
        // eslint-disable-next-line no-console
        console.error(error);
        if (!cancelled) {
          setSchemaReady(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [schemaUrl]);

  const deckMap =
    jsonProps.google === true ? (
      <DeckWithGoogleMaps
        initialViewState={initialViewState}
        id="json-deck"
        {...jsonProps}
        googleMapsToken={GOOGLE_MAPS_TOKEN}
      />
    ) : (
      <DeckWithMapLibre
        id="json-deck"
        {...jsonProps}
        initialViewState={initialViewState}
        Map={Map}
      />
    );

  return (
    <>
      <GlobalStyle />
      <AppLayout>
        {/* Left Pane: Monaco Editor and Template Selector */}
        <LeftPane>
          <TemplateSelect name="JSON templates" onChange={onTemplateChange}>
            {Object.entries(JSON_TEMPLATES).map(([key]) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </TemplateSelect>

          <EditorPane>
            <AutoSizer>
              {({width, height}) =>
                schemaReady && (
                  <Editor
                    width={`${width}px`}
                    height={`${height}px`}
                    defaultLanguage="json"
                    path={EDITOR_PATH}
                    beforeMount={onEditorWillMount}
                    theme="light"
                    value={text}
                    onChange={value => onEditorChange(value)}
                    options={{scrollBeyondLastLine: false}}
                  />
                )
              }
            </AutoSizer>
          </EditorPane>
        </LeftPane>

        {/* Right Pane: DeckGL */}
        <RightPane>{deckMap}</RightPane>
      </AppLayout>
    </>
  );
}

export function renderToDOM(container: HTMLElement) {
  createRoot(container).render(<App />);
}
