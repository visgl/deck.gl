// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import * as React from 'react';
import {useEffect, useRef, useState} from 'react';
import {createRoot} from 'react-dom/client';
import AutoSizer from 'react-virtualized-auto-sizer';
import Editor from '@monaco-editor/react';
import {PlayIcon, SpinnerIcon} from './icons';
import {FileDrop, type FileDropHandle} from './file-drop';
import {pyodide, type PreloadedFileConfig, type WorkerStatus} from './pyodide';

const DEFAULT_SAMPLE = `\
import pydeck
import pandas as pd

UK_ACCIDENTS_DATA = pd.read_csv(uploaded_files["heatmap-data.csv"])

layer = pydeck.Layer(
    'HexagonLayer',
    UK_ACCIDENTS_DATA,
    get_position=['lng', 'lat'],
    auto_highlight=True,
    elevation_scale=50,
    pickable=True,
    elevation_range=[0, 3000],
    extruded=True,
    coverage=1)

# Set the viewport location
view_state = pydeck.ViewState(
    longitude=-1.415,
    latitude=52.2323,
    zoom=6,
    min_zoom=5,
    max_zoom=15,
    pitch=40.5,
    bearing=-27.36)

# Combined all of it and render a viewport
r = pydeck.Deck(layers=[layer], initial_view_state=view_state)
r.to_html(as_string=True)
`;

const PRELOADED_FILES: PreloadedFileConfig[] = [
  {
    name: 'heatmap-data.csv',
    url: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/3d-heatmap/heatmap-data.csv'
  }
];

type AppStatus = WorkerStatus | 'Loading files...' | null;

export function App({preloadedFiles}: {preloadedFiles?: PreloadedFileConfig[]}) {
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const errorZoneRef = useRef<string | null>(null);
  const fileDropRef = useRef<FileDropHandle>(null);
  const [output, setOutput] = useState({content: 'Loading Python...', isHtml: false});
  const [status, setStatus] = useState<AppStatus>('Loading packages...');

  const setRenderedOutput = (value: unknown) => {
    const content = String(value);
    const isHtml = content.startsWith('<!DOCTYPE html>');

    setOutput({content, isHtml});
  };

  const clearErrorWidget = () => {
    if (!editorRef.current || !errorZoneRef.current) {
      return;
    }

    editorRef.current.changeViewZones(accessor => {
      accessor.removeZone(errorZoneRef.current);
    });
    errorZoneRef.current = null;
  };

  const showErrorWidget = (lineNumber: number, message: string) => {
    if (!editorRef.current || !monacoRef.current) {
      return;
    }

    clearErrorWidget();

    const domNode = document.createElement('div');
    domNode.className = 'inline-error';
    const contentNode = document.createElement('div');
    domNode.append(contentNode);
    contentNode.textContent = message;

    editorRef.current.changeViewZones(accessor => {
      errorZoneRef.current = accessor.addZone({
        afterLineNumber: lineNumber,
        domNode,
        heightInLines: message.split('\n').length + 1
      });
    });
    editorRef.current.revealLineInCenter(lineNumber);
  };

  useEffect(() => {
    let cancelled = false;

    pyodide
      .getVersion()
      .then(result => {
        if (!cancelled) {
          setRenderedOutput(result);
        }
      })
      .catch(error => {
        if (!cancelled) {
          setRenderedOutput(error instanceof Error ? error.message : String(error));
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    pyodide.ready
      .then(() => {
        if (!cancelled) {
          setStatus(currentStatus =>
            currentStatus === 'Loading packages...' ? null : currentStatus
          );
        }
      })
      .catch(error => {
        if (!cancelled) {
          setRenderedOutput(error instanceof Error ? error.message : String(error));
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const runCode = async () => {
    const source = editorRef.current?.getValue() ?? '';
    clearErrorWidget();

    if (status) {
      return;
    }

    try {
      if (fileDropRef.current?.isLoading) {
        setStatus('Loading files...');
        await fileDropRef.current.loading;
      }

      const result = await pyodide.runPython(source, nextStatus => {
        setStatus(nextStatus);
      });
      setRenderedOutput(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const lineMatch = message.match(/File "<exec>", line (\d+)/);

      if (lineMatch) {
        const errorStart = message.slice(lineMatch.index).search(/\n\w/);
        const errorMessage = message.slice(lineMatch.index! + errorStart + 1);
        showErrorWidget(Number(lineMatch[1]), errorMessage);
      }

      setRenderedOutput(message);
    } finally {
      setStatus(null);
    }
  };

  return (
    <>
      {/* Left Pane: Monaco Editor and Template Selector */}
      <div id="left-pane">
        <div id="toolbar">
          <strong>pydeck Playground</strong>
          <button
            disabled={status !== null}
            onClick={() => {
              void runCode();
            }}
            type="button"
          >
            {status ? (
              <>
                <SpinnerIcon />
                {status}
              </>
            ) : (
              <PlayIcon />
            )}
          </button>
        </div>
        <div id="editor">
          <AutoSizer>
            {({width, height}) => (
              <Editor
                width={`${width}px`}
                height={`${height}px`}
                defaultLanguage="python"
                defaultValue={DEFAULT_SAMPLE}
                onMount={(editor, monaco) => {
                  editorRef.current = editor;
                  monacoRef.current = monaco;
                }}
                theme="light"
                options={{scrollBeyondLastLine: false, minimap: {enabled: false}}}
              />
            )}
          </AutoSizer>
        </div>
        <FileDrop preloadedFiles={preloadedFiles} ref={fileDropRef} />
      </div>

      {/* Right Pane: Output */}
      <div id="right-pane" className={output.isHtml ? 'html-output' : 'text-output'}>
        {output.isHtml ? (
          <iframe srcDoc={output.content} title="Python HTML output" />
        ) : (
          <pre>{output.content}</pre>
        )}
      </div>
    </>
  );
}

export function renderToDOM(container) {
  createRoot(container).render(<App preloadedFiles={PRELOADED_FILES} />);
}
