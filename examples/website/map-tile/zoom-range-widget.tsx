// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React from 'react';

const RANGE_MAX = 20;

export default function ZoomRangeWidget({
  zoom,
  minZoom,
  maxZoom,
  visibleMinZoom,
  visibleMaxZoom
}: {
  zoom: number;
  minZoom: number;
  maxZoom: number;
  visibleMinZoom?: number;
  visibleMaxZoom?: number;
}) {
  const toPercent = (z: number) => (z / RANGE_MAX) * 100;
  const barHeight = 12;

  const fetchLeft = toPercent(minZoom);
  const fetchWidth = toPercent(maxZoom - minZoom);
  const visLeft = toPercent(visibleMinZoom ?? 0);
  const visWidth = toPercent((visibleMaxZoom ?? RANGE_MAX) - (visibleMinZoom ?? 0));
  const zoomPos = toPercent(Math.min(zoom, RANGE_MAX));

  return (
    <div style={{
      position: 'absolute', bottom: 24, left: 20, right: 20,
      fontFamily: 'Helvetica Neue, Arial, Helvetica, sans-serif',
      fontSize: 11, color: 'rgba(255,255,255,0.8)', pointerEvents: 'none'
    }}>
      <div style={{display: 'flex', justifyContent: 'flex-end', marginBottom: 6, gap: 8}}>
        <span style={{
          backgroundColor: '#0275ff', color: '#fff', padding: '2px 8px',
          borderRadius: 3, fontSize: 13, fontWeight: 500
        }}>Fetch {minZoom}-{maxZoom}</span>
        <span style={{
          backgroundColor: '#fff', color: '#1a2b4a', padding: '2px 8px',
          borderRadius: 3, fontSize: 13, fontWeight: 500,
          border: '1px solid rgba(0,0,0,0.3)'
        }}>Visible {visibleMinZoom ?? 0}-{visibleMaxZoom ?? RANGE_MAX}</span>
      </div>
      <div style={{position: 'relative', height: barHeight + 16}}>
        {/* Track - horizontal line */}
        <div style={{
          position: 'absolute', top: 8 + barHeight / 2 - 1, left: 0, right: 0,
          height: 2, backgroundColor: 'rgba(180,180,180,0.9)'
        }} />
        {/* Visible range - white fill behind */}
        <div style={{
          position: 'absolute', top: 8,
          left: `${visLeft}%`, width: `${visWidth}%`,
          height: barHeight, borderRadius: 3,
          backgroundColor: '#fff',
          border: '1px solid rgba(0,0,0,0.3)', boxSizing: 'border-box'
        }} />
        {/* Fetch range - blue fill on top */}
        <div style={{
          position: 'absolute', top: 8 + barHeight * 0.2,
          left: `${fetchLeft}%`, width: `${fetchWidth}%`,
          height: barHeight * 0.6, borderRadius: 2,
          backgroundColor: '#0275ff',
          border: '1px solid rgba(0,0,0,0.3)', boxSizing: 'border-box'
        }} />
        {/* Current zoom indicator */}
        <div style={{
          position: 'absolute', top: 4,
          left: `${zoomPos}%`,
          width: 2, height: barHeight + 8,
          backgroundColor: '#4d84f5',
          transform: 'translateX(-1px)',
          borderRadius: 1
        }} />
        {/* Tick labels */}
        <div style={{position: 'absolute', top: barHeight + 10, left: 0, right: 0, display: 'flex', justifyContent: 'space-between'}}>
          {[0, 5, 10, 15, 20].map(z => (
            <span key={z} style={{fontSize: 9, color: 'rgba(100,100,100,0.8)'}}>{z}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
