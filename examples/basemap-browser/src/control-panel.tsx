// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React, {useState, useEffect, useCallback} from 'react';
import BASEMAP_CATEGORIES from './examples';
import type {BasemapExample} from './types';

type CanvasSize = {
  width: number;
  height: number;
  clientWidth?: number;
  clientHeight?: number;
  drawingBufferWidth?: number;
  drawingBufferHeight?: number;
};

type ControlPanelProps = {
  onExampleChange: (example: BasemapExample, interleaved: boolean) => void;
};

export default function ControlPanel({onExampleChange}: ControlPanelProps) {
  const [selectedExample, setSelectedExample] = useState('MapLibre Pure JS');
  const [interleaved, setInterleaved] = useState(true);
  const [currentDPR, setCurrentDPR] = useState(window.devicePixelRatio);
  const [canvasSize, setCanvasSize] = useState<CanvasSize>({width: 0, height: 0});

  const getCurrentExample = useCallback((): BasemapExample | null => {
    for (const category of Object.values(BASEMAP_CATEGORIES)) {
      if (category[selectedExample]) {
        return category[selectedExample];
      }
    }
    return null;
  }, [selectedExample]);

  const updateCanvasInfo = useCallback(() => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      // Get WebGL context to read drawing buffer size
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

  useEffect(() => {
    // Continuously poll for all changes (canvas, DPR, dimensions)
    const interval = setInterval(() => {
      const newDPR = window.devicePixelRatio;
      if (newDPR !== currentDPR) {
        setCurrentDPR(newDPR);
      }
      updateCanvasInfo();
    }, 100);

    return () => {
      clearInterval(interval);
    };
  }, [currentDPR, updateCanvasInfo]);

  // Load initial example
  useEffect(() => {
    const example = getCurrentExample();
    if (example) {
      onExampleChange(example, interleaved);
    }
  }, []); // Only on mount

  // Handle example or interleaved changes
  useEffect(() => {
    const example = getCurrentExample();
    if (example) {
      onExampleChange(example, interleaved);
    }
  }, [selectedExample, interleaved, getCurrentExample, onExampleChange]);

  const example = getCurrentExample();

  return (
    <div id="control-panel">
      <h3>Basemap Browser</h3>

      <div className="section">
        <div className="example-name">Select Example:</div>
        <select value={selectedExample} onChange={e => setSelectedExample(e.target.value)}>
          {Object.keys(BASEMAP_CATEGORIES).map(categoryName => (
            <optgroup key={categoryName} label={categoryName}>
              {Object.keys(BASEMAP_CATEGORIES[categoryName]).map(exampleName => (
                <option key={exampleName} value={exampleName}>
                  {exampleName}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      <div className="section">
        <label>
          <input
            type="checkbox"
            checked={interleaved}
            onChange={() => setInterleaved(!interleaved)}
          />
          Interleaved Mode
        </label>
      </div>

      <div className="section">
        <h3>Current State</h3>
        <div>
          <b>Framework:</b> {example?.framework || 'N/A'}
        </div>
        <div>
          <b>Map Type:</b> {example?.mapType || 'N/A'}
        </div>
        <div>
          <b>Interleaved:</b> {interleaved ? 'true' : 'false'}
        </div>
        <div>
          <b>Device Pixel Ratio:</b> {currentDPR.toFixed(2)}
        </div>
        {canvasSize.width > 0 && (
          <>
            <div>
              <b>Canvas Size:</b> {canvasSize.width} x {canvasSize.height}
            </div>
            <div>
              <b>Canvas Client Size:</b> {canvasSize.clientWidth} x {canvasSize.clientHeight}
            </div>
            {canvasSize.drawingBufferWidth && canvasSize.drawingBufferHeight && (
              <div>
                <b>Drawing Buffer:</b> {canvasSize.drawingBufferWidth} x{' '}
                {canvasSize.drawingBufferHeight}
              </div>
            )}
          </>
        )}
      </div>

      <div className="section">
        <h3>Testing Instructions</h3>
        <div style={{fontSize: '11px', textTransform: 'none', lineHeight: '1.5'}}>
          <p>
            <b>Test Window Resize:</b> Resize browser window and verify layers redraw correctly.
            Watch canvas and drawing buffer dimensions update.
          </p>
          <p>
            <b>Test DPR Change:</b> Move browser window between screens with different pixel ratios
            and verify layers scale correctly. Drawing buffer should adjust based on DPR.
          </p>
          <p>
            <b>Test Interleaved vs Overlaid:</b> Toggle interleaved mode and verify both work
            correctly.
          </p>
        </div>
      </div>
    </div>
  );
}
