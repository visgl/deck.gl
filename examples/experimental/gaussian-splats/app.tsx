// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {useEffect, useRef, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {
  createCoitNativeRenderer,
  type CoitNativeRendererHandle,
  type CoitNativeRenderStatus
} from './coit-native-renderer';
import './styles.css';

const INITIAL_STATUS: CoitNativeRenderStatus = {
  phase: 'initializing',
  backend: 'Requesting WebGPU',
  message: 'Opening the native Coit RAD hierarchy…',
  residentPageCount: 0,
  activePageCount: 0,
  activeRowCount: 0,
  requestedPageCount: 1,
  sourceSplatCount: 50_937_127,
  activeSplatCapacity: 5_000_000,
  residentSplatCapacity: 15_000_000,
  sortMode: 'global'
};

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<CoitNativeRendererHandle>();
  const [status, setStatus] = useState<CoitNativeRenderStatus>(INITIAL_STATUS);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return undefined;
    }
    let cancelled = false;
    let renderer: CoitNativeRendererHandle | undefined;
    const abortController = new AbortController();
    void createCoitNativeRenderer(
      container,
      nextStatus => {
        if (!cancelled) {
          setStatus(nextStatus);
        }
      },
      abortController.signal
    )
      .then(handle => {
        if (cancelled) {
          handle.destroy();
        } else {
          renderer = handle;
          rendererRef.current = handle;
        }
      })
      .catch(error => {
        if (!cancelled) {
          setStatus(current => ({
            ...current,
            phase:
              error instanceof Error && error.message.includes('WebGPU') ? 'unsupported' : 'error',
            message: error instanceof Error ? error.message : 'Unable to start the Coit renderer.'
          }));
        }
      });

    return () => {
      cancelled = true;
      abortController.abort();
      renderer?.destroy();
      rendererRef.current = undefined;
    };
  }, []);

  return (
    <>
      <div className="canvas-host" ref={containerRef} />
      <aside className="panel" aria-live="polite">
        <p className="eyebrow">luma.gl paged RAD</p>
        <h1>Coit Tower, native resolution</h1>
        <p className="description">
          Camera motion immediately reprojects the coherent hierarchy already in memory. Once input
          settles, newly exposed branches retarget and refine center-first. Drag to orbit, scroll to
          zoom, or double-click to restore the authored camera.
        </p>
        <dl className="metrics">
          <div className="metric">
            <dt>Retargeted frontier</dt>
            <dd>{formatCount(status.activeRowCount)} splats</dd>
          </div>
          <div className="metric">
            <dt>Page cache</dt>
            <dd>
              {status.activePageCount} shown / {status.residentPageCount} resident
            </dd>
          </div>
          <div className="metric">
            <dt>Pending pages</dt>
            <dd>{status.requestedPageCount}</dd>
          </div>
          <div className="metric">
            <dt>Draw / cache budgets</dt>
            <dd>
              {formatCount(status.activeSplatCapacity)} /{' '}
              {formatCount(status.residentSplatCapacity)}
            </dd>
          </div>
          <div className="metric">
            <dt>Renderer</dt>
            <dd>
              {status.backend} · {status.sortMode}
            </dd>
          </div>
        </dl>
        <div className="status" data-phase={status.phase}>
          {status.message}
        </div>
        <button type="button" onClick={() => rendererRef.current?.resetCamera()}>
          Reset authored view
        </button>
      </aside>
    </>
  );
}

function formatCount(value: number): string {
  return value.toLocaleString('en-US');
}

createRoot(document.getElementById('app')!).render(<App />);
