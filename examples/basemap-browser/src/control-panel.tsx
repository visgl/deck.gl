// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React, {useState, useEffect, useCallback, useRef} from 'react';
import type {Dimensions, Config, Basemap, Framework, StressTest, InitialViewState} from './types';
import {buildConfig, DEFAULT_DIMENSIONS} from './config';

type CanvasSize = {
  width: number;
  height: number;
  clientWidth?: number;
  clientHeight?: number;
  drawingBufferWidth?: number;
  drawingBufferHeight?: number;
};

type ControlPanelProps = {
  onConfigChange: (config: Config) => void;
};

// Helper to get dimensions from URL params
function getDimensionsFromUrl(): Partial<Dimensions> {
  const params = new URLSearchParams(window.location.search);
  const result: Partial<Dimensions> = {};

  const basemap = params.get('basemap');
  if (
    basemap === 'deck-only' ||
    basemap === 'mapbox' ||
    basemap === 'maplibre' ||
    basemap === 'google-maps'
  ) {
    result.basemap = basemap;
  }

  const framework = params.get('framework');
  if (framework === 'react' || framework === 'pure-js') {
    result.framework = framework;
  }

  if (params.has('interleaved')) {
    result.interleaved = params.get('interleaved') !== 'false';
  }

  if (params.has('batched')) {
    result.batched = params.get('batched') !== 'false';
  }

  if (params.has('globe')) {
    result.globe = params.get('globe') === 'true';
  }

  if (params.has('multiView')) {
    result.multiView = params.get('multiView') === 'true';
  }

  const stressTest = params.get('stressTest');
  if (
    stressTest === 'none' ||
    stressTest === 'points-10k' ||
    stressTest === 'points-100k' ||
    stressTest === 'points-1m' ||
    stressTest === 'points-5m' ||
    stressTest === 'points-10m'
  ) {
    result.stressTest = stressTest;
  }

  return result;
}

// Helper to set URL from dimensions
function setUrlFromDimensions(dimensions: Dimensions) {
  const params = new URLSearchParams();
  params.set('basemap', dimensions.basemap);
  params.set('framework', dimensions.framework);
  params.set('interleaved', String(dimensions.interleaved));
  params.set('batched', String(dimensions.batched));
  params.set('globe', String(dimensions.globe));
  params.set('multiView', String(dimensions.multiView));
  params.set('stressTest', dimensions.stressTest);
  const newUrl = `${window.location.pathname}?${params.toString()}`;
  window.history.replaceState({}, '', newUrl);
}

export default function ControlPanel({onConfigChange}: ControlPanelProps) {
  // Initialize dimensions from URL params, falling back to defaults
  const [dimensions, setDimensions] = useState<Dimensions>(() => ({
    ...DEFAULT_DIMENSIONS,
    ...getDimensionsFromUrl()
  }));

  const [currentDPR, setCurrentDPR] = useState(window.devicePixelRatio);
  const [canvasSize, setCanvasSize] = useState<CanvasSize>({width: 0, height: 0});
  const [fps, setFps] = useState(0);
  const [viewState, setViewState] = useState<InitialViewState | null>(null);
  const frameTimesRef = useRef<number[]>([]);
  const lastFrameTimeRef = useRef(performance.now());

  // View state change handler
  const handleViewStateChange = useCallback((vs: InitialViewState) => {
    setViewState(vs);
  }, []);

  // Build config from dimensions with callback
  const config = buildConfig(dimensions, handleViewStateChange);

  // Update a single dimension
  const updateDimension = useCallback(
    <K extends keyof Dimensions>(key: K, value: Dimensions[K]) => {
      setDimensions(prev => ({...prev, [key]: value}));
    },
    []
  );

  // Notify parent of config changes and update URL
  useEffect(() => {
    onConfigChange(config);
    setUrlFromDimensions(dimensions);
  }, [dimensions, config, onConfigChange]);

  // Canvas info and FPS polling
  const updateCanvasInfo = useCallback(() => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      setCanvasSize({
        width: canvas.width,
        height: canvas.height,
        clientWidth: canvas.clientWidth,
        clientHeight: canvas.clientHeight,
        drawingBufferWidth: gl?.drawingBufferWidth,
        drawingBufferHeight: gl?.drawingBufferHeight
      });
    }
  }, []);

  // FPS calculation using requestAnimationFrame
  useEffect(() => {
    let animationId: number;

    const measureFps = () => {
      const now = performance.now();
      const delta = now - lastFrameTimeRef.current;
      lastFrameTimeRef.current = now;

      // Keep last 60 frame times for averaging
      frameTimesRef.current.push(delta);
      if (frameTimesRef.current.length > 60) {
        frameTimesRef.current.shift();
      }

      // Calculate average FPS
      if (frameTimesRef.current.length > 0) {
        const avgFrameTime =
          frameTimesRef.current.reduce((a, b) => a + b, 0) / frameTimesRef.current.length;
        setFps(Math.round(1000 / avgFrameTime));
      }

      animationId = requestAnimationFrame(measureFps);
    };

    animationId = requestAnimationFrame(measureFps);
    return () => cancelAnimationFrame(animationId);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const newDPR = window.devicePixelRatio;
      if (newDPR !== currentDPR) {
        setCurrentDPR(newDPR);
      }
      updateCanvasInfo();
    }, 100);

    return () => clearInterval(interval);
  }, [currentDPR, updateCanvasInfo]);

  return (
    <>
      {/* Warnings overlay - rendered via portal into #map */}
      {config.validation.warnings.length > 0 && (
        <WarningsOverlay warnings={config.validation.warnings} />
      )}

      <div id="control-panel">
        <h3>Basemap Browser</h3>

        {/* FPS Meter */}
        <div className="section fps-meter">
          <span
            style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: fps >= 50 ? '#4caf50' : fps >= 30 ? '#ff9800' : '#f44336'
            }}
          >
            {fps} FPS
          </span>
        </div>

        {/* Basemap Selection */}
        <div className="section">
          <div className="label">Basemap:</div>
          <select
            value={dimensions.basemap}
            onChange={e => updateDimension('basemap', e.target.value as Basemap)}
          >
            <option value="deck-only">Deck.gl Only</option>
            <option value="maplibre">MapLibre</option>
            <option value="mapbox">Mapbox</option>
            <option value="google-maps">Google Maps</option>
          </select>
        </div>

        {/* Framework Selection */}
        <div className="section">
          <div className="label">Framework:</div>
          <select
            value={dimensions.framework}
            onChange={e => updateDimension('framework', e.target.value as Framework)}
          >
            <option value="react">React</option>
            <option value="pure-js">Pure JS</option>
          </select>
        </div>

        {/* Interleaved Toggle */}
        <div className="section">
          <label>
            <input
              type="checkbox"
              checked={dimensions.interleaved}
              onChange={() => updateDimension('interleaved', !dimensions.interleaved)}
            />
            Interleaved Mode
          </label>
        </div>

        {/* Batched Toggle */}
        <div className="section">
          <label>
            <input
              type="checkbox"
              checked={dimensions.batched}
              onChange={() => updateDimension('batched', !dimensions.batched)}
            />
            Batched Rendering
          </label>
        </div>

        {/* Globe Toggle */}
        <div className="section">
          <label>
            <input
              type="checkbox"
              checked={dimensions.globe}
              onChange={() => updateDimension('globe', !dimensions.globe)}
            />
            Globe Projection
          </label>
        </div>

        {/* Multi-View Toggle */}
        <div className="section">
          <label>
            <input
              type="checkbox"
              checked={dimensions.multiView}
              onChange={() => updateDimension('multiView', !dimensions.multiView)}
            />
            Multi-View
          </label>
        </div>

        {/* Stress Test Selection */}
        <div className="section">
          <div className="label">Stress Test:</div>
          <select
            value={dimensions.stressTest}
            onChange={e => updateDimension('stressTest', e.target.value as StressTest)}
          >
            <option value="none">None</option>
            <option value="points-10k">10K Points</option>
            <option value="points-100k">100K Points</option>
            <option value="points-1m">1M Points</option>
            <option value="points-5m">5M Points</option>
            <option value="points-10m">10M Points</option>
          </select>
        </div>

        {/* View State Display */}
        {viewState && (
          <div className="section" style={{fontFamily: 'monospace', fontSize: '11px'}}>
            <div>
              <b>lat:</b> {viewState.latitude.toFixed(4)}
            </div>
            <div>
              <b>lng:</b> {viewState.longitude.toFixed(4)}
            </div>
            <div>
              <b>zoom:</b> {viewState.zoom.toFixed(2)}
            </div>
            {viewState.bearing !== undefined && (
              <div>
                <b>bearing:</b> {viewState.bearing.toFixed(1)}
              </div>
            )}
            {viewState.pitch !== undefined && (
              <div>
                <b>pitch:</b> {viewState.pitch.toFixed(1)}
              </div>
            )}
          </div>
        )}

        {/* Reduced Current State Display */}
        <div className="section">
          <h3>Debug Info</h3>
          <div>
            <b>DPR:</b> {currentDPR.toFixed(2)}
          </div>
          {canvasSize.width > 0 && (
            <>
              <div>
                <b>Canvas:</b> {canvasSize.width} x {canvasSize.height}
              </div>
              {canvasSize.drawingBufferWidth && canvasSize.drawingBufferHeight && (
                <div>
                  <b>Buffer:</b> {canvasSize.drawingBufferWidth} x {canvasSize.drawingBufferHeight}
                </div>
              )}
            </>
          )}
        </div>

        {/* Testing Instructions */}
        <div className="section">
          <h3>Testing Instructions</h3>
          <div style={{fontSize: '11px', textTransform: 'none', lineHeight: '1.5'}}>
            <p>
              <b>Test Window Resize:</b> Resize browser window and verify layers redraw correctly.
            </p>
            <p>
              <b>Test DPR Change:</b> Move browser window between screens with different pixel
              ratios.
            </p>
            <p>
              <b>Test Stress:</b> Enable stress test layers and compare FPS with batched on/off.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

// Warnings overlay component - renders as fixed position overlay
function WarningsOverlay({warnings}: {warnings: Config['validation']['warnings']}) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 10,
        left: 270, // After control panel (260px + 10px gap)
        right: 10,
        zIndex: 1000,
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}
    >
      {warnings.map((w, i) => (
        <div
          key={i}
          style={{
            background: w.severity === 'warning' ? '#fff3cd' : '#cce5ff',
            border: `1px solid ${w.severity === 'warning' ? '#ffc107' : '#b8daff'}`,
            borderRadius: '4px',
            padding: '12px 16px',
            color: w.severity === 'warning' ? '#856404' : '#004085',
            fontSize: '14px',
            fontWeight: 500,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            pointerEvents: 'auto'
          }}
        >
          {w.severity === 'warning' ? '⚠️' : 'ℹ️'} {w.message}
        </div>
      ))}
    </div>
  );
}
