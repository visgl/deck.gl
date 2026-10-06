// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {useEffect, useRef, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Deck, FirstPersonView} from '@deck.gl/core';
import {LineLayer} from '@deck.gl/layers';
import {webgpuAdapter} from '@luma.gl/webgpu';
import SplatLayer, {type SplatLayerStatus} from './splat-layer/splat-layer';
import {
  SplatCameraController,
  CAMERA_PROPS,
  MODEL_MATRIX,
  TARGET,
  getInitialViewState
} from './camera';
import './styles.css';

const COIT_URL =
  'https://storage.googleapis.com/download/storage/v1/b/forge-dev-public/o/asundqui%2Frad%2F260217%2Fcoit-40m-sh1-lod.rad?alt=media';
const DIAGNOSTIC = new URLSearchParams(location.search).has('diagnostic');
const INITIAL_STATUS: SplatLayerStatus = {
  phase: 'loading',
  message: 'Starting deck.gl with WebGPU…',
  activeSplats: 0,
  residentPages: 0,
  pendingPages: 0,
  sourceSplats: 0
};

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const deckRef = useRef<Deck<FirstPersonView>>();
  const [status, setStatus] = useState(INITIAL_STATUS);
  const [showAxes, setShowAxes] = useState(true);
  const [showSplats, setShowSplats] = useState(true);
  const [cameraTest, setCameraTest] = useState('');
  const animationRef = useRef(0);
  const frameTimesRef = useRef<number[]>([]);
  const loadStartedRef = useRef(performance.now());
  const loadMilestonesRef = useRef(new Set<string>());

  useEffect(() => {
    if (!DIAGNOSTIC) return;
    const milestones: [string, boolean][] = [
      ['first-coverage', status.activeSplats > 0],
      ['half-budget', status.activeSplats >= 500_000],
      ['budget-ready', status.phase === 'ready']
    ];
    for (const [milestone, reached] of milestones) {
      if (reached && !loadMilestonesRef.current.has(milestone)) {
        loadMilestonesRef.current.add(milestone);
        console.debug(
          'COIT_LOAD',
          JSON.stringify({
            milestone,
            milliseconds: Math.round(performance.now() - loadStartedRef.current)
          })
        );
      }
    }
  }, [status]);

  useEffect(() => {
    const container = containerRef.current!;
    const deck: Deck<FirstPersonView> = new Deck<FirstPersonView>({
      parent: container,
      deviceProps: {type: 'webgpu', adapters: [webgpuAdapter]},
      views: new FirstPersonView({id: 'coit', ...CAMERA_PROPS}),
      initialViewState: getInitialViewState(),
      controller: {type: SplatCameraController},
      onViewStateChange: ({viewState}) => {
        deck.setProps({viewState});
        if (DIAGNOSTIC) console.debug('COIT_CAMERA', JSON.stringify(viewState));
      },
      onAfterRender: () => {
        if (animationRef.current) frameTimesRef.current.push(performance.now());
      },
      onError: error => setStatus(current => ({...current, phase: 'error', message: error.message}))
    });
    deckRef.current = deck;
    return () => {
      cancelAnimationFrame(animationRef.current);
      deckRef.current = undefined;
      deck.finalize();
    };
  }, []);

  useEffect(() => {
    deckRef.current?.setProps({
      layers: [
        new SplatLayer({
          id: 'coit',
          data: COIT_URL,
          modelMatrix: MODEL_MATRIX,
          visible: showSplats,
          maxActiveSplats: 1_000_000,
          maxResidentSplats: 4_000_000,
          onStatusChange: setStatus
        }),
        new LineLayer({
          id: 'reference-axes',
          visible: showAxes,
          coordinateSystem: 'cartesian',
          data: [
            {end: [TARGET[0] + 35, TARGET[1], TARGET[2]], color: [255, 65, 90]},
            {end: [TARGET[0], TARGET[1] + 35, TARGET[2]], color: [50, 210, 100]},
            {end: [TARGET[0], TARGET[1], TARGET[2] + 35], color: [50, 130, 255]}
          ],
          getSourcePosition: TARGET,
          getTargetPosition: datum => datum.end,
          getColor: datum => datum.color,
          getWidth: 3
        })
      ]
    });
  }, [showAxes, showSplats]);

  function runCameraTest(returnToStart = true) {
    cancelAnimationFrame(animationRef.current);
    const initial = getInitialViewState();
    const started = performance.now();
    frameTimesRef.current = [];
    setCameraTest('Running 8-second look, pan and dolly…');
    const animate = (now: number) => {
      const progress = Math.min((now - started) / 8000, 1);
      const wave = Math.sin(progress * Math.PI * (returnToStart ? 2 : 0.5));
      deckRef.current?.setProps({
        viewState: {
          ...initial,
          bearing: initial.bearing! + 45 * wave,
          position: [
            initial.position![0] + 40 * wave,
            initial.position![1] - 25 * wave,
            initial.position![2]
          ]
        }
      });
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        const frames = frameTimesRef.current;
        const gaps = frames
          .slice(1)
          .map((time, index) => time - frames[index])
          .sort((a, b) => a - b);
        const report = `${frames.length} frames / 8s; p95 ${Math.round(gaps[Math.floor(gaps.length * 0.95)] || 0)}ms; max ${Math.round(gaps.at(-1) || 0)}ms`;
        animationRef.current = 0;
        setCameraTest(report);
        console.debug('COIT_CAMERA_TEST', report);
      }
    };
    animationRef.current = requestAnimationFrame(animate);
  }

  return (
    <>
      <div className="canvas-host" ref={containerRef} />
      <aside className="panel" aria-live="polite">
        <p className="eyebrow">deck.gl · experimental SplatLayer</p>
        <h1>Coit, inside deck.gl</h1>
        <p className="description">
          One canvas, one world-space camera. Drag to look, shift-drag to pan, scroll to move
          forward/backward. Fixed lens and clipping range, with no orbit-pivot zoom limit.
        </p>
        <dl className="metrics">
          <div className="metric">
            <dt>Selected splats</dt>
            <dd>{status.activeSplats.toLocaleString()}</dd>
          </div>
          <div className="metric">
            <dt>Resident pages</dt>
            <dd>{status.residentPages}</dd>
          </div>
          <div className="metric">
            <dt>Pending pages</dt>
            <dd>{status.pendingPages}</dd>
          </div>
          <div className="metric">
            <dt>Source splats</dt>
            <dd>{status.sourceSplats.toLocaleString()}</dd>
          </div>
          <div className="metric">
            <dt>Renderer</dt>
            <dd>WebGPU · global sorting</dd>
          </div>
        </dl>
        <div className="status" data-phase={status.phase}>
          {status.message}
        </div>
        <p>
          <label>
            <input
              type="checkbox"
              checked={showAxes}
              onChange={event => setShowAxes(event.target.checked)}
            />{' '}
            deck LineLayer axes
          </label>
        </p>
        <p>
          <label>
            <input
              type="checkbox"
              checked={showSplats}
              onChange={event => setShowSplats(event.target.checked)}
            />{' '}
            SplatLayer visible
          </label>
        </p>
        <button
          type="button"
          onClick={() => {
            cancelAnimationFrame(animationRef.current);
            animationRef.current = 0;
            deckRef.current?.setProps({
              viewState: getInitialViewState()
            });
          }}
        >
          Reset authored view
        </button>
        {DIAGNOSTIC && (
          <p>
            <button type="button" onClick={() => runCameraTest()}>
              Run camera test
            </button>
            <button type="button" onClick={() => runCameraTest(false)}>
              Test new view
            </button>
            <output>{cameraTest}</output>
          </p>
        )}
      </aside>
    </>
  );
}

createRoot(document.getElementById('app')!).render(<App />);
