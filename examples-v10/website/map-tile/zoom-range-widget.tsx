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
    <div
      style={{
        position: 'absolute',
        bottom: 24,
        left: 20,
        right: 20,
        fontFamily: 'Helvetica Neue, Arial, Helvetica, sans-serif',
        fontSize: 11,
        color: 'rgba(255,255,255,0.8)',
        pointerEvents: 'none'
      }}
    >
      <div style={{display: 'flex', justifyContent: 'flex-end', marginBottom: 6, gap: 8}}>
        <span
          style={{
            backgroundColor: '#0275ff',
            color: '#fff',
            padding: '2px 8px',
            borderRadius: 3,
            fontSize: 13,
            fontWeight: 500
          }}
        >
          Fetch {minZoom}-{maxZoom}
        </span>
        <span
          style={{
            backgroundColor: '#1a2b4a',
            color: '#fff',
            padding: '2px 8px',
            borderRadius: 3,
            fontSize: 13,
            fontWeight: 500
          }}
        >
          Visible {visibleMinZoom ?? 0}-{visibleMaxZoom ?? RANGE_MAX}
        </span>
      </div>
      <div style={{position: 'relative', height: barHeight + 4}}>
        {/* Track - horizontal line */}
        <div
          style={{
            position: 'absolute',
            top: 8 + barHeight / 2 - 1,
            left: 0,
            right: 0,
            height: 2,
            backgroundColor: 'rgba(180,180,180,0.9)'
          }}
        />
        {/* Visible range - dark blue fill behind */}
        <div
          style={{
            position: 'absolute',
            top: 8,
            left: `${visLeft}%`,
            width: `${visWidth}%`,
            height: barHeight,
            borderRadius: 3,
            backgroundColor: '#1a2b4a',
            border: '1px solid rgba(0,0,0,0.3)',
            boxSizing: 'border-box'
          }}
        />
        {/* Fetch range - individual zoom level segments (boundaries at x.5) */}
        {Array.from({length: maxZoom - minZoom + 1}, (_, i) => {
          const z = minZoom + i;
          const segLeft = toPercent(Math.max(z - 0.5, minZoom));
          const segRight = toPercent(Math.min(z + 0.5, maxZoom));
          const segWidth = segRight - segLeft;
          const isFirst = i === 0;
          const isLast = i === maxZoom - minZoom;
          return (
            <div
              key={z}
              style={{
                position: 'absolute',
                top: 8 + barHeight * 0.2,
                left: `${segLeft}%`,
                width: `${segWidth}%`,
                height: barHeight * 0.6,
                backgroundColor: z % 2 === 0 ? '#0275ff' : '#3d93ff',
                borderTop: '1px solid rgba(0,0,0,0.3)',
                borderBottom: '1px solid rgba(0,0,0,0.3)',
                borderLeft: isFirst ? '1px solid rgba(0,0,0,0.3)' : 'none',
                borderRight: isLast ? '1px solid rgba(0,0,0,0.3)' : 'none',
                borderRadius:
                  isFirst && isLast ? 2 : isFirst ? '2px 0 0 2px' : isLast ? '0 2px 2px 0' : 0,
                boxSizing: 'border-box'
              }}
            />
          );
        })}
        {/* Current zoom indicator */}
        <div
          style={{
            position: 'absolute',
            top: 4,
            left: `${zoomPos}%`,
            width: 2,
            height: barHeight + 8,
            backgroundColor: '#1a2b4a',
            transform: 'translateX(-1px)',
            borderRadius: 1,
            boxShadow: '0 0 0 1px #fff'
          }}
        />
      </div>
    </div>
  );
}
