// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import * as React from 'react';
import {useEffect, useRef, useState} from 'react';
import {createRoot} from 'react-dom/client';
import Split from 'split.js';
import {Editor, type EditorHandle} from './editor';
import {PlayIcon, SpinnerIcon} from './icons';
import {FileDrop, type FileDropHandle} from './file-drop';
import {pyodide, type PreloadedFileConfig, type RunUpdate, type WorkerStatus} from './pyodide';

const DEFAULT_SAMPLE = `\
import pydeck
import pandas as pd

UK_ACCIDENTS_DATA = pd.read_csv(uploaded_files["heatmap-data.csv"])
print(UK_ACCIDENTS_DATA)

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
r.to_html('output.html')
`;

const PRELOADED_FILES: PreloadedFileConfig[] = [
  {
    name: 'heatmap-data.csv',
    url: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/3d-heatmap/heatmap-data.csv'
  }
];

type AppStatus = WorkerStatus | 'Loading files...' | null;
type TextOutputPart = {
  type: 'stderr' | 'stdout';
  text: string;
};
type OutputState = {
  html: string;
  textParts: TextOutputPart[];
};

export function App({preloadedFiles}: {preloadedFiles?: PreloadedFileConfig[]}) {
  const editorRef = useRef<EditorHandle>(null);
  const fileDropRef = useRef<FileDropHandle>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [output, setOutput] = useState<OutputState>({
    html: '',
    textParts: [{text: 'Loading Python...', type: 'stdout'}]
  });
  const [status, setStatus] = useState<AppStatus>('Loading packages...');

  const setTextOutput = (value: unknown) => {
    setOutput({html: '', textParts: [{text: String(value), type: 'stdout'}]});
  };

  const formatRunTime = (timeElapsed: number) => `\nRun time: ${timeElapsed.toFixed(1)} ms`;

  const applyRunUpdate = (update: RunUpdate) => {
    if (update.status) {
      setStatus(update.status);
    }

    if (!update.stdout && !update.stderr) {
      return;
    }

    setOutput(currentOutput => {
      const nextParts = [...currentOutput.textParts];

      const appendPart = (type: 'stderr' | 'stdout', text: string) => {
        if (!text) {
          return;
        }

        const lastPart = nextParts[nextParts.length - 1];
        if (lastPart && lastPart.type === type) {
          lastPart.text += text;
        } else {
          nextParts.push({text, type});
        }
      };

      appendPart('stdout', update.stdout ?? '');
      appendPart('stderr', update.stderr ?? '');

      return {...currentOutput, textParts: nextParts};
    });
  };

  const setRunOutput = async (value: {files: Blob[]; result: string; timeElapsed: number}) => {
    const htmlFile = value.files.find(file => file.type === 'text/html');
    const html = htmlFile
      ? await htmlFile.text()
      : value.result.startsWith('<!DOCTYPE html>')
        ? value.result
        : '';
    const timeText = formatRunTime(value.timeElapsed);

    setOutput(currentOutput => ({
      html,
      textParts:
        currentOutput.textParts.length > 0
          ? [...currentOutput.textParts, {text: timeText, type: 'stdout'}]
          : html
            ? [{text: timeText, type: 'stdout'}]
            : [{text: `${value.result}${timeText}`, type: 'stdout'}]
    }));
  };

  useEffect(() => {
    let cancelled = false;

    pyodide
      .getVersion()
      .then(result => {
        if (!cancelled) {
          setTextOutput(result);
        }
      })
      .catch(error => {
        if (!cancelled) {
          setTextOutput(error instanceof Error ? error.message : String(error));
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!rootRef.current) {
      return undefined;
    }

    const leftPane = rootRef.current.querySelector<HTMLDivElement>('#left-pane');
    const rightPane = rootRef.current.querySelector<HTMLDivElement>('#right-pane');
    const htmlPane = rootRef.current.querySelector<HTMLElement>('.html-pane');
    const textPane = rootRef.current.querySelector<HTMLElement>('.text-pane');

    if (!leftPane || !rightPane || !htmlPane || !textPane) {
      return undefined;
    }

    const mainSplit = Split([leftPane, rightPane], {
      sizes: [40, 60],
      minSize: [320, 320],
      gutterSize: 4
    });
    const outputSplit = Split([htmlPane, textPane], {
      direction: 'vertical',
      sizes: [50, 50],
      minSize: [160, 160],
      gutterSize: 4
    });

    return () => {
      outputSplit.destroy();
      mainSplit.destroy();
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
          setTextOutput(error instanceof Error ? error.message : String(error));
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const runCode = async () => {
    const source = editorRef.current?.getValue() ?? '';
    editorRef.current?.showError(null);

    if (status) {
      return;
    }

    try {
      if (fileDropRef.current?.isLoading) {
        setStatus('Loading files...');
        await fileDropRef.current.loading;
      }

      setOutput(currentOutput => ({...currentOutput, html: '', textParts: []}));
      const result = await pyodide.runPython(source, applyRunUpdate);
      await setRunOutput(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const lineMatch = message.match(/File "<exec>", line (\d+)/);

      if (lineMatch) {
        const errorStart = message.slice(lineMatch.index).search(/\n\w/);
        const errorMessage = message.slice(lineMatch.index! + errorStart + 1);
        editorRef.current?.showError({lineNumber: Number(lineMatch[1]), message: errorMessage});
      }

      setTextOutput(message);
    } finally {
      setStatus(null);
    }
  };

  return (
    <div id="root" ref={rootRef}>
      {/* Left Pane: Monaco Editor and Template Selector */}
      <div id="left-pane">
        <div id="toolbar">
          <div className="toolbar-title">
            <strong>pydeck playground</strong>
            <a href="https://deckgl.readthedocs.io/en/latest/" rel="noreferrer" target="_blank">
              Docs
            </a>
          </div>
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
          <Editor defaultValue={DEFAULT_SAMPLE} ref={editorRef} />
        </div>
        <FileDrop preloadedFiles={preloadedFiles} ref={fileDropRef} />
      </div>

      {/* Right Pane: Output */}
      <div id="right-pane">
        <section className="output-pane html-pane">
          {output.html ? (
            <iframe srcDoc={output.html} title="Python HTML output" />
          ) : (
            <div className="output-empty">No HTML output</div>
          )}
        </section>
        <section className="output-pane text-pane">
          <pre>
            {output.textParts.map((part, index) => (
              <span className={`text-output-${part.type}`} key={index}>
                {part.text}
              </span>
            ))}
          </pre>
        </section>
      </div>
    </div>
  );
}

export function renderToDOM(container) {
  createRoot(container).render(<App preloadedFiles={PRELOADED_FILES} />);
}
